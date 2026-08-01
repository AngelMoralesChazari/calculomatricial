export type ProfessionalTitle =
  | 'Ing.'
  | 'Arq.'
  | 'Mtro.'
  | 'Dr.'
  | 'Lic.'
  | 'Téc.'
  | 'Otro'

export interface ReportAuthor {
  name: string
  title: ProfessionalTitle
  career: string
}

export const PROFESSIONAL_TITLES: { value: ProfessionalTitle; label: string }[] = [
  { value: 'Ing.', label: 'Ingeniero / Ingeniera (Ing.)' },
  { value: 'Arq.', label: 'Arquitecto / Arquitecta (Arq.)' },
  { value: 'Mtro.', label: 'Maestro / Maestra (Mtro.)' },
  { value: 'Dr.', label: 'Doctor / Doctora (Dr.)' },
  { value: 'Lic.', label: 'Licenciado / Licenciada (Lic.)' },
  { value: 'Téc.', label: 'Técnico / Técnica (Téc.)' },
  { value: 'Otro', label: 'Otro' },
]

export const CAREER_SUGGESTIONS = [
  'Ingeniería Civil',
  'Ingeniería Civil Constructora',
  'Ingeniería Estructural',
  'Ingeniería Civil y Arquitectura',
  'Arquitectura',
] as const
