'use strict';

/**
 * La publicación sin Squarespace, de punta a punta contra los dobles de Google.
 *
 * Lo que decide (el enlace, el archivo, las versiones) está probado en
 * pruebas/publicacion_web.test.js. Aquí va lo que cruza fronteras: qué queda en
 * el bucket, qué queda en el Sheet, qué recibe la pantalla, a quién le llega
 * cada correo y qué pasa cuando Cloud Storage falla.
 */

const test = require('node:test');
const assert = require('node:assert');

const { levantarEntorno, solicitudValida } = require('./dobles/entorno.js');
const { bloqueParaSquarespace } = require('../scripts/visor.js');
const { rutaDesdeRaiz, leerTexto, listarArchivos } = require('../scripts/lib/archivos');

const BUCKET = 'tyc-rappi';
const DIRECCION = 'tienda-de-prueba-20-cashback-20-sep-2026';
const ENLACE = 'https://promos.rappi.com/tyc?co/' + DIRECCION;
const VIGENTE = 'tyc/co/' + DIRECCION + '.json';
const VISOR = 'https://promos.rappi.com/tyc';
const LEGAL = 'legal-co@rappi.com';

function conBucket(propiedades) {
  const mundo = levantarEntorno({
    propiedades: Object.assign({ PUBLICACION_BUCKET: BUCKET, CORREO_COPIA_LEGAL: LEGAL }, propiedades || {}),
  });
  setup();
  mundo.gcs.nombre = BUCKET;
  // La página /tyc en pie, con el bloque de verdad.
  mundo.paginas[VISOR] = { codigo: 200, cuerpo: '<div>' + bloqueParaSquarespace(configuracionWeb()) + '</div>' };
  return mundo;
}

function fila(id) {
  return filasPlanas(leerSolicitudes().filter((s) => s.id === id))[0];
}

function archivo(mundo, nombre) {
  const objeto = mundo.bucket[nombre || VIGENTE];
  return objeto ? JSON.parse(objeto.contenido) : null;
}

function tieneFechas(valor) {
  if (valor instanceof Date) return true;
  if (Array.isArray(valor)) return valor.some(tieneFechas);
  if (valor && typeof valor === 'object') return Object.keys(valor).some((k) => tieneFechas(valor[k]));
  return false;
}

/** Durante la campaña, que va del 20 al 21 de septiembre de 2026. */
function enCurso(mundo) {
  mundo.ahora = '2026-09-20T15:00:00Z';
}

/**
 * Al día siguiente. Una campaña verificada se revisa una vez al día
 * (solicitudesPorRevisar): la corrida del mismo día en que se publicó no la mira.
 */
function alDiaSiguiente(mundo) {
  mundo.ahora = '2026-09-17T15:00:00Z';
}

// --- Al generar ----------------------------------------------------------------------

test('generar publica sola: el archivo queda en el bucket y la campaña, publicada', () => {
  const mundo = conBucket();
  const resultado = generar(solicitudValida());

  assert.strictEqual(resultado.valido, true);
  assert.deepStrictEqual(
    { modo: resultado.publicacion.modo, estado: resultado.publicacion.estado, enlace: resultado.publicacion.enlace, version: resultado.publicacion.version },
    { modo: 'web', estado: 'verificado', enlace: ENLACE, version: 1 });
  assert.strictEqual(resultado.enlacePrevisto, ENLACE);
  assert.strictEqual(tieneFechas(resultado), false, 'a la pantalla no le puede llegar una fecha');

  // Dos archivos iguales: el vigente, con caché corta, y el de la versión 1.
  const vigente = mundo.bucket[VIGENTE];
  const version = mundo.bucket['tyc/co/' + DIRECCION + '/v1.json'];
  assert.strictEqual(vigente.contenido, version.contenido);
  assert.strictEqual(vigente.cache, 'public, max-age=60');
  assert.strictEqual(version.cache, 'public, max-age=86400');
  assert.ok(/^[\x00-\x7e]*$/.test(vigente.contenido), 'el archivo va en ASCII');

  const publicado = archivo(mundo);
  assert.strictEqual(publicado.id, resultado.id);
  assert.strictEqual(publicado.titulo, resultado.nombreCampana);
  assert.strictEqual(textoDeLosBloquesWeb(publicado.bloques), textoDeLosBloquesWeb(bloquesParaLaWeb(resultado.texto)));
  assert.deepStrictEqual(publicado.vigencia, { inicio: '2026-09-20', fin: '2026-09-21' });

  const guardada = fila(resultado.id);
  assert.strictEqual(guardada.link_publicado, ENLACE);
  assert.strictEqual(guardada.estado, 'publicado');
  assert.strictEqual(guardada.verificacion, 'verificado');
  assert.ok(guardada.detalle_verificacion.indexOf('Publicado por RappiMind') !== -1, guardada.detalle_verificacion);
});

