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

## Nada que salga del Sheet cruza sin limpiar

**Qué se decidió.** Toda respuesta del servidor que venga del Sheet pasa por
`filasPlanas()` antes de llegar al navegador.

**Por qué.** `google.script.run` solo transporta números, textos, booleanos, nulos,
listas y objetos de esos. Una fecha no pasa, y lo peor es cómo falla: no lanza un error,
le entrega `null` al navegador. El síntoma aparece lejos de la causa, en cualquier
pantalla que use la respuesta. Rompió "Mis campañas" en producción y en las pruebas no
se veía, porque los dobles del Sheet devuelven texto.

**Dónde se hace.** En la frontera, no en cada pantalla. Un arreglo por pantalla se
olvida en la siguiente.

## El Sheet se migra solo, no con setup()

**Qué se decidió.** `agregarFila` y `actualizarFila` leen los encabezados que la hoja
tiene de verdad y agregan al final los que falten, en ese momento.

**Por qué.** La alternativa era pedirle a Juan que corriera `setup()` cada vez que
apareciera una columna. Eso funciona hasta que alguien se olvida, y ahí las filas nuevas
se escriben corridas de columna sin que nadie lo note. Una hoja vieja y una nueva tienen
que escribir igual de bien.

**Lo que nunca se hace.** Mover o borrar una columna que ya exista: desalinearía todo el
histórico.

## Rappi Travel no reusa ni un bloque de delivery

**Qué se decidió.** Trece bloques nuevos en `modelos/bloques/travel_*.md` y un archivo
aparte de derivados, `src/core/derivados_travel.js`.

**Por qué.** Los bloques de delivery dicen "Rappi" y los de Travel tienen que decir "Rappi
Travel", que es otra sociedad, con otro NIT y con un Registro Nacional de Turismo.
Parametrizar el nombre de la entidad habría dejado un solo archivo capaz de cambiar los
dos documentos, y los de delivery ya están aprobados por Legal. Con archivos separados,
tocar Travel no puede tocar delivery.

## Los datos de Travel van planos en la fila del país

**Qué se decidió.** `travel_entidad`, `travel_rnt` y los demás son columnas, no un objeto
anidado.

**Por qué.** La pestaña `Paises` del Sheet es una tabla. Un objeto anidado se guardaría
como `[object Object]` en la ida y vuelta.

## Sin los datos de Travel del país, no se genera

**Qué se decidió.** `travelDisponible()` exige los nueve datos y el RNT vigente. Si falta
uno, no se genera y se dice cuál falta.

**Por qué.** Un T&C de agencia de viajes sin RNT vigente no cumple la ley 300 de 1996, y
uno sin política de datos deja al usuario sin saber quién trata sus datos. Es preferible
no generar a generar algo incompleto.

## Unas pocas preguntas cambian de texto según el tipo

**Qué se decidió.** `preguntaDe(campo, tipo)` resuelve una `variante` por tipo de campaña,
en vez de duplicar el campo.

**Por qué.** En delivery se habla de "pedido" y en Travel de "orden", y el segmento, el
pago, la carga y la redención tienen opciones distintas. Con campos duplicados, la misma
respuesta quedaría en dos columnas del Sheet y el histórico se partiría en dos.

## Los números tienen forma femenina

**Qué se decidió.** `letrasYCifraFemenino()`, usado para órdenes, unidades y noches.

**Por qué.** "Doscientos órdenes" está mal escrito en un documento legal. No se había
visto porque los modelos de delivery solo hablan de pedidos y de Créditos, que son
masculinos. El femenino es opt-in, así que ningún documento de delivery cambia.

## Skill de flujo y experiencia, y una sola lista de preguntas de arranque

**Fecha:** 17 de septiembre de 2026.

El filtro general siguió preguntando "¿Es una campaña de Rappi Travel?" después
de que esa pregunta se movió al paso de Campaña. Las dos mitades eran correctas
por separado, así que ninguna prueba lo vio: lo que estaba roto era el camino
completo, y con él toda la funcionalidad de Rappi Travel, que quedó inalcanzable.

Dos decisiones salieron de ahí:

1. **`.claude/skills/flujo-y-ux/`**, con el recorrido pantalla por pantalla, las
   reglas de experiencia y por qué existe cada una, y un script que recorre el
   flujo entero en la demostración y revisa los invariantes. Los defectos de
   flujo no los caza `npm test`, porque cada archivo pasa sus pruebas.
2. **Las tres preguntas de arranque (país, negocio, tipo) viven en una sola
   función**, `camposDeArranque()` en `src/client/js/62-pasos.js`. Estaban
   escritas dos veces, una con la pregunta del negocio y otra sin ella: la
   primera dibujaba la pantalla y la segunda decidía a dónde ir al pulsar
   Siguiente, así que Siguiente se saltaba el negocio y marcaba el tipo como
   respondido sin que nadie lo hubiera elegido.

## La pestaña Países se pone al día sola al correr setup

**Fecha:** 17 de septiembre de 2026.

`setup()` sembraba los países solo si la pestaña estaba vacía, y si tenía datos
la saltaba entera con un "no se tocó". Eso dejó un agujero real: la pestaña se
sembró antes de que existiera Rappi Travel, después se agregaron los dos tipos
de Travel y las nueve columnas `travel_*` a `data/paises.json`, y la fila de
Colombia del Sheet se quedó como estaba. En la app, elegir Rappi Travel en
Colombia decía que Travel no estaba habilitado, porque para la herramienta no lo
estaba.

Ahora `setup()` pone la pestaña al día, sin sobrescribir: la pestaña Países es de
Legal, y un valor escrito ahí manda sobre la semilla.

- `modelos`: se agregan los que la semilla tenga y la fila no. Nunca se quita
  ninguno, porque quitarlo pudo ser a propósito.
- Las demás columnas: se rellenan solo si la celda está vacía.
- Los países que no estén en la pestaña se agregan completos.

Del mismo caso salió otro arreglo: Google Sheets convierte sola en fecha una
celda que diga `2027-03-31`, y `travel_rnt_vence` es una de esas. Comparada como
texto, "Wed Mar 31 2027" nunca es mayor que "2026-09-17", así que el aviso de
vencimiento del Registro Nacional de Turismo no se disparaba nunca.
`paisDesdeFila()` vuelve a texto cualquier fecha que llegue del Sheet.

Y al elegir Rappi Travel, la pantalla de Legal ahora dice la razón exacta: no es
lo mismo que el país no tenga habilitados los tipos de Travel que los tenga pero
le falte el RNT. Lo segundo se arregla llenando el Sheet.

## El idioma del documento sale del país, y se enciende en un solo sitio

**Fecha:** 17 de septiembre de 2026.

La columna `idioma` existía en el Sheet desde el principio (`es` en ocho países,
`pt` en Brasil) pero no la usaba nadie. Ahora gobierna las piezas de forma del
documento: los meses, la hora, la conjunción de las listas y los números
escritos en letras.

Tres decisiones:

1. **El español no se toca.** Los números en portugués viven en
   `src/core/numeros_pt.js`, aparte. `numeros.js` delega cuando el idioma activo
   es otro, sin cambiar una letra de lo de abajo: los textos de Colombia están
   fijados por `docs/referencia/motor_prototipo.py` y una campaña de Brasil no
   puede moverlos. Hay una prueba que genera un documento de Brasil y después
   comprueba que Colombia sale idéntico.

2. **El idioma se enciende en `calcularDerivados`, y solo ahí.** Es el único
   punto por donde pasa todo lo que sale impreso, así que basta con fijar el
   idioma del país al entrar y devolverlo a español al salir. La alternativa era
   pasarle el idioma a cada una de las cincuenta y cuatro llamadas a fechas y
   números que hay en los derivados, lo que obligaba a tocar mucho texto legal
   aprobado. El `try/finally` de `conElIdiomaDe()` no es adorno: si un documento
   de Brasil revienta a mitad, el siguiente saldría con los meses en portugués.

3. **Si el idioma no existe, se cae a español.** Es el fallo seguro correcto:
   Colombia es el 99,7% de las solicitudes reales.

La hora en portugués se escribe `00:01` y `23:59`, con cero inicial y dos
puntos. Primero la escribí como `9h` y `23h59`, que es la convención
tipográfica brasileña, y la corregí al ver los cuatro T&C aprobados que mandó
Legal Brasil: el texto de Legal manda sobre cualquier convención.

Lo que **no** sale del idioma es el texto legal. Las cláusulas siguen en
`modelos/` y las frases fijas en `derivados.js`, y las traduce Legal.

## Brasil: un solo modelo, y una excepción escrita sobre el organizador

**Fecha:** 17 de septiembre de 2026.

**La excepción.** Los cuatro T&C aprobados de Brasil están escritos con Rappi
como quien concede, modifica y cancela la promoción, y no nombran a un
organizador distinto. Eso contradice la regla 1 de `CLAUDE.md`. Juan lo autorizó
como excepción explícita, solo para el modelo de Brasil. Quedó escrita dentro de
la propia regla 1, para que nadie la encuentre por casualidad y la tome como
precedente.

**Un modelo, no cuatro.** Los cuatro documentos son la misma estructura palabra
por palabra: las trece cláusulas de CONDIÇÕES GERAIS son idénticas y solo cambia
el tramo que dice qué recibe el usuario. Cuatro modelos habrían sido cuatro
copias que se desincronizan en cuanto alguien toque una.

**Reusar campos en vez de duplicarlos.** El tipo `promocao_br` trae solo dos
campos propios, la forma del beneficio y los medios de pago. Todo lo demás
(la tienda, las fechas, el mínimo de compra, el tope, el máximo de pedidos) reusa
los campos que ya significan lo mismo, con el mecanismo de `variantes` para que
la pregunta se lea distinta. Así no se duplican preguntas ni columnas de
auditoría.

