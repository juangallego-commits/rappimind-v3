# Decisiones técnicas

Decisiones que no son de negocio ni legales. Las de negocio o legales se
preguntan; estas se deciden y se escriben aquí.

## Bloque 0

**Windows es el sistema de referencia para trabajar.** Juan trabaja en Windows,
así que ningún script de npm usa comandos de bash. Copiar, borrar y listar
archivos se hace con Node en `scripts/lib/archivos.js`. `npm run push` es un
script de Node (`scripts/push.js`) en vez de encadenar comandos con `&&`, y
lanza clasp con `shell: true` para que en Windows se resuelva `clasp.cmd`.

**Los retornos de carro se ignoran al leer, no al guardar.** `.gitattributes`
normaliza a LF en el repositorio, pero eso depende de la configuración de git de
quien edite. Para no depender de eso, toda lectura de modelos y de salidas
esperadas pasa por `normalizarTexto()` (`src/core/texto.js`), que quita la marca
BOM y convierte `\r\n` y `\r` sueltos en `\n`. La misma función corre en Node,
en Apps Script y en el navegador, así que el texto generado es idéntico en los
tres. `pruebas/texto.test.js` lo verifica con el mismo texto guardado en los dos
formatos.

**Una sola puerta de entrada a `modelos/` desde Node.** `scripts/lib/modelos.js`
es lo único que lee `modelos/` fuera del motor. El build, `npm run previsualizar`
y las pruebas usan esa función, así que el tratamiento del texto es el mismo en
todas partes. El contenido no se interpreta ahí: interpretarlo es trabajo de
`src/core`, que corre igual en Node y en Apps Script.

**`npm test` usa un patrón glob, no una carpeta.** `node --test pruebas/` falla
en Node 22 (intenta cargar la carpeta como módulo). Se usa
`node --test "pruebas/**/*.test.js"`: Node expande el patrón por su cuenta, así
que funciona igual en cmd de Windows, que no expande globs.

**`dist/` se borra y se rehace en cada build.** Así no quedan archivos viejos
que clasp suba sin que nadie los espere. `pruebas/build.test.js` verifica que
correr el build dos veces deja exactamente lo mismo.

**Los textos legales van embebidos en `dist/Modelos.js`.** Apps Script no lee
archivos `.md`, así que el build convierte `modelos/**/*.md` en un objeto
`MODELOS`. Las pruebas comparan ese objeto contra los archivos fuente para que
nadie pueda cambiar el texto legal sin que se note.

**El despliegue vive en GitHub Actions, no en la máquina de nadie.** clasp
necesita navegador para el login, y las sesiones de Claude Code en la web no lo
tienen. El flujo (`.github/workflows/despliegue.yml`) hace `clasp push` en cada
push a `main` y, con disparo manual, crea versión y actualiza el despliegue. Las
credenciales van en el secreto `CLASPRC_JSON`, se escriben a un archivo sin
imprimirse y se borran al terminar el trabajo.

**El despliegue solo se mueve a mano.** Cada push a `main` sube el código
(`clasp push`), pero no toca la versión ni el despliegue: la URL que usan los
comerciales no debe cambiar sola. Crear versión y apuntar el despliegue es el
disparo manual del flujo.

## Bloque 1

**Las fechas se manejan como texto ISO, nunca como `Date`.** `src/core/fechas.js`
compara y formatea sobre la cadena `AAAA-MM-DD`. Un `Date` se interpreta en la
zona horaria de quien lo evalúa, y el documento saldría con un día de diferencia
según corra en Node, en Apps Script o en el navegador. La fecha de referencia
entra como parámetro, así que las pruebas no dependen del día en que se corren.

**Los módulos de `src/core` se cargan distinto en Node y en Apps Script.** Cada
archivo declara funciones globales y exporta al final. Arriba, un bloque
`if (typeof module !== 'undefined' && typeof require === 'function')` trae las
dependencias con `require` solo en Node. En Apps Script ese bloque no corre y el
`var` hoisted no pisa la función global que ya existe, porque una declaración
`var` sin asignación sobre un nombre ya definido no hace nada. Así el mismo
archivo sirve en los tres entornos sin duplicar código.

**El texto plano es la unidad de verificación, no el texto con formato.**
`textoPlano()` quita las marcas `**` antes de buscar frases y antes de correr la
red de seguridad. Un `" ."` roto no se debe esconder porque quede una negrita en
el medio, y los fragmentos que exige cada caso de prueba describen lo que el
documento dice, no cómo se ve.

