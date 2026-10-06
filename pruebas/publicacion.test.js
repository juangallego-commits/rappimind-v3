'use strict';

/**
 * La publicacion en Squarespace: lo que se pega y como se revisa lo publicado.
 *
 * Lo que se protege aqui:
 *
 *   - Que lo que la herramienta entrega para pegar, pegado tal cual, se revise
 *     como identico. Si esto fallara, RappiMind le diria "tiene diferencias" a
 *     alguien que hizo todo bien, y la revision dejaria de creerse.
 *   - Que una diferencia de verdad (una cifra, un texto de mas, un final que
 *     falta) nunca pase como identica, y que el aviso diga donde esta.
 *   - Que la revision solo le pregunte a promos.rappi.com.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { generarTexto } = require('../src/core/generar.js');
const { estructuraDelDocumento, textoDelBloque } = require('../src/core/documento.js');
const P = require('../src/core/publicacion.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
const modelos = cargarModelos();

const BOGOTA = -18000000;

function textoDeCaso(caso) {
  const pais = paises.find((p) => p.codigo === caso.entrada.pais);
  return generarTexto(caso.entrada, pais, modelos, {
    fechaReferencia: caso.fecha_referencia,
    usuarioEnEquipo: caso.usuario_en_equipo === true,
  });
}

const CB01 = textoDeCaso(casos.find((c) => c.id === 'CB01')).texto;
const TITULO_CB01 = 'Jumbo MT · 50% Cashback · 17 sep 2026';

/** Lo que guarda Squarespace cuando se pega: el HTML dentro de sus bloques. */
function comoLoGuardaSquarespace(html) {
  return '<div class="sqs-layout sqs-grid-12 columns-12" data-type="item">' +
    '<div class="row sqs-row"><div class="col sqs-col-12 span-12">' +
    '<div class="sqs-block html-block sqs-block-html" data-block-type="2"><div class="sqs-block-content">' +
    html.replace(/<p>/g, '<p class="" style="white-space:pre-wrap;">') +
    '</div></div></div></div></div>';
}

/** Una respuesta de Squarespace con la forma real de ?format=json. */
function respuestaDeSquarespace(cuerpoHtml, cambios) {
  const item = Object.assign({
    recordType: 12,
    recordTypeLabel: 'event',
    workflowState: 1,
    publishOn: Date.UTC(2026, 8, 16, 20, 0),
    urlId: 'jumbo-mt-50-cashback-17-sep-2026',
    title: TITULO_CB01,
    body: cuerpoHtml,
    fullUrl: '/colombia/jumbo-mt-50-cashback-17-sep-2026',
    structuredContent: { _type: 'CalendarEvent' },
    startDate: Date.UTC(2026, 8, 17, 14, 0),
    endDate: Date.UTC(2026, 8, 18, 4, 59),
  }, cambios || {});
  return {
    codigo: 200,
    cuerpo: JSON.stringify({
      website: { primaryDomain: 'promos.rappi.com', timeZone: 'America/Bogota', timeZoneOffset: BOGOTA },
      collection: { urlId: 'colombia', typeName: 'events' },
      item,
    }),
  };
}

function esperadoCB01() {
  return P.esperadoDesdeTexto(CB01, { titulo: TITULO_CB01, fechaInicio: '2026-09-17', fechaFin: '2026-09-17' });
}

// --- Lo que se pega, pegado tal cual, es identico ---------------------------------

test('cada caso que genera, pegado con el botón de copiar, se revisa como idéntico', () => {
  let revisados = 0;
  for (const caso of casos) {
    if (caso.esperado.resultado !== 'genera') continue;
    const resultado = textoDeCaso(caso);
    if (!resultado.valido) continue;
    const esperado = P.esperadoDesdeTexto(resultado.texto, {});
    const respuesta = respuestaDeSquarespace(comoLoGuardaSquarespace(P.htmlParaSquarespace(resultado.texto)));
    const veredicto = P.verificarPublicacion(esperado, respuesta);
    assert.strictEqual(veredicto.estado, 'verificado', caso.id + ': ' + veredicto.detalle);
    revisados += 1;
  }
  assert.ok(revisados >= 30, 'se revisaron ' + revisados + ' casos, se esperaban al menos 30');
});

