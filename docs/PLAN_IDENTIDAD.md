# Cambio de identidad del front: análisis y plan

Escrito el 21 de septiembre de 2026, antes de tocar una línea de `src/client/`.
Es el análisis de los insumos que dejó Juan contra el código real, y el plan que
sale de ahí. Nada de esto está implementado.

La regla que manda sobre todo lo demás: **es un cambio de piel, no de producto**.
El recorrido, las preguntas, los textos y el documento generado se quedan como
están. Lo que no se puede tocar está en `docs/PARA_EL_DISENO.md`.

---

## 1. Qué llegó y qué falta

**Del prompt** (`# Prompt para Claude Code.md`, en Drive) salió la especificación
de la identidad aplicada a RappiMind: paleta, radios, sombras, tiempos, reglas por
componente y método de trabajo. Está completa y bien pensada.

**Del bundle** (`docs/diseno/`, subido a GitHub) llegó el **RappiAds Design
System**, derivado del Rappi Brand Book 2026. Esa es la fuente de marca de verdad,
y resuelve varias cosas que el prompt daba por sabidas.

**Lo que todavía falta**, y hace falta para implementar:

| Falta | Para qué | Peso |
|---|---|---|
| `tokens/colors.css`, `fonts.css`, `typography.css`, `spacing.css` | Los valores literales. Hoy `styles.css` los importa y no están | kilobytes |
| `assets/fonts/` (PP Object Sans, cuatro pesos) | Sin esto la app entera se ve en la tipografía de respaldo | ver 3.5 |
| `assets/logo/rappi-logo.png` y `rappi-bigote.png` | La barra superior y la marca de agua del inicio | kilobytes |
| `RappiMind Identidad.dc.html` | El prototipo de las ocho pantallas. Es otro proyecto, no está en este bundle | |
| `RappiMind Logo.dc.html` más el SVG limpio | El lockup. El propio prompt lo pide antes de implementar | |

Los dos ZIP de Drive no se pudieron abrir desde aquí: la política de salida a
internet bloquea `drive.google.com`.

## 2. La buena noticia

El repo está preparado. `src/client/estilos.css` usa 184 veces `var(--)` y solo
tiene seis colores crudos fuera de `:root`. El JavaScript del cliente nunca
escribe HTML: arma el DOM con `crear()` y pone clases semánticas. Casi toda la
identidad entra por la hoja de estilos, sin abrir un archivo de `src/client/js/`.

Y el prompt trae la regla de lectura correcta: **leer la intención de diseño y
volver a tomarla sobre el código real**, no copiar el prototipo. Hace falta,
porque el prototipo se construyó sobre una foto pasada de `FRONT_ACTUAL.html` y
el código siguió cambiando.

## 3. Los hallazgos que hay que decidir antes de empezar

### 3.1 El texto blanco sobre el gradiente no puede cumplir AA. En ningún punto.

Este es el hallazgo grande, y ahora es más serio que cuando solo tenía el prompt,
porque **no es una invención del prototipo: es regla del brand book**. El readme
del sistema de diseño dice, textualmente, `Neon/gradient → white only`.

Medido con la fórmula de WCAG 2.1 a lo largo del gradiente
`#FF7A4D → #FF2526 → #FF4583`:

| Punto | Color | Blanco encima |
|---|---|---|
| 0% | `#FF7A4D` | 2.58:1 |
| 20% | `#FF5B3F` | 3.08:1 |
| 55% | `#FF2526` | 3.79:1 (el máximo de todo el tramo) |
| 100% | `#FF4583` | 3.27:1 |

**El blanco nunca llega a 4.5:1.** El máximo de todo el gradiente es 3.79:1. No
es que falte afinar un tono: el mínimo para texto normal no se alcanza en ningún
punto. Y el propio prompt pone como regla dura "contraste mínimo 4.5:1".

Hay tres salidas, y la primera cumple las dos cosas a la vez:

