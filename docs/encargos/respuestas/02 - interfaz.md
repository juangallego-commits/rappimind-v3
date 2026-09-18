El archivo trae 44 pantallas: 26 del recorrido del comercial, 11 de otros caminos, 4 en portugués y 3 en celular, más la portada, el índice y los cinco anexos. Lo leí completo. CONTEXTO_RAPPIMIND_V3.md y docs/ESPECIFICACION_V3.md no están entre los archivos del proyecto y no tengo el repositorio conectado, así que todo lo que sigue sale solo de FRONT_ACTUAL.html.

1. Los tres problemas que más le cuestan al comercial

Pantalla 24, con la promesa de la 1: al final se queda varado. La portada le dice que él publica. Al terminar recibe diez pasos de Squarespace, y solo debajo de esos pasos se entera de que en Colombia publican dos personas, que para concursos no hay nadie y que para los demás países no hay lista. Además, los pasos 4 y 7 le dicen que el título y la dirección están "aquí abajo", cuando están arriba. Para casi todos, el camino real es pasárselo a Camilo o a Valery, y eso debería ser lo primero que ve.
Pantallas 30 y 31: el atajo de descuentos lo manda a Legal. Es seguramente lo que más van a usar, y 5 de sus 15 opciones terminan en "confirma con Legal":
Descuento en Productos Seleccionados sale dos veces, con enlaces distintos.
Cupones de Membresía apunta a la versión de 2024.
Los dos "Cupon de descuento" no dicen para qué sirven.
Además, Tarifa de Servicio Gratis vence el 31 de octubre, en seis semanas. Esto no se arregla con diseño: son decisiones tuyas en data/tyc_genericos.json.
Pantallas 26 y 27: cuando se traba, lo mandan a Legal o a ninguna parte.
"El canal de ayuda" e "Ir al formulario de Legal" apuntan a direcciones "ejemplo-de-la-demostracion".
"El canal de Legal" se nombra seis veces y nunca tiene enlace.
#tyc-rappi, el único canal real, se presenta como el lugar para pedir "revisión de T&C".
Dos preguntas frecuentes mandan a Legal cosas que la herramienta resuelve: alargar fechas (existe Ampliar, pantalla 36) y un NIT bien escrito que la validación rechaza (eso es una falla de la herramienta).

2. Pantalla por pantalla

