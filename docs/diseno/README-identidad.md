# Handoff: identidad Rappi en RappiMind v3

## Overview

RappiMind v3 es la herramienta interna con la que un comercial genera los Términos y Condiciones de una campaña promocional respondiendo preguntas simples, sin pasar por Legal. Este handoff cubre **solo la capa visual**: aplicar la identidad de marca de Rappi al front existente, conservando intactos el flujo, las preguntas, el DOM y el texto legal.

El entregable de diseño son 8 pantallas principales navegables. El resto del producto (Travel, T&C ya publicados, multitienda, errores en vivo, portugués y celular) todavía no está diseñado con la identidad nueva.

## About the Design Files

Los archivos de este bundle son **referencias de diseño hechas en HTML**: prototipos que muestran la apariencia y el comportamiento buscados, no código de producción para copiar. `RappiMind Identidad.dc.html` usa estilos inline y un runtime de prototipado; la implementación real vive en `src/client/estilos.css` del repo de RappiMind, que es una hoja de estilos basada en variables CSS.

La tarea es **trasladar los valores del prototipo al sistema de variables CSS existente**, no reemplazar la hoja ni introducir un framework. El front se sirve desde Google Apps Script (`HtmlService`): un solo archivo, sin bundler, sin dependencias de npm en runtime.

## Fidelity

**High-fidelity.** Colores, tipografía, radios, sombras, espaciados y transiciones son finales. Reprodúcelos con exactitud.

## Design Tokens

### Color

| Token | Valor | Uso |
|---|---|---|
| `--grad-neon` | `linear-gradient(135deg,#FF7A4D 0%,#FF2526 55%,#FF4583 100%)` | Botón primario, franja del header, indicador seleccionado, paneles de momento, píldora de estado completo/publicado |
| `--neon` | `#FF2526` | Texto de acento, enlaces, borde de campo con valor, anillo de foco |
| `--tinta` | `#0A0A0A` | Texto principal, pasos ya hechos |
| `--gris-lapiz` | `rgba(10,10,10,.55)` | Ayudas, notas, nav inactiva |
| `--papel` | `#FFFFFF` | Tarjetas, hoja del documento, barra superior |
| `--niebla` | `#F4F5F6` | Fondo de página, bloques de código |
| `--borde` | `rgba(10,10,10,.10)` | Divisores, borde de tarjeta |
| `--borde-control` | `rgba(10,10,10,.18)` | Borde de campo sin valor |
| `--beige` | `#FFF0DD` | Huecos del documento, panel de pendientes, chip de versión, nav activa, hero de inicio |
| `--celeste` | `#D9F1FF` | Panel de "¿Por qué te preguntamos esto?", calculadora |
| `--lavanda` | `#F4F0FC` | Marca de "Opcional" |

Reglas de la marca: el neón **siempre** como gradiente, nunca plano de fondo. Un pastel por pieza; nunca dos pasteles sin el neón presente. Texto negro sobre pastel, blanco sobre gradiente. El verde y el rojo existentes se quedan solo para validación de campo.

### Tipografía

Una sola familia: `'PP Object Sans', 'Archivo', system-ui, sans-serif`. Archivo (Google Fonts) es el respaldo hasta que PP Object Sans esté servida.

| Elemento | Tamaño | Peso | Tracking |
|---|---|---|---|
| Display de inicio | 60px / 0.98 | 900 | −0.045em |
| H1 de pantalla | 34–40px / 1.05 | 900 | −0.04em |
| Panel de momento | 46px / 1.0 | 900 | −0.045em |
| Título de pregunta | 23px / 1.25 | 800 | −0.025em |
| Título de tarjeta | 20–21px | 900 | −0.025em |
| Cuerpo | 15–17px | 500 | normal |
| Ayuda de pregunta | 14.5px | 500 | normal |
| Etiqueta de sección | 12–13px, mayúsculas | 900 | .07em |
| Texto del documento | 13px / 1.7 | 400 | normal |
| Hueco del documento | 11.5px | 700 | normal |

### Espaciado, radios, sombras, movimiento

- Escala de 4px. La existente (`--e1..--e8`) se conserva.
- Radios: campos y tarjetas 12px, paneles 14px, paneles de momento 20px, botones y chips 9999px.
- Sombras: `0 1px 4px rgba(10,10,10,.08)` (hoja), `0 4px 16px rgba(10,10,10,.10)` (tarjeta seleccionada o en hover).
- Entrada de pregunta: `opacity 0→1` + `translateY(14px→0)`, 380–600ms, `cubic-bezier(.16,1,.3,1)`.
- Controles: 200ms ease. Destello del dato recién cambiado: `rgba(255,122,77,.45)` → transparente, 900ms. Sin rebote.

