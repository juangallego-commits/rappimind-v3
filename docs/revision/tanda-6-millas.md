# Tanda 6 de 8 · Millas: la misma mecánica en dos verticales

> **Antes de pegar esto, pega `PROMPT.md`.** Ahí va quién revisa, qué es
> RappiMind, qué no se puede tocar y en qué formato tiene que venir la
> respuesta. Sin eso, la revisión vuelve en prosa y no se puede aplicar.

Millas y Millas Travel. Es el mismo beneficio, un programa de lealtad aliado que le da millas al usuario por comprar, y se pide igual en la Plataforma Rappi y en Rappi Travel. Las preguntas son nuevas y no han pasado por una revisión de copy.

## Lo que hay que mirar en esta tanda

- Las dos formas del beneficio: "un número fijo por orden" y "millas por cada tanto gastado". ¿Se distinguen sin tener las dos piezas al lado?
- La bolsa de millas y su equivalencia en órdenes: son dos números que tienen que cuadrar. ¿Entiende el comercial que uno sale del otro?
- La pregunta de cómo se vincula el usuario al programa: las dos opciones vienen de campañas reales distintas. ¿Sabe el comercial cuál es la suya?
- El vocabulario del programa: "enrolado", "programa preferido de acumulación", "cartola". ¿Son palabras que un KAM usa, o del programa?
- Si alguna pregunta pide un dato que solo tiene el programa de lealtad y no el comercial.

## Millas: sus preguntas propias

Un programa de lealtad aliado le da millas al usuario por comprar en una tienda de la Plataforma Rappi. El programa organiza la campaña y acredita las millas; Rappi difunde y transmite la orden.

Las otras 22 preguntas de este tipo son las mismas del Cashback y ya van en la tanda 2.

### Paso: Campaña

#### ¿Qué productos participan?

> Si el concurso lo paga una marca, suelen participar solo sus productos.

**Por qué te preguntamos esto.** Define qué compras cuentan para el ranking. Si no queda claro, cualquier compra podría contar.

| | |
|---|---|
| Campo interno | `productos` |
| Paso | Concurso |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_PRODUCTOS` |

**Opciones** (botones grandes, una sola):

- **Todo lo de la tienda**: Cualquier producto del catálogo.
- **Solo los de una marca**: Los productos de un Maker.
- **Unos productos puntuales**: Tú haces la lista.

**Mensajes de validación:**

- Si lo deja en blanco: Dinos qué productos participan.

#### ¿De qué marca?

> El nombre comercial de la marca. Por ejemplo: Galletas Lunaria.

**Por qué te preguntamos esto.** El documento nombra la marca, así que el usuario sabe exactamente qué comprar para participar.

| | |
|---|---|
| Campo interno | `makerMarca` |
| Paso | Concurso |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Galletas Lunaria |
| Avanza sola | no |
| Llena en el documento | `TEXTO_PRODUCTOS` |

**Mensajes de validación:**

- Si lo deja en blanco: Escribe el nombre de la marca.

#### ¿Cuáles productos?

> Sepáralos con comas, como aparecen en la app.

**Por qué te preguntamos esto.** La lista sale escrita tal cual en el documento. Si falta uno, las compras de ese producto no cuentan.

| | |
|---|---|
| Campo interno | `productosLista` |
| Paso | Concurso |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Galletas Lunaria clásicas, Galletas Lunaria de chocolate |
| Avanza sola | no |
| Llena en el documento | `TEXTO_PRODUCTOS` |

**Mensajes de validación:**

- Si lo deja en blanco: Escribe los productos que participan, separados por comas.

#### ¿La campaña corre dentro del botón Turbo?

> Márcalo si la tienda participante es Turbo o está dentro de Turbo.

**Por qué te preguntamos esto.** Turbo tiene sus propios términos y condiciones, y el documento tiene que remitir a ellos. Sin esa remisión, las reglas de Turbo no le aplican a la campaña.

| | |
|---|---|
| Campo interno | `enTurbo` |
| Paso | Campaña |
| Tipo de control | casilla |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_TC_TURBO` |

### Paso: Organizador

#### ¿Cuál es el programa de lealtad?

> El nombre como lo ve el usuario. Por ejemplo: LifeMiles.

