'use strict';

/**
 * Los T&C que Legal ya publicó.
 *
 * El defecto real que protege este archivo es de producto, no de código: los
 * descuentos que no son cashback son 319 de 711 promociones (casi la mitad de
 * la demanda) y la herramienta no los cubría. Esa gente llegaba, no encontraba
 * su tipo de campaña y terminaba escribiéndole a Legal para pedir un documento
 * que ya existía publicado. Eso es exactamente lo que RappiMind existe para
 * evitar.
 *
 * Lo que se cuida aquí:
 *
 *   1. Que los datos del Excel de Legal lleguen completos y sin inventos. Un
 *      enlace mal transcrito publica una pieza respaldada por otro documento.
 *   2. Que las inconsistencias del Excel sigan a la vista y no "arregladas":
 *      Juan avisó que no lo había revisado, así que corregirlas por cuenta
 *      propia sería decidir por Legal.
 *   3. Que la vigencia se respete. Un T&C vencido sigue en la lista de Legal;
 *      ofrecer su enlace como si nada manda a publicar una pieza sin respaldo.
 */

const test = require('node:test');
const assert = require('node:assert');

const {
  tycGenericosDelPais, hayTycGenericos, tycGenericoPorId,
  tycGenericosUsables, hayTycGenericosUsables,
  estadoDeTycGenerico, vigenciaEnPalabras, descripcionDeTycGenerico,
} = require('../src/core/tyc_genericos.js');

const DATOS = require('../data/tyc_genericos.json');
const DE_COLOMBIA = tycGenericosDelPais('CO');

// --- Los datos ---------------------------------------------------------------

test('están los catorce T&C generales de Colombia que la herramienta ofrece', () => {
  // El Excel de Legal traía quince filas. Una era el mismo T&C repetido con otro
  // enlace, y la decisión 45 dejó ofreciendo uno solo. Ver la revisión del
  // archivo de datos.
  assert.strictEqual(DE_COLOMBIA.length, 14);
});

test('cada T&C trae identificador, nombre, enlace y vigencia', () => {
  for (const tyc of DE_COLOMBIA) {
    assert.ok(tyc.id, 'un T&C se quedó sin identificador');
    assert.ok(tyc.nombre, tyc.id + ' no tiene nombre');
    assert.ok(/^https:\/\/[^\s]+$/.test(tyc.enlace), tyc.id + ' no tiene un enlace usable: ' + tyc.enlace);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(tyc.vigenciaInicio), tyc.id + ' no dice desde cuándo rige');
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(tyc.vigenciaFin), tyc.id + ' no dice hasta cuándo rige');
  }
});

test('ningún identificador está repetido: el enlace se busca por él', () => {
  const vistos = {};
  for (const tyc of DE_COLOMBIA) {
    assert.ok(!vistos[tyc.id], 'identificador repetido: ' + tyc.id);
    vistos[tyc.id] = true;
  }
});

test('ningún enlace está repetido entre dos T&C distintos', () => {
  const vistos = {};
  for (const tyc of DE_COLOMBIA) {
    assert.ok(!vistos[tyc.enlace], 'dos T&C apuntan al mismo enlace: ' + tyc.enlace);
    vistos[tyc.enlace] = true;
  }
});

test('todos los enlaces son de un dominio de Rappi', () => {
  for (const tyc of DE_COLOMBIA) {
    assert.ok(/^https:\/\/promos\.rappi\.com\//.test(tyc.enlace),
      tyc.id + ' apunta fuera de promos.rappi.com: ' + tyc.enlace);
  }
});

test('un país sin T&C generales publicados no ofrece ninguno', () => {
  assert.strictEqual(hayTycGenericos('BR'), false);
  assert.deepStrictEqual(tycGenericosDelPais('BR'), []);
  assert.strictEqual(hayTycGenericos(''), false);
  assert.strictEqual(hayTycGenericos(null), false);
});

