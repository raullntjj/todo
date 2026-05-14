import { Circle, Clock, CheckCircle2 } from "lucide-react"
import type { TaskStatus } from "@/types/todo"

export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "A fazer"
    case "doing":
      return "Fazendo"
    case "done":
      return "Feito"
  }
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "bg-muted text-muted-foreground"
    case "doing":
      return "bg-amber-500/20 text-amber-600 dark:text-amber-400"
    case "done":
      return "bg-[oklch(0.72_0.19_145)]/20 text-[oklch(0.55_0.19_145)] dark:text-[oklch(0.72_0.19_145)]"
  }
}

export function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case "todo":
      return <Circle className="h-4 w-4" />
    case "doing":
      return <Clock className="h-4 w-4" />
    case "done":
      return <CheckCircle2 className="h-4 w-4" />
  }
}
