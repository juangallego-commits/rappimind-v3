'use strict';

/**
 * Los T&C que Legal ya publico.
 *
 * Hay campanas para las que NO hay que generar nada: descuentos, cupones,
 * envio gratis y tarifa de servicio gratis ya tienen T&C publicados por Legal,
 * con su enlace fijo. Son casi la mitad de la demanda real y hasta hoy la
 * herramienta no los cubria: el comercial llegaba, no encontraba su tipo de
 * campana y terminaba escribiendole a Legal para pedir algo que ya existia.
 *
 * Por eso esta pantalla se lee como una buena noticia y no como una negativa:
 * no le estamos quitando nada, le estamos ahorrando el documento entero. Lo
 * unico que se lleva de aqui es el enlace, y tiene que quedar clarisimo que ese
 * enlace es el que va en la pieza.
 *
 * Los datos salen de data/tyc_genericos.json y la logica de src/core/
 * tyc_genericos.js. Aqui no se redacta ni se corrige ningun texto de Legal.
 */

var RM = window.RM;
var crear = RM.util.crear;
var estado = RM.estado;
var E = estado.estado;

/** El pais de la campana, o Colombia si todavia no se eligio ninguno. */
function codigoDelPais() {
  var pais = RM.flujo.paisElegido();
  return pais ? pais.codigo : '';
}

function hoy() {
  return (E.configuracion && E.configuracion.hoy) || RM.util.hoyEnElNavegador();
}

/**
 * La tarjeta que lleva aqui desde la lista de tipos de campana.
 *
 * Va junto a los tipos, porque ahi es donde el comercial busca su campana, pero
 * separada de ellos: los demas generan un documento y este no. Devuelve null
 * cuando no hay nada que ofrecer, que es lo unico peor que no ofrecerlo.
 */
function tarjetaDeAtajo() {
  var codigo = codigoDelPais();
  if (!hayTycGenericos(codigo)) return null;
  // Rappi Travel tiene su propia lista y sus propios T&C: mezclarlos aqui
  // seria ofrecerle al comercial un enlace que no cubre su campana.
  if ((estado.entrada().negocio || 'rappi') === 'travel') return null;

  var caja = crear('div', { clase: 'atajo-tyc' }, [
    crear('p', { clase: 'pregunta-ayuda', texto: '¿No ves tu campaña en la lista?' }),
  ]);

  // La buena noticia solo se da si hay algo que dar. Catorce de los quince
  // vencen el 31 de diciembre de 2026: si nadie actualiza la lista, la tarjeta
  // no puede seguir prometiendo un enlace que ya no rige.
  var quedan = hayTycGenericosUsables(codigo, hoy());
  var grupo = crear('div', { clase: 'opciones' });
  grupo.appendChild(crear('button', {
    clase: 'opcion', type: 'button',
    onclick: function () {
      E.tycGenericoElegido = null;
      RM.app.ir('tycGenericos');
    },
  }, [
    crear('span', { clase: 'opcion-titulo', texto: 'Descuentos, cupones, envío gratis y tarifa de servicio' }),
    crear('span', {
      clase: 'opcion-nota',
      texto: quedan
        ? 'Buena noticia: para estas campañas Legal ya publicó los T&C. No generas ningún documento, te damos el enlace listo para la pieza.'
        : 'Legal tenía T&C publicados para estas campañas, pero ya vencieron y todavía no hay versión nueva. Entra para ver cuáles eran y escríbele a Legal antes de sacar la pieza.',
    }),
  ]));

  caja.appendChild(grupo);
  return caja;
}

// --- La pantalla -------------------------------------------------------------

function pantalla(raiz) {
  var codigo = codigoDelPais();
  var lista = tycGenericosDelPais(codigo);

  if (lista.length === 0) {
    raiz.appendChild(crear('div', { clase: 'pagina pagina-angosta' }, [
      crear('h1', { texto: 'Todavía no hay T&C generales para este país' }),
      crear('p', { texto: 'Los T&C generales publicados son por ahora los de Colombia. Elige un tipo de campaña y la herramienta te arma el documento.' }),
      crear('div', { clase: 'fila-botones' }, [botonVolverALosTipos()]),
    ]));
    return;
  }

  var elegido = E.tycGenericoElegido ? tycGenericoPorId(codigo, E.tycGenericoElegido) : null;
  raiz.appendChild(elegido ? detalle(elegido) : listado(lista, codigo));
}

