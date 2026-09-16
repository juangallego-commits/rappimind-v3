# Rappi Travel en RappiMind v3: investigación y decisiones

Versión 2 · 16 de septiembre de 2026 · Preparado por Claude (chat) para Juan Camilo Gallego · Insumo para Claude Code

Este documento dice qué piden de verdad los comerciales de Rappi Travel, qué decidió Juan y qué reglas debe seguir la herramienta. Los textos legales, el formulario, los textos por opción, las validaciones, el filtro de entrada y los casos de prueba están en `docs/MODELO_BASE_TRAVEL.md`. Si algo de aquí choca con `CLAUDE.md`, manda `CLAUDE.md` y se le pregunta a Juan.

## 1. Fuentes revisadas

1. Hoja "Respuestas de formulario 8" del formulario de T&C de Colombia (1.187 solicitudes al 16 de septiembre de 2026), leída solo en lectura. Se revisaron las 140 solicitudes de Claudia Vargas: las 44 de 2026 completas y las de 2024 y 2025 en resumen.
2. T&C de Travel publicados en promos.rappi.com. El sitio bloquea la lectura automática, así que se usaron el texto que los comerciales pegaron en el formulario para cada campaña y extractos indexados de diez T&C de Travel publicados entre 2024 y 2026.
3. `Modelo_Cashback_Travel` del Drive de Juan (30 de junio de 2026).
4. Canal de Slack #legales-travel-co, desde julio de 2025.
5. Captura de la sección Rappi Travel de la app (categorías), enviada por Juan el 16 de septiembre de 2026.
6. Certificado del Registro Nacional de Turismo de Travel Moustache (expedido el 28 de marzo de 2025) y respuestas de Travel Moustache a la SIC de noviembre y diciembre de 2025, en el Drive de Juan.
7. Modelos y bloques de v3 en `modelos/`.

## 2. Decisiones de Juan (16 de septiembre de 2026)

| # | Tema | Decisión | Qué implica para la herramienta |
|---|---|---|---|
| 1 | Organizador | Rappi Travel nunca es el Organizador, igual que Rappi. Se piden los datos de quien organiza. | Razón social e identificación obligatorias. Bloqueo de Rappi S.A.S. y de Travel Moustache S.A.S. Las campañas que paga Rappi Travel (por ejemplo, los Cashback Day de toda la tienda) van a Legal. |
| 2 | Créditos | Los otorga Travel Moustache. Rappi Travel no tiene T&C madre de Créditos. | El modelo regula los Créditos por completo, sin remitir a un documento madre de Travel. |
| 3 | RNT | Va en los T&C. El pie de Netviajes no va. | Dato de país `rnt`. Número por confirmar (sección 3). |
| 4 | Cruce de cuentas | Se mantiene: se pueden quitar los Créditos si la orden se cancela o se reembolsa. | Cláusula de cancelaciones. |
| 5 | Hasta cuándo se revierten los Créditos | Lo propone Claude. | Sección 7. |
| 6 | Dónde se usan los Créditos | Es una pregunta del formulario. | Campo de redención. |
| 7 | Países | Solo Colombia por ahora. | Los tipos de Travel solo existen en CO. |
| 8 | Descuentos "hasta X%" | Aplicar la mejor práctica de transparencia. | Sección 8. |
| 9 | Modelo base | No existe; se arma desde los ejemplos. | `docs/MODELO_BASE_TRAVEL.md`. |
| 10 | Cambios después de publicar | Depende del caso. Si la campaña ya estuvo activa y hubo órdenes, no se modifica y se crea una nueva. | Sección 6. |
| 11 | Quién organiza | Normalmente el dueño de la marca. | Ayuda del campo Organizador. |
| 12 | Categorías | Las de la app. | Sección 5. |
| 13 | Segmentos | "Los de la imagen". | La imagen muestra categorías, no segmentos. Por confirmar (sección 3). |
| 14 | Condiciones como ida y regreso | Van en el formulario y se traducen al T&C. | Paso de condiciones del formulario. |
| 15 | T&C propios del aliado | Puede pasar. | Pregunta del filtro de entrada. |

## 3. Lo que falta confirmar con Juan