## Screens / Views

### 1. Inicio
El comercial lee la promesa en tres pasos y decide si arranca una campaña nueva o retoma el borrador.

Columna central de 1120px. Hero de radio 20px en `--beige`, padding 56px, con el bigote de Rappi a 320px de ancho y 10% de opacidad anclado abajo a la derecha. Dentro: chip blanco "LEGAL · PROMOCIONES", el display a 60px/900, una barra de 96×6px con el gradiente, el subtítulo a 19px/500, y los botones "Empezar" (primario) y "Seguir mi borrador" (secundario, solo si hay borrador guardado). Debajo, tres tarjetas blancas de radio 16px en grid `auto-fit minmax(260px,1fr)`, cada una con su número en `--neon` a 13px/900 y el texto de los tres pasos.

### 2. Filtro de entrada
Dos preguntas de sí/no. Si alguna es sí, va a la pantalla de Legal y no sigue.

Columna de 760px. H1 a 40px/900. Cada pregunta con título a 22px/800 y dos tarjetas en grid de 2 columnas, 18px de padding, texto a 17px/800. Seleccionada: fondo `--beige`, borde `--neon`, `--sombra-md`. "Continuar" queda deshabilitado hasta responder las dos.

### 3. Formulario (una pregunta por pantalla, 6 pasos)
Grid de dos columnas iguales, 48px de gap, ancho máximo 1480px. Izquierda las preguntas, derecha el documento en `position: sticky` a 92px del tope.

Arriba de la columna izquierda: "Paso 4 de 6 · Beneficio" a 13px/700, y las 6 barras de progreso de 4px con su etiqueta a 11.5px. Luego el H1 del paso, el título de la pregunta, la ayuda, el control, el `<details>` de "¿Por qué te preguntamos esto?" (panel `--celeste`, radio 12px), la calculadora cuando aplica (panel `--celeste`, 15px/700), la línea "Quedan N preguntas en este paso." y la fila de botones Atrás / Siguiente.

Controles: opciones como tarjetas de 16px de padding en grid `22px minmax(0,1fr)` con el indicador de 20px (círculo para radio, radio 6px para casilla) relleno con el gradiente al seleccionar. Campos de texto, fecha, hora y moneda a 17px/600, radio 12px, con el símbolo de moneda dentro del campo. Bajo los campos con cifra, el panel "ASÍ QUEDA EN EL DOCUMENTO" en `--niebla`.

Panel del documento: encabezado con "Tu T&C" a 15px/900 y la píldora del contador. La hoja es blanca, radio 14px, padding 36/38px, `max-height: calc(100vh - 170px)` con scroll. Los datos respondidos en peso 700; los que faltan como píldoras beige con subrayado punteado. El dato que acaba de cambiar destella 900ms.

### 4. Resumen
Mismo grid de dos columnas. A la izquierda, seis tarjetas blancas de radio 14px, una por paso, con la etiqueta en mayúsculas a 13px/900 y "Editar" en `--neon`; dentro, filas en grid `1.3fr 1fr` separadas por divisores de 1px. Los valores que faltan salen en `--neon`; los opcionales sin responder, "Sin restricción" en gris. Debajo, la casilla de confirmación en tarjeta blanca, y el panel beige "TE FALTA:" con lo pendiente. "Generar T&C" está deshabilitado mientras falte algo o la casilla esté sin marcar.

### 5. Listo
Columna de 900px. Panel de radio 20px con `--grad-neon`, texto blanco, el bigote al 16% arriba a la derecha, H1 a 46px/900, el número de solicitud y "Abrir el documento" en botón blanco. Debajo: tres tarjetas de datos copiables (título del evento, dirección, fechas) con el valor en monoespaciada sobre `--niebla` y un botón "Copiar" que pasa a "Copiado" en negro; los 10 pasos de publicación en Squarespace, cada uno con su número en círculo beige y la línea "Deberías ver:"; el panel beige de quién puede publicar; y la tarjeta para pegar el enlace y marcar como publicado.

