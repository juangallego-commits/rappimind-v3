'use strict';

/**
 * Leyendas de piezas publicitarias: el texto legal que va dentro del arte.
 *
 * El T&C completo vive en una pagina de Squarespace. La pieza que el usuario ve
 * en la app lleva aparte un texto corto que tiene que decir lo mismo y remitir
 * al T&C. Ese texto es el que arma este archivo.
 *
 * Igual que los modelos, el texto legal es de Legal y vive en modelos/leyendas/.
 * Aqui no se escribe ni se "mejora" una sola frase: esto solo elige que leyenda
 * va, la llena con los mismos datos que llenaron el documento, y avisa si no
 * cabe en el formato.
 *
 * Tres cosas distintas al motor de documentos:
 *
 *   1. Hay un largo maximo. Una letra pequena que no cabe en el arte no se
 *      publica, asi que la leyenda se mide y, si se pasa, se recorta por un
 *      orden que Legal dejo marcado dentro del texto con [[R1]] … [[/R]].
 *      Lo que no esta marcado nunca sale.
 *   2. Hay complementos. Una pieza de licores o de medicamentos suma la leyenda
 *      de su categoria dentro de {{TEXTO_COMPLEMENTOS}}.
 *   3. Se entregan todos los formatos de una vez. No se le pregunta al comercial
 *      en que pieza va: se le dan las de apoyo, letra pequena, banner y push, y
 *      el copia la que necesita.
 *
 * Fuente del catalogo: docs/encargos/respuestas/03-leyendas.md, seccion 9.2.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloTextoLeyendas = require('./texto.js');
  var normalizarTexto = moduloTextoLeyendas.normalizarTexto;
  // comoLista es de paises.js. En Apps Script ya es global, y declararla otra
  // vez aqui la pisaria sin avisar: los archivos de src/core/ comparten ambito.
  var comoLista = require('./paises.js').comoLista;
}

/** Las llaves de %% que se leen como lista separada por comas. */
var LLAVES_DE_LISTA = ['pais', 'tipo_campana', 'tipo_pieza', 'origen', 'minimo_irreductible'];

/**
 * Los formatos de pieza que la herramienta entrega, en el orden en que se
 * muestran, con el largo que admite cada uno (seccion 7C de la respuesta).
 *
 * El largo es del formato y no de la leyenda. Una misma leyenda sirve para la
 * letra pequena y para el banner corto (Carrera y los dos de Travel), y esos dos
 * formatos no admiten lo mismo: 620 contra 300. Con un solo numero por leyenda,
 * un banner de Carrera se habria dado por bueno con 620 caracteres.
 */
var TIPOS_DE_PIEZA = [
  { id: 'texto_apoyo', nombre: 'Texto de apoyo', largo_max: 350 },
  { id: 'letra_pequena', nombre: 'Letra pequeña', largo_max: 620 },
  { id: 'banner_corto', nombre: 'Banner corto', largo_max: 300 },
  { id: 'exterior', nombre: 'Valla, exterior e impresos', largo_max: 300 },
  { id: 'push_sms', nombre: 'Push y SMS', largo_max: 70 },
];

/**
 * Como llega cada complemento a la pieza.
 *
 * "pregunta" es la unica que le cuesta algo al comercial: la categoria del
 * producto. "condicion_turbo" sale de algo que ya se pregunta, asi que no se
 * vuelve a preguntar. "ninguna_parte_todavia" son leyendas reales de un playbook
 * que estan en el catalogo pero que la herramienta no alcanza hoy: apuestas y
 * Mundial se escalan a Legal, y awareness y promociones son tipos de campana que
 * v3 no genera.
 */
var FORMAS_DE_ELEGIR = ['pregunta', 'condicion_turbo', 'ninguna_parte_todavia'];