1. **RNT.** Juan indicó 901337236, pero ese número es el NIT de Travel Moustache sin dígito de verificación. El certificado del RNT (expedido el 28 de marzo de 2025) dice Registro No. 79000, y las respuestas de Travel Moustache a la SIC de noviembre y diciembre de 2025 también dicen 79000. Ese certificado vencía el 31 de marzo de 2026; las notas del proyecto Travel dicen que está vigente hasta el 31 de marzo de 2027. Mientras Juan no diga otra cosa, se usa 79000.
2. **Segmentos.** Propuesta en `MODELO_BASE_TRAVEL.md`, sección 3.
3. **Redención en toda la Plataforma Rappi.** Si se permite, los Créditos que otorga Travel Moustache se usarían en compras que no son de Travel. Propuesta: en ese caso el T&C remite a los T&C de Créditos de Rappi S.A.S. solo para esos usos.
4. **Política de datos de Travel.** Falta el nombre y la URL de una política a nombre de Travel Moustache (la actual remite a Rappi S.A.S.). Sin ese dato, la herramienta no genera T&C de Travel.
5. **Nombre de la sección de Créditos en la app.** El Modelo de junio dice "Promos y Créditos"; v3 dice "Cuenta" y "Créditos".
6. **Base de cálculo.** Si los impuestos y las tasas de la tarifa cuentan para calcular el cashback.
7. Todo lo marcado NUEVO, AJUSTADO o PENDIENTE en `MODELO_BASE_TRAVEL.md`, sección 13.

## 4. La demanda

1. La hoja tiene 141 solicitudes con tipo de actividad "Travel" (139 de Claudia Vargas). Las tres más recientes entraron el 16 de septiembre de 2026, lo que cuadra con el conteo anterior de 138 de 1.184.
2. La columna "Vertical" marca Travel en 173 solicitudes: 24 entraron por la rama de Promoción y 8 por la de Concursos. La demanda real de Travel ronda el 14,6%.
3. Todas son de Colombia.
4. En 2026 (44 solicitudes de Claudia): 28 son cashback en Créditos, 12 son descuentos en el precio y 4 son beneficios de terceros (noches gratis, cupón de Cabify, eSIM y millas LifeMiles).
5. 17 de esas 44 no dicen quién pone la plata: 6 son cashback en toda la tienda y 11 no nombran aliado.
6. Aliados que más aparecen en 2026: Localiza (6), JetSMART (5), Universal Assistance (4 o 5), Avianca (2) y LATAM (2).
7. La rama Travel del formulario actual casi no pregunta nada: "Aerolínea" se llenó en 19 de 141 solicitudes y "Clase de tiquete" en 10, y no hay campos para tope, presupuesto, carga, vigencia ni redención. Desde marzo de 2026 los comerciales pegan párrafos legales completos en el campo de descripción.
8. Valores típicos de 2026, para las ayudas del formulario: 2 órdenes por usuario; Créditos con vigencia de 15 o 30 días; topes de 50.000 a 300.000; presupuestos de 3 a 115 millones, con máximos de 20 a 400 órdenes; carga de Créditos entre 72 horas y 5 días después del fin; redención en autos, hoteles, paquetes y tours, sin vuelos.

## 5. Tipos que cubre la herramienta

1. `cashback_travel`: el usuario compra Productos Participantes de Travel y recibe un porcentaje (con o sin tope) o un monto fijo en Créditos.
2. `descuento_travel`: el usuario recibe un porcentaje de descuento aplicado en el precio, fijo o variable entre un mínimo y un máximo.
3. Todo lo demás va a Legal por el filtro de entrada (sección 9).

Categorías de la app, con estos nombres exactos: “Hoteles”, “Vuelos”, “Paquetes”, “Tours y Actividades”, “Autos”, “Hoteles por horas”, “Marriott Bonvoy” y “Asistencia”.

## 6. Cambios después de publicar (decisión 10)

Principio: una campaña que ya empezó no cambia sus condiciones, porque pudo haber órdenes hechas con ellas. La herramienta no sabe si hubo órdenes, así que usa la hora: si ya pasó la hora de inicio, asume que las hubo.

| Momento | Cambio pedido | Qué hace la herramienta |
|---|---|---|
| Antes de la hora de inicio | Cualquiera | Permite editar la solicitud y regenerar; el comercial reemplaza el texto en el mismo link. Guarda la versión anterior en el Historial. Si la fecha de primera comunicación ya pasó y el cambio es menos favorable para el usuario (menor porcentaje, tope o vigencia de Créditos; menos productos, categorías, destinos o días), manda a Legal. |
| Durante la campaña | Ampliar la fecha u hora de fin | Mismo link. Regenera el documento con la nueva fecha y agrega al final la nota de modificación. Solo antes de la fecha de fin vigente y solo hacia adelante. |
| Durante la campaña | Aumentar el presupuesto, el máximo de órdenes o las unidades | Igual que la fila anterior. |
| Durante la campaña | Cualquier otro cambio | No modifica. Ofrece "Usar como base" para crear una campaña nueva, con link nuevo, que empiece después del cambio. Si además hay que terminar antes la campaña en curso, manda a Legal. |
| Después de la fecha de fin | Cualquiera, incluidas fechas nuevas | Nunca modifica. Solo "Usar como base", con link nuevo. |

