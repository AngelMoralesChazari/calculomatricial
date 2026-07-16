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

export interface ElementForceResult {
  elementId: number
  nodeI: number
  nodeJ: number
  momentI: number
  momentJ: number
  shear: number
}

export interface AnalysisResult {
  dofLabels: string[]
  freeDofIndices: number[]
  restrainedDofIndices: number[]
  elementStiffness: { elementId: number; matrix: number[][] }[]
  globalStiffness: number[][]
  loadVector: number[]
  partitioned: {
    Kdd: number[][]
    Kdr: number[][]
    Krd: number[][]
    Krr: number[][]
    Fd: number[]
    Fr: number[]
  }
  KddInverse: number[][]
  displacements: number[]
  freeDisplacements: number[]
  reactions: number[]
  elementForces: ElementForceResult[]
  fixedEndForces: { elementId: number; forces: [number, number] }[]
}