test('pegado como texto plano, con viñetas de carácter y espacios duros, también es idéntico', () => {
  const plano = P.textoPlanoParaSquarespace(CB01).split('\n')
    .map((linea) => '<p>' + linea.replace(/ /g, (espacio, i) => (i % 5 === 0 ? '&nbsp;' : ' ')) + '</p>')
    .join('');
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(plano));
  assert.strictEqual(veredicto.estado, 'verificado', veredicto.detalle);
});

test('la página sin la cabecera del documento sigue siendo idéntica: el evento ya lleva el título', () => {
  const sinCabecera = P.htmlParaSquarespace(CB01).replace(/<p style="text-align:center">[\s\S]*?<\/p>\n?/g, '');
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(comoLoGuardaSquarespace(sinCabecera)));
  assert.strictEqual(veredicto.estado, 'verificado', veredicto.detalle);
});

test('la cabecera con otras mayúsculas se acepta, pero con otra cifra no', () => {
  const html = P.htmlParaSquarespace(CB01);
  const otraCaja = html.replace('TÉRMINOS Y CONDICIONES', 'Términos y Condiciones');
  assert.strictEqual(P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(otraCaja)).estado, 'verificado');

  const otraCifra = html.replace('JUMBO MT · 50% CASHBACK', 'JUMBO MT · 60% CASHBACK');
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(otraCifra));
  assert.strictEqual(veredicto.estado, 'con_diferencias');
  assert.ok(veredicto.detalle.indexOf('60% CASHBACK') !== -1, veredicto.detalle);
});

test('lo esperado sale igual del texto del motor y de los párrafos del documento', () => {
  // Los parrafos como los devuelve el adaptador del Google Doc: el texto sin
  // marcas y si el parrafo esta centrado (titulo y subtitulo).
  const parrafos = estructuraDelDocumento(CB01).map((bloque) => ({
    texto: textoDelBloque(bloque),
    centrado: bloque.tipo === 'titulo' || bloque.tipo === 'subtitulo',
  }));
  const desdeParrafos = P.esperadoDesdeParrafos(parrafos, {});
  const desdeTexto = P.esperadoDesdeTexto(CB01, {});
  assert.deepStrictEqual(desdeParrafos.cabecera, desdeTexto.cabecera);
  assert.strictEqual(P.textoComparable(desdeParrafos.cuerpo.join('\n')), P.textoComparable(desdeTexto.cuerpo.join('\n')));
});

// --- Las diferencias de verdad se ven, y dicen donde estan ---------------------

test('una cifra cambiada es una diferencia, con lo que dice cada lado', () => {
  const html = comoLoGuardaSquarespace(P.htmlParaSquarespace(CB01))
    .replace('treinta mil (30.000) Créditos</strong> por pedido', 'cuarenta mil (40.000) Créditos</strong> por pedido');
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(html));
  assert.strictEqual(veredicto.estado, 'con_diferencias');
  assert.ok(veredicto.detalle.indexOf('“treinta mil (30.000) Créditos por pedido') !== -1, veredicto.detalle);
  assert.ok(veredicto.detalle.indexOf('“cuarenta mil (40.000) Créditos por pedido') !== -1, veredicto.detalle);
});

test('una tilde o una coma de diferencia también cuentan: es texto legal', () => {
  const html = comoLoGuardaSquarespace(P.htmlParaSquarespace(CB01));
  const sinTilde = html.replace('actúa únicamente', 'actua únicamente');
  assert.strictEqual(P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(sinTilde)).estado, 'con_diferencias');
  const sinComa = html.replace('quien responde por su desarrollo, sus condiciones', 'quien responde por su desarrollo sus condiciones');
  assert.strictEqual(P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(sinComa)).estado, 'con_diferencias');
});

test('un texto de más al final no pasa como idéntico', () => {
  const html = comoLoGuardaSquarespace(P.htmlParaSquarespace(CB01) + '<p>Aplican restricciones adicionales.</p>');
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(html));
  assert.strictEqual(veredicto.estado, 'con_diferencias');
  assert.strictEqual(veredicto.detalle,
    'La página tiene texto de más al final, que no está en el documento: “Aplican restricciones adicionales.”');
});

test('un texto de más antes del documento no pasa como idéntico', () => {
  const html = comoLoGuardaSquarespace('<p>Promoción exclusiva</p>' + P.htmlParaSquarespace(CB01));
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(html));
  assert.strictEqual(veredicto.estado, 'con_diferencias');
  assert.ok(veredicto.detalle.indexOf('Promoción exclusiva') !== -1, veredicto.detalle);
});

