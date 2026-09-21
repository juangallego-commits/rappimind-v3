'use strict';

/**
 * Los dos textos fijos del paquete de revision: el prompt que se pega al
 * empezar cada tanda, y el LEEME con el que Juan lo usa sin tocar la terminal.
 *
 * Viven aparte de scripts/revision.js porque son texto, no logica, y porque el
 * prompt es lo que decide si la revision sirve: se afina solo, sin tocar el
 * armado de las tandas.
 */

/** El prompt maestro. Se pega igual al empezar cada conversacion. */
function prompt(datos) {
  const lineas = [];

  lineas.push('# El prompt de la revisión del front');
  lineas.push('');
  lineas.push('Esto se pega **entero, al empezar cada conversación de Claude chat**, y justo');
  lineas.push('después se pega el archivo de la tanda que toque. Es el mismo texto para las');
  lineas.push(datos.tandas.length + ' tandas: lo único que cambia es la tanda que va detrás.');
  lineas.push('');
  lineas.push('La línea de abajo es donde empieza lo que se copia.');
  lineas.push('');
  lineas.push('---');
  lineas.push('');

  lineas.push('Necesito que actúes como especialista en experiencia de producto y en copy de');
  lineas.push('producto en español, y que revises la interfaz de una herramienta interna antes');
  lineas.push('de que la usen los comerciales de Rappi.');
  lineas.push('');
  lineas.push('No tienes la aplicación ni el código. Todo lo que necesitas va en el mensaje que');
  lineas.push('sigue: el texto de cada pantalla está sacado de la pantalla misma, tal como se');
  lineas.push('lee, no copiado de los archivos fuente. Léelo completo antes de responder.');
  lineas.push('');

  lineas.push('## Qué es RappiMind, en tres frases');
  lineas.push('');
  lineas.push('1. Es una aplicación interna de Rappi donde un comercial (CAM o KAM) genera los');
  lineas.push('   Términos y Condiciones de su campaña de marketing sin escribirle al equipo legal.');
  lineas.push('2. La herramienta le hace preguntas sobre hechos (qué tienda, qué porcentaje, qué');
  lineas.push('   fechas, quién puede participar) y arma el documento con textos legales que el');
  lineas.push('   equipo legal ya aprobó, mientras él ve el documento llenándose al lado.');
  lineas.push('3. La persona del otro lado no es abogada, quiere lanzar su promoción esta semana,');
  lineas.push('   y cada pregunta que no entiende es una razón para cerrar la pestaña y escribirle');
  lineas.push('   a Legal, que es justo lo que esta herramienta existe para evitar.');
  lineas.push('');
  lineas.push('**Ese es el criterio de todo lo que propongas:** ¿esto acerca al comercial a');
  lineas.push('publicar su T&C sin escribirle a Legal, o lo aleja?');
  lineas.push('');

  lineas.push('## Cómo está armada la interfaz, para que no lo tengas que adivinar');
  lineas.push('');
  lineas.push('- **Una pregunta a la vez.** El formulario muestra una sola pregunta abierta. Las');
  lineas.push('  ya respondidas quedan arriba, plegadas en una línea con su respuesta y un enlace');
  lineas.push('  "Cambiar". Un formulario largo se abandona; veinte preguntas cortas no.');
  lineas.push('- **Cada pregunta tiene tres piezas:** el enunciado (pregunta directa, en tú, diez');
  lineas.push('  palabras como máximo), una línea de ayuda debajo (con un ejemplo concreto cuando');
  lineas.push('  se puede) y un desplegable "¿Por qué te preguntamos esto?" con la consecuencia');
  lineas.push('  legal de responder mal. En el texto que te paso, el desplegable va abierto en');
  lineas.push('  todas las pantallas, así que su contenido sale siempre.');
  lineas.push('- **La columna de la derecha ("Tu T&C")** muestra el documento llenándose mientras');
  lineas.push('  responde, con un contador que dice "Sin empezar", "Faltan 4 datos" o "Completo".');
  lineas.push('  En casi todas las pantallas ese documento está reemplazado por una marca, porque');
  lineas.push('  es texto legal y no entra en esta revisión.');
  lineas.push('- **Las preguntas cerradas avanzan solas** al elegir una opción; las de texto se');
  lineas.push('  confirman con "Siguiente".');
  lineas.push('- **Lo opcional lleva una marca "Opcional"** al lado del enunciado. En el texto');
  lineas.push('  extraído sale pegada al enunciado; en pantalla va separada.');
  lineas.push('- **Las primeras líneas de cada pantalla del formulario** (Campaña, Organizador,');
  lineas.push('  Cuándo, Beneficio, Créditos, Participantes, Pieza) son la barra de progreso, no');
  lineas.push('  preguntas.');
  lineas.push('- **Las fotos, si las hay.** Puede que te adjunte fotos de algunas pantallas de');
  lineas.push('  la tanda, no de todas: las demás son la misma forma con otro texto. El texto');
  lineas.push('  de todas va completo en el mensaje, así que si no ves foto de una pantalla,');
  lineas.push('  revísala igual con su texto.');
  lineas.push('- **En todas las pantallas** hay una barra superior con RappiMind v3 y las secciones');
  lineas.push('  Generar, Mis campañas, Ayuda y Administración (esta última solo la ve un');
  lineas.push('  administrador), y un botón fijo abajo a la derecha con ES y BR que cambia el');
  lineas.push('  idioma de la interfaz, nunca el del documento.');
  lineas.push('');

  lineas.push('## Lo que no se toca');
  lineas.push('');
  lineas.push('Esto no es negociable y una propuesta que lo rompa no sirve, por buena que sea:');
  lineas.push('');
  lineas.push('1. **Rappi nunca es el organizador de una campaña.** El organizador es siempre la');
  lineas.push('   tienda o la marca que pone la plata. Rappi es la plataforma. Ningún texto puede');
  lineas.push('   sugerir lo contrario, ni de pasada.');
  lineas.push('2. **El texto legal no se revisa aquí.** Todo lo que aparezca bajo "Así queda en tu');
  lineas.push('   T&C", y el documento de la columna derecha, es texto aprobado por Legal. No lo');
  lineas.push('   corrijas ni lo mejores. Si ves algo que te parece un error legal, dilo aparte, al');
  lineas.push('   final, en una lista suelta, y sigue.');
  lineas.push('3. **Todo en español de Colombia, hablando de tú.** Nada de "usted", nada de');
  lineas.push('   español neutro de manual.');
  lineas.push('4. **Sin guiones como signo de puntuación** en lo que el comercial lee. Ni "–" ni');
  lineas.push('   "—" ni " - " partiendo una frase. Se usan comas, dos puntos o paréntesis.');
  lineas.push('5. **Sin campos de texto libre nuevos.** Si tu propuesta es "que escriba aquí lo');
  lineas.push('   que quiera", no sirve: lo que el comercial escribe libre termina impreso en un');
  lineas.push('   documento legal que se publica.');
  lineas.push('6. **Nada de tablas en el documento generado** (el sitio donde se publica no las');
  lineas.push('   muestra). En la interfaz sí las hay y ahí sí se pueden discutir.');
  lineas.push('');

  lineas.push('## Qué quiero que revises, pantalla por pantalla');
  lineas.push('');
  lineas.push('**Una por una, todas, en orden.** No elijas las más llamativas. Si una pantalla');
  lineas.push('está bien, dilo en una línea y sigue. Prefiero cuarenta observaciones pequeñas y');
  lineas.push('concretas que cinco grandes y vagas.');
  lineas.push('');
  lineas.push('En cada pantalla mira, en este orden:');
  lineas.push('');
  lineas.push('1. **Se entiende.** ¿Un comercial que nunca vio esto entiende qué le están');
  lineas.push('   preguntando, en una sola leída, sin abrir la ayuda? ¿Hay alguna palabra que');
  lineas.push('   solo entiende un abogado o alguien de dentro del equipo?');
  lineas.push('2. **Sabe qué responder.** ¿Tiene el dato a mano en ese momento, o se lo estás');
  lineas.push('   pidiendo antes de que lo pueda saber? ¿Sabe dónde buscarlo si no lo tiene?');
  lineas.push('3. **La ayuda ayuda.** ¿La línea de abajo aporta algo nuevo, o repite el enunciado');
  lineas.push('   con otras palabras? ¿El ejemplo es realista para una campaña de verdad?');
  lineas.push('4. **El "por qué" convence.** ¿Explica la consecuencia de responder mal, o es');
  lineas.push('   relleno? Una pregunta cuyo "por qué" no dice nada es una pregunta que se');
  lineas.push('   responde al azar.');
  lineas.push('5. **Las opciones cierran.** ¿Se excluyen entre sí? ¿Cubren los casos reales?');
  lineas.push('   ¿Falta alguna? ¿Sobra alguna? ¿La nota de cada una distingue de verdad?');
  lineas.push('6. **Los errores sirven.** ¿Dicen qué pasó y cómo se arregla, o solo que está mal?');
  lineas.push('   ¿Alguno culpa al comercial?');
  lineas.push('7. **El tono es el mismo.** ¿Todas las pantallas hablan igual? ¿Alguna se pone');
  lineas.push('   solemne, o graciosa, o pide perdón sin razón?');
  lineas.push('8. **Los nombres son consistentes.** La misma cosa se llama igual en todas partes');
  lineas.push('   (Organizador, Tienda Participante, Créditos, Tope, Presupuesto, Vigencia).');
  lineas.push('   Si algo se llama de dos maneras, es un hallazgo.');
  lineas.push('9. **El orden tiene sentido.** ¿Alguna pregunta estaría mejor antes o después?');
  lineas.push('   ¿Hay dos que se podrían juntar en una? ¿Alguna se pregunta dos veces?');
  lineas.push('');

  lineas.push('## Cómo quiero la respuesta');
  lineas.push('');
  lineas.push('Una ficha por hallazgo, con este formato exacto. El formato importa: con él puedo');
  lineas.push('aplicar los cambios buscando y reemplazando, sin volver a escribir nada a mano.');
  lineas.push('');
  lineas.push('```');
  lineas.push('### H-<tanda>.<número> · <título corto del hallazgo>');
  lineas.push('');
  lineas.push('- **Dónde:** <ver abajo, según de dónde venga>');
  lineas.push('- **Gravedad:** alta | media | nit');
  lineas.push('- **Qué pasa:** una o dos frases.');
  lineas.push('- **Dice hoy:** «el texto actual, copiado letra por letra, con sus tildes»');
  lineas.push('- **Debería decir:** «el texto nuevo, listo para pegar»');
  lineas.push('- **Por qué:** una frase, desde el comercial.');
  lineas.push('```');
  lineas.push('');
  lineas.push('**El campo Dónde**, según de dónde venga el hallazgo. No todo lo que te paso es');
  lineas.push('una pantalla: hay tandas que son listas de preguntas, y bloques de mensajes que');
  lineas.push('solo salen cuando algo se equivoca.');
  lineas.push('');
  lineas.push('- De una pantalla: `Pantalla 12 · Formulario, el tope por pedido`');
  lineas.push('- De una pregunta sin pantalla: `Pregunta «¿Qué categorías de Travel');
  lineas.push('  participan?» · campo categorias`. Ese "campo" sale en la ficha de cada');
  lineas.push('  pregunta, en la fila "Campo interno". Cópialo: es con lo que la encuentro.');
  lineas.push('- De un mensaje de validación: `Validación de «¿Cuál es el máximo de Créditos');
  lineas.push('  por pedido?» · cuando lo deja en blanco`');
  lineas.push('- De la traducción al portugués: `Portugués · «Mis campañas»`, con el texto en');
  lineas.push('  español, que es la clave del diccionario.');
  lineas.push('');
  lineas.push('Las tres gravedades:');
  lineas.push('');
  lineas.push('- **alta**: puede hacer que el comercial responda mal, abandone, o publique un');
  lineas.push('  documento que no corresponde.');
  lineas.push('- **media**: lo hace dudar, lo demora, o lo manda a preguntar.');
  lineas.push('- **nit**: ortografía, concordancia, una coma, una mayúscula, un tono.');
  lineas.push('');
  lineas.push('Dos reglas del campo **Dice hoy**:');
  lineas.push('');
  lineas.push('1. Cópialo **exacto**, con sus tildes y su puntuación, del texto que te paso. Si no');
  lineas.push('   está literal, no lo puedo encontrar para reemplazarlo.');
  lineas.push('2. Si tu propuesta no reemplaza un texto sino que agrega, quita o mueve algo,');
  lineas.push('   escribe `Dice hoy: (no aplica, es algo que falta)` y explícalo en "Qué pasa".');
  lineas.push('');

  lineas.push('## Cómo cerrar');
  lineas.push('');
  lineas.push('Después de las fichas, tres cosas:');
  lineas.push('');
  lineas.push('1. **La tabla de cierre**, con una fila por hallazgo: código, gravedad, pantalla y');
  lineas.push('   título. Para verlos todos de un vistazo.');
  lineas.push('2. **Lo que está bien y no hay que tocar.** Tres o cuatro líneas. Sirve para no');
  lineas.push('   romperlo después sin darse cuenta.');
  lineas.push('3. **Las tres preguntas que le harías a Juan**, que es el abogado dueño del');
  lineas.push('   producto, si lo tuvieras enfrente. Las que no puedes responder tú porque son');
  lineas.push('   decisiones suyas, de negocio o legales.');
  lineas.push('');
  lineas.push('Si te quedas sin espacio, **para y dilo**: "voy por la pantalla 14, sigo cuando me');
  lineas.push('digas". Prefiero una revisión en tres mensajes a una revisión que se apura al final.');
  lineas.push('');
  lineas.push('FIN DEL PROMPT. Lo que sigue es el material de la tanda.');
  lineas.push('');

  return lineas.join('\n');
}

