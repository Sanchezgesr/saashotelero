import ExcelJS from 'exceljs'

export async function exportToExcel(rows: Record<string, unknown>[], filename: string) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Datos')

  if (rows.length > 0) {
    const columns = Object.keys(rows[0]).map((key) => ({ header: key, key }))
    worksheet.columns = columns
    rows.forEach((row) => worksheet.addRow(row))
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
