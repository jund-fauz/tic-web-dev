"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { MealInsert } from "@/types/database";
import { parseNumber } from "@/lib/utils";

export async function syncMealsFromLocal(localData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  try {
    const weekStartDate = localData.week_start_date || new Date().toISOString().split('T')[0];

    // 1. Check if a plan already exists for this user and date to avoid duplicates
    const { data: existingPlan } = await supabase
      .from("meal_plans")
      .select("id, meals(count)")
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartDate)
      .limit(1)
      .maybeSingle();

    if (existingPlan && (existingPlan.meals as any)?.[0]?.count > 0) {
      console.log("Plan already exists in Supabase, skipping sync:", existingPlan.id);
      return { success: true };
    }

    // 2. Create a meal plan if not exists or empty
    let plan;
    if (existingPlan) {
      plan = existingPlan;
    } else {
      const { data: newPlan, error: planError } = await supabase
        .from("meal_plans")
        .insert({
          user_id: user.id,
          week_start_date: weekStartDate,
          status: 'planned',
          groceries: localData.grocery || {},
          grocery_total_rupiah: localData.grocery_total_rupiah || 0
        })
        .select()
        .single();

      if (planError) {
        console.error("Error creating plan during sync:", planError);
        throw planError;
      }
      plan = newPlan;
    }

    console.log("Plan for sync:", plan.id);

    // 2. Prepare meals for insertion
    const mealsToInsert: MealInsert[] = [];
    
    // Assuming localData.days is an array of 7 days
    if (localData.days && Array.isArray(localData.days)) {
      localData.days.forEach((day: any, index: number) => {
        const dayNumber = index + 1;
        if (day.meals) {
          Object.entries(day.meals).forEach(([mealType, meal]: [string, any]) => {
            if (meal && meal.name) {
              mealsToInsert.push({
                meal_plan_id: plan.id,
                day_number: dayNumber,
                meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
                name: meal.name,
                description: meal.description || "",
                calories: parseNumber(meal.calories),
                proteins: parseNumber(meal.proteins || meal.protein),
                carbs: parseNumber(meal.carbs || meal.carb),
                fats: parseNumber(meal.fats || meal.fat),
                recipe: meal.recipe || {},
                instructions: meal.instructions || []
              });
            }
          });
        }
      });
    }

    if (mealsToInsert.length > 0) {
      console.log(`Inserting ${mealsToInsert.length} meals for plan ${plan.id}`);
      const { error: mealsError } = await supabase
        .from("meals")
        .insert(mealsToInsert);
      
      if (mealsError) {
        console.error("Error inserting meals during sync:", mealsError);
        // Compensating logic: delete the orphan plan
        try {
          await supabase.from("meal_plans").delete().eq("id", plan.id);
        } catch (cleanupError) {
          console.error(`Failed to cleanup orphan meal plan ${plan.id}:`, cleanupError);
        }
        throw mealsError;
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Sync error:", error);
    return { error: error.message };
  }
}

export async function saveGeneratedPlan(meals: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  // This is similar to sync but for a freshly generated plan
  return syncMealsFromLocal({ days: meals });
}

export async function toggleMealEaten(mealId: string, isEaten: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  const { error } = await supabase
    .from("meals")
    .update({ is_eaten: isEaten })
    .eq("id", mealId);

  if (error) {
    console.error("Error toggling meal:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

