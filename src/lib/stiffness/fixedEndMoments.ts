import type { BeamElement, ElementLoad } from '../../types/structure'

export function fixedEndMoments(element: BeamElement, load: ElementLoad): [number, number] {
  const { L } = element

  if (load.type === 'udl') {
    const w = load.value
    return [(w * L * L) / 12, -(w * L * L) / 12]
  }

  const a = load.position ?? L / 2
  const b = L - a
  const P = load.value
  const Mi = (P * b * b * a) / (L * L)
  const Mj = -(P * a * a * b) / (L * L)
  return [Mi, Mj]
}

export function computeElementFixedEndForces(
  element: BeamElement,
  loads: ElementLoad[],
): [number, number] {
  return loads
    .filter((load) => load.elementId === element.id)
    .reduce<[number, number]>(
      (acc, load) => {
        const fem = fixedEndMoments(element, load)
        return [acc[0] + fem[0], acc[1] + fem[1]]
      },
      [0, 0],
    )
}
