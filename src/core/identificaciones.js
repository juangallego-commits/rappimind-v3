'use strict';

/**
 * Validacion y formato del identificador tributario del organizador, por pais.
 *
 * Los algoritmos de digito de verificacion estan en la seccion 6 de
 * docs/ESPECIFICACION_V3.md y se verificaron contra los identificadores reales
 * de las sociedades Rappi de cada pais.
 *
 * Cada validador devuelve { valido, mensaje, formateado }.
 */

function soloDigitos(texto) {
  return String(texto || '').replace(/\D/g, '');
}

function sumaPonderada(digitos, pesos) {
  var suma = 0;
  for (var i = 0; i < pesos.length; i++) {
    suma += Number(digitos.charAt(i)) * pesos[i];
  }
  return suma;
}

/** Agrupa de a tres con el separador dado: 900111222 -> 900.111.222 */
function agruparMiles(digitos, separador) {
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, separador);
}

function resultado(valido, mensaje, formateado) {
  return { valido: valido, mensaje: mensaje || '', formateado: formateado || '' };
}

// --- Colombia: NIT ---------------------------------------------------------

var PESOS_NIT = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

function digitoNit(cuerpo) {
  var suma = 0;
  // Los pesos se aplican desde la derecha.
  for (var i = 0; i < cuerpo.length; i++) {
    var digito = Number(cuerpo.charAt(cuerpo.length - 1 - i));
    suma += digito * PESOS_NIT[i];
  }
  var r = suma % 11;
  return r === 0 || r === 1 ? r : 11 - r;
}

function validarNit(valor) {
  var limpio = String(valor || '').trim().replace(/[.\s]/g, '');
  var partido = /^(\d{9})-?(\d)$/.exec(limpio);
  if (!partido) {
    return resultado(false, 'El NIT tiene 9 dígitos más el de verificación, por ejemplo 900.111.222-1.');
  }
  var cuerpo = partido[1];
  var dv = Number(partido[2]);
  /*
   * Si el digito no cuadra, se dice cual es el que cuadra.
   *
   * El mensaje decia solo "revisa el numero", y la herramienta sabe la
   * respuesta: el digito de verificacion sale de los nueve primeros con una
   * formula. Juan escribio 900.898.545-1, que es 900.898.545-0, y no tenia como
   * saberlo sin ir a buscar el RUT. Decirlo no inventa nada: es aritmetica, y
   * el comercial sigue teniendo que confirmar que el NIT es el correcto.
   */
  var correcto = digitoNit(cuerpo);
  if (correcto !== dv) {
    return resultado(false, 'El dígito de verificación no cuadra con ese NIT. Para ' +
      agruparMiles(cuerpo, '.') + ' el dígito es ' + correcto + '. Revisa el número completo.');
  }
  return resultado(true, '', 'NIT ' + agruparMiles(cuerpo, '.') + '-' + dv);
}

// --- Mexico: RFC -----------------------------------------------------------

var ALFABETO_RFC = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ';

function valorCaracterRfc(caracter) {
  if (caracter === ' ') return 37;
  if (caracter === 'Ñ') return 38;
  // La posicion en el alfabeto ya es el valor: 0 a 9 valen 0 a 9,
  // A a N valen 10 a 23, & vale 24 y O a Z valen 25 a 36.
  return ALFABETO_RFC.indexOf(caracter);
}

function digitoRfc(doce) {
  var suma = 0;
  for (var i = 0; i < 12; i++) {
    var valor = valorCaracterRfc(doce.charAt(i));
    if (valor === -1) return null;
    suma += valor * (13 - i);
  }
  var r = suma % 11;
  if (r === 0) return '0';
  var dv = 11 - r;
  if (dv === 10) return 'A';
  return String(dv);
}

function validarRfc(valor) {
  var limpio = String(valor || '').trim().toUpperCase().replace(/[-\s]/g, '');

  var esMoral = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/.test(limpio);
  var esFisica = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/.test(limpio);

  if (!esMoral && !esFisica) {
    return resultado(false, 'El RFC debe tener 12 caracteres (persona moral) o 13 (persona física), por ejemplo PRU200101AB5.');
  }

  // A la persona moral se le antepone un espacio para completar 13 posiciones.
  var completo = esMoral ? ' ' + limpio : limpio;
  var esperado = digitoRfc(completo.slice(0, 12));

  if (esperado === null || esperado !== completo.charAt(12)) {
    return resultado(false, 'El dígito verificador del RFC no corresponde. Revisa el número.');
  }
  return resultado(true, '', 'RFC ' + limpio);
}

