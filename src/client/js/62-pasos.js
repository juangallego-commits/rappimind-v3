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
  var pregunta = estado.pregunta(campo.id);

  if (campo.id === 'maxPedidos') {
    var opcion = flujo.opcionDeVeces();
    if (opcion === 'sin_limite') return estado.T('Sin límite');
    if (opcion === 'una') return estado.T('Una sola vez');
    if (opcion === 'varias') return valor ? estado.T('{n} veces').replace('{n}', valor) : estado.T('Varias veces');
    return '';
  }
  if (valor === null || valor === undefined || valor === '') return '';
  if (campo.tipo === 'casilla') return valor ? estado.T('Confirmado') : '';

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

  // Las opciones que salen de los datos no estan en el esquema ni en la
  // pregunta. Sin esto, la categoria respondida se leia arriba como
  // "medicamento", que es el nombre interno y no lo que dice la opcion.
  var opciones = opcionesDeLosDatos(campo) || pregunta.opciones || campo.opciones;
  if (opciones) {
    var elegida = opciones.filter(function (o) { return o.valor === valor; })[0];
    if (elegida) return elegida.etiqueta;
  }

  // En el idioma del pais, como en el documento: una campana de Brasil decia
  // "1 de octubre de 2026" arriba y "1 de outubro de 2026" en el T&C de al lado.
  if (campo.tipo === 'fecha') return formatearFechaDelPais(valor, flujo.paisElegido());
  if (campo.tipo === 'hora') return formatearHoraDelPais(valor, flujo.paisElegido());

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
    var paisMoneda = flujo.paisElegido();
    return (paisMoneda ? paisMoneda.moneda_simbolo : '$') + formatearMiles(valor, paisMoneda ? paisMoneda.separador_miles : '.');
  }
  return String(valor);
}

/** Opciones que hay que deshabilitar, con la razón visible. */
function opcionesDeshabilitadas(campo) {
  if (campo.id !== 'desempate') return null;
  var criterio = estado.entrada().criterioGanador;
  if (!criterio) return null;
  var razon = {};
  razon[criterio] = estado.pregunta('desempate').razonDeshabilitado;
  return razon;
}

/**
 * Las opciones de un campo que no las trae escritas, sino que salen de los datos.
 *
 * Son dos: las secciones de la app, que vienen del Sheet, y la categoria del
 * producto, que sale del catalogo de leyendas. Las dos cambian segun el pais, y
 * por eso no pueden estar escritas en el esquema.
 */
function opcionesDeLosDatos(campo) {
  var pais = flujo.paisElegido();

  if (campo.id === 'secciones') {
    var nombres = (E.configuracion.secciones && pais) ? (E.configuracion.secciones[pais.codigo] || []) : [];
    return nombres.map(function (nombre) { return { valor: nombre, etiqueta: nombre, nota: 'Sección de la app.' }; });
  }

  if (campo.id === 'acuerdoDatos') {
    // La nota de "Sí, ya está firmado" nombra la tabla de acuerdos marco, que
    // existe solo en Colombia. En los demás países esa frase no querría decir
    // nada, así que la opción va sin nota.
    var pregunta = estado.pregunta('acuerdoDatos');
    return pregunta.opciones.map(function (opcion) {
      if (opcion.valor !== 'firmado') return opcion;
      var esColombia = pais && pais.codigo === 'CO';
      return {
        valor: opcion.valor,
        etiqueta: opcion.etiqueta,
        nota: esColombia ? pregunta.notaFirmadoCO : opcion.nota,
      };
    });
  }

  if (campo.id === 'categoriaProducto') {
    // "Ninguna" va primero y viene marcada: es la respuesta de casi todas las
    // campanas, y la pregunta se muestra igual para que alguien la confirme.
    var opciones = [{
      valor: 'ninguna',
      etiqueta: estado.T('Ninguna de estas'),
      nota: estado.T('El producto no necesita advertencia por ley.'),
    }];
    var delPais = pais ? categoriasDeProducto(pais.codigo) : [];
    for (var i = 0; i < delPais.length; i++) {
      opciones.push({
        valor: delPais[i].valor,
        etiqueta: RM.util.conMayusculaInicial(delPais[i].etiqueta),
        nota: delPais[i].adelanto,
      });
    }
    return opciones;
  }

  return null;
}

