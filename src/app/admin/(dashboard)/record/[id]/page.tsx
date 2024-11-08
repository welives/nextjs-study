import { RecordDetailPage } from '../_components/record-detail'

type PageProps = { params: { id: string } }

export default async function Page({ params }: PageProps) {
  return <RecordDetailPage id={params.id} />
}
