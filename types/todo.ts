export type TaskStatus = "todo" | "doing" | "done"

export interface Task {
  id: string
  title: string
  step: string
  status: TaskStatus
  createdAt: string
}

export interface TaskGroup {
  id: string
  name: string
  tasks: Task[]
  createdAt: string
  collapsed: boolean
}

// Legacy types for migration
export interface LegacyTask {
  id: string
  title: string
  step: string
  completed?: boolean
  status?: TaskStatus
  createdAt: string
}

export interface LegacySprint {
  id: string
  name: string
  tasks: LegacyTask[]
  createdAt: string
  collapsed: boolean
}

export interface EditingTask {
  groupId: string
  task: Task
  taskIndex: number
}

export interface TaskFormValues {
  title: string
  step: string
  status: TaskStatus
}