test('Colombia sí los tiene, y el código se lee en cualquier caja', () => {
  assert.strictEqual(hayTycGenericos('CO'), true);
  assert.strictEqual(hayTycGenericos('co'), true);
  assert.strictEqual(tycGenericoPorId('co', 'envio_gratis').nombre, 'Envío Gratis');
  assert.strictEqual(tycGenericoPorId('CO', 'no_existe'), null);
});

// --- Lo que el Excel trajo mal, y que no se arregla por cuenta propia --------

test('del T&C que Legal repitió se ofrece uno solo, el de la ruta con año', () => {
  // Estuvo repetido a proposito mientras nadie sabia cual era el bueno, y el
  // comercial veia los dos con un aviso. Juan decidio (decision 45) que va el de
  // /2026/descuentoprodselecc: mostrar los dos le pasaba al comercial una
  // decision legal que no puede tomar. El otro sigue publicado en Squarespace.
  const repetidos = DE_COLOMBIA.filter((t) => t.nombre === 'Descuento en Productos Seleccionados');
  assert.strictEqual(repetidos.length, 1, 'volvio a aparecer el duplicado de las filas 4 y 16');
  assert.strictEqual(repetidos[0].id, 'descuento_productos_seleccionados');
  assert.strictEqual(repetidos[0].enlace, 'https://promos.rappi.com/colombia/2026/descuentoprodselecc');
  assert.strictEqual(repetidos[0].advertencia, undefined, 'ya no hay nada que advertir: queda uno solo');
  assert.strictEqual(tycGenericoPorId('CO', 'descuento_productos_seleccionados_bis'), null);
});

test('los dos cupones ya dicen para qué sirven, con las frases que Juan aprobó', () => {
  /*
   * Las filas 14 y 15 del Excel llegaron sin Beneficio Ofrecido ni Descripción,
   * y la herramienta lo decía en vez de inventar una. Cupones es de lo que más
   * se pide, así que el comercial los veía y no sabía cuál elegir.
   *
   * Juan aprobó las cuatro frases el 20 de septiembre de 2026 (punto E3, con
   * los textos de la decisión 46 del encargo 01).
   */
  const valorFijo = tycGenericoPorId('CO', 'cupon_valor_fijo');
  assert.strictEqual(valorFijo.beneficio,
    'Descuento de un monto fijo de dinero sobre el pedido al redimir un cupón o código (el valor dependerá de lo que indique la pieza publicitaria).');
  assert.strictEqual(valorFijo.paraQue,
    'Respaldo legal para cupones o códigos que descuentan un valor fijo del pedido (ej. "$10.000 OFF con el código X"). Úsalo cuando el usuario debe ingresar o activar el cupón para ver la rebaja; el valor, la compra mínima y la vigencia van en la pieza.');

  const todaLaTienda = tycGenericoPorId('CO', 'cupon_toda_la_tienda');
  assert.strictEqual(todaLaTienda.beneficio,
    'Porcentaje de descuento sobre el valor total del pedido al redimir un cupón o código (el porcentaje y el tope dependerán de lo que indique la pieza publicitaria).');
  assert.strictEqual(todaLaTienda.paraQue,
    'Respaldo legal para cupones o códigos que dan un porcentaje de descuento sobre el valor total del pedido (ej. "20% OFF en toda la tienda con el código X"). Úsalo cuando el descuento no es automático y el usuario debe ingresar o activar el cupón; el porcentaje, el tope y la compra mínima van en la pieza.');

  // Y ya no sale el aviso de que Legal no explicó para qué sirven.
  for (const id of ['cupon_valor_fijo', 'cupon_toda_la_tienda']) {
    const tyc = tycGenericoPorId('CO', id);
    assert.strictEqual(descripcionDeTycGenerico(tyc), tyc.paraQue, id);
    assert.ok(!/no dice para qué sirve/i.test(descripcionDeTycGenerico(tyc)), id);
  }
});

