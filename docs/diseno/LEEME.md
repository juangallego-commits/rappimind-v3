# Insumos del cambio de identidad

Material de referencia, no código: nada de esta carpeta se sube a Apps Script ni
entra en el build.

## Qué hay

| Archivo | Qué es |
|---|---|
| `ESPECIFICACION_ESTADOS.md` | Los estados, los tres niveles de aviso, el progreso de 5 a 9 pasos y los contrastes ya medidos. **Es el que hay que leer primero** |
| `readme.md` | El RappiAds Design System, derivado del Rappi Brand Book 2026. La fuente de marca |
| `SKILL.md` | La definición de skill del design system, con las reglas de marca en corto |
| `styles.css` | La hoja de entrada del design system. Importa los cinco archivos de `tokens/` |
| `_ds_manifest.json`, `_ds_bundle.js`, `doc-page.js` | El andamiaje del design system. No se leen para implementar |
| `RappiAds-Design-System.html` y su versión de impresión | El design system navegable |

## Qué falta y dónde va

Está en `Identidad corporativa Rappi (2).zip`, en la carpeta de Drive. Al
descomprimirlo, esta es la estructura que la implementación espera:

```
docs/diseno/
  tokens/          fonts.css, colors.css, typography.css, spacing.css
                   y rappimind.css, que se importa AL FINAL y pisa a los otros
  assets/
    fonts/         PP Object Sans, cuatro pesos, en OTF y TTF
    logo/          rappi-logo-220.png (el de la barra), -440, y el bigote
    lockup/        cuatro versiones más favicon, en SVG y PNG a 3x
  prototipo/       los tres .dc.html con su support.js al lado
```

`styles.css` busca `tokens/` por ruta relativa, así que esa subcarpeta tiene que
llamarse así y estar al lado.

Los tres `.dc.html` necesitan `support.js` en la misma carpeta para abrirse.
El que resuelve los estados es `RappiMind Estados.dc.html`.

## Cuál fuente manda cuando dos se contradicen

1. **El Rappi Brand Book**, a través de `readme.md` y `SKILL.md`. Es la marca.
2. **`ESPECIFICACION_ESTADOS.md`**, que resuelve lo que el brand book no cubre
   y corrige al prototipo donde hace falta.
3. **Los `.dc.html`**, para los valores exactos de lo que sí está dibujado.
4. **El prompt original**, para entender la intención en lo que nadie dibujó.

Con una excepción que ya está peleada y resuelta: **el campo con valor lleva
borde tinta, no neón**. El prototipo los pintaba los dos en neón y no se
distinguían del campo en error.

## Lo que no se lee de aquí

El texto legal, las preguntas, el recorrido y el copy. Nada de eso cambia. Está
en `modelos/`, `src/core/preguntas.js` y `docs/PARA_EL_DISENO.md`.

## Por dónde se empieza

`docs/PROMPT_IDENTIDAD.md` es el encargo completo, con el reparto entre agentes
y las rondas de auditoría. `docs/PLAN_IDENTIDAD.md` es el análisis del que sale.
