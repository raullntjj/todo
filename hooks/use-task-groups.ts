"use client"

import { useState, useEffect, useCallback } from "react"
import type { Task, TaskGroup, TaskStatus, LegacySprint, LegacyTask } from "@/types/todo"

const STORAGE_KEY = "todo-task-groups"
const LEGACY_STORAGE_KEY = "todo-sprints"

// Migrate legacy task (with completed boolean) to new format (with status)
function migrateTask(task: LegacyTask): Task {
  let status: TaskStatus = "todo"
  
  if (task.status) {
    status = task.status
  } else if (task.completed === true) {
    status = "done"
  }
  
  return {
    id: task.id,
    title: task.title,
    step: task.step,
    status,
    createdAt: task.createdAt,
  }
}

// Migrate legacy sprint to task group
function migrateSprint(sprint: LegacySprint): TaskGroup {
  return {
    id: sprint.id,
    name: sprint.name,
    tasks: sprint.tasks.map(migrateTask),
    createdAt: sprint.createdAt,
    collapsed: sprint.collapsed,
  }
}

// Check and migrate legacy data
function migrateFromLegacy(): TaskGroup[] | null {
  if (typeof window === "undefined") return null
  
  const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!legacyData) return null
  
  try {
    const sprints = JSON.parse(legacyData) as LegacySprint[]
    if (!Array.isArray(sprints)) return null
    
    const migrated = sprints.map(migrateSprint)
    
    // Save to new key and remove legacy
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    
    console.log("[Migration] Successfully migrated", migrated.length, "groups from legacy format")
    return migrated
  } catch {
    console.error("[Migration] Failed to migrate legacy data")
    return null
  }
}

export function useTaskGroups() {
  const [groups, setGroups] = useState<TaskGroup[]>([])
  const [mounted, setMounted] = useState(false)

  // Load data on mount (with migration support)
  useEffect(() => {
    // First try to migrate from legacy format
    const migrated = migrateFromLegacy()
    if (migrated) {
      setGroups(migrated)
      setMounted(true)
      return
    }
    
    // Otherwise load from new format
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setGroups(JSON.parse(stored))
      } catch {
        console.error("[Storage] Failed to parse stored data")
      }
    }
    setMounted(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
    }
  }, [groups, mounted])

  // Group operations
  const addGroup = useCallback((name: string) => {
    if (!name.trim()) return
    const newGroup: TaskGroup = {
      id: Date.now().toString(),
      name: name.trim(),
      tasks: [],
      createdAt: new Date().toLocaleDateString("pt-BR"),
      collapsed: false,
    }
    setGroups((prev) => [newGroup, ...prev])
  }, [])

  const deleteGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId))
  }, [])

  const toggleCollapse = useCallback((groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g))
    )
  }, [])

  const moveGroupUp = useCallback((groupId: string) => {
    setGroups((prev) => {
      const index = prev.findIndex((g) => g.id === groupId)
      if (index <= 0) return prev
      const newGroups = [...prev]
      ;[newGroups[index - 1], newGroups[index]] = [newGroups[index], newGroups[index - 1]]
      return newGroups
    })
  }, [])

  const moveGroupDown = useCallback((groupId: string) => {
    setGroups((prev) => {
      const index = prev.findIndex((g) => g.id === groupId)
      if (index < 0 || index >= prev.length - 1) return prev
      const newGroups = [...prev]
      ;[newGroups[index], newGroups[index + 1]] = [newGroups[index + 1], newGroups[index]]
      return newGroups
    })
  }, [])

  // Task operations
  const addTask = useCallback((groupId: string, title: string, step: string) => {
    if (!title.trim()) return
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      step: step.trim(),
      status: "todo",
      createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, tasks: [...g.tasks, newTask] } : g))
    )
  }, [])

  const updateTask = useCallback(
    (groupId: string, taskId: string, updates: Partial<Pick<Task, "title" | "step" | "status">>) => {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                tasks: g.tasks.map((t) =>
                  t.id === taskId ? { ...t, ...updates } : t
                ),
              }
            : g
        )
      )
    },
    []
  )

  const deleteTask = useCallback((groupId: string, taskId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) } : g
      )
    )
  }, [])

  const setTaskStatus = useCallback((groupId: string, taskId: string, status: TaskStatus) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)) }
          : g
      )
    )
  }, [])

  const moveTaskUp = useCallback((groupId: string, taskId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        const index = g.tasks.findIndex((t) => t.id === taskId)
        if (index <= 0) return g
        const newTasks = [...g.tasks]
        ;[newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]]
        return { ...g, tasks: newTasks }
      })
    )
  }, [])

  const moveTaskDown = useCallback((groupId: string, taskId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        const index = g.tasks.findIndex((t) => t.id === taskId)
        if (index < 0 || index >= g.tasks.length - 1) return g
        const newTasks = [...g.tasks]
        ;[newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]]
        return { ...g, tasks: newTasks }
      })
    )
  }, [])

  // Import/Export
  const exportData = useCallback(() => {
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
  }, [groups])

  const importData = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string)
          if (Array.isArray(imported)) {
            // Check if it's legacy format and migrate
            const needsMigration = imported.some(
              (g) => g.tasks?.some((t: LegacyTask) => "completed" in t && !("status" in t))
            )
            if (needsMigration) {
              const migrated = imported.map(migrateSprint)
              setGroups(migrated)
            } else {
              setGroups(imported as TaskGroup[])
            }
          }
        } catch {
          alert("Erro ao importar arquivo. Verifique se o formato esta correto.")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [])

  // Stats
  const getProgress = useCallback((tasks: Task[]) => {
    if (tasks.length === 0) return 0
    return Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100)
  }, [])

  const getTotalStats = useCallback(() => {
    const allTasks = groups.flatMap((g) => g.tasks)
    const completed = allTasks.filter((t) => t.status === "done").length
    return { total: allTasks.length, completed }
  }, [groups])

  return {
    groups,
    mounted,
    // Group operations
    addGroup,
    deleteGroup,
    toggleCollapse,
    moveGroupUp,
    moveGroupDown,
    // Task operations
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    moveTaskUp,
    moveTaskDown,
    // Import/Export
    exportData,
    importData,
    // Stats
    getProgress,
    getTotalStats,
  }
}
