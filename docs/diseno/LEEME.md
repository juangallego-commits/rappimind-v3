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

## Cómo está organizada

```
docs/diseno/
  AUDITORIA_CONTRASTE.md    los 28 pares medidos y los 6 arreglos. Se reproduce con npm run contraste
  ESPECIFICACION_ESTADOS.md los estados, los avisos y el progreso
  styles.css                importa los cinco tokens, en orden
  tokens/                   los cuatro del design system mas rappimind.css, que va AL FINAL
  assets/fonts/             PP Object Sans, cuatro pesos, en OTF y TTF
  assets/logo/              rappi-logo-220.png es el de la barra superior
  assets/lockup/            cuatro versiones mas favicon, en SVG y PNG
  *.dc.html                 el prototipo. Estados, Identidad y Logo
  support.js                lo necesitan los .dc.html para abrirse
  README.md, README-identidad.md, PROMPT-identidad.md, DECISIONES.md   del traspaso
  sistema/                  el RappiAds Design System navegable
```

Los `.dc.html` buscan `./support.js` y `assets/` por ruta relativa, y `styles.css`
busca `tokens/`, así que nada de esto se puede mover de sitio sin romperlo.

El `readme.md` del design system está en `sistema/` y no en la raíz a propósito:
al lado del `README.md` del traspaso chocarían en Windows, que es el sistema de
referencia del proyecto según la decisión 0.

El que hay que leer primero es `ESPECIFICACION_ESTADOS.md`.

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
