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
