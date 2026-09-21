# Tanda 1 de 7 · La entrada: donde el comercial decide si esto le sirve

> **Antes de pegar esto, pega `PROMPT.md`.** Ahí va quién revisa, qué es
> RappiMind, qué no se puede tocar y en qué formato tiene que venir la
> respuesta. Sin eso, la revisión vuelve en prosa y no se puede aplicar.

Las primeras cinco pantallas deciden si el comercial se queda o le escribe a Legal. Aquí también están los tres caminos que lo sacan del formulario: la pantalla de Legal, los T&C que Legal ya publicó y el filtro de Rappi Travel.

## Lo que hay que mirar en esta tanda

- Si alguien que nunca vio esto entiende, en la primera pantalla, qué va a conseguir y cuánto le va a costar.
- Si las dos preguntas del filtro se entienden sin saber derecho. Un "no" equivocado aquí publica un T&C que no corresponde.
- Si la pantalla de Legal se lee como una salida razonable y no como un portazo.
- Si la lista de tipos de campaña se entiende sin conocer los nombres internos, y si un comercial sabe cuál es el suyo.
- Si el aviso de un país en piloto dice qué significa para él, hoy.
- Las nueve preguntas del filtro de Travel: son las más difíciles de todo el producto.

Van 11 pantallas, con su texto tal como se lee en la aplicación.


**Para adjuntar en el mismo mensaje** (Claude chat lee imágenes, y es lo único
que le deja juzgar el aire, la jerarquía y el tamaño de los botones). Están en
`docs/revision/capturas/`:

- `01-inicio.png` · pantalla 1, Inicio
- `02-filtro.png` · pantalla 2, Filtro de entrada
- `03-pais.png` · pantalla 3, Formulario, el país
- `05-tipos.png` · pantalla 5, Formulario, el tipo de campaña de Rappi
- `28-legal.png` · pantalla 28, Legal
- `31-tyc-generales.png` · pantalla 31, Los T&C que Legal ya publicó, la lista
- `29-filtro-travel.png` · pantalla 29, Filtro de Rappi Travel

Si no las adjuntas, la revisión igual funciona: el texto va completo aquí.

---

## Pantalla 1 · Inicio

*`inicio` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Es la primera pantalla. El comercial lee la promesa de la herramienta en tres pasos y decide si arranca una campaña nueva o retoma el borrador que dejó a medias. El botón de seguir el borrador solo aparece si hay algo guardado.

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

## Pantalla 2 · Filtro de entrada

*`filtro` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Responde dos preguntas generales. Si contesta que sí a cualquiera, la herramienta lo manda a la pantalla de Legal y no sigue. Si contesta que no a las dos, entra al formulario.

**Lo que dice la pantalla, palabra por palabra:**

```
¿Esta campaña la puedo hacer aquí?

Dos preguntas rápidas. Si alguna es sí, tu campaña necesita que Legal la redacte a mano.

¿Hay azar: sorteo, rifa, raspa y gana o ruleta?
No
Sí
¿La tienda o la marca exige sus propios T&C?
No
Sí
```

---

## Pantalla 3 · Formulario, el país

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Primera pregunta del formulario. Elige el país de la campaña. Colombia viene marcada, pero la pregunta se muestra igual y él la tiene que confirmar. Los países en piloto lo dicen en la opción.

**Para leer la pantalla.** Aquí la vista previa va completa: es el documento todavía vacío, con los huecos grises que dicen qué falta.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Tu campaña
¿En qué país corre la campaña?

Si tu país no aparece en la lista, todavía no está habilitado.

Colombia
Disponible.
México
Disponible.
Perú
Disponible.
Argentina
Disponible.
Chile
Disponible.
Ecuador
Disponible.
Uruguay
Disponible.
Costa Rica
Disponible.
Brasil
Disponible.
¿Por qué te preguntamos esto?