**a. Botón primario con texto grande.** WCAG baja el mínimo a 3:1 cuando el texto
es grande, que en negrita significa 18.66px o más. El blanco alcanza 3:1 **desde
el 17% del gradiente en adelante** (o sea desde `#FF6041`). Entonces: el botón
lleva su texto a 19px en peso 700, y el gradiente del botón arranca en ese 17% en
lugar de en el naranja claro. Se respeta "blanco sobre gradiente", se cumple AA, y
el neón se conserva. El costo es que los botones crecen: hoy son de 15px.

**b. Texto tinta sobre el gradiente.** Pasa con holgura (5.23:1 en el rojo, 7.68:1
en el naranja) pero contradice el brand book.

**c. Aceptar la desviación** y dejarla escrita en `docs/DECISIONES.md`.

Recomiendo la **a**. Y conviene saber que esto no es nuevo: `docs/DISENO.md` ya
documenta que blanco sobre `#FF441F` da 3.44:1, y por eso hoy existen dos
naranjas. Es el mismo problema con otra paleta.

### 3.2 Otros cuatro valores que no llegan al mínimo

**`--gris-lapiz: rgba(10,10,10,.55)`.** Da 4.42:1 sobre blanco y entre 4.22 y 4.30
sobre los pasteles. Hoy `#5D626D` da 6.12:1. Importa porque es el color de todas
las ayudas y de los "¿por qué te preguntamos esto?", que es texto que el comercial
sí lee. **Arreglo barato: subir el alfa de .55 a .57** y pasa sobre los cinco
fondos. A ojo no se nota.

**`--neon #FF2526` como texto de acento y enlaces.** Da 3.79:1 sobre blanco. Hoy
los enlaces son `#D32F0F` con 5.02:1. Como anillo de foco sí sirve, porque ahí el
mínimo es 3:1. El problema aparece solo cuando lleva texto encima.

**`--borde-control: rgba(10,10,10,.18)`.** Da 1.5:1. WCAG pide 3:1 para el
contorno de un control, que es lo que le dice a alguien dónde empieza y termina un
campo. Hoy `#767E8C` da 4.09:1. Para llegar a 3:1 el alfa tendría que subir a .44,
que sí es un cambio visible.

**El subrayado punteado del hueco, `rgba(255,37,38,.6)` sobre beige.** Da 2.32:1.
Es la señal de que falta un dato, o sea lo que sostiene la promesa central del
producto.

### 3.3 La barra de progreso no tiene seis pasos

El prompt describe "la barra de progreso de los 6 pasos". El código tiene trece
pasos definidos, y cada tipo de campaña muestra un subconjunto distinto:

| Tipo de campaña | Pasos que se ven |
|---|---|
| Promoção Brasil | 5 |
| Cashback por ETA | 6 |
| Cashback, Carrera de Compras, Descuento Travel, Cashback Day | 8 |
| Cashback Travel | **9** |

Seis es el caso del Cashback por ETA, probablemente el que vio quien diseñó.

Y hay un antecedente escrito en la propia hoja de estilos: con seis pasos entraban
justos, y al entrar el séptimo "Organizador" y "Cuándo" se leían pegados. Por eso
hoy `.progreso` usa `flex-wrap: wrap` con `min-width: 82px`, o sea que los pasos
pasan a una segunda fila cuando no caben. El diseño del prototipo, una barra de
4px por paso en una sola fila con la etiqueta recortada, reintroduce el defecto que
ya se había arreglado: con nueve pasos en una pantalla de 360px cada barra queda
por debajo de 35px.

La regla de diseño se mantiene (barras, no subrayados; el actual con gradiente).
Lo que hay que rehacer es cómo se comporta cuando no caben.

### 3.4 Quitar el borde izquierdo de los avisos borra una distinción que hoy existe

El brand book lo confirma: `No decorative borders as brand device (no
left-border-only accent cards)`. O sea que el borde se va, no hay discusión.

El problema es otro. Hoy `.aviso` y `.aviso-serio` **se distinguen solo por el
color de ese borde**. Comparten fondo, radio, tipografía y espaciado. Si se quita
sin más, los dos quedan idénticos y se pierde la diferencia entre "ten esto en
cuenta" y "esto es serio".

