export const analysisSteps = [
  {
    title: '1. Idealización de la estructura',
    description:
      'Se numeran nodos y elementos. Cada nodo tiene un grado de libertad rotacional (θ). Los apoyos empotrados restringen esa rotación.',
  },
  {
    title: '2. Matrices de rigidez de cada elemento',
    description: 'Para cada viga: k = (EI/L) · [[4, 2], [2, 4]]',
  },
  {
    title: '3. Ensamblaje de la matriz de rigidez global',
    description: 'Se superponen las contribuciones de cada elemento según sus nodos de conexión.',
  },
  {
    title: '4. Matriz de cargas del sistema',
    description: 'F = cargas nodales − fuerzas de empotramiento perfecto (FEMP).',
  },
  {
    title: '5. Inversión de la submatriz Kdd',
    description: 'Se invierte la submatriz asociada a los grados de libertad libres.',
  },
  {
    title: '6. Desplazamientos nodales',
    description: '[Dd] = [Kdd]⁻¹ · [Fd]',
  },
  {
    title: '7. Reacciones en apoyos',
    description: '[FR] = [Krd] · [Dd] + [Frd]',
  },
  {
    title: '8. Fuerzas internas en elementos',
    description: '[Pi] = [ki] · [Di] + [Pemp] para cada elemento.',
  },
] as const