/**
 * Las categorias cuya pieza tiene que mostrar el registro sanitario.
 *
 * Legal CO lo pide para medicamentos y fitoterapeuticos (diapositiva 10). Sin el
 * registro la pieza no se puede publicar, asi que la pregunta aparece sola y,
 * mientras no se responda, no hay leyenda.
 *
 * Viven aqui, con el catalogo, y no en los esquemas: son categorias del
 * catalogo, y asi la pregunta y la leyenda las leen del mismo sitio.
 */
var CATEGORIAS_CON_REGISTRO = ['medicamento', 'medicamentos_varios', 'fitoterapeutico_pfm', 'fitoterapeutico_pft'];

/** Solo los medicamentos llevan ademas el numero de notificacion ante el INVIMA. */
var CATEGORIAS_CON_INVIMA = ['medicamento', 'medicamentos_varios'];

function categoriaPideRegistro(categoria) {
  return CATEGORIAS_CON_REGISTRO.indexOf(String(categoria || '')) !== -1;
}

function categoriaPideInvima(categoria) {
  return CATEGORIAS_CON_INVIMA.indexOf(String(categoria || '')) !== -1;
}

/** Lo que nunca puede quedar dentro de una leyenda entregada. */
var MARCAS_SIN_RESOLVER_EN_LEYENDA = /\{\{|\}\}|\[\[|\]\]/;

/**
 * Frases rotas. Las mismas del motor de documentos, menos la vineta, que en una
 * leyenda no existe.
 */
var SENALES_DE_LEYENDA_ROTA = [
  { nombre: 'un espacio antes de una coma', patron: / ,/ },
  { nombre: 'un espacio antes de un punto', patron: / \./ },
  { nombre: 'dos puntos seguidos', patron: /(^|[^.])\.\.(?!\.)/ },
  { nombre: 'un paréntesis vacío', patron: /\(\s*\)/ },
  { nombre: 'una coma seguida de un punto', patron: /, \./ },
];

// --- Leer el catalogo ------------------------------------------------------

/**
 * Convierte el archivo de una leyenda en un objeto.
 *
 * Las lineas %% de arriba son la ficha; lo que sigue es el texto legal, que se
 * deja tal cual vino de Legal.
 */
function leyendaDesdeTexto(texto) {
  var normalizado = normalizarTexto(texto);

  var lineas = normalizado.split('\n');
  var ficha = {};
  var cuerpo = [];

  for (var i = 0; i < lineas.length; i++) {
    var linea = lineas[i];
    if (linea.indexOf('%% ') === 0) {
      var resto = linea.slice(3);
      var corte = resto.indexOf(':');
      if (corte === -1) continue;
      ficha[resto.slice(0, corte).trim()] = resto.slice(corte + 1).trim();
      continue;
    }
    cuerpo.push(linea);
  }

  var leyenda = {
    id: ficha.id || '',
    categoria: ficha.categoria || '',
    categoria_id: ficha.categoria_id || '',
    se_elige_en: ficha.se_elige_en || '',
    fuente: ficha.fuente || '',
    largo_max: Number(ficha.largo_max || 0),
    cuerpo: cuerpo.join('\n').trim(),
  };
  for (var l = 0; l < LLAVES_DE_LISTA.length; l++) {
    leyenda[LLAVES_DE_LISTA[l]] = comoLista(ficha[LLAVES_DE_LISTA[l]]);
  }
  return leyenda;
}

/** De { id: texto } a { id: leyenda }, que es con lo que trabaja todo lo demas. */
function cargarCatalogo(textos) {
  var catalogo = {};
  for (var nombre in textos) {
    if (!Object.prototype.hasOwnProperty.call(textos, nombre)) continue;
    var leyenda = leyendaDesdeTexto(textos[nombre]);
    if (leyenda.id) catalogo[leyenda.id] = leyenda;
  }
  return catalogo;
}

function comoLeyendas(catalogo) {
  var lista = [];
  for (var id in catalogo) {
    if (Object.prototype.hasOwnProperty.call(catalogo, id)) lista.push(catalogo[id]);
  }
  lista.sort(function (a, b) { return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0); });
  return lista;
}

