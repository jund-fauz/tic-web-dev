"use server";

import { generateContent } from "@/lib/ai";
import { clean } from "@/lib/jsoncleaner";

export async function regenerateMealAction(preferences: any, currentMeals: any) {
  const prompt = `Regenerate one meal plan alternative for breakfast, lunch, dinner, and snack with the following parameters:
				
    Goal: ${preferences.goal}
    Daily Calories: ${preferences.calories} kcal
    Diet Type: ${preferences.diet}
    Allergies: ${preferences.allergies}
    Cuisine Preference: ${preferences.cuisines}
    Foods to Avoid: ${preferences.dislikes}

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
    - Calories, Protein (g), Carbs (g), Fats (g) (Each nutrition should same as provided above)
    - Recipe (saved in 'recipe' key as an object containing 'ingredients' as an array of strings)
    - Cooking instructions in Indonesian language (Bahasa Indonesia) (saved in 'instructions' key as an array of strings)

    Requirements:
    - Balanced macros:
      * Weight Loss: 30% protein, 40% carbs, 30% fat
      * Muscle Gain: 30% protein, 40% carbs, 30% fat
      * Maintenance: 25% protein, 45% carbs, 30% fat
    - Realistic meals (not overly complicated)
    - Consider cuisine preference
    - Avoid listed allergens & dislikes

    Rules:
    - carbs, fats, and proteins key should not end with _g
    - Give average calories, proteins, carbs, and fats per day
    - All protein data should saved in 'proteins' key
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

export async function generateMealDetailsAction(mealName: string, description: string) {
  const prompt = `Generate cooking details for "${mealName}" (${description}) in Indonesian language (Bahasa Indonesia).
    Return ONLY valid JSON with the following structure:
    {
      "ingredients": ["bahan 1...", "bahan 2..."],
      "instructions": ["langkah 1...", "langkah 2..."]
    }
    No explanation.`;

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
