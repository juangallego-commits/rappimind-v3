# Progreso

| Bloque | Estado | Cómo probarlo | Qué necesito de Juan |
|---|---|---|---|
| 0 | cerrado | `npm test` (32 pruebas), `npm run build` y el flujo de Actions en verde | Crear el despliegue de la web app (lo hace el disparo manual) |
| 1 | listo, en punto de control A | `npm test` (103 pruebas) y `npm run previsualizar` | Revisar 3 textos y `docs/PENDIENTES_LEGAL.md` |
| 2 | listo, falta verificar en Google | `npm test` (157 pruebas) | Correr `setup()` y completar las propiedades |
| 3 | listo | `npm run demo` y abrir `demo/index.html` | Revisar las capturas y los textos |
| 4 | pendiente | | Falta el despliegue versionado, que lo dispara Juan |

## Bloque 0 · Repo, build y despliegue

### Qué quedó

- `package.json` con los comandos de `CLAUDE.md`: `test`, `build`,
  `previsualizar`, `push` y `limpiar`. Todos corren con Node, sin comandos de
  bash, así que funcionan en Windows.
- `scripts/build.js`: arma `dist/` según la sección 2 de la especificación.
  Copia `src/core` y `src/server`, convierte `modelos/**/*.md` en
  `dist/Modelos.js`, `data/paises.json` en `dist/PaisesSemilla.js` y
  `data/secciones.json` en `dist/Secciones.js`, arma `Index.html`,
  `Estilos.html`, `App.html` y `MotorCliente.html`, y copia `appsscript.json`.
- `src/core/texto.js`: normalización de texto compartida. El motor ignora los
  retornos de carro, así que el documento sale igual se edite en Windows o en
  Linux.
- `src/server/Codigo.js` y `src/client/`: una página mínima que confirma que el
  despliegue responde y muestra cuántos modelos, bloques y países cargaron. El
  formulario por pasos llega en el Bloque 2.
- `appsscript.json` con la web app como `USER_DEPLOYING` y acceso `DOMAIN`.
- `.clasp.json` apuntando a `dist/` con el `scriptId` del proyecto.
- 32 pruebas en verde (`node:test`, sin dependencias): normalización de texto,
  coherencia de los insumos legales (los `[[INCLUIR:…]]` resuelven, no hay
  bloques huérfanos, los 9 países traen estado válido), coherencia de los 11
  casos de prueba y verificación del build.
- `.github/workflows/despliegue.yml`: pruebas y build en cada push a `main`,
  luego `clasp push`; y un disparo manual que además crea versión y actualiza el
  despliegue de la web app.

### Cómo probarlo

```
npm test
npm run build
npm run previsualizar
```

En GitHub: pestaña **Actions**, flujo **Pruebas y despliegue**.

### Punto de control

Hecho. El flujo corrió en verde y `clasp push` subió los 10 archivos de `dist/`
al proyecto de Apps Script (run 2, commit `133cd32`).

### Qué necesito de Juan

1. Disparar una vez el flujo a mano (**Actions > Pruebas y despliegue > Run
   workflow**) para crear la primera versión y el despliegue de la web app.
2. Guardar el ID que salga en el resumen en la variable **`ID_DESPLIEGUE`**
   (Settings > Secrets and variables > Actions > Variables). Desde ahí los
   disparos manuales siguientes actualizan ese mismo despliegue, sin cambiar la
   URL que usan los comerciales.
3. Completar en el proyecto de Apps Script las propiedades del script
   `URL_FORMULARIO_LEGAL`, `CANAL_AYUDA_URL` y, si quiere copia de cada
   documento, `CORREO_COPIA_LEGAL`.

Si faltan el `scriptId` o el secreto, el flujo corre pruebas y build y se salta
el `clasp push` avisándolo en el resumen, en vez de ponerse en rojo.

## Bloque 1 · Motor, derivados y validaciones

### Qué quedó

`src/core/` completo, con 103 pruebas en verde:

| Archivo | Qué hace |
|---|---|
| `texto.js` | Normalización: sin BOM, sin `\r`, y texto plano sin negritas |
| `numeros.js` | Números en letras, apócope, montos, porcentajes y cantidades de Créditos |
| `fechas.js` | Fechas y horas en español, comparación sin `Date`, listas con "y" |
| `identificaciones.js` | Dígito verificador de los 8 países (NIT, RFC, RUC, CUIT, RUT, cédula) |
| `derivados.js` | Los textos de Legal de la sección 5, marcados ORACIÓN o FRAGMENTO |
| `esquemas.js` | Los 3 tipos: pasos, campos, visibilidad, obligatoriedad y filtro de entrada |
| `validaciones.js` | Obligatorios, formatos, cruces, país en piloto y lista de tiendas |
| `motor.js` | Los 7 pasos del render y la red de seguridad del texto final |
| `generar.js` | Valida y, solo si todo está bien, renderiza |

### Cómo probarlo

```
npm test
npm run previsualizar            todos los casos
npm run previsualizar CB01       un caso
```

Los 5 casos que deben generar producen un texto **idéntico carácter por
carácter** a `pruebas/salidas_esperadas/`. Los 6 que deben fallar fallan
exactamente en los campos que declara `pruebas/casos_base.json`, y no producen
texto. Los 8 identificadores reales de las sociedades Rappi validan.

### Punto de control A · qué necesito de Juan

1. Revisar los 3 textos que te paso en el chat de Legal (Cashback CO, Carrera y
   Cashback Day) y confirmar o corregir.
2. Revisar `docs/PENDIENTES_LEGAL.md`, sobre todo los textos marcados como
   nuevos: medios de pago con Créditos, segmentos nuevos, condiciones
   opcionales, desempate y datos para la entrega.
3. Confirmar los nombres de las secciones de `data/secciones.json`.
4. Cashback Day: confirmar si el máximo de pedidos aplica a toda la campaña
   (como está hoy) o por tienda.

### Nota para el Bloque 2

Las opciones del campo `secciones` todavía no salen de `data/secciones.json`:
el motor usa los nombres que le llegan. Hay que conectarlo al armar el
formulario.

## Bloque 2 · Servidor

### Qué quedó

| Archivo | Qué hace |
|---|---|
| `src/server/Config.js` | Propiedades del script, pestañas, modo demostración |
| `src/server/Datos.js` | Lectura y escritura del Sheet, carpeta por país |
| `src/server/Setup.js` | `setup()` idempotente |
| `src/server/Documento.js` | Adaptador de DocumentApp |
| `src/server/Correo.js` | Envío del correo |
| `src/server/Api.js` | Lo que llama la interfaz con google.script.run |

Piezas puras nuevas en `src/core/`: `tablas.js`, `paises.js`, `documento.js`,
`correo.js`.

**157 pruebas en verde**, incluido el servidor completo contra dobles de las APIs de
Google: setup idempotente, generación, formato del documento, carpeta por país,
compartir como lector, correo, fila en Solicitudes, consecutivo, historial por rol,
publicación, administración y registro.

### Modo demostración

Sin `SHEET_ID` la app usa los países de `data/`, avisa en pantalla y, en vez de crear
el documento, muestra el texto final. No toca Drive, ni el Sheet, ni manda correos.

### Qué falta verificar con la cuenta de Juan

Lo único que no se puede probar en Node: que Google acepte de verdad las llamadas.
Está en `docs/REVISION_MANANA.md`.

## Bloque 3 · La interfaz

### Qué quedó

Preguntas simples a la izquierda, el T&C escribiéndose solo a la derecha. Lo que
falta aparece como un espacio en blanco gris que dice qué pregunta lo llena; al
responder, el espacio se rellena con la frase legal de verdad y destella. Es el
mismo motor de `src/core`, así que lo que ve el comercial es lo que sale.