/**
 * El catalogo cargado, para quien no lo puede recibir por parametro.
 *
 * Lo necesitan dos cosas que corren lejos de aqui: la pregunta de la categoria
 * del producto, que solo se muestra si el pais tiene categorias, y la lista de
 * opciones de esa pregunta. Las dos viven en src/core/esquemas.js, que recibe
 * solo la entrada del formulario.
 *
 * En Apps Script y en el navegador, LEYENDAS ya es una constante global que
 * escribe el build. En Node no hay global que valga, asi que quien corre las
 * pruebas llama a usarCatalogo() una vez. Si nadie lo hizo, el catalogo esta
 * vacio y la pregunta no se muestra, que es preferible a mostrarla sin opciones.
 */
var catalogoEnMemoria = null;

function usarCatalogo(textos) {
  catalogoEnMemoria = cargarCatalogo(textos || {});
  return catalogoEnMemoria;
}

function catalogoActual() {
  if (catalogoEnMemoria) return catalogoEnMemoria;
  if (typeof LEYENDAS !== 'undefined') catalogoEnMemoria = cargarCatalogo(LEYENDAS);
  return catalogoEnMemoria || {};
}

/** Las categorias que este pais puede ofrecer, sin pasar el catalogo. */
function categoriasDeProducto(codigoPais) {
  return categoriasDelPais(catalogoActual(), codigoPais);
}

/** Si este pais tiene alguna leyenda de campana que entregar. */
function hayLeyendasDeCampana(codigoPais, tipo) {
  return leyendasDeLaCampana(catalogoActual(), codigoPais, tipo).length > 0;
}

function aplicaAlPais(leyenda, codigoPais) {
  return leyenda.pais.indexOf(String(codigoPais || '').toUpperCase()) !== -1;
}

function aplicaAlTipo(leyenda, tipo) {
  return leyenda.tipo_campana.indexOf('todas') !== -1 || leyenda.tipo_campana.indexOf(tipo) !== -1;
}

function esComplemento(leyenda) {
  return leyenda.tipo_pieza.indexOf('complemento') !== -1;
}

// --- Elegir que va ---------------------------------------------------------

/**
 * Las categorias de producto que este pais puede ofrecer, sacadas del catalogo.
 *
 * Salen de las leyendas que existen, no de una lista escrita a mano: agregar la
 * leyenda de una categoria nueva la pone sola en la pregunta, y una categoria
 * sin leyenda no se puede elegir, que es lo correcto porque no tendria nada que
 * imprimir. Colombia ofrece diez; Mexico, cinco; Chile, una.
 */
function categoriasDelPais(catalogo, codigoPais) {
  var vistas = {};
  var opciones = [];
  var leyendas = comoLeyendas(catalogo);
  for (var i = 0; i < leyendas.length; i++) {
    var leyenda = leyendas[i];
    if (leyenda.se_elige_en !== 'pregunta') continue;
    if (!aplicaAlPais(leyenda, codigoPais)) continue;
    if (vistas[leyenda.categoria_id]) continue;
    vistas[leyenda.categoria_id] = true;
    opciones.push({
      valor: leyenda.categoria_id,
      etiqueta: leyenda.categoria,
      leyenda: leyenda.id,
      // El principio de la advertencia que se va a imprimir. Sin esto las diez
      // opciones decian lo mismo debajo y el comercial elegia a ciegas.
      adelanto: adelantoDe(leyenda.cuerpo),
    });
  }
  // Por como se lee la etiqueta, no por el identificador: la lista la recorre
  // una persona buscando su producto, no el catalogo.
  opciones.sort(function (a, b) { return a.etiqueta.localeCompare(b.etiqueta, 'es'); });
  return opciones;
}

