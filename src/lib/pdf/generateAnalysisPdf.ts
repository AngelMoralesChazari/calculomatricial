import { jsPDF } from 'jspdf'
import { formatNumber } from '../matrix/format'
import { units } from '../../data/units'
import type { ReportAuthor } from '../../types/report'
import type { AnalysisResult, StructureModel } from '../../types/structure'

const NAVY: [number, number, number] = [10, 37, 64]
const GRAY: [number, number, number] = [90, 106, 126]
const LINE: [number, number, number] = [208, 215, 226]
const BLACK: [number, number, number] = [20, 20, 20]

const MARGIN = 14
const PAGE_W = 210
const PAGE_H = 297
const CONTENT_W = PAGE_W - MARGIN * 2

interface PdfCursor {
  doc: jsPDF
  y: number
}

function ensureSpace(ctx: PdfCursor, needed: number) {
  if (ctx.y + needed > PAGE_H - 16) {
    ctx.doc.addPage()
    ctx.y = MARGIN
  }
}

function sectionTitle(ctx: PdfCursor, title: string) {
  ensureSpace(ctx, 12)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setFontSize(10)
  ctx.doc.setTextColor(...NAVY)
  ctx.doc.text(title, MARGIN, ctx.y)
  ctx.y += 2
  ctx.doc.setDrawColor(...NAVY)
  ctx.doc.setLineWidth(0.4)
  ctx.doc.line(MARGIN, ctx.y, MARGIN + CONTENT_W, ctx.y)
  ctx.y += 6
}

function label(ctx: PdfCursor, text: string) {
  ensureSpace(ctx, 6)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setFontSize(8)
  ctx.doc.setTextColor(...NAVY)
  ctx.doc.text(text, MARGIN, ctx.y)
  ctx.y += 4.5
}

function drawTable(
  ctx: PdfCursor,
  headers: string[],
  rows: string[][],
  colWidths?: number[],
) {
  const cols = headers.length
  const widths =
    colWidths ??
    Array.from({ length: cols }, () => CONTENT_W / cols)
  const rowH = 6
  const headerH = 6.5

  ensureSpace(ctx, headerH + rows.length * rowH + 4)

  let x = MARGIN
  ctx.doc.setFillColor(10, 37, 64)
  ctx.doc.rect(MARGIN, ctx.y, CONTENT_W, headerH, 'F')
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setFontSize(7)
  ctx.doc.setTextColor(255, 255, 255)
  headers.forEach((h, i) => {
    ctx.doc.text(h, x + 1.5, ctx.y + 4.2)
    x += widths[i]
  })
  ctx.y += headerH

  ctx.doc.setFont('courier', 'normal')
  ctx.doc.setFontSize(7)
  rows.forEach((row, rowIndex) => {
    ensureSpace(ctx, rowH + 2)
    if (rowIndex % 2 === 0) {
      ctx.doc.setFillColor(244, 246, 249)
      ctx.doc.rect(MARGIN, ctx.y, CONTENT_W, rowH, 'F')
    }
    ctx.doc.setDrawColor(...LINE)
    ctx.doc.setLineWidth(0.15)
    ctx.doc.rect(MARGIN, ctx.y, CONTENT_W, rowH, 'S')

    let cx = MARGIN
    ctx.doc.setTextColor(...BLACK)
    row.forEach((cell, i) => {
      ctx.doc.text(cell, cx + 1.5, ctx.y + 4)
      cx += widths[i]
    })
    ctx.y += rowH
  })
  ctx.y += 5
}

