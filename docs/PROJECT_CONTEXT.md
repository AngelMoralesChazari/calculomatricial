# Contexto del proyecto — Calculomatricial

Documento de referencia para desarrolladores e IAs. Refleja el código existente en el repositorio (no un roadmap aspiracional).

## 1. Objetivo general

**Calculomatricial** es una aplicación web educativa/profesional para **ingeniería civil** que resuelve vigas (continuas / hiperestáticas) mediante el **método de rigidez matricial**, mostrando el procedimiento **paso a paso** (matrices, vectores, desplazamientos, reacciones y fuerzas internas).

No es un BIM, ni un solver comercial completo: es un **motor pedagógico en el navegador** con UI moderna.

## 2. Funcionalidades clave (implementadas)

| Función | Dónde |
|---------|--------|
| Definir nodos (libres / empotrados θ=0) | `StructureInput`, `StructNode` |
| Definir elementos viga (E, I, L, conectividad i–j) | `BeamElement` |
| Cargas en barra: UDL y puntual | `ElementLoad` (`udl` \| `point`) |
| Momentos nodales | `NodalLoad` |
| Diagrama SVG de la estructura | `BeamDiagram` |
| Ejemplos precargados (2 y 3 vanos) | `data/defaultExample.ts`, `continuousExample.ts` |
| Validación de entrada | `lib/analysis/validate.ts` |
| Análisis completo | `lib/analysis/analyze.ts` |
| Visualización de 7 pasos + matrices matemáticas | `AnalysisSteps`, `MatrixDisplay` |
| Deploy estático | `vercel.json` |

## 3. Mapa de módulos principales

```
┌─────────────────────────────────────────────────────────┐
│  App.tsx                                                │
│  Estado: model, result, error, activeTab                │
│  Acciones: loadExample, runAnalysis                     │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
        ┌───────▼────────┐    ┌───────▼──────────────┐
        │ components/    │    │ lib/structuralAnalysis│
        │ (UI)           │    │  → analysis/          │
        └────────────────┘    └───────┬───────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              matrix/           stiffness/         types/
              (álgebra)         (ki, Fki)          (contratos)
```

### `src/lib/matrix/`

Operaciones numéricas: crear, sumar, multiplicar, extraer submatriz, invertir (Gauss-Jordan con pivoteo), formatear.

### `src/lib/stiffness/`

- `elementStiffnessMatrix(E,I,L)` → `k = (EI/L)·[[4,2],[2,4]]`
- `fixedEndMoments` / `computeElementFixedEndForces` → FEMP (UDL: ±wL²/12; puntual: fórmulas Mi/Mj clásicas)

### `src/lib/analysis/`

- `validateStructure` → errores de datos (mensajes en español)
- `analyzeStructure` → ensamble KTG, partición Kdd/Krd/…, D = Kdd⁻¹·Fd, reacciones, fuerzas internas

### `src/types/`

- `model.ts`: entrada (`StructureModel`)
- `results.ts`: salida (`AnalysisResult`)
- `structure.ts`: reexport barrel

### `src/components/`

UI navy/blanco: cabecera, formularios, diagrama, pasos, matrices, cards.

### `src/data/`

Textos de pasos, unidades y ejemplos; no contienen lógica de cálculo.

## 4. Flujo del método (7 pasos de UI)

Alineado con `src/data/analysisSteps.ts` y el motor:

1. **Datos de entrada** — geometría, E/I/L, conn, G.L., cargas  
2. **Matrices locales ki** — con mapeo a G.L. globales  
3. **Fki** — momentos de empotramiento perfecto  
4. **Fk** — vector de carga (nodales − Fki)  
5. **Ensamble KTG / K₁₁ e inversa** — aquí se presenta la matriz global  
6. **D = K₁₁⁻¹ · Fk** — giros de nodos libres  
7. **Fi = ki·Di + Fki** y **FR = Krd·Dd + Frd**

## 5. Reglas de negocio críticas

Detectadas en código; cualquier cambio debe preservarlas o actualizar validación + tests mentales:

1. **Un G.L. por nodo**: rotación θ. `restrained: true` ⇒ θ = 0 (apoyo empotrado a rotación).
2. **Mínimos**: ≥ 2 nodos, ≥ 1 elemento; al menos **un G.L. libre**.
3. **Propiedades**: `E > 0`, `I > 0`, `L > 0`; `nodeI ≠ nodeJ`.
4. **Carga puntual**: posición estrictamente dentro del tramo `(0, L)`.
5. **Vector de carga**: `F = −Fki` ensamblado + momentos nodales añadidos.
6. **Sistema**: solo se resuelve sobre G.L. libres (`Kdd`, `Fd`).
7. **Singularidad**: `invert` lanza si el pivote es &lt; `1e-12` (estructura mal condicionada / mecanismo).
8. **Fuerzas internas**: `Mi, Mj` desde `k·d + Fki`; cortante `V = (Mi + Mj) / L`.
9. **Unidades** del sistema documentadas en `units.ts` / README; mantener consistencia al ampliar.
10. **Alcance actual**: no modelar axiales, cortantes independientes de flexión, pórticos 2D ni diagonales/armaduras hasta ampliar el dominio de tipos y `stiffness/`.

## 6. Stack y despliegue (hechos)

- React 19, TypeScript ~6, Vite 8, Tailwind 4, oxlint  
- Build: `tsc -b && vite build` → `dist/`  
- Vercel: framework Vite, rewrite SPA a `index.html`

## 7. Fuera de alcance hoy

- Backend, autenticación, base de datos  
- Persistencia / exportación a Excel  
- Diagramas V/M graficados (solo valores numéricos de V y M extremos)  
- Multidioma  

## 8. Cómo extender con seguridad

1. Ampliar `types/model.ts` y `results.ts`.  
2. Implementar fórmulas en `lib/stiffness` (y matrix si hace falta).  
3. Actualizar `analyze.ts` + `validate.ts`.  
4. Ajustar UI de entrada y los 7 pasos / copy en `data/analysisSteps.ts`.  
5. Correr `npm run build`.
