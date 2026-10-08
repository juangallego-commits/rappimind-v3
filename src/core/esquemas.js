'use strict';

/**
 * Esquemas de los tipos de campana: pasos, campos, visibilidad y obligatoriedad.
 *
 * La interfaz se arma leyendo esto, no al reves: agregar un tipo nuevo no
 * deberia obligar a tocar el formulario (seccion 5 de la especificacion).
 *
 * "obligatorio" y "visible" pueden ser true/false o una funcion de la entrada.
 */

/*
 * En Apps Script CATEGORIAS_TRAVEL es global: lo genera el build desde
 * data/categorias_travel.json. En Node se carga aqui, porque la visibilidad de
 * los campos de Travel depende de los grupos de categorias.
 */
if (typeof module !== 'undefined' && typeof require === 'function' && typeof CATEGORIAS_TRAVEL === 'undefined') {
  var CATEGORIAS_TRAVEL = require('../../data/categorias_travel.json');
}

/*
 * La pregunta de la categoria del producto sale del catalogo de leyendas: las
 * opciones que ofrece cada pais son las leyendas de categoria que existen para
 * ese pais. En Apps Script y en el navegador estas funciones ya son globales.
 */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloLeyendasEsquemas = require('./leyendas.js');
  var categoriasDeProducto = moduloLeyendasEsquemas.categoriasDeProducto;
  var hayLeyendasDeCampana = moduloLeyendasEsquemas.hayLeyendasDeCampana;
}

function siempre() {
  return true;
}

/** Campos comunes a los tres tipos (seccion 5.1). */
var CAMPOS_COMUNES = [
  { id: 'pais', etiqueta: 'País', tipo: 'lista', paso: 'campana', obligatorio: true },
  {
    id: 'negocio',
    etiqueta: 'Negocio',
    tipo: 'lista',
    paso: 'campana',
    obligatorio: true,
    opciones: [
      { valor: 'rappi', etiqueta: 'Rappi' },
      { valor: 'travel', etiqueta: 'Rappi Travel' },
    ],
  },
  { id: 'tipo', etiqueta: 'Tipo de campaña', tipo: 'tarjetas', paso: 'campana', obligatorio: true },
  { id: 'fechaInicio', etiqueta: 'Fecha de inicio', tipo: 'fecha', paso: 'vigencia', obligatorio: true },
  { id: 'horaInicio', etiqueta: 'Hora de inicio', tipo: 'hora', porDefecto: '00:00', paso: 'vigencia', obligatorio: true },
  { id: 'fechaFin', etiqueta: 'Fecha de fin', tipo: 'fecha', paso: 'vigencia', obligatorio: true },
  { id: 'horaFin', etiqueta: 'Hora de fin', tipo: 'hora', porDefecto: '23:59', paso: 'vigencia', obligatorio: true },
  {
    id: 'segmento',
    etiqueta: '¿Quiénes pueden participar?',
    tipo: 'lista',
    paso: 'participantes',
    obligatorio: true,
    opciones: [
      { valor: 'todos', etiqueta: 'Todos' },
      { valor: 'pro', etiqueta: 'Pro y Pro Black' },
      { valor: 'nuevos', etiqueta: 'Nuevos usuarios' },
      { valor: 'reactivados', etiqueta: 'Usuarios reactivados' },
    ],
  },
  {
    id: 'diasSinCompra',
    etiqueta: 'Días sin comprar',
    tipo: 'numero',
    minimo: 1,
    maximo: 365,
    paso: 'participantes',
    visible: function (entrada) { return entrada.segmento === 'reactivados'; },
    obligatorio: function (entrada) { return entrada.segmento === 'reactivados'; },
  },
  {
    id: 'metodoPago',
    etiqueta: 'Medios de pago',
    tipo: 'lista',
    paso: 'participantes',
    obligatorio: true,
    opciones: [
      { valor: 'todos', etiqueta: 'Todos' },
      { valor: 'sin_efectivo', etiqueta: 'Todos excepto efectivo' },
      { valor: 'rappicard', etiqueta: 'Solo RappiCard' },
    ],
  },
  // minimo 1 y no 0: el campo es opcional, asi que "sin minimo" se dice
  // dejandolo en blanco. Con un 0 escrito, el documento salia diciendo que el
  // pedido "debera ser igual o superior a cero pesos M/Cte. ($0)", que no
  // condiciona nada y se publica igual. El mensaje ya estaba escrito en
  // preguntas.js (errores.cero) y no lo disparaba nadie.
  { id: 'compraMinima', etiqueta: 'Compra mínima', tipo: 'numero', minimo: 1, paso: 'participantes', obligatorio: false },
  // La pieza publicitaria. No cambia una coma del T&C: decide la leyenda que va
  // dentro del arte, que hasta ahora el comercial le pedia a Legal por correo.
  // Por eso va en su propio paso, al final.
  //
  // Eran tres preguntas. El registro sanitario y la notificacion ante el INVIMA
  // se fueron el 20 de septiembre de 2026 con las cuatro categorias que los
  // pedian: en Colombia ya no se hacen campanas sobre medicamentos ni
  // fitoterapeuticos.
  {
    id: 'categoriaProducto',
    etiqueta: 'Categoría del producto',
    tipo: 'lista',
    paso: 'pieza',
    porDefecto: 'ninguna',
    // No bloquea el documento por estar sin responder: el T&C no la usa para
    // nada, y un comercial que solo quiere su T&C no se puede quedar sin el por
    // una pregunta del arte. Lo que si bloquea es elegir la categoria que no se
    // puede hacer, y eso lo dice validaciones.js.
    obligatorio: false,
    // Solo donde hay algo que imprimir. Un pais sin leyenda de campana no tiene
    // donde pegar el complemento, y uno sin categorias no tiene que ofrecer.
    visible: function (entrada) {
      return hayLeyendasDeCampana(entrada.pais, entrada.tipo) &&
        categoriasDeProducto(entrada.pais).length > 0;
    },
  },
  {
    id: 'declaracion',
    etiqueta: 'Confirmo que estos datos son ciertos y son los de mi campaña',
    tipo: 'casilla',
    paso: 'confirmacion',
    obligatorio: true,
  },
];

/** Campos de tienda y organizador: los usan Cashback y Carrera, no Cashback Day. */
var CAMPOS_TIENDA_Y_ORGANIZADOR = [
  { id: 'tienda', etiqueta: 'Tienda (marca comercial)', tipo: 'texto', paso: 'campana', obligatorio: true },
  {
    id: 'alcance',
    etiqueta: 'Alcance',
    tipo: 'lista',
    paso: 'campana',
    obligatorio: true,
    opciones: [
      { valor: 'Nacional', etiqueta: 'Nacional' },
      { valor: 'Ciudades', etiqueta: 'Ciudades' },
    ],
  },
  {
    id: 'ciudades',
    etiqueta: 'Ciudades (separadas por comas)',
    tipo: 'texto',
    paso: 'campana',
    visible: function (entrada) { return entrada.alcance === 'Ciudades'; },
    obligatorio: function (entrada) { return entrada.alcance === 'Ciudades'; },
  },
  { id: 'organizadorRazonSocial', etiqueta: 'Razón social del organizador', tipo: 'texto', paso: 'organizador', obligatorio: true },
  { id: 'organizadorId', etiqueta: 'Identificación del organizador', tipo: 'identificacion', paso: 'organizador', obligatorio: true },
];

/** Campos de Creditos: carga, vigencia y redencion. Cashback y Cashback Day. */
var CAMPOS_CREDITOS = [
  { id: 'porcentaje', etiqueta: 'Porcentaje de cashback', tipo: 'numero', minimo: 1, maximo: 100, paso: 'beneficio', obligatorio: true },
  { id: 'tope', etiqueta: 'Tope por pedido', tipo: 'numero', paso: 'beneficio', obligatorio: true },
  {
    id: 'maxPedidos',
    etiqueta: 'Máximo de pedidos con beneficio',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: function (entrada) { return !entrada.sinLimite; },
    obligatorio: function (entrada) { return !entrada.sinLimite; },
  },
  { id: 'sinLimite', etiqueta: 'Sin límite de pedidos', tipo: 'casilla', paso: 'beneficio', obligatorio: false },
  {
    id: 'carga',
    etiqueta: '¿Cuándo se cargan los Créditos?',
    tipo: 'lista',
    paso: 'creditos',
    obligatorio: true,
    opciones: [
      { valor: 'inmediata', etiqueta: 'Inmediata' },
      { valor: 'dia_siguiente', etiqueta: 'Al día siguiente' },
      { valor: 'fecha', etiqueta: 'En una fecha' },
    ],
  },
  {
    id: 'fechaCarga',
    etiqueta: 'Fecha de carga',
    tipo: 'fecha',
    paso: 'creditos',
    visible: function (entrada) { return entrada.carga === 'fecha'; },
    obligatorio: function (entrada) { return entrada.carga === 'fecha'; },
  },
  {
    id: 'vigencia',
    etiqueta: 'Vigencia de los Créditos',
    tipo: 'lista',
    paso: 'creditos',
    obligatorio: true,
    opciones: [
      { valor: 'dias', etiqueta: 'Por días' },
      { valor: 'fecha', etiqueta: 'Hasta una fecha' },
    ],
  },
  {
    id: 'diasVigencia',
    etiqueta: 'Días de vigencia',
    tipo: 'numero',
    minimo: 1,
    maximo: 365,
    paso: 'creditos',
    visible: function (entrada) { return entrada.vigencia === 'dias'; },
    obligatorio: function (entrada) { return entrada.vigencia === 'dias'; },
  },
  {
    id: 'fechaFinRedencion',
    etiqueta: 'Fecha límite de redención',
    tipo: 'fecha',
    paso: 'creditos',
    visible: function (entrada) { return entrada.vigencia === 'fecha'; },
    obligatorio: function (entrada) { return entrada.vigencia === 'fecha'; },
  },
  {
    id: 'redencion',
    etiqueta: '¿Dónde se redimen los Créditos?',
    tipo: 'lista',
    paso: 'creditos',
    obligatorio: true,
    opciones: [
      { valor: 'tienda', etiqueta: 'Solo en la tienda' },
      { valor: 'secciones', etiqueta: 'En secciones específicas' },
      { valor: 'general', etiqueta: 'En cualquier sección' },
    ],
  },
  {
    id: 'secciones',
    etiqueta: 'Secciones',
    tipo: 'casillas',
    paso: 'creditos',
    visible: function (entrada) { return entrada.redencion === 'secciones'; },
    obligatorio: function (entrada) { return entrada.redencion === 'secciones'; },
  },
  {
    // Las secciones donde los Creditos no aplican. Solo con "en cualquier
    // seccion": con "solo en esta tienda" o "en ciertas secciones" la oracion
    // ya dice donde valen, y excluir ahi seria decir dos cosas a la vez.
    id: 'exclusionesRedencion',
    etiqueta: 'Secciones excluidas',
    tipo: 'casillas',
    paso: 'creditos',
    obligatorio: false,
    visible: function (entrada) { return entrada.redencion === 'general'; },
  },
];

