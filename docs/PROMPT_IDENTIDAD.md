# Encargo: aplicar la identidad de Rappi al front

Este archivo es el encargo completo para la sesión que implementa el cambio de
identidad. Léelo entero antes de tocar nada.

**Es un cambio de piel, no de producto.** El recorrido, las preguntas, los textos
y el documento generado se quedan exactamente como están. Si un cambio de estilo
te obliga a mover una pregunta, cambiar una palabra o alterar el flujo, para y
pregunta.

## Lo que ya está decidido. No lo vuelvas a abrir

| Dónde | Qué dice |
|---|---|
| `docs/PLAN_IDENTIDAD.md` | El análisis completo: nueve hallazgos, la cobertura y el plan por fases |
| `docs/diseno/ESPECIFICACION_ESTADOS.md` | Los estados, los tres niveles de aviso y el progreso de 5 a 9 pasos |
| `docs/diseno/AUDITORIA_CONTRASTE.md` | Los 28 pares medidos y los 6 que hay que arreglar antes de dar nada por bueno |
| `docs/DECISIONES.md` 98 | El botón primario va con texto blanco a 19px peso 700 sobre el gradiente recortado al 17% |
| `docs/DECISIONES.md` 99 | La tipografía se decide con el peso medido |
| `docs/PARA_EL_DISENO.md` | Lo que no se puede tocar, que es producto y no estética |

Y antes de tocar código, dos skills obligatorias: `.claude/skills/flujo-y-ux/`
para cualquier cosa que el comercial vea, y `.claude/skills/frontera-apps-script/`
para el build y todo lo que cruza al navegador.

## La prueba de que no rompiste el producto

Antes de escribir una línea, genera la foto del antes:

```
npm run front
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/capturar-pantallas.js
```

Guarda el `textos.json` que sale **fuera del repositorio**, en el scratchpad.
Tiene el texto literal de cada pantalla, línea por línea.

> **Al final, el diff de ese archivo tiene que salir vacío.** Si sale vacío,
> está demostrado que el flujo, el contenido y las preguntas no se movieron y
> que lo único que cambió fue la pintura. Si no sale vacío, algo se rompió y hay
> que encontrarlo antes de seguir.

Esta es la vara. No es opcional y no se reemplaza con "se ve bien".

---

## Cómo se reparte el trabajo

Hay una restricción que manda sobre el reparto: **`src/client/estilos.css` es un
solo archivo**. Varios agentes escribiéndolo a la vez se pisan. Así que:

- **Leer, medir y auditar se paraleliza.**
- **Escribir la hoja lo hace la sesión principal, en secuencia.**

### Ronda 1 · Cuatro agentes en paralelo, todos de solo lectura

Ninguno escribe en `src/`. Cada uno entrega un informe.

**Agente TOKENS.** Lee los cinco archivos de `docs/diseno/tokens/` en su orden de
importación (`fonts`, `colors`, `typography`, `spacing`, y `rappimind.css` al
final, que pisa a los anteriores). Entrega el mapeo completo de cada una de las 44
variables de `:root` de `src/client/estilos.css`: cuál cambia de valor, cuál se
agrega, cuál sobra y cuál se queda. Incluye los seis colores crudos que hoy viven
fuera de `:root` (`#b82a0c` en el hover del botón, `#ffd2c4` en el destello,
`#fff` en el selector de idioma y tres sombras `rgba`), que tienen que subir a
token o el rebrand los deja atrás. Marca explícitamente los dos tokens de neón que
hacen falta: `--neon` para lo que no lleva texto y `--neon-texto` `#D91F20` para lo
que sí.