// --- Modulo 11 con pesos fijos (Peru, Argentina, Uruguay) ------------------

function validarModulo11(valor, opciones) {
  var digitos = soloDigitos(valor);
  if (digitos.length !== opciones.largo) {
    return resultado(false, opciones.mensajeFormato);
  }
  var cuerpo = digitos.slice(0, opciones.largo - 1);
  var dv = Number(digitos.charAt(opciones.largo - 1));

  var r = sumaPonderada(cuerpo, opciones.pesos) % 11;
  var esperado = 11 - r;
  if (esperado === 11) esperado = opciones.once;
  if (esperado === 10) {
    if (opciones.diez === null) {
      return resultado(false, opciones.mensajeDigito);
    }
    esperado = opciones.diez;
  }

  if (esperado !== dv) {
    return resultado(false, opciones.mensajeDigito);
  }
  return resultado(true, '', opciones.formatear(digitos));
}

function validarRucPe(valor) {
  return validarModulo11(valor, {
    largo: 11,
    pesos: [5, 4, 3, 2, 7, 6, 5, 4, 3, 2],
    once: 1,
    diez: 0,
    mensajeFormato: 'El RUC debe tener 11 dígitos.',
    mensajeDigito: 'El dígito verificador del RUC no corresponde. Revisa el número.',
    formatear: function (digitos) {
      return 'RUC ' + digitos;
    },
  });
}

function validarCuit(valor) {
  return validarModulo11(valor, {
    largo: 11,
    pesos: [5, 4, 3, 2, 7, 6, 5, 4, 3, 2],
    once: 0,
    diez: null,
    mensajeFormato: 'El CUIT debe tener 11 dígitos, por ejemplo 30-71580389-1.',
    mensajeDigito: 'El dígito verificador del CUIT no corresponde. Revisa el número.',
    formatear: function (digitos) {
      return 'CUIT ' + digitos.slice(0, 2) + '-' + digitos.slice(2, 10) + '-' + digitos.slice(10);
    },
  });
}

function validarRutUy(valor) {
  return validarModulo11(valor, {
    largo: 12,
    pesos: [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    once: 0,
    diez: null,
    mensajeFormato: 'El RUT debe tener 12 dígitos.',
    mensajeDigito: 'El dígito verificador del RUT no corresponde. Revisa el número.',
    formatear: function (digitos) {
      return 'RUT ' + digitos;
    },
  });
}

// --- Chile: RUT (pesos ciclicos 2 a 7) -------------------------------------

function validarRutCl(valor) {
  var limpio = String(valor || '').trim().toUpperCase().replace(/[.\s]/g, '');
  var partido = /^(\d{7,8})-?([\dK])$/.exec(limpio);
  if (!partido) {
    return resultado(false, 'El RUT debe tener el cuerpo y el dígito verificador, por ejemplo 76.837.223-3.');
  }
  var cuerpo = partido[1];
  var dv = partido[2];

  var suma = 0;
  var peso = 2;
  for (var i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo.charAt(i)) * peso;
    peso = peso === 7 ? 2 : peso + 1;
  }
  var esperado = 11 - (suma % 11);
  var dvEsperado = esperado === 11 ? '0' : esperado === 10 ? 'K' : String(esperado);

  if (dvEsperado !== dv) {
    return resultado(false, 'El dígito verificador del RUT no corresponde. Revisa el número.');
  }
  return resultado(true, '', 'RUT ' + agruparMiles(cuerpo, '.') + '-' + dv);
}

// --- Ecuador: RUC ----------------------------------------------------------