Cambiaría "T&Cs" por "T&C" como en el resto, el paso 3 que promete que él publica y dice "email", y el paso 2, que dice "al lado" y en celular no es cierto.
La segunda pregunta tiene 11 palabras, y debajo de la de azar pondría la prueba que ya está en la Ayuda para que conteste sin preguntarle a nadie.
Bien; solo el contador de celular, que dice "Paso 1 de 1" y salta a "de 6" cuando elige el tipo.
La ayuda repite las opciones; la cambiaría por la regla para decidir, y no haría esta pregunta en países sin tipos de Travel.
El atajo de descuentos está al final y arranca con "¿No ves tu campaña en la lista?"; además falta una salida para "no es ninguna de estas" que lleve a la pantalla de Legal con el motivo.
Bien.
"El siguiente paso" confunde, porque aquí "paso" es una etapa de la barra y las ciudades son la siguiente pregunta; la opción marcada de entrada la trato en la 19.
La ayuda son tres frases; la dejo en una línea con el ejemplo y el "Nunca es Rappi".
La ayuda cabe en una línea si se quita "pídeselo a tu contacto".
Bien; no puedo revisar la fecha de fin ni las horas porque no tienen pantalla, y según la ficha la fecha de fin se propone igual a la de inicio.
"Devuelves" pone al comercial como el que paga, y el texto gris "99" parece una sugerencia de cashback del 99%.
No dice que el máximo es en Créditos, el porqué repite el 99%, y la calculadora usa un pedido que da justo el tope, así que no se ve qué hace el tope.
Bien.
"Ganar" suena a concurso, y la ayuda es una estadística; sirve más decir cómo se cuenta.
Turbo y consumo en el local se excluyen y hoy se pueden marcar los dos, la ayuda repite "Opcional" y la nota de consumo en el local está enredada.
El "le" no tiene a quién referirse.
La ayuda es una estadística, y el contador dice "Queda 1 pregunta" cuando después salen dos.
Otra estadística; además "RappiTravel" va separado, y el "casi nunca aplican" del porqué lo deja sin saber si sirven o no (decides tú).
Otra estadística, y "Todos los usuarios" viene marcado, igual que en la 7 y la 20; quien va de afán publica la promesa más amplia y la cláusula 12 aplica la más favorable (quitarlas cuesta un clic).
No dice quién paga ni qué, y la ayuda habla de "todos" cuando la opción dice "Con cualquier medio de pago".
La ayuda repite "Opcional" en vez de dar un ejemplo.
"Campaña aprobada" lo pone a pensar quién aprueba justo antes de leer que Legal no revisa, y aquí dice "Editar" cuando en el formulario dice "Cambiar".
Bien en interfaz; lo del texto legal va en la lista suelta.
Es el problema 1; además, "veinte cláusulas" no sirve para otros tipos y "Ver mi historial" no coincide con "Mis campañas".
La ayuda promete abrir el documento y marcarlo como publicado, y la fila solo trae "Usar como base"; además la fecha sale como 2026-09-17, sin decir de qué es.
Es el problema 3; además abre con el azar, deja de última la pregunta de descuentos (la más común) y repite "Me equivoqué en un dato".
El texto está bien; faltan "Cambiar mi respuesta" para quien marcó sí por error, y que el formulario llegue con el motivo.
Siete de las nueve preguntas pasan de diez palabras, y la sexta mete dos preguntas en una.
"Solo para campañas de Rappi Travel" sobra donde solo hay Travel.
Es el problema 2; además tiene guiones, tildes faltantes, inglés ("Service Fee", "check out") y cuatro textos por opción.
Se arregla sola cuando Legal resuelva el duplicado de la 30.
Bien: solo la ven pruebas, legal y administración, y para ellos el aviso sirve.
El porqué dice "Cashback Day" y el tipo se llama Cashback Multitienda.
Muy bien el patrón de la opción bloqueada; la nota de "Quien llegó primero" se entiende mejor como regla.
El error dice "dígito" dos veces.
Promete "más órdenes o más unidades" que no muestra, los valores actuales salen en formato de sistema, y falta decir qué se hace en Squarespace después de ampliar.
No es del comercial, pero:
la carga masiva trae rol "legal" por defecto;
la ayuda de Países contradice la de roles;
los tipos salen con nombres internos.
Lo mismo de la 1, en portugués; ojo, aquí sigue el aviso "Modo demonstração".
Bien.
La ayuda, como en la 4; y Brasil solo tiene "Promoção Brasil", así que ofrecerle Rappi Travel lo lleva a un camino sin tipos.
"Escolha a que se parece" no concuerda con "tipo", y "Só para o Brasil" sobra.
Mismo texto de la 1; lo arreglan las mismas líneas.
En celular no se ve "Faltan 3 datos"; lo pondría en el botón flotante (la nota del archivo dice "Paso 2 de 7" y la pantalla dice "4 de 6").
Bien.

Lo que no cuadra y necesito que confirmes

El archivo sale de la rama claude/zealous-babbage-g1v1af (commit c699580), no de main. Antes de aplicar el bloque, confirma que esa rama ya está en main.
En las pantallas 38 a 41 quedó el aviso de demostración: npm run front lo quita en español pero no en portugués.
Los enlaces "ejemplo-de-la-demostracion" de la 26 y la 27 no están entre las cinco excepciones de la portada. Si en producción son así, son enlaces muertos.
Mis propuestas asumen que "el canal de Legal" es #tyc-rappi.
Nombres y correos no calzan: Camilo Patiño con ivan.patino@ y Valery Medina con ext-v.reina@.
En Cashback Multitienda, la pantalla 5 y la Ayuda dicen que cada tienda pone porcentaje, tope y presupuesto. La pantalla 33 solo pide presupuesto por tienda.
En 15 minutos o Cashback no discuto quién organiza. Pregunto qué contesta el comercial en la pantalla 8, si "el presupuesto lo pone Rappi" y la pregunta define al Organizador como quien paga.
¿De dónde salen "La mitad de las campañas", "Siete de cada diez" y "Lo más usado"? Si no salen de datos, las de las pantallas 12 y 13 también sobran.
Mis campañas (pantalla 25) promete acciones que la fila no muestra.