/** Las primeras palabras de una leyenda, para mostrarlas sin ocupar tres lineas. */
function adelantoDe(cuerpo) {
  var limpio = String(cuerpo || '').replace(/\[\[[^\]]*\]\]/g, '').replace(/\{\{\w+\}\}/g, '').replace(/\s+/g, ' ').trim();
  if (limpio.length <= 64) return limpio;
  var corte = limpio.slice(0, 64);
  var espacio = corte.lastIndexOf(' ');
  return (espacio > 30 ? corte.slice(0, espacio) : corte) + '…';
}

/**
 * Los complementos que se pegan a la pieza, en el orden del catalogo: primero
 * Turbo y despues la categoria (seccion 7A de la respuesta).
 *
 * Turbo no se pregunta: sale de la condicion que el comercial ya respondio.
 */
function complementosQueAplican(catalogo, codigoPais, categoriaId, esDeTurbo) {
  var elegidos = [];
  var leyendas = comoLeyendas(catalogo);

  for (var t = 0; t < leyendas.length && esDeTurbo; t++) {
    if (leyendas[t].se_elige_en === 'condicion_turbo' && aplicaAlPais(leyendas[t], codigoPais)) {
      elegidos.push(leyendas[t]);
      break;
    }
  }

  if (categoriaId && categoriaId !== 'ninguna') {
    for (var c = 0; c < leyendas.length; c++) {
      if (leyendas[c].se_elige_en !== 'pregunta') continue;
      if (leyendas[c].categoria_id !== categoriaId) continue;
      if (!aplicaAlPais(leyendas[c], codigoPais)) continue;
      elegidos.push(leyendas[c]);
      break;
    }
  }

  return elegidos;
}

/**
 * Las leyendas de campana de este pais y este tipo, una por formato de pieza.
 *
 * Una misma leyenda puede servir para dos formatos (la de banner sirve tambien
 * para exterior), asi que se devuelve por formato y no por leyenda.
 */
function leyendasDeLaCampana(catalogo, codigoPais, tipo) {
  var porFormato = [];
  var leyendas = comoLeyendas(catalogo);

  for (var f = 0; f < TIPOS_DE_PIEZA.length; f++) {
    var formato = TIPOS_DE_PIEZA[f];
    for (var i = 0; i < leyendas.length; i++) {
      var leyenda = leyendas[i];
      if (esComplemento(leyenda)) continue;
      if (!aplicaAlPais(leyenda, codigoPais)) continue;
      if (!aplicaAlTipo(leyenda, tipo)) continue;
      if (leyenda.tipo_pieza.indexOf(formato.id) === -1) continue;
      porFormato.push({
        formato: formato.id, nombre: formato.nombre,
        largo_max: formato.largo_max, leyenda: leyenda,
      });
      break;
    }
  }
  return porFormato;
}

// --- Armar el texto --------------------------------------------------------

/**
 * Quita los tramos recortables hasta el nivel pedido.
 *
 * Nivel 0 no quita nada. Nivel 1 quita [[R1]], nivel 2 quita ademas [[R2]], y
 * asi. El numero es el orden en que Legal decidio que sale cada tramo, y vive
 * dentro del texto legal justamente para que se pueda revisar sin leer codigo.
 */
function aplicarRecorte(texto, nivel) {
  return texto.replace(/\[\[R(\d+)\]\]([\s\S]*?)\[\[\/R\]\]/g, function (todo, numero, cuerpo) {
    return Number(numero) <= nivel ? '' : cuerpo;
  });
}

/** Los niveles de recorte que este texto tiene marcados, de menor a mayor. */
function nivelesDeRecorte(texto) {
  var niveles = [];
  var patron = /\[\[R(\d+)\]\]/g;
  var encontrado;
  while ((encontrado = patron.exec(texto)) !== null) {
    var numero = Number(encontrado[1]);
    if (niveles.indexOf(numero) === -1) niveles.push(numero);
  }
  niveles.sort(function (a, b) { return a - b; });
  return niveles;
}

