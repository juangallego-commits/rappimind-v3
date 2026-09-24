'use strict';

/**
 * Los tipos que se habilitaron fuera de Colombia el 21 de septiembre de 2026:
 * Descuento, Cupón y Carrera de Compras en los ocho países de habla hispana que
 * no son Colombia, y Cupom en Brasil.
 *
 * Lo que se protege aquí no es el texto de un documento, que eso ya lo hacen los
 * casos dorados, sino las tres formas en que esto se rompe callado:
 *
 *   1. Un tipo habilitado en la semilla al que el país no le puede cumplir: le
 *      falta un dato de la fila y el comercial se entera cinco preguntas
 *      después, o peor, publica un documento con un hueco.
 *   2. Una pregunta que sigue hablando como si todos los países fueran
 *      Colombia. "¿Cuál es el NIT de esa empresa?" le pide a un KAM de México
 *      un número que en México no existe.
 *   3. Un marcador de país sin columna detrás: se queda crudo en la pantalla,
 *      "{ID_FISCAL}", y nadie lo ve hasta que alguien abre esa pregunta.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson, leerTexto } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { generarTexto } = require('../src/core/generar.js');
const { textoPlano } = require('../src/core/texto.js');
const { ESQUEMAS } = require('../src/core/esquemas.js');
const { tiposDelPais, paisDesdeFila } = require('../src/core/paises.js');
const {
  PREGUNTAS, preguntaDe, conDatosDelPais, DATOS_DEL_PAIS_EN_LA_PREGUNTA, VARIANTES_HEREDADAS,
  CIUDADES_SUGERIDAS,
} = require('../src/core/preguntas.js');
const { solicitud } = require('./dobles/solicitudes.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const modelos = cargarModelos();
const FECHA = '2026-09-16';

const CATALOGO = Object.keys(ESQUEMAS).map((id) => ESQUEMAS[id]);
const porCodigo = (codigo) => paises.filter((p) => p.codigo === codigo)[0];
const tiposDe = (codigo) => tiposDelPais(porCodigo(codigo), CATALOGO).map((t) => t.id);

/** Los ocho de habla hispana que no son Colombia. */
const FUERA_DE_COLOMBIA = ['MX', 'PE', 'AR', 'CL', 'EC', 'UY', 'CR'];
const NUEVOS = ['descuento', 'cupon', 'carrera_compras'];

// --- Qué ofrece cada país ----------------------------------------------------

test('los tres tipos nuevos están habilitados en los siete países que no son Colombia', () => {
  for (const codigo of FUERA_DE_COLOMBIA) {
    const tipos = tiposDe(codigo);
    for (const tipo of NUEVOS) {
      assert.ok(tipos.indexOf(tipo) !== -1, codigo + ' no ofrece ' + tipo);
    }
  }
});

test('Colombia se queda como estaba: Juan pidió no tocarla', () => {
  assert.deepStrictEqual(tiposDe('CO').sort(),
    ['carrera_compras', 'cashback', 'cashback_day', 'cashback_eta', 'cashback_travel', 'descuento_travel']);
});

test('Brasil ofrece sus dos tipos en portugués y ninguno en español', () => {
  assert.deepStrictEqual(tiposDe('BR').sort(), ['cupom_br', 'promocao_br']);

  /*
   * El concurso no entra en Brasil, y no es un olvido.
   *
   * La Ley 5.768 de 1971 pide autorización previa de la Secretaria de Prêmios e
   * Apostas para toda distribución gratuita de premios, y nombra al "concurso"
   * entre las modalidades que la necesitan. Una herramienta que genere sola el
   * T&C de una Carrera de Compras brasileña estaría invitando a publicar una
   * promoción sin el certificado. Queda escrito en docs/DECISIONES.md.
   */
  assert.strictEqual(tiposDe('BR').indexOf('carrera_compras'), -1,
    'la Carrera de Compras se habilitó en Brasil sin la autorización previa de la SPA');

  const decisiones = leerTexto(rutaDesdeRaiz('docs', 'DECISIONES.md'));
  assert.ok(decisiones.indexOf('5.768') !== -1,
    'la razón por la que Brasil no tiene concurso no está escrita en docs/DECISIONES.md');
});

