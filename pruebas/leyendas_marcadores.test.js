'use strict';

/**
 * Los marcadores cortos de las leyendas, y las leyendas armadas de punta a punta.
 *
 * La prueba que más vale es la primera: reproduce la pieza publicitaria real de
 * El Corral con los datos que la respuesta del encargo 03 dice que usó, y
 * compara el resultado letra por letra con el texto propuesto en la sección 7G.
 * Si un marcador cambia de forma, esa comparación se cae.
 */

const test = require('node:test');
const assert = require('node:assert');

const { cargarLeyendas } = require('../scripts/lib/modelos');
const { generarLeyendasDeLaCampana } = require('../src/core/generar.js');
const {
  textoVigenciaCorta,
  textoLimiteCorto,
  textoTerritorioCorto,
  textoSegmentoCorto,
  textoPagoCorto,
  textoCondicionesCorto,
  textoCreditosCorto,
  listaTiendasCorta,
  textoGanadoresCorto,
  textoBeneficioTravelCorto,
  textoDescuentoTravelCorto,
  faltantesParaLaLeyenda,
  urlDelTcDeLaCampana,
  cifraDeMonto,
  esDeTurbo,
} = require('../src/core/derivados_leyendas.js');

const TEXTOS = cargarLeyendas();
const PAISES = require('../data/paises.json').paises;
const CO = PAISES.filter((p) => p.codigo === 'CO')[0];
const MX = PAISES.filter((p) => p.codigo === 'MX')[0];
const CASOS = require('./casos_base.json').casos;
const caso = (id) => CASOS.filter((c) => c.id === id)[0].entrada;

/** La campaña de la pieza 1: El Corral, 99% Happy CashBack Pro. */
function campanaDeElCorral(cambios) {
  return Object.assign({
    pais: 'CO', negocio: 'rappi', tipo: 'cashback', tienda: 'El Corral',
    alcance: 'Nacional', ciudades: '', segmento: 'pro', metodoPago: 'todos',
    compraMinima: null, declaracion: true,
    fechaInicio: '2026-09-08', horaInicio: '00:00', fechaFin: '2026-09-08', horaFin: '23:59',
    organizadorRazonSocial: 'El Corral S.A.S.', organizadorId: '900111222-1',
    porcentaje: 99, tope: 25000, presupuesto: 50000000, maxPedidos: 1, sinLimite: false,
    carga: 'dia_siguiente', vigencia: 'fecha', fechaFinRedencion: '2026-09-13',
    redencion: 'tienda', condiciones: [],
  }, cambios || {});
}

function leyendasDe(entrada, pais, opciones) {
  return generarLeyendasDeLaCampana(entrada, pais || CO, TEXTOS, opciones || { nombreCampana: 'Campaña de prueba' });
}

function porFormato(resultado, formato) {
  return resultado.leyendas.filter((l) => l.formato === formato)[0];
}

test('la pieza 1 de El Corral sale igual que en la respuesta', () => {
  const r = leyendasDe(campanaDeElCorral(), CO, { nombreCampana: 'Cashback 99 El Corral' });
  assert.deepStrictEqual(r.errores, [], r.errores.join(' | '));

  // Sección 7G, pieza 1, texto de apoyo propuesto (146 caracteres).
  assert.strictEqual(porFormato(r, 'texto_apoyo').texto,
    'Cashback máximo de $25.000 en Créditos de Rappi para redimir en El Corral ' +
    'hasta el 13 de septiembre de 2026. Válido en un solo pedido por usuario.');
  assert.strictEqual(porFormato(r, 'texto_apoyo').largo, 146);

  // Sección 7G, pieza 1, letra pequeña propuesta. El enlace es el que arma la
  // herramienta con el nombre de la campaña, no el real de la pieza, que es
  // tres caracteres más corto.
  assert.strictEqual(porFormato(r, 'letra_pequena').texto,
    'Aplican términos y condiciones: https://promos.rappi.com/colombia/cashback-99-el-corral. ' +
    'Válido el 8 de septiembre de 2026 o hasta agotar el presupuesto disponible. ' +
    'Cashback del 99% sobre el valor de los productos, sin tarifa de servicio, costo de envío ni propinas. ' +
    'Para acceder debes tener tu membresía Pro o Pro Black activa: https://promos.rappi.com/colombia/prohome. ' +
    'Cashback ofrecido por El Corral. Imágenes de referencia.');
});