El campo de la forma del beneficio se llama `beneficioBr` y no `formaBeneficio`
porque ese nombre ya existía en Rappi Travel con otras opciones, y la clave
duplicada hacía que la de Travel ganara en silencio.

**Brasil pasa de bloqueado a piloto**, que es el estado donde solo lo ve el
equipo de pruebas. Es reversible desde el Sheet.

**Las correcciones al texto.** Juan autorizó corregir el documento donde hubiera
oportunidad de mejora. El criterio que usé: corregir errores verificables
(erratas, palabras que no encajan, frases sin verbo, concordancias rotas,
ambigüedades que cambian el sentido, diferencias de forma entre los cuatro) y
**no tocar criterio jurídico**. Cada cambio está en `docs/CORRECCIONES_BRASIL.md`
con su antes y su después, y hay una prueba por cada uno para que no se
deshagan solos.

**El monto se escribe al revés que en Colombia.** En español va
"cincuenta mil pesos M/Cte. ($50.000)"; en los documentos de Brasil va
"R$300,00 (trezentos reais)", la cifra primero. Sale del idioma, no del país.

## Los T&C que Legal ya publicó (17 de septiembre)

**No generan documento, y por eso no son un tipo de campaña.** Un descuento o un
cupón en Colombia ya tiene su T&C publicado. Meterlo en `ESQUEMAS` habría
significado un modelo vacío, un esquema sin campos y un camino que termina sin
documento, o sea mentirle al motor. Los datos viven aparte, en
`data/tyc_genericos.json`, y la lógica en `src/core/tyc_genericos.js`.

**El comercial llega desde la lista de tipos**, no desde el menú ni desde la
ayuda. Ahí es donde busca su campaña y donde hoy se daba por vencido: no
encontraba "descuento", cerraba y le escribía a Legal. La tarjeta va debajo de
los tipos, separada por una línea y con su propio encabezado, porque no es un
tipo más: los demás generan un documento y este entrega un enlace.

**Solo aparece donde hay algo que dar.** Si el país no tiene T&C generales
publicados (hoy todos menos Colombia), o si el negocio es Rappi Travel, la
tarjeta no se dibuja. Ofrecer un camino que muere cinco pantallas después es la
peor versión.

**La vigencia manda.** Un T&C vencido sigue estando en la lista de Legal. La
Tarifa de Servicio Gratis vence el 31 de octubre de 2026 y las demás el 31 de
diciembre, así que a partir del 1 de noviembre esa tarjeta se queda a la vista,
deshabilitada, diciendo cuándo venció y a quién escribirle. Deshabilitada y no
escondida: si desapareciera, el comercial creería que la herramienta no la tiene
y volvería a pedírsela a Legal, que es justo lo que se quiere evitar.

**Lo que el Excel trajo mal se muestra, no se arregla.** El mismo T&C aparece dos
veces con enlaces distintos y dos filas llegaron sin descripción. Elegir cuál
enlace es el bueno o escribir la descripción que falta sería decidir por Legal
sobre un documento que se publica. Los dos quedan en la lista con un aviso, y lo
que hay que resolver está en `docs/PENDIENTES_LEGAL.md` y en el campo
`revisiones` del propio archivo de datos.

**Los identificadores son estables y no salen del nombre.** El duplicado de la
fila 16 se llama `descuento_productos_seleccionados_bis` porque comparte nombre
con el de la fila 4. Si mañana Legal retira uno de los dos, el otro conserva su
identificador y no hay que tocar nada más.

**El dato entra a `MotorCliente.html`.** La pantalla se pinta entera en el
navegador, así que `data/tyc_genericos.json` se convierte en `dist/TycGenericos.js`
y el build lo mete dentro del HTML del motor, como los modelos y los países. Un
archivo suelto en `dist/` es del servidor y el navegador nunca lo ve: esa es la
frontera 2, y ya dejó una pantalla sin una sola opción que ofrecer.

## La revisión crítica del 17 de septiembre: doce decisiones técnicas

**Fecha:** 17 de septiembre de 2026.

1. **Los mensajes de validación salen en el idioma de la interfaz.**
   `validarSolicitud` recibe `contexto.idioma` y `mensajeDe()` busca el mensaje
   escrito para la pregunta (`errores.vacio`, `pasado`, `orden`, `cero`,
   `rango`...) en ese idioma, con el genérico solo de respaldo. Antes solo se usaba
   `vacio`, y el resto se armaba a mano. El servidor sigue validando en español:
   es la red de seguridad, no la pantalla, y el cliente ya validó antes.
2. **Las traducciones de preguntas tienen variantes por tipo**, con la misma
   estructura de `PREGUNTAS`: `PREGUNTAS_PT.tope.variantes.promocao_br`. Lo que va
   en la raíz vale para cualquier tipo; "em reais" y "parceiro" son de Brasil.
   `preguntaEnIdioma` recibe el tipo, y `estado.pregunta()` lo pasa dos veces a
   propósito.
3. **Un número dentro de un texto traducido va como marcador `{n}`**, nunca como
   una palabra del idioma que luego se reemplaza. "Faltam varios dados" sin tilde
   sostenía el `replace('varios', n)`: corregir la ortografía borraba el número.
4. **Cada llave de `TEXTOS_PT` tiene que aparecer literal en el código, y ningún
   texto visible del cliente con traducción se escribe sin `T()`.** Las dos cosas
   son pruebas mecánicas en `pruebas/interfaz_pt.test.js`, porque un carácter de
   diferencia entre la llave y el literal deja la traducción muerta sin avisar.
   De ahí que los textos largos vayan en un solo literal y no partidos con `+`.
5. **Un `var` no se declara dos veces en la misma función.** Hay un detector en
   `pruebas/duplicados.test.js` que cuenta ámbitos de función a mano y corre sobre
   el cliente, el core y el servidor. También detecta llaves repetidas en los
   diccionarios de portugués.
6. **Las fechas y horas fuera del documento se escriben con el idioma del país**
   (`formatearFechaDelPais`, `formatearHoraDelPais`). El idioma activo solo se
   enciende al calcular el documento; las respuestas plegadas y el resumen tienen
   que pedirlo aparte.
7. **El idioma también envuelve la expansión de tiendas** en el motor. La promesa
   de "todo lo impreso pasa por `calcularDerivados`" no cubría `[[#TIENDAS]]`.
8. **Un modelo en otro idioma lo declara en su esquema (`idioma: 'pt'`) y la
   validación exige que la fila del país coincida.** Si la celda `idioma` está
   vacía o dice otra cosa, no se genera. Caer a español en silencio es lo que
   hubiera publicado un T&C en portugués con "1 de octubre de 2026 às 12:01 a. m.".
9. **Las variantes de Brasil llevan sus propios placeholders**, los del modelo
   brasileño. Heredar los de Colombia hacía que "Así queda en tu T&C" mostrara
   valores que el documento no usa. Hay una prueba que compara cada placeholder
   prometido con el texto del modelo.
10. **Brasil tiene casos dorados** (`BR01` a `BR04`, uno por forma del beneficio).
    Un cambio en un bloque brasileño ya no pasa en verde por casualidad.
11. **Los T&C generales distinguen "existe" de "se puede usar hoy"**
    (`hayTycGenericosUsables`). Un T&C vencido se queda a la vista con
    `aria-disabled`, no con `disabled`, para que el teclado y el lector de
    pantalla lo encuentren; y lo que Legal dejó pendiente se dice antes del
    enlace, no después.
12. **Las capturas se regeneran con un script de la skill**
    (`capturar-pantallas.js`), que además deja `textos.json` con el texto literal
    de cada pantalla. El encargo de la interfaz se arma desde ahí, no a mano, así
    que siempre describe la versión que se está revisando.
13. **La fecha de fin de una campaña sale del esquema, no de la entrada.** Un
    tipo que no pregunta `fechaFin` (el cashback por ETA es de un solo día)
    termina el día que empieza: `fechaFinDeLaCampana(entrada, esquema)`. Leer
    `entrada.fechaFin` era leer un dato que la interfaz fijaba una vez y nunca
    actualizaba. El servidor y la demo guardan `fecha_fin` con esa función, y un
    tipo sin tienda guarda la tienda vacía aunque quede una de otro intento.
14. **`tieneValor` vive una sola vez, en `texto.js`.** Estaba en tres archivos de
    derivados; en Apps Script las tres copias se pisaban en silencio. Una prueba
    de `build.test.js` prohíbe dos funciones de nivel superior con el mismo
    nombre entre `src/core/` y `src/server/`.
15. **Los detectores de `duplicados.test.js` son expresiones regulares, no un
    analizador sintáctico.** Un analizador de verdad necesitaría una dependencia
    (acorn) o `--expose-internals`, y el proyecto no tiene dependencias. Se
    aceptan sus límites (vacía cadenas y comentarios antes de contar, en ese
    orden) y cada falso negativo que aparezca se agrega como caso.
16. **Ampliar valida con `ampliacion: true`.** Al rearmar el documento de una
    campaña en curso, el inicio en el pasado y la primera comunicación de Travel
    que ya salió no son errores. Las demás reglas siguen: fin después del inicio,
    tope contra presupuesto, RNT vigente.
17. **"Usar como base" y toda solicitud nueva pasan por `sinRastroDeAmpliacion`**:
    sin `modificaciones` ni `sufijoNombre`. Se aplica en el servidor
    (`datosDeSolicitud`, `previsualizar`, `generar`) y en la demo, no en la
    pantalla, porque es una frontera. El campo `nombreCampana` ya no se copia con
    " (copia)": nadie lo leía.
18. **`por_confirmar_en_pruebas` se pone al día como `modelos`**: unión de la hoja
    con la semilla. Esa columna la mantiene la herramienta. Lo que se quite de la
    semilla hay que quitarlo también de la hoja, como con los modelos.