test('si el pegado quedó cortado, dice desde dónde falta', () => {
  const bloques = P.htmlParaSquarespace(CB01).split('\n');
  const cortado = bloques.slice(0, bloques.length - 6).join('\n');
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(comoLoGuardaSquarespace(cortado)));
  assert.strictEqual(veredicto.estado, 'con_diferencias');
  assert.ok(veredicto.detalle.indexOf('A la página le falta el final del documento') === 0, veredicto.detalle);
});

test('una página vacía es una diferencia, no una verificación', () => {
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace('<p> </p>'));
  assert.strictEqual(veredicto.estado, 'con_diferencias');
  assert.strictEqual(veredicto.detalle, 'La página publicada no tiene texto.');
});

test('el documento de otra campaña en la dirección de esta es una diferencia', () => {
  const otro = textoDeCaso(casos.find((c) => c.id === 'CB02')).texto;
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(comoLoGuardaSquarespace(P.htmlParaSquarespace(otro))));
  assert.strictEqual(veredicto.estado, 'con_diferencias');
});

// --- Lo que no cambia el veredicto pero se avisa -----------------------------------

test('el título y las fechas del evento se avisan sin cambiar el veredicto', () => {
  const html = comoLoGuardaSquarespace(P.htmlParaSquarespace(CB01));
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(html, {
    title: 'Jumbo cashback',
    startDate: Date.UTC(2026, 8, 18, 14, 0),
    endDate: Date.UTC(2026, 8, 20, 4, 59),
  }));
  assert.strictEqual(veredicto.estado, 'verificado');
  assert.deepStrictEqual(veredicto.avisos, [
    'El título del evento es “Jumbo cashback” y debería ser “Jumbo MT · 50% Cashback · 17 sep 2026”.',
    'El evento empieza el 18 de septiembre de 2026 y la campaña el 17 de septiembre de 2026.',
    'El evento termina el 19 de septiembre de 2026 y la campaña el 17 de septiembre de 2026.',
  ]);
});

test('las fechas del evento se leen en la hora del sitio, no en UTC', () => {
  // 11:59 p. m. del 17 en Bogota es el 18 en UTC: leerla en UTC daria un aviso falso.
  const html = comoLoGuardaSquarespace(P.htmlParaSquarespace(CB01));
  const veredicto = P.verificarPublicacion(esperadoCB01(), respuestaDeSquarespace(html, {
    startDate: Date.UTC(2026, 8, 17, 5, 1),
    endDate: Date.UTC(2026, 8, 18, 4, 59),
  }));
  assert.deepStrictEqual(veredicto.avisos, []);
  assert.strictEqual(veredicto.publicadoDesde, '2026-09-16 15:00');
});

// --- Lo que responde Squarespace ---------------------------------------------------

test('una dirección que no existe es "no publicado"', () => {
  assert.strictEqual(P.verificarPublicacion(esperadoCB01(), { codigo: 404, cuerpo: '<html>' }).estado, 'no_publicado');
  assert.strictEqual(P.verificarPublicacion(esperadoCB01(), { codigo: 410, cuerpo: '' }).estado, 'no_publicado');
});

test('un error de Squarespace o de la red nunca se lee como publicado ni como diferencia', () => {
  for (const respuesta of [
    { falla: 'Address unavailable' },
    { codigo: 500, cuerpo: '' },
    { codigo: 429, cuerpo: '' },
    { codigo: 403, cuerpo: '' },
    { codigo: 200, cuerpo: '<!DOCTYPE html><html>Sitio en mantenimiento</html>' },
    { codigo: 200, cuerpo: '{"website":{}}' },
  ]) {
    const veredicto = P.verificarPublicacion(esperadoCB01(), respuesta);
    assert.strictEqual(veredicto.estado, 'sin_verificar', JSON.stringify(respuesta));
  }
});

test('el enlace de la lista del país se distingue del de la campaña', () => {
  const veredicto = P.verificarPublicacion(esperadoCB01(), {
    codigo: 200, cuerpo: JSON.stringify({ collection: { urlId: 'colombia', typeName: 'events' }, items: [] }),
  });
  assert.strictEqual(veredicto.estado, 'sin_verificar');
  assert.strictEqual(veredicto.detalle, 'Ese enlace es la lista de eventos del país, no la página de esta campaña.');
});

