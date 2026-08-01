import { jsPDF } from 'jspdf'
import { formatNumber } from '../matrix/format'
import { units } from '../../data/units'
import type { ReportAuthor } from '../../types/report'
import type { AnalysisResult, StructureModel } from '../../types/structure'

type Rgb = [number, number, number]

const NAVY: Rgb = [10, 37, 64]
const GRAY: Rgb = [90, 106, 126]
const LINE: Rgb = [208, 215, 226]
const BLACK: Rgb = [20, 20, 20]
const WHITE: Rgb = [255, 255, 255]

const MARGIN = 14
const PAGE_W = 210
const PAGE_H = 297
const CONTENT_W = PAGE_W - MARGIN * 2

const THETA = 'θ'
const PT_TO_MM = 25.4 / 72

interface FontSpec {
  font: string
  style: string
  size: number
}

const NAME_SPEC: FontSpec = { font: 'times', style: 'italic', size: 11 }
const EQ_SPEC: FontSpec = { font: 'times', style: 'normal', size: 11 }
const LABEL_SPEC: FontSpec = { font: 'helvetica', style: 'normal', size: 6.5 }
const VALUE_SPEC: FontSpec = { font: 'courier', style: 'normal', size: 8 }

interface PdfCursor {
  doc: jsPDF
  y: number
}

const SUPERSCRIPTS: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5',
  '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+',
  '⁽': '(', '⁾': ')', 'ⁱ': 'i', 'ᵀ': 'T',
}

const SUBSCRIPTS: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5',
  '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₋': '-', 'ᵢ': 'i', 'ⱼ': 'j',
}

const SUB_DIGITS = '₀₁₂₃₄₅₆₇₈₉'
const SUP_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'

function subscript(value: number): string {
  return String(value).replace(/\d/g, (digit) => SUB_DIGITS[Number(digit)])
}

function superscript(value: number): string {
  return `⁽${String(value).replace(/\d/g, (digit) => SUP_DIGITS[Number(digit)])}⁾`
}

/** Sustituye glifos fuera de WinAnsi que las fuentes base de jsPDF no imprimen */
function plain(text: string): string {
  return text.replace(/−/g, '-').replace(/≈/g, '~')
}

type Token =
  | { kind: 'text'; value: string }
  | { kind: 'theta' }
  | { kind: 'sup'; value: string }
  | { kind: 'sub'; value: string }

function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  let buffer = ''
  const flush = () => {
    if (buffer) {
      tokens.push({ kind: 'text', value: buffer })
      buffer = ''
    }
  }

  for (const char of text) {
    const sup = SUPERSCRIPTS[char]
    const sub = SUBSCRIPTS[char]
    if (char === THETA) {
      flush()
      tokens.push({ kind: 'theta' })
    } else if (sup) {
      flush()
      const last = tokens[tokens.length - 1]
      if (last && last.kind === 'sup') last.value += sup
      else tokens.push({ kind: 'sup', value: sup })
    } else if (sub) {
      flush()
      const last = tokens[tokens.length - 1]
      if (last && last.kind === 'sub') last.value += sub
      else tokens.push({ kind: 'sub', value: sub })
    } else {
      buffer += char
    }
  }
  flush()
  return tokens
}

function applyFont(doc: jsPDF, spec: FontSpec) {
  doc.setFont(spec.font, spec.style)
  doc.setFontSize(spec.size)
}

function smallSpec(spec: FontSpec): FontSpec {
  return { ...spec, size: spec.size * 0.68 }
}

/** θ se dibuja vectorialmente (elipse + barra): las fuentes base no incluyen griego */
function thetaWidth(spec: FontSpec): number {
  return spec.size * PT_TO_MM * 0.56
}

function drawTheta(doc: jsPDF, x: number, baseline: number, spec: FontSpec, color: Rgb) {
  const mm = spec.size * PT_TO_MM
  const h = mm * 0.78
  const w = thetaWidth(spec) * 0.74
  const cx = x + thetaWidth(spec) / 2
  const cy = baseline - h / 2

  doc.setDrawColor(...color)
  doc.setLineWidth(Math.max(0.13, mm * 0.055))
  doc.ellipse(cx, cy, w / 2, h / 2, 'S')
  doc.line(cx - w / 2, cy, cx + w / 2, cy)
}

