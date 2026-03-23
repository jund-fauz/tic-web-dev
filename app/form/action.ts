'use server'

import { ai } from '@/lib/ai'
import { capitalize } from '@/lib/capitalize'
import { clean } from '@/lib/jsoncleaner'

export const input = async (prevState: any, formData: FormData) => {
	const goal = capitalize(formData.get('goal')?.toString() as string)
	const calories = formData.get('calories')
	const diet = capitalize(formData.get('diet')?.toString() as string)
	const dislikes = capitalize(formData.get('dislikes')?.toString() as string)
	const cuisineLists = ['indonesian', 'western', 'asian', 'mediterranean']
	let allergies = capitalize(formData.get('allergies')?.toString() as string)
	let cuisines = cuisineLists
		.filter((cuisine) => formData.get(cuisine))
		.map((cuisine) => capitalize(cuisine))
		.join(', ')
	const response = await ai.models.generateContent({
		model: 'gemini-2.5-flash',
		contents: `Generate a 7-day meal plan with the following parameters:

	Goal: ${goal}
	Daily Calories: ${calories} kcal
	Diet Type: ${diet}
	Allergies: ${allergies}
	Cuisine Preference: ${cuisines}
	Foods to Avoid: ${dislikes}

	For each day, provide:
	- Breakfast (~25% of daily calories)
	- Lunch (~35% of daily calories)
	- Dinner (~30% of daily calories)
	- Snacks (~10% of daily calories)

	Each meal should include:
	- Name (appealing, specific)
	- Brief description
	- Calories, Protein (g), Carbs (g), Fats (g)

	Requirements:
	- No meal repetition within 7 days
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
	- Data returned in json should only saved into two keys: 'days' (The meal plan) and 'average_daily_nutrition'
	- All protein data should saved in 'proteins' key
	- breakfast, lunch, dinner, and snack should saved as object, not array
	- breakfast, lunch, dinner, and snack should saved inside a 'meals' key
	- Snack should save in 'snack' key without added 's'
	- Give information about ingredients for the food listed and save it in 'grocery' key, also give category for each ingredient
	- The category should saved as key, not in value, and the item should save as array inside the key. (IMPORTANT!)
	- Provide quantity for each item and add the quantity after the name of the item (don't separate quantity into another key)
	- Provide estimated grocery total in Rupiah and save it in 'grocery_total_rupiah' key (IMPORTANT!)

	Return ONLY valid JSON with days, meals, and nutrition. No explanation.
	`,
	})
	return {
		...prevState,
		data: JSON.parse(clean(response.text as string)),
		input: {
			goal,
			calories,
			diet,
			allergies,
			cuisines,
			dislikes,
		},
	}
}