/**
 * El aviso de que este pais esta en pruebas y con que datos.
 *
 * Un pais en piloto tiene valores legales que puso la herramienta por analogia
 * con Colombia, no aprobados por nadie. Quien esta probando tiene que saberlo
 * antes de leer el documento y darlo por bueno.
 */
function avisoDePaisEnPruebas() {
  var pais = flujo.paisElegido();
  if (!paisEnPruebas(pais)) return null;

  // Compacto, porque acompana las quince preguntas del formulario. El detalle
  // de que hay que revisar va en el resumen, que es donde se decide publicar.
  return crear('div', { clase: 'aviso' }, [
    crear('p', {
      texto: pais.nombre + estado.T(' está en pruebas: genera y revisa, pero todavía no publiques. Los datos legales de este país los propuso la herramienta y no los ha confirmado nadie.'),
    }),
  ]);
}

/**
 * El panel de como se firma el acuerdo de transferencia de datos.
 *
 * Sale al responder "No, o no se" a la pregunta del acuerdo. No es un regano:
 * el T&C se genera igual, porque los datos del ganador salen despues del
 * concurso. Lo que hace es decirle al comercial que tiene que arrancar ese
 * tramite ya, para que no le llegue el dia de la entrega sin poder entregar.
 *
 * Colombia tiene su propio circuito, con la tabla de acuerdos marco y la Orden
 * de Transferencia por campana. Los demas paises tienen el modelo de su Legal, y
 * dos no tienen ninguno. Ver decision 36 (i) de la respuesta del encargo 01.
 */
function panelDeAcuerdoDeDatos() {
  if (estado.entrada().acuerdoDatos !== 'no_o_no_se') return null;

  var pais = flujo.paisElegido();
  var panel = estado.pregunta('acuerdoDatos').panel;
  if (!panel) return null;

  var caja = crear('div', { clase: 'aviso' });

  if (pais && pais.codigo === 'CO') {
    caja.appendChild(crear('h3', { texto: panel.tituloCO }));
    caja.appendChild(crear('p', { texto: panel.primeroCO }));
    var lista = crear('ol');
    for (var i = 0; i < panel.pasosCO.length; i++) {
      lista.appendChild(crear('li', { texto: panel.pasosCO[i] }));
    }
    caja.appendChild(lista);
    return caja;
  }

  var nombre = pais ? pais.nombre : '';
  var tieneModelo = !!(pais && pais.url_acuerdo_datos);
  caja.appendChild(crear('p', {
    texto: (tieneModelo ? panel.conModelo : panel.sinModelo).replace('{país}', nombre),
  }));
  if (tieneModelo) {
    caja.appendChild(crear('div', { clase: 'fila-botones' }, [
      crear('a', {
        clase: 'boton boton-secundario', href: pais.url_acuerdo_datos,
        target: '_blank', rel: 'noopener',
      }, [
        document.createTextNode(estado.T('Abrir el modelo de acuerdo')), RM.util.icono('abrir', 16),
      ]),
    ]));
  }
  return caja;
}

