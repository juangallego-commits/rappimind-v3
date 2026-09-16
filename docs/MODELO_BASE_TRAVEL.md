# Rappi Travel: modelo base, formulario y reglas

Versión 1 · 16 de septiembre de 2026 · Preparado por Claude (chat) para Juan Camilo Gallego · Insumo para Claude Code

Acompaña a `docs/INVESTIGACION_TRAVEL.md`. Aquí están los textos legales propuestos, el formulario, los textos por opción, las validaciones, el filtro de entrada y los casos de prueba de los dos tipos de Travel: `cashback_travel` y `descuento_travel`.

## 0. Cómo leer este documento

1. Cada cláusula trae su **origen** y su **estado**:
   * **TAL CUAL**: se copia de la fuente; solo cambian el nombre de la entidad, los términos definidos ("Rappi Travel", "Beneficio", "orden") y la puntuación.
   * **AJUSTADO**: cambia algo frente a la fuente; se dice qué.
   * **NUEVO**: no existía en ninguna fuente; Juan lo revisa en el punto de control.
   * **PENDIENTE**: falta una decisión de Juan; se implementa con el texto propuesto y se anota en `docs/PENDIENTES_LEGAL.md`.
2. Los datos variables van entre comillas angulares, «así». Las condiciones de aparición van en cursiva al inicio: *Solo si…*
3. Este documento no usa la sintaxis del motor a propósito. Claude Code la aplica (placeholders, bloques opcionales, inclusiones, ORACIÓN y FRAGMENTO) y respeta todas las reglas de `CLAUDE.md`.
4. Fuentes:
   * **v3**: modelos y bloques de `modelos/` (Cashback aprobado en julio de 2026).
   * **Modelo junio**: `Modelo_Cashback_Travel` del Drive de Juan (30 de junio de 2026).
   * **Bloque 2026**: párrafos que Legal usa en los T&C de Travel desde marzo de 2026.
   * **UA 2025**: T&C de la campaña de Universal Assistance de agosto de 2025.
   * **Solicitudes**: hoja "Respuestas de formulario 8".

## 1. Datos de país (solo Colombia)

Agregar a la fila CO de `data/paises.json` un bloque `travel`. Los demás países no lo tienen y por eso no ofrecen los tipos de Travel. Los datos que Travel comparte con Rappi (país legal, ley aplicable, jurisdicción, autoridad de datos, moneda, término de días, hora local, texto de derechos de datos, URL de T&C de la Plataforma y de Créditos) se toman de la fila CO sin cambios.

| Llave | Valor | Estado |
|---|---|---|
| entidad | Travel Moustache S.A.S. | confirmado |
| id_fiscal | NIT 901.337.236 con dígito de verificación 7, en el mismo formato que usa hoy `id_fiscal` de Rappi S.A.S. | confirmado |
| rnt | 79000 | PENDIENTE: Juan escribió 901337236, que es el NIT; el certificado y las respuestas a la SIC dicen 79000 |
| rnt_vence | 31 de marzo de 2027, en el formato de fechas del repo | PENDIENTE: dato de las notas de Juan; el certificado del Drive vencía el 31 de marzo de 2026 |
| url_sitio | www.travel.rappi.com.co | confirmado (T&C publicados) |
| url_tc_travel | https://travel.rappi.com.co/terms | confirmado (T&C publicados) |
| politica_privacidad | vacío | PENDIENTE: nombre de la política de datos de Travel Moustache |
| url_privacidad | vacío | PENDIENTE |
| entidad_vigilancia | la Superintendencia de Industria y Comercio y la Superintendencia de Transporte, según corresponda | PENDIENTE (propuesta) |

Mientras un dato obligatorio esté vacío, o la fecha de hoy sea posterior a `rnt_vence`, la herramienta no genera T&C de Travel y explica por qué. Las pruebas usan valores de prueba.

## 2. Categorías de Travel

Guardar en `data/categorias_travel.json`, en este orden y con estos nombres exactos (captura de la app del 16 de septiembre de 2026). En el T&C van entre comillas.

1. Hoteles
2. Vuelos
3. Paquetes
4. Tours y Actividades
5. Autos
6. Hoteles por horas
7. Marriott Bonvoy
8. Asistencia

Grupos que usa el formulario:
* **Aéreas:** Vuelos y Paquetes.
* **Alojamiento:** Hoteles, Hoteles por horas, Marriott Bonvoy y Paquetes.
* **Autos:** Autos.

## 3. Segmentos (PENDIENTE: Juan confirma la lista)

| Opción | Texto (ORACIÓN) | Estado |
|---|---|---|
| todos | Pueden participar todos los Usuarios/Consumidores de la Plataforma Rappi que sean mayores de edad. | TAL CUAL (v3) |
| pro | Pueden participar los Usuarios/Consumidores que tengan activa la suscripción RappiPro y/o RappiPro Black. | TAL CUAL (v3) |
| pro_black | Pueden participar únicamente los Usuarios/Consumidores que tengan activa la suscripción RappiPro Black. | NUEVO |
| pro_o_rappicard | Pueden participar los Usuarios/Consumidores que tengan activa la suscripción RappiPro y/o RappiPro Black, así como los que paguen la orden con su tarjeta RappiCard. | NUEVO (Solicitudes 2024 a 2026) |
| sin_pro | Pueden participar únicamente los Usuarios/Consumidores que no tengan activa la suscripción RappiPro ni RappiPro Black. | NUEVO (Solicitudes 2024) |
| primera_compra | Pueden participar únicamente los Usuarios/Consumidores que realicen su primera compra en los Sistemas Rappi Travel durante la vigencia de la Campaña. | NUEVO (repositorio de T&C de Travel de 2023) |

## 4. Formulario

### 4.1 `cashback_travel`

Los identificadores son sugeridos. Las preguntas y ayudas finales las escribe Claude Code con el tono de `docs/PREGUNTAS_KAM.md`.

**Paso 1. Campaña**

| Campo | Pregunta | Tipo | Obligatorio | Visible si | Alimenta |
|---|---|---|---|---|---|
| nombreCampana | ¿Cómo se llama la campaña? | texto corto | sí | siempre | título |

**Paso 2. Organizador**

| Campo | Pregunta | Tipo | Obligatorio | Visible si | Alimenta |
|---|---|---|---|---|---|
| organizadorRazonSocial | ¿Qué empresa organiza y paga el beneficio? Normalmente es la dueña de la marca. | texto | sí | siempre | cláusula 1 |
| organizadorId | NIT de esa empresa | identificación | sí | siempre | cláusula 1 |
| marcaAliado | Si solo participan productos de una marca, escríbela como la ve el usuario. Si participan todas, déjalo vacío. | texto corto | no | siempre | cláusula 6 |

**Paso 3. Productos**

| Campo | Pregunta | Tipo | Obligatorio | Visible si | Alimenta |
|---|---|---|---|---|---|
| categorias | ¿Qué categorías participan? | casillas (sección 2) | sí, al menos una | siempre | cláusula 6 |
| ambito | ¿Viajes nacionales, internacionales o ambos? | lista | sí | siempre | cláusula 6 |
| destinos | ¿Solo algunos destinos? Ciudades o países separados por comas | texto de lista | no | siempre | cláusula 6 |
| hotelesModo | ¿Qué hoteles participan? Todos; solo algunos; los que tengan la etiqueta de la campaña | lista | sí | hay una categoría de alojamiento | cláusula 6 |
| hotelesLista | Nombres de los hoteles, separados por comas | texto de lista | sí | hotelesModo = solo algunos | cláusula 6 |

**Paso 4. Condiciones de los productos** (todas alimentan la cláusula 7, salvo donde se indica)

