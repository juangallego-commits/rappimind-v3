# RappiMind v3 · Sistema visual

Versión 1.0 · septiembre de 2026 · Dueño: Juan Camilo Gallego (Legal CO)

Este documento define cómo se ve y cómo se comporta la interfaz de RappiMind v3.
Es la fuente de verdad visual: `src/client/estilos.css` se escribe desde aquí y el
borrador actual del Bloque 0 se reemplaza completo.

Regla de oro: **la estrella es el documento que se escribe solo.** Todo lo demás
existe para que el comercial llegue a esa hoja sin equivocarse.

## Índice y dónde está cada cosa que pidió Juan

| Pedido | Sección |
|---|---|
| 1. Paleta con nombres, hex, justificación y contrastes calculados | 3 |
| 2. Tipografía | 4 |
| 3. Espaciado y radios | 5 |
| 4. Componentes con sus cinco estados | 7 |
| 5. La idea visual propia | 2 |
| 6. La coronita en SVG | 8 |
| 7. Bloque de tokens CSS | 9 |

Además: reglas de movimiento (sección 6), antipatrones y cómo se evita cada uno
(sección 10), lista de verificación antes de subir (sección 11) y pendientes de
Juan (sección 12).

## 1. De dónde sale este diseño

De la sección 8.3 de `docs/ESPECIFICACION_V3.md` y de los comentarios de Anna
(sección 8.2). Tres cosas de esa lista mandan sobre el resto:

1. "El botón Generar se ve activo todo el tiempo." El estado de un control tiene
   que ser verdad a simple vista.
2. "Un solo elemento memorable: la vista previa del documento." Hay un
   protagonista y no se le compite.
3. "Le gustó la coronita." Se conserva, una sola vez por pantalla.

## 2. La idea visual: el escritorio, la hoja y la barra de cambio

**En qué consiste.** La pantalla es un escritorio de gris muy suave. Sobre ese
escritorio hay una sola cosa que flota: la hoja blanca del T&C, con márgenes de
documento de verdad, cláusulas numeradas y el ancho de línea de un texto que se
lee, no de un panel de aplicación. En toda la interfaz **hay una sola sombra y es
la de esa hoja**. Los campos, los avisos y los paneles no flotan: viven pegados al
escritorio, separados apenas por una línea de un píxel. Cada vez que el comercial
responde una pregunta, la cláusula que cambió recibe en el margen izquierdo de la
hoja una **barra de cambio** naranja de tres píxeles, la misma marca que usa un
abogado para señalar qué se tocó en un contrato. La barra se apaga sola cuando
llega el siguiente cambio y se queda quieta si el usuario pidió menos movimiento.

**Por qué esto no parece plantilla.** Una plantilla genérica reparte doce tarjetas
iguales con la misma sombra y deja que el usuario adivine cuál importa. Aquí la
jerarquía es física y se puede verificar con una regla de una línea: si un
elemento tiene sombra, es el documento; si no la tiene, es formulario. El naranja
no decora: es la marca de revisión, aparece exactamente donde el texto legal
acaba de cambiar y por eso enseña algo en vez de adornar. El resultado es un
formulario que se siente como un escritorio de trabajo legal, con la única pieza
protagónica siendo la que el comercial se va a llevar. Se consigue con tres
decisiones baratas de sostener en código: una sombra, una barra y un solo blanco
puro reservado para la hoja y para los campos que se llenan.

**Cómo se traduce al layout.**

- Desde 1024 px: dos columnas. Izquierda, el formulario (máximo 560 px). Derecha,
  la hoja (máximo 620 px), pegajosa con `position: sticky` a 24 px del borde
  superior. Entre las dos, 48 px de escritorio limpio.
- Entre 768 px y 1023 px: una columna. La hoja se convierte en un panel plegable
  encima del formulario, cerrado por defecto, con el título "Vista previa del T&C".
- Menos de 768 px: la hoja se convierte en la hoja deslizable de abajo (7.11).
- El formulario nunca pasa de 640 px de ancho de contenedor ni de 62 caracteres por
  línea en los textos largos.

**Si la vista previa en vivo no alcanza a entrar en el Bloque 2** (la
especificación la marca como deseable), la hoja igual existe: el paso 7 (Resumen)
se dibuja como la misma hoja, sin la barra de cambio. El sistema visual no
depende de que la previsualización sea en vivo.

## 3. Paleta

Seis colores. Cada uno tiene un trabajo y ninguno se usa fuera de él.

| Nombre | Hex | Para qué se usa | Por qué este |
|---|---|---|---|
| Blanco papel | `#FFFFFF` | La hoja del T&C, el relleno de los campos que se llenan y el globo del glosario | El blanco puro queda reservado para "superficie donde hay texto que importa o que vas a escribir". Al no usarlo como fondo general, la hoja se distingue sola sin necesidad de sombras repartidas |
| Gris escritorio | `#F4F5F7` | Fondo de toda la aplicación | Gris frío, no crema ni beige: sus canales suben de rojo a azul (244, 245, 247), así que nunca amarillea en pantallas cálidas. Es suficientemente oscuro para que el blanco de la hoja se recorte encima y suficientemente claro para que el texto casi negro conserve 16,44:1 |
| Tinta | `#15171C` | Títulos, etiquetas de campo, texto de la hoja, bordes del botón secundario | Negro azulado en vez de negro puro: baja el golpe en pantalla sin perder autoridad. 17,93:1 sobre blanco deja margen de sobra para cualquier tamaño |
| Gris lectura | `#5B6170` | Textos de ayuda, ejemplos, marcadores de posición, metadatos, **y el borde de todos los controles** | Un solo gris medio para todo lo secundario. Se eligió lo bastante oscuro para cumplir 4,5:1 como texto (5,68:1 sobre el fondo) y así servir también de borde sin inventar un séptimo color. Un borde de este gris se ve como la línea de un formulario impreso |
| Naranja Rappi | `#FF441F` | Marcas que no son texto: barra de cambio en la hoja, anillo de foco, tramo actual de la barra de pasos, corona, barra izquierda del aviso importante | Es la identidad y no se toca. Su contraste con blanco es 3,44:1: alcanza para elementos gráficos y de interfaz (3:1) pero **no** para texto normal, por eso se usa solo como marca |
| Naranja tinta | `#C7330F` | Relleno del botón primario, texto y borde de error, casilla marcada, icono de error | Es el mismo naranja llevado a un valor donde sí es legible: 5,37:1 sobre blanco y 4,92:1 sobre el fondo, y el blanco encima de él da 5,37:1. Sin este color no hay forma de tener un botón naranja con etiqueta blanca que cumpla AA |

