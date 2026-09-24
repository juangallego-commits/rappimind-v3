'use strict';

/**
 * Qué pasa cuando el comercial escribe un cero, o un número fuera de rango.
 *
 * Cinco preguntas tenían escrito su mensaje de "tiene que ser mayor que cero"
 * en `preguntas.js` y nadie lo disparaba, porque el esquema no declaraba el
 * mínimo. El resultado era un documento publicable que decía, según el caso:
 *
 *   "deberá ser igual o superior a cero pesos M/Cte. ($0)"
 *   "Cada ganador recibirá cero (0) Créditos"
 *   "sin que puedas recibir más de cero (0) Créditos por orden"
 *   "Beer Station (Bogotá): cero (0) Créditos"
 *
 * Y el cashback por ETA, que se construyó después que el de delivery, se quedó
 * sin el rango de 1 a 100 del porcentaje: aceptaba 500 y titulaba el documento
 * "15 MINUTOS O 500% CASHBACK".
 *
 * Es la misma regla que Brasil ya tenía en sus seis preguntas numéricas.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { generarTexto } = require('../src/core/generar.js');
const { ESQUEMAS, camposVisibles } = require('../src/core/esquemas.js');
const { solicitud, tiendasDePrueba } = require('./dobles/solicitudes.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const modelos = cargarModelos();
const FECHA = '2026-09-16';

function generar(codigoPais, tipo, respuestas) {
  const pais = paises.find((p) => p.codigo === codigoPais);
  return generarTexto(solicitud(codigoPais, tipo, respuestas), pais, modelos, {
    fechaReferencia: FECHA,
    usuarioEnEquipo: true,
  });
}

function mensajesDe(salida) {
  return salida.errores.map((e) => e.mensaje).join(' | ');
}

test('una compra mínima de cero no genera, y en blanco sí', () => {
  const cero = generar('CO', 'cashback', { compraMinima: 0 });
  assert.ok(!cero.valido);
  assert.ok(mensajesDe(cero).includes('Si no quieres exigir un mínimo, deja el campo vacío.'),
    'el mensaje que salió fue: ' + mensajesDe(cero));

  // Dejarlo vacío es la manera de decir que no hay mínimo, y sigue valiendo.
  assert.ok(generar('CO', 'cashback', { compraMinima: '' }).valido);
  assert.ok(generar('CO', 'cashback', { compraMinima: 30000 }).valido);
});

test('un premio de cero Créditos no genera', () => {
  const salida = generar('CO', 'carrera_compras', { tipoPremio: 'creditos', creditosPremio: 0 });
  assert.ok(!salida.valido);
  assert.ok(mensajesDe(salida).includes('El premio tiene que ser mayor que cero.'), mensajesDe(salida));
  assert.ok(generar('CO', 'carrera_compras', { tipoPremio: 'creditos', creditosPremio: 500000 }).valido);
});

test('en Rappi Travel el tope, los Créditos por orden y el presupuesto no pueden ser cero', () => {
  const tope = generar('CO', 'cashback_travel', { formaBeneficio: 'porcentaje', sinTope: false, tope: 0 });
  assert.ok(!tope.valido);
  assert.ok(mensajesDe(tope).toLowerCase().includes('mayor que cero'), mensajesDe(tope));

  const monto = generar('CO', 'cashback_travel', { formaBeneficio: 'monto_fijo', montoFijo: 0 });
  assert.ok(!monto.valido);
  assert.ok(mensajesDe(monto).toLowerCase().includes('más que cero'), mensajesDe(monto));

  const presupuesto = generar('CO', 'cashback_travel', { presupuesto: 0 });
  assert.ok(!presupuesto.valido);
  assert.ok(mensajesDe(presupuesto).toLowerCase().includes('mayor que cero'), mensajesDe(presupuesto));
});

test('el porcentaje del cashback por ETA va de 1 a 100, como el de delivery', () => {
  ['500', '101', '0'].forEach((valor) => {
    const salida = generar('CO', 'cashback_eta', { porcentaje: Number(valor) });
    assert.ok(!salida.valido, 'el ETA generó con porcentaje ' + valor);
    assert.ok(mensajesDe(salida).includes('El porcentaje va de 1 a 100'), mensajesDe(salida));
  });
  assert.ok(generar('CO', 'cashback_eta', { porcentaje: 1 }).valido);
  assert.ok(generar('CO', 'cashback_eta', { porcentaje: 100 }).valido);
});

test('una tienda del Multitienda con presupuesto en cero no genera, y dice cuál', () => {
  const tiendas = tiendasDePrueba('CO');
  tiendas[0].presupuesto = 0;
  const salida = generar('CO', 'cashback_day', { tiendas });
  assert.ok(!salida.valido);
  assert.ok(mensajesDe(salida).includes('Tienda 1'), mensajesDe(salida));
  assert.ok(mensajesDe(salida).includes('presupuesto'), mensajesDe(salida));

  assert.ok(generar('CO', 'cashback_day', { tiendas: tiendasDePrueba('CO') }).valido);
});

test('el tope por pedido del Multitienda tampoco puede ser cero', () => {
  const salida = generar('CO', 'cashback_day', { tope: 0 });
  assert.ok(!salida.valido);
  assert.ok(mensajesDe(salida).toLowerCase().includes('mayor que cero'), mensajesDe(salida));
});

/*
 * El barrido: un cero en cualquier pregunta numérica, de cualquier tipo y de
 * cualquier país, nunca puede terminar en un documento.
 *
 * Es la prueba que habría cazado los cinco casos de arriba de una vez.
 */
