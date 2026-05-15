"use client"

import { useState, useMemo } from "react"
import { get } from "lodash"
import { Copy, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DotNotationExplorer() {
  const [jsonInput, setJsonInput] = useState("")
  const [searchPath, setSearchPath] = useState("")
  const [copied, setCopied] = useState(false)

  const parsedJson = useMemo(() => {
    try {
      return JSON.parse(jsonInput)
    } catch {
      return null
    }
  }, [jsonInput])

  const result = useMemo(() => {
    if (!parsedJson || !searchPath.trim()) return null
    
    const value = get(parsedJson, searchPath.trim())
    if (value === undefined) return { error: "Path not found" }
    
    return { value }
  }, [parsedJson, searchPath])

  const formattedResult = useMemo(() => {
    if (!result) return ""
    if ("error" in result) return result.error
    
    if (typeof result.value === "object" && result.value !== null) {
      return JSON.stringify(result.value, null, 2)
    }
    return String(result.value)
  }, [result])

  const allPaths = useMemo(() => {
    if (!parsedJson) return []
    
    const paths: string[] = []
    
    function traverse(obj: unknown, currentPath: string) {
      if (typeof obj !== "object" || obj === null) {
        paths.push(currentPath)
        return
      }
      
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          traverse(item, currentPath ? `${currentPath}[${index}]` : `[${index}]`)
        })
      } else {
        Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
          const newPath = currentPath ? `${currentPath}.${key}` : key
          paths.push(newPath)
          traverse(value, newPath)
        })
      }
    }
    
    traverse(parsedJson, "")
    return paths
  }, [parsedJson])

  const filteredPaths = useMemo(() => {
    if (!searchPath.trim()) return allPaths.slice(0, 20)
    return allPaths.filter((path) =>
      path.toLowerCase().includes(searchPath.toLowerCase())
    ).slice(0, 20)
  }, [allPaths, searchPath])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(formattedResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="json-input">JSON Input</Label>
          <Textarea
            id="json-input"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{\n  "user": {\n    "name": "John",\n    "addresses": [\n      { "city": "New York" }\n    ]\n  }\n}`}
            className="min-h-[300px] font-mono text-sm"
          />
          {jsonInput && !parsedJson && (
            <p className="text-sm text-destructive">Invalid JSON</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-path">Dot Notation Path</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-path"
                value={searchPath}
                onChange={(e) => setSearchPath(e.target.value)}
                placeholder="user.addresses[0].city"
                className="pl-10 font-mono"
              />
            </div>
          </div>

          {result && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Result</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!formattedResult || "error" in result}
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <pre
                className={`min-h-[100px] overflow-auto rounded-md border bg-muted p-4 font-mono text-sm ${
                  "error" in result ? "text-destructive" : ""
                }`}
              >
                {formattedResult}
              </pre>
            </div>
          )}

          {parsedJson && filteredPaths.length > 0 && (
            <div className="space-y-2">
              <Label>Available Paths {searchPath && `(filtered)`}</Label>
              <div className="max-h-[200px] overflow-auto rounded-md border bg-muted/50 p-2">
                <div className="flex flex-wrap gap-1">
                  {filteredPaths.map((path) => (
                    <button
                      key={path}
                      onClick={() => setSearchPath(path)}
                      className="rounded bg-secondary px-2 py-1 font-mono text-xs transition-colors hover:bg-secondary/80"
                    >
                      {path}
                    </button>
                  ))}
                </div>
                {allPaths.length > 20 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Showing {filteredPaths.length} of {allPaths.length} paths
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
