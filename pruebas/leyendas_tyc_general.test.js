'use strict';

/**
 * Las leyendas del camino de los T&C generales.
 *
 * Colombia resuelve casi la mitad de sus promociones sin generar documento: son
 * descuentos y cupones que Legal ya publicó, y la herramienta solo entrega el
 * enlace. Legal escribió y aprobó la letra pequeña de esas piezas
 * (leyenda_descuento_co), su complemento de Pro (leyenda_membresia_pro_co) y la
 * del push (leyenda_push_co), las tres marcadas con el tipo de campaña
 * "descuento_tyc_general".
 *
 * Y estaban muertas: ese tipo no es ninguno de ESQUEMAS, el camino de los
 * generales nunca llamaba al motor de leyendas, y tres de los marcadores que la
 * leyenda pide no los producía nadie. Escritas, aprobadas y sin manera de
 * llegar a una pieza.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { cargarLeyendas } = require('../scripts/lib/modelos');
const { leyendasDelTycGeneral, TIPO_DE_LEYENDA_GENERAL, sirveLaLetraPequena } = require('../src/core/tyc_genericos.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const CO = paises.find((p) => p.codigo === 'CO');
const LEYENDAS = cargarLeyendas();
const TYC = leerJson(rutaDesdeRaiz('data', 'tyc_genericos.json')).paises.CO;

function general(id) {
  return TYC.find((t) => t.id === id);
}

function armar(datos, tycId) {
  return leyendasDelTycGeneral(general(tycId || 'descuento_toda_la_tienda'), datos, CO, LEYENDAS);
}

const BASE = { fechaInicio: '2026-10-01', fechaFin: '2026-10-31' };

test('con la vigencia sola ya sale la letra pequeña completa', () => {
  const salida = armar(BASE);
  assert.ok(salida.hay, 'no salió ninguna leyenda: ' + JSON.stringify(salida));

  const letra = salida.leyendas.find((l) => l.formato === 'letra_pequena');
  assert.ok(letra, 'falta la letra pequeña: ' + salida.leyendas.map((l) => l.formato).join(', '));

  // El enlace es el del T&C que eligió, no uno inventado.
  assert.ok(letra.texto.indexOf(general('descuento_toda_la_tienda').enlace) !== -1,
    'la leyenda no lleva el enlace del T&C elegido: ' + letra.texto);
  assert.ok(letra.texto.indexOf('del 1 al 31 de octubre de 2026') !== -1, letra.texto);
  // Sin número de unidades, la frase obligatoria de existencias igual sale.
  assert.ok(letra.texto.indexOf('Hasta agotar existencias.') !== -1, letra.texto);
  // Y nunca un marcador sin resolver.
  assert.ok(!/\{\{|\}\}|\[\[|\]\]/.test(letra.texto), 'quedó un marcador: ' + letra.texto);
});

test('los números de la campaña salen con las palabras que aprobó Legal', () => {
  const texto = armar(Object.assign({}, BASE, {
    unidadesDisponibles: 10000, maxPorUsuario: 6,
  })).leyendas.find((l) => l.formato === 'letra_pequena').texto;

  assert.ok(texto.indexOf('10.000 unidades disponibles.') !== -1, texto);
  assert.ok(texto.indexOf('Máximo 6 unidades por usuario.') !== -1, texto);
});

test('el singular no se escribe en plural', () => {
  const texto = armar(Object.assign({}, BASE, {
    unidadesDisponibles: 1, maxPorUsuario: 1,
  })).leyendas.find((l) => l.formato === 'letra_pequena').texto;

  assert.ok(texto.indexOf('1 unidad disponible.') !== -1, texto);
  assert.ok(texto.indexOf('Máximo 1 unidad por usuario.') !== -1, texto);
});

test('el rango sale en porcentaje o en dinero, según el descuento', () => {
  const enPorcentaje = armar(Object.assign({}, BASE, {
    rangoDesde: 10, rangoHasta: 40,
  })).leyendas.find((l) => l.formato === 'letra_pequena').texto;
  assert.ok(enPorcentaje.indexOf('Ofertas desde 10% hasta 40%.') !== -1, enPorcentaje);

  const enDinero = armar(Object.assign({}, BASE, {
    rangoEn: 'dinero', rangoDesde: 10000, rangoHasta: 40000,
  })).leyendas.find((l) => l.formato === 'letra_pequena').texto;
  assert.ok(enDinero.indexOf('Ofertas entre $10.000 hasta $40.000.') !== -1, enDinero);
});

/*
 * Dónde va el texto de la membresía, que es lo que decidió este cambio.
 *
 * Explica qué incluye la membresía Pro, así que le sirve a quien la va a
 * comprar, no a quien ya la tiene. En un descuento exclusivo para Pro basta
 * con "debes tenerla activa"; poner las dos cosas repetía el enlace de Pro
 * dentro de la misma leyenda y la sacaba del largo del formato.
 */
