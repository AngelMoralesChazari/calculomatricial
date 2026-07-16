import {
  createMatrix,
  extractSubmatrix,
  invert,
  multiplyMatrixVector,
} from './matrix'
import { computeElementFixedEndForces, elementStiffnessMatrix } from './fixedEndForces'
import type { AnalysisResult, StructureModel } from '../types/structure'

export function analyzeStructure(model: StructureModel): AnalysisResult {
  const n = model.nodes.length
  if (n < 2) throw new Error('Se requieren al menos 2 nodos.')
  if (model.elements.length === 0) throw new Error('Se requiere al menos 1 elemento.')

  const dofLabels = model.nodes.map((node) => `θ${node.label}`)
  const globalStiffness = createMatrix(n, n)
  const loadVector = Array(n).fill(0)

  const elementStiffness = model.elements.map((element) => ({
    elementId: element.id,
    matrix: elementStiffnessMatrix(element.E, element.I, element.L),
  }))

  const fixedEndForces = model.elements.map((element) => ({
    elementId: element.id,
    forces: computeElementFixedEndForces(element, model.elementLoads),
  }))

  for (const element of model.elements) {
    const i = model.nodes.findIndex((node) => node.id === element.nodeI)
    const j = model.nodes.findIndex((node) => node.id === element.nodeJ)
    if (i < 0 || j < 0) throw new Error(`Elemento ${element.id}: nodos no encontrados.`)

    const k = elementStiffnessMatrix(element.E, element.I, element.L)
    const indices = [i, j]

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        globalStiffness[indices[row]][indices[col]] += k[row][col]
      }
    }

    const fem = fixedEndForces.find((item) => item.elementId === element.id)?.forces ?? [0, 0]
    loadVector[i] -= fem[0]
    loadVector[j] -= fem[1]
  }

  for (const nodalLoad of model.nodalLoads) {
    const index = model.nodes.findIndex((node) => node.id === nodalLoad.nodeId)
    if (index >= 0) loadVector[index] += nodalLoad.moment
  }

  const restrainedDofIndices = model.nodes
    .map((node, index) => (node.restrained ? index : -1))
    .filter((index) => index >= 0)

  const freeDofIndices = model.nodes
    .map((node, index) => (!node.restrained ? index : -1))
    .filter((index) => index >= 0)

  if (freeDofIndices.length === 0) {
    throw new Error('Todos los grados de libertad están restringidos. Libere al menos un nodo.')
  }

  const Kdd = extractSubmatrix(globalStiffness, freeDofIndices, freeDofIndices)
  const Kdr = extractSubmatrix(globalStiffness, freeDofIndices, restrainedDofIndices)
  const Krd = extractSubmatrix(globalStiffness, restrainedDofIndices, freeDofIndices)
  const Krr = extractSubmatrix(globalStiffness, restrainedDofIndices, restrainedDofIndices)

  const Fd = freeDofIndices.map((index) => loadVector[index])
  const Fr = restrainedDofIndices.map((index) => loadVector[index])

  const KddInverse = invert(Kdd)
  const freeDisplacements = multiplyMatrixVector(KddInverse, Fd)

  const displacements = Array(n).fill(0)
  freeDofIndices.forEach((index, i) => {
    displacements[index] = freeDisplacements[i]
  })

  const reactions = restrainedDofIndices.length
    ? multiplyMatrixVector(Krd, freeDisplacements).map((value, index) => value + Fr[index])
    : []

  const elementForces = model.elements.map((element) => {
    const i = model.nodes.findIndex((node) => node.id === element.nodeI)
    const j = model.nodes.findIndex((node) => node.id === element.nodeJ)
    const k = elementStiffnessMatrix(element.E, element.I, element.L)
    const d = [displacements[i], displacements[j]]
    const fem = fixedEndForces.find((item) => item.elementId === element.id)?.forces ?? [0, 0]
    const endForces = multiplyMatrixVector(k, d)
    const momentI = endForces[0] + fem[0]
    const momentJ = endForces[1] + fem[1]
    const shear = (momentI + momentJ) / element.L

    return {
      elementId: element.id,
      nodeI: element.nodeI,
      nodeJ: element.nodeJ,
      momentI,
      momentJ,
      shear,
    }
  })

  return {
    dofLabels,
    freeDofIndices,
    restrainedDofIndices,
    elementStiffness,
    globalStiffness,
    loadVector,
    partitioned: { Kdd, Kdr, Krd, Krr, Fd, Fr },
    KddInverse,
    displacements,
    freeDisplacements,
    reactions,
    elementForces,
    fixedEndForces,
  }
}

export function validateStructure(model: StructureModel): string | null {
  for (const element of model.elements) {
    if (element.L <= 0) return `Elemento ${element.id}: la longitud debe ser mayor que cero.`
    if (element.E <= 0) return `Elemento ${element.id}: E debe ser mayor que cero.`
    if (element.I <= 0) return `Elemento ${element.id}: I debe ser mayor que cero.`
    if (element.nodeI === element.nodeJ) return `Elemento ${element.id}: los nodos deben ser distintos.`
  }

  for (const load of model.elementLoads) {
    const element = model.elements.find((item) => item.id === load.elementId)
    if (!element) return `Carga en elemento inexistente ${load.elementId}.`
    if (load.type === 'point') {
      const position = load.position ?? element.L / 2
      if (position <= 0 || position >= element.L) {
        return `Carga puntual en elemento ${load.elementId}: posición fuera del tramo.`
      }
    }
  }

  return null
}