**Por qué te preguntamos esto.** El documento nombra el programa en la mecánica, en la acreditación y en la cláusula de datos. Si el nombre no coincide con el de la app, el usuario no sabe dónde buscar sus millas.

| | |
|---|---|
| Campo interno | `programaLealtad` |
| Paso | Organizador |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | LifeMiles |
| Avanza sola | no |
| Llena en el documento | `PROGRAMA_MILLAS` |

**Mensajes de validación:**

- Si lo deja en blanco: Escribe el nombre del programa de lealtad que da las millas.

### Paso: Beneficio

#### ¿Cómo se calculan las millas?

> Un número fijo por orden, o unas millas por cada tanto gastado.

**Por qué te preguntamos esto.** Es la frase central del documento: dice qué recibe el usuario y por qué. Las dos formas están publicadas y un mismo documento no puede llevar las dos.

| | |
|---|---|
| Campo interno | `formaMillas` |
| Paso | Beneficio |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_BENEFICIO_MILLAS` |

**Opciones** (botones grandes, una sola):

- **Un número fijo por orden**: Como en la campaña de MUSS y TANGA: 400 millas por cada orden válida.
- **Millas por cada tanto gastado**: Como en la de Civitatis: 6 millas por cada fracción de 3.500 pesos.

**Mensajes de validación:**

- Si lo deja en blanco: Dinos cómo se calculan las millas.

#### ¿Cuántas millas recibe por cada orden?

> El número exacto que promete la campaña. Por ejemplo: 400.

**Por qué te preguntamos esto.** Es el número que el usuario ve prometido y el que el programa tiene que acreditar. Sale escrito en letras y en cifra, así que no puede quedar aproximado.

| | |
|---|---|
| Campo interno | `millasPorOrden` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 400 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_BENEFICIO_MILLAS` |

**Mensajes de validación:**

- Si lo deja en blanco: Escribe cuántas millas recibe el usuario por cada orden.
- Si el número se sale del rango: Tiene que ser al menos una milla.

#### ¿Cuántas millas da cada fracción?

> Por ejemplo: 6 millas por cada fracción gastada.

**Por qué te preguntamos esto.** Junto con el valor de la fracción forma la promesa completa. Si uno de los dos números está mal, el usuario recibe menos millas de las que la pieza le prometió.

| | |
|---|---|
| Campo interno | `millasPorFraccion` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 6 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_BENEFICIO_MILLAS` |

**Mensajes de validación:**

- Si lo deja en blanco: Escribe cuántas millas da cada fracción de gasto.
- Si el número se sale del rango: Tiene que ser al menos una milla.

#### ¿De cuánto es cada fracción de gasto?

> Lo que hay que gastar para ganar esas millas. Por ejemplo: 3.500.

**Por qué te preguntamos esto.** Es el divisor de la promesa. Un valor distinto al de la pieza publicitaria cambia cuántas millas recibe el usuario por la misma compra.

| | |
|---|---|
| Campo interno | `valorFraccion` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 3500 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_BENEFICIO_MILLAS` |

**Mensajes de validación:**

- Si lo deja en blanco: Escribe el valor de cada fracción de gasto.
- Si el número se sale del rango: Tiene que ser mayor que cero.

#### ¿La fracción equivale a un dólar?

> Márcalo si el valor sale de convertir un dólar a la moneda del país.

**Por qué te preguntamos esto.** Cuando la fracción sale de una conversión, el documento lo explica, y así el usuario entiende de dónde viene una cifra que si no parece arbitraria.

| | |
|---|---|
| Campo interno | `fraccionEsDolar` |
| Paso | Beneficio |
| Tipo de control | casilla |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_NOTA_FRACCION_MILLAS` |

#### ¿Las millas se juntan con otras promociones?

> Las dos campañas publicadas lo resolvieron distinto. Confírmalo con el aliado.

**Por qué te preguntamos esto.** El documento lo dice expresamente. Si dice que sí y el programa no lo permite, el usuario reclama con el documento en la mano.

| | |
|---|---|
| Campo interno | `acumulableMillas` |
| Paso | Beneficio |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_ACUMULABLE_MILLAS` |

