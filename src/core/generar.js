'use strict';

/**
 * Punto de entrada del motor: valida y, solo si todo esta bien, renderiza.
 *
 * Es lo unico que necesita llamar el servidor (Apps Script) o la vista previa
 * del navegador. Si algo falta, devuelve la lista de errores y ningun texto:
 * el documento no se crea a medias.
 */

if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloEsquemas = require('./esquemas.js');
  var esquemaDe = moduloEsquemas.esquemaDe;

  var moduloValidaciones = require('./validaciones.js');
  var validarSolicitud = moduloValidaciones.validarSolicitud;

  var moduloMotor = require('./motor.js');
  var renderizar = moduloMotor.renderizar;

  var calcularDerivados = require('./derivados.js').calcularDerivados;
  var moduloLeyendas = require('./leyendas.js');
  var cargarCatalogo = moduloLeyendas.cargarCatalogo;
  var leyendasDeLaPieza = moduloLeyendas.leyendasDeLaPieza;
  var moduloDerivadosLeyendas = require('./derivados_leyendas.js');
  var calcularDerivadosDeLeyendas = moduloDerivadosLeyendas.calcularDerivadosDeLeyendas;
  var faltantesParaLaLeyenda = moduloDerivadosLeyendas.faltantesParaLaLeyenda;
  var esDeTurbo = moduloDerivadosLeyendas.esDeTurbo;
  var PENDIENTES_POR_MARCADOR = moduloDerivadosLeyendas.PENDIENTES_POR_MARCADOR;
  var conElIdiomaDeGenerar = require('./idiomas.js').conElIdiomaDe;
}

/**
 * entrada   hechos del formulario
 * pais      fila de data/paises.json
 * modelos   { modelos, bloques } (en Apps Script, la constante MODELOS)
 * contexto  { fechaReferencia, usuarioEnEquipo }
 *
 * Devuelve { valido, errores: [{campo, mensaje}], texto }.
 */
function generarTexto(entrada, pais, modelos, contexto) {
  var revision = validarSolicitud(entrada, pais, contexto);
  if (!revision.valido) {
    return { valido: false, errores: revision.errores, texto: '' };
  }

  var esquema = esquemaDe(entrada.tipo);
  var render = renderizar(esquema.modelo, entrada, pais, modelos);

  if (render.errores.length > 0) {
    var errores = [];
    for (var i = 0; i < render.errores.length; i++) {
      errores.push({ campo: 'documento', mensaje: render.errores[i] });
    }
    return { valido: false, errores: errores, texto: '' };
  }

  return { valido: true, errores: [], texto: render.texto };
}

/**
 * Las leyendas de las piezas publicitarias de esta campana, una por formato.
 *
 * Se entregan junto con el documento, en la pantalla final: el comercial copia
 * la que necesite segun el arte. No se le pregunta en que pieza va (seccion
 * 7B.4 de la respuesta del encargo 03).
 *
 * entrada    los mismos hechos con que se genero el documento
 * pais       fila de data/paises.json
 * textos     { id: texto } de modelos/leyendas/ (en Apps Script, LEYENDAS)
 * opciones   { nombreCampana, enlacePublicado }
 *
 * Devuelve { hay, leyendas, complementos, faltantes, errores }. "hay" es false
 * cuando este pais todavia no tiene leyenda de campana aprobada, que hoy es todo
 * pais distinto de Colombia.
 */
function generarLeyendasDeLaCampana(entrada, pais, textos, opciones) {
  var catalogo = cargarCatalogo(textos || {});
  var config = opciones || {};

  var faltantes = faltantesParaLaLeyenda(entrada, pais);
  if (faltantes.length > 0) {
    return { hay: false, leyendas: [], complementos: [], faltantes: faltantes, pendientes: [], errores: [] };
  }

  // Con el idioma del pais, igual que el documento: los numeros y las fechas de
  // la leyenda se escriben como los del T&C o se contradicen entre si.
  var armadas = conElIdiomaDeGenerar(pais, function () {
    var valores = calcularDerivadosDeLeyendas(
      entrada, pais, calcularDerivados(entrada, pais),
      { nombreCampana: config.nombreCampana, enlacePublicado: config.enlacePublicado }
    );
    return leyendasDeLaPieza(catalogo, pais.codigo, entrada.tipo, valores, {
      categoria: entrada.categoriaProducto,
      esDeTurbo: esDeTurbo(entrada),
    });
  });

  // Un marcador que espera una decision no es un defecto. La leyenda de push
  // necesita el enlace corto, que todavia no existe: si eso contara como error,
  // las otras cuatro leyendas de la campana se caerian con ella.
  var entregadas = [];
  var pendientes = [];
  var errores = armadas.errores.slice();

  for (var i = 0; i < armadas.leyendas.length; i++) {
    var armada = armadas.leyendas[i];
    var razones = [];
    var propios = [];

    for (var v = 0; v < (armada.vacios || []).length; v++) {
      var marcador = armada.vacios[v];
      if (PENDIENTES_POR_MARCADOR[marcador]) razones.push(PENDIENTES_POR_MARCADOR[marcador]);
      else propios.push(marcador);
    }

    if (razones.length > 0 && propios.length === 0) {
      pendientes.push({ formato: armada.formato, nombre: armada.nombre, razones: razones });
      continue;
    }
    for (var e = 0; e < armada.errores.length; e++) {
      errores.push(armada.id + ': ' + armada.errores[e]);
    }
    entregadas.push(armada);
  }

  return {
    hay: entregadas.length > 0,
    leyendas: entregadas,
    complementos: armadas.complementos,
    faltantes: [],
    pendientes: pendientes,
    errores: errores,
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    generarTexto: generarTexto,
    generarLeyendasDeLaCampana: generarLeyendasDeLaCampana,
  };
}
