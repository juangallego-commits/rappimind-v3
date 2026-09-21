# Las preguntas que ve el comercial

Generado por `npm run preguntas` desde `src/core/preguntas.js`. **No lo edites a mano:**
cambia la pregunta en el código y vuelve a generarlo, así lo que revisas y lo que ve
el comercial nunca se separan.

El objetivo es que un KAM en su primer día genere un T&C correcto en menos de
cinco minutos sin preguntarle a nadie.

## El estándar que cumple cada pregunta

1. Pregunta directa, en tú, máximo 10 palabras. Nunca el nombre interno del campo.
2. Una línea de ayuda con un ejemplo concreto.
3. Un enlace "Por qué te preguntamos esto" con dos líneas de explicación.
4. Debajo del campo, "Así queda en tu T&C:" con la frase real que produce el motor.
5. Validación en vivo que dice qué pasó y cómo se arregla. Nunca "campo inválido".
6. Valor por defecto cuando el caso mayoritario es claro y no tiene riesgo.
7. Botones grandes con una línea de explicación cuando son pocas opciones;
   casillas cuando se pueden marcar varias.

Los ejemplos y los valores por defecto salen de `docs/HALLAZGOS_SOLICITUDES.md`,
el análisis de 1.184 solicitudes reales.

## Glosario

Estos términos llevan subrayado punteado en la interfaz. Al pasar el cursor o
tocar, aparece la definición.

| Término | Qué es |
|---|---|
| **Organizador** | La empresa que pone la plata del beneficio y responde por la campaña. Es la tienda o la marca, nunca Rappi. |
| **Tienda Participante** | La tienda donde el usuario tiene que comprar para ganarse el beneficio. Se llama así en todo el documento. |
| **Créditos** | El saldo que queda en la Billetera de Rappi. No es dinero en efectivo, no se pasa a otra persona y no se retira. |
| **Tope** | Lo máximo que una persona recibe en un solo pedido, por grande que sea el pedido. |
| **Presupuesto** | La plata total de la campaña. Cuando se acaba, la campaña termina sola aunque no se haya cumplido la fecha. |
| **Vigencia** | Cuánto duran los Créditos una vez cargados. Después de eso se vencen. |
| **Maker** | La marca que fabrica el producto, distinta de la tienda que lo vende. Si el Maker pone la plata, el Maker es el Organizador. |

---

# Cashback

La tienda devuelve un porcentaje de lo que el usuario pagó, en Créditos para su Billetera. El usuario compra hoy y vuelve a gastar ese saldo después.

## Filtro de entrada

Antes del formulario. Si responde **sí** a cualquiera, no se genera: se muestra
la pantalla "Esta campaña la redacta Legal" con la razón y el enlace al
formulario manual.

- ¿La tienda o la marca exige sus propios T&C?

## Paso: Campaña

### ¿En qué país corre la campaña?

> Si tu país no aparece en la lista, todavía no está habilitado.

**Por qué te preguntamos esto.** Cada país tiene su propia entidad legal de Rappi, su moneda y su autoridad de protección al consumidor. El documento cambia completo según el país.

| | |
|---|---|
| Campo interno | `pais` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `PAIS_LEGAL`, `ENTIDAD_LEGAL` |

**Mensajes de validación:**

- `vacio`: Elige el país de la campaña.

### ¿La campaña es de Rappi o de Rappi Travel?

> Si es de vuelos, hoteles, autos o paquetes, es Rappi Travel.

**Por qué te preguntamos esto.** Son dos empresas distintas. Los domicilios los opera Rappi S.A.S. y los viajes Travel Moustache S.A.S., que es una agencia de viajes con registro de turismo. El documento entero cambia según cuál sea.

| | |
|---|---|
| Campo interno | `negocio` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | rappi |
| Avanza sola | sí |

**Opciones** (botones grandes, una sola):

- **Rappi**: Restaurantes, supermercados, farmacias y todo lo que llega a domicilio.
- **Rappi Travel**: Vuelos, hoteles, autos, paquetes, tours y asistencia al viajero.

**Mensajes de validación:**

- `vacio`: Dinos si la campaña es de Rappi o de Rappi Travel.

### ¿Qué tipo de campaña vas a hacer?

> Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.

**Por qué te preguntamos esto.** Cada tipo usa un modelo legal distinto, aprobado por Legal. Elegir mal significa generar el documento equivocado.

| | |
|---|---|
| Campo interno | `tipo` |
| Paso | Campaña |
| Tipo de control | tarjetas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |

**Mensajes de validación:**

- `vacio`: Elige el tipo de campaña.

### ¿En qué tienda aplica?

> La marca comercial como aparece en la app. Por ejemplo: Pollo Dorado.

**Por qué te preguntamos esto.** El documento nombra la tienda y la define como Tienda Participante. Si el nombre no coincide con el de la app, el usuario no la encuentra.

| | |
|---|---|
| Campo interno | `tienda` |
| Paso | Campaña |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Pollo Dorado |
| Avanza sola | no |
| Llena en el documento | `TIENDA` |

**Mensajes de validación:**

- `vacio`: Escribe la tienda donde aplica la campaña.

### ¿En cuál de sus tiendas se gana el cashback?

> Muchas marcas tienen dos tiendas en la app: la normal y la de Turbo.

**Por qué te preguntamos esto.** El documento dice en cuál tienda cuenta el pedido. Si no lo dice, el usuario puede reclamar el cashback en cualquiera de las dos.

| | |
|---|---|
| Campo interno | `tiendaTurbo` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_TIENDA_TURBO` |

**Opciones** (botones grandes, una sola):

- **Solo en la tienda normal**: Un pedido en su tienda de Turbo no da el cashback.
- **Solo en la tienda de Turbo**: Un pedido en su tienda normal no da el cashback.
- **En las dos**: Cuenta en cualquiera de las dos. Si la de Turbo la opera otra empresa, usa el Multitienda.
- **No tiene tienda en Turbo**: Si no sabes, búscala en el botón Turbo de la app.

**Mensajes de validación:**

- `vacio`: Dinos en cuál de sus tiendas se gana el cashback.

### ¿Dónde aplica la campaña?

> Si es solo en algunas ciudades, las escribes en la siguiente pregunta.

**Por qué te preguntamos esto.** La cobertura define dónde puede reclamar el usuario. Si el documento dice más de lo que la campaña cubre, el usuario tiene derecho a exigirlo.

| | |
|---|---|
| Campo interno | `alcance` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | Nacional |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_TERRITORIO` |

**Opciones** (botones grandes, una sola):

- **En todo el país**: Donde sea que Rappi tenga cobertura.
- **Solo en algunas ciudades**: Por ejemplo: Bogotá y Medellín.

**Mensajes de validación:**

- `vacio`: Elige si la campaña es nacional o por ciudades.

### ¿En qué ciudades?

> Sepáralas con comas. Por ejemplo: Bogotá, Medellín, Cali.

**Por qué te preguntamos esto.** Las ciudades salen escritas tal cual en la cláusula de cobertura. Si falta una, el usuario de esa ciudad no puede reclamar.

| | |
|---|---|
| Campo interno | `ciudades` |
| Paso | Campaña |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Bogotá, Medellín, Cali |
| Avanza sola | no |
| Llena en el documento | `TEXTO_TERRITORIO` |

**Sugerencias clicables:** Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Cúcuta

**Mensajes de validación:**

- `vacio`: Escribe al menos una ciudad, o vuelve y elige cobertura nacional.

## Paso: Organizador

### ¿Qué empresa paga el beneficio?

> Tal como sale en su RUT, por ejemplo: Alimentos del Norte S.A.S. Nunca es Rappi.

**Por qué te preguntamos esto.** El Organizador responde por la campaña frente al usuario y frente a la autoridad. Rappi solo pone la plataforma, así que el nombre tiene que ser exacto.

| | |
|---|---|
| Campo interno | `organizadorRazonSocial` |
| Paso | Organizador |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Alimentos del Norte S.A.S. |
| Avanza sola | no |
| Llena en el documento | `ORGANIZADOR` |

**Mensajes de validación:**

- `vacio`: Escribe la razón social de la empresa que paga el beneficio. Si no la tienes, pídesela a tu contacto en la tienda.

### ¿Cuál es el NIT de esa empresa?

> Con dígito de verificación, tal como sale en el RUT: 900.111.222-1.

**Por qué te preguntamos esto.** El documento identifica al Organizador con su número tributario. Un número mal escrito deja el documento sin un responsable identificable.

| | |
|---|---|
| Campo interno | `organizadorId` |
| Paso | Organizador |
| Tipo de control | identificacion |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 900.111.222-1 |
| Avanza sola | no |
| Llena en el documento | `ID_ORGANIZADOR` |

**Mensajes de validación:**

- `vacio`: Escribe el NIT de la empresa organizadora, con el dígito de verificación.
- `formato`: Ese número no cuadra. Revisa el dígito de verificación, que es el que va después del guion.

**Al validar bien** muestra el valor formateado seguido de "válido".

## Paso: Cuándo

### ¿Qué día arranca la campaña?

> Puede ser hoy. Publica los T&C antes de que arranque.

**Por qué te preguntamos esto.** Los Términos y Condiciones tienen que estar publicados antes de que la campaña empiece. Si arrancó ayer, ya no se pueden publicar a tiempo.

| | |
|---|---|
| Campo interno | `fechaInicio` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige el día en que arranca la campaña.
- `pasado`: Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro.

**Aviso:** Faltan menos de 48 horas. Alcanzas, pero publica los T&C hoy mismo.

### ¿A qué hora arranca?

> Por defecto arranca a medianoche.

**Por qué te preguntamos esto.** La hora exacta define desde cuándo un pedido cuenta para la campaña. Un pedido un minuto antes no da beneficio.

| | |
|---|---|
| Campo interno | `horaInicio` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 00:00 |
| Avanza sola | no |
| Llena en el documento | `HORA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige la hora de inicio.

### ¿Qué día termina?

> La mayoría de los cashback duran un solo día. Te la dejamos igual a la de inicio.

**Por qué te preguntamos esto.** Después de esta fecha la campaña no da beneficio. También se usa para calcular hasta cuándo sirven los Créditos.

| | |
|---|---|
| Campo interno | `fechaFin` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige el día en que termina la campaña.
- `orden`: La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.

### ¿A qué hora termina?

> Por defecto termina a las 11:59 de la noche.

**Por qué te preguntamos esto.** Define hasta qué minuto cuenta un pedido. Los pedidos posteriores se procesan como pedidos normales.

| | |
|---|---|
| Campo interno | `horaFin` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 23:59 |
| Avanza sola | no |
| Llena en el documento | `HORA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige la hora de fin.
- `orden`: La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día.

## Paso: Beneficio

### ¿Qué porcentaje del pedido se devuelve en Créditos?

> Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.

**Por qué te preguntamos esto.** Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.

| | |
|---|---|
| Campo interno | `porcentaje` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 20 |
| Avanza sola | no |
| Llena en el documento | `PORCENTAJE` |

**Mensajes de validación:**

- `vacio`: Escribe el porcentaje que devuelves, sin el signo de porcentaje.
- `rango`: El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.

### ¿Cuál es el máximo de Créditos por pedido?

> Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.

**Por qué te preguntamos esto.** Sin tope, un pedido enorme se lleva el presupuesto entero. Con tope, un cashback alto sigue siendo viable.

| | |
|---|---|
| Campo interno | `tope` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 25000 |
| Avanza sola | no |
| Llena en el documento | `TOPE` |

**Mensajes de validación:**

- `vacio`: Escribe el máximo de Créditos que recibe una persona por pedido.
- `cero`: El tope tiene que ser mayor que cero.
- `mayorQuePresupuesto`: El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.

### ¿Cuánto es el presupuesto total de la campaña?

> Cuando se acabe, la campaña termina sola. Lo habitual va de 5 a 40 millones.

**Por qué te preguntamos esto.** El documento dice que la campaña termina al agotarse el presupuesto. Es lo que te protege si el consumo se dispara.

| | |
|---|---|
| Campo interno | `presupuesto` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 20000000 |
| Avanza sola | no |
| Llena en el documento | `PRESUPUESTO` |

**Mensajes de validación:**

- `vacio`: Escribe el presupuesto total de la campaña.
- `cero`: El presupuesto tiene que ser mayor que cero.

### ¿Cuántas veces puede recibir el beneficio una persona?

> Se cuenta por persona, durante toda la campaña.

**Por qué te preguntamos esto.** Sin límite, unos pocos usuarios pueden consumir el presupuesto en horas. Con límite, el beneficio llega a más gente.

| | |
|---|---|
| Campo interno | `maxPedidos` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 1 |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_LIMITE_PEDIDOS` |

**Opciones** (botones grandes, una sola):

- **Una sola vez**: Lo más común. El segundo pedido ya no da beneficio.
- **Varias veces**: Tú dices cuántas.
- **Sin límite**: Solo lo frena el presupuesto.

**Mensajes de validación:**

- `vacio`: Dinos cuántas veces puede ganar la misma persona.
- `cuantas`: Escribe cuántos pedidos con beneficio puede hacer una persona.
- `rango`: Tiene que ser al menos un pedido.

### sinLimite

No tiene pregunta propia: se responde dentro de **maxPedidos**.

## Paso: Créditos

### ¿Cuándo le llegan los Créditos al usuario?

> Es el momento en que el saldo le queda disponible en la Billetera.

**Por qué te preguntamos esto.** El documento fija en qué momento el usuario recibe los Créditos, y eso es lo que el usuario va a esperar. Elige lo que el equipo de operaciones puede cumplir.

| | |
|---|---|
| Campo interno | `carga` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | dia_siguiente |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_CARGA`, `TEXTO_VERIFICACION` |

**Opciones** (botones grandes, una sola):

- **Al día siguiente del pedido**: Lo más usado.
- **Apenas termina el pedido**: Inmediato, sin verificación previa.
- **En una fecha específica**: Todos reciben el mismo día.

**Mensajes de validación:**

- `vacio`: Dinos cuándo le llegan los Créditos al usuario.

### ¿Qué día les cargas los Créditos?

> Tiene que ser durante la campaña o después, nunca antes.

**Por qué te preguntamos esto.** Es la fecha que el usuario va a esperar. Si no se cumple, entra un reclamo.

| | |
|---|---|
| Campo interno | `fechaCarga` |
| Paso | Créditos |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CARGA` |

**Mensajes de validación:**

- `vacio`: Elige el día de la carga.
- `antes`: La carga no puede ser antes de que arranque la campaña.

### ¿Hasta cuándo puede usar esos Créditos?

> Por ejemplo: hasta el 31 de diciembre, o 30 días desde que le llegan.

**Por qué te preguntamos esto.** Los Créditos se vencen y eso tiene que estar escrito. Si no lo dices, el usuario puede sostener que no vencen.

| | |
|---|---|
| Campo interno | `vigencia` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_VIGENCIA_CREDITOS` |

**Opciones** (botones grandes, una sola):

- **Hasta una fecha**: Todos vencen el mismo día.
- **Durante unos días**: Cuenta desde que le llegan a cada uno.

**Mensajes de validación:**

- `vacio`: Dinos hasta cuándo sirven los Créditos.

### ¿Cuántos días le duran?

> Los valores que más se usan son 5, 7 y 30 días.

**Por qué te preguntamos esto.** Se cuentan desde el día en que le llegan. Muy pocos días y el usuario no alcanza a usarlos, y eso genera reclamos.

| | |
|---|---|
| Campo interno | `diasVigencia` |
| Paso | Créditos |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 30 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_VIGENCIA_CREDITOS` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos días duran los Créditos.
- `rango`: Los días van de 1 a 365.

### ¿Qué día se vencen los Créditos?

> Tiene que ser después de que termine la campaña.

**Por qué te preguntamos esto.** Si vencen el mismo día que termina la campaña, quien compra el último día no alcanza a usarlos.

| | |
|---|---|
| Campo interno | `fechaFinRedencion` |
| Paso | Créditos |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_VIGENCIA_CREDITOS` |

**Mensajes de validación:**

- `vacio`: Elige el día en que se vencen los Créditos.
- `orden`: Los Créditos tienen que vencerse después de que termine la campaña. Si no, quien compre el último día no alcanza a usarlos.

### ¿Dónde puede gastar los Créditos?

> Por ejemplo: solo en la tienda donde se los ganó, que es lo más común.

**Por qué te preguntamos esto.** Define dónde vale el saldo. Lo normal es que se gaste en la misma tienda donde el usuario se ganó el beneficio. En todo caso, estos Créditos casi nunca aplican a RappiFavor, Cajero ATM ni Rappi Travel.

| | |
|---|---|
| Campo interno | `redencion` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_LUGAR_REDENCION` |

**Opciones** (botones grandes, una sola):

- **Solo en esta tienda**: Vuelve a comprar donde ganó el beneficio.
- **En ciertas secciones de Rappi**: Tú eliges cuáles.
- **En cualquier parte de Rappi**: Donde sea que se acepten Créditos.

**Mensajes de validación:**

- `vacio`: Dinos dónde puede gastar los Créditos.

### ¿En qué secciones?

> Puedes marcar varias.

**Por qué te preguntamos esto.** Los nombres salen escritos entre comillas en el documento, así que tienen que coincidir con los de la app.

| | |
|---|---|
| Campo interno | `secciones` |
| Paso | Créditos |
| Tipo de control | casillas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_LUGAR_REDENCION` |

**Mensajes de validación:**

- `vacio`: Marca al menos una sección.

### ¿En qué secciones NO se pueden redimir los Créditos?

