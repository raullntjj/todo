"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, ChevronDown, ChevronRight, Calendar, Pencil, ChevronUp, Circle, Clock, CheckCircle2, Download, Upload, FolderOpen } from "lucide-react"
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

interface TaskGroup {
  id: string
  name: string
  tasks: Task[]
  createdAt: string
  collapsed: boolean
}

const STORAGE_KEY = "todo-task-groups"

export default function TodoApp() {
  const [groups, setGroups] = useState<TaskGroup[]>([])
  const [mounted, setMounted] = useState(false)
  
  // Dialog states
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [taskDialogGroupId, setTaskDialogGroupId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskStep, setNewTaskStep] = useState("")
  
  const [editingTask, setEditingTask] = useState<{ groupId: string; task: Task; taskIndex: number } | null>(null)
  const [editValues, setEditValues] = useState<{ title: string; step: string; status: TaskStatus }>({ title: "", step: "", status: "todo" })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setGroups(JSON.parse(stored))
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
    }
  }, [groups, mounted])

  // Group functions
  const openGroupDialog = () => {
    setNewGroupName("")
    setGroupDialogOpen(true)
  }

  const addGroup = () => {
    if (!newGroupName.trim()) return
    const newGroup: TaskGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      tasks: [],
      createdAt: new Date().toLocaleDateString("pt-BR"),
      collapsed: false,
    }
    setGroups([newGroup, ...groups])
    setGroupDialogOpen(false)
    setNewGroupName("")
  }

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter((group) => group.id !== groupId))
  }

  const toggleCollapse = (groupId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId ? { ...group, collapsed: !group.collapsed } : group
      )
    )
  }

  const moveGroupUp = (groupId: string) => {
    const index = groups.findIndex((g) => g.id === groupId)
    if (index <= 0) return
    const newGroups = [...groups]
    ;[newGroups[index - 1], newGroups[index]] = [newGroups[index], newGroups[index - 1]]
    setGroups(newGroups)
  }

  const moveGroupDown = (groupId: string) => {
    const index = groups.findIndex((g) => g.id === groupId)
    if (index < 0 || index >= groups.length - 1) return
    const newGroups = [...groups]
    ;[newGroups[index], newGroups[index + 1]] = [newGroups[index + 1], newGroups[index]]
    setGroups(newGroups)
  }

  // Task functions
  const openTaskDialog = (groupId: string) => {
    setTaskDialogGroupId(groupId)
    setNewTaskTitle("")
    setNewTaskStep("")
    setTaskDialogOpen(true)
  }

  const addTask = () => {
    if (!taskDialogGroupId || !newTaskTitle.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      step: newTaskStep.trim(),
      status: "todo",
      createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }

    setGroups(
      groups.map((group) =>
        group.id === taskDialogGroupId ? { ...group, tasks: [...group.tasks, newTask] } : group
      )
    )
    setTaskDialogOpen(false)
    setNewTaskTitle("")
    setNewTaskStep("")
    setTaskDialogGroupId(null)
  }

  const setTaskStatus = (groupId: string, taskId: string, status: TaskStatus) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              tasks: group.tasks.map((task) =>
                task.id === taskId ? { ...task, status } : task
              ),
            }
          : group
      )
    )
  }

  const deleteTask = (groupId: string, taskId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? { ...group, tasks: group.tasks.filter((task) => task.id !== taskId) }
          : group
      )
    )
  }

  const startEditTask = (groupId: string, task: Task, taskIndex: number) => {
    setEditingTask({ groupId, task, taskIndex })
    setEditValues({ title: task.title, step: task.step, status: task.status })
  }

  const saveEditTask = () => {
    if (!editingTask || !editValues.title.trim()) return
    setGroups(
      groups.map((group) =>
        group.id === editingTask.groupId
          ? {
              ...group,
              tasks: group.tasks.map((task) =>
                task.id === editingTask.task.id
                  ? { ...task, title: editValues.title.trim(), step: editValues.step.trim(), status: editValues.status }
                  : task
              ),
            }
          : group
      )
    )
    setEditingTask(null)
    setEditValues({ title: "", step: "", status: "todo" })
  }

  const closeEditDialog = () => {
    setEditingTask(null)
    setEditValues({ title: "", step: "", status: "todo" })
  }

  const moveTaskUp = (groupId: string, taskId: string) => {
    setGroups(
      groups.map((group) => {
        if (group.id !== groupId) return group
        const index = group.tasks.findIndex((t) => t.id === taskId)
        if (index <= 0) return group
        const newTasks = [...group.tasks]
        ;[newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]]
        return { ...group, tasks: newTasks }
      })
    )
  }

  const moveTaskDown = (groupId: string, taskId: string) => {
    setGroups(
      groups.map((group) => {
        if (group.id !== groupId) return group
        const index = group.tasks.findIndex((t) => t.id === taskId)
        if (index < 0 || index >= group.tasks.length - 1) return group
        const newTasks = [...group.tasks]
        ;[newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]]
        return { ...group, tasks: newTasks }
      })
    )
  }

  // Import/Export functions
  const exportData = () => {
    const data = JSON.stringify(groups, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tarefas-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string) as TaskGroup[]
          if (Array.isArray(imported)) {
            setGroups(imported)
          }
        } catch {
          alert("Erro ao importar arquivo. Verifique se o formato esta correto.")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // Helpers
  const getProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0
    return Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100)
  }

  const getTotalStats = () => {
    const allTasks = groups.flatMap((g) => g.tasks)
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
              <FolderOpen className="h-4 w-4 text-background" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Grupo de Tarefas</h1>
          </div>
          <div className="flex items-center gap-3">
            {stats.total > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">{stats.completed}/{stats.total}</span>
                <span>tasks</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button 
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={importData}
                title="Importar dados"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={exportData}
                title="Exportar dados"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={openGroupDialog} 
              className="h-9 px-4 bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Lista de grupos */}
        <div className="space-y-4">
          {groups.map((group, groupIndex) => {
            const progress = getProgress(group.tasks)
            const completedCount = group.tasks.filter((t) => t.status === "done").length

            return (
              <div 
                key={group.id} 
                className="group/card overflow-hidden rounded-lg border border-border bg-card"
              >
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
                          onClick={() => moveGroupUp(group.id)}
                          disabled={groupIndex === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-secondary"
                          onClick={() => moveGroupDown(group.id)}
                          disabled={groupIndex === groups.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <button
                        className="flex items-center gap-3 text-left"
                        onClick={() => toggleCollapse(group.id)}
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
                        onClick={() => deleteGroup(group.id)}
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
                        {group.tasks.map((task, taskIndex) => {
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
                                  onClick={() => moveTaskUp(group.id, task.id)}
                                  disabled={taskIndex === 0}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-secondary"
                                  onClick={() => moveTaskDown(group.id, task.id)}
                                  disabled={taskIndex === group.tasks.length - 1}
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
                                    onClick={() => setTaskStatus(group.id, task.id, "todo")}
                                    className="flex items-center gap-2"
                                  >
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                    A fazer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setTaskStatus(group.id, task.id, "doing")}
                                    className="flex items-center gap-2"
                                  >
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    Fazendo
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setTaskStatus(group.id, task.id, "done")}
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
                                  onClick={() => startEditTask(group.id, task, taskIndex)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => deleteTask(group.id, task.id)}
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
                      onClick={() => openTaskDialog(group.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Task
                    </Button>
                  </div>
                )}
              </div>
            )
          })}

          {groups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum grupo criado</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Crie um grupo para organizar suas tasks
              </p>
              <Button 
                onClick={openGroupDialog} 
                className="mt-4 bg-foreground text-background hover:bg-foreground/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Grupo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Grupo de Tarefas</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Grupo</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGroup()}
                placeholder="Ex: Autenticacao, Frontend, Backend..."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={addGroup}
              disabled={!newGroupName.trim()}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Criar Grupo
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
