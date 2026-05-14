"use client"

import { Button } from "@/components/ui/button"
import { Plus, Upload, Download, FolderOpen } from "lucide-react"

interface HeaderProps {
  stats: { total: number; completed: number }
  onImport: () => void
  onExport: () => void
  onNewGroup: () => void
}

export function Header({ stats, onImport, onExport, onNewGroup }: HeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
            <FolderOpen className="h-4 w-4 text-background" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Grupo de Tarefas</h1>
        </div>
        <div className="flex items-center gap-3">
          {stats.total > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">
                {stats.completed}/{stats.total}
              </span>
              <span>tasks</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={onImport}
              title="Importar dados"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={onExport}
              title="Exportar dados"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={onNewGroup}
            className="h-9 px-4 bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Grupo
          </Button>
        </div>
      </div>
    </header>
  )
}