test('las subidas van con la cuenta de RappiMind y la revisión, sin sesión', () => {
  const mundo = conBucket();
  generar(solicitudValida());
  const subidas = mundo.pedidos.filter((p) => p.url.indexOf('/upload/storage/v1/b/' + BUCKET + '/o') !== -1);
  assert.strictEqual(subidas.length, 2);
  for (const subida of subidas) assert.strictEqual(subida.opciones.headers.Authorization, 'Bearer token-de-prueba');
  const publicas = mundo.pedidos.filter((p) => p.url.indexOf('https://storage.googleapis.com/' + BUCKET + '/') === 0);
  assert.strictEqual(publicas.length, 1);
  assert.ok(!publicas[0].opciones.headers, 'la lectura pública no lleva token');
  assert.ok(publicas[0].url.endsWith('/v1.json'), 'se lee la versión, que no está en caché');
});

test('las leyendas salen con el enlace definitivo, ya confirmado', () => {
  conBucket();
  const resultado = generar(solicitudValida());
  assert.strictEqual(resultado.leyendas.enlaceConfirmado, true);
  assert.strictEqual(resultado.leyendas.enlaceCambio, false);
  assert.ok(resultado.leyendas.leyendas.some((l) => l.texto.indexOf(ENLACE) !== -1));
});

test('el correo de la generación dice dónde quedó publicado, sin pasos de Squarespace', () => {
  const mundo = conBucket();
  generar(solicitudValida());
  assert.strictEqual(mundo.correos.length, 1, 'un solo correo: el de la generación');
  const correo = mundo.correos[0];
  assert.ok(correo.subject.indexOf('Tus T&C están publicados') === 0, correo.subject);
  assert.ok(correo.htmlBody.indexOf(ENLACE) !== -1);
  assert.ok(correo.htmlBody.indexOf('Ya están publicados') !== -1);
  assert.ok(correo.htmlBody.indexOf('Squarespace') === -1 || correo.htmlBody.indexOf('No tienes que entrar a Squarespace') !== -1);
  assert.ok(correo.htmlBody.indexOf('Para publicarlos') === -1);
});

test('estadoInicial dice qué países publica RappiMind solos', () => {
  conBucket();
  assert.deepStrictEqual(estadoInicial().publicacionWeb, { activa: true, visor: VISOR, paises: ['CO'] });
});

// --- Cuando Cloud Storage falla --------------------------------------------------------------

test('sin permiso en el bucket la campaña se genera igual y queda publicándose', () => {
  const mundo = conBucket();
  mundo.gcs.subida = { codigo: 403, cuerpo: '{"error":{"message":"juan does not have storage.objects.create access"}}' };
  const resultado = generar(solicitudValida());

  assert.strictEqual(resultado.valido, true);
  assert.strictEqual(resultado.publicacion.estado, 'sin_publicar');
  assert.ok(resultado.publicacion.detalle.indexOf('no tiene permiso para escribir en el bucket "tyc-rappi"') !== -1);
  assert.strictEqual(resultado.publicacion.enlace, ENLACE, 'el enlace ya es el definitivo');
  assert.strictEqual(resultado.leyendas.enlaceConfirmado, false);
  assert.ok(resultado.leyendas.leyendas.some((l) => l.texto.indexOf(ENLACE) !== -1));

  const guardada = fila(resultado.id);
  assert.strictEqual(guardada.verificacion, 'sin_publicar');
  assert.strictEqual(guardada.link_publicado, ENLACE);
  assert.strictEqual(guardada.estado, 'generado');
  assert.ok(mundo.correos[0].htmlBody.indexOf('Los estamos publicando') !== -1);
});