/*
 * En cual de las tiendas de la marca se gana el cashback.
 *
 * Reemplaza a "En que pedidos aplica", que se borro el 20 de septiembre de 2026
 * con la pregunta nueva de Juan. Aquella ofrecia "Solo consumo en el local",
 * una modalidad que en Rappi no existe (punto C3), y no resolvia el caso real:
 * muchas marcas tienen dos tiendas en la app, la normal y la de Turbo, y sin
 * esta respuesta el documento no decia en cual contaba el pedido.
 *
 * Es obligatoria: de ella sale una frase del articulado, y sin respuesta el
 * usuario puede reclamar el cashback en cualquiera de las dos.
 */
var OPCIONES_TIENDA_TURBO = [
  { valor: 'normal', etiqueta: 'Solo en la tienda normal' },
  { valor: 'turbo', etiqueta: 'Solo en la tienda de Turbo' },
  { valor: 'ambas', etiqueta: 'En las dos' },
  { valor: 'sin_turbo', etiqueta: 'No tiene tienda en Turbo' },
];

var CAMPO_TIENDA_TURBO = {
  id: 'tiendaTurbo',
  etiqueta: 'En cuál de sus tiendas',
  tipo: 'lista',
  paso: 'campana',
  obligatorio: true,
  opciones: OPCIONES_TIENDA_TURBO,
};

var CAMPOS_CARRERA = [
  {
    id: 'productos',
    etiqueta: 'Productos que participan',
    tipo: 'lista',
    paso: 'concurso',
    obligatorio: true,
    opciones: [
      { valor: 'todos', etiqueta: 'Todos los de la tienda' },
      { valor: 'marca', etiqueta: 'Los de una marca' },
      { valor: 'especificos', etiqueta: 'Productos específicos' },
    ],
  },
  {
    id: 'makerMarca',
    etiqueta: 'Marca',
    tipo: 'texto',
    paso: 'concurso',
    visible: function (entrada) { return entrada.productos === 'marca'; },
    obligatorio: function (entrada) { return entrada.productos === 'marca'; },
  },
  {
    /*
     * Los productos, con nombre y codigo de barras.
     *
     * Era un campo de texto libre ("Productos separados por comas") y es uno de
     * los pocos que quedaban. Dos productos que se llaman parecido dejaban el
     * documento sin decir cual suma al concurso; el EAN lo decide sin
     * discusion. Decision 36 (iii) del encargo 01, que Juan cerro el 20 de
     * septiembre de 2026 (punto D4).
     */
    id: 'productosDetalle',
    etiqueta: 'Productos participantes',
    tipo: 'repetible',
    minimo: 1,
    maximo: 60,
    paso: 'concurso',
    visible: function (entrada) { return entrada.productos === 'especificos'; },
    obligatorio: function (entrada) { return entrada.productos === 'especificos'; },
  },
  {
    id: 'criterioGanador',
    etiqueta: '¿Cómo se define el ganador?',
    tipo: 'lista',
    paso: 'concurso',
    obligatorio: true,
    opciones: [
      { valor: 'mayor_valor', etiqueta: 'Mayor valor en compras' },
      { valor: 'mas_pedidos', etiqueta: 'Mayor número de pedidos' },
    ],
  },
  {
    /*
     * El tope era 100, tal cual venia de la especificacion original, y Juan lo
     * subio a 500 el 1 de octubre de 2026, cuando una Carrera de Mars pidio 140
     * ganadores y la pantalla la rechazo. Es uno solo para los ocho paises que
     * tienen Carrera de Compras, porque el esquema es uno solo. Decision 137.
     *
     * El mensaje de rango lleva el numero escrito a mano en preguntas.js
     * (numeroGanadores.errores.rango): si este tope cambia, cambia alla tambien.
     * pruebas/limites_numericos.test.js cuida que los dos digan lo mismo.
     */
    id: 'numeroGanadores',
    etiqueta: 'Número de ganadores',
    tipo: 'numero',
    minimo: 1,
    maximo: 500,
    paso: 'concurso',
    obligatorio: true,
  },
  {
    id: 'desempate',
    etiqueta: 'Criterio de desempate',
    tipo: 'lista',
    paso: 'concurso',
    obligatorio: true,
    opciones: [
      { valor: 'primero', etiqueta: 'Quien llegó primero' },
      { valor: 'mas_pedidos', etiqueta: 'Mayor número de pedidos' },
      { valor: 'mayor_valor', etiqueta: 'Mayor valor en compras' },
    ],
  },
  {
    id: 'tipoPremio',
    etiqueta: 'Tipo de premio',
    tipo: 'lista',
    paso: 'premio',
    obligatorio: true,
    opciones: [
      { valor: 'creditos', etiqueta: 'Créditos' },
      { valor: 'fisico', etiqueta: 'Premio físico' },
    ],
  },
  {
    id: 'creditosPremio',
    etiqueta: 'Créditos del premio',
    tipo: 'numero',
    // Sin minimo, un 0 generaba "Cada ganador recibira cero (0) Creditos":
    // un concurso publicado sin premio.
    minimo: 1,
    paso: 'premio',
    visible: function (entrada) { return entrada.tipoPremio === 'creditos'; },
    obligatorio: function (entrada) { return entrada.tipoPremio === 'creditos'; },
  },
  {
    id: 'descripcionPremio',
    etiqueta: 'Descripción del premio',
    tipo: 'texto',
    maximo: 150,
    paso: 'premio',
    visible: function (entrada) { return entrada.tipoPremio === 'fisico'; },
    obligatorio: function (entrada) { return entrada.tipoPremio === 'fisico'; },
  },
  {
    /*
     * El valor comercial del premio, solo en Colombia y solo con premio fisico.
     *
     * Decision 36 (ii) del encargo 01, que Juan confirmo el 20 de septiembre de
     * 2026 (punto D3). Los dos textos dicen "pesos M/Cte." y "IVA incluido", que
     * son de Colombia, asi que la pregunta sale solo alli: hoy la Carrera de
     * Compras solo esta habilitada en Colombia, y cada pais escribe su frase el
     * dia que se habilite alla. En los demas la clausula queda como estaba.
     *
     * Obligatoria donde se pregunta: la frase del premio la nombra, y sin valor
     * saldria a medias.
     */
    id: 'valorPremio',
    etiqueta: 'Valor comercial del premio',
    tipo: 'numero',
    minimo: 1,
    paso: 'premio',
    visible: pideValorDelPremio,
    obligatorio: pideValorDelPremio,
  },
  {
    /*
     * Solo con premio fisico. Con Creditos no hay entrega que repartir: Rappi
     * los acredita en la Billetera, y preguntar quien entrega hacia que el
     * documento dijera que el Organizador se encarga de una entrega que no
     * existe. Falla (a) de la decision 36 del encargo 01; Juan aprobo el 18 de
     * septiembre la frase que ocupa su lugar.
     */
    id: 'entregaPor',
    etiqueta: '¿Quién entrega el premio?',
    tipo: 'lista',
    paso: 'premio',
    visible: function (entrada) { return entrada.tipoPremio === 'fisico'; },
    obligatorio: function (entrada) { return entrada.tipoPremio === 'fisico'; },
    opciones: [
      { valor: 'organizador', etiqueta: 'El Organizador' },
      { valor: 'rappi', etiqueta: 'Rappi, como operador logístico' },
    ],
  },
  {
    /*
     * El acuerdo de transferencia de datos.
     *
     * Rappi no le puede pasar al Organizador el nombre, la direccion y el
     * documento del ganador sin un acuerdo firmado con esa marca. Solo aplica
     * cuando hay algo fisico que llevar y lo lleva el Organizador, que es la
     * misma condicion con la que sale la clausula de datos del documento.
     *
     * No bloquea: los datos salen despues del concurso, asi que el T&C se genera
     * igual y lo que hace la herramienta es decirle al comercial como se firma.
     * Decision 36 (i) de la respuesta del encargo 01.
     */
    id: 'acuerdoDatos',
    etiqueta: '¿El Organizador firmó el acuerdo de datos?',
    tipo: 'lista',
    paso: 'premio',
    obligatorio: false,
    visible: function (entrada) {
      return entrada.tipoPremio === 'fisico' && entrada.entregaPor === 'organizador';
    },
    opciones: [
      { valor: 'firmado', etiqueta: 'Sí, ya está firmado' },
      { valor: 'no_o_no_se', etiqueta: 'No, o no sé' },
    ],
  },
  {
    id: 'medioNotificacion',
    etiqueta: '¿Cómo se avisa al ganador?',
    tipo: 'lista',
    paso: 'premio',
    obligatorio: true,
    opciones: [
      { valor: 'correo', etiqueta: 'Correo electrónico' },
      { valor: 'llamada', etiqueta: 'Llamada telefónica' },
      { valor: 'plataforma', etiqueta: 'Notificación en la Plataforma Rappi' },
    ],
  },
  { id: 'fechaNotificacion', etiqueta: 'Fecha de notificación', tipo: 'fecha', paso: 'premio', obligatorio: true },
  { id: 'plazoConfirmacion', etiqueta: 'Plazo para confirmar', tipo: 'numero', minimo: 1, maximo: 30, porDefecto: 5, paso: 'premio', obligatorio: true },
  // Sin valor por defecto a proposito: son promesas al ganador (cuantas veces se
  // intenta contactarlo y en cuantos dias se declara desierto el premio), y las
  // pone el KAM con lo que de verdad se va a hacer. K9 de la revision de la
  // Carrera (Kenvue), instruccion de Juan del 8 de octubre de 2026.
  { id: 'intentosContacto', etiqueta: 'Intentos de contacto', tipo: 'numero', minimo: 1, maximo: 5, paso: 'premio', obligatorio: true },
  { id: 'diasDesierto', etiqueta: 'Días para declarar desierto el premio', tipo: 'numero', minimo: 15, maximo: 90, paso: 'premio', obligatorio: true },
];