function drawMatrix(
  ctx: PdfCursor,
  name: string,
  matrix: number[][],
  rowLabels?: string[],
  colLabels?: string[],
) {
  if (!matrix.length) return

  const cols = matrix[0].length
  const cellW = Math.min(22, (CONTENT_W - 28) / Math.max(cols, 1))
  const cellH = 5.5
  const labelW = rowLabels ? 16 : 0
  const matrixW = labelW + cols * cellW
  const topLabels = colLabels ? cellH : 0
  const totalH = 8 + topLabels + matrix.length * cellH + 4

  ensureSpace(ctx, totalH)

  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setFontSize(8)
  ctx.doc.setTextColor(...NAVY)
  ctx.doc.text(name, MARGIN, ctx.y)
  ctx.y += 4

  const startX = MARGIN + 4
  let y = ctx.y

  if (colLabels) {
    colLabels.forEach((lab, i) => {
      ctx.doc.setFont('helvetica', 'normal')
      ctx.doc.setFontSize(6)
      ctx.doc.setTextColor(...GRAY)
      ctx.doc.text(lab, startX + labelW + i * cellW + cellW / 2, y + 3.5, { align: 'center' })
    })
    y += cellH
  }

  const matrixTop = y
  const matrixH = matrix.length * cellH

  // Corchetes
  ctx.doc.setDrawColor(...NAVY)
  ctx.doc.setLineWidth(0.6)
  ctx.doc.line(startX - 1.5, matrixTop, startX - 1.5, matrixTop + matrixH)
  ctx.doc.line(startX - 1.5, matrixTop, startX + 1, matrixTop)
  ctx.doc.line(startX - 1.5, matrixTop + matrixH, startX + 1, matrixTop + matrixH)
  ctx.doc.line(startX + matrixW + 1.5, matrixTop, startX + matrixW + 1.5, matrixTop + matrixH)
  ctx.doc.line(startX + matrixW - 1, matrixTop, startX + matrixW + 1.5, matrixTop)
  ctx.doc.line(startX + matrixW - 1, matrixTop + matrixH, startX + matrixW + 1.5, matrixTop + matrixH)

  matrix.forEach((row, r) => {
    if (rowLabels) {
      ctx.doc.setFont('helvetica', 'normal')
      ctx.doc.setFontSize(6)
      ctx.doc.setTextColor(...GRAY)
      ctx.doc.text(rowLabels[r] ?? '', startX + labelW - 1.5, y + cellH * 0.7, { align: 'right' })
    }
    row.forEach((value, c) => {
      ctx.doc.setFont('courier', 'normal')
      ctx.doc.setFontSize(7)
      ctx.doc.setTextColor(...BLACK)
      ctx.doc.text(
        formatNumber(value),
        startX + labelW + c * cellW + cellW / 2,
        y + cellH * 0.7,
        { align: 'center' },
      )
    })
    y += cellH
  })

  ctx.y = y + 5
}

function drawVector(
  ctx: PdfCursor,
  name: string,
  vector: number[][],
  labels?: string[],
) {
  drawMatrix(ctx, name, vector, labels)
}

function footer(doc: jsPDF, author: ReportAuthor) {
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...GRAY)
    const left = `${author.title} ${author.name}`.trim()
    doc.text(left, MARGIN, PAGE_H - 7)
    doc.text(`p. ${i}/${pages}`, PAGE_W - MARGIN, PAGE_H - 7, { align: 'right' })
  }
}

function authorLine(author: ReportAuthor): string {
  const career = author.career.trim()
  return career
    ? `${author.title} ${author.name.trim()} — ${career}`
    : `${author.title} ${author.name.trim()}`
}