test('sin documento para comparar no hay veredicto', () => {
  const html = comoLoGuardaSquarespace(P.htmlParaSquarespace(CB01));
  const veredicto = P.verificarPublicacion({ cabecera: [], cuerpo: [] }, respuestaDeSquarespace(html));
  assert.strictEqual(veredicto.estado, 'sin_verificar');
});

test('lee el evento con la forma real del JSON de promos.rappi.com', () => {
  // Recortado de https://promos.rappi.com/colombia/2026/descuentoprodselecc?format=json-pretty,
  // leido el 5 de octubre de 2026. Solo las llaves que usa la revision.
  const real = {
    website: { primaryDomain: 'promos.rappi.com', timeZone: 'America/Bogota', timeZoneOffset: -18000000 },
    item: {
      recordType: 12,
      workflowState: 1,
      publishOn: 1734636776400,
      urlId: '2026/descuentoprodselecc',
      title: 'Términos y Condiciones - Descuento en Productos Seleccionados',
      body: '<p>1. Objeto. Los presentes términos y condiciones (en adelante, “<strong>Términos y Condiciones</strong>”)</p>',
      fullUrl: '/colombia/2026/descuentoprodselecc',
      structuredContent: { _type: 'CalendarEvent', startDate: 1735707660991, endDate: 1798779540991 },
      startDate: 1735707660991,
      endDate: 1798779540991,
      recordTypeLabel: 'event',
    },
    collection: { urlId: 'colombia', typeName: 'events', itemCount: 9987 },
  };
  const evento = P.leerEventoDeSquarespace(JSON.stringify(real));
  assert.strictEqual(evento.ok, true);
  assert.strictEqual(evento.urlCompleta, '/colombia/2026/descuentoprodselecc');
  assert.strictEqual(P.textoComparable(P.textoDeHtmlPublicado(evento.cuerpoHtml)),
    '1. Objeto. Los presentes términos y condiciones (en adelante, “Términos y Condiciones”)');

  // El sitio dice "1 de enero de 2025 12:01 a. m." a "31 de diciembre de 2026 11:59 p. m.".
  const veredicto = P.veredictoDeLaPublicacion({
    cabecera: [], cuerpo: ['1. Objeto. Los presentes términos y condiciones (en adelante, “Términos y Condiciones”)'],
    titulo: '', fechaInicio: '2025-01-01', fechaFin: '2026-12-31',
  }, evento);
  assert.strictEqual(veredicto.estado, 'verificado');
  assert.deepStrictEqual(veredicto.avisos, []);
  assert.strictEqual(veredicto.publicadoDesde, '2024-12-19 14:32');
});

// --- Del HTML a texto ------------------------------------------------------------------

test('las etiquetas de en medio de una palabra no meten espacios, las de bloque sí', () => {
  assert.strictEqual(P.textoComparable(P.textoDeHtmlPublicado('“<strong>Créditos</strong>” de <em>Rappi</em>')), '“Créditos” de Rappi');
  assert.strictEqual(P.textoComparable(P.textoDeHtmlPublicado('<p>uno</p><p>dos</p><ul><li>tres</li></ul>uno<br>dos')), 'uno dos tres uno dos');
});

test('las entidades HTML se leen como el carácter que son', () => {
  assert.strictEqual(P.decodificarEntidadesHtml('T&amp;C &#8220;hola&#8221; &#x41; &aacute;rbol &nbsp;&lt;b&gt;'),
    'T&C “hola” A árbol  <b>');
  assert.strictEqual(P.decodificarEntidadesHtml('&noexiste; &#0;'), '&noexiste; &#0;');
});

test('los scripts, estilos y comentarios de la página no cuentan como texto', () => {
  assert.strictEqual(P.textoComparable(P.textoDeHtmlPublicado(
    '<style>p{color:red}</style><p>hola</p><script>var x = "<p>no</p>";</script><!-- nota -->')), 'hola');
});

test('lo que no se ve no es diferencia: espacios duros, caracteres invisibles y viñetas', () => {
  assert.strictEqual(P.textoComparable('a b​c  d\n• e\n- f\n● g'), 'a bc d e f g');
  assert.strictEqual(P.textoComparable('# TÍTULO\n## SUB\n**1. Uno.** texto'), 'TÍTULO SUB 1. Uno. texto');
});

