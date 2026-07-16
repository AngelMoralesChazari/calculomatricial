export const analysisSteps = [
  {
    title: 'Definición de datos de entrada',
    description:
      'Geometría, propiedades (E, I, L), conectividad de nodos y grados de libertad. Estos datos alimentan las matrices de rigidez locales.',
  },
  {
    title: 'Matrices de rigidez locales de cada elemento',
    description:
      'Para cada viga se calcula ki = (EI/L)·[[4, 2], [2, 4]]. Cada fila/columna se mapea a los G.L. globales de sus nodos extremos.',
  },
  {
    title: 'Momentos de empotramiento perfecto (Fki)',
    description:
      'Fuerzas y momentos fijos en los extremos por cargas en la barra (p. ej. wL²/12). Se envían al vector de carga del sistema.',
  },
  {
    title: 'Vector de carga del sistema (Fk)',
    description:
      'Fk = cargas nodales − Fki. Es el lado derecho de F = K·D, solo en grados de libertad libres.',
  },
  {
    title: 'Ensamble de la matriz de rigidez del sistema (K₁₁) e inversa',
    description:
      'Se superponen las rigideces locales en una matriz N×N; se extrae K₁₁ (G.L. libres) y se calcula K₁₁⁻¹. Aquí nace la matriz global.',
  },
  {
    title: 'Solución de desplazamientos y giros',
    description: 'D = K₁₁⁻¹ · Fk. Se obtienen las rotaciones (rad) de los nodos libres.',
  },
  {
    title: 'Fuerzas internas y reacciones',
    description:
      'En cada elemento: Fi = ki·Di + Fki. Las reacciones en apoyos: FR = Krd·Dd + Frd.',
  },
] as const
