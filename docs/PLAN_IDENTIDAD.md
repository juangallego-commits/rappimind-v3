# Cambio de identidad del front: análisis y plan

Escrito el 21 de septiembre de 2026, antes de tocar una línea de `src/client/`.
Es el análisis de los insumos que dejó Juan en Drive contra el código real, y el
plan que sale de ahí. Nada de esto está implementado.

La regla que manda sobre todo lo demás: **es un cambio de piel, no de producto**.
El recorrido, las preguntas, los textos y el documento generado se quedan como
están. Lo que no se puede tocar está en `docs/PARA_EL_DISENO.md`.

---

## 1. Qué llegó y qué falta

En la carpeta de Drive hay cinco cosas:

| Archivo | Qué es | Estado |
|---|---|---|
| `# Prompt para Claude Code.md` | La especificación de la identidad, completa | Leída |
| `prompt` (documento) | El puntero al proyecto de Claude Design | Leído |
| `pdf nuevo.pdf` | Las ocho pantallas del prototipo, exportadas | Leído |
| `RappiAds.zip` (102 MB) | El bundle con el prototipo y el sistema de diseño | **Sin abrir** |
| `Identidad corporativa Rappi (1).zip` (447 KB) | Los assets de marca | **Sin abrir** |

Los dos ZIP no se pudieron abrir desde esta sesión. La política de salida a
internet bloquea `drive.google.com`, y la única vía alterna deja el archivo
entero dentro de la conversación, que para 102 MB no es viable.

Eso no frena el análisis, porque **el prompt trae la especificación de tokens
completa** y el PDF muestra las ocho pantallas. Pero sí hace falta el bundle
antes de implementar, por los valores exactos que el prompt no lista y por los
assets. Lo que se necesita está en la sección 7.

## 2. La buena noticia

El prompt no es un encargo vago: es una especificación. Trae la paleta con
valores, los radios, las sombras, los tiempos, las reglas por componente y el
movimiento. Y trae algo mejor todavía, que es la regla de lectura correcta:
**leer la intención de diseño y volver a tomarla sobre el código real**, no
copiar el prototipo. Eso es exactamente lo que hace falta, porque el prototipo
se construyó sobre una foto pasada de `FRONT_ACTUAL.html` y el código siguió
cambiando.

Y el repo está preparado. `src/client/estilos.css` usa 184 veces `var(--)` y
solo tiene seis colores crudos fuera de `:root`. El JavaScript del cliente nunca
escribe HTML: arma el DOM con `crear()` y pone clases semánticas. O sea que casi
toda la identidad entra por la hoja de estilos, sin abrir un archivo de
`src/client/js/`.

## 3. Los cinco hallazgos que hay que decidir antes de empezar

### 3.1 Contraste: cinco valores del prompt no llegan al mínimo que el propio prompt exige

El prompt pone como regla dura "contraste mínimo 4.5:1 en texto de cuerpo". Con
la fórmula de WCAG 2.1, cinco de los valores que especifica no lo alcanzan.

**a. Texto blanco sobre el gradiente.** Es el botón primario, el componente más
usado de la aplicación.

| Punto del gradiente | Blanco encima | Tinta `#0A0A0A` encima |
|---|---|---|
| `#FF7A4D` (0%) | 2.58:1 | 7.68:1 |
| `#FF2526` (55%) | 3.79:1 | 5.23:1 |
| `#FF4583` (100%) | 3.27:1 | 6.06:1 |

El blanco no pasa en ningún punto del recorrido. Hay dos salidas. Oscurecer el
gradiente hasta que el blanco pase lo mata: `#FF7A4D` tendría que bajar a
`#BA5938`, que ya no es neón. **La salida que conserva el neón intacto es texto
tinta sobre el gradiente**, que pasa con holgura en los tres puntos.

Esto no es nuevo: `docs/DISENO.md` ya documenta que blanco sobre `#FF441F` da
3.44:1 y por eso hoy existen dos naranjas. Es el mismo problema, con otra paleta.

**b. `--gris-lapiz: rgba(10,10,10,.55)`.** Da 4.42:1 sobre blanco y entre 4.22 y
4.30 sobre los pasteles. Hoy `#5D626D` da 6.12:1. Importa porque el gris lápiz es
el color de todas las ayudas y de los "¿por qué te preguntamos esto?", que es
texto que el comercial sí lee.

Arreglo barato: **subir el alfa de .55 a .57**. Con eso pasa sobre los cinco
fondos de la paleta. La diferencia a ojo es imperceptible.

**c. `--neon #FF2526` como texto de acento y enlaces.** Da 3.79:1 sobre blanco.
Hoy los enlaces son `#D32F0F` con 5.02:1. Como anillo de foco sí sirve, porque
ahí el mínimo es 3:1 y lo pasa. El problema aparece solo cuando lleva texto.