function resolverOpcionalesDeLeyenda(texto, valores) {
  return texto.replace(/\[\[\?(\w+)\]\]([\s\S]*?)\[\[\/\?\]\]/g, function (todo, llave, cuerpo) {
    return valores[llave] ? cuerpo : '';
  });
}

/**
 * Reemplaza los marcadores y anota los que quedaron vacios.
 *
 * El punto de una abreviatura es tambien el punto de la frase. Sin esto, una
 * razon social como "Operador de Prueba S.A.S." dentro de "Cashback ofrecido por
 * {{TIENDA}}." salia con dos puntos seguidos, que es una de las senales de texto
 * roto: la leyenda entera se caia. Paso de verdad con el caso dorado TV05.
 */
function reemplazarEnLeyenda(texto, valores) {
  var vacios = [];
  var resultado = texto.replace(/\{\{(\w+)\}\}/g, function (todo, llave, posicion) {
    var valor = valores[llave];
    if (valor === undefined || valor === null || valor === '') {
      if (vacios.indexOf(llave) === -1) vacios.push(llave);
      return '';
    }
    var escrito = String(valor);
    var siguiente = texto.charAt(posicion + todo.length);
    if (siguiente === '.' && escrito.charAt(escrito.length - 1) === '.') {
      return escrito.slice(0, -1);
    }
    return escrito;
  });
  return { texto: resultado, vacios: vacios };
}

/** Une los espacios que deja un tramo recortado. La leyenda va en una linea. */
function apretar(texto) {
  return texto.replace(/\s+/g, ' ').trim();
}

function senalesDeLeyendaRota(texto) {
  var encontradas = [];
  for (var i = 0; i < SENALES_DE_LEYENDA_ROTA.length; i++) {
    if (SENALES_DE_LEYENDA_ROTA[i].patron.test(texto)) encontradas.push(SENALES_DE_LEYENDA_ROTA[i].nombre);
  }
  return encontradas;
}

/** Un paso del render, sin recortar: opcionales, placeholders y apretar. */
function renderDeUnNivel(cuerpo, valores, nivel) {
  var texto = aplicarRecorte(cuerpo, nivel);
  texto = resolverOpcionalesDeLeyenda(texto, valores);
  var reemplazo = reemplazarEnLeyenda(texto, valores);
  return { texto: apretar(reemplazo.texto), vacios: reemplazo.vacios };
}

/**
 * Arma una leyenda con los datos de la campana.
 *
 * Devuelve el texto, cuanto mide, si cabe, cuanto hubo que recortar y que se
 * quedo por fuera. Si no cabe ni con el ultimo nivel, se devuelve igual con
 * cabe: false, porque el comercial tiene que verlo antes de que alguien diseñe
 * la pieza (seccion 7D de la respuesta). Lo que nunca se devuelve es una
 * leyenda con un hueco: eso es un error, como en el documento.
 */
function armarLeyenda(leyenda, valores, largoDelFormato) {
  var limite = largoDelFormato || leyenda.largo_max;
  var niveles = [0].concat(nivelesDeRecorte(leyenda.cuerpo));
  var elegido = null;

  for (var i = 0; i < niveles.length; i++) {
    var intento = renderDeUnNivel(leyenda.cuerpo, valores, niveles[i]);
    elegido = { nivel: niveles[i], texto: intento.texto, vacios: intento.vacios };
    if (!limite || intento.texto.length <= limite) break;
  }

  var errores = [];
  for (var v = 0; v < elegido.vacios.length; v++) {
    errores.push('Falta un dato: la leyenda necesita "' + elegido.vacios[v] + '" y quedó vacío.');
  }
  if (MARCAS_SIN_RESOLVER_EN_LEYENDA.test(elegido.texto)) {
    errores.push('Quedaron marcas sin resolver en la leyenda.');
  }
  var senales = senalesDeLeyendaRota(elegido.texto);
  for (var s = 0; s < senales.length; s++) {
    errores.push('El texto quedó roto: hay ' + senales[s] + '.');
  }

  return {
    id: leyenda.id,
    texto: elegido.texto,
    largo: elegido.texto.length,
    largo_max: limite,
    cabe: !limite || elegido.texto.length <= limite,
    nivel: elegido.nivel,
    recortada: elegido.nivel > 0,
    vacios: elegido.vacios,
    errores: errores,
  };
}

