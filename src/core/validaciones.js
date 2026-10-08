'use strict';

/**
 * Validacion de la solicitud antes de generar.
 *
 * Bloquea la generacion (seccion 4.3). Cada error trae el campo y un mensaje
 * en lenguaje claro: que pasó y cómo se arregla.
 *
 * El orden importa. Si el pais no esta disponible para quien pide, no tiene
 * sentido revisar el resto: se devuelve solo ese error.
 */

if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloEsquemas = require('./esquemas.js');
  var esquemaDe = moduloEsquemas.esquemaDe;
  var camposVisibles = moduloEsquemas.camposVisibles;
  var tieneCampo = moduloEsquemas.tieneCampo;
  var resolverAtributo = moduloEsquemas.resolverAtributo;

  var moduloFechas = require('./fechas.js');
  var comoNumeroFecha = moduloFechas.comoNumeroFecha;
  var comoNumeroFechaHora = moduloFechas.comoNumeroFechaHora;
  var partesDeFecha = moduloFechas.partesDeFecha;
  var partesDeHora = moduloFechas.partesDeHora;
  var diasEntreFechas = moduloFechas.diasEntreFechas;

  var moduloIdentificaciones = require('./identificaciones.js');
  var validarIdentificacion = moduloIdentificaciones.validarIdentificacion;
  var validarEan = moduloIdentificaciones.validarEan;

  var separarPorComas = moduloFechas.separarPorComas;
  var travelDisponible = require('./paises.js').travelDisponible;

  var preguntaDe = require('./preguntas.js').preguntaDe;
  var categoriaProhibida = require('./leyendas.js').categoriaProhibida;
  var preguntaEnIdioma = require('./preguntas_pt.js').preguntaEnIdioma;
  var moduloTexto = require('./texto.js');
  var tieneValor = moduloTexto.tieneValor;
  var tiendasDeLaCarrera = moduloTexto.tiendasDeLaCarrera;
  var sinTildes = require('./nombres.js').sinTildes;
  // El techo lo declara numeros.js, que es quien escribe los numeros en letras.
  // Declararlo tambien aqui lo duplicaria: en Apps Script los archivos de
  // src/core comparten un solo ambito y una var pisaria a la otra.
  var MAYOR_NUMERO_EN_LETRAS = require('./numeros.js').MAYOR_NUMERO_EN_LETRAS;
}

function error(campo, mensaje) {
  return { campo: campo, mensaje: mensaje };
}

/**
 * El mensaje escrito para una pregunta, en el idioma de la interfaz.
 *
 * Cada pregunta trae sus mensajes en `errores` (vacio, pasado, orden, cero...),
 * escritos para el comercial. Durante mucho tiempo solo se uso errores.vacio y
 * el resto se armaba aqui a mano, generico y en espanol: un KAM de Brasil con
 * la interfaz en portugues leia "La campaña no puede empezar en una fecha que
 * ya pasó" en medio de una pantalla en portugues, y un comercial de Colombia
 * leia "Tope por pedido debe ser al menos 1" en vez de la frase que alguien
 * escribio para eso. El generico queda solo para cuando la pregunta no tiene
 * ese mensaje.
 *
 * `claves` puede ser una sola o una lista en orden de preferencia.
 */
function mensajeDe(campoId, tipo, claves, idioma, generico) {
  var pregunta = preguntaDe(campoId, tipo);
  if (pregunta && typeof preguntaEnIdioma === 'function') {
    pregunta = preguntaEnIdioma(pregunta, campoId, idioma, tipo);
  }
  var lista = Object.prototype.toString.call(claves) === '[object Array]' ? claves : [claves];
  for (var i = 0; i < lista.length; i++) {
    if (pregunta && pregunta.errores && pregunta.errores[lista[i]]) return pregunta.errores[lista[i]];
  }
  return generico;
}

function estaVacio(valor) {
  if (valor === null || valor === undefined || valor === '') return true;
  if (typeof valor === 'boolean') return valor === false;
  if (Object.prototype.toString.call(valor) === '[object Array]') return valor.length === 0;
  /*
   * Una respuesta de solo espacios es una respuesta en blanco.
   *
   * Sin esto, un "   " se daba por respondido: la revision lo dejaba pasar, el
   * motor llegaba con el hueco, y el comercial leia "Falta un dato: el
   * documento necesita "TEXTO_TERRITORIO" y quedo vacio", asociado al campo
   * "documento" y no a su pregunta. Ni sabia que era eso ni tenia donde
   * corregirlo.
   */
  if (typeof valor === 'string') return valor.trim() === '';
  return false;
}

/** El pais esta disponible para quien pide (seccion 4.3, punto 6). */
function validarPais(pais, usuarioEnEquipo) {
  if (!pais) {
    return error('pais', 'No reconocemos ese país. Elige uno de la lista.');
  }
  if (pais.estado === 'bloqueado') {
    return error('pais', 'Todavía no generamos documentos para ' + pais.nombre + '. Escríbele a Legal.');
  }
  if (pais.estado === 'piloto' && !usuarioEnEquipo) {
    return error('pais', pais.nombre + ' está en piloto. Pídele a Legal que te agregue al equipo de pruebas.');
  }
  return null;
}

/** El tipo de campana existe y esta habilitado para el pais (punto 7). */
function validarTipo(tipo, pais) {
  var esquema = esquemaDe(tipo);
  if (!esquema) {
    return error('tipo', 'No reconocemos ese tipo de campaña. Elige uno de la lista.');
  }
  var habilitados = pais.modelos || [];
  for (var i = 0; i < habilitados.length; i++) {
    if (habilitados[i] === esquema.modelo) return null;
  }
  return error('tipo', 'El tipo "' + esquema.nombre + '" todavía no está habilitado para ' + pais.nombre + '.');
}

/** Campos obligatorios visibles que quedaron vacios. */
function validarObligatorios(entrada, esquema, idioma) {
  var errores = [];
  var visibles = camposVisibles(esquema.id, entrada);

  for (var i = 0; i < visibles.length; i++) {
    var campo = visibles[i];
    // Los repetibles se revisan aparte, con su minimo y su maximo.
    if (campo.tipo === 'repetible') continue;
    if (!resolverAtributo(campo.obligatorio, entrada, false)) continue;

    if (estaVacio(entrada[campo.id])) {
      // El mensaje escrito para esa pregunta manda sobre el generico. Cada
      // pregunta tiene uno en errores.vacio, y estuvieron sin usarse: el
      // comercial leia "Falta minutos del eta." en vez de "Escribe en cuantos
      // minutos prometes la entrega.".
      errores.push(error(campo.id, mensajeDe(campo.id, esquema.id, 'vacio', idioma,
        'Falta ' + campo.etiqueta.toLowerCase() + '.')));
    }
  }
  return errores;
}

