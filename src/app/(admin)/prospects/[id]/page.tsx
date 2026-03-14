import { ProspectDetail } from '@/components/prospects/ProspectDetail'
import { loadActiveSchema } from '@/lib/questionnaire/config'

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const schema = loadActiveSchema()
  return <ProspectDetail id={id} schema={schema} />
}
