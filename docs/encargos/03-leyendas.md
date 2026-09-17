# Encargo 03 · El catálogo de leyendas para las piezas

**Instrucciones para Juan (esto no se pega).** Abre una conversación nueva en Claude chat. Adjunta los dos archivos `SSL PLAYBOOK Q2 26 RappiAds.pptx` y `Sponsors Playbook 2.pptx`. Si tienes a mano las cuatro artes del 17 de septiembre como imágenes, súbelas también, aunque no hace falta: el mensaje ya trae la transcripción completa de su letra pequeña. Después pega todo lo que hay debajo de la línea, desde "Hola" hasta "FIN DEL ENCARGO". Cuando te responda, tráeme la respuesta entera tal cual: el bloque final "PARA EL REPOSITORIO" está pedido en el formato de nuestros modelos para que yo lo convierta en archivos sin traducir nada a mano.

---

Hola. Necesito que actúes como apoyo legal de producto de una herramienta interna de Rappi que se llama RappiMind. No tienes acceso al código ni al repositorio, así que todo lo que necesitas saber está en este mensaje y en los dos archivos adjuntos. Léelo completo antes de empezar.

## 1. Qué es RappiMind y qué te estoy pidiendo

RappiMind es una aplicación interna donde los comerciales de Rappi (los CAM y KAM que trabajan con las tiendas y las marcas) generan por sí mismos los Términos y Condiciones de sus campañas de marketing, sin escribirle a Legal. El comercial solo responde hechos: qué tienda, qué porcentaje, qué tope, qué fechas, quién puede participar. La herramienta arma el documento a partir de modelos que Legal ya aprobó palabra por palabra, y si falta un dato no genera. Nunca sale un documento con espacios en blanco, marcadores sin llenar ni frases a medias.

Queremos que la herramienta también resuelva las **leyendas legales**: la letra pequeña que acompaña las piezas de marketing. Hoy el comercial se las pide a Legal una por una, o peor, las copia de otra campaña y les cambia una parte. Más abajo verás cuatro piezas publicadas de verdad donde eso salió mal.

Tu trabajo no es escribir leyendas nuevas de tu cabeza. Tu trabajo es **ordenar en un catálogo las leyendas que ya existen** en los dos playbooks adjuntos y en las piezas reales, y decir con precisión qué falta para que un sistema determinista pueda armarlas solo a partir de lo que el comercial ya respondió. Donde tengas que proponer algo porque no existe, lo propones, pero marcándolo como propuesta tuya, porque eso cambia quién lo tiene que aprobar.

## 2. Reglas que no puedes romper

1. **Rappi nunca es el organizador de una campaña.** El organizador es la tienda aliada o la marca que fondea el beneficio. Rappi es plataforma de intermediación, medio de difusión y responsable del tratamiento de datos personales. Que Rappi opere la mecánica o entregue un premio no la convierte en organizadora. Ninguna leyenda puede sugerir lo contrario. La única excepción ya autorizada es Brasil, cuyos T&C aprobados están escritos con Rappi como quien concede la promoción; esa excepción vale solo para el modelo brasileño y no se extiende a ningún otro país.
2. **Determinismo.** El comercial solo entrega hechos: listas, números, fechas, nombres. El texto legal sale de modelos aprobados. Si falta un dato, el sistema no genera. No propongas valores por defecto ni textos "a completar después".
3. **El texto legal es de Legal.** No redactes cláusulas nuevas ni "mejores" las existentes. Si un playbook tiene un error evidente o una frase rota, transcríbela tal cual y márcala en la lista de pendientes. Si un país o una categoría no está cubierta, di "no cubierto" en vez de inventar la frase.
4. **Sin texto libre legal en el formulario.** No propongas nada que dependa de que el comercial escriba, resuma o recorte texto legal. Los únicos campos de texto libre que existen son nombres, razones sociales, ciudades, la descripción de un premio físico y la lista de productos.
5. **Todo en español.** En los textos visibles no uses guiones como signo de puntuación: usa comas, dos puntos, punto y seguido o viñetas. Los textos legales aprobados se transcriben literalmente, con su puntuación original, aunque contradiga esta regla.

## 3. Lo que ya existe en RappiMind, para que tu propuesta no choque con el producto

### 3.1 Los tipos de campaña que la herramienta genera hoy

| Identificador | Nombre en pantalla | Qué es | Países |
|---|---|---|---|
| `cashback` | Cashback | La tienda devuelve un porcentaje de lo pagado en Créditos de Rappi, con tope por pedido y presupuesto total | Colombia en producción; México, Perú, Argentina, Chile, Ecuador, Uruguay y Costa Rica en pruebas |
| `carrera_compras` | Carrera de Compras | Concurso sin azar: gana quien más compra en unas fechas, con premio en Créditos o físico | Colombia |
| `cashback_day` | Cashback Multitienda | Varias tiendas (entre 2 y 60) hacen cashback en una misma jornada, cada una con su porcentaje, tope y presupuesto | Colombia |
| `cashback_eta` | 15 minutos o Cashback | Rappi promete un tiempo de entrega en el botón Turbo de una ciudad; si la orden llega tarde, el usuario recibe un porcentaje de lo pagado en Créditos. No hay tienda que fondee | Colombia |
| `cashback_travel` | Cashback Travel | Cashback en vuelos, hoteles, autos o paquetes de Rappi Travel | Colombia |
| `descuento_travel` | Descuento Travel | Descuento en el precio de productos de Rappi Travel | Colombia |
| `promocao_br` | Promoção Brasil | Desconto % OFF, frete grátis, taxa de serviço grátis, o taxa y frete grátis, en portugués | Brasil en pruebas |