| Campo | Pregunta | Tipo | Obligatorio | Visible si |
|---|---|---|---|---|
| aerolinea | ¿Solo vuelos de una aerolínea? ¿Cuál? | texto corto | no | hay una categoría aérea |
| soloOperados | ¿Solo vuelos operados directamente por esa aerolínea, sin código compartido? | casilla | no | aerolinea con valor |
| trayecto | ¿Qué trayectos aplican? Cualquiera; solo ida y regreso; solo ida | lista | sí | hay una categoría aérea |
| conteoIdaRegreso | En compras de ida y regreso, ¿cómo se cuentan los límites? Como una orden; cada trayecto como una orden (alimenta la cláusula 9) | lista | sí | hay una categoría aérea y trayecto distinto de solo ida |
| clasesExcluidas | ¿Hay clases tarifarias excluidas? Letras separadas por comas | texto de letras | no | hay una categoría aérea |
| soloOrigenPais | ¿Solo vuelos que salen de Colombia? | casilla | no | hay una categoría aérea |
| anticipacionDias | ¿Hay que comprar con días de anticipación? ¿Cuántos? | número de 1 a 365 | no | hay una categoría aérea |
| periodoViaje | ¿El viaje o el uso tiene que ser entre ciertas fechas? | rango de fechas | no | siempre |
| ambasFechasDentro | ¿Los dos trayectos deben quedar dentro de esas fechas? | casilla | no | trayecto = solo ida y regreso y periodoViaje con valor |
| fechasExcluidas | ¿Hay fechas en las que no aplica? | lista de fechas | no | hay una categoría de alojamiento o Autos |
| nochesMinimas | ¿Mínimo de noches? | número | no | hay Hoteles, Marriott Bonvoy o Paquetes |
| diasAlquiler | ¿Mínimo y máximo de días de alquiler? | dos números | no | hay Autos |
| compraMinima | ¿Hay compra mínima? ¿De cuánto? | número, o casilla "sin compra mínima" | sí (responder) | siempre |
| otraCondicion | ¿El aliado pide otra condición que no está aquí? | sí o no; sí manda a Legal | sí | siempre |

**Paso 5. Fechas**

| Campo | Pregunta | Tipo | Obligatorio | Alimenta |
|---|---|---|---|---|
| fechaInicio, horaInicio, fechaFin, horaFin | Inicio y fin de la campaña (se permiten franjas dentro del mismo día, por ejemplo de 6:00 p. m. a 8:00 p. m.) | fecha y hora | sí | cláusula 4 |

**Paso 6. Participantes**

| Campo | Pregunta | Tipo | Obligatorio | Alimenta |
|---|---|---|---|---|
| segmento | ¿Quiénes pueden participar? | lista (sección 3) | sí | cláusula 5 |
| metodoPago | ¿Con qué medios de pago? Digitales excepto efectivo; solo RappiCard | lista | sí | cláusulas 8 y 15 |

**Paso 7. Beneficio**

| Campo | Pregunta | Tipo | Obligatorio | Visible si | Alimenta |
|---|---|---|---|---|---|
| formaBeneficio | ¿Porcentaje del valor pagado o monto fijo en Créditos? | lista | sí | siempre | cláusula 8 |
| porcentaje | ¿Qué porcentaje del valor pagado se devuelve? | entero de 1 a 99 | sí | porcentaje | cláusulas 8 y 9 |
| tope | ¿Cuál es el máximo por orden? | número, o casilla "sin tope" | sí (responder) | porcentaje | cláusulas 8 y 9 |
| montoFijo | ¿Cuántos Créditos por orden? | número | sí | monto fijo | cláusula 8 |
| limitePorUsuario | ¿En cuántas órdenes puede recibir el beneficio cada persona? | número mayor o igual a 1 | sí | siempre | cláusula 9 |
| presupuesto | ¿Cuál es el presupuesto total en Créditos? | número | sí | siempre | cláusulas 4 y 9 |
| maxOrdenes | ¿Hay un máximo de órdenes con beneficio en toda la campaña? | número, o casilla "sin máximo" | sí (responder) | siempre | cláusulas 4 y 9 |

**Paso 8. Créditos**

| Campo | Pregunta | Tipo | Obligatorio | Visible si | Alimenta |
|---|---|---|---|---|---|
| carga | ¿Cuándo llegan los Créditos? Al confirmarse la reserva; unos días calendario después del fin; unos días hábiles después del fin | lista | sí | siempre | cláusula 11 |
| diasCarga | ¿Cuántos días? | número de 1 a 30 | sí | carga distinta de "al confirmarse" | cláusula 11 |
| diasVigencia | ¿Cuántos días calendario tiene la persona para usarlos? | número de 1 a 365 | sí | siempre | cláusula 13 |
| redencion | ¿Dónde se pueden usar? Solo en algunas categorías de Travel; en todo Travel; en Travel y en toda la Plataforma Rappi | lista | sí | siempre | cláusulas 12 y 13 |
| categoriasRedencion | ¿En cuáles categorías? | casillas (sección 2) | sí, al menos una | redencion = algunas categorías | cláusula 13 |

**Paso 9. Comunicación y declaraciones**

| Campo | Pregunta | Tipo | Obligatorio |
|---|---|---|---|
| fechaPrimeraComunicacion | ¿Qué día sale la primera pieza, mensaje, push o banner? | fecha | sí |
| linkAnterior | Si esta campaña repite una anterior, pega su link | link de promos.rappi.com | no |
| aliadoAprobo | Confirmo que el aliado aprobó esta mecánica. | casilla | sí |
| declaracionPiezas | Confirmo que las piezas, los mensajes y las etiquetas de la app dicen lo mismo que este T&C (porcentaje, la palabra "hasta" junto al tope y las categorías donde se usan los Créditos) y que nada sale antes de publicarlo. | casilla | sí |
| declaracion | La declaración de v3. | casilla | sí |

### 4.2 `descuento_travel`

Pasos 1 a 6 y 9 iguales a `cashback_travel`. No hay paso 8. En la declaración de piezas, "la palabra 'hasta' junto al tope" se cambia por "el porcentaje mínimo y el máximo". El paso 7 queda así:

| Campo | Pregunta | Tipo | Obligatorio | Visible si | Alimenta |
|---|---|---|---|---|---|
| formaDescuento | ¿El porcentaje es fijo o cambia según el producto? | lista | sí | siempre | cláusula 8 |
| porcentaje | Fijo: ¿qué porcentaje? Variable: ¿cuál es el máximo? | entero de 1 a 99 | sí | siempre | cláusula 8 |
| porcentajeMinimo | ¿Cuál es el mínimo? | entero de 1 al porcentaje menos 1 | sí | variable | cláusula 8 |
| productosConMaximo | ¿A cuántos productos aplica el máximo? | número mayor o igual a 1 | sí | variable | cláusula 8 |
| visibilidad | ¿Dónde ve la persona el descuento? Página de inicio de Travel; etiqueta del producto; precio tachado en el flujo de compra | casillas | sí, al menos una | siempre | cláusula 9 |
| limitePorUsuario | ¿Máximo de órdenes con descuento por persona? | número, o casilla "sin límite" | sí (responder) | siempre | cláusula 10 |
| unidades | ¿La promoción termina al agotarse un número de unidades? ¿Cuántas? | número, o casilla "no depende de unidades" | sí (responder) | siempre | cláusulas 4 y 10 |

Regla: si se marca "Asistencia", debe ser la única categoría.

## 5. Textos por opción (derivados)

Los números van en letras y en cifra, con las funciones de v3 (`porcentajeEnLetras`, `cantidadCreditos`, `montoConMoneda`, `numeroEnLetras`). Las listas se unen con comas y "y" (`listaY`).

**TEXTO_SEGMENTO_TRAVEL** (ORACIÓN): sección 3.

