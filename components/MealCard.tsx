import { Clock, Utensils } from 'lucide-react'
import { Button } from './ui/button'
import { Dispatch, RefObject, useState } from 'react'
import { Spinner } from './ui/spinner'
import { generateMealAlternativesAction } from '@/app/meals/action'

export function MealCard({
	index,
	name,
	description,
	mealType,
	time,
	calories,
	proteins,
	carbs,
	fats,
	preferences,
	setMealAlt,
	setOpen,
	asMealAlt = false,
	ref,
}: {
	index?: number
	name: string
	description: string
	mealType: string
	time?: string
	calories: number
	proteins: number
	carbs: number
	fats: number
	preferences: {
		goal: string
		diet: string
		calories: number
		allergies: string
		cuisines: string
		dislikes: string
	}
	setMealAlt: Dispatch<any>
	setOpen: Dispatch<boolean>
	asMealAlt?: boolean
	ref?: RefObject<HTMLDivElement>
}) {
	const [loading, setLoading] = useState(false)

	const swap = async () => {
		setLoading(true)
		try {
			const result = await generateMealAlternativesAction(
				mealType,
				{ name, description, calories, proteins, carbs, fats },
				preferences
			)
			if (!result.success || !result.data?.meals) {
				throw new Error(result.error || 'Invalid meal alternatives response')
			}
			setMealAlt({ type: mealType, meals: result.data.meals })
			setOpen(true)
		} catch (error) {
			console.error('Failed to swap meal:', error)
			alert('Failed to generate alternative meals. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div
			className='bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition'
			ref={ref}
		>
			<div className='p-6 relative flex flex-col justify-between h-full'>
				{!asMealAlt && (
					<div className='absolute top-3 right-4 bg-white px-3 py-1 rounded-full shadow-md'>
						<span className='text-emerald-600 capitalize'>{mealType}</span>
					</div>
				)}
				<div className='flex flex-col'>
					{time && (
						<div className='flex items-center gap-2 text-gray-500 mb-2'>
							<Clock className='w-4 h-4' />
							<span className='text-sm'>{time}</span>
						</div>
					)}

					<h1 className='mb-2 font-bold'>{name}</h1>
					<p className='text-gray-600 mb-2'>{description}</p>
				</div>
				<div className='flex flex-col'>
					<Button
						className='hover:cursor-pointer mb-4 w-fit self-end'
						onClick={asMealAlt ? () => setMealAlt({ index, mealType }) : swap}
						disabled={loading}
						data-html2canvas-ignore='true'
					>
						{loading ? (
							<>
								<Spinner /> Loading...
							</>
						) : asMealAlt ? (
							'Save'
						) : (
							'🔄 Swap'
						)}
					</Button>

					<div className='border-t pt-4'>
						<div className='flex items-center gap-2 mb-3'>
							<Utensils className='w-4 h-4 text-emerald-600' />
							<span className='text-sm text-gray-700'>Nutrition Info</span>
						</div>
						<div className='grid grid-cols-4 gap-2'>
							<div className='text-center'>
								<div className='text-emerald-600'>{calories}</div>
								<div className='text-xs text-gray-500'>Calories</div>
							</div>
							<div className='text-center'>
								<div className='text-emerald-600'>{proteins}g</div>
								<div className='text-xs text-gray-500'>Protein</div>
							</div>
							<div className='text-center'>
								<div className='text-emerald-600'>{carbs}g</div>
								<div className='text-xs text-gray-500'>Carbs</div>
							</div>
							<div className='text-center'>
								<div className='text-emerald-600'>{fats}g</div>
								<div className='text-xs text-gray-500'>Fat</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
