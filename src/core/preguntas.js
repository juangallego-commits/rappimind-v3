'use strict';

/**
 * Las preguntas que ve el comercial.
 *
 * Fuente unica: de aqui salen la interfaz y docs/PREGUNTAS_KAM.md
 * (lo genera scripts/preguntas.js). Si hay que cambiar una pregunta, se cambia
 * aqui y el documento se regenera.
 *
 * Estandar de cada pregunta:
 *   1. Pregunta directa, en tu, maximo 10 palabras. Nunca el nombre del campo.
 *   2. ayuda: una linea con un ejemplo concreto.
 *   3. porQue: dos lineas, detras de "Por que te preguntamos esto".
 *   4. placeholders: que parte del documento llena. La interfaz muestra
 *      "Asi queda en tu T&C" con el texto real del motor.
 *   5. errores: que paso y como se arregla. Nunca "campo invalido".
 *   6. avanzaSola: solo cuando la respuesta es inequivoca (elegir una opcion).
 *
 * Los ejemplos y los valores por defecto salen de docs/HALLAZGOS_SOLICITUDES.md,
 * el analisis de 1.184 solicitudes reales.
 */

/**
 * Los pasos. El nombre corto es el de la barra de progreso, donde hay poco
 * ancho; el titulo es el encabezado de la pantalla, donde si cabe una frase.
 */
var PASOS = [
  { id: 'campana', nombre: 'Campaña', titulo: 'Tu campaña' },
  { id: 'organizador', nombre: 'Organizador', titulo: 'Quién organiza la campaña' },
  { id: 'productos_travel', nombre: 'Productos', titulo: 'Qué se puede comprar' },
  { id: 'condiciones_travel', nombre: 'Condiciones', titulo: 'Condiciones de la compra' },
  { id: 'vigencia', nombre: 'Cuándo', titulo: 'Cuándo corre la campaña' },
  { id: 'beneficio', nombre: 'Beneficio', titulo: 'El beneficio' },
  { id: 'creditos', nombre: 'Créditos', titulo: 'Los Créditos' },
  { id: 'concurso', nombre: 'Concurso', titulo: 'El concurso' },
  { id: 'premio', nombre: 'Premio', titulo: 'El premio' },
  { id: 'tiendas', nombre: 'Tiendas', titulo: 'Las tiendas participantes' },
  { id: 'participantes', nombre: 'Participantes', titulo: 'Quién puede participar' },
  { id: 'pieza', nombre: 'Pieza', titulo: 'La pieza publicitaria' },
  { id: 'confirmacion', nombre: 'Revisar', titulo: 'Revisa y genera' },
];

var GLOSARIO = {
  Organizador: 'La empresa que pone la plata del beneficio y responde por la campaña. Es la tienda o la marca, nunca Rappi.',
  'Tienda Participante': 'La tienda donde el usuario tiene que comprar para ganarse el beneficio. Se llama así en todo el documento.',
  Créditos: 'El saldo que queda en la Billetera de Rappi. No es dinero en efectivo, no se pasa a otra persona y no se retira.',
  Tope: 'Lo máximo que una persona recibe en un solo pedido, por grande que sea el pedido.',
  Presupuesto: 'La plata total de la campaña. Cuando se acaba, la campaña termina sola aunque no se haya cumplido la fecha.',
  Vigencia: 'Cuánto duran los Créditos una vez cargados. Después de eso se vencen.',
  Maker: 'La marca que fabrica el producto, distinta de la tienda que lo vende. Si el Maker pone la plata, el Maker es el Organizador.',
};

var CIUDADES_SUGERIDAS = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cúcuta'];

function p(definicion) {
  return definicion;
}

/* Opciones que Rappi Travel formula distinto. Ver docs/MODELO_BASE_TRAVEL.md. */

var OPCIONES_SEGMENTO_TRAVEL = [
  { valor: 'todos', etiqueta: 'Todos los usuarios', nota: 'Cualquier persona mayor de edad.' },
  { valor: 'pro', etiqueta: 'Pro y Pro Black', nota: 'Con la suscripción activa.' },
  { valor: 'pro_black', etiqueta: 'Solo Pro Black', nota: 'El nivel más alto de la suscripción.' },
  { valor: 'pro_o_rappicard', etiqueta: 'Pro, o quien pague con RappiCard', nota: 'Dos caminos para entrar a la campaña.' },
  { valor: 'sin_pro', etiqueta: 'Solo quienes no tienen Pro', nota: 'Campañas para atraer suscriptores nuevos.' },
  { valor: 'primera_compra', etiqueta: 'Primera compra en Travel', nota: 'Quien nunca ha comprado un viaje en Rappi.' },
];

var OPCIONES_PAGO_TRAVEL = [
  { valor: 'digitales', etiqueta: 'Digitales, excepto efectivo', nota: 'Lo habitual en Travel: tarjetas y billeteras.' },
  { valor: 'rappicard', etiqueta: 'Solo RappiCard', nota: 'La orden se paga entera con la tarjeta de Rappi.' },
  // Una tarjeta o un banco concreto es un medio de pago, no una alianza: el
  // banco no responde por la campana. Salio del filtro el 21 de septiembre de
  // 2026. Las cuotas siguen en el filtro, porque eso ya es financiacion.
  { valor: 'emisor', etiqueta: 'Solo con una tarjeta o banco', nota: 'Tú escribes cuál en la siguiente pregunta.' },
];

var OPCIONES_CARGA_TRAVEL = [
  { valor: 'al_confirmarse', etiqueta: 'Al confirmarse la reserva', nota: 'Apenas el proveedor emite el tiquete o la reserva.' },
  { valor: 'dias_calendario', etiqueta: 'Unos días calendario después del fin', nota: 'Lo más usado. Cuenta todos los días.' },
  { valor: 'dias_habiles', etiqueta: 'Unos días hábiles después del fin', nota: 'No cuenta fines de semana ni festivos.' },
];

var OPCIONES_REDENCION_TRAVEL = [
  { valor: 'categorias', etiqueta: 'Solo en algunas categorías de Travel', nota: 'Tú eliges cuáles. Es lo más usado.' },
  { valor: 'todo_travel', etiqueta: 'En todo Travel', nota: 'Cualquier categoría de viajes.' },
  { valor: 'travel_y_plataforma', etiqueta: 'En Travel y en toda la app', nota: 'También en delivery. Hace la campaña más cara.' },
];

