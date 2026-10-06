'use strict';

/**
 * Adaptador de DocumentApp.
 *
 * Recibe la estructura que arma src/core/documento.js y la traduce a llamadas
 * de Google. No decide nada: si algo se ve mal, el problema esta en la
 * estructura, que si se prueba en Node.
 *
 * Formato pedido por la especificacion 4.4: Arial 11, interlineado 1,15,
 * justificado; titulos centrados en negrita; vinetas como lista.
 */

var FUENTE = 'Arial';
var TAMANO = 11;
var INTERLINEADO = 1.15;

/** Escribe los tramos de un bloque respetando las negritas. */
function escribirPartes(parrafo, partes) {
  var texto = parrafo.editAsText();
  for (var i = 0; i < partes.length; i++) {
    var parte = partes[i];
    if (!parte.texto) continue;
    var desde = texto.getText().length;
    texto.appendText(parte.texto);
    texto.setBold(desde, texto.getText().length - 1, !!parte.negrita);
  }
  return parrafo;
}

function aplicarFormatoBase(elemento) {
  elemento.setFontFamily(FUENTE);
  elemento.setFontSize(TAMANO);
  elemento.setLineSpacing(INTERLINEADO);
}

/**
 * Construye el cuerpo del documento a partir de la estructura.
 * cuerpo: Body de DocumentApp. estructura: salida de estructuraDelDocumento().
 */
function escribirCuerpo(cuerpo, estructura) {
  cuerpo.clear();

  for (var i = 0; i < estructura.length; i++) {
    var bloque = estructura[i];

    if (bloque.tipo === 'vineta') {
      var vineta = cuerpo.appendListItem('');
      vineta.setGlyphType(DocumentApp.GlyphType.BULLET);
      escribirPartes(vineta, bloque.partes);
      aplicarFormatoBase(vineta);
      vineta.setAlignment(DocumentApp.HorizontalAlignment.JUSTIFY);
      continue;
    }

    var parrafo = cuerpo.appendParagraph('');
    escribirPartes(parrafo, bloque.partes);
    aplicarFormatoBase(parrafo);

    if (bloque.tipo === 'titulo' || bloque.tipo === 'subtitulo') {
      parrafo.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      parrafo.editAsText().setBold(true);
      if (bloque.tipo === 'titulo') parrafo.setFontSize(TAMANO + 3);
    } else {
      parrafo.setAlignment(DocumentApp.HorizontalAlignment.JUSTIFY);
    }
  }

  // El parrafo vacio que Google deja al principio sobra.
  if (cuerpo.getNumChildren() > 0) {
    var primero = cuerpo.getChild(0);
    if (primero.getType() === DocumentApp.ElementType.PARAGRAPH && primero.asParagraph().getText() === '') {
      cuerpo.removeChild(primero);
    }
  }
}

/**
 * Crea el documento, lo deja en la carpeta del pais y lo comparte como lector.
 * Devuelve { id, url }.
 */
function crearDocumento(titulo, estructura, carpeta, correoLector) {
  var documento = DocumentApp.create(titulo);
  escribirCuerpo(documento.getBody(), estructura);
  documento.saveAndClose();

  var archivo = DriveApp.getFileById(documento.getId());

  // Siempre a la carpeta del país, nunca a una carpeta general.
  if (carpeta) {
    if (typeof archivo.moveTo === 'function') {
      archivo.moveTo(carpeta);
    } else {
      carpeta.addFile(archivo);
      DriveApp.getRootFolder().removeFile(archivo);
    }
  }

  // Lector, y sin notificación de Drive: el aviso lo manda el correo de RappiMind.
  if (correoLector) {
    try {
      archivo.addViewer(correoLector);
    } catch (error) {
      // Si ya es lector o es el dueño, Drive se queja y no pasa nada.
    }
  }

  return { id: documento.getId(), url: documento.getUrl() };
}

/**
 * Manda a la papelera un documento que se acaba de crear.
 *
 * Se usa cuando la generacion se cae despues de crear el Doc: sin esto, el
 * documento se queda suelto en la carpeta del pais y la siguiente generacion
 * crea otro con el MISMO titulo y el MISMO identificador, porque el consecutivo
 * sale del Sheet y en el Sheet no quedo nada. Dos documentos identicos en la
 * carpeta, y nadie sabe cual es el bueno.
 *
 * A la papelera y no borrado: es reversible durante treinta dias, por si el
 * fallo fue de otra cosa. Y si tampoco se puede, no se tapa el fallo original:
 * esta funcion no lanza, devuelve si pudo.
 */
function descartarDocumento(id) {
  if (!id) return false;
  try {
    DriveApp.getFileById(id).setTrashed(true);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Los parrafos de un documento ya generado: [{ texto, centrado }].
 *
 * Es lo que la revision de lo publicado compara contra la pagina de
 * Squarespace. El centrado dice cual es la cabecera: titulo y subtitulo son
 * los unicos parrafos que escribirCuerpo centra.
 */
function parrafosDelDocumento_(idDocumento) {
  var parrafos = DocumentApp.openById(idDocumento).getBody().getParagraphs();
  var salida = [];
  for (var i = 0; i < parrafos.length; i++) {
    salida.push({
      texto: parrafos[i].getText(),
      centrado: parrafos[i].getAlignment() === DocumentApp.HorizontalAlignment.CENTER,
    });
  }
  return salida;
}

if (typeof module !== 'undefined') {
  module.exports = {
    parrafosDelDocumento_: parrafosDelDocumento_,
    descartarDocumento: descartarDocumento,
    escribirCuerpo: escribirCuerpo,
    escribirPartes: escribirPartes,
    crearDocumento: crearDocumento,
  };
}