**La validación se detiene en el país.** Si el país está bloqueado, o está en
piloto y quien pide no es del equipo, se devuelve solo ese error. Llenar la
pantalla de "falta esto, falta lo otro" cuando el problema es que el país no
está disponible no ayuda a nadie.

**Los errores se identifican por campo, no por texto.** Cada error es
`{campo, mensaje}`. El campo permite que la interfaz marque el input exacto, y
las pruebas comparan campos, que es lo que declara `pruebas/casos_base.json`.

**El dígito verificador del RFC se calcula con la posición en el alfabeto.** El
mapeo de la especificación (0 a 9 valen 0 a 9, A a N valen 10 a 23, & vale 24,
O a Z valen 25 a 36) es exactamente el índice en la cadena
`'0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ'`. Escribirlo como un desplazamiento
condicional corría el valor de `&` y de la O a la Z en uno.

## Bloque 2

**El servidor se prueba entero en Node con dobles de Google.** `pruebas/dobles/`
reproduce SpreadsheetApp, DriveApp, DocumentApp, MailApp, PropertiesService,
LockService y Session con el comportamiento que usa el servidor, y
`pruebas/dobles/entorno.js` publica src/core y src/server en globalThis, igual que
hace Apps Script. Así setup, generación, documento, correo, historial, publicación y
administración quedan cubiertos sin la cuenta de Juan.

**La parte que toca Google es lo más delgada posible.** Todo lo que piensa vive en
src/core: `tablas.js` (filas, consecutivos, permisos, CSV), `paises.js`
(normalización y disponibilidad), `documento.js` (estructura del Doc) y `correo.js`
(HTML del correo). `src/server/` solo lee y escribe rectángulos de celdas y traduce
la estructura a llamadas de DocumentApp.

**El navegador lleva el motor completo.** El build ya mete src/core en
`MotorCliente.html`, así que la interfaz arma el formulario desde `esquemas.js`,
calcula los derivados y valida en vivo sin ida y vuelta al servidor. El servidor
vuelve a validar siempre antes de generar: hay prueba que manda un país en piloto
desde un usuario que no es del equipo y verifica que el servidor lo rechaza.

**Los esquemas no viajan al cliente.** Tienen funciones (`visible`, `obligatorio`)
que no sobreviven a `google.script.run`. Como el cliente ya tiene `esquemas.js`, el
servidor solo manda datos: países, rol, secciones, versiones y URLs.

**En modo demostración el usuario es "pruebas".** Sin SHEET_ID no se crea ningún
documento, así que dejar ver los países en piloto no tiene riesgo legal y hace que la
demostración sirva para algo. El aviso en pantalla lo dice.

**Quien despliega queda como administrador.** Si no, nadie podría entrar a la
administración después de `setup()`. Los demás administradores salen de la propiedad
`CORREOS_ADMIN`. No inventé los correos de Anna ni de Paula: los agrega Juan.

**El identificador se calcula bajo LockService.** Dos generaciones simultáneas
podrían leer el mismo consecutivo. El bloqueo cubre desde la lectura del último
identificador hasta que la fila queda escrita.

**El enlace publicado se valida contra promos.rappi.com.** Cualquier otro dominio
significa que el T&C no quedó donde la campaña lo referencia.

## Bloque 3

**Cada archivo de la interfaz va envuelto en una función.** Al concatenar,
`src/client/js/*.js` compartiría un solo ámbito y dos archivos con `var estado`
se pisarían: el segundo dejaba al primero apuntando a otra cosa, con errores
imposibles de leer. El build los envuelve en `(function () { ... })()`. Se
comunican por `window.RM`, así que el aislamiento no les quita nada. Los archivos
de `src/core` NO se envuelven: Apps Script los necesita globales.

**El build falla si dos archivos solo se distinguen por mayúsculas.** Había
`dist/documento.js` (core) y `dist/Documento.js` (servidor). En Apps Script uno
pisaría al otro sin avisar. Los del servidor se llaman ahora
`AdaptadorDocumento.js` y `EnvioCorreo.js`, y el build revisa las colisiones.

**Preseleccionar no es responder.** Un valor por defecto deja la opción marcada,
pero la pregunta se muestra igual y el comercial tiene que pasar por ella. Antes
la interfaz saltaba esas preguntas y el comercial nunca veía decisiones que
tienen efecto legal, como cuándo se cargan los Créditos. El estado lleva
`respondidas`, que se llena solo cuando el comercial responde o avanza.

