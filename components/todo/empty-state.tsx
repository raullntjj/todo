"use client"

import { Button } from "@/components/ui/button"
import { FolderOpen, Plus } from "lucide-react"

interface EmptyStateProps {
  onCreateGroup: () => void
}

export function EmptyState({ onCreateGroup }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <FolderOpen className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Nenhum grupo criado</p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Crie um grupo para organizar suas tasks
      </p>
      <Button
        onClick={onCreateGroup}
        className="mt-4 bg-foreground text-background hover:bg-foreground/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Criar Grupo
      </Button>
    </div>
  )
}
