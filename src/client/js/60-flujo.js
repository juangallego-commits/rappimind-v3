'use strict';

/**
 * El flujo de generacion: inicio, filtro de entrada, los pasos, el resumen y la
 * pantalla final.
 *
 * Dentro de cada paso va UNA pregunta a la vez. Las ya respondidas quedan
 * arriba en una linea, con boton para cambiarlas. Se avanza solo cuando la
 * respuesta es inequivoca (elegir una opcion); si hay que escribir algo, el
 * comercial confirma con Siguiente.
 */

var RM = window.RM;
var crear = RM.util.crear;
var vaciar = RM.util.vaciar;
var estado = RM.estado;
var E = estado.estado;

/** Los pasos que tienen alguna pregunta visible para el tipo elegido. */
function pasosDelTipo(entrada) {
  if (!entrada.tipo) return [];
  var visibles = camposVisibles(entrada.tipo, entrada);
  var conPreguntas = {};
  for (var i = 0; i < visibles.length; i++) {
    var pregunta = preguntaDe(visibles[i].id);
    if (pregunta && pregunta.pregunta) conPreguntas[visibles[i].paso] = true;
  }
  // El paso de confirmación no entra al formulario: la casilla de declaración
  // va en el resumen, que es donde el comercial ve todo junto antes de generar.
  return PASOS.filter(function (paso) {
    return conPreguntas[paso.id] && paso.id !== 'confirmacion';
  });
}

function camposDelPaso(entrada, pasoId) {
  var visibles = camposVisibles(entrada.tipo, entrada);
  var campos = [];
  for (var i = 0; i < visibles.length; i++) {
    if (visibles[i].paso !== pasoId) continue;
    var pregunta = preguntaDe(visibles[i].id);
    if (pregunta && pregunta.pregunta) campos.push(visibles[i]);
  }
  return campos;
}

/**
 * Cuantas preguntas quedan en este paso, contando las que van a aparecer.
 *
 * El contador miraba solo lo visible ahora mismo, asi que en el paso de los
 * Creditos decia "Queda 1 pregunta en este paso" y despues salian dos: al
 * responder "hasta cuando puede usar los Creditos" aparece la fecha o el numero
 * de dias, segun lo que conteste. Juan lo cerro el 20 de septiembre de 2026
 * (punto F8).
 *
 * Para cada pregunta que todavia no ha respondido y que tiene opciones, se mira
 * cuantas preguntas nuevas de este mismo paso abre cada respuesta posible y se
 * suma la MENOR. Con la vigencia las dos respuestas abren una, asi que suma una
 * pase lo que pase; con una pregunta donde solo una respuesta abre otra, suma
 * cero y el contador se queda corto, que es preferible a prometer de menos.
 */
function faltanEnElPaso(campos, indiceAbierto, pasoId) {
  var entrada = estado.entrada();
  var faltan = campos.length - indiceAbierto - 1;
  var yaContados = {};
  for (var c = 0; c < campos.length; c++) yaContados[campos[c].id] = true;

  for (var i = indiceAbierto; i < campos.length; i++) {
    var campo = campos[i];
    var pregunta = estado.pregunta(campo.id);
    var opciones = (pregunta && pregunta.opciones) || campo.opciones;
    if (!opciones || opciones.length === 0) continue;
    if (i !== indiceAbierto && tieneRespuesta(campo.id)) continue;

    var minimo = null;
    for (var o = 0; o < opciones.length; o++) {
      var abre = cuantasAbre(entrada, campo.id, opciones[o].valor, pasoId, yaContados);
      minimo = minimo === null ? abre : Math.min(minimo, abre);
    }
    if (minimo) faltan += minimo;
  }
  return faltan;
}

/** Las preguntas nuevas de este paso que aparecerian con esa respuesta. */
function cuantasAbre(entrada, campoId, valor, pasoId, yaContados) {
  var supuesto = {};
  for (var llave in entrada) {
    if (Object.prototype.hasOwnProperty.call(entrada, llave)) supuesto[llave] = entrada[llave];
  }
  supuesto[campoId] = valor;

  var visibles = camposVisibles(supuesto.tipo, supuesto);
  var nuevas = 0;
  for (var i = 0; i < visibles.length; i++) {
    if (visibles[i].paso !== pasoId) continue;
    if (yaContados[visibles[i].id]) continue;
    var pregunta = preguntaDe(visibles[i].id);
    if (pregunta && pregunta.pregunta) nuevas += 1;
  }
  return nuevas;
}