test('la corrida de cada hora la publica cuando el bucket se arregla, y avisa', () => {
  const mundo = conBucket();
  mundo.gcs.subida = { codigo: 403, cuerpo: '' };
  const resultado = generar(solicitudValida());
  const correosAntes = mundo.correos.length;

  revisarPublicacionesPendientes();
  assert.strictEqual(fila(resultado.id).verificacion, 'sin_publicar', 'sigue sin permiso');
  assert.strictEqual(mundo.correos.length, correosAntes, 'una hora más igual no es noticia');

  mundo.gcs.subida = null;
  revisarPublicacionesPendientes();
  const guardada = fila(resultado.id);
  assert.strictEqual(guardada.verificacion, 'verificado');
  assert.strictEqual(guardada.estado, 'publicado');
  assert.ok(archivo(mundo));

  const avisos = mundo.correos.slice(correosAntes);
  assert.strictEqual(avisos.length, 1);
  assert.ok(avisos[0].subject.indexOf('Tus T&C ya están publicados') === 0, avisos[0].subject);
  assert.strictEqual(avisos[0].cc, undefined, 'quedó bien: Legal no va en copia');
  assert.ok(objetosDe('Registro').some((r) => r.accion === 'publicar_web_repuesto'));
});

test('si la red se cae al publicar, generar no se cae', () => {
  const mundo = conBucket();
  const original = UrlFetchApp.fetch;
  UrlFetchApp.fetch = function () { throw new Error('Address unavailable'); };
  try {
    const resultado = generar(solicitudValida());
    assert.strictEqual(resultado.valido, true);
    assert.strictEqual(resultado.publicacion.estado, 'sin_publicar');
    assert.ok(resultado.publicacion.detalle.indexOf('No pudimos conectarnos con Cloud Storage') !== -1);
    assert.ok(mundo.documentos[Object.keys(mundo.documentos)[0]], 'el documento se quedó');
  } finally {
    UrlFetchApp.fetch = original;
  }
});

test('un bucket sin lectura pública no cuenta como publicado', () => {
  const mundo = conBucket();
  mundo.gcs.publico = false;
  const resultado = generar(solicitudValida());
  assert.strictEqual(resultado.publicacion.estado, 'sin_publicar');
  assert.ok(resultado.publicacion.detalle.indexOf('lectura pública') !== -1, resultado.publicacion.detalle);
  assert.ok(archivo(mundo), 'el archivo sí quedó escrito');
});

test('nunca pisa el archivo de otra solicitud', () => {
  const mundo = conBucket();
  const ajeno = '{"formato":1,"id":"RM-OTRA","bloques":[],"versiones":[]}';
  mundo.bucket[VIGENTE] = { contenido: ajeno, cache: 'public, max-age=60' };
  const resultado = generar(solicitudValida());
  assert.strictEqual(resultado.publicacion.estado, 'sin_publicar');
  assert.ok(resultado.publicacion.detalle.indexOf('RM-OTRA') !== -1);
  assert.strictEqual(mundo.bucket[VIGENTE].contenido, ajeno);
});

// --- Donde no aplica -------------------------------------------------------------------

test('un país fuera de la lista sigue por Squarespace, como siempre', () => {
  const mundo = conBucket({ PUBLICACION_PAISES: 'MX' });
  const resultado = generar(solicitudValida());
  assert.strictEqual(resultado.publicacion, null);
  assert.strictEqual(resultado.enlacePrevisto, 'https://promos.rappi.com/colombia/' + DIRECCION);
  assert.deepStrictEqual(Object.keys(mundo.bucket), []);
  assert.strictEqual(fila(resultado.id).link_publicado, '');
  assert.ok(mundo.correos[0].htmlBody.indexOf('Para publicarlos') !== -1);
});