/**
 * Solo con premio fisico: ver el campo valorPremio.
 *
 * Hasta el 21 de septiembre de 2026 era ademas solo en Colombia, porque la frase
 * del documento decia "pesos M/Cte." y "IVA incluido". Los dos salen hoy de la
 * fila del pais (moneda_nombre e impuesto_indirecto), asi que la razon de
 * limitarlo se fue con ellos, y declarar el valor comercial del premio es lo que
 * piden las autoridades de consumo de los paises donde el concurso acaba de
 * habilitarse.
 */
function pideValorDelPremio(entrada) {
  return entrada.tipoPremio === 'fisico';
}

/* --- Descuento y Cupon ----------------------------------------------------
 *
 * Dos tipos que comparten el mismo formulario menos dos preguntas. El descuento
 * se aplica solo sobre el precio; el cupon lo activa el Usuario/Consumidor, con
 * un codigo o desde la seccion "Cupones" de la aplicacion.
 *
 * Ninguno de los dos da Creditos, asi que no llevan el paso de Creditos entero:
 * ni carga, ni vigencia, ni redencion. A cambio traen la forma del beneficio,
 * que decide sobre que se calcula, y como termina la campana.
 *
 * Habilitados fuera de Colombia el 21 de septiembre de 2026.
 */

/*
 * Las cinco formas del beneficio.
 *
 * Las dos primeras bajan el precio; las tres ultimas quitan un cargo del pedido.
 * Son las mismas cuatro que Legal Brasil tiene aprobadas, mas el monto fijo, que
 * en delivery es la forma mas pedida despues del porcentaje.
 */
var OPCIONES_FORMA_DESCUENTO = [
  { valor: 'porcentaje', etiqueta: 'Un porcentaje de descuento' },
  { valor: 'monto', etiqueta: 'Un monto fijo de descuento' },
  { valor: 'envio', etiqueta: 'Envío gratis' },
  { valor: 'tarifa_servicio', etiqueta: 'Tarifa de servicio gratis' },
  { valor: 'envio_y_tarifa', etiqueta: 'Envío y tarifa de servicio gratis' },
];

function pideElPorcentajeDelDescuento(entrada) {
  return entrada.formaDelDescuento === 'porcentaje';
}

function pideElMontoDelDescuento(entrada) {
  return entrada.formaDelDescuento === 'monto';
}

/*
 * El tope solo se pregunta donde puede haber uno.
 *
 * Con monto fijo el tope ya es el monto, y la tarifa de servicio no lleva tope
 * en ninguno de los documentos aprobados. Donde si cabe es en el porcentaje y en
 * el envio, que es justo el caso que Legal Brasil ya tiene escrito ("o frete
 * gratis esta limitado a R$20,00").
 */
function pideElTopeDelDescuento(entrada) {
  return entrada.formaDelDescuento === 'porcentaje' ||
    entrada.formaDelDescuento === 'envio' ||
    entrada.formaDelDescuento === 'envio_y_tarifa';
}

function pideElPresupuestoDelDescuento(entrada) {
  return entrada.agotamiento === 'presupuesto';
}

function pideLasUnidadesDelDescuento(entrada) {
  return entrada.agotamiento === 'unidades';
}

function pideElCodigoDelCupon(entrada) {
  return entrada.activacionCupon === 'codigo';
}

function esDeUnaMarca(entrada) {
  return entrada.productos === 'marca';
}

function sonProductosEspecificos(entrada) {
  return entrada.productos === 'especificos';
}

/** Sobre que productos aplica el Beneficio. Mismo reparto que en la Carrera. */
var CAMPOS_PRODUCTOS_DEL_DESCUENTO = [
  {
    id: 'productos',
    etiqueta: 'Productos que participan',
    tipo: 'lista',
    paso: 'beneficio',
    obligatorio: true,
    opciones: [
      { valor: 'todos', etiqueta: 'Todos los de la tienda' },
      { valor: 'marca', etiqueta: 'Los de una marca' },
      { valor: 'especificos', etiqueta: 'Productos específicos' },
    ],
  },
  {
    id: 'makerMarca',
    etiqueta: 'Marca',
    tipo: 'texto',
    paso: 'beneficio',
    visible: esDeUnaMarca,
    obligatorio: esDeUnaMarca,
  },
  {
    id: 'productosDetalle',
    etiqueta: 'Productos participantes',
    tipo: 'repetible',
    minimo: 1,
    maximo: 60,
    paso: 'beneficio',
    visible: sonProductosEspecificos,
    obligatorio: sonProductosEspecificos,
  },
];

/** Como termina la campana: por fecha, por presupuesto o por unidades. */
var CAMPOS_AGOTAMIENTO = [
  {
    id: 'agotamiento',
    etiqueta: '¿Cómo termina la campaña?',
    tipo: 'lista',
    paso: 'beneficio',
    obligatorio: true,
    opciones: [
      { valor: 'fecha', etiqueta: 'Cuando llegue la fecha de fin' },
      { valor: 'presupuesto', etiqueta: 'Cuando se agote el presupuesto' },
      { valor: 'unidades', etiqueta: 'Cuando se agoten las unidades' },
    ],
  },
  {
    id: 'presupuesto',
    etiqueta: 'Presupuesto total',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: pideElPresupuestoDelDescuento,
    obligatorio: pideElPresupuestoDelDescuento,
  },
  {
    id: 'unidadesDisponibles',
    etiqueta: 'Unidades disponibles',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: pideLasUnidadesDelDescuento,
    obligatorio: pideLasUnidadesDelDescuento,
  },
];

/** En qué consiste el beneficio: la forma, su número y su tope. */
var CAMPOS_BENEFICIO_DESCUENTO = [
  {
    id: 'formaDelDescuento',
    etiqueta: 'Forma del beneficio',
    tipo: 'lista',
    paso: 'beneficio',
    obligatorio: true,
    opciones: OPCIONES_FORMA_DESCUENTO,
  },
  {
    id: 'porcentaje',
    etiqueta: 'Porcentaje de descuento',
    tipo: 'numero',
    minimo: 1,
    maximo: 100,
    paso: 'beneficio',
    visible: pideElPorcentajeDelDescuento,
    obligatorio: pideElPorcentajeDelDescuento,
  },
  {
    id: 'montoDescuento',
    etiqueta: 'Monto del descuento',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: pideElMontoDelDescuento,
    obligatorio: pideElMontoDelDescuento,
  },
  // Opcional: hay campanas de porcentaje sin techo, y el documento lo dice sin
  // la vinneta. Obligarlo haria inventar un numero.
  {
    id: 'tope',
    etiqueta: 'Tope por pedido',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: pideElTopeDelDescuento,
    obligatorio: false,
  },
];

/** Cuántas veces puede ganar la misma persona. */
var CAMPOS_VECES_DESCUENTO = [
  {
    id: 'maxPedidos',
    etiqueta: 'Máximo de pedidos con beneficio',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: sinLimiteNoLoPide,
    obligatorio: sinLimiteNoLoPide,
  },
  { id: 'sinLimite', etiqueta: 'Sin límite de pedidos', tipo: 'casilla', paso: 'beneficio', obligatorio: false },
];

/*
 * El orden del paso del beneficio: en qué consiste, sobre qué productos, cuántas
 * veces y cómo termina. El Cupón mete sus dos preguntas entre los productos y
 * las veces, porque "cómo se activa" es parte de la mecánica y no un límite.
 */
var CAMPOS_DESCUENTO = unir(
  CAMPOS_BENEFICIO_DESCUENTO,
  CAMPOS_PRODUCTOS_DEL_DESCUENTO,
  CAMPOS_VECES_DESCUENTO,
  CAMPOS_AGOTAMIENTO
);

/** Las dos preguntas que el Cupon tiene y el Descuento no. */
var CAMPOS_CUPON = [
  {
    id: 'activacionCupon',
    etiqueta: '¿Cómo se activa el cupón?',
    tipo: 'lista',
    paso: 'beneficio',
    obligatorio: true,
    opciones: [
      { valor: 'codigo', etiqueta: 'Con un código que el usuario escribe' },
      { valor: 'seccion', etiqueta: 'Desde la sección Cupones de la app' },
    ],
  },
  {
    id: 'codigoCupon',
    etiqueta: 'Código del cupón',
    tipo: 'codigo',
    maximo: 24,
    paso: 'beneficio',
    visible: pideElCodigoDelCupon,
    obligatorio: pideElCodigoDelCupon,
  },
];

/** El codigo del Cupom de Brasil, que va impreso dos veces en el documento. */
var CAMPO_CODIGO_CUPOM_BR = {
  id: 'codigoCupon',
  etiqueta: 'Código del cupón',
  tipo: 'codigo',
  maximo: 24,
  paso: 'beneficio',
  obligatorio: true,
};

var CAMPOS_CASHBACK_DAY = [
  { id: 'tiendas', etiqueta: 'Tiendas participantes', tipo: 'repetible', minimo: 2, maximo: 60, paso: 'tiendas', obligatorio: true },
];

