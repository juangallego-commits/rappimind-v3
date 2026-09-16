'use strict';

/**
 * El formulario por pasos, con el T&C en vivo al lado.
 *
 * Dos columnas en escritorio: preguntas a la izquierda, documento a la derecha.
 * En celular el documento se ve con el boton fijo "Ver cómo va mi T&C".
 */

var RM = window.RM;
var crear = RM.util.crear;
var estado = RM.estado;
var E = estado.estado;
var flujo = RM.flujo;

/** Valor de un campo en palabras, para el resumen y las respuestas cerradas. */
function comoTexto(campo) {
  var entrada = estado.entrada();
  var valor = entrada[campo.id];
  var pregunta = preguntaDe(campo.id);

  if (campo.id === 'maxPedidos') {
    var opcion = flujo.opcionDeVeces();
    if (opcion === 'sin_limite') return 'Sin límite';
    if (opcion === 'una') return 'Una sola vez';
    if (opcion === 'varias') return valor ? valor + ' veces' : 'Varias veces';
    return '';
  }
  if (valor === null || valor === undefined || valor === '') return '';
  if (campo.tipo === 'casilla') return valor ? 'Confirmado' : '';

  // País y tipo traen sus nombres del servidor, no del esquema.
  if (campo.id === 'pais') {
    var pais = paisPorCodigo(E.configuracion.paises, valor);
    return pais ? pais.nombre : String(valor);
  }
  if (campo.id === 'tipo') {
    for (var t = 0; t < E.configuracion.tipos.length; t++) {
      if (E.configuracion.tipos[t].id === valor) return E.configuracion.tipos[t].nombre;
    }
    return String(valor);
  }

  if (Object.prototype.toString.call(valor) === '[object Array]') {
    if (campo.id === 'tiendas') return valor.length + (valor.length === 1 ? ' tienda' : ' tiendas');
    var etiquetas = valor.map(function (v) {
      var encontrada = (pregunta.opciones || campo.opciones || []).filter(function (o) { return o.valor === v; })[0];
      return encontrada ? encontrada.etiqueta : v;
    });
    return etiquetas.join(', ');
  }

  var opciones = pregunta.opciones || campo.opciones;
  if (opciones) {
    var elegida = opciones.filter(function (o) { return o.valor === valor; })[0];
    if (elegida) return elegida.etiqueta;
  }

  if (campo.tipo === 'fecha') return formatearFecha(valor);
  if (campo.tipo === 'hora') return formatearHora(valor);

  // La identificación se muestra como va en el documento, no como se escribió.
  if (campo.tipo === 'identificacion') {
    var paisId = flujo.paisElegido();
    if (paisId) {
      var revision = validarIdentificacion(paisId.codigo, valor);
      if (revision.valido) return revision.formateado;
    }
    return String(valor);
  }
  if (campo.id === 'porcentaje') return valor + '%';
  if (pregunta.moneda) {
    var pais = flujo.paisElegido();
    return (pais ? pais.moneda_simbolo : '$') + formatearMiles(valor, pais ? pais.separador_miles : '.');
  }
  return String(valor);
}

/** Opciones que hay que deshabilitar, con la razón visible. */
function opcionesDeshabilitadas(campo) {
  if (campo.id !== 'desempate') return null;
  var criterio = estado.entrada().criterioGanador;
  if (!criterio) return null;
  var razon = {};
  razon[criterio] = preguntaDe('desempate').razonDeshabilitado;
  return razon;
}

/** Las opciones reales de un campo de casillas que las saca de los datos. */
function opcionesDeCasillas(campo) {
  if (campo.id !== 'secciones') return null;
  var pais = flujo.paisElegido();
  var nombres = (E.configuracion.secciones && pais) ? (E.configuracion.secciones[pais.codigo] || []) : [];
  return nombres.map(function (nombre) { return { valor: nombre, etiqueta: nombre, nota: 'Sección de la app.' }; });
}

/** Aviso contextual de un campo, si aplica. */
function avisoDe(campo) {
  if (campo.id !== 'fechaInicio') return null;
  var inicio = estado.entrada().fechaInicio;
  if (!inicio) return null;
  var hoy = E.configuracion.hoy || RM.util.hoyEnElNavegador();
  var dias = RM.util.diasEntre(hoy, inicio);
  if (dias < 0 || dias > 1) return null;
  return preguntaDe('fechaInicio').aviso;
}