/** Aviso contextual de un campo, si aplica. */
function avisoDe(campo) {
  // El panel del acuerdo cuelga de la misma pregunta, debajo de las opciones.
  if (campo.id === 'acuerdoDatos') return panelDeAcuerdoDeDatos();
  if (campo.id !== 'fechaInicio') return null;
  var inicio = estado.entrada().fechaInicio;
  if (!inicio) return null;
  var hoy = E.configuracion.hoy || RM.util.hoyEnElNavegador();
  var dias = RM.util.diasEntre(hoy, inicio);
  if (dias < 0 || dias > 1) return null;
  return estado.pregunta('fechaInicio').aviso;
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

/**
 * Barra de progreso.
 *
 * En escritorio va el nombre de cada paso. En celular no caben siete nombres
 * sin encaramarse uno sobre otro, así que se muestra "Paso 2 de 7" con el
 * nombre del actual y una línea que avanza. La hoja de estilos decide cuál de
 * los dos se ve.
 */
function barraDeProgreso(pasos) {
  var compacta = crear('p', { clase: 'progreso-compacto' }, [
    crear('span', { clase: 'progreso-cuenta', texto: estado.T('Paso {n} de {m}').replace('{n}', E.pasoActual + 1).replace('{m}', pasos.length) }),
    document.createTextNode(' \u00B7 '),
    crear('strong', { texto: estado.T(pasos[E.pasoActual].nombre) }),
    crear('span', {
      clase: 'progreso-linea',
      role: 'progressbar',
      'aria-valuenow': String(E.pasoActual + 1),
      'aria-valuemin': '1',
      'aria-valuemax': String(pasos.length),
      style: '--avance: ' + Math.round(((E.pasoActual + 1) / pasos.length) * 100) + '%',
    }),
  ]);

  var lista = crear('ol', { clase: 'progreso' });
  for (var i = 0; i < pasos.length; i++) {
    (function (paso, indice) {
      var clase = indice < E.pasoActual ? 'hecho' : (indice === E.pasoActual ? 'actual' : '');
      lista.appendChild(crear('li', { clase: clase }, [
        crear('button', {
          type: 'button', texto: estado.T(paso.nombre),
          disabled: indice > E.pasoActual,
          'aria-current': indice === E.pasoActual ? 'step' : null,
          onclick: function () { E.pasoActual = indice; E.campoAbierto = null; RM.app.dibujar(); },
        }),
      ]));
    })(pasos[i], i);
  }
  return crear('div', {}, [compacta, lista]);
}

/** La columna del documento. */
function columnaDocumento() {
  return crear('div', { clase: 'columna-documento' }, [
    crear('div', { clase: 'documento-encabezado' }, [
      crear('h2', { texto: estado.T('Tu T&C') }),
      crear('span', { clase: 'cuenta', id: 'cuenta-huecos' }),
    ]),
    crear('div', { clase: 'hoja', 'data-hoja': '1', tabindex: '0', role: 'region', 'aria-label': estado.T('Vista previa del documento') }),
  ]);
}

/**
 * Las tres preguntas con que arranca todo, antes de saber el tipo de campana.
 *
 * Vive en una sola funcion a proposito. Estuvo escrita dos veces, con y sin la
 * pregunta del negocio, y las dos listas se usaban para lo mismo: dibujar la
 * pantalla y decidir a donde ir al pulsar Siguiente. Con listas distintas el
 * indice de la pregunta abierta apuntaba a otra pregunta y el asistente se
 * saltaba la del negocio.
 */
function camposDeArranque() {
  return [
    { id: 'pais', tipo: 'lista', paso: 'campana', etiqueta: 'País' },
    { id: 'negocio', tipo: 'lista', paso: 'campana', etiqueta: 'Negocio', opciones: preguntaDe('negocio').opciones },
    { id: 'tipo', tipo: 'tarjetas', paso: 'campana', etiqueta: 'Tipo' },
  ];
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
  if (campos.length === 0 && !entrada.tipo) campos = camposDeArranque();

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
  columna.appendChild(crear('h1', { texto: estado.T(pasoActual.titulo || pasoActual.nombre) }));

  // El aviso del pais en pruebas acompana todo el formulario: al elegir el pais
  // el asistente avanza solo, asi que colgarlo de esa pregunta era no mostrarlo.
  var enPruebas = avisoDePaisEnPruebas();
  if (enPruebas) columna.appendChild(enPruebas);

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
    var opcionesEspeciales = opcionesDeLosDatos(campoAbierto);
    var bloque = RM.campos.dibujarPregunta(campoAbierto, {
      pais: flujo.paisElegido(),
      error: E.errores[campoAbierto.id] ? errores[campoAbierto.id] : null,
      confirmacion: confirmacionDe(campoAbierto),
      deshabilitadas: opcionesDeshabilitadas(campoAbierto),
      opciones: opcionesEspeciales,
      aviso: avisoDe(campoAbierto),
      alCambiar: function (campoId, valor) { return alResponder(campoId, valor, campos, indiceAbierto); },
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
      texto: faltan === 1
        ? estado.T('Queda 1 pregunta en este paso.')
        : estado.T('Quedan {n} preguntas en este paso.').replace('{n}', faltan),
    }));
  }

  columna.appendChild(crear('div', { clase: 'fila-botones' }, [
    E.pasoActual > 0 || indiceAbierto > 0
      ? crear('button', {
          clase: 'boton boton-secundario', type: 'button', texto: estado.T('Atrás'),
          onclick: function () { retroceder(campos, indiceAbierto, pasos); },
        })
      : null,
    crear('button', {
      clase: 'boton', type: 'button',
      texto: entrada.tipo && indiceAbierto === campos.length - 1 && E.pasoActual === pasos.length - 1
        ? estado.T('Revisar y generar') : estado.T('Siguiente'),
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
  var pregunta = estado.pregunta(campo.id);
  var bloque = crear('div', { clase: 'pregunta' }, [
    crear('h2', { clase: 'pregunta-titulo', texto: pregunta.pregunta }),
    crear('p', { clase: 'pregunta-ayuda' }, [RM.campos.conGlosario(pregunta.ayuda)]),
  ]);

  var elegido = estado.entrada()[campo.id];
  var grupo = crear('div', { clase: 'opciones', role: 'radiogroup' });

  var opciones;
  if (campo.id === 'pais') {
    opciones = E.configuracion.paises.map(function (p) {
      return { valor: p.codigo, etiqueta: p.nombre, nota: p.estado === 'piloto' ? estado.T('En piloto: solo para el equipo de pruebas.') : estado.T('Disponible.') };
    });
  } else {
    // Solo los tipos del negocio elegido: Rappi y Rappi Travel son dos empresas
    // distintas y mezclar sus tipos en la misma lista confunde.
    var pais = flujo.paisElegido();
    var negocio = estado.entrada().negocio || 'rappi';
    opciones = tiposDelPais(pais || { modelos: [] }, E.configuracion.tipos)
      .filter(function (t) { return (t.esDeTravel ? 'travel' : 'rappi') === negocio; })
      .map(function (t) { return { valor: t.id, etiqueta: t.nombre, nota: estado.T(t.descripcion) }; });
  }

  for (var i = 0; i < opciones.length; i++) {
    (function (opcion) {
      grupo.appendChild(crear('button', {
        clase: 'opcion' + (elegido === opcion.valor ? ' elegida' : ''),
        type: 'button', role: 'radio', 'aria-checked': String(elegido === opcion.valor),
        onclick: function () {
          if (alResponder(campo.id, opcion.valor, campos, indice)) return;
          E.campoAbierto = null;
          seguirDespuesDeUnaTarjeta();
        },
      }, [
        crear('span', { clase: 'opcion-titulo', texto: opcion.etiqueta }),
        crear('span', { clase: 'opcion-nota', texto: opcion.nota }),
      ]));
    })(opciones[i]);
  }

  bloque.appendChild(grupo);

  // Junto a los tipos, pero separado de ellos: hay campanas para las que Legal
  // ya publico los T&C y no hay que generar nada. Es donde el comercial busca
  // su campana, asi que es donde tiene que enterarse.
  if (campo.id === 'tipo') {
    var atajo = RM.tycGenericos.tarjetaDeAtajo();
    if (atajo) bloque.appendChild(atajo);
  }

  bloque.appendChild(crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: estado.T('¿Por qué te preguntamos esto?') }),
    crear('p', { texto: pregunta.porQue }),
  ]));
  return bloque;
}

