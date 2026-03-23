import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
	return (
		<div>
			<nav className='flex justify-between px-4 items-center'>
				<Image src='/logo.png' alt='Logo' width={100} height={50} />
				<Link href='/form'>
					<Button className='hover:cursor-pointer'>Get Started</Button>
				</Link>
			</nav>
			<div className='grid grid-cols-1 md:grid-cols-3 w-full py-20 gap-8 md:gap-0'>
				<div className='col-start-1 col-end-3 flex flex-col pe-8 xl:ps-30 lg:ps-20 ps-10 justify-center gap-8'>
					<h1 className='md:text-7xl lg:text-8xl text-6xl font-bold'>
						Meal planning made easy
					</h1>
					<p className='text-2xl'>Join over 4,500,000 others for free today.</p>
				</div>
				<div className='flex items-center justify-center'>
					<Image
						className='border-4 border-gray-100 rounded-2xl'
						src='https://www.mealime.com/images/app-screens/pick-your-meals.png'
						alt='Meal'
						width={200}
						height={800}
					/>
				</div>
			</div>
			<div className='grid lg:grid-cols-5 grid-cols-1 w-full py-20 gap-8 bg-[#f8fdfd]'>
				<div className='md:col-span-2 flex flex-col pe-8 lg:ps-20 xl:ps-30 ps-10 justify-center gap-12'>
					<h1 className='text-6xl font-bold'>
						Your busy weeknights are about to be so much easier.
					</h1>
					<p className='text-2xl font-semibold'>
						We’ve made meal planning, grocery shopping, and cooking as simple as
						getting takeout.
					</p>
					<Link href='/form'>
						<Button className='hover:cursor-pointer uppercase w-fit p-5'>
							start saving time
						</Button>
					</Link>
				</div>
				<div className='md:col-span-3 flex items-center gap-1 justify-center'>
					<div className='flex flex-col items-center gap-2'>
						<Image
							className='border-4 border-gray-100 rounded-2xl'
							src='https://www.mealime.com/images/app-screens/pick-your-meals.png'
							alt='Plan'
							width={200}
							height={800}
						/>
						<p className='text-xl font-semibold uppercase italic'>1. plan</p>
					</div>
					<div className='flex flex-col items-center gap-2'>
						<Image
							className='border-4 border-gray-100 rounded-2xl'
							src='https://www.mealime.com/images/app-screens/grocery-list.png'
							alt='Shop'
							width={200}
							height={800}
						/>
						<p className='text-xl font-semibold uppercase italic'>2. shop</p>
					</div>
					<div className='flex flex-col items-center gap-2'>
						<Image
							className='border-4 border-gray-100 rounded-2xl'
							src='https://www.mealime.com/images/app-screens/recipe.png'
							alt='Meal'
							width={200}
							height={800}
						/>
						<p className='text-xl font-semibold uppercase italic'>3. cook</p>
					</div>
				</div>
			</div>
			<div className='grid grid-cols-1 lg:grid-cols-2 w-full py-20 lg:gap-4 gap-12'>
				<div className='flex flex-col pe-8 lg:ps-20 xl:ps-30 ps-10 justify-center gap-12 max-w-2xl'>
					<h1 className='text-6xl font-bold'>
						Meal planning <i>Personalized</i>.
					</h1>
					<p className='text-2xl font-semibold uppercase'>
						Plan your meals for the entire week in minutes.
					</p>
					<p className='text-2xl'>
						With over 200 personalization options, eat exactly how you want to
						eat.
					</p>
				</div>
				<div className='flex items-center ms-10 md:ms-0 justify-center'>
					<div className='flex flex-col items-center gap-4'>
						<div className='flex items-center gap-2'>
							<Image
								className='shadow-xl rounded-full'
								src='https://www.mealime.com/images/testimonials/sean.png'
								alt='Sean'
								width={100}
								height={100}
							/>
							<p className='text-2xl font-bold uppercase max-w-50'>
								sean's meal plan
							</p>
						</div>
						<div className='w-full flex flex-col gap-8'>
							<div className='w-full'>
								<p className='text-xl text-[#b4b4b4]'>Plan Type</p>
								<p className='text-2xl font-bold uppercase'>classic</p>
							</div>
							<div className='w-full'>
								<p className='text-xl text-[#b4b4b4]'>Allergies</p>
								<p className='text-2xl font-bold uppercase'>shellfish</p>
							</div>
							<div className='w-full'>
								<p className='text-xl text-[#b4b4b4]'>Dislikes</p>
								<p className='text-2xl font-bold uppercase'>no tofu</p>
							</div>
							<div className='w-full'>
								<p className='text-xl text-[#b4b4b4]'>Servings</p>
								<p className='text-2xl font-bold uppercase'>for 2</p>
							</div>
						</div>
					</div>
					<Separator orientation='vertical' className='me-8' />
					<div className='flex flex-col items-center gap-4'>
						<div className='flex items-center gap-2'>
							<Image
								className='shadow-xl rounded-full'
								src='https://www.mealime.com/images/testimonials/tania.png'
								alt='Tania'
								width={100}
								height={100}
							/>
							<p className='text-2xl font-bold uppercase max-w-50'>
								tania's meal plan
							</p>
						</div>
						<div className='w-full flex flex-col gap-8'>
							<div className='w-full'>
								<p className='text-xl text-[#b4b4b4]'>Plan Type</p>
								<p className='text-2xl font-bold uppercase'>vegetarian</p>
							</div>
							<div className='w-full'>
								<p className='text-xl text-[#b4b4b4]'>Allergies</p>
								<p className='text-2xl font-bold uppercase'>glutten-free</p>
							</div>
							<div className='w-full'>
								<p className='text-xl text-[#b4b4b4]'>Dislikes</p>
								<p className='text-2xl font-bold uppercase'>no olives</p>
							</div>
							<div className='w-full'>
								<p className='text-xl text-[#b4b4b4]'>Servings</p>
								<p className='text-2xl font-bold uppercase'>for 4</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className='grid lg:grid-cols-5 grid-cols-1 w-full py-20 gap-8 sm:gap-0 bg-[#f8fdfd]'>
				<div className='col-span-3 flex flex-col pe-8 lg:ps-20 xl:ps-30 ps-10 justify-center gap-12 max-w-180'>
					<h1 className='text-6xl font-bold'>
						Grocery shopping <i>Simplified</i>
					</h1>
					<p className='text-2xl font-bold uppercase'>
						Grocery shop once per week with an organized, “done for you”
						shopping list.
					</p>
					<Link href='/form'>
						<Button className='hover:cursor-pointer uppercase w-fit p-5'>
							start shopping smarter
						</Button>
					</Link>
				</div>
				<div className='col-span-2 flex items-center gap-1 justify-center w-full'>
					<div className='flex flex-col gap-1'>
						<Image
							src='https://www.mealime.com/images/home/selected-meals-for-grocery-list.png'
							alt='Grocery List'
							width={200}
							height={200}
						/>
						<p className='text-xs font-semibold uppercase italic max-w-50 text-center'>
							All your ingredients auto-sorted into categories
						</p>
					</div>
					<Image
						className='border-4 border-gray-100 rounded-2xl'
						src='https://www.mealime.com/images/app-screens/grocery-list.png'
						alt='Groceries'
						width={200}
						height={800}
					/>
				</div>
			</div>
			<div className='grid lg:grid-cols-5 grid-cols-1 w-full py-20 gap-8'>
				<div className='lg:col-span-3 flex flex-col pe-8 lg:ps-20 xl:ps-30 ps-10 justify-center gap-12 max-w-180'>
					<h1 className='text-6xl font-bold'>
						Cooking <i>Stress-free</i>.
					</h1>
					<p className='text-2xl font-bold uppercase'>
						Easily cook healthy, delicious meals in about 30 minutes.
					</p>
					<Link href='/form'>
						<Button className='hover:cursor-pointer uppercase w-fit p-5'>
							start stress-free cooking
						</Button>
					</Link>
				</div>
				<div className='lg:col-span-2 flex items-center gap-1 w-full justify-center'>
					<Image
						className='border-4 border-gray-100 rounded-2xl'
						src='https://www.mealime.com/images/app-screens/recipe.png'
						alt='Recipe'
						width={200}
						height={800}
					/>
					<div className='mt-5 flex flex-col gap-2'>
						<Image
							className='border-4 border-gray-100 rounded-2xl'
							src='https://www.mealime.com/images/app-screens/handsfree.png'
							alt='Handsfree'
							width={200}
							height={800}
						/>
						<p className='text-xs font-semibold uppercase italic max-w-50 text-center'>
							Hands free mode
						</p>
					</div>
				</div>
			</div>
			<div className='grid xl:grid-cols-2 grid-cols-1 w-full py-20 xl:gap-4 gap-12 bg-[#f8fdfd]'>
				<div className='flex flex-col pe-8 lg:ps-20 xl:ps-30 ps-10 justify-center gap-12 max-w-180'>
					<h1 className='text-6xl font-bold'>
						Eat better, enjoy stress-free evenings, and feel great about
						yourself.
					</h1>
					<p className='text-2xl font-bold uppercase'>
						Join over 4,500,000 others for free today.
					</p>
				</div>
				<div className='flex items-center gap-1 w-full justify-center'>
					<div>
						<Image
							className='border-4 border-gray-100 rounded-2xl'
							src='https://www.mealime.com/images/app-screens/pick-your-meals.png'
							alt='Meals'
							width={200}
							height={800}
						/>
					</div>
					<div>
						<Image
							className='border-4 border-gray-100 rounded-2xl'
							src='https://www.mealime.com/images/app-screens/recipe.png'
							alt='Recipe'
							width={200}
							height={800}
						/>
					</div>
					<div>
						<Image
							className='border-4 border-gray-100 rounded-2xl'
							src='https://www.mealime.com/images/app-screens/handsfree.png'
							alt='Handsfree'
							width={200}
							height={800}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