Blanco papel y Gris escritorio son dos colores distintos a propósito: la
diferencia entre ellos (1,09:1) es casi imperceptible como contraste, pero es
exactamente lo que hace que la hoja se lea como hoja y no como panel.

### 3.1 Cómo se calcularon los contrastes

Fórmula de WCAG 2.1, hecha con `node` sobre los hex de arriba, no estimada.

Para cada canal `c` de 0 a 255: `s = c / 255`, y
`lineal = s / 12,92` si `s <= 0,04045`, si no `lineal = ((s + 0,055) / 1,055) ^ 2,4`.

Luminancia relativa: `L = 0,2126·R + 0,7152·G + 0,0722·B` (canales ya lineales).

Contraste: `(L_claro + 0,05) / (L_oscuro + 0,05)`.

**Luminancias relativas resultantes:**

| Color | Hex | L |
|---|---|---|
| Blanco papel | `#FFFFFF` | 1,00000 |
| Gris escritorio | `#F4F5F7` | 0,91253 |
| Naranja Rappi | `#FF441F` | 0,25493 |
| Naranja tinta | `#C7330F` | 0,14544 |
| Gris lectura | `#5B6170` | 0,11943 |
| Tinta | `#15171C` | 0,00856 |

Ejemplo completo de una de las cuentas, Naranja Rappi `#FF441F`:
R = 255 → 1,00000; G = 68 → ((68/255 + 0,055) / 1,055) ^ 2,4 = 0,05782;
B = 31 → 0,01369. L = 0,2126·1 + 0,7152·0,05782 + 0,0722·0,01369 = 0,25494.
Contra blanco: (1,05) / (0,30494) = **3,44**.

### 3.2 Verificación contra el fondo y contra blanco

| Combinación | Sobre `#F4F5F7` | Sobre `#FFFFFF` | Exigido | Cumple |
|---|---|---|---|---|
| Tinta como texto | 16,44 | 17,93 | 4,5 | sí |
| Gris lectura como texto de apoyo | 5,68 | 6,20 | 4,5 | sí |
| Gris lectura como borde de control | 5,68 | 6,20 | 3,0 | sí |
| Naranja tinta como texto de error | 4,92 | 5,37 | 4,5 | sí |
| Naranja Rappi como marca gráfica | 3,16 | 3,44 | 3,0 | sí |
| Naranja Rappi como anillo de foco | 3,16 | 3,44 | 3,0 | sí |
| Gris escritorio como superficie | 1,09 | 1,09 | no aplica | decorativo |

Contrastes de texto sobre relleno de color:

| Combinación | Ratio | Exigido | Cumple |
|---|---|---|---|
| Blanco sobre Naranja tinta (botón primario) | 5,37 | 4,5 | sí |
| Blanco sobre `#AF2D0D` (primario con el cursor encima) | 6,55 | 4,5 | sí |
| Blanco sobre `#9F290C` (primario presionado) | 7,51 | 4,5 | sí |
| Tinta sobre Naranja Rappi | 5,21 | 4,5 | sí |
| Tinta sobre `#E7E8EA` (secundario con el cursor encima) | 14,62 | 4,5 | sí |
| Blanco sobre Naranja Rappi | 3,44 | 4,5 | **no**, prohibido |
| Gris lectura sobre Naranja Rappi | 1,80 | 4,5 | **no**, prohibido |

Todo el texto de la interfaz cumple 4,5:1, incluido el texto grande, así que no
hay que apoyarse en la excepción de 3:1 para títulos. Los bordes de controles y
las marcas gráficas cumplen 3:1 contra las dos superficies posibles (fondo y
blanco), que es lo que exige WCAG 1.4.11.

### 3.3 Combinaciones prohibidas

- Texto blanco sobre Naranja Rappi (3,44:1). Si hace falta un botón naranja con
  etiqueta blanca, el relleno es Naranja tinta.
- Texto Gris lectura sobre cualquier naranja (1,80:1 sobre Naranja Rappi).
- Naranja Rappi como color de texto de cuerpo o de error. Los errores se escriben
  en Naranja tinta.
- Dos superficies blancas adyacentes sin línea que las separe.
- Cualquier color fuera de estos seis, incluidos verdes de "listo" y rojos de
  "error" distintos del naranja. El estado se dice con texto e icono, no con un
  semáforo nuevo.

### 3.4 Valores derivados, que no son colores nuevos

| Token | Valor | Uso |
|---|---|---|
| Línea | `rgba(91, 97, 112, 0.20)` | Separadores decorativos dentro de la hoja y entre filas del resumen. No lleva información, por eso puede ser tenue |
| Relleno de cursor encima | `rgba(21, 23, 28, 0.06)` | Fondo del botón secundario y de las filas de opción cuando el cursor está encima |
| Naranja tinta intenso | `#AF2D0D` y `#9F290C` | Botón primario con el cursor encima y presionado. Son Naranja tinta con 12% y 20% de negro |
| Contorno inactivo | `rgba(91, 97, 112, 0.40)` | Borde de controles deshabilitados. WCAG exime a los controles deshabilitados del mínimo de contraste, pero la **etiqueta** de un control deshabilitado se deja en Gris lectura completo (5,68:1), porque el usuario tiene que poder leer qué es lo que está bloqueado |
| Velo | `rgba(21, 23, 28, 0.35)` | Fondo detrás de la hoja deslizable en celular |

