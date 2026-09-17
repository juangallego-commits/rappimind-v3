'use strict';

/**
 * La hoja: el T&C que se va llenando mientras el comercial responde.
 *
 * Es el elemento protagonista de la interfaz. Usa el mismo motor de src/core
 * que genera el documento de verdad, asi que lo que se ve aqui es literalmente
 * lo que va a salir.
 *
 * Todo dato del usuario entra como texto, nunca como HTML.
 */

var RM = window.RM;
var crear = RM.util.crear;
var vaciar = RM.util.vaciar;

/** Convierte una linea con marcas ** en nodos, respetando las negritas. */
function nodosConNegritas(texto, destino) {
  var partes = String(texto).split('**');
  for (var i = 0; i < partes.length; i++) {
    if (!partes[i]) continue;
    if (i % 2 === 1 && i < partes.length - (partes.length % 2 === 0 ? 1 : 0)) {
      destino.appendChild(crear('strong', { texto: partes[i] }));
    } else {
      destino.appendChild(document.createTextNode(partes[i]));
    }
  }
}

/** El tipo de bloque de una linea del texto renderizado. */
function claseDeLinea(linea) {
  if (linea.indexOf('## ') === 0) return { clase: 'doc-subtitulo', desde: 3 };
  if (linea.indexOf('# ') === 0) return { clase: 'doc-titulo', desde: 2 };
  if (linea.indexOf('• ') === 0) return { clase: 'doc-vineta', desde: 2 };
  if (/^\*\*\d+\.\s/.test(linea)) return { clase: 'doc-clausula', desde: 0 };
  return { clase: 'doc-parrafo', desde: 0 };
}

/**
 * Dibuja el documento.
 *
 * texto: salida de renderizarVistaPrevia (puede traer huecos marcados)
 * anterior: el texto de la vez pasada, para saber que cambio y resaltarlo
 */
function dibujar(contenedor, texto, anterior) {
  vaciar(contenedor);

  if (!texto) {
    contenedor.appendChild(crear('p', {
      clase: 'hoja-vacia',
      texto: RM.estado.T('Tu documento aparece aquí y se va llenando mientras respondes.'),
    }));
    return null;
  }

  var lineas = texto.split('\n');
  var lineasAnteriores = (anterior || '').split('\n');
  var primeraCambiada = null;

  for (var i = 0; i < lineas.length; i++) {
    var linea = lineas[i];
    var forma = claseDeLinea(linea);
    var contenido = linea.slice(forma.desde);
    var parrafo = crear('p', { clase: forma.clase });

    // Cambió esta línea respecto al render anterior. Solo se marca si antes
    // había algo: la primera vez no se resalta el documento entero.
    var cambio = anterior && lineasAnteriores[i] !== linea;

    var tramos = tramosDeVistaPrevia(contenido);
    for (var t = 0; t < tramos.length; t++) {
      var tramo = tramos[t];

      if (tramo.tipo === 'hueco') {
        parrafo.appendChild(crear('span', {
          clase: 'falta',
          texto: 'falta ' + nombreDelHueco(tramo.valor),
          'data-hueco': tramo.valor,
        }));
        continue;
      }

      if (cambio) {
        var resaltado = crear('mark');
        nodosConNegritas(tramo.valor, resaltado);
        parrafo.appendChild(resaltado);
      } else {
        nodosConNegritas(tramo.valor, parrafo);
      }
    }

    if (cambio && primeraCambiada === null) {
      parrafo.setAttribute('data-cambio', '1');
      primeraCambiada = parrafo;
    }
    contenedor.appendChild(parrafo);
  }

  return primeraCambiada;
}

/** Lleva la hoja hasta la frase que acaba de cambiar. */
function desplazarHasta(contenedor, parrafo) {
  if (!parrafo) return;
  var arriba = parrafo.offsetTop - contenedor.offsetTop - 60;
  if (typeof contenedor.scrollTo === 'function') {
    contenedor.scrollTo({ top: Math.max(0, arriba), behavior: 'smooth' });
  } else {
    contenedor.scrollTop = Math.max(0, arriba);
  }
}

RM.documento = {
  dibujar: dibujar,
  desplazarHasta: desplazarHasta,
  claseDeLinea: claseDeLinea,
};