**d. `--borde-control: rgba(10,10,10,.18)`.** Da 1.5:1. WCAG pide 3:1 para el
contorno de un control, que es lo que le dice a alguien dónde empieza y termina
un campo. Hoy `#767E8C` da 4.09:1. Para llegar a 3:1 el alfa tendría que subir a
.44, que es un cambio visible: los campos se verían bastante más marcados que en
el prototipo.

**e. El subrayado punteado del hueco, `rgba(255,37,38,.6)` sobre beige.** Da
2.32:1. Es la señal de que falta un dato, o sea el elemento que sostiene la
promesa central del producto.

### 3.2 La barra de progreso no tiene seis pasos

El prompt describe "la barra de progreso de los 6 pasos". El código tiene trece
pasos definidos, y cada tipo de campaña muestra un subconjunto distinto:

| Tipo de campaña | Pasos que se ven |
|---|---|
| Promoção Brasil | 5 |
| Cashback por ETA | 6 |
| Cashback | 8 |
| Carrera de Compras | 8 |
| Descuento Travel | 8 |
| Cashback Day | 8 |
| Cashback Travel | **9** |

Seis es el caso del Cashback por ETA, probablemente el que vio quien diseñó.

Y hay un antecedente escrito en la propia hoja de estilos: con seis pasos
entraban justos, y al entrar el séptimo "Organizador" y "Cuándo" se leían
pegados. Por eso hoy `.progreso` usa `flex-wrap: wrap` con `min-width: 82px`, o
sea que los pasos pasan a una segunda fila cuando no caben. El diseño del
prototipo, una barra de 4px por paso en una sola fila con la etiqueta recortada
por `text-overflow`, reintroduce el defecto que ya se había arreglado. Con nueve
pasos en una pantalla de 360px cada barra queda por debajo de 35px y la etiqueta
no se lee.

La regla de diseño se mantiene (barras, no subrayados; el actual con gradiente).
Lo que hay que rehacer es cómo se comporta cuando no caben.

### 3.3 Quitar el borde izquierdo de los avisos borra una distinción que hoy existe

El prompt pide quitar el borde izquierda de color porque la marca no usa ese
patrón, y reemplazarlo por paneles pastel: celeste para informativo, beige para
pendiente.

El problema es que hoy `.aviso` y `.aviso-serio` **se distinguen solo por el
color de ese borde**. Comparten fondo, radio, tipografía y espaciado; lo único
que cambia es `border-left-color`. Si se quita el borde sin más, los dos avisos
quedan idénticos y se pierde la diferencia entre "ten esto en cuenta" y "esto es
serio".

Además hoy hay tres situaciones, no dos: aviso normal, aviso serio y mensaje de
error de campo. El prompt propone dos pasteles. Falta decidir el mapeo.

### 3.4 Renombrar tokens rompe pruebas que hoy pasan

`pruebas/estilos.test.js` afirma literalmente que la regla del selector de idioma
lleva `background: var(--naranja-marca)` y `color: #fff`. Si `--naranja-marca`
desaparece en favor de `--neon`, esa prueba falla. La prueba existe por un defecto
real: se escribió `var(--marca)` en lugar de `--naranja-marca`, la variable no
existía, y el botón del idioma elegido quedó con texto blanco sobre fondo blanco,
o sea invisible.

Hay otra prueba en el mismo archivo que mide el `bottom` del selector de idioma
contra el `padding` de `.pagina` en celular, para que la última fila de botones no
quede tapada. Si cambian los espaciados, hay que rehacer esa cuenta.

Esto no es un obstáculo: es la red que hace seguro el cambio. Pero las pruebas
hay que actualizarlas en el mismo commit que renombra los tokens, no después.

### 3.5 Tipografía y assets: lo que Apps Script no perdona

**PP Object Sans no está en Google Fonts.** El prompt lo sabe y propone Archivo
como respaldo. La consecuencia hay que decirla claro: **mientras no tengamos el
archivo de la fuente servido, toda la aplicación se va a ver en Archivo**, que es
otra tipografía. No es un respaldo que se active en casos raros; es lo que va a
ver todo el mundo.

Además el `Index.html` de hoy carga Lato 400 y 700 y Poppins 500 y 600. La nueva
especificación pide cuatro pesos, incluido 900. Hay que cambiar esa carga.

**Los PNG del logo.** El prompt ya resuelve bien que van en base64 dentro del
HTML o en una URL estable de Rappi, porque Apps Script no sirve archivos del
repo. Falta medir cuánto engorda el HTML, y el prompt mismo pide el SVG limpio
en sus cuatro versiones antes de implementar el lockup.

## 4. Cobertura: ocho pantallas de cuarenta y seis

El prototipo cubre ocho pantallas. `docs/FRONT_ACTUAL.html` tiene cuarenta y seis.

