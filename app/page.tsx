"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Plus, Trash2, ChevronDown, ChevronRight, Zap, Calendar, Pencil, ChevronUp } from "lucide-react"
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

type TaskStatus = "todo" | "doing" | "done"

interface Task {
  id: string
  title: string
  step: string
  status: TaskStatus
  createdAt: string
}

interface Sprint {
  id: string
  name: string
  tasks: Task[]
  createdAt: string
  collapsed: boolean
}

const STORAGE_KEY = "todo-sprints"

export default function TodoApp() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [newSprintName, setNewSprintName] = useState("")
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, { title: string; step: string }>>({})
  const [mounted, setMounted] = useState(false)
  const [editingTask, setEditingTask] = useState<{ sprintId: string; task: Task; taskIndex: number } | null>(null)
  const [editValues, setEditValues] = useState<{ title: string; step: string; status: TaskStatus }>({ title: "", step: "", status: "todo" })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSprints(JSON.parse(stored))
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sprints))
    }
  }, [sprints, mounted])

  const addSprint = () => {
    if (!newSprintName.trim()) return
    const newSprint: Sprint = {
      id: Date.now().toString(),
      name: newSprintName.trim(),
      tasks: [],
      createdAt: new Date().toLocaleDateString("pt-BR"),
      collapsed: false,
    }
    setSprints([newSprint, ...sprints])
    setNewSprintName("")
  }

  const addTask = (sprintId: string) => {
    const input = newTaskInputs[sprintId]
    if (!input?.title.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: input.title.trim(),
      step: input.step.trim(),
      status: "todo",
      createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }

    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId ? { ...sprint, tasks: [...sprint.tasks, newTask] } : sprint
      )
    )
    setNewTaskInputs({ ...newTaskInputs, [sprintId]: { title: "", step: "" } })
  }

  const cycleTaskStatus = (sprintId: string, taskId: string) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              tasks: sprint.tasks.map((task) => {
                if (task.id !== taskId) return task
                const nextStatus: TaskStatus = 
                  task.status === "todo" ? "doing" : 
                  task.status === "doing" ? "done" : "todo"
                return { ...task, status: nextStatus }
              }),
            }
          : sprint
      )
    )
  }

  const deleteTask = (sprintId: string, taskId: string) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId
          ? { ...sprint, tasks: sprint.tasks.filter((task) => task.id !== taskId) }
          : sprint
      )
    )
  }

  const deleteSprint = (sprintId: string) => {
    setSprints(sprints.filter((sprint) => sprint.id !== sprintId))
  }

  const startEditTask = (sprintId: string, task: Task, taskIndex: number) => {
    setEditingTask({ sprintId, task, taskIndex })
    setEditValues({ title: task.title, step: task.step, status: task.status })
  }

  const saveEditTask = () => {
    if (!editingTask || !editValues.title.trim()) return
    setSprints(
      sprints.map((sprint) =>
        sprint.id === editingTask.sprintId
          ? {
              ...sprint,
              tasks: sprint.tasks.map((task) =>
                task.id === editingTask.task.id
                  ? { ...task, title: editValues.title.trim(), step: editValues.step.trim(), status: editValues.status }
                  : task
              ),
            }
          : sprint
      )
    )
    setEditingTask(null)
    setEditValues({ title: "", step: "", status: "todo" })
  }

  const closeEditDialog = () => {
    setEditingTask(null)
    setEditValues({ title: "", step: "", status: "todo" })
  }

  const moveTaskUp = (sprintId: string, taskId: string) => {
    setSprints(
      sprints.map((sprint) => {
        if (sprint.id !== sprintId) return sprint
        const index = sprint.tasks.findIndex((t) => t.id === taskId)
        if (index <= 0) return sprint
        const newTasks = [...sprint.tasks]
        ;[newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]]
        return { ...sprint, tasks: newTasks }
      })
    )
  }

  const moveTaskDown = (sprintId: string, taskId: string) => {
    setSprints(
      sprints.map((sprint) => {
        if (sprint.id !== sprintId) return sprint
        const index = sprint.tasks.findIndex((t) => t.id === taskId)
        if (index < 0 || index >= sprint.tasks.length - 1) return sprint
        const newTasks = [...sprint.tasks]
        ;[newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]]
        return { ...sprint, tasks: newTasks }
      })
    )
  }

  const toggleCollapse = (sprintId: string) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId ? { ...sprint, collapsed: !sprint.collapsed } : sprint
      )
    )
  }

  const getProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0
    return Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100)
  }

  const getTotalStats = () => {
    const allTasks = sprints.flatMap((s) => s.tasks)
    const completed = allTasks.filter((t) => t.status === "done").length
    return { total: allTasks.length, completed }
  }

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "todo": return "A fazer"
      case "doing": return "Fazendo"
      case "done": return "Feito"
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "todo": return "bg-muted text-muted-foreground"
      case "doing": return "bg-amber-500/20 text-amber-600 dark:text-amber-400"
      case "done": return "bg-[oklch(0.72_0.19_145)]/20 text-[oklch(0.55_0.19_145)] dark:text-[oklch(0.72_0.19_145)]"
    }
  }

  if (!mounted) return null

  const stats = getTotalStats()

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
              <Zap className="h-4 w-4 text-background" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Sprints</h1>
          </div>
          {stats.total > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">{stats.completed}/{stats.total}</span>
              <span>tasks</span>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Criar nova sprint */}
        <div className="mb-8">
          <div className="flex gap-3">
            <Input
              placeholder="Nova sprint..."
              value={newSprintName}
              onChange={(e) => setNewSprintName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSprint()}
              className="h-11 border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button 
              onClick={addSprint} 
              className="h-11 px-5 bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar
            </Button>
          </div>
        </div>

        {/* Lista de sprints */}
        <div className="space-y-4">
          {sprints.map((sprint) => {
            const progress = getProgress(sprint.tasks)
            const input = newTaskInputs[sprint.id] || { title: "", step: "" }
            const completedCount = sprint.tasks.filter((t) => t.completed).length

            return (
              <div 
                key={sprint.id} 
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                {/* Sprint Header */}
                <div className="border-b border-border px-4 py-3">
                  <div className="flex items-center justify-between">
                    <button
                      className="flex items-center gap-3 text-left"
                      onClick={() => toggleCollapse(sprint.id)}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground">
                        {sprint.collapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                      <span className="font-medium">{sprint.name}</span>
                      <span className="rounded bg-secondary px-2 py-0.5 text-xs font-mono text-secondary-foreground">
                        {completedCount}/{sprint.tasks.length}
                      </span>
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {sprint.createdAt}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteSprint(sprint.id)}
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

                {!sprint.collapsed && (
                  <div className="p-4">
                    {/* Lista de tasks */}
                    {sprint.tasks.length > 0 && (
                      <div className="mb-4 divide-y divide-border">
                        {sprint.tasks.map((task, taskIndex) => {
                          const taskNumber = String(taskIndex + 1).padStart(2, "0")
                          
                          return (
                            <div
                              key={task.id}
                              className={`group flex items-start gap-4 py-3 transition-colors ${
                                task.status === "done" ? "opacity-50" : ""
                              }`}
                            >
                              {/* Task number */}
                              <span className="mt-0.5 text-xs font-mono text-muted-foreground w-12 shrink-0">
                                Task-{taskNumber}
                              </span>
                              
                              {/* Status badge - clickable to cycle */}
                              <button
                                onClick={() => cycleTaskStatus(sprint.id, task.id)}
                                className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-medium transition-colors ${getStatusColor(task.status)}`}
                              >
                                {getStatusLabel(task.status)}
                              </button>
                              
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium leading-tight ${
                                    task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
                                  }`}
                                >
                                  {task.title}
                                </p>
                                {task.step && (
                                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                    {task.step}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                {/* Move buttons */}
                                <div className="flex flex-col">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-secondary"
                                    onClick={() => moveTaskUp(sprint.id, task.id)}
                                    disabled={taskIndex === 0}
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-secondary"
                                    onClick={() => moveTaskDown(sprint.id, task.id)}
                                    disabled={taskIndex === sprint.tasks.length - 1}
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                </div>
                                <span className="text-xs font-mono text-muted-foreground">
                                  {task.createdAt}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-secondary"
                                  onClick={() => startEditTask(sprint.id, task, taskIndex)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => deleteTask(sprint.id, task.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Adicionar task */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Adicionar task..."
                          value={input.title}
                          onChange={(e) =>
                            setNewTaskInputs({
                              ...newTaskInputs,
                              [sprint.id]: { ...input, title: e.target.value },
                            })
                          }
                          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && addTask(sprint.id)}
                          className="h-9 flex-1 border-border bg-background text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <Button 
                          onClick={() => addTask(sprint.id)} 
                          size="sm"
                          className="h-9 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Passo ou descricao (opcional)"
                        value={input.step}
                        onChange={(e) =>
                          setNewTaskInputs({
                            ...newTaskInputs,
                            [sprint.id]: { ...input, step: e.target.value },
                          })
                        }
                        onKeyDown={(e) => e.key === "Enter" && addTask(sprint.id)}
                        className="h-8 border-border bg-background text-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {sprints.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhuma sprint criada</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Crie uma sprint para organizar suas tasks
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && closeEditDialog()}>
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
                onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && saveEditTask()}
                placeholder="Nome da task"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descricao (opcional)</label>
              <Input
                value={editValues.step}
                onChange={(e) => setEditValues({ ...editValues, step: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && saveEditTask()}
                placeholder="Passo ou descricao"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editValues.status}
                onValueChange={(value: TaskStatus) => setEditValues({ ...editValues, status: value })}
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
            <Button variant="outline" onClick={closeEditDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={saveEditTask}
              className="bg-[oklch(0.72_0.19_145)] hover:bg-[oklch(0.65_0.19_145)] text-white"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
