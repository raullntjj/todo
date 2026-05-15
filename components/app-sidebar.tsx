"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  CheckSquare,
  ArrowLeftRight,
  Type,
  Search,
  Image,
  Palette,
  Key,
  Hash,
  Database,
  Wrench,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const tools = [
  {
    title: "Todo List",
    url: "/",
    icon: CheckSquare,
  },
  {
    title: "PHP Array <=> JSON",
    url: "/tools/php-array-json",
    icon: ArrowLeftRight,
  },
  {
    title: "Case Converter",
    url: "/tools/case-converter",
    icon: Type,
  },
  {
    title: "Dot-Notation Explorer",
    url: "/tools/dot-notation",
    icon: Search,
  },
  {
    title: "Base64 Image",
    url: "/tools/base64-image",
    icon: Image,
  },
  {
    title: "Tailwind Sorter",
    url: "/tools/tailwind-sorter",
    icon: Palette,
  },
  {
    title: "Password & Secrets",
    url: "/tools/password-secrets",
    icon: Key,
  },
  {
    title: "Bcrypt Hash",
    url: "/tools/crypto",
    icon: Hash,
  },
  {
    title: "SQL Beautifier",
    url: "/tools/sql-beautifier",
    icon: Database,
  },
]

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
              <Wrench className="size-4 text-background" />
            </div>
            <span className="text-lg font-semibold tracking-tight">DevTools</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tools.map((tool) => (
                  <SidebarMenuItem key={tool.title}>
                    <SidebarMenuButton asChild isActive={pathname === tool.url}>
                      <Link href={tool.url}>
                        <tool.icon className="size-4" />
                        <span>{tool.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            {tools.find((t) => t.url === pathname)?.title || "DevTools"}
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