**La vista previa usa el motor real, no una aproximación.**
`renderizarVistaPrevia` es el mismo pipeline de `renderizar`, salvo que deja un
hueco marcado donde falta un dato. Hay prueba de que con el formulario completo
las dos salidas son idénticas carácter por carácter. Si se hubiera escrito una
vista previa aparte, tarde o temprano mostraría algo distinto de lo que se genera.

**Todo dato del usuario entra al DOM como texto.** No hay un solo `innerHTML` con
datos en toda la interfaz; el ayudante `crear()` lanza un error si alguien
intenta pasarle HTML. Un nombre de campaña con una etiqueta dentro se ve como
texto, no se ejecuta.

**La declaración vive solo en el resumen.** Estaba en el formulario y en el
resumen, y el flujo se atascaba en el paso de confirmación. Va donde el comercial
ve todo junto antes de generar, que es donde tiene sentido declarar.

**El reemplazo de cadenas al generar la demostración va como función.** El código
que se inyecta contiene secuencias de reemplazo con el signo de dólar, y pasarlas
como cadena hace que JavaScript las interprete como patrones y corrompa el
archivo sin avisar. Pasó de verdad y costó encontrarlo.

**Playwright no es dependencia del proyecto.** Las capturas se sacan con un
recorrido que vive fuera del repositorio. `npm test` sigue sin dependencias
externas, como pide CLAUDE.md.

**Reiniciar el formulario no guarda el borrador.** Lo hacía, y con eso arrancar la
aplicación pisaba el borrador de la sesión anterior antes de que la pantalla de
inicio alcanzara a leerlo: la función de no perder lo escrito no servía para
nada y no se notaba, porque no falla, simplemente nunca ofrece nada. Ahora el
borrador solo se escribe cuando el comercial responde algo, que es cuando hay
algo que perder.

## El nombre de la campaña se calcula, no se escribe

**Qué se decidió.** Quitar el campo de texto libre y armar el nombre con la tienda, el
porcentaje y el día de inicio, en `src/core/nombres.js`.

**Por qué.** El primer T&C real salió titulado "99% de Cashback El Corral 20/09" con una
cláusula que decía 50% y una vigencia del 17 de septiembre. La cláusula 12 del propio
documento dice que ante una discrepancia se aplica la condición más favorable al
usuario, así que un título que promete 99% obliga a pagar 99%. Mientras el nombre y el
articulado salgan de fuentes distintas, ese error se puede repetir.

**Cómo.** `calcularDerivados` ignora lo que venga en `entrada.nombreCampana` y calcula
`NOMBRE_CAMPANA` desde los mismos datos que alimentan las cláusulas. Un borrador viejo o
una campaña reusada no pueden colar un nombre escrito a mano.

**La unicidad la resuelve el servidor, no el formulario.** El comercial no tiene que
inventar un distinguidor. Al generar, dentro del bloqueo, se mira qué nombres existen y
se asigna el primer consecutivo libre. Si hay consecutivo, el documento se vuelve a
armar, porque en la Carrera de Compras el nombre va adentro de una cláusula.

## Las respuestas se guardan dos veces, a propósito

**Qué se decidió.** La pestaña `Solicitudes` guarda cada respuesta en su propia columna,
con el valor legible, *y además* mantiene `datos_json` con la respuesta cruda.

**Por qué.** Son dos usos distintos. Para auditar hay que abrir el Sheet, filtrar y leer
lo que contestó el comercial, y para eso el JSON no sirve. Para volver a generar un
documento idéntico hace falta el valor crudo, y para eso la etiqueta no sirve.

**Las columnas salen de los esquemas**, no de una lista escrita a mano, así que una
pregunta nueva trae su columna sola. Llevan el prefijo `resp_` porque `pais`, `tipo` y
`tienda` ya existen como columnas.

**Solo se llenan las preguntas visibles.** Un campo oculto puede tener un valor viejo de
antes de que el comercial cambiara una respuesta; guardarlo diría que se preguntó algo
que nunca se preguntó.

## El entorno de pruebas carga src/core completo

**Qué se decidió.** `pruebas/dobles/entorno.js` lee la carpeta en vez de tener una lista
de archivos escrita a mano.

**Por qué.** En Apps Script se cargan todos. Con la lista fija, un archivo nuevo quedaba
fuera y las pruebas fallaban con un "no está definido" que no decía dónde estaba el
problema.