## 4. Tipografía

Dos familias, cuatro pesos en total. Son exactamente los que ya carga
`src/client/Index.html` (`Poppins:wght@500;600` y `Lato:wght@400;700`). **No se
agregan pesos ni familias**: cada peso extra es una descarga más en una web app
que se abre desde el celular en la calle.

**Regla para decidir la familia:** si es un título o la etiqueta de un botón, es
Poppins. Todo lo demás, incluidas las etiquetas de los campos, es Lato. Sin
excepciones, así nadie tiene que preguntar.

| Nombre | Tamaño | Familia y peso | Interlineado | Dónde |
|---|---|---|---|---|
| Pantalla | 30 px | Poppins 600 | 1,2 | Título de cada pantalla, uno por vista |
| Sección | 24 px | Poppins 600 | 1,25 | Título de bloque dentro de un paso y título de la hoja |
| Pregunta | 20 px | Poppins 500 | 1,3 | La pregunta actual del formulario, lo más importante de la columna izquierda |
| Guía | 18 px | Poppins 500 | 1,4 | Título de aviso, etiqueta de botón grande, encabezado de cláusula en la hoja |
| Base | 16 px | Lato 400 | 1,55 | Cuerpo, contenido de los campos, opciones, casillas |
| Etiqueta | 16 px | Lato 700 | 1,4 | Etiqueta de campo y de grupo de opciones |
| Apoyo | 14 px | Lato 400 | 1,5 | Ejemplos, ayudas, mensajes de error, el eco del monto en letras |
| Menor | 12 px | Lato 400 | 1,4 | Contador de caracteres, fecha de un registro en el historial |

**Reglas fijas.**

- Ningún texto de interfaz baja de 14 px, y el contenido de los campos nunca baja
  de 16 px (por debajo de 16 px, Safari en iPhone hace zoom al enfocar).
- `text-transform` siempre en `none`. Las mayúsculas sostenidas están prohibidas
  en la interfaz. La única mayúscula sostenida del sistema es
  `NOMBRE_CAMPANA_MAYUS` dentro del documento generado, que es texto legal de
  `modelos/` y no una etiqueta de interfaz.
- El espaciado entre letras solo se toca en Poppins 600 a 24 px o más, con
  `-0.01em`. En Lato nunca.
- En la hoja: 16 px Lato 400, interlineado 1,7 y máximo 62 caracteres por línea.
  Es texto para leer, no para escanear.
- Los números de montos llevan `font-variant-numeric: tabular-nums`, para que las
  cifras no bailen mientras se escriben. Si la fuente no trae esa variante, no se
  rompe nada.
- Nunca se justifica el texto en la interfaz. La hoja tampoco se justifica en
  pantalla: el justificado es del Google Doc final (sección 4.4 de la
  especificación), no de la vista previa.
- En celular: Pantalla baja a 24 px, Sección a 20 px y Pregunta a 18 px. El resto
  no cambia.

## 5. Espaciado, radios, líneas y sombra

**Espaciado.** Múltiplos de 4, ocho pasos y nada intermedio:

`4, 8, 12, 16, 24, 32, 48, 64`

- 4 y 8: dentro de un control (icono a etiqueta, casilla a texto).
- 12 y 16: entre un campo y su ayuda, relleno interno de los campos.
- 24: entre campos de un mismo grupo.
- 32: entre grupos.
- 48: entre secciones y entre las dos columnas.
- 64: márgenes interiores de la hoja en escritorio (32 en celular).

Márgenes laterales de la página: 16 px en celular, 24 px desde 768 px, y a partir
de ahí la página se centra en 1200 px de ancho máximo.

**Radios.** Cuatro valores:

| Valor | Uso |
|---|---|
| 2 px | Marcas pequeñas: casilla, barra de cambio, tramos de la barra de pasos |
| 4 px | Controles: campos, botones, filas de opción |
| 8 px | Contenedores: la hoja, el aviso, el globo del glosario |
| 16 px | Solo las dos esquinas superiores de la hoja deslizable en celular |

Nada de radios grandes tipo píldora. Un formulario legal no es una aplicación de
mensajería.

**Líneas.** Un píxel es la línea normal. Dos píxeles marcan un campo con error o
seleccionado. Tres píxeles es el ancho de la barra de cambio, del anillo de foco
y de la barra izquierda de un aviso. No hay más grosores.

**Sombra.** Una sola en toda la aplicación:

```css
--rm-sombra-hoja: 0 1px 2px rgba(21, 23, 28, 0.06), 0 8px 24px rgba(21, 23, 28, 0.10);
```

Se aplica a la hoja y a la hoja deslizable de celular, que es la misma hoja. A
nada más. Si un componente nuevo "necesita" sombra, lo que necesita es una línea.

## 6. Movimiento

El movimiento solo responde a algo que hizo el usuario. No hay animaciones de
entrada, ni carruseles, ni nada que se mueva solo mientras alguien lee.

| Qué | Duración | Curva | Disparador |
|---|---|---|---|
| Color de borde, relleno y texto en cualquier control | 120 ms | `ease-out` | Cursor encima, foco, presionado |
| Barra de cambio en la hoja | aparece de inmediato, se apaga en 900 ms | `ease-out` sobre `opacity` | El motor devolvió texto nuevo |
| Hoja deslizable de celular | 220 ms | `cubic-bezier(0.2, 0.7, 0.3, 1)` | El usuario la abre, la arrastra o la cierra |
| Abrir o cerrar un paso plegado | 180 ms sobre la altura | `ease-out` | Clic o Enter en el encabezado |