/** La calculadora de ejemplo del Cashback. */
function calculadora() {
  var entrada = estado.entrada();
  if (entrada.tipo !== 'cashback' && entrada.tipo !== 'cashback_day') return null;
  if (!entrada.porcentaje) return null;

  var pais = flujo.paisElegido();
  if (!pais) return null;

  var simbolo = pais.moneda_simbolo;
  var separador = pais.separador_miles;
  var ejemplo = 100000;
  var bruto = Math.round(ejemplo * Number(entrada.porcentaje) / 100);
  var recibe = entrada.tope ? Math.min(bruto, Number(entrada.tope)) : bruto;

  var lineas = [
    crear('p', {
      texto: 'Con estos datos, un pedido de ' + simbolo + formatearMiles(ejemplo, separador) +
        ' recibe ' + simbolo + formatearMiles(recibe, separador) + ' en Créditos.',
    }),
  ];
  if (entrada.tope && bruto > Number(entrada.tope)) {
    lineas.push(crear('p', {
      clase: 'pregunta-ayuda',
      texto: 'El tope lo frena: sin tope habrían sido ' + simbolo + formatearMiles(bruto, separador) + '.',
    }));
  }
  if (entrada.tope && entrada.presupuesto && Number(entrada.tope) > Number(entrada.presupuesto)) {
    lineas.push(crear('p', {
      clase: 'mensaje-error',
      texto: 'Ojo: el tope por pedido es mayor que el presupuesto total. El primer pedido se llevaría toda la campaña.',
    }));
  }
  return crear('div', { clase: 'aviso' }, lineas);
}

/** Barra de progreso con el nombre de cada paso. */
function barraDeProgreso(pasos) {
  var lista = crear('ol', { clase: 'progreso' });
  for (var i = 0; i < pasos.length; i++) {
    (function (paso, indice) {
      var clase = indice < E.pasoActual ? 'hecho' : (indice === E.pasoActual ? 'actual' : '');
      lista.appendChild(crear('li', { clase: clase }, [
        crear('button', {
          type: 'button', texto: paso.nombre,
          disabled: indice > E.pasoActual,
          'aria-current': indice === E.pasoActual ? 'step' : null,
          onclick: function () { E.pasoActual = indice; E.campoAbierto = null; RM.app.dibujar(); },
        }),
      ]));
    })(pasos[i], i);
  }
  return lista;
}

/** La columna del documento. */
function columnaDocumento() {
  return crear('div', { clase: 'columna-documento' }, [
    crear('div', { clase: 'documento-encabezado' }, [
      crear('h2', { texto: 'Tu T&C' }),
      crear('span', { clase: 'cuenta', id: 'cuenta-huecos' }),
    ]),
    crear('div', { clase: 'hoja', 'data-hoja': '1', tabindex: '0', role: 'region', 'aria-label': 'Vista previa del documento' }),
  ]);
}