test('sin bucket nada cambia y la interfaz lo sabe', () => {
  levantarEntorno({});
  setup();
  const resultado = generar(solicitudValida());
  assert.strictEqual(resultado.publicacion, null);
  assert.deepStrictEqual(estadoInicial().publicacionWeb, { activa: false, visor: VISOR, paises: [] });
});

test('no se le puede pegar otro enlace a una campaña que publicó RappiMind', () => {
  conBucket();
  const resultado = generar(solicitudValida());
  const respuesta = marcarPublicado(resultado.id, 'https://promos.rappi.com/colombia/otra-cosa');
  assert.strictEqual(respuesta.valido, false);
  assert.ok(respuesta.errores[0].mensaje.indexOf('RappiMind publicó esta campaña') !== -1);
  assert.strictEqual(fila(resultado.id).link_publicado, ENLACE);
});

// --- Ampliar ------------------------------------------------------------------------------

test('ampliar publica la versión nueva en el mismo enlace y guarda la anterior', () => {
  const mundo = conBucket();
  const generado = generar(solicitudValida());
  const v1 = mundo.bucket['tyc/co/' + DIRECCION + '/v1.json'].contenido;
  const correosAntes = mundo.correos.length;

  enCurso(mundo);
  const ampliada = ampliarCampana(generado.id, { fechaFin: '2026-09-25', horaFin: '23:59' });
  assert.strictEqual(ampliada.valido, true, JSON.stringify(ampliada.errores));
  assert.strictEqual(ampliada.publicacion.estado, 'verificado');
  assert.strictEqual(ampliada.publicacion.enlace, ENLACE);
  assert.strictEqual(ampliada.publicacion.version, 2);
  assert.strictEqual(tieneFechas(ampliada), false);

  const vigente = archivo(mundo);
  assert.strictEqual(vigente.version, 2);
  assert.deepStrictEqual(vigente.versiones.map((v) => v.version), [1, 2]);
  assert.strictEqual(mundo.bucket['tyc/co/' + DIRECCION + '/v1.json'].contenido, v1, 'la versión 1 no se toca');
  assert.ok(textoDeLosBloquesWeb(vigente.bloques).indexOf('25 de septiembre de 2026') !== -1);

  const guardada = fila(generado.id);
  assert.strictEqual(guardada.verificacion, 'verificado');
  assert.ok(guardada.detalle_verificacion.indexOf('versión 2') !== -1, guardada.detalle_verificacion);
  assert.strictEqual(mundo.correos.length, correosAntes, 'la pantalla ya lo cuenta');

  // Y la revisión de la hora siguiente la encuentra idéntica al documento nuevo.
  revisarPublicacionesPendientes();
  assert.strictEqual(fila(generado.id).verificacion, 'verificado');
});

test('si la subida de la ampliación falla, la corrida publica la versión que va', () => {
  const mundo = conBucket();
  const generado = generar(solicitudValida());
  enCurso(mundo);
  mundo.gcs.subida = { codigo: 503, cuerpo: '' };
  const ampliada = ampliarCampana(generado.id, { fechaFin: '2026-09-25', horaFin: '23:59' });
  assert.strictEqual(ampliada.publicacion.estado, 'sin_publicar');
  assert.strictEqual(archivo(mundo).version, 1, 'el enlace sigue mostrando la versión 1');

  mundo.gcs.subida = null;
  revisarPublicacionesPendientes();
  assert.strictEqual(archivo(mundo).version, 2);
  assert.strictEqual(fila(generado.id).verificacion, 'verificado');
});

// --- La corrida de cada hora ---------------------------------------------------------------

test('si el archivo desaparece, la corrida lo repone y lo deja escrito', () => {
  const mundo = conBucket();
  const generado = generar(solicitudValida());
  mundo.bucket = {};

  revisarPublicacionesPendientes();
  assert.strictEqual(Object.keys(mundo.bucket).length, 0, 'el mismo día no se mira lo que ya se verificó');

  alDiaSiguiente(mundo);
  revisarPublicacionesPendientes();
  assert.ok(archivo(mundo), 'volvió a estar');
  assert.strictEqual(fila(generado.id).verificacion, 'verificado');
  const repuesto = objetosDe('Registro').filter((r) => r.accion === 'publicar_web_repuesto');
  assert.strictEqual(repuesto.length, 1);
  assert.ok(repuesto[0].detalle.indexOf('el archivo no estaba en el bucket') !== -1);
});

