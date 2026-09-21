'use strict';

/**
 * La lista de beneficios cuando el beneficio cambia segun el producto.
 *
 * Hasta el 21 de septiembre de 2026 esto no existia y el filtro de Rappi Travel
 * mandaba a Legal toda campana cuyo porcentaje cambiara segun el destino o el
 * producto. Dos de las cinco piezas publicadas que trajo Juan eran exactamente
 * ese caso: la del Caribe Mexicano trae veintitres hoteles, cada uno con su
 * porcentaje y con sus propias fechas de venta y de viaje.
 *
 * Mismo patron que la lista de productos del concurso, con una diferencia: dos
 * de los cuatro campos de cada fila son opcionales, porque no todos los
 * productos tienen fechas propias distintas de la vigencia de la campana.
 */

var RM = window.RM;
var crear = RM.util.crear;
var estado = RM.estado;

var CAMPOS_DE_LA_FILA = ['nombre', 'porcentaje', 'hastaCompra', 'hastaViaje'];
var OPCIONALES = ['hastaCompra', 'hastaViaje'];

function beneficios() {
  if (!estado.entrada().beneficiosPorProducto) estado.fijar('beneficiosPorProducto', []);
  return estado.entrada().beneficiosPorProducto;
}

function beneficioVacio() {
  return { nombre: '', porcentaje: '', hastaCompra: '', hastaViaje: '' };
}

/** Revisa una fila y devuelve los problemas, campo por campo. */
function revisarBeneficio(fila, indice, todos) {
  var problemas = {};
  var textos = estado.pregunta('beneficiosPorProducto');

  if (!String(fila.nombre || '').trim()) problemas.nombre = 'Falta el nombre de este producto.';

  var porcentaje = Number(fila.porcentaje);
  if (!String(fila.porcentaje || '').trim()) {
    problemas.porcentaje = 'Falta el porcentaje de este producto.';
  } else if (!porcentaje || porcentaje < 1 || porcentaje > 100) {
    problemas.porcentaje = textos.errores.rango;
  }

  // El mismo producto dos veces deja el documento prometiendo dos beneficios
  // distintos para lo mismo, y el usuario va a exigir el mas alto.
  var nombre = String(fila.nombre || '').trim().toLowerCase();
  for (var i = 0; i < todos.length; i++) {
    if (i === indice || !nombre) continue;
    if (String(todos[i].nombre || '').trim().toLowerCase() === nombre) {
      problemas.nombre = textos.errores.repetida;
      break;
    }
  }
  return problemas;
}

function filaDeBeneficio(fila, indice, alCambiar) {
  var textos = estado.pregunta('beneficiosPorProducto').camposPorProducto;
  var problemas = revisarBeneficio(fila, indice, beneficios());

  var marco = crear('div', { clase: 'ficha-seccion', 'data-beneficio': String(indice) }, [
    crear('div', { clase: 'ficha-encabezado' }, [
      crear('h3', { texto: 'Producto ' + (indice + 1) + (fila.nombre ? ': ' + fila.nombre : '') }),
      crear('button', {
        clase: 'boton-texto', type: 'button', texto: estado.T('Quitar'),
        onclick: function () {
          var lista = beneficios().slice();
          lista.splice(indice, 1);
          estado.fijar('beneficiosPorProducto', lista);
          alCambiar();
        },
      }),
    ]),
  ]);

  function campo(llave) {
    var esFecha = llave === 'hastaCompra' || llave === 'hastaViaje';
    var control = crear('input', {
      type: esFecha ? 'date' : 'text',
      value: fila[llave] || '',
      placeholder: esFecha ? '' : (textos[llave].ejemplo || ''),
      'aria-label': textos[llave].pregunta + ' del producto ' + (indice + 1),
    });
    if (llave === 'porcentaje') control.setAttribute('inputmode', 'numeric');

    control.addEventListener('input', function () {
      var lista = beneficios().slice();
      // Los numeros se filtran al escribir, como en los demas campos de cifra:
      // una letra dentro del porcentaje sale impresa en el documento.
      lista[indice][llave] = llave === 'porcentaje'
        ? control.value.replace(/[^0-9]/g, '')
        : control.value;
      if (llave === 'porcentaje') control.value = lista[indice][llave];
      estado.fijar('beneficiosPorProducto', lista);
      RM.flujo.refrescarDocumento();
    });
    control.addEventListener('blur', alCambiar);

    var ayuda = textos[llave].pregunta + '. ' + textos[llave].ayuda;
    return crear('label', { clase: 'campo' }, [
      crear('p', { clase: 'pregunta-ayuda', texto: ayuda }),
      crear('div', { clase: 'campo-caja' }, [control]),
      problemas[llave] ? crear('p', { clase: 'mensaje-error', texto: problemas[llave] }) : null,
    ]);
  }

  for (var i = 0; i < CAMPOS_DE_LA_FILA.length; i++) marco.appendChild(campo(CAMPOS_DE_LA_FILA[i]));
  return marco;
}