19. **Las notas internas se cazan con tres patrones**: una palabra de nota entre
    paréntesis o corchetes con lo que sea alrededor, las marcas de programador
    solo en mayúsculas (TODO, TBD, FIXME, XXX, PENDIENTE), y los signos de duda y
    la sintaxis de los modelos. "todo el territorio" y "puedes revisar" no cuentan.
20. **El equipo se valida de verdad.** El país tiene que existir en la pestaña
    Paises y el rol en `ROLES`; una persona con `activo` en "no" se reactiva en
    su misma fila, desde la pantalla y desde la carga masiva; los correos pegados
    se sacan por su forma (`separarCorreos`, en `paises.js`), y
    `correoEsDelDominio` exige la forma completa `algo@rappi.com`. Las dos
    funciones viven en el core para que la demostración use exactamente las
    mismas.
21. **Cada archivo del cliente es su propio ámbito y solo comparte por `RM.algo`.**
    Ya estaba en la skill de fronteras, y aun así una función de `62-pasos.js` se
    llamó desde `66-resumen.js` y reventó en el navegador, no en `npm test`.
    `pruebas/cliente.test.js` caza la llamada directa a una función de otro archivo.
22. **La demostración tiene que simular todo lo que la interfaz pide.**
    `pruebas/demo.test.js` compara cada `RM.servidor.llamar('x')` del cliente con
    el servidor simulado de `scripts/demo.js`.
23. **Un modelo en español no se genera en un país que escribe en otro idioma.**
    `validarIdiomaDelPais` revisa las dos direcciones: el modelo en portugués
    exige `pt` en la fila del país, y un país con `pt` rechaza los modelos en
    español hasta que exista el modelo en portugués.
24. **El front se documenta congelando la aplicación, no describiéndola.**
    `npm run front` arma la demostración, la recorre con un navegador sin
    interfaz y guarda el DOM de cada pantalla en `docs/FRONT_ACTUAL.html`. Se
    eligió eso, y no capturas ni un documento escrito a mano, porque el archivo
    se sube como contexto a Claude chat: una imagen no se puede leer como texto
    y un resumen se desactualiza en silencio. Lo que se lee ahí es el texto
    literal de la interfaz, y el archivo se vuelve a generar de cero.
25. **La hoja de estilos se acota a un marco por pantalla**
    (`scripts/lib/estilos-acotados.js`). Cuarenta y cuatro pantallas en un mismo
    documento comparten una sola hoja de estilos, así que cada regla se
    reescribe para valer solo dentro de `.rm-pantalla`: `body` y `html` pasan a
    ser el marco, `position: fixed` pasa a `absolute` y `100vh` pasa a una
    variable del marco. Las reglas de `@media (max-width: 900px)` se acotan a
    `.rm-pantalla.rm-celular`, no al ancho de la ventana, porque si no una
    ventana angosta volvería celulares a las pantallas de escritorio. Una
    consulta de ancho que el acotador no conozca revienta el build en vez de
    colarse.
26. **El archivo de contexto no lleva JavaScript.** Es HTML inerte: se abre con
    doble clic, se puede subir a un proyecto de Claude chat y no depende de que
    nada corra. Por eso el valor de cada campo se pasa a atributo antes de
    serializar, y por eso la pantalla final se captura en su versión de
    producción y no en la de la demostración.


## Aplicar la respuesta al encargo 01 (18 de septiembre)

Decisiones técnicas que hubo que tomar para meter al repositorio lo que
`docs/encargos/respuestas/01-legal.md` trajo con texto exacto. Ninguna redacta
texto legal: todas deciden dónde vive una frase que Legal ya escribió, o cómo se
elige entre dos frases que Legal ya escribió.

27. **La verificación de elegibilidad es un derivado, no una línea fija del
    modelo.** La decisión 18 de Legal dice que con carga inmediata la
    verificación pasa a ser posterior y con reversión, y que con "al día
    siguiente" o "en una fecha" la frase se queda como está. Esa frase vivía
    escrita dentro del bloque compartido `acreditacion`, que usan Cashback,
    Cashback Multitienda y el ETA. Se sacó a `{{TEXTO_VERIFICACION}}` y la
    elige `textoVerificacion(entrada)` en `src/core/derivados.js`. Se hizo así,
    y no con un bloque nuevo por cada carga, porque el condicional depende de
    una respuesta del formulario y no del modelo: duplicar el bloque habría
    obligado a mantener la misma cláusula en tres archivos. En Travel es lo
    mismo con `{{TEXTO_VERIFICACION_TRAVEL}}` y la carga "al confirmarse".
    Las dos respuestas de la pregunta de la carga declaran ahora ese
    placeholder, así que "Así queda en tu T&C" muestra las dos frases que la
    respuesta produce, no solo una.
28. **"Solo vuelos" y "sin vuelos" se leen de las categorías marcadas, y solo
    cuando no hay duda.** La decisión 43 parte la frase del ámbito de Travel en
    cuatro según las categorías. El repositorio ya tenía una noción de "hay
    aéreas" (`hayAereasDeTravel`, el grupo Vuelos + Paquetes) que es la que
    decide si se preguntan la aerolínea y el trayecto. Para el ámbito se usó un
    criterio más estrecho: "solo vuelos" es la categoría Vuelos y nada más, y
    "sin vuelos" es que no haya ninguna categoría del grupo aéreas. Todo lo
    demás, incluido un Paquete solo, se queda con la frase completa de hoy, que
    es la aprobada. Razón: un Paquete lleva vuelo y alojamiento, así que
    cualquiera de las dos frases cortas le quitaría una mitad al documento,
    mientras que la larga nombra las dos. Acortar de menos deja el texto de hoy;
    acortar de más publica una cláusula que no cubre lo que se vendió.
29. **Un país en piloto nunca se queda sin pendientes.** Legal confirmó los
    cuatro datos que ocho países tenían marcados, así que la lista de
    `por_confirmar_en_pruebas` se habría vaciado para seis de ellos y el aviso
    del resumen habría desaparecido. En su lugar entra una llave nueva,
    `visto_bueno_legal_local`, que es literalmente lo que sigue pendiente según
    la propia respuesta (línea 511 y nota de la respuesta 7). Ecuador y Costa
    Rica conservan además `separador_miles`. Colombia, que está activo y no
    lleva aviso, sí quedó con la lista vacía: sus tres datos de Travel los
    confirmaron Juan (el RNT y su vencimiento) y Legal (la entidad que lo
    vigila). Está anotado en `docs/PENDIENTES_LEGAL.md` por si Juan prefiere
    vaciar la lista del todo.
30. **`setup()` no limpia la pestaña Países, y ahora hay una prueba que lo
    dice.** Esa columna solo crece: `listasUnidas` une lo de la hoja con lo de
    la semilla, y para las demás columnas la hoja manda sobre la semilla. Es
    decir que cambiar `data/paises.json` no cambia una fila que ya existe.
    Cuando Legal confirma un dato hay que borrarlo a mano en la pestaña Países.
    Se dejó escrito en una prueba de `pruebas/servidor.test.js` para que nadie
    dé por hecho que desplegar y correr `setup()` pone la hoja al día.
31. **Los casos dorados que cambian se regeneran, pero el cambio se lee línea a
    línea antes de escribirlo.** Catorce de los dieciocho `salidas_esperadas`
    cambiaron con esta respuesta. Se regeneraron con un script de un solo uso
    que imprime el antes y el después de cada línea distinta, y ese listado es
    lo que va al reporte para Juan. Regenerar sin mirar convierte el caso dorado
    en un espejo del motor y deja de proteger nada.

## 18 de septiembre · Al aplicar la respuesta del encargo 02

27. **El recorrido del front cuenta "hoy" con el reloj de la página, no con el
    del contenedor.** `scripts/lib/front-recorrido.js` armaba la campaña de la
    pantalla 36 con la fecha de Node, y el navegador del recorrido corre en
    `America/Bogota`. Entre medianoche y las cinco de la mañana UTC no son el
    mismo día: la campaña arrancaba "mañana" para la página, "en curso" no se
    cumplía, el botón Ampliar no se dibujaba y la pantalla desaparecía del
    archivo. Salían 43 de 44 y `npm test` lo cazaba, pero solo si el recorrido
    se corría de madrugada. Ahora el día y el año salen de
    `RM.estado.estado.configuracion.hoy`, que es el mismo reloj que decide si el
    botón sale, así que no se pueden desalinear. `finDelAno()` se fue con la
    misma causa.
28. **Cuando un botón cambia de palabra, la llave del diccionario se va con
    él.** El botón del resumen pasó de "Editar" a "Cambiar", y `'Cambiar'` ya
    estaba traducido (`'Alterar'`) porque lo usa `50-campos.js`. Dejar la llave
    `'Editar'` habría sido una traducción muerta, y renombrarla habría dejado
    dos `'Cambiar'` en el mismo objeto, con el segundo pisando al primero: el
    KAM de Brasil vería "Cambiar" en español. Se borró la llave vieja.
29. **La prueba que cita un texto de la interfaz se actualiza en el mismo
    cambio que el texto.** Tres sitios citaban una frase literal que la
    respuesta del encargo 02 cambió: `pruebas/front.test.js` (el porcentaje),
    `pruebas/ayuda.test.js` (la alternativa cuando un contacto no tiene correo)
    y el recorrido de la skill (el atajo a los T&C publicados). Se cambió la
    cita, no lo que la prueba vigila.

## 18 de septiembre · Las decisiones de Juan sobre el encargo 01

