"use client"

import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, ChevronRight, Calendar, Trash2, Plus } from "lucide-react"
import type { Task, TaskGroup, TaskStatus } from "@/types/todo"
import { TaskItem } from "./task-item"

interface TaskGroupCardProps {
  group: TaskGroup
  groupIndex: number
  totalGroups: number
  onToggleCollapse: (groupId: string) => void
  onMoveGroupUp: (groupId: string) => void
  onMoveGroupDown: (groupId: string) => void
  onDeleteGroup: (groupId: string) => void
  onAddTask: (groupId: string) => void
  onStatusChange: (groupId: string, taskId: string, status: TaskStatus) => void
  onMoveTaskUp: (groupId: string, taskId: string) => void
  onMoveTaskDown: (groupId: string, taskId: string) => void
  onEditTask: (groupId: string, task: Task, taskIndex: number) => void
  onDeleteTask: (groupId: string, taskId: string) => void
  getProgress: (tasks: Task[]) => number
}

export function TaskGroupCard({
  group,
  groupIndex,
  totalGroups,
  onToggleCollapse,
  onMoveGroupUp,
  onMoveGroupDown,
  onDeleteGroup,
  onAddTask,
  onStatusChange,
  onMoveTaskUp,
  onMoveTaskDown,
  onEditTask,
  onDeleteTask,
  getProgress,
}: TaskGroupCardProps) {
  const progress = getProgress(group.tasks)
  const completedCount = group.tasks.filter((t) => t.status === "done").length

  return (
    <div className="group/card overflow-hidden rounded-lg border border-border bg-card">
      {/* Group Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Group order buttons */}
            <div className="flex flex-col opacity-0 transition-opacity group-hover/card:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-secondary"
                onClick={() => onMoveGroupUp(group.id)}
                disabled={groupIndex === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-secondary"
                onClick={() => onMoveGroupDown(group.id)}
                disabled={groupIndex === totalGroups - 1}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            <button
              className="flex items-center gap-3 text-left"
              onClick={() => onToggleCollapse(group.id)}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground">
                {group.collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
              <span className="font-medium">{group.name}</span>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs font-mono text-secondary-foreground">
                {completedCount}/{group.tasks.length}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {group.createdAt}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDeleteGroup(group.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-[oklch(0.72_0.19_145)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!group.collapsed && (
        <div className="p-4">
          {/* Lista de tasks */}
          {group.tasks.length > 0 && (
            <div className="mb-4 divide-y divide-border">
              {group.tasks.map((task, taskIndex) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  taskIndex={taskIndex}
                  totalTasks={group.tasks.length}
                  groupId={group.id}
                  onStatusChange={onStatusChange}
                  onMoveUp={onMoveTaskUp}
                  onMoveDown={onMoveTaskDown}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}

          {/* Botao para adicionar task */}
          <Button
            variant="outline"
            className="w-full h-10 border-dashed text-muted-foreground hover:text-foreground hover:border-foreground/30"
            onClick={() => onAddTask(group.id)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Task
          </Button>
        </div>
      )}
    </div>
  )
}