test('un descuento solo para Pro dice que hay que tenerla activa, y nada más', () => {
  const salida = armar(Object.assign({}, BASE, { soloPro: true }), 'descuento_toda_la_tienda_pro');
  const texto = salida.leyendas.find((l) => l.formato === 'letra_pequena').texto;

  assert.ok(texto.indexOf('membresía Pro o Pro Black activa') !== -1, 'falta la condición de Pro: ' + texto);
  assert.ok(texto.indexOf('Entregas prioritarias') === -1,
    'metió la explicación de la membresía en un descuento, y ahí sobra: ' + texto);
  // El enlace de Pro, una sola vez.
  assert.strictEqual(texto.split('prohome').length - 1, 1, 'el enlace de Pro sale repetido: ' + texto);
});

test('una campaña sobre la membresía sí recibe su texto, que estaba huérfano', () => {
  for (const id of ['descuento_membresia_pro', 'cupones_membresia_pro_black']) {
    const salida = armar(BASE, id);
    assert.ok(salida.hay, id + ' se quedó sin nada que darle al comercial');

    const texto = salida.leyendas[0].texto;
    assert.ok(texto.indexOf('Entregas prioritarias solo en la sección de Restaurantes.') !== -1,
      'el texto de la membresía sigue sin llegar a la pieza: ' + texto);
    assert.ok(texto.indexOf('costo de envío') === -1,
      'le puso la frase de los descuentos a una campaña de suscripción: ' + texto);
    assert.ok(salida.porQue.length > 0, 'no explicó por qué no lleva la letra pequeña completa');
    assert.ok(salida.complementos.indexOf('leyenda_membresia_pro_co') !== -1,
      'el complemento no quedó anotado: ' + salida.complementos.join(', '));
  }
});

test('una campaña de Turbo trae la suya, como cualquier otra', () => {
  const texto = armar(Object.assign({}, BASE, { esDeTurbo: true }))
    .leyendas.find((l) => l.formato === 'letra_pequena').texto;
  assert.ok(texto.toLowerCase().indexOf('turbo') !== -1, texto);
});

test('el push sale con la compra mínima y sin hablar de Créditos', () => {
  const salida = armar(Object.assign({}, BASE, { compraMinima: 30000 }));
  const push = salida.leyendas.find((l) => l.formato === 'push_sms');
  assert.ok(push, 'falta la leyenda del push: ' + salida.leyendas.map((l) => l.formato).join(', '));
  assert.ok(push.texto.indexOf('Compra mínima $30.000.') !== -1, push.texto);
  // Un descuento no da Créditos: esa frase es del cashback y aquí no aplica.
  assert.ok(push.texto.indexOf('Créditos') === -1, 'el push habla de Créditos en un descuento: ' + push.texto);
});

test('sin la vigencia no se arma nada, en vez de una frase coja', () => {
  const salida = armar({});
  assert.ok(!salida.hay, 'armó una leyenda sin saber cuándo vale la campaña');
  assert.ok(salida.faltan.length > 0, 'no dijo qué falta');
});

/*
 * La restricción que importa de verdad.
 *
 * La leyenda dice "El descuento no incluye tarifa de servicio y costo de
 * envío". Ponerla en una campaña de Envío Gratis o de Tarifa de Servicio Gratis
 * sería publicar una pieza que se contradice a sí misma y que le niega al
 * usuario justo lo que la campaña le promete.
 */
test('la letra pequeña no se ofrece donde contradiría a la campaña', () => {
  for (const id of ['envio_gratis', 'tarifa_servicio_gratis']) {
    const revision = sirveLaLetraPequena(general(id));
    assert.strictEqual(revision.sirve, false, id + ' aceptó una leyenda que lo contradice');
    assert.ok(revision.porQue.length > 0, 'no dijo por qué no sirve para ' + id);

    const salida = armar(BASE, id);
    assert.ok(!salida.hay, 'armó la leyenda de descuento para ' + id);
  }
});