28. **Un valor que Legal confirma llega solo a la pestaña Paises.** La regla de
    que la hoja manda sobre la semilla sigue en pie: protege lo que Legal edita a
    mano. Lo que no tenía solución era el camino contrario. Cuando Legal confirma
    un valor respondiendo un encargo, ese valor entra al repositorio y se quedaba
    esperando a que alguien lo copiara celda por celda en el Sheet, que es como
    una fila se queda vieja para siempre.

    Ahora `data/paises.json` declara tandas de confirmaciones con un id y la
    lista de columnas que cubre, en la forma `MX.texto_derechos_datos`. El valor
    sale de la semilla, no se repite en la declaración, así que no hay dos copias
    que se puedan separar. `setup()` escribe cada tanda una sola vez y guarda el
    id aplicado en las propiedades del script: correr `setup()` diez veces no
    revive un valor que Legal haya corregido después. La primera tanda es
    `encargo-01-2026-09-18`, con 28 columnas.

29. **Nadie pide el visto bueno del abogado de cada país.** La sesión del encargo
    01 había agregado `visto_bueno_legal_local` como pendiente nuevo de los ocho
    países en piloto, para que la lista no quedara vacía. Juan decidió no correr
    ese circuito. El pendiente se quitó, y seis de los ocho países quedan sin un
    solo dato por confirmar. Que un país esté en piloto no depende de esa lista:
    depende de la columna `estado`, que solo Juan cambia en el Sheet.

30. **El máximo de pedidos del Cashback Multitienda se cuenta por tienda**
    (decisión 20 de la respuesta). Son varias tiendas en una misma jornada, cada
    una con su presupuesto, así que un límite único repartía mal el beneficio. La
    cláusula y la ayuda de la pregunta lo dicen ahora con esas palabras, y el
    caso dorado `CD01` quedó regenerado.

## 18 de septiembre · Seis países salen de piloto

31. **El estado de un país viaja en una tanda de confirmaciones, no a mano.** La
    pestaña Paises manda sobre la semilla, así que cambiar `estado` en
    `data/paises.json` no mueve una fila que ya existe: Juan habría desplegado,
    corrido `setup()`, y México le seguiría saliendo solo al equipo de pruebas.
    La tanda `estados-2026-09-18` declara `MX.estado`, `PE.estado`, `AR.estado`,
    `CL.estado`, `UY.estado` y `BR.estado`, y el valor sale de la semilla, que es
    la única copia. Se aplica una sola vez: si Juan vuelve a cerrar un país a
    mano, correr `setup()` otra vez no lo reabre. Las dos pruebas nuevas de
    `pruebas/servidor.test.js` corren ese camino entero contra una hoja vieja, y
    la primera falla si se quita la tanda.
32. **El país en piloto de las pruebas pasó de México a Ecuador.** Diez pruebas
    usaban México, y una Brasil, como ejemplo de "país en piloto". Al salir los
    dos a activo, esas pruebas dejaban de probar lo que decían probar, no de
    pasar: `validarPais(MX, false)` empezaba a devolver `null`. Se movieron a
    Ecuador, que sigue en piloto porque nadie ha dicho cómo escribe los miles. El
    caso `MX02` se mudó entero y ahora se llama `EC01`, con un RUC ecuatoriano
    ficticio de sociedad privada (`1791234561001`) que pasa el dígito verificador.
33. **Lo que el navegador comprueba se mudó con las pruebas.** Los dos recorridos
    y el generador de `docs/FRONT_ACTUAL.html` elegían México para ver el aviso de
    país en pruebas. Ahora eligen Ecuador, y además se agregaron dos
    comprobaciones nuevas del lado contrario: que México, ya activo, **no** lleve
    el aviso, y que Brasil tampoco. Sin eso, sacar un país de piloto por error
    habría pasado sin que nadie lo viera.
34. **La traducción del aviso de pruebas se quedaba sin nadie que la mirara.**
    Brasil era el único país que lee en portugués y el único en piloto que lo
    leía, así que al activarlo la frase "está em testes" dejó de aparecer en todo
    el recorrido en portugués. La frase sigue viva (un abogado de Brasil con rol
    legal puede entrar a probar Ecuador), pero ninguna comprobación la miraba. Se
    agregó una al final de `recorrer-en-portugues.js` que elige Ecuador con la
    interfaz en portugués y confirma que el aviso sale traducido.

## 18 de septiembre · Las leyendas de piezas publicitarias (encargo 03)

35. **El catálogo de leyendas vive en `modelos/leyendas/`, una por archivo.** Son
    texto legal, así que viven donde vive el texto legal y no dentro del código.
    Se extrajeron del bloque PARA EL REPOSITORIO de la respuesta sin escribir una
    sola letra a mano, y hay una prueba que compara letra por letra el
    repositorio contra la respuesta. Si alguien "mejora" una frase o arregla una
    tilde, se cae.
36. **A los complementos se les agregaron dos llaves que la respuesta no traía.**
    `categoria_id`, que es el identificador estable, y `se_elige_en`, que dice si
    la categoría se pregunta, si sale de que la campaña ya sea de Turbo, o si
    está en el catálogo pero la herramienta no llega ahí todavía. Son metadatos
    de la ficha, no texto legal: el cuerpo de cada leyenda quedó intacto.
37. **Las opciones de la categoría salen del catálogo, no de una lista escrita a
    mano.** Un país ofrece las categorías para las que tiene leyenda. Agregar la
    leyenda de una categoría nueva la pone sola en la pregunta, y una categoría
    sin leyenda no se puede elegir, que es lo correcto porque no tendría nada que
    imprimir. Es la misma regla que ya usan las columnas del Sheet, que salen de
    los esquemas.
38. **El largo máximo lo pone el formato de pieza, no la leyenda.** La respuesta
    declara un `largo_max` por leyenda, pero la misma leyenda de Carrera sirve
    para letra pequeña (620) y para banner corto (300). Con un solo número, un
    banner de Carrera de 500 caracteres pasaba por bueno. Los cinco límites salen
    de la sección 7C.
39. **Las tres preguntas de la pieza no bloquean el documento.** El T&C no usa la
    categoría ni el registro sanitario para nada, así que quien solo quiere su
    documento lo tiene. Lo que bloquean es la leyenda, y se dice con su razón.
    Hay una prueba que compara el documento con categoría y sin ella, letra por
    letra.
40. **Un marcador que espera una decisión se entrega como pendiente, no como
    error.** La leyenda de push necesita el enlace corto, que Juan aprobó pero
    cuya forma exacta no está definida. Si contara como error se caerían con ella
    las otras cuatro leyendas de la campaña.
41. **Donde la respuesta no dio frase, no se escribe una.** Si los Créditos se
    redimen en ciertas secciones, si la campaña es de consumo en el local sin
    nombre de modalidad, si en Carrera gana quien haga más pedidos, o si falta el
    registro sanitario de un medicamento, la campaña no entrega leyenda y dice
    qué falta. Son los insumos 3, 4 y 5 de la lista 3 de la respuesta.
42. **`dist/LeyendasCatalogo.js` se llama así y no `Leyendas.js`.** Apps Script no
    distingue mayúsculas en los nombres de archivo y habría pisado a
    `leyendas.js`, que es el motor. Lo cazó `revisarColisionesDeNombre()`.
43. **Un alias de `require` que se llama distinto al global queda sin definir
    fuera de Node, y ahora hay una prueba que lo caza.** Los archivos de
    `src/core/` comparten un solo ámbito en Apps Script y en el navegador:
    `var formatearFecha = require('./fechas.js').formatearFecha` no se ejecuta
    allí, pero no hace daño porque `var` vuelve a declarar un nombre que ya
    existe sin pisarle el valor. Ponerle otro nombre sí: `var formatearFechaLey`
    crea un nombre que nadie asigna nunca. Pasó de verdad, con nueve alias, y la
    pantalla final se quedó sin leyendas con "tieneValorLey is not a function".
    La prueba nueva de `pruebas/build.test.js` revisa solo dentro del bloque de
    `require`, porque fuera de él un nombre distinto es una variable local
    cualquiera.
44. **Las tres columnas nuevas del país van al final.** `ruta_promos`,
    `url_tc_pro` y `nombre_modalidad_local`. Mover una columna que ya existe
    desalinearía todo el histórico. Las tres empiezan vacías salvo en Colombia, y
    una columna nueva se rellena sola desde la semilla porque la celda está
    vacía: no hace falta una tanda de confirmaciones.
45. **La barra de pasos se envuelve en dos filas.** Con seis pasos entraba justa;
    al entrar el séptimo, "Organizador" y "Cuándo" se leían pegados, como una
    sola palabra. Solo se vio abriendo el navegador.

## 18 de septiembre · Cómo se empuja el código, de ahora en adelante

46. **Claude Code empuja directo a `main`.** Juan lo autorizó por escrito el 18 de
    septiembre, con estas palabras: "de ahora en adelante, siempre que lo
    consideres, ve pusheando a main. yo jamás voy a revisar código, confío en ti".
    Se acabaron las ramas de trabajo y los pull requests para esto: no aportaban
    nada, porque nadie los iba a leer.

    Lo que eso cambia de verdad es dónde está la red de seguridad. Antes había, en
    teoría, una revisión humana al final; ahora no la hay, así que la única barrera
    entre un defecto y producción son las pruebas. De ahí que la regla de
    `CLAUDE.md` de correr `npm test` antes de cada push deje de ser una costumbre y
    pase a ser lo que sostiene todo, junto con los dos recorridos de navegador
    cuando el cambio se ve en pantalla. Cada push a `main` dispara además el
    workflow, que vuelve a correr las pruebas y hace `clasp push`: si las pruebas
    fallan, el código no sube.

    Y una consecuencia que conviene tener presente: un cambio que las pruebas no
    cubren es un cambio que nadie está mirando. Cuando toques algo que no se pueda
    probar, dilo en el reporte con todas las letras en vez de darlo por bueno.