Cubiertas: inicio, filtro, una pregunta, resumen, listo, publicar, historial y
legal.

Sin cubrir, y son las de más riesgo de quedar a medias: las pantallas de Travel
(filtro de nueve preguntas, tipos, productos, condiciones), Brasil y el selector
de idioma, la ampliación de una campaña, el país en pruebas, el acuerdo de datos,
la administración, la ayuda, el error, los T&C genéricos y las tres vistas de
celular.

A eso se suman los estados, que casi ningún prototipo dibuja y que en esta hoja
son diecisiete clases: `.elegida`, `.abierta`, `.actual`, `.hecho`, `.falta`,
`.campo-error`, `.opcion-vencida`, `.opcion-nota-vencido`, `.mensaje-error`,
`.mensaje-ok`, `.estado-generado`, `.estado-publicado`, `.aviso-serio`,
`.te-falta`, `.marca-opcional`, `.hoja-vacia` y `.hoja-deslizable`, más hover,
foco y deshabilitado.

Nota aparte sobre `.estado-publicado`: el prompt pide que el verde salga del
historial y lo reemplace una píldora con gradiente. Es un cambio de significado,
no solo de color, porque hoy el verde es lo que distingue una campaña publicada
de una generada.

## 5. El plan

**Fase 0. La foto del antes.** Correr `npm run front` y el script de capturas de
la skill `flujo-y-ux`, y guardar fuera del repo el `textos.json` que sale. Ese
archivo tiene el texto literal de cada pantalla, línea por línea. Al final, si el
diff de ese archivo sale vacío, queda demostrado que el flujo, el contenido y las
preguntas no se movieron y que lo único que cambió fue la pintura.

**Fase 1. Las decisiones de la sección 3.** No se escribe CSS hasta que estén
resueltas. Son de Juan, no técnicas.

**Fase 2. El bloque `:root`, y nada más.** Un commit con los tokens nuevos, las
pruebas de `estilos.test.js` actualizadas en el mismo commit, y los seis colores
crudos que hoy viven fuera de `:root` subidos a token. Sin esto último el hover
del botón se queda con el naranja viejo.

**Fase 3. La tipografía.** Cambiar la carga de fuentes del `Index.html`, quitar
el par Poppins y Lato, y pasar la hoja completa a una sola familia con sus cuatro
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
pantalla dentro de `#app`, la región `#anuncios` y el foco al título al cambiar
de pantalla.

En cada commit, `npm test`. Después de cada fase, `npm run front` y la lista de
qué pantallas cambiaron de aspecto, incluidas las que el prototipo no cubría.
Todo se ve con `npm run demo`, que abre con doble clic. Cero `clasp push` hasta
que esté aprobado.

## 6. Lo que este cambio le rompe a `docs/DISENO.md`

`docs/DISENO.md` es el sistema visual actual y queda obsoleto casi entero: la
paleta de seis colores, los dos naranjas, el par Poppins y Lato, la escala
tipográfica y la idea de que la hoja del documento es la única superficie
elevada. Lo que sí sobrevive es el razonamiento de contraste, que es justo lo que
esta identidad vuelve a necesitar. Se reescribe al cerrar la fase 4, no antes.

## 7. Lo que hace falta de Juan

**Para empezar, las decisiones de la sección 3.** Sobre todo la del texto sobre
el gradiente, que afecta a todos los botones.

**Para implementar, el contenido del bundle.** No hace falta el ZIP completo, solo
estos archivos, que pesan kilobytes:

- `RappiMind Identidad.dc.html`
- `RappiMind Logo.dc.html`
- `README.md`
- `_ds/rappiads-320eb0f0-3743-47ea-be7c-9c867652c5dc/styles.css`
- `_ds/rappiads-320eb0f0-3743-47ea-be7c-9c867652c5dc/tokens/colors.css`
- `_ds/rappiads-320eb0f0-3743-47ea-be7c-9c867652c5dc/tokens/fonts.css`
- `_ds/rappiads-320eb0f0-3743-47ea-be7c-9c867652c5dc/tokens/spacing.css`
- `_ds/rappiads-320eb0f0-3743-47ea-be7c-9c867652c5dc/tokens/typography.css`

Tres vías, cualquiera sirve: el botón "Send to Claude Code Web" de Claude Design,
que siembra el proyecto directo; descomprimir y subir esos archivos a
`docs/diseno/`; o descomprimir en Drive, que los archivos sueltos sí se pueden
leer.

**Para el lockup, el SVG limpio** en sus cuatro versiones más el favicon, que el
propio prompt pide antes de implementar.

**Y una pregunta abierta del prompt:** cuáles pantallas de cierre califican como
"momento". El prompt nombra el inicio, el "Tu T&C está listo" y el bloque de azar
de la ayuda. Hoy también existen la pantalla de Legal, la de error y la del país
en pruebas.