Nunca se anima: el anillo de foco (aparece y ya), la barra de pasos, el texto de
la hoja (el texto cambia, no se desliza) y la corona.

Con `prefers-reduced-motion: reduce`: todas las transiciones bajan a 0,01 ms, la
hoja deslizable aparece en su posición final sin recorrido, y la barra de cambio
se queda fija hasta el siguiente cambio en vez de apagarse sola. La información no
se pierde nunca por apagar el movimiento.

## 7. Componentes

Notas que aplican a todos:

- **Foco de teclado:** `:focus-visible` con `outline: 3px solid var(--rm-naranja)`
  y `outline-offset: 2px`. La separación de 2 px es obligatoria: garantiza que
  entre el relleno del control y el anillo siempre haya un espacio del color del
  escritorio, así el anillo se distingue incluso sobre el botón naranja. Nunca se
  usa `outline: none` sin reemplazo.
- **Área táctil:** mínimo 44 por 44 px en cualquier cosa que se pueda tocar,
  aunque el dibujo sea más pequeño (se consigue con relleno, no agrandando el
  gráfico).
- **Iconos:** SVG en línea, `viewBox="0 0 20 20"`, trazo de 1,5 px,
  `stroke="currentColor"`, `stroke-linecap="round"`, `fill="none"` y
  `aria-hidden="true"`. Seis iconos en total: información, atención, error,
  revisar, copiar y enlace externo. **Cero emojis.** Un emoji cambia de dibujo en
  cada sistema operativo y los lectores de pantalla lo leen en voz alta.
- **Nada de flechas al final de las etiquetas.** El botón dice lo que pasa. Si un
  botón lleva icono, va antes de la etiqueta y solo cuando agrega información que
  la palabra no da (el enlace externo en "Abrir el documento").
- **El estado nunca se dice solo con color.** Siempre hay una segunda señal: peso
  de letra, icono, barra lateral o texto.

### 7.1 La hoja (vista previa del T&C) · el protagonista

Superficie Blanco papel, radio 8 px, sin borde, con la única sombra del sistema.
Márgenes interiores de 64 px en escritorio y 32 px en celular. Dentro: el título
del documento en Poppins 600 a 24 px centrado, las cláusulas con su número y
título en Lato 700 seguidos del texto en Lato 400 a 16 px con interlineado 1,7, y
las viñetas con sangría de 16 px. Ancho de línea máximo 62 caracteres.

Los datos que aportó el comercial van en Lato 700 dentro del párrafo (no en otro
color): así se distingue el hecho del texto legal sin ensuciar la hoja y sin
depender del color.

La barra de cambio es un bloque de 3 px por la altura de la cláusula, en Naranja
Rappi, pegado al borde interior izquierdo del margen. Marca la última cláusula que
cambió. Solo hay una barra a la vez.

Encima de la hoja, un rótulo en Lato 400 a 14 px en Gris lectura: "Borrador. El
documento final se genera al terminar." No es un sello ni una marca de agua
girada: es una línea de texto.

Estados: la hoja no es un control, no tiene foco ni error propios. Cuando el
motor no puede renderizar todavía (faltan datos obligatorios), las cláusulas que
aún no se pueden escribir se muestran con su título y, debajo, una línea en Gris
lectura a 14 px: "Falta el dato de la pregunta X." Nunca se muestra `{{CAMPO}}`,
ni bloques grises de relleno.

### 7.2 Botón primario

Poppins 500 a 18 px, blanco sobre Naranja tinta, alto 48 px, relleno lateral
24 px, radio 4 px, sin borde, sin sombra. Uno por pantalla.

| Estado | Cómo se ve |
|---|---|
| Reposo | Relleno `#C7330F`, etiqueta blanca (5,37:1) |
| Cursor encima | Relleno `#AF2D0D` (6,55:1). Sin cambio de tamaño y sin desplazamiento |
| Foco de teclado | Anillo naranja de 3 px a 2 px de separación, encima del estado que tenga |
| Deshabilitado | Relleno transparente, borde de 1 px en contorno inactivo, etiqueta en Gris lectura. **Se marca con `aria-disabled="true"`, no con el atributo `disabled`**, para que siga recibiendo foco con el teclado. Al activarlo, el foco salta al aviso "Falta completar" con la lista de campos pendientes (esto resuelve directamente el comentario de Anna) |
| Error | El botón no tiene estado de error propio. El error vive en el aviso al que el botón manda el foco |

Presionado: relleno `#9F290C` (7,51:1).

### 7.3 Botón secundario

Poppins 500 a 18 px, etiqueta en Tinta, relleno transparente, borde de 1 px en
Tinta, alto 48 px, radio 4 px.

| Estado | Cómo se ve |
|---|---|
| Reposo | Borde y etiqueta en Tinta sobre el escritorio |
| Cursor encima | Relleno `rgba(21, 23, 28, 0.06)`, borde y etiqueta sin cambio (14,62:1) |
| Foco de teclado | Anillo naranja de 3 px a 2 px de separación |
| Deshabilitado | Borde y etiqueta en `rgba(91, 97, 112, 0.40)` y Gris lectura respectivamente, cursor `not-allowed` |
| Error | No aplica |

Hay una tercera variante, el **botón de texto**, solo para acciones de bajo peso
("Editar esta sección" en el resumen): sin borde ni relleno, etiqueta en Tinta con
subrayado de 1 px, mismo anillo de foco. No se usa para acciones destructivas.

### 7.4 Campo de texto

