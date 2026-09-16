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

- ¿La tienda o la marca exige sus propios términos y condiciones?

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

> Nacional es todo el país. Si es solo en algunas ciudades, las escribes en el siguiente paso.

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
- **Solo en algunas ciudades**: Las escribes tú en el siguiente paso.

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

> Es el Organizador: la tienda o la marca que pone la plata. Nunca es Rappi. Escribe la razón social como aparece en su RUT.

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

> Con el dígito de verificación, por ejemplo 900.111.222-1. Está en el RUT del aliado; pídeselo a tu contacto.

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

## Paso: Beneficio

### ¿Qué porcentaje del pedido devuelves en Créditos?

> Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.

**Por qué te preguntamos esto.** Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.

| | |
|---|---|
| Campo interno | `porcentaje` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 99 |
| Avanza sola | no |
| Llena en el documento | `PORCENTAJE` |

**Mensajes de validación:**

- `vacio`: Escribe el porcentaje que devuelves, sin el signo de porcentaje.
- `rango`: El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.

### ¿Qué es lo máximo que recibe alguien por pedido?

> Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.

**Por qué te preguntamos esto.** Sin tope, un pedido enorme se lleva el presupuesto entero. El tope es lo que hace que un cashback del 99% sea viable.

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

### ¿Cuántas veces puede ganar la misma persona?

> La mitad de las campañas permite una sola vez por usuario.

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

### sinLimite

No tiene pregunta propia: se responde dentro de **maxPedidos**.

### ¿El beneficio aplica solo en cierto tipo de pedido?

> Es opcional: si el beneficio aplica en cualquier pedido, no marques nada.

**Por qué te preguntamos esto.** Esta pregunta es sobre el pedido con el que el usuario se gana el beneficio, no sobre dónde gasta después los Créditos: eso se pregunta más adelante. Si la restricción no queda escrita, el usuario puede reclamar el beneficio en cualquier pedido.

| | |
|---|---|
| Campo interno | `condiciones` |
| Paso | Beneficio |
| Tipo de control | casillas |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES` |

**Opciones** (casillas, se pueden marcar varias):

- **Solo si el pedido se hace por Turbo**: Un pedido por el resto de la app no da el beneficio.
- **Solo si consume en el local**: La modalidad de consumo en el local de la app. Un domicilio no da el beneficio.

## Paso: Créditos

### ¿Cuándo le llegan los Créditos?

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
| Llena en el documento | `TEXTO_CARGA` |

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

> Casi todos ponen una fecha límite concreta.

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

> Siete de cada diez campañas los limitan a la misma tienda.

**Por qué te preguntamos esto.** Define dónde vale el saldo. Lo normal es que se gaste en la misma tienda donde el usuario se ganó el beneficio. En todo caso, estos Créditos casi nunca aplican a RappiFavor, Cajero ATM ni RappiTravel.

| | |
|---|---|
| Campo interno | `redencion` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | tienda |
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

## Paso: Participantes

### ¿Quiénes pueden participar?

> La mitad de las campañas es para todos y casi la otra mitad para Pro.

**Por qué te preguntamos esto.** Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.

| | |
|---|---|
| Campo interno | `segmento` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | todos |
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

### ¿Con qué puede pagar?

> Con "todos" entran tarjetas, billeteras y efectivo donde exista.

**Por qué te preguntamos esto.** Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.

| | |
|---|---|
| Campo interno | `metodoPago` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | todos |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_METODO_PAGO` |

**Opciones** (botones grandes, una sola):

- **Con cualquier medio de pago**: Lo más común.
- **Con todo menos efectivo**: Tarjetas y billeteras sí, efectivo no.
- **Solo con RappiCard**: Únicamente la tarjeta de Rappi.

**Mensajes de validación:**

- `vacio`: Dinos con qué puede pagar el usuario.

### ¿Hay que gastar un mínimo para participar?

> Es opcional: si no exiges un mínimo, deja el campo vacío y sigue.

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

> Confirmo que la información es veraz y corresponde a la campaña aprobada.

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
- ¿La tienda o la marca exige sus propios términos y condiciones?
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

> Nacional es todo el país. Si es solo en algunas ciudades, las escribes en el siguiente paso.

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
- **Solo en algunas ciudades**: Las escribes tú en el siguiente paso.

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

> Es el Organizador: la tienda o la marca que pone la plata. Nunca es Rappi. Escribe la razón social como aparece en su RUT.

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

> Con el dígito de verificación, por ejemplo 900.111.222-1. Está en el RUT del aliado; pídeselo a tu contacto.

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

- **Quien llegó primero**: Por la fecha y hora de su último pedido.
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

> La mitad de las campañas es para todos y casi la otra mitad para Pro.

**Por qué te preguntamos esto.** Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.

| | |
|---|---|
| Campo interno | `segmento` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | todos |
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

### ¿Con qué puede pagar?

> Con "todos" entran tarjetas, billeteras y efectivo donde exista.

**Por qué te preguntamos esto.** Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.