test('el banner de la pieza 1 no cabe, y la herramienta lo dice', () => {
  // La ficha de la respuesta lo mide en 379 con el enlace real. Con el que arma
  // la herramienta son 382, y el límite del banner corto es 300. Esa leyenda es
  // toda mínimo irreductible: no hay nada que recortar, así que se entrega con
  // el aviso para que nadie diseñe la pieza antes de saberlo.
  const r = leyendasDe(campanaDeElCorral(), CO, { nombreCampana: 'Cashback 99 El Corral' });
  const banner = porFormato(r, 'banner_corto');
  assert.strictEqual(banner.largo, 382);
  assert.strictEqual(banner.largo_max, 300);
  assert.strictEqual(banner.cabe, false);
  assert.strictEqual(banner.recortada, false);
});

test('el largo máximo lo pone el formato, no la leyenda', () => {
  // La misma leyenda de Carrera sirve para letra pequeña y para banner corto, y
  // esos dos no admiten lo mismo. Con el número de la leyenda (620), un banner
  // de 500 caracteres habría pasado por bueno.
  const r = leyendasDe(caso('CC01'));
  assert.strictEqual(porFormato(r, 'letra_pequena').largo_max, 620);
  assert.strictEqual(porFormato(r, 'banner_corto').largo_max, 300);
});

// --- Las seis formas de escribir la vigencia -------------------------------

test('la vigencia corta tiene una forma por cada caso', () => {
  const v = (cambios) => textoVigenciaCorta(Object.assign(
    { fechaInicio: '2026-09-08', fechaFin: '2026-09-08', horaInicio: '00:00', horaFin: '23:59' }, cambios));

  assert.strictEqual(v({}), 'el 8 de septiembre de 2026');
  assert.strictEqual(v({ horaInicio: '11:00', horaFin: '15:00' }),
    'el 16 de septiembre de 2026 entre las 11:00 a. m. y las 3:00 p. m.'
      .replace('16 de septiembre', '8 de septiembre'));
  assert.strictEqual(v({ fechaInicio: '2026-09-09', fechaFin: '2026-09-13' }),
    'del 9 al 13 de septiembre de 2026');
  assert.strictEqual(v({ fechaInicio: '2026-09-28', fechaFin: '2026-10-02' }),
    'del 28 de septiembre al 2 de octubre de 2026');
  assert.strictEqual(v({ fechaInicio: '2026-12-30', fechaFin: '2027-01-02' }),
    'del 30 de diciembre de 2026 al 2 de enero de 2027');
  assert.strictEqual(
    v({ fechaInicio: '2026-12-30', fechaFin: '2027-01-02', horaInicio: '18:00', horaFin: '23:59' }),
    'desde las 6:00 p. m. del 30 de diciembre de 2026 hasta las 11:59 p. m. del 2 de enero de 2027');
});

test('las horas de un día completo no se escriben', () => {
  // "Las horas se omiten cuando son 12:00 a. m. y 11:59 p. m." (sección 7B.1).
  const conHoras = textoVigenciaCorta({ fechaInicio: '2026-09-08', fechaFin: '2026-09-08', horaInicio: '00:00', horaFin: '23:59' });
  assert.strictEqual(conHoras.indexOf('a. m.'), -1, conHoras);
});