test('el Cashback Multitienda, el ETA y Rappi Travel siguen siendo solo de Colombia', () => {
  // Los tres dependen de datos que hoy solo existen en la fila de Colombia: las
  // secciones de redención por tienda, el botón Turbo por ciudad y el registro
  // de turismo de Travel Moustache. Habilitarlos fuera sería ofrecer un camino
  // que muere a mitad.
  for (const codigo of FUERA_DE_COLOMBIA.concat(['BR'])) {
    const tipos = tiposDe(codigo);
    for (const tipo of ['cashback_day', 'cashback_eta', 'cashback_travel', 'descuento_travel']) {
      assert.strictEqual(tipos.indexOf(tipo), -1, codigo + ' ofrece ' + tipo + ', que no puede cumplir');
    }
  }
});

// --- Que el documento salga de verdad, en los ocho países --------------------

test('cada país habilitado genera los tres tipos nuevos sin un solo error', () => {
  for (const codigo of FUERA_DE_COLOMBIA) {
    const pais = porCodigo(codigo);
    for (const tipo of NUEVOS) {
      const salida = generarTexto(solicitud(codigo, tipo, {}), pais, modelos, {
        fechaReferencia: FECHA,
        usuarioEnEquipo: true,
      });
      assert.ok(salida.valido,
        codigo + ' · ' + tipo + ': ' + salida.errores.map((e) => e.campo + ' ' + e.mensaje).join(' | '));
      assert.ok(salida.texto.indexOf('{{') === -1 && salida.texto.indexOf('[[') === -1,
        codigo + ' · ' + tipo + ' dejó una marca sin resolver');
    }
  }
});

test('el documento de cada país nombra su moneda, su ley y su autoridad de consumo', () => {
  for (const codigo of FUERA_DE_COLOMBIA) {
    const pais = porCodigo(codigo);
    const salida = generarTexto(solicitud(codigo, 'descuento', {}), pais, modelos, {
      fechaReferencia: FECHA,
      usuarioEnEquipo: true,
    });
    const plano = textoPlano(salida.texto);
    assert.ok(plano.indexOf(pais.entidad_legal) !== -1, codigo + ': falta la entidad legal');
    assert.ok(plano.indexOf(pais.ley_aplicable) !== -1, codigo + ': falta la ley aplicable');
    assert.ok(plano.indexOf(pais.entidad_vigilancia) !== -1, codigo + ': falta la autoridad de consumo');
    assert.ok(plano.indexOf(pais.texto_hora_local) !== -1, codigo + ': falta la hora local');
  }
});

test('el concurso nombra el parentesco de cada país, y Colombia conserva el suyo', () => {
  // "Segundo de afinidad y primero civil" es la forma del Código Civil
  // colombiano. El texto que aprobó Juan para Colombia no se movió ni una letra.
  assert.strictEqual(porCodigo('CO').texto_parentesco,
    'hasta el segundo grado de consanguinidad, segundo de afinidad y primero civil');

  for (const codigo of ['CO'].concat(FUERA_DE_COLOMBIA)) {
    const pais = porCodigo(codigo);
    const salida = generarTexto(solicitud(codigo, 'carrera_compras', {}), pais, modelos, {
      fechaReferencia: FECHA,
      usuarioEnEquipo: true,
    });
    assert.ok(textoPlano(salida.texto).indexOf('Sus familiares ' + pais.texto_parentesco + '.') !== -1,
      codigo + ': la cláusula de inhabilidades no trae el parentesco de su país');
  }
});

// --- Las preguntas hablan el idioma fiscal de cada país ----------------------

test('cada país tiene escritos los cuatro datos que piden los tipos nuevos', () => {
  for (const pais of paises) {
    for (const columna of ['tipo_id_organizador', 'ejemplo_id_fiscal', 'donde_id_fiscal']) {
      assert.ok(String(pais[columna] || '').trim(), pais.codigo + ' no tiene ' + columna);
    }
    // El impuesto y el parentesco solo hacen falta donde corre el concurso.
    if (tiposDe(pais.codigo).indexOf('carrera_compras') === -1) continue;
    assert.ok(String(pais.impuesto_indirecto || '').trim(), pais.codigo + ' no tiene impuesto_indirecto');
    assert.ok(String(pais.texto_parentesco || '').trim(), pais.codigo + ' no tiene texto_parentesco');
  }
});

