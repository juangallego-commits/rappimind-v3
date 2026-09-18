'use strict';

/**
 * Qué pasa cuando Google no responde a mitad de una generación.
 *
 * Hasta esta revisión, todo lo que se probaba del servidor era el camino
 * feliz. En producción pasan otras cosas: dos comerciales le dan a Generar en
 * el mismo segundo y el bloqueo se agota, Drive corta por cuota, el correo no
 * sale. Ninguna de esas tres estaba reproducida, así que nadie sabía si el
 * comercial acababa con un documento a medias, con una fila suelta en el Sheet
 * o con una pantalla en blanco.
 *
 * Los dobles ahora saben fallar a pedido (`mundo.fallar`), y aquí se comprueba
 * lo único que importa: que no quede basura escrita y que lo que el comercial
 * lee le diga qué hacer.
 */

const test = require('node:test');
const assert = require('node:assert');

const { levantarEntorno, solicitudValida } = require('./dobles/entorno.js');
const { mensajeDeFalla, claseDeFalla } = require('../src/core/mensajes_de_falla.js');
const { rutaDesdeRaiz, leerTexto } = require('../scripts/lib/archivos');

function conSetup() {
  const mundo = levantarEntorno({});
  setup();
  return mundo;
}

function cuantasSolicitudes() {
  return leerSolicitudes().length;
}

test('si Drive no crea el documento, no queda ninguna fila escrita', () => {
  const mundo = conSetup();
  const antes = cuantasSolicitudes();

  mundo.fallar.documento = 'Service invoked too many times for one day: docs.';
  assert.throws(() => generar(solicitudValida()), /docs/);
  mundo.fallar.documento = null;

  assert.strictEqual(cuantasSolicitudes(), antes, 'quedó una solicitud a medias en el Sheet');
  assert.strictEqual(Object.keys(mundo.documentos).length, 0, 'quedó un documento suelto en Drive');
  assert.strictEqual(mundo.correos.length, 0, 'se mandó un correo por un documento que no existe');
});

test('si el correo no sale, el documento y la fila sí quedan', () => {
  const mundo = conSetup();
  mundo.fallar.correo = 'Service invoked too many times for one day: email.';

  const resultado = generar(solicitudValida());

  assert.ok(resultado.valido, 'un correo caído no puede tumbar la generación');
  assert.ok(resultado.linkDoc);
  assert.strictEqual(cuantasSolicitudes(), 1);
  assert.strictEqual(mundo.correos.length, 0);

  // Y queda dicho en el Registro, que es donde se mira cuando alguien reclama
  // que nunca le llegó el correo.
  const registro = objetosDe('Registro').map((f) => f.accion);
  assert.ok(registro.indexOf('correo_fallido') !== -1, 'el correo caído no dejó rastro: ' + registro.join(', '));
});

test('el bloqueo agotado no escribe nada, y es lo que pasa con dos comerciales a la vez', () => {
  const mundo = conSetup();
  mundo.fallar.bloqueo = 'Lock timeout: another process was holding the lock for too long.';

  assert.throws(() => generar(solicitudValida()), /Lock timeout/);
  mundo.fallar.bloqueo = null;

  assert.strictEqual(cuantasSolicitudes(), 0);
  assert.strictEqual(Object.keys(mundo.documentos).length, 0);

  // Y después del susto, la siguiente generación funciona igual.
  const resultado = generar(solicitudValida());
  assert.ok(resultado.valido);
});

test('dos generaciones seguidas no repiten identificador ni nombre de campaña', () => {
  const mundo = conSetup();
  const primera = generar(solicitudValida());
  const segunda = generar(solicitudValida());

  assert.ok(primera.valido && segunda.valido);
  assert.notStrictEqual(primera.id, segunda.id);
  assert.notStrictEqual(primera.nombreCampana, segunda.nombreCampana);

  // Y el bloqueo se pidió una vez por generación: es lo que impide que dos
  // comerciales lean el mismo consecutivo del Sheet.
  assert.strictEqual(mundo.registroDeBloqueos, 2);
});