**TEXTO_METODO_PAGO_TRAVEL** (ORACIÓN)
* digitales: Campaña válida para órdenes pagadas con cualquier medio de pago digital habilitado en los Sistemas Rappi Travel, excepto efectivo. No se obtendrá el Beneficio respecto de órdenes pagadas parcial o totalmente con Créditos de la Plataforma. (Bloque 2026, AJUSTADO: "en Rappi Travel" pasa a "en los Sistemas Rappi Travel")
* rappicard: Campaña válida únicamente para órdenes pagadas en su totalidad con RappiCard. No se obtendrá el Beneficio respecto de órdenes pagadas parcial o totalmente con Créditos de la Plataforma. (v3 y Bloque 2026, AJUSTADO)
* Regla: si el segmento es pro_o_rappicard, el medio de pago debe ser "digitales".

**TEXTO_PRODUCTOS** (ORACIÓN)
* con marca: Participan exclusivamente las compras de productos de **«marca»** en «la categoría “X”» o «las categorías “X”, “Y” y “Z”» de los Sistemas Rappi Travel, realizadas durante la vigencia de la Campaña (en adelante, los “Productos Participantes”).
* sin marca: Participan exclusivamente las compras de productos de «la categoría “X”» o «las categorías “X”, “Y” y “Z”» de los Sistemas Rappi Travel, realizadas durante la vigencia de la Campaña (en adelante, los “Productos Participantes”).
* Si están marcadas las ocho categorías, «las categorías…» se reemplaza por "todas las categorías".
* Estado: AJUSTADO (Modelo junio, cláusula 6).

**TEXTO_AMBITO** (ORACIÓN, NUEVO)
* nacional: Aplica únicamente para vuelos con origen y destino en «país legal» y para servicios que se presten en «país legal».
* internacional: Aplica únicamente para vuelos con origen o destino fuera de «país legal» y para servicios que se presten fuera de «país legal».
* ambos: no se incluye.

**TEXTO_DESTINOS** (ORACIÓN, NUEVO, solo si hay destinos): Aplica únicamente para los siguientes destinos: «lista».

**TEXTO_HOTELES** (ORACIÓN, NUEVO)
* todos: no se incluye.
* algunos: En las categorías de alojamiento, participan únicamente los siguientes hoteles: «lista».
* etiqueta: En las categorías de alojamiento, participan únicamente los hoteles identificados con la etiqueta de la Campaña en los Sistemas Rappi Travel.

**Viñetas de la cláusula 7** (ORACIÓN cada una, NUEVO; origen: Solicitudes y T&C de 2024 a 2026)
* soloOperados: Los vuelos deben ser operados directamente por **«aerolínea»**. Quedan excluidos los vuelos operados por aerolíneas aliadas bajo acuerdos de código compartido y las rutas operadas por otras compañías aéreas.
* aerolinea sin soloOperados: Los vuelos deben ser de **«aerolínea»**.
* trayecto ida y regreso: La compra debe ser de vuelos de ida y regreso. No aplica para compras solo de ida ni para itinerarios con varios destinos.
* trayecto solo ida: La compra debe ser de vuelos solo de ida.
* trayecto cualquiera: no se incluye.
* ambasFechasDentro: En las compras de ida y regreso, las fechas de los dos trayectos deben estar dentro del periodo de viaje de la Campaña; de lo contrario, el Beneficio no aplica para ninguno de los dos trayectos.
* clasesExcluidas: No aplica para las clases tarifarias «letras unidas con "y"».
* soloOrigenPais: Los vuelos deben tener origen en «país legal».
* anticipacionDias: La compra debe hacerse con al menos «N en letras» («N») días calendario de anticipación a la fecha de salida.
* periodoViaje: El viaje o el uso del servicio debe realizarse entre el «fecha» y el «fecha».
* fechasExcluidas: No aplica para viajes o servicios en las siguientes fechas: «lista de fechas».
* nochesMinimas: La reserva de hotel debe ser de «N en letras» («N») noches o más.
* diasAlquiler: El alquiler de auto debe ser de entre «N en letras» («N») y «M en letras» («M») días.
* compraMinima: El valor pagado por la orden debe ser igual o superior a **«monto con moneda»**.

**TEXTO_BENEFICIO** (FRAGMENTO, AJUSTADO de v3)
* porcentaje con tope: el **«porcentaje»** del valor pagado por tu orden, sin que puedas recibir más de **«tope»** por orden
* porcentaje sin tope: el **«porcentaje»** del valor pagado por tu orden, sin un tope por orden
* monto fijo: **«monto en Créditos»** por cada orden que cumpla las condiciones de la Campaña

**TEXTO_BASE_CALCULO** (ORACIÓN, solo porcentaje; AJUSTADO de Bloque 2026 y Modelo junio; PENDIENTE impuestos y tasas): El Beneficio aplica únicamente sobre el valor pagado con dinero real por la tarifa o la reserva de los Productos Participantes, sin incluir cargos por servicio, asistencias o seguros de viaje ni otros servicios adicionales.
* Si "Asistencia" es una categoría participante, se quita "asistencias o seguros de viaje".

**TEXTO_EJEMPLO_TOPE** (ORACIÓN, NUEVO, solo porcentaje con tope; cifras sin letras): Por ejemplo, para recibir el máximo de «tope en cifras» Créditos en una orden, el valor pagado debe ser de al menos «umbral con moneda»; si pagas menos, recibirás el «porcentaje en cifra» de lo pagado.
* umbral = tope dividido por el porcentaje, redondeado hacia arriba al peso.

**TEXTO_LIMITE_ORDENES** (FRAGMENTO, AJUSTADO de v3)
* número: cada Usuario/Consumidor podrá recibir el Beneficio hasta en «N en letras» («N») órdenes durante la vigencia de la Campaña. Con N = 1: "en una (1) orden".
* sin límite (solo descuento): no hay un límite de órdenes por Usuario/Consumidor.

**TEXTO_AGOTAMIENTO_VIGENCIA** (FRAGMENTO, NUEVO)
* cashback sin máximo de órdenes: el presupuesto disponible de **«presupuesto»**
* cashback con máximo de órdenes: el presupuesto disponible de **«presupuesto»** o el máximo de «N en letras» («N») órdenes con Beneficio
* descuento con unidades: las «N en letras» («N») unidades con descuento
* descuento sin unidades: no se incluye (la cláusula 4 queda sin "o hasta agotar…, lo que ocurra primero").

**TEXTO_LIMITE_CAMPANA** (ORACIÓN, NUEVO)
* solo presupuesto: La Campaña tiene un presupuesto total de **«presupuesto»**. Una vez agotado, la Campaña finalizará automáticamente, aunque no haya terminado su vigencia.
* presupuesto y órdenes: La Campaña tiene un presupuesto total de **«presupuesto»** y un máximo de «N en letras» («N») órdenes con Beneficio. Cuando se agote cualquiera de los dos, la Campaña finalizará automáticamente, aunque no haya terminado su vigencia.
* unidades (descuento): La Campaña cuenta con «N en letras» («N») unidades con descuento. Una vez agotadas, la Campaña finalizará automáticamente, aunque no haya terminado su vigencia.

**TEXTO_CONTEO_IDA_REGRESO** (FRAGMENTO, NUEVO)
* una orden: una compra de ida y regreso cuenta como una (1) orden, y el Beneficio se calcula sobre el valor total pagado por la compra.
* cada trayecto (PENDIENTE): en una compra de ida y regreso, cada trayecto cuenta como una (1) orden, y el Beneficio se calcula sobre el valor pagado por cada trayecto.

**TEXTO_CARGA_TRAVEL** (FRAGMENTO, AJUSTADO de Modelo junio, cláusula 9, y Solicitudes)
* al confirmarse: una vez se confirme la emisión de tu reserva
* días calendario: dentro de los «N en letras» («N») días calendario siguientes a la finalización de la Campaña, siempre que tu reserva esté confirmada
* días hábiles: dentro de los «N en letras» («N») días hábiles siguientes a la finalización de la Campaña, siempre que tu reserva esté confirmada

**TEXTO_VIGENCIA_CREDITOS**: el derivado de v3, opción "por días".

