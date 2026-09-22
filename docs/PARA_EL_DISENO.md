# Para la etapa de diseño

Escrito el 18 de septiembre de 2026, al cerrar la revisión general. Es lo que se
vio con los ojos y con el medidor durante la revisión y **no se tocó**, porque
la revisión era del fondo y el diseño es la etapa siguiente.

Cada punto dice: en qué pantalla, qué se midió, y por qué importa. Lo que está
medido lleva su número; lo que es una impresión lo dice.

Para ver las pantallas sin abrir la aplicación, `npm run front` escribe
`docs/FRONT_ACTUAL.html` (ya no se versiona, se genera): 46
pantallas congeladas, se abre con doble clic y no lleva JavaScript. Se regenera
con `npm run front`.

---

## Lo que no se puede tocar

Antes de mover nada, esto no es estética: es lo que sostiene el producto.

1. **Nada de tablas en el documento generado.** Solo párrafos y viñetas. El
   sitio donde se publica no muestra tablas. Vale para el T&C, no para las
   pantallas.
2. **El texto legal no se toca.** Ni una coma de `modelos/`. Si una cláusula se
   ve mal, el arreglo es cómo se presenta, no cómo está escrita.
3. **El documento se llena mientras el comercial responde.** La columna de la
   derecha, y en celular la hoja deslizable, son la promesa central: lo que ves
   es lo que sale. Si un rediseño la deja de refrescar, el producto pierde su
   argumento.
4. **Una pregunta a la vez, y las respondidas quedan arriba en una línea, con
   "Cambiar".** Un formulario de veinte campos se abandona; veinte preguntas
   cortas no.
5. **Toda pregunta dice por qué se pregunta.** La pregunta legal que no se
   explica se responde al azar, y esa respuesta sale impresa.
6. **Lo opcional se ve opcional.** Una pregunta que parece obligatoria y no lo
   es hace inventar datos.
7. **La región de anuncios (`#anuncios`, `role="status"`, `aria-live="polite"`)
   y el título con `tabindex="-1"`.** Entraron en esta revisión: al cambiar de
   pantalla, el título recibe el foco y se anuncia. Sin eso, el lector de
   pantalla se queda callado y el teclado vuelve al principio en cada pantalla.
   Si el rediseño cambia la estructura de encabezados, hay que mantener un `h1`
   por pantalla dentro de `#app`.
8. **Todo en español, y sin guiones como signo de puntuación** en lo que el
   usuario lee.

---

## 1. En celular, "Ayuda" se sale de la pantalla

**Dónde.** La barra de arriba, en todas las pantallas.

**Medido.** La barra es una tira que se desliza de lado (`overflow-x: auto`) con
la barra de desplazamiento escondida (`scrollbar-width: none`). Los enlaces
quedan así:

| Ventana | Generar | Mis campañas | Ayuda | Administración |
|---|---|---|---|---|
| 360 px | 140..215 | 219..338 | **342..404, cortado** | 408..534, fuera |
| 390 px | 140..215 | 219..338 | **342..404, cortado** | 408..534, fuera |
| 430 px | 140..215 | 219..338 | 342..404, cabe | 408..534, fuera |

**Por qué importa.** 360 y 390 px son los anchos de casi todos los teléfonos. Un
comercial no ve "Administración" (y está bien, es solo para administradores),
pero tampoco ve "Ayuda" completa, y Ayuda es justo donde va quien no entiende
algo. Se llega deslizando la barra de lado, pero nada en la pantalla dice que se
pueda: no hay flecha, ni sombra, ni recorte visible.

**No se tocó** porque el arreglo es de distribución y la etapa de diseño lo va a
rehacer de todos modos. Pero no es un problema estético: es un enlace al que no
se llega.

---

## 2. El selector de idioma: blanco sobre naranja de marca

**Dónde.** El botón ES/BR, abajo a la derecha, en todas las pantallas.