/** Rangos, formatos de fecha y hora, y largo de los textos. */
function validarFormatos(entrada, esquema, idioma) {
  var errores = [];
  var visibles = camposVisibles(esquema.id, entrada);

  for (var i = 0; i < visibles.length; i++) {
    var campo = visibles[i];
    var valor = entrada[campo.id];
    if (estaVacio(valor)) continue;

    if (campo.tipo === 'numero') {
      var numero = Number(valor);
      if (isNaN(numero)) {
        errores.push(error(campo.id, campo.etiqueta + ' debe ser un número.'));
      } else if (numero !== Math.trunc(numero)) {
        /*
         * El motor trunca con Math.trunc antes de escribir un numero en letras,
         * y el nombre de la campana usa el valor crudo. Con un 50,5 el T&C
         * salia titulado "50.5% CASHBACK" sobre una clausula que decia
         * "cincuenta por ciento (50%)".
         *
         * No es cosmetico: el articulado dice que ante una discrepancia se
         * aplica la condicion mas favorable para el usuario, asi que ese titulo
         * obliga a pagar el 50,5%. Es la misma razon por la que el nombre se
         * arma solo desde las respuestas (src/core/nombres.js).
         *
         * Se rechaza en vez de redondear: redondear seria decidir por el
         * comercial cuanto promete su campana. Si Legal decide algun dia que un
         * porcentaje con decimales se puede escribir en letras, el texto lo
         * escribe Legal y esta regla se afloja para ese campo.
         */
        errores.push(error(campo.id, mensajeDe(campo.id, esquema.id, 'decimal', idioma,
          campo.etiqueta + ' va en números enteros, sin decimales.')));
      } else if (numero > MAYOR_NUMERO_EN_LETRAS) {
        /*
         * numeroEnLetras llega hasta 999.999.999.999, y pasado ese punto
         * repetia la palabra en vez de avisar: un billon salia impreso como
         * "un millon millones", y 1e21 como "mil millones millones millones
         * (1e+21)", con el documento dado por bueno. El portugues tiene el
         * mismo techo ("um milhao milhoes").
         *
         * No es un maximo de negocio, que lo pondria Juan campo por campo:
         * es hasta donde sabe escribir el motor. La via real es el tecleo con
         * ceros de mas.
         */
        errores.push(error(campo.id, mensajeDe(campo.id, esquema.id, 'rango', idioma,
          campo.etiqueta + ' es demasiado grande. Revisa si se te fueron ceros de más.')));
      } else if (campo.minimo !== undefined && numero < campo.minimo) {
        // Un minimo de uno es "mayor que cero": si la pregunta escribio ese
        // mensaje (errores.cero), se prefiere al de rango.
        errores.push(error(campo.id, mensajeDe(campo.id, esquema.id, campo.minimo === 1 ? ['rango', 'cero'] : ['rango'], idioma,
          campo.etiqueta + ' debe ser al menos ' + campo.minimo + '.')));
      } else if (campo.maximo !== undefined && numero > campo.maximo) {
        errores.push(error(campo.id, mensajeDe(campo.id, esquema.id, 'rango', idioma,
          campo.etiqueta + ' no puede pasar de ' + campo.maximo + '.')));
      }
    } else if (campo.tipo === 'fecha' && !partesDeFecha(valor)) {
      errores.push(error(campo.id, campo.etiqueta + ' no es una fecha válida.'));
    } else if (campo.tipo === 'hora' && !partesDeHora(valor)) {
      errores.push(error(campo.id, campo.etiqueta + ' no es una hora válida.'));
    } else if (campo.tipo === 'texto' && campo.maximo !== undefined && String(valor).length > campo.maximo) {
      errores.push(error(campo.id, mensajeDe(campo.id, esquema.id, 'largo', idioma,
        campo.etiqueta + ' no puede pasar de ' + campo.maximo + ' caracteres.')));
    } else if (campo.tipo === 'codigo') {
      /*
       * El codigo de un cupon va impreso tal cual y el usuario lo teclea.
       *
       * Se valida sobre lo que el comercial escribio, no sobre la version
       * normalizada: si escribe "RAPPI 30" tiene que ver el error, porque en la
       * aplicacion ese cupon no existe. Aceptarlo en silencio y publicar
       * "RAPPI30" seria publicar un codigo que el comercial nunca aprobo.
       */
      var codigo = String(valor).trim();
      if (campo.maximo !== undefined && codigo.length > campo.maximo) {
        errores.push(error(campo.id, mensajeDe(campo.id, esquema.id, 'largo', idioma,
          campo.etiqueta + ' no puede pasar de ' + campo.maximo + ' caracteres.')));
      } else if (!/^[A-Za-z0-9-]+$/.test(codigo)) {
        errores.push(error(campo.id, mensajeDe(campo.id, esquema.id, 'formato', idioma,
          campo.etiqueta + ' solo puede llevar letras, números y guiones, sin espacios.')));
      }
    }
  }
  return errores;
}

/**
 * El dia en que termina la campana.
 *
 * Un tipo que no pregunta la fecha de fin (el cashback por ETA es de un solo
 * dia) termina el dia que empieza. Leer entrada.fechaFin ahi era leer un dato
 * que la interfaz fijaba una vez y nunca actualizaba: al cambiar el dia de
 * inicio, el resumen decia "la campana no puede terminar antes de empezar" y
 * no habia ninguna pregunta donde arreglarlo.
 */
function fechaFinDeLaCampana(entrada, esquema) {
  if (esquema && !tieneCampo(esquema, 'fechaFin')) return entrada.fechaInicio;
  return entrada.fechaFin;
}

/**
 * Vigencia: fin posterior al inicio y nada anterior a la fecha de referencia.
 *
 * esAmpliacion: la campana ya arranco y se esta ampliando. Ahi el inicio en el
 * pasado es lo normal, no un error. Sin esta excepcion, ampliar solo funcionaba
 * el mismo dia del inicio, porque el documento nuevo se vuelve a validar
 * completo y "Esa fecha ya paso" tumbaba la ampliacion desde el segundo dia.
 */
function validarVigencia(entrada, fechaReferencia, esquema, idioma, esAmpliacion) {
  var errores = [];
  var tipo = esquema ? esquema.id : undefined;
  var preguntaElFin = !esquema || tieneCampo(esquema, 'fechaFin');

  var inicio = comoNumeroFechaHora(entrada.fechaInicio, entrada.horaInicio);
  var fin = comoNumeroFechaHora(fechaFinDeLaCampana(entrada, esquema), entrada.horaFin);
  if (inicio !== null && fin !== null && fin <= inicio) {
    // El error va a la pregunta que existe: en un tipo de un solo dia, la hora.
    errores.push(preguntaElFin
      ? error('fechaFin', mensajeDe('fechaFin', tipo, 'orden', idioma,
        'La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.'))
      : error('horaFin', mensajeDe('horaFin', tipo, 'orden', idioma,
        'La hora de fin tiene que ser después de la de inicio.')));
  }

  if (esAmpliacion) return errores;

  var hoy = comoNumeroFecha(fechaReferencia);
  var dia = comoNumeroFecha(entrada.fechaInicio);
  if (hoy !== null && dia !== null && dia < hoy) {
    errores.push(error('fechaInicio', mensajeDe('fechaInicio', tipo, 'pasado', idioma,
      'La campaña no puede empezar en una fecha que ya pasó.')));
  }
  return errores;
}

/** Identificacion del organizador, con el algoritmo del pais. */
function validarOrganizador(entrada, pais) {
  // Que no sea Rappi va primero y vale para todos los flujos: un NIT de Rappi
  // bien formado pasa la revision de formato sin problema, y el documento
  // saldria nombrando a Rappi de Organizador, que es la regla 1 de CLAUDE.md.
  var errores = validarOrganizadorNoEsRappi(entrada, pais);
  if (errores.length) return errores;

  if (estaVacio(entrada.organizadorId)) return [];
  var revision = validarIdentificacion(pais.codigo, entrada.organizadorId);
  return revision.valido ? [] : [error('organizadorId', revision.mensaje)];
}

/**
 * Las marcas que delatan una anotacion interna dentro de un valor del pais.
 *
 * La fila de Brasil llego a tener la autoridad de datos escrita como
 * "a Autoridade Nacional de Protecao de Dados (ANPD) (confirmar)". Ese valor se
 * imprime tal cual en la clausula de datos personales, asi que un T&C publicado
 * habria salido con la palabra "(confirmar)" dentro. Para marcar lo que falta
 * esta la columna por_confirmar_en_pruebas, no el texto.
 */