/** Campos de cada fila del repetible de tiendas. */
var CAMPOS_POR_TIENDA = [
  { id: 'marca', etiqueta: 'Marca', tipo: 'texto', obligatorio: true },
  { id: 'razonSocial', etiqueta: 'Razón social', tipo: 'texto', obligatorio: true },
  { id: 'id', etiqueta: 'Identificación', tipo: 'identificacion', obligatorio: true },
  {
    id: 'ciudades',
    etiqueta: 'Ciudades (separadas por comas)',
    tipo: 'texto',
    obligatorio: function (tienda) { return !tienda.nacional; },
  },
  { id: 'nacional', etiqueta: 'Cobertura nacional', tipo: 'casilla', obligatorio: false },
  { id: 'presupuesto', etiqueta: 'Presupuesto', tipo: 'numero', minimo: 1, obligatorio: true },
  // La misma pregunta del Cashback de una tienda, una vez por marca: en el
  // Multitienda cada una puede tener su propia respuesta.
  { id: 'tiendaTurbo', etiqueta: 'En cuál de sus tiendas', tipo: 'lista', obligatorio: true, opciones: OPCIONES_TIENDA_TURBO },
];

/** Campos de cada fila de la lista de tiendas de Turbo del cashback por ETA. */
var CAMPOS_POR_TIENDA_ETA = [
  { id: 'nombre', etiqueta: 'Nombre de la tienda', tipo: 'texto', obligatorio: true },
];

/**
 * Campos de cada fila de la lista de tiendas de la Carrera de Compras.
 *
 * Mismas cuatro opciones de Turbo que el Cashback de una tienda: en una Carrera
 * que suma las compras de Éxito y de Turbo Carulla, la diferencia entre las dos
 * filas es justo en cuál de sus tiendas cuentan los pedidos (K1.a y K1.b de la
 * revisión de la Carrera de Kenvue, 8 de octubre de 2026).
 */
var CAMPOS_POR_TIENDA_CARRERA = [
  { id: 'nombre', etiqueta: 'Tienda', tipo: 'texto', obligatorio: true },
  { id: 'tiendaTurbo', etiqueta: 'En cuál de sus tiendas', tipo: 'lista', obligatorio: true, opciones: OPCIONES_TIENDA_TURBO },
];

/** Campos de cada fila de la lista de productos de la Carrera. */
var CAMPOS_POR_PRODUCTO = [
  { id: 'nombre', etiqueta: 'Nombre', tipo: 'texto', obligatorio: true },
  { id: 'ean', etiqueta: 'EAN', tipo: 'ean', obligatorio: true },
];

/** Inserta un campo justo despues de otro, por identificador. */
function insertarDespuesDe(campos, id, nuevo) {
  var salida = [];
  for (var i = 0; i < campos.length; i++) {
    salida.push(campos[i]);
    if (campos[i].id === id) salida.push(nuevo);
  }
  return salida;
}

/** Cambia un campo por otro en el mismo sitio, por identificador. */
function reemplazarCampo(campos, id, nuevo) {
  var salida = [];
  for (var i = 0; i < campos.length; i++) {
    salida.push(campos[i].id === id ? nuevo : campos[i]);
  }
  return salida;
}

function unir() {
  var todos = [];
  for (var i = 0; i < arguments.length; i++) {
    todos = todos.concat(arguments[i]);
  }
  return todos;
}

/* --- Rappi Travel ---------------------------------------------------------
 *
 * Dos tipos: cashback_travel y descuento_travel. Comparten casi todo el
 * formulario y se separan en el paso del beneficio. La especificacion completa
 * esta en docs/MODELO_BASE_TRAVEL.md, seccion 4.
 *
 * Travel no tiene "tienda": tiene categorias de la app y, opcionalmente, una
 * marca aliada. Por eso no reusa CAMPOS_TIENDA_Y_ORGANIZADOR.
 */

/** Las categorias marcadas, como lista. */
function categoriasDe(entrada) {
  var valor = (entrada && entrada.categorias) || [];
  return Object.prototype.toString.call(valor) === '[object Array]' ? valor : [];
}

/** true si alguna categoria marcada esta en el grupo. */
function hayGrupoDeTravel(entrada, grupo) {
  if (typeof CATEGORIAS_TRAVEL === 'undefined') return false;
  var delGrupo = (CATEGORIAS_TRAVEL.grupos || {})[grupo] || [];
  var marcadas = categoriasDe(entrada);
  for (var i = 0; i < marcadas.length; i++) {
    if (delGrupo.indexOf(marcadas[i]) !== -1) return true;
  }
  return false;
}

function hayAereasDeTravel(entrada) {
  return hayGrupoDeTravel(entrada, 'aereas');
}

function hayAlojamientoDeTravel(entrada) {
  return hayGrupoDeTravel(entrada, 'alojamiento');
}

/** Hoteles, Marriott Bonvoy y Paquetes admiten un minimo de noches. Hoteles por horas no. */
function admiteNochesMinimas(entrada) {
  var marcadas = categoriasDe(entrada);
  var conNoches = ['Hoteles', 'Marriott Bonvoy', 'Paquetes'];
  for (var i = 0; i < marcadas.length; i++) {
    if (conNoches.indexOf(marcadas[i]) !== -1) return true;
  }
  return false;
}

function hayAutosDeTravel(entrada) {
  return categoriasDe(entrada).indexOf('Autos') !== -1;
}

