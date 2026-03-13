import { ProspectDetail } from '@/components/prospects/ProspectDetail'

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProspectDetail id={id} />
}