Cada país tiene su propia entidad legal de Rappi, su moneda y su autoridad de protección al consumidor. El documento cambia completo según el país.

Quedan 2 preguntas en este paso.

Siguiente
Tu T&C
Sin empezar

Tu documento aparece aquí y se va llenando mientras respondes.

Tu documento aparece aquí y se va llenando mientras respondes.

```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Si lo deja en blanco: «Elige el país de la campaña.»

---

## Pantalla 4 · Formulario, el negocio

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Dice si la campaña es de Rappi o de Rappi Travel. Es la bifurcación grande del recorrido: elegir Travel lo lleva a otro filtro y a otros tipos de campaña.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Tu campaña
¿En qué país corre la campaña?
Cambiar

Colombia

¿La campaña es de Rappi o de Rappi Travel?

Si es de vuelos, hoteles, autos o paquetes, es Rappi Travel.

Rappi
Restaurantes, supermercados, farmacias y todo lo que llega a domicilio.
Rappi Travel
Vuelos, hoteles, autos, paquetes, tours y asistencia al viajero.
¿Por qué te preguntamos esto?

Son dos empresas distintas. Los domicilios los opera Rappi S.A.S. y los viajes Travel Moustache S.A.S., que es una agencia de viajes con registro de turismo. El documento entero cambia según cuál sea.

Queda 1 pregunta en este paso.

Atrás
Siguiente
Tu T&C
Sin empezar

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Viene marcada de entrada con: **rappi**
- Si lo deja en blanco: «Dinos si la campaña es de Rappi o de Rappi Travel.»

---

## Pantalla 5 · Formulario, el tipo de campaña de Rappi

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Elige el tipo de campaña entre tarjetas con nombre y descripción. Los tipos de Travel no aparecen en esta lista.

**Para leer la pantalla.** Debajo de los tipos, separado por una línea, está el atajo a los T&C que Legal ya publicó.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Tu campaña
¿En qué país corre la campaña?
Cambiar

Colombia

¿La campaña es de Rappi o de Rappi Travel?
Cambiar

Rappi

¿Qué tipo de campaña vas a hacer?

Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.

Cashback
La tienda devuelve un porcentaje de lo que el usuario pagó, en Créditos para su Billetera. El usuario compra hoy y vuelve a gastar ese saldo después.
Carrera de Compras
Un concurso con premio: durante unas fechas gana quien más compre en la tienda. No hay azar, gana por lo que compró.
15 minutos o Cashback
Rappi promete un tiempo de entrega en el botón Turbo de una ciudad. Si la orden llega tarde, el usuario recibe en Créditos un porcentaje de lo que pagó. No hay tienda aliada que fondee: el presupuesto lo pone Rappi.
Cashback Multitienda
Varias tiendas hacen cashback dentro de una misma jornada comercial. Cada tienda pone su porcentaje, su tope y su presupuesto, y cada una organiza lo suyo.

¿Es un descuento, un cupón o envío gratis?

Descuentos, cupones, envío gratis y tarifa de servicio
Buena noticia: para estas campañas Legal ya publicó los T&C. No generas ningún documento, te damos el enlace listo para la pieza.
¿Por qué te preguntamos esto?

Cada tipo usa un modelo legal distinto, aprobado por Legal. Elegir mal significa generar el documento equivocado.

Atrás
Siguiente
Tu T&C
Sin empezar

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Si lo deja en blanco: «Elige el tipo de campaña.»

---

## Pantalla 33 · Formulario en un país en piloto

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Elige México, que está en piloto. El aviso de no publicar todavía lo acompaña en el formulario, en el resumen y en la pantalla final.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Tu campaña
¿En qué país corre la campaña?
Cambiar

Ecuador

¿La campaña es de Rappi o de Rappi Travel?
Cambiar

Rappi

¿Qué tipo de campaña vas a hacer?

Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.

Cashback
La tienda devuelve un porcentaje de lo que el usuario pagó, en Créditos para su Billetera. El usuario compra hoy y vuelve a gastar ese saldo después.
¿Por qué te preguntamos esto?
Atrás
Siguiente
Tu T&C
Sin empezar

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Si lo deja en blanco: «Elige el país de la campaña.»

---

## Pantalla 28 · Legal

*`legal` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Es a donde llega cuando su caso lo tiene que redactar un abogado. Lee el motivo concreto y va al formulario de Legal.

**Lo que dice la pantalla, palabra por palabra:**

```
Esta campaña la redacta Legal

