"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TaskStatus, EditingTask, TaskFormValues } from "@/types/todo"

// Create Group Dialog
interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  onGroupNameChange: (name: string) => void
  onSubmit: () => void
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  groupName,
  onGroupNameChange,
  onSubmit,
}: CreateGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Grupo de Tarefas</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Grupo</label>
            <Input
              value={groupName}
              onChange={(e) => onGroupNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder="Ex: Autenticacao, Frontend, Backend..."
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!groupName.trim()}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            Criar Grupo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Create Task Dialog
interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskTitle: string
  taskStep: string
  onTitleChange: (title: string) => void
  onStepChange: (step: string) => void
  onSubmit: () => void
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  taskTitle,
  taskStep,
  onTitleChange,
  onStepChange,
  onSubmit,
}: CreateTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titulo</label>
            <Input
              value={taskTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder="Nome da task"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descricao (opcional)</label>
            <Textarea
              value={taskStep}
              onChange={(e) => onStepChange(e.target.value)}
              placeholder="Detalhes sobre a task..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!taskTitle.trim()}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            Criar Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Edit Task Dialog
interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTask: EditingTask | null
  editValues: TaskFormValues
  onValuesChange: (values: TaskFormValues) => void
  onSubmit: () => void
}

export function EditTaskDialog({
  open,
  onOpenChange,
  editingTask,
  editValues,
  onValuesChange,
  onSubmit,
}: EditTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Editar Task-{editingTask ? String(editingTask.taskIndex + 1).padStart(2, "0") : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titulo</label>
            <Input
              value={editValues.title}
              onChange={(e) => onValuesChange({ ...editValues, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder="Nome da task"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descricao (opcional)</label>
            <Textarea
              value={editValues.step}
              onChange={(e) => onValuesChange({ ...editValues, step: e.target.value })}
              placeholder="Detalhes sobre a task..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={editValues.status}
              onValueChange={(value: TaskStatus) => onValuesChange({ ...editValues, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">A fazer</SelectItem>
                <SelectItem value="doing">Fazendo</SelectItem>
                <SelectItem value="done">Feito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!editValues.title.trim()}
            className="bg-[oklch(0.72_0.19_145)] hover:bg-[oklch(0.65_0.19_145)] text-white"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
