# Insumos del cambio de identidad

Material de referencia, no código: nada de esta carpeta se sube a Apps Script ni
entra en el build. Lo que la aplicación usa de verdad vive en
`src/client/tokens/` y `src/client/assets/`.

## Ojo: esta carpeta se recortó el 22 de septiembre de 2026

Pesaba 6,6 MB de los 12,11 MB de todo el repositorio, y con eso el repositorio
no se podía leer de una sola vez. **Se quedó lo que el código cita y lo que registra
una medición o una decisión. Se fue el material de entrega**, que ya está
aplicado y que no lee ni el build ni una prueba:

| Lo que se fue | Qué era |
|---|---|
| `pdf nuevo.pdf` | 4,38 MB, el brand book en PDF |
| `assets/` | PP Object Sans en OTF y TTF, los PNG del logotipo y los SVG del lockup. La aplicación tiene su propia copia recortada en `src/client/assets/` |
| `sistema/` | El RappiAds Design System navegable, con su andamiaje |
| `RappiMind Identidad.dc.html`, `RappiMind Estados.dc.html`, `RappiMind Logo.dc.html` | El prototipo de Claude Design, y `support.js` y `styles.css`, que necesitaba para abrirse |
| `README.md`, `README-identidad.md`, `PROMPT-identidad.md` | Los papeles del traspaso |

**Nada de eso se perdió: está en el historial de git.** El último commit que lo
contiene es `b07e0cb`, la punta de main antes del recorte, y cualquier archivo se
recupera con

```
git show b07e0cb:"docs/diseno/pdf nuevo.pdf" > "pdf nuevo.pdf"
git show b07e0cb:"docs/diseno/RappiMind Estados.dc.html" > estados.html
```

Los documentos que quedaron siguen nombrando esos archivos, porque describen lo
que se midió sobre ellos. Eso es a propósito y no es un error: cuando un texto de
aquí cite un `.dc.html`, un `.png` o una fuente, se recupera con el comando de
arriba. Por lo mismo, `tokens/fonts.css` pide `../assets/fonts/` y esa carpeta ya
no está: esa hoja es la entrega original y nadie la carga, la que sirve la
aplicación es `src/client/tokens/fonts.css`, que pide el `woff2` que sí existe.

## Qué quedó

| Archivo | Qué es |
|---|---|
| `ESPECIFICACION_ESTADOS.md` | Los estados, los tres niveles de aviso, el progreso de 5 a 9 pasos y los contrastes medidos. **Es el que hay que leer primero.** Lo cita `pruebas/estilos.test.js` |
| `AUDITORIA_CONTRASTE.md` | Los 28 pares medidos y los 6 arreglos. Se reproduce con `npm run contraste`, que la nombra en pantalla |
| `MEDICION_FUENTES.md` | Cuánto cuesta cada peso de PP Object Sans incrustado. La cita `src/client/Index.html` |
| `MEDICION_LOGOTIPO.md` | Por qué el logotipo de la barra es `rappi-logo-web-224.png` y no otro. Es la decisión 119 |
| `DECISIONES.md` | Las decisiones de diseño de la entrega, tal como llegaron |
| `RONDA3_AUDITORIAS.md` | Los cuatro informes de la ronda 3 de auditoría, con su evidencia |
| `tokens/` | Los cinco archivos de tokens **como llegaron de Claude Design**. La decisión 103 los conserva sin tocar: `src/client/tokens/` es lo que se sirve, y estos son el original contra el que se compara |

## Cuál fuente manda cuando dos se contradicen

1. **El Rappi Brand Book**, que ya no está aquí en PDF pero sigue siendo la marca.
2. **`ESPECIFICACION_ESTADOS.md`**, que resuelve lo que el brand book no cubre.
3. **El prototipo**, para los valores exactos de lo que sí está dibujado. Se
   recupera del historial.

Con una excepción que ya está peleada y resuelta: **el campo con valor lleva
borde tinta, no neón**. El prototipo los pintaba los dos en neón y no se
distinguían del campo en error.

## Lo que no se lee de aquí

El texto legal, las preguntas, el recorrido y el copy. Nada de eso cambia con el
diseño. Está en `modelos/`, en `src/core/preguntas.js` y en
`docs/PARA_EL_DISENO.md`, que es donde están los intocables de accesibilidad.