Las dinámicas con azar necesitan permiso previo de la autoridad. Legal tiene que revisarlas antes de lanzarlas.

No es un problema ni una negativa: es un caso que necesita que un abogado lo mire. Llena el formulario y el equipo legal te responde.

Ir al formulario de Legal
Cambiar mi respuesta
Volver al inicio
```

---

## Pantalla 31 · Los T&C que Legal ya publicó, la lista

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Entra por el atajo de debajo de los tipos. Si su campaña es un descuento o un cupón corriente, no tiene que generar nada: ya hay un T&C publicado y solo necesita el enlace.

**Lo que dice la pantalla, palabra por palabra:**

```
Para esta campaña no necesitas crear T&C

Legal ya dispuso los términos y condiciones de estas campañas y ya están publicados. No tienes que generar ningún documento ni esperar a que alguien lo revise: elige el que corresponde a tu campaña y te damos el enlace que va en la pieza.

Descuento en Toda la Tienda
Porcentaje de descuento sobre el valor total del pedido (el porcentaje específico dependerá de lo que indique el banner o pieza publicitaria en la app).
Esta es la legal "comodín". Úsala cuando la marca quiera dar un descuento general en toda su tienda (Ej: "Hoy 20% OFF en toda la carta"). Sirve para cualquier porcentaje porque el número exacto se pone en el banner, no en el texto.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Descuento en Productos Seleccionados
Descuento porcentual directo (Precio tachado)
Respaldo legal para ofertas de "precio tachado" en la App. Úsalo cuando negocies descuentos directos en productos específicos para que el usuario vea la rebaja automáticamente en la tienda (sin cupones).
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Descuento en Valor
Descuento de monto fijo (Dinero OFF)
Respaldo legal para descuentos de valor monetario específico. A diferencia del porcentual, este aplica cuando se rebaja una cantidad exacta de dinero al producto (ej. "$5.000 OFF"). Úsalo cuando la negociación sea por monto fijo directo en el precio del producto.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Descuento para Usuarios Nuevos en Turbo
Porcentaje de descuento sobre el valor de los productos (el porcentaje específico y el tope máximo dependerán de lo que indique el banner o pieza publicitaria en la app).
Esta es la legal "comodín" de ADQUISICIÓN para Turbo. Úsala cuando la campaña sea exclusiva para usuarios que NUNCA han comprado en Turbo (Ej: "50% OFF en Fruver en tu 1ra compra"). Sirve para cualquier categoría del Botón Turbo (Fruver, Licores, Snacks) pero NO aplica para Turbo Restaurantes.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Envío Gratis
Costo de envío $0
Respaldo legal para eliminar el costo de envío (cobro de domicilio) al usuario. (ej. "Envío Gratis por compras superiores a $X"). El descuento aparece automáticamente al pagar.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Tarifa de Servicio Gratis
Tarifa de servicio en $0
Respaldo legal para no cobrar la tarifa de servicio. Ojo: No incluye el envío, solo la tarifa de servicio. Úsalo cuando se quiera eliminar esta barrera de costo adicional para el usuario.
Del 1 de febrero de 2026 al 31 de octubre de 2026.
Descuento en Productos Seleccionados Rappi Pro
Precio tachado exclusivo para suscriptores (Descuento Pro)
Respaldo legal para descuentos exclusivos de la membresía. Úsalo cuando se quiera dar un beneficio diferencial solo a usuarios Rappi Pro (segmentado). El usuario normal verá el precio full, el usuario Pro verá el precio tachado.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Descuento en Toda la Tienda Rappi Pro
% OFF en todo el menú para suscriptores (Exclusivo Pro)
Respaldo legal para descuentos generales en el menú exclusivos para miembros Rappi Pro. Úsalo para negociaciones donde se quiera premiar la fidelidad del usuario Pro. El descuento aplica a todo el catálogo de la tienda participante, pero solo es visible y aplicable para usuarios con la membresía activa.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Descuento en Valor Rappi Pro
Descuento de monto fijo exclusivo para suscriptores ($ OFF)
Respaldo legal para descuentos de dinero fijo exclusivos para miembros Rappi Pro. Similar al "Descuento en Valor" normal, pero el beneficio de restar un monto exacto (ej. "$10.000 OFF") solo aplica y es visible para usuarios Rappi Pro.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Descuento en la Membresía Rappi Pro
Descuento en el valor de la suscripción
Respaldo legal para vender la membresía Rappi Pro más barata. Úsalo exclusivamente cuando la oferta sea sobre el precio de la suscripción. No sirve para descuentos en comida o productos.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Cupones de Descuento para Membresía Rappi Pro y Black
Descuento en la suscripción vía Código (Cupón)
Respaldo legal para códigos promocionales que rebajan el precio de la membresía. Úsalo para estrategias donde entregas un código alfanumérico que el usuario debe redimir manualmente para pagar menos por su plan Rappi Pro.
El enlace apunta a la versión de 2024 aunque la vigencia dice 2026. Confírmalo con Legal antes de publicar la pieza.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Cupón de descuento de valor fijo
Descuento de un monto fijo de dinero sobre el pedido al redimir un cupón o código (el valor dependerá de lo que indique la pieza publicitaria).
Respaldo legal para cupones o códigos que descuentan un valor fijo del pedido (ej. "$10.000 OFF con el código X"). Úsalo cuando el usuario debe ingresar o activar el cupón para ver la rebaja; el valor, la compra mínima y la vigencia van en la pieza.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Cupón de descuento en toda la tienda
Porcentaje de descuento sobre el valor total del pedido al redimir un cupón o código (el porcentaje y el tope dependerán de lo que indique la pieza publicitaria).
Respaldo legal para cupones o códigos que dan un porcentaje de descuento sobre el valor total del pedido (ej. "20% OFF en toda la tienda con el código X"). Úsalo cuando el descuento no es automático y el usuario debe ingresar o activar el cupón; el porcentaje, el tope y la compra mínima van en la pieza.
Del 1 de enero de 2026 al 31 de diciembre de 2026.
Código de descuento para eventos externos
Un externo da el descuento en su propio canal de venta. Por ejemplo: un código del 20% para las boletas de un evento.
Del 1 de enero de 2026 al 31 de diciembre de 2026.