function tokenWidth(doc: jsPDF, token: Token, spec: FontSpec): number {
  if (token.kind === 'theta') return thetaWidth(spec)
  const tokenSpec = token.kind === 'text' ? spec : smallSpec(spec)
  applyFont(doc, tokenSpec)
  return doc.getTextWidth(token.value)
}

function measureText(doc: jsPDF, text: string, spec: FontSpec): number {
  return tokenize(plain(text)).reduce((width, token) => width + tokenWidth(doc, token, spec), 0)
}

type Align = 'left' | 'center' | 'right'

function drawText(
  doc: jsPDF,
  text: string,
  x: number,
  baseline: number,
  spec: FontSpec,
  color: Rgb = BLACK,
  align: Align = 'left',
): number {
  const tokens = tokenize(plain(text))
  const total = tokens.reduce((width, token) => width + tokenWidth(doc, token, spec), 0)
  let cursorX = align === 'left' ? x : align === 'center' ? x - total / 2 : x - total
  const mm = spec.size * PT_TO_MM

  for (const token of tokens) {
    if (token.kind === 'theta') {
      drawTheta(doc, cursorX, baseline, spec, color)
      cursorX += thetaWidth(spec)
      continue
    }
    const tokenSpec = token.kind === 'text' ? spec : smallSpec(spec)
    const offsetY = token.kind === 'sup' ? -mm * 0.34 : token.kind === 'sub' ? mm * 0.18 : 0
    applyFont(doc, tokenSpec)
    doc.setTextColor(...color)
    doc.text(token.value, cursorX, baseline + offsetY)
    cursorX += doc.getTextWidth(token.value)
  }

  return total
}

function ensureSpace(ctx: PdfCursor, needed: number) {
  if (ctx.y + needed > PAGE_H - 16) {
    ctx.doc.addPage()
    ctx.y = MARGIN
  }
}

function sectionTitle(ctx: PdfCursor, title: string) {
  ensureSpace(ctx, 16)
  ctx.y += 2.5
  drawText(ctx.doc, title, MARGIN, ctx.y, { font: 'helvetica', style: 'bold', size: 9.5 }, NAVY)
  ctx.y += 2
  ctx.doc.setDrawColor(...NAVY)
  ctx.doc.setLineWidth(0.4)
  ctx.doc.line(MARGIN, ctx.y, MARGIN + CONTENT_W, ctx.y)
  ctx.y += 6
}

function caption(ctx: PdfCursor, text: string) {
  ensureSpace(ctx, 6)
  drawText(ctx.doc, text, MARGIN, ctx.y, { font: 'helvetica', style: 'bold', size: 8 }, NAVY)
  ctx.y += 4.5
}

function drawTable(ctx: PdfCursor, headers: string[], rows: string[][], colWidths?: number[]) {
  const widths = colWidths ?? Array.from({ length: headers.length }, () => CONTENT_W / headers.length)
  const headerH = 6.5
  const rowH = 6

  ensureSpace(ctx, headerH + rowH * Math.min(rows.length, 3) + 4)

  ctx.doc.setFillColor(...NAVY)
  ctx.doc.rect(MARGIN, ctx.y, CONTENT_W, headerH, 'F')
  let hx = MARGIN
  headers.forEach((header, i) => {
    drawText(ctx.doc, header, hx + 1.8, ctx.y + 4.3, { font: 'helvetica', style: 'bold', size: 7 }, WHITE)
    hx += widths[i]
  })
  ctx.y += headerH

  rows.forEach((row, rowIndex) => {
    ensureSpace(ctx, rowH)
    if (rowIndex % 2 === 0) {
      ctx.doc.setFillColor(244, 246, 249)
      ctx.doc.rect(MARGIN, ctx.y, CONTENT_W, rowH, 'F')
    }
    ctx.doc.setDrawColor(...LINE)
    ctx.doc.setLineWidth(0.15)
    ctx.doc.rect(MARGIN, ctx.y, CONTENT_W, rowH, 'S')

    let cx = MARGIN
    row.forEach((cell, i) => {
      drawText(ctx.doc, cell, cx + 1.8, ctx.y + 4.1, { font: 'courier', style: 'normal', size: 7.5 }, BLACK)
      cx += widths[i]
    })
    ctx.y += rowH
  })
  ctx.y += 4
}

