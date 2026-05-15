"use client"

import { useState } from "react"
import { Copy, Check, RefreshCw, Key, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Characters without ambiguous ones (0, O, l, 1, I)
const SAFE_CHARS = {
  lowercase: "abcdefghjkmnpqrstuvwxyz",
  uppercase: "ABCDEFGHJKMNPQRSTUVWXYZ",
  numbers: "23456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
}

function generatePassword(length: number, includeSymbols: boolean = true): string {
  let chars = SAFE_CHARS.lowercase + SAFE_CHARS.uppercase + SAFE_CHARS.numbers
  if (includeSymbols) chars += SAFE_CHARS.symbols
  
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  
  return Array.from(array, (x) => chars[x % chars.length]).join("")
}

function generateAppKey(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const base64 = btoa(String.fromCharCode(...array))
  return `base64:${base64}`
}

function generateJwtSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const array = new Uint32Array(64)
  crypto.getRandomValues(array)
  return Array.from(array, (x) => chars[x % chars.length]).join("")
}

function generateUuid(): string {
  return crypto.randomUUID()
}

export function DevPasswordSecrets() {
  const [passwordLength, setPasswordLength] = useState(16)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [password, setPassword] = useState("")
  const [appKey, setAppKey] = useState("")
  const [jwtSecret, setJwtSecret] = useState("")
  const [uuid, setUuid] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleGeneratePassword = () => {
    setPassword(generatePassword(passwordLength, includeSymbols))
  }

  const handleGenerateAppKey = () => {
    setAppKey(generateAppKey())
  }

  const handleGenerateJwtSecret = () => {
    setJwtSecret(generateJwtSecret())
  }

  const handleGenerateUuid = () => {
    setUuid(generateUuid())
  }

  const handleGenerateAll = () => {
    handleGeneratePassword()
    handleGenerateAppKey()
    handleGenerateJwtSecret()
    handleGenerateUuid()
  }

  return (
    <div className="space-y-6">
      <Button onClick={handleGenerateAll} size="lg" className="w-full">
        <RefreshCw className="mr-2 size-4" />
        Generate All
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Password Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="size-4" />
              Password Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Length: {passwordLength}</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="size-4 rounded border-input"
                  />
                  Symbols
                </label>
              </div>
              <Slider
                value={[passwordLength]}
                onValueChange={([v]) => setPasswordLength(v)}
                min={8}
                max={64}
                step={1}
              />
            </div>
            <Button onClick={handleGeneratePassword} className="w-full" variant="outline">
              <RefreshCw className="mr-2 size-4" />
              Generate
            </Button>
            {password && (
              <div className="flex items-center gap-2">
                <Input value={password} readOnly className="font-mono text-sm" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(password, "password")}
                >
                  {copied === "password" ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              No ambiguous characters: 0, O, l, 1, I
            </p>
          </CardContent>
        </Card>

        {/* Laravel APP_KEY */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4" />
              Laravel APP_KEY
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateAppKey} className="w-full" variant="outline">
              <RefreshCw className="mr-2 size-4" />
              Generate
            </Button>
            {appKey && (
              <div className="flex items-center gap-2">
                <Input value={appKey} readOnly className="font-mono text-xs" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(appKey, "appKey")}
                >
                  {copied === "appKey" ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              base64: + 32 random bytes
            </p>
          </CardContent>
        </Card>

        {/* JWT Secret */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="size-4" />
              JWT Secret
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateJwtSecret} className="w-full" variant="outline">
              <RefreshCw className="mr-2 size-4" />
              Generate
            </Button>
            {jwtSecret && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input value={jwtSecret} readOnly className="font-mono text-xs" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(jwtSecret, "jwt")}
                  >
                    {copied === "jwt" ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              64 random alphanumeric characters
            </p>
          </CardContent>
        </Card>

        {/* UUID Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="size-4" />
              UUID v4
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateUuid} className="w-full" variant="outline">
              <RefreshCw className="mr-2 size-4" />
              Generate
            </Button>
            {uuid && (
              <div className="flex items-center gap-2">
                <Input value={uuid} readOnly className="font-mono text-sm" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(uuid, "uuid")}
                >
                  {copied === "uuid" ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Cryptographically random UUID
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