// --- Lo que se pega ----------------------------------------------------------------

test('el HTML para pegar lleva negrillas y viñetas, y nunca una tabla', () => {
  for (const caso of casos) {
    if (caso.esperado.resultado !== 'genera') continue;
    const resultado = textoDeCaso(caso);
    if (!resultado.valido) continue;
    const html = P.htmlParaSquarespace(resultado.texto);
    assert.ok(html.indexOf('<table') === -1, caso.id + ' tiene una tabla');
    assert.ok(html.indexOf('**') === -1, caso.id + ' tiene marcas del motor');
    assert.ok(html.indexOf('{{') === -1 && html.indexOf('[[') === -1, caso.id + ' tiene marcadores');
  }
  const html = P.htmlParaSquarespace(CB01);
  assert.ok(html.indexOf('<p><strong>1. Organizador y rol de Rappi.</strong> La presente') !== -1);
  assert.ok(/<ul>\n<li>Realizar un pedido/.test(html));
});

test('el HTML para pegar escapa lo que escribió el comercial', () => {
  const html = P.htmlParaSquarespace('**1. Tienda.** La tienda <b>Mía</b> & "Cía"');
  assert.strictEqual(html, '<p><strong>1. Tienda.</strong> La tienda &lt;b&gt;Mía&lt;/b&gt; &amp; &quot;Cía&quot;</p>');
});

// --- Donde buscar --------------------------------------------------------------------

test('se revisa el enlace pegado y, si no hay, el que la herramienta propuso', () => {
  assert.strictEqual(P.enlaceParaRevisar({ link_publicado: 'https://promos.rappi.com/colombia/real', direccion_sugerida: 'x' }, 'colombia'),
    'https://promos.rappi.com/colombia/real');
  assert.strictEqual(P.enlaceParaRevisar({ link_publicado: '', direccion_sugerida: 'jumbo-mt-50-cashback-17-sep-2026' }, 'colombia'),
    'https://promos.rappi.com/colombia/jumbo-mt-50-cashback-17-sep-2026');
  // Un pais sin ruta de Squarespace no adivina la direccion.
  assert.strictEqual(P.enlaceParaRevisar({ direccion_sugerida: 'algo' }, ''), '');
  // Un enlace pegado fuera de promos.rappi.com no se revisa.
  assert.strictEqual(P.enlaceParaRevisar({ link_publicado: 'https://otro.com/x' }, 'colombia'), '');
});

test('el servidor solo le pide datos a promos.rappi.com', () => {
  assert.strictEqual(P.urlDeLecturaDeSquarespace('https://promos.rappi.com/colombia/x#arriba'), 'https://promos.rappi.com/colombia/x?format=json');
  assert.strictEqual(P.urlDeLecturaDeSquarespace('https://promos.rappi.com/colombia/x?a=1'), 'https://promos.rappi.com/colombia/x?a=1&format=json');
  assert.strictEqual(P.urlDeLecturaDeSquarespace('https://promos.rappi.com.otro.com/x'), '');
  assert.strictEqual(P.urlDeLecturaDeSquarespace('http://promos.rappi.com/x'), '');
  assert.strictEqual(P.urlDeLecturaDeSquarespace(''), '');
});

test('el identificador del documento sale de su enlace', () => {
  assert.strictEqual(P.idDeDocumentoDeGoogle('https://docs.google.com/document/d/1AbC-d_9/edit'), '1AbC-d_9');
  assert.strictEqual(P.idDeDocumentoDeGoogle('https://drive.google.com/file/x'), '');
});

test('las rutas de publicación salen de la fila de cada país', () => {
  const rutas = P.rutasDePublicacion(paises);
  assert.strictEqual(rutas.CO, 'colombia');
  assert.strictEqual(rutas.BR, undefined, 'un país sin ruta no entra');
});

// --- Que se revisa en cada corrida ------------------------------------------------------

function fila(cambios) {
  return Object.assign({
    id: 'RM-20261006-0001', fecha: '2026-10-06 09:00:00', pais: 'CO', link_doc: 'https://docs.google.com/document/d/a/edit',
    direccion_sugerida: 'campana', link_publicado: '', estado: 'generado',
    fecha_inicio: '2026-10-08', fecha_fin: '2026-10-08', verificacion: '', fecha_verificacion: '',
  }, cambios);
}