> Vienen marcadas las de siempre. Desmarca una solo si esa campaña sí la permite.

**Por qué te preguntamos esto.** El documento tiene que decir dónde no vale el saldo. Una sección que no esté excluida aquí queda prometida, y después no se puede cerrar: el usuario reclama con el T&C en la mano.

| | |
|---|---|
| Campo interno | `exclusionesRedencion` |
| Paso | Créditos |
| Tipo de control | casillas |
| Obligatorio | no |
| Valor por defecto | travel,soat,atm,favor |
| Avanza sola | no |
| Llena en el documento | `TEXTO_LUGAR_REDENCION` |

**Mensajes de validación:**

- `vacio`: Marca las secciones excluidas, o sigue sin marcar ninguna.

## Paso: Participantes

### ¿Quiénes pueden participar?

> Por ejemplo: solo Pro, o quienes no compran hace 60 días.

**Por qué te preguntamos esto.** Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.

| | |
|---|---|
| Campo interno | `segmento` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_SEGMENTO` |

**Opciones** (botones grandes, una sola):

- **Todos los usuarios**: Cualquier persona mayor de edad.
- **Solo Pro y Pro Black**: Con la suscripción activa.
- **Solo usuarios nuevos**: Su primer pedido en Rappi.
- **Usuarios que no compran hace rato**: Tú dices desde cuándo.

**Mensajes de validación:**

- `vacio`: Dinos quiénes pueden participar.

### ¿Cuántos días sin comprar?

> Se cuentan hacia atrás desde que arranca la campaña. Por ejemplo: 60.

**Por qué te preguntamos esto.** Define exactamente a quién le llega. El documento lo dice en letras y en número, para que no haya discusión.

| | |
|---|---|
| Campo interno | `diasSinCompra` |
| Paso | Participantes |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 60 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_SEGMENTO` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos días sin comprar.
- `rango`: Los días van de 1 a 365.

### ¿Con qué medio de pago aplica el beneficio?

> Con "cualquier medio" entran tarjetas, billeteras y efectivo donde exista.

**Por qué te preguntamos esto.** Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.

| | |
|---|---|
| Campo interno | `metodoPago` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_METODO_PAGO` |

**Opciones** (botones grandes, una sola):

- **Con cualquier medio de pago**: Lo más común.
- **Con todo menos efectivo**: Tarjetas y billeteras sí, efectivo no.
- **Solo con RappiCard**: Únicamente la tarjeta de Rappi.

**Mensajes de validación:**

- `vacio`: Dinos con qué puede pagar el usuario.

### ¿Hay que gastar un mínimo para participar?

> Por ejemplo: 30.000. Si no hay mínimo, déjalo vacío.

**Por qué te preguntamos esto.** Si lo exiges, tiene que quedar escrito. Si no aparece en el documento, no lo puedes aplicar después.

| | |
|---|---|
| Campo interno | `compraMinima` |
| Paso | Participantes |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 100000 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_MINIMO_COMPRA`, `TEXTO_UMBRAL` |

**Mensajes de validación:**

- `cero`: Si no quieres exigir un mínimo, deja el campo vacío.

## Paso: Pieza

### ¿Qué categoría tiene el producto de la pieza?

> Casi siempre es Ninguna. Solo cambia la leyenda del arte, no tu T&C.

**Por qué te preguntamos esto.** Algunas categorías tienen que llevar una advertencia por ley dentro de la pieza, como los licores o los medicamentos. La leyenda que te damos ya la trae.

| | |
|---|---|
| Campo interno | `categoriaProducto` |
| Paso | Pieza |
| Tipo de control | lista |
| Obligatorio | no |
| Valor por defecto | ninguna |
| Avanza sola | sí |

**Mensajes de validación:**

- `vacio`: Elige una categoría, o Ninguna si el producto no es de ninguna de esas.
- `prohibida`: No se hacen campañas de cashback, descuento ni concursos sobre medicamentos, productos fitoterapéuticos, cigarrillos, tabaco calentado (como IQOS), vapeadores ni otros productos con nicotina. Esta campaña no se puede hacer. Si tienes dudas, escríbenos a #tyc-rappi.

## Paso: Revisar

### Confirma que la información es correcta

> Confirmo que estos datos son ciertos y son los de mi campaña.

**Por qué te preguntamos esto.** El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.

| | |
|---|---|
| Campo interno | `declaracion` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Marca la casilla para confirmar que la información es correcta.

---

# Carrera de Compras

Un concurso con premio: durante unas fechas gana quien más compre en la tienda. No hay azar, gana por lo que compró.

## Filtro de entrada

Antes del formulario. Si responde **sí** a cualquiera, no se genera: se muestra
la pantalla "Esta campaña la redacta Legal" con la razón y el enlace al
formulario manual.

- ¿Hay azar (sorteo, rifa, raspa y gana)?
- ¿Hay premios distintos por puesto o tabla de puntos?
- ¿El premio es una boleta, una experiencia o está ligado a un evento?
- ¿La tienda o la marca exige sus propios T&C?
- ¿Participan varias tiendas?

## Paso: Campaña

### ¿En qué país corre la campaña?

> Si tu país no aparece en la lista, todavía no está habilitado.

**Por qué te preguntamos esto.** Cada país tiene su propia entidad legal de Rappi, su moneda y su autoridad de protección al consumidor. El documento cambia completo según el país.

| | |
|---|---|
| Campo interno | `pais` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `PAIS_LEGAL`, `ENTIDAD_LEGAL` |

**Mensajes de validación:**

- `vacio`: Elige el país de la campaña.

### ¿La campaña es de Rappi o de Rappi Travel?

> Si es de vuelos, hoteles, autos o paquetes, es Rappi Travel.

**Por qué te preguntamos esto.** Son dos empresas distintas. Los domicilios los opera Rappi S.A.S. y los viajes Travel Moustache S.A.S., que es una agencia de viajes con registro de turismo. El documento entero cambia según cuál sea.

| | |
|---|---|
| Campo interno | `negocio` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | rappi |
| Avanza sola | sí |

**Opciones** (botones grandes, una sola):

- **Rappi**: Restaurantes, supermercados, farmacias y todo lo que llega a domicilio.
- **Rappi Travel**: Vuelos, hoteles, autos, paquetes, tours y asistencia al viajero.

**Mensajes de validación:**

- `vacio`: Dinos si la campaña es de Rappi o de Rappi Travel.

### ¿Qué tipo de campaña vas a hacer?

> Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.

**Por qué te preguntamos esto.** Cada tipo usa un modelo legal distinto, aprobado por Legal. Elegir mal significa generar el documento equivocado.

| | |
|---|---|
| Campo interno | `tipo` |
| Paso | Campaña |
| Tipo de control | tarjetas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |

**Mensajes de validación:**

- `vacio`: Elige el tipo de campaña.

### ¿En qué tienda aplica?

> La marca comercial como aparece en la app. Por ejemplo: Pollo Dorado.

**Por qué te preguntamos esto.** El documento nombra la tienda y la define como Tienda Participante. Si el nombre no coincide con el de la app, el usuario no la encuentra.

| | |
|---|---|
| Campo interno | `tienda` |
| Paso | Campaña |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Pollo Dorado |
| Avanza sola | no |
| Llena en el documento | `TIENDA` |

**Mensajes de validación:**

- `vacio`: Escribe la tienda donde aplica la campaña.

### ¿Dónde aplica la campaña?

> Si es solo en algunas ciudades, las escribes en la siguiente pregunta.

**Por qué te preguntamos esto.** La cobertura define dónde puede reclamar el usuario. Si el documento dice más de lo que la campaña cubre, el usuario tiene derecho a exigirlo.

| | |
|---|---|
| Campo interno | `alcance` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | Nacional |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_TERRITORIO` |

**Opciones** (botones grandes, una sola):

- **En todo el país**: Donde sea que Rappi tenga cobertura.
- **Solo en algunas ciudades**: Por ejemplo: Bogotá y Medellín.

**Mensajes de validación:**

- `vacio`: Elige si la campaña es nacional o por ciudades.

### ¿En qué ciudades?

> Sepáralas con comas. Por ejemplo: Bogotá, Medellín, Cali.

**Por qué te preguntamos esto.** Las ciudades salen escritas tal cual en la cláusula de cobertura. Si falta una, el usuario de esa ciudad no puede reclamar.

| | |
|---|---|
| Campo interno | `ciudades` |
| Paso | Campaña |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Bogotá, Medellín, Cali |
| Avanza sola | no |
| Llena en el documento | `TEXTO_TERRITORIO` |

**Sugerencias clicables:** Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Cúcuta

**Mensajes de validación:**

- `vacio`: Escribe al menos una ciudad, o vuelve y elige cobertura nacional.

## Paso: Organizador

### ¿Qué empresa paga el beneficio?

> Tal como sale en su RUT, por ejemplo: Alimentos del Norte S.A.S. Nunca es Rappi.

**Por qué te preguntamos esto.** El Organizador responde por la campaña frente al usuario y frente a la autoridad. Rappi solo pone la plataforma, así que el nombre tiene que ser exacto.

| | |
|---|---|
| Campo interno | `organizadorRazonSocial` |
| Paso | Organizador |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Alimentos del Norte S.A.S. |
| Avanza sola | no |
| Llena en el documento | `ORGANIZADOR` |

**Mensajes de validación:**

- `vacio`: Escribe la razón social de la empresa que paga el beneficio. Si no la tienes, pídesela a tu contacto en la tienda.

### ¿Cuál es el NIT de esa empresa?

> Con dígito de verificación, tal como sale en el RUT: 900.111.222-1.

**Por qué te preguntamos esto.** El documento identifica al Organizador con su número tributario. Un número mal escrito deja el documento sin un responsable identificable.

| | |
|---|---|
| Campo interno | `organizadorId` |
| Paso | Organizador |
| Tipo de control | identificacion |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 900.111.222-1 |
| Avanza sola | no |
| Llena en el documento | `ID_ORGANIZADOR` |

**Mensajes de validación:**

- `vacio`: Escribe el NIT de la empresa organizadora, con el dígito de verificación.
- `formato`: Ese número no cuadra. Revisa el dígito de verificación, que es el que va después del guion.

**Al validar bien** muestra el valor formateado seguido de "válido".

## Paso: Cuándo

### ¿Qué día arranca la campaña?

> Puede ser hoy. Publica los T&C antes de que arranque.

**Por qué te preguntamos esto.** Los Términos y Condiciones tienen que estar publicados antes de que la campaña empiece. Si arrancó ayer, ya no se pueden publicar a tiempo.

| | |
|---|---|
| Campo interno | `fechaInicio` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige el día en que arranca la campaña.
- `pasado`: Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro.

**Aviso:** Faltan menos de 48 horas. Alcanzas, pero publica los T&C hoy mismo.

### ¿A qué hora arranca?

> Por defecto arranca a medianoche.

**Por qué te preguntamos esto.** La hora exacta define desde cuándo un pedido cuenta para la campaña. Un pedido un minuto antes no da beneficio.

| | |
|---|---|
| Campo interno | `horaInicio` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 00:00 |
| Avanza sola | no |
| Llena en el documento | `HORA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige la hora de inicio.

### ¿Qué día termina?

> La mayoría de los cashback duran un solo día. Te la dejamos igual a la de inicio.

**Por qué te preguntamos esto.** Después de esta fecha la campaña no da beneficio. También se usa para calcular hasta cuándo sirven los Créditos.

| | |
|---|---|
| Campo interno | `fechaFin` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige el día en que termina la campaña.
- `orden`: La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.

### ¿A qué hora termina?

> Por defecto termina a las 11:59 de la noche.

**Por qué te preguntamos esto.** Define hasta qué minuto cuenta un pedido. Los pedidos posteriores se procesan como pedidos normales.

| | |
|---|---|
| Campo interno | `horaFin` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 23:59 |
| Avanza sola | no |
| Llena en el documento | `HORA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige la hora de fin.
- `orden`: La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día.

## Paso: Concurso

### ¿Qué productos participan?

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

- `vacio`: Dinos qué productos participan.

### ¿De qué marca?

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

- `vacio`: Escribe el nombre de la marca.

### ¿Cuáles productos?

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

- `vacio`: Escribe los productos que participan, separados por comas.

### ¿Cómo se define el ganador?

> Gana quien más compra, medido por plata o por número de pedidos.

**Por qué te preguntamos esto.** Esto es lo que hace que sea un concurso de habilidad y no un sorteo. Un sorteo necesita permiso previo de la autoridad.

| | |
|---|---|
| Campo interno | `criterioGanador` |
| Paso | Concurso |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `CRITERIO_GANADOR` |

**Opciones** (botones grandes, una sola):

- **Quien más plata gaste**: Suma el valor de las compras.
- **Quien más pedidos haga**: Cuenta pedidos, no montos.

**Mensajes de validación:**

- `vacio`: Dinos cómo se define el ganador.

### ¿Cuántas personas ganan?

> Los primeros del ranking. Por ejemplo: 3.

**Por qué te preguntamos esto.** El documento dice cuántos ganan y en qué posiciones. Cambiarlo después de publicado no se puede.

| | |
|---|---|
| Campo interno | `numeroGanadores` |
| Paso | Concurso |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 3 |
| Avanza sola | no |
| Llena en el documento | `FRASE_GANADORES` |

**Mensajes de validación:**

- `vacio`: Escribe cuántas personas ganan.
- `rango`: El número de ganadores va de 1 a 100.

### Si dos personas empatan, ¿quién gana?

> Tiene que ser un criterio distinto al que define al ganador.

**Por qué te preguntamos esto.** Sin regla de desempate, un empate se resuelve al azar, y el azar convierte el concurso en un sorteo.

| | |
|---|---|
| Campo interno | `desempate` |
| Paso | Concurso |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_DESEMPATE` |

**Opciones** (botones grandes, una sola):

- **Quien llegó primero**: Gana quien hizo antes su último pedido.
- **Quien hizo más pedidos**: Cuenta pedidos válidos.
- **Quien gastó más**: Suma el valor de las compras.

**Mensajes de validación:**

- `vacio`: Dinos quién gana si hay empate.
- `igual`: Ese ya es el criterio con el que se define al ganador, así que nunca desempataría. Elige otro.

**Opción deshabilitada:** se muestra con la razón visible: "Ya es el criterio del ganador: nunca desempataría."

## Paso: Premio

### ¿Qué se gana?

> Créditos es lo más simple: se cargan a la Billetera y listo.

**Por qué te preguntamos esto.** Un premio físico obliga al Organizador a responder por su existencia, calidad, garantía y entrega. Los Créditos no.

| | |
|---|---|
| Campo interno | `tipoPremio` |
| Paso | Premio |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `LISTA_PREMIOS`, `TEXTO_NATURALEZA_PREMIO` |

**Opciones** (botones grandes, una sola):

- **Créditos de Rappi**: Se cargan a la Billetera del ganador.
- **Un premio físico**: Algo que hay que entregar.

**Mensajes de validación:**

- `vacio`: Dinos qué se gana.

### ¿Cuántos Créditos se lleva cada ganador?

> Por persona, no el total. Por ejemplo: 500.000.

**Por qué te preguntamos esto.** Es la promesa del concurso. Si son varios ganadores, cada uno recibe esta cantidad completa.

| | |
|---|---|
| Campo interno | `creditosPremio` |
| Paso | Premio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 500000 |
| Avanza sola | no |
| Llena en el documento | `LISTA_PREMIOS` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos Créditos se lleva cada ganador.
- `cero`: El premio tiene que ser mayor que cero.

### ¿Qué es exactamente el premio?

> Descríbelo como para que nadie pregunte. Por ejemplo: una bicicleta de montaña marca Andes, rin 29.

**Por qué te preguntamos esto.** El Organizador responde por lo que diga esta línea. Descripciones vagas terminan en reclamos.

| | |
|---|---|
| Campo interno | `descripcionPremio` |
| Paso | Premio |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Una bicicleta de montaña marca Andes, rin 29 |
| Avanza sola | no |
| Llena en el documento | `LISTA_PREMIOS` |

**Mensajes de validación:**

- `vacio`: Describe el premio.
- `largo`: La descripción no puede pasar de 150 caracteres. Déjala en una línea concreta.

### ¿Quién entrega el premio?

> El Organizador responde por el premio, entregue quien entregue.

**Por qué te preguntamos esto.** Que Rappi lleve el premio no lo convierte en organizador: lo hace como operador logístico y por cuenta del Organizador.

| | |
|---|---|
| Campo interno | `entregaPor` |
| Paso | Premio |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_ENTREGA`, `TEXTO_DATOS_ENTREGA` |

**Opciones** (botones grandes, una sola):

- **El Organizador**: Coordina directo con el ganador.
- **Rappi, como operador logístico**: Por cuenta del Organizador, que sigue siendo el responsable.

**Mensajes de validación:**

- `vacio`: Dinos quién entrega el premio.

### ¿El Organizador ya firmó el acuerdo de transferencia de datos?

> Sin ese acuerdo firmado no se le pueden enviar los datos del ganador.

**Por qué te preguntamos esto.** Rappi responde por los datos de sus usuarios. Enviarlos a una marca sin acuerdo firmado nos expone ante la autoridad de datos personales.

| | |
|---|---|
| Campo interno | `acuerdoDatos` |
| Paso | Premio |
| Tipo de control | lista |
| Obligatorio | no |
| Avanza sola | sí |

**Opciones** (botones grandes, una sola):

- **Sí, ya está firmado**: Puedes seguir con la campaña.
- **No, o no sé**: Te mostramos cómo se firma. Puedes generar el T&C igual.

### ¿Cómo le avisas al ganador?

> El correo de la cuenta de Rappi del ganador es lo más confiable.

**Por qué te preguntamos esto.** El documento dice por dónde le vas a avisar. Si avisas por otro lado y no contesta, no puedes darlo por desierto.

| | |
|---|---|
| Campo interno | `medioNotificacion` |
| Paso | Premio |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | correo |
| Avanza sola | sí |
| Llena en el documento | `MEDIO_NOTIFICACION` |

**Opciones** (botones grandes, una sola):

- **Por correo electrónico**: Al correo de la cuenta de Rappi del ganador.
- **Por llamada telefónica**: Al número de la cuenta de Rappi del ganador.
- **Con una notificación en la app**: Dentro de la Plataforma Rappi.

**Mensajes de validación:**

- `vacio`: Dinos cómo le avisas al ganador.

### ¿Qué día le avisas?

> Después de que termine la campaña, con tiempo para contar los resultados.

**Por qué te preguntamos esto.** Es el compromiso de fecha frente al ganador. Antes de esa fecha nadie puede reclamar, después sí.

| | |
|---|---|
| Campo interno | `fechaNotificacion` |
| Paso | Premio |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_NOTIFICACION` |