test('la pieza 4 del ETA sale con su franja horaria', () => {
  assert.strictEqual(
    textoVigenciaCorta({ fechaInicio: '2026-09-16', fechaFin: '2026-09-16', horaInicio: '11:00', horaFin: '15:00' }),
    'el 16 de septiembre de 2026 entre las 11:00 a. m. y las 3:00 p. m.');
});

// --- Los Créditos ----------------------------------------------------------

test('los Créditos dicen dónde y hasta cuándo, en las cuatro formas', () => {
  const base = { tipo: 'cashback', redencion: 'tienda', carga: 'dia_siguiente' };
  const conTienda = { TIENDA: 'El Corral' };

  assert.strictEqual(
    textoCreditosCorto(Object.assign({}, base, { vigencia: 'fecha', fechaFinRedencion: '2026-09-13' }), conTienda),
    'para redimir en El Corral hasta el 13 de septiembre de 2026');

  assert.strictEqual(
    textoCreditosCorto(Object.assign({}, base, { vigencia: 'dias', diasVigencia: 7 }), conTienda),
    'para redimir en El Corral durante 7 días desde que los recibes');

  assert.strictEqual(
    textoCreditosCorto(Object.assign({}, base, {
      vigencia: 'dias', diasVigencia: 7, carga: 'fecha', fechaCarga: '2027-01-03',
    }), conTienda),
    'para redimir en El Corral durante 7 días desde el 3 de enero de 2027');

  assert.strictEqual(
    textoCreditosCorto(Object.assign({}, base, {
      vigencia: 'fecha', fechaFinRedencion: '2027-01-31', carga: 'fecha', fechaCarga: '2027-01-03',
    }), conTienda),
    'para redimir en El Corral del 3 al 31 de enero de 2027');
});

test('el Multitienda redime en la misma tienda del pedido', () => {
  const texto = textoCreditosCorto(
    { tipo: 'cashback_day', vigencia: 'dias', diasVigencia: 7, carga: 'dia_siguiente' }, {});
  assert.strictEqual(texto, 'para redimir en la misma tienda del pedido durante 7 días desde que los recibes');
});

test('el ETA nombra sus exclusiones, y sin exclusiones dice otra cosa', () => {
  const con = textoCreditosCorto({
    tipo: 'cashback_eta', exclusionesEta: ['travel', 'soat', 'atm', 'favor'],
    vigencia: 'dias', diasVigencia: 7, carga: 'dia_siguiente',
  }, {});
  assert.strictEqual(con,
    'para redimir en Rappi, excepto en Rappi Travel, SOAT, Cajero ATM y Rappi Favor durante 7 días desde que los recibes');

  const sin = textoCreditosCorto({
    tipo: 'cashback_eta', exclusionesEta: [], vigencia: 'dias', diasVigencia: 7, carga: 'dia_siguiente',
  }, {});
  assert.ok(sin.indexOf('en cualquier sección de Rappi habilitada para Créditos') !== -1, sin);
});

// --- Lo demás que ya se preguntaba -----------------------------------------

test('el límite de pedidos tiene sus tres frases, y en órdenes donde toca', () => {
  assert.strictEqual(textoLimiteCorto({ tipo: 'cashback', maxPedidos: 1 }), 'Válido en un solo pedido por usuario.');
  assert.strictEqual(textoLimiteCorto({ tipo: 'cashback', maxPedidos: 3 }), 'Válido hasta en 3 pedidos por usuario.');
  assert.strictEqual(textoLimiteCorto({ tipo: 'cashback', sinLimite: true }), 'Sin límite de pedidos por usuario.');
  assert.strictEqual(textoLimiteCorto({ tipo: 'cashback_eta', maxPedidos: 1 }), 'Válido en una sola orden por usuario.');
  assert.strictEqual(textoLimiteCorto({ tipo: 'cashback_travel', maxOrdenes: 2 }), 'Válido hasta en 2 órdenes por usuario.');
});

