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
