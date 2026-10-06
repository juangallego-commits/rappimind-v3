---
name: frontera-apps-script
description: Las cuatro fronteras de RappiMind v3 donde el código se rompe en silencio, y cómo probar cada una. Úsala SIEMPRE que vayas a tocar algo que cruce entre el servidor de Apps Script, el navegador, el Sheet o el build - es decir, cualquier cosa en src/server/, scripts/build.js, lo que devuelve una función de src/server/Api.js, lo que lee o escribe una pestaña del Sheet, o lo que la interfaz recibe en E.configuracion. Actívala también cuando el síntoma sea "una pantalla se quedó vacía", "no salen las opciones", "Cannot read properties of null", "la vista previa no se llena", "funciona en la demo pero no en Apps Script", o cuando vayas a agregar una columna, un tipo de campaña, un país o un archivo nuevo a src/core/. Y cuando te toque arreglar un defecto que solo aparece en producción.
---

# Las fronteras de RappiMind v3

Este repositorio tiene cuatro sitios donde un dato cambia de mundo. En los cuatro,
un error **no lanza una excepción**: el dato llega mal, o llega vacío, y el
síntoma aparece lejos de la causa, normalmente como una pantalla en blanco.

Todos los defectos graves de este proyecto han salido de aquí. No de la lógica
legal, que está cubierta por pruebas, sino de estos cuatro cruces.

Lee esto antes de tocar `src/server/`, `scripts/build.js` o cualquier cosa que
viaje entre el servidor y la interfaz.

## Por qué no basta con correr las pruebas

`npm test` y la demostración (`demo/index.html`) **no ven estas fronteras**:

- La demostración corre todo dentro del navegador, con un servidor simulado que
  devuelve los objetos tal cual. Apps Script tiene una tubería en medio con
  reglas propias.
- Las verificaciones de navegador (Playwright contra la demo) tampoco, por lo
  mismo.

Por eso lo que funciona en la demo puede estar roto en producción. Las pruebas
que sí ven estas fronteras son las de `pruebas/servidor.test.js`, que corren
contra los dobles de las APIs de Google en `pruebas/dobles/`, y las de
`pruebas/build.test.js`, que corren el resultado del build.

**Si tu cambio cruza una frontera, la prueba va ahí, no en la demo.**

## Frontera 1: del servidor al navegador (`google.script.run`)

`google.script.run` solo transporta **números, textos, booleanos, nulos, listas
y objetos hechos de esos**. Una fecha no pasa.

Lo peligroso es cómo falla: **no lanza un error**. Apps Script le entrega `null`
al `withSuccessHandler` y el registro queda limpio. Basta una sola fecha
enterrada en cualquier parte de la respuesta para tumbar la pantalla entera.

Google Sheets convierte sola a fecha una celda que diga `2026-09-17`, así que
esto pasa apenas hay una campaña guardada.

**La regla.** Todo lo que salga del Sheet hacia el navegador pasa por
`filasPlanas()` de `src/core/tablas.js`, en la frontera, no en cada pantalla. Un
arreglo por pantalla se olvida en la siguiente.

**El error de la sobrecorrección.** `filasPlanas` empezó convirtiendo a texto
todo lo que no fuera primitivo, incluidas las listas. La lista de tipos de
campaña del país llegó al navegador como la cadena
`"cashback,carrera_compras,..."` y la pantalla se quedó sin una sola opción que
ofrecer. Las listas y los objetos **sí** pasan: hay que recorrerlos, no
aplanarlos.

Pruebas que cuidan esto, en `pruebas/servidor.test.js`:
`el historial no devuelve fechas, que Apps Script convierte en null` y
`el estado inicial conserva las listas, no las vuelve texto`.

## Frontera 2: del build al navegador (qué recibe la página)

En `dist/` conviven dos mundos:

- Los `.js` sueltos (`Modelos.js`, `PaisesSemilla.js`, `Secciones.js`,
  `CategoriasTravel.js`, `motor.js`, …) son **del servidor**. Apps Script los
  carga en su ámbito global. **El navegador nunca los recibe.**
- El navegador solo recibe lo que va **dentro** de los HTML que `Index.html`
  incluye: `Estilos.html`, `MotorCliente.html` y `App.html`.

Por eso `scripts/build.js` mete una copia de los textos legales y de los datos
**dentro** de `MotorCliente.html`. Sin eso, `MODELOS` queda sin definir en el
navegador, la vista previa revienta, y como revienta a mitad del clic, tampoco
alcanza a pintar la opción elegida. Ese fue el síntoma: dos defectos aparentes,
una sola causa.

**La regla.** Si agregas un dato que la interfaz necesita para pintar algo,
tiene que entrar a `MotorCliente.html`. La prueba
`MotorCliente.html corre solo en el navegador y arma la vista previa`
(`pruebas/build.test.js`) ejecuta ese HTML en un ambiente sin `module` ni
`require`, que es lo que hay del lado del usuario.

## Frontera 3: el Sheet

La pestaña es una tabla, y las filas viejas ya están escritas.

- **Un objeto anidado no sobrevive.** Se guarda como `[object Object]`. Por eso
  los datos de Rappi Travel van planos en la fila del país
  (`travel_entidad`, `travel_rnt`, …), una llave por columna.
- **Nunca muevas ni borres una columna que ya exista.** Desalinearía todo el
  histórico. `encabezadosDeLaHoja()` en `src/server/Datos.js` lee los
  encabezados que la hoja tiene de verdad y agrega al final los que falten, en
  ese momento. Así una hoja vieja y una nueva escriben igual de bien, sin que
  nadie tenga que acordarse de correr `setup()`.
- **Las columnas salen de los esquemas**, no de una lista escrita a mano
  (`src/core/auditoria.js`), para que una pregunta nueva traiga su columna sola.