### 3.2 Los descuentos y cupones que NO generan documento

Para un descuento o un cupón en Colombia la herramienta no genera nada: Legal ya tiene quince T&C generales publicados con enlace fijo, y la herramienta le entrega al comercial el enlace que va en la pieza. Esto importa para tu trabajo por dos razones: son campañas para las que **el enlace existe antes que la pieza**, y son campañas para las que **la herramienta no le pregunta nada al comercial** (ni porcentaje, ni vigencia, ni tienda), así que una leyenda para ellas no tiene de dónde sacar datos variables hoy. Son estos:

| Nombre en la lista de Legal | Enlace fijo |
|---|---|
| Descuento en Toda la Tienda | https://promos.rappi.com/colombia/2026/descuentoentiendaco |
| Descuento en Productos Seleccionados | https://promos.rappi.com/colombia/2026/descuentoprodselecc |
| Descuento en Valor | https://promos.rappi.com/colombia/2026/dtoenvalor |
| Descuento para Usuarios Nuevos en Turbo | https://promos.rappi.com/colombia/2026/1/10/trminos-y-condiciones-campaa-de-descuento-para-usuarios-nuevos-en-turbo |
| Envío Gratis | https://promos.rappi.com/colombia/enviogratis |
| Tarifa de Servicio Gratis (vence el 31 de octubre de 2026) | https://promos.rappi.com/colombia/tarifadeservicio |
| Descuento en Productos Seleccionados Rappi Pro | https://promos.rappi.com/colombia/2026/descuento-en-productos-seleccionados-rappipro |
| Descuento en Toda la Tienda Rappi Pro | https://promos.rappi.com/colombia/2026/descuento-en-toda-la-tienda-rappipro |
| Descuento en Valor Rappi Pro | https://promos.rappi.com/colombia/2026/descuento-en-valor-rappi-pro |
| Descuento en la Membresía Rappi Pro | https://promos.rappi.com/colombia/2026/descuentos-en-membresia-rappipro |
| Cupones de Descuento para Membresía Rappi Pro y Black | https://promos.rappi.com/colombia/2024/trminos-y-condiciones-cupones-de-descuento-para-la-membresa-rappi-pro-y-rappi-pro-black |
| Cupon de descuento - Valor fijo | https://promos.rappi.com/colombia/cuponvalorfijoco |
| Cupon de descuento - Toda la tienda | https://promos.rappi.com/colombia/cupondescuentoco |
| Descuento en Productos Seleccionados (segunda entrada, con otro enlace) | https://promos.rappi.com/colombia/descuentosenprod |
| Codigo de descuento para eventos externos | https://promos.rappi.com/colombia/2026/9/7/trminos-y-condiciones-cupones-off |

Los nombres van tal cual están en la lista de Legal, con sus erratas. No los corrijas.

### 3.3 El criterio de Legal sobre cuándo hace falta un T&C propio y qué debe decir la pieza

Esta tabla viene de un archivo de Legal Colombia de septiembre de 2024 y es lo más parecido a una regla escrita sobre el contenido obligatorio de una pieza que tenemos. La transcribo tal cual, con su ortografía:

| Tipo de campaña | Cuándo necesita T&Cs específicos |
|---|---|
| Cashback | Si los Créditos tienen una vigencia diferente a 6 meses |
| Cashback | Si los Créditos solo puede utilizarse en tienda(s) seleccionada(s) |
| Descuentos en eventos especiales | Cualquier campaña que tenga mucha visibilidad: Ej: Hora Loca, Aniversarios, Mega Prima, Cumpleaños Rappi, Rappi Pro Week |
| Cupones | Cuando se rediman por fuera de Rappi |
| Cupones | Cuando aplica en tienda(s) seleccionada(s) |
| Cupones | Cuando aplica a usuarios con condiciones especiales. Ej: Usuarios que nunca hayan comprado en Turbo. |
| Concursos | En todos los concursos |
| Travel | En todos los concursos de Travel |

Y la columna "Requisitos de la pieza publicitaria" del mismo archivo, que trae tres reglas:

- Siempre debe incluirse el valor mínimo de compra.
- Siempre debe incluirse el valor máximo que se recibirá de cashback.
- Siempre se debe incluir cuando aplica a usuarios especificos. Ej: Usuarios que nunca hayan comprado en Turbo.

Estas tres reglas son de Legal. Úsalas como el mínimo irreductible de cualquier leyenda de cashback, y cítalas como "criterio Legal CO 2024".

