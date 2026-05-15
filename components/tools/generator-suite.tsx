"use client"

import { useState, useCallback } from "react"
import { faker } from "@faker-js/faker/locale/pt_BR"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, RefreshCw, User, Building2, FileText, MapPin, Check } from "lucide-react"
import { generateCPF, generateCNPJ, generateCNS, generateCNH, formatCPF, formatCNPJ, formatCNS, formatCNH } from "@/lib/brazilian-docs"

function getZodiacSign(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Áries"
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Touro"
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gêmeos"
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Câncer"
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leão"
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgem"
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra"
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpião"
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitário"
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricórnio"
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquário"
  return "Peixes"
}

function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function generateRG(): string {
  const nums = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("")
  const digit = Math.floor(Math.random() * 10)
  return `${nums}${digit}`
}

function formatRG(rg: string): string {
  const clean = rg.replace(/\D/g, "")
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}-${clean.slice(8)}`
}

function generateCEP(): string {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("")
}

function formatCEP(cep: string): string {
  return `${cep.slice(0, 5)}-${cep.slice(5)}`
}

interface PersonData {
  nome: string
  cpf: string
  rg: string
  email: string
  senha: string
  mae: string
  pai: string
  profissao: string
  dataNascimento: string
  idade: number
  signo: string
  corFavorita: string
  altura: string
  telefone: string
}

function generatePerson(withMask: boolean): PersonData {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const birthDate = faker.date.birthdate({ min: 18, max: 65, mode: "age" })
  const cpfRaw = generateCPF()
  const rgRaw = generateRG()
  
  return {
    nome: `${firstName} ${lastName}`,
    cpf: withMask ? formatCPF(cpfRaw) : cpfRaw,
    rg: withMask ? formatRG(rgRaw) : rgRaw,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    senha: faker.internet.password({ length: 12 }),
    mae: `${faker.person.firstName("female")} ${lastName}`,
    pai: `${faker.person.firstName("male")} ${lastName}`,
    profissao: faker.person.jobTitle(),
    dataNascimento: birthDate.toLocaleDateString("pt-BR"),
    idade: calculateAge(birthDate),
    signo: getZodiacSign(birthDate),
    corFavorita: faker.color.human(),
    altura: `${faker.number.float({ min: 1.5, max: 2.0, fractionDigits: 2 }).toFixed(2)}m`,
    telefone: withMask 
      ? `(${faker.string.numeric(2)}) ${faker.string.numeric(5)}-${faker.string.numeric(4)}`
      : faker.string.numeric(11),
  }
}

interface CompanyData {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  ie: string
  email: string
  telefone: string
  dataAbertura: string
  naturezaJuridica: string
  atividadePrincipal: string
}

function generateCompany(withMask: boolean): CompanyData {
  const companyName = faker.company.name()
  const cnpjRaw = generateCNPJ()
  
  return {
    razaoSocial: `${companyName} LTDA`,
    nomeFantasia: companyName,
    cnpj: withMask ? formatCNPJ(cnpjRaw) : cnpjRaw,
    ie: faker.string.numeric(12),
    email: faker.internet.email({ firstName: companyName.split(" ")[0], lastName: "comercial" }).toLowerCase(),
    telefone: withMask 
      ? `(${faker.string.numeric(2)}) ${faker.string.numeric(4)}-${faker.string.numeric(4)}`
      : faker.string.numeric(10),
    dataAbertura: faker.date.past({ years: 20 }).toLocaleDateString("pt-BR"),
    naturezaJuridica: faker.helpers.arrayElement([
      "Sociedade Limitada",
      "Empresa Individual",
      "MEI",
      "Sociedade Anônima",
      "EIRELI",
    ]),
    atividadePrincipal: faker.commerce.department(),
  }
}

interface AddressData {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  uf: string
}

function generateAddress(withMask: boolean): AddressData {
  const cepRaw = generateCEP()
  const estados: Record<string, string> = {
    "São Paulo": "SP", "Rio de Janeiro": "RJ", "Minas Gerais": "MG",
    "Bahia": "BA", "Paraná": "PR", "Rio Grande do Sul": "RS",
    "Pernambuco": "PE", "Ceará": "CE", "Santa Catarina": "SC",
  }
  const estado = faker.helpers.arrayElement(Object.keys(estados))
  
  return {
    cep: withMask ? formatCEP(cepRaw) : cepRaw,
    logradouro: `${faker.helpers.arrayElement(["Rua", "Avenida", "Travessa", "Alameda"])} ${faker.person.lastName()}`,
    numero: faker.string.numeric({ length: { min: 1, max: 4 } }),
    complemento: faker.helpers.arrayElement(["", "Apto 101", "Casa 2", "Bloco A", "Sala 501"]),
    bairro: faker.location.county(),
    cidade: faker.location.city(),
    estado,
    uf: estados[estado],
  }
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [value])
  
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input value={value} readOnly className="h-9 text-sm font-mono bg-muted/50" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-9 w-9 shrink-0 p-0"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

function PessoasTab() {
  const [person, setPerson] = useState<PersonData | null>(null)
  const [withMask, setWithMask] = useState(true)
  const [multiple, setMultiple] = useState(false)
  const [quantity, setQuantity] = useState(5)
  const [multipleResult, setMultipleResult] = useState("")
  const [outputFormat, setOutputFormat] = useState<"json" | "laravel">("json")

  const generate = useCallback(() => {
    if (multiple) {
      const people = Array.from({ length: quantity }, () => generatePerson(withMask))
      if (outputFormat === "json") {
        setMultipleResult(JSON.stringify(people, null, 2))
      } else {
        const laravelArray = people.map(p => {
          return `    [\n${Object.entries(p).map(([k, v]) => `        '${k}' => '${v}'`).join(",\n")}\n    ]`
        }).join(",\n")
        setMultipleResult(`[\n${laravelArray}\n]`)
      }
      setPerson(null)
    } else {
      setPerson(generatePerson(withMask))
      setMultipleResult("")
    }
  }, [multiple, quantity, withMask, outputFormat])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox id="mask-pessoas" checked={withMask} onCheckedChange={(c) => setWithMask(!!c)} />
          <Label htmlFor="mask-pessoas" className="text-sm">Com Pontuação</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="multiple" checked={multiple} onCheckedChange={setMultiple} />
          <Label htmlFor="multiple" className="text-sm">Múltiplos</Label>
        </div>
        {multiple && (
          <>
            <Input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="h-9 w-20"
            />
            <div className="flex gap-1 rounded-md border p-1">
              <Button
                variant={outputFormat === "json" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setOutputFormat("json")}
              >
                JSON
              </Button>
              <Button
                variant={outputFormat === "laravel" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setOutputFormat("laravel")}
              >
                Laravel
              </Button>
            </div>
          </>
        )}
        <Button onClick={generate} className="ml-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Gerar
        </Button>
      </div>

      {!multiple && person && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CopyField label="Nome Completo" value={person.nome} />
          <CopyField label="CPF" value={person.cpf} />
          <CopyField label="RG" value={person.rg} />
          <CopyField label="Email" value={person.email} />
          <CopyField label="Senha" value={person.senha} />
          <CopyField label="Telefone" value={person.telefone} />
          <CopyField label="Nome da Mãe" value={person.mae} />
          <CopyField label="Nome do Pai" value={person.pai} />
          <CopyField label="Profissão" value={person.profissao} />
          <CopyField label="Data de Nascimento" value={person.dataNascimento} />
          <CopyField label="Idade" value={`${person.idade} anos`} />
          <CopyField label="Signo" value={person.signo} />
          <CopyField label="Cor Favorita" value={person.corFavorita} />
          <CopyField label="Altura" value={person.altura} />
        </div>
      )}

      {multiple && multipleResult && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(multipleResult)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar Tudo
            </Button>
          </div>
          <Textarea
            value={multipleResult}
            readOnly
            className="h-80 font-mono text-xs"
          />
        </div>
      )}
    </div>
  )
}

function EmpresasTab() {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [withMask, setWithMask] = useState(true)
  const [multiple, setMultiple] = useState(false)
  const [quantity, setQuantity] = useState(5)
  const [multipleResult, setMultipleResult] = useState("")
  const [outputFormat, setOutputFormat] = useState<"json" | "laravel">("json")

  const generate = useCallback(() => {
    if (multiple) {
      const companies = Array.from({ length: quantity }, () => generateCompany(withMask))
      if (outputFormat === "json") {
        setMultipleResult(JSON.stringify(companies, null, 2))
      } else {
        const laravelArray = companies.map(c => {
          return `    [\n${Object.entries(c).map(([k, v]) => `        '${k}' => '${v}'`).join(",\n")}\n    ]`
        }).join(",\n")
        setMultipleResult(`[\n${laravelArray}\n]`)
      }
      setCompany(null)
    } else {
      setCompany(generateCompany(withMask))
      setMultipleResult("")
    }
  }, [multiple, quantity, withMask, outputFormat])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox id="mask-empresas" checked={withMask} onCheckedChange={(c) => setWithMask(!!c)} />
          <Label htmlFor="mask-empresas" className="text-sm">Com Pontuação</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="multiple-emp" checked={multiple} onCheckedChange={setMultiple} />
          <Label htmlFor="multiple-emp" className="text-sm">Múltiplos</Label>
        </div>
        {multiple && (
          <>
            <Input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="h-9 w-20"
            />
            <div className="flex gap-1 rounded-md border p-1">
              <Button
                variant={outputFormat === "json" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setOutputFormat("json")}
              >
                JSON
              </Button>
              <Button
                variant={outputFormat === "laravel" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setOutputFormat("laravel")}
              >
                Laravel
              </Button>
            </div>
          </>
        )}
        <Button onClick={generate} className="ml-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Gerar
        </Button>
      </div>

      {!multiple && company && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CopyField label="Razão Social" value={company.razaoSocial} />
          <CopyField label="Nome Fantasia" value={company.nomeFantasia} />
          <CopyField label="CNPJ" value={company.cnpj} />
          <CopyField label="Inscrição Estadual" value={company.ie} />
          <CopyField label="Email" value={company.email} />
          <CopyField label="Telefone" value={company.telefone} />
          <CopyField label="Data de Abertura" value={company.dataAbertura} />
          <CopyField label="Natureza Jurídica" value={company.naturezaJuridica} />
          <CopyField label="Atividade Principal" value={company.atividadePrincipal} />
        </div>
      )}

      {multiple && multipleResult && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(multipleResult)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar Tudo
            </Button>
          </div>
          <Textarea
            value={multipleResult}
            readOnly
            className="h-80 font-mono text-xs"
          />
        </div>
      )}
    </div>
  )
}

function DocumentosTab() {
  const [withMask, setWithMask] = useState(true)
  const [cpf, setCpf] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [cns, setCns] = useState("")
  const [cnh, setCnh] = useState("")
  const [rg, setRg] = useState("")

  const generateAll = useCallback(() => {
    const cpfRaw = generateCPF()
    const cnpjRaw = generateCNPJ()
    const cnsRaw = generateCNS()
    const cnhRaw = generateCNH()
    const rgRaw = generateRG()
    
    setCpf(withMask ? formatCPF(cpfRaw) : cpfRaw)
    setCnpj(withMask ? formatCNPJ(cnpjRaw) : cnpjRaw)
    setCns(withMask ? formatCNS(cnsRaw) : cnsRaw)
    setCnh(withMask ? formatCNH(cnhRaw) : cnhRaw)
    setRg(withMask ? formatRG(rgRaw) : rgRaw)
  }, [withMask])

  const updateMask = useCallback((newMask: boolean) => {
    setWithMask(newMask)
    if (cpf) {
      const clean = cpf.replace(/\D/g, "")
      setCpf(newMask ? formatCPF(clean) : clean)
    }
    if (cnpj) {
      const clean = cnpj.replace(/\D/g, "")
      setCnpj(newMask ? formatCNPJ(clean) : clean)
    }
    if (cns) {
      const clean = cns.replace(/\D/g, "")
      setCns(newMask ? formatCNS(clean) : clean)
    }
    if (cnh) {
      const clean = cnh.replace(/\D/g, "")
      setCnh(newMask ? formatCNH(clean) : clean)
    }
    if (rg) {
      const clean = rg.replace(/\D/g, "")
      setRg(newMask ? formatRG(clean) : clean)
    }
  }, [cpf, cnpj, cns, cnh, rg])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox id="mask-docs" checked={withMask} onCheckedChange={(c) => updateMask(!!c)} />
          <Label htmlFor="mask-docs" className="text-sm">Com Pontuação</Label>
        </div>
        <Button onClick={generateAll} className="ml-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Gerar Todos
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CopyField label="CPF" value={cpf || "—"} />
        <CopyField label="CNPJ" value={cnpj || "—"} />
        <CopyField label="RG" value={rg || "—"} />
        <CopyField label="CNS (Cartão SUS)" value={cns || "—"} />
        <CopyField label="CNH" value={cnh || "—"} />
      </div>
    </div>
  )
}

function EnderecosTab() {
  const [address, setAddress] = useState<AddressData | null>(null)
  const [withMask, setWithMask] = useState(true)
  const [multiple, setMultiple] = useState(false)
  const [quantity, setQuantity] = useState(5)
  const [multipleResult, setMultipleResult] = useState("")
  const [outputFormat, setOutputFormat] = useState<"json" | "laravel">("json")

  const generate = useCallback(() => {
    if (multiple) {
      const addresses = Array.from({ length: quantity }, () => generateAddress(withMask))
      if (outputFormat === "json") {
        setMultipleResult(JSON.stringify(addresses, null, 2))
      } else {
        const laravelArray = addresses.map(a => {
          return `    [\n${Object.entries(a).map(([k, v]) => `        '${k}' => '${v}'`).join(",\n")}\n    ]`
        }).join(",\n")
        setMultipleResult(`[\n${laravelArray}\n]`)
      }
      setAddress(null)
    } else {
      setAddress(generateAddress(withMask))
      setMultipleResult("")
    }
  }, [multiple, quantity, withMask, outputFormat])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox id="mask-end" checked={withMask} onCheckedChange={(c) => setWithMask(!!c)} />
          <Label htmlFor="mask-end" className="text-sm">Com Pontuação</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="multiple-end" checked={multiple} onCheckedChange={setMultiple} />
          <Label htmlFor="multiple-end" className="text-sm">Múltiplos</Label>
        </div>
        {multiple && (
          <>
            <Input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="h-9 w-20"
            />
            <div className="flex gap-1 rounded-md border p-1">
              <Button
                variant={outputFormat === "json" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setOutputFormat("json")}
              >
                JSON
              </Button>
              <Button
                variant={outputFormat === "laravel" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setOutputFormat("laravel")}
              >
                Laravel
              </Button>
            </div>
          </>
        )}
        <Button onClick={generate} className="ml-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Gerar
        </Button>
      </div>

      {!multiple && address && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CopyField label="CEP" value={address.cep} />
          <CopyField label="Logradouro" value={address.logradouro} />
          <CopyField label="Número" value={address.numero} />
          <CopyField label="Complemento" value={address.complemento || "—"} />
          <CopyField label="Bairro" value={address.bairro} />
          <CopyField label="Cidade" value={address.cidade} />
          <CopyField label="Estado" value={address.estado} />
          <CopyField label="UF" value={address.uf} />
        </div>
      )}

      {multiple && multipleResult && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(multipleResult)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar Tudo
            </Button>
          </div>
          <Textarea
            value={multipleResult}
            readOnly
            className="h-80 font-mono text-xs"
          />
        </div>
      )}
    </div>
  )
}

export function GeneratorSuite() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generator Suite</h1>
        <p className="text-muted-foreground">Geração de dados brasileiros para testes e seeders</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="pessoas" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="pessoas" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Pessoas</span>
              </TabsTrigger>
              <TabsTrigger value="empresas" className="gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Empresas</span>
              </TabsTrigger>
              <TabsTrigger value="documentos" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documentos</span>
              </TabsTrigger>
              <TabsTrigger value="enderecos" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Endereços</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pessoas">
              <PessoasTab />
            </TabsContent>
            <TabsContent value="empresas">
              <EmpresasTab />
            </TabsContent>
            <TabsContent value="documentos">
              <DocumentosTab />
            </TabsContent>
            <TabsContent value="enderecos">
              <EnderecosTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