**Mensajes de validación:**

- `vacio`: Elige el día en que le avisas al ganador.
- `orden`: Tiene que ser después de que termine la campaña: antes todavía no sabes quién ganó.

### ¿Cuántos días tiene para responder?

> Días hábiles. Cinco es lo habitual.

**Por qué te preguntamos esto.** Pasado ese plazo sin respuesta puedes declarar desierto el premio. Sin plazo escrito, no puedes.

| | |
|---|---|
| Campo interno | `plazoConfirmacion` |
| Paso | Premio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 5 |
| Ejemplo | 5 |
| Avanza sola | no |
| Llena en el documento | `PLAZO_CONFIRMACION` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos días hábiles tiene para responder.
- `rango`: El plazo va de 1 a 30 días hábiles.

## Paso: Participantes

### ¿Quiénes pueden participar?

> Por ejemplo: solo Pro, o quienes no compran hace 60 días.

**Por qué te preguntamos esto.** Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.

| | |
|---|---|
| Campo interno | `segmento` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_SEGMENTO` |

**Opciones** (botones grandes, una sola):

- **Todos los usuarios**: Cualquier persona mayor de edad.
- **Solo Pro y Pro Black**: Con la suscripción activa.
- **Solo usuarios nuevos**: Su primer pedido en Rappi.
- **Usuarios que no compran hace rato**: Tú dices desde cuándo.

**Mensajes de validación:**

- `vacio`: Dinos quiénes pueden participar.

### ¿Cuántos días sin comprar?

> Se cuentan hacia atrás desde que arranca la campaña. Por ejemplo: 60.

**Por qué te preguntamos esto.** Define exactamente a quién le llega. El documento lo dice en letras y en número, para que no haya discusión.

| | |
|---|---|
| Campo interno | `diasSinCompra` |
| Paso | Participantes |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 60 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_SEGMENTO` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos días sin comprar.
- `rango`: Los días van de 1 a 365.

### ¿Con qué medio de pago aplica el beneficio?

> Con "cualquier medio" entran tarjetas, billeteras y efectivo donde exista.

**Por qué te preguntamos esto.** Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.

| | |
|---|---|
| Campo interno | `metodoPago` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_METODO_PAGO` |

**Opciones** (botones grandes, una sola):

- **Con cualquier medio de pago**: Lo más común.
- **Con todo menos efectivo**: Tarjetas y billeteras sí, efectivo no.
- **Solo con RappiCard**: Únicamente la tarjeta de Rappi.

**Mensajes de validación:**

- `vacio`: Dinos con qué puede pagar el usuario.

### ¿Hay que gastar un mínimo para participar?

> Por ejemplo: 30.000. Si no hay mínimo, déjalo vacío.

**Por qué te preguntamos esto.** Si lo exiges, tiene que quedar escrito. Si no aparece en el documento, no lo puedes aplicar después.

| | |
|---|---|
| Campo interno | `compraMinima` |
| Paso | Participantes |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 100000 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_MINIMO_COMPRA`, `TEXTO_UMBRAL` |

**Mensajes de validación:**

- `cero`: Si no quieres exigir un mínimo, deja el campo vacío.

## Paso: Pieza

### ¿Qué categoría tiene el producto de la pieza?

> Casi siempre es Ninguna. Solo cambia la leyenda del arte, no tu T&C.

**Por qué te preguntamos esto.** Algunas categorías tienen que llevar una advertencia por ley dentro de la pieza, como los licores o los medicamentos. La leyenda que te damos ya la trae.

| | |
|---|---|
| Campo interno | `categoriaProducto` |
| Paso | Pieza |
| Tipo de control | lista |
| Obligatorio | no |
| Valor por defecto | ninguna |
| Avanza sola | sí |

**Mensajes de validación:**

- `vacio`: Elige una categoría, o Ninguna si el producto no es de ninguna de esas.
- `prohibida`: No se hacen campañas de cashback, descuento ni concursos sobre medicamentos, productos fitoterapéuticos, cigarrillos, tabaco calentado (como IQOS), vapeadores ni otros productos con nicotina. Esta campaña no se puede hacer. Si tienes dudas, escríbenos a #tyc-rappi.

## Paso: Revisar

### Confirma que la información es correcta

> Confirmo que estos datos son ciertos y son los de mi campaña.

**Por qué te preguntamos esto.** El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.

| | |
|---|---|
| Campo interno | `declaracion` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Marca la casilla para confirmar que la información es correcta.

---

# Cashback Travel

La marca aliada devuelve un porcentaje de lo que el usuario pagó por su vuelo, hotel, auto o paquete, en Créditos para su Billetera.

## Filtro de entrada

Antes del formulario. Si responde **sí** a cualquiera, no se genera: se muestra
la pantalla "Esta campaña la redacta Legal" con la razón y el enlace al
formulario manual.


## Paso: Campaña

### ¿En qué país corre la campaña?

> Si tu país no aparece en la lista, todavía no está habilitado.

**Por qué te preguntamos esto.** Cada país tiene su propia entidad legal de Rappi, su moneda y su autoridad de protección al consumidor. El documento cambia completo según el país.

| | |
|---|---|
| Campo interno | `pais` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `PAIS_LEGAL`, `ENTIDAD_LEGAL` |

**Mensajes de validación:**

- `vacio`: Elige el país de la campaña.

### ¿La campaña es de Rappi o de Rappi Travel?

> Si es de vuelos, hoteles, autos o paquetes, es Rappi Travel.

**Por qué te preguntamos esto.** Son dos empresas distintas. Los domicilios los opera Rappi S.A.S. y los viajes Travel Moustache S.A.S., que es una agencia de viajes con registro de turismo. El documento entero cambia según cuál sea.

| | |
|---|---|
| Campo interno | `negocio` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | rappi |
| Avanza sola | sí |

**Opciones** (botones grandes, una sola):

- **Rappi**: Restaurantes, supermercados, farmacias y todo lo que llega a domicilio.
- **Rappi Travel**: Vuelos, hoteles, autos, paquetes, tours y asistencia al viajero.

**Mensajes de validación:**

- `vacio`: Dinos si la campaña es de Rappi o de Rappi Travel.

### ¿Qué tipo de campaña vas a hacer?

> Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.

**Por qué te preguntamos esto.** Cada tipo usa un modelo legal distinto, aprobado por Legal. Elegir mal significa generar el documento equivocado.

| | |
|---|---|
| Campo interno | `tipo` |
| Paso | Campaña |
| Tipo de control | tarjetas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |

**Mensajes de validación:**

- `vacio`: Elige el tipo de campaña.

## Paso: Organizador

### ¿Qué empresa paga el beneficio?

> Tal como sale en su RUT, por ejemplo: Alimentos del Norte S.A.S. Nunca es Rappi.

**Por qué te preguntamos esto.** El Organizador responde por la campaña frente al usuario y frente a la autoridad. Rappi solo pone la plataforma, así que el nombre tiene que ser exacto.

| | |
|---|---|
| Campo interno | `organizadorRazonSocial` |
| Paso | Organizador |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Alimentos del Norte S.A.S. |
| Avanza sola | no |
| Llena en el documento | `ORGANIZADOR` |

**Mensajes de validación:**

- `vacio`: Escribe la razón social de la empresa que paga el beneficio. Si no la tienes, pídesela a tu contacto en la tienda.

### ¿Cuál es el NIT de esa empresa?

> Con dígito de verificación, tal como sale en el RUT: 900.111.222-1.

**Por qué te preguntamos esto.** El documento identifica al Organizador con su número tributario. Un número mal escrito deja el documento sin un responsable identificable.

| | |
|---|---|
| Campo interno | `organizadorId` |
| Paso | Organizador |
| Tipo de control | identificacion |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 900.111.222-1 |
| Avanza sola | no |
| Llena en el documento | `ID_ORGANIZADOR` |

**Mensajes de validación:**

- `vacio`: Escribe el NIT de la empresa organizadora, con el dígito de verificación.
- `formato`: Ese número no cuadra. Revisa el dígito de verificación, que es el que va después del guion.

**Al validar bien** muestra el valor formateado seguido de "válido".

### ¿De qué marca son los productos?

> Como la ve el usuario en la app. Por ejemplo: JetSMART.

**Por qué te preguntamos esto.** El documento dice de qué marca son los productos que participan, y el nombre de la campaña empieza por ella.

| | |
|---|---|
| Campo interno | `marcaAliado` |
| Paso | Organizador |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | JetSMART |
| Avanza sola | no |
| Llena en el documento | `TEXTO_PRODUCTOS_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe la marca. Sin ella, el nombre de la campaña quedaría con la razón social.

## Paso: Productos

### ¿Qué categorías de Travel participan?

> Las mismas de la app. Puedes marcar varias. Por ejemplo: Vuelos y Paquetes.

**Por qué te preguntamos esto.** Los nombres salen entre comillas en el documento, así que tienen que coincidir con los de la app. De esto también dependen las preguntas que vienen: los vuelos tienen condiciones que los hoteles no.

| | |
|---|---|
| Campo interno | `categorias` |
| Paso | Productos |
| Tipo de control | casillas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_PRODUCTOS_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Marca al menos una categoría.

### ¿Los viajes son nacionales o internacionales?

> Si aplica a los dos, elige la tercera opción y el documento no lo menciona.

**Por qué te preguntamos esto.** Define si el beneficio cubre un vuelo a Medellín, uno a Madrid o los dos. Si no queda escrito, el usuario lo puede exigir en cualquiera.

| | |
|---|---|
| Campo interno | `ambito` |
| Paso | Productos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | ambos |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_AMBITO_TRAVEL` |

**Opciones** (botones grandes, una sola):

- **Solo nacionales**: Origen y destino dentro del país.
- **Solo internacionales**: Origen o destino fuera del país.
- **Nacionales e internacionales**: Sin restricción de destino.

**Mensajes de validación:**

- `vacio`: Dinos si los viajes son nacionales, internacionales o los dos.

### ¿Aplica solo a algunos destinos?

> Es opcional. Ciudades o países separados por comas. Por ejemplo: España, México.

**Por qué te preguntamos esto.** Si la campaña solo cubre unos destinos, tienen que quedar escritos. Si lo dejas vacío, el beneficio aplica a cualquier destino del ámbito que elegiste.

| | |
|---|---|
| Campo interno | `destinos` |
| Paso | Productos |
| Tipo de control | texto |
| Obligatorio | no |
| Ejemplo | España, Estados Unidos, México |
| Avanza sola | no |
| Llena en el documento | `TEXTO_DESTINOS_TRAVEL` |

### ¿Qué hoteles participan?

> Si son pocos, los escribes en la siguiente pregunta.

**Por qué te preguntamos esto.** El usuario tiene que poder saber, antes de reservar, si ese hotel entra en la campaña. Si el documento no lo dice, entra cualquiera.

| | |
|---|---|
| Campo interno | `hotelesModo` |
| Paso | Productos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | todos |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_HOTELES_TRAVEL` |

**Opciones** (botones grandes, una sola):

- **Todos**: Todos los de las categorías de alojamiento que marcaste.
- **Solo algunos**: Los nombras uno por uno.
- **Los que tengan la etiqueta de la campaña**: El usuario los identifica en la app.

**Mensajes de validación:**

- `vacio`: Dinos qué hoteles participan.

### ¿Cuáles hoteles?

> Sepáralos con comas, como aparecen en la app.

**Por qué te preguntamos esto.** Los nombres salen escritos en el documento. Si falta uno, el usuario que reserve ahí no recibe el beneficio.

| | |
|---|---|
| Campo interno | `hotelesLista` |
| Paso | Productos |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Hotel Estelar Santamar, Decameron Galeón |
| Avanza sola | no |
| Llena en el documento | `TEXTO_HOTELES_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe al menos un hotel, o vuelve y elige que participan todos.

## Paso: Condiciones

### ¿Aplica solo a una aerolínea?

> Es opcional. Escríbela como aparece en la app. Por ejemplo: Avianca.

**Por qué te preguntamos esto.** Casi todas las campañas de vuelos las paga una aerolínea y aplican solo a sus vuelos. Si lo dejas vacío, aplica a cualquier aerolínea.

| | |
|---|---|
| Campo interno | `aerolinea` |
| Paso | Condiciones |
| Tipo de control | texto |
| Obligatorio | no |
| Ejemplo | Avianca |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

### ¿Solo vuelos que ella misma opere?

> Márcalo si quedan fuera los vuelos en código compartido con otra aerolínea.

**Por qué te preguntamos esto.** Una aerolínea vende vuelos que opera otra compañía. Si la campaña no los cubre y el documento no lo dice, el usuario los puede reclamar.

| | |
|---|---|
| Campo interno | `soloOperados` |
| Paso | Condiciones |
| Tipo de control | casilla |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

### ¿Qué trayectos aplican?

> Muchas campañas de aerolínea exigen ida y regreso.

**Por qué te preguntamos esto.** Si la campaña exige ida y regreso y el documento no lo dice, quien compre solo ida puede reclamar el beneficio.

| | |
|---|---|
| Campo interno | `trayecto` |
| Paso | Condiciones |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | cualquiera |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Opciones** (botones grandes, una sola):

- **Cualquiera**: Ida sola, ida y regreso, lo que sea.
- **Solo ida y regreso**: No aplica a un tiquete de ida sola.
- **Solo ida**: No aplica a un tiquete de ida y regreso.

**Mensajes de validación:**

- `vacio`: Dinos qué trayectos aplican.

### ¿Una ida y regreso cuenta como una orden?

> Es lo habitual: una compra, una orden, un beneficio.

**Por qué te preguntamos esto.** De esto depende cuántas veces se aplica el tope y cuánto consume del presupuesto una sola compra. Si el documento no lo dice, el usuario puede sostener que son dos.

