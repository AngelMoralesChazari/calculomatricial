import type { StructureModel } from '../types/structure'

export const defaultStructure: StructureModel = {
  nodes: [
    { id: 1, label: '1', restrained: true },
    { id: 2, label: '2', restrained: false },
    { id: 3, label: '3', restrained: true },
  ],
  elements: [
    { id: 1, nodeI: 1, nodeJ: 2, E: 210000, I: 0.0001, L: 4 },
    { id: 2, nodeI: 2, nodeJ: 3, E: 210000, I: 0.0001, L: 3 },
  ],
  elementLoads: [{ id: 1, elementId: 1, type: 'udl', value: 10 }],
  nodalLoads: [],
}

export const continuousBeamExample: StructureModel = {
  nodes: [
    { id: 1, label: 'A', restrained: true },
    { id: 2, label: 'B', restrained: false },
    { id: 3, label: 'C', restrained: false },
    { id: 4, label: 'D', restrained: true },
  ],
  elements: [
    { id: 1, nodeI: 1, nodeJ: 2, E: 210000, I: 0.00015, L: 5 },
    { id: 2, nodeI: 2, nodeJ: 3, E: 210000, I: 0.00015, L: 4 },
    { id: 3, nodeI: 3, nodeJ: 4, E: 210000, I: 0.00015, L: 5 },
  ],
  elementLoads: [
    { id: 1, elementId: 1, type: 'udl', value: 12 },
    { id: 2, elementId: 2, type: 'point', value: 25, position: 2 },
    { id: 3, elementId: 3, type: 'udl', value: 8 },
  ],
  nodalLoads: [],
}

export const units = {
  E: 'MPa',
  I: 'm⁴',
  L: 'm',
  moment: 'kN·m',
  udl: 'kN/m',
  point: 'kN',
  rotation: 'rad',
  shear: 'kN',
}