Casos reales que respaldan la regla:
1. Mayo de 2026: se ampliaron en el mismo link las vigencias de dos campañas activas (tours y actividades, y un hotel en Santa Marta).
2. Septiembre de 2026: se quiso reusar una campaña de autos ya terminada con fechas nuevas; Juan pidió link nuevo.
3. Septiembre de 2026: una aerolínea pidió cambiar la mecánica de una campaña activa (de vuelos a paquetes y con otra fecha de carga); se creó una solicitud nueva.
4. Agosto de 2026: se cambió la hora de inicio de una campaña antes de arrancar.
5. Junio de 2026: había dos links creados en abril sin contenido y se pidió "diligenciarlos"; Juan pidió solicitud completa. La herramienta nunca crea links sin contenido.

## 7. Hasta cuándo se revierten los Créditos (decisión 5)

Propuesta, incluida en la cláusula de cancelaciones:
1. La reversión y el cruce de cuentas aplican a las cancelaciones, modificaciones y reembolsos que ocurran antes de la prestación del servicio.
2. Una vez prestado el servicio (realizado el vuelo, la estadía, el alquiler o la actividad), el Beneficio queda en firme y no se revierte, salvo fraude comprobado.
3. Si hay un reembolso parcial, el Beneficio se recalcula sobre el valor final pagado.

Razón: el usuario y Rappi Travel tienen una fecha cierta, y coincide con el momento en que ya no hay nada que reembolsar.

Propuesta adicional, no aplicada hasta que Juan la apruebe: conservar el Beneficio cuando es el Proveedor quien modifica la reserva y el usuario la acepta sin reembolso (`MODELO_BASE_TRAVEL.md`, sección 13, R3).

## 8. Transparencia (decisión 8)

Reglas:
1. **Descuento variable.** El T&C dice el mínimo y el máximo, no solo el máximo; dice a cuántos productos aplica el máximo, y que el porcentaje exacto se ve antes de pagar. La SIC admite anunciar el mínimo y el máximo cuando el descuento cambia según el producto (criterio de la Circular 11 de 2002, recogido en la Circular Única; no se verificó el numeral vigente).
2. **Unidades.** Si la campaña termina al agotarse unidades u órdenes, el T&C dice cuántas son (mismo criterio de la SIC).
3. **Cashback con tope.** El T&C dice el porcentaje y el tope juntos, y trae un ejemplo con el valor de compra desde el cual se recibe el tope.
4. **Redención.** El T&C dice en qué categorías se usan los Créditos y en cuáles no.
5. **Piezas.** En el formulario, el comercial declara que las piezas, los mensajes y las etiquetas de la app dicen lo mismo que el T&C (porcentaje, "hasta" junto al tope, mínimo y máximo del descuento, categorías de redención) y que nada sale antes de publicar el T&C.
6. **Primera comunicación.** En el formulario, el comercial indica la fecha de la primera pieza, mensaje o banner.

Casos reales:
1. Agosto de 2025: una etiqueta del flujo de compra prometía 250.000 en cashback sin la palabra "hasta". La usuaria reclamó publicidad engañosa y se le completaron los Créditos. Juan pidió revisar siempre pantallas y mensajes.
2. Junio de 2026: salió un mensaje de WhatsApp de un Cashback Day antes de que el T&C estuviera publicado, y un usuario reclamó porque no pudo usar los Créditos en vuelos.
3. Agosto de 2025: un cashback del 20% para primera compra con RappiCard en cuotas llegó a la SIC.
4. La captura de la app del 16 de septiembre de 2026 muestra un banner con "hasta 60% OFF" y "desde $2.400.000" que remite a los T&C generales de Travel. Con estas reglas, esa pieza necesitaría su propio T&C y pasaría por Legal por anunciar un precio.

## 9. Filtro de entrada de Travel