| | |
|---|---|
| Campo interno | `conteoIdaRegreso` |
| Paso | Condiciones |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | una_orden |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_CONTEO_IDA_REGRESO_TRAVEL` |

**Opciones** (botones grandes, una sola):

- **Sí, cuenta como una**: El beneficio se calcula sobre el total de la compra.
- **No, cada trayecto cuenta aparte**: El beneficio se calcula sobre cada trayecto.

**Mensajes de validación:**

- `vacio`: Dinos cómo se cuenta una compra de ida y regreso.

### ¿Hay clases tarifarias excluidas?

> Es opcional. Una letra cada una, separadas por comas. Por ejemplo: A, F.

**Por qué te preguntamos esto.** Las aerolíneas excluyen sus tarifas más baratas o promocionales. Si no quedan escritas, el usuario que compre esa clase puede reclamar.

| | |
|---|---|
| Campo interno | `clasesExcluidas` |
| Paso | Condiciones |
| Tipo de control | texto |
| Obligatorio | no |
| Ejemplo | A, F |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `formato`: Cada clase tarifaria es una sola letra, separada por comas. Por ejemplo: A, F.

### ¿Solo vuelos que salgan del país?

> Márcalo si no aplica a vuelos que empiezan en el exterior.

**Por qué te preguntamos esto.** Un vuelo Madrid a Bogotá también se vende en la app. Si la campaña no lo cubre, tiene que decirlo.

| | |
|---|---|
| Campo interno | `soloOrigenPais` |
| Paso | Condiciones |
| Tipo de control | casilla |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

### ¿Hay que comprar con anticipación?

> Es opcional. Cuántos días antes del viaje. Por ejemplo: 15.

**Por qué te preguntamos esto.** Si la campaña exige comprar con anticipación y el documento no lo dice, el usuario que compre el mismo día puede reclamar el beneficio.

| | |
|---|---|
| Campo interno | `anticipacionDias` |
| Paso | Condiciones |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 15 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `rango`: Los días de anticipación van de 1 a 365.

### ¿El viaje tiene que ser desde cierta fecha?

> Es opcional, y no es lo mismo que la vigencia: es cuándo viaja, no cuándo compra.

**Por qué te preguntamos esto.** La campaña puede correr en octubre para viajes de diciembre. Son dos fechas distintas y el documento las separa.

| | |
|---|---|
| Campo interno | `periodoViajeInicio` |
| Paso | Condiciones |
| Tipo de control | fecha |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

### ¿Y hasta qué fecha?

> El último día en que se puede viajar o usar el servicio.

**Por qué te preguntamos esto.** Cierra el periodo de viaje. Sin esta fecha, el periodo queda abierto y el usuario lo puede usar cuando quiera.

| | |
|---|---|
| Campo interno | `periodoViajeFin` |
| Paso | Condiciones |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe hasta cuándo se puede viajar.
- `orden`: El periodo de viaje no puede terminar antes de empezar.

### ¿Los dos trayectos dentro de ese periodo?

> Márcalo si el regreso también tiene que caer dentro de las fechas.

**Por qué te preguntamos esto.** Sin esta regla, alguien vuela dentro del periodo y regresa meses después. Si el aliado no lo acepta, tiene que quedar escrito.

| | |
|---|---|
| Campo interno | `ambasFechasDentro` |
| Paso | Condiciones |
| Tipo de control | casilla |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

### ¿Hay fechas en las que no aplica?

> Es opcional. En formato año-mes-día, separadas por comas. Por ejemplo: 2026-12-24, 2026-12-31.

**Por qué te preguntamos esto.** Los hoteles y las rentadoras suelen excluir puentes y fin de año. Si no queda escrito, el usuario puede reclamar esas fechas.

| | |
|---|---|
| Campo interno | `fechasExcluidas` |
| Paso | Condiciones |
| Tipo de control | texto |
| Obligatorio | no |
| Ejemplo | 2026-12-24, 2026-12-31 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `formato`: Las fechas van en formato año-mes-día, separadas por comas. Por ejemplo: 2026-12-24.
- `fuera`: Las fechas excluidas tienen que estar dentro del periodo de viaje.

### ¿Hay un mínimo de noches?

> Es opcional. Por ejemplo: 2.

**Por qué te preguntamos esto.** Si el hotel exige dos noches y el documento no lo dice, quien reserve una puede reclamar el beneficio.

| | |
|---|---|
| Campo interno | `nochesMinimas` |
| Paso | Condiciones |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 2 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `rango`: El mínimo de noches va de 1 a 365.

### ¿Hay un mínimo de días de alquiler?

> Es opcional. Por ejemplo: 3.

**Por qué te preguntamos esto.** Las rentadoras suelen pedir un mínimo de días. Si no queda escrito, no se puede exigir después.

| | |
|---|---|
| Campo interno | `diasAlquilerMinimo` |
| Paso | Condiciones |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 3 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `rango`: El mínimo de días va de 1 a 365.

### ¿Y un máximo?

> El alquiler más largo que entra en la campaña. Por ejemplo: 15.

**Por qué te preguntamos esto.** Cierra el rango. Un alquiler de dos meses puede llevarse el beneficio entero si no hay tope de días.

| | |
|---|---|
| Campo interno | `diasAlquilerMaximo` |
| Paso | Condiciones |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 15 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe el máximo de días de alquiler.
- `orden`: El mínimo de días no puede ser mayor que el máximo.

### ¿Hay que gastar un mínimo para participar?

> Por ejemplo: 30.000. Si no hay mínimo, déjalo vacío.

**Por qué te preguntamos esto.** Si lo exiges, tiene que quedar escrito. Si no aparece en el documento, no lo puedes aplicar después.

| | |
|---|---|
| Campo interno | `compraMinima` |
| Paso | Participantes |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 100000 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_MINIMO_COMPRA`, `TEXTO_UMBRAL` |

**Mensajes de validación:**

- `cero`: Si no quieres exigir un mínimo, deja el campo vacío.

### sinCompraMinima

No tiene pregunta propia: se responde dentro de **compraMinima**.

### ¿El aliado pide alguna otra condición?

> Cualquier requisito que no te hayamos preguntado ya.

**Por qué te preguntamos esto.** Si el aliado exige algo que este documento no cubre, el T&C se queda corto y el usuario puede reclamar lo que no quedó escrito. En ese caso la campaña la redacta Legal.

| | |
|---|---|
| Campo interno | `otraCondicion` |
| Paso | Condiciones |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | no |
| Avanza sola | sí |

**Opciones** (botones grandes, una sola):

- **No, nada más**: Todo lo que pide el aliado ya lo respondiste.
- **Sí, pide algo más**: Te llevamos al formulario de Legal, que la redacta a mano.

**Mensajes de validación:**

- `vacio`: Dinos si el aliado pide alguna otra condición.

## Paso: Cuándo

### ¿Qué día arranca la campaña?

> Puede ser hoy. Publica los T&C antes de que arranque.

**Por qué te preguntamos esto.** Los Términos y Condiciones tienen que estar publicados antes de que la campaña empiece. Si arrancó ayer, ya no se pueden publicar a tiempo.

| | |
|---|---|
| Campo interno | `fechaInicio` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige el día en que arranca la campaña.
- `pasado`: Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro.

**Aviso:** Faltan menos de 48 horas. Alcanzas, pero publica los T&C hoy mismo.

### ¿A qué hora arranca?

> Por defecto arranca a medianoche.

**Por qué te preguntamos esto.** La hora exacta define desde cuándo un pedido cuenta para la campaña. Un pedido un minuto antes no da beneficio.

| | |
|---|---|
| Campo interno | `horaInicio` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 00:00 |
| Avanza sola | no |
| Llena en el documento | `HORA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige la hora de inicio.

### ¿Qué día termina?

> La mayoría de los cashback duran un solo día. Te la dejamos igual a la de inicio.

**Por qué te preguntamos esto.** Después de esta fecha la campaña no da beneficio. También se usa para calcular hasta cuándo sirven los Créditos.

| | |
|---|---|
| Campo interno | `fechaFin` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige el día en que termina la campaña.
- `orden`: La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.

### ¿A qué hora termina?

> Por defecto termina a las 11:59 de la noche.

**Por qué te preguntamos esto.** Define hasta qué minuto cuenta un pedido. Los pedidos posteriores se procesan como pedidos normales.

| | |
|---|---|
| Campo interno | `horaFin` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 23:59 |
| Avanza sola | no |
| Llena en el documento | `HORA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige la hora de fin.
- `orden`: La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día.

## Paso: Beneficio

### ¿Cómo se calcula el cashback?

> Un porcentaje de lo que pagó, o siempre la misma cantidad.

**Por qué te preguntamos esto.** Cambia la cláusula del beneficio entera. Con porcentaje hace falta un tope; con monto fijo, no.

| | |
|---|---|
| Campo interno | `formaBeneficio` |
| Paso | Beneficio |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | porcentaje |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_BENEFICIO_TRAVEL` |

**Opciones** (botones grandes, una sola):

- **Un porcentaje de lo que pagó**: Lo más usado. Necesita un tope.
- **Una cantidad fija de Créditos**: Todos reciben lo mismo.

**Mensajes de validación:**

- `vacio`: Dinos cómo se calcula el cashback.

### ¿Qué porcentaje del pedido se devuelve en Créditos?

> Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.

**Por qué te preguntamos esto.** Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.

| | |
|---|---|
| Campo interno | `porcentaje` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 20 |
| Avanza sola | no |
| Llena en el documento | `PORCENTAJE` |

**Mensajes de validación:**

- `vacio`: Escribe el porcentaje que devuelves, sin el signo de porcentaje.
- `rango`: El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.

### ¿Cuál es el máximo de Créditos por pedido?

> Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.

**Por qué te preguntamos esto.** Sin tope, un pedido enorme se lleva el presupuesto entero. Con tope, un cashback alto sigue siendo viable.

| | |
|---|---|
| Campo interno | `tope` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 25000 |
| Avanza sola | no |
| Llena en el documento | `TOPE` |

**Mensajes de validación:**

- `vacio`: Escribe el máximo de Créditos que recibe una persona por pedido.
- `cero`: El tope tiene que ser mayor que cero.
- `mayorQuePresupuesto`: El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.

### sinTope

No tiene pregunta propia: se responde dentro de **tope**.

### ¿Cuántos Créditos recibe por orden?

> La misma cantidad para todos. En las campañas reales va de 50.000 a 300.000.

**Por qué te preguntamos esto.** Es el beneficio completo: no depende de cuánto pagó el usuario. Sale escrito en letras y en cifra.

| | |
|---|---|
| Campo interno | `montoFijo` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 100000 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_BENEFICIO_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos Créditos recibe una persona por orden.
- `cero`: Los Créditos por orden tienen que ser más que cero.
- `mayorQuePresupuesto`: Los Créditos por orden son más que el presupuesto total. Revisa los dos números.

### ¿Cuántas órdenes puede beneficiar una persona?

> En las campañas de Travel lo más usado son 2.

**Por qué te preguntamos esto.** Sin límite, unos pocos usuarios consumen el presupuesto. Con límite, el beneficio llega a más gente.

| | |
|---|---|
| Campo interno | `limitePorUsuario` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 2 |
| Ejemplo | 2 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_LIMITE_ORDENES_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe cuántas órdenes con beneficio puede tener una persona.
- `rango`: Tiene que ser al menos una orden.

### ¿Cuánto es el presupuesto total de la campaña?

> Cuando se acabe, la campaña termina sola. Lo habitual va de 5 a 40 millones.

**Por qué te preguntamos esto.** El documento dice que la campaña termina al agotarse el presupuesto. Es lo que te protege si el consumo se dispara.

| | |
|---|---|
| Campo interno | `presupuesto` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 20000000 |
| Avanza sola | no |
| Llena en el documento | `PRESUPUESTO` |

**Mensajes de validación:**

- `vacio`: Escribe el presupuesto total de la campaña.
- `cero`: El presupuesto tiene que ser mayor que cero.

### ¿Hay un máximo de órdenes en la campaña?

> Cuando se llegue a ese número, la campaña termina sola. En Travel es habitual.

**Por qué te preguntamos esto.** Es un segundo freno además del presupuesto. El documento dice que la campaña termina al agotarse cualquiera de los dos.

| | |
|---|---|
| Campo interno | `maxOrdenes` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 33 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_LIMITE_CAMPANA_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe el máximo de órdenes, o marca que no hay máximo.
- `rango`: Tiene que ser al menos una orden.

### sinMaxOrdenes

No tiene pregunta propia: se responde dentro de **maxOrdenes**.

## Paso: Créditos

### ¿Cuándo le llegan los Créditos al usuario?

> Es el momento en que el saldo le queda disponible en la Billetera.

**Por qué te preguntamos esto.** El documento fija en qué momento el usuario recibe los Créditos, y eso es lo que el usuario va a esperar. Elige lo que el equipo de operaciones puede cumplir.

| | |
|---|---|
| Campo interno | `carga` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | dia_siguiente |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_CARGA`, `TEXTO_VERIFICACION` |

**Opciones** (botones grandes, una sola):

- **Al día siguiente del pedido**: Lo más usado.
- **Apenas termina el pedido**: Inmediato, sin verificación previa.
- **En una fecha específica**: Todos reciben el mismo día.

**Mensajes de validación:**

- `vacio`: Dinos cuándo le llegan los Créditos al usuario.

### ¿Cuántos días después?

> Los valores más usados en Travel van de 3 a 5 días.

**Por qué te preguntamos esto.** Es el plazo que el usuario va a esperar. Se cuenta desde que termina la campaña, no desde su compra.

| | |
|---|---|
| Campo interno | `diasCarga` |
| Paso | Créditos |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 5 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CARGA_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos días después de que termine la campaña llegan los Créditos.
- `rango`: Los días van de 1 a 30.

### ¿Cuántos días le duran?

> Los valores que más se usan son 5, 7 y 30 días.

**Por qué te preguntamos esto.** Se cuentan desde el día en que le llegan. Muy pocos días y el usuario no alcanza a usarlos, y eso genera reclamos.

| | |
|---|---|
| Campo interno | `diasVigencia` |
| Paso | Créditos |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 30 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_VIGENCIA_CREDITOS` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos días duran los Créditos.
- `rango`: Los días van de 1 a 365.

### ¿Dónde puede gastar los Créditos?

> Por ejemplo: solo en la tienda donde se los ganó, que es lo más común.

**Por qué te preguntamos esto.** Define dónde vale el saldo. Lo normal es que se gaste en la misma tienda donde el usuario se ganó el beneficio. En todo caso, estos Créditos casi nunca aplican a RappiFavor, Cajero ATM ni Rappi Travel.

| | |
|---|---|
| Campo interno | `redencion` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_LUGAR_REDENCION` |

**Opciones** (botones grandes, una sola):

- **Solo en esta tienda**: Vuelve a comprar donde ganó el beneficio.
- **En ciertas secciones de Rappi**: Tú eliges cuáles.
- **En cualquier parte de Rappi**: Donde sea que se acepten Créditos.

**Mensajes de validación:**

- `vacio`: Dinos dónde puede gastar los Créditos.

### ¿En qué categorías se pueden usar?

> Puedes marcar varias. En las campañas reales casi nunca incluyen Vuelos.

**Por qué te preguntamos esto.** El documento dice en qué categorías valen los Créditos y en cuáles no. Si no lo dice, el usuario los puede usar en cualquiera y la campaña sale más cara de lo previsto.

| | |
|---|---|
| Campo interno | `categoriasRedencion` |
| Paso | Créditos |
| Tipo de control | casillas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_REDENCION_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Marca al menos una categoría donde se puedan usar los Créditos.

## Paso: Participantes

### ¿Quiénes pueden participar?

> Por ejemplo: solo Pro, o quienes no compran hace 60 días.

**Por qué te preguntamos esto.** Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.

| | |
|---|---|
| Campo interno | `segmento` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_SEGMENTO` |

**Opciones** (botones grandes, una sola):

- **Todos los usuarios**: Cualquier persona mayor de edad.
- **Solo Pro y Pro Black**: Con la suscripción activa.
- **Solo usuarios nuevos**: Su primer pedido en Rappi.
- **Usuarios que no compran hace rato**: Tú dices desde cuándo.

**Mensajes de validación:**

- `vacio`: Dinos quiénes pueden participar.

### ¿Con qué medio de pago aplica el beneficio?

> Con "cualquier medio" entran tarjetas, billeteras y efectivo donde exista.

**Por qué te preguntamos esto.** Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.

| | |
|---|---|
| Campo interno | `metodoPago` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_METODO_PAGO` |

**Opciones** (botones grandes, una sola):

- **Con cualquier medio de pago**: Lo más común.
- **Con todo menos efectivo**: Tarjetas y billeteras sí, efectivo no.
- **Solo con RappiCard**: Únicamente la tarjeta de Rappi.

**Mensajes de validación:**

- `vacio`: Dinos con qué puede pagar el usuario.

## Paso: Revisar

### ¿Qué día sale la primera pieza?

> El día del primer correo, push, banner o mensaje. El T&C se publica antes.

**Por qué te preguntamos esto.** En junio de 2026 salió un mensaje de WhatsApp antes de que el T&C estuviera publicado y un usuario reclamó. Esta fecha nos deja verificar que eso no se repita.

| | |
|---|---|
| Campo interno | `fechaPrimeraComunicacion` |
| Paso | Revisar |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Escribe el día en que sale la primera comunicación.
- `pasado`: La primera comunicación no puede ser una fecha que ya pasó: el T&C se publica antes de que salga la primera pieza.

### ¿Esta campaña repite una anterior?

> Es opcional. Pega el link de promos.rappi.com de la campaña anterior.

**Por qué te preguntamos esto.** Nos deja comparar las dos y ver si alguna condición cambió sin que nadie lo notara. No sale en el documento.

| | |
|---|---|
| Campo interno | `linkAnterior` |
| Paso | Revisar |
| Tipo de control | texto |
| Obligatorio | no |
| Ejemplo | https://promos.rappi.com/colombia/... |
| Avanza sola | no |

### Confirma que el aliado aprobó la mecánica

> Confirmo que el aliado aprobó esta mecánica.

**Por qué te preguntamos esto.** El aliado es el Organizador y responde por la campaña. Si no la aprobó, no se puede publicar a su nombre.

| | |
|---|---|
| Campo interno | `aliadoAprobo` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Confirma que el aliado aprobó la mecánica.

### Confirma que las piezas dicen lo mismo que el T&C

> Confirmo que las piezas dicen lo mismo que este T&C (el porcentaje, la palabra "hasta" junto al tope y las categorías donde se usan los Créditos) y que nada sale antes de publicarlo.

**Por qué te preguntamos esto.** En agosto de 2025 una etiqueta prometía 250.000 de cashback sin la palabra "hasta" y terminó en un reclamo por publicidad engañosa que hubo que pagar.

| | |
|---|---|
| Campo interno | `declaracionPiezas` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Confirma que las piezas dicen lo mismo que el T&C.

### Confirma que la información es correcta

> Confirmo que estos datos son ciertos y son los de mi campaña.

**Por qué te preguntamos esto.** El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.

| | |
|---|---|
| Campo interno | `declaracion` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Marca la casilla para confirmar que la información es correcta.

---

# Descuento Travel

La marca aliada baja el precio de sus vuelos, hoteles, autos o paquetes. El usuario ve el precio ya rebajado antes de pagar, no recibe Créditos.

## Filtro de entrada

Antes del formulario. Si responde **sí** a cualquiera, no se genera: se muestra
la pantalla "Esta campaña la redacta Legal" con la razón y el enlace al
formulario manual.


## Paso: Campaña

### ¿En qué país corre la campaña?

> Si tu país no aparece en la lista, todavía no está habilitado.

**Por qué te preguntamos esto.** Cada país tiene su propia entidad legal de Rappi, su moneda y su autoridad de protección al consumidor. El documento cambia completo según el país.

| | |
|---|---|
| Campo interno | `pais` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `PAIS_LEGAL`, `ENTIDAD_LEGAL` |

**Mensajes de validación:**

- `vacio`: Elige el país de la campaña.

### ¿La campaña es de Rappi o de Rappi Travel?

> Si es de vuelos, hoteles, autos o paquetes, es Rappi Travel.