**TEXTO_REDENCION_TRAVEL** (ORACIÓN, NUEVO)
* algunas categorías: Los Créditos podrán redimirse únicamente en «la categoría/las categorías» «lista» de los Sistemas Rappi Travel y no podrán usarse en «la categoría/las categorías» «lista de las no marcadas».
* todo Travel (o las ocho marcadas): Los Créditos podrán redimirse en cualquier categoría de los Sistemas Rappi Travel.
* Travel y Plataforma (PENDIENTE): Los Créditos podrán redimirse en cualquier categoría de los Sistemas Rappi Travel y en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos.

**TEXTO_DESCUENTO** (FRAGMENTO, NUEVO)
* fijo: un descuento del **«porcentaje»**
* variable: un descuento de entre el **«mínimo»** y el **«máximo»**, según el Producto Participante

**TEXTO_MAXIMO_DISPONIBLE** (ORACIÓN, NUEVO, solo variable): El descuento máximo del **«máximo»** aplica a «N en letras» («N») de los Productos Participantes.

**TEXTO_VISIBILIDAD** (FRAGMENTO, AJUSTADO de una solicitud de hoteles de octubre de 2024): lista unida con "y" de las opciones marcadas: "la página de inicio de los Sistemas Rappi Travel", "la etiqueta de cada Producto Participante", "el precio tachado del flujo de compra".

**TEXTO_ASISTENCIA** (ORACIÓN, AJUSTADO de UA 2025, solo si la categoría es "Asistencia"): El descuento aplica únicamente sobre el valor de la asistencia al viajero y no sobre el valor de los vuelos o paquetes con los que se compre.

## 6. Modelo `cashback_travel`

Título y subtítulo como en v3: "TÉRMINOS Y CONDICIONES" y el nombre de la campaña en mayúsculas.

**Cláusula 1. Organizador y rol de Rappi Travel.** Origen: bloque `organizador` de v3 y Modelo junio, cláusulas 1 y 2. Estado: AJUSTADO (ver R1).
> La presente campaña promocional (en adelante, la “Campaña”) es organizada por **«razón social del Organizador»**, identificada con **«identificación del Organizador»** (en adelante, el “Organizador”), quien responde por su desarrollo, sus condiciones y el beneficio ofrecido. **«entidad Travel»**, identificada con **«NIT Travel»** e inscrita en el Registro Nacional de Turismo con el número **«RNT»** (en adelante, “Rappi Travel”), actúa como agencia de viajes que opera los Sistemas Rappi Travel y como medio de difusión de la Campaña; Rappi Travel no es el organizador de la Campaña.
> Los términos con mayúscula inicial que no se definan en este documento tendrán el significado que les asignan los Términos y Condiciones de los Sistemas Rappi Travel.

**Cláusula 2. Sistemas Rappi Travel.** Origen: Modelo junio, cláusula 2. Estado: TAL CUAL.
> Para efectos de los presentes Términos y Condiciones, los Sistemas Rappi Travel incluyen, sin limitarse a: (i) la Plataforma Rappi; (ii) la sección “Rappi Travel” dentro de la página web **«url_sitio»**; y (iii) el Botón Rappi Travel.

**Cláusula 3. Cobertura.** Origen: Modelo junio, cláusula 3, y bloque `cobertura_tienda` de v3. Estado: AJUSTADO (se define el Territorio como en v3).
> Esta Campaña es válida exclusivamente para las órdenes realizadas a través de los Sistemas Rappi Travel en **«territorio»** (en adelante, el “Territorio”). La disponibilidad puede variar según tu ubicación y la oferta de los proveedores y operadores turísticos.

**Cláusula 4. Vigencia.** Origen: `cashback` de v3 y Modelo junio, cláusula 4. Estado: AJUSTADO.
> La Campaña estará vigente desde las **«hora inicio»** del **«fecha inicio»** hasta las **«hora fin»** del **«fecha fin»** («texto hora local»), o hasta agotar «TEXTO_AGOTAMIENTO_VIGENCIA», lo que ocurra primero. Las órdenes realizadas fuera de la vigencia no darán lugar al beneficio de la Campaña.

**Cláusula 5. Usuarios participantes.** Origen: bloque `usuarios_beneficio` de v3 y Modelo junio, cláusula 5. Estado: AJUSTADO.
> «TEXTO_SEGMENTO_TRAVEL» Para participar, el Usuario/Consumidor debe ser persona natural mayor de edad, contar con una cuenta activa en la Plataforma Rappi y cumplir los requisitos establecidos en los presentes Términos y Condiciones.

**Cláusula 6. Productos Participantes.** Origen: Modelo junio, cláusula 6, y Solicitudes. Estado: AJUSTADO (la frase sobre el rol de intermediario pasa a la cláusula 1).
> «TEXTO_PRODUCTOS» *Solo si aplica:* «TEXTO_AMBITO» «TEXTO_DESTINOS» «TEXTO_HOTELES»
> Los productos y servicios turísticos son prestados por aerolíneas, hoteles, rentadoras de autos, operadores de tours y actividades y compañías de asistencia al viajero (en adelante, los “Proveedores”), conforme a sus propias condiciones.

**Cláusula 7. Condiciones de los Productos Participantes.** Origen: Solicitudes y T&C de 2024 a 2026. Estado: NUEVO. *Solo si hay al menos una viñeta.*
> El Beneficio aplica únicamente cuando la compra cumple las siguientes condiciones:
> • «viñetas de la sección 5 que apliquen, en el orden de esa lista»

**Cláusula 8. Mecánica y Beneficio.** Origen: `cashback` de v3 y Modelo junio, cláusula 7. Estado: AJUSTADO.
> Para obtener el beneficio de la Campaña (en adelante, el “Beneficio”) debes:
> • Comprar uno o varios Productos Participantes a través de los Sistemas Rappi Travel durante la vigencia de la Campaña.
> • Obtener la confirmación de tu reserva por parte del Proveedor, sin que haya sido cancelada.
> • Pagar la orden con un medio de pago válido para la Campaña.
> «TEXTO_METODO_PAGO_TRAVEL»
> El Beneficio consiste en «TEXTO_BENEFICIO», acreditado como Créditos en tu Billetera de Créditos de la Plataforma Rappi. *Solo si es porcentaje:* «TEXTO_BASE_CALCULO» *Solo si hay tope:* «TEXTO_EJEMPLO_TOPE»

**Cláusula 9. Topes y límites.** Origen: `cashback` de v3 y Modelo junio, cláusula 7. Estado: AJUSTADO.
> • *Solo si hay tope:* **Tope por orden:** el Beneficio máximo por cada orden es de **«tope»**.
> • **Máximo de órdenes por usuario:** «TEXTO_LIMITE_ORDENES»
> • **Límite de la Campaña:** «TEXTO_LIMITE_CAMPANA»
> • *Solo si se preguntó conteoIdaRegreso:* **Compras de ida y regreso:** «TEXTO_CONTEO_IDA_REGRESO»

**Cláusula 10. Confirmación de la reserva.** Origen: Modelo junio, cláusula 8. Estado: AJUSTADO ("en el Back Office de Rappi Travel" pasa a "por parte del Proveedor").
> Debido a la naturaleza de los inventarios turísticos, el Beneficio está sujeto a la confirmación de la reserva por parte del Proveedor. Si por fallas en la conexión con el Proveedor la orden es rechazada y el servicio no se emite, no se otorgará el Beneficio.

**Cláusula 11. Acreditación del Beneficio.** Origen: bloque `acreditacion` de v3 y Modelo junio, cláusula 9. Estado: AJUSTADO; nombre de la sección PENDIENTE.
> Los Créditos correspondientes al Beneficio se acreditarán en tu Billetera de Créditos **«TEXTO_CARGA_TRAVEL»**. Podrás verificar el estado de tus Créditos en la sección «nombre de la sección, PENDIENTE» de la Plataforma Rappi. Rappi Travel se reserva el derecho de verificar la elegibilidad de cada orden antes de acreditar el Beneficio; si la verificación determina que la orden no cumple las condiciones de la Campaña, los Créditos no serán acreditados y se te informará a través de la Plataforma Rappi.