interface MatrixOptions {
  rowLabels?: string[]
  colLabels?: string[]
  note?: string
}

/**
 * Notación matemática: `nombre = [ … ]` con corchetes altos,
 * etiquetas de G.L. dentro y valores alineados a la derecha.
 */
function drawMatrix(ctx: PdfCursor, name: string, matrix: number[][], options: MatrixOptions = {}) {
  if (!matrix.length || !matrix[0].length) return

  const { doc } = ctx
  const { rowLabels, colLabels, note } = options
  const cols = matrix[0].length
  const rowH = 5.4
  const padY = 2
  const padX = 2.6

  const nameW = measureText(doc, name, NAME_SPEC)
  const eqW = measureText(doc, ' = ', EQ_SPEC)
  const labelW = rowLabels ? 11 : 0

  const bracketX = MARGIN + nameW + eqW + 2
  const available = PAGE_W - MARGIN - bracketX - labelW - padX * 2 - 4

  // Ajusta decimales y tamaño de fuente hasta que la matriz entre en el ancho útil
  const decimals = cols > 5 ? 3 : 4
  const cells = matrix.map((row) => row.map((value) => formatNumber(value, decimals)))
  let valueSpec = VALUE_SPEC
  let cellW = 0
  for (let size = VALUE_SPEC.size; size >= 5.5; size -= 0.5) {
    valueSpec = { ...VALUE_SPEC, size }
    const widest = Math.max(...cells.flat().map((cell) => measureText(doc, cell, valueSpec)))
    cellW = widest + 3.5
    if (cols * cellW <= available) break
  }
  cellW = Math.min(cellW, available / cols)

  const innerW = labelW + cols * cellW
  const innerH = matrix.length * rowH
  const bracketH = innerH + padY * 2
  const totalH = (colLabels ? 4.2 : 0) + bracketH + (note ? 4.2 : 0) + 5

  ensureSpace(ctx, totalH)

  const contentX = bracketX + padX
  let top = ctx.y

  if (note) {
    drawText(doc, note, MARGIN, top, { font: 'helvetica', style: 'normal', size: 7 }, GRAY)
    top += 4.2
  }

  if (colLabels) {
    colLabels.forEach((label, i) => {
      drawText(doc, label, contentX + labelW + i * cellW + cellW / 2, top + 2.8, LABEL_SPEC, GRAY, 'center')
    })
    top += 4.2
  }

  const bracketTop = top
  const bracketBottom = top + bracketH
  const serif = 2.2

  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.7)
  // corchete izquierdo
  doc.line(bracketX, bracketTop, bracketX, bracketBottom)
  doc.line(bracketX, bracketTop, bracketX + serif, bracketTop)
  doc.line(bracketX, bracketBottom, bracketX + serif, bracketBottom)
  // corchete derecho
  const rightX = contentX + innerW + padX
  doc.line(rightX, bracketTop, rightX, bracketBottom)
  doc.line(rightX - serif, bracketTop, rightX, bracketTop)
  doc.line(rightX - serif, bracketBottom, rightX, bracketBottom)

  // nombre = (centrado verticalmente respecto al corchete)
  const nameBaseline = bracketTop + bracketH / 2 + NAME_SPEC.size * PT_TO_MM * 0.35
  drawText(doc, name, MARGIN, nameBaseline, NAME_SPEC, NAVY)
  drawText(doc, ' = ', MARGIN + nameW, nameBaseline, EQ_SPEC, NAVY)

  cells.forEach((rowCells, r) => {
    const baseline = bracketTop + padY + r * rowH + rowH * 0.68

    if (rowLabels) {
      drawText(doc, rowLabels[r] ?? '', contentX + labelW - 2.5, baseline, LABEL_SPEC, GRAY, 'right')
    }

    rowCells.forEach((cell, c) => {
      drawText(doc, cell, contentX + labelW + (c + 1) * cellW - 1.5, baseline, valueSpec, BLACK, 'right')
    })
  })

  ctx.y = bracketBottom + 5
}

