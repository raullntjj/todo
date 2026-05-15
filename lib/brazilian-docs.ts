// Utility functions for generating and validating Brazilian documents

function generateDigits(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("")
}

function calculateCPFDigit(base: string, weights: number[]): number {
  const sum = base
    .split("")
    .reduce((acc, digit, i) => acc + parseInt(digit) * weights[i], 0)
  const remainder = (sum * 10) % 11
  return remainder === 10 ? 0 : remainder
}

export function generateCPF(withMask = true): string {
  const base = generateDigits(9)
  const weights1 = [10, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]

  const digit1 = calculateCPFDigit(base, weights1)
  const digit2 = calculateCPFDigit(base + digit1, weights2)

  const cpf = base + digit1 + digit2

  if (withMask) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
  }
  return cpf
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "")
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false

  const weights1 = [10, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]

  const digit1 = calculateCPFDigit(cleaned.slice(0, 9), weights1)
  const digit2 = calculateCPFDigit(cleaned.slice(0, 9) + digit1, weights2)

  return cleaned.slice(9) === `${digit1}${digit2}`
}

function calculateCNPJDigit(base: string, weights: number[]): number {
  const sum = base
    .split("")
    .reduce((acc, digit, i) => acc + parseInt(digit) * weights[i], 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function generateCNPJ(withMask = true): string {
  const base = generateDigits(8) + "0001"
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const digit1 = calculateCNPJDigit(base, weights1)
  const digit2 = calculateCNPJDigit(base + digit1, weights2)

  const cnpj = base + digit1 + digit2

  if (withMask) {
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`
  }
  return cnpj
}

export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, "")
  if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) return false

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const digit1 = calculateCNPJDigit(cleaned.slice(0, 12), weights1)
  const digit2 = calculateCNPJDigit(cleaned.slice(0, 12) + digit1, weights2)

  return cleaned.slice(12) === `${digit1}${digit2}`
}

// CNS - Cartão Nacional de Saúde
export function generateCNS(withMask = true): string {
  // CNS starts with 1 or 2 for definitive, 7, 8, 9 for provisional
  const firstDigit = [1, 2, 7, 8, 9][Math.floor(Math.random() * 5)]
  let base = firstDigit + generateDigits(10)

  // Calculate check digit using mod 11
  const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5]
  let sum = base.split("").reduce((acc, digit, i) => acc + parseInt(digit) * weights[i], 0)
  let remainder = sum % 11
  let checkDigits = ""

  if (remainder === 0) {
    checkDigits = "001"
    base = base + checkDigits
  } else {
    // Adjust to make divisible by 11
    for (let i = 1; i <= 9; i++) {
      if ((sum + i * 2) % 11 === 0) {
        checkDigits = "00" + i
        break
      }
    }
    if (!checkDigits) {
      for (let i = 1; i <= 9; i++) {
        if ((sum + i * 3) % 11 === 0) {
          checkDigits = "0" + i + "0"
          break
        }
      }
    }
    base = base + (checkDigits || "001")
  }

  const cns = base.slice(0, 15)

  if (withMask) {
    return `${cns.slice(0, 3)} ${cns.slice(3, 7)} ${cns.slice(7, 11)} ${cns.slice(11)}`
  }
  return cns
}

// CNH - Carteira Nacional de Habilitação
export function generateCNH(withMask = true): string {
  const base = generateDigits(9)

  // First check digit
  let sum1 = 0
  let dsc = 0
  for (let i = 0, j = 9; i < 9; i++, j--) {
    sum1 += parseInt(base[i]) * j
  }
  let digit1 = sum1 % 11
  if (digit1 >= 10) {
    digit1 = 0
    dsc = 2
  }

  // Second check digit
  let sum2 = 0
  for (let i = 0, j = 1; i < 9; i++, j++) {
    sum2 += parseInt(base[i]) * j
  }
  let digit2 = (sum2 % 11) - dsc
  if (digit2 < 0) digit2 += 11
  if (digit2 >= 10) digit2 = 0

  const cnh = base + digit1 + digit2

  if (withMask) {
    return `${cnh.slice(0, 3)} ${cnh.slice(3, 6)} ${cnh.slice(6, 9)} ${cnh.slice(9)}`
  }
  return cnh
}

// Format functions for applying masks to raw numbers
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "").slice(0, 11)
  if (cleaned.length !== 11) return cpf
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
}

export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, "").slice(0, 14)
  if (cleaned.length !== 14) return cnpj
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
}

export function formatCNS(cns: string): string {
  const cleaned = cns.replace(/\D/g, "").slice(0, 15)
  if (cleaned.length !== 15) return cns
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7, 11)} ${cleaned.slice(11)}`
}

export function formatCNH(cnh: string): string {
  const cleaned = cnh.replace(/\D/g, "").slice(0, 11)
  if (cleaned.length !== 11) return cnh
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
}