## 18 de septiembre · El acuerdo de transferencia de datos

47. **La pregunta del acuerdo sale con la misma condición que la cláusula de
    datos, y hay una prueba que lo amarra.** Las dos dependen de que el premio
    sea físico y lo entregue el Organizador. Si se separan, la herramienta
    pregunta por un acuerdo que el documento no necesita, o transfiere datos sin
    haber preguntado nunca. La prueba recorre las cuatro combinaciones de premio
    y entrega y exige que las dos respuestas coincidan.
48. **El acuerdo no bloquea el T&C.** Los datos del ganador salen semanas
    después, cuando el concurso terminó, así que un comercial que todavía no lo
    tiene firmado genera su documento igual y lo que recibe es el camino para
    firmarlo. Es lo que dice la decisión 36 (i) de la respuesta del encargo 01, y
    es la razón por la que la pregunta no es un filtro.
49. **La respuesta no cambia una coma del documento**, y hay una prueba que
    compara los tres casos letra por letra. Lo que se firma es un contrato entre
    Rappi y la marca, no algo que el usuario deba leer en el T&C.
50. **El panel es un bloque, no una frase, y el aviso de un campo ahora acepta
    las dos cosas.** El circuito de Colombia son un título y diez pasos
    numerados, que como frase no se lee. Pasarlo por el `aviso` de siempre lo
    imprimía como "[object HTMLDivElement]", porque ese camino convertía a texto.
51. **`appendChild(null)` tumba la pantalla final.** El aviso del acuerdo solo
    sale en Carrera, así que en un cashback devolvía null, y lo que veía el
    comercial era "No pudimos generar el documento" sobre un documento que sí se
    había generado. Ahora los dos bloques condicionales de esa pantalla pasan por
    `agregarSiHay()`. Lo cazó el recorrido de navegador, no `npm test`.
52. **Los enlaces de los modelos de acuerdo se leen de la respuesta, no se
    transcriben.** Y hay una prueba que los compara contra
    `docs/encargos/respuestas/01-legal.md`: un enlace que alguien "arregla" a
    mano manda al comercial a un documento que no es el que Legal aprobó. Misma
    idea que la prueba del texto de las leyendas.

## 18 de septiembre · Un solo enlace, y tres cosas que vio Juan

53. **El enlace es uno solo y es el mismo en todas partes.** Juan lo decidió el
    18 de septiembre: "el enlace para todo tiene que ser el mismo". Así que
    `URL_CORTA` ya no espera una dirección corta distinta: vale la dirección del
    T&C de la campaña, la misma que va en la letra pequeña y en el texto de
    apoyo. Con eso `PENDIENTES_POR_MARCADOR` quedó vacío y la leyenda de push y
    SMS se entrega, no se retiene. En los casos dorados mide 89 caracteres
    contra un límite de 70, de los cuales el enlace son 51: sin el enlace son 38
    y cabe de sobra. La pantalla lo dice; Juan avisó que en push y SMS casi nunca ponen el
    enlace, así que quien arma la pieza decide si lo quita. La constante se dejó
    en el archivo, vacía y con la explicación al lado, porque el día que un
    marcador vuelva a depender de un dato que nadie ha dado, el mecanismo ya
    está.
54. **Cuando una leyenda no cabe, la pantalla dice por cuánto y cuánto pesan los
    enlaces.** Antes solo decía que no cabía. Ahora `armarLeyenda` devuelve
    `sobra`, `enlaces` y `caracteresEnEnlaces`, y el resumen imprime "Se pasa por
    22 caracteres. Los enlaces ocupan 148 de los 642." Es el dato que hace falta
    para decidir lo que está abierto en `PENDIENTES_LEGAL.md`: si el problema es
    el límite, el enlace o el texto.
55. **El botón del modelo de acuerdo se armó en su propia función.** El panel de
    Colombia devolvía antes de llegar al botón, así que el único país donde la
    herramienta se usa hoy era justo el único que no veía el enlace de Drive, que
    es la razón por la que el panel existe. Lo vio Juan usando la herramienta, no
    las pruebas ni los recorridos. Ahora `botonDelModeloDeAcuerdo(pais)` se llama
    desde las dos ramas, y hay una prueba estática que lee el archivo y falla si
    vuelve a aparecer un `return` antes del botón.
56. **El error del NIT dice cuál es el dígito correcto.** Juan probó
    `900.898.545-1` y la herramienta solo decía que no era válido. El número
    efectivamente no lo es (para 900.898.545 el dígito es 0), pero con el mensaje
    viejo no había forma de saber si el error estaba en el dígito o en el cuerpo.
    Ahora el mensaje nombra el dígito que corresponde y pide revisar el número
    completo, que es lo que hace falta cuando alguien copió mal una cifra.

## 18 de septiembre · La revisión general, antes de la etapa de diseño

57. **La concordancia de número la resuelve el motor, no el modelo.** Ocho
    frases salían en plural cuando la respuesta era 1 ("un (1) días calendario",
    "una (1) noches", "las una (1) unidades"). Ninguna prueba lo veía porque
    ningún caso dorado responde 1 a esas preguntas, y la red de seguridad del
    motor tampoco: esas frases no tienen ningún signo roto, están bien formadas
    y mal escritas. Se arregló donde el motor arma la frase entera, y el término
    de días del país lo pone en singular `terminoDeDias()` en `src/core/texto.js`,
    con una regla mecánica sobre cada palabra (lo que termina en "es" pierde el
    "es", lo que termina en "s" pierde la "s"). Con dos o más, la salida es
    carácter por carácter la de antes: los treinta y dos casos dorados no
    cambiaron. La que queda es la del plazo de confirmación de la Carrera,
    porque el artículo y el adjetivo viven dentro de la cláusula; está en
    `docs/PARA_DECIDIR.md`, punto A4.

58. **El mínimo de una pregunta numérica vive en el esquema, no en una
    validación escrita a mano.** Cinco preguntas tenían su mensaje de "tiene que
    ser mayor que cero" escrito en `preguntas.js` y nadie lo disparaba, porque
    el esquema no declaraba `minimo`. El documento se generaba diciendo "igual o
    superior a cero pesos M/Cte. ($0)" o "Cada ganador recibirá cero (0)
    Créditos". Es la misma regla que Brasil ya cumplía en sus seis preguntas
    numéricas y los demás tipos no. Ahora todo número declara su mínimo, salvo
    el tope y el presupuesto, que tienen una revisión cruzada propia porque su
    mensaje explica la relación entre los dos. Una prueba lo vigila sobre el
    esquema, para que un tipo nuevo no nazca con el agujero.

59. **Un fallo de Google se traduce una sola vez, en la frontera del
    transporte.** Las nueve pantallas que muestran un fallo imprimían el texto
    crudo de Apps Script, en inglés y con palabras de Google. El comercial leía
    "No pudimos generar el documento: Lock timeout: another process was holding
    the lock for too long.", que además es el caso más probable (dos personas
    generando a la vez) y el más fácil de resolver (esperar diez segundos).
    `src/core/mensajes_de_falla.js` lo convierte en un paso siguiente, y se
    aplica en `RM.servidor.llamar`, que es donde el fallo cruza de mundo. Un
    arreglo por pantalla se olvida en la siguiente. Lo que no reconoce se
    entrega con el texto de Google al lado: esconderlo dejaría sin diagnóstico a
    quien tenga que mirarlo.

60. **Si la generación se cae después de crear el documento, el documento se va
    a la papelera.** El consecutivo y el nombre de la campaña salen del Sheet.
    Si el Sheet se caía después de crear el Doc, el Doc quedaba suelto en la
    carpeta del país y la siguiente generación sacaba el mismo número y el mismo
    nombre: dos documentos idénticos, "RM-20260916-0001" los dos, y nadie puede
    saber cuál es el bueno. Ahora se descarta el documento, el fallo queda en la
    pestaña Registro, y lo mismo al ampliar. A la papelera y no borrado, porque
    es reversible durante treinta días.

61. **Los dobles de Google saben fallar a pedido.** `mundo.fallar` tumba el
    bloqueo, la creación del documento, el correo, el añadido de filas o la
    escritura, y con `hojaSolo` o `escrituraSolo` se puede tumbar una sola
    pestaña. Sin eso, del servidor solo se probaba el camino feliz y nadie sabía
    si el comercial acababa con un registro a medias. Es lo que permitió
    reproducir el defecto 60 en Node antes de arreglarlo, que es la regla de la
    skill de fronteras.

62. **Al cambiar de pantalla, el título recibe el foco y se anuncia.** La
    aplicación redibuja el `<main>` entero en cada cambio; medido en el
    navegador, la región de anuncios quedaba vacía y `document.activeElement`
    volvía al `<body>`. El lector de pantalla no decía nada y el tabulador
    arrancaba otra vez desde la barra de arriba, en cada pantalla. Va en `ir()` y
    **no** en `dibujar()`, que corre con cada respuesta dentro de la misma
    pantalla: ahí mover el foco se lo quitaría al campo que la persona está
    llenando. El anillo del título solo se quita cuando el foco lo pone el
    código (`:focus-visible`).

63. **Una opción que el país no puede cumplir se bloquea con su razón, no se
    esconde.** "En ciertas secciones de Rappi" necesita los nombres de las
    secciones de la app, que el documento imprime entre comillas, y esa lista
    solo existe para Colombia. En los cinco países activos restantes el
    comercial elegía la opción y quedaba delante de una pregunta sin una sola
    casilla, con una validación imposible de cumplir. Se usa el mecanismo que ya
    existía (`opcionesDeshabilitadas`), el mismo del desempate. Deshabilitada y
    no escondida por la misma razón que los T&C vencidos: si desapareciera, el
    comercial creería que la herramienta no sabe hacerlo.