| Archivo | Qué hace |
|---|---|
| `src/client/js/10-util.js` | DOM, iconos SVG, la corona, formatos |
| `src/client/js/20-estado.js` | Estado y borrador en el navegador |
| `src/client/js/30-servidor.js` | Puente con Apps Script o con el servidor simulado |
| `src/client/js/40-documento.js` | La hoja: dibuja el documento y resalta lo que cambió |
| `src/client/js/50-campos.js` | Una pregunta con todo lo que exige el estándar |
| `src/client/js/60-flujo.js` | Inicio, filtro de entrada y pantalla de Legal |
| `src/client/js/62-pasos.js` | El formulario por pasos |
| `src/client/js/64-tiendas.js` | La lista de tiendas del Cashback Day, con pegar desde Excel |
| `src/client/js/66-resumen.js` | Resumen y pantalla final |
| `src/client/js/68-pantallas.js` | Historial, Ayuda y Administración |
| `src/client/js/70-app.js` | Arranque y navegación |

### Cómo probarlo

```
npm run demo
```

Y abrir `demo/index.html` con doble clic. Es la aplicación completa, con el motor
real y un servidor simulado en memoria. No toca nada de producción.

Las capturas están en `docs/capturas/`, con su índice.

### Lo que encontré mirando la aplicación funcionando

Seis defectos que no aparecían en las pruebas y sí en el navegador. Están
listados en el mensaje del commit y los importantes en `docs/DECISIONES.md`. El
más serio: los valores por defecto hacían que la interfaz **saltara preguntas que
el comercial nunca veía**.

### Qué necesito de Juan

Todo está en `docs/REVISION_MANANA.md`.

## 16 de septiembre · tarde · Primera prueba real en Apps Script

Juan corrió la aplicación de verdad y generó su primer T&C. De ahí salieron trece
observaciones. Esto es lo que quedó.

### El defecto que bloqueaba la prueba

La vista previa salía en blanco y la opción elegida no se resaltaba. Era **un solo
defecto**: el navegador nunca recibía los textos legales. Los archivos `Modelos.js`,
`PaisesSemilla.js` y `Secciones.js` quedaban sueltos en `dist/`, que es el lado del
servidor, y el navegador solo recibe lo que va dentro de `MotorCliente.html`. Sin ellos
la vista previa reventaba, y como reventaba a mitad del clic tampoco alcanzaba a pintar
la opción elegida. En la demostración funcionaba porque ahí sí iban en la misma página.

Arreglado en `scripts/build.js`, con la prueba que faltaba: `pruebas/build.test.js` ahora
corre `MotorCliente.html` en un ambiente como el del navegador y exige que la vista previa
salga con sus huecos marcados.

### Los cambios de contenido

| Punto | Qué cambió |
|---|---|
| 1 | Se quitó la pregunta de filtro "¿La campaña la fondea Rappi?", tanto de la pantalla de entrada como del filtro de cada tipo, y también el caso de frontera que decía consultarlo en la guía de azar. El Organizador es siempre la tienda o la marca. |
| 2 | La ayuda del país ya no recomienda Colombia. |
| 3 | La ayuda del tipo ya no recomienda Cashback. Cada tipo se explica en su propia descripción. |
| 6 | "¿Cuánto hay en total para la campaña?" pasó a "¿Cuánto es el presupuesto total de la campaña?". |
| 7 y 9 | "¿Aplica solo en algún caso especial?" pasó a "¿El beneficio aplica solo en cierto tipo de pedido?", y el porqué dice de entrada que no es la pregunta de dónde se gastan los Créditos. |
| 8 | La ayuda de la carga explica en qué momento le queda el saldo disponible al usuario. |
| 10 (i) | El porqué de la redención dice que lo normal es la misma tienda y que estos Créditos casi nunca aplican a RappiFavor, Cajero ATM ni RappiTravel. |
| 10 (ii) | `data/secciones.json` para Colombia: Restaurantes, Turbo, Supermercados, CPGs y Turbo Restaurantes. |
| 11 | Las preguntas opcionales llevan una marca "Opcional" al lado del título. Antes el dato estaba en el código y no se veía en pantalla. |

### Lo que quedó esperando tu decisión

- **El nombre de la campaña** y **el nombre del tipo "Cashback Day"**:
  `docs/PROPUESTA_NOMBRE_CAMPANA.md`.
- **Cuatro observaciones legales** del primer documento generado, al final de
  `docs/PENDIENTES_LEGAL.md`. La primera es la más seria: el título decía 99% y la
  cláusula decía 50%.

