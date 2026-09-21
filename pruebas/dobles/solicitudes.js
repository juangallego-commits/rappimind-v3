'use strict';

/**
 * Arma solicitudes completas para las pruebas que necesitan un documento de
 * verdad, no una función suelta.
 *
 * Existe porque los defectos de concordancia y de límites numéricos solo se ven
 * en el texto final: la función devuelve lo que le pidieron y el error aparece
 * al pegarla con las palabras del modelo. Una prueba que llame a la función
 * directamente pasa igual con el defecto puesto.
 *
 * `solicitud(pais, tipo, respuestas)` llena todas las preguntas obligatorias
 * visibles con valores válidos y deja que `respuestas` pise las que interesan.
 * Los números que no se piden salen en cuatro, no en uno, para que ningún
 * singular se cuele sin que la prueba lo haya pedido.
 */

const { rutaDesdeRaiz, leerJson } = require('../../scripts/lib/archivos');
const { ESQUEMAS, camposVisibles, resolverAtributo } = require('../../src/core/esquemas.js');
const { preguntaDe } = require('../../src/core/preguntas.js');
const { seccionesDePais } = require('../../src/core/paises.js');
const { seccionesExcluiblesDe } = require('../../src/core/derivados_eta.js');

const CATEGORIAS_TRAVEL = leerJson(rutaDesdeRaiz('data', 'categorias_travel.json'));
const SECCIONES = leerJson(rutaDesdeRaiz('data', 'secciones.json'));

/** Un identificador válido por país, con su dígito de verificación correcto. */
const IDENTIFICACIONES = {
  CO: '900111222-1',
  MX: 'PRU200101AB5',
  PE: '20512345671',
  AR: '30712345671',
  CL: '76123456-0',
  EC: '1791234561001',
  UY: '212345670015',
  CR: '3-101-123450',
  BR: '12345678000195',
};

function opcionesDeLaPregunta(campo, tipo) {
  const pregunta = preguntaDe(campo.id, tipo);
  return pregunta && pregunta.opciones ? pregunta.opciones : null;
}

function valorDePrueba(campo, codigoPais, tipoActual) {
  if (campo.tipo === 'numero') {
    if (campo.id === 'porcentaje') return 20;
    if (campo.id === 'porcentajeMinimo') return 5;
    if (campo.id === 'tope') return 30000;
    if (campo.id === 'montoFijo') return 50000;
    if (campo.id === 'presupuesto') return 12000000;
    if (campo.id === 'creditosPremio') return 500000;
    if (campo.id === 'compraMinima') return 20000;
    if (campo.id === 'montoDescuento') return 10000;
    if (campo.id === 'unidadesDisponibles') return 500;
    if (campo.id === 'valorPremio') return 800000;
    return Math.max(campo.minimo || 1, 4);
  }
  // El cashback por ETA no declara el valor por defecto de las horas, y con
  // las dos en 00:00 la campana "termina antes de empezar".
  if (campo.tipo === 'hora') return campo.porDefecto || (campo.id === 'horaFin' ? '23:59' : '00:00');
  if (campo.tipo === 'fecha') {
    if (campo.id === 'fechaInicio') return '2026-10-01';
    if (campo.id === 'fechaFin') return '2026-10-31';
    return '2026-11-20';
  }
  // Algunas preguntas llevan sus opciones en preguntas.js y no en el esquema
  // (el medio de pago del cashback por ETA, por ejemplo).
  if (campo.tipo === 'lista') {
    const desdeElEsquema = (campo.opciones || [])[0];
    if (desdeElEsquema) return desdeElEsquema.valor;
    const desdeLaPregunta = ((opcionesDeLaPregunta(campo, tipoActual) || [])[0] || {}).valor;
    return desdeLaPregunta !== undefined ? desdeLaPregunta : '';
  }
  if (campo.tipo === 'casilla') return true;
  if (campo.tipo === 'identificacion') return IDENTIFICACIONES[codigoPais];
  // El codigo de un cupon: letras y numeros, sin espacios, como lo teclea el usuario.
  if (campo.tipo === 'codigo') return 'RAPPI30';
  if (campo.tipo === 'texto') return campo.id === 'ciudades' ? 'Bogotá' : 'Texto de prueba';
  if (campo.tipo === 'casillas') {
    if (campo.id === 'exclusionesRedencion') {
      return seccionesExcluiblesDe(codigoPais).map((s) => s.valor);
    }
    if (campo.id === 'secciones') {
      const nombres = seccionesDePais(codigoPais, SECCIONES);
      return (nombres.length ? nombres : ['Restaurantes']).slice(0, 2);
    }
    if (campo.id === 'categorias' || campo.id === 'categoriasRedencion') {
      return (CATEGORIAS_TRAVEL[codigoPais] || ['Hoteles']).slice(0, 2);
    }
    const lista = campo.opciones || opcionesDeLaPregunta(campo, tipoActual) || [];
    return [((lista[0]) || {}).valor].filter(Boolean);
  }
  return '';
}

/** Dos tiendas de Turbo para el cashback por ETA, que el T&C nombra una por una. */
function tiendasEtaDePrueba() {
  return [{ nombre: 'Turbo Calleja' }, { nombre: 'Turbo Chico' }];
}

/** Dos tiendas válidas para el Cashback Multitienda. */
function tiendasDePrueba(codigoPais) {
  return [
    {
      marca: 'Beer Station', razonSocial: 'Tienda Prueba Uno S.A.S.',
      id: codigoPais === 'CO' ? '900777888-2' : IDENTIFICACIONES[codigoPais],
      ciudades: 'Bogotá', nacional: false, presupuesto: 5000000, tiendaTurbo: 'normal',
    },
    {
      marca: 'EVOK', razonSocial: 'Tienda Prueba Tres S.A.S.',
      id: codigoPais === 'CO' ? '830111222-6' : IDENTIFICACIONES[codigoPais],
      ciudades: '', nacional: true, presupuesto: 1500000, tiendaTurbo: 'sin_turbo',
    },
  ];
}

function solicitud(codigoPais, tipo, respuestas) {
  const dadas = respuestas || {};
  const esquema = ESQUEMAS[tipo];
  const entrada = { pais: codigoPais, tipo, negocio: 'rappi', declaracion: true };

  if (esquema.esDeTravel) {
    entrada.negocio = 'travel';
    entrada.aliadoAprobo = true;
    entrada.declaracionPiezas = true;
    entrada.otraCondicion = 'no';
  }
  if (esquema.camposPorTienda) entrada.tiendas = tiendasDePrueba(codigoPais);
  if (esquema.camposPorTiendaEta) entrada.tiendasEta = tiendasEtaDePrueba();

  // Varias vueltas: la visibilidad de un campo depende de lo que se respondió antes.
  for (let vuelta = 0; vuelta < 4; vuelta += 1) {
    camposVisibles(tipo, entrada).forEach((campo) => {
      if (Object.prototype.hasOwnProperty.call(dadas, campo.id)) {
        entrada[campo.id] = dadas[campo.id];
        return;
      }
      if (entrada[campo.id] !== undefined && entrada[campo.id] !== '') return;
      if (!resolverAtributo(campo.obligatorio, entrada, false)) return;
      if (campo.tipo === 'repetible') return;
      entrada[campo.id] = valorDePrueba(campo, codigoPais, tipo);
    });
  }
  Object.keys(dadas).forEach((llave) => { entrada[llave] = dadas[llave]; });
  return entrada;
}

module.exports = { solicitud, tiendasDePrueba, tiendasEtaDePrueba, IDENTIFICACIONES };