export function generateAnalysisPdf(
  model: StructureModel,
  result: AnalysisResult,
  author: ReportAuthor,
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const ctx: PdfCursor = { doc, y: MARGIN }
  const freeLabels = result.freeDofIndices.map((i) => result.dofLabels[i])
  const restrainedLabels = result.restrainedDofIndices.map((i) => result.dofLabels[i])
  const date = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Portada / encabezado
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PAGE_W, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('ANÁLISIS ESTRUCTURAL — MÉTODO DE RIGIDEZ', MARGIN, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Viga Euler-Bernoulli · G.L. rotacional (θ)', MARGIN, 19)
  doc.text(date, PAGE_W - MARGIN, 19, { align: 'right' })

  ctx.y = 36
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text(authorLine(author), MARGIN, ctx.y)
  ctx.y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text(
    `Unidades: E [${units.E}] · I [${units.I}] · L [${units.L}] · M [${units.moment}] · V [${units.shear}] · θ [${units.rotation}] · w [${units.udl}] · P [${units.point}]`,
    MARGIN,
    ctx.y,
  )
  ctx.y += 8

  // 1. Datos de entrada
  sectionTitle(ctx, '1. DATOS DE ENTRADA')

  label(ctx, 'Nodos')
  drawTable(
    ctx,
    ['ID', 'Etiqueta', 'Apoyo (θ=0)', 'G.L.'],
    model.nodes.map((node, index) => [
      String(node.id),
      node.label,
      node.restrained ? 'Sí' : 'No',
      result.dofLabels[index] ?? `θ${node.label}`,
    ]),
    [20, 40, 50, CONTENT_W - 110],
  )

  label(ctx, 'Elementos')
  drawTable(
    ctx,
    ['Elem.', 'Ni', 'Nj', `E (${units.E})`, `I (${units.I})`, `L (${units.L})`],
    model.elements.map((el) => {
      const ni = model.nodes.find((n) => n.id === el.nodeI)?.label ?? String(el.nodeI)
      const nj = model.nodes.find((n) => n.id === el.nodeJ)?.label ?? String(el.nodeJ)
      return [String(el.id), ni, nj, String(el.E), String(el.I), String(el.L)]
    }),
    [22, 22, 22, 40, 40, CONTENT_W - 146],
  )

  label(ctx, 'Cargas en elementos')
  if (model.elementLoads.length === 0) {
    ensureSpace(ctx, 6)
    doc.setFont('courier', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...BLACK)
    doc.text('—', MARGIN, ctx.y)
    ctx.y += 6
  } else {
    drawTable(
      ctx,
      ['ID', 'Elem.', 'Tipo', 'Valor', 'Posición (m)'],
      model.elementLoads.map((load) => [
        String(load.id),
        String(load.elementId),
        load.type === 'udl' ? 'w' : 'P',
        String(load.value),
        load.type === 'point' ? String(load.position ?? '—') : '—',
      ]),
      [22, 28, 28, 40, CONTENT_W - 118],
    )
  }

  label(ctx, `Momentos nodales (${units.moment})`)
  const nodalRows =
    model.nodalLoads.length === 0
      ? [['—', '0']]
      : model.nodalLoads.map((load) => {
          const labelNode = model.nodes.find((n) => n.id === load.nodeId)?.label ?? String(load.nodeId)
          return [`N${labelNode}`, formatNumber(load.moment)]
        })
  drawTable(ctx, ['Nodo', 'M'], nodalRows, [60, CONTENT_W - 60])

  // 2. Matrices locales
  sectionTitle(ctx, '2. MATRICES DE RIGIDEZ LOCALES  ki = (EI/L)·[[4,2],[2,4]]')
  for (const item of result.elementStiffness) {
    const li = result.dofLabels[item.dofI]
    const lj = result.dofLabels[item.dofJ]
    label(ctx, `k${item.elementId} · E${item.elementId} · [${li}, ${lj}] · EI/L = ${formatNumber((item.E * item.I) / item.L)}`)
    drawMatrix(ctx, `k${item.elementId} =`, item.matrix, [li, lj], [li, lj])
  }

  // 3. Fki
  sectionTitle(ctx, '3. FUERZAS DE EMPOTRAMIENTO  Fki')
  for (const item of result.fixedEndForces) {
    const el = result.elementStiffness.find((e) => e.elementId === item.elementId)
    const li = el ? result.dofLabels[el.dofI] : 'θi'
    const lj = el ? result.dofLabels[el.dofJ] : 'θj'
    drawVector(ctx, `Fki(${item.elementId}) =`, [[item.forces[0]], [item.forces[1]]], [li, lj])
  }

  // 4. Fk
  sectionTitle(ctx, '4. VECTOR DE CARGA  Fk = Fnodal − Fki')
  drawVector(
    ctx,
    'Fk =',
    result.loadVector.map((v) => [v]),
    result.dofLabels,
  )
  drawVector(
    ctx,
    'Fk (libres) =',
    result.partitioned.Fd.map((v) => [v]),
    freeLabels,
  )

  // 5. Ensamble
  sectionTitle(ctx, '5. ENSAMBLE  KTG · K11 · K11⁻¹')
  drawMatrix(ctx, 'KTG =', result.globalStiffness, result.dofLabels, result.dofLabels)
  drawMatrix(ctx, 'K11 =', result.partitioned.Kdd, freeLabels, freeLabels)
  drawMatrix(ctx, 'K11⁻¹ =', result.KddInverse, freeLabels, freeLabels)
  if (result.partitioned.Krd.length > 0) {
    drawMatrix(ctx, 'Krd =', result.partitioned.Krd, restrainedLabels, freeLabels)
  }

  // 6. Desplazamientos
  sectionTitle(ctx, '6. DESPLAZAMIENTOS  D = K11⁻¹ · Fk')
  drawVector(
    ctx,
    'D =',
    result.freeDisplacements.map((v) => [v]),
    freeLabels,
  )

  // 7. Fuerzas internas y reacciones
  sectionTitle(ctx, '7. FUERZAS INTERNAS Y REACCIONES  Fi = ki·Di + Fki')
  drawTable(
    ctx,
    ['Elem.', `Mi (${units.moment})`, `Mj (${units.moment})`, `V (${units.shear})`],
    result.elementForces.map((f) => [
      `E${f.elementId}`,
      formatNumber(f.momentI),
      formatNumber(f.momentJ),
      formatNumber(f.shear),
    ]),
    [30, 50, 50, CONTENT_W - 130],
  )

  for (const f of result.elementForces) {
    const el = result.elementStiffness.find((e) => e.elementId === f.elementId)
    const li = el ? result.dofLabels[el.dofI] : 'θi'
    const lj = el ? result.dofLabels[el.dofJ] : 'θj'
    drawVector(ctx, `F${f.elementId} =`, [[f.momentI], [f.momentJ]], [`M(${li})`, `M(${lj})`])
  }

  if (result.reactions.length > 0) {
    label(ctx, 'FR = Krd · D + Frd')
    drawVector(
      ctx,
      'FR =',
      result.reactions.map((v) => [v]),
      restrainedLabels,
    )
  }

  footer(doc, author)

  const safeName = author.name.trim().replace(/\s+/g, '_') || 'informe'
  const stamp = new Date().toISOString().slice(0, 10)
  doc.save(`Analisis_Rigidez_${safeName}_${stamp}.pdf`)
}