Prueba que lo cuida: `una hoja vieja se pone al día sola, sin correr setup otra vez`.

## Frontera 4: los nombres de archivo en Apps Script

Apps Script **no distingue mayúsculas** en los nombres de archivo: `dist/motor.js`
y `dist/Motor.js` serían el mismo archivo y uno pisaría al otro sin avisar. El
build lo revisa en `revisarColisionesDeNombre()`.

Y dos cosas más del mismo mundo:

- Los archivos de `src/client/js/` se envuelven en una función al construir,
  porque si no comparten un solo ámbito y dos `var estado` se pisan. Por lo
  mismo, una función declarada en un archivo **no existe en el siguiente**: se
  comparte por `RM.algo` o revienta en el navegador, no en `npm test`
  (`avisoDePaisEnPruebas is not defined`). `pruebas/cliente.test.js` caza la
  llamada directa a una función de otro archivo.
- Los de `src/core/` **no** se envuelven: Apps Script los necesita globales.
  Cada uno termina con el bloque `if (typeof module !== 'undefined')` para que
  Node también los pueda cargar.

Si agregas un archivo a `src/core/`, no hace falta tocar nada más: el build y
`pruebas/dobles/entorno.js` leen la carpeta.

## Lo que el navegador puede llamar (`google.script.run`)

`google.script.run` deja llamar desde el navegador **cualquier función global
del servidor que no termine en `_`**, no solo las de `Api.js`. Y la web app
corre como quien la despliega (`executeAs: USER_DEPLOYING`): lo que esa función
haga, lo hace con la cuenta de Juan.

**La regla.** Una función que escribe en el Sheet, en el bucket o en Drive, que
lee un documento por su identificador o que manda un correo, y que no revisa
quién pide, termina en `_`. Las que sí se llaman desde la interfaz
(`generar`, `ampliarCampana`, `retirarPublicacion`, `revisarPublicacion`, …)
empiezan por `contextoDeQuienPide()` y revisan permisos. Las que se corren a
mano desde el editor (`prepararPublicacionWeb`, `quitarRevisionAutomatica`)
empiezan por `exigirAdministrador()`.

Prueba que lo cuida: `lo que escribe, lee o escribe correos con la cuenta de
quien despliega no se llama desde el navegador`
(`pruebas/publicacion_web_servidor.test.js`). Las funciones más viejas de
`Datos.js`, `AdaptadorDocumento.js` y `EnvioCorreo.js` todavía no siguen esta
regla; está anotado como pendiente en `docs/PROGRESO.md`.

## Una frontera de afuera: la página publicada en Squarespace

Desde el 5 de octubre de 2026 el servidor lee la página publicada de cada
campaña (`src/server/RevisionDePublicacion.js`) con el JSON que Squarespace
documenta (`?format=json`), y Squarespace avisa que su forma puede cambiar. Tres
reglas, por la misma razón que las otras cuatro fronteras:

- **Un fallo de lectura nunca es un veredicto.** Si el JSON no se entiende, no
  responde o da un error, el estado es "sin verificar" y se reintenta. Nunca
  "verificado" ni "con diferencias".
- **Solo promos.rappi.com.** `urlDeLecturaDeSquarespace()` no arma otra
  dirección, venga de donde venga el enlace.
- **Lo esperado sale del Google Doc, no de volver a generar.** Y la fila pasa
  por `filasPlanas` antes de comparar: una fecha del Sheet sin aplanar inventaba
  avisos de fechas (la prueba está en `pruebas/revision_publicacion.test.js`).

Las pruebas de esta frontera son `pruebas/publicacion.test.js` (lo que decide)
y `pruebas/revision_publicacion.test.js` (contra los dobles, con UrlFetchApp).

## Cómo trabajar un defecto de estos

1. **Reprodúcelo en Node antes de tocar el arreglo.** Escribe la prueba primero,
   en `pruebas/servidor.test.js` o `pruebas/build.test.js` según la frontera.
   Si no falla sin el arreglo, no está probando lo que crees.
2. **Arregla en la frontera, no en la pantalla.** Si el dato llega mal, se
   arregla donde cruza. Un `if` en la pantalla deja el defecto vivo para la
   siguiente.
3. **Comprueba que la prueba caza el defecto**: quita el arreglo, corre
   `npm test`, confirma que falla, vuelve a ponerlo.
4. **Di en el comentario qué se rompió de verdad.** Los comentarios de este
   repositorio cuentan el caso real, no la teoría. Alguien que lea
   `filasPlanas` en un año tiene que entender por qué existe sin buscar el
   historial.

## Lo que no se negocia (de `CLAUDE.md`)

Cuando toques la frontera, es fácil arrastrar sin querer alguna de estas:

- **Rappi nunca es el organizador.** Ni Rappi Travel.
- **El texto legal es de Legal.** Si un texto de `modelos/` parece tener un
  error, anótalo en `docs/PENDIENTES_LEGAL.md` y sigue. Reordenar las mismas
  palabras para que la frase no quede partida sí se puede; reescribirlas no.
- **El documento final no lleva `{{ }}`, `[[ ]]`, valores vacíos ni frases
  rotas.** Si falta algo, no se genera.
- **Nada de tablas** en el documento generado.
- **Todo en español**, y en los textos visibles no se usan guiones como signo de
  puntuación.
- **Antes de cada push, `npm test`.** Cada push a `main` dispara `clasp push`.

## Si necesitas más detalle

`references/incidentes.md` tiene los cinco defectos reales de los que salieron
estas reglas, con el síntoma que vio Juan, la causa y la prueba que ahora los
cuida. Léelo si estás persiguiendo un síntoma raro y quieres ver si ya pasó
antes.