test('la pregunta del organizador dice el nombre que el número tiene allí', () => {
  const esperado = {
    CO: 'NIT', MX: 'RFC', PE: 'RUC', AR: 'CUIT',
    CL: 'RUT', EC: 'RUC', UY: 'RUT', CR: 'cédula jurídica', BR: 'CNPJ',
  };
  for (const pais of paises) {
    const pregunta = conDatosDelPais(preguntaDe('organizadorId', 'descuento'), pais);
    assert.strictEqual(pregunta.pregunta,
      '¿Cuál es el número de ' + esperado[pais.codigo] + ' de esa empresa?', pais.codigo);
    assert.ok(pregunta.ayuda.indexOf(pais.ejemplo_id_fiscal) !== -1,
      pais.codigo + ': la ayuda no trae el ejemplo de ese país');
    // Y fuera de Colombia no queda ni rastro del NIT.
    if (pais.codigo === 'CO') continue;
    const todo = [pregunta.pregunta, pregunta.ayuda, pregunta.ejemplo].concat(
      Object.keys(pregunta.errores).map((k) => pregunta.errores[k])).join(' ');
    assert.strictEqual(/\bNIT\b/.test(todo), false, pais.codigo + ' todavía habla del NIT: ' + todo);
  }
});

test('ningún marcador de país se queda crudo en una pregunta, en ningún país', () => {
  /*
   * Un marcador sin columna detrás no lanza ningún error: se queda escrito en la
   * pantalla, "{ID_FISCAL}", y lo descubre el comercial que abre esa pregunta.
   * Esto recorre todas las preguntas de todos los tipos en todos los países.
   */
  const conMarcador = /\{[A-Z_]+\}/;
  const crudos = [];

  for (const pais of paises) {
    const fila = paisDesdeFila(pais);
    for (const tipoId of Object.keys(ESQUEMAS)) {
      for (const campo of ESQUEMAS[tipoId].campos) {
        const pregunta = conDatosDelPais(preguntaDe(campo.id, tipoId), fila);
        const textos = [pregunta.pregunta, pregunta.ayuda, pregunta.porQue, pregunta.ejemplo]
          .concat(Object.keys(pregunta.errores || {}).map((k) => pregunta.errores[k]));
        for (const sub of ['camposPorTienda', 'camposPorProducto']) {
          for (const llave of Object.keys(pregunta[sub] || {})) {
            const hijo = pregunta[sub][llave];
            textos.push(hijo.pregunta, hijo.ayuda, hijo.ejemplo);
          }
        }
        for (const texto of textos) {
          if (typeof texto === 'string' && conMarcador.test(texto)) {
            crudos.push(pais.codigo + ' · ' + tipoId + ' · ' + campo.id + ': ' + texto);
          }
        }
      }
    }
  }
  assert.deepStrictEqual(crudos, [], 'quedaron marcadores sin resolver:\n' + crudos.join('\n'));
});

test('todo marcador que una pregunta use tiene su columna en la semilla', () => {
  const texto = leerTexto(rutaDesdeRaiz('src', 'core', 'preguntas.js'));
  const usados = new Set((texto.match(/\{[A-Z_]+\}/g) || []));
  for (const marcador of usados) {
    assert.ok(Object.prototype.hasOwnProperty.call(DATOS_DEL_PAIS_EN_LA_PREGUNTA, marcador),
      'la pregunta usa ' + marcador + ', que no está en DATOS_DEL_PAIS_EN_LA_PREGUNTA');
    const columna = DATOS_DEL_PAIS_EN_LA_PREGUNTA[marcador];
    for (const pais of paises) {
      assert.ok(String(pais[columna] || '').trim(), pais.codigo + ' no tiene la columna ' + columna);
    }
  }
});