var PREGUNTAS = {
  // --- Tu campaña ---------------------------------------------------------

  pais: p({
    paso: 'campana',
    pregunta: '¿En qué país corre la campaña?',
    ayuda: 'Si tu país no aparece en la lista, todavía no está habilitado.',
    porQue: 'Cada país tiene su propia entidad legal de Rappi, su moneda y su autoridad de protección al consumidor. El documento cambia completo según el país.',
    avanzaSola: true,
    placeholders: ['PAIS_LEGAL', 'ENTIDAD_LEGAL'],
    errores: { vacio: 'Elige el país de la campaña.' },
  }),

  negocio: p({
    paso: 'campana',
    pregunta: '¿La campaña es de Rappi o de Rappi Travel?',
    ayuda: 'Si es de vuelos, hoteles, autos o paquetes, es Rappi Travel.',
    porQue: 'Son dos empresas distintas. Los domicilios los opera Rappi S.A.S. y los viajes Travel Moustache S.A.S., que es una agencia de viajes con registro de turismo. El documento entero cambia según cuál sea.',
    avanzaSola: true,
    porDefecto: 'rappi',
    opciones: [
      { valor: 'rappi', etiqueta: 'Rappi', nota: 'Restaurantes, supermercados, farmacias y todo lo que llega a domicilio.' },
      { valor: 'travel', etiqueta: 'Rappi Travel', nota: 'Vuelos, hoteles, autos, paquetes, tours y asistencia al viajero.' },
    ],
    placeholders: [],
    errores: { vacio: 'Dinos si la campaña es de Rappi o de Rappi Travel.' },
  }),

  tipo: p({
    paso: 'campana',
    pregunta: '¿Qué tipo de campaña vas a hacer?',
    ayuda: 'Elige el que se parezca a tu campaña. Cada opción dice de qué se trata.',
    porQue: 'Cada tipo usa un modelo legal distinto, aprobado por Legal. Elegir mal significa generar el documento equivocado.',
    avanzaSola: true,
    placeholders: [],
    errores: { vacio: 'Elige el tipo de campaña.' },
  }),

  // El nombre de la campana ya no se pregunta: lo arma la herramienta con la
  // tienda, el porcentaje y el dia de inicio. Ver src/core/nombres.js y el caso
  // que lo obligo, en docs/PENDIENTES_LEGAL.md.

  beneficioBr: p({
    paso: 'beneficio',
    pregunta: '¿Qué recibe el usuario?',
    ayuda: 'Las cuatro formas que Legal Brasil tiene aprobadas. Cada una cambia una sola frase del documento.',
    porQue: 'De aquí salen el párrafo de apertura y la viñeta que describe el beneficio. Es lo único que distingue los cuatro modelos aprobados entre sí.',
    avanzaSola: true,
    placeholders: ['TEXTO_BENEFICIO_APERTURA', 'TEXTO_BENEFICIO_REGRA'],
    opciones: [
      { valor: 'desconto', etiqueta: 'Desconto % OFF', nota: 'Un porcentaje de descuento sobre el pedido, con tope en reales.' },
      { valor: 'frete_gratis', etiqueta: 'Frete grátis', nota: 'El envío sin costo, hasta el tope que definas.' },
      { valor: 'taxa_servico', etiqueta: 'Taxa de serviço grátis', nota: 'La tarifa de servicio sin costo. Los documentos aprobados no le ponen tope.' },
      { valor: 'taxa_e_frete', etiqueta: 'Taxa de serviço e frete grátis', nota: 'Las dos cosas juntas. Es la única que los documentos aprobados usan sin mínimo de compra.' },
    ],
    errores: { vacio: 'Elige qué recibe el usuario.' },
  }),

  metodosPagoBr: p({
    paso: 'beneficio',
    pregunta: '¿Con qué medios se puede pagar?',
    ayuda: 'Marca todos los que apliquen. Los cuatro documentos aprobados los enumeran uno por uno.',
    porQue: 'El documento lista los medios de pago válidos con su nombre. Un medio que no esté en la lista no da derecho al beneficio.',
    multiple: true,
    placeholders: ['TEXTO_METODO_PAGO'],
    opciones: [
      { valor: 'dinheiro', etiqueta: 'Dinheiro', nota: 'Efectivo.' },
      { valor: 'paypal', etiqueta: 'Paypal', nota: 'La cuenta de PayPal del usuario.' },
      { valor: 'rappipay', etiqueta: 'RappiPay', nota: 'El medio de pago propio de Rappi.' },
      { valor: 'visa', etiqueta: 'Cartão de crédito Visa', nota: 'Tarjeta de crédito Visa.' },
      { valor: 'mastercard', etiqueta: 'Cartão de crédito Mastercard', nota: 'Tarjeta de crédito Mastercard.' },
      { valor: 'voucher_refeicao', etiqueta: 'Voucher Refeição', nota: 'Vale de comida.' },
    ],
    errores: { vacio: 'Marca al menos un medio de pago.' },
  }),

  etaMinutos: p({
    paso: 'beneficio',
    pregunta: '¿En cuántos minutos prometes la entrega?',
    ayuda: 'El ETA que el usuario ve en la app al hacer la orden. Las campañas publicadas usan quince minutos.',
    porQue: 'Este número es la promesa: si la orden llega después, Rappi paga el Cashback. Sale escrito en letras y en cifra en tres cláusulas del documento.',
    ejemplo: '15',
    placeholders: ['TEXTO_ETA'],
    errores: {
      vacio: 'Escribe en cuántos minutos prometes la entrega.',
      rango: 'El ETA tiene que estar entre 1 y 240 minutos.',
    },
  }),

  exclusionesEta: p({
    paso: 'creditos',
    pregunta: '¿En qué secciones NO se pueden redimir los Créditos?',
    ayuda: 'Opcional. Marca las que queden por fuera. Las campañas publicadas excluyen Rappi Travel, SOAT, Cajero ATM y Rappi Favor.',
    porQue: 'El documento dice dónde se puede gastar el saldo. Una sección que no esté excluida aquí queda habilitada, y después no se puede cerrar.',
    opcional: true,
    multiple: true,
    placeholders: ['TEXTO_LUGAR_REDENCION'],
    opciones: [
      { valor: 'travel', etiqueta: 'Rappi Travel', nota: 'Vuelos, hoteles, autos y paquetes.' },
      { valor: 'soat', etiqueta: 'Seguro Soat', nota: 'El seguro obligatorio de vehículos.' },
      { valor: 'atm', etiqueta: 'Cajero ATM', nota: 'El retiro de efectivo.' },
      { valor: 'favor', etiqueta: 'Rappi Favor', nota: 'Los mandados y diligencias.' },
    ],
    errores: { vacio: 'Marca las secciones excluidas, o sigue sin marcar ninguna.' },
  }),

  tienda: p({
    variantes: {
      // Sin "sin la palabra Turbo" el comercial escribia "El Corral Turbo" aqui
      // y la pregunta siguiente, la de en cual de sus tiendas aplica, quedaba
      // contestada dos veces y en dos sitios distintos.
      cashback: {
        ayuda: 'La marca como aparece en la app, sin la palabra Turbo. Por ejemplo: El Corral.',
        ejemplo: 'El Corral',
      },
      promocao_br: {
        pregunta: '¿En qué parceiro aplica?',
        ayuda: 'El nombre del socio como aparece en la app. Por ejemplo: Petz, Drogasmil, Raia.',
        porQue: 'El documento nombra al Parceiro en el párrafo de apertura y en la viñeta del beneficio.',
        ejemplo: 'Petz',
        // Los placeholders de la variante son los del modelo brasileno. Sin
        // ellos, "Asi queda en tu T&C" mostraba el valor colombiano (el tope en
        // Creditos, el minimo en espanol) que el documento de Brasil no usa.
        placeholders: ['PARCEIRO'],
        errores: { vacio: 'Escribe el parceiro donde aplica la campaña.' },
      },
    },
    paso: 'campana',
    pregunta: '¿En qué tienda aplica?',
    ayuda: 'La marca comercial como aparece en la app. Por ejemplo: Pollo Dorado.',
    porQue: 'El documento nombra la tienda y la define como Tienda Participante. Si el nombre no coincide con el de la app, el usuario no la encuentra.',
    ejemplo: 'Pollo Dorado',
    placeholders: ['TIENDA'],
    errores: { vacio: 'Escribe la tienda donde aplica la campaña.' },
  }),

  alcance: p({
    paso: 'campana',
    pregunta: '¿Dónde aplica la campaña?',
    ayuda: 'Si es solo en algunas ciudades, las escribes en la siguiente pregunta.',
    porQue: 'La cobertura define dónde puede reclamar el usuario. Si el documento dice más de lo que la campaña cubre, el usuario tiene derecho a exigirlo.',
    avanzaSola: true,
    porDefecto: 'Nacional',
    opciones: [
      { valor: 'Nacional', etiqueta: 'En todo el país', nota: 'Donde sea que Rappi tenga cobertura.' },
      { valor: 'Ciudades', etiqueta: 'Solo en algunas ciudades', nota: 'Por ejemplo: Bogotá y Medellín.' },
    ],
    placeholders: ['TEXTO_TERRITORIO'],
    errores: { vacio: 'Elige si la campaña es nacional o por ciudades.' },
  }),

  ciudades: p({
    variantes: {
      cashback_eta: {
        pregunta: '¿En qué ciudad corre la campaña?',
        ayuda: 'Una sola ciudad. Las campañas publicadas son por ciudad, porque el botón Turbo se habilita ciudad por ciudad.',
        porQue: 'El documento nombra la ciudad tres veces: en el territorio, en las Tiendas Participantes y en el título.',
        ejemplo: 'Bogotá',
        // Sin los chips del cashback: con ellos se podian agregar dos ciudades
        // a una pregunta que pide una sola.
        sugerencias: null,
        errores: {
          vacio: 'Escribe la ciudad donde corre la campaña.',
          unaSola: 'Escribe una sola ciudad. El ETA se promete ciudad por ciudad: para otra ciudad, haz otra campaña.',
        },
      },
    },
    paso: 'campana',
    pregunta: '¿En qué ciudades?',
    ayuda: 'Sepáralas con comas. Por ejemplo: Bogotá, Medellín, Cali.',
    porQue: 'Las ciudades salen escritas tal cual en la cláusula de cobertura. Si falta una, el usuario de esa ciudad no puede reclamar.',
    ejemplo: 'Bogotá, Medellín, Cali',
    sugerencias: CIUDADES_SUGERIDAS,
    placeholders: ['TEXTO_TERRITORIO'],
    errores: { vacio: 'Escribe al menos una ciudad, o vuelve y elige cobertura nacional.' },
  }),

  // --- Quién la organiza --------------------------------------------------

  organizadorRazonSocial: p({
    paso: 'organizador',
    pregunta: '¿Qué empresa paga el beneficio?',
    ayuda: 'Tal como sale en {DONDE_ID_FISCAL}, por ejemplo: Alimentos del Norte S.A.S. Nunca es Rappi.',
    porQue: 'El Organizador responde por la campaña frente al usuario y frente a la autoridad. Rappi solo pone la plataforma, así que el nombre tiene que ser exacto.',
    ejemplo: 'Alimentos del Norte S.A.S.',
    placeholders: ['ORGANIZADOR'],
    errores: {
      vacio: 'Escribe la razón social de la empresa que paga el beneficio. Si no la tienes, pídesela a tu contacto en la tienda.',
    },
  }),

  /*
   * La identificacion tributaria del Organizador.
   *
   * Los marcadores los rellena conDatosDelPais() con la fila del pais elegido.
   * Hasta el 21 de septiembre de 2026 esta pregunta decia "NIT" y ponia de
   * ejemplo un NIT colombiano en los nueve paises: un KAM de Mexico leia que le
   * pedian un numero que en Mexico no existe, y el unico sitio donde la
   * herramienta sabia la respuesta correcta era el mensaje de error, que solo
   * aparecia despues de equivocarse.
   */
  organizadorId: p({
    paso: 'organizador',
    pregunta: '¿Cuál es el número de {ID_FISCAL} de esa empresa?',
    ayuda: 'Escríbelo completo, tal como sale en {DONDE_ID_FISCAL}: {EJEMPLO_ID_FISCAL}.',
    porQue: 'El documento identifica al Organizador con su número tributario. Un número mal escrito deja el documento sin un responsable identificable.',
    ejemplo: '{EJEMPLO_ID_FISCAL}',
    placeholders: ['ID_ORGANIZADOR'],
    errores: {
      vacio: 'Escribe el número de {ID_FISCAL} de la empresa organizadora, completo.',
      formato: 'Ese número no cuadra. Revísalo en {DONDE_ID_FISCAL} y escríbelo otra vez.',
    },
    confirmacion: 'válido',
  }),

  // --- Cuándo -------------------------------------------------------------

  fechaInicio: p({
    paso: 'vigencia',
    pregunta: '¿Qué día arranca la campaña?',
    ayuda: 'Puede ser hoy. Publica los T&C antes de que arranque.',
    porQue: 'Los Términos y Condiciones tienen que estar publicados antes de que la campaña empiece. Si arrancó ayer, ya no se pueden publicar a tiempo.',
    placeholders: ['FECHA_INICIO'],
    errores: {
      vacio: 'Elige el día en que arranca la campaña.',
      pasado: 'Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro.',
    },
    aviso: 'Faltan menos de 48 horas. Alcanzas, pero publica los T&C hoy mismo.',
  }),

  horaInicio: p({
    paso: 'vigencia',
    pregunta: '¿A qué hora arranca?',
    ayuda: 'Por defecto arranca a medianoche.',
    porQue: 'La hora exacta define desde cuándo un pedido cuenta para la campaña. Un pedido un minuto antes no da beneficio.',
    porDefecto: '00:00',
    placeholders: ['HORA_INICIO'],
    errores: { vacio: 'Elige la hora de inicio.' },
    variantes: {
      // Los cuatro T&C aprobados de Brasil arrancan a las 00:01, no a
      // medianoche. Hasta el 20 de septiembre de 2026 la ayuda lo contaba y el
      // formulario dejaba 00:00, asi que cada documento brasileno salia
      // arrancando una hora distinta de la de los aprobados. Juan lo cerro ese
      // dia (punto B3). Solo Brasil: los demas paises siguen en 00:00.
      promocao_br: {
        ayuda: 'Por defecto arranca a las 00:01, como los cuatro documentos aprobados.',
        porDefecto: '00:01',
      },
    },
  }),

  fechaFin: p({
    paso: 'vigencia',
    pregunta: '¿Qué día termina?',
    ayuda: 'La mayoría de los cashback duran un solo día. Te la dejamos igual a la de inicio.',
    porQue: 'Después de esta fecha la campaña no da beneficio. También se usa para calcular hasta cuándo sirven los Créditos.',
    placeholders: ['FECHA_FIN'],
    errores: {
      vacio: 'Elige el día en que termina la campaña.',
      orden: 'La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.',
    },
  }),

  horaFin: p({
    paso: 'vigencia',
    pregunta: '¿A qué hora termina?',
    ayuda: 'Por defecto termina a las 11:59 de la noche.',
    porQue: 'Define hasta qué minuto cuenta un pedido. Los pedidos posteriores se procesan como pedidos normales.',
    porDefecto: '23:59',
    placeholders: ['HORA_FIN'],
    errores: {
      vacio: 'Elige la hora de fin.',
      orden: 'La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día.',
    },
  }),

  // --- El beneficio -------------------------------------------------------

  porcentaje: p({
    paso: 'beneficio',
    pregunta: '¿Qué porcentaje del pedido se devuelve en Créditos?',
    ayuda: 'Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.',
    porQue: 'Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.',
    ejemplo: '20',
    placeholders: ['PORCENTAJE'],
    errores: {
      vacio: 'Escribe el porcentaje que devuelves, sin el signo de porcentaje.',
      rango: 'El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.',
    },
    variantes: {
      cashback_eta: {
        pregunta: '¿Qué porcentaje devuelves si la orden llega tarde?',
        ayuda: 'Las campañas publicadas devuelven el cien por ciento de lo que el usuario pagó por los productos.',
        porQue: 'Es lo que el usuario recibe en Créditos cuando Rappi no cumple el tiempo prometido.',
      },

      promocao_br: {
        pregunta: '¿Qué porcentaje de descuento das?',
        ayuda: 'El documento lo escribe como "até X%", así que es el descuento máximo.',
        porQue: 'Sale escrito en letras y en cifra dentro del documento, como lo exige el modelo aprobado.',
        placeholders: ['TEXTO_BENEFICIO_APERTURA', 'TEXTO_TOPE_BENEFICIO'],
      },
      cashback_travel: {
        pregunta: '¿Qué porcentaje de la orden devuelves?',
        ayuda: 'Sin el signo de porcentaje. En Travel lo más usado va de 5 a 20.',
        placeholders: ['TEXTO_BENEFICIO_TRAVEL'],
      },
      descuento_travel: {
        pregunta: '¿Cuál es el porcentaje de descuento?',
        ayuda: 'Sin el signo. Si cambia según el producto, escribe aquí el más alto.',
        porQue: 'Es el descuento que ve el usuario en el precio. Si cambia según el producto, este es el máximo y el documento lo dice junto con el mínimo.',
        placeholders: ['TEXTO_DESCUENTO_TRAVEL'],
      },
      descuento: {
        pregunta: '¿Qué porcentaje de descuento das?',
        ayuda: 'Solo el número. Con 30, un producto de 100 queda en 70.',
        porQue: 'Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese descuento.',
        placeholders: ['TEXTO_BENEFICIO_DESCUENTO'],
      },
      cupon: {
        pregunta: '¿Qué porcentaje de descuento da el cupón?',
        ayuda: 'Solo el número. Con 30, un producto de 100 queda en 70.',
        porQue: 'Es la promesa central de la campaña. Una vez publicado, quien active el cupón puede exigir exactamente ese descuento.',
        placeholders: ['TEXTO_BENEFICIO_DESCUENTO'],
      },
    },
  }),

  tope: p({
    paso: 'beneficio',
    pregunta: '¿Cuál es el máximo de Créditos por pedido?',
    ayuda: 'Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.',
    porQue: 'Sin tope, un pedido enorme se lleva el presupuesto entero. Con tope, un cashback alto sigue siendo viable.',
    ejemplo: '25000',
    moneda: true,
    placeholders: ['TOPE'],
    errores: {
      vacio: 'Escribe el máximo de Créditos que recibe una persona por pedido.',
      cero: 'El tope tiene que ser mayor que cero.',
      mayorQuePresupuesto: 'El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.',
    },
    variantes: {
      cashback_eta: {
        pregunta: '¿Cuál es el tope por orden?',
        ayuda: 'Lo máximo que una sola orden puede recibir en Créditos, por grande que sea. Las campañas publicadas usan cien mil.',
        porQue: 'Sin tope, una sola orden grande se lleva buena parte del presupuesto de la campaña.',
        errores: {
          vacio: 'Escribe el máximo de Créditos que recibe una orden.',
          cero: 'El tope tiene que ser mayor que cero.',
          mayorQuePresupuesto: 'El tope por orden es mayor que el presupuesto total. Con eso, la primera orden se lleva toda la campaña. Revisa los dos números.',
        },
      },

      promocao_br: {
        pregunta: '¿Cuál es el tope del beneficio, en reales?',
        ayuda: 'Lo máximo que la campaña cubre en un pedido. Los documentos aprobados siempre lo traen.',
        porQue: 'Sin tope escrito, la campaña no tiene techo y el presupuesto se puede ir en pocos pedidos.',
        // Solo se pregunta en Desconto % OFF y Frete gratis, que son las dos
        // formas que llevan tope, y ahi es obligatorio: los dos documentos
        // aprobados lo traen siempre. Juan lo cerro el 20 de septiembre de 2026
        // (punto E2). La taxa de servico no lo pregunta, asi que no lo exige.
        placeholders: ['TEXTO_TOPE_BENEFICIO'],
      },
      cashback_travel: {
        pregunta: '¿Qué es lo máximo que recibe por orden?',
        ayuda: 'Aunque la orden sea grande, no recibe más de esto. En Travel va de 50.000 a 300.000.',
        porQue: 'Sin tope, una sola reserva grande se lleva el presupuesto entero. El documento trae además un ejemplo con el valor desde el cual se recibe el tope.',
        placeholders: ['TEXTO_BENEFICIO_TRAVEL'],
      },
      // Opcional aqui, y obligatorio en el Cashback: hay campanas de descuento
      // sin techo, y una pregunta que parece obligatoria hace inventar numeros.
      descuento: {
        pregunta: '¿Hay un tope por pedido?',
        ayuda: 'Lo máximo que la campaña cubre en un pedido, en {MONEDA}. Si no hay tope, déjalo vacío.',
        porQue: 'Sin tope, un pedido grande se lleva buena parte del presupuesto. Si lo pones, el documento lo dice y solo así lo puedes aplicar.',
        opcional: true,
        placeholders: ['TEXTO_TOPE_DESCUENTO'],
        errores: {
          vacio: 'Escribe el tope por pedido, o déjalo vacío si la campaña no tiene.',
          cero: 'El tope tiene que ser mayor que cero.',
          mayorQuePresupuesto: 'El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.',
        },
      },
      cupon: {
        pregunta: '¿Hay un tope por pedido?',
        ayuda: 'Lo máximo que el cupón cubre en un pedido, en {MONEDA}. Si no hay tope, déjalo vacío.',
        porQue: 'Sin tope, un pedido grande se lleva buena parte del presupuesto. Si lo pones, el documento lo dice y solo así lo puedes aplicar.',
        opcional: true,
        placeholders: ['TEXTO_TOPE_DESCUENTO'],
        errores: {
          vacio: 'Escribe el tope por pedido, o déjalo vacío si la campaña no tiene.',
          cero: 'El tope tiene que ser mayor que cero.',
          mayorQuePresupuesto: 'El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.',
        },
      },
    },
  }),

  presupuesto: p({
    variantes: {
      descuento: {
        ayuda: 'Cuando se agote, la campaña termina sola aunque no llegue la fecha de fin.',
        porQue: 'El documento dice que la campaña termina al agotarse el presupuesto. Es lo que te protege si el consumo se dispara.',
        placeholders: ['TEXTO_LIMITE_CAMPANA', 'TEXTO_AGOTAMIENTO'],
      },
      cupon: {
        ayuda: 'Cuando se agote, la campaña termina sola aunque no llegue la fecha de fin.',
        porQue: 'El documento dice que la campaña termina al agotarse el presupuesto. Es lo que te protege si el consumo se dispara.',
        placeholders: ['TEXTO_LIMITE_CAMPANA', 'TEXTO_AGOTAMIENTO'],
      },
      cashback_eta: {
        pregunta: '¿Cuántos Créditos hay para toda la campaña?',
        ayuda: 'Un número entero de Créditos. Cuando se agota, la campaña termina sola aunque no se haya cumplido la hora.',
        porQue: 'El documento lo llama las Existencias y dice que agotarlas termina la campaña automáticamente.',
      },
    },
    paso: 'beneficio',
    pregunta: '¿Cuánto es el presupuesto total de la campaña?',
    ayuda: 'Cuando se acabe, la campaña termina sola. Lo habitual va de 5 a 40 millones.',
    porQue: 'El documento dice que la campaña termina al agotarse el presupuesto. Es lo que te protege si el consumo se dispara.',
    ejemplo: '20000000',
    moneda: true,
    placeholders: ['PRESUPUESTO'],
    errores: {
      vacio: 'Escribe el presupuesto total de la campaña.',
      cero: 'El presupuesto tiene que ser mayor que cero.',
    },
  }),

  maxPedidos: p({
    variantes: {
      cashback_eta: {
        pregunta: '¿Cuántas órdenes puede reclamar la misma persona?',
        ayuda: 'Las campañas publicadas permiten una sola durante toda la vigencia.',
        porQue: 'El documento lo escribe en letras y en cifra, y es lo que frena que una misma cuenta agote el presupuesto.',
        opciones: [
          { valor: 'una', etiqueta: 'Una sola orden', nota: 'Lo que usan las campañas publicadas. La segunda orden ya no reclama.' },
          { valor: 'varias', etiqueta: 'Varias órdenes', nota: 'Tú dices cuántas.' },
          { valor: 'sin_limite', etiqueta: 'Sin límite', nota: 'Solo lo frenan las existencias.' },
        ],
        errores: {
          vacio: 'Dinos cuántas órdenes puede reclamar la misma persona.',
          cuantas: 'Escribe cuántas órdenes puede reclamar una persona.',
          rango: 'Tiene que ser al menos una orden.',
        },
      },

      promocao_br: {
        pregunta: '¿En cuántos pedidos puede usar la promoción la misma persona?',
        ayuda: 'Los documentos aprobados usan uno, dos o sin límite.',
        porQue: 'El documento lo escribe en cifra y en letras: "o limite de 1 (um) pedido por usuário".',
        // En Brasil no hay presupuesto que frene la promocion: la frena la
        // vigencia.
        opciones: [
          { valor: 'una', etiqueta: 'Una sola vez', nota: 'Lo más común. El segundo pedido ya no da beneficio.' },
          { valor: 'varias', etiqueta: 'Varias veces', nota: 'Tú dices cuántas.' },
          { valor: 'sin_limite', etiqueta: 'Sin límite', nota: 'Vale mientras dure la promoción.' },
        ],
      },

      // Decision 20: aqui el limite se cuenta por cada tienda, no por campana.
      // El comercial tiene que saberlo antes de escribir el numero, porque con
      // veinte tiendas participantes un "1" no significa un pedido en total.
      cashback_day: {
        ayuda: 'Es por cada tienda: con 1, gana una vez en cada tienda participante.',
      },
    },
    paso: 'beneficio',
    pregunta: '¿Cuántas veces puede recibir el beneficio una persona?',
    ayuda: 'Se cuenta por persona, durante toda la campaña.',
    porQue: 'Sin límite, unos pocos usuarios pueden consumir el presupuesto en horas. Con límite, el beneficio llega a más gente.',
    avanzaSola: true,
    porDefecto: 1,
    opciones: [
      { valor: 'una', etiqueta: 'Una sola vez', nota: 'Lo más común. El segundo pedido ya no da beneficio.' },
      { valor: 'varias', etiqueta: 'Varias veces', nota: 'Tú dices cuántas.' },
      { valor: 'sin_limite', etiqueta: 'Sin límite', nota: 'Solo lo frena el presupuesto.' },
    ],
    placeholders: ['TEXTO_LIMITE_PEDIDOS'],
    errores: {
      vacio: 'Dinos cuántas veces puede ganar la misma persona.',
      cuantas: 'Escribe cuántos pedidos con beneficio puede hacer una persona.',
      rango: 'Tiene que ser al menos un pedido.',
    },
  }),

  // No tiene pregunta propia: se responde dentro de "¿Cuántas veces puede ganar
  // la misma persona?", donde "Sin límite" es una de las opciones. Preguntarlo
  // aparte obligaría al comercial a entender la relación entre dos campos.
  sinLimite: p({
    paso: 'beneficio',
    respondidoPor: 'maxPedidos',
    pregunta: null,
    placeholders: ['TEXTO_LIMITE_PEDIDOS'],
    errores: {},
  }),

  compraMinima: p({
    // Va en el paso de participantes, no en el del beneficio: es un requisito
    // para participar. El esquema manda, y este archivo tiene que decir lo
    // mismo, porque de aqui sale docs/PREGUNTAS_KAM.md.
    paso: 'participantes',
    pregunta: '¿Hay que gastar un mínimo para participar?',
    ayuda: 'Por ejemplo: 30.000. Si no hay mínimo, déjalo vacío.',
    porQue: 'Si lo exiges, tiene que quedar escrito. Si no aparece en el documento, no lo puedes aplicar después.',
    // El mismo numero que nombra la ayuda: el campo decia 100.000 y la linea de
    // arriba 30.000, y el comercial leia dos ejemplos distintos de lo mismo.
    ejemplo: '30000',
    moneda: true,
    opcional: true,
    placeholders: ['TEXTO_MINIMO_COMPRA', 'TEXTO_UMBRAL'],
    errores: { cero: 'Si no quieres exigir un mínimo, deja el campo vacío.' },
    variantes: {
      promocao_br: {
        pregunta: '¿Hay un mínimo de compra, en reales?',
        ayuda: 'Opcional. De los cuatro documentos aprobados, tres lo llevan y el de taxa de serviço e frete grátis no.',
        porQue: 'El mínimo aparece dos veces en el documento: en el párrafo de apertura y en la viñeta del beneficio.',
        placeholders: ['TEXTO_BENEFICIO_REGRA'],
      },
      cashback_travel: { paso: 'condiciones_travel', placeholders: ['TEXTO_CONDICIONES_TRAVEL'] },
      descuento_travel: { paso: 'condiciones_travel', placeholders: ['TEXTO_CONDICIONES_TRAVEL'] },
    },
  }),

  /*
   * En cual de las tiendas de la marca se gana el cashback.
   *
   * Reemplaza a "El beneficio aplica solo en cierto tipo de pedido?", que se
   * borro el 20 de septiembre de 2026. Aquella ofrecia "Solo consumo en el
   * local", una modalidad que en Rappi no existe (punto C3), y no resolvia el
   * caso real: muchas marcas tienen dos tiendas en la app, la normal y la de
   * Turbo, y el documento no decia en cual contaba el pedido.
   *
   * Sin nada marcado a proposito: aqui no hay respuesta mayoritaria, y una
   * marcada de entrada se publicaria sin que nadie la mire.
   */
  tiendaTurbo: p({
    variantes: {
      // Las notas también: decían "no da el cashback" en una campaña que no da
      // cashback ninguno. Es la trampa de heredar media variante.
      descuento: {
        pregunta: '¿En cuál de sus tiendas aplica el descuento?',
        opciones: [
          { valor: 'normal', etiqueta: 'Solo en la tienda normal', nota: 'Un pedido en su tienda de Turbo no lleva descuento.' },
          { valor: 'turbo', etiqueta: 'Solo en la tienda de Turbo', nota: 'Un pedido en su tienda normal no lleva descuento.' },
          { valor: 'ambas', etiqueta: 'En las dos', nota: 'Vale en cualquiera de las dos tiendas de la marca.' },
          { valor: 'sin_turbo', etiqueta: 'No tiene tienda en Turbo', nota: 'Si no sabes, búscala en el botón Turbo de la app.' },
        ],
        errores: { vacio: 'Dinos en cuál de sus tiendas aplica el descuento.' },
      },
      cupon: {
        pregunta: '¿En cuál de sus tiendas aplica el cupón?',
        opciones: [
          { valor: 'normal', etiqueta: 'Solo en la tienda normal', nota: 'El cupón no se aplica en su tienda de Turbo.' },
          { valor: 'turbo', etiqueta: 'Solo en la tienda de Turbo', nota: 'El cupón no se aplica en su tienda normal.' },
          { valor: 'ambas', etiqueta: 'En las dos', nota: 'Vale en cualquiera de las dos tiendas de la marca.' },
          { valor: 'sin_turbo', etiqueta: 'No tiene tienda en Turbo', nota: 'Si no sabes, búscala en el botón Turbo de la app.' },
        ],
        errores: { vacio: 'Dinos en cuál de sus tiendas aplica el cupón.' },
      },
    },
    paso: 'campana',
    pregunta: '¿En cuál de sus tiendas se gana el cashback?',
    ayuda: 'Muchas marcas tienen dos tiendas en la app: la normal y la de Turbo.',
    porQue: 'El documento dice en cuál tienda cuenta el pedido. Si no lo dice, el usuario puede reclamar el cashback en cualquiera de las dos.',
    avanzaSola: true,
    opciones: [
      { valor: 'normal', etiqueta: 'Solo en la tienda normal', nota: 'Un pedido en su tienda de Turbo no da el cashback.' },
      { valor: 'turbo', etiqueta: 'Solo en la tienda de Turbo', nota: 'Un pedido en su tienda normal no da el cashback.' },
      { valor: 'ambas', etiqueta: 'En las dos', nota: 'Cuenta en cualquiera de las dos. Si la de Turbo la opera otra empresa, usa el Multitienda.' },
      { valor: 'sin_turbo', etiqueta: 'No tiene tienda en Turbo', nota: 'Si no sabes, búscala en el botón Turbo de la app.' },
    ],
    placeholders: ['TEXTO_TIENDA_TURBO'],
    errores: { vacio: 'Dinos en cuál de sus tiendas se gana el cashback.' },
  }),

  // --- El Descuento y el Cupón --------------------------------------------

  formaDelDescuento: p({
    paso: 'beneficio',
    pregunta: '¿Qué forma tiene el beneficio?',
    ayuda: 'Un descuento sobre el precio, o el envío o la tarifa de servicio gratis.',
    porQue: 'De aquí sale la cláusula que dice en qué consiste el Beneficio y sobre qué valor se calcula. Un documento que diga que no cubre el envío, en una campaña cuyo beneficio es justamente el envío, se contradice solo.',
    avanzaSola: true,
    opciones: [
      { valor: 'porcentaje', etiqueta: 'Un porcentaje de descuento', nota: 'Lo más usado. Por ejemplo, 30% menos en el precio.' },
      { valor: 'monto', etiqueta: 'Un monto fijo de descuento', nota: 'Se le resta siempre la misma cantidad al precio.' },
      { valor: 'envio', etiqueta: 'Envío gratis', nota: 'La campaña cubre el costo de envío del pedido.' },
      { valor: 'tarifa_servicio', etiqueta: 'Tarifa de servicio gratis', nota: 'La campaña cubre la tarifa de servicio del pedido.' },
      { valor: 'envio_y_tarifa', etiqueta: 'Envío y tarifa de servicio gratis', nota: 'La campaña cubre los dos cargos del pedido.' },
    ],
    placeholders: ['TEXTO_BENEFICIO_DESCUENTO', 'TEXTO_BASE_DESCUENTO'],
    errores: { vacio: 'Dinos qué forma tiene el beneficio de la campaña.' },
  }),

  montoDescuento: p({
    paso: 'beneficio',
    pregunta: '¿De cuánto es el descuento?',
    ayuda: 'El valor en {MONEDA} que se le resta al precio del pedido.',
    porQue: 'Es la promesa central de la campaña. El documento lo escribe en letras y en cifra, y una vez publicado el usuario lo puede exigir.',
    ejemplo: '10000',
    moneda: true,
    placeholders: ['TEXTO_BENEFICIO_DESCUENTO'],
    errores: {
      vacio: 'Escribe de cuánto es el descuento que se resta del precio.',
      cero: 'El descuento tiene que ser mayor que cero.',
    },
  }),

  agotamiento: p({
    paso: 'beneficio',
    pregunta: '¿Cómo termina la campaña?',
    ayuda: 'Además de la fecha de fin, puede terminar antes por presupuesto o por unidades.',
    porQue: 'El documento dice qué agota la campaña antes de tiempo. Si no lo dice, no la puedes cortar aunque se te acabe la plata.',
    avanzaSola: true,
    porDefecto: 'fecha',
    opciones: [
      { valor: 'fecha', etiqueta: 'Cuando llegue la fecha de fin', nota: 'Sin tope de plata ni de unidades. Lo más simple.' },
      { valor: 'presupuesto', etiqueta: 'Cuando se agote el presupuesto', nota: 'Termina sola al gastarse la plata de la campaña.' },
      { valor: 'unidades', etiqueta: 'Cuando se agoten las unidades', nota: 'Termina sola al llegar a cierto número de pedidos.' },
    ],
    placeholders: ['TEXTO_AGOTAMIENTO', 'TEXTO_LIMITE_CAMPANA'],
    errores: { vacio: 'Dinos cómo termina la campaña.' },
  }),

  unidadesDisponibles: p({
    paso: 'beneficio',
    pregunta: '¿Cuántas unidades hay disponibles?',
    ayuda: 'Cuántos pedidos en total pueden recibir el beneficio. Por ejemplo: 500.',
    porQue: 'Cuando se agoten, la campaña termina sola. El documento tiene que decir cuántas hay, porque quien llegue tarde tiene derecho a saber por qué no alcanzó.',
    ejemplo: '500',
    placeholders: ['TEXTO_LIMITE_CAMPANA', 'TEXTO_AGOTAMIENTO'],
    errores: {
      vacio: 'Escribe cuántas unidades tiene la campaña en total.',
      rango: 'Tiene que haber al menos una unidad disponible.',
    },
  }),

  activacionCupon: p({
    paso: 'beneficio',
    pregunta: '¿Cómo activa el usuario el cupón?',
    ayuda: 'Con un código que escribe, o tomándolo en la sección Cupones de la app.',
    porQue: 'El documento dice exactamente qué tiene que hacer el usuario para recibir el beneficio. Quien no lo haga no lo recibe, y eso solo se le puede oponer si está escrito.',
    avanzaSola: true,
    opciones: [
      { valor: 'codigo', etiqueta: 'Con un código que el usuario escribe', nota: 'Tú nos das el código y el documento lo imprime.' },
      { valor: 'seccion', etiqueta: 'Desde la sección Cupones de la app', nota: 'El cupón aparece en la app y el usuario lo toma.' },
    ],
    placeholders: ['TEXTO_ACTIVACION_CUPON'],
    errores: { vacio: 'Dinos cómo activa el usuario el cupón.' },
  }),

  /*
   * El codigo del cupon.
   *
   * Es texto libre, y la regla 6 de CLAUDE.md los limita. Este entra porque no
   * es texto legal: es un dato de la campana, como el nombre de la tienda o una
   * ciudad. Sale impreso tal cual, asi que se normaliza (mayusculas, sin
   * espacios) y solo admite letras, numeros y guiones.
   */
  codigoCupon: p({
    variantes: {
      cupom_br: {
        porQue: 'O código sai impresso duas vezes no documento. Se não coincidir letra por letra com o do aplicativo, o usuário reclama um cupom que não funciona.',
        placeholders: ['CODIGO_CUPON'],
      },
    },
    paso: 'beneficio',
    pregunta: '¿Cuál es el código del cupón?',
    ayuda: 'Como lo va a escribir el usuario, sin espacios. Por ejemplo: RAPPI30.',
    porQue: 'El código va impreso en el documento. Si no coincide letra por letra con el de la app, el usuario reclama un cupón que no le funciona.',
    ejemplo: 'RAPPI30',
    placeholders: ['TEXTO_ACTIVACION_CUPON'],
    errores: {
      vacio: 'Escribe el código del cupón, tal como lo va a escribir el usuario.',
      formato: 'El código solo puede llevar letras, números y guiones, sin espacios.',
      largo: 'El código no puede pasar de 24 caracteres.',
    },
  }),

  // --- Los Créditos -------------------------------------------------------

  carga: p({
    paso: 'creditos',
    pregunta: '¿Cuándo le llegan los Créditos al usuario?',
    ayuda: 'Es el momento en que el saldo le queda disponible en la Billetera.',
    porQue: 'El documento fija en qué momento el usuario recibe los Créditos, y eso es lo que el usuario va a esperar. Elige lo que el equipo de operaciones puede cumplir.',
    avanzaSola: true,
    porDefecto: 'dia_siguiente',
    opciones: [
      { valor: 'dia_siguiente', etiqueta: 'Al día siguiente del pedido', nota: 'Lo más usado.' },
      { valor: 'inmediata', etiqueta: 'Apenas termina el pedido', nota: 'Inmediato, sin verificación previa.' },
      { valor: 'fecha', etiqueta: 'En una fecha específica', nota: 'Todos reciben el mismo día.' },
    ],
    placeholders: ['TEXTO_CARGA', 'TEXTO_VERIFICACION'],
    errores: { vacio: 'Dinos cuándo le llegan los Créditos al usuario.' },
    variantes: {
      cashback_travel: {
        pregunta: '¿Cuándo le llegan los Créditos al usuario?',
        ayuda: 'Al confirmarse la reserva, o unos días después de que termine la campaña.',
        opciones: OPCIONES_CARGA_TRAVEL,
        placeholders: ['TEXTO_CARGA_TRAVEL', 'TEXTO_VERIFICACION_TRAVEL'],
      },
    },
  }),

  fechaCarga: p({
    paso: 'creditos',
    pregunta: '¿Qué día les cargas los Créditos?',
    ayuda: 'Tiene que ser durante la campaña o después, nunca antes.',
    porQue: 'Es la fecha que el usuario va a esperar. Si no se cumple, entra un reclamo.',
    placeholders: ['TEXTO_CARGA'],
    errores: {
      vacio: 'Elige el día de la carga.',
      antes: 'La carga no puede ser antes de que arranque la campaña.',
    },
  }),

  vigencia: p({
    paso: 'creditos',
    pregunta: '¿Hasta cuándo puede usar esos Créditos?',
    ayuda: 'Por ejemplo: hasta el 31 de diciembre, o 30 días desde que le llegan.',
    porQue: 'Los Créditos se vencen y eso tiene que estar escrito. Si no lo dices, el usuario puede sostener que no vencen.',
    avanzaSola: true,
    opciones: [
      { valor: 'fecha', etiqueta: 'Hasta una fecha', nota: 'Todos vencen el mismo día.' },
      { valor: 'dias', etiqueta: 'Durante unos días', nota: 'Cuenta desde que le llegan a cada uno.' },
    ],
    placeholders: ['TEXTO_VIGENCIA_CREDITOS'],
    errores: { vacio: 'Dinos hasta cuándo sirven los Créditos.' },
  }),

  diasVigencia: p({
    paso: 'creditos',
    pregunta: '¿Cuántos días le duran?',
    ayuda: 'Los valores que más se usan son 5, 7 y 30 días.',
    porQue: 'Se cuentan desde el día en que le llegan. Muy pocos días y el usuario no alcanza a usarlos, y eso genera reclamos.',
    ejemplo: '30',
    placeholders: ['TEXTO_VIGENCIA_CREDITOS'],
    errores: {
      vacio: 'Escribe cuántos días duran los Créditos.',
      rango: 'Los días van de 1 a 365.',
    },
    variantes: {
      cashback_travel: {
        ayuda: 'En las campañas de Travel lo más usado son 15 o 30 días.',
        placeholders: ['TEXTO_VIGENCIA_CREDITOS'],
      },
    },
  }),

  fechaFinRedencion: p({
    paso: 'creditos',
    pregunta: '¿Qué día se vencen los Créditos?',
    ayuda: 'Tiene que ser después de que termine la campaña.',
    porQue: 'Si vencen el mismo día que termina la campaña, quien compra el último día no alcanza a usarlos.',
    placeholders: ['TEXTO_VIGENCIA_CREDITOS'],
    errores: {
      vacio: 'Elige el día en que se vencen los Créditos.',
      orden: 'Los Créditos tienen que vencerse después de que termine la campaña. Si no, quien compre el último día no alcanza a usarlos.',
    },
  }),

  redencion: p({
    paso: 'creditos',
    pregunta: '¿Dónde puede gastar los Créditos?',
    ayuda: 'Por ejemplo: solo en la tienda donde se los ganó, que es lo más común.',
    porQue: 'Define dónde vale el saldo. Lo normal es que se gaste en la misma tienda donde el usuario se ganó el beneficio. En todo caso, estos Créditos casi nunca aplican a RappiFavor, Cajero ATM ni Rappi Travel.',
    avanzaSola: true,
    opciones: [
      { valor: 'tienda', etiqueta: 'Solo en esta tienda', nota: 'Vuelve a comprar donde ganó el beneficio.' },
      { valor: 'secciones', etiqueta: 'En ciertas secciones de Rappi', nota: 'Tú eliges cuáles.' },
      { valor: 'general', etiqueta: 'En cualquier parte de Rappi', nota: 'Donde sea que se acepten Créditos.' },
    ],
    placeholders: ['TEXTO_LUGAR_REDENCION'],
    errores: { vacio: 'Dinos dónde puede gastar los Créditos.' },
    /*
     * Los nombres de las secciones tienen que ser los de la app, porque el
     * documento los imprime entre comillas. Cuando la lista existia solo para
     * Colombia, en los demas paises esta opcion se podia elegir y despues no
     * habia ni una casilla que marcar, con una validacion que pedia marcar al
     * menos una: un camino que arranca y muere. Desde el 20 de septiembre de
     * 2026 la lista de data/secciones.json es comun a todos los paises, pero la
     * razon se queda escrita porque un pais puede tener lista propia vacia.
     */
    razonSinSecciones: 'Todavía no tenemos la lista de secciones de la app en {pais}, y el documento tiene que nombrarlas igual que la app. Si tu campaña las necesita, escríbenos a #tyc-rappi.',
    variantes: {
      cashback_travel: {
        pregunta: '¿Dónde puede gastar los Créditos?',
        ayuda: 'Lo normal es limitarlos a algunas categorías de Travel.',
        porQue: 'Define dónde vale el saldo. En las campañas reales casi nunca se abren a Vuelos, porque ahí el margen es más bajo.',
        opciones: OPCIONES_REDENCION_TRAVEL,
        placeholders: ['TEXTO_REDENCION_TRAVEL'],
      },
    },
  }),

  // --- La pieza publicitaria ----------------------------------------------
  //
  // Estas tres no cambian nada del T&C. Deciden la leyenda que va dentro del
  // arte, que es el texto que hasta ahora el comercial le pedia a Legal por
  // correo. Las opciones salen del catalogo de modelos/leyendas/, asi que un
  // pais solo ofrece las categorias para las que existe una leyenda aprobada.

  categoriaProducto: p({
    paso: 'pieza',
    // Casi ninguna campana lleva advertencia de categoria, asi que "Ninguna"
    // viene marcada. Marcada no es respondida: la pregunta se muestra igual y
    // alguien tiene que confirmarla, como pasa con Colombia en el pais.
    porDefecto: 'ninguna',
    pregunta: '¿Qué categoría tiene el producto de la pieza?',
    ayuda: 'Casi siempre es Ninguna. Solo cambia la leyenda del arte, no tu T&C.',
    opcional: true,
    porQue: 'Algunas categorías tienen que llevar una advertencia por ley dentro de la pieza, como los licores o los medicamentos. La leyenda que te damos ya la trae.',
    avanzaSola: true,
    errores: {
      vacio: 'Elige una categoría, o Ninguna si el producto no es de ninguna de esas.',
      // La respuesta que no deja seguir, solo en Colombia. No es un dato que
      // falte: es una campana que no se puede hacer.
      prohibida: 'No se hacen campañas de cashback, descuento ni concursos sobre medicamentos, productos fitoterapéuticos, cigarrillos, tabaco calentado (como IQOS), vapeadores ni otros productos con nicotina. Esta campaña no se puede hacer. Si tienes dudas, escríbenos a #tyc-rappi.',
    },
    // El mismo aviso, arriba de la lista de tipos de campana, para que el
    // comercial se entere antes de llenar el formulario entero.
    avisoDeTipos: 'No se hacen campañas de cashback, descuento ni concursos sobre medicamentos, productos fitoterapéuticos, cigarrillos, tabaco calentado (como IQOS), vapeadores ni otros productos con nicotina. Si la tienda los vende, el beneficio no puede aplicar a esos productos.',
  }),

  /*
   * Las secciones donde los Creditos NO aplican, en el Cashback.
   *
   * Es la misma pregunta del ETA, con la misma lista, y sale cuando los Creditos
   * se pueden gastar "en cualquier parte de Rappi". Hasta el 20 de septiembre de
   * 2026 eso estaba solo en la ayuda, y el documento prometia cualquier seccion.
   * Punto D5.
   *
   * Vienen marcadas porque casi ninguna campana las abre: marcada no es
   * respondida, la pregunta se muestra igual y alguien tiene que confirmarla.
   */
  exclusionesRedencion: p({
    paso: 'creditos',
    pregunta: '¿En qué secciones NO se pueden redimir los Créditos?',
    ayuda: 'Vienen marcadas las de siempre. Desmarca una solo si esa campaña sí la permite.',
    porQue: 'El documento tiene que decir dónde no vale el saldo. Una sección que no esté excluida aquí queda prometida, y después no se puede cerrar: el usuario reclama con el T&C en la mano.',
    opcional: true,
    multiple: true,
    porDefecto: ['travel', 'soat', 'atm', 'favor'],
    placeholders: ['TEXTO_LUGAR_REDENCION'],
    errores: { vacio: 'Marca las secciones excluidas, o sigue sin marcar ninguna.' },
  }),

  secciones: p({
    paso: 'creditos',
    pregunta: '¿En qué secciones?',
    ayuda: 'Puedes marcar varias.',
    porQue: 'Los nombres salen escritos entre comillas en el documento, así que tienen que coincidir con los de la app.',
    multiple: true,
    placeholders: ['TEXTO_LUGAR_REDENCION'],
    errores: { vacio: 'Marca al menos una sección.' },
  }),

  // --- Rappi Travel -------------------------------------------------------
  //
  // Las preguntas de los dos tipos de Travel. La especificacion esta en
  // docs/MODELO_BASE_TRAVEL.md, seccion 4. Los ejemplos salen de las 141
  // solicitudes reales de Travel (docs/INVESTIGACION_TRAVEL.md, seccion 4).

  marcaAliado: p({
    paso: 'organizador',
    pregunta: '¿De qué marca son los productos?',
    ayuda: 'Como la ve el usuario en la app. Por ejemplo: JetSMART.',
    porQue: 'El documento dice de qué marca son los productos que participan, y el nombre de la campaña empieza por ella.',
    ejemplo: 'JetSMART',
    placeholders: ['TEXTO_PRODUCTOS_TRAVEL'],
    errores: {
      vacio: 'Escribe la marca. Sin ella, el nombre de la campaña quedaría con la razón social.',
    },
  }),

  categorias: p({
    paso: 'productos_travel',
    pregunta: '¿Qué categorías de Travel participan?',
    ayuda: 'Las mismas de la app. Puedes marcar varias. Por ejemplo: Vuelos y Paquetes.',
    porQue: 'Los nombres salen entre comillas en el documento, así que tienen que coincidir con los de la app. De esto también dependen las preguntas que vienen: los vuelos tienen condiciones que los hoteles no.',
    multiple: true,
    placeholders: ['TEXTO_PRODUCTOS_TRAVEL'],
    errores: { vacio: 'Marca al menos una categoría.' },
  }),

  ambito: p({
    paso: 'productos_travel',
    pregunta: '¿Los viajes son nacionales o internacionales?',
    ayuda: 'Si aplica a los dos, elige la tercera opción y el documento no lo menciona.',
    porQue: 'Define si el beneficio cubre un vuelo a Medellín, uno a Madrid o los dos. Si no queda escrito, el usuario lo puede exigir en cualquiera.',
    avanzaSola: true,
    porDefecto: 'ambos',
    opciones: [
      { valor: 'nacional', etiqueta: 'Solo nacionales', nota: 'Origen y destino dentro del país.' },
      { valor: 'internacional', etiqueta: 'Solo internacionales', nota: 'Origen o destino fuera del país.' },
      { valor: 'ambos', etiqueta: 'Nacionales e internacionales', nota: 'Sin restricción de destino.' },
    ],
    placeholders: ['TEXTO_AMBITO_TRAVEL'],
    errores: { vacio: 'Dinos si los viajes son nacionales, internacionales o los dos.' },
  }),

  destinos: p({
    paso: 'productos_travel',
    pregunta: '¿Aplica solo a algunos destinos?',
    ayuda: 'Es opcional. Ciudades o países separados por comas. Por ejemplo: España, México.',
    porQue: 'Si la campaña solo cubre unos destinos, tienen que quedar escritos. Si lo dejas vacío, el beneficio aplica a cualquier destino del ámbito que elegiste.',
    ejemplo: 'España, Estados Unidos, México',
    opcional: true,
    placeholders: ['TEXTO_DESTINOS_TRAVEL'],
    errores: {},
  }),

  hotelesModo: p({
    paso: 'productos_travel',
    pregunta: '¿Qué hoteles participan?',
    ayuda: 'Si son pocos, los escribes en la siguiente pregunta.',
    porQue: 'El usuario tiene que poder saber, antes de reservar, si ese hotel entra en la campaña. Si el documento no lo dice, entra cualquiera.',
    avanzaSola: true,
    porDefecto: 'todos',
    opciones: [
      { valor: 'todos', etiqueta: 'Todos', nota: 'Todos los de las categorías de alojamiento que marcaste.' },
      { valor: 'algunos', etiqueta: 'Solo algunos', nota: 'Los nombras uno por uno.' },
      { valor: 'etiqueta', etiqueta: 'Los que tengan la etiqueta de la campaña', nota: 'El usuario los identifica en la app.' },
    ],
    placeholders: ['TEXTO_HOTELES_TRAVEL'],
    errores: { vacio: 'Dinos qué hoteles participan.' },
  }),

  hotelesLista: p({
    paso: 'productos_travel',
    pregunta: '¿Cuáles hoteles?',
    ayuda: 'Sepáralos con comas, como aparecen en la app.',
    porQue: 'Los nombres salen escritos en el documento. Si falta uno, el usuario que reserve ahí no recibe el beneficio.',
    ejemplo: 'Hotel Estelar Santamar, Decameron Galeón',
    placeholders: ['TEXTO_HOTELES_TRAVEL'],
    errores: { vacio: 'Escribe al menos un hotel, o vuelve y elige que participan todos.' },
  }),

  aerolinea: p({
    paso: 'condiciones_travel',
    pregunta: '¿Aplica solo a una aerolínea?',
    ayuda: 'Es opcional. Escríbela como aparece en la app. Por ejemplo: Avianca.',
    porQue: 'Casi todas las campañas de vuelos las paga una aerolínea y aplican solo a sus vuelos. Si lo dejas vacío, aplica a cualquier aerolínea.',
    ejemplo: 'Avianca',
    opcional: true,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: {},
  }),

  soloOperados: p({
    paso: 'condiciones_travel',
    pregunta: '¿Solo vuelos que ella misma opere?',
    ayuda: 'Márcalo si quedan fuera los vuelos en código compartido con otra aerolínea.',
    porQue: 'Una aerolínea vende vuelos que opera otra compañía. Si la campaña no los cubre y el documento no lo dice, el usuario los puede reclamar.',
    opcional: true,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: {},
  }),

  trayecto: p({
    paso: 'condiciones_travel',
    pregunta: '¿Qué trayectos aplican?',
    ayuda: 'Muchas campañas de aerolínea exigen ida y regreso.',
    porQue: 'Si la campaña exige ida y regreso y el documento no lo dice, quien compre solo ida puede reclamar el beneficio.',
    avanzaSola: true,
    porDefecto: 'cualquiera',
    opciones: [
      { valor: 'cualquiera', etiqueta: 'Cualquiera', nota: 'Ida sola, ida y regreso, lo que sea.' },
      { valor: 'ida_y_regreso', etiqueta: 'Solo ida y regreso', nota: 'No aplica a un tiquete de ida sola.' },
      { valor: 'solo_ida', etiqueta: 'Solo ida', nota: 'No aplica a un tiquete de ida y regreso.' },
    ],
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: { vacio: 'Dinos qué trayectos aplican.' },
  }),

  conteoIdaRegreso: p({
    paso: 'condiciones_travel',
    pregunta: '¿Una ida y regreso cuenta como una orden?',
    ayuda: 'Es lo habitual: una compra, una orden, un beneficio.',
    porQue: 'De esto depende cuántas veces se aplica el tope y cuánto consume del presupuesto una sola compra. Si el documento no lo dice, el usuario puede sostener que son dos.',
    avanzaSola: true,
    porDefecto: 'una_orden',
    opciones: [
      { valor: 'una_orden', etiqueta: 'Sí, cuenta como una', nota: 'El beneficio se calcula sobre el total de la compra.' },
      { valor: 'por_trayecto', etiqueta: 'No, cada trayecto cuenta aparte', nota: 'El beneficio se calcula sobre cada trayecto.' },
    ],
    placeholders: ['TEXTO_CONTEO_IDA_REGRESO_TRAVEL'],
    errores: { vacio: 'Dinos cómo se cuenta una compra de ida y regreso.' },
  }),

  clasesExcluidas: p({
    paso: 'condiciones_travel',
    pregunta: '¿Hay clases tarifarias excluidas?',
    ayuda: 'Es opcional. Una letra cada una, separadas por comas. Por ejemplo: A, F.',
    porQue: 'Las aerolíneas excluyen sus tarifas más baratas o promocionales. Si no quedan escritas, el usuario que compre esa clase puede reclamar.',
    ejemplo: 'A, F',
    opcional: true,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: {
      formato: 'Cada clase tarifaria es una sola letra, separada por comas. Por ejemplo: A, F.',
    },
  }),

  soloOrigenPais: p({
    paso: 'condiciones_travel',
    pregunta: '¿Solo vuelos que salgan del país?',
    ayuda: 'Márcalo si no aplica a vuelos que empiezan en el exterior.',
    porQue: 'Un vuelo Madrid a Bogotá también se vende en la app. Si la campaña no lo cubre, tiene que decirlo.',
    opcional: true,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: {},
  }),

  anticipacionDias: p({
    paso: 'condiciones_travel',
    pregunta: '¿Hay que comprar con anticipación?',
    ayuda: 'Es opcional. Cuántos días antes del viaje. Por ejemplo: 15.',
    porQue: 'Si la campaña exige comprar con anticipación y el documento no lo dice, el usuario que compre el mismo día puede reclamar el beneficio.',
    ejemplo: '15',
    opcional: true,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: { rango: 'Los días de anticipación van de 1 a 365.' },
  }),

  periodoViajeInicio: p({
    paso: 'condiciones_travel',
    pregunta: '¿El viaje tiene que ser desde cierta fecha?',
    ayuda: 'Es opcional, y no es lo mismo que la vigencia: es cuándo viaja, no cuándo compra.',
    porQue: 'La campaña puede correr en octubre para viajes de diciembre. Son dos fechas distintas y el documento las separa.',
    opcional: true,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: {},
  }),

  periodoViajeFin: p({
    paso: 'condiciones_travel',
    pregunta: '¿Y hasta qué fecha?',
    ayuda: 'El último día en que se puede viajar o usar el servicio.',
    porQue: 'Cierra el periodo de viaje. Sin esta fecha, el periodo queda abierto y el usuario lo puede usar cuando quiera.',
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: {
      vacio: 'Escribe hasta cuándo se puede viajar.',
      orden: 'El periodo de viaje no puede terminar antes de empezar.',
    },
  }),

  ambasFechasDentro: p({
    paso: 'condiciones_travel',
    pregunta: '¿Los dos trayectos dentro de ese periodo?',
    ayuda: 'Márcalo si el regreso también tiene que caer dentro de las fechas.',
    porQue: 'Sin esta regla, alguien vuela dentro del periodo y regresa meses después. Si el aliado no lo acepta, tiene que quedar escrito.',
    opcional: true,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: {},
  }),

  fechasExcluidas: p({
    paso: 'condiciones_travel',
    pregunta: '¿Hay fechas en las que no aplica?',
    ayuda: 'Es opcional. En formato año-mes-día, separadas por comas. Por ejemplo: 2026-12-24, 2026-12-31.',
    porQue: 'Los hoteles y las rentadoras suelen excluir puentes y fin de año. Si no queda escrito, el usuario puede reclamar esas fechas.',
    ejemplo: '2026-12-24, 2026-12-31',
    opcional: true,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: {
      formato: 'Las fechas van en formato año-mes-día, separadas por comas. Por ejemplo: 2026-12-24.',
      fuera: 'Las fechas excluidas tienen que estar dentro del periodo de viaje.',
    },
  }),

  nochesMinimas: p({
    paso: 'condiciones_travel',
    pregunta: '¿Hay un mínimo de noches?',
    ayuda: 'Es opcional. Por ejemplo: 2.',
    porQue: 'Si el hotel exige dos noches y el documento no lo dice, quien reserve una puede reclamar el beneficio.',
    ejemplo: '2',
    opcional: true,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: { rango: 'El mínimo de noches va de 1 a 365.' },
  }),

  diasAlquilerMinimo: p({
    paso: 'condiciones_travel',
    pregunta: '¿Hay un mínimo de días de alquiler?',
    ayuda: 'Es opcional. Por ejemplo: 3.',
    porQue: 'Las rentadoras suelen pedir un mínimo de días. Si no queda escrito, no se puede exigir después.',
    ejemplo: '3',
    opcional: true,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: { rango: 'El mínimo de días va de 1 a 365.' },
  }),

  diasAlquilerMaximo: p({
    paso: 'condiciones_travel',
    pregunta: '¿Y un máximo?',
    ayuda: 'El alquiler más largo que entra en la campaña. Por ejemplo: 15.',
    porQue: 'Cierra el rango. Un alquiler de dos meses puede llevarse el beneficio entero si no hay tope de días.',
    ejemplo: '15',
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: {
      vacio: 'Escribe el máximo de días de alquiler.',
      orden: 'El mínimo de días no puede ser mayor que el máximo.',
    },
  }),

  sinCompraMinima: p({
    paso: 'condiciones_travel',
    respondidoPor: 'compraMinima',
    pregunta: null,
    placeholders: ['TEXTO_CONDICIONES_TRAVEL'],
    errores: {},
  }),

  otraCondicion: p({
    paso: 'condiciones_travel',
    pregunta: '¿El aliado pide alguna otra condición?',
    ayuda: 'Cualquier requisito que no te hayamos preguntado ya.',
    porQue: 'Si el aliado exige algo que este documento no cubre, el T&C se queda corto y el usuario puede reclamar lo que no quedó escrito. En ese caso la campaña la redacta Legal.',
    avanzaSola: true,
    porDefecto: 'no',
    opciones: [
      { valor: 'no', etiqueta: 'No, nada más', nota: 'Todo lo que pide el aliado ya lo respondiste.' },
      { valor: 'si', etiqueta: 'Sí, pide algo más', nota: 'Te llevamos al formulario de Legal, que la redacta a mano.' },
    ],
    placeholders: [],
    errores: { vacio: 'Dinos si el aliado pide alguna otra condición.' },
  }),

  formaBeneficio: p({
    paso: 'beneficio',
    pregunta: '¿Cómo se calcula el cashback?',
    ayuda: 'Un porcentaje de lo que pagó, o siempre la misma cantidad.',
    porQue: 'Cambia la cláusula del beneficio entera. Con porcentaje hace falta un tope; con monto fijo, no.',
    avanzaSola: true,
    porDefecto: 'porcentaje',
    opciones: [
      { valor: 'porcentaje', etiqueta: 'Un porcentaje de lo que pagó', nota: 'Lo más usado. Necesita un tope.' },
      { valor: 'monto_fijo', etiqueta: 'Una cantidad fija de Créditos', nota: 'Todos reciben lo mismo.' },
    ],
    placeholders: ['TEXTO_BENEFICIO_TRAVEL'],
    errores: { vacio: 'Dinos cómo se calcula el cashback.' },
  }),

  sinTope: p({
    paso: 'beneficio',
    respondidoPor: 'tope',
    pregunta: null,
    placeholders: ['TEXTO_BENEFICIO_TRAVEL'],
    errores: {},
  }),

  montoFijo: p({
    paso: 'beneficio',
    pregunta: '¿Cuántos Créditos recibe por orden?',
    ayuda: 'La misma cantidad para todos. En las campañas reales va de 50.000 a 300.000.',
    porQue: 'Es el beneficio completo: no depende de cuánto pagó el usuario. Sale escrito en letras y en cifra.',
    ejemplo: '100000',
    moneda: true,
    placeholders: ['TEXTO_BENEFICIO_TRAVEL'],
    errores: {
      vacio: 'Escribe cuántos Créditos recibe una persona por orden.',
      cero: 'Los Créditos por orden tienen que ser más que cero.',
      mayorQuePresupuesto: 'Los Créditos por orden son más que el presupuesto total. Revisa los dos números.',
    },
  }),

  limitePorUsuario: p({
    paso: 'beneficio',
    pregunta: '¿Cuántas órdenes puede beneficiar una persona?',
    ayuda: 'En las campañas de Travel lo más usado son 2.',
    porQue: 'Sin límite, unos pocos usuarios consumen el presupuesto. Con límite, el beneficio llega a más gente.',
    ejemplo: '2',
    porDefecto: 2,
    placeholders: ['TEXTO_LIMITE_ORDENES_TRAVEL'],
    errores: {
      vacio: 'Escribe cuántas órdenes con beneficio puede tener una persona.',
      rango: 'Tiene que ser al menos una orden.',
    },
  }),

  maxOrdenes: p({
    paso: 'beneficio',
    pregunta: '¿Hay un máximo de órdenes en la campaña?',
    ayuda: 'Cuando se llegue a ese número, la campaña termina sola. En Travel es habitual.',
    porQue: 'Es un segundo freno además del presupuesto. El documento dice que la campaña termina al agotarse cualquiera de los dos.',
    ejemplo: '33',
    placeholders: ['TEXTO_LIMITE_CAMPANA_TRAVEL'],
    errores: {
      vacio: 'Escribe el máximo de órdenes, o marca que no hay máximo.',
      rango: 'Tiene que ser al menos una orden.',
    },
  }),

  sinMaxOrdenes: p({
    paso: 'beneficio',
    respondidoPor: 'maxOrdenes',
    pregunta: null,
    placeholders: ['TEXTO_LIMITE_CAMPANA_TRAVEL'],
    errores: {},
  }),

  formaDescuento: p({
    paso: 'beneficio',
    pregunta: '¿El descuento es igual en todos los productos?',
    ayuda: 'Si cambia según el hotel o el vuelo, elige la segunda opción.',
    porQue: 'Si el descuento cambia, el documento tiene que decir el mínimo y el máximo, y a cuántos productos llega el máximo. Anunciar solo el máximo es publicidad engañosa.',
    avanzaSola: true,
    porDefecto: 'fijo',
    opciones: [
      { valor: 'fijo', etiqueta: 'Sí, es el mismo para todos', nota: 'Un solo porcentaje.' },
      { valor: 'variable', etiqueta: 'No, cambia según el producto', nota: 'Vas a decir el mínimo y el máximo.' },
    ],
    placeholders: ['TEXTO_DESCUENTO_TRAVEL'],
    errores: { vacio: 'Dinos si el descuento es igual en todos los productos.' },
  }),

  porcentajeMinimo: p({
    paso: 'beneficio',
    pregunta: '¿Cuál es el descuento más bajo?',
    ayuda: 'El porcentaje del producto con menos descuento. Por ejemplo: 5.',
    porQue: 'El documento dice el rango completo. Anunciar solo el máximo hace pensar que todos los productos lo tienen, y eso la SIC lo trata como publicidad engañosa.',
    ejemplo: '5',
    placeholders: ['TEXTO_DESCUENTO_TRAVEL'],
    errores: {
      vacio: 'Escribe el descuento más bajo de la campaña.',
      rango: 'El descuento más bajo tiene que ser menor que el más alto. Si son iguales, el descuento es fijo.',
    },
  }),

  productosConMaximo: p({
    paso: 'beneficio',
    pregunta: '¿A cuántos productos llega el descuento máximo?',
    ayuda: 'Cuéntalos. Por ejemplo: 3 hoteles tienen el 40%.',
    porQue: 'Es lo que la SIC exige para poder anunciar un "hasta". Sin ese número, el usuario no sabe qué tan real es el máximo.',
    ejemplo: '3',
    placeholders: ['TEXTO_MAXIMO_DISPONIBLE_TRAVEL'],
    errores: {
      vacio: 'Escribe a cuántos productos llega el descuento máximo.',
      rango: 'Tiene que ser al menos un producto.',
    },
  }),

  visibilidad: p({
    paso: 'beneficio',
    pregunta: '¿Dónde ve el usuario el descuento?',
    ayuda: 'Puedes marcar varias.',
    porQue: 'El documento dice dónde encontrarlo. Si el usuario no lo ve en ninguna parte, el descuento no es verificable.',
    multiple: true,
    placeholders: ['TEXTO_VISIBILIDAD_TRAVEL'],
    errores: { vacio: 'Marca al menos un lugar donde el usuario vea el descuento.' },
  }),

  sinLimitePorUsuario: p({
    paso: 'beneficio',
    respondidoPor: 'limitePorUsuario',
    pregunta: null,
    placeholders: ['TEXTO_LIMITE_ORDENES_TRAVEL'],
    errores: {},
  }),

  unidades: p({
    paso: 'beneficio',
    pregunta: '¿La campaña termina al agotarse unas unidades?',
    ayuda: 'Cuántos productos con descuento hay. Por ejemplo: 100.',
    porQue: 'Si la campaña se acaba al agotarse las unidades, el número tiene que estar en el documento. Es el mismo criterio de la SIC que aplica al descuento variable.',
    ejemplo: '100',
    placeholders: ['TEXTO_LIMITE_CAMPANA_TRAVEL'],
    errores: {
      vacio: 'Escribe cuántas unidades hay, o marca que no depende de unidades.',
      rango: 'Tiene que ser al menos una unidad.',
    },
  }),

  sinUnidades: p({
    paso: 'beneficio',
    respondidoPor: 'unidades',
    pregunta: null,
    placeholders: ['TEXTO_LIMITE_CAMPANA_TRAVEL'],
    errores: {},
  }),

  diasCarga: p({
    paso: 'creditos',
    pregunta: '¿Cuántos días después?',
    ayuda: 'Los valores más usados en Travel van de 3 a 5 días.',
    porQue: 'Es el plazo que el usuario va a esperar. Se cuenta desde que termina la campaña, no desde su compra.',
    ejemplo: '5',
    placeholders: ['TEXTO_CARGA_TRAVEL'],
    errores: {
      vacio: 'Escribe cuántos días después de que termine la campaña llegan los Créditos.',
      rango: 'Los días van de 1 a 30.',
    },
  }),

  categoriasRedencion: p({
    paso: 'creditos',
    pregunta: '¿En qué categorías se pueden usar?',
    ayuda: 'Puedes marcar varias. En las campañas reales casi nunca incluyen Vuelos.',
    porQue: 'El documento dice en qué categorías valen los Créditos y en cuáles no. Si no lo dice, el usuario los puede usar en cualquiera y la campaña sale más cara de lo previsto.',
    multiple: true,
    placeholders: ['TEXTO_REDENCION_TRAVEL'],
    errores: { vacio: 'Marca al menos una categoría donde se puedan usar los Créditos.' },
  }),

  fechaPrimeraComunicacion: p({
    paso: 'confirmacion',
    pregunta: '¿Qué día sale la primera pieza?',
    ayuda: 'El día del primer correo, push, banner o mensaje. El T&C se publica antes.',
    porQue: 'En junio de 2026 salió un mensaje de WhatsApp antes de que el T&C estuviera publicado y un usuario reclamó. Esta fecha nos deja verificar que eso no se repita.',
    placeholders: [],
    errores: {
      vacio: 'Escribe el día en que sale la primera comunicación.',
      pasado: 'La primera comunicación no puede ser una fecha que ya pasó: el T&C se publica antes de que salga la primera pieza.',
    },
  }),

  linkAnterior: p({
    paso: 'confirmacion',
    pregunta: '¿Esta campaña repite una anterior?',
    ayuda: 'Es opcional. Pega el link de promos.rappi.com de la campaña anterior.',
    porQue: 'Nos deja comparar las dos y ver si alguna condición cambió sin que nadie lo notara. No sale en el documento.',
    ejemplo: 'https://promos.rappi.com/colombia/...',
    opcional: true,
    placeholders: [],
    errores: {},
  }),

  aliadoAprobo: p({
    paso: 'confirmacion',
    pregunta: 'Confirma que el aliado aprobó la mecánica',
    ayuda: 'Confirmo que el aliado aprobó esta mecánica.',
    porQue: 'El aliado es el Organizador y responde por la campaña. Si no la aprobó, no se puede publicar a su nombre.',
    placeholders: [],
    errores: { vacio: 'Confirma que el aliado aprobó la mecánica.' },
  }),

  declaracionPiezas: p({
    paso: 'confirmacion',
    pregunta: 'Confirma que las piezas dicen lo mismo que el T&C',
    ayuda: 'Confirmo que las piezas dicen lo mismo que este T&C (el porcentaje, la palabra "hasta" junto al tope y las categorías donde se usan los Créditos) y que nada sale antes de publicarlo.',
    porQue: 'En agosto de 2025 una etiqueta prometía 250.000 de cashback sin la palabra "hasta" y terminó en un reclamo por publicidad engañosa que hubo que pagar.',
    placeholders: [],
    errores: { vacio: 'Confirma que las piezas dicen lo mismo que el T&C.' },
  }),

  // --- Quién participa ----------------------------------------------------
  //
  // Tres preguntas venian marcadas y dejaron de venirlo el 20 de septiembre de
  // 2026 (punto F8): esta, la del medio de pago y la de donde se gastan los
  // Creditos. Marcada no es respondida, la pregunta se mostraba igual y habia
  // que confirmarla, pero la respuesta que nadie leyo queda impresa y despues no
  // se puede excluir a nadie. Estas tres deciden a quien se le puede negar el
  // beneficio, asi que las responde el comercial o no se genera.

  segmento: p({
    paso: 'participantes',
    pregunta: '¿Quiénes pueden participar?',
    ayuda: 'Por ejemplo: solo Pro, o quienes no compran hace 60 días.',
    porQue: 'Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.',
    avanzaSola: true,
    opciones: [
      { valor: 'todos', etiqueta: 'Todos los usuarios', nota: 'Cualquier persona mayor de edad.' },
      { valor: 'pro', etiqueta: 'Solo Pro y Pro Black', nota: 'Con la suscripción activa.' },
      { valor: 'nuevos', etiqueta: 'Solo usuarios nuevos', nota: 'Su primer pedido en Rappi.' },
      { valor: 'reactivados', etiqueta: 'Usuarios que no compran hace rato', nota: 'Tú dices desde cuándo.' },
    ],
    placeholders: ['TEXTO_SEGMENTO'],
    errores: { vacio: 'Dinos quiénes pueden participar.' },
    // En Travel la misma columna del Sheet, con otras opciones: los segmentos
    // de viajes no son los de delivery. Ver docs/MODELO_BASE_TRAVEL.md, sección 3.
    variantes: {
      cashback_travel: { opciones: OPCIONES_SEGMENTO_TRAVEL, placeholders: ['TEXTO_SEGMENTO_TRAVEL'] },
      descuento_travel: { opciones: OPCIONES_SEGMENTO_TRAVEL, placeholders: ['TEXTO_SEGMENTO_TRAVEL'] },
    },
  }),

  diasSinCompra: p({
    paso: 'participantes',
    pregunta: '¿Cuántos días sin comprar?',
    ayuda: 'Se cuentan hacia atrás desde que arranca la campaña. Por ejemplo: 60.',
    porQue: 'Define exactamente a quién le llega. El documento lo dice en letras y en número, para que no haya discusión.',
    ejemplo: '60',
    placeholders: ['TEXTO_SEGMENTO'],
    errores: {
      vacio: 'Escribe cuántos días sin comprar.',
      rango: 'Los días van de 1 a 365.',
    },
  }),

  metodoPago: p({
    paso: 'participantes',
    pregunta: '¿Con qué medio de pago aplica el beneficio?',
    ayuda: 'Con "cualquier medio" entran tarjetas, billeteras y efectivo donde exista.',
    porQue: 'Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.',
    avanzaSola: true,
    opciones: [
      { valor: 'todos', etiqueta: 'Con cualquier medio de pago', nota: 'Lo más común.' },
      { valor: 'sin_efectivo', etiqueta: 'Con todo menos efectivo', nota: 'Tarjetas y billeteras sí, efectivo no.' },
      { valor: 'rappicard', etiqueta: 'Solo con RappiCard', nota: 'Únicamente la tarjeta de Rappi.' },
    ],
    placeholders: ['TEXTO_METODO_PAGO'],
    errores: { vacio: 'Dinos con qué puede pagar el usuario.' },
    variantes: {
      cashback_travel: { opciones: OPCIONES_PAGO_TRAVEL, placeholders: ['TEXTO_METODO_PAGO_TRAVEL'] },
      descuento_travel: { opciones: OPCIONES_PAGO_TRAVEL, placeholders: ['TEXTO_METODO_PAGO_TRAVEL'] },
    },
  }),

  beneficioVariable: p({
    paso: 'beneficio',
    pregunta: '¿El beneficio es el mismo para todo?',
    ayuda: 'Si cada hotel, destino o aerolínea tiene su propio porcentaje, elige la segunda.',
    porQue: 'El documento tiene que decir qué recibe el usuario en cada caso. Si prometes un solo porcentaje y en la app hay varios, el usuario puede exigir el más alto en cualquier producto.',
    avanzaSola: true,
    porDefecto: 'no',
    opciones: [
      { valor: 'no', etiqueta: 'Es el mismo para todo', nota: 'Un porcentaje para toda la campaña. Lo más común.' },
      { valor: 'si', etiqueta: 'Cambia según el producto', nota: 'Tú haces la lista, con el beneficio de cada uno.' },
    ],
    placeholders: ['TEXTO_BENEFICIO_POR_PRODUCTO'],
    errores: { vacio: 'Dinos si el beneficio es el mismo para todo.' },
  }),

  beneficiosPorProducto: p({
    paso: 'beneficio',
    pregunta: '¿Cuánto da cada uno?',
    ayuda: 'Uno por fila: el nombre como sale en la app y su porcentaje. Puedes pegarlos desde tu hoja de cálculo.',
    porQue: 'Cada línea sale impresa en el documento. Un producto que no esté en la lista no da beneficio, y uno con el porcentaje mal escrito lo da mal.',
    placeholders: ['TEXTO_BENEFICIO_POR_PRODUCTO'],
    errores: {
      minimo: 'Agrega al menos dos productos con su beneficio. Si todos dan lo mismo, vuelve atrás y elige "Es el mismo para todo".',
      maximo: 'No puedes agregar más de 60 productos.',
      vacio: 'Cada fila necesita el nombre del producto y su porcentaje.',
      rango: 'El porcentaje de cada producto tiene que estar entre 1 y 100.',
      repetida: 'Ese producto ya está en la lista.',
    },
    camposPorProducto: {
      nombre: { pregunta: 'Producto', ayuda: 'El hotel, el destino o la aerolínea, como sale en la app.', ejemplo: 'Hard Rock Hotel Los Cabos' },
      porcentaje: { pregunta: 'Porcentaje', ayuda: 'Solo el número.', ejemplo: '55' },
      hastaCompra: { pregunta: 'Se compra hasta', ayuda: 'Opcional. Si este producto deja de venderse antes que la campaña.', ejemplo: '2026-12-18' },
      hastaViaje: { pregunta: 'Se viaja hasta', ayuda: 'Opcional. La última fecha de viaje que cubre.', ejemplo: '2026-12-18' },
    },
  }),

  anunciaPrecio: p({
    paso: 'pieza',
    pregunta: '¿La pieza anuncia un precio o una tarifa?',
    ayuda: 'Por ejemplo: "vuelos desde $199.000" o "hoteles desde US$50 la noche".',
    porQue: 'Un precio anunciado obliga a decir en el documento qué incluye y en qué condiciones se consigue. Si no queda escrito, el usuario puede exigir ese precio sin ninguna de las condiciones.',
    avanzaSola: true,
    porDefecto: 'no',
    opciones: [
      { valor: 'no', etiqueta: 'No anuncia precio', nota: 'La pieza habla del descuento o del beneficio, no de un valor.' },
      { valor: 'si', etiqueta: 'Sí, anuncia un precio', nota: 'Con "desde", una tarifa o un valor concreto.' },
    ],
    placeholders: ['TEXTO_PRECIO_ANUNCIADO'],
    errores: { vacio: 'Dinos si la pieza anuncia un precio.' },
  }),

  precioIncluyeTodo: p({
    paso: 'pieza',
    pregunta: '¿Ese precio ya incluye impuestos, tasas y cargos?',
    ayuda: 'Es el valor final que paga el usuario, sin sumas después.',
    porQue: 'La ley exige que el precio anunciado sea el total. Un "desde" que después crece con impuestos es el caso que ya le costó una sanción a Rappi Travel.',
    avanzaSola: true,
    opciones: [
      { valor: 'si', etiqueta: 'Sí, es el valor final', nota: 'Lo que el usuario ve es lo que paga.' },
      { valor: 'no', etiqueta: 'No, se suman después', nota: 'Esta campaña la tiene que ver Legal.' },
    ],
    placeholders: ['TEXTO_PRECIO_ANUNCIADO'],
    errores: { vacio: 'Dinos si el precio anunciado incluye impuestos, tasas y cargos.' },
  }),

  nombreMedioPago: p({
    paso: 'participantes',
    pregunta: '¿Con cuál tarjeta o banco?',
    ayuda: 'Como lo ve el usuario al pagar. Por ejemplo: Tarjeta de Crédito Bancolombia.',
    porQue: 'El nombre sale impreso en el documento, así que tiene que ser el que el usuario reconoce. Si queda impreciso, alguien con otra tarjeta del mismo banco va a creer que aplica.',
    ejemplo: 'Tarjeta de Crédito Bancolombia',
    placeholders: ['TEXTO_METODO_PAGO_TRAVEL'],
    errores: { vacio: 'Escribe con cuál tarjeta o banco aplica el beneficio.' },
  }),

  declaracion: p({
    paso: 'confirmacion',
    pregunta: 'Confirma que la información es correcta',
    ayuda: 'Confirmo que estos datos son ciertos y son los de mi campaña.',
    porQue: 'El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.',
    placeholders: [],
    errores: { vacio: 'Marca la casilla para confirmar que la información es correcta.' },
  }),

  // --- El concurso (Carrera de Compras) -----------------------------------

  productos: p({
    variantes: {
      descuento: {
        paso: 'beneficio',
        pregunta: '¿Sobre qué productos aplica el descuento?',
        ayuda: 'Si el descuento lo paga una marca, suelen participar solo sus productos.',
        porQue: 'Define en qué productos se rebaja el precio. Si no queda claro, el usuario puede exigir el descuento en todo el catálogo.',
        placeholders: ['TEXTO_PRODUCTOS_DESCUENTO'],
        errores: { vacio: 'Dinos sobre qué productos aplica el descuento.' },
      },
      cupon: {
        paso: 'beneficio',
        pregunta: '¿Sobre qué productos aplica el cupón?',
        ayuda: 'Si el cupón lo paga una marca, suelen participar solo sus productos.',
        porQue: 'Define en qué productos se rebaja el precio. Si no queda claro, el usuario puede exigir el descuento en todo el catálogo.',
        placeholders: ['TEXTO_PRODUCTOS_DESCUENTO'],
        errores: { vacio: 'Dinos sobre qué productos aplica el cupón.' },
      },
    },
    paso: 'concurso',
    pregunta: '¿Qué productos participan?',
    ayuda: 'Si el concurso lo paga una marca, suelen participar solo sus productos.',
    porQue: 'Define qué compras cuentan para el ranking. Si no queda claro, cualquier compra podría contar.',
    avanzaSola: true,
    opciones: [
      { valor: 'todos', etiqueta: 'Todo lo de la tienda', nota: 'Cualquier producto del catálogo.' },
      { valor: 'marca', etiqueta: 'Solo los de una marca', nota: 'Los productos de un Maker.' },
      { valor: 'especificos', etiqueta: 'Unos productos puntuales', nota: 'Tú haces la lista.' },
    ],
    placeholders: ['TEXTO_PRODUCTOS'],
    errores: { vacio: 'Dinos qué productos participan.' },
  }),

  makerMarca: p({
    variantes: {
      descuento: {
        paso: 'beneficio',
        porQue: 'El documento nombra la marca, así que el usuario sabe exactamente en qué productos se le rebaja el precio.',
        placeholders: ['TEXTO_PRODUCTOS_DESCUENTO'],
      },
      cupon: {
        paso: 'beneficio',
        porQue: 'El documento nombra la marca, así que el usuario sabe exactamente en qué productos se le rebaja el precio.',
        placeholders: ['TEXTO_PRODUCTOS_DESCUENTO'],
      },
    },
    paso: 'concurso',
    pregunta: '¿De qué marca?',
    ayuda: 'El nombre comercial de la marca. Por ejemplo: Galletas Lunaria.',
    porQue: 'El documento nombra la marca, así que el usuario sabe exactamente qué comprar para participar.',
    ejemplo: 'Galletas Lunaria',
    placeholders: ['TEXTO_PRODUCTOS'],
    errores: { vacio: 'Escribe el nombre de la marca.' },
  }),

  /*
   * Los productos participantes, con su codigo de barras.
   *
   * Era un campo de texto libre y dos productos que se llaman parecido dejaban
   * el documento sin decir cual suma al concurso. Los textos son los de la
   * decision 36 (iii) del encargo 01, tal cual (punto D4).
   */
  alcanceTurbo: p({
    paso: 'campana',
    pregunta: '¿En qué corre la campaña?',
    ayuda: 'Casi todas corren en todo Turbo Restaurantes de la ciudad, que es donde están El Corral Turbo, McDonald\u2019s Turbo y las demás marcas.',
    porQue: 'El documento dice quién participa. Si la campaña es de toda una categoría, la nombra y el listado es el que el usuario ve en la app. Si es de unas tiendas concretas, las nombra una por una.',
    avanzaSola: true,
    porDefecto: 'restaurantes',
    opciones: [
      {
        valor: 'restaurantes', etiqueta: 'En todo Turbo Restaurantes de la ciudad',
        nota: 'Es como corren casi todas. Participan las marcas de restaurantes del botón Turbo.',
      },
      {
        valor: 'turbo', etiqueta: 'En todo Turbo de la ciudad',
        nota: 'Toda la categoría Turbo, no solo los restaurantes.',
      },
      {
        valor: 'tiendas', etiqueta: 'En unas tiendas concretas de Turbo',
        nota: 'Las dark stores, como las de Turbo Carulla: Turbo Calleja, Turbo Chico, Turbo Laureles. El documento las nombra una por una.',
      },
    ],
    placeholders: ['TEXTO_TIENDAS_ETA'],
    errores: { vacio: 'Dinos en qué corre la campaña.' },
  }),

  tiendasEta: p({
    paso: 'campana',
    pregunta: '¿Cuáles tiendas de Turbo participan?',
    ayuda: 'Una por fila, con el nombre como sale en el botón Turbo de la app. Por ejemplo: Turbo Calleja.',
    porQue: 'El documento las nombra una por una, así que el usuario sabe exactamente en cuál cuenta su orden.',
    placeholders: ['TEXTO_TIENDAS_ETA'],
    errores: {
      minimo: 'Agrega al menos una tienda de Turbo.',
      maximo: 'No puedes agregar más de 60 tiendas.',
      repetido: 'Esa tienda ya está en la lista.',
    },
    camposPorTienda: {
      nombre: { pregunta: 'Nombre de la tienda', ayuda: 'Como sale en el botón Turbo.', ejemplo: 'Turbo Calleja' },
    },
  }),

  productosDetalle: p({
    variantes: {
      descuento: {
        paso: 'beneficio',
        porQue: 'El EAN identifica el producto sin discusión. Si dos productos se llaman parecido, el EAN decide en cuál se rebaja el precio.',
        placeholders: ['TEXTO_PRODUCTOS_DESCUENTO'],
      },
      cupon: {
        paso: 'beneficio',
        porQue: 'El EAN identifica el producto sin discusión. Si dos productos se llaman parecido, el EAN decide en cuál se rebaja el precio.',
        placeholders: ['TEXTO_PRODUCTOS_DESCUENTO'],
      },
    },
    paso: 'concurso',
    pregunta: '¿Cuáles productos participan?',
    ayuda: 'Uno por fila: el nombre como sale en la app y su EAN, el número del código de barras.',
    porQue: 'El EAN identifica el producto sin discusión. Si dos productos se llaman parecido, el EAN decide qué compra suma.',
    placeholders: ['TEXTO_PRODUCTOS'],
    errores: {
      minimo: 'Agrega al menos un producto participante.',
      maximo: 'No puedes agregar más de 60 productos.',
      largo: 'El EAN tiene 8, 12, 13 o 14 números. Revisa que esté completo.',
      control: 'Ese EAN no existe: el último número no cuadra. Cópialo otra vez del empaque o del catálogo.',
      repetido: 'Ese EAN ya está en la lista.',
    },
    camposPorProducto: {
      nombre: { pregunta: 'Nombre', ayuda: 'Como sale en la app.', ejemplo: 'Galletas Lunaria clásicas' },
      ean: { pregunta: 'EAN', ayuda: 'El número del código de barras.', ejemplo: '7702001008285' },
    },
  }),

  criterioGanador: p({
    paso: 'concurso',
    pregunta: '¿Cómo se define el ganador?',
    ayuda: 'Gana quien más compra, medido por plata o por número de pedidos.',
    porQue: 'Esto es lo que hace que sea un concurso de habilidad y no un sorteo. Un sorteo necesita permiso previo de la autoridad.',
    avanzaSola: true,
    opciones: [
      { valor: 'mayor_valor', etiqueta: 'Quien más plata gaste', nota: 'Suma el valor de las compras.' },
      { valor: 'mas_pedidos', etiqueta: 'Quien más pedidos haga', nota: 'Cuenta pedidos, no montos.' },
    ],
    placeholders: ['CRITERIO_GANADOR'],
    errores: { vacio: 'Dinos cómo se define el ganador.' },
  }),

  numeroGanadores: p({
    paso: 'concurso',
    pregunta: '¿Cuántas personas ganan?',
    ayuda: 'Los primeros del ranking. Por ejemplo: 3.',
    porQue: 'El documento dice cuántos ganan y en qué posiciones. Cambiarlo después de publicado no se puede.',
    ejemplo: '3',
    placeholders: ['FRASE_GANADORES'],
    errores: {
      vacio: 'Escribe cuántas personas ganan.',
      rango: 'El número de ganadores va de 1 a 100.',
    },
  }),

  desempate: p({
    paso: 'concurso',
    pregunta: 'Si dos personas empatan, ¿quién gana?',
    ayuda: 'Tiene que ser un criterio distinto al que define al ganador.',
    porQue: 'Sin regla de desempate, un empate se resuelve al azar, y el azar convierte el concurso en un sorteo.',
    avanzaSola: true,
    opciones: [
      { valor: 'primero', etiqueta: 'Quien llegó primero', nota: 'Gana quien hizo antes su último pedido.' },
      { valor: 'mas_pedidos', etiqueta: 'Quien hizo más pedidos', nota: 'Cuenta pedidos válidos.' },
      { valor: 'mayor_valor', etiqueta: 'Quien gastó más', nota: 'Suma el valor de las compras.' },
    ],
    placeholders: ['TEXTO_DESEMPATE'],
    errores: {
      vacio: 'Dinos quién gana si hay empate.',
      igual: 'Ese ya es el criterio con el que se define al ganador, así que nunca desempataría. Elige otro.',
    },
    razonDeshabilitado: 'Ya es el criterio del ganador: nunca desempataría.',
  }),

  // --- El premio ----------------------------------------------------------

  tipoPremio: p({
    paso: 'premio',
    pregunta: '¿Qué se gana?',
    ayuda: 'Créditos es lo más simple: se cargan a la Billetera y listo.',
    porQue: 'Un premio físico obliga al Organizador a responder por su existencia, calidad, garantía y entrega. Los Créditos no.',
    avanzaSola: true,
    opciones: [
      { valor: 'creditos', etiqueta: 'Créditos de Rappi', nota: 'Se cargan a la Billetera del ganador.' },
      { valor: 'fisico', etiqueta: 'Un premio físico', nota: 'Algo que hay que entregar.' },
    ],
    placeholders: ['LISTA_PREMIOS', 'TEXTO_NATURALEZA_PREMIO'],
    errores: { vacio: 'Dinos qué se gana.' },
  }),

  creditosPremio: p({
    paso: 'premio',
    pregunta: '¿Cuántos Créditos se lleva cada ganador?',
    ayuda: 'Por persona, no el total. Por ejemplo: 500.000.',
    porQue: 'Es la promesa del concurso. Si son varios ganadores, cada uno recibe esta cantidad completa.',
    ejemplo: '500000',
    moneda: true,
    placeholders: ['LISTA_PREMIOS'],
    errores: {
      vacio: 'Escribe cuántos Créditos se lleva cada ganador.',
      cero: 'El premio tiene que ser mayor que cero.',
    },
  }),

  descripcionPremio: p({
    paso: 'premio',
    pregunta: '¿Qué es exactamente el premio?',
    ayuda: 'Descríbelo como para que nadie pregunte. Por ejemplo: una bicicleta de montaña marca Andes, rin 29.',
    porQue: 'El Organizador responde por lo que diga esta línea. Descripciones vagas terminan en reclamos.',
    ejemplo: 'Una bicicleta de montaña marca Andes, rin 29',
    placeholders: ['LISTA_PREMIOS'],
    errores: {
      vacio: 'Describe el premio.',
      largo: 'La descripción no puede pasar de 150 caracteres. Déjala en una línea concreta.',
    },
  }),

  /*
   * El valor comercial del premio, solo en Colombia y solo con premio fisico.
   *
   * Decision 36 (ii) del encargo 01, confirmada por Juan el 20 de septiembre de
   * 2026 (punto D3). El enunciado y la ayuda los propongo yo: la decision trae
   * los dos textos del documento, no los de la pantalla.
   */
  valorPremio: p({
    paso: 'premio',
    pregunta: '¿Cuánto vale el premio?',
    ayuda: 'El valor comercial de un premio, con IVA. Si hay varios ganadores, el de uno solo.',
    porQue: 'El documento declara cuánto vale el premio y, cuando hay varios ganadores, cuánto suman todos. Es lo que dice el tamaño real del concurso.',
    ejemplo: '500000',
    moneda: true,
    placeholders: ['LISTA_PREMIOS'],
    errores: {
      vacio: 'Escribe cuánto vale el premio.',
      cero: 'El valor del premio tiene que ser mayor que cero.',
    },
  }),

  entregaPor: p({
    paso: 'premio',
    pregunta: '¿Quién entrega el premio?',
    ayuda: 'El Organizador responde por el premio, entregue quien entregue.',
    porQue: 'Que Rappi lleve el premio no lo convierte en organizador: lo hace como operador logístico y por cuenta del Organizador.',
    avanzaSola: true,
    opciones: [
      { valor: 'organizador', etiqueta: 'El Organizador', nota: 'Coordina directo con el ganador.' },
      { valor: 'rappi', etiqueta: 'Rappi, como operador logístico', nota: 'Por cuenta del Organizador, que sigue siendo el responsable.' },
    ],
    placeholders: ['TEXTO_ENTREGA', 'TEXTO_DATOS_ENTREGA'],
    errores: { vacio: 'Dinos quién entrega el premio.' },
  }),

  /*
   * El acuerdo de transferencia de datos, decision 36 (i) de la respuesta del
   * encargo 01. Todos los textos de aqui son de esa respuesta, copiados tal
   * cual: el enunciado, la ayuda, el por que, las notas de las dos opciones y
   * los nueve pasos del panel de Colombia.
   *
   * La nota de "Si, ya esta firmado" habla de la tabla de acuerdos marco, que es
   * de Colombia, asi que solo sale ahi.
   */
  acuerdoDatos: p({
    paso: 'premio',
    pregunta: '¿El Organizador ya firmó el acuerdo de transferencia de datos?',
    ayuda: 'Sin ese acuerdo firmado no se le pueden enviar los datos del ganador.',
    porQue: 'Rappi responde por los datos de sus usuarios. Enviarlos a una marca sin acuerdo firmado nos expone ante la autoridad de datos personales.',
    opcional: true,
    avanzaSola: true,
    opciones: [
      { valor: 'firmado', etiqueta: 'Sí, ya está firmado', nota: 'Puedes seguir con la campaña.' },
      { valor: 'no_o_no_se', etiqueta: 'No, o no sé', nota: 'Te mostramos cómo se firma. Puedes generar el T&C igual.' },
    ],
    // La nota de Colombia para la primera opción, que nombra la tabla de
    // acuerdos marco. En los demás países esa tabla no existe.
    notaFirmadoCO: 'La marca aparece en verde en la tabla de acuerdos marco.',
    // El panel que sale al responder "No, o no sé".
    panel: {
      tituloCO: 'Cómo se firma en Colombia (una sola vez al año por marca)',
      primeroCO: 'Primero mira si la marca ya está en verde en la tabla de acuerdos marco.',
      pasosCO: [
        'Pídele a la marca razón social, NIT, domicilio, nombre y cédula del representante legal o apoderado, y el correo para la firma. Si firma un apoderado, pide también el certificado de cámara de comercio o el poder.',
        'Pídele nombre, cargo, correo y teléfono de las personas que van a manejar las Órdenes de Transferencia. Por Rappi, esa persona eres tú.',
        'Mándale esa información a Legal para completar el Acuerdo Marco.',
        'Envíale el acuerdo a la marca para revisión y explícale por qué se firma.',
        'Cerrada la negociación, Legal lo manda a firma.',
        'Cuando esté firmado, Legal lo carga en la tabla y la marca queda en verde.',
        'En cada campaña llenas la Orden de Transferencia: campaña, número de ganadores, qué datos se envían, cuándo se entrega el premio y cuándo se borran los datos. La marca la acepta por correo y no se vuelve a firmar nada.',
        'Cuando entregue el premio, la marca borra los datos y le manda a Rappi el certificado de supresión.',
        'Si la marca no está en verde o la Orden no está aceptada, ni Producto ni Data te pueden entregar los datos.',
        'Si no alcanzan a firmar antes de la entrega, cambia tu respuesta a "Rappi, como operador logístico": la marca le entrega los premios a Rappi y Rappi se los lleva al ganador.',
      ],
      // Los demás países no tienen tabla ni Orden de Transferencia: tienen el
      // modelo de su Legal, y el enlace sale de la fila del país.
      conModelo: 'En {país} el acuerdo se firma con el modelo de Legal de tu país. Ábrelo aquí y escríbele a Legal antes de comprometer la entrega del premio.',
      sinModelo: 'En {país} todavía no hay modelo de acuerdo: escríbele a Legal antes de comprometer la entrega del premio.',
    },
  }),

  medioNotificacion: p({
    paso: 'premio',
    pregunta: '¿Cómo le avisas al ganador?',
    ayuda: 'El correo de la cuenta de Rappi del ganador es lo más confiable.',
    porQue: 'El documento dice por dónde le vas a avisar. Si avisas por otro lado y no contesta, no puedes darlo por desierto.',
    avanzaSola: true,
    porDefecto: 'correo',
    opciones: [
      { valor: 'correo', etiqueta: 'Por correo electrónico', nota: 'Al correo de la cuenta de Rappi del ganador.' },
      { valor: 'llamada', etiqueta: 'Por llamada telefónica', nota: 'Al número de la cuenta de Rappi del ganador.' },
      { valor: 'plataforma', etiqueta: 'Con una notificación en la app', nota: 'Dentro de la Plataforma Rappi.' },
    ],
    placeholders: ['MEDIO_NOTIFICACION'],
    errores: { vacio: 'Dinos cómo le avisas al ganador.' },
  }),

  fechaNotificacion: p({
    paso: 'premio',
    pregunta: '¿Qué día le avisas?',
    ayuda: 'Después de que termine la campaña, con tiempo para contar los resultados.',
    porQue: 'Es el compromiso de fecha frente al ganador. Antes de esa fecha nadie puede reclamar, después sí.',
    placeholders: ['FECHA_NOTIFICACION'],
    errores: {
      vacio: 'Elige el día en que le avisas al ganador.',
      orden: 'Tiene que ser después de que termine la campaña: antes todavía no sabes quién ganó.',
    },
  }),

  plazoConfirmacion: p({
    paso: 'premio',
    pregunta: '¿Cuántos días tiene para responder?',
    ayuda: 'Días hábiles. Cinco es lo habitual.',
    porQue: 'Pasado ese plazo sin respuesta puedes declarar desierto el premio. Sin plazo escrito, no puedes.',
    ejemplo: '5',
    porDefecto: 5,
    placeholders: ['PLAZO_CONFIRMACION'],
    errores: {
      vacio: 'Escribe cuántos días hábiles tiene para responder.',
      rango: 'El plazo va de 1 a 30 días hábiles.',
    },
  }),

  // --- Las tiendas (Cashback Day) -----------------------------------------

  tiendas: p({
    paso: 'tiendas',
    pregunta: '¿Qué tiendas participan?',
    ayuda: 'Mínimo dos. Cada una entra con su razón social, su {ID_FISCAL} y su presupuesto.',
    porQue: 'En un Cashback Multitienda cada tienda organiza su propio beneficio y responde por él. Por eso cada una necesita sus propios datos.',
    placeholders: ['TIENDA_MARCA', 'TIENDA_RAZON_SOCIAL', 'TIENDA_ID', 'TIENDA_CIUDADES', 'TIENDA_PRESUPUESTO'],
    errores: {
      minimo: 'Agrega al menos 2 tiendas participantes.',
      maximo: 'No puedes agregar más de 60 tiendas.',
      repetida: 'Esa identificación ya está en otra tienda de la lista.',
    },
    camposPorTienda: {
      marca: { pregunta: 'Marca', ayuda: 'Como aparece en la app.', ejemplo: 'Beer Station' },
      razonSocial: { pregunta: 'Razón social', ayuda: 'Como aparece en {DONDE_ID_FISCAL}.', ejemplo: 'Cervecerías del Sur S.A.S.' },
      id: { pregunta: '{ID_FISCAL}', ayuda: 'Completo, tal como sale en {DONDE_ID_FISCAL}.', ejemplo: '{EJEMPLO_ID_FISCAL}' },
      ciudades: { pregunta: 'Ciudades', ayuda: 'Separadas por comas, o marca cobertura nacional.', ejemplo: 'Bogotá, Medellín' },
      nacional: { pregunta: 'Cobertura nacional', ayuda: 'Marca esto y no necesitas escribir ciudades.' },
      presupuesto: { pregunta: 'Presupuesto', ayuda: 'De esta tienda, no el total.', ejemplo: '5000000' },
      tiendaTurbo: { pregunta: '¿En cuál de sus tiendas?', ayuda: 'La normal, la de Turbo, o las dos.' },
    },
  }),
};