function tieneRespuesta(campoId) {
  // Un valor por defecto no basta: la pregunta se muestra igual, preseleccionada.
  if (!E.respondidas[campoId]) return false;

  var valor = estado.entrada()[campoId];
  if (campoId === 'maxPedidos') return opcionDeVeces() !== null && (opcionDeVeces() !== 'varias' || valor > 1);
  if (valor === null || valor === undefined || valor === '') return false;
  if (Object.prototype.toString.call(valor) === '[object Array]') return valor.length > 0;
  if (valor === false) return false;
  return true;
}

/** "¿Cuántas veces puede ganar?" reúne maxPedidos y sinLimite en una pregunta. */
function opcionDeVeces() {
  var entrada = estado.entrada();
  if (entrada.sinLimite) return 'sin_limite';
  if (entrada.maxPedidos === 1) return 'una';
  if (entrada.maxPedidos > 1) return 'varias';
  if (entrada.__veces) return entrada.__veces;
  return null;
}

function fijarVeces(valor) {
  E.respondidas.maxPedidos = true;
  if (valor === 'una') estado.fijarVarios({ __veces: 'una', maxPedidos: 1, sinLimite: false });
  else if (valor === 'sin_limite') estado.fijarVarios({ __veces: 'sin_limite', maxPedidos: null, sinLimite: true });
  else estado.fijarVarios({ __veces: 'varias', maxPedidos: null, sinLimite: false });
}

/** Errores de la solicitud, indexados por campo. */
function erroresPorCampo() {
  var pais = paisElegido();
  if (!pais || !estado.entrada().tipo) return {};

  var revision = validarSolicitud(estado.entradaLimpia(), pais, {
    fechaReferencia: E.configuracion.hoy || RM.util.hoyEnElNavegador(),
    usuarioEnEquipo: puedeVerPiloto(E.configuracion.rol),
    // Los mensajes salen en el idioma de la interfaz; el documento no cambia.
    idioma: estado.idiomaInterfaz(),
  });

  var porCampo = {};
  for (var i = 0; i < revision.errores.length; i++) {
    var error = revision.errores[i];
    if (!porCampo[error.campo]) porCampo[error.campo] = error.mensaje;
  }
  return porCampo;
}

function paisElegido() {
  return paisPorCodigo(E.configuracion.paises, estado.entrada().pais);
}

function modeloDelTipo() {
  var esquema = esquemaDe(estado.entrada().tipo);
  return esquema ? esquema.modelo : null;
}

// --- Vista previa ------------------------------------------------------------

function refrescarDocumento() {
  var contenedores = document.querySelectorAll('[data-hoja]');
  if (contenedores.length === 0) return;

  var pais = paisElegido();
  var modelo = modeloDelTipo();

  // Todavía sin tipo de campaña: la hoja explica qué va a pasar ahí.
  if (!pais || !modelo) {
    for (var v = 0; v < contenedores.length; v++) RM.documento.dibujar(contenedores[v], '', '');
    var sinTipo = RM.util.porId('cuenta-huecos');
    if (sinTipo) sinTipo.textContent = estado.T('Sin empezar');
    E.ultimoTextoVistaPrevia = '';
    return;
  }

  var resultado = renderizarVistaPrevia(modelo, estado.entradaLimpia(), pais, MODELOS);

  for (var i = 0; i < contenedores.length; i++) {
    var cambiada = RM.documento.dibujar(contenedores[i], resultado.texto, E.ultimoTextoVistaPrevia);
    RM.documento.desplazarHasta(contenedores[i], cambiada);
  }

  var cuenta = RM.util.porId('cuenta-huecos');
  if (cuenta) {
    cuenta.textContent = resultado.huecos.length === 0
      ? estado.T('Completo')
      : (resultado.huecos.length === 1
        ? estado.T('Falta 1 dato')
        : estado.T('Faltan {n} datos').replace('{n}', resultado.huecos.length));
  }
  E.ultimoTextoVistaPrevia = resultado.texto;
}