test('no publica un texto que ya no es idéntico al documento', () => {
  const mundo = conBucket();
  mundo.gcs.subida = { codigo: 403, cuerpo: '' };
  const generado = generar(solicitudValida());
  mundo.gcs.subida = null;

  // Alguien editó el documento después de generarlo.
  const documento = mundo.documentos[Object.keys(mundo.documentos)[0]];
  const parrafo = documento.cuerpo.hijos.find((p) => p.getText().indexOf('Organizador de Prueba') !== -1);
  parrafo.texto.texto = parrafo.texto.texto.replace('Organizador de Prueba S.A.S.', 'Rappi S.A.S.');

  revisarPublicacionesPendientes();
  const guardada = fila(generado.id);
  assert.strictEqual(guardada.verificacion, 'sin_publicar');
  assert.ok(guardada.detalle_verificacion.indexOf('no es idéntico al documento') !== -1, guardada.detalle_verificacion);
  assert.deepStrictEqual(Object.keys(mundo.bucket), [], 'no se publicó nada');
});

test('lo publicado distinto del documento se avisa con Legal en copia, y no se pisa', () => {
  const mundo = conBucket();
  const generado = generar(solicitudValida());
  const alterado = archivo(mundo);
  alterado.bloques[3].partes[0].texto = 'Texto cambiado a mano en el bucket. ';
  mundo.bucket[VIGENTE].contenido = jsonEnAscii(alterado);
  const correosAntes = mundo.correos.length;

  alDiaSiguiente(mundo);
  revisarPublicacionesPendientes();
  assert.strictEqual(fila(generado.id).verificacion, 'con_diferencias');
  assert.strictEqual(mundo.bucket[VIGENTE].contenido, jsonEnAscii(alterado), 'RappiMind no lo pisa por su cuenta');
  const aviso = mundo.correos.slice(correosAntes);
  assert.strictEqual(aviso.length, 1);
  assert.strictEqual(aviso[0].cc, LEGAL);
  assert.ok(aviso[0].htmlBody.indexOf('Lo publicado no coincide con el documento') !== -1);

  mundo.ahora = '2026-09-18T15:00:00Z';
  revisarPublicacionesPendientes();
  assert.strictEqual(mundo.correos.length, correosAntes + 1, 'el mismo estado no vuelve a escribir');
});

test('"Revisar ahora" sobre una campaña web devuelve leyendas que no cambiaron', () => {
  const mundo = conBucket();
  mundo.gcs.subida = { codigo: 403, cuerpo: '' };
  const generado = generar(solicitudValida());
  mundo.gcs.subida = null;

  const revision = revisarPublicacion(generado.id);
  assert.strictEqual(revision.verificacion.estado, 'verificado');
  assert.strictEqual(revision.linkPublicado, ENLACE);
  assert.strictEqual(revision.leyendas.enlaceCambio, false);
  assert.strictEqual(tieneFechas(revision), false);
});

// --- Retirar --------------------------------------------------------------------------------

test('retirar deja el enlace diciendo que se retiró, y ya no se publica sola', () => {
  const mundo = conBucket();
  const generado = generar(solicitudValida());

  const respuesta = retirarPublicacion(generado.id);
  assert.strictEqual(respuesta.valido, true, JSON.stringify(respuesta.errores));
  assert.strictEqual(respuesta.verificacion.estado, 'dado_de_baja');
  assert.strictEqual(tieneFechas(respuesta), false);

  const retirado = archivo(mundo);
  assert.strictEqual(retirado.retirado, true);
  assert.ok(!retirado.bloques);
  assert.deepStrictEqual(retirado.versiones.map((v) => v.version), [1]);
  assert.ok(mundo.bucket['tyc/co/' + DIRECCION + '/v1.json'], 'la versión queda como constancia');
  assert.strictEqual(fila(generado.id).verificacion, 'dado_de_baja');

  revisarPublicacionesPendientes();
  assert.strictEqual(archivo(mundo).retirado, true, 'la corrida no la vuelve a publicar');

  assert.strictEqual(retirarPublicacion(generado.id).valido, false, 'no se retira dos veces');
  enCurso(mundo);
  const ampliar = ampliarCampana(generado.id, { fechaFin: '2026-09-25', horaFin: '23:59' });
  assert.strictEqual(ampliar.valido, false);
  assert.ok(ampliar.errores[0].mensaje.indexOf('retiró') !== -1);
});