Si el comercial responde sí a cualquiera de estas preguntas, la campaña va a Legal. Textos y razones en `MODELO_BASE_TRAVEL.md`, sección 11.
1. La paga Rappi Travel o Rappi, y no la marca de un aliado.
2. El aliado exige sus propios T&C.
3. Hay sorteo o concurso, o se anuncia con palabras como "gana".
4. Se anuncia un precio "desde" o una tarifa de vuelo u hotel.
5. El beneficio es distinto a Créditos o a un descuento en el precio (noches o niños gratis, cupones, millas, eSIM, bonos, cuotas sin interés).
6. El porcentaje, el tope o la compra mínima cambian según el destino, el producto o el tipo de usuario, o se mezclan descuento y cashback.
7. El beneficio depende de pagar con una tarjeta en cuotas o de una condición de un banco.
8. Es un seguro con cobertura de una aseguradora, y no una asistencia al viajero.
9. Es para empleados o no tiene fecha de fin.

La pregunta general "¿Es una campaña de Rappi Travel?" desaparece del filtro general.

## 10. Qué cambia frente al Cashback de delivery

1. **Entidad.** Travel Moustache S.A.S., NIT 901.337.236 (dígito de verificación 7), con RNT (sección 3). Todo documento de Travel va a su nombre, nunca a nombre de Rappi S.A.S.
2. **Término definido.** "Rappi Travel". Los bloques de v3 dicen "Rappi" y no se pueden reusar tal cual; Travel necesita sus propios bloques sin tocar los de delivery.
3. **Créditos.** Los otorga Travel Moustache y no hay documento madre: el modelo los regula completos.
4. **Cancelaciones y reembolsos.** Bloque propio (sección 7).
5. **Condiciones del Proveedor.** Operación directa y código compartido, clases tarifarias, trayecto, origen, anticipación, fechas de viaje, fechas excluidas, noches mínimas y días de alquiler.
6. **Base de cálculo.** Valor pagado con dinero por la tarifa o la reserva (falta confirmar impuestos y tasas).
7. **Autoridades.** Además de la SIC, la Superintendencia de Transporte vigila la información al consumidor en transporte aéreo (propuesta de texto en el modelo base).
8. **Otros T&C.** Sujeción a los T&C de los Sistemas Rappi Travel (https://travel.rappi.com.co/terms), además de los de la Plataforma Rappi.

## 11. Observaciones legales para Juan (no aplicadas)

1. Supertransporte calificó a Rappi Travel como portal de comercio electrónico y proveedor indirecto con responsabilidad solidaria. La cláusula de responsabilidad del Modelo de junio, que presenta a Rappi Travel como intermediario que no responde por la prestación de los servicios, no protege. Propuesta en `MODELO_BASE_TRAVEL.md`, sección 13, R4.
2. El T&C del Hot Sale de marzo de 2026 pide autorizar a Rappi S.A.S. el tratamiento de datos y remite a los T&C de la Plataforma Rappi; uno de JetSMART de 2024 escribe "Travel Mustache" y reserva facultades a "Rappi". Conviene corregirlos si siguen activos.
3. El `Modelo_Cashback_Travel` de junio pone a Travel Moustache como Organizador. Conviene archivarlo o marcarlo como superado.
4. La skill "rappimind" describe la arquitectura de la v2 y dice que Rappi es organizador. Contradice la regla 1 y este repo.
5. En 2026 hubo campañas con Créditos de 2 y 5 días de vigencia. Falta definir si la herramienta pone un mínimo.
6. La política de datos de Travel remite a Rappi S.A.S. (sección 3).

## 12. Verificación

1. **Verificado:** conteos de la hoja; decisiones de Juan; texto de los bloques de v3; texto del Modelo de junio; bloques que los comerciales pegan desde marzo de 2026; número del RNT en el certificado y en las respuestas a la SIC; casos de Slack citados.
2. **No verificado:** el texto completo de los ocho T&C que envió Juan (el sitio bloquea la lectura); el numeral vigente de la Circular Única sobre descuentos; la renovación del RNT hasta 2027.
3. **Slack leído:** hilos de "T&C Travel week pendientes", "Campaña Jetsmart", "Campaña Localiza Travel week", "Campaña 03 AUG", "T&C Aliados Travel solicitados previamente", "Cashback Day Rappi Travel 26 de junio", "Reclamación usuario Caso Cashback otorgado" y el mensaje del caso SIC de agosto de 2025. No se leyeron los hilos largos de abril, mayo, Hot Sale, Decameron ni "Nuevo producto Travel CO".
