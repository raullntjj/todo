"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FolderPlus, ChevronDown, ChevronRight } from "lucide-react"

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

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSprints(JSON.parse(stored))
    }
    setMounted(true)
  }, [])

  // Save to localStorage
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

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">TODO Sprints</h1>

        {/* Criar nova sprint */}
        <div className="mb-6 flex gap-2">
          <Input
            placeholder="Nome da sprint (ex: Sprint 1, Semana 20...)"
            value={newSprintName}
            onChange={(e) => setNewSprintName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSprint()}
          />
          <Button onClick={addSprint} size="icon">
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista de sprints */}
        <div className="space-y-4">
          {sprints.map((sprint) => {
            const progress = getProgress(sprint.tasks)
            const input = newTaskInputs[sprint.id] || { title: "", step: "" }

            return (
              <Card key={sprint.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex cursor-pointer items-center gap-2"
                      onClick={() => toggleCollapse(sprint.id)}
                    >
                      {sprint.collapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <CardTitle className="text-lg">{sprint.name}</CardTitle>
                      <Badge variant="secondary" className="ml-2">
                        {sprint.tasks.filter((t) => t.completed).length}/{sprint.tasks.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{sprint.createdAt}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteSprint(sprint.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardHeader>

                {!sprint.collapsed && (
                  <CardContent className="pt-0">
                    {/* Lista de tasks */}
                    <div className="mb-4 space-y-2">
                      {sprint.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                            task.completed ? "bg-muted/50" : "bg-background"
                          }`}
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(sprint.id, task.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium ${
                                task.completed ? "text-muted-foreground line-through" : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.step && (
                              <p className="mt-1 text-sm text-muted-foreground">{task.step}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{task.createdAt}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteTask(sprint.id, task.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Adicionar task */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nova task..."
                          value={input.title}
                          onChange={(e) =>
                            setNewTaskInputs({
                              ...newTaskInputs,
                              [sprint.id]: { ...input, title: e.target.value },
                            })
                          }
                          onKeyDown={(e) => e.key === "Enter" && addTask(sprint.id)}
                          className="flex-1"
                        />
                        <Button onClick={() => addTask(sprint.id)} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Passo/descrição (opcional)"
                        value={input.step}
                        onChange={(e) =>
                          setNewTaskInputs({
                            ...newTaskInputs,
                            [sprint.id]: { ...input, step: e.target.value },
                          })
                        }
                        onKeyDown={(e) => e.key === "Enter" && addTask(sprint.id)}
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}

          {sprints.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p>Nenhuma sprint ainda.</p>
              <p className="text-sm">Crie uma sprint para começar!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