/** "¿Cuántas veces puede recibir el beneficio una persona?" */
function preguntaDeVeces(campos, indice, pasos, errores) {
  var pregunta = estado.pregunta('maxPedidos');
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
      crear('p', { clase: 'pregunta-ayuda', texto: estado.T('¿Cuántas veces?') }),
      crear('div', { clase: 'campo-caja' }, [cuantas]),
    ]));
  }

  if (E.errores.maxPedidos && errores.maxPedidos) {
    bloque.appendChild(crear('p', { clase: 'mensaje-error', role: 'alert', texto: errores.maxPedidos }));
  }

  var frase = RM.campos.asiQueda('maxPedidos', flujo.paisElegido());
  if (frase) bloque.appendChild(frase);

  bloque.appendChild(crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: estado.T('¿Por qué te preguntamos esto?') }),
    crear('p', { texto: pregunta.porQue }),
  ]));
  return bloque;
}

// --- Navegación --------------------------------------------------------------

/**
 * Guarda una respuesta.
 *
 * Devuelve true cuando la respuesta ya cambio de pantalla. Quien llama tiene
 * que respetarlo y no avanzar encima: avanzar despues de navegar mandaba al
 * resumen con el formulario vacio.
 */
/**
 * Que hacer despues de elegir el pais, el negocio o el tipo.
 *
 * Si el paso todavia tiene preguntas sin responder, se abre la siguiente. Si no
 * queda ninguna, se pasa al paso siguiente: en Rappi Travel el paso de la
 * campana se acaba con el tipo, y quedarse quieto dejaba al comercial mirando
 * la pregunta que acababa de contestar.
 */