/** Paso 1: los T&C publicados, con su descripcion y su vigencia. */
function listado(lista, codigo) {
  var quedan = hayTycGenericosUsables(codigo, hoy());
  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, quedan
    ? [
      crear('h1', { texto: 'Para esta campaña no necesitas crear T&C' }),
      crear('p', {
        texto: 'Legal ya dispuso los términos y condiciones de estas campañas y ya están publicados. ' +
          'No tienes que generar ningún documento ni esperar a que alguien lo revise: elige el que ' +
          'corresponde a tu campaña y te damos el enlace que va en la pieza.',
      }),
    ]
    : [
      crear('h1', { texto: 'Los T&C generales vencieron' }),
      crear('p', {
        texto: 'Legal tenía publicados los términos y condiciones de estas campañas, pero ya vencieron y ' +
          'todavía no hay versión nueva. No uses ninguno de estos enlaces: escríbele a Legal para que publique la versión nueva.',
      }),
      E.configuracion.urlFormularioLegal
        ? crear('div', { clase: 'fila-botones' }, [
          crear('a', { clase: 'boton', href: E.configuracion.urlFormularioLegal, target: '_blank', rel: 'noopener' }, [
            document.createTextNode(estado.T('Ir al formulario de Legal')), RM.util.icono('abrir', 16),
          ]),
        ])
        : null,
    ]);

  var grupo = crear('div', { clase: 'opciones' });
  for (var i = 0; i < lista.length; i++) {
    grupo.appendChild(tarjetaDeUno(lista[i]));
  }
  contenido.appendChild(grupo);

  contenido.appendChild(crear('p', {
    clase: 'pregunta-ayuda',
    texto: 'Si tu campaña es un cashback, una carrera de compras o un concurso, no es ninguno de estos: vuelve a los tipos y la herramienta te arma el documento.',
  }));
  contenido.appendChild(crear('div', { clase: 'fila-botones' }, [botonVolverALosTipos()]));
  return contenido;
}

/** La descripcion, salvo cuando el Excel repite el nombre: no se muestra dos veces. */
function descripcionSinRepetir(tyc) {
  var descripcion = descripcionDeTycGenerico(tyc);
  return descripcion === tyc.nombre ? null : descripcion;
}

function tarjetaDeUno(tyc) {
  var revision = estadoDeTycGenerico(tyc, hoy());

  var partes = [crear('span', { clase: 'opcion-titulo', texto: tyc.nombre })];
  if (tyc.beneficio) partes.push(crear('span', { clase: 'opcion-nota', texto: tyc.beneficio }));
  var descripcion = descripcionSinRepetir(tyc);
  if (descripcion) partes.push(crear('span', { clase: 'opcion-nota', texto: descripcion }));
  // Lo que Legal dejo sin resolver se dice ya en la lista, no solo al abrirlo:
  // el mismo T&C aparece dos veces con enlaces distintos, y quien lo ve por
  // primera vez ahi es donde se confunde.
  if (tyc.advertencia) partes.push(crear('span', { clase: 'opcion-nota', texto: tyc.advertencia }));
  partes.push(crear('span', {
    clase: 'opcion-nota' + (revision.usable ? '' : ' opcion-nota-vencido'),
    texto: revision.mensaje ? revision.mensaje : revision.vigencia,
  }));

  // Un T&C vencido o que todavia no arranca se queda a la vista con su razon,
  // no desaparece: si desapareciera, el comercial creeria que la herramienta no
  // lo tiene y volveria a escribirle a Legal. Y no va con disabled: un boton
  // deshabilitado no recibe foco, y quien navega con teclado o con lector de
  // pantalla pasaria de largo sin enterarse de que existe ni de que vencio.
  return crear('button', {
    clase: 'opcion' + (revision.usable ? '' : ' opcion-vencida'), type: 'button',
    'aria-disabled': revision.usable ? null : 'true',
    onclick: function () {
      if (!revision.usable) return;
      E.tycGenericoElegido = tyc.id;
      RM.app.dibujar();
      window.scrollTo(0, 0);
    },
  }, partes);
}