**Por qué te preguntamos esto.** Son dos empresas distintas. Los domicilios los opera Rappi S.A.S. y los viajes Travel Moustache S.A.S., que es una agencia de viajes con registro de turismo. El documento entero cambia según cuál sea.

| | |
|---|---|
| Campo interno | `negocio` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | rappi |
| Avanza sola | sí |

**Opciones** (botones grandes, una sola):

- **Rappi**: Restaurantes, supermercados, farmacias y todo lo que llega a domicilio.
- **Rappi Travel**: Vuelos, hoteles, autos, paquetes, tours y asistencia al viajero.

**Mensajes de validación:**

- `vacio`: Dinos si la campaña es de Rappi o de Rappi Travel.

### ¿Qué tipo de campaña vas a hacer?

> Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.

**Por qué te preguntamos esto.** Cada tipo usa un modelo legal distinto, aprobado por Legal. Elegir mal significa generar el documento equivocado.

| | |
|---|---|
| Campo interno | `tipo` |
| Paso | Campaña |
| Tipo de control | tarjetas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |

**Mensajes de validación:**

- `vacio`: Elige el tipo de campaña.

## Paso: Organizador

### ¿Qué empresa paga el beneficio?

> Tal como sale en su RUT, por ejemplo: Alimentos del Norte S.A.S. Nunca es Rappi.

**Por qué te preguntamos esto.** El Organizador responde por la campaña frente al usuario y frente a la autoridad. Rappi solo pone la plataforma, así que el nombre tiene que ser exacto.

| | |
|---|---|
| Campo interno | `organizadorRazonSocial` |
| Paso | Organizador |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Alimentos del Norte S.A.S. |
| Avanza sola | no |
| Llena en el documento | `ORGANIZADOR` |

**Mensajes de validación:**

- `vacio`: Escribe la razón social de la empresa que paga el beneficio. Si no la tienes, pídesela a tu contacto en la tienda.

### ¿Cuál es el NIT de esa empresa?

> Con dígito de verificación, tal como sale en el RUT: 900.111.222-1.

**Por qué te preguntamos esto.** El documento identifica al Organizador con su número tributario. Un número mal escrito deja el documento sin un responsable identificable.

| | |
|---|---|
| Campo interno | `organizadorId` |
| Paso | Organizador |
| Tipo de control | identificacion |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 900.111.222-1 |
| Avanza sola | no |
| Llena en el documento | `ID_ORGANIZADOR` |

**Mensajes de validación:**

- `vacio`: Escribe el NIT de la empresa organizadora, con el dígito de verificación.
- `formato`: Ese número no cuadra. Revisa el dígito de verificación, que es el que va después del guion.

**Al validar bien** muestra el valor formateado seguido de "válido".

### ¿De qué marca son los productos?

> Como la ve el usuario en la app. Por ejemplo: JetSMART.

**Por qué te preguntamos esto.** El documento dice de qué marca son los productos que participan, y el nombre de la campaña empieza por ella.

| | |
|---|---|
| Campo interno | `marcaAliado` |
| Paso | Organizador |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | JetSMART |
| Avanza sola | no |
| Llena en el documento | `TEXTO_PRODUCTOS_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe la marca. Sin ella, el nombre de la campaña quedaría con la razón social.

## Paso: Productos

### ¿Qué categorías de Travel participan?

> Las mismas de la app. Puedes marcar varias. Por ejemplo: Vuelos y Paquetes.

**Por qué te preguntamos esto.** Los nombres salen entre comillas en el documento, así que tienen que coincidir con los de la app. De esto también dependen las preguntas que vienen: los vuelos tienen condiciones que los hoteles no.

| | |
|---|---|
| Campo interno | `categorias` |
| Paso | Productos |
| Tipo de control | casillas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_PRODUCTOS_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Marca al menos una categoría.

### ¿Los viajes son nacionales o internacionales?

> Si aplica a los dos, elige la tercera opción y el documento no lo menciona.

**Por qué te preguntamos esto.** Define si el beneficio cubre un vuelo a Medellín, uno a Madrid o los dos. Si no queda escrito, el usuario lo puede exigir en cualquiera.

| | |
|---|---|
| Campo interno | `ambito` |
| Paso | Productos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | ambos |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_AMBITO_TRAVEL` |

**Opciones** (botones grandes, una sola):

- **Solo nacionales**: Origen y destino dentro del país.
- **Solo internacionales**: Origen o destino fuera del país.
- **Nacionales e internacionales**: Sin restricción de destino.

**Mensajes de validación:**

- `vacio`: Dinos si los viajes son nacionales, internacionales o los dos.

### ¿Aplica solo a algunos destinos?

> Es opcional. Ciudades o países separados por comas. Por ejemplo: España, México.

**Por qué te preguntamos esto.** Si la campaña solo cubre unos destinos, tienen que quedar escritos. Si lo dejas vacío, el beneficio aplica a cualquier destino del ámbito que elegiste.

| | |
|---|---|
| Campo interno | `destinos` |
| Paso | Productos |
| Tipo de control | texto |
| Obligatorio | no |
| Ejemplo | España, Estados Unidos, México |
| Avanza sola | no |
| Llena en el documento | `TEXTO_DESTINOS_TRAVEL` |

### ¿Qué hoteles participan?

> Si son pocos, los escribes en la siguiente pregunta.

**Por qué te preguntamos esto.** El usuario tiene que poder saber, antes de reservar, si ese hotel entra en la campaña. Si el documento no lo dice, entra cualquiera.

| | |
|---|---|
| Campo interno | `hotelesModo` |
| Paso | Productos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | todos |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_HOTELES_TRAVEL` |

**Opciones** (botones grandes, una sola):

- **Todos**: Todos los de las categorías de alojamiento que marcaste.
- **Solo algunos**: Los nombras uno por uno.
- **Los que tengan la etiqueta de la campaña**: El usuario los identifica en la app.

**Mensajes de validación:**

- `vacio`: Dinos qué hoteles participan.

### ¿Cuáles hoteles?

> Sepáralos con comas, como aparecen en la app.

**Por qué te preguntamos esto.** Los nombres salen escritos en el documento. Si falta uno, el usuario que reserve ahí no recibe el beneficio.

| | |
|---|---|
| Campo interno | `hotelesLista` |
| Paso | Productos |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Hotel Estelar Santamar, Decameron Galeón |
| Avanza sola | no |
| Llena en el documento | `TEXTO_HOTELES_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe al menos un hotel, o vuelve y elige que participan todos.

## Paso: Condiciones

### ¿Aplica solo a una aerolínea?

> Es opcional. Escríbela como aparece en la app. Por ejemplo: Avianca.

**Por qué te preguntamos esto.** Casi todas las campañas de vuelos las paga una aerolínea y aplican solo a sus vuelos. Si lo dejas vacío, aplica a cualquier aerolínea.

| | |
|---|---|
| Campo interno | `aerolinea` |
| Paso | Condiciones |
| Tipo de control | texto |
| Obligatorio | no |
| Ejemplo | Avianca |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

### ¿Solo vuelos que ella misma opere?

> Márcalo si quedan fuera los vuelos en código compartido con otra aerolínea.

**Por qué te preguntamos esto.** Una aerolínea vende vuelos que opera otra compañía. Si la campaña no los cubre y el documento no lo dice, el usuario los puede reclamar.

| | |
|---|---|
| Campo interno | `soloOperados` |
| Paso | Condiciones |
| Tipo de control | casilla |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

### ¿Qué trayectos aplican?

> Muchas campañas de aerolínea exigen ida y regreso.

**Por qué te preguntamos esto.** Si la campaña exige ida y regreso y el documento no lo dice, quien compre solo ida puede reclamar el beneficio.

| | |
|---|---|
| Campo interno | `trayecto` |
| Paso | Condiciones |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | cualquiera |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Opciones** (botones grandes, una sola):

- **Cualquiera**: Ida sola, ida y regreso, lo que sea.
- **Solo ida y regreso**: No aplica a un tiquete de ida sola.
- **Solo ida**: No aplica a un tiquete de ida y regreso.

**Mensajes de validación:**

- `vacio`: Dinos qué trayectos aplican.

### ¿Una ida y regreso cuenta como una orden?

> Es lo habitual: una compra, una orden, un beneficio.

**Por qué te preguntamos esto.** De esto depende cuántas veces se aplica el tope y cuánto consume del presupuesto una sola compra. Si el documento no lo dice, el usuario puede sostener que son dos.

| | |
|---|---|
| Campo interno | `conteoIdaRegreso` |
| Paso | Condiciones |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | una_orden |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_CONTEO_IDA_REGRESO_TRAVEL` |

**Opciones** (botones grandes, una sola):

- **Sí, cuenta como una**: El beneficio se calcula sobre el total de la compra.
- **No, cada trayecto cuenta aparte**: El beneficio se calcula sobre cada trayecto.

**Mensajes de validación:**

- `vacio`: Dinos cómo se cuenta una compra de ida y regreso.

### ¿Hay clases tarifarias excluidas?

> Es opcional. Una letra cada una, separadas por comas. Por ejemplo: A, F.

**Por qué te preguntamos esto.** Las aerolíneas excluyen sus tarifas más baratas o promocionales. Si no quedan escritas, el usuario que compre esa clase puede reclamar.

| | |
|---|---|
| Campo interno | `clasesExcluidas` |
| Paso | Condiciones |
| Tipo de control | texto |
| Obligatorio | no |
| Ejemplo | A, F |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `formato`: Cada clase tarifaria es una sola letra, separada por comas. Por ejemplo: A, F.

### ¿Solo vuelos que salgan del país?

> Márcalo si no aplica a vuelos que empiezan en el exterior.

**Por qué te preguntamos esto.** Un vuelo Madrid a Bogotá también se vende en la app. Si la campaña no lo cubre, tiene que decirlo.

| | |
|---|---|
| Campo interno | `soloOrigenPais` |
| Paso | Condiciones |
| Tipo de control | casilla |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

### ¿Hay que comprar con anticipación?

> Es opcional. Cuántos días antes del viaje. Por ejemplo: 15.

**Por qué te preguntamos esto.** Si la campaña exige comprar con anticipación y el documento no lo dice, el usuario que compre el mismo día puede reclamar el beneficio.

| | |
|---|---|
| Campo interno | `anticipacionDias` |
| Paso | Condiciones |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 15 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `rango`: Los días de anticipación van de 1 a 365.

### ¿El viaje tiene que ser desde cierta fecha?

> Es opcional, y no es lo mismo que la vigencia: es cuándo viaja, no cuándo compra.

**Por qué te preguntamos esto.** La campaña puede correr en octubre para viajes de diciembre. Son dos fechas distintas y el documento las separa.

| | |
|---|---|
| Campo interno | `periodoViajeInicio` |
| Paso | Condiciones |
| Tipo de control | fecha |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

### ¿Y hasta qué fecha?

> El último día en que se puede viajar o usar el servicio.

**Por qué te preguntamos esto.** Cierra el periodo de viaje. Sin esta fecha, el periodo queda abierto y el usuario lo puede usar cuando quiera.

| | |
|---|---|
| Campo interno | `periodoViajeFin` |
| Paso | Condiciones |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe hasta cuándo se puede viajar.
- `orden`: El periodo de viaje no puede terminar antes de empezar.

### ¿Los dos trayectos dentro de ese periodo?

> Márcalo si el regreso también tiene que caer dentro de las fechas.

**Por qué te preguntamos esto.** Sin esta regla, alguien vuela dentro del periodo y regresa meses después. Si el aliado no lo acepta, tiene que quedar escrito.

| | |
|---|---|
| Campo interno | `ambasFechasDentro` |
| Paso | Condiciones |
| Tipo de control | casilla |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

### ¿Hay fechas en las que no aplica?

> Es opcional. En formato año-mes-día, separadas por comas. Por ejemplo: 2026-12-24, 2026-12-31.

**Por qué te preguntamos esto.** Los hoteles y las rentadoras suelen excluir puentes y fin de año. Si no queda escrito, el usuario puede reclamar esas fechas.

| | |
|---|---|
| Campo interno | `fechasExcluidas` |
| Paso | Condiciones |
| Tipo de control | texto |
| Obligatorio | no |
| Ejemplo | 2026-12-24, 2026-12-31 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `formato`: Las fechas van en formato año-mes-día, separadas por comas. Por ejemplo: 2026-12-24.
- `fuera`: Las fechas excluidas tienen que estar dentro del periodo de viaje.

### ¿Hay un mínimo de noches?

> Es opcional. Por ejemplo: 2.

**Por qué te preguntamos esto.** Si el hotel exige dos noches y el documento no lo dice, quien reserve una puede reclamar el beneficio.

| | |
|---|---|
| Campo interno | `nochesMinimas` |
| Paso | Condiciones |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 2 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `rango`: El mínimo de noches va de 1 a 365.

### ¿Hay un mínimo de días de alquiler?

> Es opcional. Por ejemplo: 3.

**Por qué te preguntamos esto.** Las rentadoras suelen pedir un mínimo de días. Si no queda escrito, no se puede exigir después.

| | |
|---|---|
| Campo interno | `diasAlquilerMinimo` |
| Paso | Condiciones |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 3 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `rango`: El mínimo de días va de 1 a 365.

### ¿Y un máximo?

> El alquiler más largo que entra en la campaña. Por ejemplo: 15.

**Por qué te preguntamos esto.** Cierra el rango. Un alquiler de dos meses puede llevarse el beneficio entero si no hay tope de días.

| | |
|---|---|
| Campo interno | `diasAlquilerMaximo` |
| Paso | Condiciones |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 15 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe el máximo de días de alquiler.
- `orden`: El mínimo de días no puede ser mayor que el máximo.

### ¿Hay que gastar un mínimo para participar?

> Por ejemplo: 30.000. Si no hay mínimo, déjalo vacío.

**Por qué te preguntamos esto.** Si lo exiges, tiene que quedar escrito. Si no aparece en el documento, no lo puedes aplicar después.

| | |
|---|---|
| Campo interno | `compraMinima` |
| Paso | Participantes |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 100000 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_MINIMO_COMPRA`, `TEXTO_UMBRAL` |

**Mensajes de validación:**

- `cero`: Si no quieres exigir un mínimo, deja el campo vacío.

### sinCompraMinima

No tiene pregunta propia: se responde dentro de **compraMinima**.

### ¿El aliado pide alguna otra condición?

> Cualquier requisito que no te hayamos preguntado ya.

**Por qué te preguntamos esto.** Si el aliado exige algo que este documento no cubre, el T&C se queda corto y el usuario puede reclamar lo que no quedó escrito. En ese caso la campaña la redacta Legal.

| | |
|---|---|
| Campo interno | `otraCondicion` |
| Paso | Condiciones |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | no |
| Avanza sola | sí |

**Opciones** (botones grandes, una sola):

- **No, nada más**: Todo lo que pide el aliado ya lo respondiste.
- **Sí, pide algo más**: Te llevamos al formulario de Legal, que la redacta a mano.

**Mensajes de validación:**

- `vacio`: Dinos si el aliado pide alguna otra condición.

## Paso: Cuándo

### ¿Qué día arranca la campaña?

> Puede ser hoy. Publica los T&C antes de que arranque.

**Por qué te preguntamos esto.** Los Términos y Condiciones tienen que estar publicados antes de que la campaña empiece. Si arrancó ayer, ya no se pueden publicar a tiempo.

| | |
|---|---|
| Campo interno | `fechaInicio` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige el día en que arranca la campaña.
- `pasado`: Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro.

**Aviso:** Faltan menos de 48 horas. Alcanzas, pero publica los T&C hoy mismo.

### ¿A qué hora arranca?

> Por defecto arranca a medianoche.

**Por qué te preguntamos esto.** La hora exacta define desde cuándo un pedido cuenta para la campaña. Un pedido un minuto antes no da beneficio.

| | |
|---|---|
| Campo interno | `horaInicio` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 00:00 |
| Avanza sola | no |
| Llena en el documento | `HORA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige la hora de inicio.

### ¿Qué día termina?

> La mayoría de los cashback duran un solo día. Te la dejamos igual a la de inicio.

**Por qué te preguntamos esto.** Después de esta fecha la campaña no da beneficio. También se usa para calcular hasta cuándo sirven los Créditos.

| | |
|---|---|
| Campo interno | `fechaFin` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige el día en que termina la campaña.
- `orden`: La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.

### ¿A qué hora termina?

> Por defecto termina a las 11:59 de la noche.

**Por qué te preguntamos esto.** Define hasta qué minuto cuenta un pedido. Los pedidos posteriores se procesan como pedidos normales.

| | |
|---|---|
| Campo interno | `horaFin` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 23:59 |
| Avanza sola | no |
| Llena en el documento | `HORA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige la hora de fin.
- `orden`: La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día.

## Paso: Beneficio

### ¿El descuento es igual en todos los productos?

> Si cambia según el hotel o el vuelo, elige la segunda opción.

**Por qué te preguntamos esto.** Si el descuento cambia, el documento tiene que decir el mínimo y el máximo, y a cuántos productos llega el máximo. Anunciar solo el máximo es publicidad engañosa.

