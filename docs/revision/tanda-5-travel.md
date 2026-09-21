# Tanda 5 de 7 · Rappi Travel: los dos tipos, y las preguntas que nadie ha revisado

> **Antes de pegar esto, pega `PROMPT.md`.** Ahí va quién revisa, qué es
> RappiMind, qué no se puede tocar y en qué formato tiene que venir la
> respuesta. Sin eso, la revisión vuelve en prosa y no se puede aplicar.

Cashback Travel y Descuento Travel. Entre los dos suman más de cuarenta preguntas propias sobre vuelos, hoteles, autos y paquetes. Ninguna ha pasado por una revisión de copy. Es la parte del producto con más riesgo de que el comercial se pierda.

## Lo que hay que mirar en esta tanda

- El vocabulario: "trayecto", "ámbito", "clases excluidas", "solo operados". ¿Un KAM de Travel los usa así, o son palabras de abogado?
- Las preguntas de fechas: hay fecha de campaña y fecha de viaje, y son distintas. ¿Queda claro cuál es cuál?
- Las preguntas condicionales: muchas solo aparecen si antes eligió aéreas, o alojamiento, o autos. ¿Se entiende la cadena?
- Las preguntas de tope, mínimo y límite: son cuatro o cinco parecidas. ¿Se distinguen entre sí?
- Si alguna pregunta pide algo que el comercial no tiene a mano cuando la ve.

## Cashback Travel: sus preguntas propias

La marca aliada devuelve un porcentaje de lo que el usuario pagó por su vuelo, hotel, auto o paquete, en Créditos para su Billetera.

Las otras 19 preguntas de este tipo son las mismas del Cashback y ya van en la tanda 2.

### Paso: Organizador

#### ¿De qué marca son los productos?

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

- Si lo deja en blanco: Escribe la marca. Sin ella, el nombre de la campaña quedaría con la razón social.

### Paso: Productos

#### ¿Qué categorías de Travel participan?

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

- Si lo deja en blanco: Marca al menos una categoría.

#### ¿Los viajes son nacionales o internacionales?

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

- Si lo deja en blanco: Dinos si los viajes son nacionales, internacionales o los dos.

#### ¿Aplica solo a algunos destinos?

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

#### ¿Qué hoteles participan?

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

- Si lo deja en blanco: Dinos qué hoteles participan.

#### ¿Cuáles hoteles?

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

- Si lo deja en blanco: Escribe al menos un hotel, o vuelve y elige que participan todos.

### Paso: Condiciones

#### ¿Aplica solo a una aerolínea?

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

#### ¿Solo vuelos que ella misma opere?

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

#### ¿Qué trayectos aplican?

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

- Si lo deja en blanco: Dinos qué trayectos aplican.

#### ¿Una ida y regreso cuenta como una orden?

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

- Si lo deja en blanco: Dinos cómo se cuenta una compra de ida y regreso.

#### ¿Hay clases tarifarias excluidas?

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

- Si lo escribe con otro formato: Cada clase tarifaria es una sola letra, separada por comas. Por ejemplo: A, F.

#### ¿Solo vuelos que salgan del país?

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

#### ¿Hay que comprar con anticipación?

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

- Si el número se sale del rango: Los días de anticipación van de 1 a 365.

#### ¿El viaje tiene que ser desde cierta fecha?

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

#### ¿Y hasta qué fecha?

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

- Si lo deja en blanco: Escribe hasta cuándo se puede viajar.
- Si las fechas van al revés: El periodo de viaje no puede terminar antes de empezar.

#### ¿Los dos trayectos dentro de ese periodo?

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

#### ¿Hay fechas en las que no aplica?

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

- Si lo escribe con otro formato: Las fechas van en formato año-mes-día, separadas por comas. Por ejemplo: 2026-12-24.
- Si la fecha queda fuera de la campaña: Las fechas excluidas tienen que estar dentro del periodo de viaje.

#### ¿Hay un mínimo de noches?

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

- Si el número se sale del rango: El mínimo de noches va de 1 a 365.

#### ¿Hay un mínimo de días de alquiler?

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

- Si el número se sale del rango: El mínimo de días va de 1 a 365.

#### ¿Y un máximo?

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

