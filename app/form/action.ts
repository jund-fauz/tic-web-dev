'use server'

import { generateContent } from '@/lib/ai'
import { capitalize } from '@/lib/capitalize'
import { clean } from '@/lib/jsoncleaner'
import { createClient } from '@/utils/supabase/server'
import { parseNumber } from '@/lib/utils'

import { MealInsert } from "@/types/database";

function getDietGuidance(diet: string) {
	switch (diet.toLowerCase()) {
		case 'low-carb':
			return `
	Low-carb requirement:
	- Prioritize high-protein meals with clearly lower carbohydrates.
	- Keep carbohydrates lower than protein for each meal whenever realistic.
	- Avoid rice, noodles, bread, sugary sauces, and flour-heavy sides as the main component.
	- Prefer eggs, chicken, fish, beef, tofu, tempeh, non-starchy vegetables, and healthy fats.
	- Do not generate meals that are dominated by carbohydrates.`
		case 'keto':
			return `
	Keto requirement:
	- Keep carbohydrates very low.
	- Prioritize protein, healthy fats, and low-carb vegetables.
	- Avoid rice, noodles, bread, potatoes, sugar, and sweet sauces.`
		default:
			return ''
	}
}

export async function input(prevState: any, formData: FormData) {
	const goal = capitalize(formData.get('goal')?.toString() as string)
	const calories = formData.get('calories')
	const rawDiet = formData.get('diet')?.toString() as string
	const diet = capitalize(rawDiet)
	const dislikes = capitalize(formData.get('dislikes')?.toString() as string)
	const cuisineLists = ['indonesian', 'western', 'asian', 'mediterranean']
	let allergies = capitalize(formData.get('allergies')?.toString() as string)
	let cuisines = cuisineLists
		.filter((cuisine) => formData.get(cuisine))
		.map((cuisine) => capitalize(cuisine))
		.join(', ')
	const dietGuidance = getDietGuidance(rawDiet)

	console.log(`Starting AI generation process for goal: ${goal}, calories: ${calories} kcal, diet: ${diet}`)

	const prompt = `Generate a 7-day meal plan with the following parameters:

	Goal: ${goal}
	Daily Calories: ${calories} kcal
	Diet Type: ${diet}
	Allergies: ${allergies}
	Cuisine Preference: ${cuisines}
	Foods to Avoid: ${dislikes}

	Language:
	- ALL meal names, descriptions, recipe ingredients, and cooking instructions MUST be in Indonesian language (Bahasa Indonesia).

	For each day, provide:
	- Breakfast (~25% of daily calories)
	- Lunch (~35% of daily calories)
	- Dinner (~30% of daily calories)
	- Snacks (~10% of daily calories)

	Each meal should include:
	- Name (appealing, specific)
	- Brief description
	- Calories, Proteins (g), Carbs (g), Fats (g)
	- Recipe (saved in 'recipe' key as an object containing 'ingredients' as an array of strings)
	- Cooking instructions in Indonesian language (Bahasa Indonesia) (saved in 'instructions' key as an array of strings)

	Requirements:
	- No meal repetition within 7 days
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
	- Data returned in json should only saved into two keys: 'days' (The meal plan) and 'average_daily_nutrition'
	- All protein data should saved in 'proteins' key (ALWAYS use plural 'proteins')
	- breakfast, lunch, dinner, and snack should saved as object, not array
	- breakfast, lunch, dinner, and snack should saved inside a 'meals' key
	- Snack should save in 'snack' key without added 's'
	- Give information about ingredients for the food listed and save it in 'grocery' key, also give category for each ingredient
	- instructions should be clear, step-by-step cooking guide in Indonesian language (Bahasa Indonesia)
	- ingredients in recipe should also be in Indonesian language (Bahasa Indonesia)
	- The category should saved as key, not in value, and the item should save as array inside the key. (IMPORTANT!)
	- Provide quantity for each item and add the quantity after the name of the item (don't separate quantity into another key)
	- Provide estimated grocery total in Rupiah and save it in 'grocery_total_rupiah' key (IMPORTANT!)

	Return ONLY valid JSON with days, meals, and nutrition. No explanation.
	`;

	let planData: any;
	try {
		const content = await generateContent(prompt);
		const cleanedContent = clean(content)

		try {
			planData = JSON.parse(cleanedContent)
		} catch (e) {
			console.error("Failed to parse AI JSON. Payload length:", cleanedContent.length, "Preview:", cleanedContent.substring(0, 100))
			throw new Error("AI returned invalid data format. Please try again.")
		}
	} catch (error) {
		console.error("AI Generation failed:", error)
		throw error
	}

	// Save to Supabase if user is logged in
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	if (user) {
		const { data: plan, error: planError } = await supabase
			.from("meal_plans")
			.insert({
				user_id: user.id,
				week_start_date: new Date().toISOString().split('T')[0],
				status: 'planned',
				groceries: planData.grocery || {},
				grocery_total_rupiah: planData.grocery_total_rupiah || 0
			})
			.select()
			.single()

		if (planError || !plan) {
			console.error("Error creating meal plan:", planError)
			throw new Error("Failed to create meal plan record.")
		}

		// Insert into meal_groceries for structured access if needed
		if (planData.grocery) {
			const groceryInserts = Object.entries(planData.grocery).map(([category, items]) => ({
				meal_plan_id: plan.id,
				category,
				items: items
			}))
			
			if (groceryInserts.length > 0) {
				const { error: groceryError } = await supabase.from("meal_groceries").insert(groceryInserts)
				if (groceryError) console.error("Error inserting meal groceries:", groceryError)
			}
		}

		const mealsToInsert: MealInsert[] = []
		if (planData.days && Array.isArray(planData.days)) {
			planData.days.forEach((day: any, index: number) => {
				const dayNumber = index + 1
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
							})
						}
					})
				}
			})
		}

		if (mealsToInsert.length > 0) {
			const { error: mealsError } = await supabase.from("meals").insert(mealsToInsert)
			if (mealsError) {
				console.error("Error inserting meals:", mealsError)
				// Compensating logic: delete the orphan plan
				try {
					await supabase.from("meal_plans").delete().eq("id", plan.id)
				} catch (cleanupError) {
					console.error(`Failed to cleanup orphan meal plan ${plan.id}:`, cleanupError)
				}
				throw new Error("Failed to save meals to the plan.")
			}
		}
	}

	const userEmail = user?.email || 'User'
	const username = (userEmail && typeof userEmail === 'string' && userEmail.includes('@')) 
		? userEmail.split('@')[0] 
		: userEmail

	return {
		...prevState,
		data: planData,
		input: {
			goal,
			calories,
			diet,
			allergies,
			cuisines,
			dislikes,
			email: userEmail,
			username,
		},
	}
}