| | |
|---|---|
| Campo interno | `metodoPago` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | todos |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_METODO_PAGO` |

**Opciones** (botones grandes, una sola):

- **Con cualquier medio de pago**: Lo más común.
- **Con todo menos efectivo**: Tarjetas y billeteras sí, efectivo no.
- **Solo con RappiCard**: Únicamente la tarjeta de Rappi.

**Mensajes de validación:**

- `vacio`: Dinos con qué puede pagar el usuario.

### ¿Hay que gastar un mínimo para participar?

> Es opcional: si no exiges un mínimo, deja el campo vacío y sigue.

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

> Confirmo que la información es veraz y corresponde a la campaña aprobada.

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

## Paso: Beneficio

### ¿Qué porcentaje del pedido devuelves en Créditos?

> Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.

**Por qué te preguntamos esto.** Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.

| | |
|---|---|
| Campo interno | `porcentaje` |
| Paso | Beneficio |
| Tipo de control | numero |
| Obligatorio | sí, cuando se ve |
| Ejemplo | 99 |
| Avanza sola | no |
| Llena en el documento | `PORCENTAJE` |

**Mensajes de validación:**

- `vacio`: Escribe el porcentaje que devuelves, sin el signo de porcentaje.
- `rango`: El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.

### ¿Qué es lo máximo que recibe alguien por pedido?

> Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.

**Por qué te preguntamos esto.** Sin tope, un pedido enorme se lleva el presupuesto entero. El tope es lo que hace que un cashback del 99% sea viable.

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

### ¿Cuántas veces puede ganar la misma persona?

> La mitad de las campañas permite una sola vez por usuario.

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

### sinLimite

No tiene pregunta propia: se responde dentro de **maxPedidos**.

### ¿El beneficio aplica solo en cierto tipo de pedido?

> Es opcional: si el beneficio aplica en cualquier pedido, no marques nada.

**Por qué te preguntamos esto.** Esta pregunta es sobre el pedido con el que el usuario se gana el beneficio, no sobre dónde gasta después los Créditos: eso se pregunta más adelante. Si la restricción no queda escrita, el usuario puede reclamar el beneficio en cualquier pedido.

| | |
|---|---|
| Campo interno | `condiciones` |
| Paso | Beneficio |
| Tipo de control | casillas |
| Obligatorio | no |
| Avanza sola | no |
| Llena en el documento | `TEXTO_CONDICIONES` |

**Opciones** (casillas, se pueden marcar varias):

- **Solo si el pedido se hace por Turbo**: Un pedido por el resto de la app no da el beneficio.
- **Solo si consume en el local**: La modalidad de consumo en el local de la app. Un domicilio no da el beneficio.

## Paso: Créditos

### ¿Cuándo le llegan los Créditos?

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
| Llena en el documento | `TEXTO_CARGA` |

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

> Casi todos ponen una fecha límite concreta.

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

> Siete de cada diez campañas los limitan a la misma tienda.

**Por qué te preguntamos esto.** Define dónde vale el saldo. Lo normal es que se gaste en la misma tienda donde el usuario se ganó el beneficio. En todo caso, estos Créditos casi nunca aplican a RappiFavor, Cajero ATM ni RappiTravel.

| | |
|---|---|
| Campo interno | `redencion` |
| Paso | Créditos |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | tienda |
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

## Paso: Tiendas

### ¿Qué tiendas participan?

> Mínimo dos. Cada una entra con su razón social, su NIT y su presupuesto.

**Por qué te preguntamos esto.** En un Cashback Day cada tienda organiza su propio beneficio y responde por él. Por eso cada una necesita sus propios datos.

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

## Paso: Participantes

### ¿Quiénes pueden participar?

> La mitad de las campañas es para todos y casi la otra mitad para Pro.

**Por qué te preguntamos esto.** Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.

| | |
|---|---|
| Campo interno | `segmento` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | todos |
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

### ¿Con qué puede pagar?

> Con "todos" entran tarjetas, billeteras y efectivo donde exista.

**Por qué te preguntamos esto.** Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.

| | |
|---|---|
| Campo interno | `metodoPago` |
| Paso | Participantes |
| Tipo de control | lista |
| Obligatorio | sí, cuando se ve |
| Valor por defecto | todos |
| Avanza sola | sí |
| Llena en el documento | `TEXTO_METODO_PAGO` |

**Opciones** (botones grandes, una sola):

- **Con cualquier medio de pago**: Lo más común.
- **Con todo menos efectivo**: Tarjetas y billeteras sí, efectivo no.
- **Solo con RappiCard**: Únicamente la tarjeta de Rappi.

**Mensajes de validación:**

- `vacio`: Dinos con qué puede pagar el usuario.

### ¿Hay que gastar un mínimo para participar?

> Es opcional: si no exiges un mínimo, deja el campo vacío y sigue.

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

> Confirmo que la información es veraz y corresponde a la campaña aprobada.

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
| `NOMBRE_CAMPANA` | el nombre, que sale de la tienda, el porcentaje y el día de inicio |
| `NOMBRE_CAMPANA_MAYUS` | el nombre, que sale de la tienda, el porcentaje y el día de inicio |
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
