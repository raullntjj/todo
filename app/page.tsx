"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, ChevronDown, ChevronRight, Zap, Calendar, Pencil, ChevronUp, Circle, Clock, CheckCircle2 } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"

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
  const [mounted, setMounted] = useState(false)
  
  // Dialog states
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false)
  const [newSprintName, setNewSprintName] = useState("")
  
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [taskDialogSprintId, setTaskDialogSprintId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskStep, setNewTaskStep] = useState("")
  
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

  // Sprint functions
  const openSprintDialog = () => {
    setNewSprintName("")
    setSprintDialogOpen(true)
  }

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
    setSprintDialogOpen(false)
    setNewSprintName("")
  }

  const deleteSprint = (sprintId: string) => {
    setSprints(sprints.filter((sprint) => sprint.id !== sprintId))
  }

  const toggleCollapse = (sprintId: string) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId ? { ...sprint, collapsed: !sprint.collapsed } : sprint
      )
    )
  }

  // Task functions
  const openTaskDialog = (sprintId: string) => {
    setTaskDialogSprintId(sprintId)
    setNewTaskTitle("")
    setNewTaskStep("")
    setTaskDialogOpen(true)
  }

  const addTask = () => {
    if (!taskDialogSprintId || !newTaskTitle.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      step: newTaskStep.trim(),
      status: "todo",
      createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }

    setSprints(
      sprints.map((sprint) =>
        sprint.id === taskDialogSprintId ? { ...sprint, tasks: [...sprint.tasks, newTask] } : sprint
      )
    )
    setTaskDialogOpen(false)
    setNewTaskTitle("")
    setNewTaskStep("")
    setTaskDialogSprintId(null)
  }

  const setTaskStatus = (sprintId: string, taskId: string, status: TaskStatus) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              tasks: sprint.tasks.map((task) =>
                task.id === taskId ? { ...task, status } : task
              ),
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

  // Helpers
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

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "todo": return <Circle className="h-4 w-4" />
      case "doing": return <Clock className="h-4 w-4" />
      case "done": return <CheckCircle2 className="h-4 w-4" />
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
          <div className="flex items-center gap-4">
            {stats.total > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">{stats.completed}/{stats.total}</span>
                <span>tasks</span>
              </div>
            )}
            <Button 
              onClick={openSprintDialog} 
              className="h-9 px-4 bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Sprint
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Lista de sprints */}
        <div className="space-y-4">
          {sprints.map((sprint) => {
            const progress = getProgress(sprint.tasks)
            const completedCount = sprint.tasks.filter((t) => t.status === "done").length

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
                                    onClick={() => setTaskStatus(sprint.id, task.id, "todo")}
                                    className="flex items-center gap-2"
                                  >
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                    A fazer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setTaskStatus(sprint.id, task.id, "doing")}
                                    className="flex items-center gap-2"
                                  >
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    Fazendo
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setTaskStatus(sprint.id, task.id, "done")}
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
                                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                    {task.step}
                                  </p>
                                )}
                              </div>
                              
                              {/* Actions - RIGHT */}
                              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="text-xs font-mono text-muted-foreground mr-1">
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

                    {/* Botao para adicionar task */}
                    <Button
                      variant="outline"
                      className="w-full h-10 border-dashed text-muted-foreground hover:text-foreground hover:border-foreground/30"
                      onClick={() => openTaskDialog(sprint.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Task
                    </Button>
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
              <Button 
                onClick={openSprintDialog} 
                className="mt-4 bg-foreground text-background hover:bg-foreground/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Sprint
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Sprint Dialog */}
      <Dialog open={sprintDialogOpen} onOpenChange={setSprintDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Sprint</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Sprint</label>
              <Input
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSprint()}
                placeholder="Ex: Sprint 1 - Autenticacao"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSprintDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={addSprint}
              disabled={!newSprintName.trim()}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Criar Sprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titulo</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && newTaskTitle.trim() && addTask()}
                placeholder="O que precisa ser feito?"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descricao <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <Textarea
                value={newTaskStep}
                onChange={(e) => setNewTaskStep(e.target.value)}
                placeholder="Detalhes ou passos para completar..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={addTask}
              disabled={!newTaskTitle.trim()}
              className="bg-[oklch(0.72_0.19_145)] hover:bg-[oklch(0.65_0.19_145)] text-white"
            >
              Criar Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <label className="text-sm font-medium">Descricao <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <Textarea
                value={editValues.step}
                onChange={(e) => setEditValues({ ...editValues, step: e.target.value })}
                placeholder="Detalhes ou passos para completar..."
                rows={3}
                className="resize-none"
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
                  <SelectItem value="todo">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                      A fazer
                    </div>
                  </SelectItem>
                  <SelectItem value="doing">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      Fazendo
                    </div>
                  </SelectItem>
                  <SelectItem value="done">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[oklch(0.72_0.19_145)]" />
                      Feito
                    </div>
                  </SelectItem>
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
