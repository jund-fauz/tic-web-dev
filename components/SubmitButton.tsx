import { useFormStatus } from 'react-dom'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'

export default function SubmitButton({ invalid }: { invalid: boolean }) {
	const { pending } = useFormStatus()
	return (
		<Button
			className='hover:cursor-pointer flex-1'
			type='submit'
			disabled={pending || invalid}
		>
			{pending ? (
				<>
					<Spinner /> Processing...
				</>
			) : (
				'Generate My Meal Plan'
			)}
		</Button>
	)
}