Etiqueta en Lato 700 a 16 px en Tinta, encima del campo, a 8 px. Debajo del campo,
a 8 px, el ejemplo en Lato 400 a 14 px en Gris lectura, siempre empezando por
"Ejemplo: " (la especificación pide un ejemplo debajo de cada campo). El campo:
alto 48 px, relleno 12 px por 14 px, Blanco papel, borde de 1 px en Gris lectura,
radio 4 px, texto en Tinta a 16 px.

| Estado | Cómo se ve |
|---|---|
| Reposo | Borde Gris lectura (6,20:1 contra el blanco interior, 5,68:1 contra el escritorio). El marcador de posición, cuando exista, en Gris lectura; nunca se usa en vez de la etiqueta |
| Cursor encima | Borde a Tinta. Nada más se mueve |
| Foco de teclado | Borde a Tinta más el anillo naranja de 3 px a 2 px de separación |
| Deshabilitado | Relleno Gris escritorio, borde en contorno inactivo, texto en Gris lectura, `cursor: not-allowed`. Debajo, la razón en 14 px: "Se llena solo con el país que elegiste." |
| Error | Borde de 2 px en Naranja tinta y, debajo, el mensaje en Lato 400 a 14 px en Naranja tinta con el icono de error de 16 px antes. El mensaje dice qué pasó y cómo se arregla: "El NIT no es válido. Revisa el dígito después del guion." `aria-invalid="true"` y `aria-describedby` apuntando al mensaje. El error aparece al salir del campo, no mientras se escribe; una vez marcado, se limpia en cuanto el valor es válido |

El campo con límite de caracteres (nombre de campaña, máximo 80) lleva el
contador a la derecha debajo, en 12 px Gris lectura, y pasa a Naranja tinta
cuando se excede, con `aria-live="polite"` para que se anuncie una sola vez.

### 7.5 Campo numérico con moneda

Es el campo de texto con tres cosas encima:

1. Un prefijo fijo dentro del campo con el símbolo del país, en Gris lectura,
   separado del valor por una línea vertical de 1 px y 24 px de alto. El prefijo
   no es editable ni recibe foco.
2. El valor con `tabular-nums`, alineado a la izquierda, con el separador de miles
   del país aplicado al salir del campo (nunca mientras se escribe, porque mueve
   el cursor).
3. **El eco del motor**: debajo, en Lato 400 a 14 px en Gris lectura, exactamente
   el texto que va a quedar en el documento, calculado con el mismo
   `src/core`: "doce mil (12.000) Créditos". Con `aria-live="polite"`. Es el
   detalle que le dice al comercial que lo que escribe es lo que se firma, y no
   cuesta nada porque la función ya existe.

| Estado | Cómo se ve |
|---|---|
| Reposo | Como el campo de texto. Eco en gris debajo |
| Cursor encima | Borde a Tinta |
| Foco de teclado | Borde a Tinta más anillo naranja. El separador de miles se quita mientras el campo tiene foco |
| Deshabilitado | Como el campo de texto. El eco desaparece, no se queda en gris claro |
| Error | Borde de 2 px en Naranja tinta, el eco se reemplaza por el mensaje: "El tope no puede ser mayor que el presupuesto. Baja el tope o sube el presupuesto." |

Teclado: `inputmode="numeric"`, sin flechas de incremento (`appearance: none` en
`::-webkit-inner-spin-button`). Las flechitas de un `input[type=number]` son un
error de precisión en un monto de presupuesto.

### 7.6 Grupo de opciones grandes

Para "país", "tipo de campaña", "segmento", "método de pago", "carga",
"vigencia", "redención". Filas de ancho completo, no tarjetas.

Cada fila: alto mínimo 56 px, relleno 16 px, Blanco papel, borde de 1 px en Gris
lectura, radio 4 px, separadas 8 px. A la izquierda, el círculo de selección de
20 px (borde de 1,5 px). Etiqueta en Lato 400 a 16 px; si la opción necesita una
aclaración, va debajo en 14 px Gris lectura. El grupo lleva `role="radiogroup"` y
su título en Lato 700 a 16 px.

| Estado | Cómo se ve |
|---|---|
| Reposo | Borde Gris lectura, círculo vacío |
| Cursor encima | Relleno `rgba(21, 23, 28, 0.06)`, borde a Tinta, cursor de mano |
| Foco de teclado | Anillo naranja alrededor de la fila completa. Las flechas mueven la selección dentro del grupo, `Tab` sale del grupo |
| Seleccionado | Tres señales a la vez: barra de 3 px en Naranja Rappi pegada al borde izquierdo interno, borde de la fila a Tinta y etiqueta a Lato 700. El círculo se llena con un punto de 8 px en Naranja tinta |
| Deshabilitado | Borde y círculo en contorno inactivo, etiqueta en Gris lectura, y debajo la razón: "Este tipo todavía no está habilitado en Perú." Nunca se esconde una opción sin explicar por qué no está |
| Error | Solo a nivel de grupo, cuando no se eligió nada y se intentó avanzar: el título del grupo recibe el icono de error y debajo aparece "Elige una opción para seguir." en Naranja tinta a 14 px |

Las tarjetas de "tipo de campaña" usan exactamente este mismo componente, con una
línea de descripción debajo del nombre. No son un componente aparte y no llevan
sombra.

### 7.7 Casillas

Para condiciones, secciones de redención y la declaración final, es decir, todo lo
que no es excluyente (comentario de Anna).

Cuadrado de 22 px, radio 2 px, borde de 1,5 px en Gris lectura, etiqueta en Lato
400 a 16 px a 12 px de distancia. Toda la fila es el área táctil, con 44 px de
alto mínimo. Varias casillas se agrupan en un `fieldset` con `legend` en Lato 700.

