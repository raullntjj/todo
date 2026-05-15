"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, ArrowRight, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toolContexts, allTools, type Tool } from "@/lib/tools-config"
import { cn } from "@/lib/utils"

const RECENT_TOOLS_KEY = "devtools-recent"
const MAX_RECENT = 3

function getRecentTools(): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(RECENT_TOOLS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function Dashboard() {
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setRecentIds(getRecentTools())
  }, [])

  const recentTools = recentIds
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is Tool => t !== undefined)

  const filteredContexts = searchQuery.trim()
    ? toolContexts
        .map((ctx) => ({
          ...ctx,
          tools: ctx.tools.filter(
            (t) =>
              t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.description.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((ctx) => ctx.tools.length > 0)
    : toolContexts

  const handleToolClick = useCallback((toolId: string) => {
    const current = getRecentTools()
    const updated = [toolId, ...current.filter((id) => id !== toolId)].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(updated))
    setRecentIds(updated)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">DevTools Workspace</h1>
        <p className="text-muted-foreground">
          Ferramentas para desenvolvedores. Pressione{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
            ⌘K
          </kbd>{" "}
          para busca rápida.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filtrar ferramentas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Recently Used */}
      {mounted && recentTools.length > 0 && !searchQuery && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="size-4" />
            <span>Usadas Recentemente</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {recentTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.url}
                onClick={() => handleToolClick(tool.id)}
                className="group"
              >
                <Card className="transition-colors hover:border-foreground/20 hover:bg-muted/50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                      <tool.icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{tool.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {tool.description}
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Tools by Context */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {filteredContexts.map((context) => (
          <motion.section key={context.id} variants={item} className="space-y-4">
            <div className="flex items-center gap-2">
              <context.icon className="size-5" />
              <h2 className="text-lg font-semibold">{context.title}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {context.tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.url}
                  onClick={() => handleToolClick(tool.id)}
                  className="group"
                >
                  <Card
                    className={cn(
                      "h-full transition-all duration-200",
                      "hover:border-foreground/20 hover:bg-muted/50 hover:shadow-md"
                    )}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                        <tool.icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{tool.title}</h3>
                          <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.section>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredContexts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Nenhuma ferramenta encontrada para &quot;{searchQuery}&quot;
          </p>
        </div>
      )}
    </div>
  )
}
