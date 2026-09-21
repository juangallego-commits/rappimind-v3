# Sistema visual de RappiMind v3

Reescrito el 21 de septiembre de 2026, al cerrar el cambio de identidad. Antes
describía el sistema anterior, de dos naranjas y el par Poppins y Lato, que ya no
existe. Lo que sobrevivió intacto es la idea de la hoja de papel y el
razonamiento de contraste, que es justo lo que esta identidad vuelve a necesitar.

Para quien implemente: los valores no están aquí. Están en `src/client/tokens/`,
que son los cinco archivos que de verdad se sirven, y esta página explica por qué
son esos y no otros. Si un número de aquí no coincide con el token, manda el
token y esta página está vieja.

## La idea: el documento es una hoja de papel

Esto no cambió, y es lo que el rebrand tenía que respetar.

La pantalla tiene dos cosas y una sola protagonista. A la izquierda, las
preguntas, sobre el fondo gris de la página. A la derecha, **una hoja de papel
blanca**, y es el único elemento elevado de toda la aplicación. No es una tarjeta
más: es el documento, y se lee como papel.

Lo que hace que esto no parezca una plantilla es cómo se comporta esa hoja. El
T&C empieza escrito, con **huecos beige subrayados** donde falta un dato, como un
formulario de llenar los espacios. Cada hueco dice qué pregunta lo llena: "el
porcentaje", "el tope por pedido". Cuando el comercial responde, el hueco se
rellena con la frase legal de verdad y **destella un instante**, y la hoja se
desplaza hasta ahí.

El comercial nunca se pregunta para qué sirve lo que está escribiendo, porque lo
ve convertirse en el documento mientras lo escribe. Esa es toda la idea. Nada más
en la interfaz compite con ella, y por eso nada más lleva sombra.

Con la identidad nueva la hoja gana una señal más: **con la hoja vacía no hay
sombra, solo el borde**. La sombra entra cuando hay contenido de verdad, y ese
cambio es lo que marca que el documento arrancó.

## De dónde salen los colores

De `docs/diseno/tokens/`, que es lo que entregó Claude Design a partir del Rappi
Brand Book 2026, más `rappimind.css`, una quinta capa escrita para este traspaso
que cubre lo que el design system no define: estados de control, niveles de aviso
y estados de campaña.

Esa entrega **no es lo que se sirve**. Producción vive en `src/client/tokens/` y
lleva seis valores cambiados, que son los seis arreglos de
`docs/diseno/AUDITORIA_CONTRASTE.md`. Sin ellos, `npm run contraste` devuelve 1 con
nueve pares por debajo del mínimo. La entrega original se queda intacta para poder
volver a ella.

### El neón es dos colores, y la diferencia no es cosmética

| Token | Valor | Para qué |
|---|---|---|
| `--rm-neon` | `#FF2526` | Lo que **no** lleva texto encima: bordes, anillos, viñetas |
| `--rm-neon-texto` | `#D41D1E` | Lo que **sí** lo lleva: mensajes de error, enlaces, números |

El primero da 3.79:1 sobre papel, que es suficiente para un borde o un anillo,
donde WCAG pide 3. El segundo es el mismo neón hundido, y da 5.26 sobre papel,
4.82 sobre niebla, 4.70 sobre beige y 4.50 sobre celeste, que son los cuatro
fondos donde aparece. Un mensaje de error de 13.5px es texto normal y le toca 4.5,
así que con el neón plano no llegaba.

### El gradiente es tres gradientes, y por la misma razón

El gradiente de marca es `#FF7A4D → #FF2526 → #FF4583`. Con blanco encima da entre
2.58:1 y 3.79:1, y **ese 3.79 es el máximo de todo el tramo**: una letra normal en
blanco no llega a 4.5 en ningún punto. No es que falte afinar un tono.

| Token | Para qué |
|---|---|
| `--rm-grad` | Donde no hay nada encima |
| `--rm-grad-boton` | El botón primario, recortado al 17% del tramo |
| `--rm-grad-texto` | Donde hay algo encima y no puede crecer de tamaño |

El botón primario sale por el umbral de texto grande, que WCAG baja a 3:1 desde
18.66px en negrita: su texto va a **19px en peso 700** y el gradiente **arranca en
el 17%**, que es donde el blanco cruza ese 3:1. Los dos números van juntos; bajar
el tamaño o correr el recorte rompe la cuenta.

