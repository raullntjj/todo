"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, ChevronDown, ChevronRight, Zap, Calendar } from "lucide-react"

interface Task {
  id: string
  title: string
  step: string
  completed: boolean
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
      completed: false,
      createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }

    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId ? { ...sprint, tasks: [...sprint.tasks, newTask] } : sprint
      )
    )
    setNewTaskInputs({ ...newTaskInputs, [sprintId]: { title: "", step: "" } })
  }

  const toggleTask = (sprintId: string, taskId: string) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              tasks: sprint.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
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

  const getProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0
    return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
  }

  const getTotalStats = () => {
    const allTasks = sprints.flatMap((s) => s.tasks)
    const completed = allTasks.filter((t) => t.completed).length
    return { total: allTasks.length, completed }
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
                        {sprint.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`group flex items-start gap-4 py-3 transition-colors ${
                              task.completed ? "opacity-50" : ""
                            }`}
                          >
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => toggleTask(sprint.id, task.id)}
                              className="mt-0.5 border-muted-foreground data-[state=checked]:bg-[oklch(0.72_0.19_145)] data-[state=checked]:border-[oklch(0.72_0.19_145)]"
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium leading-tight ${
                                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
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
                            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="text-xs font-mono text-muted-foreground">
                                {task.createdAt}
                              </span>
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
                        ))}
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
    </main>
  )
}