test('la corrida revisa lo reciente cada hora y lo demás una vez al día', () => {
  const rutas = { CO: 'colombia' };
  const filas = [
    fila({ id: 'termino', fecha_fin: '2026-10-05' }),
    fila({ id: 'reciente' }),
    fila({ id: 'reciente-revisada-hoy', fecha_verificacion: '2026-10-06 08:00:00', verificacion: 'no_publicado' }),
    fila({ id: 'verificada-hoy', verificacion: 'verificado', fecha_verificacion: '2026-10-06 08:00:00' }),
    fila({ id: 'verificada-ayer', verificacion: 'verificado', fecha_verificacion: '2026-10-05 08:00:00' }),
    fila({ id: 'vieja-sin-publicar', fecha: '2026-09-20 09:00:00', fecha_fin: '2026-12-31', verificacion: 'no_publicado', fecha_verificacion: '2026-10-05 10:00:00' }),
    fila({ id: 'vieja-revisada-hoy', fecha: '2026-09-20 09:00:00', fecha_fin: '2026-12-31', verificacion: 'no_publicado', fecha_verificacion: '2026-10-06 07:00:00' }),
    fila({ id: 'sin-pais-con-ruta', pais: 'BR' }),
    fila({ id: 'sin-documento', link_doc: '' }),
    fila({ id: 'con-diferencias', verificacion: 'con_diferencias', fecha_verificacion: '2026-10-06 08:00:00' }),
  ];
  const lote = P.solicitudesPorRevisar(filas, rutas, '2026-10-06', 40).map((r) => r.fila.id);
  assert.deepStrictEqual(lote, ['con-diferencias', 'reciente-revisada-hoy', 'reciente', 'vieja-sin-publicar', 'verificada-ayer']);
});

test('la corrida respeta el máximo', () => {
  const filas = [];
  for (let i = 0; i < 60; i++) filas.push(fila({ id: 'RM-' + i }));
  assert.strictEqual(P.solicitudesPorRevisar(filas, { CO: 'colombia' }, '2026-10-06', 40).length, 40);
  assert.strictEqual(P.solicitudesPorRevisar(filas, { CO: 'colombia' }, '2026-10-06').length, P.REVISIONES_POR_CORRIDA);
});

// --- Los estados -------------------------------------------------------------------------

test('una página que estaba y ya no está queda "retirada"', () => {
  assert.strictEqual(P.estadoDeVerificacionSiguiente('verificado', 'no_publicado'), 'retirado');
  assert.strictEqual(P.estadoDeVerificacionSiguiente('con_diferencias', 'no_publicado'), 'retirado');
  assert.strictEqual(P.estadoDeVerificacionSiguiente('', 'no_publicado'), 'no_publicado');
  assert.strictEqual(P.estadoDeVerificacionSiguiente('retirado', 'verificado'), 'verificado');
});

test('solo los cambios que importan mandan correo, y una sola vez', () => {
  assert.strictEqual(P.hayQueAvisarDeLaVerificacion('', 'verificado'), true);
  assert.strictEqual(P.hayQueAvisarDeLaVerificacion('verificado', 'verificado'), false);
  assert.strictEqual(P.hayQueAvisarDeLaVerificacion('verificado', 'con_diferencias'), true);
  assert.strictEqual(P.hayQueAvisarDeLaVerificacion('con_diferencias', 'con_diferencias'), false);
  assert.strictEqual(P.hayQueAvisarDeLaVerificacion('verificado', 'retirado'), true);
  assert.strictEqual(P.hayQueAvisarDeLaVerificacion('', 'no_publicado'), false);
  assert.strictEqual(P.hayQueAvisarDeLaVerificacion('verificado', 'sin_verificar'), false);
});

test('lo que queda guardado dice el veredicto, desde cuándo y los avisos', () => {
  assert.strictEqual(P.detalleParaGuardar({
    estado: 'verificado', detalle: 'El texto publicado es idéntico al documento generado.',
    publicadoDesde: '2026-10-06 09:15', avisos: ['El evento termina el 9 de octubre de 2026 y la campaña el 8 de octubre de 2026.'],
  }), 'El texto publicado es idéntico al documento generado. Publicado en Squarespace desde el 2026-10-06 09:15 (hora del sitio). ' +
    'El evento termina el 9 de octubre de 2026 y la campaña el 8 de octubre de 2026.');
});