**Cláusula 12. Naturaleza de los Créditos.** Origen: bloque `naturaleza_creditos` de v3 y Modelo junio, cláusula 10; decisión 2 de Juan. Estado: AJUSTADO (ver R2).
> El Beneficio consiste en Créditos que Rappi Travel otorga y acredita en tu Billetera de Créditos de la Plataforma Rappi. Al participar, reconoces y aceptas que:
> • Los Créditos son intangibles que te permiten adquirir los productos y servicios indicados en la cláusula de vigencia y redención.
> • Los Créditos no constituyen dinero en efectivo, valores ni instrumentos financieros, y no pueden convertirse en dinero ni reembolsarse.
> • Los Créditos no son transferibles a terceros ni a otras cuentas de la Plataforma Rappi.
> • Los Créditos no son acumulables con otros cupones o promociones, salvo que se indique expresamente lo contrario.
> • Los Créditos otorgados en virtud de la Campaña se rigen por los presentes Términos y Condiciones.
> *Solo si la redención incluye la Plataforma Rappi (PENDIENTE):* Cuando uses estos Créditos por fuera de los Sistemas Rappi Travel, su uso se regirá además por los Términos y Condiciones de Funcionamiento de los Créditos de la Plataforma Rappi, disponibles en: «URL de T&C de Créditos de la fila CO».

**Cláusula 13. Vigencia y redención de los Créditos.** Origen: bloque `vigencia_creditos` de v3 y Modelo junio, cláusula 11. Estado: AJUSTADO.
> Los Créditos acreditados en virtud de la Campaña **«TEXTO_VIGENCIA_CREDITOS»**. «TEXTO_REDENCION_TRAVEL» Una vez vencidos, los Créditos no podrán ser recuperados, reactivados ni compensados. Eres responsable de redimir tus Créditos dentro del plazo indicado.

**Cláusula 14. Cancelaciones, modificaciones y reembolsos.** Origen: Bloque 2026 ("Política Antifraude, Cancelaciones y Reembolsos") y Modelo junio, cláusula 12; decisiones 4 y 5. Estado: TAL CUAL en las tres primeras viñetas; NUEVO en las dos últimas (ver R3).
> Para proteger la integridad de la Campaña, se establecen de forma estricta las siguientes reglas en caso de modificaciones o cancelaciones de la reserva:
> • **Pérdida del Beneficio:** en caso de cancelación o modificación de la reserva (sea por voluntad del usuario o por políticas del proveedor), el Usuario/Consumidor no recibirá los Créditos promocionales.
> • **Reversión de Créditos:** si al momento de la cancelación los Créditos ya hubieren sido acreditados en la cuenta del usuario en la Plataforma Rappi, estos serán eliminados y revocados automáticamente por el sistema.
> • **Cruce de cuentas (deducción de reembolsos):** si el Usuario/Consumidor hubiere utilizado total o parcialmente los Créditos otorgados como Beneficio y posteriormente la orden original es objeto de cancelación o reembolso, el valor en dinero equivalente a los Créditos efectivamente utilizados será descontado de plano del monto total a reembolsar por concepto de la reserva. El usuario autoriza expresamente a Rappi Travel a realizar dicha deducción de su reembolso.
> • **Reembolso parcial:** si la orden se reembolsa parcialmente, el Beneficio se recalculará sobre el valor final pagado.
> • **Plazo:** estas reglas aplican a las cancelaciones, modificaciones y reembolsos que ocurran antes de la prestación del servicio. Una vez prestado el servicio (realizado el vuelo, la estadía, el alquiler o la actividad), el Beneficio queda en firme y no se revertirá, salvo en casos de fraude comprobado.

**Cláusula 15. Exclusiones y restricciones.** Origen: bloque `exclusiones_beneficio` de v3, Modelo junio, cláusula 13, y Bloque 2026 ("Uso de RappiCard"). Estado: AJUSTADO en la lista; TAL CUAL en el párrafo de RappiCard.
> El Beneficio no aplica para:
> • Órdenes canceladas, reembolsadas o no confirmadas, en los términos de las cláusulas anteriores.
> • Órdenes pagadas con medios de pago diferentes a los aplicables para la Campaña, en efectivo o, total o parcialmente, con Créditos.
> • Órdenes realizadas fuera de la vigencia de la Campaña.
> • Productos que no sean Productos Participantes, aunque se compren en la misma orden.
> El Beneficio obtenido en virtud de la presente Campaña no es acumulable con otras promociones.
> *Solo si el medio de pago admite RappiCard (siempre, con las dos opciones actuales):* En los casos en que el Usuario/Consumidor realice el pago con su tarjeta RappiCard, para asegurar la correcta y automática acreditación del Beneficio, la tarjeta deberá estar registrada de forma nativa dentro de la sección de métodos de pago de la Plataforma Rappi. Aquellas transacciones realizadas con RappiCard a través de billeteras digitales de terceros (tales como Apple Pay o Google Pay) o en las que la tarjeta sea ingresada manualmente como una tarjeta de crédito externa podrían presentar demoras en la validación del Beneficio o requerir una gestión adicional por parte del usuario ante el equipo de soporte, sin que esto implique el incumplimiento de los presentes términos por parte de Rappi Travel.

**Cláusula 16. Publicidad y prevalencia.** Origen: bloque `publicidad` de v3. Estado: TAL CUAL ("Rappi" pasa a "Rappi Travel").
> Las condiciones específicas de la Campaña son las establecidas en los presentes Términos y Condiciones. En caso de discrepancia entre la información contenida en piezas publicitarias, comunicaciones comerciales o cualquier otro medio de difusión y los presentes Términos y Condiciones, se aplicará la condición más favorable para ti. Rappi Travel se compromete a que la publicidad de la Campaña sea veraz, verificable y no te induzca a error.

**Cláusula 17. Atención al usuario.** Origen: bloque `atencion` de v3 y Modelo junio, cláusula 15. Estado: AJUSTADO.
> Para cualquier consulta, petición, queja o reclamo relacionado con la Campaña, puedes comunicarte con Rappi Travel a través de los siguientes canales:
> • El Centro de Ayuda de la Plataforma Rappi.
> • Los canales de atención de Rappi Travel disponibles en **«url_sitio»**.

**Cláusula 18. Modificaciones.** Origen: bloque `modificaciones` de v3. Estado: AJUSTADO ("Rappi" pasa a "Rappi Travel"; se quitan las menciones a premios y comercios; la última frase es NUEVA).
> Rappi Travel podrá modificar los presentes Términos y Condiciones siempre que se cumplan las siguientes condiciones:
> • Las modificaciones se publicarán en el mismo medio en que se publicaron los Términos y Condiciones originales.
> • Las modificaciones no afectarán los Beneficios ya acreditados con anterioridad a la modificación.
> • Las modificaciones que resulten menos favorables para ti regirán a partir del día siguiente a su publicación y no tendrán efecto retroactivo.
> Si las modificaciones implican un cambio sustancial en las condiciones de la Campaña, como la reducción del Beneficio, la modificación de los Productos Participantes o la anticipación de la fecha de finalización, Rappi Travel hará esfuerzos razonables para informarte a través de los Sistemas Rappi Travel. Toda modificación quedará registrada al final de este documento, con su fecha.