### Dónde viven las respuestas de los usuarios

En el Sheet `RappiMind v3 · Base`:
<https://docs.google.com/spreadsheets/d/1Pk_UmG_O1sklnARmHxKiei--HdwvRAraqcZRnr4gZgU/edit>

Pestañas: `Paises`, `Equipo`, `Solicitudes` y `Registro`. Para auditoría sirven las dos
últimas. `Solicitudes` tiene una fila por campaña generada, con el identificador, la
fecha, el correo de quien la hizo, el país, el tipo, la versión del modelo legal que se
usó, el enlace al documento y, en `datos_json`, todas las respuestas tal como las dio el
comercial. `Registro` guarda cada acción con su hora.

Los documentos quedan en la carpeta de Drive `RappiMind v3`, en una subcarpeta por país:
<https://drive.google.com/drive/folders/1RLtv88GEYT5Fxj6wIypF-Aho-LacmON7>

## 16 de septiembre · noche · Nombre estructurado, auditoría y Squarespace

### 1. El nombre de la campaña ya no lo escribe nadie

La pregunta "¿Cómo se llama tu campaña?" desapareció. El nombre lo arma
`src/core/nombres.js` con la tienda, el porcentaje y el día de inicio:

```
El Corral · 50% Cashback · 20 sep 2026
Carulla · Carrera de Compras · 5 oct 2026
Cashback Multitienda · 24 sep 2026
```

El porcentaje del título sale del mismo dato que alimenta la cláusula, así que el caso
del primer T&C real (título 99%, cláusula 50%) ya no puede repetirse. Hay una prueba
que lo exige. Dos campañas nunca se llaman igual: si el nombre está tomado, el servidor
le agrega un consecutivo y vuelve a armar el documento, porque el nombre va adentro del
articulado. "Cashback Day" pasó a llamarse **Cashback Multitienda**.

### 2. El Sheet guarda cada respuesta en su propia columna

La pestaña `Solicitudes` ahora tiene una columna por pregunta, con el valor tal como lo
leyó el comercial en pantalla: `resp_redencion` dice "Solo en esta tienda", no "tienda".
Son 43 columnas nuevas, y salen de los esquemas, así que una pregunta nueva trae su
columna sola. Las preguntas que no aplicaban a esa campaña quedan vacías, que es la
verdad: no se hicieron. `datos_json` sigue estando para reconstruir el documento
idéntico; las columnas nuevas son para leer y filtrar. El CSV de administración también
las lleva.

**Para que aparezcan en tu Sheet hay que correr `setup()` otra vez.** Agrega las
columnas que faltan al final y no toca ninguna de las que ya están: mover una columna
con datos adentro desalinearía todo el histórico.

### 3. La publicación en Squarespace

La pantalla final ahora da, listo para copiar con un botón:

- **El título del evento**: el nombre de la campaña, tal cual.
- **La dirección del evento**: `el-corral-50-cashback-20-sep-2026`, que va en la pestaña
  Opciones. La parte del país la pone Squarespace sola.
- **Las fechas** que hay que ponerle al evento, iguales a la vigencia del documento.
- **Los diez pasos reales**, con lo que debería verse en cada uno.
- **Quién tiene usuario de Squarespace** en ese país, y el canal de Legal para quien no
  lo tenga.

### Cómo probarlo

```
npm run demo
```

Abre `demo/index.html`, llena una campaña de Cashback y llega hasta el final. Vas a ver
el título y la dirección con su botón de copiar.

### Qué necesito de ti

- Correr `setup()` en Apps Script para que aparezcan las columnas nuevas.
- Los usuarios de Squarespace de los demás países, y quién queda para concursos en
  Colombia. Hoy están solo Camilo Patiño y Valery Medina, para cashback y descuentos.

## 16 de septiembre · noche · Dos defectos que salieron probando

### "Mis campañas" no cargaba