/** El LEEME: como se usa el paquete, sin terminal. */
/** El repositorio, para los enlaces de GitHub. */
const REPO = 'https://github.com/juangallego-commits/rappimind-v3';

function leeme(datos) {
  const lineas = [];

  lineas.push('# La revisión del front, con Claude chat');
  lineas.push('');
  lineas.push('Este paquete existe para revisar el front de RappiMind pantalla por pantalla y');
  lineas.push('caso por caso, con Claude chat, y que lo que salga se pueda aplicar sin volver a');
  lineas.push('escribirlo a mano.');
  lineas.push('');
  lineas.push('Generado el ' + datos.generado + ' desde el commit `' + datos.commit + '`, con el');
  lineas.push('texto de ' + datos.pantallas + ' pantallas sacado de la aplicación tal como se lee.');
  lineas.push('');

  lineas.push('## Por qué en tandas y no en un solo archivo');
  lineas.push('');
  lineas.push('`docs/FRONT_ACTUAL.html` es el front entero en un archivo, y sirve para verlo: se');
  lineas.push('abre con doble clic y ahí están las ' + datos.pantallas + ' pantallas, una debajo de');
  lineas.push('otra, con los estilos de verdad. Para revisarlo con Claude chat, sin embargo, ese');
  lineas.push('archivo solo tiene un problema, y es que pesa: unas noventa mil fichas de contexto,');
  lineas.push('la mitad de las cuales son etiquetas y estilos que no aportan nada a una revisión');
  lineas.push('de copy. Cabe en una conversación, pero deja poco aire para pensar, y una revisión');
  lineas.push('de ' + datos.pantallas + ' pantallas con poco aire vuelve con quince observaciones');
  lineas.push('generales en vez de las doscientas concretas que necesitamos.');
  lineas.push('');
  lineas.push('Por eso el front va partido en ' + datos.tandas.length + ' tandas. Cada tanda es una');
  lineas.push('conversación aparte, con su pedazo del producto y nada más, y con toda la ventana');
  lineas.push('libre para revisar de verdad.');
  lineas.push('');

  lineas.push('## Las ' + datos.tandas.length + ' tandas');
  lineas.push('');
  lineas.push('| # | Archivo | De qué va | Qué trae |');
  lineas.push('|---|---|---|---|');
  for (const archivo of datos.tandas) {
    // Con concordancia: una tanda de "1 fotos" es de las cosas que Juan ve al
    // segundo, y este archivo lo lee el.
    const cuantas = (numero, singular, plural) =>
      numero + ' ' + (numero === 1 ? singular : plural);
    const trae = [];
    if (archivo.pantallas) trae.push(cuantas(archivo.pantallas, 'pantalla', 'pantallas'));
    if (archivo.preguntas) trae.push(cuantas(archivo.preguntas, 'pregunta', 'preguntas'));
    if (archivo.fotos) trae.push(cuantas(archivo.fotos, 'foto', 'fotos'));
    if (archivo.tanda.validaciones) trae.push('los mensajes de error');
    if (archivo.tanda.diccionarioPt) trae.push('el diccionario del portugués');
    lineas.push('| ' + archivo.numero + ' | `' + archivo.nombre + '` | ' +
      archivo.tanda.titulo + ' | ' + trae.join(', ') + ' |');
  }
  lineas.push('');
  lineas.push('El orden importa: la tanda 1 es la que más devuelve, porque son las pantallas');
  lineas.push('donde el comercial decide si se queda. Si solo hay tiempo para tres, que sean la');
  lineas.push('1, la 2 y la 3.');
  lineas.push('');

  lineas.push('## Dónde está cada cosa');
  lineas.push('');
  lineas.push('Todo vive en `docs/revision/`, dentro del repositorio. En GitHub se abre en');
  lineas.push('`' + REPO + '/tree/main/docs/revision`.');
  lineas.push('');
  lineas.push('| Archivo | Para qué |');
  lineas.push('|---|---|');
  lineas.push('| `LEEME.md` | Esto que estás leyendo |');
  lineas.push('| `PROMPT.md` | Lo que se pega al empezar cada conversación |');
  for (const archivo of datos.tandas) {
    lineas.push('| `' + archivo.nombre + '` | Tanda ' + archivo.numero + ': ' +
      archivo.tanda.titulo + ' |');
  }
  lineas.push('| `respuestas/` | Donde va lo que responda Claude chat |');
  lineas.push('| `pantallas.json` | El texto de las pantallas, del que se arman las tandas. No se lee a mano |');
  lineas.push('');

  lineas.push('## Las fotos las tomas tú');
  lineas.push('');
  lineas.push('En el repositorio no hay capturas, a propósito. Las tomas tú de la aplicación');
  lineas.push('cuando vayas a hacer la tanda, y así son de la versión que está corriendo ese');
  lineas.push('día y no de un recorrido de hace tres semanas.');
  lineas.push('');
  lineas.push('Cada tanda te dice, al principio, qué pantallas suyas vale la pena fotografiar.');
  lineas.push('Son ' + datos.fotos + ' en total, repartidas así:');
  lineas.push('');
  lineas.push('| Tanda | Qué fotografiar |');
  lineas.push('|---|---|');
  for (const archivo of datos.tandas) {
    const suyas = (archivo.nombresDeFotos || []);
    lineas.push('| ' + archivo.numero + ' | ' +
      (suyas.length ? suyas.join('; ')
        : (archivo.pantallas ? 'ninguna hace falta: son formas de pantalla que ya salen en otra tanda'
          : 'nada: esta tanda es de preguntas, no de pantallas')) + ' |');
  }
  lineas.push('');
  lineas.push('No son todas las pantallas de cada tanda, y no hacen falta: las demás son la');
  lineas.push('misma forma con otro texto, y el texto va completo dentro de la tanda. Con una');
  lineas.push('por forma de pantalla, Claude chat entiende cómo se ve el producto.');
  lineas.push('');
  lineas.push('Si no adjuntas ninguna, la revisión igual funciona. Pierdes lo visual, que es');
  lineas.push('el aire, la jerarquía y el tamaño de los botones, no el copy, que es el grueso.');
  lineas.push('');
  lineas.push('**Y `docs/FRONT_ACTUAL.html`**, que no está en esta carpeta sino un nivel');
  lineas.push('arriba, en `docs/`. Ese es el front entero en un archivo, para verlo tú con');
  lineas.push('doble clic. No se lo mandes a Claude chat: el porqué está más arriba.');
  lineas.push('');

  lineas.push('## Cómo se hace cada tanda');
  lineas.push('');
  lineas.push('1. Abre una **conversación nueva** en Claude chat. Nueva de verdad, una por tanda:');
  lineas.push('   si se hacen dos en la misma, la segunda hereda el cansancio de la primera.');
  lineas.push('2. Pega el contenido de **`PROMPT.md`**, desde la línea que dice dónde empieza');
  lineas.push('   hasta el final. Es el mismo para todas las tandas.');
  lineas.push('3. Pega debajo el contenido de la tanda, por ejemplo `' + datos.tandas[0].nombre + '`.');
  lineas.push('   Todo en el mismo mensaje.');
  lineas.push('4. Adjunta, en ese mismo mensaje, las fotos que la propia tanda te lista. Están');
  lineas.push('   en `docs/revision/capturas/` y son una por forma de pantalla, nunca más de');
  lineas.push('   nueve por tanda. Claude chat lee imágenes pero no dibuja HTML, así que son lo');
  lineas.push('   único que le deja juzgar el aire, la jerarquía y el tamaño de los botones. Si');
  lineas.push('   no las adjuntas, la revisión igual funciona: el texto va completo en la tanda.');
  lineas.push('5. Cuando responda, si se quedó a mitad, dile "sigue". Si se quedó sin espacio,');
  lineas.push('   pídele que continúe en otro mensaje.');
  lineas.push('6. Copia la respuesta **entera, tal cual**, y guárdala en');
  lineas.push('   `docs/revision/respuestas/tanda-N.md`. Sin resumir y sin recortar: de ahí salen');
  lineas.push('   los cambios.');
  lineas.push('');

  lineas.push('## Cómo subir la respuesta sin tocar la terminal');
  lineas.push('');
  lineas.push('1. En GitHub, con el repositorio abierto: **Add file**, luego **Create new file**.');
  lineas.push('2. Escribe la ruta completa en la casilla del nombre, por ejemplo');
  lineas.push('   `docs/revision/respuestas/tanda-1.md`. Al escribir las barras, GitHub crea las');
  lineas.push('   carpetas solo.');
  lineas.push('3. Pega, baja hasta **Commit changes** y confirma.');
  lineas.push('');
  lineas.push('Si la respuesta llegó en dos o tres tandas de mensajes, van todas en el mismo');
  lineas.push('archivo, una detrás de otra y en orden. Mejor que sobre a que falte.');
  lineas.push('');

  lineas.push('## Qué pasa después');
  lineas.push('');
  lineas.push('Cada respuesta se trabaja en una sesión de Claude Code. La regla que las gobierna');
  lineas.push('a todas es la de siempre: **lo que Claude chat recomiende sin dar el texto exacto');
  lineas.push('no lo redacta Claude Code**. Si es texto de producto, se propone y lo apruebas tú.');
  lineas.push('Si es texto legal, se anota en `docs/PENDIENTES_LEGAL.md` y lo decides tú.');
  lineas.push('');
  lineas.push('Y una advertencia que vale la pena repetir: Claude chat va a proponer mejoras de');
  lineas.push('redacción para frases que son legales y no de producto. Esas no se aplican aunque');
  lineas.push('suenen mejor. El prompt se lo dice, pero conviene mirarlo al revisar la respuesta.');
  lineas.push('');

  lineas.push('## Cómo se regenera');
  lineas.push('');
  lineas.push('```');
  lineas.push('NODE_PATH=/opt/node22/lib/node_modules \\');
  lineas.push('PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run front   # recorre, y deja el texto y las fotos');
  lineas.push('npm run revision                                          # arma las tandas, sin navegador');
  lineas.push('```');
  lineas.push('');
  lineas.push('El primero necesita un navegador y tarda un par de minutos. El segundo es');
  lineas.push('instantáneo, así que las tandas se pueden reordenar y reescribir sin volver a');
  lineas.push('recorrer la aplicación.');
  lineas.push('');

  return lineas.join('\n');
}

module.exports = { prompt, leeme };