// --- Pantalla de inicio ------------------------------------------------------

/**
 * Lo que la pantalla de inicio promete del ultimo paso. Donde RappiMind publica
 * sola, prometer "los pasos para publicarlo" es prometer un trabajo que ya no
 * existe.
 */
function detalleDePublicar() {
  var web = E.configuracion && E.configuracion.publicacionWeb;
  if (web && web.activa && web.paises && web.paises.length > 0) {
    return estado.T('Donde RappiMind publica sola, queda publicado en el momento en que lo generas. En los demás países te llega por correo con los pasos para publicarlo.');
  }
  return estado.T('Te llega por correo en un par de minutos, con los pasos para publicarlo o a quién pasárselo.');
}

function pantallaInicio(raiz) {
  var pasos = [
    {
      titulo: estado.T('Cuéntanos de tu campaña'),
      detalle: estado.T('Te hacemos preguntas simples, una por una. Ninguna te pide escribir texto legal.'),
    },
    {
      titulo: estado.T('Revisa cómo va quedando'),
      detalle: estado.T('El documento se va escribiendo mientras respondes. Lo que ves es lo que sale.'),
    },
    {
      titulo: estado.T('Publica los T&C'),
      detalle: detalleDePublicar(),
    },
  ];

  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: estado.T('Genera los Términos y Condiciones de tu campaña') }),
    crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Sin escribirle a Legal y sin redactar una sola cláusula. Toma menos de cinco minutos.') }),
  ]);

  var lista = crear('ol', { clase: 'pasos-publicar' });
  for (var i = 0; i < pasos.length; i++) {
    lista.appendChild(crear('li', {}, [
      crear('h3', { texto: pasos[i].titulo }),
      crear('p', { clase: 'pregunta-ayuda', texto: pasos[i].detalle }),
    ]));
  }
  contenido.appendChild(lista);

  var acciones = crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton', type: 'button', texto: estado.T('Empezar'),
      onclick: function () {
        // Empezar es empezar de cero. Para retomar lo de antes está el otro botón.
        estado.reiniciarFormulario(RM.app.valoresIniciales(), {});
        RM.app.ir('filtro');
      },
    }),
  ]);

  var borrador = estado.leerBorrador();
  if (borrador) {
    acciones.appendChild(crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: estado.T('Seguir con lo que dejaste a medias'),
      onclick: function () {
        estado.reiniciarFormulario(borrador.entrada, borrador.respondidas || {});
        E.pasoActual = borrador.pasoActual || 0;
        E.filtroRespondido = true;
        RM.app.ir('pasos');
      },
    }));
  }
  contenido.appendChild(acciones);

  if (!estado.almacenamientoDisponible()) {
    contenido.appendChild(crear('div', { clase: 'aviso' }, [
      crear('p', { texto: estado.T('Tu navegador no deja guardar borradores, así que no cierres esta pestaña hasta generar el documento.') }),
    ]));
  }

  raiz.appendChild(contenido);
}

// --- Filtro de entrada -------------------------------------------------------