test('ningún cero llega al documento, en ningún tipo ni país', () => {
  const colados = [];
  paises.forEach((pais) => {
    (pais.modelos || []).forEach((tipo) => {
      const esquema = ESQUEMAS[tipo];
      if (!esquema) return;
      esquema.campos.filter((c) => c.tipo === 'numero').forEach((campo) => {
        const respuestas = {};
        respuestas[campo.id] = 0;
        const entrada = solicitud(pais.codigo, tipo, respuestas);
        // Solo cuenta si la pregunta se ve de verdad con esas respuestas: un
        // campo oculto no llega al documento, así que su valor da igual.
        const seVe = camposVisibles(tipo, entrada).some((c) => c.id === campo.id);
        if (!seVe) return;
        const salida = generar(pais.codigo, tipo, respuestas);
        if (salida.valido) colados.push(pais.codigo + ' ' + tipo + ' ' + campo.id + '=0');
      });
    });
  });
  assert.deepStrictEqual(colados, [], 'preguntas numéricas que aceptan cero:\n' + colados.join('\n'));
});

test('todo número obligatorio de cada tipo declara su mínimo', () => {
  /*
   * Es la regla que Brasil cumplía y los demás no. Se revisa sobre el esquema
   * para que un tipo nuevo no nazca con el mismo agujero; las dos excepciones
   * son el tope y el presupuesto, que tienen su propia revisión cruzada en
   * validarCashback (ahí el mensaje explica además la relación entre los dos).
   */
  const CON_REVISION_PROPIA = ['tope', 'presupuesto'];
  const sinMinimo = [];
  Object.keys(ESQUEMAS).forEach((tipo) => {
    ESQUEMAS[tipo].campos.forEach((campo) => {
      if (campo.tipo !== 'numero') return;
      if (campo.minimo !== undefined) return;
      if (CON_REVISION_PROPIA.indexOf(campo.id) !== -1) return;
      sinMinimo.push(tipo + '.' + campo.id);
    });
    (ESQUEMAS[tipo].camposPorTienda || []).forEach((campo) => {
      if (campo.tipo === 'numero' && campo.minimo === undefined) sinMinimo.push(tipo + '.tienda.' + campo.id);
    });
  });
  assert.deepStrictEqual(sinMinimo, [], 'preguntas numéricas sin mínimo declarado:\n' + sinMinimo.join('\n'));
});