### 3.4 Los datos que la herramienta ya tiene, con el nombre exacto de cada marcador

Este es el inventario con el que tienes que armar las leyendas. Cada dato sale de una respuesta que el comercial **ya da** para generar el T&C, o de la configuración del país. No podemos agregar preguntas nuevas sin una razón muy buena, y si la hay, quiero que la nombres aparte.

Los nombres entre llaves dobles son los marcadores reales de nuestros modelos. Úsalos exactamente así, en mayúsculas y con guion bajo. Los que empiezan por `TEXTO_` son frases ya redactadas por Legal que el motor arma a partir de varias respuestas; los demás son valores sueltos ya formateados.

**Comunes a toda campaña:**

- `{{NOMBRE_CAMPANA}}`: el nombre de la campaña, que arma la herramienta con la tienda, el porcentaje y el día de inicio. Ejemplo: `El Corral · 50% Cashback · 20 sep 2026`. También existe `{{NOMBRE_CAMPANA_MAYUS}}`.
- `{{TIENDA}}`: la marca comercial como aparece en la app. Ejemplo: `El Corral`.
- `{{TEXTO_TERRITORIO}}`: frase de cobertura. Ejemplo: `el territorio nacional de la República de Colombia` o `las ciudades de Bogotá, Medellín y Cali`.
- `{{FECHA_INICIO}}`, `{{HORA_INICIO}}`, `{{FECHA_FIN}}`, `{{HORA_FIN}}`: la vigencia. Ejemplos: `17 de septiembre de 2026`, `12:00 a. m.`, `11:59 p. m.`.
- `{{TEXTO_HORA_LOCAL}}`: `hora local de la República de Colombia`.
- `{{ORGANIZADOR}}` y `{{ID_ORGANIZADOR}}`: razón social e identificación de la tienda o marca que fondea. Ejemplo: `Alimentos del Norte S.A.S.`, `NIT 900.111.222-1`.
- `{{TEXTO_SEGMENTO}}`: quién puede participar. Ejemplos de lo que produce: todos los usuarios mayores de edad, solo usuarios Pro y Pro Black, solo usuarios nuevos, usuarios sin compras en los últimos N días.
- `{{TEXTO_METODO_PAGO}}`: con qué se puede pagar. Opciones: cualquier medio de pago, todo menos efectivo, solo RappiCard.
- `{{TEXTO_MINIMO_COMPRA}}`: la compra mínima, si la hay. Es opcional, y cuando no hay, el marcador viene vacío.
- `{{TEXTO_CONDICIONES}}`: condiciones opcionales del pedido: solo Turbo, solo consumo en el local.

**Cashback (y también el de 15 minutos, el Multitienda y el de Travel, con variantes):**

- `{{PORCENTAJE}}`: el porcentaje. Ejemplo: `veinte por ciento (20%)`.
- `{{TOPE}}`: el máximo por pedido. Ejemplo: `veinticinco mil pesos M/Cte. ($25.000)`.
- `{{PRESUPUESTO}}`: el presupuesto total, que agota la campaña.
- `{{TEXTO_LIMITE_PEDIDOS}}`: cuántas veces puede ganar la misma persona, o sin límite.
- `{{TEXTO_CARGA}}`: cuándo se acreditan los Créditos: inmediato, al día siguiente, en una fecha.
- `{{TEXTO_VIGENCIA_CREDITOS}}`: hasta cuándo sirven los Créditos: hasta una fecha o durante N días.
- `{{TEXTO_LUGAR_REDENCION}}`: dónde se gastan: solo en esa tienda, en ciertas secciones, en cualquier parte de Rappi.

**15 minutos o Cashback (`cashback_eta`):**

- `{{TEXTO_ETA}}`: el tiempo prometido. Ejemplo: `quince (15) minutos`.
- `{{TEXTO_CIUDAD_ETA}}`: la ciudad. Una sola.
- `{{MODALIDAD_TURBO}}`: hoy siempre `Turbo Restaurantes`.
- `{{URL_TC_TURBO}}`: el enlace de los T&C del botón Turbo: https://legal.rappi.com.co/colombia/terminos-y-condiciones-del-boton-turbo/

**Carrera de Compras:**

- `{{TEXTO_PRODUCTOS}}`: qué productos participan (todos, los de una marca, una lista).
- `{{CRITERIO_GANADOR}}`, `{{FRASE_GANADORES}}`, `{{TEXTO_DESEMPATE}}`: cómo se gana, cuántos ganan, quién gana si empatan.
- `{{LISTA_PREMIOS}}`, `{{TEXTO_NATURALEZA_PREMIO}}`, `{{TEXTO_ENTREGA}}`: el premio y quién lo entrega.
- `{{MEDIO_NOTIFICACION}}`, `{{FECHA_NOTIFICACION}}`, `{{PLAZO_CONFIRMACION}}`: cómo y cuándo se avisa al ganador.

