# Calculomatricial

Calculadora web de **análisis estructural** por el **método de rigidez matricial** para ingeniería civil.

## Características

- Idealización de nodos y elementos (vigas)
- Matrices de rigidez por elemento: `k = (EI/L) · [[4,2],[2,4]]`
- Ensamblaje de matriz global
- Cálculo de fuerzas de empotramiento (carga distribuida y puntual)
- Resolución de desplazamientos: `[Dd] = [Kdd]⁻¹ · [Fd]`
- Reacciones y fuerzas internas en elementos
- Visualización paso a paso de los 8 procedimientos del análisis

## Tecnologías

- React + TypeScript
- Vite
- Tailwind CSS

## Inicio rápido

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador.

## Unidades

| Magnitud | Unidad |
|----------|--------|
| Módulo de elasticidad (E) | MPa |
| Inercia (I) | m⁴ |
| Longitud (L) | m |
| Cargas | kN, kN/m |
| Momentos | kN·m |
| Rotaciones | rad |
