"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ArrowRight } from "lucide-react"
import { toolContexts, allTools, type Tool } from "@/lib/tools-config"
import { cn } from "@/lib/utils"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}

export function CommandPalette({ open, onOpenChange, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredTools = useMemo(() => {
    if (!query.trim()) return allTools
    const lowerQuery = query.toLowerCase()
    return allTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery)
    )
  }, [query])

  const groupedTools = useMemo(() => {
    const groups: { context: string; contextTitle: string; tools: Tool[] }[] = []
    
    for (const ctx of toolContexts) {
      const contextTools = filteredTools.filter((t) => t.context === ctx.id)
      if (contextTools.length > 0) {
        groups.push({
          context: ctx.id,
          contextTitle: ctx.title,
          tools: contextTools,
        })
      }
    }
    return groups
  }, [filteredTools])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Reset query when closing
  useEffect(() => {
    if (!open) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onOpenChange(false)
          break
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, filteredTools.length - 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case "Enter":
          e.preventDefault()
          if (filteredTools[selectedIndex]) {
            onSelect(filteredTools[selectedIndex].url)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange, onSelect, filteredTools, selectedIndex])

  const handleSelect = useCallback(
    (tool: Tool) => {
      onSelect(tool.url)
    },
    [onSelect]
  )

  // Get flat index for a tool
  const getFlatIndex = useCallback(
    (tool: Tool) => {
      return filteredTools.findIndex((t) => t.id === tool.id)
    },
    [filteredTools]
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search className="size-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar ferramentas..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {groupedTools.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma ferramenta encontrada
                  </div>
                ) : (
                  groupedTools.map((group) => (
                    <div key={group.context} className="mb-2">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {group.contextTitle}
                      </div>
                      {group.tools.map((tool) => {
                        const flatIndex = getFlatIndex(tool)
                        const isSelected = flatIndex === selectedIndex

                        return (
                          <button
                            key={tool.id}
                            onClick={() => handleSelect(tool)}
                            onMouseEnter={() => setSelectedIndex(flatIndex)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-muted"
                            )}
                          >
                            <tool.icon className="size-5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{tool.title}</div>
                              <div className="truncate text-sm text-muted-foreground">
                                {tool.description}
                              </div>
                            </div>
                            {isSelected && (
                              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑</kbd>
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↓</kbd>
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">↵</kbd>
                  selecionar
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
