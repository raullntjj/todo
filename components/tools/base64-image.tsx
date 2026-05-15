"use client"

import { useState, useRef } from "react"
import { Copy, Check, Upload, Image as ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Base64Image() {
  const [base64Input, setBase64Input] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [generatedBase64, setGeneratedBase64] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBase64Preview = () => {
    setError(null)
    let input = base64Input.trim()
    
    // Add data URI prefix if missing
    if (!input.startsWith("data:image")) {
      // Try to detect image type from base64
      if (input.startsWith("/9j/")) {
        input = `data:image/jpeg;base64,${input}`
      } else if (input.startsWith("iVBORw")) {
        input = `data:image/png;base64,${input}`
      } else if (input.startsWith("R0lGOD")) {
        input = `data:image/gif;base64,${input}`
      } else if (input.startsWith("UklGR")) {
        input = `data:image/webp;base64,${input}`
      } else {
        input = `data:image/png;base64,${input}`
      }
    }
    
    // Validate by loading as image
    const img = new window.Image()
    img.onload = () => setImagePreview(input)
    img.onerror = () => setError("Invalid base64 image data")
    img.src = input
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setGeneratedBase64(result)
      setError(null)
    }
    reader.onerror = () => setError("Failed to read file")
    reader.readAsDataURL(file)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyBase64Only = async () => {
    const base64Only = generatedBase64.split(",")[1] || generatedBase64
    await copyToClipboard(base64Only)
  }

  return (
    <Tabs defaultValue="preview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="preview">Base64 to Image</TabsTrigger>
        <TabsTrigger value="convert">Image to Base64</TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base64-input">Base64 String</Label>
          <Textarea
            id="base64-input"
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="Paste base64 string here (with or without data URI prefix)"
            className="min-h-[150px] font-mono text-sm"
          />
        </div>

        <Button onClick={handleBase64Preview} disabled={!base64Input.trim()}>
          <ImageIcon className="mr-2 size-4" />
          Preview Image
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {imagePreview && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Preview</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImagePreview(null)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border bg-muted/50 p-4">
              <img
                src={imagePreview}
                alt="Base64 preview"
                className="mx-auto max-h-[400px] object-contain"
              />
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="convert" className="space-y-4">
        <div className="space-y-2">
          <Label>Upload Image</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50"
          >
            <Upload className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF, WebP supported
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {generatedBase64 && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border bg-muted/50 p-4">
              <img
                src={generatedBase64}
                alt="Uploaded preview"
                className="mx-auto max-h-[200px] object-contain"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Base64 Output</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedBase64)}
                  >
                    {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                    Copy with prefix
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyBase64Only}
                  >
                    Copy base64 only
                  </Button>
                </div>
              </div>
              <Textarea
                value={generatedBase64}
                readOnly
                className="min-h-[100px] font-mono text-xs"
              />
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