**Opciones** (botones grandes, una sola):

- **No se juntan**: Como en la de Civitatis, que las excluye con otras promociones de millas.
- **Sí se juntan**: Como en la de MUSS y TANGA, acumulable con las demás promociones de la app.

**Mensajes de validación:**

- Si lo deja en blanco: Dinos si las millas se juntan con otras promociones.

#### sinLimitePorUsuario

No tiene pregunta propia: se responde dentro de **limitePorUsuario**.

#### ¿Hay un tope de millas por persona?

> El total que una persona puede acumular en toda la campaña. Si no hay, déjalo vacío.

**Por qué te preguntamos esto.** Es un freno distinto al de las órdenes: una persona puede quedarse dentro del número de órdenes y aun así pasarse del tope. Si no está escrito, no lo puedes aplicar.

| | |
|---|---|
| Campo interno | `topeMillasUsuario` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 4000 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_TOPE_MILLAS` |

**Mensajes de validación:**

- Si el número se sale del rango: Si hay tope, tiene que ser al menos una milla.

#### ¿Cuántas millas tiene la bolsa de la campaña?

> El total que el programa puso para toda la campaña. Si no hay bolsa, déjalo vacío.

**Por qué te preguntamos esto.** Cuando se agota, la campaña termina sola aunque no haya llegado la fecha de fin. El documento lo dice en la vigencia, así que el usuario sabe que puede acabarse antes.

| | |
|---|---|
| Campo interno | `bolsaMillas` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 148000 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_AGOTAMIENTO_MILLAS`, `TEXTO_EXISTENCIAS_MILLAS` |

**Mensajes de validación:**

- Si el número se sale del rango: Si hay bolsa, tiene que ser al menos una milla.

#### ¿Cuándo se acreditan las millas?

> Unos días después de la compra, o cuando el programa las procese.

**Por qué te preguntamos esto.** Es el compromiso de fecha frente al usuario. Antes de ese plazo no puede reclamar, después sí, así que prometer menos días de los reales genera reclamos.

| | |
|---|---|
| Campo interno | `acreditacionMillas` |
| Paso | Beneficio |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_ACREDITACION_MILLAS` |

**Opciones** (botones grandes, una sola):

- **Unos días después de la compra**: Como en la de Civitatis: cinco días calendario después de confirmarse.
- **Según los tiempos del programa**: Como en la de MUSS y TANGA, con los procesos internos del programa.

**Mensajes de validación:**

- Si lo deja en blanco: Dinos cuándo se acreditan las millas.

#### ¿Cuántos días después de la compra?

> Días calendario contados desde que la compra se confirma. Por ejemplo: 5.

**Por qué te preguntamos esto.** Ese número es la promesa que el usuario puede exigir. Si el programa se demora más, el reclamo se resuelve con lo que diga el documento.

| | |
|---|---|
| Campo interno | `diasAcreditacion` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 5 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_ACREDITACION_MILLAS` |

**Mensajes de validación:**

- Si lo deja en blanco: Escribe cuántos días después de la compra se acreditan las millas.
- Si el número se sale del rango: El plazo va de 1 a 60 días.

### Paso: Participantes

#### ¿Cómo se vincula el usuario al programa?

> Las dos campañas publicadas piden cosas distintas. Elige la tuya.

**Por qué te preguntamos esto.** Es un requisito para participar y sale escrito como viñeta. Si pides menos de lo que el programa exige, el usuario compra y después no recibe sus millas.

| | |
|---|---|
| Campo interno | `vinculacionPrograma` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_VINCULACION_MILLAS` |

**Opciones** (botones grandes, una sola):

- **Con una cuenta activa en el programa**: Basta con estar afiliado, como en la campaña de Civitatis.
- **Enrolado en Rappi y con el programa de preferencia**: Además de enrolarse, lo elige como programa preferido de acumulación.

**Mensajes de validación:**

- Si lo deja en blanco: Dinos cómo se vincula el usuario al programa.

---

## Fin de la tanda 6

Responde con las fichas de hallazgo en el formato del prompt, la tabla de cierre
y las tres preguntas para Juan. Si algo está bien, dilo en una línea y sigue: lo
que no tiene ficha se da por aprobado.
