'use server'

import { createClient } from '@/utils/supabase/server'
import { generateContent } from '@/lib/ai'
import { clean } from '@/lib/jsoncleaner'

export async function generateFullGroceryListAction(planId: string) {
  const supabase = await createClient()
  
  // 1. Fetch all meals for this plan to get their names
  const { data: meals, error: mealsError } = await supabase
    .from('meals')
    .select('name, meal_type, day_number')
    .eq('meal_plan_id', planId)
    .order('day_number', { ascending: true })

  if (mealsError || !meals || meals.length === 0) {
    return { success: false, error: 'No meals found for this plan.' }
  }

  // 2. Prepare the prompt for AI
  const mealList = meals.map(m => `- Day ${m.day_number} ${m.meal_type}: ${m.name}`).join('\n')
  
  const prompt = `Based on the following 7-day meal plan, generate a comprehensive and organized grocery list in Indonesian language (Bahasa Indonesia).
    
    Meal Plan:
    ${mealList}

    Requirements:
    - Group items by logical categories (e.g., Vegetables, Meat, Spices, Dairy, etc.)
    - Provide estimated quantities for each item (e.g., "Bawang Merah (100g)", "Ayam Fillet (500g)")
    - Include a realistic "grocery_total_rupiah" estimate for the entire list.
    - ALL category names and item names MUST be in Indonesian language (Bahasa Indonesia).
    - Return ONLY valid JSON with the following structure:
    {
      "groceries": {
        "Category Name": ["Item 1 (Quantity)", "Item 2 (Quantity)"],
        ...
      },
      "grocery_total_rupiah": 150000
    }
    No explanation. Use valid JSON format without markdown blocks.`;

  try {
    const responseText = await generateContent(prompt);
    const data = JSON.parse(clean(responseText));
    
    if (data.groceries) {
      // 3. Update meal_plans table
      const { error: updateError } = await supabase
        .from('meal_plans')
        .update({ 
          groceries: data.groceries,
          grocery_total_rupiah: data.grocery_total_rupiah || 0
        })
        .eq('id', planId)

      if (updateError) throw updateError

      // 4. Update meal_groceries table
      // First delete old entries for this plan
      await supabase.from('meal_groceries').delete().eq('meal_plan_id', planId)
      
      const groceryInserts = Object.entries(data.groceries).map(([category, items]) => ({
        meal_plan_id: planId,
        category,
        items: items
      }))
      
      if (groceryInserts.length > 0) {
        await supabase.from('meal_groceries').insert(groceryInserts)
      }

      return { success: true, data }
    }
    
    return { success: false, error: 'Invalid AI response format' }
  } catch (error: any) {
    console.error('Error generating full grocery list:', error)
    return { success: false, error: error.message }
  }
}

export async function estimateGroceryTotal(groceryData: Record<string, string[]>) {
  const supabase = await createClient()
  
  let total = 0
  const itemPrices: Record<string, number> = {}

  // Flatten all items from all categories
  const allItems = Object.values(groceryData).flat()

  for (const item of allItems) {
    // Extract item name (remove quantity in parenthesis if exists)
    // Example: "Bawang Merah (4 siung)" -> "Bawang Merah"
    const itemName = item.split('(')[0].trim()

    // Search for the item in the database
    // We use ilike for a basic fuzzy search
    const { data: priceData, error } = await supabase
      .from('product_prices')
      .select('price')
      .ilike('item_name', `%${itemName}%`)
      .order('updated_at', { ascending: false })
      .limit(1)

    if (priceData && priceData.length > 0) {
      const price = Number(priceData[0].price)
      total += price
      itemPrices[item] = price
    } else {
      // If not found, we can't estimate accurately, but we track it as 0
      itemPrices[item] = 0
    }
  }

  return {
    total,
    itemPrices
  }
}

export async function updatePlanTotal(planId: string, total: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('meal_plans')
    .update({ grocery_total_rupiah: total })
    .eq('id', planId)
    
  return { success: !error, error }
}