Y hay una restricción del brand book que complica el reemplazo: `One secondary +
Neon = valid. Two secondaries without Neon = not allowed.` **Un solo pastel por
pieza.** El plan del prompt usa beige para pendientes y huecos, celeste para
explicaciones y lavanda para lo opcional, que en varias pantallas coinciden. Hay
que decidir el mapeo pantalla por pantalla, no solo por componente.

### 3.5 Tipografía y assets: lo que Apps Script no perdona

**PP Object Sans no está en Google Fonts**, pero sí está en el bundle
(`assets/fonts/`, cuatro pesos). O sea que sí se puede servir. Como Apps Script no
sirve archivos del repo, los cuatro pesos tienen que ir en base64 dentro del HTML.
Eso hay que medirlo antes: cuatro pesos de una tipografía suelen pesar entre 100 y
400 KB, y eso se suma a cada carga de la aplicación.

Si el peso no da, el respaldo es Archivo desde Google Fonts, como propone el
prompt. Pero hay que decirlo claro: **si se sale sin la fuente, toda la aplicación
se ve en Archivo**, que es otra tipografía. No es un respaldo que se active en
casos raros; es lo que vería todo el mundo.

Además el `Index.html` de hoy carga Lato 400 y 700 y Poppins 500 y 600. La nueva
especificación pide cuatro pesos, incluido 900. Hay que rehacer esa carga.

### 3.6 Renombrar tokens rompe pruebas que hoy pasan

`pruebas/estilos.test.js` afirma literalmente que la regla del selector de idioma
lleva `background: var(--naranja-marca)` y `color: #fff`. Si `--naranja-marca`
desaparece en favor de `--neon`, esa prueba falla. Existe por un defecto real: se
escribió `var(--marca)` en lugar de `--naranja-marca`, la variable no existía, y el
botón del idioma elegido quedó con texto blanco sobre fondo blanco, o sea
invisible.

Otra prueba del mismo archivo mide el `bottom` del selector de idioma contra el
`padding` de `.pagina` en celular, para que la última fila de botones no quede
tapada. Si cambian los espaciados, hay que rehacer esa cuenta.

No es un obstáculo: es la red que hace seguro el cambio. Pero las pruebas se
actualizan en el mismo commit que renombra los tokens, no después.

### 3.7 Diferencias menores entre el prompt y el brand book

Ninguna es grave, pero conviene resolverlas de una vez:

| Cosa | El prompt dice | El brand book dice |
|---|---|---|
| Ángulo del gradiente | `135deg` | `−45° base` |
| Radio de panel y hoja | 14px y 16px | Tarjetas 12px, prominentes y modales 20px |
| Sombras | `rgba(10,10,10,...)` | `rgba(0,0,0,...)` |
| Texto sobre pasteles | `--tinta #0A0A0A` | Negro puro `#000000` |

Lo del ángulo importa: `135deg` y `−45deg` en CSS apuntan a lados distintos.

### 3.8 Los íconos se quedan como están

El brand book **no define un sistema de íconos**: el propio readme dice que usa
Lucide como sustituto provisional. RappiMind ya tiene los suyos, SVG de un solo
trazo en `TRAZOS` (`src/client/js/10-util.js`), que es justo el estilo que pide la
marca. Se quedan. Una cosa menos que cambiar.

## 4. Cobertura: ocho pantallas de cuarenta y seis

El prototipo cubre ocho pantallas. `docs/FRONT_ACTUAL.html` tiene cuarenta y seis.

Cubiertas: inicio, filtro, una pregunta, resumen, listo, publicar, historial y
legal.

Sin cubrir, y son las de más riesgo de quedar a medias: las pantallas de Travel
(filtro de nueve preguntas, tipos, productos, condiciones), Brasil y el selector de
idioma, la ampliación de una campaña, el país en pruebas, el acuerdo de datos, la
administración, la ayuda, el error, los T&C genéricos y las tres vistas de celular.

