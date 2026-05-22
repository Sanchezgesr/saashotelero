export async function generatePDF(title: string, tableHeaders: string[], tableRows: string[][], filename: string) {
  const { default: jsPDF } = await import('jspdf')
  const mod = await import('jspdf-autotable')
  mod.applyPlugin(jsPDF)
  const doc = new jsPDF()
  doc.text(title, 14, 15)
  ;(doc as any).autoTable({ head: [tableHeaders], body: tableRows, startY: 25 })
  doc.save(`${filename}.pdf`)
}

export async function initJSPDF() {
  const { default: jsPDF } = await import('jspdf')
  const mod = await import('jspdf-autotable')
  mod.applyPlugin(jsPDF)
  return jsPDF
}
