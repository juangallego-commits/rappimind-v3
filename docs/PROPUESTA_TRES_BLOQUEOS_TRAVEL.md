# Los tres bloqueos de Rappi Travel: análisis y texto propuesto

Juan me pidió el 21 de septiembre de 2026 que actuara como abogado y resolviera
los tres bloqueos que quedan del filtro de Rappi Travel. Esto es el análisis y
el texto que propongo, para que lo leas antes de que entre al repositorio.

**Se aplica cuando cierre la sesión del modelo de millas**, que está tocando
`esquemas.js`, `preguntas.js` y el mismo filtro. Hacerlo en paralelo es pedir un
conflicto.

---

## 1. El precio "desde"

### Qué bloquea hoy

> ¿La pieza anuncia un precio "desde" o una tarifa?
> *Los anuncios de tarifas tienen reglas especiales de información y ya
> generaron una sanción a Rappi Travel.*

### Mi lectura

La pregunta está bien fundada y por eso no la mataría del todo, pero hoy bloquea
de más. Lo que la ley castiga no es anunciar un precio: es anunciarlo mal.

En Colombia mandan tres cosas. El Estatuto del Consumidor (Ley 1480 de 2011)
exige que la información sea **veraz y suficiente** (art. 23) y que la
publicidad corresponda a las condiciones reales de la oferta (art. 29 a 31).
Para las promociones, el artículo 33 obliga a informar su duración y sus
condiciones. Y en tarifas aéreas, el Reglamento Aeronáutico Colombiano exige que
el precio anunciado sea el **precio final**, con impuestos, tasas y cargos
incluidos. La sanción que menciona la razón actual viene de ahí.

Entonces la pregunta útil no es "¿anuncias un precio?" sino **"¿ese precio es el
total?"**. Si lo es, la campaña se puede documentar sin problema y basta con
decirlo en el T&C. Si no lo es, no hay documento que lo arregle: la pieza está
mal y eso sí es de Legal.

### Lo que propongo

Dos preguntas en el formulario, en el paso de la pieza, en vez de un bloqueo:

1. **¿La pieza anuncia un precio, una tarifa o un "desde"?**
   Ayuda: *Por ejemplo: "vuelos desde $199.000" o "hoteles desde US$50 la
   noche".*
   Por qué: *Un precio anunciado obliga a decir en el T&C qué incluye y en qué
   condiciones se consigue. Si no se dice, el usuario puede exigir ese precio
   sin las condiciones.*

2. Solo si responde que sí: **¿Ese precio ya incluye impuestos, tasas y cargos?**
   Ayuda: *Es el valor final que el usuario paga, sin sumas después.*
   Por qué: *La ley exige que el precio anunciado sea el total. Un "desde" que
   después crece con impuestos es el caso que ya le costó una sanción a Rappi
   Travel.*

   - **Sí** → sigue, y el documento lleva la cláusula de abajo.
   - **No** → va a Legal, con esta razón: *El precio anunciado tiene que ser el
     valor final, con impuestos, tasas y cargos incluidos. Como el de tu pieza
     no lo es, hay que corregir la pieza antes de publicar y eso lo ve Legal.*

Eso convierte un bloqueo ciego en uno informado: hoy se va a Legal el que
anuncia bien y el que anuncia mal por igual.

### La cláusula

Va después de la de productos participantes, cuando la respuesta es que sí:

> **§ Precio anunciado.** Los precios que se anuncian en las piezas
> publicitarias de la Campaña, incluidos los que se presentan precedidos de la
> expresión "desde", corresponden al valor final por Producto Participante e
> incluyen los impuestos, tasas y cargos aplicables. Estos precios corresponden
> a la tarifa más baja disponible al momento de la publicación de la pieza, están
> sujetos a disponibilidad y pueden variar según la fecha de viaje, el destino,
> la clase o categoría seleccionada y la fecha en que se realice la reserva. El
> precio aplicable a cada orden será el que se muestre en los Sistemas Rappi
> Travel al momento de completar la compra.