**Agente ESTADOS.** Lee `docs/diseno/RappiMind Estados.dc.html` y
`docs/diseno/ESPECIFICACION_ESTADOS.md`. Entrega, para cada una de las diecisiete
clases de estado de la hoja, los valores exactos que le tocan: `.elegida`,
`.abierta`, `.actual`, `.hecho`, `.falta`, `.campo-error`, `.opcion-vencida`,
`.opcion-nota-vencido`, `.mensaje-error`, `.mensaje-ok`, `.estado-generado`,
`.estado-publicado`, `.aviso-serio`, `.te-falta`, `.marca-opcional`,
`.hoja-vacia`, `.hoja-deslizable`, más hover, foco y deshabilitado. Si el
prototipo no dibuja alguno, dedúcelo de la regla y **márcalo como deducido**.

**Agente COBERTURA.** Corre `npm run front` y compara las 46 pantallas de
`docs/FRONT_ACTUAL.html` con las ocho que cubre el prototipo. Entrega la lista de
las 38 que hay que resolver por regla, ordenadas por riesgo, y para cada una qué
componentes usa. Las de más riesgo son Travel, Brasil con su selector de idioma,
la ampliación, el acuerdo de datos y las tres vistas de celular.

**Agente ASSETS.** Convierte las fuentes de `docs/diseno/assets/fonts/` a woff2
recortadas a latín y latín extendido (el comando de `pyftsubset` está en el README
del bundle), mide el resultado y entrega el número final: cuánto pesan los cuatro
pesos en woff2, cuánto en base64, y cuánto crecería el HTML servido. Con ese
número se cierra la decisión 99. Mide también `rappi-logo-220.png` en base64. Este
agente sí escribe, pero solo en `docs/diseno/`, nunca en `src/`.

### Ronda 2 · La sesión principal escribe la hoja, en secuencia

Un commit por fase, `npm test` verde en cada uno, y `npm run front` al cerrar cada
fase con la lista de qué pantallas cambiaron de aspecto.

1. **`:root` y nada más.** Los tokens nuevos, los seis colores crudos subidos a
   token, y **las pruebas de `pruebas/estilos.test.js` actualizadas en este mismo
   commit**. Esa prueba afirma literalmente `var(--naranja-marca)` y `color: #fff`
   en la regla del selector de idioma; si renombras el token y no la tocas, falla.
   Existe por un defecto real donde el botón del idioma quedó invisible, así que
   actualízala, no la borres.
2. **Tipografía.** La carga de fuentes en `src/client/Index.html` (hoy pide Lato
   400 y 700 y Poppins 500 y 600), fuera el par Poppins y Lato, y la hoja entera a
   una sola familia con sus cuatro pesos. Va sola porque toca todas las pantallas.
3. **Botones y campos.** Aquí aterriza la decisión 98: primario a 19px peso 700,
   texto blanco, gradiente arrancando en el 17%. Y la regla nueva del campo con
   valor, que lleva borde tinta y no neón.
4. **Barra de progreso.** Una fila, un segmento por paso, etiquetas que se caen
   todas a la vez si hay más de seis pasos o si un segmento baja de 88px, y el
   nombre del paso actual en la línea de encima. Pruébalo con Cashback Travel, que
   es el de nueve pasos, y con Promoção Brasil, que es el de cinco.
5. **Opciones, glosario, hoja del documento y huecos.**
6. **Avisos y estados del historial.** Los tres niveles por estructura, la regla de
   un solo pastel por pieza, y el historial sin verde.
7. **Resumen, tablas, pantalla final y celular.**
8. **Paneles de momento y lockup.** Al final porque dependen de los assets.

Reglas duras de esta ronda:

- **Cero cambios en `src/client/js/`**, salvo que una regla del diseño lo exija.
  Si pasa, para y pregunta antes de tocarlo.
- **Cero cambios en `modelos/`, `data/` y `src/core/`.** Nada de ahí es estilo.
- **Cero estilos en línea y cero clases nuevas en el JavaScript.** Todo vive en
  la hoja.
- **Los `@import` de los tokens no sobreviven a Apps Script**, que sirve la hoja
  embebida en un solo `<style>`. El build tiene que concatenar los cinco archivos
  en orden, con `rappimind.css` al final. Si esto se hace mal, los valores se
  pierden en silencio, que es exactamente el modo de falla de la skill
  `frontera-apps-script`.
