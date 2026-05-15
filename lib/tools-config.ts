import {
  Terminal,
  Code,
  Database,
  Settings,
  Key,
  Hash,
  ArrowLeftRight,
  Palette,
  Type,
  FileJson,
  Sparkles,
  Image,
  FileCode,
  Search,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface Tool {
  id: string
  title: string
  description: string
  icon: LucideIcon
  url: string
  context: string
}

export interface ToolContext {
  id: string
  title: string
  icon: LucideIcon
  tools: Tool[]
}

export const toolContexts: ToolContext[] = [
  {
    id: "backend",
    title: "Backend & Laravel",
    icon: Terminal,
    tools: [
      {
        id: "password-secrets",
        title: "Gerador de Secrets",
        description: "App Key, JWT, UUID, senhas seguras",
        icon: Key,
        url: "/workspace/backend/secrets",
        context: "backend",
      },
      {
        id: "crypto",
        title: "Crypto Tool",
        description: "Bcrypt hash e verificação",
        icon: Hash,
        url: "/workspace/backend/crypto",
        context: "backend",
      },
      {
        id: "php-array-json",
        title: "PHP Array <=> JSON",
        description: "Converte entre PHP arrays e JSON",
        icon: ArrowLeftRight,
        url: "/workspace/backend/php-json",
        context: "backend",
      },
    ],
  },
  {
    id: "frontend",
    title: "Frontend & UI",
    icon: Code,
    tools: [
      {
        id: "tailwind-sorter",
        title: "Tailwind Class Sorter",
        description: "Organiza classes Tailwind por categoria",
        icon: Palette,
        url: "/workspace/frontend/tailwind",
        context: "frontend",
      },
      {
        id: "case-converter",
        title: "Case Converter",
        description: "camelCase, snake_case, PascalCase...",
        icon: Type,
        url: "/workspace/frontend/case",
        context: "frontend",
      },
      {
        id: "code-formatter",
        title: "Code Formatter",
        description: "Formata JS, TS, JSON, HTML, CSS",
        icon: FileCode,
        url: "/workspace/frontend/formatter",
        context: "frontend",
      },
    ],
  },
  {
    id: "data",
    title: "Data & API",
    icon: Database,
    tools: [
      {
        id: "json-explorer",
        title: "JSON Master Explorer",
        description: "Visualiza, busca e formata JSON",
        icon: FileJson,
        url: "/workspace/data/json",
        context: "data",
      },
      {
        id: "generator",
        title: "Generator Suite",
        description: "Pessoas, Empresas, Endereços BR",
        icon: Sparkles,
        url: "/workspace/data/generator",
        context: "data",
      },
      {
        id: "sql-beautifier",
        title: "SQL Beautifier",
        description: "Formata queries SQL",
        icon: Database,
        url: "/workspace/data/sql",
        context: "data",
      },
      {
        id: "base64-image",
        title: "Base64 Image Tool",
        description: "Converte imagens para Base64",
        icon: Image,
        url: "/workspace/data/base64",
        context: "data",
      },
    ],
  },
  {
    id: "utils",
    title: "Config & Utils",
    icon: Settings,
    tools: [
      {
        id: "dot-notation",
        title: "Dot-Notation Explorer",
        description: "Navega JSON com notação de ponto",
        icon: Search,
        url: "/workspace/utils/dot-notation",
        context: "utils",
      },
    ],
  },
]

export const allTools = toolContexts.flatMap((ctx) => ctx.tools)

export function getToolByUrl(url: string): Tool | undefined {
  return allTools.find((t) => t.url === url)
}

export function getContextById(id: string): ToolContext | undefined {
  return toolContexts.find((ctx) => ctx.id === id)
}

export function getBreadcrumbs(url: string): { label: string; href: string }[] {
  const tool = getToolByUrl(url)
  if (!tool) return [{ label: "Workspace", href: "/" }]
  
  const context = getContextById(tool.context)
  return [
    { label: "Workspace", href: "/" },
    { label: context?.title || "", href: "/" },
    { label: tool.title, href: tool.url },
  ]
}
