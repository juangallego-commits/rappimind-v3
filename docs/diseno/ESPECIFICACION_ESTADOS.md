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

Se midieron con la fórmula de luminancia relativa de WCAG 2.1. Casi todo pasa.
Tres notas.

**Una corrección menor.** El texto deshabilitado `#6B6B6B` sobre `#F4F5F6` da
**4.88:1**, no 5.3:1 como dice la especificación. La conclusión no cambia, porque
4.88 pasa AA. Solo queda anotado para que nadie ajuste el color creyendo que
tiene más margen del que tiene.

**Un problema real: el mensaje de error suelto no pasa.** En neón `#FF2526` da
3.79:1 sobre papel y 3.47:1 sobre niebla. A 13.5px en peso 700 eso es texto
normal para WCAG, no texto grande, así que el mínimo es 4.5:1. Y es justo el
texto que tiene que leerse.

> **El arreglo: `#D91F20` para el texto del mensaje de error.** Es el mismo neón
> al 85% de brillo y da 5.81:1 sobre papel, 5.33:1 sobre niebla y 5.19:1 sobre
> beige. A ojo se lee como el mismo rojo.
>
> El `#FF2526` se queda **para el borde del campo en error y para el anillo de
> foco**, donde el mínimo es 3:1 y sí lo pasa (3.79:1). O sea que hacen falta dos
> tokens: `--neon` para lo que no lleva texto y `--neon-texto` para lo que sí.
>
> Es el mismo patrón que ya existe hoy con `--naranja-marca` y `--naranja-accion`.

**Dos bordes de bajo contraste que no son un problema.** El borde del
deshabilitado (`rgba(10,10,10,.10)`, 1.23:1) y el del estado "Vencido"
(`rgba(10,10,10,.20)`, 1.57:1) quedan muy por debajo de 3:1, pero no incumplen:
WCAG exime explícitamente los componentes inactivos, y la píldora de "Vencido"
no es un control sino una etiqueta cuyo significado lo carga su propio texto.
Se dejan como están.

## 6. Contrastes verificados, para no volver a medirlos

| Par | Razón | Mínimo | |
|---|---|---|---|
| Tinta `#0A0A0A` sobre celeste `#D9F1FF` | 16.95:1 | 4.5 | pasa |
| Tinta `#0A0A0A` sobre beige `#FFF0DD` | 17.69:1 | 4.5 | pasa |
| Borrador `#595959` sobre `#F4F5F6` | 6.42:1 | 4.5 | pasa |
| Deshabilitado `#6B6B6B` sobre `#F4F5F6` | 4.88:1 | 4.5 | pasa |
| Borde del campo con valor, tinta sobre papel | 19.8:1 | 3 | pasa |
| Borde del campo en error, `#FF2526` sobre papel | 3.79:1 | 3 | pasa |
| Mensaje de error `#FF2526` sobre papel | 3.79:1 | 4.5 | **no pasa** |
| Mensaje de error `#D91F20` sobre papel | 5.81:1 | 4.5 | pasa |

---

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
