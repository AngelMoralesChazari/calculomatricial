export interface StructNode {
  id: number
  label: string
  restrained: boolean
}

export interface BeamElement {
  id: number
  nodeI: number
  nodeJ: number
  E: number
  I: number
  L: number
}

export type LoadType = 'udl' | 'point'

export interface ElementLoad {
  id: number
  elementId: number
  type: LoadType
  value: number
  position?: number
}

export interface NodalLoad {
  nodeId: number
  moment: number
}

export interface StructureModel {
  nodes: StructNode[]
  elements: BeamElement[]
  elementLoads: ElementLoad[]
  nodalLoads: NodalLoad[]
}
