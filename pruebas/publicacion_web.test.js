'use strict';

/**
 * La publicacion sin Squarespace: el enlace, el archivo y su revision.
 *
 * Lo que se protege aqui:
 *
 *   - Que cada campana tenga su propio enlace y su propio archivo, y que el
 *     enlace se lea igual aunque una pieza le pegue ?utm_source o #algo.
 *   - Que el archivo lleve el documento como texto, nunca como HTML, y que lo
 *     que se publica, leido de vuelta, se revise como identico al documento.
 *   - Que una version nueva no borre las anteriores.
 *   - Que sin bucket todo siga como antes: la publicacion web esta apagada.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { cargarModelos, cargarLeyendas } = require('../scripts/lib/modelos');
const { generarTexto, generarLeyendasDeLaCampana } = require('../src/core/generar.js');
const { estructuraDelDocumento } = require('../src/core/documento.js');
const { paisDesdeFila } = require('../src/core/paises.js');
const P = require('../src/core/publicacion.js');
const W = require('../src/core/publicacion_web.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
const modelos = cargarModelos();

const CONFIG = W.configuracionDePublicacionWeb({ bucket: 'tyc-rappi' });

function textoDeCaso(caso) {
  const pais = paises.find((p) => p.codigo === caso.entrada.pais);
  return generarTexto(caso.entrada, pais, modelos, {
    fechaReferencia: caso.fecha_referencia,
    usuarioEnEquipo: caso.usuario_en_equipo === true,
  });
}

const CB01 = textoDeCaso(casos.find((c) => c.id === 'CB01')).texto;

function publicado(documento) {
  return { codigo: 200, cuerpo: W.jsonEnAscii(documento) };
}

// --- La configuracion --------------------------------------------------------------

test('sin bucket la publicación web está apagada, y dice por qué', () => {
  const apagada = W.configuracionDePublicacionWeb({});
  assert.strictEqual(apagada.activa, false);
  assert.ok(apagada.problema.indexOf('PUBLICACION_BUCKET') !== -1);
});

test('con bucket queda encendida, con la página /tyc y la carpeta tyc', () => {
  assert.deepStrictEqual(CONFIG, {
    activa: true, bucket: 'tyc-rappi', carpeta: 'tyc', visor: 'https://promos.rappi.com/tyc', paises: [], problema: '',
  });
});

test('un bucket, una carpeta o una página del visor mal escritos la dejan apagada', () => {
  assert.strictEqual(W.configuracionDePublicacionWeb({ bucket: 'Tyc Rappi' }).activa, false);
  assert.strictEqual(W.configuracionDePublicacionWeb({ bucket: 'tyc-rappi', carpeta: '../x' }).activa, false);
  assert.strictEqual(W.configuracionDePublicacionWeb({ bucket: 'tyc-rappi', visor: 'https://otro.com/tyc' }).activa, false);
  assert.strictEqual(W.configuracionDePublicacionWeb({ bucket: 'tyc-rappi', visor: 'https://promos.rappi.com/tyc?x' }).activa, false);
  assert.strictEqual(W.configuracionDePublicacionWeb({ bucket: 'tyc-rappi', visor: 'https://promos.rappi.com/terminos/' }).visor,
    'https://promos.rappi.com/terminos');
});

test('solo se publica sola en un país activo: uno en pruebas dice "no publiques"', () => {
  const colombia = { codigo: 'CO', estado: 'activo', ruta_promos: 'colombia' };
  assert.strictEqual(W.publicacionWebAplica(CONFIG, colombia), true);
  assert.strictEqual(W.publicacionWebAplica(CONFIG, Object.assign({}, colombia, { estado: 'piloto' })), false);
  assert.strictEqual(W.publicacionWebAplica(W.configuracionDePublicacionWeb({}), colombia), false);
});

test('sin lista, publican solos los países que hoy publican en promos.rappi.com', () => {
  const porCodigo = (codigo) => paises.find((p) => p.codigo === codigo);
  assert.strictEqual(W.publicacionWebAplica(CONFIG, porCodigo('CO')), true);
  assert.strictEqual(W.publicacionWebAplica(CONFIG, porCodigo('MX')), false, 'México no tiene ruta en promos.rappi.com');
  assert.strictEqual(W.publicacionWebAplica(CONFIG, porCodigo('BR')), false);

  const conLista = W.configuracionDePublicacionWeb({ bucket: 'tyc-rappi', paises: 'co, MX;cr' });
  assert.deepStrictEqual(conLista.paises, ['CO', 'MX', 'CR']);
  assert.strictEqual(W.publicacionWebAplica(conLista, porCodigo('MX')), true);
  assert.strictEqual(W.publicacionWebAplica(conLista, porCodigo('PE')), false);
  assert.strictEqual(W.configuracionDePublicacionWeb({ bucket: 'tyc-rappi', paises: 'Colombia' }).activa, false);
});

// --- El enlace -----------------------------------------------------------------------

test('cada campaña tiene su propio enlace, más corto que el del evento de hoy', () => {
  const enlace = W.enlaceWebDeLaCampana(CONFIG, 'CO', 'farmatodo-20-cashback-20-oct-2026');
  assert.strictEqual(enlace, 'https://promos.rappi.com/tyc?co/farmatodo-20-cashback-20-oct-2026');
  const deHoy = 'https://promos.rappi.com/colombia/farmatodo-20-cashback-20-oct-2026';
  assert.strictEqual(deHoy.length - enlace.length, 2);
  assert.notStrictEqual(W.enlaceWebDeLaCampana(CONFIG, 'CO', 'el-corral-50-cashback-21-oct-2026'), enlace);
});

test('sin una dirección válida no hay enlace', () => {
  assert.strictEqual(W.enlaceWebDeLaCampana(CONFIG, 'CO', ''), '');
  assert.strictEqual(W.enlaceWebDeLaCampana(CONFIG, 'COL', 'x'), '');
  assert.strictEqual(W.enlaceWebDeLaCampana(CONFIG, 'CO', 'Con Mayúsculas'), '');
  assert.strictEqual(W.enlaceWebDeLaCampana(CONFIG, 'CO', '../secreto'), '');
  assert.strictEqual(W.enlaceWebDeLaCampana(W.configuracionDePublicacionWeb({}), 'CO', 'x'), '');
});

test('el enlace se lee igual con lo que las piezas le pegan al final', () => {
  const esperado = { codigo: 'co', direccion: 'farmatodo-20-cashback-20-oct-2026', version: 0 };
  for (const enlace of [
    'https://promos.rappi.com/tyc?co/farmatodo-20-cashback-20-oct-2026',
    'https://promos.rappi.com/tyc?co/farmatodo-20-cashback-20-oct-2026&utm_source=push',
    'https://promos.rappi.com/tyc?co/farmatodo-20-cashback-20-oct-2026#arriba',
    'https://promos.rappi.com/tyc?co/farmatodo-20-cashback-20-oct-2026?fbclid=1',
    'https://promos.rappi.com/tyc/?co/farmatodo-20-cashback-20-oct-2026',
    'https://promos.rappi.com/tyc?co%2Ffarmatodo-20-cashback-20-oct-2026=',
    'https://promos.rappi.com/tyc?CO/Farmatodo-20-Cashback-20-Oct-2026',
    'https://promos.rappi.com/tyc?co/farmatodo-20-cashback-20-oct-2026/',
  ]) {
    assert.deepStrictEqual(W.rutaDesdeEnlaceWeb(CONFIG, enlace), esperado, enlace);
  }
  assert.deepStrictEqual(W.rutaDesdeEnlaceWeb(CONFIG, 'https://promos.rappi.com/tyc?co/farmatodo/v2'),
    { codigo: 'co', direccion: 'farmatodo', version: 2 });
});

test('un enlace de evento, de otro sitio o mal formado no es del visor', () => {
  for (const enlace of [
    'https://promos.rappi.com/colombia/farmatodo-20-cashback-20-oct-2026',
    'https://otro.com/tyc?co/farmatodo',
    'https://promos.rappi.com/tyc?co_farmatodo',
    'https://promos.rappi.com/tyc?co/farmatodo/v2/v3',
    'https://promos.rappi.com/tyc?co%E0%A4%A',
    'https://promos.rappi.com/tyc?co/../secreto',
    'https://promos.rappi.com/tyc?co/farmatodo/v0',
    'https://promos.rappi.com/tycx?co/farmatodo',
    '',
  ]) {
    assert.strictEqual(W.esEnlaceDelVisor(CONFIG, enlace), false, enlace);
  }
});

// --- El archivo ----------------------------------------------------------------------

test('el archivo vive en tyc/co/..., cada versión en su propio archivo', () => {
  assert.strictEqual(W.nombreDelObjetoWeb(CONFIG, 'CO', 'farmatodo'), 'tyc/co/farmatodo.json');
  assert.strictEqual(W.nombreDelObjetoWeb(CONFIG, 'CO', 'farmatodo', 2), 'tyc/co/farmatodo/v2.json');
  assert.strictEqual(W.urlPublicaDelObjetoWeb(CONFIG, 'tyc/co/farmatodo.json'), 'https://storage.googleapis.com/tyc-rappi/tyc/co/farmatodo.json');
  assert.strictEqual(W.urlDeSubidaWeb(CONFIG), 'https://storage.googleapis.com/upload/storage/v1/b/tyc-rappi/o?uploadType=multipart');
});

test('el archivo se escribe en ASCII y se lee igual, con tildes, eñes y comillas', () => {
  const original = { texto: 'Términos “Créditos” año ñandú á é í ó ú ü ç ã õ ·' };
  const ascii = W.jsonEnAscii(original);
  assert.ok(/^[\x00-\x7e]*$/.test(ascii), 'quedó algo fuera de ASCII');
  assert.deepStrictEqual(JSON.parse(ascii), original);
});

test('RappiMind lee lo que escribió por la API, sin pasar por la caché pública', () => {
  assert.strictEqual(W.urlDeLecturaPrivadaWeb(CONFIG, 'tyc/co/farmatodo.json'),
    'https://storage.googleapis.com/storage/v1/b/tyc-rappi/o/tyc%2Fco%2Ffarmatodo.json?alt=media');
});

test('lo que responde Cloud Storage al escribir se dice para quien lo tiene que arreglar', () => {
  assert.strictEqual(W.problemaDeCloudStorage(CONFIG, 200, ''), '');
  assert.ok(W.problemaDeCloudStorage(CONFIG, 401, '').indexOf('volver a autorizar') !== -1);
  assert.ok(W.problemaDeCloudStorage(CONFIG, 403, '{"error":{"message":"x does not have storage.objects.create access"}}').indexOf('no tiene permiso para escribir en el bucket "tyc-rappi"') !== -1);
  assert.ok(W.problemaDeCloudStorage(CONFIG, 403, '{"error":{"errors":[{"reason":"accessNotConfigured"}]}}').indexOf('no está habilitada') !== -1);
  assert.ok(W.problemaDeCloudStorage(CONFIG, 404, '').indexOf('no existe') !== -1);
  assert.ok(W.problemaDeCloudStorage(CONFIG, 503, '').indexOf('Se vuelve a intentar') !== -1);
});

test('la versión sale de las ampliaciones, y el texto se rehace con la fecha en que se armó', () => {
  assert.strictEqual(W.versionDeLaEntrada({}), 1);
  assert.strictEqual(W.versionDeLaEntrada({ modificaciones: [{ fecha: '2026-10-09' }, { fecha: '2026-10-12' }] }), 3);
  assert.strictEqual(W.fechaParaRehacerElTexto({ fecha: '2026-10-05 23:40:00' }, {}), '2026-10-05');
  assert.strictEqual(W.fechaParaRehacerElTexto({ fecha: '2026-10-05 23:40:00' }, { modificaciones: [{ fecha: '2026-10-09' }] }), '2026-10-09');
  assert.strictEqual(W.fechaParaRehacerElTexto({ fecha: '' }, {}), '');
});

test('de una publicación web solo se avisa lo que alguien tiene que saber', () => {
  const avisa = W.hayQueAvisarDeLaPublicacionWeb;
  assert.strictEqual(avisa('', 'verificado'), false, 'al generar avisa el correo de la generación');
  assert.strictEqual(avisa('', 'sin_publicar'), false);
  assert.strictEqual(avisa('sin_publicar', 'sin_publicar'), false, 'cada hora que sigue igual no es noticia');
  assert.strictEqual(avisa('sin_publicar', 'verificado'), true, 'quedó publicada después de reintentar');
  assert.strictEqual(avisa('sin_verificar', 'verificado'), false, 'una lectura que falló no era un problema');
  assert.strictEqual(avisa('verificado', 'con_diferencias'), true);
  assert.strictEqual(avisa('verificado', 'sin_publicar'), true, 'se dejó de ver y no se pudo reponer');
  assert.strictEqual(avisa('verificado', 'sin_verificar'), false);
  assert.strictEqual(avisa('verificado', 'dado_de_baja'), false);
});

test('la subida lleva los metadatos y el contenido en dos partes', () => {
  const cuerpo = W.cuerpoDeSubidaWeb({ name: 'tyc/co/x.json', cacheControl: W.CACHE_DEL_VIGENTE }, '{"a":1}', 'LIMITE');
  assert.strictEqual(cuerpo.split('--LIMITE').length, 4);
  assert.ok(cuerpo.indexOf('"cacheControl":"public, max-age=60"') !== -1);
  assert.ok(cuerpo.endsWith('--LIMITE--'));
});

test('el archivo lleva el documento como bloques de texto, nunca como HTML', () => {
  const documento = W.documentoWeb({
    id: 'RM-20261005-0001', codigoPais: 'CO', idioma: 'es', titulo: 'Jumbo MT · 50% Cashback · 17 sep 2026',
    fechaInicio: '2026-09-17', fechaFin: '2026-09-17', texto: CB01, version: 1, publicado: '2026-10-05 23:40:00',
  });
  assert.strictEqual(documento.formato, 1);
  assert.strictEqual(documento.pais, 'CO');
  assert.strictEqual(documento.bloques.length, estructuraDelDocumento(CB01).length);
  assert.deepStrictEqual(documento.versiones, [{ version: 1, publicado: '2026-10-05 23:40:00' }]);
  const json = JSON.stringify(documento);
  assert.ok(json.indexOf('<') === -1, 'el archivo no puede llevar etiquetas HTML');
  assert.ok(json.indexOf('**') === -1, 'el archivo no lleva las marcas del motor');
});

test('lo que el comercial escribió viaja como texto: un <script> no es una etiqueta', () => {
  const documento = W.documentoWeb({ texto: '**1. Tienda.** La tienda <script>alert(1)</script>', version: 1 });
  assert.strictEqual(documento.bloques[0].partes[1].texto, ' La tienda <script>alert(1)</script>');
});

test('una versión nueva conserva las anteriores, y reescribir la misma no la duplica', () => {
  const v1 = W.documentoWeb({ texto: 'a', version: 1, publicado: '2026-10-05 10:00:00' });
  const anteriores = W.versionesDelArchivoWeb(W.jsonEnAscii(v1));
  const v2 = W.documentoWeb({ texto: 'b', version: 2, publicado: '2026-10-09 08:00:00', versionesAnteriores: anteriores });
  assert.deepStrictEqual(v2.versiones.map((v) => v.version), [1, 2]);
  const v2otraVez = W.documentoWeb({ texto: 'b', version: 2, publicado: '2026-10-09 08:05:00', versionesAnteriores: v2.versiones });
  assert.deepStrictEqual(v2otraVez.versiones, [
    { version: 1, publicado: '2026-10-05 10:00:00' }, { version: 2, publicado: '2026-10-09 08:05:00' },
  ]);
  assert.deepStrictEqual(W.versionesDelArchivoWeb('esto no es json'), []);
});

test('retirar deja una marca en el enlace y conserva las versiones', () => {
  const v1 = W.documentoWeb({ id: 'RM-1', codigoPais: 'CO', titulo: 'X', texto: 'a', version: 1, publicado: '2026-10-05 10:00:00' });
  const retirado = W.documentoWebRetirado(v1, { fecha: '2026-10-06 09:00:00' });
  assert.strictEqual(retirado.retirado, true);
  assert.strictEqual(retirado.titulo, 'X');
  assert.ok(!retirado.bloques, 'el texto ya no se muestra');
  assert.deepStrictEqual(retirado.versiones, [{ version: 1, publicado: '2026-10-05 10:00:00' }]);
});

// --- La revision del archivo -----------------------------------------------------------

test('cada caso que genera, publicado por RappiMind, se revisa como idéntico', () => {
  let revisados = 0;
  for (const caso of casos) {
    if (caso.esperado.resultado !== 'genera') continue;
    const resultado = textoDeCaso(caso);
    if (!resultado.valido) continue;
    const archivo = W.documentoWeb({ texto: resultado.texto, version: 1, publicado: '2026-10-05 23:40:00' });
    const lectura = W.leerRespuestaDelArchivoWeb(publicado(archivo));
    assert.strictEqual(lectura.listo, false, caso.id);
    const veredicto = P.veredictoDeLaPublicacion(P.esperadoDesdeTexto(resultado.texto, {}), lectura.evento);
    assert.strictEqual(veredicto.estado, 'verificado', caso.id + ': ' + veredicto.detalle);
    revisados += 1;
  }
  assert.ok(revisados >= 30);
});

test('lo que queda escrito de una publicación web dice quién, cuándo y qué versión', () => {
  const archivo = W.documentoWeb({ titulo: 'Jumbo', texto: CB01, version: 2, publicado: '2026-10-09 08:00:00' });
  const veredicto = P.veredictoDeLaPublicacion(P.esperadoDesdeTexto(CB01, { titulo: 'Jumbo' }),
    W.leerRespuestaDelArchivoWeb(publicado(archivo)).evento);
  assert.strictEqual(P.detalleParaGuardar(veredicto),
    'El texto publicado es idéntico al documento generado. Publicado por RappiMind el 2026-10-09 08:00:00, versión 2.');
});

test('un archivo con otro texto es una diferencia', () => {
  const archivo = W.documentoWeb({ texto: CB01.replace('treinta mil (30.000)', 'cuarenta mil (40.000)'), version: 1 });
  const veredicto = P.veredictoDeLaPublicacion(P.esperadoDesdeTexto(CB01, {}),
    W.leerRespuestaDelArchivoWeb(publicado(archivo)).evento);
  assert.strictEqual(veredicto.estado, 'con_diferencias');
  assert.ok(veredicto.detalle.indexOf('cuarenta mil (40.000)') !== -1);
});

test('lo que responde Cloud Storage se traduce a un estado', () => {
  const estado = (respuesta) => W.leerRespuestaDelArchivoWeb(respuesta).resultado.estado;
  assert.strictEqual(estado({ codigo: 404, cuerpo: '' }), 'no_publicado');
  assert.strictEqual(estado({ codigo: 403, cuerpo: '' }), 'sin_verificar');
  assert.strictEqual(estado({ codigo: 500, cuerpo: '' }), 'sin_verificar');
  assert.strictEqual(estado({ codigo: 200, cuerpo: '<Error>' }), 'sin_verificar');
  assert.strictEqual(estado({ falla: 'timeout' }), 'sin_verificar');
  assert.strictEqual(estado(publicado(W.documentoWebRetirado({}, { fecha: '2026-10-06 09:00:00' }))), 'dado_de_baja');
});

test('la página del visor está en pie solo si responde y trae el código de RappiMind', () => {
  assert.strictEqual(W.estadoDelVisor({ codigo: 200, cuerpo: '<script>var MARCA = \'rappimind-tyc-visor\';</script>' }).estado, 'en_pie');
  assert.strictEqual(W.estadoDelVisor({ codigo: 200, cuerpo: '<p>Otra cosa</p>' }).estado, 'caido');
  // Si Squarespace quita el <script> y deja el resto del bloque, el visor no corre.
  assert.strictEqual(W.estadoDelVisor({ codigo: 200, cuerpo: '<div id="rappimind-tyc"></div>' }).estado, 'caido');
  assert.strictEqual(W.estadoDelVisor({ codigo: 404, cuerpo: '' }).estado, 'caido');
  assert.strictEqual(W.estadoDelVisor({ falla: 'x' }).estado, 'sin_verificar');
});

test('la corrida reintenta lo que no se pudo publicar y no mira lo retirado', () => {
  const base = {
    fecha: '2026-09-01 09:00:00', pais: 'CO', link_doc: 'https://docs.google.com/document/d/a/edit',
    link_publicado: 'https://promos.rappi.com/tyc?co/x', fecha_fin: '2026-12-31', estado: 'generado',
  };
  const filas = [
    Object.assign({}, base, { id: 'pendiente-vieja', verificacion: 'sin_publicar', fecha_verificacion: '2026-10-05 08:00:00' }),
    Object.assign({}, base, { id: 'retirada', verificacion: 'dado_de_baja' }),
  ];
  assert.deepStrictEqual(P.solicitudesPorRevisar(filas, { CO: 'colombia' }, '2026-10-05', 40).map((r) => r.fila.id), ['pendiente-vieja']);
});

test('el historial dice Publicando y Retirado', () => {
  assert.deepStrictEqual(P.etiquetaDePublicacion({ verificacion: 'sin_publicar' }), { texto: 'Publicando', clase: 'estado-generado' });
  assert.deepStrictEqual(P.etiquetaDePublicacion({ estado: 'publicado', verificacion: 'dado_de_baja' }), { texto: 'Retirado', clase: 'estado-vencido' });
});

// --- Las leyendas ---------------------------------------------------------------------------

test('las leyendas llevan el enlace del visor, y confirmarlo no las cambia', () => {
  const caso = casos.find((c) => c.id === 'CB01');
  const pais = paisDesdeFila(paises.find((p) => p.codigo === 'CO'));
  const LEYENDAS = cargarLeyendas();
  const enlace = W.enlaceWebDeLaCampana(CONFIG, 'CO', 'jumbo-mt-50-cashback-17-sep-2026');

  const porConfirmar = generarLeyendasDeLaCampana(caso.entrada, pais, LEYENDAS, {
    nombreCampana: 'Jumbo MT · 50% Cashback · 17 sep 2026', enlacePrevisto: enlace,
  });
  assert.strictEqual(porConfirmar.enlacePrevisto, enlace);
  assert.strictEqual(porConfirmar.enlaceConfirmado, false);
  assert.ok(porConfirmar.leyendas.some((l) => l.texto.indexOf(enlace) !== -1), 'ninguna leyenda lleva el enlace del visor');

  const confirmado = generarLeyendasDeLaCampana(caso.entrada, pais, LEYENDAS, {
    nombreCampana: 'Jumbo MT · 50% Cashback · 17 sep 2026', enlacePrevisto: enlace, enlacePublicado: enlace,
  });
  assert.strictEqual(confirmado.enlaceConfirmado, true);
  assert.strictEqual(confirmado.enlaceCambio, false, 'confirmar el mismo enlace no es un cambio');
});