**Cláusula 19. Fraude, abuso y descalificación.** Origen: bloque `fraude` de v3 y Modelo junio, cláusula 17. Estado: AJUSTADO ("Rappi" pasa a "Rappi Travel"; se quitan las menciones a premios).
> Rappi Travel se reserva el derecho de descalificarte de la Campaña, de rechazar o cancelar órdenes y de bloquear temporal o definitivamente tu cuenta si, a juicio razonable de Rappi Travel:
> • Utilizas la Campaña de manera fraudulenta, incluido el uso de cuentas múltiples, datos falsos o la manipulación del sistema o del historial de compras.
> • Intentas alterar, manipular o interferir con el funcionamiento de los Sistemas Rappi Travel o de la Campaña.
> • Incumples los Términos y Condiciones de los Sistemas Rappi Travel o de la Plataforma Rappi.
> En caso de descalificación, Rappi Travel podrá revocar los Créditos acreditados en virtud de la Campaña que aún no hayan sido redimidos. Los Créditos ya redimidos no serán objeto de recuperación, salvo en casos de fraude comprobado conforme a la legislación aplicable. Rappi Travel te informará la razón de la descalificación a través de los canales de comunicación de la Plataforma Rappi.

**Cláusula 20. Aplicación de otros Términos y Condiciones.** Origen: bloque `tyc_plataforma` de v3 y Modelo junio, cláusula 19. Estado: AJUSTADO.
> Los presentes Términos y Condiciones son especiales y complementarios respecto de los Términos y Condiciones de los Sistemas Rappi Travel, disponibles en: «url_tc_travel», y de los Términos y Condiciones de Uso de la Plataforma Rappi, disponibles en: «URL de T&C de la Plataforma de la fila CO», los cuales continúan aplicando en todo aquello no regulado expresamente en el presente documento. En caso de contradicción respecto de las condiciones específicas de la Campaña, prevalecerán los presentes Términos y Condiciones.

**Cláusula 21. Limitación de responsabilidad.** Origen: Modelo junio, cláusula 18. Estado: TAL CUAL, con observación (ver R4).
> Rappi Travel actúa como intermediario para la comercialización de productos y servicios turísticos provistos por proveedores y operadores. En consecuencia, Rappi Travel no será responsable por: (i) la prestación, calidad, idoneidad, disponibilidad o cumplimiento de los servicios turísticos a cargo de los proveedores u operadores; (ii) las cancelaciones, modificaciones o penalidades aplicadas por el proveedor, aerolínea u operador conforme a sus propias políticas; (iii) las fallas técnicas, interrupciones o limitaciones en la disponibilidad de los Sistemas Rappi Travel ajenas a su control razonable; ni (iv) los rechazos de órdenes derivados de fallas en la conexión con los proveedores u operadores. Rappi Travel sí es responsable de: (i) la correcta acreditación de los Créditos conforme a las condiciones de la Campaña; (ii) la publicación veraz y completa de los presentes Términos y Condiciones; y (iii) la atención oportuna de tus peticiones, quejas y reclamos relacionados con la Campaña.

**Cláusula 22. Tratamiento de datos personales.** Origen: bloque `datos` de v3 y Modelo junio, cláusula 19. Estado: AJUSTADO (entidad de Travel; se quitan premios y resultados); política PENDIENTE.
> Los datos personales de los participantes serán tratados por **«entidad Travel»** con la finalidad exclusiva de gestionar la participación en la Campaña, verificar el cumplimiento de los requisitos y acreditar el Beneficio. Dicho tratamiento se rige por la legislación aplicable y por «politica_privacidad de Travel», disponible en: «url_privacidad de Travel», previamente aceptada por el Usuario/Consumidor. Podrás ejercer en cualquier momento «texto de derechos de datos», a través de los canales dispuestos para tal fin en dicho documento, así como acudir ante «autoridad de datos».

**Cláusula 23. Ley aplicable y jurisdicción.** Origen: bloque `ley` de v3. Estado: TAL CUAL, con la entidad de vigilancia de Travel (PENDIENTE).
> Los presentes Términos y Condiciones se rigen e interpretan de conformidad con «ley aplicable». Cualquier controversia que surja con ocasión de la Campaña o de los presentes Términos y Condiciones se someterá a «jurisdicción», sin perjuicio de las acciones, derechos y mecanismos de protección que la ley reconoce a los consumidores ante «entidad_vigilancia de Travel».

**Al final, solo si hubo modificaciones:** una nota de modificación por cada una, en orden (sección 9).

## 7. Modelo `descuento_travel`

Cláusulas 1, 2, 3, 5, 6, 7, 16, 17, 20 y 23 iguales a `cashback_travel`. En la cláusula 7 no aparece la viñeta de compra mínima si se respondió "sin compra mínima".

**Cláusula 4. Vigencia.** Igual a `cashback_travel`, con TEXTO_AGOTAMIENTO_VIGENCIA de descuento. Si no depende de unidades, la frase termina en «texto hora local») y sigue "Las órdenes realizadas fuera…".

**Cláusula 8. Mecánica y Beneficio.** Origen: UA 2025 y Solicitudes. Estado: NUEVO.
> Para obtener el beneficio de la Campaña (en adelante, el “Beneficio”) debes comprar uno o varios Productos Participantes a través de los Sistemas Rappi Travel durante la vigencia de la Campaña y pagar la orden con un medio de pago válido para la Campaña.
> «TEXTO_METODO_PAGO_TRAVEL» (PENDIENTE R16)
> El Beneficio consiste en «TEXTO_DESCUENTO» sobre el valor de la tarifa de los Productos Participantes. El descuento se aplica directamente en el precio y el valor final con descuento se muestra antes de que pagues. *Solo si es variable:* «TEXTO_MAXIMO_DISPONIBLE» *Solo si es Asistencia:* «TEXTO_ASISTENCIA»

**Cláusula 9. Cómo identificar el descuento.** Origen: solicitud de hoteles de octubre de 2024. Estado: AJUSTADO.
> El descuento estará identificado en «TEXTO_VISIBILIDAD», y el porcentaje exacto de cada Producto Participante se mostrará antes de que pagues.

**Cláusula 10. Límites.** Estado: NUEVO.
> • **Máximo de órdenes por usuario:** «TEXTO_LIMITE_ORDENES»
> • *Solo si depende de unidades:* **Unidades disponibles:** «TEXTO_LIMITE_CAMPANA, opción unidades»

**Cláusula 11. Cambios, cancelaciones y reembolsos.** Estado: NUEVO (ver R12).
> Los cambios, cancelaciones y reembolsos de las órdenes con descuento se rigen por las condiciones del Proveedor y de la tarifa adquirida, que se informan antes de pagar. En caso de reembolso, se tendrá en cuenta el valor efectivamente pagado con el descuento. Si modificas la reserva, el descuento se mantendrá solo si el nuevo producto también es un Producto Participante y la modificación se hace dentro de la vigencia de la Campaña.

**Cláusula 12. Exclusiones y restricciones.** Origen: bloque `exclusiones_beneficio` de v3. Estado: AJUSTADO.
> El Beneficio no aplica para:
> • Órdenes pagadas con medios de pago diferentes a los aplicables para la Campaña o en efectivo.
> • Órdenes realizadas fuera de la vigencia de la Campaña.
> • Productos que no sean Productos Participantes, aunque se compren en la misma orden.
> El Beneficio obtenido en virtud de la presente Campaña no es acumulable con otras promociones.

**Cláusula 13. Modificaciones.** Igual a la cláusula 18 de `cashback_travel`, con "no afectarán los descuentos ya aplicados" en lugar de "no afectarán los Beneficios ya acreditados".

**Cláusula 14. Fraude, abuso y descalificación.** Igual a la cláusula 19 de `cashback_travel`, sin el párrafo sobre revocar Créditos. Estado: AJUSTADO.

**Cláusula 15. Limitación de responsabilidad.** Igual a la cláusula 21 de `cashback_travel`, cambiando "(i) la correcta acreditación de los Créditos" por "(i) la correcta aplicación del descuento". Estado: AJUSTADO.

**Cláusula 16. Tratamiento de datos personales.** Igual a la cláusula 22 de `cashback_travel`, cambiando "acreditar el Beneficio" por "aplicar el Beneficio". Estado: AJUSTADO.