/** Paso 2: el enlace, que es lo unico que el comercial se lleva de aqui. */
function detalle(tyc) {
  var revision = estadoDeTycGenerico(tyc, hoy());

  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: tyc.nombre }),
  ]);

  if (!revision.usable) {
    contenido.appendChild(crear('div', { clase: 'aviso aviso-serio' }, [
      crear('p', { texto: revision.mensaje }),
    ]));
    contenido.appendChild(crear('div', { clase: 'fila-botones' }, [botonVolverALaLista(), botonVolverALosTipos()]));
    return contenido;
  }

  // Lo que Legal dejo sin resolver en su lista se dice ANTES del enlace, no
  // despues: estaba al final, debajo de una caja que ordenaba "copia el enlace
  // y ponlo en la pieza, tal cual", y en una pantalla normal no se veia sin
  // hacer scroll. El comercial copiaba y se iba sin leer "confirma con Legal
  // cuál va". Aqui no se arregla nada del Excel: corregirlo por cuenta propia
  // seria publicar una pieza con un respaldo que nadie aprobo.
  var pendientes = [];
  if (tyc.advertencia) pendientes.push(tyc.advertencia);
  if (!String(tyc.paraQue || '').trim()) pendientes.push(descripcionDeTycGenerico(tyc));
  if (revision.mensaje) pendientes.push(revision.mensaje);

  if (pendientes.length > 0) {
    var avisoPendiente = crear('div', { clase: 'aviso aviso-serio', 'data-pendiente': '1' }, [
      crear('h3', { texto: 'Antes de usar este enlace, confirma con Legal' }),
    ]);
    for (var p = 0; p < pendientes.length; p++) avisoPendiente.appendChild(crear('p', { texto: pendientes[p] }));
    contenido.appendChild(avisoPendiente);
  }

  contenido.appendChild(crear('div', { clase: 'aviso' }, pendientes.length > 0
    ? [
      crear('h3', { texto: 'Este es el enlace que Legal tiene publicado' }),
      crear('p', { texto: 'No generas ningún documento. Cuando Legal te confirme lo de arriba, este es el enlace que va en la pieza.' }),
    ]
    : [
      crear('h3', { texto: 'Listo, no tienes que generar nada' }),
      crear('p', { texto: 'Legal ya publicó estos T&C. Copia el enlace de abajo y ponlo en la pieza: ese es el enlace que va, tal cual.' }),
    ]));

  contenido.appendChild(RM.util.paraCopiar(
    'Enlace para la pieza',
    tyc.enlace,
    'Pégalo tal cual, sin acortarlo y sin cambiarle nada.'
  ));

  contenido.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('a', { clase: 'boton boton-secundario', href: tyc.enlace, target: '_blank', rel: 'noopener' }, [
      document.createTextNode('Abrir los T&C'), RM.util.icono('abrir', 16),
    ]),
  ]));

  var ficha = crear('div', { clase: 'ficha' });
  var descripcion = descripcionSinRepetir(tyc);
  if (descripcion) ficha.appendChild(seccionDeFicha('Para qué sirve', descripcion));
  if (tyc.beneficio) ficha.appendChild(seccionDeFicha('Qué beneficio cubre', tyc.beneficio));
  ficha.appendChild(seccionDeFicha('Vigencia', revision.vigencia));
  contenido.appendChild(ficha);

  contenido.appendChild(crear('div', { clase: 'fila-botones' }, [botonVolverALaLista(), botonVolverALosTipos()]));
  return contenido;
}

function seccionDeFicha(titulo, texto) {
  return crear('div', { clase: 'ficha-seccion' }, [
    crear('h3', { texto: titulo }),
    crear('p', { clase: 'pregunta-ayuda', texto: texto }),
  ]);
}

function botonVolverALaLista() {
  return crear('button', {
    clase: 'boton boton-secundario', type: 'button', texto: 'Ver los otros T&C publicados',
    onclick: function () {
      E.tycGenericoElegido = null;
      RM.app.dibujar();
      window.scrollTo(0, 0);
    },
  });
}

/** La salida de aqui. Sin ella, quien entro por equivocacion queda encerrado. */
function botonVolverALosTipos() {
  return crear('button', {
    clase: 'boton boton-secundario', type: 'button', texto: 'Volver a los tipos de campaña',
    onclick: function () {
      E.tycGenericoElegido = null;
      E.campoAbierto = 'tipo';
      RM.app.ir('pasos');
    },
  });
}

RM.tycGenericos = {
  pantalla: pantalla,
  tarjetaDeAtajo: tarjetaDeAtajo,
};
