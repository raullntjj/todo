"use client"

import { useState } from "react"
import { useTaskGroups } from "@/hooks/use-task-groups"
import type { Task, TaskStatus, EditingTask, TaskFormValues } from "@/types/todo"
import { Header } from "@/components/todo/header"
import { TaskGroupCard } from "@/components/todo/task-group-card"
import { EmptyState } from "@/components/todo/empty-state"
import { CreateGroupDialog, CreateTaskDialog, EditTaskDialog } from "@/components/todo/dialogs"

export default function TodoApp() {
  const {
    groups,
    mounted,
    addGroup,
    deleteGroup,
    toggleCollapse,
    moveGroupUp,
    moveGroupDown,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    moveTaskUp,
    moveTaskDown,
    exportData,
    importData,
    getProgress,
    getTotalStats,
  } = useTaskGroups()

  // Dialog states
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [taskDialogGroupId, setTaskDialogGroupId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskStep, setNewTaskStep] = useState("")

  const [editingTask, setEditingTask] = useState<EditingTask | null>(null)
  const [editValues, setEditValues] = useState<TaskFormValues>({
    title: "",
    step: "",
    status: "todo",
  })

  // Group dialog handlers
  const openGroupDialog = () => {
    setNewGroupName("")
    setGroupDialogOpen(true)
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return
    addGroup(newGroupName)
    setGroupDialogOpen(false)
    setNewGroupName("")
  }

  // Task dialog handlers
  const openTaskDialog = (groupId: string) => {
    setTaskDialogGroupId(groupId)
    setNewTaskTitle("")
    setNewTaskStep("")
    setTaskDialogOpen(true)
  }

  const handleCreateTask = () => {
    if (!taskDialogGroupId || !newTaskTitle.trim()) return
    addTask(taskDialogGroupId, newTaskTitle, newTaskStep)
    setTaskDialogOpen(false)
    setNewTaskTitle("")
    setNewTaskStep("")
    setTaskDialogGroupId(null)
  }

  // Edit task handlers
  const handleStartEditTask = (groupId: string, task: Task, taskIndex: number) => {
    setEditingTask({ groupId, task, taskIndex })
    setEditValues({ title: task.title, step: task.step, status: task.status })
  }

  const handleSaveEditTask = () => {
    if (!editingTask || !editValues.title.trim()) return
    updateTask(editingTask.groupId, editingTask.task.id, {
      title: editValues.title.trim(),
      step: editValues.step.trim(),
      status: editValues.status,
    })
    setEditingTask(null)
    setEditValues({ title: "", step: "", status: "todo" })
  }

  const handleCloseEditDialog = (open: boolean) => {
    if (!open) {
      setEditingTask(null)
      setEditValues({ title: "", step: "", status: "todo" })
    }
  }

  if (!mounted) return null

  const stats = getTotalStats()

  return (
    <main className="min-h-screen bg-background">
      <Header
        stats={stats}
        onImport={importData}
        onExport={exportData}
        onNewGroup={openGroupDialog}
      />

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="space-y-4">
          {groups.map((group, groupIndex) => (
            <TaskGroupCard
              key={group.id}
              group={group}
              groupIndex={groupIndex}
              totalGroups={groups.length}
              onToggleCollapse={toggleCollapse}
              onMoveGroupUp={moveGroupUp}
              onMoveGroupDown={moveGroupDown}
              onDeleteGroup={deleteGroup}
              onAddTask={openTaskDialog}
              onStatusChange={setTaskStatus}
              onMoveTaskUp={moveTaskUp}
              onMoveTaskDown={moveTaskDown}
              onEditTask={handleStartEditTask}
              onDeleteTask={deleteTask}
              getProgress={getProgress}
            />
          ))}

          {groups.length === 0 && <EmptyState onCreateGroup={openGroupDialog} />}
        </div>
      </div>

      {/* Dialogs */}
      <CreateGroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        groupName={newGroupName}
        onGroupNameChange={setNewGroupName}
        onSubmit={handleCreateGroup}
      />

      <CreateTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        taskTitle={newTaskTitle}
        taskStep={newTaskStep}
        onTitleChange={setNewTaskTitle}
        onStepChange={setNewTaskStep}
        onSubmit={handleCreateTask}
      />

      <EditTaskDialog
        open={!!editingTask}
        onOpenChange={handleCloseEditDialog}
        editingTask={editingTask}
        editValues={editValues}
        onValuesChange={setEditValues}
        onSubmit={handleSaveEditTask}
      />
    </main>
  )
}
