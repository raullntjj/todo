"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Wrench, Home } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { toolContexts, getBreadcrumbs } from "@/lib/tools-config"
import { CommandPalette } from "@/components/command-palette"
import { cn } from "@/lib/utils"

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [openContexts, setOpenContexts] = useState<string[]>([])
  const [commandOpen, setCommandOpen] = useState(false)
  const breadcrumbs = getBreadcrumbs(pathname)

  // Auto-expand active context
  useEffect(() => {
    const activeContext = toolContexts.find((ctx) =>
      ctx.tools.some((t) => t.url === pathname)
    )
    if (activeContext && !openContexts.includes(activeContext.id)) {
      setOpenContexts((prev) => [...prev, activeContext.id])
    }
  }, [pathname, openContexts])

  // Ctrl+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const toggleContext = useCallback((contextId: string) => {
    setOpenContexts((prev) =>
      prev.includes(contextId)
        ? prev.filter((id) => id !== contextId)
        : [...prev, contextId]
    )
  }, [])

  const handleSelectTool = useCallback(
    (url: string) => {
      setCommandOpen(false)
      router.push(url)
    },
    [router]
  )

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3 px-2 py-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
              <Wrench className="size-4 text-background" />
            </div>
            <span className="text-lg font-semibold tracking-tight">DevTools</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          {/* Home Link */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="size-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <Separator className="my-4" />

          {/* Context Menus */}
          <nav className="space-y-1">
            {toolContexts.map((context) => {
              const isOpen = openContexts.includes(context.id)
              const hasActiveTool = context.tools.some((t) => t.url === pathname)

              return (
                <div key={context.id}>
                  <button
                    onClick={() => toggleContext(context.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      hasActiveTool && "text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <context.icon className="size-4" />
                      <span>{context.title}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                          {context.tools.map((tool) => {
                            const isActive = pathname === tool.url
                            return (
                              <Link
                                key={tool.id}
                                href={tool.url}
                                className={cn(
                                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : "text-muted-foreground"
                                )}
                              >
                                <tool.icon className="size-4" />
                                <span>{tool.title}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </nav>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="size-3 text-muted-foreground" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium">{crumb.label}</span>
                ) : (
                  <span className="text-muted-foreground">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>

          {/* Search Shortcut */}
          <button
            onClick={() => setCommandOpen(true)}
            className="ml-auto flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <span>Buscar ferramentas...</span>
            <kbd className="pointer-events-none hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs sm:inline">
              ⌘K
            </kbd>
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </SidebarInset>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onSelect={handleSelectTool}
      />
    </SidebarProvider>
  )
}
