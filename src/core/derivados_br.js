'use strict';

/**
 * Los textos del modelo de Brasil.
 *
 * Vive aparte de derivados.js por la misma razon que Travel: los textos de
 * delivery estan aprobados por Legal Colombia y una campana de Brasil no puede
 * moverlos.
 *
 * Todo lo de aqui sale de los cuatro T&C aprobados que mando Legal Brasil. Las
 * correcciones aplicadas estan una por una, con su antes y su despues, en
 * docs/CORRECCIONES_BRASIL.md. El mapa de los cuatro documentos esta en
 * docs/MODELO_BASE_BRASIL.md.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloNumeros = require('./numeros.js');
  var montoConMoneda = moduloNumeros.montoConMoneda;
  var porcentajeEnLetras = moduloNumeros.porcentajeEnLetras;
  var letrasYCifra = moduloNumeros.letrasYCifra;

  var listaY = require('./fechas.js').listaY;
  var tieneValor = require('./texto.js').tieneValor;
}

/** Las cuatro formas del beneficio, tal como las nombran los documentos. */
var FORMAS_DE_BENEFICIO_BR = [
  { valor: 'desconto', etiqueta: 'Desconto % OFF', llevaPorcentaje: true, llevaTope: true },
  { valor: 'frete_gratis', etiqueta: 'Frete grátis', llevaPorcentaje: false, llevaTope: true },
  { valor: 'taxa_servico', etiqueta: 'Taxa de serviço grátis', llevaPorcentaje: false, llevaTope: false },
  { valor: 'taxa_e_frete', etiqueta: 'Taxa de serviço e frete grátis', llevaPorcentaje: false, llevaTope: false },
];

function formaDeBeneficioBr(valor) {
  for (var i = 0; i < FORMAS_DE_BENEFICIO_BR.length; i++) {
    if (FORMAS_DE_BENEFICIO_BR[i].valor === valor) return FORMAS_DE_BENEFICIO_BR[i];
  }
  return null;
}

/** Los medios de pago que aparecen en los cuatro documentos, en su orden. */
var METODOS_DE_PAGO_BR = [
  { valor: 'dinheiro', etiqueta: 'Dinheiro' },
  { valor: 'paypal', etiqueta: 'Paypal' },
  { valor: 'rappipay', etiqueta: 'RappiPay' },
  { valor: 'visa', etiqueta: 'Cartão de crédito Visa' },
  { valor: 'mastercard', etiqueta: 'Cartão de crédito Mastercard' },
  { valor: 'voucher_refeicao', etiqueta: 'Voucher Refeição' },
];

/**
 * El trozo del parrafo de apertura que habla del minimo de compra.
 *
 * FRAGMENTO: se inserta dentro de la frase, sin mayuscula inicial ni punto. Sin
 * minimo devuelve cadena vacia, porque la campana de taxa de servico e frete
 * gratis no lo lleva y la frase tiene que cerrar igual de bien.
 */
function textoMinimoAperturaBr(entrada, pais) {
  if (!tieneValor(entrada.compraMinima)) return '';
  return ' com valor acima de ' + montoConMoneda(entrada.compraMinima, pais) + ',';
}

/** FRAGMENTO: cierra el parrafo de apertura diciendo que recibe el usuario. */
function textoBeneficioAperturaBr(entrada) {
  var forma = formaDeBeneficioBr(entrada.beneficioBr);
  if (!forma) return '';

  if (forma.valor === 'desconto') {
    if (!tieneValor(entrada.porcentaje)) return '';
    return 'receberão até ' + porcentajeEnLetras(entrada.porcentaje) + ' de desconto no pedido';
  }
  if (forma.valor === 'frete_gratis') return 'ganharão frete grátis no pedido';
  if (forma.valor === 'taxa_servico') return 'ganharão taxa de serviço grátis no pedido';
  return 'ganharão taxa de serviço e frete grátis no pedido';
}