El orden final de `descuento_travel` es: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, publicidad, atención, 13, 14, otros T&C, 15, 16 y ley aplicable. La numeración la calcula el motor.

## 8. Bloques

1. Los bloques de delivery no cambian. Los que dicen "Rappi" (organizador, acreditación, naturaleza y vigencia de Créditos, exclusiones, publicidad, atención, modificaciones, fraude, otros T&C, responsabilidad y datos) no se usan en Travel.
2. Travel usa bloques propios, compartidos entre sus dos modelos donde el texto es igual: organizador, sistemas, cobertura, usuarios, productos, condiciones, publicidad, atención, otros T&C y ley.
3. Claude Code decide la forma técnica (bloques propios o un parámetro de entidad), siempre que el texto de delivery no cambie y las pruebas actuales sigan en verde.

## 9. Nota de modificación (NUEVO)

Se agrega al final del documento, como párrafo sin número, cuando se amplía una campaña en curso desde el Historial. Las cláusulas del documento se regeneran con los valores nuevos.

> **Modificación del «fecha de la modificación».** A partir de esta fecha, «TEXTO_CAMBIOS». Las demás condiciones de la Campaña no cambian y los Beneficios ya otorgados se mantienen.

**TEXTO_CAMBIOS** (FRAGMENTO): opciones marcadas, unidas con comas y "y".
* la vigencia de la Campaña se amplía hasta las «hora» del «fecha»
* el presupuesto de la Campaña se amplía a **«presupuesto»**
* el máximo de órdenes con Beneficio se amplía a «N en letras» («N»)
* las unidades con descuento se amplían a «N en letras» («N»)

En `descuento_travel`, la frase final dice "los descuentos ya aplicados se mantienen".

Reglas del Historial:
1. El botón "Ampliar la campaña" solo aparece si la solicitud tiene link publicado, ya pasó la hora de inicio y no ha pasado la hora de fin vigente.
2. Solo se puede mover la fecha de fin hacia adelante y subir presupuesto, máximo de órdenes o unidades.
3. Cada ampliación guarda una versión nueva del documento, deja registro en la pestaña Registro y le recuerda al comercial reemplazar el texto en el mismo link.
4. Si la campaña ya empezó y el comercial quiere cambiar cualquier otra cosa, o si ya terminó, la herramienta no modifica y ofrece "Usar como base" (link nuevo).
5. Antes de la hora de inicio, se puede editar todo. Si la fecha de primera comunicación ya pasó y el cambio es menos favorable para el usuario, manda a Legal.

## 10. Validaciones

1. **Organizador.** Se bloquea si la identificación es la de Rappi S.A.S. o la de Travel Moustache S.A.S. (cualquier dígito de verificación), o si la razón social contiene "Rappi", "Travel Moustache" o "Travel Mustache" (sin importar mayúsculas ni tildes). Mensaje: "Rappi Travel nunca es el Organizador. Escribe la empresa dueña de la marca que paga el beneficio. Si la campaña la paga Rappi Travel, la redacta Legal." Con el botón al formulario de Legal.
2. **País.** Los tipos de Travel solo existen si la fila del país tiene el bloque `travel` completo y el RNT vigente.
3. **Fechas.** El fin es posterior al inicio (se permite el mismo día con horas distintas). El periodo de viaje termina después de empezar. Las fechas excluidas no pueden estar fuera del periodo de viaje, si lo hay.
4. **Porcentajes.** Enteros de 1 a 99. En descuento variable, el mínimo es menor que el máximo.
5. **Montos.** El tope y el monto fijo no superan el presupuesto. El máximo de órdenes de la campaña no es menor que el límite por usuario.
6. **Clases tarifarias.** Letras de la A a la Z separadas por comas, sin repetir.
7. **Días de alquiler.** El mínimo no supera el máximo.
8. **Redención.** Al menos una categoría. Si se marcan las ocho, se trata como "todo Travel".
9. **Asistencia en descuento.** Si está marcada, es la única categoría.
10. **Segmento y pago.** Si el segmento es "Pro o RappiCard", el medio de pago es "digitales".
11. **Primera comunicación.** No puede ser anterior a hoy. Si es anterior a la fecha de inicio o es el mismo día de la generación, se avisa: "Publica el T&C antes de esa fecha."
12. **Vigencia corta de Créditos.** Aviso si es menor a 5 días (PENDIENTE: definir si se bloquea).
13. **Nombre de la campaña.** Aviso si contiene "gana", "gratis", "sorteo" o "desde $", con la sugerencia de revisar el filtro de entrada (PENDIENTE: definir si se bloquea).
14. **Otra condición del aliado.** Si la respuesta es sí, va a Legal.
15. Las reglas generales de v3 (sección 4.3 de la especificación) aplican igual.

## 11. Filtro de entrada de Travel

Se muestra después de elegir un tipo de Travel. Cualquier sí lleva a "Esta campaña la redacta Legal" con su razón. Reemplaza, para Travel, las preguntas generales de "fondea Rappi" y "T&C propios", y la pregunta general "¿Es una campaña de Rappi Travel?" desaparece.

| # | Pregunta | Razón que se muestra |
|---|---|---|
| 1 | ¿La campaña la paga Rappi Travel o Rappi, y no la marca de un aliado? | Rappi Travel nunca es el Organizador. Si la campaña la paga Rappi Travel, la redacta Legal. |
| 2 | ¿El aliado exige sus propios términos y condiciones? | Si el aliado impone su documento, hay que revisarlo con Legal antes de publicarlo. |
| 3 | ¿Hay sorteo o concurso, o la campaña se anuncia con palabras como "gana"? | Las dinámicas con azar necesitan permiso previo de Coljuegos, y "gana" hace ver la campaña como un concurso. |
| 4 | ¿La campaña anuncia un precio "desde" o una tarifa de vuelo, hotel o paquete? | Los anuncios de tarifas tienen reglas especiales de información y ya generaron una sanción a Rappi Travel. |
| 5 | ¿El beneficio es distinto a Créditos o a un descuento en el precio? Por ejemplo: noches o niños gratis, cupones, millas, eSIM, bonos o cuotas sin interés. | Ese beneficio lo presta un tercero con sus propias condiciones. |
| 6 | ¿El porcentaje, el tope o la compra mínima cambian según el destino, el producto o el tipo de usuario, o se mezcla descuento con cashback? | Este documento usa un solo beneficio para toda la campaña. |
| 7 | ¿El beneficio depende de pagar con una tarjeta en cuotas o de una condición de un banco? | Esas campañas tienen otra entidad responsable y otro documento. |
| 8 | ¿El producto es un seguro con cobertura de una aseguradora, y no una asistencia al viajero? | Los seguros tienen reglas propias de la Superintendencia Financiera. |
| 9 | ¿La campaña es solo para empleados o no tiene fecha de fin? | Necesita un documento distinto. |

## 12. Casos de prueba propuestos

Nombres e identificaciones de prueba, como en los casos actuales. Cada caso que genera lleva su salida esperada exacta, que Juan revisa.