/**
 * Del placeholder al nombre de la pregunta que lo llena.
 * Es lo que dice el espacio en blanco del documento: "falta el porcentaje".
 */
var NOMBRE_DEL_HUECO = {
  /*
   * Datos que salen de la pestana Paises, no de una respuesta del comercial.
   * Sin nombre propio, el aviso de un hueco los deletreaba como "url tc
   * creditos", que no le dice nada a nadie.
   */
  ENTIDAD_LEGAL: 'la entidad legal del país',
  AUTORIDAD_DATOS: 'la autoridad de protección de datos del país',
  ENTIDAD_VIGILANCIA: 'la entidad de vigilancia del país',
  LEY_APLICABLE: 'la ley aplicable del país',
  JURISDICCION: 'la jurisdicción del país',
  EDAD_MINIMA: 'la edad mínima del país',
  POLITICA_PRIVACIDAD: 'el nombre de la política de privacidad del país',
  URL_PRIVACIDAD: 'el enlace de la política de privacidad',
  URL_TC_PLATAFORMA: 'el enlace de los términos de la plataforma',
  URL_TC_CREDITOS: 'el enlace de los términos de los Créditos',
  TEXTO_DERECHOS_DATOS: 'el texto de derechos de datos del país',
  TEXTO_HORA_LOCAL: 'el texto de la hora local del país',
  TEXTO_PERSONA: 'cómo nombra el país a la persona usuaria',

  TEXTO_TIENDA_TURBO: 'en cuál de sus tiendas se gana el cashback',
  TEXTO_EXCLUSION_SALUD: 'la exclusión de medicamentos y productos con nicotina',
  TIENDA_TURBO: 'en cuál de sus tiendas participa cada marca',
  TEXTO_ETA: 'el tiempo de entrega prometido',
  TEXTO_CIUDAD_ETA: 'la ciudad',
  TEXTO_TIENDAS_ETA: 'las tiendas del botón turbo que participan',
  TEXTO_MODALIDAD_CONDICIONES: 'la categoría del botón turbo',
  TEXTO_LIMITE_ORDENES: 'el máximo de órdenes por persona',
  MODALIDAD_TURBO: 'la modalidad del botón turbo',
  URL_TC_TURBO: 'el enlace de los términos del botón turbo',
  ID_FISCAL: 'la identificación de la empresa',
  DOMICILIO_LEGAL: 'el domicilio de la empresa',
  PAIS_LEGAL: 'el país',
  TEXTO_MINIMO_APERTURA: 'el mínimo de compra',
  TEXTO_BENEFICIO_APERTURA: 'qué recibe el usuario, con su porcentaje si es desconto',
  TEXTO_BENEFICIO_REGRA: 'la regla del beneficio',
  TEXTO_TOPE_BENEFICIO: 'el tope del beneficio',
  PARCEIRO: 'el parceiro',
  TEXTO_PRODUCTOS_TRAVEL: 'las categorías que participan',
  TEXTO_AMBITO_TRAVEL: 'si los viajes son nacionales o internacionales',
  TEXTO_DESTINOS_TRAVEL: 'los destinos',
  TEXTO_HOTELES_TRAVEL: 'qué hoteles participan',
  TEXTO_CONDICIONES_TRAVEL: 'las condiciones de la compra',
  TEXTO_SEGMENTO_TRAVEL: 'quiénes pueden participar',
  TEXTO_METODO_PAGO_TRAVEL: 'los medios de pago',
  TEXTO_PRECIO_ANUNCIADO: 'si la pieza anuncia un precio',
  TEXTO_BENEFICIO_POR_PRODUCTO: 'el beneficio de cada producto',
  TEXTO_BENEFICIO_TRAVEL: 'en qué consiste el cashback',
  TEXTO_BASE_CALCULO_TRAVEL: 'sobre qué valor se calcula el cashback',
  TEXTO_EJEMPLO_TOPE_TRAVEL: 'el ejemplo del tope',
  TEXTO_LIMITE_ORDENES_TRAVEL: 'cuántas órdenes puede beneficiar una persona',
  TEXTO_AGOTAMIENTO_VIGENCIA_TRAVEL: 'el presupuesto o las unidades que agotan la campaña',
  TEXTO_LIMITE_CAMPANA_TRAVEL: 'el límite total de la campaña',
  TEXTO_CONTEO_IDA_REGRESO_TRAVEL: 'cómo cuenta una compra de ida y regreso',
  TEXTO_CARGA_TRAVEL: 'cuándo llegan los Créditos',
  TEXTO_VERIFICACION_TRAVEL: 'cómo se verifica la elegibilidad de la orden',
  TEXTO_REDENCION_TRAVEL: 'dónde se pueden usar los Créditos',
  TEXTO_DESCUENTO_TRAVEL: 'en qué consiste el descuento',
  TEXTO_SEGUN_PRODUCTO_TRAVEL: 'si el descuento cambia según el producto',
  TEXTO_MAXIMO_DISPONIBLE_TRAVEL: 'a cuántos productos llega el descuento máximo',
  TEXTO_VISIBILIDAD_TRAVEL: 'dónde ve el usuario el descuento',
  TEXTO_ASISTENCIA_TRAVEL: 'el alcance del descuento de la asistencia',
  TEXTO_CREDITOS_FUERA_DE_TRAVEL: 'el uso de los Créditos fuera de los viajes',
  TEXTO_NOTAS_DE_MODIFICACION: 'las modificaciones de la campaña',
  TEXTO_RESPONSABILIDAD_TRAVEL: 'de qué responde la entidad de viajes',
  TEXTO_YA_OTORGADO_TRAVEL: 'lo que ya se otorgó',
  VERBO_BENEFICIO_TRAVEL: 'qué se hace con el beneficio',
  ENTIDAD_TRAVEL: 'la razón social de la entidad de viajes',
  ID_FISCAL_TRAVEL: 'el NIT de la entidad de viajes',
  RNT_TRAVEL: 'el número del registro nacional de turismo',
  URL_SITIO_TRAVEL: 'el sitio de viajes',
  URL_TC_TRAVEL: 'los términos de los sistemas de viajes',
  POLITICA_PRIVACIDAD_TRAVEL: 'la política de datos de la entidad de viajes',
  URL_PRIVACIDAD_TRAVEL: 'el enlace de la política de datos de la entidad de viajes',
  ENTIDAD_VIGILANCIA_TRAVEL: 'la entidad de vigilancia de los viajes',
  TOPE_TRAVEL: 'el tope por orden',
  NOMBRE_CAMPANA: 'el nombre, que sale de la tienda o la marca, el porcentaje y el día de inicio',
  NOMBRE_CAMPANA_MAYUS: 'el nombre, que sale de la tienda o la marca, el porcentaje y el día de inicio',
  TIENDA: 'la tienda',
  TEXTO_TERRITORIO: 'dónde aplica',
  FECHA_INICIO: 'el día de inicio',
  HORA_INICIO: 'la hora de inicio',
  FECHA_FIN: 'el día de fin',
  HORA_FIN: 'la hora de fin',
  ORGANIZADOR: 'la empresa que paga',
  ID_ORGANIZADOR: 'la identificación tributaria de esa empresa',
  TEXTO_SEGMENTO: 'quiénes participan',
  TEXTO_METODO_PAGO: 'con qué puede pagar',
  TEXTO_MINIMO_COMPRA: 'la compra mínima',
  TEXTO_LIMITE_PEDIDOS: 'cuántas veces puede ganar',
  TEXTO_CONDICIONES: 'las condiciones especiales',
  PORCENTAJE: 'el porcentaje',
  TOPE: 'el tope por pedido',
  PRESUPUESTO: 'el presupuesto',
  TEXTO_CARGA: 'cuándo llegan los Créditos',
  TEXTO_VERIFICACION: 'cómo se verifica la elegibilidad del pedido',
  TEXTO_VIGENCIA_CREDITOS: 'hasta cuándo sirven',
  TEXTO_LUGAR_REDENCION: 'dónde se gastan',
  TEXTO_PRODUCTOS: 'qué productos participan',
  CRITERIO_GANADOR: 'cómo se define el ganador',
  FRASE_GANADORES: 'cuántas personas ganan',
  TEXTO_DESEMPATE: 'quién gana si hay empate',
  LISTA_PREMIOS: 'el premio',
  TEXTO_NATURALEZA_PREMIO: 'el tipo de premio',
  TEXTO_ENTREGA: 'quién entrega el premio',
  TEXTO_DATOS_ENTREGA: 'los datos para la entrega',
  MEDIO_NOTIFICACION: 'cómo le avisas al ganador',
  FECHA_NOTIFICACION: 'el día del aviso',
  PLAZO_CONFIRMACION: 'el plazo para responder',
  TEXTO_UMBRAL: 'la compra mínima',
  TIENDA_MARCA: 'la marca de la tienda',
  TIENDA_RAZON_SOCIAL: 'la razón social',
  TIENDA_ID: 'la identificación de la tienda',
  TIENDA_CIUDADES: 'las ciudades',
  TIENDA_PRESUPUESTO: 'el presupuesto',
  TEXTO_PARENTESCO: 'el grado de parentesco que no puede participar',
  TEXTO_PRODUCTOS_DESCUENTO: 'sobre qué productos aplica',
  TEXTO_BENEFICIO_DESCUENTO: 'en qué consiste el beneficio',
  TEXTO_BASE_DESCUENTO: 'sobre qué valor se calcula el beneficio',
  TEXTO_TOPE_DESCUENTO: 'el tope por pedido',
  TEXTO_AGOTAMIENTO: 'qué agota la campaña antes de la fecha',
  TEXTO_LIMITE_CAMPANA: 'el límite total de la campaña',
  TEXTO_ACTIVACION_CUPON: 'cómo se activa el cupón',
  TEXTO_MIENTRAS_QUEDE: 'qué otra cosa acaba la campaña además de la fecha',
  CODIGO_CUPON: 'el código del cupón',
};

