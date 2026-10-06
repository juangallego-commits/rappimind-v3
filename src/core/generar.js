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
  var reglasDelArte = moduloDerivadosLeyendas.reglasDelArte;
  var PENDIENTES_POR_MARCADOR = moduloDerivadosLeyendas.PENDIENTES_POR_MARCADOR;
  var conElIdiomaDe = require('./idiomas.js').conElIdiomaDe;
  var urlDelTcDeLaCampana = moduloDerivadosLeyendas.urlDelTcDeLaCampana;
  var moduloTextoGenerar = require('./texto.js');
  var tieneValor = moduloTextoGenerar.tieneValor;
  var limpiarEspacios = moduloTextoGenerar.limpiarEspacios;
  var nombreDelHueco = require('./preguntas.js').nombreDelHueco;
  var listaY = require('./fechas.js').listaY;
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
  // Los espacios de sobra de las respuestas no cambian lo que dicen, y sin
  // quitarlos la red del motor frenaba el documento por "dos espacios
  // seguidos". Se limpia aqui, en el unico sitio por donde pasan todos los
  // caminos (vista previa, generar y ampliar); el servidor ademas limpia al
  // recibir, para que el nombre y lo que se guarda salgan igual.
  entrada = limpiarEspacios(entrada);

  var revision = validarSolicitud(entrada, pais, contexto);
  if (!revision.valido) {
    return { valido: false, errores: revision.errores, texto: '' };
  }

  var esquema = esquemaDe(entrada.tipo);
  var render = renderizar(esquema.modelo, entrada, pais, modelos);

  if (render.errores.length > 0) {
    var errores = [];

    /*
     * Un hueco se cuenta con las palabras de la pantalla, no con el marcador.
     *
     * El motor no conoce las preguntas, asi que su mensaje nombra el marcador
     * del modelo: "el documento necesita "TEXTO_TERRITORIO" y quedo vacio". El
     * comercial no ha visto esa palabra nunca y no tiene donde corregirla.
     * nombreDelHueco() ya traducia los 105 marcadores para la vista previa, y
     * aqui no se estaba usando.
     *
     * Se junta en un solo mensaje porque los huecos suelen venir de la misma
     * respuesta que falta, y una lista de seis errores no ayuda mas que uno.
     */
    if (render.placeholdersVacios.length > 0) {
      var nombres = [];
      for (var h = 0; h < render.placeholdersVacios.length; h++) {
        var nombre = nombreDelHueco(render.placeholdersVacios[h]);
        if (nombres.indexOf(nombre) === -1) nombres.push(nombre);
      }
      /*
       * No se dice de quien es el dato que falta.
       *
       * Unos huecos vienen de una respuesta del comercial y otros de la pestana
       * Paises, y distinguirlos desde aqui pedia una lista escrita a mano de
       * que marcador es de que columna, justo lo que este repositorio evita.
       * Asi que el aviso nombra el dato en palabras y deja las dos salidas
       * abiertas, que es lo que el comercial necesita para no quedarse quieto.
       */
      errores.push({
        campo: 'documento',
        mensaje: 'Al documento le falta ' + conElIdiomaDe(pais, function () { return listaY(nombres); }) +
          '. Si es una respuesta tuya, revísala; si no la encuentras en el formulario, ' +
          'es un dato de la configuración del país y te lo completa Legal.',
      });
    }

    for (var i = 0; i < render.errores.length; i++) {
      // Los mensajes de los huecos ya salieron arriba, con sus palabras.
      if (render.errores[i].indexOf('Falta un dato:') === 0) continue;
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
 * opciones   { nombreCampana, enlacePublicado, enlacePrevisto }
 *
 * enlacePrevisto manda sobre el que se arma con la ruta de Squarespace del
 * pais. Desde que RappiMind publica sola (src/core/publicacion_web.js) el
 * enlace de la campana es el del visor, promos.rappi.com/tyc?co/..., y no el
 * de un evento: sin esto la leyenda salia con la direccion vieja, y al
 * confirmar el enlace la pantalla decia que la leyenda habia cambiado.
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
      return {
      hay: false, leyendas: [], complementos: [], faltantes: faltantes, pendientes: [], errores: [],
      reglasDelArte: [],
      enlacePrevisto: '', enlaceUsado: '', enlaceConfirmado: false, enlaceCambio: false,
    };
  }

  // Con el idioma del pais, igual que el documento: los numeros y las fechas de
  // la leyenda se escriben como los del T&C o se contradicen entre si.
  var previstoPropio = tieneValor(config.enlacePrevisto) ? String(config.enlacePrevisto).trim() : '';
  var enlaceDeLaPieza = tieneValor(config.enlacePublicado) ? config.enlacePublicado : previstoPropio;
  var armadas = conElIdiomaDe(pais, function () {
    var valores = calcularDerivadosDeLeyendas(
      entrada, pais, calcularDerivados(entrada, pais),
      { nombreCampana: config.nombreCampana, enlacePublicado: enlaceDeLaPieza }
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

  var previsto = previstoPropio || urlDelTcDeLaCampana(entrada, pais, config.nombreCampana, '');
  return {
    hay: entregadas.length > 0,
    leyendas: entregadas,
    complementos: armadas.complementos,
    faltantes: [],
    pendientes: pendientes,
    errores: errores,
    // Lo que la pieza tiene que llevar y la leyenda no puede decir: un icono es
    // una imagen y un titular lo escribe el disenador.
    reglasDelArte: reglasDelArte(entrada, pais),
    // El enlace que lleva la leyenda, y si ya esta confirmado contra el
    // publicado. Es el camino 4 de la seccion 6 de la respuesta: la leyenda
    // sale completa el mismo dia, marcada "enlace por confirmar", y cuando el
    // comercial pega el publicado se compara y se rehace si es distinto.
    enlacePrevisto: previsto,
    enlaceUsado: tieneValor(config.enlacePublicado) ? String(config.enlacePublicado).trim() : previsto,
    enlaceConfirmado: !!tieneValor(config.enlacePublicado),
    enlaceCambio: !!tieneValor(config.enlacePublicado) &&
      String(config.enlacePublicado).trim() !== previsto,
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    generarTexto: generarTexto,
    generarLeyendasDeLaCampana: generarLeyendasDeLaCampana,
  };
}