function pantallaPasos(raiz) {
  var entrada = estado.entrada();
  var pasos = flujo.pasosDelTipo(entrada);

  // Sin tipo elegido todavía: se pregunta país y tipo primero.
  if (pasos.length === 0) {
    pasos = [pasoDe('campana')];
  }
  if (E.pasoActual >= pasos.length) E.pasoActual = pasos.length - 1;

  var pasoActual = pasos[E.pasoActual];
  var campos = flujo.camposDelPaso(entrada, pasoActual.id);
  if (campos.length === 0 && !entrada.tipo) {
    campos = [
      { id: 'pais', tipo: 'lista', paso: 'campana', etiqueta: 'País' },
      { id: 'tipo', tipo: 'tarjetas', paso: 'campana', etiqueta: 'Tipo' },
    ];
  }

  var errores = flujo.erroresPorCampo();

  // Cuál pregunta está abierta: la que se pidió editar, o la primera sin responder.
  var indiceAbierto = 0;
  if (E.campoAbierto) {
    for (var i = 0; i < campos.length; i++) if (campos[i].id === E.campoAbierto) indiceAbierto = i;
  } else {
    indiceAbierto = campos.length - 1;
    for (var j = 0; j < campos.length; j++) {
      if (!flujo.tieneRespuesta(campos[j].id)) { indiceAbierto = j; break; }
    }
  }

  var columna = crear('div', { clase: 'columna-preguntas' });
  columna.appendChild(barraDeProgreso(pasos));
  columna.appendChild(crear('h1', { texto: pasoActual.titulo || pasoActual.nombre }));

  // Respondidas, en una línea.
  var respondidas = crear('div', { clase: 'ficha' });
  var cuantasRespondidas = 0;
  for (var r = 0; r < indiceAbierto; r++) {
    (function (campo) {
      if (!flujo.tieneRespuesta(campo.id)) return;
      cuantasRespondidas += 1;
      respondidas.appendChild(RM.campos.dibujarRespondida(campo, comoTexto(campo), function () {
        E.campoAbierto = campo.id;
        RM.app.dibujar();
      }));
    })(campos[r]);
  }
  if (cuantasRespondidas > 0) columna.appendChild(respondidas);

  // La pregunta abierta.
  var campoAbierto = campos[indiceAbierto];
  if (campoAbierto) {
    var opcionesEspeciales = opcionesDeCasillas(campoAbierto);
    var bloque = RM.campos.dibujarPregunta(campoAbierto, {
      pais: flujo.paisElegido(),
      error: E.errores[campoAbierto.id] ? errores[campoAbierto.id] : null,
      confirmacion: confirmacionDe(campoAbierto),
      deshabilitadas: opcionesDeshabilitadas(campoAbierto),
      opciones: opcionesEspeciales,
      aviso: avisoDe(campoAbierto),
      alCambiar: function (campoId, valor) { alResponder(campoId, valor, campos, indiceAbierto); },
      alAvanzar: function () { avanzar(campos, indiceAbierto, pasos); },
    });

    if (bloque) {
      // País y tipo se dibujan a mano porque sus opciones salen del servidor.
      if (campoAbierto.id === 'pais' || campoAbierto.id === 'tipo') {
        bloque = preguntaDeCatalogo(campoAbierto, campos, indiceAbierto, pasos);
      }
      if (campoAbierto.id === 'maxPedidos') {
        bloque = preguntaDeVeces(campos, indiceAbierto, pasos, errores);
      }
      if (campoAbierto.id === 'tiendas') {
        bloque = RM.tiendas.dibujar(function () { RM.app.dibujar(); });
      }
      columna.appendChild(bloque);
    }

    var extra = campoAbierto.id === 'tope' || campoAbierto.id === 'presupuesto' || campoAbierto.id === 'porcentaje'
      ? calculadora() : null;
    if (extra) columna.appendChild(extra);
  }

  // Cuántas faltan en este paso.
  var faltan = campos.length - indiceAbierto - 1;
  if (faltan > 0) {
    columna.appendChild(crear('p', {
      clase: 'pregunta-ayuda',
      texto: faltan === 1 ? 'Queda 1 pregunta en este paso.' : 'Quedan ' + faltan + ' preguntas en este paso.',
    }));
  }

  columna.appendChild(crear('div', { clase: 'fila-botones' }, [
    E.pasoActual > 0 || indiceAbierto > 0
      ? crear('button', {
          clase: 'boton boton-secundario', type: 'button', texto: 'Atrás',
          onclick: function () { retroceder(campos, indiceAbierto, pasos); },
        })
      : null,
    crear('button', {
      clase: 'boton', type: 'button',
      texto: entrada.tipo && indiceAbierto === campos.length - 1 && E.pasoActual === pasos.length - 1
        ? 'Revisar y generar' : 'Siguiente',
      onclick: function () { avanzar(campos, indiceAbierto, pasos); },
    }),
  ]));

  var contenido = crear('div', { clase: 'pagina' }, [
    crear('div', { clase: 'dos-columnas' }, [columna, columnaDocumento()]),
  ]);
  raiz.appendChild(contenido);
  RM.app.agregarHojaDeCelular(raiz);
  flujo.refrescarDocumento();
}

function confirmacionDe(campo) {
  if (campo.id !== 'organizadorId') return null;
  var valor = estado.entrada().organizadorId;
  if (!valor) return null;
  var pais = flujo.paisElegido();
  if (!pais) return null;
  var revision = validarIdentificacion(pais.codigo, valor);
  return revision.valido ? revision.formateado + ' válido' : null;
}

/** País y tipo: las opciones vienen del servidor, no del esquema. */
function preguntaDeCatalogo(campo, campos, indice, pasos) {
  var pregunta = preguntaDe(campo.id);
  var bloque = crear('div', { clase: 'pregunta' }, [
    crear('h2', { clase: 'pregunta-titulo', texto: pregunta.pregunta }),
    crear('p', { clase: 'pregunta-ayuda' }, [RM.campos.conGlosario(pregunta.ayuda)]),
  ]);

  var elegido = estado.entrada()[campo.id];
  var grupo = crear('div', { clase: 'opciones', role: 'radiogroup' });

  var opciones;
  if (campo.id === 'pais') {
    opciones = E.configuracion.paises.map(function (p) {
      return { valor: p.codigo, etiqueta: p.nombre, nota: p.estado === 'piloto' ? 'En piloto: solo para el equipo de pruebas.' : 'Disponible.' };
    });
  } else {
    var pais = flujo.paisElegido();
    opciones = tiposDelPais(pais || { modelos: [] }, E.configuracion.tipos).map(function (t) {
      return { valor: t.id, etiqueta: t.nombre, nota: t.descripcion };
    });
  }

  for (var i = 0; i < opciones.length; i++) {
    (function (opcion) {
      grupo.appendChild(crear('button', {
        clase: 'opcion' + (elegido === opcion.valor ? ' elegida' : ''),
        type: 'button', role: 'radio', 'aria-checked': String(elegido === opcion.valor),
        onclick: function () {
          alResponder(campo.id, opcion.valor, campos, indice);
          E.campoAbierto = null;
          RM.app.dibujar();
        },
      }, [
        crear('span', { clase: 'opcion-titulo', texto: opcion.etiqueta }),
        crear('span', { clase: 'opcion-nota', texto: opcion.nota }),
      ]));
    })(opciones[i]);
  }

  bloque.appendChild(grupo);
  bloque.appendChild(crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: '¿Por qué te preguntamos esto?' }),
    crear('p', { texto: pregunta.porQue }),
  ]));
  return bloque;
}

