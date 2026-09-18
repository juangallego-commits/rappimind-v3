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
  var categoriaPideRegistro = moduloLeyendasEsquemas.categoriaPideRegistro;
  var categoriaPideInvima = moduloLeyendasEsquemas.categoriaPideInvima;
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
  { id: 'compraMinima', etiqueta: 'Compra mínima', tipo: 'numero', paso: 'participantes', obligatorio: false },
  // La pieza publicitaria. Estas tres no cambian una coma del T&C: deciden la
  // leyenda que va dentro del arte, que hasta ahora el comercial le pedia a
  // Legal por correo. Por eso van en su propio paso, al final.
  {
    id: 'categoriaProducto',
    etiqueta: 'Categoría del producto',
    tipo: 'lista',
    paso: 'pieza',
    porDefecto: 'ninguna',
    // Ninguna de las tres puede bloquear el documento: el T&C no las usa para
    // nada. Lo que bloquean es la leyenda de la pieza, y eso lo dice
    // faltantesParaLaLeyenda con su razon. Un comercial que solo quiere su T&C
    // no se puede quedar sin el por una pregunta del arte.
    obligatorio: false,
    // Solo donde hay algo que imprimir. Un pais sin leyenda de campana no tiene
    // donde pegar el complemento, y uno sin categorias no tiene que ofrecer.
    visible: function (entrada) {
      return hayLeyendasDeCampana(entrada.pais, entrada.tipo) &&
        categoriasDeProducto(entrada.pais).length > 0;
    },
  },
  {
    id: 'registroSanitario',
    etiqueta: 'Registro sanitario',
    tipo: 'texto',
    paso: 'pieza',
    visible: function (entrada) { return categoriaPideRegistro(entrada.categoriaProducto); },
    obligatorio: false,
  },
  {
    id: 'notificacionInvima',
    etiqueta: 'Notificación ante el INVIMA',
    tipo: 'texto',
    paso: 'pieza',
    visible: function (entrada) { return categoriaPideInvima(entrada.categoriaProducto); },
    obligatorio: false,
  },
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

/** Inserta un campo justo despues de otro, por identificador. */
function insertarDespuesDe(campos, id, nuevo) {
  var salida = [];
  for (var i = 0; i < campos.length; i++) {
    salida.push(campos[i]);
    if (campos[i].id === id) salida.push(nuevo);
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
  { id: 'marcaAliado', etiqueta: 'Marca aliada', tipo: 'texto', paso: 'organizador', obligatorio: false },

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
    paso: 'beneficio',
    visible: function (entrada) { return entrada.formaBeneficio === 'monto_fijo'; },
    obligatorio: function (entrada) { return entrada.formaBeneficio === 'monto_fijo'; },
  },
  { id: 'limitePorUsuario', etiqueta: 'Órdenes con beneficio por persona', tipo: 'numero', minimo: 1, paso: 'beneficio', obligatorio: true },
  { id: 'presupuesto', etiqueta: 'Presupuesto total', tipo: 'numero', paso: 'beneficio', obligatorio: true },
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
    // La taxa de servico no lleva tope en ninguno de los documentos aprobados.
    visible: llevaTopeBr,
    obligatorio: false,
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

  { id: 'fechaInicio', etiqueta: 'Fecha de la campaña', tipo: 'fecha', paso: 'vigencia', obligatorio: true },
  { id: 'horaInicio', etiqueta: 'Hora de inicio', tipo: 'hora', paso: 'vigencia', obligatorio: true },
  { id: 'horaFin', etiqueta: 'Hora de fin', tipo: 'hora', paso: 'vigencia', obligatorio: true },

  { id: 'etaMinutos', etiqueta: 'Minutos del ETA', tipo: 'numero', minimo: 1, maximo: 240, paso: 'beneficio', obligatorio: true },
  { id: 'porcentaje', etiqueta: 'Porcentaje que se devuelve', tipo: 'numero', paso: 'beneficio', obligatorio: true },
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
      unir(CAMPOS_COMUNES, CAMPOS_TIENDA_Y_ORGANIZADOR, CAMPOS_CREDITOS),
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
    campos: unir(CAMPOS_COMUNES, CAMPOS_TIENDA_Y_ORGANIZADOR, CAMPOS_CARRERA),
    filtroDeEntrada: [
      '¿Hay azar (sorteo, rifa, raspa y gana)?',
      '¿Hay premios distintos por puesto o tabla de puntos?',
      '¿El premio es una boleta, una experiencia o está ligado a un evento?',
      '¿La tienda o la marca exige sus propios T&C?',
      '¿Participan varias tiendas?',
    ],
  },
  cashback_travel: {
    id: 'cashback_travel',
    nombre: 'Cashback Travel',
    descripcion: 'La marca aliada devuelve un porcentaje de lo que el usuario pagó por su vuelo, hotel, auto o paquete, en Créditos para su Billetera.',
    modelo: 'cashback_travel',
    campos: unir(CAMPOS_TRAVEL_COMUNES, CAMPOS_CASHBACK_TRAVEL),
    // El filtro de Travel reemplaza al general: ver docs/MODELO_BASE_TRAVEL.md,
    // seccion 11. Vive en FILTRO_DE_TRAVEL, no aqui, porque son nueve preguntas
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
    CAMPOS_BRASIL: CAMPOS_BRASIL,
    CAMPOS_CASHBACK_ETA: CAMPOS_CASHBACK_ETA,
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