/** Campos que comparten los dos tipos de Travel. */
var CAMPOS_TRAVEL_COMUNES = [
  { id: 'pais', etiqueta: 'País', tipo: 'lista', paso: 'campana', obligatorio: true },
  {
    id: 'negocio',
    etiqueta: 'Negocio',
    tipo: 'lista',
    paso: 'campana',
    obligatorio: true,
    opciones: [
      { valor: 'rappi', etiqueta: 'Rappi' },
      { valor: 'travel', etiqueta: 'Rappi Travel' },
    ],
  },
  { id: 'tipo', etiqueta: 'Tipo de campaña', tipo: 'tarjetas', paso: 'campana', obligatorio: true },

  // --- Organizador ---------------------------------------------------------
  { id: 'organizadorRazonSocial', etiqueta: 'Razón social del organizador', tipo: 'texto', paso: 'organizador', obligatorio: true },
  { id: 'organizadorId', etiqueta: 'Identificación del organizador', tipo: 'identificacion', paso: 'organizador', obligatorio: true },
  // La marca es obligatoria desde el 20 de septiembre de 2026 (punto D7).
  // Cuando se dejaba vacia, el nombre de la campana quedaba con la razon social
  // adentro: "OPERADOR DE PRUEBA S.A.S. · 50% CASHBACK TRAVEL · 15 OCT 2026", y
  // ese nombre va en el titulo del documento y, en la Carrera, dentro de una
  // clausula.
  { id: 'marcaAliado', etiqueta: 'Marca aliada', tipo: 'texto', paso: 'organizador', obligatorio: true },

  // --- Productos -----------------------------------------------------------
  { id: 'categorias', etiqueta: 'Categorías participantes', tipo: 'casillas', paso: 'productos_travel', obligatorio: true },
  {
    id: 'ambito',
    etiqueta: 'Ámbito de los viajes',
    tipo: 'lista',
    paso: 'productos_travel',
    obligatorio: true,
    opciones: [
      { valor: 'nacional', etiqueta: 'Solo nacionales' },
      { valor: 'internacional', etiqueta: 'Solo internacionales' },
      { valor: 'ambos', etiqueta: 'Nacionales e internacionales' },
    ],
  },
  { id: 'destinos', etiqueta: 'Destinos (separados por comas)', tipo: 'texto', paso: 'productos_travel', obligatorio: false },
  {
    id: 'hotelesModo',
    etiqueta: '¿Qué hoteles participan?',
    tipo: 'lista',
    paso: 'productos_travel',
    visible: hayAlojamientoDeTravel,
    obligatorio: hayAlojamientoDeTravel,
    opciones: [
      { valor: 'todos', etiqueta: 'Todos' },
      { valor: 'algunos', etiqueta: 'Solo algunos' },
      { valor: 'etiqueta', etiqueta: 'Los que tengan la etiqueta de la campaña' },
    ],
  },
  {
    id: 'hotelesLista',
    etiqueta: 'Hoteles participantes (separados por comas)',
    tipo: 'texto',
    paso: 'productos_travel',
    visible: function (entrada) { return hayAlojamientoDeTravel(entrada) && entrada.hotelesModo === 'algunos'; },
    obligatorio: function (entrada) { return hayAlojamientoDeTravel(entrada) && entrada.hotelesModo === 'algunos'; },
  },

  // --- Condiciones de los productos ---------------------------------------
  { id: 'aerolinea', etiqueta: 'Aerolínea', tipo: 'texto', paso: 'condiciones_travel', visible: hayAereasDeTravel, obligatorio: false },
  {
    id: 'soloOperados',
    etiqueta: 'Solo vuelos operados directamente',
    tipo: 'casilla',
    paso: 'condiciones_travel',
    visible: function (entrada) { return hayAereasDeTravel(entrada) && !!String(entrada.aerolinea || '').trim(); },
    obligatorio: false,
  },
  {
    id: 'trayecto',
    etiqueta: 'Trayectos que aplican',
    tipo: 'lista',
    paso: 'condiciones_travel',
    visible: hayAereasDeTravel,
    obligatorio: hayAereasDeTravel,
    opciones: [
      { valor: 'cualquiera', etiqueta: 'Cualquiera' },
      { valor: 'ida_y_regreso', etiqueta: 'Solo ida y regreso' },
      { valor: 'solo_ida', etiqueta: 'Solo ida' },
    ],
  },
  {
    id: 'conteoIdaRegreso',
    etiqueta: 'Cómo se cuentan las compras de ida y regreso',
    tipo: 'lista',
    paso: 'condiciones_travel',
    visible: function (entrada) { return hayAereasDeTravel(entrada) && entrada.trayecto !== 'solo_ida'; },
    obligatorio: function (entrada) { return hayAereasDeTravel(entrada) && entrada.trayecto !== 'solo_ida'; },
    opciones: [
      { valor: 'una_orden', etiqueta: 'Como una sola orden' },
      { valor: 'por_trayecto', etiqueta: 'Cada trayecto como una orden' },
    ],
  },
  { id: 'clasesExcluidas', etiqueta: 'Clases tarifarias excluidas', tipo: 'texto', paso: 'condiciones_travel', visible: hayAereasDeTravel, obligatorio: false },
  { id: 'soloOrigenPais', etiqueta: 'Solo vuelos con origen en el país', tipo: 'casilla', paso: 'condiciones_travel', visible: hayAereasDeTravel, obligatorio: false },
  {
    id: 'anticipacionDias',
    etiqueta: 'Días de anticipación',
    tipo: 'numero',
    minimo: 1,
    maximo: 365,
    paso: 'condiciones_travel',
    visible: hayAereasDeTravel,
    obligatorio: false,
  },
  { id: 'periodoViajeInicio', etiqueta: 'El viaje empieza desde', tipo: 'fecha', paso: 'condiciones_travel', obligatorio: false },
  {
    id: 'periodoViajeFin',
    etiqueta: 'El viaje termina hasta',
    tipo: 'fecha',
    paso: 'condiciones_travel',
    obligatorio: function (entrada) { return !!entrada.periodoViajeInicio; },
  },
  {
    id: 'ambasFechasDentro',
    etiqueta: 'Los dos trayectos dentro del periodo',
    tipo: 'casilla',
    paso: 'condiciones_travel',
    visible: function (entrada) { return entrada.trayecto === 'ida_y_regreso' && !!entrada.periodoViajeInicio; },
    obligatorio: false,
  },
  {
    id: 'fechasExcluidas',
    etiqueta: 'Fechas excluidas (separadas por comas)',
    tipo: 'texto',
    paso: 'condiciones_travel',
    visible: function (entrada) { return hayAlojamientoDeTravel(entrada) || hayAutosDeTravel(entrada); },
    obligatorio: false,
  },
  {
    id: 'nochesMinimas',
    etiqueta: 'Mínimo de noches',
    tipo: 'numero',
    minimo: 1,
    maximo: 365,
    paso: 'condiciones_travel',
    visible: admiteNochesMinimas,
    obligatorio: false,
  },
  {
    id: 'diasAlquilerMinimo',
    etiqueta: 'Mínimo de días de alquiler',
    tipo: 'numero',
    minimo: 1,
    maximo: 365,
    paso: 'condiciones_travel',
    visible: hayAutosDeTravel,
    obligatorio: false,
  },
  {
    id: 'diasAlquilerMaximo',
    etiqueta: 'Máximo de días de alquiler',
    tipo: 'numero',
    minimo: 1,
    maximo: 365,
    paso: 'condiciones_travel',
    visible: function (entrada) { return hayAutosDeTravel(entrada) && !!entrada.diasAlquilerMinimo; },
    obligatorio: function (entrada) { return hayAutosDeTravel(entrada) && !!entrada.diasAlquilerMinimo; },
  },
  {
    id: 'compraMinima',
    etiqueta: 'Compra mínima',
    tipo: 'numero',
    minimo: 1,
    paso: 'condiciones_travel',
    visible: function (entrada) { return !entrada.sinCompraMinima; },
    obligatorio: function (entrada) { return !entrada.sinCompraMinima; },
  },
  { id: 'sinCompraMinima', etiqueta: 'Sin compra mínima', tipo: 'casilla', paso: 'condiciones_travel', obligatorio: false },
  {
    id: 'otraCondicion',
    etiqueta: '¿El aliado pide otra condición?',
    tipo: 'lista',
    paso: 'condiciones_travel',
    obligatorio: true,
    opciones: [
      { valor: 'no', etiqueta: 'No' },
      { valor: 'si', etiqueta: 'Sí' },
    ],
  },

  // --- Vigencia ------------------------------------------------------------
  { id: 'fechaInicio', etiqueta: 'Fecha de inicio', tipo: 'fecha', paso: 'vigencia', obligatorio: true },
  { id: 'horaInicio', etiqueta: 'Hora de inicio', tipo: 'hora', porDefecto: '00:00', paso: 'vigencia', obligatorio: true },
  { id: 'fechaFin', etiqueta: 'Fecha de fin', tipo: 'fecha', paso: 'vigencia', obligatorio: true },
  { id: 'horaFin', etiqueta: 'Hora de fin', tipo: 'hora', porDefecto: '23:59', paso: 'vigencia', obligatorio: true },

  // --- Participantes -------------------------------------------------------
  {
    id: 'segmento',
    etiqueta: '¿Quiénes pueden participar?',
    tipo: 'lista',
    paso: 'participantes',
    obligatorio: true,
    opciones: [
      { valor: 'todos', etiqueta: 'Todos' },
      { valor: 'pro', etiqueta: 'Pro y Pro Black' },
      { valor: 'pro_black', etiqueta: 'Solo Pro Black' },
      { valor: 'pro_o_rappicard', etiqueta: 'Pro o RappiCard' },
      { valor: 'sin_pro', etiqueta: 'Solo quienes no tienen Pro' },
      { valor: 'primera_compra', etiqueta: 'Primera compra en Travel' },
    ],
  },
  {
    id: 'metodoPago',
    etiqueta: 'Medios de pago',
    tipo: 'lista',
    paso: 'participantes',
    obligatorio: true,
    opciones: [
      { valor: 'digitales', etiqueta: 'Digitales, excepto efectivo' },
      { valor: 'rappicard', etiqueta: 'Solo RappiCard' },
      // Una tarjeta o un banco concreto es un medio de pago como cualquier
      // otro: el banco no responde por la campana, solo es con lo que se paga.
      // Salio del filtro el 21 de septiembre de 2026. Lo que sigue en el filtro
      // son las cuotas, que es financiacion y es otra cosa.
      { valor: 'emisor', etiqueta: 'Solo con una tarjeta o banco específico' },
    ],
  },
  {
    id: 'nombreMedioPago',
    etiqueta: 'Tarjeta o banco',
    tipo: 'texto',
    paso: 'participantes',
    obligatorio: true,
    visible: function (entrada) { return entrada.metodoPago === 'emisor'; },
  },

  // --- El beneficio que cambia segun el producto ---------------------------
  //
  // De las cinco piezas publicadas que Juan paso el 21 de septiembre de 2026,
  // dos son exactamente este caso: veintitres hoteles, cada uno con su
  // porcentaje y sus fechas. No hay nada ilegal ahi, solo un limite del modelo,
  // que estaba escrito con un beneficio y solo uno. Se resuelve como ya se
  // resolvio en Cashback Multitienda: una lista de filas.
  {
    id: 'beneficioVariable',
    etiqueta: 'El beneficio cambia según el producto',
    tipo: 'lista',
    paso: 'beneficio',
    obligatorio: true,
    opciones: [
      { valor: 'no', etiqueta: 'Es el mismo para todo' },
      { valor: 'si', etiqueta: 'Cambia según el producto' },
    ],
  },
  {
    id: 'beneficiosPorProducto',
    etiqueta: 'Beneficio por producto',
    tipo: 'repetible',
    minimo: 2,
    maximo: 60,
    paso: 'beneficio',
    obligatorio: true,
    visible: function (entrada) { return entrada.beneficioVariable === 'si'; },
  },

  // --- La pieza publicitaria ----------------------------------------------
  //
  // Anunciar un precio no es el problema: anunciarlo mal si. La ley pide que el
  // precio anunciado sea el final, con impuestos y cargos, y por eso esto
  // bloqueaba entero hasta el 21 de septiembre de 2026. Ahora se pregunta, y
  // solo el que anuncia un precio que no es el total se va a Legal.
  {
    id: 'anunciaPrecio',
    etiqueta: 'La pieza anuncia un precio',
    tipo: 'lista',
    paso: 'pieza',
    obligatorio: true,
    opciones: [
      { valor: 'no', etiqueta: 'No' },
      { valor: 'si', etiqueta: 'Sí' },
    ],
  },
  {
    id: 'precioIncluyeTodo',
    etiqueta: 'El precio anunciado es el final',
    tipo: 'lista',
    paso: 'pieza',
    obligatorio: true,
    visible: function (entrada) { return entrada.anunciaPrecio === 'si'; },
    opciones: [
      { valor: 'si', etiqueta: 'Sí' },
      { valor: 'no', etiqueta: 'No' },
    ],
  },

  // --- Comunicacion y declaraciones ---------------------------------------
  { id: 'fechaPrimeraComunicacion', etiqueta: 'Fecha de la primera comunicación', tipo: 'fecha', paso: 'confirmacion', obligatorio: true },
  { id: 'linkAnterior', etiqueta: 'Link de la campaña anterior', tipo: 'texto', paso: 'confirmacion', obligatorio: false },
  { id: 'aliadoAprobo', etiqueta: 'El aliado aprobó esta mecánica', tipo: 'casilla', paso: 'confirmacion', obligatorio: true },
  { id: 'declaracionPiezas', etiqueta: 'Las piezas dicen lo mismo que el T&C', tipo: 'casilla', paso: 'confirmacion', obligatorio: true },
  { id: 'declaracion', etiqueta: 'Confirmo que la información es veraz', tipo: 'casilla', paso: 'confirmacion', obligatorio: true },
];