/** true si el pais elegido ofrece algun tipo de Rappi Travel. */
function hayTravelEnElPais() {
  var pais = flujo.paisElegido();
  if (!pais) return false;
  var disponibles = tiposDelPais(pais, E.configuracion.tipos);
  for (var i = 0; i < disponibles.length; i++) {
    if (disponibles[i].esDeTravel) return true;
  }
  return false;
}

/**
 * Por que este pais no puede hacer Travel hoy, o cadena vacia si si puede.
 *
 * Son dos cosas distintas y el comercial merece saber cual: que el pais no
 * tenga habilitados los tipos de Travel, o que los tenga pero le falte un dato
 * legal (el RNT, la razon social de la agencia). Lo segundo se arregla llenando
 * el Sheet, asi que el mensaje lo dice con nombre propio en vez de mandarlo a
 * redactar el documento a mano.
 */
function razonParaNoHacerTravel() {
  var pais = flujo.paisElegido();
  if (!hayTravelEnElPais()) {
    return 'Rappi Travel todavía no está habilitado en ' + ((pais || {}).nombre || 'tu país') +
      '. Las campañas de viajes de ese país las redacta Legal a mano.';
  }
  var revision = travelDisponible(pais, E.configuracion.hoy || RM.util.hoyEnElNavegador());
  return revision.disponible ? '' : revision.motivo;
}

function seguirDespuesDeUnaTarjeta() {
  var ahora = situacionActual();
  for (var i = 0; i < ahora.campos.length; i++) {
    if (!flujo.tieneRespuesta(ahora.campos[i].id)) {
      RM.app.dibujar();
      return;
    }
  }
  if (ahora.campos.length > 0 && E.pasoActual < ahora.pasos.length - 1) E.pasoActual += 1;
  RM.app.dibujar();
}

function alResponder(campoId, valor, campos, indice) {
  estado.fijar(campoId, valor);
  E.errores[campoId] = true;
  E.respondidas[campoId] = true;

  // Al elegir el día de inicio se propone el mismo día de fin: tres de cada
  // cuatro campañas de cashback duran un solo día. Y si el tipo no pregunta la
  // fecha de fin (el ETA es de un solo día), el fin ES el inicio y se mantiene
  // igual siempre: antes se fijaba una sola vez, y al cambiar el día de inicio
  // quedaba una fecha de fin vieja que ninguna pregunta dejaba corregir.
  if (campoId === 'fechaInicio') {
    var preguntaElFin = tieneCampo(esquemaDe(estado.entrada().tipo), 'fechaFin');
    if (!estado.entrada().fechaFin || !preguntaElFin) estado.fijar('fechaFin', valor);
  }
  if (campoId === 'pais') estado.fijar('tipo', null);

  // Cambiar de negocio invalida el tipo elegido: los tipos de Rappi no son los
  // de Rappi Travel.
  if (campoId === 'negocio') {
    estado.fijar('tipo', null);
    E.respondidas.tipo = false;

    // Rappi Travel solo existe donde el pais lo tiene habilitado. En los demas
    // sigue siendo un caso de Legal, y hay que decirlo aqui: mandarlo al
    // formulario de Travel seria ofrecerle algo que no se le puede dar.
    if (valor === 'travel') {
      var porQueNo = razonParaNoHacerTravel();
      if (porQueNo) {
        E.motivoDeLegal = porQueNo;
        RM.app.ir('legal');
        return true;
      }
    }

    // Rappi Travel tiene su propio filtro de nueve preguntas. Va aqui, apenas
    // se sabe que la campana es de viajes, para no hacerle llenar media
    // campana a alguien que va a terminar en Legal.
    if (valor === 'travel' && !E.filtroDeTravelRespondido) {
      flujo.refrescarDocumento();
      RM.app.ir('filtroTravel');
      return true;
    }

    E.campoAbierto = 'tipo';
    flujo.refrescarDocumento();
    RM.app.dibujar();
    return true;
  }
  if (campoId === 'criterioGanador' && estado.entrada().desempate === valor) estado.fijar('desempate', null);

  flujo.refrescarDocumento();
  actualizarValidacionEnVivo(campoId);
  return false;
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
  if (campos.length === 0 && !entrada.tipo) campos = camposDeArranque();
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
  avanzar: avanzar,
  comoTexto: comoTexto,
  columnaDocumento: columnaDocumento,
  calculadora: calculadora,
  avisoDePaisEnPruebas: avisoDePaisEnPruebas,
};