64. **Las pruebas que necesitan un documento de verdad arman la solicitud con un
    solo constructor.** `pruebas/dobles/solicitudes.js` llena todas las
    preguntas obligatorias visibles de cualquier tipo en cualquier país. Existe
    porque los defectos de concordancia y de límites solo se ven en el texto
    final: una prueba que llame a la función suelta pasa igual con el defecto
    puesto. Los números que la prueba no pide salen en cuatro y no en uno, para
    que ningún singular se cuele sin que la prueba lo haya pedido.

65. **Lo que se puede vigilar de la accesibilidad sin navegador es que el
    mecanismo siga enchufado.** El comportamiento (dónde queda el foco, qué dice
    el lector de pantalla) solo se ve en el navegador, y por eso está en el
    recorrido. En Node se revisa que `ir()` siga llamando a la entrega de la
    pantalla, que `dibujar()` no lo haga, y que la región de anuncios siga
    siendo la que usa la interfaz. Es la lección de la skill de flujo: un
    mecanismo que la interfaz no llama es un mecanismo que no existe, y esa
    clase de defecto sí se caza leyendo el archivo.

## Bloque 6: aplicar las decisiones del issue #2

Decisiones técnicas y de producto del 20 de septiembre de 2026. Las legales y
las de texto están en `docs/PARA_DECIDIR.md`, bloque G.

66. **La lista de secciones de la app vive una sola vez, con escape por país.**
    `data/secciones.json` pasó de un objeto con una lista por país a una lista
    `comun` más un mapa `paises` vacío. Juan confirmó que las secciones se
    llaman igual en todos lados, así que ocho copias iguales serían ocho sitios
    donde se pueden desincronizar. El escape se queda porque el día que un país
    tenga secciones propias hay que poder decirlo, y una lista propia vacía
    vuelve a bloquear la opción en ese país, que es el comportamiento que había.
    La resolución (`seccionesDePais`) vive en `src/core/paises.js` para que sea
    la misma en Node, en Apps Script y en el navegador.

67. **Cuando un país deja de estar en piloto, la prueba del piloto se construye,
    no se borra.** Ecuador y Costa Rica salieron el 20 de septiembre y ya no
    queda ninguno en piloto. Trece pruebas daban por hecho que sí. La tentación
    era borrarlas: el mecanismo del aviso de pruebas es de los que hay que
    volver a usar en cuanto entre un país nuevo. Así que cada una pone un país
    en piloto a mano, en Node con `Object.assign` y en el navegador cambiando
    `E.configuracion.paises`. Lo mismo con el bloqueo de la opción de secciones.

68. **Los casos dorados de país comparten exactamente los mismos datos de
    campaña.** MX01, EC01, PE01, AR01, CL01, UY01 y CR01 solo se diferencian en
    el país, la tienda, la razón social y la identificación del Organizador. Así
    la única variable entre un documento y otro es la fila del país, y cuando
    algo cambie la comparación dice qué línea. Hay una prueba que lo vigila: si
    alguien le cambia un número a uno solo, la comparación pierde sentido.

69. **La tabla de `docs/VALORES_POR_PAIS.md` se mide, no se escribe.**
    `scripts/tabla-paises.js` genera el documento de cada país y mira qué valores
    de su fila salen impresos. Una lista escrita a mano se queda atrás en cuanto
    una cláusula empieza a usar una columna nueva. Salieron dieciocho columnas,
    no las dieciséis que decía el documento anterior: también se imprimen el
    símbolo de la moneda, el separador de miles y el tipo de identificación.

70. **Un formato de leyenda que no se puede armar sale como "todavía no", no
    como error.** El mecanismo ya existía (`PENDIENTES_POR_MARCADOR`) y estaba
    vacío. Ahora lleva los tres enlaces que un país puede no tener: el de la
    campaña, el de Turbo y el de RappiPro. Sin esto, extender las leyendas a
    siete países habría dado dos resultados igual de malos: una leyenda con un
    hueco donde va el enlace, o los cinco formatos caídos por culpa de tres.

71. **Los países sin ruta de publicación reciben las dos leyendas que no
    necesitan enlace.** Hoy solo Colombia tiene `ruta_promos`, así que en los
    otros siete salen el texto de apoyo y la push, y los tres formatos que
    empiezan por "Aplican términos y condiciones: {enlace}" dicen qué falta. Es
    un dato de la fila del país, no código: el día que alguien lo escriba, se
    desbloquean solos.

72. **Una decisión que cambia el texto de una leyenda se anota en la prueba que
    compara con el encargo.** `pruebas/leyendas.test.js` compara las 55 leyendas
    letra por letra con la respuesta del encargo 03. La leyenda de push cambió
    por decisión de Juan, así que la excepción va escrita con su razón
    (`CAMBIADAS_POR_JUAN`) en vez de aflojar la comparación. Una leyenda cambiada
    a escondidas es exactamente lo que esa prueba existe para evitar.

73. **El ETA deja de arrastrar el complemento de Turbo en la frontera, no en la
    leyenda.** `esDeTurbo()` devolvía `true` para el ETA y el complemento se
    elegía; no se veía de milagro, porque las tres leyendas del ETA no llevan el
    marcador donde se pega. Arreglarlo en la leyenda habría dejado el defecto
    vivo para la siguiente: bastaba con que alguien le agregara ese marcador.

74. **Las secciones excluidas de la redención son una sola lista, compartida por
    el ETA y el Cashback.** Vive en `derivados_eta.js` con el nombre que ya
    tenía, porque la columna `exclusiones_eta` existe en el Sheet y mover una
    columna desalinea el histórico. El campo nuevo del Cashback
    (`exclusionesRedencion`) trae su propia columna, que los esquemas crean
    solas. El SOAT lleva `soloEn: 'CO'`: fuera de Colombia ni se ofrece ni se
    imprime.

75. **La condición del pedido pasó a una sola respuesta, y lo guardado sigue
    sirviendo.** Era un campo de casillas y ahora es una lista. Las campañas
    anteriores tienen un arreglo guardado en `datos_json`, así que
    `condicionDePedido()` (en `src/core/texto.js`) lee las dos formas. Sin eso,
    "Usar como base" sobre una campaña vieja habría recorrido una cadena letra
    por letra. La columna del Sheet se queda donde estaba, con otro contenido.

76. **El botón del modelo de acuerdo se arma en un solo sitio.** Estaba escrito
    dos veces, en la pregunta y en el resumen, y la línea nueva de qué hacer si
    Drive no deja entrar habría quedado en una sola. Se comparte por `RM.pasos`,
    que es como se comparte todo entre archivos del cliente.

77. **La pantalla de Legal recuerda de dónde vino.** `E.volverDeLegal` guarda
    cuál de los tres caminos llevó hasta ahí (el filtro general, el de Travel o
    la elección del negocio) y el botón "Cambiar mi respuesta" vuelve a esa
    pregunta. Un botón que no supiera a dónde volver sería peor que no tenerlo,
    así que sin ese dato el botón no se dibuja.

78. **El nombre de un país se traduce en la pantalla y nunca en el documento.**
    `nombreDePaisEnIdioma()` está aparte del diccionario de la interfaz porque no
    es texto de producto: es la columna `nombre` de la fila del país, que sale
    impresa dentro del T&C. Un documento de Ecuador dice "Ecuador" aunque quien
    llenó el formulario lo leyera en portugués. Hay prueba de que la ruta de
    publicación no se arma con el nombre traducido.

79. **Cuando un caso de prueba deja de probar lo que probaba, se convierte, no
    se borra.** EC01 existía para verificar que un país en piloto no generara.
    Ecuador salió de piloto, así que EC01 pasó a ser el caso dorado de Ecuador y
    la regla del piloto se mudó a las pruebas de servidor con un país puesto en
    piloto a mano. Lo mismo con la comprobación del recorrido que abría el
    detalle de un T&C con algo pendiente: los cupones dejaron de tener pendiente
    y pasó a usar los de membresía, que sí lo tienen.

## Bloque 7: aplicar las decisiones del 20 de septiembre de 2026

80. **Una pregunta puede traer su propio valor por defecto según el tipo, y la
    interfaz lo aplica al elegir el tipo.** Los por defecto se fijaban una sola
    vez, al arrancar el formulario, cuando todavía no hay tipo: por eso Brasil no
    podía arrancar a las 00:01. Ahora `variantes[tipo].porDefecto` existe y
    `aplicarValoresDelTipo()` lo aplica, solo donde el tipo cambia algo respecto
    del general y solo si el comercial no lo ha respondido. El mecanismo se probó
    con una prueba que mira que la interfaz lo llame, porque un mecanismo que la
    interfaz no llama es un mecanismo que no existe.

81. **La llave del idioma que decide el orden de la cifra se llama
    `ordenDeLaCifra`.** Se llamaba `formatoMonto` y mandaba solo sobre los
    montos; desde el punto B3 manda también sobre los pedidos y los porcentajes,
    así que el nombre decía menos de lo que hacía.

82. **`tiendaDelCashback()` lee lo nuevo y lo guardado.** La pregunta de en cuál
    de sus tiendas se gana el cashback reemplazó a la de la condición del pedido,
    y las campañas anteriores guardaron esa otra respuesta. Una sola función lee
    las dos formas, la nueva y las dos viejas (texto y lista), así que "Usar como
    base" sobre una campaña de antes sigue funcionando. Vive en `texto.js`, con
    su par, y sirve igual para una campaña entera y para una fila de la lista de
    tiendas del Multitienda, porque las dos guardan la respuesta con el mismo
    nombre.