function drawVector(ctx: PdfCursor, name: string, values: number[], labels?: string[], note?: string) {
  drawMatrix(
    ctx,
    name,
    values.map((value) => [value]),
    { rowLabels: labels, note },
  )
}

function footer(doc: jsPDF, author: ReportAuthor) {
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12)
    drawText(
      doc,
      `${author.title} ${author.name}`.trim(),
      MARGIN,
      PAGE_H - 7,
      { font: 'helvetica', style: 'normal', size: 7 },
      GRAY,
    )
    drawText(
      doc,
      `p. ${i}/${pages}`,
      PAGE_W - MARGIN,
      PAGE_H - 7,
      { font: 'helvetica', style: 'normal', size: 7 },
      GRAY,
      'right',
    )
  }
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
  const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })

  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PAGE_W, 28, 'F')
  drawText(doc, 'ANÁLISIS ESTRUCTURAL — MÉTODO DE RIGIDEZ', MARGIN, 12, {
    font: 'helvetica',
    style: 'bold',
    size: 13,
  }, WHITE)
  drawText(doc, 'Viga Euler-Bernoulli · 1 G.L. rotacional (θ) por nodo', MARGIN, 19, {
    font: 'helvetica',
    style: 'normal',
    size: 8.5,
  }, WHITE)
  drawText(doc, date, PAGE_W - MARGIN, 19, { font: 'helvetica', style: 'normal', size: 8.5 }, WHITE, 'right')

  ctx.y = 36
  const career = author.career.trim()
  drawText(
    doc,
    career ? `${author.title} ${author.name.trim()} — ${career}` : `${author.title} ${author.name.trim()}`,
    MARGIN,
    ctx.y,
    { font: 'helvetica', style: 'bold', size: 10 },
    NAVY,
  )
  ctx.y += 5
  drawText(
    doc,
    `Unidades: E [${units.E}] · I [${units.I}] · L [${units.L}] · M [${units.moment}] · V [${units.shear}] · θ [${units.rotation}] · w [${units.udl}] · P [${units.point}]`,
    MARGIN,
    ctx.y,
    { font: 'helvetica', style: 'normal', size: 7.5 },
    GRAY,
  )
  ctx.y += 8

  // 1. Datos de entrada
  sectionTitle(ctx, '1. DATOS DE ENTRADA')

  caption(ctx, 'Nodos')
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

  caption(ctx, 'Elementos')
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

  caption(ctx, 'Cargas en elementos')
  drawTable(
    ctx,
    ['ID', 'Elem.', 'Tipo', 'Valor', 'Posición (m)'],
    model.elementLoads.length === 0
      ? [['—', '—', '—', '—', '—']]
      : model.elementLoads.map((load) => [
          String(load.id),
          `E${load.elementId}`,
          load.type === 'udl' ? `w (${units.udl})` : `P (${units.point})`,
          String(load.value),
          load.type === 'point' ? String(load.position ?? '—') : '—',
        ]),
    [20, 26, 42, 40, CONTENT_W - 128],
  )

  caption(ctx, `Momentos nodales (${units.moment})`)
  drawTable(
    ctx,
    ['Nodo', 'M'],
    model.nodalLoads.length === 0
      ? [['—', '0']]
      : model.nodalLoads.map((load) => {
          const nodeLabel = model.nodes.find((n) => n.id === load.nodeId)?.label ?? String(load.nodeId)
          return [`N${nodeLabel}`, formatNumber(load.moment)]
        }),
    [60, CONTENT_W - 60],
  )

  // 2. Matrices locales
  sectionTitle(ctx, '2. MATRICES DE RIGIDEZ LOCALES')
  for (const item of result.elementStiffness) {
    const li = result.dofLabels[item.dofI]
    const lj = result.dofLabels[item.dofJ]
    drawMatrix(ctx, `k${subscript(item.elementId)}`, item.matrix, {
      rowLabels: [li, lj],
      colLabels: [li, lj],
      note: `E${item.elementId} · L = ${item.L} ${units.L} · EI/L = ${formatNumber((item.E * item.I) / item.L)}`,
    })
  }

  // 3. Fki
  sectionTitle(ctx, '3. FUERZAS DE EMPOTRAMIENTO')
  for (const item of result.fixedEndForces) {
    const el = result.elementStiffness.find((e) => e.elementId === item.elementId)
    const li = el ? result.dofLabels[el.dofI] : 'θi'
    const lj = el ? result.dofLabels[el.dofJ] : 'θj'
    drawVector(
      ctx,
      `Fki${superscript(item.elementId)}`,
      [item.forces[0], item.forces[1]],
      [li, lj],
      `Empotramiento perfecto · E${item.elementId} · [${units.moment}]`,
    )
  }

  // 4. Vector de carga
  sectionTitle(ctx, '4. VECTOR DE CARGA')
  drawVector(ctx, 'Fk', result.loadVector, result.dofLabels, `Fk = Fnodal − Fki · [${units.moment}]`)
  drawVector(ctx, 'Fd', result.partitioned.Fd, freeLabels, `G.L. libres · [${units.moment}]`)

  // 5. Ensamble
  sectionTitle(ctx, '5. ENSAMBLE DE LA MATRIZ DE RIGIDEZ')
  drawMatrix(ctx, 'KTG', result.globalStiffness, {
    rowLabels: result.dofLabels,
    colLabels: result.dofLabels,
    note: 'Matriz global ensamblada (N×N)',
  })
  drawMatrix(ctx, 'K₁₁', result.partitioned.Kdd, {
    rowLabels: freeLabels,
    colLabels: freeLabels,
    note: 'K₁₁ = Kdd (G.L. libres)',
  })
  drawMatrix(ctx, 'K₁₁⁻¹', result.KddInverse, {
    rowLabels: freeLabels,
    colLabels: freeLabels,
    note: 'Inversa de K₁₁',
  })
  if (result.partitioned.Krd.length > 0) {
    drawMatrix(ctx, 'Krd', result.partitioned.Krd, {
      rowLabels: restrainedLabels,
      colLabels: freeLabels,
    })
  }

  // 6. Desplazamientos
  sectionTitle(ctx, '6. DESPLAZAMIENTOS')
  drawVector(ctx, 'D', result.freeDisplacements, freeLabels, `D = K₁₁⁻¹ · Fd · [${units.rotation}]`)

  // 7. Fuerzas internas y reacciones
  sectionTitle(ctx, '7. FUERZAS INTERNAS Y REACCIONES')
  for (const force of result.elementForces) {
    const el = result.elementStiffness.find((e) => e.elementId === force.elementId)
    const li = el ? result.dofLabels[el.dofI] : 'θi'
    const lj = el ? result.dofLabels[el.dofJ] : 'θj'
    drawVector(
      ctx,
      `Fi${superscript(force.elementId)}`,
      [force.momentI, force.momentJ],
      [`M(${li})`, `M(${lj})`],
      `Fi = ki · Di + Fki · V = ${formatNumber(force.shear)} ${units.shear} · [${units.moment}]`,
    )
  }

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

  if (result.reactions.length > 0) {
    drawVector(ctx, 'FR', result.reactions, restrainedLabels, `FR = Krd · D + Frd  ·  [${units.moment}]`)
  }

  footer(doc, author)

  const safeName = author.name.trim().replace(/\s+/g, '_') || 'informe'
  const stamp = new Date().toISOString().slice(0, 10)
  doc.save(`Analisis_Rigidez_${safeName}_${stamp}.pdf`)
}
