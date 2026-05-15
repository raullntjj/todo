"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function toWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
}

function toCamelCase(str: string): string {
  const words = toWords(str)
  return words
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("")
}

function toSnakeCase(str: string): string {
  return toWords(str).join("_")
}

function toPascalCase(str: string): string {
  return toWords(str)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}

function toKebabCase(str: string): string {
  return toWords(str).join("-")
}

function toConstantCase(str: string): string {
  return toWords(str).join("_").toUpperCase()
}

function toTitleCase(str: string): string {
  return toWords(str)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function CaseConverter() {
  const [input, setInput] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const results = input
    ? [
        { label: "camelCase", value: toCamelCase(input) },
        { label: "snake_case", value: toSnakeCase(input) },
        { label: "PascalCase", value: toPascalCase(input) },
        { label: "kebab-case", value: toKebabCase(input) },
        { label: "CONSTANT_CASE", value: toConstantCase(input) },
        { label: "Title Case", value: toTitleCase(input) },
      ]
    : []

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="case-input">Input Text</Label>
        <Input
          id="case-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to convert (e.g., myVariableName, my_variable, my-variable)"
          className="font-mono"
        />
      </div>

      {results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ label, value }) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  <code className="flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-sm">
                    {value}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(value, label)}
                  >
                    {copied === label ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