| | |
|---|---|
| Campo interno | `formaDescuento` |
| Paso | Beneficio |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | fijo |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_DESCUENTO_TRAVEL` |

**Opciones** (botones grandes, una sola):

- **Sí, es el mismo para todos**: Un solo porcentaje.
- **No, cambia según el producto**: Vas a decir el mínimo y el máximo.

**Mensajes de validación:**

- `vacio`: Dinos si el descuento es igual en todos los productos.

### ¿Qué porcentaje del pedido se devuelve en Créditos?

> Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.

**Por qué te preguntamos esto.** Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.

| | |
|---|---|
| Campo interno | `porcentaje` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 20 |
| Avanza sola | no |
| Llena en el documento | `PORCENTAJE` |

**Mensajes de validación:**

- `vacio`: Escribe el porcentaje que devuelves, sin el signo de porcentaje.
- `rango`: El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.

### ¿Cuál es el descuento más bajo?

> El porcentaje del producto con menos descuento. Por ejemplo: 5.

**Por qué te preguntamos esto.** El documento dice el rango completo. Anunciar solo el máximo hace pensar que todos los productos lo tienen, y eso la SIC lo trata como publicidad engañosa.

| | |
|---|---|
| Campo interno | `porcentajeMinimo` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 5 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_DESCUENTO_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe el descuento más bajo de la campaña.
- `rango`: El descuento más bajo tiene que ser menor que el más alto. Si son iguales, el descuento es fijo.

### ¿A cuántos productos llega el descuento máximo?

> Cuéntalos. Por ejemplo: 3 hoteles tienen el 40%.

**Por qué te preguntamos esto.** Es lo que la SIC exige para poder anunciar un "hasta". Sin ese número, el usuario no sabe qué tan real es el máximo.

| | |
|---|---|
| Campo interno | `productosConMaximo` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 3 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_MAXIMO_DISPONIBLE_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe a cuántos productos llega el descuento máximo.
- `rango`: Tiene que ser al menos un producto.

### ¿Dónde ve el usuario el descuento?

> Puedes marcar varias.

**Por qué te preguntamos esto.** El documento dice dónde encontrarlo. Si el usuario no lo ve en ninguna parte, el descuento no es verificable.

| | |
|---|---|
| Campo interno | `visibilidad` |
| Paso | Beneficio |
| Tipo de control | casillas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_VISIBILIDAD_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Marca al menos un lugar donde el usuario vea el descuento.

### ¿Cuántas órdenes puede beneficiar una persona?

> En las campañas de Travel lo más usado son 2.

**Por qué te preguntamos esto.** Sin límite, unos pocos usuarios consumen el presupuesto. Con límite, el beneficio llega a más gente.

| | |
|---|---|
| Campo interno | `limitePorUsuario` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 2 |
| Ejemplo | 2 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_LIMITE_ORDENES_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe cuántas órdenes con beneficio puede tener una persona.
- `rango`: Tiene que ser al menos una orden.

### sinLimitePorUsuario

No tiene pregunta propia: se responde dentro de **limitePorUsuario**.

### ¿La campaña termina al agotarse unas unidades?

> Cuántos productos con descuento hay. Por ejemplo: 100.

**Por qué te preguntamos esto.** Si la campaña se acaba al agotarse las unidades, el número tiene que estar en el documento. Es el mismo criterio de la SIC que aplica al descuento variable.

| | |
|---|---|
| Campo interno | `unidades` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 100 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_LIMITE_CAMPANA_TRAVEL` |

**Mensajes de validación:**

- `vacio`: Escribe cuántas unidades hay, o marca que no depende de unidades.
- `rango`: Tiene que ser al menos una unidad.

### sinUnidades

No tiene pregunta propia: se responde dentro de **unidades**.

## Paso: Participantes

### ¿Quiénes pueden participar?

> Por ejemplo: solo Pro, o quienes no compran hace 60 días.

**Por qué te preguntamos esto.** Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.

| | |
|---|---|
| Campo interno | `segmento` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_SEGMENTO` |

**Opciones** (botones grandes, una sola):

- **Todos los usuarios**: Cualquier persona mayor de edad.
- **Solo Pro y Pro Black**: Con la suscripción activa.
- **Solo usuarios nuevos**: Su primer pedido en Rappi.
- **Usuarios que no compran hace rato**: Tú dices desde cuándo.

**Mensajes de validación:**

- `vacio`: Dinos quiénes pueden participar.

### ¿Con qué medio de pago aplica el beneficio?

> Con "cualquier medio" entran tarjetas, billeteras y efectivo donde exista.

**Por qué te preguntamos esto.** Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.

| | |
|---|---|
| Campo interno | `metodoPago` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_METODO_PAGO` |

**Opciones** (botones grandes, una sola):

- **Con cualquier medio de pago**: Lo más común.
- **Con todo menos efectivo**: Tarjetas y billeteras sí, efectivo no.
- **Solo con RappiCard**: Únicamente la tarjeta de Rappi.

**Mensajes de validación:**

- `vacio`: Dinos con qué puede pagar el usuario.

## Paso: Revisar

### ¿Qué día sale la primera pieza?

> El día del primer correo, push, banner o mensaje. El T&C se publica antes.

**Por qué te preguntamos esto.** En junio de 2026 salió un mensaje de WhatsApp antes de que el T&C estuviera publicado y un usuario reclamó. Esta fecha nos deja verificar que eso no se repita.

| | |
|---|---|
| Campo interno | `fechaPrimeraComunicacion` |
| Paso | Revisar |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Escribe el día en que sale la primera comunicación.
- `pasado`: La primera comunicación no puede ser una fecha que ya pasó: el T&C se publica antes de que salga la primera pieza.

### ¿Esta campaña repite una anterior?

> Es opcional. Pega el link de promos.rappi.com de la campaña anterior.

**Por qué te preguntamos esto.** Nos deja comparar las dos y ver si alguna condición cambió sin que nadie lo notara. No sale en el documento.

| | |
|---|---|
| Campo interno | `linkAnterior` |
| Paso | Revisar |
| Tipo de control | texto |
| Obligatorio | no |
| Ejemplo | https://promos.rappi.com/colombia/... |
| Avanza sola | no |

### Confirma que el aliado aprobó la mecánica

> Confirmo que el aliado aprobó esta mecánica.

**Por qué te preguntamos esto.** El aliado es el Organizador y responde por la campaña. Si no la aprobó, no se puede publicar a su nombre.

| | |
|---|---|
| Campo interno | `aliadoAprobo` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Confirma que el aliado aprobó la mecánica.

### Confirma que las piezas dicen lo mismo que el T&C

> Confirmo que las piezas dicen lo mismo que este T&C (el porcentaje, la palabra "hasta" junto al tope y las categorías donde se usan los Créditos) y que nada sale antes de publicarlo.

**Por qué te preguntamos esto.** En agosto de 2025 una etiqueta prometía 250.000 de cashback sin la palabra "hasta" y terminó en un reclamo por publicidad engañosa que hubo que pagar.

| | |
|---|---|
| Campo interno | `declaracionPiezas` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Confirma que las piezas dicen lo mismo que el T&C.

### Confirma que la información es correcta

> Confirmo que estos datos son ciertos y son los de mi campaña.

**Por qué te preguntamos esto.** El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.

| | |
|---|---|
| Campo interno | `declaracion` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Marca la casilla para confirmar que la información es correcta.

---

# 15 minutos o Cashback

Rappi promete un tiempo de entrega en el botón Turbo de una ciudad. Si la orden llega tarde, el usuario recibe en Créditos un porcentaje de lo que pagó. No hay tienda aliada que fondee: el presupuesto lo pone Rappi.

## Filtro de entrada

Antes del formulario. Si responde **sí** a cualquiera, no se genera: se muestra
la pantalla "Esta campaña la redacta Legal" con la razón y el enlace al
formulario manual.


## Paso: Campaña

### ¿En qué país corre la campaña?

> Si tu país no aparece en la lista, todavía no está habilitado.

**Por qué te preguntamos esto.** Cada país tiene su propia entidad legal de Rappi, su moneda y su autoridad de protección al consumidor. El documento cambia completo según el país.

| | |
|---|---|
| Campo interno | `pais` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `PAIS_LEGAL`, `ENTIDAD_LEGAL` |

**Mensajes de validación:**

- `vacio`: Elige el país de la campaña.

### ¿La campaña es de Rappi o de Rappi Travel?

> Si es de vuelos, hoteles, autos o paquetes, es Rappi Travel.

**Por qué te preguntamos esto.** Son dos empresas distintas. Los domicilios los opera Rappi S.A.S. y los viajes Travel Moustache S.A.S., que es una agencia de viajes con registro de turismo. El documento entero cambia según cuál sea.

| | |
|---|---|
| Campo interno | `negocio` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | rappi |
| Avanza sola | sí |

**Opciones** (botones grandes, una sola):

- **Rappi**: Restaurantes, supermercados, farmacias y todo lo que llega a domicilio.
- **Rappi Travel**: Vuelos, hoteles, autos, paquetes, tours y asistencia al viajero.

**Mensajes de validación:**

- `vacio`: Dinos si la campaña es de Rappi o de Rappi Travel.

### ¿Qué tipo de campaña vas a hacer?

> Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.

**Por qué te preguntamos esto.** Cada tipo usa un modelo legal distinto, aprobado por Legal. Elegir mal significa generar el documento equivocado.

| | |
|---|---|
| Campo interno | `tipo` |
| Paso | Campaña |
| Tipo de control | tarjetas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |

**Mensajes de validación:**

- `vacio`: Elige el tipo de campaña.

### ¿En qué ciudades?

> Sepáralas con comas. Por ejemplo: Bogotá, Medellín, Cali.

**Por qué te preguntamos esto.** Las ciudades salen escritas tal cual en la cláusula de cobertura. Si falta una, el usuario de esa ciudad no puede reclamar.

| | |
|---|---|
| Campo interno | `ciudades` |
| Paso | Campaña |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Bogotá, Medellín, Cali |
| Avanza sola | no |
| Llena en el documento | `TEXTO_TERRITORIO` |

**Sugerencias clicables:** Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Cúcuta

**Mensajes de validación:**

- `vacio`: Escribe al menos una ciudad, o vuelve y elige cobertura nacional.

## Paso: Cuándo

### ¿Qué día arranca la campaña?

> Puede ser hoy. Publica los T&C antes de que arranque.

**Por qué te preguntamos esto.** Los Términos y Condiciones tienen que estar publicados antes de que la campaña empiece. Si arrancó ayer, ya no se pueden publicar a tiempo.

| | |
|---|---|
| Campo interno | `fechaInicio` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige el día en que arranca la campaña.
- `pasado`: Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro.

**Aviso:** Faltan menos de 48 horas. Alcanzas, pero publica los T&C hoy mismo.

### ¿A qué hora arranca?

> Por defecto arranca a medianoche.

**Por qué te preguntamos esto.** La hora exacta define desde cuándo un pedido cuenta para la campaña. Un pedido un minuto antes no da beneficio.

| | |
|---|---|
| Campo interno | `horaInicio` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 00:00 |
| Avanza sola | no |
| Llena en el documento | `HORA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige la hora de inicio.

### ¿A qué hora termina?

> Por defecto termina a las 11:59 de la noche.

**Por qué te preguntamos esto.** Define hasta qué minuto cuenta un pedido. Los pedidos posteriores se procesan como pedidos normales.

| | |
|---|---|
| Campo interno | `horaFin` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 23:59 |
| Avanza sola | no |
| Llena en el documento | `HORA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige la hora de fin.
- `orden`: La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día.

## Paso: Beneficio

### ¿En cuántos minutos prometes la entrega?

> El ETA que el usuario ve en la app al hacer la orden. Las campañas publicadas usan quince minutos.

**Por qué te preguntamos esto.** Este número es la promesa: si la orden llega después, Rappi paga el Cashback. Sale escrito en letras y en cifra en tres cláusulas del documento.

| | |
|---|---|
| Campo interno | `etaMinutos` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 15 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_ETA` |

**Mensajes de validación:**

- `vacio`: Escribe en cuántos minutos prometes la entrega.
- `rango`: El ETA tiene que estar entre 1 y 240 minutos.

### ¿Qué porcentaje del pedido se devuelve en Créditos?

> Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.

**Por qué te preguntamos esto.** Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.

| | |
|---|---|
| Campo interno | `porcentaje` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 20 |
| Avanza sola | no |
| Llena en el documento | `PORCENTAJE` |

**Mensajes de validación:**

- `vacio`: Escribe el porcentaje que devuelves, sin el signo de porcentaje.
- `rango`: El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.

### ¿Cuál es el máximo de Créditos por pedido?

> Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.

**Por qué te preguntamos esto.** Sin tope, un pedido enorme se lleva el presupuesto entero. Con tope, un cashback alto sigue siendo viable.

| | |
|---|---|
| Campo interno | `tope` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 25000 |
| Avanza sola | no |
| Llena en el documento | `TOPE` |

**Mensajes de validación:**

- `vacio`: Escribe el máximo de Créditos que recibe una persona por pedido.
- `cero`: El tope tiene que ser mayor que cero.
- `mayorQuePresupuesto`: El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.

### ¿Cuánto es el presupuesto total de la campaña?

> Cuando se acabe, la campaña termina sola. Lo habitual va de 5 a 40 millones.

**Por qué te preguntamos esto.** El documento dice que la campaña termina al agotarse el presupuesto. Es lo que te protege si el consumo se dispara.

| | |
|---|---|
| Campo interno | `presupuesto` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 20000000 |
| Avanza sola | no |
| Llena en el documento | `PRESUPUESTO` |

**Mensajes de validación:**

- `vacio`: Escribe el presupuesto total de la campaña.
- `cero`: El presupuesto tiene que ser mayor que cero.

### ¿Cuántas veces puede recibir el beneficio una persona?

> Se cuenta por persona, durante toda la campaña.

**Por qué te preguntamos esto.** Sin límite, unos pocos usuarios pueden consumir el presupuesto en horas. Con límite, el beneficio llega a más gente.

| | |
|---|---|
| Campo interno | `maxPedidos` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 1 |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_LIMITE_PEDIDOS` |

**Opciones** (botones grandes, una sola):

- **Una sola vez**: Lo más común. El segundo pedido ya no da beneficio.
- **Varias veces**: Tú dices cuántas.
- **Sin límite**: Solo lo frena el presupuesto.

**Mensajes de validación:**

- `vacio`: Dinos cuántas veces puede ganar la misma persona.
- `cuantas`: Escribe cuántos pedidos con beneficio puede hacer una persona.
- `rango`: Tiene que ser al menos un pedido.

### sinLimite

No tiene pregunta propia: se responde dentro de **maxPedidos**.

## Paso: Créditos

### ¿Cuándo le llegan los Créditos al usuario?

> Es el momento en que el saldo le queda disponible en la Billetera.

**Por qué te preguntamos esto.** El documento fija en qué momento el usuario recibe los Créditos, y eso es lo que el usuario va a esperar. Elige lo que el equipo de operaciones puede cumplir.

| | |
|---|---|
| Campo interno | `carga` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | dia_siguiente |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_CARGA`, `TEXTO_VERIFICACION` |

**Opciones** (botones grandes, una sola):

- **Al día siguiente del pedido**: Lo más usado.
- **Apenas termina el pedido**: Inmediato, sin verificación previa.
- **En una fecha específica**: Todos reciben el mismo día.

**Mensajes de validación:**

- `vacio`: Dinos cuándo le llegan los Créditos al usuario.

### ¿Qué día les cargas los Créditos?

> Tiene que ser durante la campaña o después, nunca antes.

**Por qué te preguntamos esto.** Es la fecha que el usuario va a esperar. Si no se cumple, entra un reclamo.

| | |
|---|---|
| Campo interno | `fechaCarga` |
| Paso | Créditos |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CARGA` |

**Mensajes de validación:**

- `vacio`: Elige el día de la carga.
- `antes`: La carga no puede ser antes de que arranque la campaña.

### ¿Hasta cuándo puede usar esos Créditos?

> Por ejemplo: hasta el 31 de diciembre, o 30 días desde que le llegan.

**Por qué te preguntamos esto.** Los Créditos se vencen y eso tiene que estar escrito. Si no lo dices, el usuario puede sostener que no vencen.

| | |
|---|---|
| Campo interno | `vigencia` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_VIGENCIA_CREDITOS` |

**Opciones** (botones grandes, una sola):

- **Hasta una fecha**: Todos vencen el mismo día.
- **Durante unos días**: Cuenta desde que le llegan a cada uno.

**Mensajes de validación:**

- `vacio`: Dinos hasta cuándo sirven los Créditos.

### ¿Cuántos días le duran?

> Los valores que más se usan son 5, 7 y 30 días.

**Por qué te preguntamos esto.** Se cuentan desde el día en que le llegan. Muy pocos días y el usuario no alcanza a usarlos, y eso genera reclamos.

| | |
|---|---|
| Campo interno | `diasVigencia` |
| Paso | Créditos |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 30 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_VIGENCIA_CREDITOS` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos días duran los Créditos.
- `rango`: Los días van de 1 a 365.

### ¿Qué día se vencen los Créditos?

> Tiene que ser después de que termine la campaña.

**Por qué te preguntamos esto.** Si vencen el mismo día que termina la campaña, quien compra el último día no alcanza a usarlos.

| | |
|---|---|
| Campo interno | `fechaFinRedencion` |
| Paso | Créditos |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_VIGENCIA_CREDITOS` |

**Mensajes de validación:**

- `vacio`: Elige el día en que se vencen los Créditos.
- `orden`: Los Créditos tienen que vencerse después de que termine la campaña. Si no, quien compre el último día no alcanza a usarlos.

### ¿En qué secciones NO se pueden redimir los Créditos?

> Opcional. Marca las que queden por fuera. Las campañas publicadas excluyen Rappi Travel, SOAT, Cajero ATM y Rappi Favor.

**Por qué te preguntamos esto.** El documento dice dónde se puede gastar el saldo. Una sección que no esté excluida aquí queda habilitada, y después no se puede cerrar.

| | |
|---|---|
| Campo interno | `exclusionesEta` |
| Paso | Créditos |
| Tipo de control | casillas |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_LUGAR_REDENCION` |

