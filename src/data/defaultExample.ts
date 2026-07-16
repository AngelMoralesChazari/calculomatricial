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