Si tu campaña es un cashback, una carrera de compras o un concurso, no es ninguno de estos: vuelve a los tipos y la herramienta te arma el documento.

Volver a los tipos de campaña
```

---

## Pantalla 32 · Los T&C que Legal ya publicó, uno con pendiente

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Abre uno de la lista y recibe el enlace para la pieza. Cuando Legal dejó algo por confirmar, lo lee antes del enlace, no después.

**Lo que dice la pantalla, palabra por palabra:**

```
Descuento en Productos Seleccionados
Listo, no tienes que generar nada

Legal ya publicó estos T&C. Copia el enlace de abajo y ponlo en la pieza: ese es el enlace que va, tal cual.

Enlace para la pieza
Copiar
https://promos.rappi.com/colombia/2026/descuentoprodselecc

Pégalo tal cual, sin acortarlo y sin cambiarle nada.

Abrir los T&C
Para qué sirve

Respaldo legal para ofertas de "precio tachado" en la App. Úsalo cuando negocies descuentos directos en productos específicos para que el usuario vea la rebaja automáticamente en la tienda (sin cupones).

Qué beneficio cubre

Descuento porcentual directo (Precio tachado)

Vigencia

Del 1 de enero de 2026 al 31 de diciembre de 2026.

Ver los otros T&C publicados
Volver a los tipos de campaña
```

---

## Pantalla 29 · Filtro de Rappi Travel

*`filtroTravel` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Solo lo ve quien eligió Rappi Travel. Responde nueve preguntas antes de poder elegir el tipo. Tiene una salida propia para quien entró por equivocación.

**Lo que dice la pantalla, palabra por palabra:**

```
Antes de seguir con tu campaña de Rappi Travel