/** La vineta que describe el beneficio dentro de REGRAS PRINCIPAIS. */
function textoBeneficioRegraBr(entrada, pais) {
  var forma = formaDeBeneficioBr(entrada.beneficioBr);
  if (!forma) return '';
  // Sin parceiro la vineta quedaba "nas lojas do Parceiro , na plataforma":
  // mejor un hueco que una frase rota.
  if (!String(entrada.tienda || '').trim()) return '';

  var nombre = forma.valor === 'desconto' ? 'o desconto'
    : (forma.valor === 'frete_gratis' ? 'o frete grátis'
      : (forma.valor === 'taxa_servico' ? 'a taxa de serviço grátis' : 'a taxa de serviço e o frete grátis'));
  var verbo = forma.valor === 'taxa_e_frete' ? 'serão válidos' : (nombre.indexOf('a ') === 0 ? 'será válida' : 'será válido');

  var condicion = tieneValor(entrada.compraMinima)
    ? ' para compras com valor acima de ' + montoConMoneda(entrada.compraMinima, pais) + ','
    : ' para compras';

  return 'Esclarece-se que ' + nombre + ' ' + verbo + condicion +
    ' nas lojas do Parceiro ' + String(entrada.tienda || '').trim() + ', na plataforma Rappi';
}

/**
 * La vineta del tope, cuando la forma del beneficio lo lleva.
 *
 * El documento de Frete Gratis decia "o frete gratis nao sera aplicado caso o
 * valor seja superior a 20,00 (vinte reais)": sin el R$, sin decir el valor de
 * que, y dando a entender que el beneficio desaparece entero. Ver el punto B1 de
 * docs/CORRECCIONES_BRASIL.md, que es el que Juan tiene que confirmar.
 */
function textoTopeBeneficioBr(entrada, pais) {
  var forma = formaDeBeneficioBr(entrada.beneficioBr);
  if (!forma || !forma.llevaTope || !tieneValor(entrada.tope)) return '';

  if (forma.valor === 'desconto') {
    if (!tieneValor(entrada.porcentaje)) return '';
    return 'Esclarece-se que o desconto será de até ' + porcentajeEnLetras(entrada.porcentaje) +
      ', limitado ao valor de ' + montoConMoneda(entrada.tope, pais);
  }
  return 'Esclarece-se que o frete grátis está limitado a ' + montoConMoneda(entrada.tope, pais) +
    '; o valor que exceder esse limite será cobrado do Usuário';
}

/** FRAGMENTO: la vineta del limite de pedidos por usuario. */
function textoLimitePedidosBr(entrada) {
  if (entrada.sinLimite) {
    return 'Esclarece-se que não há limite de pedidos por usuário durante o período da promoção';
  }
  if (!tieneValor(entrada.maxPedidos)) return '';

  var cantidad = Number(entrada.maxPedidos);
  // Como su par en espanol: un valor que no es un numero queda como hueco, no
  // como "o limite de  undefined (NaN) pedidos".
  if (!isFinite(cantidad) || cantidad < 1) return '';
  var sustantivo = cantidad === 1 ? 'pedido' : 'pedidos';
  return 'Esclarece-se que há o limite de ' + letrasYCifra(cantidad) + ' ' + sustantivo +
    ' por usuário durante o período da promoção';
}

/** FRAGMENTO: la vineta de los medios de pago, con su lista. */
function textoMetodoPagoBr(entrada) {
  var elegidos = entrada.metodosPagoBr || [];
  if (elegidos.length === 0) return '';

  var etiquetas = [];
  for (var i = 0; i < METODOS_DE_PAGO_BR.length; i++) {
    for (var e = 0; e < elegidos.length; e++) {
      if (elegidos[e] === METODOS_DE_PAGO_BR[i].valor) { etiquetas.push(METODOS_DE_PAGO_BR[i].etiqueta); break; }
    }
  }
  if (etiquetas.length === 0) return '';

  return 'Campanha válida somente para pedidos realizados e pagos através dos meios de pagamento: ' +
    listaY(etiquetas);
}

/** Todos los valores del modelo de Brasil. Se agregan encima de los comunes. */
function calcularDerivadosBr(entrada, pais) {
  return {
    PARCEIRO: String(entrada.tienda || '').trim(),
    TEXTO_MINIMO_APERTURA: textoMinimoAperturaBr(entrada, pais),
    TEXTO_BENEFICIO_APERTURA: textoBeneficioAperturaBr(entrada),
    TEXTO_BENEFICIO_REGRA: textoBeneficioRegraBr(entrada, pais),
    TEXTO_TOPE_BENEFICIO: textoTopeBeneficioBr(entrada, pais),
    TEXTO_LIMITE_PEDIDOS: textoLimitePedidosBr(entrada),
    TEXTO_METODO_PAGO: textoMetodoPagoBr(entrada),
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    FORMAS_DE_BENEFICIO_BR: FORMAS_DE_BENEFICIO_BR,
    METODOS_DE_PAGO_BR: METODOS_DE_PAGO_BR,
    formaDeBeneficioBr: formaDeBeneficioBr,
    calcularDerivadosBr: calcularDerivadosBr,
  };
}
