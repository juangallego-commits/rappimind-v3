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
