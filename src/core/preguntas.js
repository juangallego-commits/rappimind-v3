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

  tienda: p({
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
    ayuda: 'Nacional es todo el país. Si es solo en algunas ciudades, las escribes en el siguiente paso.',
    porQue: 'La cobertura define dónde puede reclamar el usuario. Si el documento dice más de lo que la campaña cubre, el usuario tiene derecho a exigirlo.',
    avanzaSola: true,
    porDefecto: 'Nacional',
    opciones: [
      { valor: 'Nacional', etiqueta: 'En todo el país', nota: 'Donde sea que Rappi tenga cobertura.' },
      { valor: 'Ciudades', etiqueta: 'Solo en algunas ciudades', nota: 'Las escribes tú en el siguiente paso.' },
    ],
    placeholders: ['TEXTO_TERRITORIO'],
    errores: { vacio: 'Elige si la campaña es nacional o por ciudades.' },
  }),

  ciudades: p({
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
    ayuda: 'Es el Organizador: la tienda o la marca que pone la plata. Nunca es Rappi. Escribe la razón social como aparece en su RUT.',
    porQue: 'El Organizador responde por la campaña frente al usuario y frente a la autoridad. Rappi solo pone la plataforma, así que el nombre tiene que ser exacto.',
    ejemplo: 'Alimentos del Norte S.A.S.',
    placeholders: ['ORGANIZADOR'],
    errores: {
      vacio: 'Escribe la razón social de la empresa que paga el beneficio. Si no la tienes, pídesela a tu contacto en la tienda.',
    },
  }),

  organizadorId: p({
    paso: 'organizador',
    pregunta: '¿Cuál es el NIT de esa empresa?',
    ayuda: 'Con el dígito de verificación, por ejemplo 900.111.222-1. Está en el RUT del aliado; pídeselo a tu contacto.',
    porQue: 'El documento identifica al Organizador con su número tributario. Un número mal escrito deja el documento sin un responsable identificable.',
    ejemplo: '900.111.222-1',
    placeholders: ['ID_ORGANIZADOR'],
    errores: {
      vacio: 'Escribe el NIT de la empresa organizadora, con el dígito de verificación.',
      formato: 'Ese número no cuadra. Revisa el dígito de verificación, que es el que va después del guion.',
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
    errores: { vacio: 'Elige la hora de fin.' },
  }),

  // --- El beneficio -------------------------------------------------------

  porcentaje: p({
    paso: 'beneficio',
    pregunta: '¿Qué porcentaje del pedido devuelves en Créditos?',
    ayuda: 'Solo el número. Con 20, un pedido de $50.000 recibe $10.000 en Créditos.',
    porQue: 'Es la promesa central de la campaña. Una vez publicado, el usuario puede exigir exactamente ese porcentaje.',
    ejemplo: '99',
    placeholders: ['PORCENTAJE'],
    errores: {
      vacio: 'Escribe el porcentaje que devuelves, sin el signo de porcentaje.',
      rango: 'El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.',
    },
  }),

  tope: p({
    paso: 'beneficio',
    pregunta: '¿Qué es lo máximo que recibe alguien por pedido?',
    ayuda: 'Aunque el pedido sea grande, no recibe más de esto. Lo más usado es 25.000.',
    porQue: 'Sin tope, un pedido enorme se lleva el presupuesto entero. El tope es lo que hace que un cashback del 99% sea viable.',
    ejemplo: '25000',
    moneda: true,
    placeholders: ['TOPE'],
    errores: {
      vacio: 'Escribe el máximo de Créditos que recibe una persona por pedido.',
      cero: 'El tope tiene que ser mayor que cero.',
      mayorQuePresupuesto: 'El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.',
    },
  }),

  presupuesto: p({
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
    paso: 'beneficio',
    pregunta: '¿Cuántas veces puede ganar la misma persona?',
    ayuda: 'La mitad de las campañas permite una sola vez por usuario.',
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
    ayuda: 'Es opcional: si no exiges un mínimo, deja el campo vacío y sigue.',
    porQue: 'Si lo exiges, tiene que quedar escrito. Si no aparece en el documento, no lo puedes aplicar después.',
    ejemplo: '100000',
    moneda: true,
    opcional: true,
    placeholders: ['TEXTO_MINIMO_COMPRA', 'TEXTO_UMBRAL'],
    errores: { cero: 'Si no quieres exigir un mínimo, deja el campo vacío.' },
  }),

  condiciones: p({
    paso: 'beneficio',
    pregunta: '¿El beneficio aplica solo en cierto tipo de pedido?',
    ayuda: 'Es opcional: si el beneficio aplica en cualquier pedido, no marques nada.',
    porQue: 'Esta pregunta es sobre el pedido con el que el usuario se gana el beneficio, no sobre dónde gasta después los Créditos: eso se pregunta más adelante. Si la restricción no queda escrita, el usuario puede reclamar el beneficio en cualquier pedido.',
    opcional: true,
    multiple: true,
    opciones: [
      { valor: 'turbo', etiqueta: 'Solo si el pedido se hace por Turbo', nota: 'Un pedido por el resto de la app no da el beneficio.' },
      { valor: 'consumo_local', etiqueta: 'Solo si consume en el local', nota: 'La modalidad de consumo en el local de la app. Un domicilio no da el beneficio.' },
    ],
    placeholders: ['TEXTO_CONDICIONES'],
    errores: {},
  }),

  // --- Los Créditos -------------------------------------------------------

  carga: p({
    paso: 'creditos',
    pregunta: '¿Cuándo le llegan los Créditos?',
    ayuda: 'Es el momento en que el saldo le queda disponible en la Billetera.',
    porQue: 'El documento fija en qué momento el usuario recibe los Créditos, y eso es lo que el usuario va a esperar. Elige lo que el equipo de operaciones puede cumplir.',
    avanzaSola: true,
    porDefecto: 'dia_siguiente',
    opciones: [
      { valor: 'dia_siguiente', etiqueta: 'Al día siguiente del pedido', nota: 'Lo más usado.' },
      { valor: 'inmediata', etiqueta: 'Apenas termina el pedido', nota: 'Inmediato, sin verificación previa.' },
      { valor: 'fecha', etiqueta: 'En una fecha específica', nota: 'Todos reciben el mismo día.' },
    ],
    placeholders: ['TEXTO_CARGA'],
    errores: { vacio: 'Dinos cuándo le llegan los Créditos al usuario.' },
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
    ayuda: 'Casi todos ponen una fecha límite concreta.',
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
    ayuda: 'Siete de cada diez campañas los limitan a la misma tienda.',
    porQue: 'Define dónde vale el saldo. Lo normal es que se gaste en la misma tienda donde el usuario se ganó el beneficio. En todo caso, estos Créditos casi nunca aplican a RappiFavor, Cajero ATM ni RappiTravel.',
    avanzaSola: true,
    porDefecto: 'tienda',
    opciones: [
      { valor: 'tienda', etiqueta: 'Solo en esta tienda', nota: 'Vuelve a comprar donde ganó el beneficio.' },
      { valor: 'secciones', etiqueta: 'En ciertas secciones de Rappi', nota: 'Tú eliges cuáles.' },
      { valor: 'general', etiqueta: 'En cualquier parte de Rappi', nota: 'Donde sea que se acepten Créditos.' },
    ],
    placeholders: ['TEXTO_LUGAR_REDENCION'],
    errores: { vacio: 'Dinos dónde puede gastar los Créditos.' },
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

  // --- Quién participa ----------------------------------------------------

  segmento: p({
    paso: 'participantes',
    pregunta: '¿Quiénes pueden participar?',
    ayuda: 'La mitad de las campañas es para todos y casi la otra mitad para Pro.',
    porQue: 'Limita quién puede reclamar el beneficio. Si el documento dice "todos", no puedes excluir a nadie después.',
    avanzaSola: true,
    porDefecto: 'todos',
    opciones: [
      { valor: 'todos', etiqueta: 'Todos los usuarios', nota: 'Cualquier persona mayor de edad.' },
      { valor: 'pro', etiqueta: 'Solo Pro y Pro Black', nota: 'Con la suscripción activa.' },
      { valor: 'nuevos', etiqueta: 'Solo usuarios nuevos', nota: 'Su primer pedido en Rappi.' },
      { valor: 'reactivados', etiqueta: 'Usuarios que no compran hace rato', nota: 'Tú dices desde cuándo.' },
    ],
    placeholders: ['TEXTO_SEGMENTO'],
    errores: { vacio: 'Dinos quiénes pueden participar.' },
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
    pregunta: '¿Con qué puede pagar?',
    ayuda: 'Con "todos" entran tarjetas, billeteras y efectivo donde exista.',
    porQue: 'Restringir el medio de pago cambia quién puede participar. Los pedidos pagados con Créditos nunca dan beneficio.',
    avanzaSola: true,
    porDefecto: 'todos',
    opciones: [
      { valor: 'todos', etiqueta: 'Con cualquier medio de pago', nota: 'Lo más común.' },
      { valor: 'sin_efectivo', etiqueta: 'Con todo menos efectivo', nota: 'Tarjetas y billeteras sí, efectivo no.' },
      { valor: 'rappicard', etiqueta: 'Solo con RappiCard', nota: 'Únicamente la tarjeta de Rappi.' },
    ],
    placeholders: ['TEXTO_METODO_PAGO'],
    errores: { vacio: 'Dinos con qué puede pagar el usuario.' },
  }),

  declaracion: p({
    paso: 'confirmacion',
    pregunta: 'Confirma que la información es correcta',
    ayuda: 'Confirmo que la información es veraz y corresponde a la campaña aprobada.',
    porQue: 'El documento se genera con lo que escribiste y se publica tal cual. Nadie de Legal lo revisa antes.',
    placeholders: [],
    errores: { vacio: 'Marca la casilla para confirmar que la información es correcta.' },
  }),

  // --- El concurso (Carrera de Compras) -----------------------------------

  productos: p({
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
    paso: 'concurso',
    pregunta: '¿De qué marca?',
    ayuda: 'El nombre comercial de la marca. Por ejemplo: Galletas Lunaria.',
    porQue: 'El documento nombra la marca, así que el usuario sabe exactamente qué comprar para participar.',
    ejemplo: 'Galletas Lunaria',
    placeholders: ['TEXTO_PRODUCTOS'],
    errores: { vacio: 'Escribe el nombre de la marca.' },
  }),

  productosLista: p({
    paso: 'concurso',
    pregunta: '¿Cuáles productos?',
    ayuda: 'Sepáralos con comas, como aparecen en la app.',
    porQue: 'La lista sale escrita tal cual en el documento. Si falta uno, las compras de ese producto no cuentan.',
    ejemplo: 'Galletas Lunaria clásicas, Galletas Lunaria de chocolate',
    placeholders: ['TEXTO_PRODUCTOS'],
    errores: { vacio: 'Escribe los productos que participan, separados por comas.' },
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
      { valor: 'primero', etiqueta: 'Quien llegó primero', nota: 'Por la fecha y hora de su último pedido.' },
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
    ayuda: 'Mínimo dos. Cada una entra con su razón social, su NIT y su presupuesto.',
    porQue: 'En un Cashback Day cada tienda organiza su propio beneficio y responde por él. Por eso cada una necesita sus propios datos.',
    placeholders: ['TIENDA_MARCA', 'TIENDA_RAZON_SOCIAL', 'TIENDA_ID', 'TIENDA_CIUDADES', 'TIENDA_PRESUPUESTO'],
    errores: {
      minimo: 'Agrega al menos 2 tiendas participantes.',
      maximo: 'No puedes agregar más de 60 tiendas.',
      repetida: 'Esa identificación ya está en otra tienda de la lista.',
    },
    camposPorTienda: {
      marca: { pregunta: 'Marca', ayuda: 'Como aparece en la app.', ejemplo: 'Beer Station' },
      razonSocial: { pregunta: 'Razón social', ayuda: 'Como aparece en el RUT.', ejemplo: 'Cervecerías del Sur S.A.S.' },
      id: { pregunta: 'NIT', ayuda: 'Con dígito de verificación.', ejemplo: '900.777.888-2' },
      ciudades: { pregunta: 'Ciudades', ayuda: 'Separadas por comas, o marca cobertura nacional.', ejemplo: 'Bogotá, Medellín' },
      nacional: { pregunta: 'Cobertura nacional', ayuda: 'Marca esto y no necesitas escribir ciudades.' },
      presupuesto: { pregunta: 'Presupuesto', ayuda: 'De esta tienda, no el total.', ejemplo: '5000000' },
    },
  }),
};

/**
 * Del placeholder al nombre de la pregunta que lo llena.
 * Es lo que dice el espacio en blanco del documento: "falta el porcentaje".
 */
var NOMBRE_DEL_HUECO = {
  NOMBRE_CAMPANA: 'el nombre, que sale de la tienda, el porcentaje y el día de inicio',
  NOMBRE_CAMPANA_MAYUS: 'el nombre, que sale de la tienda, el porcentaje y el día de inicio',
  TIENDA: 'la tienda',
  TEXTO_TERRITORIO: 'dónde aplica',
  FECHA_INICIO: 'el día de inicio',
  HORA_INICIO: 'la hora de inicio',
  FECHA_FIN: 'el día de fin',
  HORA_FIN: 'la hora de fin',
  ORGANIZADOR: 'la empresa que paga',
  ID_ORGANIZADOR: 'el NIT de esa empresa',
  TEXTO_SEGMENTO: 'quiénes participan',
  TEXTO_METODO_PAGO: 'con qué puede pagar',
  TEXTO_MINIMO_COMPRA: 'la compra mínima',
  TEXTO_LIMITE_PEDIDOS: 'cuántas veces puede ganar',
  TEXTO_CONDICIONES: 'las condiciones especiales',
  PORCENTAJE: 'el porcentaje',
  TOPE: 'el tope por pedido',
  PRESUPUESTO: 'el presupuesto',
  TEXTO_CARGA: 'cuándo llegan los Créditos',
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
  TIENDA_ID: 'el NIT',
  TIENDA_CIUDADES: 'las ciudades',
  TIENDA_PRESUPUESTO: 'el presupuesto',
};

function preguntaDe(campo) {
  return Object.prototype.hasOwnProperty.call(PREGUNTAS, campo) ? PREGUNTAS[campo] : null;
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
    nombreDelHueco: nombreDelHueco,
    pasoDe: pasoDe,
  };
}