test('una campaña que ya arrancó no se retira', () => {
  const mundo = conBucket();
  const generado = generar(solicitudValida());
  enCurso(mundo);
  const respuesta = retirarPublicacion(generado.id);
  assert.strictEqual(respuesta.valido, false);
  assert.ok(respuesta.errores[0].mensaje.indexOf('ya arrancó') !== -1);
  assert.strictEqual(archivo(mundo).retirado, undefined);
});

test('solo retira quien la generó, Legal o un administrador, y solo lo que publicó RappiMind', () => {
  const mundo = conBucket();
  const generado = generar(solicitudValida());
  mundo.correo = 'otro.comercial@rappi.com';
  assert.strictEqual(retirarPublicacion(generado.id).errores[0].mensaje, 'Esa solicitud no es tuya.');

  mundo.correo = 'juan.gallego@rappi.com';
  const conSquarespace = conBucket({ PUBLICACION_PAISES: 'MX' });
  const deSquarespace = generar(solicitudValida());
  assert.ok(retirarPublicacion(deSquarespace.id).errores[0].mensaje.indexOf('no la publicó RappiMind') !== -1);
  assert.deepStrictEqual(Object.keys(conSquarespace.bucket), []);
});

// --- La página /tyc --------------------------------------------------------------------------

test('la página /tyc: avisa a Legal cuando se cae y cuando vuelve, una vez cada cosa', () => {
  const mundo = conBucket();
  revisarPublicacionesPendientes();
  assert.strictEqual(mundo.propiedades.VISOR_ESTADO, 'en_pie');
  assert.strictEqual(mundo.correos.length, 0, 'verla en pie la primera vez no es noticia');

  // Alguien borró el bloque de código.
  mundo.paginas[VISOR] = { codigo: 200, cuerpo: '<div>Otra cosa</div>' };
  revisarPublicacionesPendientes();
  revisarPublicacionesPendientes();
  assert.strictEqual(mundo.propiedades.VISOR_ESTADO, 'caido');
  assert.strictEqual(mundo.correos.length, 1, 'un solo aviso aunque siga caída');
  assert.strictEqual(mundo.correos[0].to, LEGAL);
  assert.ok(mundo.correos[0].subject.indexOf('no los está mostrando') !== -1);

  mundo.paginas[VISOR] = { codigo: 200, cuerpo: '<div>' + bloqueParaSquarespace(configuracionWeb()) + '</div>' };
  revisarPublicacionesPendientes();
  assert.strictEqual(mundo.correos.length, 2);
  assert.ok(mundo.correos[1].subject.indexOf('volvió a funcionar') !== -1);
});

test('sin correo de Legal, el aviso de la página les llega a los administradores', () => {
  const mundo = conBucket({ CORREO_COPIA_LEGAL: '' });
  mundo.paginas[VISOR] = { codigo: 404, cuerpo: '' };
  revisarPublicacionesPendientes();
  assert.strictEqual(mundo.correos.length, 1);
  assert.ok(mundo.correos[0].to.indexOf('juan.gallego@rappi.com') !== -1, mundo.correos[0].to);
});

// --- La preparación ------------------------------------------------------------------------

