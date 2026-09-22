'use strict';

/**
 * La lista de tiendas del Cashback Day.
 *
 * Es el unico componente repetible. Cada tienda entra con su marca, su razon
 * social, su NIT, su cobertura y su presupuesto, porque cada una organiza su
 * propio beneficio y responde por el.
 *
 * Tambien acepta pegar filas desde Excel: 78 de las solicitudes reales meten
 * tres o mas tiendas dentro de un campo de texto, asi que pegar es como
 * trabajan de verdad.
 */

var RM = window.RM;
var crear = RM.util.crear;
var estado = RM.estado;
var E = estado.estado;

var COLUMNAS = ['marca', 'razonSocial', 'id', 'ciudades', 'presupuesto'];

function tiendas() {
  if (!estado.entrada().tiendas) estado.fijar('tiendas', []);
  return estado.entrada().tiendas;
}

function tiendaVacia() {
  // tiendaTurbo arranca sin respuesta a proposito: cada marca tiene la suya y
  // no hay una mayoritaria que se pueda premarcar.
  return { marca: '', razonSocial: '', id: '', ciudades: '', nacional: false, presupuesto: null, tiendaTurbo: '' };
}

/*
 * Los textos de las columnas de la lista, con el idioma y el pais ya puestos.
 *
 * estado.pregunta() y no preguntaDe(): la columna del identificador se llama
 * "{ID_FISCAL}" hasta que alguien le pone encima la fila del pais, y llamar a
 * preguntaDe() aqui dejaba el marcador crudo en la cabecera de la tabla. Es la
 * misma trampa de la skill de flujo: un mecanismo que la interfaz no llama es un
 * mecanismo que no existe.
 */
function textosDeLaTienda() {
  return estado.pregunta('tiendas').camposPorTienda;
}

/** Revisa una fila y devuelve los problemas, campo por campo. */
function revisarTienda(tienda, indice, todas) {
  var pais = RM.flujo.paisElegido();
  var problemas = {};
  var textos = textosDeLaTienda();

  if (!tienda.marca) problemas.marca = 'Falta ' + textos.marca.pregunta.toLowerCase() + '.';
  if (!tienda.razonSocial) problemas.razonSocial = 'Falta la razón social.';
  if (!tienda.presupuesto) problemas.presupuesto = 'Falta el presupuesto de esta tienda.';
  if (!tienda.nacional && !tienda.ciudades) problemas.ciudades = 'Escribe las ciudades o marca cobertura nacional.';
  if (!tienda.tiendaTurbo) problemas.tiendaTurbo = 'Dinos en cuál de sus tiendas se gana el cashback.';

  if (!tienda.id) {
    problemas.id = 'Falta ' + textos.id.pregunta.toLowerCase() + ' de esta tienda.';
  } else if (pais) {
    var revision = validarIdentificacion(pais.codigo, tienda.id);
    if (!revision.valido) {
      problemas.id = revision.mensaje;
    } else {
      for (var i = 0; i < todas.length; i++) {
        if (i === indice || !todas[i].id) continue;
        var otra = validarIdentificacion(pais.codigo, todas[i].id);
        if (otra.valido && otra.formateado === revision.formateado) {
          problemas.id = estado.pregunta('tiendas').errores.repetida;
          break;
        }
      }
    }
  }
  return problemas;
}

