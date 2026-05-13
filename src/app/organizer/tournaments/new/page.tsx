import Link from "next/link"
import { requireRole } from "@/lib/dal"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button } from "@/components/ui/Button"
import { NewTournamentForm } from "./NewTournamentForm"

export const metadata = { title: "Create tournament · Organizer" }

export default async function NewTournamentPage() {
  await requireRole("organizer", "admin")

  return (
    <div className="space-y-7 max-w-2xl">
      <PageHeader
        eyebrow="New tournament"
        title="Set up the basics"
        description="Start as a draft. You can edit details and add divisions before publishing."
        action={
          <Link href="/organizer/tournaments">
            <Button variant="ghost" size="sm">Cancel</Button>
          </Link>
        }
      />
      <NewTournamentForm />
    </div>
  )
}