/** "¿Cuántas veces puede ganar la misma persona?" */
function preguntaDeVeces(campos, indice, pasos, errores) {
  var pregunta = preguntaDe('maxPedidos');
  var elegido = flujo.opcionDeVeces();

  var bloque = crear('div', { clase: 'pregunta' }, [
    crear('h2', { clase: 'pregunta-titulo', texto: pregunta.pregunta }),
    crear('p', { clase: 'pregunta-ayuda' }, [RM.campos.conGlosario(pregunta.ayuda)]),
  ]);

  var grupo = crear('div', { clase: 'opciones', role: 'radiogroup' });
  for (var i = 0; i < pregunta.opciones.length; i++) {
    (function (opcion) {
      grupo.appendChild(crear('button', {
        clase: 'opcion' + (elegido === opcion.valor ? ' elegida' : ''),
        type: 'button', role: 'radio', 'aria-checked': String(elegido === opcion.valor),
        onclick: function () {
          flujo.fijarVeces(opcion.valor);
          E.errores.maxPedidos = true;
          if (opcion.valor !== 'varias') avanzar(campos, indice, pasos);
          else RM.app.dibujar();
          flujo.refrescarDocumento();
        },
      }, [
        crear('span', { clase: 'opcion-titulo', texto: opcion.etiqueta }),
        crear('span', { clase: 'opcion-nota', texto: opcion.nota }),
      ]));
    })(pregunta.opciones[i]);
  }
  bloque.appendChild(grupo);

  if (elegido === 'varias') {
    var cuantas = crear('input', {
      type: 'text', inputmode: 'numeric', id: 'campo-maxPedidos',
      value: estado.entrada().maxPedidos || '', placeholder: '3',
    });
    cuantas.addEventListener('input', function () {
      cuantas.value = RM.util.soloDigitos(cuantas.value);
      estado.fijar('maxPedidos', cuantas.value ? Number(cuantas.value) : null);
      flujo.refrescarDocumento();
      var frase = RM.campos.asiQueda('maxPedidos', flujo.paisElegido());
      var vieja = bloque.querySelector('.asi-queda');
      if (vieja) vieja.parentNode.removeChild(vieja);
      if (frase) bloque.appendChild(frase);
    });
    bloque.appendChild(crear('label', { clase: 'campo' }, [
      crear('p', { clase: 'pregunta-ayuda', texto: '¿Cuántas veces?' }),
      crear('div', { clase: 'campo-caja' }, [cuantas]),
    ]));
  }

  if (E.errores.maxPedidos && errores.maxPedidos) {
    bloque.appendChild(crear('p', { clase: 'mensaje-error', role: 'alert', texto: errores.maxPedidos }));
  }

  var frase = RM.campos.asiQueda('maxPedidos', flujo.paisElegido());
  if (frase) bloque.appendChild(frase);

  bloque.appendChild(crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: '¿Por qué te preguntamos esto?' }),
    crear('p', { texto: pregunta.porQue }),
  ]));
  return bloque;
}

// --- Navegación --------------------------------------------------------------

function alResponder(campoId, valor, campos, indice) {
  estado.fijar(campoId, valor);
  E.errores[campoId] = true;
  E.respondidas[campoId] = true;

  // Al elegir el día de inicio se propone el mismo día de fin: tres de cada
  // cuatro campañas de cashback duran un solo día.
  if (campoId === 'fechaInicio' && !estado.entrada().fechaFin) estado.fijar('fechaFin', valor);
  if (campoId === 'pais') estado.fijar('tipo', null);
  if (campoId === 'criterioGanador' && estado.entrada().desempate === valor) estado.fijar('desempate', null);

  flujo.refrescarDocumento();
  actualizarValidacionEnVivo(campoId);
}