83. **Una leyenda que ya no se ofrece no se borra: cambia su `se_elige_en`.** Las
    siete de medicamentos y nicotina salieron del catálogo con
    `se_elige_en: no_se_ofrece`, un valor nuevo de `FORMAS_DE_ELEGIR`. El texto
    se queda tal cual vino de Legal, con una nota de por qué no se ofrece, y
    reabrirlas el día que haga falta es cambiar una línea. Borrar el archivo
    habría perdido el texto aprobado, y la regla 4 de `CLAUDE.md` lo prohíbe.

84. **Las reglas del arte que la herramienta no puede imprimir, las dice.** El
    ícono +18 es una imagen y el titular lo escribe el diseñador: ninguno cabe en
    una leyenda. `reglasDelArte()` devuelve las tres que aplican a la campaña y la
    pantalla final las muestra debajo de las leyendas, en vez de dejarlas en un
    documento que nadie abre.

85. **El EAN se valida donde se validan los demás números con dígito de
    control.** `validarEan()` vive en `identificaciones.js`, aunque un código de
    barras no sea un identificador tributario: es la misma clase de comprobación
    y el mismo defecto que evita, que alguien escriba un número parecido y nadie
    se entere. El algoritmo es el de GS1 y sirve para los cuatro largos.

86. **El contador de preguntas cuenta mirando lo que abriría cada respuesta.**
    Para cada pregunta sin responder que tiene opciones se calcula cuántas
    preguntas nuevas del mismo paso abriría cada respuesta posible, y se suma la
    menor. Con la vigencia las dos respuestas abren una, así que suma una pase lo
    que pase; donde solo una respuesta abre otra, suma cero y el contador se
    queda corto, que es preferible a prometer de menos.

87. **El negocio no se pregunta donde no hay nada que elegir, y queda
    respondido.** En un país sin tipos de Rappi Travel, `camposDeArranque()` no
    dibuja esa pregunta y `alResponder` del país fija `negocio: 'rappi'` como
    respondido. Sin lo segundo, la pregunta desaparecería y el formulario se
    quedaría esperando una respuesta que nadie le puede dar. Quien de verdad
    tenga una campaña de viajes en ese país sale por "Mi campaña no es ninguna de
    estas".

88. **El filtro de los T&C generales guarda sus respuestas en el estado.**
    `E.filtroDeGenerales` sobrevive al viaje a la pantalla de Legal, así que
    "Cambiar mi respuesta" vuelve al filtro con lo marcado y el comercial corrige
    una sola casilla en vez de empezar de nuevo. Es la misma razón por la que
    existe `E.volverDeLegal`.

89. **La lista de T&C generales señala cuáles sirven, sin esconder los demás.**
    Cuando el filtro ya sabe cuál es el que sirve (Pro, usuarios nuevos en Turbo
    o el código de eventos externos), esos van primero y una línea dice por qué.
    Esconder los otros haría creer que la herramienta no los tiene, que es el
    mismo criterio de la opción bloqueada con su razón.

90. **La columna del Sheet que guarda las tiendas leía nombres de campo que no
    existen.** `tiendasLegibles()` leía `tienda`, `organizadorRazonSocial` e
    `organizadorId`, que son los del Cashback de una tienda; en una fila de la
    lista del Multitienda los campos se llaman `marca`, `razonSocial` e `id`. El
    resultado era " · · " por cada tienda, sin lanzar ningún error. La prueba que
    lo cuidaba confirmaba la misma equivocación, porque estaba escrita con los
    mismos nombres inventados. Ahora la prueba compara contra
    `ESQUEMAS.cashback_day.camposPorTienda` y revisa que ninguna línea salga
    vacía.

91. **La cláusula de Tiendas Participantes del ETA es un solo valor derivado con
    dos formas, no dos cláusulas en el modelo.** `TEXTO_TIENDAS_ETA` devuelve el
    texto aprobado cuando la campaña corre en una categoría del botón Turbo, y
    la lista con nombre propio cuando corre en unas tiendas concretas. Las dos
    formas se leen juntas en `derivados_eta.js`, con la historia de por qué
    existe cada una, en vez de repartirse entre un bloque opcional del modelo y
    un derivado. Y la lista va como valor derivado y no como bloque repetible
    del motor: `[[#TIENDAS]]…[[/TIENDAS]]` existe, pero está amarrado a
    `entrada.tiendas` y a los seis campos del Multitienda, mientras que estas
    tienen un solo dato por fila. Es el camino de la lista de productos de la
    Carrera: el valor devuelve varias líneas y el motor las pinta sueltas.

92. **Una fila a medias deja el hueco entero, no una viñeta rota.**
    `textoTiendasEta` devuelve cadena vacía si falta el nombre de cualquier
    tienda o si falta la ciudad. Así el motor anuncia el hueco y el documento no
    se genera, que es la regla 2 de `CLAUDE.md`. Es el mismo criterio de
    `textoProductos`.

93. **Redibujar la pantalla lleva cerrojo, porque es reentrante.** Quitar de la
    pantalla el campo que tiene el foco dispara su `blur` en ese mismo instante,
    y las pantallas que redibujan al salir de un campo llamaban a `dibujar()` en
    mitad del `dibujar()` que lo había provocado: el de adentro vaciaba la raíz y
    el de afuera reventaba con *"Failed to execute removeChild: the node to be
    removed is no longer a child of this node"*. Lo vio el recorrido de la skill
    `flujo-y-ux` al agregar una segunda tienda sin salir del primer nombre. El
    cerrojo vive en `dibujar()` de `70-app.js`, no en la pantalla: la lista de
    productos de la Carrera tenía el mismo defecto latente y nadie lo había
    disparado.

94. **El aviso de tienda repetida sale al salir del campo, no en cada tecla.**
    Mientras el comercial escribe solo se refresca el documento de al lado; el
    redibujo completo, que es el que pinta el mensaje de error de la fila, va en
    el `blur`. Redibujar en cada tecla le quitaría el foco. Es el mismo trato que
    tiene la lista de productos.

95. **Los nombres que salen impresos y las etiquetas del formulario viven en
    archivos distintos, a propósito.** `OPCIONES_ALCANCE_TURBO` está en
    `esquemas.js`, que es lo que el comercial lee, y `MODALIDAD_POR_ALCANCE` en
    `derivados_eta.js`, que es lo que sale impreso en el T&C. Llegué a cruzarlas
    con un `require` entre dos archivos de `src/core/`: funciona en Node y rompe
    en Apps Script, donde esos archivos son globales y no hay `require`, así que
    la segunda declaración dejaba el valor en `undefined` según el orden de
    carga. La prueba "las tres formas del ETA tienen su texto" cuida que las dos
    listas no se separen.

96. **El título de la campaña del ETA sigue la categoría elegida.** Estaba fijo
    en "Turbo Restaurantes", así que una campaña de Turbo se habría titulado
    "Turbo Restaurantes Bogotá". Con tiendas concretas no hay categoría que
    nombrar y el título queda con la ciudad: cinco dark stores no caben en un
    título, y reusar "Turbo" haría indistinguibles dos campañas distintas en el
    historial.

97. **Turbo Carulla no entra como categoría del documento: sus tiendas se
    nombran.** Juan dejó la decisión en mis manos el 21 de septiembre de 2026.
    Las dos categorías que el T&C sabe nombrar, "Turbo Restaurantes" y "Turbo",
    son secciones de la app: están en `data/secciones.json` y las propuso la
    decisión 33 de Legal. Turbo Carulla es otra cosa, una marca comercial de
    dark stores, y escribir "bajo la modalidad «Turbo Carulla»" repetiría justo
    el error que Juan corrigió, que es llamar modalidad a algo que no lo es.
    Además la razón que obliga a nombrar la categoría en Turbo Restaurantes aquí
    no existe: las marcas de restaurantes de una ciudad son decenas y cambian de
    un día para otro, mientras que las dark stores de un banner en una ciudad se
    cuentan con los dedos de una mano, tienen nombre propio y son estables. Son
    exactamente el caso que Juan describió como "tiendas por zona, con nombre
    propio", así que la forma que les sirve es la de nombrarlas. El nombre vive
    ahora en la nota de esa opción del formulario, que es interfaz y no texto
    legal, para que el comercial sepa dónde encaja su campaña. Si algún día hace
    falta la categoría entera, es una línea en `MODALIDAD_POR_ALCANCE` y el
    nombre impreso lo da Legal.

98. **El botón primario lleva texto blanco grande sobre un gradiente recortado.**
    Decidido por Juan el 21 de septiembre de 2026, al cerrar el análisis del
    cambio de identidad. El brand book de Rappi manda blanco sobre el neón
    (`Neon/gradient → white only`) y el encargo manda 4.5:1 de contraste. Las dos
    reglas no pueden cumplirse a la vez: medido con WCAG 2.1, el blanco sobre el
    gradiente `#FF7A4D → #FF2526 → #FF4583` da entre 2.58:1 y 3.79:1, y 3.79 es
    el máximo de todo el tramo. La salida es usar el umbral de texto grande, que
    es 3:1 a partir de 18.66px en negrita: el botón lleva su texto a 19px en peso
    700 y el gradiente del botón arranca en el 17% del tramo (desde `#FF6041`),
    que es donde el blanco cruza ese umbral. Así se respeta la regla de marca y
    se cumple AA. El gradiente completo se sigue usando donde no lleva texto.
    El detalle está en `docs/PLAN_IDENTIDAD.md`, sección 3.1.

99. **La tipografía se decide con el peso medido, no antes.** PP Object Sans no
    está en Google Fonts, y Apps Script no sirve archivos del repositorio, así que
    los cuatro pesos tendrían que ir en base64 dentro del HTML y suman a cada
    carga de la aplicación. En vez de comprometer eso a ciegas, primero se mide
    cuánto pesan los cuatro pesos convertidos y cuánto crece el HTML servido. Con
    ese número se elige entre las tres opciones: la familia completa, un
    subconjunto de pesos, o Archivo desde Google Fonts como respaldo con PP Object
    Sans primero en la pila. La medición necesita `assets/fonts/`, que todavía no
    está en el repositorio.

