'use strict';

/**
 * La revision de lo publicado, de punta a punta contra los dobles de Google.
 *
 * La parte que decide (comparar textos, leer el JSON de Squarespace) esta en
 * pruebas/publicacion.test.js. Aqui se prueba lo que cruza fronteras: que
 * pagina se pide, que queda escrito en el Sheet, a quien le llega cada correo,
 * que el disparador no se duplique y que a la pantalla no le llegue una fecha.
 */

const test = require('node:test');
const assert = require('node:assert');

const { levantarEntorno, solicitudValida } = require('./dobles/entorno.js');

const ENLACE = 'https://promos.rappi.com/colombia/tienda-de-prueba-20-cashback-20-sep-2026';
const LECTURA = ENLACE + '?format=json';

function conSetup() {
  const mundo = levantarEntorno({});
  setup();
  mundo.correoDeQuienInstalo = mundo.correo;
  return mundo;
}

/** La pagina de Squarespace con el texto que se le pase, con la forma real del JSON. */
function pagina(texto, cambios) {
  return {
    codigo: 200,
    cuerpo: JSON.stringify({
      website: { primaryDomain: 'promos.rappi.com', timeZone: 'America/Bogota', timeZoneOffset: -18000000 },
      collection: { urlId: 'colombia', typeName: 'events' },
      item: Object.assign({
        recordType: 12,
        workflowState: 1,
        publishOn: Date.UTC(2026, 8, 16, 15, 0),
        title: 'Tienda de Prueba · 20% Cashback · 20 sep 2026',
        body: '<div class="sqs-block-content">' + htmlParaSquarespace(texto) + '</div>',
        fullUrl: '/colombia/tienda-de-prueba-20-cashback-20-sep-2026',
        startDate: Date.UTC(2026, 8, 20, 5, 0),
        endDate: Date.UTC(2026, 8, 22, 4, 59),
      }, cambios || {}),
    }),
  };
}

function fila(id) {
  return leerSolicitudes().filter((s) => s.id === id)[0];
}

/** Recorre una respuesta entera buscando un objeto Date. */
function tieneFechas(valor) {
  if (valor instanceof Date) return true;
  if (Array.isArray(valor)) return valor.some(tieneFechas);
  if (valor && typeof valor === 'object') return Object.keys(valor).some((k) => tieneFechas(valor[k]));
  return false;
}

// --- La generacion ya sabe donde va a quedar -----------------------------------------

test('generar devuelve el texto y la dirección prevista, y el correo no manda a volver', () => {
  const mundo = conSetup();
  const resultado = generar(solicitudValida());

  assert.strictEqual(resultado.enlacePrevisto, ENLACE);
  assert.ok(resultado.texto.indexOf('**1. Organizador y rol de Rappi.**') !== -1);

  const correo = mundo.correos[0];
  assert.ok(correo.htmlBody.indexOf(ENLACE) !== -1, 'el correo dice en qué dirección publicar');
  assert.ok(correo.htmlBody.indexOf('revisa sola cada hora') !== -1);
});

// --- La corrida de cada hora ------------------------------------------------------------

test('mientras no esté publicada, la corrida solo anota que no está, sin correo', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  const correosAntes = mundo.correos.length;

  const corrida = revisarPublicacionesPendientes();

  assert.deepStrictEqual(mundo.pedidos.map((p) => p.url), [LECTURA]);
  assert.strictEqual(corrida.revisadas, 1);
  const guardada = fila(generado.id);
  assert.strictEqual(guardada.verificacion, 'no_publicado');
  assert.strictEqual(guardada.estado, 'generado');
  assert.ok(guardada.fecha_verificacion);
  assert.strictEqual(mundo.correos.length, correosAntes, 'no publicada todavía no es noticia');
});