A eso se suman los estados, que casi ningún prototipo dibuja y que en esta hoja son
diecisiete clases: `.elegida`, `.abierta`, `.actual`, `.hecho`, `.falta`,
`.campo-error`, `.opcion-vencida`, `.opcion-nota-vencido`, `.mensaje-error`,
`.mensaje-ok`, `.estado-generado`, `.estado-publicado`, `.aviso-serio`,
`.te-falta`, `.marca-opcional`, `.hoja-vacia` y `.hoja-deslizable`, más hover, foco
y deshabilitado.

Nota aparte sobre `.estado-publicado`: el prompt pide que el verde salga del
historial y lo reemplace una píldora con gradiente. Es un cambio de significado, no
solo de color, porque hoy el verde es lo que distingue una campaña publicada de una
generada.

## 5. El plan

**Fase 0. La foto del antes.** Correr `npm run front` y el script de capturas de la
skill `flujo-y-ux`, y guardar fuera del repo el `textos.json` que sale. Ese archivo
tiene el texto literal de cada pantalla, línea por línea. Al final, si el diff sale
vacío, queda demostrado que el flujo, el contenido y las preguntas no se movieron y
que lo único que cambió fue la pintura.

**Fase 1. Las decisiones de la sección 3.** No se escribe CSS hasta que estén
resueltas. Son de Juan, no técnicas.

**Fase 2. El bloque `:root`, y nada más.** Un commit con los tokens nuevos, las
pruebas de `estilos.test.js` actualizadas en el mismo commit, y los seis colores
crudos que hoy viven fuera de `:root` subidos a token. Sin esto último el hover del
botón se queda con el naranja viejo.

**Fase 3. La tipografía.** Cambiar la carga de fuentes del `Index.html`, quitar el
par Poppins y Lato, y pasar la hoja completa a una sola familia con sus cuatro
pesos. Va sola porque toca todas las pantallas a la vez.

**Fase 4. Los componentes, por secciones de la hoja y con los nombres de clase
intactos.** En el orden en que `estilos.css` ya está seccionado: marca y barra
superior, botones, campos, opciones, progreso, glosario, hoja del documento,
resumen, tablas, celular, selector de idioma, pantalla final. Un commit por
sección.

**Fase 5. Los paneles de momento y el lockup.** Al final, porque dependen de los
assets y de la decisión de qué pantallas califican como momento.

**Fase 6. Lo que obligue a tocar el JavaScript.** Solo si el diseño pide una
estructura que hoy no existe. Pantalla por pantalla, con la skill `flujo-y-ux`
abierta, y cuidando el contrato de accesibilidad que ya está probado: un `h1` por
pantalla dentro de `#app`, la región `#anuncios` y el foco al título al cambiar de
pantalla.

En cada commit, `npm test`. Después de cada fase, `npm run front` y la lista de qué
pantallas cambiaron de aspecto, incluidas las que el prototipo no cubría. Todo se
ve con `npm run demo`, que abre con doble clic. Cero `clasp push` hasta que esté
aprobado.

## 6. Lo que este cambio le rompe a `docs/DISENO.md`

`docs/DISENO.md` es el sistema visual actual y queda obsoleto casi entero: la
paleta de seis colores, los dos naranjas, el par Poppins y Lato, la escala
tipográfica y la idea de que la hoja del documento es la única superficie elevada.
Lo que sí sobrevive es el razonamiento de contraste, que es justo lo que esta
identidad vuelve a necesitar. Se reescribe al cerrar la fase 4, no antes.

## 7. Lo que hace falta de Juan

**Para empezar, las decisiones de la sección 3.** La más importante es la 3.1, el
texto sobre el gradiente, porque afecta a todos los botones de la aplicación.

**Para implementar, lo que falta del bundle** (tabla de la sección 1): los cuatro
archivos de `tokens/`, la carpeta `assets/`, el prototipo `RappiMind Identidad` y
el lockup en SVG.

**Y una pregunta abierta del prompt:** cuáles pantallas de cierre califican como
"momento". El prompt nombra el inicio, el "Tu T&C está listo" y el bloque de azar
de la ayuda. Hoy también existen la pantalla de Legal, la de error y la del país en
pruebas.
