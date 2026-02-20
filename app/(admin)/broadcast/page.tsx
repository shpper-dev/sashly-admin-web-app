import BroadcastClient from "@/components/broadcast/BroadcastClient"

export default async function BroadcastPage({
  searchParams,
}: {
  searchParams: Promise<{ target?: string }>
}) {
  const initialTarget = await searchParams
  return <BroadcastClient initialTarget={initialTarget.target} />
}