/** Beneficio y Creditos del cashback_travel. */
var CAMPOS_CASHBACK_TRAVEL = [
  {
    id: 'formaBeneficio',
    etiqueta: 'Forma del beneficio',
    tipo: 'lista',
    paso: 'beneficio',
    obligatorio: true,
    opciones: [
      { valor: 'porcentaje', etiqueta: 'Un porcentaje de lo pagado' },
      { valor: 'monto_fijo', etiqueta: 'Un monto fijo en Créditos' },
    ],
  },
  {
    id: 'porcentaje',
    etiqueta: 'Porcentaje de cashback',
    tipo: 'numero',
    minimo: 1,
    maximo: 99,
    paso: 'beneficio',
    visible: function (entrada) { return entrada.formaBeneficio === 'porcentaje'; },
    obligatorio: function (entrada) { return entrada.formaBeneficio === 'porcentaje'; },
  },
  {
    id: 'tope',
    etiqueta: 'Tope por orden',
    tipo: 'numero',
    // El cashback de delivery revisa este numero desde el principio; Travel se
    // construyo despues y se quedo sin la revision. Con un 0 el documento decia
    // "sin que puedas recibir mas de cero (0) Creditos por orden".
    minimo: 1,
    paso: 'beneficio',
    visible: function (entrada) { return entrada.formaBeneficio === 'porcentaje' && !entrada.sinTope; },
    obligatorio: function (entrada) { return entrada.formaBeneficio === 'porcentaje' && !entrada.sinTope; },
  },
  {
    id: 'sinTope',
    etiqueta: 'Sin tope por orden',
    tipo: 'casilla',
    paso: 'beneficio',
    visible: function (entrada) { return entrada.formaBeneficio === 'porcentaje'; },
    obligatorio: false,
  },
  {
    id: 'montoFijo',
    etiqueta: 'Créditos por orden',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: function (entrada) { return entrada.formaBeneficio === 'monto_fijo'; },
    obligatorio: function (entrada) { return entrada.formaBeneficio === 'monto_fijo'; },
  },
  { id: 'limitePorUsuario', etiqueta: 'Órdenes con beneficio por persona', tipo: 'numero', minimo: 1, paso: 'beneficio', obligatorio: true },
  { id: 'presupuesto', etiqueta: 'Presupuesto total', tipo: 'numero', minimo: 1, paso: 'beneficio', obligatorio: true },
  {
    id: 'maxOrdenes',
    etiqueta: 'Máximo de órdenes de la campaña',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: function (entrada) { return !entrada.sinMaxOrdenes; },
    obligatorio: function (entrada) { return !entrada.sinMaxOrdenes; },
  },
  { id: 'sinMaxOrdenes', etiqueta: 'Sin máximo de órdenes', tipo: 'casilla', paso: 'beneficio', obligatorio: false },

  {
    id: 'carga',
    etiqueta: '¿Cuándo se cargan los Créditos?',
    tipo: 'lista',
    paso: 'creditos',
    obligatorio: true,
    opciones: [
      { valor: 'al_confirmarse', etiqueta: 'Al confirmarse la reserva' },
      { valor: 'dias_calendario', etiqueta: 'Unos días calendario después del fin' },
      { valor: 'dias_habiles', etiqueta: 'Unos días hábiles después del fin' },
    ],
  },
  {
    id: 'diasCarga',
    etiqueta: 'Días para la carga',
    tipo: 'numero',
    minimo: 1,
    maximo: 30,
    paso: 'creditos',
    visible: function (entrada) { return entrada.carga === 'dias_calendario' || entrada.carga === 'dias_habiles'; },
    obligatorio: function (entrada) { return entrada.carga === 'dias_calendario' || entrada.carga === 'dias_habiles'; },
  },
  { id: 'diasVigencia', etiqueta: 'Días de vigencia de los Créditos', tipo: 'numero', minimo: 1, maximo: 365, paso: 'creditos', obligatorio: true },
  {
    id: 'redencion',
    etiqueta: '¿Dónde se redimen los Créditos?',
    tipo: 'lista',
    paso: 'creditos',
    obligatorio: true,
    opciones: [
      { valor: 'categorias', etiqueta: 'Solo en algunas categorías de Travel' },
      { valor: 'todo_travel', etiqueta: 'En todo Travel' },
      { valor: 'travel_y_plataforma', etiqueta: 'En Travel y en toda la Plataforma Rappi' },
    ],
  },
  {
    id: 'categoriasRedencion',
    etiqueta: 'Categorías donde se redimen',
    tipo: 'casillas',
    paso: 'creditos',
    visible: function (entrada) { return entrada.redencion === 'categorias'; },
    obligatorio: function (entrada) { return entrada.redencion === 'categorias'; },
  },
];

/** Beneficio del descuento_travel. No tiene paso de Creditos. */
var CAMPOS_DESCUENTO_TRAVEL = [
  {
    id: 'formaDescuento',
    etiqueta: 'Forma del descuento',
    tipo: 'lista',
    paso: 'beneficio',
    obligatorio: true,
    opciones: [
      { valor: 'fijo', etiqueta: 'Un porcentaje fijo' },
      { valor: 'variable', etiqueta: 'Cambia según el producto' },
    ],
  },
  { id: 'porcentaje', etiqueta: 'Porcentaje de descuento', tipo: 'numero', minimo: 1, maximo: 99, paso: 'beneficio', obligatorio: true },
  {
    id: 'porcentajeMinimo',
    etiqueta: 'Porcentaje mínimo',
    tipo: 'numero',
    minimo: 1,
    maximo: 98,
    paso: 'beneficio',
    visible: function (entrada) { return entrada.formaDescuento === 'variable'; },
    obligatorio: function (entrada) { return entrada.formaDescuento === 'variable'; },
  },
  {
    id: 'productosConMaximo',
    etiqueta: 'Productos con el descuento máximo',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: function (entrada) { return entrada.formaDescuento === 'variable'; },
    obligatorio: function (entrada) { return entrada.formaDescuento === 'variable'; },
  },
  {
    id: 'visibilidad',
    etiqueta: '¿Dónde se ve el descuento?',
    tipo: 'casillas',
    paso: 'beneficio',
    obligatorio: true,
    opciones: [
      { valor: 'inicio', etiqueta: 'En la página de inicio de Travel' },
      { valor: 'etiqueta', etiqueta: 'En la etiqueta del producto' },
      { valor: 'precio_tachado', etiqueta: 'En el precio tachado del flujo de compra' },
    ],
  },
  {
    id: 'limitePorUsuario',
    etiqueta: 'Órdenes con descuento por persona',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: function (entrada) { return !entrada.sinLimitePorUsuario; },
    obligatorio: function (entrada) { return !entrada.sinLimitePorUsuario; },
  },
  { id: 'sinLimitePorUsuario', etiqueta: 'Sin límite por persona', tipo: 'casilla', paso: 'beneficio', obligatorio: false },
  {
    id: 'unidades',
    etiqueta: 'Unidades con descuento',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    visible: function (entrada) { return !entrada.sinUnidades; },
    obligatorio: function (entrada) { return !entrada.sinUnidades; },
  },
  { id: 'sinUnidades', etiqueta: 'No depende de unidades', tipo: 'casilla', paso: 'beneficio', obligatorio: false },
];


/* --- Brasil ---------------------------------------------------------------
 *
 * Un solo tipo con cuatro formas del beneficio: desconto, frete gratis, taxa de
 * servico y las dos ultimas juntas. Los cuatro T&C aprobados que mando Legal
 * Brasil son el mismo documento con ese unico tramo cambiado, asi que serian
 * cuatro modelos identicos menos una frase. Ver docs/MODELO_BASE_BRASIL.md.
 *
 * Reusa los campos que ya significan lo mismo (la tienda, el minimo de compra,
 * el tope, el maximo de pedidos) para no duplicar preguntas ni columnas de
 * auditoria. Solo trae dos propios: la forma del beneficio y los medios de pago,
 * que en Brasil son una lista concreta y no las tres opciones de Colombia.
 */
var CAMPOS_BRASIL = [
  { id: 'pais', etiqueta: 'País', tipo: 'lista', paso: 'campana', obligatorio: true },
  {
    id: 'negocio',
    etiqueta: 'Negocio',
    tipo: 'lista',
    paso: 'campana',
    obligatorio: true,
    opciones: [
      { valor: 'rappi', etiqueta: 'Rappi' },
      { valor: 'travel', etiqueta: 'Rappi Travel' },
    ],
  },
  { id: 'tipo', etiqueta: 'Tipo de campaña', tipo: 'tarjetas', paso: 'campana', obligatorio: true },

  { id: 'tienda', etiqueta: 'Parceiro', tipo: 'texto', paso: 'campana', obligatorio: true },

  { id: 'fechaInicio', etiqueta: 'Fecha de inicio', tipo: 'fecha', paso: 'vigencia', obligatorio: true },
  { id: 'horaInicio', etiqueta: 'Hora de inicio', tipo: 'hora', paso: 'vigencia', obligatorio: true },
  { id: 'fechaFin', etiqueta: 'Fecha de fin', tipo: 'fecha', paso: 'vigencia', obligatorio: true },
  { id: 'horaFin', etiqueta: 'Hora de fin', tipo: 'hora', paso: 'vigencia', obligatorio: true },

  {
    id: 'beneficioBr',
    etiqueta: 'Forma del beneficio',
    tipo: 'lista',
    paso: 'beneficio',
    obligatorio: true,
    opciones: [
      { valor: 'desconto', etiqueta: 'Desconto % OFF' },
      { valor: 'frete_gratis', etiqueta: 'Frete grátis' },
      { valor: 'taxa_servico', etiqueta: 'Taxa de serviço grátis' },
      { valor: 'taxa_e_frete', etiqueta: 'Taxa de serviço e frete grátis' },
    ],
  },
  // Los rangos no son adorno: sin ellos Brasil aceptaba 500% de desconto, un
  // tope de R$0,00 y "o limite de zero (0) pedidos", y los imprimia.
  {
    id: 'porcentaje',
    etiqueta: 'Porcentaje de descuento',
    tipo: 'numero',
    minimo: 1,
    maximo: 100,
    paso: 'beneficio',
    visible: esDescontoBr,
    obligatorio: esDescontoBr,
  },
  {
    id: 'tope',
    etiqueta: 'Tope del beneficio',
    tipo: 'numero',
    minimo: 1,
    paso: 'beneficio',
    // La taxa de servico no lleva tope en ninguno de los documentos aprobados,
    // asi que ni se pregunta. Donde si se pregunta (Desconto % OFF y Frete
    // gratis) es obligatorio: los dos documentos aprobados lo traen siempre, y
    // dejarlo vacio publicaba una campana sin techo. Punto E2, 20 de septiembre
    // de 2026.
    visible: llevaTopeBr,
    obligatorio: llevaTopeBr,
  },
  { id: 'compraMinima', etiqueta: 'Mínimo de compra', tipo: 'numero', minimo: 1, paso: 'participantes', obligatorio: false },
  // Obligatorio salvo con "Sin limite": con "Varias veces" y sin numero, el
  // resumen dejaba pulsar Generar y era el servidor el que devolvia un error
  // generico del documento.
  { id: 'maxPedidos', etiqueta: 'Máximo de pedidos por usuario', tipo: 'numero', minimo: 1, paso: 'beneficio', obligatorio: sinLimiteNoLoPide },
  { id: 'sinLimite', etiqueta: 'Sin límite de pedidos', tipo: 'casilla', paso: 'beneficio', obligatorio: false },
  { id: 'metodosPagoBr', etiqueta: 'Medios de pago', tipo: 'casillas', paso: 'beneficio', obligatorio: true },

  { id: 'declaracion', etiqueta: 'Declaración', tipo: 'casilla', paso: 'confirmacion', obligatorio: true },
];