test('lo que no restringe no ocupa espacio en la pieza', () => {
  assert.strictEqual(textoTerritorioCorto({ alcance: 'Nacional' }), '');
  assert.strictEqual(textoSegmentoCorto({ segmento: 'todos' }, CO), '');
  assert.strictEqual(textoPagoCorto({ metodoPago: 'todos' }), '');
  assert.strictEqual(textoCondicionesCorto({ condiciones: [] }, CO), '');
});

test('las ciudades y los segmentos que sí restringen se escriben', () => {
  assert.strictEqual(textoTerritorioCorto({ alcance: 'Ciudades', ciudades: 'Bogotá, Medellín, Cali' }),
    'Aplica solo en Bogotá, Medellín y Cali.');
  assert.strictEqual(textoSegmentoCorto({ segmento: 'pro' }, CO),
    'Para acceder debes tener tu membresía Pro o Pro Black activa: https://promos.rappi.com/colombia/prohome.');
  assert.strictEqual(textoSegmentoCorto({ segmento: 'nuevos' }, CO),
    'Solo para usuarios que hagan su primer pedido en Rappi durante la campaña.');
  assert.strictEqual(textoSegmentoCorto({ segmento: 'reactivados', diasSinCompra: 90 }, CO),
    'Solo para usuarios sin pedidos en Rappi en los 90 días anteriores al inicio de la campaña.');
  assert.strictEqual(textoPagoCorto({ metodoPago: 'sin_efectivo' }), 'Válido con cualquier medio de pago excepto efectivo.');
  assert.strictEqual(textoPagoCorto({ metodoPago: 'rappicard' }), 'Válido solo para pagos con RappiCard.');
  assert.strictEqual(textoCondicionesCorto({ condiciones: ['turbo'] }, CO), 'Válido solo en pedidos por Turbo.');
});

test('la lista de tiendas del Multitienda es la del caso real', () => {
  assert.strictEqual(listaTiendasCorta(caso('CD01')),
    'Beer Station (Bogotá y Medellín), Leños & Carbon (Cali) y EVOK (todo el país)');
});

test('con más de cinco tiendas la lista remite a los términos', () => {
  const muchas = { tiendas: [] };
  for (let i = 1; i <= 6; i += 1) muchas.tiendas.push({ marca: 'Tienda ' + i, nacional: true });
  assert.strictEqual(listaTiendasCorta(muchas), 'las tiendas participantes que aparecen en los términos');
});

test('una lista de pocas tiendas pero muy larga también remite a los términos', () => {
  const largas = { tiendas: [] };
  for (let i = 1; i <= 4; i += 1) {
    largas.tiendas.push({ marca: 'Nombre de tienda bastante largo número ' + i + ' con su razón social', nacional: true });
  }
  assert.strictEqual(listaTiendasCorta(largas), 'las tiendas participantes que aparecen en los términos');
});

test('Carrera dice quién gana, en singular y en plural', () => {
  assert.strictEqual(textoGanadoresCorto({ criterioGanador: 'mayor_valor', numeroGanadores: 1 }),
    'Gana el usuario con el mayor valor en compras de los productos participantes.');
  assert.strictEqual(textoGanadoresCorto({ criterioGanador: 'mayor_valor', numeroGanadores: 3 }),
    'Ganan los 3 usuarios con el mayor valor en compras de los productos participantes.');
});

test('Travel escribe su beneficio en las tres formas', () => {
  assert.strictEqual(textoBeneficioTravelCorto({ formaBeneficio: 'porcentaje', porcentaje: 10, tope: 90000 }, CO),
    'Cashback del 10% del valor pagado por tu reserva, con un máximo de $90.000 en Créditos por orden.');
  assert.strictEqual(textoBeneficioTravelCorto({ formaBeneficio: 'porcentaje', porcentaje: 10, sinTope: true }, CO),
    'Cashback del 10% del valor pagado por tu reserva.');
  assert.strictEqual(textoBeneficioTravelCorto({ formaBeneficio: 'monto_fijo', montoFijo: 50000 }, CO),
    '$50.000 en Créditos por cada orden que cumpla las condiciones.');
  assert.strictEqual(textoDescuentoTravelCorto({ formaDescuento: 'fijo', porcentaje: 15 }), 'Descuento del 15%');
  assert.strictEqual(textoDescuentoTravelCorto({ formaDescuento: 'variable', porcentajeMinimo: 10, porcentaje: 30 }),
    'Descuento de entre 10% y 30%');
});

