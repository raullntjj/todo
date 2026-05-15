"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Copy, Check, Sparkles, AlertCircle } from "lucide-react"

type Language = "babel" | "json" | "html" | "css"

export function CodeFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [language, setLanguage] = useState<Language>("babel")
  const [tabWidth, setTabWidth] = useState(2)
  const [useSemicolons, setUseSemicolons] = useState(true)
  const [printWidth, setPrintWidth] = useState(80)
  const [singleQuote, setSingleQuote] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const [isFormatting, setIsFormatting] = useState(false)

  const formatCode = useCallback(async () => {
    if (!input.trim()) {
      setError("Cole algum código para formatar")
      return
    }

    setIsFormatting(true)
    setError("")

    try {
      const prettier = await import("prettier/standalone")
      const parserBabel = await import("prettier/plugins/babel")
      const parserEstree = await import("prettier/plugins/estree")
      const parserHtml = await import("prettier/plugins/html")
      const parserCss = await import("prettier/plugins/postcss")

      const plugins = [parserBabel, parserEstree, parserHtml, parserCss]

      const options: Parameters<typeof prettier.format>[1] = {
        parser: language,
        plugins,
        tabWidth,
        semi: useSemicolons,
        printWidth,
        singleQuote,
      }

      const formatted = await prettier.format(input, options)
      setOutput(formatted)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao formatar código")
      setOutput("")
    } finally {
      setIsFormatting(false)
    }
  }, [input, language, tabWidth, useSemicolons, printWidth, singleQuote])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const languageLabels: Record<Language, string> = {
    babel: "JavaScript / TypeScript",
    json: "JSON",
    html: "HTML",
    css: "CSS",
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Linguagem</Label>
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(languageLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Tab Width</Label>
          <Select value={String(tabWidth)} onValueChange={(v) => setTabWidth(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 espaços</SelectItem>
              <SelectItem value="4">4 espaços</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Print Width</Label>
          <Input
            type="number"
            value={printWidth}
            onChange={(e) => setPrintWidth(Number(e.target.value))}
            min={40}
            max={200}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground text-xs">Semicolons</Label>
            <Switch checked={useSemicolons} onCheckedChange={setUseSemicolons} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground text-xs">Single Quotes</Label>
            <Switch checked={singleQuote} onCheckedChange={setSingleQuote} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Código de Entrada</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cole seu código aqui..."
            className="font-mono text-sm min-h-[300px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground text-xs">Código Formatado</Label>
            {output && (
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="O código formatado aparecerá aqui..."
            className="font-mono text-sm min-h-[300px] resize-none bg-muted/50"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button onClick={formatCode} disabled={isFormatting} className="w-full">
        <Sparkles className="mr-2 h-4 w-4" />
        {isFormatting ? "Formatando..." : "Formatar Código"}
      </Button>
    </div>
  )
}
