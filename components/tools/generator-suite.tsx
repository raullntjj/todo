"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, RefreshCw, Download } from "lucide-react"
import { faker } from "@faker-js/faker/locale/pt_BR"
import { ulid } from "ulid"
import { generateCPF, generateCNPJ, generateCNS, generateCNH } from "@/lib/brazilian-docs"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon" onClick={copy} className="h-8 w-8">
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}

function UUIDGenerator() {
  const [quantity, setQuantity] = useState(5)
  const [uuids, setUuids] = useState<string[]>([])
  const [ulids, setUlids] = useState<string[]>([])

  const generateUUIDs = () => {
    setUuids(Array.from({ length: quantity }, () => crypto.randomUUID()))
  }

  const generateULIDs = () => {
    setUlids(Array.from({ length: quantity }, () => ulid()))
  }

  const copyAll = async (items: string[]) => {
    await navigator.clipboard.writeText(items.join("\n"))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Quantidade</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.min(100, Math.max(1, Number(e.target.value))))}
            className="w-24"
            min={1}
            max={100}
          />
        </div>
        <div className="flex gap-2 pt-5">
          <Button onClick={generateUUIDs} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar UUIDs
          </Button>
          <Button onClick={generateULIDs} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar ULIDs
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {uuids.length > 0 && (
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">UUID v4</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyAll(uuids)}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Todos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {uuids.map((id, i) => (
                  <div key={i} className="flex items-center justify-between font-mono text-sm bg-muted/50 px-2 py-1 rounded">
                    <span className="truncate">{id}</span>
                    <CopyButton text={id} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {ulids.length > 0 && (
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">ULID</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyAll(ulids)}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Todos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {ulids.map((id, i) => (
                  <div key={i} className="flex items-center justify-between font-mono text-sm bg-muted/50 px-2 py-1 rounded">
                    <span className="truncate">{id}</span>
                    <CopyButton text={id} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function DocumentGenerator() {
  const [withMask, setWithMask] = useState(true)
  const [quantity, setQuantity] = useState(5)
  const [cpfs, setCpfs] = useState<string[]>([])
  const [cnpjs, setCnpjs] = useState<string[]>([])
  const [cnss, setCnss] = useState<string[]>([])
  const [cnhs, setCnhs] = useState<string[]>([])

  const generateDocs = (type: "cpf" | "cnpj" | "cns" | "cnh") => {
    const generators = {
      cpf: () => generateCPF(withMask),
      cnpj: () => generateCNPJ(withMask),
      cns: () => generateCNS(withMask),
      cnh: () => generateCNH(withMask),
    }
    const setters = { cpf: setCpfs, cnpj: setCnpjs, cns: setCnss, cnh: setCnhs }
    setters[type](Array.from({ length: quantity }, generators[type]))
  }

  const copyAll = async (items: string[]) => {
    await navigator.clipboard.writeText(items.join("\n"))
  }

  const DocumentList = ({ title, items }: { title: string; items: string[] }) => (
    items.length > 0 && (
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => copyAll(items)}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-[150px] overflow-y-auto">
            {items.map((doc, i) => (
              <div key={i} className="flex items-center justify-between font-mono text-sm bg-muted/50 px-2 py-1 rounded">
                <span>{doc}</span>
                <CopyButton text={doc} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Quantidade</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.min(50, Math.max(1, Number(e.target.value))))}
            className="w-24"
            min={1}
            max={50}
          />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <Switch checked={withMask} onCheckedChange={setWithMask} id="mask" />
          <Label htmlFor="mask" className="text-sm">Com máscara</Label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => generateDocs("cpf")} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          CPF
        </Button>
        <Button onClick={() => generateDocs("cnpj")} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          CNPJ
        </Button>
        <Button onClick={() => generateDocs("cns")} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          CNS
        </Button>
        <Button onClick={() => generateDocs("cnh")} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          CNH
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DocumentList title="CPF" items={cpfs} />
        <DocumentList title="CNPJ" items={cnpjs} />
        <DocumentList title="CNS" items={cnss} />
        <DocumentList title="CNH" items={cnhs} />
      </div>
    </div>
  )
}

interface Person {
  nome: string
  email: string
  celular: string
  nascimento: string
  nomePai: string
  nomeMae: string
  profissao: string
}

interface Address {
  cep: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
}

function FakeDataGenerator() {
  const [people, setPeople] = useState<Person[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [quantity, setQuantity] = useState(3)

  const generatePeople = () => {
    const newPeople = Array.from({ length: quantity }, () => ({
      nome: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      celular: faker.phone.number({ style: "national" }),
      nascimento: faker.date.birthdate({ min: 18, max: 65, mode: "age" }).toLocaleDateString("pt-BR"),
      nomePai: faker.person.fullName({ sex: "male" }),
      nomeMae: faker.person.fullName({ sex: "female" }),
      profissao: faker.person.jobTitle(),
    }))
    setPeople(newPeople)
  }

  const generateAddresses = () => {
    const newAddresses = Array.from({ length: quantity }, () => ({
      cep: faker.location.zipCode("#####-###"),
      rua: faker.location.street(),
      numero: faker.location.buildingNumber(),
      bairro: faker.location.county(),
      cidade: faker.location.city(),
      estado: faker.location.state({ abbreviated: true }),
    }))
    setAddresses(newAddresses)
  }

  const toJSON = (data: Person[] | Address[]) => JSON.stringify(data, null, 2)

  const toPHPArray = (data: Person[] | Address[]) => {
    const formatValue = (obj: Record<string, string>) =>
      Object.entries(obj)
        .map(([k, v]) => `        '${k}' => '${v}'`)
        .join(",\n")

    return `[\n${data.map((item) => `    [\n${formatValue(item as Record<string, string>)}\n    ]`).join(",\n")}\n]`
  }

  const copyAs = async (data: Person[] | Address[], format: "json" | "php") => {
    const text = format === "json" ? toJSON(data) : toPHPArray(data)
    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Quantidade</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.min(20, Math.max(1, Number(e.target.value))))}
            className="w-24"
            min={1}
            max={20}
          />
        </div>
        <div className="flex gap-2 pt-5">
          <Button onClick={generatePeople} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar Pessoas
          </Button>
          <Button onClick={generateAddresses} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar Endereços
          </Button>
        </div>
      </div>

      {people.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Pessoas Geradas</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => copyAs(people, "json")}>
                <Download className="mr-2 h-4 w-4" />
                JSON
              </Button>
              <Button variant="ghost" size="sm" onClick={() => copyAs(people, "php")}>
                <Download className="mr-2 h-4 w-4" />
                PHP Array
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {people.map((person, i) => (
                <div key={i} className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{person.nome}</span>
                    <CopyButton text={JSON.stringify(person, null, 2)} />
                  </div>
                  <div className="text-muted-foreground grid grid-cols-2 gap-1">
                    <span>Email: {person.email}</span>
                    <span>Celular: {person.celular}</span>
                    <span>Nascimento: {person.nascimento}</span>
                    <span>Profissão: {person.profissao}</span>
                    <span>Pai: {person.nomePai}</span>
                    <span>Mãe: {person.nomeMae}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {addresses.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Endereços Gerados</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => copyAs(addresses, "json")}>
                <Download className="mr-2 h-4 w-4" />
                JSON
              </Button>
              <Button variant="ghost" size="sm" onClick={() => copyAs(addresses, "php")}>
                <Download className="mr-2 h-4 w-4" />
                PHP Array
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {addresses.map((addr, i) => (
                <div key={i} className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{addr.rua}, {addr.numero}</span>
                    <CopyButton text={JSON.stringify(addr, null, 2)} />
                  </div>
                  <div className="text-muted-foreground">
                    <span>{addr.bairro} - {addr.cidade}/{addr.estado} - CEP: {addr.cep}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function GeneratorSuite() {
  return (
    <Tabs defaultValue="uuid" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="uuid">UUID / ULID</TabsTrigger>
        <TabsTrigger value="docs">Documentos</TabsTrigger>
        <TabsTrigger value="fake">Fake Data</TabsTrigger>
      </TabsList>

      <TabsContent value="uuid">
        <UUIDGenerator />
      </TabsContent>

      <TabsContent value="docs">
        <DocumentGenerator />
      </TabsContent>

      <TabsContent value="fake">
        <FakeDataGenerator />
      </TabsContent>
    </Tabs>
  )
}
