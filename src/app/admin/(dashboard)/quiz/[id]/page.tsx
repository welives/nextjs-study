import { notFound } from 'next/navigation'
import { getOne } from '@/actions/quiz'
import { QuizForm } from '../_components/quiz-form'

type PageProps = { params: { id: string } }

export default async function Page({ params }: PageProps) {
  let data
  if (params.id !== 'new') {
    const res = await getOne(params.id)
    if (!res.success || !res.data) {
      notFound()
    }
    data = res.data
  }
  return <QuizForm initialData={data} />
}