function sinLimiteNoLoPide(entrada) {
  return !entrada.sinLimite;
}

function esDescontoBr(entrada) {
  return entrada.beneficioBr === 'desconto';
}

function llevaTopeBr(entrada) {
  return entrada.beneficioBr === 'desconto' || entrada.beneficioBr === 'frete_gratis';
}


/* --- Cashback por incumplimiento del ETA (Turbo) --------------------------
 *
 * El beneficio no se gana comprando: se gana cuando Rappi no cumple el tiempo
 * de entrega que prometio. Por eso este tipo no tiene aliado organizador ni
 * tienda unica: participan todas las tiendas Turbo de una ciudad, y quien pone
 * el presupuesto es Rappi.
 *
 * Base: los T&C publicados de Bogota (16/09/2026) y Barranquilla (1/09/2026).
 */
/*
 * Las formas en que puede correr una campana de cashback por ETA.
 *
 * Los dos nombres de categoria son los que ya estan confirmados: "Turbo
 * Restaurantes" es la de los dos T&C publicados y la de la pieza real, y
 * "Turbo" es la otra que propuso la decision 33. Los dos aparecen en
 * data/secciones.json como secciones de la app. Si hace falta otra categoria
 * (Turbo Carulla, por ejemplo), el nombre exacto lo da Legal y entra aqui: ver
 * docs/PENDIENTES_LEGAL.md.
 */
var OPCIONES_ALCANCE_TURBO = [
  { valor: 'restaurantes', etiqueta: 'En todo Turbo Restaurantes de la ciudad' },
  { valor: 'turbo', etiqueta: 'En todo Turbo de la ciudad' },
  { valor: 'tiendas', etiqueta: 'En unas tiendas concretas de Turbo' },
];

var CAMPOS_CASHBACK_ETA = [
  { id: 'pais', etiqueta: 'País', tipo: 'lista', paso: 'campana', obligatorio: true },
  {
    id: 'negocio',
    etiqueta: 'Negocio',
    tipo: 'lista',
    paso: 'campana',
    obligatorio: true,
    opciones: [
      { valor: 'rappi', etiqueta: 'Rappi' },
      { valor: 'travel', etiqueta: 'Rappi Travel' },
    ],
  },
  { id: 'tipo', etiqueta: 'Tipo de campaña', tipo: 'tarjetas', paso: 'campana', obligatorio: true },
  { id: 'ciudades', etiqueta: 'Ciudad', tipo: 'texto', paso: 'campana', obligatorio: true },
  /*
   * En que corre la campana: en toda una categoria del boton Turbo o en unas
   * tiendas concretas.
   *
   * Historia, porque importa. La decision 33 proponia una lista cerrada de dos
   * categorias, "Turbo Restaurantes" y "Turbo". Juan la corrigio diciendo que
   * son tiendas por zona con nombre propio (Turbo Calleja, Turbo Chico), y de
   * ahi salio el punto D1, que hizo que el documento las listara siempre. El 21
   * de septiembre de 2026 Juan aclaro que esa correccion era sobre el otro
   * Turbo, el de las dark stores tipo Turbo Carulla que venden CPGs: las
   * campanas de "15 minutos o Cashback" corren normalmente en Turbo
   * Restaurantes, donde estan El Corral Turbo, McDonald's Turbo y las demas
   * marcas. Las dos cosas existen, asi que se pregunta.
   */
  {
    id: 'alcanceTurbo',
    etiqueta: 'En qué corre la campaña',
    tipo: 'lista',
    paso: 'campana',
    obligatorio: true,
    porDefecto: 'restaurantes',
    opciones: OPCIONES_ALCANCE_TURBO,
  },
  {
    id: 'tiendasEta',
    etiqueta: 'Tiendas de Turbo',
    tipo: 'repetible',
    minimo: 1,
    maximo: 60,
    paso: 'campana',
    visible: function (entrada) { return entrada.alcanceTurbo === 'tiendas'; },
    obligatorio: function (entrada) { return entrada.alcanceTurbo === 'tiendas'; },
  },

  { id: 'fechaInicio', etiqueta: 'Fecha de la campaña', tipo: 'fecha', paso: 'vigencia', obligatorio: true },
  { id: 'horaInicio', etiqueta: 'Hora de inicio', tipo: 'hora', paso: 'vigencia', obligatorio: true },
  { id: 'horaFin', etiqueta: 'Hora de fin', tipo: 'hora', paso: 'vigencia', obligatorio: true },

  { id: 'etaMinutos', etiqueta: 'Minutos del ETA', tipo: 'numero', minimo: 1, maximo: 240, paso: 'beneficio', obligatorio: true },
  // Los mismos limites del cashback de delivery. Sin ellos el ETA aceptaba 500
  // y titulaba el documento "15 MINUTOS O 500% CASHBACK", y aceptaba 0 y
  // titulaba "15 MINUTOS O CASHBACK", sin porcentaje ninguno.
  { id: 'porcentaje', etiqueta: 'Porcentaje que se devuelve', tipo: 'numero', minimo: 1, maximo: 100, paso: 'beneficio', obligatorio: true },
  { id: 'tope', etiqueta: 'Tope por orden', tipo: 'numero', paso: 'beneficio', obligatorio: true },
  { id: 'presupuesto', etiqueta: 'Presupuesto total', tipo: 'numero', paso: 'beneficio', obligatorio: true },
  { id: 'maxPedidos', etiqueta: 'Máximo de órdenes por persona', tipo: 'numero', minimo: 1, paso: 'beneficio', obligatorio: sinLimiteNoLoPide },
  { id: 'sinLimite', etiqueta: 'Sin límite de órdenes', tipo: 'casilla', paso: 'beneficio', obligatorio: false },

  {
    id: 'carga',
    etiqueta: '¿Cuándo se cargan los Créditos?',
    tipo: 'lista',
    paso: 'creditos',
    obligatorio: true,
    opciones: [
      { valor: 'inmediata', etiqueta: 'Inmediata' },
      { valor: 'dia_siguiente', etiqueta: 'Al día siguiente' },
      { valor: 'fecha', etiqueta: 'En una fecha' },
    ],
  },
  {
    id: 'fechaCarga',
    etiqueta: 'Fecha de carga',
    tipo: 'fecha',
    paso: 'creditos',
    visible: function (entrada) { return entrada.carga === 'fecha'; },
    obligatorio: function (entrada) { return entrada.carga === 'fecha'; },
  },
  {
    id: 'vigencia',
    etiqueta: 'Vigencia de los Créditos',
    tipo: 'lista',
    paso: 'creditos',
    obligatorio: true,
    opciones: [
      { valor: 'dias', etiqueta: 'Por días' },
      { valor: 'fecha', etiqueta: 'Hasta una fecha' },
    ],
  },
  {
    id: 'diasVigencia',
    etiqueta: 'Días de vigencia',
    tipo: 'numero',
    minimo: 1,
    maximo: 365,
    paso: 'creditos',
    visible: function (entrada) { return entrada.vigencia === 'dias'; },
    obligatorio: function (entrada) { return entrada.vigencia === 'dias'; },
  },
  {
    id: 'fechaFinRedencion',
    etiqueta: 'Fecha límite de redención',
    tipo: 'fecha',
    paso: 'creditos',
    visible: function (entrada) { return entrada.vigencia === 'fecha'; },
    obligatorio: function (entrada) { return entrada.vigencia === 'fecha'; },
  },
  { id: 'exclusionesEta', etiqueta: 'Secciones excluidas', tipo: 'casillas', paso: 'creditos', obligatorio: false },

  { id: 'metodoPago', etiqueta: 'Medio de pago', tipo: 'lista', paso: 'participantes', obligatorio: true },

  { id: 'declaracion', etiqueta: 'Declaración', tipo: 'casilla', paso: 'confirmacion', obligatorio: true },
];