function filaDeTienda(tienda, indice, alCambiar) {
  var textos = textosDeLaTienda();
  var pais = RM.flujo.paisElegido();
  var problemas = revisarTienda(tienda, indice, tiendas());

  var fila = crear('div', { clase: 'ficha-seccion', 'data-tienda': String(indice) }, [
    crear('div', { clase: 'ficha-encabezado' }, [
      crear('h3', { texto: 'Tienda ' + (indice + 1) + (tienda.marca ? ': ' + tienda.marca : '') }),
      crear('button', {
        clase: 'boton-texto', type: 'button', texto: 'Quitar',
        onclick: function () {
          var lista = tiendas().slice();
          lista.splice(indice, 1);
          estado.fijar('tiendas', lista);
          alCambiar();
        },
      }),
    ]),
  ]);

  function campoTexto(llave, esMonto) {
    var control = crear('input', {
      type: 'text',
      inputmode: esMonto ? 'numeric' : null,
      value: esMonto
        ? (tienda[llave] ? RM.util.conSeparadorDeMiles(tienda[llave], pais ? pais.separador_miles : '.') : '')
        : (tienda[llave] || ''),
      placeholder: textos[llave].ejemplo || '',
      'aria-label': textos[llave].pregunta + ' de la tienda ' + (indice + 1),
      disabled: llave === 'ciudades' && tienda.nacional,
    });
    control.addEventListener('input', function () {
      var lista = tiendas().slice();
      if (esMonto) {
        var digitos = RM.util.soloDigitos(control.value);
        control.value = RM.util.conSeparadorDeMiles(digitos, pais ? pais.separador_miles : '.');
        lista[indice][llave] = digitos ? Number(digitos) : null;
      } else {
        lista[indice][llave] = control.value;
      }
      estado.fijar('tiendas', lista);
      RM.flujo.refrescarDocumento();
    });
    control.addEventListener('blur', alCambiar);

    return crear('label', { clase: 'campo' }, [
      crear('p', { clase: 'pregunta-ayuda', texto: textos[llave].pregunta + '. ' + textos[llave].ayuda }),
      crear('div', { clase: 'campo-caja' + (esMonto ? ' con-moneda' : '') }, [
        esMonto ? crear('span', { clase: 'simbolo-moneda', texto: pais ? pais.moneda_simbolo : '$' }) : null,
        control,
      ]),
      problemas[llave] ? crear('p', { clase: 'mensaje-error', texto: problemas[llave] }) : null,
    ]);
  }

  fila.appendChild(campoTexto('marca', false));
  fila.appendChild(campoTexto('razonSocial', false));
  fila.appendChild(campoTexto('id', false));

  var nacional = crear('input', { type: 'checkbox', checked: !!tienda.nacional });
  nacional.addEventListener('change', function () {
    var lista = tiendas().slice();
    lista[indice].nacional = nacional.checked;
    if (nacional.checked) lista[indice].ciudades = '';
    estado.fijar('tiendas', lista);
    alCambiar();
  });
  fila.appendChild(crear('label', { clase: 'casilla' }, [
    nacional, crear('span', { texto: textos.nacional.pregunta }),
  ]));

  fila.appendChild(campoTexto('ciudades', false));
  fila.appendChild(campoTexto('presupuesto', true));
  fila.appendChild(campoDeTiendaTurbo(tienda, indice, textos, problemas, alCambiar));
  return fila;
}

/**
 * En cual de sus tiendas se gana el cashback, una vez por marca.
 *
 * Va como lista desplegable y no como botones: con sesenta tiendas, cuatro
 * botones por fila serian doscientos cuarenta botones en una pantalla.
 */
function campoDeTiendaTurbo(tienda, indice, textos, problemas, alCambiar) {
  var opciones = esquemaDe('cashback_day').camposPorTienda.filter(function (campo) {
    return campo.id === 'tiendaTurbo';
  })[0].opciones;

  var control = crear('select', {
    'aria-label': textos.tiendaTurbo.pregunta + ' de la tienda ' + (indice + 1),
  });
  control.appendChild(crear('option', { value: '', texto: 'Elige una' }));
  for (var i = 0; i < opciones.length; i++) {
    control.appendChild(crear('option', { value: opciones[i].valor, texto: opciones[i].etiqueta }));
  }
  control.value = tienda.tiendaTurbo || '';

  control.addEventListener('change', function () {
    var lista = tiendas().slice();
    lista[indice].tiendaTurbo = control.value;
    estado.fijar('tiendas', lista);
    RM.flujo.refrescarDocumento();
    alCambiar();
  });

  return crear('label', { clase: 'campo' }, [
    crear('p', { clase: 'pregunta-ayuda', texto: textos.tiendaTurbo.pregunta + ' ' + textos.tiendaTurbo.ayuda }),
    crear('div', { clase: 'campo-caja' }, [control]),
    problemas.tiendaTurbo ? crear('p', { clase: 'mensaje-error', texto: problemas.tiendaTurbo }) : null,
  ]);
}