`Cannot read properties of null (reading 'length')`. La causa es una regla de
Apps Script que no está a la vista: **`google.script.run` solo deja pasar números,
textos, booleanos, nulos, listas y objetos de esos. Una fecha no pasa.** Si va una sola
fecha en toda la respuesta, Apps Script no falla ni avisa: le entrega `null` al
navegador, y la pantalla revienta con un error que no apunta a ninguna parte.

Google Sheets convierte sola a fecha una celda que diga `2026-09-17`, así que esto
aparecía apenas hubiera una campaña guardada. En las pruebas no salía porque los dobles
del Sheet devuelven texto.

Arreglado en `src/core/tablas.js`: todo lo que sale del Sheet hacia el navegador pasa por
`filasPlanas()`, que convierte las fechas a texto. Se aplicó al historial, al estado
inicial y a las dos pantallas de administración. Hay una prueba que mete una fecha de
verdad en la hoja y exige que la respuesta no lleve ninguna: quitando el arreglo, falla.

Y si algún día el servidor vuelve a devolver algo que no es una lista, la pantalla ahora
lo dice en palabras en vez de reventar.

### El Sheet se pone al día solo

Las columnas nuevas de auditoría ya no necesitan que alguien corra `setup()`. Al
escribir una fila, `src/server/Datos.js` mira los encabezados que la hoja tiene de
verdad y agrega al final los que falten, en ese momento. Nunca mueve ni borra una
columna que ya esté, porque eso desalinearía todo el histórico.

### La pantalla de Ayuda

- Fuera las cajas vacías que decían `[CAPTURA 1]`, `[CAPTURA 2]`. No teníamos capturas
  que poner y se veían como algo roto.
- Entraron los diez pasos nuevos de Squarespace, los mismos de la pantalla final.
- Entró **quién puede publicar**, país por país, separando cashback de concursos, con el
  canal de Legal para quien no tenga usuario.

### "Mis campañas" ahora dice para qué sirve

Arriba de la lista: abrir otra vez un documento ya generado, marcar una campaña como
publicada, y arrancar una nueva copiando los datos de otra con "Usar como base".

## 16 de septiembre · noche · Rappi Travel, bloques 1 a 4 y 6

Trabajo en la rama `claude/travel`, **sin subir a main**, porque cada push a main
dispara el despliegue y pediste no desplegar.

### Lo que quedó funcionando

| Bloque | Estado |
|---|---|
| 1. Datos | Listo. Bloque `travel` en la fila CO, `data/categorias_travel.json` con las ocho categorías. |
| 2. Motor y validaciones | Listo. Dos esquemas, veinticinco textos derivados, dieciséis validaciones. |
| 3. Modelos | Listo. `cashback_travel`, `descuento_travel` y trece bloques propios de Travel. |
| 4. Interfaz | **A medias.** Las preguntas y el filtro de Travel están escritos; falta conectarlos a las pantallas. |
| 5. Historial | **No empezado.** Ampliar una campaña en curso es una función nueva del servidor. |
| 6. Pruebas | Listo. TV01 a TV14, con su salida esperada exacta. 249 pruebas en verde. |
| 7. Documentación | Listo. |

### Lo que no se puede generar todavía, y está bien

**Colombia no genera ni un T&C de Travel hoy**, a propósito: faltan el nombre y el enlace
de la política de datos de Travel Moustache. La herramienta lo dice en palabras y manda a
Legal. Las pruebas usan valores de prueba y lo dejan escrito en el archivo. Es el primer
dato que necesito de Juan.

### Un defecto de redacción que salió al armarlo

"Doscientos órdenes" estaba mal: son "doscientas". Los modelos de delivery solo hablan de
pedidos y de Créditos, que son masculinos, así que nunca se había visto. Travel trae
órdenes, unidades y noches. Arreglado en `src/core/numeros.js` con su prueba, sin cambiar
ni una letra de los documentos de delivery.

### Cómo verlo

```
node -e "console.log(require('fs').readFileSync('pruebas/salidas_esperadas/TV01.txt','utf8'))"
```

Los siete documentos que generan están en `pruebas/salidas_esperadas/TV01.txt` a
`TV07.txt`. Las diecisiete decisiones que necesito de Juan están en
`docs/PENDIENTES_LEGAL.md`, sección "Rappi Travel".
