# Tanda 7 de 7 · El celular, los errores y los límites

> **Antes de pegar esto, pega `PROMPT.md`.** Ahí va quién revisa, qué es
> RappiMind, qué no se puede tocar y en qué formato tiene que venir la
> respuesta. Sin eso, la revisión vuelve en prosa y no se puede aplicar.

Lo que se rompe. Las tres pantallas en celular, todos los mensajes de validación del formulario juntos, y lo que el comercial lee cuando Google falla a mitad de una generación.

## Lo que hay que mirar en esta tanda

- En celular: ¿se entiende que el documento está detrás del botón flotante?
- Los mensajes de validación, leídos de corrido: ¿hablan todos igual? ¿Alguno culpa al comercial?
- Los mensajes de falla: ¿dicen si se perdió lo respondido y qué hacer ahora?
- Si algún mensaje usa una palabra técnica que el comercial no conoce.

Van 3 pantallas, con su texto tal como se lee en la aplicación.


**Para adjuntar en el mismo mensaje** (Claude chat lee imágenes, y es lo único
que le deja juzgar el aire, la jerarquía y el tamaño de los botones). Están en
`docs/revision/capturas/`:

- `45-celular-pregunta.png` · pantalla 45, Una pregunta en celular
- `46-celular-hoja.png` · pantalla 46, El documento en la hoja deslizable

Si no las adjuntas, la revisión igual funciona: el texto va completo aquí.

---

## Pantalla 44 · Inicio en celular

*`inicio` · celular 390 × 844 · interfaz en español*

**Qué hace el comercial aquí.** La portada en celular. La barra de arriba se desliza de lado y el selector de idioma sube para no taparle nada.

**Lo que dice la pantalla, palabra por palabra:**

```
Genera los Términos y Condiciones de tu campaña

Sin escribirle a Legal y sin redactar una sola cláusula. Toma menos de cinco minutos.

Cuéntanos de tu campaña

Te hacemos preguntas simples, una por una. Ninguna te pide escribir texto legal.

Revisa cómo va quedando

El documento se va escribiendo mientras respondes. Lo que ves es lo que sale.

Publica los T&C

Te llega por correo en un par de minutos, con los pasos para publicarlo o a quién pasárselo.

Empezar
```

---

## Pantalla 45 · Una pregunta en celular

*`pasos` · celular 390 × 844 · interfaz en español*

**Qué hace el comercial aquí.** Una pregunta del formulario en celular. La barra de progreso se vuelve "Paso 2 de 7" y el documento se va a un botón fijo abajo.

**Lo que dice la pantalla, palabra por palabra:**

```
Paso 4 de 7 · Beneficio

El beneficio
¿Qué porcentaje del pedido se devuelve en Créditos?
Cambiar

20%

¿Cuál es el máximo de Créditos por pedido?

Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.

$
¿Por qué te preguntamos esto?

Sin tope, un pedido enorme se lleva el presupuesto entero. Con tope, un cashback alto sigue siendo viable.

Con estos datos, un pedido de $100.000 recibe $20.000 en Créditos.

Quedan 3 preguntas en este paso.

Atrás
Siguiente
Ver cómo va mi T&C

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Dentro del campo, en gris: «25000»
- Si lo deja en blanco: «Escribe el máximo de Créditos que recibe una persona por pedido.»
- Si escribe cero: «El tope tiene que ser mayor que cero.»
- Si el número supera el presupuesto: «El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.»

---

## Pantalla 46 · El documento en la hoja deslizable

*`pasos` · celular 390 × 844 · interfaz en español*

**Qué hace el comercial aquí.** Toca "Ver cómo va mi T&C" y el documento sube en una hoja deslizable, con la cortina detrás y el botón de cerrar abajo.

**Para leer la pantalla.** La hoja lleva el mismo documento de la columna de escritorio, así que aquí va marcado. Lo que importa de esta pantalla es la hoja, no el texto.

**Lo que dice la pantalla, palabra por palabra:**

```
Paso 4 de 7 · Beneficio