/** Pegar desde Excel: una fila por tienda, columnas separadas por tabulación. */
function bloqueDePegar(alCambiar) {
  var area = crear('textarea', {
    rows: '4',
    placeholder: 'Beer Station\tCervecerías del Sur S.A.S.\t900.777.888-2\tBogotá, Medellín\t5000000',
    'aria-label': 'Pega aquí las filas copiadas de Excel',
  });

  var resultado = crear('div', {});

  function procesar() {
    var lineas = area.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (lineas.length === 0) return;

    var nuevas = [];
    var rechazadas = [];

    for (var i = 0; i < lineas.length; i++) {
      var celdas = lineas[i].split(/\t|;/).map(function (c) { return c.trim(); });
      if (celdas.length === 1) celdas = lineas[i].split(/\s{2,}/).map(function (c) { return c.trim(); });
      if (celdas.length < 3) { rechazadas.push('Fila ' + (i + 1) + ': necesita al menos marca, razón social y NIT.'); continue; }

      var tienda = tiendaVacia();
      tienda.marca = celdas[0] || '';
      tienda.razonSocial = celdas[1] || '';
      tienda.id = celdas[2] || '';
      var cobertura = celdas[3] || '';
      if (/^nacional$/i.test(cobertura)) tienda.nacional = true;
      else tienda.ciudades = cobertura;
      tienda.presupuesto = celdas[4] ? Number(RM.util.soloDigitos(celdas[4])) : null;
      nuevas.push(tienda);
    }

    var lista = tiendas().slice().filter(function (t) { return t.marca || t.razonSocial || t.id; });
    estado.fijar('tiendas', lista.concat(nuevas));
    area.value = '';

    RM.util.vaciar(resultado);
    resultado.appendChild(crear('p', {
      clase: 'mensaje-ok',
      texto: nuevas.length + (nuevas.length === 1 ? ' tienda agregada.' : ' tiendas agregadas.') + ' Revisa que cada una haya quedado bien.',
    }));
    for (var r = 0; r < rechazadas.length; r++) {
      resultado.appendChild(crear('p', { clase: 'mensaje-error', texto: rechazadas[r] }));
    }
    alCambiar();
  }

  return crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: 'Pegar varias tiendas desde Excel' }),
    crear('div', {}, [
      crear('p', {
        clase: 'pregunta-ayuda',
        texto: 'Copia las filas de tu hoja de cálculo con las columnas en este orden: marca, razón social, NIT, ciudades (o la palabra Nacional) y presupuesto.',
      }),
      area,
      crear('div', { clase: 'fila-botones' }, [
        crear('button', { clase: 'boton boton-secundario', type: 'button', texto: 'Agregar estas tiendas', onclick: procesar }),
      ]),
      resultado,
    ]),
  ]);
}

function dibujar(alCambiar) {
  // estado.pregunta() por lo mismo que textosDeLaTienda(): la ayuda nombra el
  // identificador tributario del pais, y con preguntaDe() salia "{ID_FISCAL}".
  var pregunta = estado.pregunta('tiendas');
  var lista = tiendas();

  var bloque = crear('div', { clase: 'pregunta', 'data-campo': 'tiendas' }, [
    crear('h2', { clase: 'pregunta-titulo', texto: pregunta.pregunta }),
    crear('p', { clase: 'pregunta-ayuda' }, [RM.campos.conGlosario(pregunta.ayuda)]),
  ]);

  var ficha = crear('div', { clase: 'ficha' });
  for (var i = 0; i < lista.length; i++) {
    ficha.appendChild(filaDeTienda(lista[i], i, alCambiar));
  }
  if (lista.length === 0) {
    ficha.appendChild(crear('div', { clase: 'ficha-seccion' }, [
      crear('p', { clase: 'pregunta-ayuda', texto: 'Todavía no has agregado ninguna tienda.' }),
    ]));
  }
  bloque.appendChild(ficha);

  if (lista.length < 2) {
    bloque.appendChild(crear('p', { clase: 'mensaje-error', texto: pregunta.errores.minimo }));
  }
  if (lista.length > 60) {
    bloque.appendChild(crear('p', { clase: 'mensaje-error', texto: pregunta.errores.maximo }));
  }

  bloque.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: 'Agregar tienda',
      disabled: lista.length >= 60,
      onclick: function () {
        estado.fijar('tiendas', lista.concat([tiendaVacia()]));
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

RM.tiendas = { dibujar: dibujar, revisarTienda: revisarTienda, COLUMNAS: COLUMNAS };