- Si lo deja en blanco: Escribe el máximo de días de alquiler.
- Si las fechas van al revés: El mínimo de días no puede ser mayor que el máximo.

#### sinCompraMinima

No tiene pregunta propia: se responde dentro de **compraMinima**.

#### ¿El aliado pide alguna otra condición?

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

- Si lo deja en blanco: Dinos si el aliado pide alguna otra condición.

### Paso: Beneficio

#### ¿Cómo se calcula el cashback?

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

- Si lo deja en blanco: Dinos cómo se calcula el cashback.

#### sinTope

No tiene pregunta propia: se responde dentro de **tope**.

#### ¿Cuántos Créditos recibe por orden?

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

- Si lo deja en blanco: Escribe cuántos Créditos recibe una persona por orden.
- Si escribe cero: Los Créditos por orden tienen que ser más que cero.
- Si el número supera el presupuesto: Los Créditos por orden son más que el presupuesto total. Revisa los dos números.

#### ¿Cuántas órdenes puede beneficiar una persona?

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

- Si lo deja en blanco: Escribe cuántas órdenes con beneficio puede tener una persona.
- Si el número se sale del rango: Tiene que ser al menos una orden.

#### ¿Hay un máximo de órdenes en la campaña?

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

- Si lo deja en blanco: Escribe el máximo de órdenes, o marca que no hay máximo.
- Si el número se sale del rango: Tiene que ser al menos una orden.

#### sinMaxOrdenes

No tiene pregunta propia: se responde dentro de **maxOrdenes**.

### Paso: Créditos

#### ¿Cuántos días después?

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

- Si lo deja en blanco: Escribe cuántos días después de que termine la campaña llegan los Créditos.
- Si el número se sale del rango: Los días van de 1 a 30.

#### ¿En qué categorías se pueden usar?

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

- Si lo deja en blanco: Marca al menos una categoría donde se puedan usar los Créditos.

### Paso: Revisar

#### ¿Qué día sale la primera pieza?

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

- Si lo deja en blanco: Escribe el día en que sale la primera comunicación.
- Si la fecha ya pasó: La primera comunicación no puede ser una fecha que ya pasó: el T&C se publica antes de que salga la primera pieza.

#### ¿Esta campaña repite una anterior?

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

#### Confirma que el aliado aprobó la mecánica

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

- Si lo deja en blanco: Confirma que el aliado aprobó la mecánica.

#### Confirma que las piezas dicen lo mismo que el T&C

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

- Si lo deja en blanco: Confirma que las piezas dicen lo mismo que el T&C.

---

## Descuento Travel: sus preguntas propias

La marca aliada baja el precio de sus vuelos, hoteles, autos o paquetes. El usuario ve el precio ya rebajado antes de pagar, no recibe Créditos.

Las otras 41 preguntas de este tipo son las mismas del Cashback y ya van en la tanda 2.

### Paso: Beneficio

#### ¿El descuento es igual en todos los productos?

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

- Si lo deja en blanco: Dinos si el descuento es igual en todos los productos.

#### ¿Cuál es el descuento más bajo?

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

- Si lo deja en blanco: Escribe el descuento más bajo de la campaña.
- Si el número se sale del rango: El descuento más bajo tiene que ser menor que el más alto. Si son iguales, el descuento es fijo.

#### ¿A cuántos productos llega el descuento máximo?

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

- Si lo deja en blanco: Escribe a cuántos productos llega el descuento máximo.
- Si el número se sale del rango: Tiene que ser al menos un producto.

#### ¿Dónde ve el usuario el descuento?

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

- Si lo deja en blanco: Marca al menos un lugar donde el usuario vea el descuento.

#### sinLimitePorUsuario

No tiene pregunta propia: se responde dentro de **limitePorUsuario**.

#### ¿La campaña termina al agotarse unas unidades?

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

- Si lo deja en blanco: Escribe cuántas unidades hay, o marca que no depende de unidades.
- Si el número se sale del rango: Tiene que ser al menos una unidad.

#### sinUnidades

No tiene pregunta propia: se responde dentro de **unidades**.

---

## Fin de la tanda 5

Responde con las fichas de hallazgo en el formato del prompt, la tabla de cierre
y las tres preguntas para Juan. Si algo está bien, dilo en una línea y sigue: lo
que no tiene ficha se da por aprobado.
