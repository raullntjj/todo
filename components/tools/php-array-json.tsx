"use client"

import { useState } from "react"
import { ArrowLeftRight, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

function phpArrayToJson(phpArray: string): string {
  try {
    let result = phpArray.trim()
    // Convert PHP array syntax to JSON
    result = result.replace(/array\s*\(/gi, '[')
    result = result.replace(/\)\s*$/g, ']')
    result = result.replace(/\)/g, ']')
    result = result.replace(/\[\s*'/g, '["')
    result = result.replace(/'\s*=>\s*'/g, '": "')
    result = result.replace(/'\s*=>\s*/g, '": ')
    result = result.replace(/=>\s*'/g, ': "')
    result = result.replace(/'\s*,/g, '",')
    result = result.replace(/'\s*\]/g, '"]')
    result = result.replace(/,\s*\]/g, ']')
    // Handle numeric keys
    result = result.replace(/\[\s*(\d+)\s*=>/g, '[')
    // Clean up
    result = result.replace(/;\s*$/, '')
    
    // Try to parse and re-format
    const parsed = JSON.parse(result)
    return JSON.stringify(parsed, null, 2)
  } catch {
    // Alternative approach for simple arrays
    try {
      let cleaned = phpArray.trim()
      cleaned = cleaned.replace(/^\[/, '').replace(/\]$/, '')
      cleaned = cleaned.replace(/;$/, '')
      
      const pairs: Record<string, unknown> = {}
      const regex = /'([^']+)'\s*=>\s*(?:'([^']*)'|(\d+)|(\[[\s\S]*?\]))/g
      let match
      
      while ((match = regex.exec(cleaned)) !== null) {
        const key = match[1]
        const value = match[2] ?? match[3] ?? match[4]
        pairs[key] = isNaN(Number(value)) ? value : Number(value)
      }
      
      return JSON.stringify(pairs, null, 2)
    } catch {
      return "Error: Invalid PHP array syntax"
    }
  }
}

function jsonToPhpArray(json: string): string {
  try {
    const parsed = JSON.parse(json)
    return convertToPhp(parsed, 0)
  } catch {
    return "Error: Invalid JSON syntax"
  }
}

function convertToPhp(value: unknown, indent: number): string {
  const spaces = "    ".repeat(indent)
  const innerSpaces = "    ".repeat(indent + 1)
  
  if (value === null) return "null"
  if (typeof value === "boolean") return value ? "true" : "false"
  if (typeof value === "number") return String(value)
  if (typeof value === "string") return `'${value.replace(/'/g, "\\'")}'`
  
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"
    const items = value.map(v => `${innerSpaces}${convertToPhp(v, indent + 1)}`).join(",\n")
    return `[\n${items},\n${spaces}]`
  }
  
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return "[]"
    const items = entries
      .map(([k, v]) => `${innerSpaces}'${k}' => ${convertToPhp(v, indent + 1)}`)
      .join(",\n")
    return `[\n${items},\n${spaces}]`
  }
  
  return String(value)
}

export function PhpArrayJson() {
  const [phpInput, setPhpInput] = useState("")
  const [jsonInput, setJsonInput] = useState("")
  const [copied, setCopied] = useState<"php" | "json" | null>(null)

  const handlePhpToJson = () => {
    const result = phpArrayToJson(phpInput)
    setJsonInput(result)
  }

  const handleJsonToPhp = () => {
    const result = jsonToPhpArray(jsonInput)
    setPhpInput(result)
  }

  const copyToClipboard = async (text: string, type: "php" | "json") => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="php-input">PHP Array</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(phpInput, "php")}
              disabled={!phpInput}
            >
              {copied === "php" ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <Textarea
            id="php-input"
            value={phpInput}
            onChange={(e) => setPhpInput(e.target.value)}
            placeholder={`['name' => 'John', 'age' => 30]`}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="json-input">JSON</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(jsonInput, "json")}
              disabled={!jsonInput}
            >
              {copied === "json" ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <Textarea
            id="json-input"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{"name": "John", "age": 30}`}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={handlePhpToJson} disabled={!phpInput}>
          PHP to JSON
          <ArrowLeftRight className="ml-2 size-4" />
        </Button>
        <Button onClick={handleJsonToPhp} disabled={!jsonInput}>
          JSON to PHP
          <ArrowLeftRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