test('si el Sheet falla despues de crear el Doc, el Doc no se queda suelto', () => {
  const mundo = conSetup();
  mundo.fallar.hoja = 'Service invoked too many times for one day: spreadsheets.';

  assert.throws(() => generar(solicitudValida()), /spreadsheets/);
  mundo.fallar.hoja = null;

  assert.strictEqual(cuantasSolicitudes(), 0, 'no debería quedar fila');

  /*
   * Aquí estaba el defecto. El documento ya existía en Drive y no se quitaba,
   * así que la siguiente generación leía un Sheet vacío, sacaba el mismo
   * consecutivo y el mismo nombre, y creaba un segundo Doc con el título
   * idéntico: dos "RM-20260916-0001" en la misma carpeta del país.
   */
  const sueltos = Object.keys(mundo.documentos).filter((id) => {
    const archivo = mundo.archivos[id];
    return archivo && !archivo.isTrashed();
  });
  assert.strictEqual(sueltos.length, 0, 'quedó un documento suelto en la carpeta del país');

  const segunda = generar(solicitudValida());
  assert.ok(segunda.valido);
  const vivos = Object.keys(mundo.documentos).filter((id) => !mundo.archivos[id].isTrashed());
  assert.strictEqual(vivos.length, 1, 'quedaron dos documentos vivos con el mismo identificador');
});

test('el fallo a mitad queda escrito en el Registro', () => {
  const mundo = conSetup();
  // Solo se cae la pestaña Solicitudes: si se cayera el Sheet entero tampoco se
  // podría escribir el Registro, y eso no hay forma de arreglarlo desde aquí.
  mundo.fallar.hoja = 'Service invoked too many times for one day: spreadsheets.';
  mundo.fallar.hojaSolo = 'Solicitudes';
  try { generar(solicitudValida()); } catch (error) { /* se espera */ }
  mundo.fallar.hoja = null;
  mundo.fallar.hojaSolo = null;

  const acciones = objetosDe('Registro').map((f) => f.accion);
  assert.ok(acciones.indexOf('generar_fallido') !== -1, 'el fallo no dejó rastro: ' + acciones.join(', '));
});

// --- El mensaje que lee el comercial ---------------------------------------

test('cada fallo conocido de Google se traduce a un paso siguiente', () => {
  const casos = [
    ['Lock timeout: another process was holding the lock for too long.', 'bloqueo', 'Espera unos segundos'],
    ['Exception: Service invoked too many times for one day: docs.', 'cuota', 'Mañana vuelve a funcionar'],
    ['You do not have permission to access the requested document.', 'permiso', 'Pídele acceso a Juan'],
    ['Exceeded maximum execution time', 'tiempo', 'Vuelve a intentarlo'],
    ['Failed to fetch', 'conexion', 'Revisa tu internet'],
  ];
  casos.forEach(([crudo, clase, trozo]) => {
    assert.strictEqual(claseDeFalla(crudo), clase, crudo);
    assert.ok(mensajeDeFalla(crudo).includes(trozo), crudo + ' -> ' + mensajeDeFalla(crudo));
    // Ninguno le deja al comercial el texto de Google como mensaje principal.
    assert.ok(!mensajeDeFalla(crudo).includes(crudo), 'el mensaje sigue siendo el de Google');
  });
});

test('un fallo que nadie previó conserva el texto de Google, para poder diagnosticarlo', () => {
  const crudo = "Cannot read properties of null (reading 'length')";
  assert.strictEqual(claseDeFalla(crudo), '');
  const mensaje = mensajeDeFalla(crudo);
  assert.ok(mensaje.includes(crudo), 'se perdió el texto original: ' + mensaje);
  assert.ok(mensaje.includes('no en lo que respondiste'));
});

test('un fallo sin mensaje tampoco deja al comercial sin nada que hacer', () => {
  assert.ok(mensajeDeFalla('').includes('avísale a Juan'));
  assert.ok(mensajeDeFalla(null).includes('avísale a Juan'));
  assert.ok(mensajeDeFalla(new Error('Failed to fetch')).includes('Revisa tu internet'));
});

/*
 * La lección de la skill de flujo: un mecanismo que la interfaz no llama es un
 * mecanismo que no existe. Esta traducción vive en la frontera del transporte,
 * y si alguien vuelve a construir el Error con el texto crudo, las nueve
 * pantallas vuelven a mostrar inglés sin que ninguna prueba se entere.
 */
test('la frontera del transporte usa la traducción, no el texto crudo', () => {
  const archivo = leerTexto(rutaDesdeRaiz('src', 'client', 'js', '30-servidor.js'));
  assert.ok(archivo.includes('mensajeDeFalla('), '30-servidor.js ya no traduce el fallo');
  assert.ok(
    !/new Error\(error && error\.message/.test(archivo),
    'volvió el Error con el texto crudo de Apps Script'
  );
  // Las dos ramas, Apps Script y la demostración, tienen que pasar por lo mismo.
  const veces = (archivo.match(/comoFalla\(/g) || []).length;
  assert.ok(veces >= 4, 'alguna rama del transporte se quedó sin traducir (' + veces + ')');
});