El beneficio
¿Qué porcentaje del pedido se devuelve en Créditos?
Cambiar

20%

¿Cuál es el máximo de Créditos por pedido?

Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.

$
¿Por qué te preguntamos esto?

Sin tope, un pedido enorme se lleva el presupuesto entero. Con tope, un cashback alto sigue siendo viable.

Con estos datos, un pedido de $100.000 recibe $20.000 en Créditos.

Quedan 3 preguntas en este paso.

Atrás
Siguiente
Ver cómo va mi T&C

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

---

## Todos los mensajes de validación, de corrido

Cada uno sale debajo del campo, en rojo, mientras el comercial escribe. Leídos uno detrás de otro se nota si hablan igual, si alguno lo culpa a él y si alguno se queda en decir que está mal sin decir cómo se arregla.

| Pregunta | Cuándo sale | Qué dice |
|---|---|---|
| ¿En qué país corre la campaña? | lo deja en blanco | Elige el país de la campaña. |
| ¿La campaña es de Rappi o de Rappi Travel? | lo deja en blanco | Dinos si la campaña es de Rappi o de Rappi Travel. |
| ¿Qué tipo de campaña vas a hacer? | lo deja en blanco | Elige el tipo de campaña. |
| ¿Qué recibe el usuario? | lo deja en blanco | Elige qué recibe el usuario. |
| ¿Con qué medios se puede pagar? | lo deja en blanco | Marca al menos un medio de pago. |
| ¿En cuántos minutos prometes la entrega? | lo deja en blanco | Escribe en cuántos minutos prometes la entrega. |
| ¿En cuántos minutos prometes la entrega? | el número se sale del rango | El ETA tiene que estar entre 1 y 240 minutos. |
| ¿En qué secciones NO se pueden redimir los Créditos? | lo deja en blanco | Marca las secciones excluidas, o sigue sin marcar ninguna. |
| ¿En qué tienda aplica? | lo deja en blanco | Escribe la tienda donde aplica la campaña. |
| ¿Dónde aplica la campaña? | lo deja en blanco | Elige si la campaña es nacional o por ciudades. |
| ¿En qué ciudades? | lo deja en blanco | Escribe al menos una ciudad, o vuelve y elige cobertura nacional. |
| ¿Qué empresa paga el beneficio? | lo deja en blanco | Escribe la razón social de la empresa que paga el beneficio. Si no la tienes, pídesela a tu contacto en la tienda. |
| ¿Cuál es el NIT de esa empresa? | lo deja en blanco | Escribe el NIT de la empresa organizadora, con el dígito de verificación. |
| ¿Cuál es el NIT de esa empresa? | lo escribe con otro formato | Ese número no cuadra. Revisa el dígito de verificación, que es el que va después del guion. |
| ¿Qué día arranca la campaña? | lo deja en blanco | Elige el día en que arranca la campaña. |
| ¿Qué día arranca la campaña? | la fecha ya pasó | Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro. |
| ¿A qué hora arranca? | lo deja en blanco | Elige la hora de inicio. |
| ¿Qué día termina? | lo deja en blanco | Elige el día en que termina la campaña. |
| ¿Qué día termina? | las fechas van al revés | La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin. |
| ¿A qué hora termina? | lo deja en blanco | Elige la hora de fin. |
| ¿A qué hora termina? | las fechas van al revés | La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día. |
| ¿Qué porcentaje del pedido se devuelve en Créditos? | lo deja en blanco | Escribe el porcentaje que devuelves, sin el signo de porcentaje. |
| ¿Qué porcentaje del pedido se devuelve en Créditos? | el número se sale del rango | El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal. |
| ¿Cuál es el máximo de Créditos por pedido? | lo deja en blanco | Escribe el máximo de Créditos que recibe una persona por pedido. |
| ¿Cuál es el máximo de Créditos por pedido? | escribe cero | El tope tiene que ser mayor que cero. |
| ¿Cuál es el máximo de Créditos por pedido? | el número supera el presupuesto | El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números. |
| ¿Cuánto es el presupuesto total de la campaña? | lo deja en blanco | Escribe el presupuesto total de la campaña. |
| ¿Cuánto es el presupuesto total de la campaña? | escribe cero | El presupuesto tiene que ser mayor que cero. |
| ¿Cuántas veces puede recibir el beneficio una persona? | lo deja en blanco | Dinos cuántas veces puede ganar la misma persona. |
| ¿Cuántas veces puede recibir el beneficio una persona? | la cuenta no cuadra con lo que respondió antes | Escribe cuántos pedidos con beneficio puede hacer una persona. |
| ¿Cuántas veces puede recibir el beneficio una persona? | el número se sale del rango | Tiene que ser al menos un pedido. |
| ¿Hay que gastar un mínimo para participar? | escribe cero | Si no quieres exigir un mínimo, deja el campo vacío. |
| ¿Cuándo le llegan los Créditos al usuario? | lo deja en blanco | Dinos cuándo le llegan los Créditos al usuario. |
| ¿Qué día les cargas los Créditos? | lo deja en blanco | Elige el día de la carga. |
| ¿Qué día les cargas los Créditos? | la fecha queda antes de la que debía | La carga no puede ser antes de que arranque la campaña. |
| ¿Hasta cuándo puede usar esos Créditos? | lo deja en blanco | Dinos hasta cuándo sirven los Créditos. |
| ¿Cuántos días le duran? | lo deja en blanco | Escribe cuántos días duran los Créditos. |
| ¿Cuántos días le duran? | el número se sale del rango | Los días van de 1 a 365. |
| ¿Qué día se vencen los Créditos? | lo deja en blanco | Elige el día en que se vencen los Créditos. |
| ¿Qué día se vencen los Créditos? | las fechas van al revés | Los Créditos tienen que vencerse después de que termine la campaña. Si no, quien compre el último día no alcanza a usarlos. |
| ¿Dónde puede gastar los Créditos? | lo deja en blanco | Dinos dónde puede gastar los Créditos. |
| ¿Qué categoría tiene el producto de la pieza? | lo deja en blanco | Elige una categoría, o Ninguna si el producto no es de ninguna de esas. |
| ¿Cuál es el registro sanitario? | lo deja en blanco | Escribe el registro sanitario del producto. |
| ¿En qué secciones? | lo deja en blanco | Marca al menos una sección. |
| ¿Qué categorías de Travel participan? | lo deja en blanco | Marca al menos una categoría. |
| ¿Los viajes son nacionales o internacionales? | lo deja en blanco | Dinos si los viajes son nacionales, internacionales o los dos. |
| ¿Qué hoteles participan? | lo deja en blanco | Dinos qué hoteles participan. |
| ¿Cuáles hoteles? | lo deja en blanco | Escribe al menos un hotel, o vuelve y elige que participan todos. |
| ¿Qué trayectos aplican? | lo deja en blanco | Dinos qué trayectos aplican. |
| ¿Una ida y regreso cuenta como una orden? | lo deja en blanco | Dinos cómo se cuenta una compra de ida y regreso. |
| ¿Hay clases tarifarias excluidas? | lo escribe con otro formato | Cada clase tarifaria es una sola letra, separada por comas. Por ejemplo: A, F. |
| ¿Hay que comprar con anticipación? | el número se sale del rango | Los días de anticipación van de 1 a 365. |
| ¿Y hasta qué fecha? | lo deja en blanco | Escribe hasta cuándo se puede viajar. |
| ¿Y hasta qué fecha? | las fechas van al revés | El periodo de viaje no puede terminar antes de empezar. |
| ¿Hay fechas en las que no aplica? | lo escribe con otro formato | Las fechas van en formato año-mes-día, separadas por comas. Por ejemplo: 2026-12-24. |
| ¿Hay fechas en las que no aplica? | la fecha queda fuera de la campaña | Las fechas excluidas tienen que estar dentro del periodo de viaje. |
| ¿Hay un mínimo de noches? | el número se sale del rango | El mínimo de noches va de 1 a 365. |
| ¿Hay un mínimo de días de alquiler? | el número se sale del rango | El mínimo de días va de 1 a 365. |
| ¿Y un máximo? | lo deja en blanco | Escribe el máximo de días de alquiler. |
| ¿Y un máximo? | las fechas van al revés | El mínimo de días no puede ser mayor que el máximo. |
| ¿El aliado pide alguna otra condición? | lo deja en blanco | Dinos si el aliado pide alguna otra condición. |
| ¿Cómo se calcula el cashback? | lo deja en blanco | Dinos cómo se calcula el cashback. |
| ¿Cuántos Créditos recibe por orden? | lo deja en blanco | Escribe cuántos Créditos recibe una persona por orden. |
| ¿Cuántos Créditos recibe por orden? | escribe cero | Los Créditos por orden tienen que ser más que cero. |
| ¿Cuántos Créditos recibe por orden? | el número supera el presupuesto | Los Créditos por orden son más que el presupuesto total. Revisa los dos números. |
| ¿Cuántas órdenes puede beneficiar una persona? | lo deja en blanco | Escribe cuántas órdenes con beneficio puede tener una persona. |
| ¿Cuántas órdenes puede beneficiar una persona? | el número se sale del rango | Tiene que ser al menos una orden. |
| ¿Hay un máximo de órdenes en la campaña? | lo deja en blanco | Escribe el máximo de órdenes, o marca que no hay máximo. |
| ¿Hay un máximo de órdenes en la campaña? | el número se sale del rango | Tiene que ser al menos una orden. |
| ¿El descuento es igual en todos los productos? | lo deja en blanco | Dinos si el descuento es igual en todos los productos. |
| ¿Cuál es el descuento más bajo? | lo deja en blanco | Escribe el descuento más bajo de la campaña. |
| ¿Cuál es el descuento más bajo? | el número se sale del rango | El descuento más bajo tiene que ser menor que el más alto. Si son iguales, el descuento es fijo. |
| ¿A cuántos productos llega el descuento máximo? | lo deja en blanco | Escribe a cuántos productos llega el descuento máximo. |
| ¿A cuántos productos llega el descuento máximo? | el número se sale del rango | Tiene que ser al menos un producto. |
| ¿Dónde ve el usuario el descuento? | lo deja en blanco | Marca al menos un lugar donde el usuario vea el descuento. |
| ¿La campaña termina al agotarse unas unidades? | lo deja en blanco | Escribe cuántas unidades hay, o marca que no depende de unidades. |
| ¿La campaña termina al agotarse unas unidades? | el número se sale del rango | Tiene que ser al menos una unidad. |
| ¿Cuántos días después? | lo deja en blanco | Escribe cuántos días después de que termine la campaña llegan los Créditos. |
| ¿Cuántos días después? | el número se sale del rango | Los días van de 1 a 30. |
| ¿En qué categorías se pueden usar? | lo deja en blanco | Marca al menos una categoría donde se puedan usar los Créditos. |
| ¿Qué día sale la primera pieza? | lo deja en blanco | Escribe el día en que sale la primera comunicación. |
| ¿Qué día sale la primera pieza? | la fecha ya pasó | La primera comunicación no puede ser una fecha que ya pasó: el T&C se publica antes de que salga la primera pieza. |
| Confirma que el aliado aprobó la mecánica | lo deja en blanco | Confirma que el aliado aprobó la mecánica. |
| Confirma que las piezas dicen lo mismo que el T&C | lo deja en blanco | Confirma que las piezas dicen lo mismo que el T&C. |
| ¿Quiénes pueden participar? | lo deja en blanco | Dinos quiénes pueden participar. |
| ¿Cuántos días sin comprar? | lo deja en blanco | Escribe cuántos días sin comprar. |
| ¿Cuántos días sin comprar? | el número se sale del rango | Los días van de 1 a 365. |
| ¿Con qué medio de pago aplica el beneficio? | lo deja en blanco | Dinos con qué puede pagar el usuario. |
| Confirma que la información es correcta | lo deja en blanco | Marca la casilla para confirmar que la información es correcta. |
| ¿Qué productos participan? | lo deja en blanco | Dinos qué productos participan. |
| ¿De qué marca? | lo deja en blanco | Escribe el nombre de la marca. |
| ¿Cuáles productos? | lo deja en blanco | Escribe los productos que participan, separados por comas. |
| ¿Cómo se define el ganador? | lo deja en blanco | Dinos cómo se define el ganador. |
| ¿Cuántas personas ganan? | lo deja en blanco | Escribe cuántas personas ganan. |
| ¿Cuántas personas ganan? | el número se sale del rango | El número de ganadores va de 1 a 100. |
| Si dos personas empatan, ¿quién gana? | lo deja en blanco | Dinos quién gana si hay empate. |
| Si dos personas empatan, ¿quién gana? | repite un valor que ya eligió | Ese ya es el criterio con el que se define al ganador, así que nunca desempataría. Elige otro. |
| ¿Qué se gana? | lo deja en blanco | Dinos qué se gana. |
| ¿Cuántos Créditos se lleva cada ganador? | lo deja en blanco | Escribe cuántos Créditos se lleva cada ganador. |
| ¿Cuántos Créditos se lleva cada ganador? | escribe cero | El premio tiene que ser mayor que cero. |
| ¿Qué es exactamente el premio? | lo deja en blanco | Describe el premio. |
| ¿Qué es exactamente el premio? | el texto es muy largo | La descripción no puede pasar de 150 caracteres. Déjala en una línea concreta. |
| ¿Quién entrega el premio? | lo deja en blanco | Dinos quién entrega el premio. |
| ¿Cómo le avisas al ganador? | lo deja en blanco | Dinos cómo le avisas al ganador. |
| ¿Qué día le avisas? | lo deja en blanco | Elige el día en que le avisas al ganador. |
| ¿Qué día le avisas? | las fechas van al revés | Tiene que ser después de que termine la campaña: antes todavía no sabes quién ganó. |
| ¿Cuántos días tiene para responder? | lo deja en blanco | Escribe cuántos días hábiles tiene para responder. |
| ¿Cuántos días tiene para responder? | el número se sale del rango | El plazo va de 1 a 30 días hábiles. |
| ¿Qué tiendas participan? | el número es muy bajo | Agrega al menos 2 tiendas participantes. |
| ¿Qué tiendas participan? | el número es muy alto | No puedes agregar más de 60 tiendas. |
| ¿Qué tiendas participan? | la respuesta está repetida | Esa identificación ya está en otra tienda de la lista. |