test('el aviso de que falta la descripción sigue existiendo para el día que haga falta', () => {
  // Ningún T&C lo lleva hoy, así que se construye uno: si mañana Legal manda
  // una fila sin descripción, la herramienta tiene que decirlo en vez de
  // dejar un hueco o inventar una.
  assert.ok(/no dice para qué sirve/i.test(descripcionDeTycGenerico({ paraQue: '' })));
  assert.ok(/no dice para qué sirve/i.test(descripcionDeTycGenerico({})));
});

test('ningún nombre de la lista lleva guion como signo de puntuación', () => {
  // Regla 8 del proyecto. Los dos cupones eran los únicos textos visibles de
  // toda la herramienta que lo rompían, y venían copiados del Excel de Legal.
  // Juan los cambió el 20 de septiembre de 2026 (punto F3).
  for (const tyc of tycGenericosDelPais('CO')) {
    assert.strictEqual(/ - /.test(tyc.nombre), false, tyc.id + ': ' + tyc.nombre);
  }
  assert.strictEqual(tycGenericoPorId('CO', 'cupon_valor_fijo').nombre, 'Cupón de descuento de valor fijo');
  assert.strictEqual(tycGenericoPorId('CO', 'cupon_toda_la_tienda').nombre, 'Cupón de descuento en toda la tienda');
});

test('las diez correcciones de ortografía quedaron aplicadas', () => {
  // Punto F4. El archivo era la transcripción literal del Excel, con sus
  // erratas a la vista. Juan aprobó los tres grupos el 20 de septiembre.
  const todos = JSON.stringify(tycGenericosDelPais('CO'));
  for (const errata of ['el costo de envio', 'el precio de la suscripcion', 'miembros rappi pro',
    'Codigo de descuento', 'Service Fee OFF', 'Fee de Membresía OFF', 'check out']) {
    assert.strictEqual(todos.indexOf(errata), -1, 'sigue estando: ' + errata);
  }
  assert.strictEqual(tycGenericoPorId('CO', 'codigo_descuento_eventos_externos').beneficio,
    'Un externo da el descuento en su propio canal de venta. Por ejemplo: un código del 20% para las boletas de un evento.');
});

test('la descripción que sí trae el Excel se muestra tal cual', () => {
  const tyc = tycGenericoPorId('CO', 'envio_gratis');
  assert.strictEqual(descripcionDeTycGenerico(tyc), tyc.paraQue);
});

test('la Tarifa de Servicio Gratis conserva su vigencia distinta', () => {
  const tyc = tycGenericoPorId('CO', 'tarifa_servicio_gratis');
  assert.strictEqual(tyc.vigenciaInicio, '2026-02-01');
  assert.strictEqual(tyc.vigenciaFin, '2026-10-31', 'se le igualó la vigencia a la de los demás');

  const losDemas = DE_COLOMBIA.filter((t) => t.id !== 'tarifa_servicio_gratis');
  for (const otro of losDemas) {
    assert.strictEqual(otro.vigenciaFin, '2026-12-31', otro.id + ' cambió de vigencia');
  }
});

test('lo que hay que revisar con Legal queda anotado en el archivo de datos', () => {
  assert.ok(DATOS.revisiones.length >= 5);
  const anotados = [];
  for (const revision of DATOS.revisiones) {
    assert.ok(revision.que && revision.que.length > 30, 'una revisión no dice qué pasa');
    for (const id of revision.ids) anotados.push(id);
  }
  for (const id of ['descuento_productos_seleccionados', 'cupon_valor_fijo', 'tarifa_servicio_gratis']) {
    assert.ok(anotados.indexOf(id) !== -1, 'no quedó anotado lo de ' + id);
  }
});

test('cada revisión apunta a un T&C que existe de verdad', () => {
  for (const revision of DATOS.revisiones) {
    for (const id of revision.ids) {
      assert.ok(tycGenericoPorId('CO', id), 'la revisión nombra un T&C que no existe: ' + id);
    }
  }
});

