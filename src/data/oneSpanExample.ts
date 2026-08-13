import type { StructureModel } from '../types/structure'

export const oneSpanExample: StructureModel = {
  nodes: [
    { id: 1, label: '1', restrained: false, supportType: 'pinned' },
    { id: 2, label: '2', restrained: false, supportType: 'roller' },
  ],
  elements: [
    { id: 1, nodeI: 1, nodeJ: 2, E: 210000, I: 0.0001, L: 5 },
  ],
  elementLoads: [{ id: 1, elementId: 1, type: 'udl', value: 10 }],
  nodalLoads: [],
}