**Medido.** El botón marcado usa texto blanco sobre `--naranja-marca` (#ff441f)
a 13 px. Contraste **3,44:1**. El mínimo para texto normal es 4,5:1.

**Las alternativas, ya medidas:**

| Fondo | Contraste con blanco |
|---|---|
| `--naranja-marca` #ff441f (hoy) | 3,44 |
| `--naranja-accion` #d32f0f | **5,02** |
| `--naranja-presionado` #a82409 | 7,19 |

**Por qué importa.** Es el único sitio de toda la hoja de estilos donde hay texto
blanco sobre el naranja de marca; en los demás el naranja se usa como borde, como
subrayado o como anillo de foco, donde el mínimo es 3:1 y 3,44 pasa. O sea que
se arregla en una línea, sin tocar la identidad.

---

## 3. El número de paso de la pantalla final, por poco

**Dónde.** Pantalla "Tu T&C está listo", la lista numerada de pasos para
publicar.

**Medido.** Círculos de 24 px con `--naranja-accion` (#d32f0f) sobre `--rubor`
(#ffede8), a 13 px. Contraste **4,43:1**, justo por debajo de 4,5.

**Por qué importa.** Son números, no prosa, así que la pérdida real es pequeña.
Se resuelve oscureciendo el texto o aclarando el fondo un punto.

---

## 4. El glosario es un blanco de clic de 23 px

**Dónde.** En el formulario, las palabras con glosario, por ejemplo "Tienda
Participante".

**Medido.** 135 × 23 px en escritorio. El mínimo recomendado es 24 × 24. En
celular no aparece en la pantalla que se midió.

**Por qué importa.** Es un píxel de diferencia y solo en escritorio, así que es
lo menos urgente de esta lista. Se anota porque el rediseño va a tocar esa
tipografía y conviene que salga por encima del mínimo.

---

## 5. Los otros contrastes salen bien, y estos son los números

Se midieron todos los textos visibles de cinco pantallas, en escritorio y en
celular. Solo salieron los dos de arriba. Para que el rediseño no los pierda:

| Combinación | Contraste | Mínimo |
|---|---|---|
| `--tinta` #16181d sobre papel | 17,76 | 4,5 |
| `--gris-lapiz` #5d626d sobre papel | 6,12 | 4,5 |
| `--gris-lapiz` sobre `--niebla` #f4f6f8 | 5,65 | 4,5 |
| `--verde-confirma` sobre `--verde-palido` | 4,73 | 4,5 |
| `--rojo-alerta` sobre `--rojo-palido` | 4,81 | 4,5 |

Los tres últimos pasan por poco. Cualquier ajuste de la paleta tiene que volver
a medirlos.

---

## 6. La barra de pasos se rompió una vez con siete pasos

**Dónde.** La barra de progreso de arriba del formulario.

**Qué pasó.** Con seis pasos entraba justa. Al entrar el séptimo, "Organizador"
y "Cuándo" se leían pegados, como una sola palabra. Se resolvió envolviéndola en
dos filas. Solo se vio abriendo el navegador; ninguna prueba lo vio.

**Por qué importa.** El número de pasos depende del tipo de campaña, y va a
crecer. El rediseño tiene que aguantar siete pasos y probablemente ocho, y hay
que mirarlo con los ojos, no de memoria.

---

## 7. El peso de lo que se descarga, que se nota en la calle

**Medido.** El navegador recibe **710 KB** sin comprimir en cada carga:

| Pieza | Tamaño |
|---|---|
| `MotorCliente.html` (el motor y los datos) | 533 KB |
| `App.html` (la interfaz) | 155 KB |
| `Estilos.html` | 21 KB |
| `Index.html` | 1 KB |

Dentro del motor: los textos legales 54 KB, el catálogo de leyendas 32 KB, los
países 18 KB, los T&C generales 11 KB, y el resto son los 415 KB de
`src/core/*.js`, que el navegador necesita para armar la vista previa en vivo.

**Por qué importa aquí.** No es estética, pero sí es la primera impresión: en la
calle, con mala señal, son varios segundos de pantalla con "Cargando
RappiMind...". Y va a crecer: el catálogo de leyendas son 32 KB **solo con las
de Colombia**. Si entran los otros ocho países, esa pieza se multiplica.

**Lo que no se puede hacer.** Dejar de mandar los datos al navegador. Eso ya
pasó una vez: `MODELOS` quedó sin definir del lado del usuario, la vista previa
reventó a mitad del clic y, de paso, la tarjeta del tipo de campaña dejó de
marcarse. Dos defectos aparentes, una sola causa. Si se toca esto, la prueba que
lo cuida es `MotorCliente.html corre solo en el navegador y arma la vista
previa`.

---

## 8. Cosas que se ven, sin medida, para mirar con ojos de diseño

Ninguna está rota; son impresiones de la revisión.

- **La pantalla final es larga.** El documento, los pasos para publicar, el
  bloque de leyendas por formato con su contador de caracteres, y el aviso del
  acuerdo de datos cuando aplica. Es la pantalla con más cosas de toda la
  herramienta y es donde el comercial llega cansado.
- **El aviso de "no cabe" de las leyendas es un bloque de texto.** Dice por
  cuántos caracteres se pasa y cuánto de eso son enlaces. Es exactamente el dato
  que hace falta, y hoy se lee como un párrafo más.
- **El resumen y el formulario muestran la misma información de dos maneras.**
  Las respuestas plegadas arriba del formulario y el resumen antes de generar.
  Conviene mirar si las dos hacen falta.
- **La lista de tipos de campaña y la tarjeta de los T&C publicados compiten.**
  La tarjeta va debajo, separada por una línea y con su propio encabezado,
  porque no es un tipo más: los demás generan documento y esa entrega un enlace.
  La separación funciona, pero es sutil.
- **La hoja deslizable del documento en celular** es el sitio donde vive la
  promesa del producto en un teléfono. Merece la mirada más larga del rediseño.

---

## Cómo comprobar que un cambio de diseño no rompió nada

```
npm test
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js
npm run front
```

El recorrido de navegador revisa, entre otras cosas, que el selector de idioma
no tape los botones del final en celular, que al cambiar de pantalla se anuncie
y el foco quede en el título, y que el tabulador siga dentro de la pantalla y no
vuelva a la barra de arriba. `pruebas/estilos.test.js` revisa que toda regla de
la hoja se pueda acotar al marco de una pantalla, que es lo que permite que
`docs/FRONT_ACTUAL.html` se vea como la aplicación.