/**
 * Los datos de la fila del pais que se escriben dentro de una pregunta.
 *
 * Existe porque la pregunta del identificador del Organizador decia "NIT" en
 * los nueve paises, con un ejemplo colombiano. El nombre, el ejemplo y donde se
 * busca ese numero ya viven en la pestana Paises, que es de Legal: la pregunta
 * los pide por su marcador y los rellena conDatosDelPais().
 */
var DATOS_DEL_PAIS_EN_LA_PREGUNTA = {
  '{ID_FISCAL}': 'tipo_id_organizador',
  '{EJEMPLO_ID_FISCAL}': 'ejemplo_id_fiscal',
  '{DONDE_ID_FISCAL}': 'donde_id_fiscal',
  '{MONEDA}': 'moneda_nombre',
};

/** Los textos de una pregunta donde puede haber un marcador de pais. */
var TEXTOS_CON_MARCADOR = ['pregunta', 'ayuda', 'porQue', 'ejemplo', 'confirmacion', 'aviso'];

function conDatosDelPaisEnElTexto(texto, pais) {
  var salida = String(texto);
  for (var marcador in DATOS_DEL_PAIS_EN_LA_PREGUNTA) {
    if (!Object.prototype.hasOwnProperty.call(DATOS_DEL_PAIS_EN_LA_PREGUNTA, marcador)) continue;
    if (salida.indexOf(marcador) === -1) continue;
    var valor = pais[DATOS_DEL_PAIS_EN_LA_PREGUNTA[marcador]];
    // Un pais al que todavia no le han escrito el dato deja el marcador crudo
    // en pantalla, que es feo pero visible. Borrarlo dejaria la frase sin
    // sujeto y nadie se enteraria de que falta un dato en la pestana Paises.
    if (valor === null || valor === undefined || !String(valor).trim()) continue;
    salida = salida.split(marcador).join(String(valor).trim());
  }
  return salida;
}