**Opciones** (casillas, se pueden marcar varias):

- **Rappi Travel**: Vuelos, hoteles, autos y paquetes.
- **Seguro Soat**: El seguro obligatorio de vehículos.
- **Cajero ATM**: El retiro de efectivo.
- **Rappi Favor**: Los mandados y diligencias.

**Mensajes de validación:**

- `vacio`: Marca las secciones excluidas, o sigue sin marcar ninguna.

## Paso: Participantes

### ¿Con qué medio de pago aplica el beneficio?

> Con "cualquier medio" entran tarjetas, billeteras y efectivo donde exista.

**Por qué te preguntamos esto.** Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.

| | |
|---|---|
| Campo interno | `metodoPago` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_METODO_PAGO` |

**Opciones** (botones grandes, una sola):

- **Con cualquier medio de pago**: Lo más común.
- **Con todo menos efectivo**: Tarjetas y billeteras sí, efectivo no.
- **Solo con RappiCard**: Únicamente la tarjeta de Rappi.

**Mensajes de validación:**

- `vacio`: Dinos con qué puede pagar el usuario.

## Paso: Revisar

### Confirma que la información es correcta

> Confirmo que estos datos son ciertos y son los de mi campaña.

**Por qué te preguntamos esto.** El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.

| | |
|---|---|
| Campo interno | `declaracion` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Marca la casilla para confirmar que la información es correcta.

---

# Promoção Brasil

Descuento en porcentaje, envío gratis o tarifa de servicio gratis en una tienda aliada de Brasil. El usuario ve el beneficio aplicado al pagar, no recibe Créditos. Solo para Brasil.

## Filtro de entrada

Antes del formulario. Si responde **sí** a cualquiera, no se genera: se muestra
la pantalla "Esta campaña la redacta Legal" con la razón y el enlace al
formulario manual.


## Paso: Campaña

### ¿En qué país corre la campaña?

> Si tu país no aparece en la lista, todavía no está habilitado.

**Por qué te preguntamos esto.** Cada país tiene su propia entidad legal de Rappi, su moneda y su autoridad de protección al consumidor. El documento cambia completo según el país.

| | |
|---|---|
| Campo interno | `pais` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `PAIS_LEGAL`, `ENTIDAD_LEGAL` |

**Mensajes de validación:**

- `vacio`: Elige el país de la campaña.

### ¿La campaña es de Rappi o de Rappi Travel?

> Si es de vuelos, hoteles, autos o paquetes, es Rappi Travel.

**Por qué te preguntamos esto.** Son dos empresas distintas. Los domicilios los opera Rappi S.A.S. y los viajes Travel Moustache S.A.S., que es una agencia de viajes con registro de turismo. El documento entero cambia según cuál sea.

| | |
|---|---|
| Campo interno | `negocio` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | rappi |
| Avanza sola | sí |

**Opciones** (botones grandes, una sola):

- **Rappi**: Restaurantes, supermercados, farmacias y todo lo que llega a domicilio.
- **Rappi Travel**: Vuelos, hoteles, autos, paquetes, tours y asistencia al viajero.

**Mensajes de validación:**

- `vacio`: Dinos si la campaña es de Rappi o de Rappi Travel.

### ¿Qué tipo de campaña vas a hacer?

> Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.

**Por qué te preguntamos esto.** Cada tipo usa un modelo legal distinto, aprobado por Legal. Elegir mal significa generar el documento equivocado.

| | |
|---|---|
| Campo interno | `tipo` |
| Paso | Campaña |
| Tipo de control | tarjetas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |

**Mensajes de validación:**

- `vacio`: Elige el tipo de campaña.

### ¿En qué tienda aplica?

> La marca comercial como aparece en la app. Por ejemplo: Pollo Dorado.

**Por qué te preguntamos esto.** El documento nombra la tienda y la define como Tienda Participante. Si el nombre no coincide con el de la app, el usuario no la encuentra.

| | |
|---|---|
| Campo interno | `tienda` |
| Paso | Campaña |
| Tipo de control | texto |
| Obligatorio | sí, cuando se ve |
| Ejemplo | Pollo Dorado |
| Avanza sola | no |
| Llena en el documento | `TIENDA` |

**Mensajes de validación:**

- `vacio`: Escribe la tienda donde aplica la campaña.

## Paso: Cuándo

### ¿Qué día arranca la campaña?

> Puede ser hoy. Publica los T&C antes de que arranque.

**Por qué te preguntamos esto.** Los Términos y Condiciones tienen que estar publicados antes de que la campaña empiece. Si arrancó ayer, ya no se pueden publicar a tiempo.

| | |
|---|---|
| Campo interno | `fechaInicio` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige el día en que arranca la campaña.
- `pasado`: Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro.

**Aviso:** Faltan menos de 48 horas. Alcanzas, pero publica los T&C hoy mismo.

### ¿A qué hora arranca?

> Por defecto arranca a medianoche.

**Por qué te preguntamos esto.** La hora exacta define desde cuándo un pedido cuenta para la campaña. Un pedido un minuto antes no da beneficio.

| | |
|---|---|
| Campo interno | `horaInicio` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 00:00 |
| Avanza sola | no |
| Llena en el documento | `HORA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige la hora de inicio.

### ¿Qué día termina?

> La mayoría de los cashback duran un solo día. Te la dejamos igual a la de inicio.

**Por qué te preguntamos esto.** Después de esta fecha la campaña no da beneficio. También se usa para calcular hasta cuándo sirven los Créditos.

| | |
|---|---|
| Campo interno | `fechaFin` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige el día en que termina la campaña.
- `orden`: La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.

### ¿A qué hora termina?

> Por defecto termina a las 11:59 de la noche.

**Por qué te preguntamos esto.** Define hasta qué minuto cuenta un pedido. Los pedidos posteriores se procesan como pedidos normales.

| | |
|---|---|
| Campo interno | `horaFin` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 23:59 |
| Avanza sola | no |
| Llena en el documento | `HORA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige la hora de fin.
- `orden`: La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día.

## Paso: Beneficio

### ¿Qué recibe el usuario?

> Las cuatro formas que Legal Brasil tiene aprobadas. Cada una cambia una sola frase del documento.

**Por qué te preguntamos esto.** De aquí salen el párrafo de apertura y la viñeta que describe el beneficio. Es lo único que distingue los cuatro modelos aprobados entre sí.

| | |
|---|---|
| Campo interno | `beneficioBr` |
| Paso | Beneficio |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_BENEFICIO_APERTURA`, `TEXTO_BENEFICIO_REGRA` |

**Opciones** (botones grandes, una sola):

- **Desconto % OFF**: Un porcentaje de descuento sobre el pedido, con tope en reales.
- **Frete grátis**: El envío sin costo, hasta el tope que definas.
- **Taxa de serviço grátis**: La tarifa de servicio sin costo. Los documentos aprobados no le ponen tope.
- **Taxa de serviço e frete grátis**: Las dos cosas juntas. Es la única que los documentos aprobados usan sin mínimo de compra.

**Mensajes de validación:**

- `vacio`: Elige qué recibe el usuario.

### ¿Qué porcentaje del pedido se devuelve en Créditos?

> Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.

**Por qué te preguntamos esto.** Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.

| | |
|---|---|
| Campo interno | `porcentaje` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 20 |
| Avanza sola | no |
| Llena en el documento | `PORCENTAJE` |

**Mensajes de validación:**

- `vacio`: Escribe el porcentaje que devuelves, sin el signo de porcentaje.
- `rango`: El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.

### ¿Cuál es el máximo de Créditos por pedido?

> Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.

**Por qué te preguntamos esto.** Sin tope, un pedido enorme se lleva el presupuesto entero. Con tope, un cashback alto sigue siendo viable.

| | |
|---|---|
| Campo interno | `tope` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 25000 |
| Avanza sola | no |
| Llena en el documento | `TOPE` |

**Mensajes de validación:**

- `vacio`: Escribe el máximo de Créditos que recibe una persona por pedido.
- `cero`: El tope tiene que ser mayor que cero.
- `mayorQuePresupuesto`: El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.

### ¿Cuántas veces puede recibir el beneficio una persona?

> Se cuenta por persona, durante toda la campaña.

**Por qué te preguntamos esto.** Sin límite, unos pocos usuarios pueden consumir el presupuesto en horas. Con límite, el beneficio llega a más gente.

| | |
|---|---|
| Campo interno | `maxPedidos` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 1 |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_LIMITE_PEDIDOS` |

**Opciones** (botones grandes, una sola):

- **Una sola vez**: Lo más común. El segundo pedido ya no da beneficio.
- **Varias veces**: Tú dices cuántas.
- **Sin límite**: Solo lo frena el presupuesto.

**Mensajes de validación:**

- `vacio`: Dinos cuántas veces puede ganar la misma persona.
- `cuantas`: Escribe cuántos pedidos con beneficio puede hacer una persona.
- `rango`: Tiene que ser al menos un pedido.

### sinLimite

No tiene pregunta propia: se responde dentro de **maxPedidos**.

### ¿Con qué medios se puede pagar?

> Marca todos los que apliquen. Los cuatro documentos aprobados los enumeran uno por uno.

**Por qué te preguntamos esto.** El documento lista los medios de pago válidos con su nombre. Un medio que no esté en la lista no da derecho al beneficio.

| | |
|---|---|
| Campo interno | `metodosPagoBr` |
| Paso | Beneficio |
| Tipo de control | casillas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_METODO_PAGO` |

**Opciones** (casillas, se pueden marcar varias):

- **Dinheiro**: Efectivo.
- **Paypal**: La cuenta de PayPal del usuario.
- **RappiPay**: El medio de pago propio de Rappi.
- **Cartão de crédito Visa**: Tarjeta de crédito Visa.
- **Cartão de crédito Mastercard**: Tarjeta de crédito Mastercard.
- **Voucher Refeição**: Vale de comida.

**Mensajes de validación:**

- `vacio`: Marca al menos un medio de pago.

## Paso: Participantes

### ¿Hay que gastar un mínimo para participar?

> Por ejemplo: 30.000. Si no hay mínimo, déjalo vacío.

**Por qué te preguntamos esto.** Si lo exiges, tiene que quedar escrito. Si no aparece en el documento, no lo puedes aplicar después.

| | |
|---|---|
| Campo interno | `compraMinima` |
| Paso | Participantes |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 100000 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_MINIMO_COMPRA`, `TEXTO_UMBRAL` |

**Mensajes de validación:**

- `cero`: Si no quieres exigir un mínimo, deja el campo vacío.

## Paso: Revisar

### Confirma que la información es correcta

> Confirmo que estos datos son ciertos y son los de mi campaña.

**Por qué te preguntamos esto.** El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.

| | |
|---|---|
| Campo interno | `declaracion` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Marca la casilla para confirmar que la información es correcta.

---

# Cashback Multitienda

Varias tiendas hacen cashback dentro de una misma jornada comercial. Cada tienda pone su porcentaje, su tope y su presupuesto, y cada una organiza lo suyo.

## Filtro de entrada

Antes del formulario. Si responde **sí** a cualquiera, no se genera: se muestra
la pantalla "Esta campaña la redacta Legal" con la razón y el enlace al
formulario manual.

- ¿Alguna tienda exige sus propios términos y condiciones?

## Paso: Campaña

### ¿En qué país corre la campaña?

> Si tu país no aparece en la lista, todavía no está habilitado.

**Por qué te preguntamos esto.** Cada país tiene su propia entidad legal de Rappi, su moneda y su autoridad de protección al consumidor. El documento cambia completo según el país.

| | |
|---|---|
| Campo interno | `pais` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `PAIS_LEGAL`, `ENTIDAD_LEGAL` |

**Mensajes de validación:**

- `vacio`: Elige el país de la campaña.

### ¿La campaña es de Rappi o de Rappi Travel?

> Si es de vuelos, hoteles, autos o paquetes, es Rappi Travel.

**Por qué te preguntamos esto.** Son dos empresas distintas. Los domicilios los opera Rappi S.A.S. y los viajes Travel Moustache S.A.S., que es una agencia de viajes con registro de turismo. El documento entero cambia según cuál sea.

| | |
|---|---|
| Campo interno | `negocio` |
| Paso | Campaña |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | rappi |
| Avanza sola | sí |

**Opciones** (botones grandes, una sola):

- **Rappi**: Restaurantes, supermercados, farmacias y todo lo que llega a domicilio.
- **Rappi Travel**: Vuelos, hoteles, autos, paquetes, tours y asistencia al viajero.

**Mensajes de validación:**

- `vacio`: Dinos si la campaña es de Rappi o de Rappi Travel.

### ¿Qué tipo de campaña vas a hacer?

> Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.

**Por qué te preguntamos esto.** Cada tipo usa un modelo legal distinto, aprobado por Legal. Elegir mal significa generar el documento equivocado.

| | |
|---|---|
| Campo interno | `tipo` |
| Paso | Campaña |
| Tipo de control | tarjetas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |

**Mensajes de validación:**

- `vacio`: Elige el tipo de campaña.

## Paso: Cuándo

### ¿Qué día arranca la campaña?

> Puede ser hoy. Publica los T&C antes de que arranque.

**Por qué te preguntamos esto.** Los Términos y Condiciones tienen que estar publicados antes de que la campaña empiece. Si arrancó ayer, ya no se pueden publicar a tiempo.

| | |
|---|---|
| Campo interno | `fechaInicio` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige el día en que arranca la campaña.
- `pasado`: Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro.

**Aviso:** Faltan menos de 48 horas. Alcanzas, pero publica los T&C hoy mismo.

### ¿A qué hora arranca?

> Por defecto arranca a medianoche.

**Por qué te preguntamos esto.** La hora exacta define desde cuándo un pedido cuenta para la campaña. Un pedido un minuto antes no da beneficio.

| | |
|---|---|
| Campo interno | `horaInicio` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 00:00 |
| Avanza sola | no |
| Llena en el documento | `HORA_INICIO` |

**Mensajes de validación:**

- `vacio`: Elige la hora de inicio.

### ¿Qué día termina?

> La mayoría de los cashback duran un solo día. Te la dejamos igual a la de inicio.

**Por qué te preguntamos esto.** Después de esta fecha la campaña no da beneficio. También se usa para calcular hasta cuándo sirven los Créditos.

| | |
|---|---|
| Campo interno | `fechaFin` |
| Paso | Cuándo |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `FECHA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige el día en que termina la campaña.
- `orden`: La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.

### ¿A qué hora termina?

> Por defecto termina a las 11:59 de la noche.

**Por qué te preguntamos esto.** Define hasta qué minuto cuenta un pedido. Los pedidos posteriores se procesan como pedidos normales.

| | |
|---|---|
| Campo interno | `horaFin` |
| Paso | Cuándo |
| Tipo de control | hora |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 23:59 |
| Avanza sola | no |
| Llena en el documento | `HORA_FIN` |

**Mensajes de validación:**

- `vacio`: Elige la hora de fin.
- `orden`: La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día.

## Paso: Beneficio

### ¿Qué porcentaje del pedido se devuelve en Créditos?

> Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.

**Por qué te preguntamos esto.** Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.

| | |
|---|---|
| Campo interno | `porcentaje` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 20 |
| Avanza sola | no |
| Llena en el documento | `PORCENTAJE` |

**Mensajes de validación:**

- `vacio`: Escribe el porcentaje que devuelves, sin el signo de porcentaje.
- `rango`: El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.

### ¿Cuál es el máximo de Créditos por pedido?

> Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.

**Por qué te preguntamos esto.** Sin tope, un pedido enorme se lleva el presupuesto entero. Con tope, un cashback alto sigue siendo viable.

| | |
|---|---|
| Campo interno | `tope` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 25000 |
| Avanza sola | no |
| Llena en el documento | `TOPE` |

**Mensajes de validación:**

- `vacio`: Escribe el máximo de Créditos que recibe una persona por pedido.
- `cero`: El tope tiene que ser mayor que cero.
- `mayorQuePresupuesto`: El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.

### ¿Cuántas veces puede recibir el beneficio una persona?

> Se cuenta por persona, durante toda la campaña.

**Por qué te preguntamos esto.** Sin límite, unos pocos usuarios pueden consumir el presupuesto en horas. Con límite, el beneficio llega a más gente.

| | |
|---|---|
| Campo interno | `maxPedidos` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | 1 |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_LIMITE_PEDIDOS` |

**Opciones** (botones grandes, una sola):

- **Una sola vez**: Lo más común. El segundo pedido ya no da beneficio.
- **Varias veces**: Tú dices cuántas.
- **Sin límite**: Solo lo frena el presupuesto.

**Mensajes de validación:**

- `vacio`: Dinos cuántas veces puede ganar la misma persona.
- `cuantas`: Escribe cuántos pedidos con beneficio puede hacer una persona.
- `rango`: Tiene que ser al menos un pedido.

### sinLimite

No tiene pregunta propia: se responde dentro de **maxPedidos**.

## Paso: Créditos

### ¿Cuándo le llegan los Créditos al usuario?

> Es el momento en que el saldo le queda disponible en la Billetera.

**Por qué te preguntamos esto.** El documento fija en qué momento el usuario recibe los Créditos, y eso es lo que el usuario va a esperar. Elige lo que el equipo de operaciones puede cumplir.

| | |
|---|---|
| Campo interno | `carga` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | dia_siguiente |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_CARGA`, `TEXTO_VERIFICACION` |

