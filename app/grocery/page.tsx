'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

export default function Grocery() {
	const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
		typeof window !== 'undefined' && localStorage
			? JSON.parse(localStorage.getItem('groceries_done') as string) || {}
			: {}
	)
	const [grocery, _setGrocery] = useState(
		typeof window !== 'undefined' && localStorage
			? JSON.parse(localStorage.getItem('meals') as string)?.grocery
			: undefined
	)
	const [groceryTotal, _setGroceryTotal] = useState(
		typeof window !== 'undefined' && localStorage
			? JSON.parse(localStorage.getItem('meals') as string)?.grocery_total_rupiah
			: undefined
	)
	const [pdfLoading, setPdfLoading] = useState(false)
	const [shareLoading, setShareLoading] = useState(false)
	const divRef = useRef(null)
	const [html2pdf, setHtml2pdf] = useState<any>(null)

	useEffect(() => {
		import('html2pdf.js').then((module) => {
			setHtml2pdf(() => module.default)
		})
	}, [])

	useEffect(() =>
		localStorage.setItem('groceries_done', JSON.stringify(checkedItems))
	, [checkedItems])

	const totalItems = Object.values(grocery || {}).reduce(
		(acc: number, cat: any) => acc + (Array.isArray(cat) ? cat.length : 0),
		0
	)
	const checkedCount = Object.values(checkedItems).filter(Boolean).length

	const toggleItem = (categoryIndex: number, itemIndex: number) => {
		const key = `${categoryIndex}-${itemIndex}`
		setCheckedItems((prev) => ({
			...prev,
			[key]: !prev[key],
		}))
	}

	const generatePdf = (isShare = false) => {
		if (divRef.current && html2pdf) {
			if (!isShare) setPdfLoading(true)
			else setShareLoading(true)
			if (isShare)
				html2pdf()
					.set({
						filename: 'Grocery List.pdf',
						image: { type: 'jpeg', quality: 1 },
						html2canvas: { scale: 2 },
						jsPDF: {
							orientation: window.innerWidth > 640 ? 'landscape' : 'portrait',
						},
					})
					.from(divRef.current)
					.outputPdf('blob')
					.then((pdfBlob: any) => {
						const file = new File([pdfBlob], 'Grocery List.pdf', {
							type: 'application/pdf',
						})
						navigator
							.share({ files: [file] })
							.finally(() => setShareLoading(false))
					})
			else
				html2pdf()
					.set({
						filename: 'Grocery List.pdf',
						image: { type: 'jpeg', quality: 1 },
						html2canvas: { scale: 2 },
						jsPDF: {
							orientation: window.innerWidth > 640 ? 'landscape' : 'portrait',
						},
					})
					.from(divRef.current)
					.save()
					.finally(() => setPdfLoading(false))
		}
	}

	return (
		<div className='bg-[#effdf8] pb-8'>
			<div className='max-w-6xl mx-auto px-8 xl:px-0'>
				<nav className='pt-4 flex flex-col gap-2 mb-2'>
					<div className='flex justify-between items-center'>
						<Button
							className='hover:cursor-pointer'
							onClick={() => window.history.back()}
						>
							<ArrowLeft /> Meal Plan
						</Button>
						<h1 className='font-bold'>Grocery List</h1>
						<Button className='bg-[#effdf8] hover:bg-[#effdf8] select-none'>
							Grocery
						</Button>
					</div>
					<Separator />
				</nav>
				<div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<div className='bg-emerald-100 p-3 rounded-lg'>
								<ShoppingCart className='w-6 h-6 text-emerald-700' />
							</div>
							<div>
								<h2 className='mb-1'>Grocery List</h2>
								<p className='text-gray-600'>
									Ingredients for this week's meal plan
								</p>
							</div>
						</div>
						<div className='text-right'>
							<div className='text-emerald-700'>
								{checkedCount} / {totalItems}
							</div>
							<div className='text-sm text-gray-500'>Items checked</div>
						</div>
					</div>
				</div>
				<div
					className='grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8'
					ref={divRef}
				>
					{grocery &&
						Object.entries(grocery)
							.filter(([, categoryData]) => Array.isArray(categoryData))
							.map(([category, categoryData]: any, categoryIndex: number) => (
								<div
									key={categoryIndex}
									className='bg-white rounded-xl shadow-lg overflow-hidden'
								>
									<div className='bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-4'>
										<h3 className='text-white'>
											{category.includes('_')
												? category.replaceAll('_', ' ')
												: category}
										</h3>
									</div>
									<div className='p-6'>
										<ul className='space-y-3'>
											{categoryData.map((item: any, itemIndex: number) => {
												const key = `${categoryIndex}-${itemIndex}`
												const [isChecked, setIsChecked] = useState(
													checkedItems[key] || false
												)

												return (
													<li key={itemIndex}>
														<label className='flex items-center gap-3 cursor-pointer group'>
															<div className='relative'>
																<Checkbox
																	checked={isChecked}
																	onCheckedChange={(state: boolean) => {
																		toggleItem(categoryIndex, itemIndex)
																		setIsChecked(state)
																	}}
																	className='w-5 h-5 rounded border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer'
																/>
															</div>
															<div className='flex-1'>
																<span
																	className={`${
																		isChecked
																			? 'line-through text-gray-400'
																			: 'text-gray-800'
																	} transition-all`}
																>
																	{item}
																</span>
															</div>
														</label>
													</li>
												)
											})}
										</ul>
									</div>
								</div>
							))}
				</div>
				<p className='my-3'>
					Estimated total: Rp
					{groceryTotal}
				</p>
				<div className='flex gap-2 *:w-full'>
					<Button
						className='hover:cursor-pointer flex-1'
						onClick={() => generatePdf()}
						disabled={pdfLoading}
					>
						{pdfLoading ? (
							<>
								<Spinner /> Processing...
							</>
						) : (
							'Download PDF'
						)}
					</Button>
					<Button
						className='hover:cursor-pointer flex-1'
						onClick={() => generatePdf(true)}
						disabled={shareLoading}
					>
						{shareLoading ? (
							<>
								<Spinner /> Processing...
							</>
						) : (
							'Share Plan'
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}