function copiaDePregunta(pregunta) {
  var copia = {};
  for (var llave in pregunta) {
    if (Object.prototype.hasOwnProperty.call(pregunta, llave)) copia[llave] = pregunta[llave];
  }
  return copia;
}

/**
 * La pregunta con los datos del pais ya puestos.
 *
 * No toca el objeto original: PREGUNTAS es compartido y una campana de Mexico
 * dejaria "RFC" escrito para la siguiente de Colombia. Tambien entra en las
 * subpreguntas de las listas repetibles (las tiendas del Multitienda y los
 * productos), que son las otras que nombran el identificador.
 */
function conDatosDelPais(pregunta, pais) {
  if (!pregunta || !pais) return pregunta;

  var mezclada = copiaDePregunta(pregunta);

  for (var t = 0; t < TEXTOS_CON_MARCADOR.length; t++) {
    var llave = TEXTOS_CON_MARCADOR[t];
    if (typeof mezclada[llave] === 'string') mezclada[llave] = conDatosDelPaisEnElTexto(mezclada[llave], pais);
  }

  if (mezclada.errores) {
    var errores = {};
    for (var e in mezclada.errores) {
      if (!Object.prototype.hasOwnProperty.call(mezclada.errores, e)) continue;
      errores[e] = conDatosDelPaisEnElTexto(mezclada.errores[e], pais);
    }
    mezclada.errores = errores;
  }

  var subListas = ['camposPorTienda', 'camposPorProducto'];
  for (var l = 0; l < subListas.length; l++) {
    var nombre = subListas[l];
    if (!mezclada[nombre]) continue;
    var sub = {};
    for (var campo in mezclada[nombre]) {
      if (!Object.prototype.hasOwnProperty.call(mezclada[nombre], campo)) continue;
      sub[campo] = conDatosDelPais(mezclada[nombre][campo], pais);
    }
    mezclada[nombre] = sub;
  }

  return mezclada;
}