### 6. Mis campañas
Columna de 1120px. Tabla en tarjeta de radio 16px: encabezado sobre `--niebla` con etiquetas a 11.5px/900 en mayúsculas, y filas en grid `2.2fr 70px 120px 130px 150px`. El estado es una píldora: beige para "Generado", gradiente con texto blanco para "Publicado". Vacío: "Todavía no has generado ninguna campaña."

### 7. Legal (bloqueo)
Columna de 720px. Tarjeta blanca de radio 20px con una franja vertical de 6px con el gradiente en el borde izquierdo, chip beige "CASO PARA LEGAL", H1 a 38px/900, dos párrafos y los botones "Ir al formulario" y "Volver al inicio". El tono es de caso a revisar, no de error.

### 8. Ayuda
Columna de 900px. El bloque de azar va con `--grad-neon` y texto blanco, radio 16px. Después, tres secciones de lista: "Sirven para esta herramienta" en blanco, "No sirven: las redacta Legal" en `--beige`, "Consúltalo igual" en `--lavanda`, cada ítem con un punto de 6px en `--neon`. Cierra con la prueba simple en panel `--celeste` y la tarjeta de quién puede publicar.

## Interactions & Behavior

- Nav superior con 4 secciones; la activa es píldora beige. "Generar" vuelve al resumen si ya hay campaña generada, y al inicio si no.
- Filtro: cualquier "Sí" desvía a Legal. Las dos respuestas son obligatorias para continuar.
- Formulario: una pregunta por pantalla. "Siguiente" se bloquea si la pregunta es obligatoria y no tiene respuesta; en la última del recorrido el botón dice "Ver el resumen". "Atrás" en la primera pregunta vuelve al filtro.
- Preguntas condicionales: "¿Cuántas veces?" aparece con "Varias veces"; "¿Qué día se vencen los Créditos?" con "Hasta una fecha"; "¿Cuántos días?" con "Durante unos días".
- El documento se regenera en cada respuesta. Cada dato que falta es un hueco con su etiqueta propia; el contador dice "Sin empezar", "Falta 1 dato", "Faltan N datos" o "Completo".
- Los campos de moneda y número aceptan solo dígitos y se muestran con separador de miles.
- "Copiar" cambia la etiqueta a "Copiado" y aplica fondo negro.
- "Marcar como publicado" se habilita solo con un enlace escrito, y pasa el estado del historial a la píldora con gradiente.

## State Management

Estado del cliente, sin backend nuevo: pantalla actual, índice de la pregunta, mapa de respuestas, restricciones de tipo de pedido (multi-selección), respuestas del filtro, casilla de confirmación, claves en destello, dato copiado, enlace publicado, y si ya se generó la campaña. La lista de preguntas se filtra por las condicionales antes de indexar, así que el índice siempre se resuelve contra la lista visible.

## Assets

- `assets/rappi-logo.png` — logo Rappi, a 19px de alto en la barra superior.
- `assets/rappi-bigote.png` — bigote, marca de agua decorativa en inicio (10%) y listo (16%).

Ambos vienen del design system de RappiAds (`assets/logo/`). Como el front se sirve por Apps Script, van en base64 dentro del HTML o en una URL estable de Rappi.

Tipografía: PP Object Sans (Regular/Medium/Bold/Heavy) está en el design system como `.otf`/`.ttf`. No está en Google Fonts; Archivo es el respaldo aprobado.

## Files

- `PROMPT.md` — el prompt listo para pegar en Claude Code.
- `RappiMind Identidad.dc.html` — prototipo navegable con las 8 pantallas. Referencia de diseño.
- `RappiMind Logo.dc.html` — especificación de marca del lockup: corona + Mind + firma **By Legal** en píldora con el gradiente, centrada bajo el conjunto. Incluye construcción con medidas, las cuatro versiones de fondo, los cuatro tamaños con sus reducciones, las reglas de uso y los usos incorrectos.
- `assets/` — logo y bigote.

**Advertencia de versión:** el prototipo se construyó sobre `FRONT_ACTUAL.html`, la foto estática del DOM que genera `npm run front`, no sobre el código real de `src/client/`. Es probable que el front haya cambiado desde esa foto. El repo es la fuente de verdad del código; este bundle es la fuente de verdad del diseño. `PROMPT.md` explica cómo resolver las diferencias.

En el repo de RappiMind: `src/client/estilos.css` (la hoja real), `docs/DISENO.md` (el sistema documentado), `modelos/` (texto legal), `npm run front` (genera `FRONT_ACTUAL.html`).