test('ninguna pantalla pide con preguntaDe() un texto que lleva marcador de país', () => {
  /*
   * La trampa de siempre, y esta vez con nombre: preguntaDe() no sabe de países,
   * así que un texto con marcador pedido por ahí sale con el "{ID_FISCAL}"
   * crudo en la pantalla. Pasó de verdad: la cabecera de la lista de tiendas del
   * Multitienda y su línea de ayuda llamaban a preguntaDe('tiendas'), y con el
   * marcador recién puesto habrían mostrado la llave a la vista.
   *
   * Lo que sí sabe de países es estado.pregunta(), que es por donde pasa toda
   * pantalla que muestre el texto de una pregunta.
   */
  const conMarcador = /\{[A-Z_]+\}/;
  const textosDe = (pregunta) => {
    const sueltos = [pregunta.pregunta, pregunta.ayuda, pregunta.porQue, pregunta.ejemplo];
    for (const llave of Object.keys(pregunta.errores || {})) sueltos.push(pregunta.errores[llave]);
    for (const sub of ['camposPorTienda', 'camposPorProducto']) {
      for (const llave of Object.keys(pregunta[sub] || {})) {
        const hijo = pregunta[sub][llave];
        sueltos.push(hijo.pregunta, hijo.ayuda, hijo.ejemplo);
      }
    }
    for (const tipo of Object.keys(pregunta.variantes || {})) {
      const variante = pregunta.variantes[tipo];
      sueltos.push(variante.pregunta, variante.ayuda, variante.porQue, variante.ejemplo);
      for (const llave of Object.keys(variante.errores || {})) sueltos.push(variante.errores[llave]);
    }
    return sueltos.filter((t) => typeof t === 'string');
  };

  const conMarcadores = Object.keys(PREGUNTAS)
    .filter((id) => textosDe(PREGUNTAS[id]).some((t) => conMarcador.test(t)));
  assert.ok(conMarcadores.length > 0, 'ya no hay ninguna pregunta con marcador: revisa esta prueba');

  const fs = require('node:fs');
  const path = require('node:path');
  const carpeta = path.join(__dirname, '..', 'src', 'client', 'js');
  const malas = [];
  for (const archivo of fs.readdirSync(carpeta)) {
    if (!/\.js$/.test(archivo)) continue;
    const codigo = fs.readFileSync(path.join(carpeta, archivo), 'utf8');
    for (const id of conMarcadores) {
      if (codigo.indexOf("preguntaDe('" + id + "'") !== -1) malas.push(archivo + ' pide ' + id);
    }
  }
  assert.deepStrictEqual(malas, [],
    'usa estado.pregunta() en vez de preguntaDe():\n' + malas.join('\n'));
});

test('poner los datos de un país no deja al siguiente hablando de ese país', () => {
  // PREGUNTAS es un objeto compartido. Si conDatosDelPais lo escribiera encima,
  // una campaña de México dejaría "RFC" escrito para la siguiente de Colombia.
  const antes = PREGUNTAS.organizadorId.pregunta;
  conDatosDelPais(preguntaDe('organizadorId', 'descuento'), porCodigo('MX'));
  assert.strictEqual(PREGUNTAS.organizadorId.pregunta, antes, 'se pisó la pregunta original');
  assert.strictEqual(
    conDatosDelPais(preguntaDe('organizadorId', 'descuento'), porCodigo('CO')).pregunta,
    '¿Cuál es el número de NIT de esa empresa?'
  );

  // Lo mismo con las subpreguntas de la lista de tiendas, que van anidadas.
  const deTiendas = PREGUNTAS.tiendas.camposPorTienda.id.pregunta;
  conDatosDelPais(preguntaDe('tiendas', 'cashback_day'), porCodigo('MX'));
  assert.strictEqual(PREGUNTAS.tiendas.camposPorTienda.id.pregunta, deTiendas);
});

// --- Las ciudades sugeridas de "¿En qué ciudades?" ---------------------------

test('todo país que ofrece cashback, carrera_compras, descuento o cupón trae su propia lista de ciudades sugeridas', () => {
  // La misma trampa de siempre: un país nuevo (o uno que ya existe, si a
  // alguien se le olvida) sin esta columna no revienta, simplemente se queda
  // sin sugerencias propias. Esta prueba lo hace ruidoso.
  const CON_CIUDADES = ['cashback', 'carrera_compras', 'descuento', 'cupon'];
  for (const pais of paises) {
    const ofrece = tiposDe(pais.codigo).some((tipo) => CON_CIUDADES.indexOf(tipo) !== -1);
    if (!ofrece) continue;
    assert.ok(Array.isArray(pais.ciudades_sugeridas) && pais.ciudades_sugeridas.length > 0,
      pais.codigo + ' no tiene ciudades_sugeridas en data/paises.json');
  }
});