---

## Lo que se lee cuando Google falla

La herramienta corre sobre Google Apps Script. Cuando Google falla, el mensaje crudo viene en inglés y habla de Google, no de la campaña. Estos son los textos con los que se reemplaza. Lo que importa de cada uno: si dice si se perdió lo que ya respondió, y si dice qué hacer ahora.

- «Otra persona está generando un documento en este mismo momento. Espera unos segundos y vuelve a darle al botón: no se perdió nada de lo que respondiste.»
- «Google no deja hacer más operaciones por hoy. Mañana vuelve a funcionar solo. Si lo necesitas hoy, avísale a Juan por #tyc-rappi.»
- «Tu cuenta no tiene permiso sobre la carpeta de Drive donde va el documento. Pídele acceso a Juan por #tyc-rappi y vuelve a intentarlo.»
- «Google tardó demasiado en responder y cortó la operación. Vuelve a intentarlo: lo que respondiste sigue ahí.»
- «Se cortó la conexión antes de terminar. Revisa tu internet y vuelve a intentarlo.»
- «Se cerró tu sesión de Google. Recarga la página, entra otra vez con tu cuenta @rappi.com y vuelve a intentarlo.»

---

## Fin de la tanda 7

Responde con las fichas de hallazgo en el formato del prompt, la tabla de cierre
y las tres preguntas para Juan. Si algo está bien, dilo en una línea y sigue: lo
que no tiene ficha se da por aprobado.
