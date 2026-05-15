"use client"

import { useState } from "react"
import { Copy, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const CLASS_GROUPS = {
  layout: [
    "container", "block", "inline-block", "inline", "flex", "inline-flex",
    "grid", "inline-grid", "hidden", "visible", "invisible",
    "static", "fixed", "absolute", "relative", "sticky",
    "inset", "top", "right", "bottom", "left",
    "z-", "order-", "float", "clear", "isolate",
    "object-", "overflow", "overscroll",
  ],
  flexGrid: [
    "basis-", "flex-row", "flex-col", "flex-wrap", "flex-nowrap",
    "flex-1", "flex-auto", "flex-initial", "flex-none",
    "grow", "shrink", "justify-", "content-", "items-", "self-",
    "place-", "gap-", "space-",
    "grid-cols-", "grid-rows-", "col-", "row-",
    "auto-cols-", "auto-rows-", "grid-flow-",
  ],
  spacing: [
    "p-", "px-", "py-", "pt-", "pr-", "pb-", "pl-", "ps-", "pe-",
    "m-", "mx-", "my-", "mt-", "mr-", "mb-", "ml-", "ms-", "me-",
    "-m-", "-mx-", "-my-", "-mt-", "-mr-", "-mb-", "-ml-",
    "w-", "min-w-", "max-w-", "h-", "min-h-", "max-h-",
    "size-",
  ],
  typography: [
    "font-", "text-", "antialiased", "subpixel-antialiased",
    "italic", "not-italic", "tracking-", "leading-",
    "list-", "decoration-", "underline", "overline", "line-through", "no-underline",
    "uppercase", "lowercase", "capitalize", "normal-case",
    "truncate", "text-ellipsis", "text-clip", "whitespace-", "break-",
    "align-", "indent-",
  ],
  colors: [
    "bg-", "from-", "via-", "to-", "text-",
    "border-", "divide-", "outline-", "ring-", "ring-offset-",
    "shadow-", "accent-", "caret-", "fill-", "stroke-",
    "placeholder-",
  ],
  borders: [
    "rounded", "border", "divide", "outline", "ring",
  ],
  effects: [
    "shadow", "opacity-", "mix-blend-", "bg-blend-",
    "filter", "blur-", "brightness-", "contrast-", "drop-shadow-",
    "grayscale", "hue-rotate-", "invert", "saturate-", "sepia",
    "backdrop-",
  ],
  transforms: [
    "transform", "scale-", "rotate-", "translate-", "skew-", "origin-",
  ],
  transitions: [
    "transition", "duration-", "ease-", "delay-", "animate-",
  ],
  interactivity: [
    "appearance-", "cursor-", "pointer-events-", "resize", "scroll-",
    "snap-", "touch-", "select-", "will-change-",
    "focus:", "hover:", "active:", "disabled:",
  ],
}

function getClassGroup(className: string): number {
  const groups = Object.values(CLASS_GROUPS)
  
  for (let i = 0; i < groups.length; i++) {
    for (const pattern of groups[i]) {
      if (className.startsWith(pattern) || className.includes(`:${pattern}`)) {
        return i
      }
    }
  }
  return groups.length // Unknown classes go last
}

function sortTailwindClasses(input: string): string {
  // Clean up extra whitespace
  const cleaned = input.replace(/\s+/g, " ").trim()
  
  // Split into classes
  const classes = cleaned.split(" ").filter(Boolean)
  
  // Sort by group, then alphabetically within group
  const sorted = classes.sort((a, b) => {
    const groupA = getClassGroup(a)
    const groupB = getClassGroup(b)
    
    if (groupA !== groupB) return groupA - groupB
    return a.localeCompare(b)
  })
  
  return sorted.join(" ")
}

export function TailwindSorter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)

  const handleSort = () => {
    const sorted = sortTailwindClasses(input)
    setOutput(sorted)
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="classes-input">Tailwind Classes</Label>
        <Textarea
          id="classes-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow w-full max-w-md mx-auto"
          className="min-h-[120px] font-mono text-sm"
        />
      </div>

      <Button onClick={handleSort} disabled={!input.trim()}>
        <Sparkles className="mr-2 size-4" />
        Sort Classes
      </Button>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Sorted Output</Label>
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <Textarea
            value={output}
            readOnly
            className="min-h-[120px] font-mono text-sm"
          />
        </div>
      )}

      <div className="rounded-lg border bg-muted/50 p-4">
        <h4 className="mb-2 text-sm font-medium">Sorting Order</h4>
        <ol className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
          <li>1. Layout (position, display, z-index)</li>
          <li>2. Flex/Grid</li>
          <li>3. Spacing (padding, margin, size)</li>
          <li>4. Typography</li>
          <li>5. Colors</li>
          <li>6. Borders</li>
          <li>7. Effects (shadows, filters)</li>
          <li>8. Transforms</li>
          <li>9. Transitions</li>
          <li>10. Interactivity</li>
        </ol>
      </div>
    </div>
  )
}
