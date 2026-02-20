import BroadcastClient from "@/components/broadcast/BroadcastClient"

export default function BroadcastPage({
  searchParams,
}: {
  searchParams: { target?: string }
}) {
  return <BroadcastClient initialTarget={searchParams.target} />
}