Nueve preguntas rápidas. Si alguna es sí, tu campaña necesita que Legal la redacte a mano. No es un castigo: es un caso que un abogado tiene que mirar.

¿La paga Rappi o Rappi Travel, no un aliado?
No
Sí
¿El aliado exige sus propios términos y condiciones?
No
Sí
¿Hay sorteo o concurso, o la pieza dice "gana"?
No
Sí
¿La pieza anuncia un precio "desde" o una tarifa?
No
Sí
¿El beneficio es distinto a Créditos o a un descuento en el precio? Por ejemplo: noches o niños gratis, cupones, millas, eSIM, bonos o cuotas sin interés.
No
Sí
¿El porcentaje, el tope o la compra mínima cambian según el destino, el producto o el tipo de usuario, o se mezcla descuento con cashback?
No
Sí
¿El beneficio depende de un banco o de cuotas?
No
Sí
¿El producto es un seguro, no una asistencia al viajero?
No
Sí
¿Es solo para empleados o no tiene fecha de fin?
No
Sí
Esta campaña no es de Travel
```

---

## Pantalla 30 · Formulario, el tipo de campaña de Rappi Travel

*`pasos` · escritorio 1440 × 1000 · interfaz en español*

**Qué hace el comercial aquí.** Después de pasar el filtro vuelve al formulario, con la pregunta del tipo abierta y solo los tipos de Travel.

**Lo que dice la pantalla, palabra por palabra:**

```
Campaña
Tu campaña
¿En qué país corre la campaña?
Cambiar

Colombia

¿La campaña es de Rappi o de Rappi Travel?
Cambiar

Rappi Travel

¿Qué tipo de campaña vas a hacer?

Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.

Cashback Travel
La marca aliada devuelve un porcentaje de lo que el usuario pagó por su vuelo, hotel, auto o paquete, en Créditos para su Billetera.
Descuento Travel
La marca aliada baja el precio de sus vuelos, hoteles, autos o paquetes. El usuario ve el precio ya rebajado antes de pagar, no recibe Créditos.
¿Por qué te preguntamos esto?

Cada tipo usa un modelo legal distinto, aprobado por Legal. Elegir mal significa generar el documento equivocado.

Atrás
Siguiente
Tu T&C
Sin empezar

[columna derecha: aquí se ve el documento llenándose mientras responde]
```

**Lo que aquí no se ve** (sale al equivocarse, o si hubiera elegido otra cosa):

- Si lo deja en blanco: «Elige el tipo de campaña.»

---

## Los filtros de entrada, en una lista

Estas preguntas van antes del formulario. Un **sí** en cualquiera saca al comercial del producto y lo manda a la pantalla de Legal. Son, por lejos, las preguntas más caras de todo el recorrido: un "no" por no haber entendido publica un T&C que no corresponde, y un "sí" de más le devuelve a Legal un trabajo que la herramienta sabía hacer.

**Cashback**

- ¿La tienda o la marca exige sus propios T&C?

**Cashback Travel**


---

## Fin de la tanda 1

Responde con las fichas de hallazgo en el formato del prompt, la tabla de cierre
y las tres preguntas para Juan. Si algo está bien, dilo en una línea y sigue: lo
que no tiene ficha se da por aprobado.