test('cuando aparece idéntica, queda publicada y verificada, con un correo solo al comercial', () => {
  const mundo = conSetup();
  guardarPropiedad(PROPIEDADES.CORREO_COPIA_LEGAL, 'legal@rappi.com');
  const generado = generar(solicitudValida());
  mundo.paginas[LECTURA] = pagina(generado.texto);
  const correosAntes = mundo.correos.length;

  revisarPublicacionesPendientes();

  const guardada = fila(generado.id);
  assert.strictEqual(guardada.verificacion, 'verificado');
  assert.strictEqual(guardada.estado, 'publicado');
  assert.strictEqual(guardada.link_publicado, ENLACE);
  assert.ok(guardada.fecha_publicacion);
  assert.ok(guardada.detalle_verificacion.indexOf('idéntico al documento generado') !== -1);
  assert.ok(guardada.detalle_verificacion.indexOf('2026-09-16 10:00') !== -1, 'deja constancia de desde cuándo');

  const nuevos = mundo.correos.slice(correosAntes);
  assert.strictEqual(nuevos.length, 1);
  assert.strictEqual(nuevos[0].to, 'juan.gallego@rappi.com');
  assert.ok(nuevos[0].subject.indexOf('quedaron publicados') !== -1);
  assert.ok(!nuevos[0].cc, 'una buena noticia no necesita a Legal en copia');

  // La siguiente corrida del mismo dia no la vuelve a pedir ni a avisar.
  const pedidosAntes = mundo.pedidos.length;
  revisarPublicacionesPendientes();
  assert.strictEqual(mundo.pedidos.length, pedidosAntes);
  assert.strictEqual(mundo.correos.length, correosAntes + 1);
});

test('si al otro día el texto cambió, avisa con la diferencia y con Legal en copia', () => {
  const mundo = conSetup();
  guardarPropiedad(PROPIEDADES.CORREO_COPIA_LEGAL, 'legal@rappi.com');
  const generado = generar(solicitudValida());
  mundo.paginas[LECTURA] = pagina(generado.texto);
  revisarPublicacionesPendientes();

  mundo.ahora = '2026-09-17T10:30:00Z';
  mundo.paginas[LECTURA] = pagina(generado.texto.replace('veinte por ciento (20%)', 'treinta por ciento (30%)'));
  const correosAntes = mundo.correos.length;
  revisarPublicacionesPendientes();

  const guardada = fila(generado.id);
  assert.strictEqual(guardada.verificacion, 'con_diferencias');
  assert.ok(guardada.detalle_verificacion.indexOf('treinta por ciento (30%)') !== -1, guardada.detalle_verificacion);

  const aviso = mundo.correos[correosAntes];
  assert.strictEqual(mundo.correos.length, correosAntes + 1);
  assert.strictEqual(aviso.cc, 'legal@rappi.com');
  assert.ok(aviso.htmlBody.indexOf('treinta por ciento (30%)') !== -1);
});

test('si la quitan con la campaña vigente, queda retirada y avisa a Legal', () => {
  const mundo = conSetup();
  guardarPropiedad(PROPIEDADES.CORREO_COPIA_LEGAL, 'legal@rappi.com');
  const generado = generar(solicitudValida());
  mundo.paginas[LECTURA] = pagina(generado.texto);
  revisarPublicacionesPendientes();

  mundo.ahora = '2026-09-18T10:30:00Z';
  delete mundo.paginas[LECTURA];
  const correosAntes = mundo.correos.length;
  revisarPublicacionesPendientes();

  const guardada = fila(generado.id);
  assert.strictEqual(guardada.verificacion, 'retirado');
  assert.strictEqual(mundo.correos.length, correosAntes + 1);
  assert.strictEqual(mundo.correos[correosAntes].cc, 'legal@rappi.com');
  assert.ok(mundo.correos[correosAntes].subject.indexOf('ya no están publicados') !== -1);
});

test('una campaña que ya terminó no se revisa', () => {
  const mundo = conSetup();
  generar(solicitudValida());
  mundo.ahora = '2026-09-25T10:30:00Z';
  const corrida = revisarPublicacionesPendientes();
  assert.strictEqual(corrida.revisadas, 0);
  assert.strictEqual(mundo.pedidos.length, 0);
});

test('un fallo de red no publica, no avisa y no tumba la corrida', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  mundo.fallar.red = 'Address unavailable: https://promos.rappi.com';
  const correosAntes = mundo.correos.length;

  const corrida = revisarPublicacionesPendientes();

  assert.strictEqual(corrida.revisadas, 1);
  assert.strictEqual(fila(generado.id).verificacion, 'sin_verificar');
  assert.strictEqual(fila(generado.id).estado, 'generado');
  assert.strictEqual(mundo.correos.length, correosAntes);
});

test('si el documento no abre, no hay veredicto', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  mundo.paginas[LECTURA] = pagina(generado.texto);
  mundo.fallar.abrirDocumento = 'No tienes acceso al documento';

  revisarPublicacionesPendientes();

  assert.strictEqual(fila(generado.id).verificacion, 'sin_verificar');
  assert.strictEqual(fila(generado.id).estado, 'generado');
});