| Estado | Cómo se ve |
|---|---|
| Reposo | Cuadrado vacío, borde Gris lectura |
| Cursor encima | Borde a Tinta, fondo de la fila `rgba(21, 23, 28, 0.06)` |
| Foco de teclado | Anillo naranja alrededor del cuadrado, a 2 px |
| Marcada | Relleno Naranja tinta con el visto en blanco (SVG de 12 px, trazo 2 px, 5,37:1) y la etiqueta a Lato 700 |
| Deshabilitada | Borde en contorno inactivo, etiqueta en Gris lectura, con la razón debajo si la hay |
| Error | Solo la declaración final, que es obligatoria: borde de 2 px en Naranja tinta y mensaje "Marca la declaración para poder generar el documento." |

La declaración final se distingue del resto: va sola dentro de la hoja del
resumen, con 24 px de aire arriba y abajo y una línea separadora encima.

### 7.8 Barra de progreso por pasos

Arriba del formulario, pegada con `position: sticky`. Dos partes:

1. **El rótulo**, que es donde está la información: "Paso 3 de 7 · Mecánica y
   beneficio", en Poppins 500 a 18 px, con `aria-live="polite"`.
2. **La barra**, 4 px de alto, dividida en tantos tramos como pasos, con 4 px de
   separación entre tramos y radio 2 px. Tramo completado: Gris lectura. Tramo
   actual: Naranja Rappi (3,16:1 contra el escritorio). Tramo pendiente: Gris
   lectura al 20%. Como el texto del rótulo ya dice en qué paso va, los tramos son
   refuerzo visual y el contraste bajo de los pendientes no esconde información.

Desde 1024 px, debajo de cada tramo va su nombre en Lato 400 a 14 px.

| Estado | Cómo se ve |
|---|---|
| Reposo | Como arriba. Los pasos completados son `<button>`, los pendientes son `<span>` |
| Cursor encima (paso completado) | El nombre pasa a Tinta y se subraya a 1 px; el tramo no cambia |
| Foco de teclado | Anillo naranja alrededor del conjunto tramo más nombre |
| Deshabilitado (paso pendiente) | No es un botón, no recibe foco. Nombre en Gris lectura |
| Error (paso completado con un dato inválido) | El tramo mantiene Gris lectura y al nombre se le antepone el icono de error de 14 px en Naranja tinta. El color no es la única señal |

En celular solo se ve el rótulo y la barra, sin nombres.

### 7.9 Aviso

Sin fondo de color y sin sombra: Blanco papel, radio 8 px, barra izquierda de
3 px, relleno 16 px, icono de 20 px arriba a la izquierda, título opcional en
Poppins 500 a 18 px y cuerpo en Lato 400 a 16 px.

| Variante | Barra e icono | Cuándo | Semántica |
|---|---|---|---|
| Informativo | Gris lectura | Explicaciones dentro de un paso | `<aside>` |
| Importante | Naranja Rappi | El aviso de azar en Ayuda, "Esta campaña la redacta Legal" | `role="note"` |
| Error | Naranja tinta | Lista de lo que falta para generar, error del motor | `role="alert"` y foco programático |

| Estado | Cómo se ve |
|---|---|
| Reposo | Como arriba |
| Cursor encima | Sin cambio; el aviso no es un control. Si lleva un enlace, el enlace se subraya |
| Foco de teclado | El aviso de error recibe `tabindex="-1"` y el foco al aparecer, con anillo naranja alrededor del bloque |
| Deshabilitado | No aplica |
| Error | Es la variante de error descrita arriba |

El aviso "Falta completar" lista los campos pendientes como enlaces: cada uno
lleva el foco al campo exacto. Sin esto, el botón deshabilitado es un muro.

### 7.10 Glosario al pasar el cursor

Para "Créditos", "Organizador", "Tienda Participante", "Territorio". El término va
en el texto con subrayado punteado de 1 px en Gris lectura, dentro de un
`<button type="button">` con `aria-describedby` apuntando al globo. Nunca un
`<abbr>` suelto, que no recibe foco.

Globo: Blanco papel, borde de 1 px en Tinta, radio 8 px, relleno 12 px, máximo
280 px de ancho, texto en Lato 400 a 14 px. Sin sombra (la sombra es de la hoja) y
sin punta triangular decorativa: se ancla a 8 px del término.

| Estado | Cómo se ve |
|---|---|
| Reposo | Término subrayado punteado; el globo no existe en el DOM visible |
| Cursor encima | El globo abre a los 150 ms y no se cierra si el cursor pasa por encima del globo (hay que poder seleccionar el texto de adentro). Cierra 150 ms después de salir |
| Foco de teclado | Abre de inmediato, sin retardo, con anillo naranja en el término. `Esc` lo cierra y el foco se queda en el término |
| Deshabilitado | No aplica. Si un término no tiene definición, va como texto normal y sin subrayado |
| Error | No aplica |

En celular no hay cursor: el término se toca y la definición abre como una hoja
deslizable pequeña, con el mismo componente de 7.11. Un tercer toque fuera la
cierra.

### 7.11 Hoja deslizable en celular

Es la vista previa del T&C por debajo de 768 px. Tres posiciones:

- **Muelle** (por defecto): barra fija abajo de 56 px, Blanco papel, con la sombra
  de la hoja, que muestra la última cláusula escrita en una línea a 14 px cortada
  con puntos suspensivos y con la barra de cambio naranja a la izquierda. Toda la
  barra es un `<button>` con `aria-expanded="false"` y etiqueta accesible "Ver el
  documento, borrador".
- **Media**: 45% del alto de la ventana.
- **Completa**: 92% del alto, con velo detrás.

Las dos esquinas superiores llevan radio 16 px. Arriba, un asa de 40 por 4 px en
Gris lectura al 40%, decorativa: el control real es el botón de la barra y un
botón "Cerrar" con icono de 20 px arriba a la derecha, con área de 44 px.

