import { Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Props {
  title: string
  children: React.ReactNode
}

export function InfoIcon({ title, children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="ml-2 text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
          <span className="sr-only">More info</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}