var ESQUEMAS = {
  cashback: {
    id: 'cashback',
    nombre: 'Cashback',
    descripcion: 'La tienda devuelve un porcentaje de lo que el usuario pagó, en Créditos para su Billetera. El usuario compra hoy y vuelve a gastar ese saldo después.',
    modelo: 'cashback',
    // El presupuesto va justo despues del tope: son el mismo tema y la
    // calculadora avisa cuando el tope se come el presupuesto entero.
    campos: insertarDespuesDe(
      insertarDespuesDe(
        unir(CAMPOS_COMUNES, CAMPOS_TIENDA_Y_ORGANIZADOR, CAMPOS_CREDITOS),
        // Justo detras de la tienda: las dos preguntas hablan de lo mismo.
        'tienda',
        CAMPO_TIENDA_TURBO
      ),
      'tope',
      { id: 'presupuesto', etiqueta: 'Presupuesto total', tipo: 'numero', paso: 'beneficio', obligatorio: true }
    ),
    // No se pregunta quien fondea: el Organizador es siempre la tienda o la
    // marca, y eso no cambia porque Rappi ponga la plata por detras.
    filtroDeEntrada: [
      '¿La tienda o la marca exige sus propios T&C?',
    ],
  },
  carrera_compras: {
    id: 'carrera_compras',
    nombre: 'Carrera de Compras',
    descripcion: 'Un concurso con premio: durante unas fechas gana quien más compre en la tienda. No hay azar, gana por lo que compró.',
    modelo: 'carrera_compras',
    // La tienda deja de ser un texto: son una o varias Tiendas Participantes
    // con un solo ranking, cada una con su respuesta de Turbo. Por eso ya no se
    // pregunta en el filtro "¿Participan varias tiendas?": la herramienta lo
    // hace (K1.a).
    campos: unir(
      CAMPOS_COMUNES,
      reemplazarCampo(CAMPOS_TIENDA_Y_ORGANIZADOR, 'tienda', {
        id: 'tiendasCarrera',
        etiqueta: 'Tiendas participantes',
        tipo: 'repetible',
        minimo: 1,
        maximo: 10,
        paso: 'campana',
        obligatorio: true,
      }),
      CAMPOS_CARRERA
    ),
    camposPorProducto: CAMPOS_POR_PRODUCTO,
    camposPorTiendaCarrera: CAMPOS_POR_TIENDA_CARRERA,
    filtroDeEntrada: [
      '¿Hay azar (sorteo, rifa, raspa y gana)?',
      '¿Hay premios distintos por puesto o tabla de puntos?',
      '¿El premio es una boleta, una experiencia o está ligado a un evento?',
      '¿La tienda o la marca exige sus propios T&C?',
    ],
  },
  descuento: {
    id: 'descuento',
    nombre: 'Descuento',
    descripcion: 'La tienda baja el precio de sus productos, o regala el envío o la tarifa de servicio. El usuario ve el precio ya rebajado antes de pagar y no recibe Créditos.',
    modelo: 'descuento',
    campos: insertarDespuesDe(
      unir(CAMPOS_COMUNES, CAMPOS_TIENDA_Y_ORGANIZADOR, CAMPOS_DESCUENTO),
      'tienda',
      CAMPO_TIENDA_TURBO
    ),
    camposPorProducto: CAMPOS_POR_PRODUCTO,
    // El beneficio no son Creditos: se calcula distinto y se imprime distinto.
    esDeDescuento: true,
    filtroDeEntrada: [
      '¿La tienda o la marca exige sus propios T&C?',
    ],
  },
  cupon: {
    id: 'cupon',
    nombre: 'Cupón',
    descripcion: 'Lo mismo que el Descuento, pero el usuario tiene que activarlo: escribe un código o toma el cupón en la sección “Cupones”. Sirve cuando el beneficio es para unos pocos y no para todo el que compre.',
    modelo: 'cupon',
    campos: insertarDespuesDe(
      unir(
        CAMPOS_COMUNES, CAMPOS_TIENDA_Y_ORGANIZADOR,
        CAMPOS_BENEFICIO_DESCUENTO, CAMPOS_PRODUCTOS_DEL_DESCUENTO,
        CAMPOS_CUPON, CAMPOS_VECES_DESCUENTO, CAMPOS_AGOTAMIENTO
      ),
      'tienda',
      CAMPO_TIENDA_TURBO
    ),
    camposPorProducto: CAMPOS_POR_PRODUCTO,
    esDeDescuento: true,
    filtroDeEntrada: [
      '¿La tienda o la marca exige sus propios T&C?',
    ],
  },
  cashback_travel: {
    id: 'cashback_travel',
    nombre: 'Cashback Travel',
    descripcion: 'La marca aliada devuelve un porcentaje de lo que el usuario pagó por su vuelo, hotel, auto o paquete, en Créditos para su Billetera.',
    modelo: 'cashback_travel',
    campos: unir(CAMPOS_TRAVEL_COMUNES, CAMPOS_CASHBACK_TRAVEL),
    // El filtro de Travel reemplaza al general: ver docs/MODELO_BASE_TRAVEL.md,
    // seccion 11. Vive en FILTRO_DE_TRAVEL, no aqui, porque son diez preguntas
    // con su razon y las comparten los dos tipos.
    filtroDeEntrada: [],
    esDeTravel: true,
  },
  descuento_travel: {
    id: 'descuento_travel',
    nombre: 'Descuento Travel',
    descripcion: 'La marca aliada baja el precio de sus vuelos, hoteles, autos o paquetes. El usuario ve el precio ya rebajado antes de pagar, no recibe Créditos.',
    modelo: 'descuento_travel',
    campos: unir(CAMPOS_TRAVEL_COMUNES, CAMPOS_DESCUENTO_TRAVEL),
    filtroDeEntrada: [],
    esDeTravel: true,
  },
  cashback_eta: {
    id: 'cashback_eta',
    nombre: '15 minutos o Cashback',
    descripcion: 'Rappi promete un tiempo de entrega en el botón Turbo de una ciudad. Si la orden llega tarde, el usuario recibe en Créditos un porcentaje de lo que pagó. No hay tienda aliada que fondee: el presupuesto lo pone Rappi.',
    modelo: 'cashback_eta',
    campos: CAMPOS_CASHBACK_ETA,
    camposPorTiendaEta: CAMPOS_POR_TIENDA_ETA,
    filtroDeEntrada: [],
    esPorEta: true,
  },
  promocao_br: {
    id: 'promocao_br',
    nombre: 'Promoção Brasil',
    descripcion: 'Descuento en porcentaje, envío gratis o tarifa de servicio gratis en una tienda aliada de Brasil. El usuario ve el beneficio aplicado al pagar, no recibe Créditos. Solo para Brasil.',
    modelo: 'promocao_br',
    campos: CAMPOS_BRASIL,
    filtroDeEntrada: [],
    esDeBrasil: true,
    // El documento va en portugues. Si la fila del pais no lo dice, no se
    // genera: sin esto salia un T&C en portugues con las fechas y los montos
    // en espanol, sin ningun error.
    idioma: 'pt',
  },
  cupom_br: {
    id: 'cupom_br',
    nombre: 'Cupom Brasil',
    descripcion: 'La Promoção de Brasil con un código: el usuario escribe el cupom antes de cerrar el pedido y recibe el descuento, el envío gratis o la tarifa de servicio gratis. Solo para Brasil.',
    modelo: 'cupom_br',
    campos: insertarDespuesDe(CAMPOS_BRASIL, 'beneficioBr', CAMPO_CODIGO_CUPOM_BR),
    filtroDeEntrada: [],
    esDeBrasil: true,
    // Igual que promocao_br: el documento va en portugues, y si la fila del
    // pais no lo dice, no se genera.
    idioma: 'pt',
  },
  cashback_day: {
    id: 'cashback_day',
    nombre: 'Cashback Multitienda',
    descripcion: 'Varias tiendas hacen cashback dentro de una misma jornada comercial. Cada tienda pone su porcentaje, su tope y su presupuesto, y cada una organiza lo suyo.',
    modelo: 'cashback_day',
    // No hay organizador unico: cada tienda organiza su propio beneficio.
    campos: unir(CAMPOS_COMUNES, CAMPOS_CREDITOS, CAMPOS_CASHBACK_DAY),
    camposPorTienda: CAMPOS_POR_TIENDA,
    filtroDeEntrada: [
      '¿Alguna tienda exige sus propios términos y condiciones?',
    ],
  },
};

/** Si un tipo hace esa pregunta. El ETA, por ejemplo, no pregunta la fecha de fin. */
function tieneCampo(esquema, id) {
  if (!esquema || !esquema.campos) return false;
  for (var i = 0; i < esquema.campos.length; i++) {
    if (esquema.campos[i].id === id) return true;
  }
  return false;
}

/** Devuelve el esquema de un tipo, o null. */
function esquemaDe(tipo) {
  return Object.prototype.hasOwnProperty.call(ESQUEMAS, tipo) ? ESQUEMAS[tipo] : null;
}

/** Resuelve un atributo que puede ser valor o funcion. */
function resolverAtributo(atributo, entrada, porDefecto) {
  if (atributo === undefined) return porDefecto;
  if (typeof atributo === 'function') return !!atributo(entrada);
  return !!atributo;
}

/** Campos visibles para una entrada concreta. */
function camposVisibles(tipo, entrada) {
  var esquema = esquemaDe(tipo);
  if (!esquema) return [];
  var visibles = [];
  for (var i = 0; i < esquema.campos.length; i++) {
    var campo = esquema.campos[i];
    if (resolverAtributo(campo.visible, entrada, true)) visibles.push(campo);
  }
  return visibles;
}

if (typeof module !== 'undefined') {
  module.exports = {
    ESQUEMAS: ESQUEMAS,
    CAMPOS_POR_TIENDA: CAMPOS_POR_TIENDA,
    CAMPOS_POR_TIENDA_ETA: CAMPOS_POR_TIENDA_ETA,
    CAMPOS_POR_TIENDA_CARRERA: CAMPOS_POR_TIENDA_CARRERA,
    OPCIONES_ALCANCE_TURBO: OPCIONES_ALCANCE_TURBO,
    CAMPOS_BRASIL: CAMPOS_BRASIL,
    CAMPOS_CASHBACK_ETA: CAMPOS_CASHBACK_ETA,
    OPCIONES_FORMA_DESCUENTO: OPCIONES_FORMA_DESCUENTO,
    CAMPOS_POR_PRODUCTO: CAMPOS_POR_PRODUCTO,
    categoriasDe: categoriasDe,
    hayAereasDeTravel: hayAereasDeTravel,
    hayAlojamientoDeTravel: hayAlojamientoDeTravel,
    hayAutosDeTravel: hayAutosDeTravel,
    esquemaDe: esquemaDe,
    tieneCampo: tieneCampo,
    camposVisibles: camposVisibles,
    resolverAtributo: resolverAtributo,
    siempre: siempre,
  };
}