/**
 * El texto de los complementos, listo para entrar en {{TEXTO_COMPLEMENTOS}}.
 *
 * Es un fragmento: cada complemento trae su propia puntuacion, y algunos del SSL
 * van a proposito sin punto final. Aqui solo se unen con un espacio.
 */
function textoDeComplementos(complementos, valores) {
  var partes = [];
  var errores = [];
  for (var i = 0; i < complementos.length; i++) {
    var armada = armarLeyenda(complementos[i], valores);
    for (var e = 0; e < armada.errores.length; e++) {
      errores.push(complementos[i].id + ': ' + armada.errores[e]);
    }
    if (armada.texto) partes.push(armada.texto);
  }
  return { texto: partes.join(' '), errores: errores };
}

/**
 * Todo lo que la herramienta entrega al final: una leyenda por formato de pieza.
 *
 * El comercial copia la que necesite. No se le pregunta en que pieza va a salir
 * (seccion 7B.4): preguntarlo seria una pregunta mas para un dato que el ya sabe
 * y que la herramienta no necesita para nada mas.
 */
function leyendasDeLaPieza(catalogo, codigoPais, tipo, valores, opciones) {
  var config = opciones || {};
  var complementos = complementosQueAplican(catalogo, codigoPais, config.categoria, config.esDeTurbo);
  var deComplementos = textoDeComplementos(complementos, valores);

  var conComplementos = {};
  for (var llave in valores) {
    if (Object.prototype.hasOwnProperty.call(valores, llave)) conComplementos[llave] = valores[llave];
  }
  conComplementos.TEXTO_COMPLEMENTOS = deComplementos.texto;

  var salida = [];
  var deLaCampana = leyendasDeLaCampana(catalogo, codigoPais, tipo);
  for (var i = 0; i < deLaCampana.length; i++) {
    var armada = armarLeyenda(deLaCampana[i].leyenda, conComplementos, deLaCampana[i].largo_max);
    armada.formato = deLaCampana[i].formato;
    armada.nombre = deLaCampana[i].nombre;
    salida.push(armada);
  }

  return {
    leyendas: salida,
    complementos: complementos.map(function (c) { return c.id; }),
    errores: deComplementos.errores,
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    TIPOS_DE_PIEZA: TIPOS_DE_PIEZA,
    FORMAS_DE_ELEGIR: FORMAS_DE_ELEGIR,
    leyendaDesdeTexto: leyendaDesdeTexto,
    cargarCatalogo: cargarCatalogo,
    usarCatalogo: usarCatalogo,
    catalogoActual: catalogoActual,
    categoriasDeProducto: categoriasDeProducto,
    categoriaPideRegistro: categoriaPideRegistro,
    categoriaPideInvima: categoriaPideInvima,
    CATEGORIAS_CON_REGISTRO: CATEGORIAS_CON_REGISTRO,
    CATEGORIAS_CON_INVIMA: CATEGORIAS_CON_INVIMA,
    hayLeyendasDeCampana: hayLeyendasDeCampana,
    categoriasDelPais: categoriasDelPais,
    complementosQueAplican: complementosQueAplican,
    leyendasDeLaCampana: leyendasDeLaCampana,
    leyendasDeLaPieza: leyendasDeLaPieza,
    armarLeyenda: armarLeyenda,
    textoDeComplementos: textoDeComplementos,
    aplicarRecorte: aplicarRecorte,
    nivelesDeRecorte: nivelesDeRecorte,
  };
}