| Estado | Cómo se ve |
|---|---|
| Reposo | En muelle, con la última cláusula visible |
| Cursor encima | No aplica en táctil; con ratón en pantalla angosta, la barra toma `rgba(21, 23, 28, 0.06)` |
| Foco de teclado | Anillo naranja en la barra. Abierta en completa, atrapa el foco; `Esc` cierra y devuelve el foco a la barra |
| Deshabilitado | Mientras no haya ni un dato, la barra dice "El borrador aparece cuando respondas la primera pregunta." con `aria-disabled="true"` |
| Error | Si el motor devuelve error, la barra pasa a la variante de error del aviso (barra izquierda en Naranja tinta) y dice "Hay 2 datos por corregir." al tocarla, abre en la lista |

El formulario reserva abajo `56 px más env(safe-area-inset-bottom)` de relleno
para que el muelle nunca tape el botón primario. Arrastrar funciona con el dedo;
con `prefers-reduced-motion: reduce` la hoja salta a su posición sin recorrido.

## 8. La coronita

A Anna le gustó y se queda. La forma en que no se vuelve cursi es tratarla como
tipografía y no como ilustración: geometría recta, un solo color plano, el mismo
peso óptico que la Poppins 600 del nombre, y aparece **una sola vez por pantalla**,
en el encabezado.

Reglas para no arruinarla:

- Nunca dorada, nunca con degradado, nunca con brillos, gemas ni curvas. Es el
  Naranja Rappi plano, o Tinta si va sobre naranja.
- Nunca se anima, no gira mientras carga y no rebota.
- Nunca se repite como viñeta, como icono de estado ni como marca de agua.
- No se usa suelta como logotipo sin el nombre al lado: es un acento sobre la
  palabra, no una marca por sí sola.
- El nombre "RappiMind" es texto de verdad en Poppins 600, no una imagen.

SVG listo para pegar:

```html
<span class="rm-marca">
  <svg class="rm-corona" viewBox="0 0 24 18" width="20" height="15"
       aria-hidden="true" focusable="false">
    <path d="M2 12.4 L2 4.2 L7.4 8.5 L12 2.6 L16.6 8.5 L22 4.2 L22 12.4 Z"
          fill="currentColor" stroke="currentColor"
          stroke-width="1.4" stroke-linejoin="round"/>
    <rect x="2" y="14.6" width="20" height="2.2" rx="1.1" fill="currentColor"/>
  </svg>
  RappiMind
</span>
```

```css
.rm-marca {
  display: inline-flex;
  align-items: center;
  gap: var(--rm-esp-2);
  font-family: var(--rm-fuente-titulo);
  font-weight: var(--rm-peso-fuerte);
  font-size: var(--rm-texto-guia);
  color: var(--rm-tinta);
  letter-spacing: -0.01em;
}

.rm-corona {
  color: var(--rm-naranja);
  flex: 0 0 auto;
  transform: translateY(-1px); /* corrección óptica: la corona se ve caída si se centra a la mano */
}
```

Por qué así: tres picos rectos con las uniones apenas redondeadas por el trazo (el
`stroke` del mismo color con `stroke-linejoin="round"` suaviza las puntas sin
agregar ni un nodo más), y la banda separada por 2,2 px del cuerpo, que es lo que
la hace legible a 20 px y la distingue de un gráfico de montañas. Hereda el color
con `currentColor`, así que basta cambiar `color` en el contenedor para llevarla a
Tinta. El contraste del naranja contra el escritorio es 3,16:1, por encima del
mínimo de 3:1 para gráficos, aunque como parte de un logotipo estaría exenta.

## 9. Tokens CSS

Este bloque va al inicio de `src/client/estilos.css`. Los nombres son los
definitivos: si un componente necesita un valor que no está aquí, primero se
agrega el token.

```css
:root {
  color-scheme: light;

  /* Paleta (sección 3) */
  --rm-blanco: #ffffff;
  --rm-escritorio: #f4f5f7;
  --rm-tinta: #15171c;
  --rm-gris: #5b6170;
  --rm-naranja: #ff441f;
  --rm-naranja-tinta: #c7330f;

  /* Derivados de la paleta (sección 3.4) */
  --rm-naranja-tinta-encima: #af2d0d;
  --rm-naranja-tinta-activo: #9f290c;
  --rm-contorno: var(--rm-gris);
  --rm-contorno-inactivo: rgba(91, 97, 112, 0.4);
  --rm-linea: rgba(91, 97, 112, 0.2);
  --rm-relleno-encima: rgba(21, 23, 28, 0.06);
  --rm-velo: rgba(21, 23, 28, 0.35);
  accent-color: var(--rm-naranja-tinta);

  /* Tipografía (sección 4) */
  --rm-fuente-titulo: 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --rm-fuente-texto: 'Lato', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --rm-peso-normal: 400;
  --rm-peso-medio: 500;
  --rm-peso-fuerte: 600;
  --rm-peso-negrita: 700;
  --rm-texto-menor: 0.75rem;     /* 12 px */
  --rm-texto-apoyo: 0.875rem;    /* 14 px */
  --rm-texto-base: 1rem;         /* 16 px */
  --rm-texto-guia: 1.125rem;     /* 18 px */
  --rm-texto-pregunta: 1.25rem;  /* 20 px */
  --rm-texto-seccion: 1.5rem;    /* 24 px */
  --rm-texto-pantalla: 1.875rem; /* 30 px */
  --rm-interlineado-apretado: 1.25;
  --rm-interlineado-base: 1.55;
  --rm-interlineado-lectura: 1.7;
  --rm-medida: 62ch;

  /* Espaciado (sección 5) */
  --rm-esp-1: 4px;
  --rm-esp-2: 8px;
  --rm-esp-3: 12px;
  --rm-esp-4: 16px;
  --rm-esp-5: 24px;
  --rm-esp-6: 32px;
  --rm-esp-7: 48px;
  --rm-esp-8: 64px;

  /* Radios */
  --rm-radio-marca: 2px;
  --rm-radio-control: 4px;
  --rm-radio-caja: 8px;
  --rm-radio-hoja: 16px;

  /* Líneas, foco y sombra */
  --rm-borde: 1px;
  --rm-borde-marcado: 2px;
  --rm-barra: 3px;
  --rm-foco-ancho: 3px;
  --rm-foco-sep: 2px;
  --rm-sombra-hoja: 0 1px 2px rgba(21, 23, 28, 0.06), 0 8px 24px rgba(21, 23, 28, 0.1);

  /* Medidas */
  --rm-pagina: 1200px;
  --rm-columna: 560px;
  --rm-hoja: 620px;
  --rm-alto-control: 48px;
  --rm-alto-opcion: 56px;
  --rm-alto-muelle: 56px;
  --rm-toque-min: 44px;

  /* Movimiento (sección 6) */
  --rm-mov-corto: 120ms;
  --rm-mov-medio: 180ms;
  --rm-mov-hoja: 220ms;
  --rm-curva: cubic-bezier(0.2, 0.7, 0.3, 1);
}

@media (max-width: 767px) {
  :root {
    --rm-texto-pantalla: 1.5rem;   /* 24 px */
    --rm-texto-seccion: 1.25rem;   /* 20 px */
    --rm-texto-pregunta: 1.125rem; /* 18 px */
    --rm-esp-8: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --rm-mov-corto: 0.01ms;
    --rm-mov-medio: 0.01ms;
    --rm-mov-hoja: 0.01ms;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--rm-escritorio);
  color: var(--rm-tinta);
  font-family: var(--rm-fuente-texto);
  font-size: var(--rm-texto-base);
  line-height: var(--rm-interlineado-base);
  -webkit-text-size-adjust: 100%;
}

:focus-visible {
  outline: var(--rm-foco-ancho) solid var(--rm-naranja);
  outline-offset: var(--rm-foco-sep);
}

@media (forced-colors: active) {
  :focus-visible {
    outline-color: Highlight;
  }
}
```

