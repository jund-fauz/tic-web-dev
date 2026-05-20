"use server";

import { generateContent } from "@/lib/ai";
import { clean } from "@/lib/jsoncleaner";
import { createClient } from "@/utils/supabase/server";
import { parseNumber } from "@/lib/utils";

function getDietGuidance(diet: string) {
  const normalizedDiet = diet.toLowerCase();

  if (normalizedDiet.includes("low-carb") || normalizedDiet.includes("low carb")) {
    return `
    Low-carb requirement:
    - Prioritize high-protein meals with clearly lower carbohydrates.
    - Keep carbs lower than protein for each meal whenever realistic.
    - Avoid rice, noodles, bread, sugary sauces, and flour-heavy sides as the main base.
    - Prefer lean protein, eggs, tofu, tempeh, non-starchy vegetables, and healthy fats.
    - Do not return meals that are dominated by carbohydrates.`;
  }

  if (normalizedDiet.includes("keto")) {
    return `
    Keto requirement:
    - Keep carbohydrates very low.
    - Prioritize protein, healthy fats, eggs, meat, fish, tofu, tempeh, cheese, and low-carb vegetables.
    - Avoid rice, noodles, bread, potatoes, sugar, and sweet sauces.`;
  }

  return "";
}

export async function regenerateMealAction(preferences: any, currentMeals: any) {
  const dietGuidance = getDietGuidance(preferences.diet || "");
  const prompt = `LANGUAGE: ALL output must be in INDONESIAN (Bahasa Indonesia).
  
    Regenerate one meal plan alternative for breakfast, lunch, dinner, and snack with the following parameters:
				
    Goal: ${preferences.goal}
    Daily Calories: ${preferences.calories} kcal
    Diet Type: ${preferences.diet}
    Allergies: ${preferences.allergies}
    Cuisine Preference: ${preferences.cuisines}
    Foods to Avoid: ${preferences.dislikes}

    For each meal:
    - Name (Indonesian)
    - Description (Indonesian)
    - Recipe ingredients (Indonesian)
    - Cooking instructions (Indonesian)

    Total Nutrition:
    - Calories: ${
      currentMeals.breakfast.calories +
      currentMeals.lunch.calories +
      currentMeals.dinner.calories +
      currentMeals.snack.calories
    }
    - Proteins: ${
      currentMeals.breakfast.proteins +
      currentMeals.lunch.proteins +
      currentMeals.dinner.proteins +
      currentMeals.snack.proteins
    }
    - Carbs: ${
      currentMeals.breakfast.carbs +
      currentMeals.lunch.carbs +
      currentMeals.dinner.carbs +
      currentMeals.snack.carbs
    }
    - Fats: ${
      currentMeals.breakfast.fats +
      currentMeals.lunch.fats +
      currentMeals.dinner.fats +
      currentMeals.snack.fats
    }

    Meal should include:
    - Name (appealing, specific)
    - Brief description
    - Calories, Proteins (g), Carbs (g), Fats (g) (Each nutrition should same as provided above)
    - Recipe (saved in 'recipe' key as an object containing 'ingredients' as an array of strings)
    - Cooking instructions in Indonesian language (Bahasa Indonesia) (saved in 'instructions' key as an array of strings)

    Language:
    - ALL meal names, descriptions, recipe ingredients, and cooking instructions MUST be in Indonesian language (Bahasa Indonesia).

    Requirements:
    - Balanced macros:
      * Weight Loss: 30% protein, 40% carbs, 30% fat
      * Muscle Gain: 30% protein, 40% carbs, 30% fat
      * Maintenance: 25% protein, 45% carbs, 30% fat
    - Realistic meals (not overly complicated)
    - Consider cuisine preference
    - Avoid listed allergens & dislikes
    ${dietGuidance}

    Rules:
    - carbs, fats, and proteins key should not end with _g
    - Give average calories, proteins, carbs, and fats per day
    - All protein data should saved in 'proteins' key (ALWAYS use plural 'proteins')
    - Meals should save in 'meals' key and saved as Array (IMPORTANT!)
    - instructions and ingredients should be in Indonesian language (Bahasa Indonesia)
    - instructions should be clear, step-by-step cooking guide
    - Should generate 4 items for breakfast, lunch, dinner, and snack (IMPORTANT!)
    - Don't provide average daily nutrition
    - Don't save meals with meal's name for key
    - Don't use capital letter as key
    - Don't save all nutrition in separate 'nutrition' key

    Return ONLY valid JSON with meals and nutrition. No explanation.
    `;

  try {
    const responseText = await generateContent(prompt);
    
    // Validate that responseText is valid JSON
    try {
      const data = JSON.parse(clean(responseText as string));
      
      // Resilient parsing for proteins/carbs/fats in each meal
      if (data.meals && Array.isArray(data.meals)) {
        data.meals = data.meals.map((m: any) => ({
          ...m,
          proteins: m.proteins || m.protein || 0,
          carbs: m.carbs || m.carb || 0,
          fats: m.fats || m.fat || 0
        }));
      }

      return { data, success: true };
    } catch (parseError) {
      console.error("Failed to parse regenerated meal JSON:", responseText);
      return { data: null, success: false, error: 'invalid JSON' };
    }
  } catch (error: any) {
    console.error("Server Action Regeneration Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function generateMealAlternativesAction(mealType: string, meal: any, preferences: any) {
  const dietGuidance = getDietGuidance(preferences.diet || "");
  const prompt = `LANGUAGE: ALL output must be in INDONESIAN (Bahasa Indonesia).

    Regenerate 3 ${mealType} meal plan alternative with the following parameters:

    Goal: ${preferences.goal}
    Daily Calories: ${preferences.calories} kcal
    Diet Type: ${preferences.diet}
    Allergies: ${preferences.allergies}
    Cuisine Preference: ${preferences.cuisines}
    Foods to Avoid: ${preferences.dislikes}

    Nutrition:
    - Calories: ${meal.calories}
    - Proteins: ${meal.proteins}
    - Carbs: ${meal.carbs}
    - Fats: ${meal.fats}

    Language:
    - ALL meal names and descriptions MUST be in Indonesian language (Bahasa Indonesia).

    Meal should include:
    - Name (appealing, specific)
    - Brief description
    - Calories, Proteins (g), Carbs (g), Fats (g) (Each nutrition should match the values provided above)

    Requirements:
    - Balanced macros:
      * Weight Loss: 30% protein, 40% carbs, 30% fat
      * Muscle Gain: 30% protein, 40% carbs, 30% fat
      * Maintenance: 25% protein, 45% carbs, 30% fat
    - Realistic meals (not overly complicated)
    - Consider cuisine preference
    - Avoid listed allergens & dislikes
    ${dietGuidance}

    Rules:
    - carbs, fats, and proteins key should not end with _g
    - All protein data should be saved in 'proteins' key (ALWAYS use plural 'proteins')
    - Meals should be saved in 'meals' key as an array
    - Do not provide average daily nutrition
    - Do not save meals with the meal's name as a key
    - Do not use capital letters as keys
    - Do not save all nutrition in a separate 'nutrition' key

    Return ONLY valid JSON with meals and nutrition. No explanation.`;

  try {
    const responseText = await generateContent(prompt);
    try {
      const rawData = JSON.parse(clean(responseText as string));
      
      // Resilient parsing for proteins/carbs/fats in each meal
      if (rawData.meals && Array.isArray(rawData.meals)) {
        rawData.meals = rawData.meals.map((m: any) => ({
          ...m,
          proteins: m.proteins || m.protein || 0,
          carbs: m.carbs || m.carb || 0,
          fats: m.fats || m.fat || 0
        }));
      }

      return { data: rawData, success: true };
    } catch (parseError) {
      console.error("Failed to parse meal alternatives JSON:", responseText);
      return { data: null, success: false, error: "invalid JSON" };
    }
  } catch (error: any) {
    console.error("Generate Meal Alternatives Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function generateMealDetailsAction(mealName: string, description: string) {
  const prompt = `Generate cooking details and required grocery items for "${mealName}" (${description}) in Indonesian language (Bahasa Indonesia).
    
    Language:
    - ALL instructions and ingredients MUST be in Indonesian language (Bahasa Indonesia).

    Return ONLY valid JSON with the following structure:
    {
      "ingredients": ["bahan 1...", "bahan 2..."],
      "instructions": ["langkah 1...", "langkah 2..."],
      "grocery_items": [
        {"category": "Vegetables", "item": "Nama Bahan 1 (Jumlah)"},
        {"category": "Meat", "item": "Nama Bahan 2 (Jumlah)"}
      ]
    }
    No explanation. Use valid JSON format without markdown blocks.`;

  try {
    const responseText = await generateContent(prompt);
    try {
      const data = JSON.parse(clean(responseText as string));
      return { data, success: true };
    } catch (parseError) {
      console.error("Failed to parse meal details JSON:", responseText);
      return { data: null, success: false, error: 'invalid JSON' };
    }
  } catch (error: any) {
    console.error("Generate Meal Details Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function saveSwappedMealAction(planId: string, dayNumber: number, mealType: string, mealData: any) {
  const supabase = await createClient();
  
  const update = {
    meal_plan_id: planId,
    day_number: dayNumber,
    meal_type: mealType as any,
    name: mealData.name,
    description: mealData.description,
    calories: parseNumber(mealData.calories),
    proteins: parseNumber(mealData.proteins || mealData.protein),
    carbs: parseNumber(mealData.carbs || mealData.carb),
    fats: parseNumber(mealData.fats || mealData.fat),
    recipe: mealData.recipe || {},
    instructions: mealData.instructions || []
  };

  try {
    const { error } = await supabase
      .from('meals')
      .update(update)
      .eq('meal_plan_id', planId)
      .eq('day_number', dayNumber)
      .eq('meal_type', mealType);
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Save Swapped Meal Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function saveRegeneratedDayAction(planId: string, dayNumber: number, newMeals: any) {
  const supabase = await createClient();
  
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
  const updates = [];

  for (let i = 0; i < mealTypes.length; i++) {
    const type = mealTypes[i];
    const mealData = newMeals[type];
    
    if (mealData) {
      updates.push({
        meal_plan_id: planId,
        day_number: dayNumber,
        meal_type: type,
        name: mealData.name,
        description: mealData.description,
        calories: parseNumber(mealData.calories),
        proteins: parseNumber(mealData.proteins || mealData.protein),
        carbs: parseNumber(mealData.carbs || mealData.carb),
        fats: parseNumber(mealData.fats || mealData.fat),
        recipe: mealData.recipe || {},
        instructions: mealData.instructions || []
      });
    }
  }

  try {
    for (const update of updates) {
      const { error } = await supabase
        .from('meals')
        .update(update)
        .eq('meal_plan_id', planId)
        .eq('day_number', dayNumber)
        .eq('meal_type', update.meal_type);
      
      if (error) throw error;
    }
    return { success: true };
  } catch (error: any) {
    console.error("Save Regenerated Day Error:", error.message);
    return { success: false, error: error.message };
  }
}
