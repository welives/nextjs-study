import { QuizForm } from '../_components/quiz-form'

type PageProps = { params: { id: string } }

export default async function Page({ params }: PageProps) {
  return <QuizForm id={params.id} />
}