function pantallaFiltro(raiz) {
  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: estado.T('¿Esta campaña la puedo hacer aquí?') }),
    crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Dos preguntas rápidas. Si alguna es sí, tu campaña necesita que Legal la redacte a mano.') }),
  ]);

  // Primero el tipo, porque el filtro depende de él.
  var preguntas = [
    { id: 'azar', texto: '¿Hay azar: sorteo, rifa, raspa y gana o ruleta?', razon: 'Las dinámicas con azar necesitan permiso previo de la autoridad. Legal tiene que revisarlas antes de lanzarlas.' },
    { id: 'tycPropios', texto: '¿La tienda o la marca exige sus propios T&C?', razon: 'Si el aliado impone su documento, hay que revisarlo con Legal antes de publicarlo.' },
  ];

  var respuestas = {};
  var lista = crear('div', {});

  function revisar() {
    for (var i = 0; i < preguntas.length; i++) {
      if (respuestas[preguntas[i].id] === true) {
        E.motivoDeLegal = estado.T(preguntas[i].razon);
        E.volverDeLegal = 'filtro';
        RM.app.ir('legal');
        return;
      }
    }
    var todas = preguntas.every(function (p) { return respuestas[p.id] === false; });
    if (todas) {
      E.filtroRespondido = true;
      RM.app.ir('pasos');
    }
  }

  for (var i = 0; i < preguntas.length; i++) {
    (function (pregunta) {
      var bloque = crear('div', { clase: 'pregunta' }, [
        crear('h2', { clase: 'pregunta-titulo', texto: estado.T(pregunta.texto) }),
        // La ayuda es lo que deja acortar el enunciado: los ejemplos que antes
        // iban dentro de la pregunta ahora van debajo (puntos F6 y F8).
        pregunta.ayuda ? crear('p', { clase: 'pregunta-ayuda', texto: estado.T(pregunta.ayuda) }) : null,
      ]);
      var grupo = crear('div', { clase: 'opciones', role: 'radiogroup', 'aria-label': estado.T(pregunta.texto) });
      [['no', 'No', false], ['si', 'Sí', true]].forEach(function (par) {
        grupo.appendChild(crear('button', {
          clase: 'opcion', type: 'button', texto: estado.T(par[1]),
          role: 'radio', 'aria-checked': 'false', 'aria-pressed': 'false',
          onclick: function () {
            respuestas[pregunta.id] = par[2];
            var hermanos = grupo.querySelectorAll('.opcion');
            for (var k = 0; k < hermanos.length; k++) {
              hermanos[k].setAttribute('aria-checked', 'false');
              hermanos[k].setAttribute('aria-pressed', 'false');
            }
            this.setAttribute('aria-checked', 'true');
            this.setAttribute('aria-pressed', 'true');
            revisar();
          },
        }));
      });
      bloque.appendChild(grupo);
      lista.appendChild(bloque);
    })(preguntas[i]);
  }

  contenido.appendChild(lista);
  raiz.appendChild(contenido);
}

/**
 * El filtro de Rappi Travel.
 *
 * Se muestra despues de elegir uno de los dos tipos de Travel, no antes: las
 * diez preguntas solo tienen sentido sabiendo que la campana es de viajes.
 * Reemplaza, para Travel, las preguntas generales de fondeo y de T&C propios.
 */
