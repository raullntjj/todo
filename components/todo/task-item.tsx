"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronUp, ChevronDown, Circle, Clock, CheckCircle2, Pencil, Trash2 } from "lucide-react"
import type { Task, TaskStatus } from "@/types/todo"
import { getStatusLabel, getStatusColor, getStatusIcon } from "@/lib/task-utils"

interface TaskItemProps {
  task: Task
  taskIndex: number
  totalTasks: number
  groupId: string
  onStatusChange: (groupId: string, taskId: string, status: TaskStatus) => void
  onMoveUp: (groupId: string, taskId: string) => void
  onMoveDown: (groupId: string, taskId: string) => void
  onEdit: (groupId: string, task: Task, taskIndex: number) => void
  onDelete: (groupId: string, taskId: string) => void
}

export function TaskItem({
  task,
  taskIndex,
  totalTasks,
  groupId,
  onStatusChange,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const taskNumber = String(taskIndex + 1).padStart(2, "0")

  return (
    <div
      className={`group flex items-start gap-3 py-3 transition-colors ${
        task.status === "done" ? "opacity-50" : ""
      }`}
    >
      {/* Move buttons - LEFT */}
      <div className="flex flex-col opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-secondary"
          onClick={() => onMoveUp(groupId, task.id)}
          disabled={taskIndex === 0}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-secondary"
          onClick={() => onMoveDown(groupId, task.id)}
          disabled={taskIndex === totalTasks - 1}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      {/* Task number */}
      <span className="mt-0.5 text-xs font-mono text-muted-foreground w-12 shrink-0">
        Task-{taskNumber}
      </span>

      {/* Status badge - dropdown to select */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-medium transition-colors hover:opacity-80 flex items-center gap-1.5 ${getStatusColor(task.status)}`}
          >
            {getStatusIcon(task.status)}
            {getStatusLabel(task.status)}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36">
          <DropdownMenuItem
            onClick={() => onStatusChange(groupId, task.id, "todo")}
            className="flex items-center gap-2"
          >
            <Circle className="h-4 w-4 text-muted-foreground" />
            A fazer
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onStatusChange(groupId, task.id, "doing")}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4 text-amber-500" />
            Fazendo
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onStatusChange(groupId, task.id, "done")}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-[oklch(0.72_0.19_145)]" />
            Feito
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-tight ${
            task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        {task.step && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{task.step}</p>
        )}
      </div>

      {/* Actions - RIGHT */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-xs font-mono text-muted-foreground mr-1">{task.createdAt}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-secondary"
          onClick={() => onEdit(groupId, task, taskIndex)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(groupId, task.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