/*
 * Los decimales.
 *
 * La revisión numérica miraba el mínimo y el máximo, nunca si el número era
 * entero. El motor, en cambio, trunca con Math.trunc antes de escribirlo en
 * letras, y el nombre de la campaña usa el valor crudo. Con un 50,5 el
 * documento salía dado por bueno diciendo dos cosas distintas:
 *
 *   ## JUMBO MT · 50.5% CASHBACK · 17 SEP 2026
 *   ...el cincuenta por ciento (50%) del valor de tu pedido...
 *
 * Y eso no es cosmético: el articulado dice que ante una discrepancia se aplica
 * la condición más favorable para el usuario, así que el título obliga a pagar
 * el 50,5% sobre una cláusula que concede el 50%. Es la misma razón por la que
 * el nombre se arma solo desde las respuestas, en src/core/nombres.js.
 *
 * En los otros cuarenta y un campos numéricos el decimal simplemente
 * desaparecía y el documento salía idéntico al del valor entero.
 */
test('un porcentaje con decimales no genera, en vez de titular una cosa y conceder otra', () => {
  const salida = generar('CO', 'cashback', { porcentaje: 50.5 });
  assert.ok(!salida.valido, 'generó un documento que se contradice a sí mismo');
  assert.ok(mensajesDe(salida).includes('entero'), 'el mensaje que salió fue: ' + mensajesDe(salida));

  const entero = generar('CO', 'cashback', { porcentaje: 50 });
  assert.ok(entero.valido, mensajesDe(entero));
  assert.ok(entero.texto.includes('cincuenta por ciento (50%)'));
});

test('ningún campo numérico de ningún tipo acepta un decimal', () => {
  // Se recorren todos, porque el hueco era de la revisión genérica y valía
  // para los diez tipos: 47 campos en total.
  let revisados = 0;
  for (const tipo of Object.keys(ESQUEMAS)) {
    const esquema = ESQUEMAS[tipo];
    const codigoPais = esquema.esDeBrasil ? 'BR' : 'CO';
    if (!paises.find((p) => p.codigo === codigoPais)) continue;

    for (const campo of esquema.campos || []) {
      if (campo.tipo !== 'numero') continue;
      const base = solicitud(codigoPais, tipo, {});
      const original = Number(base[campo.id]);
      if (!isFinite(original) || original === 0) continue;

      const salida = generar(codigoPais, tipo, { [campo.id]: original + 0.5 });
      assert.ok(!salida.valido,
        tipo + '.' + campo.id + ' aceptó ' + (original + 0.5) + ' y lo truncó en silencio');
      revisados += 1;
    }
  }
  assert.ok(revisados > 30, 'la prueba no recorrió los campos que decía: solo ' + revisados);
});

test('tampoco los números de cada tienda del Multitienda', () => {
  // Las tiendas se revisan en su propio bucle, así que el hueco estaba en dos
  // sitios: el presupuesto de una tienda salía impreso sin su decimal.
  const tiendas = tiendasDePrueba();
  tiendas[0].presupuesto = Number(tiendas[0].presupuesto) + 0.5;

  const salida = generar('CO', 'cashback_day', { tiendas: tiendas });
  assert.ok(!salida.valido, 'el presupuesto de una tienda aceptó un decimal');
  assert.ok(mensajesDe(salida).includes('enteros'), 'el mensaje que salió fue: ' + mensajesDe(salida));
});

/*
 * El techo de los números escritos en letras.
 *
 * numeroEnLetras funciona hasta 999.999.999.999, como dice su comentario, y a
 * partir de ahí repetía la palabra en vez de avisar: un billón salía como
 * "un millón millones", y 1e21 como "mil millones millones millones (1e+21)",
 * con el documento dado por bueno. Ningún campo monetario declara un máximo,
 * así que nada lo detenía. La vía real es el tecleo con ceros de más.
 */
test('un número más grande de lo que el motor sabe escribir no genera', () => {
  const salida = generar('CO', 'cashback', { presupuesto: 1000000000000 });
  assert.ok(!salida.valido, 'generó un documento que dice "un millón millones"');
  assert.ok(mensajesDe(salida).includes('grande'), 'el mensaje que salió fue: ' + mensajesDe(salida));

  // El último número que sí sabe escribir sigue pasando.
  const limite = generar('CO', 'cashback', { presupuesto: 999999999999, tope: 30000 });
  assert.ok(limite.valido, mensajesDe(limite));
});

test('y en portugués tampoco, que tiene el mismo techo', () => {
  const salida = generar('BR', 'promocao_br', { compraMinima: 5000000000000 });
  assert.ok(!salida.valido, 'generó un documento que dice "cinco milhões milhões"');
});