**Cashback Multitienda:** los mismos del cashback, más una lista de tiendas donde cada una trae `{{TIENDA_MARCA}}`, `{{TIENDA_RAZON_SOCIAL}}`, `{{TIENDA_ID}}`, `{{TIENDA_CIUDADES}}` y `{{TIENDA_PRESUPUESTO}}`.

**Del país, no del comercial:**

- `{{ENTIDAD_LEGAL}}` e `{{ID_FISCAL}}`: la sociedad de Rappi en ese país. Ejemplo: `Rappi S.A.S.`, `NIT 900.843.898-9`.
- `{{URL_TC_PLATAFORMA}}`, `{{URL_PRIVACIDAD}}`, `{{URL_TC_CREDITOS}}`: los tres enlaces fijos del país.
- `{{ENTIDAD_VIGILANCIA}}` y `{{AUTORIDAD_DATOS}}`: las autoridades.
- `{{PAIS_LEGAL}}`: `la República de Colombia`.

**El enlace de la promoción publicada.** No existe como marcador hoy, y es el dato con el problema de secuencia que te explico en la sección 6. Cuando lo necesites en una leyenda, escríbelo como `{{URL_TC_CAMPANA}}` y trátalo como marcador nuevo.

**Lo que NO tiene la herramienta**, para que no lo des por hecho: el tipo de pieza, el límite de caracteres de cada pieza, el número de unidades por usuario de un descuento, el precio tachado, las existencias de un producto, la categoría del producto (licores, nicotina, apuestas, alimentos), y para los quince T&C generales de descuentos y cupones no tiene ningún dato de la campaña, solo el enlace.

### 3.5 Cómo se escribe un modelo en nuestro repositorio

Los modelos son archivos de texto plano. Convenciones:

- `{{NOMBRE_DEL_DATO}}` es un marcador que el motor reemplaza por un valor.
- `[[?MARCADOR]]...[[/?]]` encierra contenido opcional que desaparece entero cuando el marcador viene vacío. Así se resuelve, por ejemplo, la compra mínima cuando no la hay.
- Una línea que empieza con `%%` es un comentario y no sale en el texto final.

Y una distinción que tienes que respetar al armar frases:

- Un valor marcado **ORACIÓN** devuelve una oración completa, con mayúscula inicial y punto final.
- Un valor marcado **FRAGMENTO** se inserta dentro de otra frase, sin mayúscula inicial ni punto final. `FECHA_INICIO` vale `17 de septiembre de 2026`, no `El 17 de septiembre de 2026.`

Todos los marcadores de la sección 3.4 son FRAGMENTO salvo `TEXTO_LIMITE_PEDIDOS`, `TEXTO_CARGA`, `TEXTO_VIGENCIA_CREDITOS`, `TEXTO_LUGAR_REDENCION`, `TEXTO_DESEMPATE` y `TEXTO_ENTREGA`, que son ORACIÓN. Si necesitas la versión corta de uno de los ORACIÓN para que quepa en una pieza, eso es un marcador nuevo y va a la lista de datos nuevos.

## 4. Cuatro piezas publicadas de verdad, y por qué cambian este encargo

El 17 de septiembre de 2026 me llegaron cuatro artes publicadas con su letra pequeña. Son de los tipos que RappiMind genera: cashback, descuento en Turbo y el de 15 minutos. Transcribo la letra pequeña tal cual. Lo que va entre corchetes es anotación mía.

### Pieza 1. El Corral, 99% cashback, Happy CashBack Pro

Texto de apoyo, bajo el titular:

> Cashback máximo de $25.000 en créditos en Rappi para redimir en la misma marca del 09 al 13 de septiembre de 2026. Válido únicamente en la primera orden. Aplica a nivel nacional.

Letra pequeña al pie:

> Promoción válida hasta agotar existencias, Aplican términos y condiciones (https://promos.rappi.com/colombia/cashback99elcorral). Para acceder y obtener este beneficio debes tener tu membresía Pro o ProBlack activa https://promos.rappi.com/colombia/prohome Válido sólo el 08 de septiembre de 2026 en las zonas de cobertura de las tiendas de Mimos en la plataforma Rappi.

Tres contradicciones dentro de la misma pieza: la letra pequeña dice "las tiendas de Mimos" y la pieza es de El Corral; el texto de apoyo dice "del 09 al 13 de septiembre" y la letra pequeña "válido sólo el 08 de septiembre"; el titular dice "¡Solo por HOY!" sobre una vigencia de cinco días.

### Pieza 2. Pedigree en Turbo, Carulla, 40% OFF

Letra pequeña:

> Aplican términos y condiciones: https://promos.rappi.com/colombia/2026/descuentoprodselecc Oferta en productos seleccionados. Hasta agotar existencias. Imágenes de referencia. *El tiempo de entrega es estimado y depende de condiciones climáticas y de tráfico. Aplica el 13-09-2026.

Esta está bien. Y confirma dos cosas útiles: el enlace que usa es uno de los quince T&C generales de la sección 3.2, así que las piezas los usan de verdad; y la pieza lleva un dato que el T&C no lleva, "1 und. por usuario", arriba a la derecha.

### Pieza 3. 15 minutos o 100% cashback, Turbo Restaurantes Bogotá

Texto de apoyo:

> Del valor de tus productos, el tiempo aplica desde que el restaurante confirma la orden hasta que es entregada en la dirección. El máximo de devolución de cashback es de $100.000 en créditos en Rappi para redimir en marcas de Turbo Restaurantes del 17 al 23 de septiembre de 2026. Válido únicamente en la primera orden. Aplica solo en Bogotá

Letra pequeña:

> Válido únicamente para pagos con tarjeta. Cashback de 50% en la compra en créditos en Rappi. Devolución máxima de 50.000 COP. Solo se puede realizar un pedido por usuario. Aplican T&C (https://promos.rappi.com/colombia/2025/9/8/trminos-y-condiciones-ccuta-50-cashback Cúcuta CB 50%). Promoción válida entre el 09 al 14 de septiembre de 2025 o hasta agotar presupuesto disponible. Válido en todos los restaurantes en Cúcuta.

Es la más grave de las cuatro: la letra pequeña entera es de otra campaña. La pieza dice Bogotá, 100%, tope de $100.000, del 17 al 23 de septiembre de 2026 y cualquier medio de pago. Su letra pequeña dice Cúcuta, 50%, tope de $50.000, del 09 al 14 de septiembre de 2025 y solo tarjeta. Y el enlace lleva al T&C de Cúcuta: un usuario de Bogotá que entre a leer las condiciones encuentra las de otra ciudad, de otro año y con la mitad del beneficio.

### Pieza 4. La misma campaña, otra maqueta

Letra pequeña:

> Promoción valida hasta agotar presupuesto disponible de campaña. Aplican términos y condiciones XXXXXXXXXXXXXXXX Valido unicamente el 16 de septiembre de 2026 en la República de Colombia. Aplica en todo turbo restaurantes Bogotá de 11:00am a 3:00pm.

`XXXXXXXXXXXXXXXX` es el marcador del enlace, sin rellenar. El texto de apoyo dice del 17 al 23 de septiembre y la letra pequeña dice solo el 16 de septiembre. Y le faltan tildes a "valida", "Valido" y "unicamente".

### Lo que demuestran

En cuatro piezas hay un enlace sin rellenar, una marca equivocada, una ciudad equivocada, dos años distintos, dos porcentajes distintos y cuatro contradicciones de fecha entre el texto grande y el chico. Ninguno es un error de criterio legal: todos son de copiar la letra pequeña de una campaña anterior y cambiarle solo una parte.

Y lo decisivo: los datos que salen mal en estas piezas son exactamente los que el comercial ya le da a RappiMind para generar el T&C: la tienda, la ciudad, el porcentaje, el tope, las fechas, el máximo de órdenes y el medio de pago. O sea que la leyenda se puede armar de lo que ya respondió, sin preguntarle nada nuevo, y entonces no puede contradecir al documento. Ese es el argumento entero de este encargo, y la regla de oro que tiene que cumplir cualquier propuesta tuya: **si un dato aparece en el T&C y en la pieza, tiene que salir del mismo sitio, una sola vez.**

Tres cosas más que enseñan las piezas y que los playbooks no dicen:

1. Una pieza lleva **dos leyendas distintas**: el texto de apoyo (más largo, cerca del titular, en lenguaje de venta) y la letra pequeña (al pie, con el enlace). Las dos tienen que salir de los mismos datos.
2. La pieza lleva datos que el T&C no lleva, como "1 und. por usuario". Hay que decidir de dónde saldrían.
3. Una campaña puede tener un horario dentro del día ("de 11:00am a 3:00pm"). Eso sí lo tiene la herramienta: son `{{HORA_INICIO}}` y `{{HORA_FIN}}`.

## 5. Qué hay en los dos playbooks adjuntos y qué no hay

Los dos archivos llegaron con la nota de que Legal no los ha revisado. Lo que sigue es lo que dicen, no posición de Legal. Léelos completos igual, porque son la fuente; este resumen es para que no se te escape lo que falta.

### 5.1 Playbook SSL (RappiAds): leyendas obligatorias por país y categoría

Dieciséis diapositivas, sin notas del presentador. Es un catálogo de letra pequeña obligatoria por combinación de país y categoría de producto, del mundo de RappiAds (el espacio publicitario que un maker compra dentro de la app), no del mundo de las campañas promocionales que pasan por RappiMind.

- **Colombia por tipo de campaña (diapositiva 1)**, cinco cajas: descuento o promoción (aplican T&C, link de promo, "El descuento no incluye tarifa de servicio y costo de envío", vigencia, existencias con número o "Hasta agotar existencias", legal de licores o vapeadores si aplica, "*Imágenes de referencia"); Turbo con promoción (todo lo anterior más "Aplican términos y condiciones Turbo" con el link del botón Turbo y el disclaimer "*El tiempo de entrega es estimado y depende de condiciones climáticas y de tráfico"); descuento con rango ("Ofertas desde XX% hasta XX%" u "Ofertas entre $XX.XXX hasta $XX.XXX"); Turbo awareness; y awareness sin legales.
- **Colombia, bebidas alcohólicas (diapositiva 2)** y **productos con nicotina (diapositiva 3)**, con sus textos de ley y el ícono +18. El ejemplo de nicotina trae una frase rota: "Comunicación enviada adquirido por [Marca del Anunciante]® destinado únicamente para informar sobre las funcionalidades de sus productos."
- **Turbo en el resto de países (diapositiva 4)**: el disclaimer de tiempo de entrega cambia por país.
- **Licores en el resto de países (diapositiva 5)**, con reglas de área: Perú 13% del arte, Chile 15%.
- **Casas de apuestas (diapositivas 6 a 12)**, país por país, con la fórmula que separa a Rappi del anunciante ("[Marca]® es una empresa independiente a Rappi S.A.S. Espacio adquirido por [Marca]® destinado únicamente como publicidad dentro de la Plataforma Rappi"), y en Perú la frase "Rappi no organiza, conduce ni explota los juegos de azar aquí promocionados", que es nuestra regla 1 escrita como leyenda.
- **México, otras categorías (13 y 14)** y **resto de países (14 a 16)**.

### 5.2 Playbook de Sponsors (Mundial 2026)

Dieciséis diapositivas, seis de ellas solo ejemplos de arte. Es un documento de riesgo de propiedad intelectual: clasifica a las marcas en seis niveles según qué activos de FIFA pueden usar. La leyenda del Mundial es una sola y se repite en los niveles 1 a 4:

> Publicidad y/o actividad realizada por [Marca del Anunciante o Nombre Comercial del Anunciante]® dentro de la Plataforma Rappi®. Rappi® actúa únicamente como medio de difusión y comunicación. Rappi® no es fabricante, patrocinador, organizador ni afiliado al evento, marcas o terceros mencionados.

Los ejemplos de arte enseñan algo que el texto no dice: en pieza vertical las leyendas se apilan al pie, en mayúsculas, en tres o cuatro líneas; en pieza cuadrada la leyenda de la marca va girada en vertical sobre el borde izquierdo. Es decir, cuando no cabe, se rota, no se recorta.

### 5.3 Lo que los playbooks NO traen

Esto define hasta dónde puedes llegar copiando y desde dónde tienes que proponer:

1. **No hay tipos de pieza.** Ni banner, ni push, ni correo, ni valla, ni historia. Solo "arte dentro de la app" contra "offline", y la única regla de offline es quitar el co-branding y el logo de Rappi.
2. **No hay límites de caracteres en ninguna parte.** Solo porcentajes de área y tamaños de fuente, para cuatro casos: apuestas en Brasil (12 px, 14 px en móvil, aproximadamente 5% del arte), licores en Perú (13%), licores en Chile (15%), alimentos en Perú y Ecuador (octógonos, 15%).
3. **No hay ni una sola leyenda de cashback.** Ni la palabra Créditos, ni tope por pedido, ni presupuesto, ni "hasta agotar presupuesto". Cashback es el 55% de lo que genera RappiMind. Las únicas fuentes de leyenda de cashback que tienes son las piezas reales 1, 3 y 4 de la sección 4 y las tres reglas del criterio Legal CO 2024 de la sección 3.3.
4. **Casi nada de concursos.** Solo "Aplican T&C, link y vigencia".
5. **Nada de Rappi Travel ni del modelo de 15 minutos.**
6. **Brasil solo aparece para apuestas.**
7. **Parte del catálogo no es texto**: el ícono +18, la gota de BAT, los octógonos, la etiqueta del Ministerio de Salud de Chile, los sellos de COLJUEGOS y SuperSalud.
8. **El único mecanismo de ahorro de espacio documentado** es cambiar "Prohibido para menores de 18 años" por el ícono +18.

### 5.4 Contradicciones que ya detectamos

1. Dos leyendas distintas para casas de apuestas: la del playbook SSL para Colombia exige el sello de COLJUEGOS y SuperSalud, el código y el rollover; la del playbook de Sponsors no menciona ninguna de las tres, dice "empresa independiente a Rappi®" en vez de "a Rappi S.A.S." y no dice a qué país aplica.
2. Awareness: Colombia dice "Sin legales", México "Aplican T&C", Chile "Sujeto a disponibilidad dentro de la aplicación Rappi", y Perú, Ecuador y Argentina que no se colocan legales.
3. La diapositiva de apuestas con beneficios de México es copia exacta de la de apuestas sin beneficios.
4. El INAH aparece en ejemplos donde el texto no lo pide.
5. "Empresa independiente al Grupo Rappi" contra "a Rappi S.A.S.".
6. Costa Rica y Uruguay están agrupados con Chile en una caja que solo habla de concursos y awareness, y no hay leyendas de descuento para esos dos países, aunque RappiMind ya los tiene en pruebas con cashback.

Busca las demás.

## 6. El problema de secuencia del enlace

Casi todas las leyendas piden el enlace de los T&C. Hay tres situaciones distintas y quiero que las trates por separado:

1. **Descuentos y cupones con T&C general** (sección 3.2): el enlace es fijo y existe antes de la pieza. No hay problema de secuencia.
2. **Campañas que RappiMind genera** (cashback, concursos, 15 minutos, Travel, Brasil): el T&C se publica a mano en Squarespace después de generarlo, y la dirección final solo se confirma al publicar. La herramienta ya propone la dirección del evento (por ejemplo `el-corral-50-cashback-20-sep-2026`), pero Squarespace puede agregarle la fecha a la ruta, como se ve en los enlaces reales de la sección 3.2 (`/2026/9/7/...`). La pieza normalmente se diseña antes de publicar el T&C.
3. **La pieza 4** muestra lo que pasa hoy: el diseñador deja `XXXXXXXXXXXXXXXX` y nadie lo rellena.

Dime cómo lo resolverías y la consecuencia legal de cada opción: generar la leyenda en un segundo momento, cuando ya hay enlace; dejar el enlace como el único dato que se pega al final, con una leyenda que sale incompleta a propósito y una señal visible de que falta; usar un enlace genérico por país que redirija; o lo que se te ocurra. Ten en cuenta la regla 2: una leyenda a medio llenar no se publica.

## 7. Qué tienes que entregar

### A. Catálogo de leyendas por tipo de campaña, país y tipo de pieza

Los tipos de campaña son los de la sección 3.1, más los descuentos y cupones con T&C general de la sección 3.2, más las categorías de los playbooks (awareness, Turbo, licores, nicotina, casas de apuestas, Mundial).

Los tipos de pieza que tenemos que cubrir son, como mínimo: arte de campaña con texto de apoyo y letra pequeña (como las cuatro piezas reales), banner dentro de la app, splash o pieza de pantalla completa, notificación push, correo electrónico, historia de Instagram, valla u otra pieza exterior, y pieza impresa u offline.

Para cada cruce de campaña, país y pieza dime qué leyenda va. Si el playbook no lo resuelve, dilo y propón el criterio. Los países son Colombia, México, Perú, Argentina, Chile, Ecuador, Uruguay, Costa Rica y Brasil, pero prioriza Colombia, que es el 99,7% de las solicitudes reales, y dentro de Colombia prioriza cashback, que es lo que más se genera y lo que los playbooks no traen.

### B. Qué datos variables lleva cada leyenda

Para cada leyenda, la lista de marcadores de la sección 3.4 que usa. Si una leyenda necesita un dato que no está en esa lista, sepáralo en una sección aparte llamada **"Datos nuevos que habría que pedir"**, con cuántas leyendas lo necesitan, si se podría deducir de algo que ya tenemos, y con qué nombre de marcador lo propones. Quiero esa lista lo más corta posible, porque cada dato nuevo es una pregunta más para un comercial que quiere cerrar en cinco minutos.

Trata aparte los descuentos y cupones con T&C general: hoy la herramienta no les pregunta nada, así que dime qué mínimo habría que preguntar para armarles la leyenda, o si la leyenda de un descuento puede salir solo del enlace fijo y de lo que la propia pieza ya muestra.

### C. Reglas de espacio

Una leyenda de banner no puede tener la longitud de una de valla. Necesito reglas concretas de cuánto texto cabe en cada tipo de pieza. Si los playbooks traen límites, úsalos literalmente y cítalos con archivo y diapositiva. Si no los traen, que es casi siempre, propón un límite de caracteres por pieza y **di que es propuesta tuya**, explicando de dónde sale (por ejemplo, de los ejemplos de arte del playbook de Sponsors o de las cuatro piezas reales, cuyas letras pequeñas puedes medir).

### D. Qué pasa cuando la leyenda no cabe

Para cada tipo de campaña, **cuál es el mínimo que no se puede quitar**, con el orden exacto en que se van eliminando las partes cuando falta espacio. Quiero una jerarquía, no una recomendación vaga: primero se quita esto, después esto, y esto de aquí nunca se quita porque lo exige tal norma o tal regla del criterio Legal CO 2024. Si el mínimo tampoco cabe, dime qué hacer: cambiar el formato, mover la leyenda a otro lugar del arte (girarla, como en los ejemplos del playbook de Sponsors), o no publicar.

### E. Cuándo una leyenda no basta

Los casos donde la letra pequeña no alcanza y hay que remitir obligatoriamente al T&C completo, o escalar a Legal. Para cada caso, la señal que lo dispara redactada como una pregunta de sí o no que se le pueda hacer al comercial, del estilo de las que ya hace la herramienta ("¿Hay azar: sorteo, rifa, raspa y gana o ruleta?").

### F. Lo que no es texto

Una lista aparte de los elementos gráficos obligatorios (ícono +18, gota de BAT, octógonos, etiqueta del Ministerio de Salud de Chile, sellos de COLJUEGOS y SuperSalud, y los que encuentres), con el país y la categoría donde son obligatorios, para que la herramienta al menos le avise al comercial que la pieza los necesita.

### G. Las cuatro piezas reales, corregidas

Como prueba de que el catálogo sirve: para cada una de las cuatro piezas de la sección 4, escribe cómo habrían quedado el texto de apoyo y la letra pequeña si hubieran salido del catálogo, con los marcadores ya reemplazados por los datos de esa campaña. Si para alguna te falta un dato, dilo.

## 8. Cómo quiero marcar el origen de cada cosa

Esto es lo que más me importa, porque cambia quién lo aprueba: lo que viene de un playbook lo confirma Legal; lo que propones tú lo tengo que aprobar yo como texto nuevo. Así que **cada frase de leyenda** lleva una de estas etiquetas al lado, sin excepción:

- `[PLAYBOOK SSL, diapositiva N]` o `[PLAYBOOK SPONSORS, diapositiva N]`: texto copiado literal del archivo.
- `[PIEZA REAL N]`: texto tomado de una de las cuatro piezas de la sección 4.
- `[CRITERIO LEGAL CO 2024]`: regla de la tabla de la sección 3.3.
- `[PROPUESTA]`: lo escribiste tú porque no existe en ninguna fuente.

Una leyenda que mezcle frases de varios orígenes lleva la etiqueta en cada frase. Quiero poder distinguir de un vistazo lo aprobado de lo propuesto.

## 9. En qué formato quiero la respuesta

### 9.1 Primero, el catálogo en fichas

Una ficha por leyenda, así:

```
Identificador: leyenda_cashback_letra_pequena_co
País: CO
Tipo de campaña: cashback
Tipo de pieza: letra pequeña de arte de campaña
Texto:
  Promoción válida del {{FECHA_INICIO}} al {{FECHA_FIN}} [PIEZA REAL 1] ...
Marcadores usados: {{FECHA_INICIO}} (día de inicio), {{TOPE}} (tope por pedido), ...
Marcadores nuevos: {{URL_TC_CAMPANA}} (el enlace publicado)
Largo estimado con datos reales: 310 caracteres
Mínimo irreductible: ... y por qué (norma o regla)
Orden de recorte: 1. ..., 2. ..., 3. ...
Remite al T&C completo: sí o no, y por qué
Elementos gráficos obligatorios: ninguno
Pendiente para Legal: ...
```

Los identificadores van en minúsculas, con guion bajo, y empiezan por `leyenda_`. Los tipos de campaña usan los identificadores de la sección 3.1. Los países usan el código de dos letras: CO, MX, PE, AR, CL, EC, UY, CR, BR.

### 9.2 Después, el bloque "PARA EL REPOSITORIO"

Al final de tu respuesta, un bloque de código por leyenda, en el formato exacto de nuestros modelos, para que yo lo pueda convertir en archivos sin reescribir nada. Las líneas que empiezan por `%%` son metadatos y no salen en el texto; después va el texto de la leyenda con sus marcadores y sus tramos opcionales:

```
%% id: leyenda_cashback_letra_pequena_co
%% pais: CO
%% tipo_campana: cashback
%% tipo_pieza: letra_pequena
%% origen: pieza_real_1, criterio_legal_co_2024, propuesta
%% largo_max: 320
%% minimo_irreductible: enlace, vigencia, tope
Promoción válida del {{FECHA_INICIO}} al {{FECHA_FIN}} o hasta agotar el presupuesto disponible.[[?TEXTO_MINIMO_COMPRA]] {{TEXTO_MINIMO_COMPRA}}.[[/?]] Cashback máximo de {{TOPE}} por pedido. Aplican términos y condiciones: {{URL_TC_CAMPANA}}
```

En ese bloque solo pueden aparecer los marcadores de la sección 3.4 y los que hayas declarado en "Datos nuevos que habría que pedir". Ninguno más.

### 9.3 Y al cierre, tres listas cortas y separadas

1. Qué queda listo para convertir en modelo (solo lo que venga entero de un playbook, de una pieza real o del criterio Legal CO 2024).
2. Qué preguntas tiene que responder Legal antes de seguir, numeradas, con la pregunta redactada como pregunta.
3. Qué insumos faltan que nadie nos ha dado (por ejemplo, la Guía de Propiedad Intelectual y la Carta de Indemnidad que el playbook de Sponsors cita y no vienen adjuntas).

## 10. Cómo quiero que trabajes

- Lee los dos playbooks completos antes de empezar. Son dieciséis diapositivas cada uno.
- Sé fiel a la letra. Si una frase del playbook está mal escrita o rota, transcríbela igual y anótala en pendientes.
- Donde las fuentes se contradigan, no elijas por tu cuenta: muestra las versiones, di dónde está cada una y formula la pregunta concreta que tiene que responder Legal.
- No inventes leyendas de cashback "porque es obvio lo que debería decir". Ármalas con las piezas reales y con el criterio Legal CO 2024, y donde tengas que agregar una frase, etiquétala `[PROPUESTA]`.
- Sé concreto con los números: largo en caracteres, no "corto" o "largo".
- Todo en español, y sin guiones como signo de puntuación en ningún texto que propongas. Los textos copiados de los playbooks van tal cual, con su puntuación.

FIN DEL ENCARGO