test('una hoja vieja, sin las columnas de la revisión, se pone al día sola', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  // Se quitan las tres columnas nuevas, como estaria la hoja antes de este cambio.
  const hoja = hojaPorNombre('Solicitudes');
  const encabezados = hoja.valores[0];
  const sinRevision = encabezados.map((e, i) => i).filter((i) => ['verificacion', 'fecha_verificacion', 'detalle_verificacion'].indexOf(encabezados[i]) === -1);
  hoja.valores = hoja.valores.map((filaDeValores) => sinRevision.map((i) => filaDeValores[i]));
  mundo.paginas[LECTURA] = pagina(generado.texto);

  revisarPublicacionesPendientes();

  const nuevos = hojaPorNombre('Solicitudes').valores[0];
  assert.strictEqual(nuevos.filter((e) => e === 'verificacion').length, 1, 'una sola columna, al final');
  assert.strictEqual(nuevos[nuevos.length - 3], 'verificacion');
  assert.strictEqual(fila(generado.id).verificacion, 'verificado');
});

// --- Revisar ahora, desde la pantalla ---------------------------------------------------

test('revisar ahora devuelve el veredicto y las leyendas con el enlace confirmado', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  mundo.paginas[LECTURA] = pagina(generado.texto);

  const respuesta = revisarPublicacion(generado.id);

  assert.strictEqual(respuesta.valido, true);
  assert.strictEqual(respuesta.verificacion.estado, 'verificado');
  assert.strictEqual(respuesta.estado, 'publicado');
  assert.strictEqual(respuesta.linkPublicado, ENLACE);
  assert.ok(respuesta.leyendas && respuesta.leyendas.enlaceConfirmado, 'la leyenda ya lleva el enlace publicado');
  assert.strictEqual(tieneFechas(respuesta), false);
});

test('revisar ahora avisa los detalles del evento sin cambiar el veredicto', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  mundo.paginas[LECTURA] = pagina(generado.texto, { title: 'Otro título', endDate: Date.UTC(2026, 8, 25, 4, 59) });

  const respuesta = revisarPublicacion(generado.id);
  assert.strictEqual(respuesta.verificacion.estado, 'verificado');
  assert.strictEqual(respuesta.verificacion.avisos.length, 2);
});

test('nadie revisa la campaña de otra persona, salvo Legal y los administradores', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  mundo.correo = 'otro@rappi.com';
  const ajena = revisarPublicacion(generado.id);
  assert.strictEqual(ajena.valido, false);
  assert.strictEqual(ajena.errores[0].mensaje, 'Esa solicitud no es tuya.');
  assert.strictEqual(mundo.pedidos.length, 0);
});

test('en un país sin ruta de Squarespace, pide el enlace en vez de adivinarlo', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida({ pais: 'MX', organizadorId: 'AAA010101AAA', tiendaTurbo: undefined }));
  if (!generado.valido) {
    // Si la solicitud de prueba no cabe en Mexico, se prueba con una fila a mano.
    agregarFila('Solicitudes', { id: 'RM-MX', email: mundo.correo, pais: 'MX', estado: 'generado', direccion_sugerida: 'algo', link_doc: 'https://docs.google.com/document/d/x/edit' });
  }
  const id = generado.valido ? generado.id : 'RM-MX';
  const respuesta = revisarPublicacion(id);
  assert.strictEqual(respuesta.verificacion.estado, 'sin_enlace');
  assert.strictEqual(mundo.pedidos.length, 0);
});

// --- Pegar el enlace a mano -------------------------------------------------------------------

test('al pegar el enlace se revisa en el acto', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  const otra = 'https://promos.rappi.com/colombia/2026/otra-direccion';
  mundo.paginas[otra + '?format=json'] = pagina(generado.texto);

  const respuesta = marcarPublicado(generado.id, otra);

  assert.strictEqual(respuesta.valido, true);
  assert.strictEqual(respuesta.verificacion.estado, 'verificado');
  assert.strictEqual(fila(generado.id).link_publicado, otra);
  assert.ok(respuesta.leyendas.enlaceCambio, 'otra dirección: la leyenda cambia');
});