// --- La vigencia -------------------------------------------------------------

test('un T&C vigente hoy se ofrece, y dice hasta cuándo rige', () => {
  const tyc = tycGenericoPorId('CO', 'envio_gratis');
  const revision = estadoDeTycGenerico(tyc, '2026-09-17');
  assert.strictEqual(revision.estado, 'vigente');
  assert.strictEqual(revision.usable, true);
  assert.strictEqual(revision.mensaje, '');
  assert.strictEqual(revision.vigencia, 'Del 1 de enero de 2026 al 31 de diciembre de 2026.');
});

test('un T&C vencido no se ofrece, y dice cuándo venció', () => {
  const tyc = tycGenericoPorId('CO', 'tarifa_servicio_gratis');
  const revision = estadoDeTycGenerico(tyc, '2026-11-01');
  assert.strictEqual(revision.estado, 'vencido');
  assert.strictEqual(revision.usable, false);
  assert.ok(/31 de octubre de 2026/.test(revision.mensaje), revision.mensaje);
  assert.ok(/Legal/.test(revision.mensaje), 'no dice a quién acudir: ' + revision.mensaje);
});

test('un T&C que todavía no arranca no se ofrece, y dice desde cuándo', () => {
  const tyc = tycGenericoPorId('CO', 'tarifa_servicio_gratis');
  const revision = estadoDeTycGenerico(tyc, '2026-01-15');
  assert.strictEqual(revision.estado, 'aun_no_arranca');
  assert.strictEqual(revision.usable, false);
  assert.ok(/1 de febrero de 2026/.test(revision.mensaje), revision.mensaje);
});

test('los bordes de la vigencia cuentan como días vigentes', () => {
  const tyc = tycGenericoPorId('CO', 'tarifa_servicio_gratis');
  assert.strictEqual(estadoDeTycGenerico(tyc, '2026-02-01').usable, true, 'el primer día ya vale');
  assert.strictEqual(estadoDeTycGenerico(tyc, '2026-10-31').usable, true, 'el último día todavía vale');
});

test('sin fecha de referencia no se declara vencido nada', () => {
  const tyc = tycGenericoPorId('CO', 'tarifa_servicio_gratis');
  assert.strictEqual(estadoDeTycGenerico(tyc, '').estado, 'vigente');
  assert.strictEqual(estadoDeTycGenerico(tyc, null).usable, true);
});

test('un T&C sin vigencia se ofrece, pero pidiendo confirmarla', () => {
  const revision = estadoDeTycGenerico({ vigenciaInicio: '', vigenciaFin: '' }, '2026-09-17');
  assert.strictEqual(revision.estado, 'sin_vigencia');
  assert.strictEqual(revision.usable, true);
  assert.ok(/Confírmalo con Legal/.test(revision.mensaje), revision.mensaje);
});

test('la vigencia se dice en palabras, no en fechas de máquina', () => {
  assert.strictEqual(
    vigenciaEnPalabras({ vigenciaInicio: '2026-01-01', vigenciaFin: '2026-12-31' }),
    'Del 1 de enero de 2026 al 31 de diciembre de 2026.'
  );
  assert.strictEqual(vigenciaEnPalabras({ vigenciaInicio: '2026-01-01', vigenciaFin: '' }), 'Desde el 1 de enero de 2026.');
  assert.strictEqual(vigenciaEnPalabras({ vigenciaInicio: '', vigenciaFin: '2026-12-31' }), 'Hasta el 31 de diciembre de 2026.');
  assert.strictEqual(vigenciaEnPalabras({}), 'Vigencia sin confirmar.');
});

test('hoy, al menos un T&C general de Colombia se puede usar', () => {
  const usables = DE_COLOMBIA.filter((t) => estadoDeTycGenerico(t, '2026-09-17').usable);
  assert.ok(usables.length >= 13, 'quedaron demasiados sin poder usarse: ' + usables.length);
});

// --- Lo que el comercial lee -------------------------------------------------