test('la cifra de un monto usa la moneda y el separador del país', () => {
  assert.strictEqual(cifraDeMonto(25000, CO), '$25.000');
  assert.strictEqual(cifraDeMonto(25000, MX), '$25,000');
  assert.strictEqual(cifraDeMonto(null, CO), '');
});

// --- Lo que todavía no se puede -------------------------------------------

test('sin frase aprobada no hay leyenda, y se dice por qué', () => {
  // Tres casos donde la respuesta del encargo 03 no dio frase corta. La regla 3
  // de CLAUDE.md dice que el texto legal es de Legal: aquí no se inventa una.
  const secciones = faltantesParaLaLeyenda({ redencion: 'secciones' }, CO);
  assert.ok(secciones[0].indexOf('ciertas secciones') !== -1, secciones.join(' | '));

  const local = faltantesParaLaLeyenda({ condiciones: ['consumo_local'] }, CO);
  assert.ok(local[0].indexOf('consumo en el local') !== -1, local.join(' | '));

  const carrera = faltantesParaLaLeyenda({ tipo: 'carrera_compras', criterioGanador: 'mas_pedidos' }, CO);
  assert.ok(carrera[0].indexOf('más pedidos') !== -1, carrera.join(' | '));

  // Y una campaña normal no tiene nada pendiente.
  assert.deepStrictEqual(faltantesParaLaLeyenda(campanaDeElCorral(), CO), []);
});

test('una campaña sin frase aprobada no entrega ninguna leyenda a medias', () => {
  const r = leyendasDe(caso('CB02'));
  assert.strictEqual(r.hay, false);
  assert.deepStrictEqual(r.leyendas, []);
  assert.ok(r.faltantes.length > 0);
});

test('el enlace es el mismo en las cinco leyendas', () => {
  // Juan lo decidió el 18 de septiembre: no hay enlace corto. Dos direcciones
  // para el mismo T&C es una que alguien va a copiar mal. La consecuencia es que
  // la leyenda de push no cabe con el enlace, y la herramienta lo dice.
  const r = leyendasDe(campanaDeElCorral(), CO, { nombreCampana: 'Cashback 99 El Corral' });
  assert.deepStrictEqual(r.errores, [], r.errores.join(' | '));
  assert.deepStrictEqual(r.pendientes, [], 'ya no queda ningún formato pendiente');

  const conEnlace = r.leyendas.filter((l) => l.texto.indexOf('https://') !== -1);
  assert.ok(conEnlace.length >= 3, 'esperaba varias leyendas con enlace');
  for (const leyenda of conEnlace) {
    assert.ok(leyenda.texto.indexOf(r.enlacePrevisto) !== -1,
      leyenda.formato + ' lleva un enlace distinto: ' + leyenda.texto);
  }

  const push = r.leyendas.filter((l) => l.formato === 'push_sms')[0];
  assert.ok(push, 'la leyenda de push ya se entrega');
  assert.strictEqual(push.cabe, false, 'con el enlace, la push no cabe en 70 caracteres');
  assert.ok(push.sobra > 0 && push.caracteresEnEnlaces > 0, JSON.stringify(push));
});

// --- El enlace del T&C -----------------------------------------------------

test('el enlace se arma al generar, con la misma regla de la dirección', () => {
  assert.strictEqual(urlDelTcDeLaCampana({}, CO, 'Cashback 99 El Corral', ''),
    'https://promos.rappi.com/colombia/cashback-99-el-corral');
});