/** Pegar desde Excel: una fila por producto, con hasta cuatro columnas. */
function bloqueDePegar(alCambiar) {
  var area = crear('textarea', {
    rows: '4',
    placeholder: 'Hard Rock Hotel Los Cabos\t55\t2026-12-18\t2026-12-18',
    'aria-label': 'Pegar los beneficios desde una hoja de cálculo',
  });
  var resultado = crear('div', {});

  function procesar() {
    var lineas = area.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (lineas.length === 0) return;

    var nuevos = [];
    var rechazadas = [];
    for (var i = 0; i < lineas.length; i++) {
      var celdas = lineas[i].split(/\t|;/).map(function (c) { return c.trim(); });
      if (celdas.length === 1) celdas = lineas[i].split(/\s{2,}/).map(function (c) { return c.trim(); });
      if (celdas.length < 2) { rechazadas.push('Fila ' + (i + 1) + ': necesita el nombre y el porcentaje.'); continue; }
      var fila = beneficioVacio();
      fila.nombre = celdas[0] || '';
      // El porcentaje puede venir pegado como "55%" o como "55 %".
      fila.porcentaje = String(celdas[1] || '').replace(/[^0-9]/g, '');
      fila.hastaCompra = celdas[2] || '';
      fila.hastaViaje = celdas[3] || '';
      nuevos.push(fila);
    }

    var lista = beneficios().slice().filter(function (b) { return b.nombre || b.porcentaje; });
    estado.fijar('beneficiosPorProducto', lista.concat(nuevos));
    area.value = '';

    RM.util.vaciar(resultado);
    resultado.appendChild(crear('p', {
      clase: 'mensaje-ok',
      texto: nuevos.length + (nuevos.length === 1 ? ' producto agregado.' : ' productos agregados.') +
        ' Revisa que cada uno haya quedado bien.',
    }));
    for (var r = 0; r < rechazadas.length; r++) {
      resultado.appendChild(crear('p', { clase: 'mensaje-error', texto: rechazadas[r] }));
    }
    alCambiar();
  }

  return crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: estado.T('Pegar desde una hoja de cálculo') }),
    crear('p', {
      clase: 'pregunta-ayuda',
      texto: 'Una fila por producto, separadas por tabulación: el nombre, el porcentaje y, si las tiene, ' +
        'la última fecha de compra y la última de viaje en formato aaaa-mm-dd.',
    }),
    area,
    crear('div', { clase: 'fila-botones' }, [
      crear('button', { clase: 'boton boton-secundario', type: 'button', texto: estado.T('Agregar los pegados'), onclick: procesar }),
    ]),
    resultado,
  ]);
}

function dibujar(alCambiar) {
  var pregunta = estado.pregunta('beneficiosPorProducto');
  var lista = beneficios();

  var bloque = crear('div', { clase: 'pregunta', 'data-campo': 'beneficiosPorProducto' }, [
    crear('h2', { clase: 'pregunta-titulo', texto: pregunta.pregunta }),
    crear('p', { clase: 'pregunta-ayuda', texto: pregunta.ayuda }),
  ]);

  if (lista.length === 0) {
    bloque.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: 'Todavía no has agregado ningún producto.' }));
  }
  for (var i = 0; i < lista.length; i++) {
    bloque.appendChild(filaDeBeneficio(lista[i], i, alCambiar));
  }

  bloque.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: estado.T('Agregar producto'),
      onclick: function () {
        estado.fijar('beneficiosPorProducto', beneficios().concat([beneficioVacio()]));
        alCambiar();
      },
    }),
  ]));
  bloque.appendChild(bloqueDePegar(alCambiar));

  bloque.appendChild(crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: estado.T('¿Por qué te preguntamos esto?') }),
    crear('p', { texto: pregunta.porQue }),
  ]));
  return bloque;
}

RM.beneficios = {
  dibujar: dibujar,
  OPCIONALES: OPCIONALES,
};