function validarRucEc(valor) {
  var digitos = soloDigitos(valor);
  if (digitos.length !== 13) {
    return resultado(false, 'El RUC debe tener 13 dígitos y terminar en 001.');
  }
  if (digitos.slice(10) !== '001') {
    return resultado(false, 'El RUC debe terminar en 001.');
  }

  // Solo la sociedad privada (tercer dígito 9) tiene dígito verificable.
  if (digitos.charAt(2) === '9') {
    var r = sumaPonderada(digitos.slice(0, 9), [4, 3, 2, 7, 6, 5, 4, 3, 2]) % 11;
    var esperado = r === 0 ? 0 : 11 - r;
    if (esperado !== Number(digitos.charAt(9))) {
      return resultado(false, 'El dígito verificador del RUC no corresponde. Revisa el número.');
    }
  }
  return resultado(true, '', 'RUC ' + digitos);
}

// --- Costa Rica: cedula juridica (sin digito verificador) ------------------

function validarCedulaCr(valor) {
  var limpio = String(valor || '').trim().replace(/\s/g, '');
  var partido = /^(\d)-?(\d{3})-?(\d{6})$/.exec(limpio);
  if (!partido) {
    return resultado(false, 'La cédula jurídica debe tener el formato 3-XXX-XXXXXX.');
  }
  return resultado(true, '', 'Cédula jurídica ' + partido[1] + '-' + partido[2] + '-' + partido[3]);
}

// --- Entrada unica ---------------------------------------------------------

var VALIDADORES = {
  CO: validarNit,
  MX: validarRfc,
  PE: validarRucPe,
  AR: validarCuit,
  CL: validarRutCl,
  EC: validarRucEc,
  UY: validarRutUy,
  CR: validarCedulaCr,
};

/**
 * Valida el identificador para un pais y devuelve el texto ya formateado
 * como va en el documento: { valido, mensaje, formateado }.
 */
function validarIdentificacion(codigoPais, valor) {
  var validador = VALIDADORES[codigoPais];
  if (!validador) {
    var crudo = String(valor || '').trim();
    if (!crudo) return resultado(false, 'Falta el identificador del organizador.');
    return resultado(true, '', crudo);
  }
  if (!String(valor || '').trim()) {
    return resultado(false, 'Falta el identificador del organizador.');
  }
  return validador(valor);
}

// --- El codigo de barras de un producto ------------------------------------

/**
 * EAN: 8, 12, 13 o 14 numeros, con digito de control correcto.
 *
 * Vive aqui, con los demas numeros que llevan digito de verificacion, aunque no
 * sea un identificador tributario: es la misma clase de comprobacion y el mismo
 * defecto que evita, que alguien escriba un numero parecido y nadie se entere.
 *
 * El algoritmo es el mismo de GS1 para las cuatro longitudes: se suman los
 * digitos alternando pesos 3 y 1 desde la derecha, sin contar el ultimo, y el
 * de control es lo que falta para la decena.
 */
var LARGOS_DE_EAN = [8, 12, 13, 14];

function digitoDeEan(cuerpo) {
  var suma = 0;
  for (var i = 0; i < cuerpo.length; i++) {
    // Desde la derecha: el primero pesa 3, el siguiente 1, y asi.
    var peso = (cuerpo.length - 1 - i) % 2 === 0 ? 3 : 1;
    suma += Number(cuerpo.charAt(i)) * peso;
  }
  return (10 - (suma % 10)) % 10;
}

function validarEan(valor) {
  var digitos = soloDigitos(valor);
  if (!String(valor || '').trim()) return resultado(false, 'Falta el EAN de este producto.');
  if (LARGOS_DE_EAN.indexOf(digitos.length) === -1) {
    return resultado(false, 'El EAN tiene 8, 12, 13 o 14 números. Revisa que esté completo.');
  }

  var cuerpo = digitos.slice(0, digitos.length - 1);
  var control = Number(digitos.charAt(digitos.length - 1));
  if (digitoDeEan(cuerpo) !== control) {
    return resultado(false, 'Ese EAN no existe: el último número no cuadra. Cópialo otra vez del empaque o del catálogo.');
  }
  return resultado(true, '', digitos);
}

if (typeof module !== 'undefined') {
  module.exports = {
    validarEan: validarEan,
    validarIdentificacion: validarIdentificacion,
    validarNit: validarNit,
    validarRfc: validarRfc,
    validarRucPe: validarRucPe,
    validarCuit: validarCuit,
    validarRutCl: validarRutCl,
    validarRucEc: validarRucEc,
    validarRutUy: validarRutUy,
    validarCedulaCr: validarCedulaCr,
  };
}