var MARCAS_DE_ANOTACION = [
  // Entre parentesis o corchetes, con lo que sea alrededor: "(a confirmar)",
  // "[pendiente]", "(revisar con Legal)", "(por definir)".
  /[\[(][^\])]*\b(confirmar|revisar|pendiente|verificar|definir|ojo|dudoso)\b[^\])]*[\])]/i,
  // Las marcas de programador, solo en mayusculas: "todo" es una palabra normal.
  /\b(TODO|TBD|FIXME|XXX|PENDIENTE)\b/,
  // Signos de duda, y la sintaxis de los modelos, que en un valor del pais no
  // pinta nada.
  /\?\?|\(\?\)|\{\{|\[\[/,
];

/** true si el valor trae una anotacion interna. */
function tieneMarcaDeAnotacion(valor) {
  var texto = String(valor || '');
  for (var i = 0; i < MARCAS_DE_ANOTACION.length; i++) {
    if (MARCAS_DE_ANOTACION[i].test(texto)) return true;
  }
  return false;
}

/**
 * Un valor del pais con una anotacion interna adentro no se publica.
 *
 * Se revisan solo las columnas que de verdad salen impresas: las que un modelo
 * puede pedir con un placeholder.
 */
/*
 * Las columnas con que el pais escribe cualquier cifra.
 *
 * No son placeholders: nadie las pide con {{ }}, se usan como argumento dentro
 * de formatearMiles y montoConMoneda. Por eso el motor no las ve, y un
 * documento sin ellas salia dado por bueno con "50000" en vez de "$50.000" o
 * con un monto que no dice de que moneda es.
 *
 * Pasa cuando la pestana Paises se creo antes de que la columna existiera:
 * encabezadosDeLaHoja() la agrega al escribir, no al leer. Ya ocurrio dos veces,
 * con las columnas travel_* y con turbo_id_fiscal.
 */
var COLUMNAS_DE_FORMATO = [
  { llave: 'separador_miles', para: 'separar los miles de una cifra' },
  { llave: 'moneda_simbolo', para: 'escribir el simbolo de la moneda' },
  { llave: 'moneda_nombre', para: 'nombrar la moneda en letras' },
];

/** Si al pais le falta una columna de formato, no se genera. */
function validarColumnasDelPais(pais) {
  var errores = [];
  if (!pais) return errores;

  for (var i = 0; i < COLUMNAS_DE_FORMATO.length; i++) {
    var columna = COLUMNAS_DE_FORMATO[i];
    if (tieneValor(pais[columna.llave])) continue;
    errores.push(error('pais',
      'A la configuración de ' + (pais.nombre || pais.codigo) + ' le falta la columna "' +
      columna.llave + '", que sirve para ' + columna.para +
      '. Complétala en la pestaña Paises, o corre setup() para que la agregue.'));
  }
  return errores;
}

function validarAnotacionesDelPais(pais) {
  var errores = [];
  if (!pais) return errores;

  for (var llave in pais) {
    if (!Object.prototype.hasOwnProperty.call(pais, llave)) continue;
    if (llave === 'por_confirmar_en_pruebas' || llave === '_fila' || llave === 'modelos') continue;

    var valor = pais[llave];
    if (typeof valor !== 'string') continue;
    if (!tieneMarcaDeAnotacion(valor)) continue;

    errores.push(error('pais',
      'La configuración de ' + (pais.nombre || pais.codigo) + ' tiene una nota interna dentro de un dato que se imprime: "' +
      valor.trim() + '". Eso saldría publicado en el documento. Quítala de la pestaña Paises y marca ese dato en la columna de pendientes.'));
  }
  return errores;
}

/**
 * Un modelo escrito en otro idioma exige que el pais lo diga.
 *
 * El idioma del documento sale de la columna idioma de la pestaña Paises, que
 * se edita a mano y manda sobre la semilla. Con esa celda vacia, el motor caia
 * a espanol en silencio y el T&C de Brasil salia con "1 de octubre de 2026 às
 * 12:01 a. m." y "diez por ciento (10%)" en medio del portugues, sin un solo
 * error. Regla 2 de CLAUDE.md: si falta un dato, no se genera.
 */
function validarIdiomaDelPais(esquema, pais) {
  if (!esquema) return null;
  var idiomaDelPais = String((pais && pais.idioma) || '').trim().toLowerCase();

  if (esquema.idioma) {
    if (idiomaDelPais === esquema.idioma) return null;
    return error('pais', 'La configuración de ' + (pais.nombre || pais.codigo) +
      ' no dice que el documento va en ' + nombreDelIdioma(esquema.idioma) +
      ': la columna idioma de la pestaña Paises tiene que decir "' + esquema.idioma +
      '". Sin eso las fechas y los montos saldrían en español.');
  }

  // Al reves tambien. Un modelo en espanol habilitado en un pais que genera en
  // otro idioma saldria mezclado: "vinte por cento" y "horário de Brasília"
  // dentro de un articulado en espanol, sin un solo error.
  if (!idiomaDelPais || idiomaDelPais === 'es') return null;
  return error('tipo', 'Este tipo de campaña está escrito en español y la configuración de ' +
    (pais.nombre || pais.codigo) + ' dice que sus documentos van en ' + nombreDelIdioma(idiomaDelPais) +
    '. Hasta que Legal tenga este modelo en ese idioma, no se puede generar ahí.');
}

function nombreDelIdioma(codigo) {
  return codigo === 'pt' ? 'portugués' : codigo === 'es' ? 'español' : codigo;
}

/**
 * El cashback por ETA es de una sola ciudad.
 *
 * La pregunta lo dice, pero los chips de ciudades heredados del cashback dejaban
 * agregar dos, y el documento salia "en la ciudad de Bogotá, Medellín".
 */
function validarEta(entrada, tipo, idioma) {
  if (separarPorComas(entrada.ciudades).length <= 1) return [];
  return [error('ciudades', mensajeDe('ciudades', tipo, 'unaSola', idioma,
    'Escribe una sola ciudad. Para otra ciudad, haz otra campaña.'))];
}

/** Cruces propios del Cashback. */
function validarCashback(entrada, tipo, idioma) {
  var errores = [];
  var tope = Number(entrada.tope);
  var presupuesto = Number(entrada.presupuesto);

  if (entrada.tope !== null && entrada.tope !== undefined && entrada.tope !== '' && tope <= 0) {
    errores.push(error('tope', mensajeDe('tope', tipo, 'cero', idioma, 'El tope por pedido debe ser mayor que cero.')));
  }
  if (entrada.presupuesto !== null && entrada.presupuesto !== undefined && entrada.presupuesto !== '' && presupuesto <= 0) {
    errores.push(error('presupuesto', mensajeDe('presupuesto', tipo, 'cero', idioma, 'El presupuesto debe ser mayor que cero.')));
  }
  if (tope > 0 && presupuesto > 0 && tope > presupuesto) {
    errores.push(error('tope', mensajeDe('tope', tipo, 'mayorQuePresupuesto', idioma,
      'El tope por pedido no puede ser mayor que el presupuesto total.')));
  }
  return errores;
}

/*
 * Las palabras de azar que el nombre comercial no puede llevar, ya sin tildes y
 * en minuscula: en espanol sorteo, rifa, loteria, azar y suerte; en portugues
 * (Brasil) sorteio, rifa, loteria y sorte. Un "Gran Sorteo Skindays" le quita a
 * la Carrera su defensa frente al regimen de juegos de suerte y azar: el
 * concurso se define por lo comprado, no por la suerte (A.0 de la revision).
 */
var PALABRAS_DE_AZAR_EN_EL_NOMBRE = /\b(sorteos?|sorteios?|rifas?|loterias?|azar|suerte|sorte)\b/;

/**
 * El nombre comercial de la campana, cuando el KAM lo escribe (H20).
 *
 * Opcional: vacio no se revisa. Las cuatro reglas existen para no revivir el
 * riesgo que llevo a Juan a quitar la etiqueta libre el 16 de septiembre de 2026
 * (un titulo que prometa 99% sobre un articulado que dice 50%):
 *   1. Entre 3 y 60 caracteres, en una sola linea y sin emojis.
 *   2. Sin porcentajes, signos de moneda ni cifras, salvo un ano de cuatro
 *      cifras: pasa "Mundial 2026", no pasan "Skindays 50%" ni "3x2".
 *   3. Sin palabras de azar.
 *   4. Sin anotaciones internas, con la misma revision de los valores del pais.
 * Cada regla tiene su mensaje en la pregunta nombreComercial.
 */
function validarNombreComercial(entrada, esquema, idioma) {
  var valor = entrada.nombreComercial;
  if (valor === null || valor === undefined || String(valor).trim() === '') return [];

  var tipo = esquema ? esquema.id : undefined;
  var nombre = String(valor);
  var errores = [];
  var mensaje = function (clave, generico) { return mensajeDe('nombreComercial', tipo, clave, idioma, generico); };

  var recortado = nombre.trim();
  var variasLineas = /[\r\n]/.test(nombre);
  var conEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2190-\u21FF\u2300-\u23FF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D]/.test(nombre);
  if (recortado.length < 3 || recortado.length > 60 || variasLineas || conEmoji) {
    errores.push(error('nombreComercial', mensaje('largo', 'El nombre tiene que tener entre 3 y 60 caracteres, en una sola línea.')));
  }

  // El ano de cuatro cifras (19xx o 20xx) pasa; cualquier otra cifra, porcentaje
  // o signo de moneda no.
  var sinAno = recortado.replace(/(^|[^0-9])(19|20)[0-9]{2}(?![0-9])/g, '$1');
  if (/[0-9%$\u20AC\u00A3\u00A5]/.test(sinAno)) {
    errores.push(error('nombreComercial', mensaje('cifras', 'El nombre no puede llevar porcentajes, precios ni cifras, salvo el año.')));
  }

  if (PALABRAS_DE_AZAR_EN_EL_NOMBRE.test(sinTildes(recortado).toLowerCase())) {
    errores.push(error('nombreComercial', mensaje('azar', 'El nombre no puede hablar de sorteo, rifa, lotería, azar ni suerte.')));
  }

  if (tieneMarcaDeAnotacion(recortado)) {
    errores.push(error('nombreComercial', mensaje('anotacion', 'El nombre lleva una nota interna.')));
  }
  return errores;
}

/** Si el tipo le hace esa pregunta al comercial con las respuestas que lleva. */
function preguntaVisible(esquema, entrada, campoId) {
  if (!esquema) return true;
  var visibles = camposVisibles(esquema.id, entrada);
  for (var i = 0; i < visibles.length; i++) {
    if (visibles[i].id === campoId) return true;
  }
  return false;
}

/** Cruces de los Creditos: carga y redencion frente a la vigencia. */
function validarCreditos(entrada, esquema, idioma) {
  var errores = [];
  var tipo = esquema ? esquema.id : undefined;
  var inicio = comoNumeroFecha(entrada.fechaInicio);
  var fin = comoNumeroFecha(fechaFinDeLaCampana(entrada, esquema));

  if (entrada.carga === 'fecha') {
    var carga = comoNumeroFecha(entrada.fechaCarga);
    if (carga !== null && inicio !== null && carga < inicio) {
      errores.push(error('fechaCarga', mensajeDe('fechaCarga', tipo, 'antes', idioma,
        'La fecha de carga no puede ser anterior al inicio de la campaña.')));
    }
  }

  // Solo si la pregunta se hizo: en la Carrera, la vigencia de los Creditos
  // existe solo con premio en Creditos, y una respuesta vieja de antes de
  // cambiar a premio fisico no puede frenar una campana sin Creditos.
  if (entrada.vigencia === 'fecha' && preguntaVisible(esquema, entrada, 'fechaFinRedencion')) {
    var redencion = comoNumeroFecha(entrada.fechaFinRedencion);
    if (redencion !== null && fin !== null && redencion <= fin) {
      errores.push(error('fechaFinRedencion', mensajeDe('fechaFinRedencion', tipo, 'orden', idioma,
        'La fecha límite de redención debe ser posterior al fin de la campaña.')));
    }
  }
  return errores;
}

/**
 * Cruces del Descuento y del Cupon.
 *
 * El mismo riesgo del Cashback y por la misma razon: con un tope mayor que el
 * presupuesto, el primer pedido se lleva la campana entera. Aqui el tope es
 * opcional y el presupuesto solo existe cuando la campana termina por
 * presupuesto, asi que el cruce solo se hace cuando estan los dos.
 */
function validarDescuento(entrada, tipo, idioma) {
  var errores = [];
  var tope = Number(entrada.tope);
  var presupuesto = Number(entrada.presupuesto);

  if (tope > 0 && presupuesto > 0 && tope > presupuesto) {
    errores.push(error('tope', mensajeDe('tope', tipo, 'mayorQuePresupuesto', idioma,
      'El tope por pedido no puede ser mayor que el presupuesto total.')));
  }
  return errores;
}

/** Cruces de la Carrera de Compras. */
function validarCarrera(entrada, tipo, idioma) {
  var errores = [];

  if (entrada.desempate && entrada.desempate === entrada.criterioGanador) {
    errores.push(error('desempate', mensajeDe('desempate', tipo, 'igual', idioma,
      'El desempate no puede ser el mismo criterio con el que se define el ganador. Elige otro.')));
  }

  var fin = comoNumeroFecha(entrada.fechaFin);
  var notificacion = comoNumeroFecha(entrada.fechaNotificacion);
  if (fin !== null && notificacion !== null && notificacion <= fin) {
    errores.push(error('fechaNotificacion', mensajeDe('fechaNotificacion', tipo, 'orden', idioma,
      'La fecha de notificación debe ser posterior al fin de la campaña.')));
  }

  /*
   * La fecha de aviso al ganador tiene tope: 30 dias de calendario despues del
   * fin. Hoy solo se pedia que fuera posterior al fin, y podia ser seis meses
   * despues: un compromiso con el ganador que nadie puede sostener. H23 de la
   * revision de la Carrera (Kenvue), aprobado el 8 de octubre de 2026.
   */
  var diasDespues = diasEntreFechas(entrada.fechaFin, entrada.fechaNotificacion);
  if (notificacion !== null && fin !== null && notificacion > fin && diasDespues !== null && diasDespues > 30) {
    errores.push(error('fechaNotificacion', mensajeDe('fechaNotificacion', tipo, 'tope', idioma,
      'La fecha de aviso no puede pasar de 30 días calendario después del fin de la campaña.')));
  }
  return errores;
}

/** La lista de tiendas del Cashback Day. */
function validarTiendas(entrada, pais, esquema) {
  var errores = [];
  var tiendas = entrada.tiendas || [];
  var definicion = null;

  for (var i = 0; i < esquema.campos.length; i++) {
    if (esquema.campos[i].id === 'tiendas') definicion = esquema.campos[i];
  }
  var minimo = definicion && definicion.minimo !== undefined ? definicion.minimo : 2;
  var maximo = definicion && definicion.maximo !== undefined ? definicion.maximo : 60;

  if (tiendas.length < minimo) {
    errores.push(error('tiendas', 'Agrega al menos ' + minimo + ' tiendas participantes.'));
    return errores;
  }
  if (tiendas.length > maximo) {
    errores.push(error('tiendas', 'No puedes agregar más de ' + maximo + ' tiendas.'));
    return errores;
  }

  var vistos = {};
  for (var t = 0; t < tiendas.length; t++) {
    var tienda = tiendas[t];
    var fila = t + 1;

    for (var c = 0; c < esquema.camposPorTienda.length; c++) {
      var campo = esquema.camposPorTienda[c];
      if (!resolverAtributo(campo.obligatorio, tienda, false)) continue;
      if (estaVacio(tienda[campo.id])) {
        errores.push(error('tiendas', 'Tienda ' + fila + ': falta ' + campo.etiqueta.toLowerCase() + '.'));
        continue;
      }
      /*
       * Los numeros de la tienda pasaban sin revisar. Un presupuesto en cero no
       * esta vacio (estaVacio(0) es false), asi que llegaba hasta el documento y
       * la fila de esa tienda salia "Beer Station (Bogota): cero (0) Creditos".
       * La pantalla si lo marcaba en rojo, porque alli 0 se lee como falta de
       * dato: la pantalla y el motor decian cosas distintas del mismo numero.
       */
      if (campo.tipo === 'numero') {
        var numeroDeTienda = Number(tienda[campo.id]);
        if (isNaN(numeroDeTienda)) {
          errores.push(error('tiendas', 'Tienda ' + fila + ': ' + campo.etiqueta.toLowerCase() + ' tiene que ser un número.'));
        } else if (numeroDeTienda !== Math.trunc(numeroDeTienda)) {
          // El mismo truncado silencioso que en los campos sueltos: el
          // presupuesto de la tienda salia impreso sin su decimal.
          errores.push(error('tiendas', 'Tienda ' + fila + ': ' + campo.etiqueta.toLowerCase() +
            ' va en números enteros, sin decimales.'));
        } else if (campo.minimo !== undefined && numeroDeTienda < campo.minimo) {
          errores.push(error('tiendas', 'Tienda ' + fila + ': ' + campo.etiqueta.toLowerCase() +
            ' tiene que ser al menos ' + campo.minimo + '.'));
        } else if (campo.maximo !== undefined && numeroDeTienda > campo.maximo) {
          errores.push(error('tiendas', 'Tienda ' + fila + ': ' + campo.etiqueta.toLowerCase() +
            ' no puede pasar de ' + campo.maximo + '.'));
        }
      }
    }

    if (!estaVacio(tienda.id)) {
      var revision = validarIdentificacion(pais.codigo, tienda.id);
      if (!revision.valido) {
        errores.push(error('tiendas', 'Tienda ' + fila + ': ' + revision.mensaje));
      } else if (vistos[revision.formateado]) {
        errores.push(error('tiendas', 'Tienda ' + fila + ': esa identificación ya está en la tienda ' + vistos[revision.formateado] + '.'));
      } else {
        vistos[revision.formateado] = fila;
      }
    }
  }
  return errores;
}

var PREFIJO_PUBLICACION = 'https://promos.rappi.com/';

/**
 * El link publicado tiene que vivir en promos.rappi.com. Cualquier otro sitio
 * significa que el T&C no quedo donde la campana lo va a referenciar.
 */
function validarLinkPublicado(url) {
  var texto = String(url || '').trim();
  if (!texto) {
    return { valido: false, mensaje: 'Pega el enlace de la página publicada.' };
  }
  if (texto.indexOf(PREFIJO_PUBLICACION) !== 0) {
    return { valido: false, mensaje: 'El enlace debe empezar por ' + PREFIJO_PUBLICACION + '. Copia la dirección de la página ya publicada en Squarespace.' };
  }
  if (texto.length <= PREFIJO_PUBLICACION.length) {
    return { valido: false, mensaje: 'Falta la parte final del enlace, después de ' + PREFIJO_PUBLICACION + '.' };
  }
  return { valido: true, mensaje: '', url: texto };
}

// --- Rappi Travel ----------------------------------------------------------

/** Solo los digitos de una identificacion, para comparar sin formato. */
function soloDigitosDeId(valor) {
  return String(valor === null || valor === undefined ? '' : valor).replace(/[^0-9]/g, '');
}

/** El NIT sin su digito de verificacion. */
function nitSinVerificacion(valor) {
  var digitos = soloDigitosDeId(valor);
  return digitos.length > 9 ? digitos.slice(0, 9) : digitos;
}

/** Texto en minusculas y sin tildes, para comparar nombres de empresas. */
function comoClaveDeNombre(texto) {
  var original = String(texto === null || texto === undefined ? '' : texto).toLowerCase();
  var con = 'áàäâãéèëêíìïîóòöôõúùüûñç';
  var sin = 'aaaaaeeeeiiiiooooouuuunc';
  var salida = '';
  for (var i = 0; i < original.length; i++) {
    var posicion = con.indexOf(original.charAt(i));
    salida += posicion === -1 ? original.charAt(i) : sin.charAt(posicion);
  }
  return salida;
}

/** Nombres que nunca pueden ser el Organizador de ninguna campana. */
var NOMBRES_PROHIBIDOS_DE_RAPPI = ['rappi', 'travel moustache', 'travel mustache', 'moustache beams'];

/**
 * Las entidades de Rappi del pais, con el nombre que le toca a cada NIT.
 *
 * Existen tres y son empresas distintas: la que opera los domicilios, la
 * agencia de viajes que opera Rappi Travel, y la que opera Turbo. Ninguna puede
 * ser el Organizador, pero el mensaje tiene que nombrar la que el comercial
 * escribio de verdad.
 *
 * Esto salio de una pantalla que Juan vio el 21 de septiembre de 2026: escribio
 * el NIT de Rappi S.A.S. y el mensaje le respondio "Rappi Travel nunca es el
 * Organizador". Ese NIT no es el de Rappi Travel. Un mensaje que nombra la
 * empresa equivocada le ensena mal al comercial justo en la pregunta donde el
 * dato sale impreso en el documento.
 *
 * Van planas en la fila del pais (frontera 3): una llave por columna, porque un
 * objeto anidado no sobrevive al Sheet.
 */
function entidadesDeRappi(pais) {
  if (!pais) return [];
  var posibles = [
    { nombre: pais.entidad_legal, id: pais.id_fiscal, que: 'la que opera la Plataforma Rappi' },
    { nombre: pais.travel_entidad, id: pais.travel_id_fiscal, que: 'la agencia de viajes que opera Rappi Travel' },
    { nombre: pais.turbo_entidad, id: pais.turbo_id_fiscal, que: 'la que opera Turbo' },
  ];
  var entidades = [];
  for (var i = 0; i < posibles.length; i++) {
    if (posibles[i].nombre && posibles[i].id) entidades.push(posibles[i]);
  }
  return entidades;
}

/** El nombre con un solo punto final, venga o no con el suyo. */
function terminadaEnPunto(nombre) {
  var texto = String(nombre || '').trim();
  return texto.charAt(texto.length - 1) === '.' ? texto : texto + '.';
}

/** Que decir cuando el Organizador que escribieron es una empresa de Rappi. */
function mensajeDeEntidadDeRappi(entidad) {
  if (!entidad) {
    return 'Rappi nunca es el Organizador. Escribe la empresa dueña de la marca que paga el beneficio.';
  }
  return 'Ese es el de ' + entidad.nombre + ', ' + entidad.que + ', y Rappi nunca es el Organizador. ' +
    'El Organizador es la tienda o la marca que pone la plata del beneficio. Escribe la de ella.';
}

/**
 * Ninguna empresa de Rappi puede ser el Organizador, en ningun flujo.
 *
 * Es la regla 1 de CLAUDE.md, y hasta el 21 de septiembre de 2026 solo corria
 * en los dos tipos de Travel: en un Cashback cualquiera se podia poner a Rappi
 * S.A.S. de Organizador y el documento salia diciendolo. La regla no era de
 * Travel, era de todos.
 */
function validarOrganizadorNoEsRappi(entrada, pais) {
  var errores = [];
  var entidades = entidadesDeRappi(pais);

  var nombre = comoClaveDeNombre(entrada.organizadorRazonSocial);
  if (nombre) {
    for (var i = 0; i < NOMBRES_PROHIBIDOS_DE_RAPPI.length; i++) {
      if (nombre.indexOf(NOMBRES_PROHIBIDOS_DE_RAPPI[i]) === -1) continue;
      // Cual de las tres escribio, para nombrarla bien.
      var cual = null;
      for (var j = 0; j < entidades.length; j++) {
        if (comoClaveDeNombre(entidades[j].nombre).indexOf(NOMBRES_PROHIBIDOS_DE_RAPPI[i]) !== -1) {
          cual = entidades[j];
          break;
        }
      }
      // Sin punto de mas: casi todas las razones sociales terminan en "S.A.S."
      // y "ni Rappi S.A.S.." se lee como un error de la herramienta.
      var conNombre = cual ? 'Rappi nunca es el Organizador, ni ' + terminadaEnPunto(cual.nombre)
        : 'Rappi nunca es el Organizador.';
      errores.push(error('organizadorRazonSocial', conNombre + ' ' +
        'El Organizador es la tienda o la marca que pone la plata del beneficio. Escribe la de ella.'));
      break;
    }
  }

  var nitDado = nitSinVerificacion(entrada.organizadorId);
  if (nitDado) {
    for (var k = 0; k < entidades.length; k++) {
      if (nitSinVerificacion(entidades[k].id) !== nitDado) continue;
      errores.push(error('organizadorId', mensajeDeEntidadDeRappi(entidades[k])));
      break;
    }
  }
  return errores;
}

/** Las reglas propias de los dos tipos de Travel. Seccion 10 del modelo base. */
function validarTravel(entrada, pais, fechaReferencia, esAmpliacion) {
  var errores = [];
  var esDescuento = entrada.tipo === 'descuento_travel';

  // Un precio anunciado que no es el valor final no se arregla con una clausula:
  // la pieza esta mal y hay que corregirla. La ley pide que el precio anunciado
  // sea el total, y en tarifas aereas eso ya le costo una sancion a Rappi
  // Travel. Hasta el 21 de septiembre de 2026 esto bloqueaba a todo el que
  // anunciara un precio, bien o mal; ahora solo al que lo anuncia mal.
  if (entrada.anunciaPrecio === 'si' && entrada.precioIncluyeTodo === 'no') {
    errores.push(error('precioIncluyeTodo',
      'El precio anunciado tiene que ser el valor final, con impuestos, tasas y cargos incluidos. ' +
      'Como el de tu pieza no lo es, hay que corregir la pieza antes de publicar y eso lo ve Legal.'));
  }

  // Si el aliado pide algo que el formulario no cubre, el documento se queda
  // corto: eso lo redacta Legal.
  if (entrada.otraCondicion === 'si') {
    errores.push(error('otraCondicion', 'El aliado pide una condición que este documento no cubre. Esta campaña la redacta Legal.'));
  }

  // Periodo de viaje.
  var viajeInicio = comoNumeroFecha(entrada.periodoViajeInicio);
  var viajeFin = comoNumeroFecha(entrada.periodoViajeFin);
  if (viajeInicio !== null && viajeFin !== null && viajeFin < viajeInicio) {
    errores.push(error('periodoViajeFin', 'El periodo de viaje no puede terminar antes de empezar.'));
  }

  var excluidas = separarPorComas(entrada.fechasExcluidas);
  for (var f = 0; f < excluidas.length; f++) {
    var excluida = comoNumeroFecha(excluidas[f]);
    if (excluida === null) {
      errores.push(error('fechasExcluidas', 'Las fechas excluidas van en formato año-mes-día, separadas por comas. Revisa "' + excluidas[f] + '".'));
      break;
    }
    if (viajeInicio !== null && viajeFin !== null && (excluida < viajeInicio || excluida > viajeFin)) {
      errores.push(error('fechasExcluidas', 'Las fechas excluidas tienen que estar dentro del periodo de viaje. Revisa "' + excluidas[f] + '".'));
      break;
    }
  }

  // Clases tarifarias: una letra cada una, sin repetir.
  var clases = separarPorComas(entrada.clasesExcluidas);
  var vistas = {};
  for (var c = 0; c < clases.length; c++) {
    var clase = String(clases[c]).toUpperCase();
    if (!/^[A-Z]$/.test(clase)) {
      errores.push(error('clasesExcluidas', 'Cada clase tarifaria es una sola letra, separada por comas. Revisa "' + clases[c] + '".'));
      break;
    }
    if (vistas[clase]) {
      errores.push(error('clasesExcluidas', 'La clase tarifaria "' + clase + '" está repetida.'));
      break;
    }
    vistas[clase] = true;
  }

  // Dias de alquiler.
  var minimoDias = Number(entrada.diasAlquilerMinimo);
  var maximoDias = Number(entrada.diasAlquilerMaximo);
  if (isFinite(minimoDias) && minimoDias > 0 && isFinite(maximoDias) && maximoDias > 0 && minimoDias > maximoDias) {
    errores.push(error('diasAlquilerMaximo', 'El mínimo de días de alquiler no puede ser mayor que el máximo.'));
  }

  // El medio de pago de "Pro o RappiCard" no puede excluir a quien paga con
  // otra cosa: el segmento ya dice que RappiCard es una via de entrada.
  if (entrada.segmento === 'pro_o_rappicard' && entrada.metodoPago !== 'digitales') {
    errores.push(error('metodoPago', 'Si pueden participar quienes pagan con RappiCard, el medio de pago tiene que ser "digitales, excepto efectivo". Si no, el documento se contradice.'));
  }

  // La primera comunicacion nunca puede haber salido ya: el T&C se publica
  // antes. Salvo al ampliar, que la campana ya esta corriendo.
  var hoy = comoNumeroFecha(fechaReferencia);
  var primera = comoNumeroFecha(entrada.fechaPrimeraComunicacion);
  if (!esAmpliacion && hoy !== null && primera !== null && primera < hoy) {
    errores.push(error('fechaPrimeraComunicacion', 'La primera comunicación no puede ser una fecha que ya pasó: el T&C se publica antes de que salga la primera pieza.'));
  }

  if (esDescuento) {
    errores = errores.concat(validarDescuentoTravel(entrada));
  } else {
    errores = errores.concat(validarCashbackTravel(entrada));
  }
  return errores;
}

/** Reglas del cashback_travel: montos, ordenes y redencion. */
function validarCashbackTravel(entrada) {
  var errores = [];
  var presupuesto = Number(entrada.presupuesto);

  if (entrada.formaBeneficio === 'porcentaje' && !entrada.sinTope) {
    var tope = Number(entrada.tope);
    if (isFinite(tope) && tope > 0 && isFinite(presupuesto) && presupuesto > 0 && tope > presupuesto) {
      errores.push(error('tope', 'El tope por orden es mayor que el presupuesto total. Con eso, la primera orden se lleva toda la campaña. Revisa los dos números.'));
    }
  }
  if (entrada.formaBeneficio === 'monto_fijo') {
    var monto = Number(entrada.montoFijo);
    if (isFinite(monto) && monto > 0 && isFinite(presupuesto) && presupuesto > 0 && monto > presupuesto) {
      errores.push(error('montoFijo', 'Los Créditos por orden son más que el presupuesto total. Revisa los dos números.'));
    }
  }

  var porUsuario = Number(entrada.limitePorUsuario);
  var deLaCampana = Number(entrada.maxOrdenes);
  if (!entrada.sinMaxOrdenes && isFinite(porUsuario) && porUsuario > 0 && isFinite(deLaCampana) && deLaCampana > 0 && deLaCampana < porUsuario) {
    errores.push(error('maxOrdenes', 'El máximo de órdenes de la campaña es menor que el máximo por persona. Una sola persona agotaría la campaña.'));
  }

  if (entrada.redencion === 'categorias') {
    var elegidas = entrada.categoriasRedencion || [];
    if (elegidas.length === 0) {
      errores.push(error('categoriasRedencion', 'Marca al menos una categoría donde se puedan usar los Créditos.'));
    }
  }
  return errores;
}

/** Reglas del descuento_travel: porcentajes, asistencia y visibilidad. */
function validarDescuentoTravel(entrada) {
  var errores = [];

  if (entrada.formaDescuento === 'variable') {
    var minimo = Number(entrada.porcentajeMinimo);
    var maximo = Number(entrada.porcentaje);
    if (isFinite(minimo) && isFinite(maximo) && minimo >= maximo) {
      errores.push(error('porcentajeMinimo', 'El porcentaje mínimo tiene que ser menor que el máximo. Si son iguales, el descuento es fijo.'));
    }
  }

  // Una asistencia al viajero se compra junto con el vuelo o el paquete, y el
  // descuento solo cubre la asistencia. Mezclarla con otra categoria haria que
  // el documento no pueda decir sobre que aplica.
  var categorias = entrada.categorias || [];
  if (categorias.indexOf('Asistencia') !== -1 && categorias.length > 1) {
    errores.push(error('categorias', 'Si la campaña incluye "Asistencia", esa tiene que ser la única categoría. Para las demás, haz una campaña aparte.'));
  }

  if ((entrada.visibilidad || []).length === 0) {
    errores.push(error('visibilidad', 'Marca al menos un lugar donde el usuario vea el descuento.'));
  }
  return errores;
}

/**
 * Avisos de Travel: no bloquean, se muestran en el resumen.
 *
 * PENDIENTE (R17 de docs/MODELO_BASE_TRAVEL.md): Juan decide si alguno pasa a
 * ser un bloqueo.
 */
function avisosDeTravel(entrada) {
  var avisos = [];

  var dias = Number(entrada.diasVigencia);
  if (isFinite(dias) && dias > 0 && dias < 5) {
    avisos.push('Los Créditos duran menos de cinco días. En las campañas reales, una vigencia tan corta genera reclamos de usuarios que no alcanzan a usarlos.');
  }

  var primera = comoNumeroFecha(entrada.fechaPrimeraComunicacion);
  var inicio = comoNumeroFecha(entrada.fechaInicio);
  if (primera !== null && inicio !== null && primera < inicio) {
    avisos.push('La primera pieza sale antes de que arranque la campaña. Publica el T&C antes de esa fecha.');
  }
  return avisos;
}

/**
 * El negocio y el tipo tienen que hablar de lo mismo.
 *
 * Son dos empresas distintas: los domicilios los opera Rappi S.A.S. y los
 * viajes Travel Moustache S.A.S. Un documento con el negocio de una y el tipo
 * de la otra saldria a nombre de quien no es.
 */
function validarNegocio(entrada, esquema) {
  if (!esquema || estaVacio(entrada.negocio)) return [];
  var esperado = esquema.esDeTravel ? 'travel' : 'rappi';
  if (entrada.negocio === esperado) return [];
  return [error('negocio', esquema.esDeTravel
    ? 'Este tipo de campaña es de Rappi Travel, pero arriba dice que la campaña es de Rappi. Corrige una de las dos.'
    : 'Este tipo de campaña es de Rappi, pero arriba dice que la campaña es de Rappi Travel. Corrige una de las dos.')];
}

/**
 * Los productos participantes de la Carrera, con su nombre y su EAN.
 *
 * Eran un campo de texto libre y dos productos que se llaman parecido dejaban
 * el documento sin decir cual suma al concurso. Punto D4, 20 de septiembre de
 * 2026. El EAN se revisa entero, con su digito de control: un numero mal
 * copiado del empaque sale impreso y nadie se entera.
 */
function validarProductos(entrada, esquema) {
  if (entrada.productos !== 'especificos') return [];

  var errores = [];
  var productos = entrada.productosDetalle || [];
  var definicion = null;
  for (var i = 0; i < esquema.campos.length; i++) {
    if (esquema.campos[i].id === 'productosDetalle') definicion = esquema.campos[i];
  }
  var minimo = definicion && definicion.minimo !== undefined ? definicion.minimo : 1;
  var maximo = definicion && definicion.maximo !== undefined ? definicion.maximo : 60;

  if (productos.length < minimo) {
    return [error('productosDetalle', 'Agrega al menos ' + minimo +
      (minimo === 1 ? ' producto participante.' : ' productos participantes.'))];
  }
  if (productos.length > maximo) {
    return [error('productosDetalle', 'No puedes agregar más de ' + maximo + ' productos.')];
  }

  var vistos = {};
  for (var p = 0; p < productos.length; p++) {
    var producto = productos[p] || {};
    var fila = p + 1;

    if (estaVacio(producto.nombre)) {
      errores.push(error('productosDetalle', 'Producto ' + fila + ': falta el nombre.'));
    }

    var revision = validarEan(producto.ean);
    if (!revision.valido) {
      errores.push(error('productosDetalle', 'Producto ' + fila + ': ' + revision.mensaje));
      continue;
    }
    // El mismo EAN dos veces es el mismo producto contado dos veces.
    if (vistos[revision.formateado]) {
      errores.push(error('productosDetalle', 'Producto ' + fila + ': ese EAN ya está en la lista.'));
    }
    vistos[revision.formateado] = true;
  }
  return errores;
}

/**
 * Si el nombre de una fila de tienda parece dos tiendas en una.
 *
 * Paso de verdad (campaña de Kenvue, septiembre de 2026): el comercial escribió
 * "Turbo y Éxito" en un solo campo. Se avisa con " y ", coma, barra, más o punto
 * y coma, y con la palabra Turbo junto a otro nombre, porque la respuesta de
 * Turbo se da en su propia pregunta. No se prohíbe: hay marcas con "y" en el
 * nombre, así que la fila se puede confirmar como una sola tienda (unaSola).
 */
function parecenVariasTiendas(nombre) {
  var texto = ' ' + sinTildes(String(nombre === null || nombre === undefined ? '' : nombre))
    .toLowerCase().replace(/\s+/g, ' ').trim() + ' ';
  if (/[,\/+;]/.test(texto)) return true;
  if (texto.indexOf(' y ') !== -1) return true;
  var palabras = texto.trim().split(' ');
  return palabras.length > 1 && palabras.indexOf('turbo') !== -1;
}

var RESPUESTAS_DE_TURBO = ['normal', 'turbo', 'ambas', 'sin_turbo'];

/**
 * Las tiendas donde suman las compras de la Carrera (K1.a, 8 de octubre de 2026).
 *
 * Una fila sin nombre deja el documento sin tienda; una sin respuesta de Turbo
 * lo deja sin decir en cuál de sus tiendas cuentan los pedidos (en la campaña
 * de Kenvue, la diferencia entre Éxito y Carulla); el mismo nombre dos veces
 * nombra la tienda dos veces; y un nombre que parece dos tiendas se frena hasta
 * que el comercial confirme que es una sola.
 *
 * Una campaña guardada antes, con la tienda como texto, se lee como una fila
 * (tiendasDeLaCarrera) y pasa.
 */
function validarTiendasCarrera(entrada, esquema, idioma) {
  var tipo = esquema ? esquema.id : 'carrera_compras';
  var definicion = null;
  var campos = (esquema && esquema.campos) || [];
  for (var i = 0; i < campos.length; i++) {
    if (campos[i].id === 'tiendasCarrera') definicion = campos[i];
  }
  var minimo = definicion && definicion.minimo !== undefined ? definicion.minimo : 1;
  var maximo = definicion && definicion.maximo !== undefined ? definicion.maximo : 10;

  var mensajeMinimo = mensajeDe('tiendasCarrera', tipo, 'minimo', idioma, 'Agrega al menos una tienda.');
  var lista = entrada.tiendasCarrera;
  if (Object.prototype.toString.call(lista) !== '[object Array]') {
    return tiendasDeLaCarrera(entrada).length < minimo ? [error('tiendasCarrera', mensajeMinimo)] : [];
  }

  if (tiendasDeLaCarrera(entrada).length < minimo) return [error('tiendasCarrera', mensajeMinimo)];
  if (lista.length > maximo) {
    return [error('tiendasCarrera', mensajeDe('tiendasCarrera', tipo, 'maximo', idioma,
      'No puedes agregar más de ' + maximo + ' tiendas.'))];
  }

  var errores = [];
  var vistas = {};
  for (var t = 0; t < lista.length; t++) {
    var fila = lista[t] || {};
    var numero = t + 1;
    var nombre = String(fila.nombre === null || fila.nombre === undefined ? '' : fila.nombre).trim();
    if (!nombre) {
      errores.push(error('tiendasCarrera', 'Tienda ' + numero + ': falta el nombre.'));
      continue;
    }
    var llave = sinTildes(nombre).toLowerCase().replace(/\s+/g, ' ');
    if (vistas[llave]) {
      errores.push(error('tiendasCarrera', 'Tienda ' + numero + ': ' + mensajeDe('tiendasCarrera', tipo, 'repetido', idioma,
        'Esa tienda ya está en la lista.')));
    }
    vistas[llave] = true;

    if (RESPUESTAS_DE_TURBO.indexOf(String(fila.tiendaTurbo || '')) === -1) {
      errores.push(error('tiendasCarrera', 'Tienda ' + numero + ': ' + mensajeDe('tiendasCarrera', tipo, 'turbo', idioma,
        'Dinos en cuál de sus tiendas cuentan los pedidos.')));
    }
    if (fila.unaSola !== true && parecenVariasTiendas(nombre)) {
      errores.push(error('tiendasCarrera', 'Tienda ' + numero + ': ' + mensajeDe('tiendasCarrera', tipo, 'varias', idioma,
        'Parece que escribiste más de una tienda en la misma fila. Agrega cada tienda en su propia fila.')));
    }
  }
  return errores;
}

/**
 * El aviso suave del campo de marca: "NEUTROGENA y LUBRIDERM" sin comas.
 *
 * No bloquea: hay marcas con "y" en el nombre. Devuelve la pregunta o cadena
 * vacia. H16 de la revision de la Carrera (Kenvue).
 */
function avisoDeMarcas(entrada) {
  var texto = String((entrada || {}).makerMarca || '');
  if (texto.indexOf(',') !== -1) return '';
  if (!/\sy\s/i.test(texto)) return '';
  var pregunta = preguntaDe('makerMarca', (entrada || {}).tipo);
  return pregunta && pregunta.aviso ? pregunta.aviso : '';
}

/**
 * El aviso suave de los dias para declarar desierto el premio.
 *
 * No bloquea: el comercial puede querer un plazo corto. Pero si es menor que
 * tres veces el plazo para aceptar, casi no alcanza a pasar el premio al
 * siguiente del ranking, que tiene su propio plazo. Devuelve la frase del aviso
 * o cadena vacia. K9 de la revision de la Carrera (Kenvue).
 */
function avisoDeDiasDesierto(entrada) {
  var dias = Number((entrada || {}).diasDesierto);
  var plazo = Number((entrada || {}).plazoConfirmacion);
  if (!dias || !plazo) return '';
  if (dias >= plazo * 3) return '';
  var pregunta = preguntaDe('diasDesierto', 'carrera_compras');
  return pregunta && pregunta.aviso ? pregunta.aviso : '';
}

/**
 * Las tiendas de Turbo del cashback por ETA.
 *
 * Una fila sin nombre deja el documento sin la vinneta, y el mismo nombre dos
 * veces deja la clausula nombrando una tienda dos veces. Sin la lista entera la
 * clausula 5 no se puede escribir: es el mismo criterio de la lista de
 * productos de la Carrera.
 */
function validarTiendasEta(entrada, esquema) {
  // Solo la campana de tiendas concretas trae lista. Las de categoria nombran
  // la categoria y el listado es el que el usuario ve en la app.
  if (entrada.alcanceTurbo !== 'tiendas') return [];

  var tiendas = entrada.tiendasEta || [];
  var definicion = null;
  for (var i = 0; i < esquema.campos.length; i++) {
    if (esquema.campos[i].id === 'tiendasEta') definicion = esquema.campos[i];
  }
  var minimo = definicion && definicion.minimo !== undefined ? definicion.minimo : 1;
  var maximo = definicion && definicion.maximo !== undefined ? definicion.maximo : 60;

  if (tiendas.length < minimo) {
    return [error('tiendasEta', 'Agrega al menos ' + minimo +
      (minimo === 1 ? ' tienda de Turbo.' : ' tiendas de Turbo.'))];
  }
  if (tiendas.length > maximo) {
    return [error('tiendasEta', 'No puedes agregar más de ' + maximo + ' tiendas.')];
  }

  var errores = [];
  var vistas = {};
  for (var t = 0; t < tiendas.length; t++) {
    var nombre = String((tiendas[t] || {}).nombre || '').trim();
    var fila = t + 1;
    if (!nombre) {
      errores.push(error('tiendasEta', 'Tienda ' + fila + ': falta el nombre.'));
      continue;
    }
    var llave = nombre.toLowerCase();
    if (vistas[llave]) {
      errores.push(error('tiendasEta', 'Tienda ' + fila + ': esa tienda ya está en la lista.'));
    }
    vistas[llave] = true;
  }
  return errores;
}

/**
 * La categoria de la pieza que no deja hacer la campana.
 *
 * En Colombia no se hacen campanas de cashback, descuento ni concursos sobre
 * medicamentos, productos fitoterapeuticos, cigarrillos, tabaco calentado,
 * vapeadores ni otros productos con nicotina. Juan lo cerro el 20 de septiembre
 * de 2026. Fundamento: para el tabaco y la nicotina, la Ley 1335 de 2009 y la
 * Ley 2354 de 2024; para medicamentos y fitoterapeuticos, una regla de Legal CO
 * mas estricta que el Playbook Farmacias.
 *
 * La pregunta de la pieza no bloquea nunca el documento por estar sin responder
 * (el T&C no la usa), pero esta respuesta si: no es un dato que falte, es una
 * campana que no se puede hacer.
 */
function validarCategoriaDeLaPieza(entrada, pais, idioma) {
  if (!categoriaProhibida((pais || {}).codigo, entrada.categoriaProducto)) return [];
  return [error('categoriaProducto', mensajeDe('categoriaProducto', entrada.tipo, 'prohibida', idioma,
    'Esta campaña no se puede hacer.'))];
}

/**
 * Valida la solicitud completa.
 *
 * contexto: { fechaReferencia, usuarioEnEquipo, idioma, ampliacion }
 * `idioma` es el de la interfaz de quien pide (es o pt): los mensajes salen en
 * ese idioma cuando la pregunta los tiene traducidos. El documento no cambia.
 * `ampliacion` es true cuando se rearma el documento de una campana que ya
 * arranco: las fechas que ya pasaron dejan de ser un error.
 * Devuelve { valido, errores: [{campo, mensaje}] }.
 */
function validarSolicitud(entrada, pais, contexto) {
  var opciones = contexto || {};
  var errorPais = validarPais(pais, !!opciones.usuarioEnEquipo);
  if (errorPais) return { valido: false, errores: [errorPais] };

  var errorTipo = validarTipo(entrada.tipo, pais);
  if (errorTipo) return { valido: false, errores: [errorTipo] };

  var esquema = esquemaDe(entrada.tipo);
  var errorIdioma = validarIdiomaDelPais(esquema, pais);
  if (errorIdioma) return { valido: false, errores: [errorIdioma] };

  var errores = [];
  var idioma = opciones.idioma;

  errores = errores.concat(validarObligatorios(entrada, esquema, idioma));
  errores = errores.concat(validarFormatos(entrada, esquema, idioma));
  errores = errores.concat(validarVigencia(entrada, opciones.fechaReferencia, esquema, idioma, !!opciones.ampliacion));
  errores = errores.concat(validarOrganizador(entrada, pais));
  errores = errores.concat(validarCreditos(entrada, esquema, idioma));
  errores = errores.concat(validarNegocio(entrada, esquema));
  errores = errores.concat(validarNombreComercial(entrada, esquema, idioma));

  errores = errores.concat(validarColumnasDelPais(pais));
  errores = errores.concat(validarAnotacionesDelPais(pais));
  errores = errores.concat(validarCategoriaDeLaPieza(entrada, pais, idioma));

  // El cashback por ETA tiene los mismos dos numeros y el mismo riesgo: un tope
  // mayor que el presupuesto deja que la primera orden se lleve la campana.
  // El Cashback Multitienda tiene el mismo tope por pedido, y hasta ahora nadie
  // revisaba que fuera mayor que cero: con un 0 el documento salia prometiendo
  // un maximo de cero Creditos por pedido. No tiene presupuesto de campana
  // (cada tienda pone el suyo), asi que el cruce contra el presupuesto no aplica.
  if (entrada.tipo === 'cashback' || entrada.tipo === 'cashback_eta' || entrada.tipo === 'cashback_day') {
    errores = errores.concat(validarCashback(entrada, esquema.id, idioma));
  }
  if (esquema.esPorEta) {
    errores = errores.concat(validarEta(entrada, esquema.id, idioma));
    errores = errores.concat(validarTiendasEta(entrada, esquema));
  }
  if (entrada.tipo === 'carrera_compras') {
    errores = errores.concat(validarCarrera(entrada, esquema.id, idioma));
    errores = errores.concat(validarTiendasCarrera(entrada, esquema, idioma));
    errores = errores.concat(validarProductos(entrada, esquema));
  }
  if (esquema.esDeDescuento) {
    errores = errores.concat(validarDescuento(entrada, esquema.id, idioma));
    // La lista de productos con su EAN es la misma de la Carrera, y se revisa
    // igual: sin esto un EAN repetido o con el digito de control malo se
    // publicaba dentro de la clausula de Productos Participantes.
    errores = errores.concat(validarProductos(entrada, esquema));
  }
  if (entrada.tipo === 'cashback_day') {
    errores = errores.concat(validarTiendas(entrada, pais, esquema));
  }
  if (esquema && esquema.esDeTravel) {
    // Sin los datos de Travel del pais, o con el RNT vencido, no se genera.
    var estadoTravel = travelDisponible(pais, opciones.fechaReferencia);
    if (!estadoTravel.disponible) {
      return { valido: false, errores: [error('tipo', estadoTravel.motivo)] };
    }
    errores = errores.concat(validarTravel(entrada, pais, opciones.fechaReferencia, !!opciones.ampliacion));
  }

  return { valido: errores.length === 0, errores: errores };
}

if (typeof module !== 'undefined') {
  module.exports = {
    validarSolicitud: validarSolicitud,
    validarLinkPublicado: validarLinkPublicado,
    PREFIJO_PUBLICACION: PREFIJO_PUBLICACION,
    validarPais: validarPais,
    validarTipo: validarTipo,
    validarObligatorios: validarObligatorios,
    validarVigencia: validarVigencia,
    tieneMarcaDeAnotacion: tieneMarcaDeAnotacion,
    validarTiendas: validarTiendas,
    validarNegocio: validarNegocio,
    validarTravel: validarTravel,
    validarOrganizadorNoEsRappi: validarOrganizadorNoEsRappi,
    entidadesDeRappi: entidadesDeRappi,
    validarCashbackTravel: validarCashbackTravel,
    validarDescuentoTravel: validarDescuentoTravel,
    avisosDeTravel: avisosDeTravel,
    NOMBRES_PROHIBIDOS_DE_RAPPI: NOMBRES_PROHIBIDOS_DE_RAPPI,
    estaVacio: estaVacio,
    mensajeDe: mensajeDe,
    validarIdiomaDelPais: validarIdiomaDelPais,
    fechaFinDeLaCampana: fechaFinDeLaCampana,
    validarEta: validarEta,
    validarDescuento: validarDescuento,
    validarCategoriaDeLaPieza: validarCategoriaDeLaPieza,
    validarProductos: validarProductos,
    validarTiendasEta: validarTiendasEta,
    validarTiendasCarrera: validarTiendasCarrera,
    validarNombreComercial: validarNombreComercial,
    avisoDeDiasDesierto: avisoDeDiasDesierto,
    avisoDeMarcas: avisoDeMarcas,
    parecenVariasTiendas: parecenVariasTiendas,
    validarColumnasDelPais: validarColumnasDelPais,
  };
}
