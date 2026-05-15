"use client"

import { useState } from "react"
import { format } from "sql-formatter"
import { Copy, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const SQL_DIALECTS = [
  { value: "sql", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "sqlite", label: "SQLite" },
  { value: "tsql", label: "T-SQL (SQL Server)" },
  { value: "plsql", label: "PL/SQL (Oracle)" },
] as const

type SqlDialect = typeof SQL_DIALECTS[number]["value"]

export function SqlBeautifier() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [dialect, setDialect] = useState<SqlDialect>("sql")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFormat = () => {
    setError(null)
    try {
      const formatted = format(input, {
        language: dialect,
        tabWidth: 2,
        useTabs: false,
        keywordCase: "upper",
        dataTypeCase: "upper",
        functionCase: "upper",
        identifierCase: "preserve",
        indentStyle: "standard",
        logicalOperatorNewline: "before",
        expressionWidth: 50,
        linesBetweenQueries: 2,
        denseOperators: false,
        newlineBeforeSemicolon: false,
      })
      setOutput(formatted)
    } catch (err) {
      setError("Failed to format SQL. Please check your syntax.")
      setOutput("")
    }
  }

  const handleMinify = () => {
    setError(null)
    try {
      // Simple minification: remove extra whitespace and newlines
      const minified = input
        .replace(/\s+/g, " ")
        .replace(/\s*([(),;])\s*/g, "$1")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .trim()
      setOutput(minified)
    } catch {
      setError("Failed to minify SQL.")
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <Label>SQL Dialect</Label>
          <Select value={dialect} onValueChange={(v) => setDialect(v as SqlDialect)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SQL_DIALECTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sql-input">Input SQL</Label>
          <Textarea
            id="sql-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`SELECT users.id, users.name, orders.total FROM users LEFT JOIN orders ON users.id = orders.user_id WHERE users.status = 'active' AND orders.created_at > '2024-01-01' ORDER BY orders.total DESC LIMIT 10;`}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Formatted Output</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              disabled={!output}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Formatted SQL will appear here..."
            className={`min-h-[300px] font-mono text-sm ${error ? "border-destructive" : ""}`}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleFormat} disabled={!input.trim()} className="flex-1">
          <Sparkles className="mr-2 size-4" />
          Beautify SQL
        </Button>
        <Button onClick={handleMinify} disabled={!input.trim()} variant="outline" className="flex-1">
          Minify SQL
        </Button>
      </div>
    </div>
  )
}