**Opciones** (botones grandes, una sola):

- **Al día siguiente del pedido**: Lo más usado.
- **Apenas termina el pedido**: Inmediato, sin verificación previa.
- **En una fecha específica**: Todos reciben el mismo día.

**Mensajes de validación:**

- `vacio`: Dinos cuándo le llegan los Créditos al usuario.

### ¿Qué día les cargas los Créditos?

> Tiene que ser durante la campaña o después, nunca antes.

**Por qué te preguntamos esto.** Es la fecha que el usuario va a esperar. Si no se cumple, entra un reclamo.

| | |
|---|---|
| Campo interno | `fechaCarga` |
| Paso | Créditos |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CARGA` |

**Mensajes de validación:**

- `vacio`: Elige el día de la carga.
- `antes`: La carga no puede ser antes de que arranque la campaña.

### ¿Hasta cuándo puede usar esos Créditos?

> Por ejemplo: hasta el 31 de diciembre, o 30 días desde que le llegan.

**Por qué te preguntamos esto.** Los Créditos se vencen y eso tiene que estar escrito. Si no lo dices, el usuario puede sostener que no vencen.

| | |
|---|---|
| Campo interno | `vigencia` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_VIGENCIA_CREDITOS` |

**Opciones** (botones grandes, una sola):

- **Hasta una fecha**: Todos vencen el mismo día.
- **Durante unos días**: Cuenta desde que le llegan a cada uno.

**Mensajes de validación:**

- `vacio`: Dinos hasta cuándo sirven los Créditos.

### ¿Cuántos días le duran?

> Los valores que más se usan son 5, 7 y 30 días.

**Por qué te preguntamos esto.** Se cuentan desde el día en que le llegan. Muy pocos días y el usuario no alcanza a usarlos, y eso genera reclamos.

| | |
|---|---|
| Campo interno | `diasVigencia` |
| Paso | Créditos |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 30 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_VIGENCIA_CREDITOS` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos días duran los Créditos.
- `rango`: Los días van de 1 a 365.

### ¿Qué día se vencen los Créditos?

> Tiene que ser después de que termine la campaña.

**Por qué te preguntamos esto.** Si vencen el mismo día que termina la campaña, quien compra el último día no alcanza a usarlos.

| | |
|---|---|
| Campo interno | `fechaFinRedencion` |
| Paso | Créditos |
| Tipo de control | fecha |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_VIGENCIA_CREDITOS` |

**Mensajes de validación:**

- `vacio`: Elige el día en que se vencen los Créditos.
- `orden`: Los Créditos tienen que vencerse después de que termine la campaña. Si no, quien compre el último día no alcanza a usarlos.

### ¿Dónde puede gastar los Créditos?

> Por ejemplo: solo en la tienda donde se los ganó, que es lo más común.

**Por qué te preguntamos esto.** Define dónde vale el saldo. Lo normal es que se gaste en la misma tienda donde el usuario se ganó el beneficio. En todo caso, estos Créditos casi nunca aplican a RappiFavor, Cajero ATM ni Rappi Travel.

| | |
|---|---|
| Campo interno | `redencion` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_LUGAR_REDENCION` |

**Opciones** (botones grandes, una sola):

- **Solo en esta tienda**: Vuelve a comprar donde ganó el beneficio.
- **En ciertas secciones de Rappi**: Tú eliges cuáles.
- **En cualquier parte de Rappi**: Donde sea que se acepten Créditos.

**Mensajes de validación:**

- `vacio`: Dinos dónde puede gastar los Créditos.

### ¿En qué secciones?

> Puedes marcar varias.

**Por qué te preguntamos esto.** Los nombres salen escritos entre comillas en el documento, así que tienen que coincidir con los de la app.

| | |
|---|---|
| Campo interno | `secciones` |
| Paso | Créditos |
| Tipo de control | casillas |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TEXTO_LUGAR_REDENCION` |

**Mensajes de validación:**

- `vacio`: Marca al menos una sección.

### ¿En qué secciones NO se pueden redimir los Créditos?

> Vienen marcadas las de siempre. Desmarca una solo si esa campaña sí la permite.

**Por qué te preguntamos esto.** El documento tiene que decir dónde no vale el saldo. Una sección que no esté excluida aquí queda prometida, y después no se puede cerrar: el usuario reclama con el T&C en la mano.

| | |
|---|---|
| Campo interno | `exclusionesRedencion` |
| Paso | Créditos |
| Tipo de control | casillas |
| Obligatorio | no |
| Valor por defecto | travel,soat,atm,favor |
| Avanza sola | no |
| Llena en el documento | `TEXTO_LUGAR_REDENCION` |

**Mensajes de validación:**

- `vacio`: Marca las secciones excluidas, o sigue sin marcar ninguna.

## Paso: Tiendas

### ¿Qué tiendas participan?

> Mínimo dos. Cada una entra con su razón social, su NIT y su presupuesto.

**Por qué te preguntamos esto.** En un Cashback Multitienda cada tienda organiza su propio beneficio y responde por él. Por eso cada una necesita sus propios datos.

| | |
|---|---|
| Campo interno | `tiendas` |
| Paso | Tiendas |
| Tipo de control | repetible |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |
| Llena en el documento | `TIENDA_MARCA`, `TIENDA_RAZON_SOCIAL`, `TIENDA_ID`, `TIENDA_CIUDADES`, `TIENDA_PRESUPUESTO` |

**Mensajes de validación:**

- `minimo`: Agrega al menos 2 tiendas participantes.
- `maximo`: No puedes agregar más de 60 tiendas.
- `repetida`: Esa identificación ya está en otra tienda de la lista.

**Campos de cada fila:**

- **Marca**: Como aparece en la app. Ejemplo: Beer Station
- **Razón social**: Como aparece en el RUT. Ejemplo: Cervecerías del Sur S.A.S.
- **NIT**: Con dígito de verificación. Ejemplo: 900.777.888-2
- **Ciudades**: Separadas por comas, o marca cobertura nacional. Ejemplo: Bogotá, Medellín
- **Cobertura nacional**: Marca esto y no necesitas escribir ciudades.
- **Presupuesto**: De esta tienda, no el total. Ejemplo: 5000000
- **¿En cuál de sus tiendas?**: La normal, la de Turbo, o las dos.

## Paso: Participantes

### ¿Quiénes pueden participar?

> Por ejemplo: solo Pro, o quienes no compran hace 60 días.

**Por qué te preguntamos esto.** Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.

| | |
|---|---|
| Campo interno | `segmento` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_SEGMENTO` |

**Opciones** (botones grandes, una sola):

- **Todos los usuarios**: Cualquier persona mayor de edad.
- **Solo Pro y Pro Black**: Con la suscripción activa.
- **Solo usuarios nuevos**: Su primer pedido en Rappi.
- **Usuarios que no compran hace rato**: Tú dices desde cuándo.

**Mensajes de validación:**

- `vacio`: Dinos quiénes pueden participar.

### ¿Cuántos días sin comprar?

> Se cuentan hacia atrás desde que arranca la campaña. Por ejemplo: 60.

**Por qué te preguntamos esto.** Define exactamente a quién le llega. El documento lo dice en letras y en número, para que no haya discusión.

| | |
|---|---|
| Campo interno | `diasSinCompra` |
| Paso | Participantes |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 60 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_SEGMENTO` |

**Mensajes de validación:**

- `vacio`: Escribe cuántos días sin comprar.
- `rango`: Los días van de 1 a 365.

### ¿Con qué medio de pago aplica el beneficio?

> Con "cualquier medio" entran tarjetas, billeteras y efectivo donde exista.

**Por qué te preguntamos esto.** Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.

| | |
|---|---|
| Campo interno | `metodoPago` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_METODO_PAGO` |

**Opciones** (botones grandes, una sola):

- **Con cualquier medio de pago**: Lo más común.
- **Con todo menos efectivo**: Tarjetas y billeteras sí, efectivo no.
- **Solo con RappiCard**: Únicamente la tarjeta de Rappi.

**Mensajes de validación:**

- `vacio`: Dinos con qué puede pagar el usuario.

### ¿Hay que gastar un mínimo para participar?

> Por ejemplo: 30.000. Si no hay mínimo, déjalo vacío.

**Por qué te preguntamos esto.** Si lo exiges, tiene que quedar escrito. Si no aparece en el documento, no lo puedes aplicar después.

| | |
|---|---|
| Campo interno | `compraMinima` |
| Paso | Participantes |
| Tipo de control | numero |
| Obligatorio | no |
| Ejemplo | 100000 |
| Avanza sola | no |
| Llena en el documento | `TEXTO_MINIMO_COMPRA`, `TEXTO_UMBRAL` |

**Mensajes de validación:**

- `cero`: Si no quieres exigir un mínimo, deja el campo vacío.

## Paso: Pieza

### ¿Qué categoría tiene el producto de la pieza?

> Casi siempre es Ninguna. Solo cambia la leyenda del arte, no tu T&C.

**Por qué te preguntamos esto.** Algunas categorías tienen que llevar una advertencia por ley dentro de la pieza, como los licores o los medicamentos. La leyenda que te damos ya la trae.

| | |
|---|---|
| Campo interno | `categoriaProducto` |
| Paso | Pieza |
| Tipo de control | lista |
| Obligatorio | no |
| Valor por defecto | ninguna |
| Avanza sola | sí |

**Mensajes de validación:**

- `vacio`: Elige una categoría, o Ninguna si el producto no es de ninguna de esas.
- `prohibida`: No se hacen campañas de cashback, descuento ni concursos sobre medicamentos, productos fitoterapéuticos, cigarrillos, tabaco calentado (como IQOS), vapeadores ni otros productos con nicotina. Esta campaña no se puede hacer. Si tienes dudas, escríbenos a #tyc-rappi.

## Paso: Revisar

### Confirma que la información es correcta

> Confirmo que estos datos son ciertos y son los de mi campaña.

**Por qué te preguntamos esto.** El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.

| | |
|---|---|
| Campo interno | `declaracion` |
| Paso | Revisar |
| Tipo de control | casilla |
| Obligatorio | sí, cuando se ve |
| Avanza sola | no |

**Mensajes de validación:**

- `vacio`: Marca la casilla para confirmar que la información es correcta.

---

## Los espacios en blanco del documento

Mientras falta un dato, la vista previa muestra un espacio gris con el nombre de
la pregunta que lo llena. Estos son los nombres:

| En el modelo | Dice en pantalla |
|---|---|
| `TEXTO_TIENDA_TURBO` | en cuál de sus tiendas se gana el cashback |
| `TEXTO_EXCLUSION_SALUD` | la exclusión de medicamentos y productos con nicotina |
| `TIENDA_TURBO` | en cuál de sus tiendas participa cada marca |
| `TEXTO_ETA` | el tiempo de entrega prometido |
| `TEXTO_CIUDAD_ETA` | la ciudad |
| `TEXTO_LIMITE_ORDENES` | el máximo de órdenes por persona |
| `MODALIDAD_TURBO` | la modalidad del botón turbo |
| `URL_TC_TURBO` | el enlace de los términos del botón turbo |
| `ID_FISCAL` | la identificación de la empresa |
| `DOMICILIO_LEGAL` | el domicilio de la empresa |
| `PAIS_LEGAL` | el país |
| `TEXTO_MINIMO_APERTURA` | el mínimo de compra |
| `TEXTO_BENEFICIO_APERTURA` | qué recibe el usuario, con su porcentaje si es desconto |
| `TEXTO_BENEFICIO_REGRA` | la regla del beneficio |
| `TEXTO_TOPE_BENEFICIO` | el tope del beneficio |
| `PARCEIRO` | el parceiro |
| `TEXTO_PRODUCTOS_TRAVEL` | las categorías que participan |
| `TEXTO_AMBITO_TRAVEL` | si los viajes son nacionales o internacionales |
| `TEXTO_DESTINOS_TRAVEL` | los destinos |
| `TEXTO_HOTELES_TRAVEL` | qué hoteles participan |
| `TEXTO_CONDICIONES_TRAVEL` | las condiciones de la compra |
| `TEXTO_SEGMENTO_TRAVEL` | quiénes pueden participar |
| `TEXTO_METODO_PAGO_TRAVEL` | los medios de pago |
| `TEXTO_BENEFICIO_TRAVEL` | en qué consiste el cashback |
| `TEXTO_BASE_CALCULO_TRAVEL` | sobre qué valor se calcula el cashback |
| `TEXTO_EJEMPLO_TOPE_TRAVEL` | el ejemplo del tope |
| `TEXTO_LIMITE_ORDENES_TRAVEL` | cuántas órdenes puede beneficiar una persona |
| `TEXTO_AGOTAMIENTO_VIGENCIA_TRAVEL` | el presupuesto o las unidades que agotan la campaña |
| `TEXTO_LIMITE_CAMPANA_TRAVEL` | el límite total de la campaña |
| `TEXTO_CONTEO_IDA_REGRESO_TRAVEL` | cómo cuenta una compra de ida y regreso |
| `TEXTO_CARGA_TRAVEL` | cuándo llegan los Créditos |
| `TEXTO_VERIFICACION_TRAVEL` | cómo se verifica la elegibilidad de la orden |
| `TEXTO_REDENCION_TRAVEL` | dónde se pueden usar los Créditos |
| `TEXTO_DESCUENTO_TRAVEL` | en qué consiste el descuento |
| `TEXTO_SEGUN_PRODUCTO_TRAVEL` | si el descuento cambia según el producto |
| `TEXTO_MAXIMO_DISPONIBLE_TRAVEL` | a cuántos productos llega el descuento máximo |
| `TEXTO_VISIBILIDAD_TRAVEL` | dónde ve el usuario el descuento |
| `TEXTO_ASISTENCIA_TRAVEL` | el alcance del descuento de la asistencia |
| `TEXTO_CREDITOS_FUERA_DE_TRAVEL` | el uso de los Créditos fuera de los viajes |
| `TEXTO_NOTAS_DE_MODIFICACION` | las modificaciones de la campaña |
| `TEXTO_RESPONSABILIDAD_TRAVEL` | de qué responde la entidad de viajes |
| `TEXTO_YA_OTORGADO_TRAVEL` | lo que ya se otorgó |
| `VERBO_BENEFICIO_TRAVEL` | qué se hace con el beneficio |
| `ENTIDAD_TRAVEL` | la razón social de la entidad de viajes |
| `ID_FISCAL_TRAVEL` | el NIT de la entidad de viajes |
| `RNT_TRAVEL` | el número del registro nacional de turismo |
| `URL_SITIO_TRAVEL` | el sitio de viajes |
| `URL_TC_TRAVEL` | los términos de los sistemas de viajes |
| `POLITICA_PRIVACIDAD_TRAVEL` | la política de datos de la entidad de viajes |
| `URL_PRIVACIDAD_TRAVEL` | el enlace de la política de datos de la entidad de viajes |
| `ENTIDAD_VIGILANCIA_TRAVEL` | la entidad de vigilancia de los viajes |
| `TOPE_TRAVEL` | el tope por orden |
| `NOMBRE_CAMPANA` | el nombre, que sale de la tienda o la marca, el porcentaje y el día de inicio |
| `NOMBRE_CAMPANA_MAYUS` | el nombre, que sale de la tienda o la marca, el porcentaje y el día de inicio |
| `TIENDA` | la tienda |
| `TEXTO_TERRITORIO` | dónde aplica |
| `FECHA_INICIO` | el día de inicio |
| `HORA_INICIO` | la hora de inicio |
| `FECHA_FIN` | el día de fin |
| `HORA_FIN` | la hora de fin |
| `ORGANIZADOR` | la empresa que paga |
| `ID_ORGANIZADOR` | el NIT de esa empresa |
| `TEXTO_SEGMENTO` | quiénes participan |
| `TEXTO_METODO_PAGO` | con qué puede pagar |
| `TEXTO_MINIMO_COMPRA` | la compra mínima |
| `TEXTO_LIMITE_PEDIDOS` | cuántas veces puede ganar |
| `TEXTO_CONDICIONES` | las condiciones especiales |
| `PORCENTAJE` | el porcentaje |
| `TOPE` | el tope por pedido |
| `PRESUPUESTO` | el presupuesto |
| `TEXTO_CARGA` | cuándo llegan los Créditos |
| `TEXTO_VERIFICACION` | cómo se verifica la elegibilidad del pedido |
| `TEXTO_VIGENCIA_CREDITOS` | hasta cuándo sirven |
| `TEXTO_LUGAR_REDENCION` | dónde se gastan |
| `TEXTO_PRODUCTOS` | qué productos participan |
| `CRITERIO_GANADOR` | cómo se define el ganador |
| `FRASE_GANADORES` | cuántas personas ganan |
| `TEXTO_DESEMPATE` | quién gana si hay empate |
| `LISTA_PREMIOS` | el premio |
| `TEXTO_NATURALEZA_PREMIO` | el tipo de premio |
| `TEXTO_ENTREGA` | quién entrega el premio |
| `TEXTO_DATOS_ENTREGA` | los datos para la entrega |
| `MEDIO_NOTIFICACION` | cómo le avisas al ganador |
| `FECHA_NOTIFICACION` | el día del aviso |
| `PLAZO_CONFIRMACION` | el plazo para responder |
| `TEXTO_UMBRAL` | la compra mínima |
| `TIENDA_MARCA` | la marca de la tienda |
| `TIENDA_RAZON_SOCIAL` | la razón social |
| `TIENDA_ID` | el NIT |
| `TIENDA_CIUDADES` | las ciudades |
| `TIENDA_PRESUPUESTO` | el presupuesto |