/** Refresca solo el mensaje de error del campo abierto, sin redibujar todo. */
function actualizarValidacionEnVivo(campoId) {
  var bloque = document.querySelector('[data-campo="' + campoId + '"]');
  if (!bloque) return;

  var errores = flujo.erroresPorCampo();
  var viejo = bloque.querySelector('.mensaje-error, .mensaje-ok');
  if (viejo) viejo.parentNode.removeChild(viejo);

  var control = bloque.querySelector('input, select, .opciones');
  var mensaje = null;

  if (errores[campoId]) {
    bloque.classList.add('campo-error');
    mensaje = crear('p', { clase: 'mensaje-error', role: 'alert' }, [
      RM.util.icono('alerta', 16), document.createTextNode(errores[campoId]),
    ]);
  } else {
    bloque.classList.remove('campo-error');
    var confirmacion = confirmacionDe({ id: campoId });
    if (confirmacion) {
      mensaje = crear('p', { clase: 'mensaje-ok' }, [
        RM.util.icono('visto', 16), document.createTextNode(confirmacion),
      ]);
    }
  }
  if (mensaje && control) control.parentNode.insertBefore(mensaje, control.nextSibling);

  var frase = RM.campos.asiQueda(campoId, flujo.paisElegido());
  var vieja = bloque.querySelector('.asi-queda');
  if (vieja) vieja.parentNode.removeChild(vieja);
  if (frase) {
    var detalle = bloque.querySelector('.por-que');
    bloque.insertBefore(frase, detalle);
  }
}

/**
 * Recalcula los pasos y las preguntas del momento.
 *
 * Hay que recalcular siempre: elegir el país o el tipo cambia qué pasos existen
 * y qué preguntas se ven, así que las listas que se armaron para dibujar la
 * pantalla anterior ya no sirven para decidir a dónde ir.
 */
function situacionActual() {
  var entrada = estado.entrada();
  var pasos = flujo.pasosDelTipo(entrada);
  if (pasos.length === 0) pasos = [pasoDe('campana')];
  if (E.pasoActual >= pasos.length) E.pasoActual = pasos.length - 1;

  var campos = flujo.camposDelPaso(entrada, pasos[E.pasoActual].id);
  if (campos.length === 0 && !entrada.tipo) {
    campos = [
      { id: 'pais', tipo: 'lista', paso: 'campana' },
      { id: 'tipo', tipo: 'tarjetas', paso: 'campana' },
    ];
  }
  return { pasos: pasos, campos: campos };
}

function avanzar(camposViejos, indiceViejo, pasosViejos) {
  var ahora = situacionActual();
  var campos = ahora.campos;
  var pasos = ahora.pasos;

  // El índice se vuelve a buscar por identificador: la lista pudo cambiar.
  var indice = indiceViejo;
  if (camposViejos && camposViejos[indiceViejo]) {
    var buscado = camposViejos[indiceViejo].id;
    for (var b = 0; b < campos.length; b++) if (campos[b].id === buscado) indice = b;
  }
  if (indice >= campos.length) indice = campos.length - 1;

  var errores = flujo.erroresPorCampo();
  var campo = campos[indice];

  if (campo && errores[campo.id]) {
    E.errores[campo.id] = true;
    E.campoAbierto = campo.id;
    RM.app.dibujar();
    RM.util.anunciar(errores[campo.id]);
    return;
  }

  if (campo) E.respondidas[campo.id] = true;

  E.campoAbierto = null;
  if (indice < campos.length - 1) {
    E.campoAbierto = campos[indice + 1].id;
    RM.app.dibujar();
    return;
  }
  if (E.pasoActual < pasos.length - 1) {
    E.pasoActual += 1;
    RM.app.dibujar();
    return;
  }
  RM.app.ir('resumen');
}

function retroceder(camposViejos, indiceViejo, pasosViejos) {
  var ahora = situacionActual();
  var campos = ahora.campos;
  var pasos = ahora.pasos;
  var indice = Math.min(indiceViejo, campos.length - 1);

  E.campoAbierto = null;
  if (indice > 0) {
    E.campoAbierto = campos[indice - 1].id;
    RM.app.dibujar();
    return;
  }
  if (E.pasoActual > 0) {
    E.pasoActual -= 1;
    RM.app.dibujar();
    return;
  }
  RM.app.ir('filtro');
}

RM.pasos = {
  pantallaPasos: pantallaPasos,
  comoTexto: comoTexto,
  columnaDocumento: columnaDocumento,
  calculadora: calculadora,
};