Eso sirve donde el texto puede crecer. La píldora de "Publicado" va a 13px dentro
de una tabla y no puede, así que lleva `--rm-grad-texto`: el mismo gradiente con
las tres paradas hundidas hasta que el blanco pasa 4.5:1 en **todo** el tramo. El
peor punto da 4.62:1, y conserva la señal, que es que Publicado sea el único
estado con gradiente.

## La letra

Dos familias, y la separación es mecánica y no de gusto.

**`--rm-display` es PP Object Sans**, y **solo vale en peso 900**. De esa familia
se sirve una sola cara, la Heavy, incrustada en base64 dentro de la hoja porque
Apps Script no sirve archivos del repositorio. Dentro de una familia, cuando el
peso pedido no existe el navegador elige el más cercano que sí exista: si esa
familia estuviera en la pila del cuerpo, pedir 400 devolvería la de 900 y la
aplicación entera saldría en Heavy sin que nada fallara. Lo cuida la prueba `una
familia de display solo se usa en peso 900`, que mira quién la declara **y quién
la hereda**.

**`--rm-texto-familia` es Archivo**, variable de 400 a 900, desde Google Fonts.
Cubre el cuerpo, los títulos de sección, los botones y las etiquetas.

Por qué solo una cara de la marca: los cuatro pesos pesan 89,8 KB en woff2 y
119,7 KB en base64, y el base64 es la única parte de la carga que **no se
comprime**, mientras el resto baja cuatro a uno con gzip. Sobre lo que de verdad
viaja, los cuatro costaban un 42,9% más en cada carga, y Apps Script arma el HTML
con `doGet` en cada petición y no lo cachea. Con una sola cara cuesta un 10,4%, y
la primera visita pesa **menos** que antes del cambio, porque Archivo variable son
34 KB contra los 61 KB que pesaban Lato y Poppins juntos. Los números están en
`docs/diseno/MEDICION_FUENTES.md` y la decisión la tomó Juan con ellos delante.

Los titulares (`h1`, `h2` y la marca) van en la letra de marca, en peso 900. Como
el contrato de accesibilidad exige un `h1` por pantalla dentro de `#app`, la letra
de marca aparece en las 48 pantallas sin incrustar ni un peso más.

La escala de pesos que la hoja usa es 400, 500, 600, 700, 800 y 900. Los cuatro
del brand book son los de PP Object Sans; el 600 y el 800 los pide la
especificación de estados y los sirve Archivo, que es variable. Lo cuida la prueba
`los pesos de letra que usa la hoja están en la escala declarada`, que no prohíbe
nada: solo obliga a que un peso nuevo entre a propósito.

## Los tres niveles de aviso

Se distinguen por **estructura**, no por color de borde, así que se reconocen
aunque se vean en blanco y negro. El brand book prohíbe el borde izquierdo de
color, que era lo único que separaba a los dos primeros.

| Nivel | Cómo se ve |
|---|---|
| Informativo | Panel celeste. Sin adorno |
| Serio | Panel beige, con una regla de 3px de gradiente en el borde **superior** |
| Error de campo | Sin panel. Borde de 2px en el campo y el mensaje suelto debajo |

La regla superior se hace con dos fondos superpuestos, no con un elemento nuevo,
porque el JavaScript no emite ninguno.

**El título del aviso serio no va en caja alta**, y eso se aparta de la
especificación a propósito (decisión 112). La regla se pensó para una etiqueta
corta, y los siete títulos que la aplicación pone ahí son frases: "Antes de usar
este enlace, confirma con Legal", "Antes de lanzar: ¿tu dinámica tiene azar?". Una
frase de ocho palabras en mayúsculas no se lee, se escanea, y estas son
advertencias legales.

**Un solo pastel por pieza.** Si coinciden dos avisos, el de mayor prioridad se
queda con su color y el otro baja a tarjeta blanca. La prioridad es error, serio,
informativo. En CSS eso solo se puede cuando los dos son hermanos y el serio va
primero; cuando no, se quedan los dos pasteles, y es un límite conocido.

## Los estados de una campaña

Ordenados por **peso visual**, no por matiz, así que Publicado se encuentra de un
vistazo en una lista larga y el sistema aguanta un quinto estado sin inventar
colores.