function pantallaFiltroTravel(raiz) {
  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: 'Antes de seguir con tu campaña de Rappi Travel' }),
    crear('p', {
      clase: 'pregunta-ayuda',
      // El número sale de la lista, no escrito a mano. Decía "Diez preguntas
      // rápidas" cuando ya eran nueve: dos sesiones tocaron el filtro el mismo
      // día, una partió una pregunta y la otra quitó otra, y el copy se quedó
      // contando la versión de nadie.
      texto: RM.util.conMayusculaInicial(numeroEnLetras(FILTRO_DE_TRAVEL.length, true)) + ' preguntas rápidas. Si alguna es sí, ' +
        'tu campaña necesita que Legal la redacte a mano. No es un castigo: es un caso que un abogado tiene que mirar.',
    }),
  ]);

  var respuestas = {};
  var lista = crear('div', {});

  function revisar() {
    for (var i = 0; i < FILTRO_DE_TRAVEL.length; i++) {
      if (respuestas[FILTRO_DE_TRAVEL[i].id] === true) {
        E.motivoDeLegal = estado.T(FILTRO_DE_TRAVEL[i].razon);
        E.volverDeLegal = 'filtroTravel';
        RM.app.ir('legal');
        return;
      }
    }
    var todas = FILTRO_DE_TRAVEL.every(function (pregunta) { return respuestas[pregunta.id] === false; });
    if (todas) {
      E.filtroDeTravelRespondido = true;
      // El tipo ya quedo respondido antes del filtro, asi que al volver hay que
      // seguir en la pregunta siguiente. Sin esto, el asistente reabre la del
      // tipo y parece que no hubiera pasado nada.
      // El filtro va justo despues de elegir Rappi Travel, asi que al volver la
      // pregunta que toca es la del tipo.
      E.campoAbierto = 'tipo';
      RM.app.ir('pasos');
    }
  }

  for (var i = 0; i < FILTRO_DE_TRAVEL.length; i++) {
    (function (pregunta) {
      var bloque = crear('div', { clase: 'pregunta' }, [
        crear('h2', { clase: 'pregunta-titulo', texto: estado.T(pregunta.texto) }),
        // La ayuda es lo que deja acortar el enunciado: los ejemplos que antes
        // iban dentro de la pregunta ahora van debajo (puntos F6 y F8).
        pregunta.ayuda ? crear('p', { clase: 'pregunta-ayuda', texto: estado.T(pregunta.ayuda) }) : null,
      ]);
      var grupo = crear('div', { clase: 'opciones', role: 'radiogroup', 'aria-label': estado.T(pregunta.texto) });
      [['No', false], ['Sí', true]].forEach(function (par) {
        grupo.appendChild(crear('button', {
          clase: 'opcion', type: 'button', texto: estado.T(par[0]),
          role: 'radio', 'aria-checked': 'false', 'aria-pressed': 'false',
          onclick: function () {
            respuestas[pregunta.id] = par[1];
            var hermanos = grupo.querySelectorAll('.opcion');
            for (var k = 0; k < hermanos.length; k++) {
              hermanos[k].setAttribute('aria-checked', 'false');
              hermanos[k].setAttribute('aria-pressed', 'false');
            }
            this.setAttribute('aria-checked', 'true');
            this.setAttribute('aria-pressed', 'true');
            revisar();
          },
        }));
      });
      bloque.appendChild(grupo);
      lista.appendChild(bloque);
    })(FILTRO_DE_TRAVEL[i]);
  }

  contenido.appendChild(lista);
  contenido.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: 'Esta campaña no es de Travel',
      onclick: function () {
        estado.fijar('negocio', 'rappi');
        estado.fijar('tipo', null);
        E.filtroDeTravelRespondido = false;
        E.campoAbierto = 'tipo';
        RM.app.ir('pasos');
      },
    }),
  ]));
  raiz.appendChild(contenido);
}

/**
 * Los países donde el formulario de Legal configurado hoy sí sirve.
 *
 * Es el mismo formulario para los dos. Para el resto todavía no hay canal
 * confirmado por país: mientras Legal lo confirma, esta pantalla les dice que
 * escriban por sus canales de siempre en vez de mandarlos a un formulario que
 * no es el suyo. Juan lo pidió el 22 de septiembre de 2026.
 */
var PAISES_DEL_FORMULARIO_DE_LEGAL = ['CO', 'CR'];