test('las ciudades sugeridas de cada país no son las de Colombia', () => {
  // El defecto que reportó Juan: los ocho países que no son Colombia veían los
  // mismos seis botones (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga,
  // Cúcuta) sin importar dónde corriera la campaña. El ejemplo y la ayuda
  // citaban las mismas tres ciudades colombianas justo debajo de esos chips.
  for (const codigo of FUERA_DE_COLOMBIA) {
    const pregunta = conDatosDelPais(preguntaDe('ciudades', 'descuento'), porCodigo(codigo));
    assert.ok(Array.isArray(pregunta.sugerencias) && pregunta.sugerencias.length > 0,
      codigo + ' se quedó sin chips de ciudad');
    assert.deepStrictEqual(pregunta.sugerencias, porCodigo(codigo).ciudades_sugeridas,
      codigo + ' no está mostrando su propia lista');
    const textoMostrado = pregunta.sugerencias.join(' ') + ' ' + pregunta.ejemplo + ' ' + pregunta.ayuda;
    for (const deColombia of CIUDADES_SUGERIDAS) {
      assert.ok(textoMostrado.indexOf(deColombia) === -1,
        codigo + ' todavía menciona ' + deColombia + ', que es de Colombia: ' + textoMostrado);
    }
  }
});

test('el cashback por ETA sigue sin chips de ciudad después de poner los datos del país', () => {
  // La variante del ETA pone sugerencias: null a propósito (es de una sola
  // ciudad; con chips se podían agregar dos). El reemplazo por país no puede
  // pisar ese null, o vuelve el defecto real que describe preguntas.js.
  for (const codigo of ['CO'].concat(FUERA_DE_COLOMBIA)) {
    const pregunta = conDatosDelPais(preguntaDe('ciudades', 'cashback_eta'), porCodigo(codigo));
    assert.ok(!pregunta.sugerencias, codigo + ': el ETA no debería ofrecer chips de ciudad');
  }
});

// --- El Cupom de Brasil hereda las variantes de la Promoção -----------------

test('el Cupom de Brasil lee las variantes de la Promoção, sin copiarlas', () => {
  assert.strictEqual(VARIANTES_HEREDADAS.cupom_br, 'promocao_br');

  // La tienda es "o parceiro" en los dos, y el tope se pregunta en reales.
  assert.strictEqual(preguntaDe('tienda', 'cupom_br').pregunta,
    preguntaDe('tienda', 'promocao_br').pregunta);
  assert.strictEqual(preguntaDe('tope', 'cupom_br').pregunta,
    preguntaDe('tope', 'promocao_br').pregunta);

  // Y ninguna variante propia de cupom_br escrita a mano donde ya había una
  // heredada: eso sería la copia que esta herencia existe para evitar.
  for (const id of Object.keys(PREGUNTAS)) {
    const variantes = PREGUNTAS[id].variantes || {};
    if (!variantes.cupom_br || !variantes.promocao_br) continue;
    assert.fail(id + ' tiene variante propia de cupom_br además de la de promocao_br');
  }
});

test('el Cupom de Brasil promete solo huecos que su modelo tiene', () => {
  // La misma prueba que protege a la Promoção: "Así queda en tu T&C" muestra el
  // valor de los placeholders de la pregunta, y una variante heredada puede
  // prometer un hueco que el otro modelo no lleva.
  for (const tipoId of Object.keys(ESQUEMAS)) {
    if (!ESQUEMAS[tipoId].esDeBrasil) continue;
    let texto = modelos.modelos[ESQUEMAS[tipoId].modelo];
    texto = texto.replace(/\[\[INCLUIR:([\w-]+)\]\]/g, (todo, bloque) => modelos.bloques[bloque] || '');

    for (const campo of ESQUEMAS[tipoId].campos) {
      const pregunta = preguntaDe(campo.id, tipoId);
      if (!pregunta || !pregunta.placeholders || pregunta.placeholders.length === 0) continue;
      if (['pais', 'negocio', 'tipo'].indexOf(campo.id) !== -1) continue;
      for (const placeholder of pregunta.placeholders) {
        assert.ok(texto.indexOf('{{' + placeholder + '}}') !== -1,
          campo.id + ' (' + tipoId + ') promete {{' + placeholder + '}}, que ese modelo no usa');
      }
    }
  }
});