- **Nada de `clasp push` ni `clasp deploy`.** Todo se ve con `npm run demo`, que
  abre con doble clic.

### Ronda 3 · Cinco auditores en paralelo, todos de solo lectura

Corren sobre el resultado final. Cada uno entrega hallazgos con archivo y línea,
no impresiones.

1. **CONTRASTE.** Empieza por `npm run contraste`, que mide los veintiocho pares de
   la paleta contra WCAG 2.1 leyendo los valores de `docs/diseno/tokens/` y devuelve
   1 mientras quede alguno sin arreglar. Los seis que hoy no llegan, con su arreglo,
   están en `docs/diseno/AUDITORIA_CONTRASTE.md`. Cuando eso esté en verde, busca
   los pares que la lista todavía no cubre y agrégalos a `PARES` en
   `scripts/contraste.js`, con su mínimo y, si se acepta por debajo, con la nota que
   explique por qué. Texto normal 4.5:1, texto grande 3:1 desde 18.66px en negrita,
   bordes de control e indicadores de foco 3:1. Los componentes inactivos están
   exentos.
2. **ACCESIBILIDAD.** Foco visible en todo control, un `h1` por pantalla dentro de
   `#app`, la región `#anuncios` intacta, el foco al título al cambiar de pantalla,
   y ningún texto visible con un guion usado como signo de puntuación. Las pruebas
   de `pruebas/interfaz_accesible.test.js` cubren parte de esto; el agente busca lo
   que no cubren.
3. **COBERTURA.** Recorre las 46 pantallas de `FRONT_ACTUAL.html` y busca las que
   quedaron a medias: un componente con estilo nuevo al lado de uno con estilo
   viejo, un color huérfano, una pantalla que el prototipo no cubría y que nadie
   miró.
4. **FRONTERA APPS SCRIPT.** Que el build concatene los tokens en orden, que no
   quede ningún `@import` en `dist/Estilos.html`, que las fuentes y el logo entren
   en base64 y carguen, que `dist/` se reconstruya idéntico dos veces, y que el
   HTML servido no haya crecido más de lo que dijo el agente ASSETS.
5. **FIDELIDAD.** Compara el resultado contra el prototipo y contra la
   especificación. Reporta dónde se desvió y si la desviación está justificada por
   una decisión escrita o si es criterio de quien programó.

### Ronda 4 · El revisor

Un agente, al final. Lee los cinco informes de auditoría, el diff completo de la
rama y **el diff del `textos.json`**. Da un veredicto por escrito: qué está listo,
qué está a medias y qué se rompió. No arregla nada, reporta. Su informe es lo que
Juan lee.

---

## Lo que tienes que preguntarle a Juan, y no decidir solo

1. **Qué pantallas califican como "momento"** y llevan panel grande. La
   especificación nombra el inicio, el "Tu T&C está listo" y el bloque de azar de
   la ayuda. Hoy también existen la pantalla de Legal, la de error y la del país
   en pruebas.
2. **El resultado de la medición de fuentes**, para cerrar la decisión 99: la
   familia completa, un subconjunto de pesos, o Archivo como respaldo.
3. **Cualquier punto donde el prototipo y el código real se contradigan** y no
   haya una regla que lo resuelva. Ahí no elijas: cuenta qué encontraste y qué
   recomiendas.

## Lo que no hace falta preguntar

Ya está resuelto y escrito: el texto de los botones, los tres niveles de aviso,
el historial sin verde, la barra de progreso con más de seis pasos, el campo con
valor en borde tinta, el deshabilitado sin `opacity`, y que los íconos actuales se
quedan porque el brand book no define ninguno.

## Al cerrar

- `docs/PROGRESO.md` con qué quedó, cómo probarlo y qué falta.
- `docs/DISENO.md` reescrito. Hoy describe el sistema viejo y queda obsoleto casi
  entero. Lo que sobrevive es el razonamiento de contraste.
- `docs/DECISIONES.md` con lo técnico que se haya decidido en el camino.
