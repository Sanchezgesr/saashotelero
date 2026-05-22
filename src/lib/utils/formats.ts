export function formatCurrency(amount: number): string {
  return `S/. ${amount.toFixed(2)}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getPageRange(page: number, totalPages: number): string {
  return `Pág. ${page} de ${totalPages}`
}
