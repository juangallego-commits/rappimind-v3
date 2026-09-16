'use strict';

/**
 * Esquemas de los tipos de campana: pasos, campos, visibilidad y obligatoriedad.
 *
 * La interfaz se arma leyendo esto, no al reves: agregar un tipo nuevo no
 * deberia obligar a tocar el formulario (seccion 5 de la especificacion).
 *
 * "obligatorio" y "visible" pueden ser true/false o una funcion de la entrada.
 */

function siempre() {
  return true;
}

/** Campos comunes a los tres tipos (seccion 5.1). */
var CAMPOS_COMUNES = [
  { id: 'pais', etiqueta: 'País', tipo: 'lista', paso: 'campana', obligatorio: true },
  { id: 'tipo', etiqueta: 'Tipo de campaña', tipo: 'tarjetas', paso: 'campana', obligatorio: true },
  { id: 'nombreCampana', etiqueta: 'Nombre de la campaña', tipo: 'texto', maximo: 80, paso: 'campana', obligatorio: true },
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
  { id: 'compraMinima', etiqueta: 'Compra mínima', tipo: 'numero', paso: 'participantes', obligatorio: false },
  {
    id: 'declaracion',
    etiqueta: 'Confirmo que la información es veraz y corresponde a la campaña aprobada',
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
    id: 'condiciones',
    etiqueta: 'Condiciones adicionales',
    tipo: 'casillas',
    paso: 'beneficio',
    obligatorio: false,
    opciones: [
      { valor: 'turbo', etiqueta: 'Solo Turbo' },
      { valor: 'consumo_local', etiqueta: 'Solo consumo en el local' },
    ],
  },
];

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
    id: 'productosLista',
    etiqueta: 'Productos (separados por comas)',
    tipo: 'texto',
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
  { id: 'numeroGanadores', etiqueta: 'Número de ganadores', tipo: 'numero', minimo: 1, maximo: 100, paso: 'concurso', obligatorio: true },
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
    id: 'entregaPor',
    etiqueta: '¿Quién entrega el premio?',
    tipo: 'lista',
    paso: 'premio',
    obligatorio: true,
    opciones: [
      { valor: 'organizador', etiqueta: 'El Organizador' },
      { valor: 'rappi', etiqueta: 'Rappi como operador logístico' },
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
];

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
  { id: 'presupuesto', etiqueta: 'Presupuesto', tipo: 'numero', obligatorio: true },
];

function unir() {
  var todos = [];
  for (var i = 0; i < arguments.length; i++) {
    todos = todos.concat(arguments[i]);
  }
  return todos;
}

var ESQUEMAS = {
  cashback: {
    id: 'cashback',
    nombre: 'Cashback',
    descripcion: 'Una tienda devuelve un porcentaje del pedido en Créditos.',
    modelo: 'cashback',
    campos: unir(CAMPOS_COMUNES, CAMPOS_TIENDA_Y_ORGANIZADOR, CAMPOS_CREDITOS, [
      { id: 'presupuesto', etiqueta: 'Presupuesto total', tipo: 'numero', paso: 'beneficio', obligatorio: true },
    ]),
    filtroDeEntrada: [
      '¿La campaña la fondea Rappi y no una tienda o marca?',
      '¿La tienda o la marca exige sus propios términos y condiciones?',
    ],
  },
  carrera_compras: {
    id: 'carrera_compras',
    nombre: 'Carrera de Compras',
    descripcion: 'Gana quien más compre durante la vigencia.',
    modelo: 'carrera_compras',
    campos: unir(CAMPOS_COMUNES, CAMPOS_TIENDA_Y_ORGANIZADOR, CAMPOS_CARRERA),
    filtroDeEntrada: [
      '¿Hay azar (sorteo, rifa, raspa y gana)?',
      '¿Hay premios distintos por puesto o tabla de puntos?',
      '¿El premio es una boleta, una experiencia o está ligado a un evento?',
      '¿La tienda o la marca exige sus propios términos y condiciones?',
      '¿Participan varias tiendas?',
    ],
  },
  cashback_day: {
    id: 'cashback_day',
    nombre: 'Cashback Day',
    descripcion: 'Varias tiendas hacen cashback el mismo día, cada una con su presupuesto.',
    modelo: 'cashback_day',
    // No hay organizador unico: cada tienda organiza su propio beneficio.
    campos: unir(CAMPOS_COMUNES, CAMPOS_CREDITOS, CAMPOS_CASHBACK_DAY),
    camposPorTienda: CAMPOS_POR_TIENDA,
    filtroDeEntrada: [
      '¿La campaña la fondea Rappi y no las tiendas?',
      '¿Alguna tienda exige sus propios términos y condiciones?',
    ],
  },
};

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
    esquemaDe: esquemaDe,
    camposVisibles: camposVisibles,
    resolverAtributo: resolverAtributo,
    siempre: siempre,
  };
}