test('ningún texto que se lee en pantalla usa guiones como puntuación', () => {
  // Regla 8 de CLAUDE.md. Los nombres vienen tal cual del Excel de Legal y esos
  // no se tocan: lo que se revisa aquí es lo que escribió la herramienta.
  const nuestros = JSON.stringify([
    DATOS.nota,
    DE_COLOMBIA.map((t) => t.advertencia || ''),
    DE_COLOMBIA.map((t) => estadoDeTycGenerico(t, '2026-11-01').mensaje),
    DE_COLOMBIA.map((t) => vigenciaEnPalabras(t)),
    descripcionDeTycGenerico({}),
  ]);
  assert.ok(!/ [-–—] /.test(nuestros), 'hay un guion usado como puntuación');
});

test('los mensajes de la herramienta no se leen como una negativa', () => {
  const textos = DE_COLOMBIA.map((t) => t.advertencia || '').concat([DATOS.nota]);
  for (const texto of textos) {
    assert.ok(texto.indexOf('no puedes') === -1, 'suena a negativa: ' + texto);
  }
});

test('cuando todos vencen, la herramienta lo sabe y no promete un enlace', () => {
  // Trece vencen el 31 de diciembre de 2026 y el otro el 31 de octubre. El
  // 1 de enero de 2027 la tarjeta seguía diciendo "Buena noticia: Legal ya
  // publicó los T&C" y detrás había botones grises.
  assert.strictEqual(hayTycGenericosUsables('CO', '2026-09-17'), true);
  assert.strictEqual(tycGenericosUsables('CO', '2026-09-17').length, 14);
  assert.ok(!tycGenericosUsables('CO', '2026-11-01').some((t) => t.id === 'tarifa_servicio_gratis'));
  assert.strictEqual(tycGenericosUsables('CO', '2026-11-01').length, 13);
  assert.strictEqual(hayTycGenericosUsables('CO', '2027-01-01'), false);
  // Sin fecha de referencia no se afirma que venció.
  assert.strictEqual(hayTycGenericosUsables('CO', ''), true);
});

test('los textos del Excel no traen espacios de más', () => {
  // Los espacios en blanco no son texto de Legal: se limpian, como el espacio
  // final de las filas 10 y 11 y el doble espacio de la fila 17.
  for (const t of DE_COLOMBIA) {
    for (const campo of ['nombre', 'beneficio', 'paraQue', 'enlace']) {
      const valor = t[campo] || '';
      assert.ok(!/  /.test(valor), t.id + '.' + campo + ' tiene un doble espacio');
      assert.strictEqual(valor, valor.trim(), t.id + '.' + campo + ' tiene espacios al borde');
    }
  }
});

test('el detalle avisa lo pendiente antes del enlace, no después', () => {
  // La pantalla se lee como texto: el aviso serio con lo que Legal dejó sin
  // resolver tiene que estar escrito antes del bloque para copiar el enlace.
  const fs = require('node:fs');
  const path = require('node:path');
  const codigo = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', 'js', '63-tyc-genericos.js'), 'utf8');
  const detalle = codigo.slice(codigo.indexOf('function detalle('));
  const aviso = detalle.indexOf("'data-pendiente'");
  const enlace = detalle.indexOf('paraCopiar(');
  assert.ok(aviso !== -1 && enlace !== -1, 'no encontré el aviso o el enlace en detalle()');
  assert.ok(aviso < enlace, 'el aviso de lo pendiente va después del enlace');
  // Y la tarjeta vencida no usa disabled, que la saca del teclado.
  const tarjeta = codigo.slice(codigo.indexOf('function tarjetaDeUno('), codigo.indexOf('function detalle('));
  assert.ok(tarjeta.indexOf('disabled: !revision.usable') === -1, 'la tarjeta vencida usa disabled');
  assert.ok(tarjeta.indexOf("'aria-disabled'") !== -1, 'la tarjeta vencida no marca aria-disabled');
});
