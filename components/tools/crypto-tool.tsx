"use client"

import { useState } from "react"
import { Copy, Check, Hash, Lock } from "lucide-react"
import bcrypt from "bcryptjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export function CryptoTool() {
  const [password, setPassword] = useState("")
  const [saltRounds, setSaltRounds] = useState(10)
  const [bcryptHash, setBcryptHash] = useState("")
  const [verifyPassword, setVerifyPassword] = useState("")
  const [verifyHash, setVerifyHash] = useState("")
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [isHashing, setIsHashing] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerateBcrypt = async () => {
    if (!password) return
    setIsHashing(true)
    try {
      const hash = await bcrypt.hash(password, saltRounds)
      setBcryptHash(hash)
    } catch {
      setBcryptHash("Error generating hash")
    }
    setIsHashing(false)
  }

  const handleVerifyBcrypt = async () => {
    if (!verifyPassword || !verifyHash) return
    setIsVerifying(true)
    try {
      const isValid = await bcrypt.compare(verifyPassword, verifyHash)
      setVerifyResult(isValid)
    } catch {
      setVerifyResult(false)
    }
    setIsVerifying(false)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Tabs defaultValue="generate" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generate">Generate Hash</TabsTrigger>
        <TabsTrigger value="verify">Verify Hash</TabsTrigger>
      </TabsList>

      <TabsContent value="generate" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password-input">Password</Label>
          <Input
            id="password-input"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to hash"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Salt Rounds: {saltRounds}</Label>
            <span className="text-xs text-muted-foreground">
              Higher = slower but more secure
            </span>
          </div>
          <Slider
            value={[saltRounds]}
            onValueChange={([v]) => setSaltRounds(v)}
            min={4}
            max={16}
            step={1}
          />
        </div>

        <Button
          onClick={handleGenerateBcrypt}
          disabled={!password || isHashing}
          className="w-full"
        >
          <Hash className="mr-2 size-4" />
          {isHashing ? "Generating..." : "Generate Bcrypt Hash"}
        </Button>

        {bcryptHash && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Bcrypt Hash (Laravel Compatible)</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(bcryptHash)}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <Textarea
              value={bcryptHash}
              readOnly
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This hash is compatible with Laravel&apos;s Hash::check() and password_verify()
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="verify" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verify-password">Password</Label>
          <Input
            id="verify-password"
            type="text"
            value={verifyPassword}
            onChange={(e) => {
              setVerifyPassword(e.target.value)
              setVerifyResult(null)
            }}
            placeholder="Enter password to verify"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="verify-hash">Bcrypt Hash</Label>
          <Textarea
            id="verify-hash"
            value={verifyHash}
            onChange={(e) => {
              setVerifyHash(e.target.value)
              setVerifyResult(null)
            }}
            placeholder="Enter bcrypt hash to verify against"
            className="font-mono text-sm"
          />
        </div>

        <Button
          onClick={handleVerifyBcrypt}
          disabled={!verifyPassword || !verifyHash || isVerifying}
          className="w-full"
        >
          <Lock className="mr-2 size-4" />
          {isVerifying ? "Verifying..." : "Verify Password"}
        </Button>

        {verifyResult !== null && (
          <div
            className={`rounded-lg p-4 text-center font-medium ${
              verifyResult
                ? "bg-success/20 text-success"
                : "bg-destructive/20 text-destructive"
            }`}
          >
            {verifyResult ? "Password matches!" : "Password does not match"}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
