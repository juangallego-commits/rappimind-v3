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

**Lo que falta llegar al repositorio.** Claude Design ya lo produjo todo y está en
`Identidad corporativa Rappi (2).zip` (1.7 MB) en la carpeta de Drive. Contiene los
cinco archivos de `tokens/` (los cuatro del design system más `rappimind.css`, que
se importa al final), `assets/fonts/` con PP Object Sans en OTF y TTF,
`assets/logo/` con versiones reducidas para base64, `assets/lockup/` con las cuatro
versiones y el favicon, y los tres `.dc.html` del proyecto de identidad con su
`support.js`, incluido el nuevo `RappiMind Estados.dc.html`.

Las advertencias de entrega (fuentes sin convertir, qué logo usar, por qué el SVG
del lockup todavía no es autosuficiente) están en
`docs/diseno/ESPECIFICACION_ESTADOS.md`, sección 7.

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

### 3.2 Seis valores más que no llegan al mínimo

Al llegar los tokens de verdad se midió la paleta completa: veintiocho pares contra
WCAG 2.1. Veintitrés llegan, cuatro están exentos y **seis hay que arreglar**. Todos
tienen arreglo barato y ninguno obliga a renunciar a la identidad.

El más importante es el **anillo de foco**, que con `rgba(255,37,38,.45)` da 1.99:1
cuando necesita 3. El foco visible está en la lista de lo que no se puede tocar de
`docs/PARA_EL_DISENO.md`, y el anillo de hoy ya cumple con 3.44:1, así que dejarlo
así sería romper algo que funcionaba. Con el neón sólido llega a 3.79:1.

La tabla completa y los seis arreglos están en `docs/diseno/AUDITORIA_CONTRASTE.md`.
Se reproduce con `npm run contraste`, que devuelve 1 mientras quede alguno sin
arreglar.

### 3.3 La barra de progreso no tiene seis pasos · RESUELTO

El prompt describía seis pasos. El código tiene trece definidos y muestra entre
cinco y nueve según el tipo de campaña: Brasil 5, Cashback por ETA 6, Cashback y
Carrera y Descuento Travel y Cashback Day 8, Cashback Travel 9. Con nueve pasos en
una pantalla de 360px cada barra queda por debajo de 35px, que es el defecto que la
hoja de estilos ya había arreglado con `flex-wrap`.

**Resuelto** el 21 de septiembre: la barra se queda en una fila, las etiquetas por
paso se caen todas a la vez cuando hay más de seis pasos o cuando un segmento baja
de 88px, y el nombre del paso actual pasa a la línea de encima. Detalle en
`docs/diseno/ESPECIFICACION_ESTADOS.md`, sección 1.

### 3.4 Los avisos pierden su única distinción · RESUELTO

El brand book prohíbe el borde izquierdo de color, y hoy es lo único que distingue
`.aviso` de `.aviso-serio`. Además el brand book permite un solo pastel por pieza.

**Resuelto** el 21 de septiembre: los tres niveles se distinguen por estructura, no
por color, así que se reconocen en blanco y negro. Informativo es panel celeste sin
título; serio es panel beige con una regla de gradiente en el borde superior y
título en caja alta; el error de campo no lleva panel. Si dos coinciden, el de mayor
prioridad se queda con su pastel y el otro baja a tarjeta blanca. Detalle en
`docs/diseno/ESPECIFICACION_ESTADOS.md`, sección 2. Los estados del historial sin
verde están en la sección 3 del mismo archivo.

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

### 3.6 El mensaje de error en neón tampoco pasa

Es uno de los seis de 3.2 y se menciona aparte porque obliga a un token nuevo. El
mensaje va en neón `#FF2526` a 13.5px en peso 700, que para WCAG sigue siendo texto
normal, así que le toca 4.5:1 y da 3.79. El arreglo es `#D91F20`, el mismo neón al
85% de brillo, que da 5.04:1.

O sea que hacen falta **dos tokens de neón**: uno para lo que no lleva texto (bordes,
anillos, el gradiente) y otro para lo que sí. Es el mismo patrón que hoy tienen
`--naranja-marca` y `--naranja-accion`, y el mapeo de tokens tiene que contemplarlo
desde el principio.

### 3.7 Renombrar tokens rompe pruebas que hoy pasan

`pruebas/estilos.test.js` afirma literalmente que la regla del selector de idioma
lleva `background: var(--naranja-marca)` y `color: #fff`. Si `--naranja-marca`
desaparece en favor de `--neon`, esa prueba falla. Existe por un defecto real: se
escribió `var(--marca)`, la variable no existía, y el botón del idioma elegido quedó
con texto blanco sobre fondo blanco.

Otra prueba del mismo archivo mide el `bottom` del selector de idioma contra el
`padding` de `.pagina` en celular. Si cambian los espaciados, hay que rehacer la
cuenta.

No es un obstáculo: es la red que hace seguro el cambio. Pero las pruebas se
actualizan en el mismo commit que renombra los tokens, no después.

### 3.8 Diferencias menores entre el prompt y el brand book

Ninguna es grave, pero conviene resolverlas de una vez:

| Cosa | El prompt dice | El brand book dice |
|---|---|---|
| Ángulo del gradiente | `135deg` | `−45° base` |
| Radio de panel y hoja | 14px y 16px | Tarjetas 12px, prominentes y modales 20px |
| Sombras | `rgba(10,10,10,...)` | `rgba(0,0,0,...)` |
| Texto sobre pasteles | `--tinta #0A0A0A` | Negro puro `#000000` |

Lo del ángulo importa: `135deg` y `−45deg` en CSS apuntan a lados distintos.

### 3.9 Los íconos se quedan como están

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