test('prepararPublicacionWeb publica la prueba, revisa la página y dice qué abrir', () => {
  const mundo = conBucket();
  const informe = prepararPublicacionWeb();
  assert.ok(informe.indexOf('1. La prueba quedó escrita en el bucket y se lee en público.') !== -1, informe);
  assert.ok(informe.indexOf('2. La página https://promos.rappi.com/tyc tiene el bloque de RappiMind.') !== -1, informe);
  assert.ok(informe.indexOf('https://promos.rappi.com/tyc?zz/prueba-de-rappimind') !== -1, informe);
  assert.ok(archivo(mundo, 'tyc/zz/prueba-de-rappimind.json'));
  assert.strictEqual(mundo.correos.length, 0);
});

test('prepararPublicacionWeb dice qué falta, en palabras de quien lo tiene que arreglar', () => {
  const mundo = conBucket();
  mundo.gcs.subida = { codigo: 403, cuerpo: '{"error":{"errors":[{"reason":"accessNotConfigured"}]}}' };
  mundo.paginas[VISOR] = { codigo: 404, cuerpo: '' };
  const informe = prepararPublicacionWeb();
  assert.ok(informe.indexOf('1. La prueba no quedó publicada: La API de Cloud Storage no está habilitada') !== -1, informe);
  assert.ok(informe.indexOf('2. La página del visor no está lista: La página del visor respondió 404') !== -1, informe);

  levantarEntorno({});
  setup();
  assert.ok(prepararPublicacionWeb().indexOf('Falta PUBLICACION_BUCKET') !== -1);
});

test('prepararPublicacionWeb no toca el estado guardado de la página, para que la corrida avise', () => {
  const mundo = conBucket();
  revisarPublicacionesPendientes();
  mundo.paginas[VISOR] = { codigo: 404, cuerpo: '' };
  prepararPublicacionWeb();
  assert.strictEqual(mundo.propiedades.VISOR_ESTADO, 'en_pie');
  revisarPublicacionesPendientes();
  assert.strictEqual(mundo.correos.length, 1, 'la corrida sí ve que se cayó y avisa');
});

test('desde el navegador, solo un administrador prepara la publicación o apaga la revisión', () => {
  const mundo = conBucket();
  mundo.correo = 'otro.comercial@rappi.com';
  assert.throws(() => prepararPublicacionWeb(), /Solo los administradores/);
  assert.throws(() => quitarRevisionAutomatica(), /Solo los administradores/);
  assert.deepStrictEqual(Object.keys(mundo.bucket), []);
  assert.strictEqual(mundo.disparadores.length, 1, 'la revisión sigue instalada');
});

// --- Lo que el navegador no puede llamar -----------------------------------------------

test('lo que escribe, lee o escribe correos con la cuenta de quien despliega no se llama desde el navegador', () => {
  // google.script.run llama cualquier función global que no termine en "_", y
  // la web app corre como quien la despliega. Sin el "_", cualquier cuenta
  // @rappi.com podría publicar un texto en promos.rappi.com/tyc, leer un Doc de
  // Legal o mandar un correo como RappiMind con solo abrir la consola.
  const declaradas = new Set();
  for (const archivo of listarArchivos(rutaDesdeRaiz('src', 'server'), '.js')) {
    const fuente = leerTexto(rutaDesdeRaiz('src', 'server', archivo));
    for (const encontrada of fuente.matchAll(/^function ([A-Za-z0-9_]+)\s*\(/gm)) declaradas.add(encontrada[1]);
  }
  const sensibles = [
    'subirObjetoWeb', 'leerObjetoWebPrivado', 'leerObjetoWebPublico', 'publicarVersionWeb', 'textoParaVolverAPublicar',
    'volverAPublicarWeb', 'revisarArchivoWeb', 'guardarPublicacionWeb', 'revisarYGuardarWeb', 'publicarAlGenerar',
    'retirarArchivoWeb', 'revisarVisorWeb', 'publicarRecienGenerada', 'esperadoDeLaSolicitud', 'revisarYGuardar',
    'solicitudPlanaPorId', 'avisarDeLaVerificacion', 'parrafosDelDocumento', 'enviarCorreoDeVerificacion',
  ];
  for (const nombre of sensibles) {
    assert.ok(!declaradas.has(nombre), nombre + ' se puede llamar desde el navegador');
    assert.ok(declaradas.has(nombre + '_'), nombre + '_ no existe');
  }
});