test('cuando el enlace publicado es distinto, manda el publicado', () => {
  // Es el paso 3 del camino 4 de la sección 6: la herramienta compara y rehace
  // la leyenda con el enlace real.
  assert.strictEqual(
    urlDelTcDeLaCampana({}, CO, 'Cashback 99 El Corral', 'https://promos.rappi.com/colombia/cashback99elcorral'),
    'https://promos.rappi.com/colombia/cashback99elcorral');

  const r = leyendasDe(campanaDeElCorral(), CO, {
    nombreCampana: 'Cashback 99 El Corral',
    enlacePublicado: 'https://promos.rappi.com/colombia/cashback99elcorral',
  });
  assert.ok(porFormato(r, 'letra_pequena').texto.indexOf('cashback99elcorral') !== -1);
  assert.strictEqual(porFormato(r, 'letra_pequena').texto.indexOf('cashback-99-el-corral'), -1);
});

test('un país sin ruta de publicación no inventa un enlace', () => {
  assert.strictEqual(urlDelTcDeLaCampana({}, MX, 'Campaña de México', ''), '');
});

// --- Los complementos ------------------------------------------------------

test('una campaña de Turbo pega la leyenda de Turbo sin preguntar nada', () => {
  assert.strictEqual(esDeTurbo({ condiciones: ['turbo'] }), true);
  assert.strictEqual(esDeTurbo({ tipo: 'cashback_eta' }), true);
  assert.strictEqual(esDeTurbo({ condiciones: [] }), false);

  const r = leyendasDe(caso('ETA01'));
  assert.deepStrictEqual(r.complementos, ['leyenda_turbo_co']);
  assert.ok(porFormato(r, 'letra_pequena').texto.indexOf('términos y condiciones Turbo') !== -1);
});

test('la categoría del producto suma su leyenda al final', () => {
  const conLicores = leyendasDe(campanaDeElCorral({ categoriaProducto: 'licores' }));
  assert.deepStrictEqual(conLicores.complementos, ['leyenda_licores_co']);
  const letra = porFormato(conLicores, 'letra_pequena').texto;
  assert.ok(letra.indexOf('El exceso de alcohol es perjudicial para la salud') !== -1, letra);
  // Y "Imágenes de referencia." sigue cerrando, como manda el catálogo.
  assert.ok(/Imágenes de referencia\.$/.test(letra), letra.slice(-80));
});

test('sin categoría no se pega ningún complemento', () => {
  const r = leyendasDe(campanaDeElCorral({ categoriaProducto: 'ninguna' }));
  assert.deepStrictEqual(r.complementos, []);
});

// --- Todos los casos dorados -----------------------------------------------

test('ninguna leyenda de los casos dorados sale rota ni con huecos', () => {
  for (const id of ['CB01', 'CD01', 'ETA01', 'ETA02', 'CC01', 'TV01', 'TV02', 'TV03', 'TV04', 'TV05', 'TV06', 'TV07']) {
    const entrada = caso(id);
    if (entrada.pais !== 'CO') continue;
    const r = leyendasDe(entrada, CO, { nombreCampana: 'Campaña dorada ' + id });
    assert.deepStrictEqual(r.errores, [], id + ': ' + r.errores.join(' | '));
    for (const leyenda of r.leyendas) {
      assert.ok(leyenda.texto.length > 0, id + '/' + leyenda.formato + ' salió vacía');
      assert.strictEqual(/\{\{|\[\[/.test(leyenda.texto), false, id + '/' + leyenda.formato + ': ' + leyenda.texto);
    }
  }
});

test('un país sin leyenda de campaña lo dice, no entrega una de Colombia', () => {
  const entrada = Object.assign(caso('MX01'), { categoriaProducto: 'licores' });
  const r = leyendasDe(entrada, MX, { nombreCampana: 'Cashback de prueba México' });
  assert.strictEqual(r.hay, false);
  assert.deepStrictEqual(r.leyendas, []);
});