test('pegar el enlace de una página con otro texto la deja publicada, pero con diferencias', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  mundo.paginas[LECTURA] = pagina(generado.texto + '\nTexto agregado a mano.');

  const respuesta = marcarPublicado(generado.id, ENLACE);

  assert.strictEqual(respuesta.verificacion.estado, 'con_diferencias');
  assert.strictEqual(fila(generado.id).estado, 'publicado', 'quien la pegó dice que está publicada, y lo está');
  assert.strictEqual(fila(generado.id).verificacion, 'con_diferencias');
});

test('el servidor solo le pide páginas a promos.rappi.com', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  marcarPublicado(generado.id, 'https://otro.com/x');
  marcarPublicado(generado.id, ENLACE);
  revisarPublicacionesPendientes();
  assert.ok(mundo.pedidos.length > 0);
  for (const pedido of mundo.pedidos) {
    assert.strictEqual(pedido.url.indexOf('https://promos.rappi.com/'), 0, pedido.url);
    assert.strictEqual(pedido.opciones.muteHttpExceptions, true);
  }
});

// --- Frontera 1: nada de fechas hacia el navegador -----------------------------------------

test('el historial y la revisión no le mandan fechas al navegador aunque el Sheet las convierta', () => {
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  mundo.paginas[LECTURA] = pagina(generado.texto);
  revisarPublicacion(generado.id);

  // Google Sheets convierte sola la celda "2026-09-16 10:30:00" en fecha.
  const hoja = hojaPorNombre('Solicitudes');
  const columna = hoja.valores[0].indexOf('fecha_verificacion');
  hoja.valores[1][columna] = new Date('2026-09-16T10:30:00');

  assert.strictEqual(tieneFechas(historial('')), false);
  assert.strictEqual(tieneFechas(revisarPublicacion(generado.id)), false);
});

// --- El disparador -------------------------------------------------------------------------

test('setup instala la revisión de cada hora una sola vez, y se puede apagar', () => {
  const mundo = conSetup();
  assert.strictEqual(mundo.disparadores.length, 1);
  assert.strictEqual(mundo.disparadores[0].getHandlerFunction(), 'revisarPublicacionesPendientes');
  assert.strictEqual(mundo.disparadores[0].config.cadaHoras, 1);

  const otraVez = setup();
  assert.strictEqual(mundo.disparadores.length, 1, 'correr setup otra vez no duplica');
  assert.ok(otraVez.pasos.indexOf('la revisión automática ya estaba instalada') !== -1);

  // Un duplicado de antes se limpia: dos disparadores mandarian dos correos por cambio.
  ScriptApp.newTrigger('revisarPublicacionesPendientes').timeBased().everyHours(1).create();
  instalarRevisionAutomatica();
  assert.strictEqual(mundo.disparadores.length, 1);

  assert.strictEqual(quitarRevisionAutomatica(), 'revisión automática apagada');
  assert.strictEqual(mundo.disparadores.length, 0);
});

test('en modo demostración la revisión no le pide nada a nadie', () => {
  const mundo = levantarEntorno({});
  assert.deepStrictEqual(revisarPublicacionesPendientes(), { revisadas: 0, cambios: 0 });
  assert.strictEqual(revisarPublicacion('RM-1').demostracion, true);
  assert.strictEqual(mundo.pedidos.length, 0);
});

test('las fechas de la campaña que el Sheet volvió Date no inventan avisos de fechas', () => {
  // Paso de verdad con el historial (incidente 2 de la skill de fronteras): el
  // Sheet convierte "2026-09-20" en fecha. Si la revision no aplana la fila,
  // String(fecha).slice(0, 10) da "Sun Sep 20" y la comparacion con el evento
  // avisa que las fechas no coinciden cuando si coinciden.
  const mundo = conSetup();
  const generado = generar(solicitudValida());
  const hoja = hojaPorNombre('Solicitudes');
  hoja.valores[1][hoja.valores[0].indexOf('fecha_inicio')] = new Date(2026, 8, 20);
  hoja.valores[1][hoja.valores[0].indexOf('fecha_fin')] = new Date(2026, 8, 21);
  mundo.paginas[LECTURA] = pagina(generado.texto);

  const manual = revisarPublicacion(generado.id);
  assert.deepStrictEqual(manual.verificacion.avisos, []);

  mundo.ahora = '2026-09-17T10:30:00Z';
  revisarPublicacionesPendientes();
  assert.strictEqual(fila(generado.id).detalle_verificacion.indexOf('El evento'), -1, fila(generado.id).detalle_verificacion);
});