**Por qué queda así.** Las tres piezas de hoteles que ya se publicaron dicen lo
mismo en desorden: *"Las tarifas y promociones están sujetas a disponibilidad
del hotel y fechas seleccionadas"* y *"no será responsable por variaciones de
precio"*. Esto lo junta en una cláusula y agrega lo que falta, que es decir que
el precio incluye impuestos y que el que manda es el de la pantalla al comprar.

---

## 2. El beneficio que cambia según el destino o el producto

### Qué bloquea hoy

> ¿El porcentaje, el tope o la compra mínima cambian según el destino, el
> producto o el tipo de usuario, o se mezcla descuento con cashback?
> *Este documento usa un solo beneficio para toda la campaña. Con varios, las
> cláusulas se contradicen.*

### Mi lectura

La razón es honesta: el modelo está escrito con un beneficio y solo uno. Pero es
un límite de la herramienta, no del derecho, y es el que más caro sale. De las
cinco piezas publicadas que Juan pasó, **dos son exactamente este caso**: la del
Caribe Mexicano trae veintitrés hoteles, cada uno con su porcentaje, su
beneficio de niños y sus propias fechas de venta y de viaje.

Nada de eso es ilegal. Lo único que exige la ley es que cada condición quede
escrita y sea verificable. Una lista lo cumple igual o mejor que un párrafo.

### Lo que propongo

Tratarlo como ya se trata Cashback Multitienda, que resolvió el mismo problema
con las tiendas: una **lista de filas**, cada una con su beneficio, que el
comercial pega desde su hoja de cálculo.

**La pregunta:** *¿El beneficio es el mismo para todo, o cambia según el
producto?*

- **Es el mismo para todo** → como hoy, un porcentaje y un tope.
- **Cambia según el producto** → se abre la lista, con una fila por producto,
  hotel, destino o aerolínea.

**Cada fila lleva:** el nombre tal como sale en la app, el beneficio (porcentaje
o texto corto como "2 niños gratis"), y, si aplica, hasta cuándo se puede
comprar y hasta cuándo se puede viajar.

En el documento va en viñetas, **nunca en tabla** (regla 5 de `CLAUDE.md`: el
sitio donde se publica no las muestra).

### La cláusula

Reemplaza la frase del beneficio único cuando la lista tiene filas:

> **§ Productos Participantes y Beneficio.** El Beneficio varía según el Producto
> Participante seleccionado y está sujeto a disponibilidad. Participan
> únicamente los siguientes:
>
> • **Hard Rock Hotel Los Cabos:** 55% de descuento y 2 niños gratis. Compras
>   hasta el 18 de diciembre de 2026; viajes hasta el 18 de diciembre de 2026.
> • **AVA Resort Cancún:** 50% de descuento y 2 niños gratis. Compras hasta el
>   19 de diciembre de 2026; viajes hasta el 19 de diciembre de 2026.
>
> El Beneficio aplicable a cada orden será el que corresponda al Producto
> Participante seleccionado, conforme a la lista anterior. Los beneficios
> dirigidos a menores de edad se aplican según las políticas de ocupación,
> edades y disponibilidad de cada Proveedor; en caso de discrepancia entre la
> lista anterior y la política del Proveedor, prevalecerá esta última.

**Dos cosas que decidí y quiero que mires.** La primera, la última frase: las dos
piezas publicadas dicen que manda la política del hotel, y la dejé porque es lo
que se viene firmando, pero le da al Proveedor la última palabra sobre lo que
Rappi anunció. La segunda, que cada fila repita sus fechas: en la pieza del
Caribe cada hotel tenía las suyas, distintas de la vigencia de la campaña, y sin
eso el documento promete más de lo que el hotel da.

---

## 3. El beneficio que depende de un banco o de cuotas