/**
 * Tipos que leen las variantes de otro.
 *
 * El Cupom de Brasil es la Promocao con un codigo: comparte sus trece variantes
 * de texto, que ya estan escritas y revisadas. Copiarlas era garantizar que el
 * dia que alguien corrija una de las dos, la otra se quede vieja.
 */
var VARIANTES_HEREDADAS = {
  cupom_br: 'promocao_br',
};

/**
 * La pregunta de un campo, para el tipo de campana que se esta llenando.
 *
 * Unos pocos campos cambian de texto segun el tipo: en delivery se habla de
 * "pedido" y en Rappi Travel de "orden", y el segmento y la redencion tienen
 * opciones distintas. Eso vive en `variantes`, para no duplicar el campo ni
 * partir en dos el historico del Sheet.
 */
function preguntaDe(campo, tipo) {
  if (!Object.prototype.hasOwnProperty.call(PREGUNTAS, campo)) return null;
  var pregunta = PREGUNTAS[campo];

  var variante = null;
  if (pregunta.variantes && tipo) {
    variante = pregunta.variantes[tipo] || pregunta.variantes[VARIANTES_HEREDADAS[tipo]] || null;
  }
  if (!variante) return pregunta;

  var mezclada = {};
  for (var llave in pregunta) {
    if (Object.prototype.hasOwnProperty.call(pregunta, llave) && llave !== 'variantes') mezclada[llave] = pregunta[llave];
  }
  for (var cambio in variante) {
    if (Object.prototype.hasOwnProperty.call(variante, cambio)) mezclada[cambio] = variante[cambio];
  }
  return mezclada;
}

function nombreDelHueco(placeholder) {
  return Object.prototype.hasOwnProperty.call(NOMBRE_DEL_HUECO, placeholder)
    ? NOMBRE_DEL_HUECO[placeholder]
    : placeholder.toLowerCase().replace(/_/g, ' ');
}

function pasoDe(id) {
  for (var i = 0; i < PASOS.length; i++) {
    if (PASOS[i].id === id) return PASOS[i];
  }
  return null;
}

if (typeof module !== 'undefined') {
  module.exports = {
    PASOS: PASOS,
    PREGUNTAS: PREGUNTAS,
    GLOSARIO: GLOSARIO,
    NOMBRE_DEL_HUECO: NOMBRE_DEL_HUECO,
    CIUDADES_SUGERIDAS: CIUDADES_SUGERIDAS,
    preguntaDe: preguntaDe,
    conDatosDelPais: conDatosDelPais,
    DATOS_DEL_PAIS_EN_LA_PREGUNTA: DATOS_DEL_PAIS_EN_LA_PREGUNTA,
    VARIANTES_HEREDADAS: VARIANTES_HEREDADAS,
    nombreDelHueco: nombreDelHueco,
    pasoDe: pasoDe,
  };
}
