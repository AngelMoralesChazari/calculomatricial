import type { StructureModel } from '../../types/structure'

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