### Qué bloquea hoy

> ¿El beneficio depende de un banco o de cuotas?
> *Esas campañas tienen otra entidad responsable y otro documento.*

### Mi lectura

Aquí no estoy de acuerdo con quitarlo entero, y es la única de las tres donde me
aparto de lo que pediste. La pregunta mete dos cosas muy distintas en una:

**Una tarjeta o un banco específico como medio de pago.** Eso es lo mismo que en
las campañas de Rappi, donde ya se hace sin problema: la campaña aplica pagando
con cierta tarjeta y punto. El banco no responde por nada, solo es el medio. Esto
sí lo resuelve el formulario.

**Cuotas sin interés.** Esto es otra cosa. Quien otorga la financiación es el
banco, y las condiciones de la cuota (la tasa, el plazo, la aprobación del cupo)
son suyas y no de Rappi. Un T&C que prometa "cuotas sin interés" sin remitir a
las condiciones del emisor le está prometiendo al usuario algo que Rappi no
controla ni puede cumplir. Y en Colombia la publicidad de productos de crédito
tiene reglas propias, vigiladas por la Superintendencia Financiera, no por la
SIC. No es el mismo régimen que el resto de este documento.

### Lo que propongo

**Partir la pregunta en dos.**

Lo de la tarjeta se resuelve ampliando el medio de pago, que ya existe en los dos
tipos de Travel y que el documento ya imprime. Hoy tiene tres opciones: cualquier
medio, todo menos efectivo, y solo RappiCard. Le agregaría una cuarta:

**Solo con una tarjeta o un banco específico** → y un campo para el nombre, que
es un nombre propio y por eso sí cabe en el formulario (regla 6 de `CLAUDE.md`).

> **§ Medio de pago.** Campaña válida únicamente para órdenes pagadas en su
> totalidad con {{MEDIO_DE_PAGO}}. No se obtendrá el Beneficio respecto de
> órdenes pagadas parcial o totalmente con Créditos de la Plataforma ni con
> cualquier otro medio de pago.

Lo de las cuotas **se queda en Legal**, con una razón que diga por qué y no
suene a capricho:

> ¿El beneficio son cuotas sin interés o una financiación del banco?
> *Quien otorga la financiación es el banco, con sus propias condiciones de tasa,
> plazo y aprobación. Ese documento lo redacta Legal con el banco.*

Si prefieres que también lo saquemos, se puede, pero entonces hay que conseguir
antes dos o tres T&C de campañas de cuotas ya publicadas, como hicimos con las
de millas. Sin una pieza firmada de la que partir, la cláusula habría que
inventarla, y eso es justo lo que no hacemos.

---

## Lo que cambia en el filtro

De las ocho preguntas de hoy, quedarían seis:

| Hoy | Después |
|---|---|
| ¿El aliado exige sus propios T&C? | Igual |
| ¿Hay sorteo o concurso? | Igual |
| ¿La pieza anuncia un precio "desde" o una tarifa? | **Sale**, pasa al formulario |
| ¿El beneficio es distinto a Créditos o a un descuento? | Lo resuelve la sesión de millas |
| ¿El porcentaje, el tope o la compra mínima cambian…? | **Sale**, pasa al formulario |
| ¿El beneficio depende de un banco o de cuotas? | Queda, **solo para las cuotas** |
| ¿El producto es un seguro? | Pendiente: faltan las piezas de Universal Assistance |
| ¿Es solo para empleados o no tiene fecha de fin? | Igual |

## Lo que necesito de ti antes de aplicarlo

1. **Las tres cláusulas de arriba**, leídas. Son texto que se publica.
2. **La última frase del beneficio variable**, la que le da al hotel la última
   palabra sobre lo que Rappi anunció. Viene de las piezas publicadas, pero
   quiero que la confirmes a propósito.
3. **Lo de las cuotas.** Si insistes en sacarlo, dime y consigo las piezas
   primero.