test('tampoco donde el descuento no es sobre un pedido', () => {
  // El descuento es sobre el valor de la suscripción, así que hablar de tarifa
  // de servicio y costo de envío no dice nada del beneficio.
  for (const id of ['descuento_membresia_pro', 'cupones_membresia_pro_black']) {
    assert.strictEqual(sirveLaLetraPequena(general(id)).sirve, false, id);
  }
});

test('y sí se ofrece en los descuentos y cupones sobre el pedido', () => {
  const sirven = [
    'descuento_toda_la_tienda', 'descuento_productos_seleccionados', 'descuento_en_valor',
    'descuento_usuarios_nuevos_turbo', 'descuento_productos_seleccionados_pro',
    'descuento_toda_la_tienda_pro', 'descuento_en_valor_pro',
    'cupon_valor_fijo', 'cupon_toda_la_tienda',
  ];
  for (const id of sirven) {
    assert.strictEqual(sirveLaLetraPequena(general(id)).sirve, true, id + ' se quedó sin letra pequeña');
  }
});

/*
 * Lo que cabe y lo que no.
 *
 * La leyenda completa cabe en la letra pequeña, que es el formato para el que
 * Legal la escribió (620 caracteres). En un banner corto no cabe, y eso no es
 * un error: el motor la devuelve igual, con cabe en false y con cuánto se
 * pasa, porque quien diseña la pieza tiene que verlo antes. Lo que nunca se
 * devuelve es una leyenda a medias.
 */
test('la letra pequeña cabe, incluso con el enlace más largo', () => {
  const salida = armar(Object.assign({}, BASE, {
    unidadesDisponibles: 10000, maxPorUsuario: 6, soloPro: true, compraMinima: 30000,
  }), 'descuento_toda_la_tienda_pro');

  const letra = salida.leyendas.find((l) => l.formato === 'letra_pequena');
  assert.strictEqual(letra.cabe, true, 'se pasa por ' + letra.sobra + ': ' + letra.texto);
  assert.deepStrictEqual(letra.errores, []);

  for (const leyenda of salida.leyendas) {
    assert.deepStrictEqual(leyenda.errores, [], leyenda.formato + ': ' + leyenda.errores.join(' | '));
    assert.ok(!/\{\{|\}\}|\[\[|\]\]/.test(leyenda.texto), leyenda.formato + ' dejó un marcador');
  }
});

test('y cuando no cabe en un formato corto, se dice por cuánto', () => {
  const salida = armar(Object.assign({}, BASE, {
    unidadesDisponibles: 10000, maxPorUsuario: 6, soloPro: true,
  }), 'descuento_toda_la_tienda_pro');

  const banner = salida.leyendas.find((l) => l.formato === 'banner_corto');
  assert.strictEqual(banner.cabe, false, 'el banner corto cabía y la prueba ya no vigila nada');
  assert.ok(banner.sobra > 0, 'no dijo por cuánto se pasa');
  // Y aun así trae el texto entero, para que se vea qué habría que recortar.
  assert.ok(banner.texto.length > 0);
});

test('el tipo de leyenda es el que dice el catálogo de Legal', () => {
  assert.strictEqual(TIPO_DE_LEYENDA_GENERAL, 'descuento_tyc_general');
});

/*
 * Y que la pantalla lo llame.
 *
 * Esta es la prueba que habría cazado el defecto original. Las tres leyendas
 * estaban escritas, aprobadas y probadas en Node, y no llegaban a ninguna
 * pieza porque ninguna pantalla llamaba al motor. Un mecanismo que la interfaz
 * no llama es un mecanismo que no existe.
 */
test('la pantalla de los T&C generales llama al motor de leyendas', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const pantalla = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'client', 'js', '63-tyc-genericos.js'), 'utf8');

  assert.ok(pantalla.indexOf('leyendasDelTycGeneral(') !== -1,
    'la pantalla no arma la letra pequeña: las leyendas vuelven a quedar muertas');
  assert.ok(pantalla.indexOf('sirveLaLetraPequena(') !== -1,
    'la pantalla no comprueba dónde la leyenda se contradiría con la campaña');
});
