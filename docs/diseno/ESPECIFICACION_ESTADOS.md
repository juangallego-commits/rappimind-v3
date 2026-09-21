# Los estados, los avisos y el progreso

Lo que Claude Design respondió el 21 de septiembre de 2026 a las tres preguntas
que el bundle no resolvía, más lo que salió de verificar sus números.

La fuente renderizada es `RappiMind Estados.dc.html`. Este archivo es el resumen
en texto, para no tener que abrir el prototipo cada vez.

---

## 1. La barra de progreso con 5 a 9 pasos

Ni segunda fila ni etiquetas truncadas. **Las etiquetas por paso se caen y el
nombre del paso actual pasa a la línea que ya existe encima**, con la forma
`Paso 7 de 9 · Participantes`. La barra se queda siempre en una sola fila, con
un segmento por paso.

La regla, y es una sola:

> Las etiquetas se muestran si hay **6 pasos o menos** y cada segmento mide
> **88px o más**. Si falla cualquiera de las dos, se caen **todas a la vez**.
> Nunca algunas sí y otras no.

Esto resuelve el hallazgo 3.3 de `docs/PLAN_IDENTIDAD.md`: hoy la aplicación
tiene entre 5 y 9 pasos según el tipo de campaña, y el diseño de una barra por
paso en una sola fila se rompía con nueve.

## 2. Los tres niveles de aviso

Se distinguen **por estructura, no por color de borde**, así que se reconocen
aunque se vean en blanco y negro, y ninguno necesita más de un pastel.

| Nivel | Cómo se ve |
|---|---|
| Informativo | Panel celeste `#D9F1FF`. Sin título, sin adorno |
| Serio | Panel beige `#FFF0DD`, con una regla de 3px con el gradiente en el borde **superior**, y título en caja alta |
| Error de campo | Sin panel. Borde de 2px en el campo y el mensaje suelto debajo, 13.5px en peso 700 |

Si dos coinciden en la misma pantalla, **un solo pastel**: el de mayor prioridad
se queda con su color y el otro baja a tarjeta blanca. La prioridad es
`error > serio > informativo`.

Esto resuelve el hallazgo 3.4: el brand book prohíbe el borde izquierdo de color,
y hoy es lo único que distingue `.aviso` de `.aviso-serio`.

## 3. Los estados del historial, sin verde

Se ordenan por **peso visual**, no por matiz. Así "Publicado" se encuentra de un
vistazo en una lista larga, y el sistema aguanta un quinto estado sin inventar
colores fuera de la paleta.

| Estado | Cómo se ve |
|---|---|
| Publicado | Gradiente. Es el único que lo lleva |
| Generado | `#FFF0DD` |
| Borrador | `#F4F5F6` con texto `#595959` |
| Vencido | Transparente con borde `rgba(10,10,10,.20)` |

## 4. Dos reglas transversales

**El campo con valor lleva borde tinta, no neón.** Es el único punto donde la
especificación nueva pisa al prototipo, y hay que aplicarla: en el prototipo el
campo con valor y el campo en error llevaban los dos el borde neón y no se
distinguían. Ahora el campo con valor va con borde tinta `#0A0A0A` y **el neón
queda reservado para el error**.

**Ningún estado deshabilitado se hace con `opacity`**, porque arrastra el texto
por debajo del contraste mínimo. Va con fondo `#F4F5F6`, borde
`rgba(10,10,10,.10)` y texto `#6B6B6B`.

---

## 5. Lo que salió de verificar los números

Se midieron los veintiocho pares de color de la paleta contra WCAG 2.1, con los
valores reales de `tokens/`. **Veintitrés llegan, cuatro están exentos y seis hay
que arreglar.**

El detalle, con el arreglo propuesto para cada uno, está en
**`docs/diseno/AUDITORIA_CONTRASTE.md`**. Se reproduce con `npm run contraste`.

Los seis, en corto:

| Qué | Da | Necesita | Arreglo |
|---|---|---|---|
| Anillo de foco del control | 1.99:1 | 3 | El neón sólido `#FF2526`, o alfa .75 |
| Anillo del campo enfocado | 1.57:1 | 3 | Lo mismo |
| Mensaje de error | 3.79:1 | 4.5 | `#D91F20` |
| Marcador de posición | 3.45:1 | 4.5 | `#707070` |
| Borde del campo vacío | 1.5:1 | 3 | Alfa .44 |
| Subrayado del hueco | 2.32:1 | 3 | Alfa .84, o `#D91F20` |

El del anillo de foco es el que más importa: el foco visible está en la lista de
lo que no se puede tocar de `docs/PARA_EL_DISENO.md`, y el anillo de hoy ya cumple
con 3.44:1. Bajarlo a 1.99 sería romper algo que estaba bien.

## 7. Las tres advertencias de entrega

**Las fuentes llegan en OTF y TTF, no en woff2.** Pesan Regular 55 KB, Medium
162 KB, Bold 62 KB, Heavy 62 KB, o sea 341 KB, que en base64 son unos 454 KB
sumados a cada carga de la aplicación. El Medium pesa el triple que los demás
solo porque viene sin comprimir.

Convertidos a woff2 y recortados a latín y latín extendido, los cuatro deberían
caber en 80 a 120 KB. El comando de `pyftsubset` está en el README del bundle.
La ruta corta, si no se convierten, es cargar solo Regular y Heavy y dejar que
Medium y Bold caigan al sintético, pero eso pierde calidad justo en el peso del
cuerpo de texto. **La conversión es la ruta recomendada.**

**Los logos.** En la barra superior va `rappi-logo-220.png`, porque ahí el
logotipo mide entre 17 y 19px de alto. `rappi-logo-440.png` si hace falta más
resolución. El original de 330 KB no sirve para base64.

**El lockup en SVG todavía no es autosuficiente.** El logotipo entra por
referencia relativa a `../logo/rappi-logo-440.png`, así que carga bien inline en
HTML o por `<object>`, pero **no dentro de un `<img>`**: el navegador bloquea
recursos externos en un SVG usado como imagen. Y "Mind" y "By Legal" van como
`<text>`, así que dependen de que PP Object Sans esté instalada.

Mientras tanto se usan los PNG. Para que el SVG quede autosuficiente faltan el
logotipo en vectorial y el texto convertido a trazos, y eso está pedido.

## 8. El quinto archivo de tokens

Además de los cuatro del design system hay un quinto, `tokens/rappimind.css`,
escrito para este traspaso. Cubre lo que el design system no define: estados de
control, niveles de aviso y estados de campaña. **Se importa siempre al final**,
para que pueda pisar lo anterior:

```css
@import url("tokens/fonts.css");
@import url("tokens/colors.css");
@import url("tokens/typography.css");
@import url("tokens/spacing.css");
@import url("tokens/rappimind.css");  /* el último */
```

Ojo con esto al implementar: Apps Script sirve la hoja de estilos embebida en un
solo `<style>`, así que **los `@import` no sobreviven**. El build tiene que
concatenar los cinco archivos en ese orden, o los valores se pierden en silencio,
que es exactamente el modo de falla que describe la skill `frontera-apps-script`.