## Bloque 8: el cambio de identidad

100. **La decisión 99 se cierra con un solo peso incrustado.** Medido: los
     cuatro pesos de PP Object Sans pesan 89,8 KB en woff2 recortado y 119,7 KB
     en base64. Parecía un 14% sobre la carga y no lo es: el base64 es la única
     parte de lo que se descarga que no se comprime, porque el woff2 ya viene
     comprimido por dentro, mientras el resto de la aplicación baja cuatro a uno
     con gzip. Sobre lo que de verdad viaja, los cuatro pesos cuestan un 42,9% en
     cada carga, y Apps Script arma el HTML con `doGet` en cada petición y no lo
     cachea. Juan eligió el 21 de septiembre de 2026 incrustar solo Heavy 900, que
     es donde se reconoce la marca, y tomar 400, 500 y 700 de Archivo en Google
     Fonts, que responde con un año de caché. Cuesta un 10,4% comprimido, y la
     primera visita pesa 4,3 KB menos que hoy, porque Archivo es variable y los
     cuatro pesos salen de un solo archivo de 34,1 KB mientras hoy se bajan Lato
     más Poppins, que son 60,9 KB. Los números están en
     `docs/diseno/MEDICION_FUENTES.md`.

101. **Hay dos familias de letra, y la separación no es de estilo sino de
     mecánica.** De PP Object Sans se sirve una sola cara, la de peso 900. Dentro
     de una familia, cuando el peso pedido no existe el navegador elige el más
     cercano que sí exista: con una sola cara declarada, pedir 400 devuelve la de
     900. Si esa familia estuviera en la pila del cuerpo de texto, la aplicación
     entera saldría en Heavy y nada fallaría. Por eso `--rm-display` lleva
     PP Object Sans y solo vale donde el peso es 900, y el cuerpo va con Archivo,
     que es variable y cubre de 400 a 900. Lo cuida la prueba `una familia de
     display solo se usa en peso 900`.

102. **Los tokens de producción viven en `src/client/tokens/` y el build los
     concatena; no hay ningún `@import`.** Apps Script sirve la hoja embebida en
     un solo `<style>`, así que un `@import` apunta a una ruta que del lado del
     usuario no existe y no lanza ningún error: el navegador se queda sin esos
     valores y la aplicación sale despintada. El orden está escrito una sola vez,
     en `scripts/lib/hoja-completa.js`, y lo usan los cuatro que sirven la hoja:
     el build, la demostración, `npm run front` y las pruebas. Que las pruebas
     lean por ahí es la red: si alguien agrega un archivo de tokens y se olvida de
     ponerlo en `ORDEN`, la prueba `toda variable de estilo que se usa está
     definida` lo dice por su nombre.

103. **`docs/diseno/tokens/` se queda como llegó y `src/client/tokens/` es lo que
     se sirve.** No son copias: producción lleva los seis arreglos de
     `docs/diseno/AUDITORIA_CONTRASTE.md`, sin los cuales `npm run contraste`
     devuelve 1 con nueve pares por debajo del mínimo. Por eso ese script mide
     ahora los de producción y no los de la entrega: medir la entrega sería medir
     algo que nadie ve.

104. **El anillo de foco se queda como `outline`, no pasa al halo del prototipo.**
     El prototipo lo dibuja con dos capas de `box-shadow` en alfa .45 y .30, que
     dan 1.99:1 y 1.57:1. El anillo que la aplicación ya tenía da 3.44:1 y el foco
     visible está entre los intocables de `docs/PARA_EL_DISENO.md`, así que
     copiarlo habría sido una regresión sobre algo que funcionaba. Queda un color
     sólido, `#FF2526`, usado con `outline`: 3.79:1. De paso conserva la forma que
     ya cuida `pruebas/interfaz_accesible.test.js`.

105. **La hoja conserva sus nombres cortos como capa de alias.** Los 275 `var()`
     de `estilos.css` siguen llamando a `--tinta`, `--papel` o `--borde`, y esos
     nombres apuntan a los tokens de identidad. No es comodidad: `scripts/lib/
     front-documento.js` usa doce de esos nombres y no los define, los hereda al
     pegar la hoja dentro de `docs/FRONT_ACTUAL.html`. Si un nombre desaparece sin
     avisar, el documento que envuelve a las 48 pantallas se queda sin colores ni
     tipografía, en silencio, y ese documento es justo la herramienta con la que
     se verifica cada fase. Solo se renombraron los tres que mentían: los naranjas
     pasaron a `--neon` y `--neon-texto`, y en el mismo commit se actualizó
     `front-documento.js`.

106. **Dos tokens que hacían dos trabajos se parten antes de renombrar.**
     `--borde-control` era a la vez el contorno de los campos, que necesita 3:1, y
     el color de letra del deshabilitado, que necesita legibilidad; con el alfa
     .44 que pide el contorno esa letra quedaba ilegible, así que la letra pasa a
     `--texto-off`. `--rojo-alerta` era a la vez borde de error, que con 3:1 basta,
     y texto de error, que necesita 4.5:1; se parte en `--neon` y `--neon-texto`.

107. **La hoja vacía se queda como está y la opción elegida no lleva sombra.**
     Las dos las decidió Juan el 21 de septiembre de 2026. La hoja vacía en
     miniatura habría obligado a tocar `src/client/js/40-documento.js` y a
     inventar un texto de cláusula de ejemplo que no viene de `modelos/`, o sea
     contenido y no pintura. La sombra de la opción elegida habría roto el
     principio de una sola superficie elevada, que es lo que hace que la hoja del
     documento destaque sobre todo lo demás.

108. **Las pantallas de momento son las tres que nombra la especificación:** el
     inicio, "Tu T&C está listo" y el bloque de azar de la Ayuda. Legal, el error
     y el país en piloto quedan fuera aunque hoy existan: las tres son callejones
     donde la campaña no sigue por la herramienta, y un panel grande ahí no
     celebra nada, subraya que te quedaste afuera. La regla del flujo dice
     expresamente que ir a Legal no es un castigo.

109. **El panel de momento se arma con el `h1` y su bajada, no con un contenedor
     nuevo.** El prototipo dibuja el momento como una sección propia, pero el
     JavaScript no emite ningún contenedor para ella y la ronda 2 del encargo
     prohíbe agregarlo. Se arma con lo que ya hay: el `h1` y el párrafo que lo
     sigue comparten el fondo beige, se les quita el margen de en medio y cada
     uno redondea su mitad. A la vista es un solo panel, y la regla de gradiente
     de 96 por 6 va entre los dos con un `::after` del título.

     Los dos selectores están medidos contra las 48 pantallas congeladas, no
     deducidos: el primero da exactamente las tres vistas del inicio, la de
     escritorio, la de portugués y la de celular, y el segundo da solo "Tu T&C
     está listo". El tercer momento, el bloque de azar de la Ayuda, ya quedó
     resuelto en la fase 6: es el aviso serio, que es panel beige con regla de
     gradiente arriba.

110. **El lockup no entra en esta ronda, y no es por el peso.** La marca de la
     barra superior es texto en el DOM (`RappiMind` más un `em` con `v3`, más la
     corona en SVG), así que cambiarla por la imagen del lockup es tocar
     `src/client/js/70-app.js`, que la ronda prohíbe. Además el SVG del lockup
     todavía no es autosuficiente: el logotipo entra por referencia relativa a
     `../logo/rappi-logo-440.png`, así que carga dentro de un HTML pero no dentro
     de un `<img>`, y "Mind" y "By Legal" van como `<text>`, que dependen de que
     PP Object Sans esté disponible. De la familia solo se sirve la cara de peso
     900, así que esos dos textos saldrían los dos en Heavy.

     Lo que sí se midió, por si sirve al decidir: el lockup en SVG cuesta 12,5 KB
     en base64 contra los 36,0 KB del logo en PNG de 220, y además es texto, así
     que gzip sí lo comprime. El favicon en SVG cuesta 11,0 KB contra 72,3 KB en
     PNG. O sea que la ruta del SVG es mucho más barata en cuanto sea
     autosuficiente.

111. **El adorno del bigote del prototipo no entra.** El héroe del prototipo
     lleva `rappi-bigote.png` de fondo, a 320px y al 10% de opacidad. Cuesta 67,3
     KB en base64, que es la parte de la carga que no se comprime, en una
     herramienta cuyo peso de descarga ya está anotado como problema en
     `docs/PARA_EL_DISENO.md` sección 7 y que va a crecer cuando entren los
     catálogos de leyendas de los otros ocho países. Setenta kilobytes en cada
     carga por una decoración que se ve al 10% no es un cambio que se pague solo.
     Si Juan lo quiere, la ruta barata es un SVG.

112. **El título del aviso serio no va en caja alta.** Es una desviación
     deliberada de `docs/diseno/ESPECIFICACION_ESTADOS.md` sección 2, autorizada
     por Juan el 21 de septiembre de 2026. La regla se pensó para una etiqueta
     corta, y los siete títulos que la aplicación pone en ese sitio son frases:
     "Antes de usar este enlace, confirma con Legal", "La leyenda cambió. Cambia
     el arte antes de publicarlo.", "Antes de lanzar: ¿tu dinámica tiene azar?".
     Una frase de ocho palabras en mayúsculas no se lee, se escanea, y estas son
     advertencias legales. No se pierde nada del sistema: lo que distingue al
     nivel serio del informativo es el panel beige y la regla de gradiente de
     arriba, que son estructura y cumplen por sí solas la regla del brand book de
     no distinguir por color. La caja alta se queda donde sí hay etiquetas
     cortas, que son las cabeceras de tabla y la marca de "Opcional".