Lista suelta del texto legal

Cláusula 7. Texto actual: "Máximo de pedidos: Puedes obtener el Beneficio…". Texto propuesto: "Máximo de pedidos: puedes obtener el Beneficio…".
Pesos y Créditos. El comercial escribe pesos y el documento dice "5.000.000 de Créditos", pero la compra mínima sale en "pesos M/Cte.". Si un Crédito no vale un peso, el documento promete otra cosa.
Dominios. La cláusula 9 enlaza a legal.rappi.com.co; la 16 y la 19, a legal.rappi.com.
Empleados. La Ayuda dice que están excluidos "y eso ya está escrito en el documento", y el Cashback no lo dice.
Cláusula 8. Dice que se verifica "antes de acreditar", y la opción "Apenas termina el pedido" de la pantalla 16 promete "sin verificación previa".

Dónde vive cada cambio (Anexo C)

src/core/preguntas.js: preguntas y ayudas.
src/core/esquemas.js: pantallas 29 y 41.
src/core/ayuda.js: pantallas 26 y 28.
data/tyc_genericos.json: pantalla 30.
src/client/js/: lo demás de la interfaz.
src/core/validaciones.js: pantalla 35.
src/core/textos_interfaz.js y src/core/preguntas_pt.js: el portugués.
El filtro de entrada (pantalla 2): no aparece en el Anexo C.

Tres cosas a tener en cuenta al buscar:

En las pantallas 8, 9 y 11, una palabra de glosario va dentro de un botón en el HTML. Busca esas frases en el navegador.
Los pasos de Squarespace salen iguales en la 24 y la 26.
"por el canal de Legal" aparece seis veces en la 26; una sola línea del bloque las cambia todas.
pantalla 01 | ACTUAL: "Publica los T&Cs" | PROPUESTO: "Publica los T&C"
pantalla 01 | ACTUAL: "El documento se escribe solo, al lado, mientras respondes. Lo que ves es lo que sale." | PROPUESTO: "El documento se va escribiendo mientras respondes. Lo que ves es lo que sale."
pantalla 01 | ACTUAL: "En 2 minutos recibirás un email con el documento generado y listo para publicar en Squarespace. Recuerda seguir las instrucciones para asegurar que los T&Cs queden publicados exitosamente." | PROPUESTO: "Te llega por correo en un par de minutos, con los pasos para publicarlo o a quién pasárselo."
pantalla 02 | ACTUAL: "¿La tienda o la marca exige sus propios términos y condiciones?" | PROPUESTO: "¿La tienda o la marca exige sus propios T&C?"
pantalla 02 | ACTUAL: "(recorrido)" | PROPUESTO: "Debajo de la pregunta de azar, una línea de ayuda: si dos personas hacen lo mismo y solo una puede ganar, hay azar."
pantalla 03 | ACTUAL: "(recorrido)" | PROPUESTO: "Mientras no haya tipo elegido, el contador de celular dice 'Paso 1 · Campaña' sin total."
pantalla 04 | ACTUAL: "Rappi es el domicilio de siempre. Rappi Travel son vuelos, hoteles, autos y paquetes." | PROPUESTO: "Si es de vuelos, hoteles, autos o paquetes, es Rappi Travel."
pantalla 04 | ACTUAL: "(recorrido)" | PROPUESTO: "No hacer esta pregunta en países sin tipos de Travel; dar Rappi por respondido. Aplica también a la 40."
pantalla 05 | ACTUAL: "¿No ves tu campaña en la lista?" | PROPUESTO: "¿Es un descuento, un cupón o envío gratis?"
pantalla 05 | ACTUAL: "(recorrido)" | PROPUESTO: "Subir el atajo a los T&C publicados por encima de los cuatro tipos."
pantalla 05 | ACTUAL: "(recorrido)" | PROPUESTO: "Agregar la opción 'Mi campaña no es ninguna de estas', que lleve a la pantalla de Legal con ese motivo."
pantalla 07 | ACTUAL: "Nacional es todo el país. Si es solo en algunas ciudades, las escribes en el siguiente paso." | PROPUESTO: "Si es solo en algunas ciudades, las escribes en la siguiente pregunta."
pantalla 07 | ACTUAL: "Las escribes tú en el siguiente paso." | PROPUESTO: "Por ejemplo: Bogotá y Medellín."
pantalla 08 | ACTUAL: "Es el Organizador: la tienda o la marca que pone la plata. Nunca es Rappi. Escribe la razón social como aparece en su RUT." | PROPUESTO: "Tal como sale en su RUT, por ejemplo: Alimentos del Norte S.A.S. Nunca es Rappi."
pantalla 09 | ACTUAL: "Con el dígito de verificación, por ejemplo 900.111.222-1. Está en el RUT del aliado; pídeselo a tu contacto." | PROPUESTO: "Con dígito de verificación, tal como sale en el RUT: 900.111.222-1."
pantalla 11 | ACTUAL: "¿Qué porcentaje del pedido devuelves en Créditos?" | PROPUESTO: "¿Qué porcentaje del pedido se devuelve en Créditos?"
pantalla 11 | ACTUAL: "99" | PROPUESTO: "20"
pantalla 12 | ACTUAL: "¿Qué es lo máximo que recibe alguien por pedido?" | PROPUESTO: "¿Cuál es el máximo de Créditos por pedido?"
pantalla 12 | ACTUAL: "Sin tope, un pedido enorme se lleva el presupuesto entero. El tope es lo que hace que un cashback del 99% sea viable." | PROPUESTO: "Sin tope, un pedido enorme se lleva el presupuesto entero. Con tope, un cashback alto sigue siendo viable."
pantalla 12 | ACTUAL: "(recorrido)" | PROPUESTO: "Que la calculadora muestre también un pedido más grande, donde se note el tope; con 20% y tope de $20.000 diría: 'uno de $300.000 también recibe $20.000, por el tope'."
pantalla 14 | ACTUAL: "¿Cuántas veces puede ganar la misma persona?" | PROPUESTO: "¿Cuántas veces puede recibir el beneficio una persona?"
pantalla 14 | ACTUAL: "La mitad de las campañas permite una sola vez por usuario." | PROPUESTO: "Se cuenta por persona, durante toda la campaña."
pantalla 15 | ACTUAL: "Es opcional: si el beneficio aplica en cualquier pedido, no marques nada." | PROPUESTO: "Si aplica en cualquier pedido, no marques nada."
pantalla 15 | ACTUAL: "La modalidad de consumo en el local de la app. Un domicilio no da el beneficio." | PROPUESTO: "Pide por la app y come en el local. Un domicilio no da el beneficio."
pantalla 15 | ACTUAL: "(recorrido)" | PROPUESTO: "Que Turbo y consumo en el local no se puedan marcar a la vez: al marcar una casilla, la otra se desactiva."
pantalla 16 | ACTUAL: "¿Cuándo le llegan los Créditos?" | PROPUESTO: "¿Cuándo le llegan los Créditos al usuario?"
pantalla 17 | ACTUAL: "Casi todos ponen una fecha límite concreta." | PROPUESTO: "Por ejemplo: hasta el 31 de diciembre, o 30 días desde que le llegan."
pantalla 17 | ACTUAL: "(recorrido)" | PROPUESTO: "Que el contador cuente la pregunta que aparece según la respuesta (la fecha o los días); hoy dice 'Queda 1 pregunta en este paso' y después salen dos."
pantalla 18 | ACTUAL: "Siete de cada diez campañas los limitan a la misma tienda." | PROPUESTO: "Por ejemplo: solo en la tienda donde se los ganó, que es lo más común."
pantalla 18 | ACTUAL: "ni RappiTravel." | PROPUESTO: "ni Rappi Travel."
pantalla 19 | ACTUAL: "La mitad de las campañas es para todos y casi la otra mitad para Pro." | PROPUESTO: "Por ejemplo: solo Pro, o quienes no compran hace 60 días."
pantalla 19 | ACTUAL: "(recorrido)" | PROPUESTO: "Para que lo decidas: que esta pregunta, la de cobertura (07) y la de medio de pago (20) arranquen sin opción marcada, porque hoy vienen marcadas en la promesa más amplia."
pantalla 20 | ACTUAL: "¿Con qué puede pagar?" | PROPUESTO: "¿Con qué medio de pago aplica el beneficio?"
pantalla 20 | ACTUAL: "Con "todos" entran tarjetas, billeteras y efectivo donde exista." | PROPUESTO: "Con "cualquier medio" entran tarjetas, billeteras y efectivo donde exista."
pantalla 21 | ACTUAL: "Es opcional: si no exiges un mínimo, deja el campo vacío y sigue." | PROPUESTO: "Por ejemplo: 30.000. Si no hay mínimo, déjalo vacío."
pantalla 22 | ACTUAL: "Confirmo que la información es veraz y corresponde a la campaña aprobada." | PROPUESTO: "Confirmo que estos datos son ciertos y son los de mi campaña."
pantalla 22 | ACTUAL: "Editar" | PROPUESTO: "Cambiar"
pantalla 24 | ACTUAL: "(recorrido)" | PROPUESTO: "Poner '¿Quién puede publicar?' justo debajo de 'Abrir el documento', con un botón que arme el mensaje para esas personas con el documento, el título y la dirección; los diez pasos de Squarespace quedan plegados bajo 'Si tienes usuario de Squarespace'."
pantalla 24 | ACTUAL: "Copia el título de la campaña que te damos aquí abajo y pégalo en el título del evento. No lo cambies ni le agregues nada." | PROPUESTO: "Copia el título que te dio RappiMind y pégalo en el título del evento. No lo cambies ni le agregues nada."
pantalla 24 | ACTUAL: "Entra a la pestaña Opciones y reemplaza la dirección del evento por la que te damos aquí abajo. La parte del país no se toca: Squarespace la pone sola." | PROPUESTO: "Entra a la pestaña Opciones y reemplaza la dirección del evento por la que te dio RappiMind. La parte del país no se toca: Squarespace la pone sola."
pantalla 24 | ACTUAL: "El texto completo con sus veinte cláusulas." | PROPUESTO: "El texto completo, con todas sus cláusulas numeradas."
pantalla 24 | ACTUAL: "Si no eres una de estas personas, pásales el documento y la dirección de aquí arriba, o pídelo por el canal." | PROPUESTO: "Si no eres una de estas personas, pásales el documento, el título y la dirección que te dio RappiMind."
pantalla 24 | ACTUAL: "Cualquier solicitud, duda o revisión de T&C. Si no tienes usuario de Squarespace, pide aquí que te publiquen la página." | PROPUESTO: "¿No tienes usuario de Squarespace? Pide que te publiquen la página en"
pantalla 24 | ACTUAL: "Ver mi historial" | PROPUESTO: "Ver mis campañas"
pantalla 25 | ACTUAL: "Todas las campañas que has generado, con su documento y su estado. Sirve para tres cosas: abrir otra vez un documento que ya generaste, marcar una campaña como publicada cuando ya la subiste a Squarespace, y arrancar una campaña nueva copiando los datos de una anterior con "Usar como base"." | PROPUESTO: "Abre tus documentos, márcalos como publicados o usa uno como base para una campaña nueva."
pantalla 25 | ACTUAL: "(recorrido)" | PROPUESTO: "En cada fila en estado Generado, los botones 'Abrir documento' y 'Marcar como publicada'; y la fecha como '17 sep 2026', en una columna que diga 'Generada'. Sin esto, la ayuda nueva promete lo que la fila no tiene."
pantalla 26 | ACTUAL: "por el canal de Legal" | PROPUESTO: "en #tyc-rappi"
pantalla 26 | ACTUAL: "No todo el mundo tiene usuario de Squarespace: la cuenta la tienen unas pocas personas por país. Si no eres una de ellas, pásales el documento y la dirección que te dio la herramienta, o pídelo por el canal." | PROPUESTO: "No todo el mundo tiene usuario de Squarespace: la cuenta la tienen unas pocas personas por país. Si no eres una de ellas, pásales el documento, el título y la dirección que te dio RappiMind, o pídelo en #tyc-rappi."
pantalla 26 | ACTUAL: "Cambiar condiciones de una campaña ya publicada afecta a quien ya participó. Habla con Legal antes de tocar nada: hay reglas sobre qué se puede modificar y qué no." | PROPUESTO: "Si es para alargarla o subir el presupuesto, sí: en Mis campañas, botón Ampliar. Para acortarla o bajar algo, habla con Legal, porque afecta a quien ya participó."
pantalla 26 | ACTUAL: "Si el RUT dice un número y la validación lo rechaza, escríbele a Legal." | PROPUESTO: "Si el RUT dice un número y la validación lo rechaza, avísanos en el canal de ayuda: es una falla de la herramienta."
pantalla 26 | ACTUAL: "(recorrido)" | PROPUESTO: "Reordenar la Ayuda: primero la pregunta de descuentos y cupones, luego Publicar en Squarespace y Quién puede publicar, luego lo del azar y las demás preguntas; quitar el 'Me equivoqué en un dato' que se repite en Si algo sale mal; y pasar la línea 'avísanos por el canal' del aviso de azar a Canal de ayuda."
pantalla 26 | ACTUAL: "(recorrido)" | PROPUESTO: "Agregar en 'Sirven para esta herramienta' la viñeta: 'Descuentos, cupones, envío gratis y tarifa de servicio: ya tienen T&C publicados y no generas nada.'"
pantalla 27 | ACTUAL: "(recorrido)" | PROPUESTO: "Agregar un botón 'Cambiar mi respuesta' que vuelva al filtro con lo respondido, y que 'Ir al formulario de Legal' abra el formulario con el motivo y el país ya llenos."
pantalla 28 | ACTUAL: "¿La campaña la paga Rappi Travel o Rappi, y no la marca de un aliado?" | PROPUESTO: "¿La paga Rappi o Rappi Travel, no un aliado?"
pantalla 28 | ACTUAL: "¿Hay sorteo o concurso, o la campaña se anuncia con palabras como "gana"?" | PROPUESTO: "¿Hay sorteo o concurso, o la pieza dice "gana"?"
pantalla 28 | ACTUAL: "¿La campaña anuncia un precio "desde" o una tarifa de vuelo, hotel o paquete?" | PROPUESTO: "¿La pieza anuncia un precio "desde" o una tarifa?"
pantalla 28 | ACTUAL: "¿El beneficio es distinto a Créditos o a un descuento en el precio? Por ejemplo: noches o niños gratis, cupones, millas, eSIM, bonos o cuotas sin interés." | PROPUESTO: "¿El beneficio es otra cosa que Créditos o descuento?"
pantalla 28 | ACTUAL: "(recorrido)" | PROPUESTO: "Que las preguntas del filtro de Travel acepten una línea de ayuda y poner debajo de la quinta: 'Por ejemplo: noches o niños gratis, cupones, millas, eSIM, bonos o cuotas sin interés.' Sin esa línea, no cambiar la quinta."
pantalla 28 | ACTUAL: "(recorrido)" | PROPUESTO: "Partir la sexta en dos: '¿Las condiciones cambian según destino, producto o usuario?' y '¿Mezcla descuento y cashback en la misma campaña?'; y cambiar 'Nueve preguntas rápidas.' por 'Diez preguntas rápidas.' aquí y 'un filtro de nueve preguntas' por 'un filtro de diez preguntas' en la Ayuda."
pantalla 28 | ACTUAL: "¿El beneficio depende de pagar con una tarjeta en cuotas o de una condición de un banco?" | PROPUESTO: "¿El beneficio depende de un banco o de cuotas?"
pantalla 28 | ACTUAL: "¿El producto es un seguro con cobertura de una aseguradora, y no una asistencia al viajero?" | PROPUESTO: "¿El producto es un seguro, no una asistencia al viajero?"
pantalla 28 | ACTUAL: "¿La campaña es solo para empleados o no tiene fecha de fin?" | PROPUESTO: "¿Es solo para empleados o no tiene fecha de fin?"
pantalla 29 | ACTUAL: "La marca aliada devuelve un porcentaje de lo que el usuario pagó por su vuelo, hotel, auto o paquete, en Créditos para su Billetera. Solo para campañas de Rappi Travel." | PROPUESTO: "La marca aliada devuelve un porcentaje de lo que el usuario pagó por su vuelo, hotel, auto o paquete, en Créditos para su Billetera."
pantalla 29 | ACTUAL: "La marca aliada baja el precio de sus vuelos, hoteles, autos o paquetes. El usuario ve el precio ya rebajado antes de pagar, no recibe Créditos. Solo para campañas de Rappi Travel." | PROPUESTO: "La marca aliada baja el precio de sus vuelos, hoteles, autos o paquetes. El usuario ve el precio ya rebajado antes de pagar, no recibe Créditos."
pantalla 30 | ACTUAL: "(recorrido)" | PROPUESTO: "Decisión tuya en data/tyc_genericos.json: de los dos 'Descuento en Productos Seleccionados', dejar uno con el enlace bueno y borrar el otro; con eso desaparece el aviso de la 31."
pantalla 30 | ACTUAL: "(recorrido)" | PROPUESTO: "Decisión tuya: poner el enlace 2026 de 'Cupones de Descuento para Membresía Rappi Pro y Black' y quitar su nota de la versión de 2024."
pantalla 30 | ACTUAL: "(recorrido)" | PROPUESTO: "Decisión tuya: escribir para qué sirven los dos cupones de descuento y quitar su nota 'La lista de Legal no dice para qué sirve este T&C'."
pantalla 30 | ACTUAL: "(recorrido)" | PROPUESTO: "Decisión tuya: renovar 'Tarifa de Servicio Gratis' antes del 31 de octubre de 2026, que es cuando vence."
pantalla 30 | ACTUAL: "(recorrido)" | PROPUESTO: "En la lista, mostrar solo el título y una línea de para qué sirve; lo demás (qué cubre, vigencia, pendientes) va en el detalle de la 31."
pantalla 30 | ACTUAL: "Cupon de descuento - Valor fijo" | PROPUESTO: "Cupón de descuento de valor fijo"
pantalla 30 | ACTUAL: "Cupon de descuento - Toda la tienda" | PROPUESTO: "Cupón de descuento en toda la tienda"
pantalla 30 | ACTUAL: "Codigo de descuento para eventos externos (ej. codigo de 20% para boletas al vino al parque)" | PROPUESTO: "Código de descuento para eventos externos"
pantalla 30 | ACTUAL: "Descuento en producto o servicio que ofrece un externo por medio de un canal de venta independiente" | PROPUESTO: "Un externo da el descuento en su propio canal de venta. Por ejemplo: un código del 20% para las boletas de un evento."
pantalla 30 | ACTUAL: "Tarifa de servicio $0 (Service Fee OFF)" | PROPUESTO: "Tarifa de servicio en $0"
pantalla 30 | ACTUAL: "Descuento en el valor de la suscripción (Fee de Membresía OFF)" | PROPUESTO: "Descuento en el valor de la suscripción"
pantalla 30 | ACTUAL: "El descuento se refleja automáticamente en el check out." | PROPUESTO: "El descuento aparece automáticamente al pagar."
pantalla 30 | ACTUAL: "el costo de envio" | PROPUESTO: "el costo de envío"
pantalla 30 | ACTUAL: "el precio de la suscripcion" | PROPUESTO: "el precio de la suscripción"
pantalla 30 | ACTUAL: "miembros rappi pro" | PROPUESTO: "miembros Rappi Pro"
pantalla 33 | ACTUAL: "En un Cashback Day cada tienda organiza su propio beneficio y responde por él. Por eso cada una necesita sus propios datos." | PROPUESTO: "En un Cashback Multitienda cada tienda organiza su propio beneficio y responde por él. Por eso cada una necesita sus propios datos."
pantalla 34 | ACTUAL: "Por la fecha y hora de su último pedido." | PROPUESTO: "Gana quien hizo antes su último pedido."
pantalla 35 | ACTUAL: "El NIT debe tener 9 dígitos y el dígito de verificación, por ejemplo 900.111.222-1." | PROPUESTO: "El NIT tiene 9 dígitos más el de verificación, por ejemplo 900.111.222-1."
pantalla 36 | ACTUAL: "Esta campaña ya arrancó, así que solo se le puede dar más: más días, más presupuesto, más órdenes o más unidades. Nunca menos, porque cambiaría las condiciones de quien ya compró." | PROPUESTO: "Esta campaña ya arrancó: solo puedes darle más, nunca menos, porque cambiaría las condiciones de quien ya compró."
pantalla 36 | ACTUAL: "(recorrido)" | PROPUESTO: "Que 'Ahora dice' muestre '31 de diciembre de 2026' y '$5.000.000' en vez de '2026-12-31' y '5000000', y que después de 'Ampliar la campaña' le diga qué hacer en Squarespace."
pantalla 37 | ACTUAL: "Activo lo ve cualquiera. Piloto solo lo ve el equipo de pruebas. Bloqueado no lo ve nadie." | PROPUESTO: "Activo lo ve cualquiera. Piloto lo ven pruebas, legal y administración. Bloqueado no lo ve nadie."
pantalla 37 | ACTUAL: "(recorrido)" | PROPUESTO: "En 'Agregar muchos de una vez', que el rol por defecto sea comercial y no legal."
pantalla 37 | ACTUAL: "(recorrido)" | PROPUESTO: "En 'Tipos habilitados', mostrar los nombres que ve el comercial (Cashback Multitienda, 15 minutos o Cashback) y no los internos (cashback_day, cashback_eta)."
pantalla 38 | ACTUAL: "O documento se escreve sozinho, ao lado, enquanto você responde. O que você vê é o que sai." | PROPUESTO: "O documento vai sendo escrito enquanto você responde. O que você vê é o que sai."
pantalla 38 | ACTUAL: "Em 2 minutos você recebe um e-mail com o documento gerado e pronto para publicar no Squarespace. Siga as instruções para garantir que os T&C fiquem publicados corretamente." | PROPUESTO: "Você recebe por e-mail em poucos minutos, com o passo a passo para publicar ou para saber a quem enviar."
pantalla 40 | ACTUAL: "Rappi é a entrega de sempre. Rappi Travel são voos, hotéis, carros e pacotes." | PROPUESTO: "Se for de voos, hotéis, carros ou pacotes, é Rappi Travel."
pantalla 41 | ACTUAL: "Escolha a que se parece com a sua campanha. Cada opção explica do que se trata." | PROPUESTO: "Escolha o tipo que mais se parece com a sua campanha."
pantalla 41 | ACTUAL: "Desconto em porcentagem, frete grátis ou taxa de serviço grátis em uma loja parceira do Brasil. O usuário vê o benefício aplicado no pagamento, não recebe Créditos. Só para o Brasil." | PROPUESTO: "Desconto em porcentagem, frete grátis ou taxa de serviço grátis em uma loja parceira do Brasil. O usuário vê o benefício aplicado no pagamento, não recebe Créditos."
pantalla 43 | ACTUAL: "(recorrido)" | PROPUESTO: "En celular, que el botón flotante diga cuánto falta, por ejemplo: 'Ver cómo va mi T&C · faltan 3 datos'."