function pantallaLegal(raiz) {
  var url = E.configuracion.urlFormularioLegal;

  /*
   * El país solo cuenta si de verdad se respondió esa pregunta: antes de eso
   * "pais" trae a Colombia de valor por defecto, preseleccionada pero no
   * respondida, y asumir Colombia ahí mandaría a cualquier otro país al
   * formulario que no es el suyo. Esto pasa siempre que el "sí" viene del
   * filtro general, que corre antes de preguntar el país.
   */
  var pais = E.respondidas.pais ? paisElegido() : null;
  var esDelFormulario = pais && PAISES_DEL_FORMULARIO_DE_LEGAL.indexOf(pais.codigo) !== -1;

  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: estado.T('Esta campaña la redacta Legal') }),
    crear('div', { clase: 'aviso' }, [
      crear('p', { texto: E.motivoDeLegal || estado.T('Tu campaña necesita revisión legal antes de publicarse.') }),
    ]),
    crear('p', { texto: estado.T('No es un problema ni una negativa: es un caso que necesita que un abogado lo mire. Llena el formulario y el equipo legal te responde.') }),
  ]);

  if (pais && !esDelFormulario) {
    // Ya sabemos el país, y ese formulario no es el suyo.
    contenido.appendChild(crear('p', {
      texto: estado.T('Esto lo tiene que revisar el equipo legal de {pais}. Escríbeles por los canales que ya usan hoy: este formulario es solo para Colombia y Costa Rica. En cuanto confirmemos el canal para tu país, te lo vamos a mostrar aquí directamente.')
        .replace('{pais}', estado.nombreDePais(pais.nombre)),
    }));
  } else if (!pais) {
    // Todavía no sabemos el país: el filtro general va antes de esa pregunta.
    contenido.appendChild(crear('p', {
      texto: estado.T('Si tu campaña es de Colombia o Costa Rica, usa el formulario de Legal. Si es de otro país, escríbele a tu equipo legal por los canales que ya usan hoy; estamos confirmando el canal para cada país.'),
    }));
  }

  var ofrecerFormulario = pais ? esDelFormulario : true;
  var botones = [];
  if (ofrecerFormulario) {
    botones.push(
      url
        ? crear('a', { clase: 'boton', href: url, target: '_blank', rel: 'noopener' }, [
            document.createTextNode(estado.T(pais ? 'Ir al formulario de Legal' : 'Ir al formulario de Legal (Colombia y Costa Rica)')), RM.util.icono('abrir', 16),
          ])
        : crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Falta configurar el enlace del formulario de Legal. Avísale a Juan.') })
    );
  }
  botones.push(botonDeCambiarMiRespuesta());
  botones.push(crear('button', {
    clase: 'boton boton-secundario', type: 'button', texto: estado.T('Volver al inicio'),
    onclick: function () { RM.app.ir('inicio'); },
  }));

  contenido.appendChild(crear('div', { clase: 'fila-botones' }, botones));
  raiz.appendChild(contenido);
}

/**
 * El boton para volver a la pregunta que mando a Legal.
 *
 * Llegar a Legal por marcar mal una casilla del filtro era un callejon: el
 * unico camino de vuelta era "Volver al inicio", que borra todo lo respondido.
 * Juan lo decidio el 20 de septiembre de 2026 (punto F8).
 *
 * Solo sale cuando sabemos de donde vino. Un boton que no sepa a donde volver
 * es peor que no tenerlo.
 */
function botonDeCambiarMiRespuesta() {
  var desde = E.volverDeLegal;
  if (!desde) return null;
  return crear('button', {
    clase: 'boton boton-secundario', type: 'button', texto: estado.T('Cambiar mi respuesta'),
    onclick: function () {
      if (desde === 'filtro') E.filtroRespondido = false;
      if (desde === 'filtroTravel') E.filtroDeTravelRespondido = false;
      // El filtro de los T&C generales guarda sus respuestas: volver es volver
      // a la misma pantalla, con lo marcado, para cambiar la que estuvo mal.
      if (desde === 'filtroGenerales') { RM.app.ir('filtroGenerales'); return; }
      // "Mi campaña no es ninguna de estas": se vuelve a la lista de tipos,
      // abierta en esa misma pregunta.
      if (desde === 'tipo') {
        E.motivoDeLegal = null;
        E.volverDeLegal = null;
        E.campoAbierto = 'tipo';
        RM.app.ir('pasos');
        return;
      }
      if (desde === 'negocio') {
        estado.fijar('negocio', null);
        E.respondidas.negocio = false;
        E.campoAbierto = 'negocio';
      }
      E.motivoDeLegal = null;
      E.volverDeLegal = null;
      RM.app.ir(desde === 'negocio' ? 'pasos' : desde);
    },
  });
}

RM.flujo = {
  pasosDelTipo: pasosDelTipo,
  camposDelPaso: camposDelPaso,
  tieneRespuesta: tieneRespuesta,
  opcionDeVeces: opcionDeVeces,
  fijarVeces: fijarVeces,
  erroresPorCampo: erroresPorCampo,
  faltanEnElPaso: faltanEnElPaso,
  paisElegido: paisElegido,
  modeloDelTipo: modeloDelTipo,
  refrescarDocumento: refrescarDocumento,
  pantallaInicio: pantallaInicio,
  pantallaFiltro: pantallaFiltro,
  pantallaFiltroTravel: pantallaFiltroTravel,
  pantallaLegal: pantallaLegal,
};