Con `prefers-reduced-motion` no se desactiva ninguna transición a mano en los
componentes: todas usan estos tokens, así que basta con que el bloque de arriba
los ponga en 0,01 ms.

En modo de colores forzados (Windows alto contraste) los rellenos desaparecen, así
que todo estado que hoy se marca con relleno lleva además borde o texto. Por eso
el botón primario deshabilitado tiene borde y el seleccionado del grupo de
opciones tiene barra y peso de letra.

## 10. Antipatrones y cómo los evita este sistema

| Prohibido | Cómo se evita |
|---|---|
| Tarjetas idénticas con la misma sombra | Hay una sola sombra en toda la aplicación y es la de la hoja. Los demás contenedores se separan con una línea de 1 px. Un componente nuevo con `box-shadow` es un error de revisión |
| Etiquetas en mayúsculas sostenidas | `text-transform: none` es la regla; la jerarquía la dan tamaño y peso. La única mayúscula sostenida del sistema es `NOMBRE_CAMPANA_MAYUS`, que es texto legal del documento |
| Flechas al final de los botones | Las etiquetas son verbos completos: "Generar T&C", "Guardar link publicado", "Continuar al paso 4". Si un icono aporta, va antes de la etiqueta |
| Degradados decorativos | Cero `linear-gradient` en la hoja de estilos. Todos los rellenos son planos. La barra de cambio y el anillo de foco son color sólido |
| Emojis como iconos | Seis SVG en línea, trazo 1,5 px, `currentColor`, `aria-hidden="true"`. Ningún carácter de emoji en la interfaz |

Dos que se agregan solos por coherencia: nada de marcas de agua giradas sobre la
hoja, y nada de colores de estado fuera de la paleta (ni verde de "listo" ni rojo
distinto del Naranja tinta).

## 11. Lista de verificación antes de subir

1. Navegar el formulario completo solo con el teclado, desde el país hasta
   "Generar T&C". El foco siempre se ve y el orden sigue la lectura.
2. El botón primario deshabilitado recibe foco y, al activarlo, lleva al aviso de
   lo que falta.
3. Ningún texto de interfaz por debajo de 14 px ni ningún campo por debajo de
   16 px.
4. A 320 px de ancho no hay barra de desplazamiento horizontal y el muelle de la
   hoja no tapa el botón primario.
5. A 200% de zoom del navegador no se pierde contenido ni se superponen columnas.
6. `prefers-reduced-motion: reduce` activo: nada se desliza y la barra de cambio
   sigue marcando la cláusula.
7. Buscar en `src/client/estilos.css`: cero `linear-gradient`, cero
   `text-transform: uppercase`, un solo `box-shadow`, cero `outline: none` sin
   reemplazo.
8. Buscar emojis en `src/client/`: cero resultados.
9. Cada estado de error dice qué pasó y cómo se arregla, y marca el campo exacto
   (los errores del motor ya vienen como `{campo, mensaje}`).

## 12. Pendientes de Juan

1. **Icono de la pestaña del navegador.** La corona en línea sirve dentro de la
   página, pero Apps Script pide una URL para el favicon
   (`setFaviconUrl`). Hace falta un PNG de 32 px alojado en Drive, o se deja el
   icono por defecto de Apps Script. Decisión de Juan.
2. **Nombre visible del producto en el encabezado.** Hoy dice "RappiMind v3". Si
   los comerciales lo conocen por otro nombre, se cambia el texto, no el diseño.
3. **Confirmar los cuatro términos del glosario** (Créditos, Organizador, Tienda
   Participante, Territorio) y sus definiciones cortas, que son texto que lee un
   comercial y conviene que las revise Legal.
4. **Capturas del instructivo de Squarespace** para el paso 8: el diseño reserva
   el espacio, pero las imágenes las tiene que dar Juan o Anna.
