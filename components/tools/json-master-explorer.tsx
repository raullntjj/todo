"use client"

import { useState, useCallback, useMemo } from "react"
import { JSONTree } from "react-json-tree"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Copy, 
  Check, 
  Minimize2, 
  Sparkles, 
  Search, 
  Trash2, 
  Download,
  Code,
  FileJson
} from "lucide-react"

const darkTheme = {
  scheme: "custom",
  base00: "transparent",
  base01: "#1e1e1e",
  base02: "#2d2d2d",
  base03: "#525252",
  base04: "#737373",
  base05: "#a3a3a3",
  base06: "#d4d4d4",
  base07: "#f5f5f5",
  base08: "#f87171",
  base09: "#fb923c",
  base0A: "#facc15",
  base0B: "#4ade80",
  base0C: "#22d3ee",
  base0D: "#60a5fa",
  base0E: "#c084fc",
  base0F: "#fb7185",
}

function getPath(keyPath: (string | number)[]): string {
  return [...keyPath].reverse().map((key, index, arr) => {
    if (typeof key === "number") {
      return `[${key}]`
    }
    if (index === 0) return key
    const prevKey = arr[index - 1]
    if (typeof prevKey === "number") return key
    return `.${key}`
  }).join("")
}

function removeEmptyValues(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(removeEmptyValues).filter(v => v !== null && v !== undefined && v !== "")
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== "") {
        const cleaned = removeEmptyValues(value)
        if (cleaned !== null && cleaned !== undefined && cleaned !== "") {
          result[key] = cleaned
        }
      }
    }
    return Object.keys(result).length > 0 ? result : null
  }
  return obj
}

function filterJSON(obj: unknown, searchTerm: string, currentPath: string = ""): Set<string> {
  const matches = new Set<string>()
  const term = searchTerm.toLowerCase()
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const childMatches = filterJSON(item, searchTerm, `${currentPath}[${index}]`)
      childMatches.forEach(m => matches.add(m))
    })
  } else if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key
      
      if (key.toLowerCase().includes(term)) {
        matches.add(newPath)
      }
      
      if (typeof value === "string" && value.toLowerCase().includes(term)) {
        matches.add(newPath)
      } else if (typeof value === "number" && value.toString().includes(term)) {
        matches.add(newPath)
      }
      
      const childMatches = filterJSON(value, searchTerm, newPath)
      childMatches.forEach(m => matches.add(m))
    }
  }
  
  return matches
}

function jsonToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ""
  
  const headers = new Set<string>()
  data.forEach(item => {
    Object.keys(item).forEach(key => headers.add(key))
  })
  
  const headerArray = Array.from(headers)
  const rows = data.map(item => {
    return headerArray.map(header => {
      const value = item[header]
      if (value === null || value === undefined) return ""
      if (typeof value === "object") return JSON.stringify(value)
      const str = String(value)
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(",")
  })
  
  return [headerArray.join(","), ...rows].join("\n")
}

export function JSONMasterExplorer() {
  const [input, setInput] = useState("")
  const [parsedJSON, setParsedJSON] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [copied, setCopied] = useState(false)
  const [indentation, setIndentation] = useState<2 | 4>(2)
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  const parseJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      setParsedJSON(parsed)
      setError(null)
    } catch {
      setError("JSON inválido")
      setParsedJSON(null)
    }
  }, [input])

  const beautify = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed, null, indentation))
      setParsedJSON(parsed)
      setError(null)
    } catch {
      setError("JSON inválido")
    }
  }, [input, indentation])

  const minify = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed))
      setParsedJSON(parsed)
      setError(null)
    } catch {
      setError("JSON inválido")
    }
  }, [input])

  const cleanEmpty = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      const cleaned = removeEmptyValues(parsed)
      setInput(JSON.stringify(cleaned, null, indentation))
      setParsedJSON(cleaned)
      setError(null)
    } catch {
      setError("JSON inválido")
    }
  }, [input, indentation])

  const escapeJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(JSON.stringify(parsed)))
      setError(null)
    } catch {
      setError("JSON inválido")
    }
  }, [input])

  const unescapeJSON = useCallback(() => {
    try {
      const unescaped = JSON.parse(input)
      if (typeof unescaped === "string") {
        const parsed = JSON.parse(unescaped)
        setInput(JSON.stringify(parsed, null, indentation))
        setParsedJSON(parsed)
        setError(null)
      } else {
        setError("Input não é uma string escapada")
      }
    } catch {
      setError("JSON inválido")
    }
  }, [input, indentation])

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(input)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [input])

  const copyPath = useCallback(async (path: string) => {
    await navigator.clipboard.writeText(path)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }, [])

  const exportCSV = useCallback(() => {
    if (!parsedJSON || !Array.isArray(parsedJSON)) return
    
    const csv = jsonToCSV(parsedJSON as Record<string, unknown>[])
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }, [parsedJSON])

  const matchedPaths = useMemo(() => {
    if (!parsedJSON || !searchTerm.trim()) return new Set<string>()
    return filterJSON(parsedJSON, searchTerm.trim())
  }, [parsedJSON, searchTerm])

  const isValid = useMemo(() => {
    if (!input.trim()) return null
    try {
      JSON.parse(input)
      return true
    } catch {
      return false
    }
  }, [input])

  const isArray = Array.isArray(parsedJSON)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">JSON Master Explorer</h1>
        <p className="text-muted-foreground">Formatação, busca e inspeção profunda de objetos JSON</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Editor</Label>
                  {isValid !== null && (
                    <Badge variant={isValid ? "default" : "destructive"} className="text-xs">
                      {isValid ? "Válido" : "Erro de Sintaxe"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 rounded-md border p-1">
                  <Button
                    variant={indentation === 2 ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setIndentation(2)}
                  >
                    2 espaços
                  </Button>
                  <Button
                    variant={indentation === 4 ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setIndentation(4)}
                  >
                    4 espaços
                  </Button>
                </div>
              </div>

              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setError(null)
                }}
                placeholder="Cole seu JSON aqui..."
                className="h-80 font-mono text-sm resize-none"
              />

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={beautify} size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Beautify
                </Button>
                <Button onClick={minify} size="sm" variant="outline">
                  <Minimize2 className="mr-2 h-4 w-4" />
                  Minify
                </Button>
                <Button onClick={cleanEmpty} size="sm" variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Vazios
                </Button>
                <Button onClick={escapeJSON} size="sm" variant="outline">
                  <Code className="mr-2 h-4 w-4" />
                  Escape
                </Button>
                <Button onClick={unescapeJSON} size="sm" variant="outline">
                  <FileJson className="mr-2 h-4 w-4" />
                  Unescape
                </Button>
                <Button onClick={copyToClipboard} size="sm" variant="outline">
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </div>

            {/* Right Column - Tree View */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Label className="text-sm font-medium shrink-0">Visualizador</Label>
                  {isArray && parsedJSON && (
                    <Button onClick={exportCSV} size="sm" variant="outline" className="ml-auto">
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar chaves ou valores..."
                  className="pl-10"
                />
              </div>

              {searchTerm && matchedPaths.size > 0 && (
                <p className="text-xs text-muted-foreground">
                  {matchedPaths.size} resultado(s) encontrado(s)
                </p>
              )}

              <div className="h-80 overflow-auto rounded-lg border bg-muted/30 p-4">
                {parsedJSON ? (
                  <JSONTree
                    data={parsedJSON}
                    theme={darkTheme}
                    invertTheme={false}
                    hideRoot
                    shouldExpandNodeInitially={() => true}
                    labelRenderer={(keyPath) => {
                      const path = getPath(keyPath)
                      const isMatch = searchTerm && matchedPaths.has(path)
                      const isCopied = copiedPath === path
                      
                      return (
                        <span
                          className={`cursor-pointer hover:underline ${isMatch ? "bg-yellow-500/30 px-1 rounded" : ""}`}
                          onClick={() => copyPath(path)}
                          title={`Clique para copiar: ${path}`}
                        >
                          {keyPath[0]}
                          {isCopied && (
                            <span className="ml-1 text-xs text-success">copiado!</span>
                          )}
                        </span>
                      )
                    }}
                    valueRenderer={(raw, value) => {
                      const strValue = String(value)
                      const isMatch = searchTerm && strValue.toLowerCase().includes(searchTerm.toLowerCase())
                      
                      return (
                        <span className={isMatch ? "bg-yellow-500/30 px-1 rounded" : ""}>
                          {raw}
                        </span>
                      )
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Cole um JSON válido para visualizar a árvore
                  </div>
                )}
              </div>

              <Button onClick={parseJSON} className="w-full" disabled={!input.trim()}>
                Analisar JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