| Estado | Cómo se ve |
|---|---|
| Publicado | Gradiente hundido, letra blanca. Es el único con gradiente |
| Generado | Beige, letra tinta |
| Borrador | Niebla, letra gris |
| Vencido | Transparente con borde |

El verde salió: no es de marca, y era lo único que distinguía publicada de
generada. Borrador y Vencido están escritos aunque hoy no se vean, porque el
historial solo emite dos: emitir los otros dos es JavaScript y producto, no piel.

## La barra de progreso

Una sola fila, siempre, con un segmento por paso y la barra encima de la etiqueta.
La aplicación muestra entre cinco y nueve pasos según el tipo de campaña.

> Las etiquetas se ven si hay **seis pasos o menos** y cada segmento mide **88px o
> más**. Si falla cualquiera de las dos, se caen **todas a la vez**, y el nombre
> del paso queda en la línea de encima, que dice "Paso 7 de 9 · Participantes".

La mitad del número de pasos sale con `:has()`. La de los 88px **no se puede medir
con una consulta de ancho de ventana**, porque la barra vive en una columna cuyo
ancho lo decide la rejilla: en escritorio es media pantalla y en el filtro es la
página angosta. Por eso se mide con `@container`, sobre el ancho real de la barra.

Cuando las etiquetas se caen se esconden con **sangría, no con `display: none`**:
así el botón de cada paso conserva su nombre accesible y quien navega con teclado
sigue pudiendo volver a un paso. Y el alto del blanco de clic lo pone el relleno,
no una altura fija: la barra puede verse de 4px sin que el blanco mida 4px.

## Lo que no se hace

Es lo primero que aparece cuando uno no piensa.

1. **Tarjetas idénticas con la misma sombra.** Hay una sola superficie elevada en
   toda la aplicación: la hoja del documento.
2. **Ningún estado se comunica con `opacity`.** Bajar la opacidad arrastra el
   texto por debajo del contraste mínimo. Lo apagado va con fondo plano y letra
   apagada.
3. **Ninguna superficie del color exacto del fondo de página.** Un control en
   niebla sobre una página en niebla deja de leerse como control. Pasó dos veces
   en este cambio, con el botón deshabilitado y con la opción apagada.
4. **Mayúsculas sostenidas solo en etiquetas cortas**, y son las cabeceras de
   tabla y la marca de "Opcional". Nunca en una frase.
5. **Flechas al final de los botones.** El texto del botón ya dice qué pasa.
6. **Emojis como iconos.** Los iconos son SVG de un solo trazo, `currentColor`. El
   brand book no define un sistema de iconos (su propio readme dice que usa Lucide
   como sustituto provisional), así que los de RappiMind se quedan.
7. **Copiar un número del prototipo sin mirar a qué escala está.** El hueco del
   documento está dibujado a 10px en el prototipo, pero ahí el documento entero
   está a 12px: es una maqueta. Sobre la hoja real, que va a 15px, el equivalente
   es `0.85em`.

## La corona

Se conserva. Va sobre la "M" de RappiMind, pequeña, en el neón, como si la palabra
la llevara puesta. No es un logo aparte ni un adorno centrado: es parte de la
palabra, y por eso no se vuelve cursi. En pantallas muy pequeñas no se quita: se
reduce.

El lockup de la marca todavía no entra, y no es por el peso: la marca de la barra
superior es texto en el DOM, y el SVG del lockup no es autosuficiente. Está en la
decisión 110.

## Cómo se comprueba que un cambio no rompió nada

```
npm test
npm run contraste
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js
npm run front
```

`npm run contraste` es una puerta, no un informe: devuelve 1 mientras quede un par
por debajo de su mínimo, y la lista de qué va encima de qué es lo único escrito a
mano, porque eso no se deduce de un archivo de tokens. Si aparece un par nuevo, se
agrega ahí. **Un par sin nota que no llegue es una falla.**

Y algo que este cambio aprendió a golpes: el modo de falla de esta aplicación es
silencioso. Un `@import` que Apps Script no resuelve, una `url()` relativa a un
archivo del repositorio, un token que se renombra y deja sin color a
`scripts/lib/front-documento.js`. Nada de eso lanza un error: la pantalla sale
despintada y el síntoma aparece lejos de la causa. Por eso la concatenación de la
hoja está escrita en un solo sitio, `scripts/lib/hoja-completa.js`, y por eso las
pruebas leen por ahí. Ver la skill `frontera-apps-script`.
