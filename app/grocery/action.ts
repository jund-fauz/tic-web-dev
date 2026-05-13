'use server'

import { createClient } from '@/utils/supabase/server'

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
