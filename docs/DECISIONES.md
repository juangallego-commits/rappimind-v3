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