test('la etiqueta del historial distingue verificado, con diferencias y retirado', () => {
  assert.deepStrictEqual(P.etiquetaDePublicacion({ estado: 'publicado', verificacion: 'verificado' }),
    { texto: 'Publicado y verificado', clase: 'estado-publicado' });
  assert.strictEqual(P.etiquetaDePublicacion({ estado: 'publicado', verificacion: 'con_diferencias' }).texto, 'Publicado con diferencias');
  assert.strictEqual(P.etiquetaDePublicacion({ estado: 'publicado', verificacion: 'retirado' }).texto, 'Ya no está publicado');
  assert.strictEqual(P.etiquetaDePublicacion({ estado: 'publicado', verificacion: '' }).texto, 'Publicado');
  assert.strictEqual(P.etiquetaDePublicacion({ estado: 'generado', verificacion: 'no_publicado' }).texto, 'Generado');
});

// --- Los correos -------------------------------------------------------------------------

const { correoDeVerificacion, correoDeGeneracion } = require('../src/core/correo.js');

test('el correo de la revisión solo sale para los tres cambios que importan', () => {
  assert.strictEqual(correoDeVerificacion({ estado: 'no_publicado' }), null);
  assert.strictEqual(correoDeVerificacion({ estado: 'sin_verificar' }), null);
  for (const estado of ['verificado', 'con_diferencias', 'retirado']) {
    const correo = correoDeVerificacion({ estado, nombreCampana: 'Jumbo MT', id: 'RM-1', enlace: 'https://promos.rappi.com/colombia/x' });
    assert.ok(correo.asunto.indexOf('Jumbo MT') !== -1, estado);
    assert.ok(correo.html.indexOf('https://promos.rappi.com/colombia/x') !== -1, estado);
  }
});

test('el correo de diferencias trae dónde está la diferencia y qué hacer; el de verificado no', () => {
  const diferencias = correoDeVerificacion({
    estado: 'con_diferencias', nombreCampana: 'Jumbo MT', id: 'RM-1',
    detalle: 'El documento dice “treinta mil” y la página dice “cuarenta mil”.',
    avisos: ['El evento termina el 9 de octubre de 2026 y la campaña el 8 de octubre de 2026.'],
  });
  assert.ok(diferencias.html.indexOf('treinta mil') !== -1);
  assert.ok(diferencias.html.indexOf('Qué hacer:') !== -1);
  assert.ok(diferencias.texto.indexOf('El evento termina el 9 de octubre') !== -1);

  const verificado = correoDeVerificacion({ estado: 'verificado', nombreCampana: 'Jumbo MT', id: 'RM-1', detalle: 'idéntico' });
  assert.ok(verificado.html.indexOf('Qué hacer:') === -1);
});

test('el correo de la revisión escapa el nombre de la campaña y el detalle', () => {
  const correo = correoDeVerificacion({
    estado: 'con_diferencias', nombreCampana: '<script>x</script>', id: 'RM-1', detalle: '<img src=x onerror=1>',
  });
  assert.ok(correo.html.indexOf('<script>') === -1 && correo.html.indexOf('<img') === -1);
});

test('con la dirección prevista, el correo de generación no manda a nadie a volver a pegar el enlace', () => {
  const conDireccion = correoDeGeneracion({
    nombreCampana: 'Jumbo MT', pais: 'Colombia', id: 'RM-1', urlApp: 'https://script.google.com/x',
    enlacePrevisto: 'https://promos.rappi.com/colombia/jumbo-mt',
  });
  assert.ok(conDireccion.html.indexOf('https://promos.rappi.com/colombia/jumbo-mt') !== -1);
  assert.ok(conDireccion.html.indexOf('revisa sola cada hora') !== -1);
  assert.ok(conDireccion.html.indexOf('vuelve a') === -1, 'no tiene que volver');
  assert.ok(conDireccion.texto.indexOf('revisa sola cada hora') !== -1);

  const sinDireccion = correoDeGeneracion({ nombreCampana: 'X', pais: 'Brasil', id: 'RM-2', urlApp: 'https://script.google.com/x' });
  assert.ok(sinDireccion.html.indexOf('pega ese enlace') !== -1);
});
