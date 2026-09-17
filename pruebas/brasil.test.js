'use strict';

/**
 * El modelo de Brasil, con sus cuatro formas del beneficio.
 *
 * Cada caso reproduce uno de los cuatro T&C aprobados que mandó Legal Brasil.
 * Lo que se protege: que el documento salga completo, en portugués, con los
 * números y los montos escritos como en el original, y que las correcciones de
 * `docs/CORRECCIONES_BRASIL.md` sigan aplicadas.
 */

const test = require('node:test');
const assert = require('node:assert');

const { renderizar } = require('../src/core/motor.js');
const { cargarModelos } = require('../scripts/lib/modelos.js');
const { paisDesdeFila } = require('../src/core/paises.js');
const { esquemaDe } = require('../src/core/esquemas.js');
const { nombreDeCampana } = require('../src/core/nombres.js');
const { validarSolicitud } = require('../src/core/validaciones.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const MODELOS = cargarModelos();
const BR = paisDesdeFila(leerJson(rutaDesdeRaiz('data', 'paises.json')).paises.find((p) => p.codigo === 'BR'));

function campana(extra) {
  return Object.assign({
    pais: 'BR', negocio: 'rappi', tipo: 'promocao_br',
    fechaInicio: '2026-10-01', horaInicio: '00:01',
    fechaFin: '2026-10-31', horaFin: '23:59',
    metodosPagoBr: ['dinheiro', 'paypal', 'rappipay', 'visa', 'mastercard'],
    declaracion: true,
  }, extra || {});
}

function documento(extra) {
  const resultado = renderizar('promocao_br', campana(extra), BR, MODELOS);
  assert.deepStrictEqual(resultado.errores, [], 'el documento salió con errores');
  assert.deepStrictEqual(resultado.placeholdersVacios, [], 'el documento salió con huecos');
  return resultado.texto;
}

const DESCONTO = { tienda: 'Petz', beneficioBr: 'desconto', porcentaje: 10, tope: 60, compraMinima: 300, maxPedidos: 1 };
const FRETE = { tienda: 'Drogasmil', beneficioBr: 'frete_gratis', tope: 20, compraMinima: 120, maxPedidos: 2 };
const TAXA = { tienda: 'Raia', beneficioBr: 'taxa_servico', compraMinima: 80, maxPedidos: 1 };
const TAXA_E_FRETE = { tienda: 'Ri Happy', beneficioBr: 'taxa_e_frete', sinLimite: true };

test('el desconto sale completo y en portugués', () => {
  const texto = documento(DESCONTO);

  assert.ok(texto.indexOf('receberão até dez por cento (10%) de desconto no pedido') !== -1, texto);
  assert.ok(texto.indexOf('limitado ao valor de R$60,00 (sessenta reais)') !== -1, texto);
  assert.ok(texto.indexOf('com valor acima de R$300,00 (trezentos reais)') !== -1, texto);
  // El período, con los meses en portugués y la hora con cero inicial.
  assert.ok(texto.indexOf('de **1 de outubro de 2026** às **00:01** até **31 de outubro de 2026** às **23:59**') !== -1, texto);
});

test('el frete grátis dice a qué está limitado, y de quién es el valor', () => {
  const texto = documento(FRETE);

  // La corrección B1: el original decía "não será aplicado caso o valor seja
  // superior a 20,00", sin R$ y sin decir el valor de qué.
  assert.ok(texto.indexOf('o frete grátis está limitado a R$20,00 (vinte reais); o valor que exceder esse limite será cobrado do Usuário') !== -1, texto);
  assert.ok(texto.indexOf('caso o valor seja superior') === -1, 'volvió la redacción ambigua');
});

test('la taxa de serviço no lleva tope, porque los documentos aprobados no se lo ponen', () => {
  const texto = documento(TAXA);

  assert.ok(texto.indexOf('ganharão taxa de serviço grátis no pedido') !== -1, texto);
  assert.ok(texto.indexOf('limitado ao valor de') === -1, 'apareció un tope que el modelo aprobado no tiene');
});

test('sin mínimo de compra la frase de apertura cierra bien igual', () => {
  const texto = documento(TAXA_E_FRETE);

  assert.ok(texto.indexOf('os usuários que realizarem compras nas lojas do Parceiro **Ri Happy**') !== -1, texto);
  assert.ok(texto.indexOf('com valor acima de') === -1, 'salió un mínimo que nadie puso');
  assert.ok(texto.indexOf('não há limite de pedidos por usuário') !== -1, texto);
});

test('el límite de pedidos concuerda en singular y en plural', () => {
  assert.ok(documento(DESCONTO).indexOf('o limite de um (1) pedido por usuário') !== -1);
  assert.ok(documento(FRETE).indexOf('o limite de dois (2) pedidos por usuário') !== -1);
});

test('los medios de pago salen con la conjunción portuguesa', () => {
  const texto = documento(Object.assign({}, DESCONTO, { metodosPagoBr: ['dinheiro', 'visa', 'mastercard'] }));
  assert.ok(texto.indexOf('meios de pagamento: Dinheiro, Cartão de crédito Visa e Cartão de crédito Mastercard') !== -1, texto);
});

test('las correcciones de redacción siguen aplicadas', () => {
  const texto = documento(DESCONTO);

  // A1: "doação" era una donación arrastrada de otra plantilla.
  assert.ok(texto.indexOf('desvio do benefício para terceiros') !== -1, texto);
  assert.ok(texto.indexOf('doação') === -1, 'volvió la donación');
  // A2: el gerundio que rompía la enumeración.
  assert.ok(texto.indexOf('cancelar o código e bloquear a conta') !== -1, texto);
  // A3: la frase que se había quedado sin verbo principal.
  assert.ok(texto.indexOf('são fictícias ou falsas, ou seja, que não constituem uma pessoa física identificável') !== -1, texto);
  // A4: las dos concordancias rotas.
  assert.ok(texto.indexOf('carregamento dos dados solicitados ao Usuário') !== -1, texto);
  // C2: el guion que además prohíbe la regla 8 de CLAUDE.md.
  assert.ok(texto.indexOf('em todo o território brasileiro, onde houver') !== -1, texto);
  assert.ok(texto.indexOf('território brasileiro - Brasil') === -1, 'volvió el guion');
});

test('el cierre lleva los dos enlaces de Brasil', () => {
  const texto = documento(DESCONTO);
  assert.ok(texto.indexOf(BR.url_tc_plataforma) !== -1, 'falta el enlace de los T&C de plataforma');
  assert.ok(texto.indexOf(BR.url_privacidad) !== -1, 'falta el enlace del aviso de privacidad');
});

test('el título dice el beneficio, y en el mismo idioma que el articulado', () => {
  const esquema = esquemaDe('promocao_br');
  // Sin país sale en español, que es lo que hacían todas las llamadas de antes.
  assert.strictEqual(nombreDeCampana(campana(DESCONTO), esquema), 'Petz · 10% OFF · 1 oct 2026');
  assert.strictEqual(nombreDeCampana(campana(DESCONTO), esquema, BR), 'Petz · 10% OFF · 1 out 2026');
  assert.strictEqual(nombreDeCampana(campana(FRETE), esquema, BR), 'Drogasmil · Frete grátis · 1 out 2026');
  assert.strictEqual(nombreDeCampana(campana(TAXA), esquema, BR), 'Raia · Taxa de serviço grátis · 1 out 2026');
});

test('el documento no lleva tablas ni marcadores sin resolver', () => {
  for (const caso of [DESCONTO, FRETE, TAXA, TAXA_E_FRETE]) {
    const texto = documento(caso);
    assert.ok(texto.indexOf('{{') === -1 && texto.indexOf('[[') === -1, 'quedó un marcador sin resolver');
    assert.ok(texto.indexOf('|') === -1, 'el documento no puede llevar tablas');
  }
});

test('Brasil no acepta un porcentaje, un tope o un máximo de pedidos absurdos', () => {
  // Sin rangos, el documento salía con "quinhentos por cento (500%)", "R$0,00
  // (zero reais)" y "o limite de zero (0) pedidos", y era publicable.
  const contexto = { fechaReferencia: '2026-09-17', usuarioEnEquipo: true };
  function camposConError(extra) {
    return validarSolicitud(campana(Object.assign({}, DESCONTO, extra)), BR, contexto).errores.map((e) => e.campo).sort();
  }
  assert.deepStrictEqual(camposConError({}), []);
  assert.deepStrictEqual(camposConError({ porcentaje: 500 }), ['porcentaje']);
  assert.deepStrictEqual(camposConError({ porcentaje: 0 }), ['porcentaje']);
  assert.deepStrictEqual(camposConError({ tope: 0 }), ['tope']);
  assert.deepStrictEqual(camposConError({ maxPedidos: 0 }), ['maxPedidos']);
  assert.deepStrictEqual(camposConError({ compraMinima: 0 }), ['compraMinima']);
});

test('Brasil no genera si la fila del país no dice que el documento va en portugués', () => {
  // Con la celda idioma vacía, el motor caía a español en silencio y salía
  // "no período de 1 de octubre de 2026 às 12:01 a. m." sin ningún error.
  const contexto = { fechaReferencia: '2026-09-17', usuarioEnEquipo: true };
  const sinIdioma = Object.assign({}, BR, { idioma: '' });
  const conOtro = Object.assign({}, BR, { idioma: 'PT-BR' });
  for (const pais of [sinIdioma, conOtro]) {
    const resultado = validarSolicitud(campana(DESCONTO), pais, contexto);
    assert.strictEqual(resultado.valido, false);
    assert.strictEqual(resultado.errores[0].campo, 'pais');
    assert.ok(resultado.errores[0].mensaje.indexOf('columna idioma') !== -1, resultado.errores[0].mensaje);
  }
  assert.strictEqual(validarSolicitud(campana(DESCONTO), Object.assign({}, BR, { idioma: 'pt' }), contexto).valido, true);
});

test('un valor que no es un número queda como hueco, no como frase rota', () => {
  // "o limite de  undefined (NaN) pedidos por usuário" salía en la vista previa
  // si maxPedidos llegaba como texto por datos_json o por la API.
  const resultado = renderizar('promocao_br', campana(Object.assign({}, DESCONTO, { maxPedidos: 'varias' })), BR, MODELOS);
  assert.ok(resultado.texto.indexOf('undefined') === -1 && resultado.texto.indexOf('NaN') === -1, resultado.texto);
  assert.ok(resultado.placeholdersVacios.indexOf('TEXTO_LIMITE_PEDIDOS') !== -1, JSON.stringify(resultado.placeholdersVacios));

  // Y sin parceiro, la viñeta del beneficio es un hueco, no "do Parceiro , na plataforma".
  const sinParceiro = renderizar('promocao_br', campana(Object.assign({}, DESCONTO, { tienda: '' })), BR, MODELOS);
  assert.ok(sinParceiro.texto.indexOf('Parceiro ,') === -1, sinParceiro.texto);
  assert.ok(sinParceiro.placeholdersVacios.indexOf('TEXTO_BENEFICIO_REGRA') !== -1);
});

test('un número negativo no tumba la vista previa', () => {
  const { numeroEnLetrasPt } = require('../src/core/numeros_pt.js');
  const { numeroEnLetras } = require('../src/core/numeros.js');
  assert.strictEqual(numeroEnLetrasPt(-5), '');
  assert.strictEqual(numeroEnLetras(-5), '');
  assert.strictEqual(numeroEnLetrasPt(NaN), '');
  // El motor no revienta (antes: RangeError, pantalla a medio pintar) y la
  // validación es la que lo frena, con el mensaje escrito para el tope.
  assert.doesNotThrow(() => renderizar('promocao_br', campana(Object.assign({}, DESCONTO, { tope: -5 })), BR, MODELOS));
  const revision = validarSolicitud(campana(Object.assign({}, DESCONTO, { tope: -5 })), BR, { fechaReferencia: '2026-09-17', usuarioEnEquipo: true });
  assert.deepStrictEqual(revision.errores.map((e) => e.campo), ['tope']);
  assert.strictEqual(revision.errores[0].mensaje, 'El tope tiene que ser mayor que cero.');
});
