# El recorrido, pantalla por pantalla

Las pantallas están registradas en `PANTALLAS`, en `src/client/js/70-app.js`.
No hay enrutador ni URL: la app vive dentro de un iframe de Apps Script, así que
`RM.app.ir(nombre)` cambia `E.pantalla` y redibuja la raíz entera.

El estado del recorrido vive en `E` (`src/client/js/20-estado.js`):

| Llave | Para qué |
|---|---|
| `E.pantalla` | cuál de las diez pantallas se dibuja |
| `E.pasoActual` | índice del paso dentro del formulario |
| `E.campoAbierto` | qué pregunta está abierta; `null` = la primera sin responder |
| `E.respondidas` | qué preguntas tocó de verdad el comercial |
| `E.errores` | qué preguntas ya pueden mostrar su error (no se regaña antes de tiempo) |
| `E.filtroRespondido`, `E.filtroDeTravelRespondido` | filtros ya pasados |
| `E.motivoDeLegal` | la razón que va a leer en la pantalla `legal` |
| `E.resultado` | lo que devolvió `generar`, para la pantalla `listo` |

---

## inicio

Qué promete, en tres pasos: contar la campaña, ver cómo va quedando, publicar.
Dos botones: **Empezar**, que borra todo y arranca de cero, y **Seguir con lo
que dejaste a medias**, que solo aparece si hay borrador guardado.

Si el navegador no deja guardar, lo dice ahí mismo, antes de que el comercial
pierda media hora de trabajo.

Sale a: `filtro` (Empezar) o `pasos` (seguir el borrador).

## filtro

Dos preguntas generales, en `pantallaFiltro` (`60-flujo.js`):

1. ¿Hay azar: sorteo, rifa, raspa y gana o ruleta?
2. ¿La tienda o la marca exige sus propios términos y condiciones?

Un **sí** en cualquiera va a `legal` con la razón de esa pregunta. Dos **no**
marcan `E.filtroRespondido` y van a `pasos`.

Las preguntas están escritas ahí mismo, en el arreglo `preguntas`. No preguntes
aquí nada que dependa del tipo de campaña: en este punto todavía no se sabe cuál
es. La pregunta del negocio (Rappi o Rappi Travel) **no** va aquí; estuvo y fue
un defecto.

## pasos

La pantalla de trabajo, en `62-pasos.js`. Dos columnas en escritorio: preguntas
a la izquierda, documento a la derecha. En celular el documento sale con el
botón fijo "Ver cómo va mi T&C".

**Antes de elegir el tipo** no hay pasos del tipo todavía, así que se usa
`camposDeArranque()`: país, negocio, tipo. Una sola definición, usada por
`pantallaPasos` para dibujar y por `situacionActual` para navegar.

- **país**: las opciones vienen del servidor (`E.configuracion.paises`), con la
  nota de piloto cuando aplica. Colombia viene preseleccionada. Cambiar el país
  borra el tipo.
- **negocio**: Rappi o Rappi Travel. Es la bifurcación grande. Cambiarlo borra
  el tipo y su `respondidas.tipo`, y de ahí salen tres caminos:
  - Travel en un país sin Travel → `legal`, con la razón que nombra el país.
  - Travel y el filtro de Travel sin responder → `filtroTravel`.
  - lo demás → se queda en `pasos`, abierto en `tipo`.
- **tipo**: tarjetas con nombre y descripción, filtradas por el negocio. Los
  tipos de Rappi y los de Travel nunca se mezclan en la misma lista.

**Con el tipo elegido**, los pasos salen de `flujo.pasosDelTipo()`: solo los
pasos de `PASOS` que tengan alguna pregunta visible para ese tipo. El paso
`confirmacion` no entra al formulario; su casilla va en el resumen.

Dentro del paso va una pregunta a la vez. Las anteriores quedan arriba en una
línea con "Cambiar". Se avanza solo cuando la respuesta es inequívoca (elegir
una opción); si hay que escribir algo, se confirma con **Siguiente**.

Detalles que ya están resueltos y conviene no romper:

- La barra de progreso tiene dos formas: nombres de paso en escritorio, "Paso 2
  de 7" en celular. Lo decide la hoja de estilos, no el JavaScript.
- Elegir el día de inicio propone el mismo día de fin: tres de cada cuatro
  campañas de cashback duran un día.
- Cashback muestra una calculadora de ejemplo al responder porcentaje, tope o
  presupuesto, y avisa si el tope es mayor que el presupuesto.
- La identificación del organizador se muestra formateada como va en el
  documento, no como se escribió.
- El error de un campo se refresca sin redibujar la pantalla entera
  (`actualizarValidacionEnVivo`), para que no salte el foco.

Sale a: `resumen` (última pregunta del último paso), `filtro` (Atrás desde la
primera), `legal` o `filtroTravel` (por el negocio).

## filtroTravel

Nueve preguntas, en `FILTRO_DE_TRAVEL` (`src/core/ayuda.js`). Va **después** de
elegir Rappi Travel y **antes** de elegir el tipo: preguntarlas antes no tendría
sentido, y preguntarlas después sería hacerle llenar media campaña a alguien que
va a terminar en Legal.

Un **sí** va a `legal` con su razón. Nueve **no** marcan
`E.filtroDeTravelRespondido`, dejan `E.campoAbierto = 'tipo'` y vuelven a
`pasos`.

Tiene una salida propia: **"Esta campaña no es de Travel"**, que devuelve el
negocio a Rappi. Sin ella, quien entró por equivocación queda encerrado.

## legal

Dice el motivo (`E.motivoDeLegal`), aclara que no es una negativa y ofrece el
formulario de Legal. Si el enlace no está configurado, lo dice y nombra a Juan.

## resumen

Todo lo respondido, agrupado por paso, con "Editar" en cada grupo, que vuelve a
`pasos` en ese paso y en esa pregunta. Abajo va la casilla de declaración.

"Generar T&C" está deshabilitado mientras falte algo, y lo que falta se lista en
palabras ("Te falta:"), no como nombres de campo. La columna del documento sigue
al lado.

## listo

El resultado: el enlace del documento, el paso a paso de Squarespace y quién
tiene usuario para publicar en ese país (`bloqueDeQuienPublica`). Es la pantalla
donde el comercial deja la herramienta y se va a publicar, así que lo que
necesita tiene que estar ahí, copiable, sin volver a buscar.

## historial ("Mis campañas")

Las campañas del comercial, con lo que puede hacer con cada una:

- **Usar como base**: copia las respuestas, borra las fechas y la declaración y
  agrega " (copia)" al nombre. Las fechas casi nunca sirven para la campaña
  nueva.
- **Ampliar**: solo si la campaña está publicada y en curso. Las reglas están en
  `src/core/ampliacion.js`: la vigencia solo se mueve hacia adelante y los
  números solo suben, porque bajarlos cambiaría las condiciones de quien ya
  compró. Cuando no se puede, el historial dice en palabras por qué.
- **Marcar como publicada**, con el enlace de Squarespace.

## ayuda

Qué es cada sección, cómo se publica en Squarespace paso a paso, quién puede
publicar en cada país y el canal de Legal. Cuando cambie el flujo, cambia aquí
también.

## admin

Solo con rol `admin`. Países y modelos. No es parte del recorrido del comercial.