| Caso | Tipo | Datos principales | Resultado |
|---|---|---|---|
| TV01 | cashback | Vuelos de una aerolínea, internacional, destinos España, Estados Unidos y México; solo operados; ida y regreso contada como una orden; origen Colombia; 5% con tope 150.000; 2 órdenes; presupuesto 5.000.000 y 33 órdenes; carga a los 5 días calendario; vigencia 15 días; redención en Hoteles, Paquetes, Autos, Tours y Actividades y Asistencia | genera |
| TV02 | cashback | Autos de una rentadora; ámbito ambos; compra mínima 600.000; 10% con tope 90.000; 2 órdenes; presupuesto 3.200.000 y 40 órdenes; carga a los 5 días hábiles; vigencia 15 días; redención en Hoteles, Paquetes y Tours y Actividades | genera |
| TV03 | cashback | Hoteles, nacional, un hotel nombrado; 10% sin tope; 2 órdenes; presupuesto 5.000.000 y 20 órdenes; carga al confirmarse; vigencia 30 días; redención en todo Travel | genera |
| TV04 | cashback | Vuelos de una aerolínea con origen Colombia y periodo de viaje; monto fijo de 100.000; 1 orden; presupuesto 3.000.000 sin máximo de órdenes; carga a los 3 días calendario; vigencia 30 días; redención en Travel y Plataforma | genera, con el párrafo opcional de la cláusula 12 |
| TV05 | cashback | Las ocho categorías, sin marca; franja de 18:00 a 20:00 del mismo día; 50% con tope 300.000; 2 órdenes; presupuesto 70.000.000 y 200 órdenes; segmento Pro o RappiCard; redención en todas menos Vuelos | genera, con "todas las categorías" |
| TV06 | descuento | Asistencia sola; 15% fijo; precio tachado; sin límite; no depende de unidades | genera, con TEXTO_ASISTENCIA |
| TV07 | descuento | Hoteles con etiqueta; variable de 5% a 40%, máximo en 3 productos; etiqueta y página de inicio; 2 órdenes; 100 unidades; fechas excluidas; mínimo 2 noches | genera |
| TV08 | cashback | Organizador Travel Moustache S.A.S. con su NIT | falla: organizador |
| TV09 | cashback | Razón social "Rappi Colombia" | falla: organizador |
| TV10 | descuento | Asistencia y Hoteles juntas | falla: asistencia sola |
| TV11 | descuento | Variable con mínimo mayor o igual al máximo | falla: porcentajes |
| TV12 | cashback | Tope mayor que el presupuesto | falla: montos |
| TV13 | cashback | TV02 en curso, se amplía la fecha de fin | genera, con nota de modificación |
| TV14 | cashback | TV02 en curso, se intenta cambiar el porcentaje | bloquea y ofrece "Usar como base" |

Además: una prueba por cada pregunta del filtro de Travel (cualquier sí lleva a Legal) y el ajuste de las pruebas que hoy esperan solo tres modelos.

## 13. Revisión de Juan

**R1. Rol de Rappi Travel (cláusula 1).** AJUSTADO.
* Texto actual (bloque `organizador` de v3, para Rappi): "**{{ENTIDAD_LEGAL}}** (en adelante, “Rappi”) actúa únicamente como plataforma de contacto e intermediación tecnológica y como medio de difusión de la Campaña; Rappi no es el organizador de la Campaña."
* Texto propuesto (Travel): "**«entidad Travel»**, identificada con **«NIT Travel»** e inscrita en el Registro Nacional de Turismo con el número **«RNT»** (en adelante, “Rappi Travel”), actúa como agencia de viajes que opera los Sistemas Rappi Travel y como medio de difusión de la Campaña; Rappi Travel no es el organizador de la Campaña."
* Por qué: Travel Moustache está inscrita como agencia de viajes, y Supertransporte la calificó como proveedor indirecto. Presentarla solo como plataforma de contacto no la protege. También se agrega el RNT (decisión 3).

**R2. Créditos sin documento madre (cláusula 12).** AJUSTADO.
* Texto actual (bloque `naturaleza_creditos` de v3): "• El funcionamiento de los Créditos se rige por los Términos y Condiciones de Funcionamiento de los Créditos de la Plataforma Rappi, disponibles en: {{URL_TC_CREDITOS}}."
* Texto propuesto: "• Los Créditos otorgados en virtud de la Campaña se rigen por los presentes Términos y Condiciones." Más el párrafo opcional para su uso fuera de Travel (PENDIENTE).
* Por qué: decisión 2.

**R3. Cancelaciones (cláusula 14).** NUEVO en dos viñetas; propuesta adicional no aplicada.
* Viñetas nuevas: "Reembolso parcial" y "Plazo" (decisión 5).
* Propuesta adicional, no aplicada:
  * Texto actual (Bloque 2026): "en caso de cancelación o modificación de la reserva (sea por voluntad del usuario o por políticas del proveedor), el Usuario/Consumidor no recibirá los Créditos promocionales."
  * Texto propuesto: "en caso de cancelación o reembolso de la reserva, o de modificación hecha por el Usuario/Consumidor, no recibirá los Créditos promocionales. Si el Proveedor modifica la reserva y el Usuario/Consumidor la acepta sin reembolso, conservará el Beneficio."
  * Por qué: los cambios de itinerario de las aerolíneas son frecuentes; quitarle el beneficio a quien sí viajó genera reclamos y es discutible frente a la Ley 1480.

**R4. Responsabilidad (cláusula 21).** TAL CUAL; propuesta no aplicada.
* Texto actual (Modelo junio, cláusula 18): "Rappi Travel actúa como intermediario para la comercialización de productos y servicios turísticos provistos por proveedores y operadores. En consecuencia, Rappi Travel no será responsable por: (i) la prestación, calidad, idoneidad, disponibilidad o cumplimiento de los servicios turísticos a cargo de los proveedores u operadores; (ii) las cancelaciones, modificaciones o penalidades aplicadas por el proveedor, aerolínea u operador conforme a sus propias políticas; (iii)…; ni (iv)…"
* Texto propuesto: "Las condiciones de prestación de cada servicio turístico, como equipaje, cambios, cancelaciones, demoras y penalidades, son las del Proveedor y de la tarifa adquirida, y se informan antes de pagar. Rappi Travel no será responsable por las fallas técnicas, interrupciones o limitaciones en la disponibilidad de los Sistemas Rappi Travel ajenas a su control razonable, ni por los rechazos de órdenes derivados de fallas en la conexión con los Proveedores. Nada de lo anterior limita los derechos que la ley te reconoce como consumidor. Rappi Travel es responsable de: (i) la correcta acreditación de los Créditos conforme a las condiciones de la Campaña; (ii) la publicación veraz y completa de los presentes Términos y Condiciones; y (iii) la atención oportuna de tus peticiones, quejas y reclamos relacionados con la Campaña."
* Por qué: con la calificación de Supertransporte (proveedor indirecto con responsabilidad solidaria), una exclusión general de responsabilidad por la prestación del servicio puede leerse como cláusula abusiva y no protege.

**R5. Entidad de vigilancia (cláusula 23).** PENDIENTE. Propuesta: "la Superintendencia de Industria y Comercio y la Superintendencia de Transporte, según corresponda".

**R6. Base de cálculo (cláusula 8).** PENDIENTE. ¿Los impuestos y las tasas incluidos en la tarifa cuentan para el cashback? Un T&C de octubre de 2025 los incluía; el Modelo de junio habla del "valor comercial de la tarifa o reserva".

**R7. Ejemplo del tope (cláusula 8).** NUEVO. Por qué: en agosto de 2025 una etiqueta sin "hasta" terminó en reclamo por publicidad engañosa y se completaron los Créditos.

**R8. Descuento variable (cláusula 8 de descuento).** NUEVO. Mínimo, máximo y número de productos con el máximo. Por qué: criterio de la SIC y transparencia.

**R9. Nota de modificación (sección 9).** NUEVO.

**R10. Segmentos (sección 3).** NUEVO y PENDIENTE.

**R11. Conteo por trayecto (cláusula 9).** PENDIENTE: confirmar si esa opción existe en la práctica.

**R12. Cancelaciones en descuentos (cláusula 11 de descuento).** NUEVO.

**R13. Nombre de la sección de Créditos en la app (cláusula 11).** PENDIENTE.

**R14. Política de datos de Travel (cláusula 22).** PENDIENTE.

**R15. RNT y su vencimiento (sección 1).** PENDIENTE.

**R16. Pagos con Créditos en descuentos (cláusula 8 de descuento).** PENDIENTE: ¿se excluyen también en los descuentos? Hoy la frase viene de los cashback.

**R17. Vigencia mínima de Créditos y palabras del nombre (sección 10).** PENDIENTE: ¿aviso o bloqueo?
