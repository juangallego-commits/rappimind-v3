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

## 16 de septiembre · noche · Travel, bloques 4 y 5 terminados

### El filtro de Travel ya está en pantalla

Elegir Cashback Travel o Descuento Travel lleva a una pantalla con las nueve preguntas del
filtro. Va **después** de elegir el tipo, no antes: las preguntas solo tienen sentido
sabiendo que la campaña es de viajes. Cualquier sí lleva a Legal con su razón escrita.

### Ampliar una campaña en curso

En "Mis campañas", una campaña **publicada y corriendo** muestra un botón **Ampliar**.
Abre un formulario que solo deja subir: la fecha de fin hacia adelante, el presupuesto, el
máximo de órdenes o las unidades. Nunca bajar, porque eso cambiaría las condiciones de
quien ya compró.

Al ampliar:

1. Se genera **una versión nueva del documento**, con la nota de modificación al final y su
   fecha.
2. **El enlace publicado no cambia.** La pantalla lo muestra con su botón de copiar y
   recuerda reemplazar el texto en esa misma página de Squarespace, porque la gente ya
   tiene el enlace.
3. Queda registro en la pestaña `Registro`.

Lo que no se puede ampliar dice por qué en palabras: una campaña sin publicar todavía se
edita y se regenera; una que ya terminó no se reabre, se crea otra con "Usar como base".

El momento de la campaña sale de la hora, no de una casilla: la herramienta no sabe si
hubo órdenes, así que si ya pasó la hora de inicio asume que las hubo. Funciona también
con las franjas de un solo día, de 6 a 8 de la noche.

**265 pruebas en verde**, más cuatro recorridos verificados en el navegador.

## 16 de septiembre · noche · Dos arreglos después de la prueba de Juan

### La pantalla se quedó sin tipos que elegir

Juan abrió la herramienta y la pregunta "¿Qué tipo de campaña vas a hacer?" no mostraba ni
una opción. **Lo rompí yo**, al arreglar "Mis campañas**: la función que limpia las fechas
antes de que la respuesta cruce a `google.script.run` también convertía las **listas** a
texto. La lista de modelos del país llegaba al navegador como la cadena
`"cashback,carrera_compras,..."` en vez de una lista, y la pantalla no encontraba ningún
tipo que ofrecer.

En la demostración no se veía, porque ahí el servidor simulado no limpia nada. Solo se veía
en Apps Script, que es justo donde no puedo probar yo. Ahora hay una prueba que corre
`estadoInicial()` con los dobles y exige que `pais.modelos` siga siendo una lista con los
cinco tipos: quitando el arreglo, falla.

### La primera pregunta ahora es Rappi o Rappi Travel

Antes los cinco tipos salían mezclados en una sola lista. Ahora, después del país, la
pregunta es **"¿La campaña es de Rappi o de Rappi Travel?"**, y de ahí salen solo los tipos
de ese negocio: tres para Rappi, dos para Travel.

Elegir Rappi Travel lleva de una al filtro de nueve preguntas, antes de elegir el tipo: si
la campaña va a terminar en Legal, mejor saberlo antes de llenar media campaña.

El negocio queda guardado en el Sheet y hay una validación que no deja que se contradiga
con el tipo: un documento con el negocio de una empresa y el tipo de la otra saldría a
nombre de quien no es.

De paso salieron dos defectos de navegación: avanzar después de haber cambiado de pantalla
mandaba al resumen con el formulario vacío, y al elegir el tipo de una campaña de Travel el
asistente se quedaba mirando la pregunta que el comercial acababa de contestar.

## 17 de septiembre · Idioma por país, Brasil, el cashback por ETA y cuatro arreglos

### Lo que quedó

**El idioma sale del país.** La columna `idioma` del Sheet ya gobierna los meses,
la hora, el conector de las listas y los números en letras. El portugués está
completo, con sus reglas propias. El español no se movió ni un carácter y hay una
prueba que lo vigila.

**Brasil genera.** De los cuatro T&C aprobados salió un solo modelo con cuatro
formas del beneficio. Brasil pasó de bloqueado a piloto. Las correcciones al
texto están en `docs/CORRECCIONES_BRASIL.md`.

**El cashback por incumplimiento del ETA**, para Colombia, de los documentos
publicados de Bogotá y Barranquilla. Las mejoras están en `docs/MEJORAS_ETA.md`.

### Cuatro arreglos que salieron de revisar lo anterior

1. **Las variantes de las preguntas no se veían.** El mecanismo estaba construido
   y probado, pero la interfaz llamaba a `preguntaDe()` sin el tipo. La pantalla
   preguntaba "¿En qué ciudades?" en plural en una campaña de una sola ciudad.
2. **Los mensajes de error escritos no se usaban.** Cada pregunta tiene su
   `errores.vacio`, y la validación siempre armaba uno genérico: el comercial leía
   "Falta minutos del eta." en vez de "Escribe en cuántos minutos prometes la
   entrega.". Esto mejoró los mensajes de toda la herramienta, no solo del tipo
   nuevo.
3. **La auditoría guardaba identificadores en crudo.** En el Sheet quedaba
   `sin_efectivo` donde el comercial había elegido "Con todo menos efectivo", y
   `cashback_eta` donde debía decir "15 minutos o Cashback".
4. **Faltaba la validación del tope contra el presupuesto** en el tipo nuevo.

### Cómo probarlo

`npm test` (300 pruebas) y, para el recorrido completo, `npm run demo` y después
`node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js` (30 revisiones).

### Lo que necesito de Juan

- `docs/PAISES_EN_PILOTO.md`: los cuatro datos legales de cada uno de los ocho
  países en piloto.
- `docs/PENDIENTES_LEGAL.md`, sección Brasil: los cinco puntos, empezando por el
  tope del envío.
- `docs/PENDIENTES_LEGAL.md`, sección del ETA: si ese modelo debe quedar como una
  segunda excepción a la regla 1.
- Correr `setup()` después del despliegue: Colombia estrena un tipo, Brasil
  estrena estado y modelo, y la pestaña Países estrena la columna del enlace del
  botón Turbo.

## 17 de septiembre · Los T&C que Legal ya publicó

### Lo que quedó

**Para un descuento o un cupón en Colombia ya no hay que generar nada.** Legal
tiene quince T&C generales publicados y la herramienta ahora los entrega. El
comercial elige el suyo, copia el enlace y ese es el que va en la pieza. Es casi
la mitad de la demanda real (los descuentos que no son cashback son 319 de 711
promociones) y hasta hoy esa gente llegaba, no encontraba su campaña en la lista
y terminaba escribiéndole a Legal para pedir algo que ya existía.

**Por dónde llega.** Debajo de la lista de tipos de campaña, separado por una
línea, aparece "¿No ves tu campaña en la lista?" y una tarjeta:
*Descuentos, cupones, envío gratis y tarifa de servicio*. Al abrirla salen los
quince, cada uno con su beneficio, su descripción y su vigencia. Al elegir uno
sale el enlace con botón de copiar, el botón para abrirlo y la ficha con para qué
sirve. Se sale de ahí con "Volver a los tipos de campaña", que devuelve al
asistente abierto en la pregunta del tipo.

**Está escrito como buena noticia**, no como negativa: "Para esta campaña no
necesitas crear T&C" y "Listo, no tienes que generar nada". Le estamos ahorrando
el documento entero.

**La vigencia se respeta.** La Tarifa de Servicio Gratis vence el 31 de octubre de
2026 y las demás el 31 de diciembre. A partir del 1 de noviembre esa tarjeta se
queda a la vista pero deshabilitada, diciendo cuándo venció y que hay que
escribirle a Legal. Igual con uno que todavía no haya arrancado.

**La tarjeta no aparece donde no hay nada que dar**: ni en los países sin T&C
generales publicados (hoy todos menos Colombia) ni en Rappi Travel.

### Dónde está

- `data/tyc_genericos.json`: los quince, transcritos del Excel de Legal, con lo
  que hay que revisar anotado en el campo `revisiones`.
- `src/core/tyc_genericos.js`: vigencia, búsqueda por identificador y el texto
  para cuando Legal no dejó descripción.
- `src/client/js/63-tyc-genericos.js`: la pantalla y la tarjeta de entrada.
- `scripts/build.js` genera `dist/TycGenericos.js` y lo mete dentro de
  `MotorCliente.html`, porque la pantalla se pinta entera en el navegador.

### Cómo probarlo

`npm test` (358 pruebas) y, para el recorrido, `npm run demo` y después
`node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js`. En la demostración:
Empezar, No, No, Colombia, Rappi, y ahí está la tarjeta debajo de los tipos.

### Lo que necesito de Juan

Todo está en `docs/PENDIENTES_LEGAL.md`, sección "T&C generales de Colombia":

- **Cuál de los dos "Descuento en Productos Seleccionados"** es el bueno. El Excel
  lo trae dos veces con enlaces distintos y dejé los dos con un aviso.
- **El beneficio y la descripción de los dos cupones** de las filas 14 y 15, que
  llegaron vacías.
- **Si la Tarifa de Servicio Gratis se renueva** después del 31 de octubre.
- **Si el enlace de los cupones de membresía** debe seguir apuntando a la versión
  de 2024 teniendo vigencia 2026.
- **Si el T&C general de Cashback sigue publicado.** Estaba en la lista de 2025 y
  ya no está en la de 2026, y es el tipo que RappiMind sí genera.
- **Que alguien abra los quince enlaces.** La red de este entorno bloquea
  `promos.rappi.com`, así que están bien copiados pero sin verificar.

## 17 de septiembre · La revisión crítica de la noche anterior, y los tres encargos

### Qué se revisó y qué se encontró

Todo lo que entró entre `aff1bb2` y `393f7bb` se leyó con ojos críticos, por grupos
de archivos y con agentes en paralelo que tenían prohibido tocar el repositorio:
cada hallazgo se reprodujo en Node o en el navegador antes de darlo por cierto, y
lo arreglé yo con su prueba. Salieron veinticinco defectos reales. Los que más
importan, en lo que habría visto un comercial:

1. **El resumen mentía en los países en pruebas.** En Brasil, México o cualquier
   país en piloto, la lista "Te falta:" mostraba los datos legales por confirmar
   del país ("cómo se separan los miles en un monto...") en vez de lo que le
   faltaba al comercial, que casi siempre era marcar la casilla. La causa: una
   variable declarada dos veces en la misma función, y la segunda pisaba a la
   primera. Ahora hay una prueba que caza ese patrón en todo el cliente y el
   servidor.
2. **Brasil aceptaba un 500% de descuento, un tope de R$0 y cero pedidos**, y los
   imprimía en un documento publicable. Ahora tiene rangos como Colombia.
3. **Con la interfaz en portugués, una campaña de Colombia preguntaba "em reais"
   y "parceiro"**, porque la traducción se aplicaba por pregunta sin mirar el tipo
   de campaña. Las traducciones ahora tienen variantes por tipo, igual que las
   preguntas en español.
4. **Ningún mensaje de error salía en portugués**, y en español solo se usaba el
   mensaje de "vacío": un KAM de Brasil leía "Escribe el parceiro donde aplica la
   campaña." en medio de una pantalla en portugués, y un comercial de Colombia leía
   "Tope por pedido debe ser al menos 1" en vez de la frase que alguien escribió
   para eso. Ahora la validación usa los mensajes escritos para cada pregunta, en
   el idioma de la interfaz.
5. **Textos en español regados por el camino de Brasil**: el desplegable "¿Por qué
   te preguntamos esto?" en país y tipo, las notas de los países, "Así queda en tu
   T&C", "Opcional", "Paso 2 de 4", "Una sola vez", la vista previa vacía, la razón
   de la pantalla de Legal, el aviso del resumen, la casilla de declaración y la
   pantalla final entera. Y las fechas y horas de las respuestas plegadas salían en
   español ("1 de octubre de 2026", "12:00 a. m.") al lado de un documento que
   decía "1 de outubro de 2026 às 00:00".
6. **"Así queda en tu T&C" en Brasil mostraba texto de Colombia**: el tope como
   "sessenta (60) Créditos" en una campaña que no da Créditos, y la cláusula del
   mínimo en español. Las variantes de Brasil heredaban los placeholders de
   Colombia.
7. **Brasil sin la columna `idioma` generaba un documento en portugués con las
   fechas y los montos en español, sin ningún error.** Ahora no genera y dice qué
   celda de la pestaña Paises falta.
8. **Los T&C generales avisaban tarde.** En el T&C repetido, el "confirma con
   Legal cuál va" quedaba debajo del enlace y fuera de la pantalla, después de una
   caja que decía "copia el enlace y ponlo en la pieza, tal cual". Ahora lo
   pendiente va antes del enlace. Y el 1 de enero de 2027, cuando venzan los
   quince, la tarjeta ya no dirá "Buena noticia": dirá que vencieron y ofrecerá el
   formulario de Legal.
9. **Cosas más chicas**: el contador "Faltam 3 dados" dependía de una falta de
   ortografía en la traducción; el tope de Brasil no se veía como opcional; "O que
   o usuário ganha?" no avanzaba sola; un número negativo tumbaba la vista previa;
   sin parceiro la viñeta quedaba "do Parceiro , na plataforma"; el buscador de
   Mis campañas cortaba su propio texto de ayuda; la demostración armaba el título
   de Squarespace sin el país ("1 oct 2026" contra "1 OUT 2026"); y varias
   traducciones existían y nadie las usaba.

Además Brasil tiene ahora sus cuatro casos dorados (`BR01` a `BR04`): el texto
aprobado queda protegido carácter por carácter, como el de Colombia.

### La segunda vuelta: el servidor, el Sheet y el cashback por ETA

Dos revisores más, sobre lo que la primera vuelta no alcanzó (el servidor, la
pestaña Equipo, el flujo en celular y el cashback por ETA). Reproduje cada
hallazgo antes de darlo por cierto; salieron dieciséis más, y cada uno tiene su
prueba. Los que un comercial o un administrador habría visto:

1. **Ampliar una campaña solo funcionaba el primer día.** Una campaña publicada
   que arrancó el 10 mostraba el botón "Ampliar" el 16, el comercial llenaba el
   presupuesto nuevo y recibía "Esa fecha ya pasó". La ampliación rearma el
   documento completo y la validación tropezaba con la fecha de inicio. Ahora
   ampliar sabe que la campaña ya arrancó (y en Travel, que la primera
   comunicación ya salió).
2. **"Usar como base" arrastraba la ampliación de la campaña vieja.** Copiar un
   Cashback Travel que se había ampliado dejaba al final del documento nuevo la
   nota "Modificación del 16 de septiembre de 2026...", y la primera ampliación
   de la copia se titulaba "versión 3". La copia ahora arranca limpia.
3. **En celular, el selector ES/BR tapaba el último botón** ("Revisar y
   generar", "Generar T&C", "Seguir con lo que dejaste a medias") al llegar al
   final de la página. Se reservó el espacio que faltaba y el recorrido lo mide.
4. **La pantalla final de un país en pruebas no decía "no publiques".** El aviso
   estaba en el formulario y en el resumen, pero no en la pantalla que explica
   cómo publicar, que es donde se decide. Ya está. Y al ponerlo se rompió el
   navegador con `avisoDePaisEnPruebas is not defined`, porque cada archivo del
   cliente es su propio ámbito: lo cazó el recorrido, no `npm test`, así que ahora
   hay una prueba para eso también.
5. **El cashback por ETA se rompía al cambiar el día.** Es un tipo de un solo
   día que no pregunta la fecha de fin, pero la validación leía una fecha de fin
   vieja que la pantalla fijaba una vez: al mover el día, el resumen decía "la
   campaña no puede terminar antes de empezar" y no había ninguna pregunta donde
   arreglarlo. Con la misma raíz: la fecha límite de redención se comparaba con
   esa fecha vieja, y el Sheet guardaba `fecha_fin` vacía. Además dejaba dos
   ciudades ("en la ciudad de Bogotá, Medellín"), dejaba elegir "Varias órdenes"
   sin escribir cuántas (el documento salía con "un máximo de  órdenes"; en Brasil
   igual), y el nombre arrastraba la tienda de un intento anterior ("Jumbo · 15
   minutos o 100%..."). Ahora tiene sus dos casos dorados, `ETA01` (Bogotá) y
   `ETA02` (Barranquilla).
6. **"Agregar a todos" reventaba en la demostración** (no existía en el servidor
   simulado), y en producción rechazaba los nombres: pegar "Ana Pérez
   <ana@rappi.com>" tal como sale de Gmail respondía "Sin agregar, porque no son
   correos de Rappi: ana, pérez". Ahora saca los correos por su forma.
7. **El equipo aceptaba un país inventado y un rol inexistente**, y un legal con
   país "MZ" o vacío no veía ninguna campaña sin que nadie se enterara. Y volver a
   agregar a alguien que estaba con `activo` en "no" creaba una segunda fila con
   el mismo correo. Ahora el país y el rol se validan y la persona se reactiva en
   su fila.
8. **Setup no ponía al día la lista de datos por confirmar** de una hoja que ya
   existía: la de Brasil creció de cinco a diez esta sesión, y el aviso al
   abogado brasileño se habría quedado con la vieja. Ahora esa columna se une con
   la semilla, como la de modelos.
9. **Las notas internas en la fila de un país se cazaban solo si venían exactas.**
   "(confirmar)" sí; "[confirmar]", "(a confirmar)", "TBD" o "(?)" se habrían
   publicado dentro del T&C. Ahora se cazan las variantes, sin confundirse con
   "todo el territorio" o "(SIC)".
10. **Un modelo en español habilitado en Brasil habría salido mezclado** ("vinte
    por cento" y "horário de Brasília" dentro de un articulado en español) sin un
    solo error, en cuanto Legal llenara la celda que hoy lo frena. La revisión de
    idioma ahora va en las dos direcciones.
11. **Y tres más chicas**: `tieneValor` estaba en tres archivos y en Apps Script
    se pisaban; el detector de `var` repetido se tragaba la línea cuando una
    cadena traía una URL; y `previsualizar(null)` reventaba en demostración.

### Cómo probarlo

```
npm test                                                        # 421 pruebas
npm run demo
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # 40 revisiones
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # 25 revisiones
node .claude/skills/flujo-y-ux/scripts/capturar-pantallas.js    # las 33 capturas y textos.json
```

Para ver el arreglo de ampliar en la demostración: **Mis campañas**, una campaña
publicada y en curso, **Ampliar**. Para ver el de celular: la demostración con la
ventana angosta, al final de cualquier pantalla con botones, el selector ES/BR
ya no se monta sobre ellos.

Los recorridos ahora cubren los T&C generales (la tarjeta, la lista, el repetido,
la vuelta a los tipos) y el camino de Brasil en portugués hasta el resumen, con
sus mensajes de error y sus fechas.

### Los tres encargos para Claude chat

Están en `docs/encargos/`, un archivo por encargo, cada uno con una línea de
instrucciones al principio y después el mensaje entero para pegar:

| Archivo | Qué le pide | Qué adjuntar |
|---|---|---|
| `01-revision-legal.md` | Las 49 preguntas legales (22 bloqueantes), con un bloque final "PARA EL REPOSITORIO" con los nombres de nuestros campos | Nada |
| `02-revision-interfaz.md` | La revisión del copy y del recorrido de las 33 pantallas, con "ACTUAL" copiado letra por letra para buscar y reemplazar | Dieciséis capturas, listadas en orden en el propio archivo |
| `03-leyendas.md` | El catálogo de leyendas, con las cuatro piezas reales, el criterio de Legal CO 2024 y las fichas en el formato de `modelos/` | Los dos playbooks en pptx |

**En qué orden mandarlos.** Primero el 01: es el más rápido de mandar (no lleva
adjuntos), sus respuestas son las que destraban a los ocho países en pruebas y a
Brasil, y son las mismas preguntas que van a llegar por el canal de Legal Global.
Segundo el 03, que es el más importante y el más largo de responder: cuanto antes
arranque, antes vuelve. Tercero el 02, que ya no tiene nada de lo que sabíamos
roto (las capturas se regeneraron esta noche con todo arreglado). Las tres son
conversaciones separadas, así que se pueden mandar el mismo día.

### Qué necesito de Juan

1. **Abrir los quince enlaces** de los T&C generales de Colombia. La red de este
   entorno bloquea `promos.rappi.com`; están copiados letra por letra del Sheet
   "T&C Generales 2026", pero nadie ha comprobado que abran. Y de paso el de
   privacidad de Ecuador, que dice "persolanes".
2. **El T&C general de Cashback** (`promos.rappi.com/colombia/2025/cashbackco`)
   salió de la lista de 2026. Si sigue publicado, hay dos respaldos para la misma
   campaña. Está como pregunta 47 del encargo 01.
3. **La hoja 2 del Excel de 2024** ya está transcrita dentro de los encargos 01 y
   03 (la saqué del Sheet de tu Drive). Falta que digas si el criterio sigue
   vigente: es la pregunta 49 del encargo 01.
4. **El thread de Slack** está listo en `docs/THREAD_SLACK.md`, con una línea
   corregida: ya no dice que los descuentos no están cubiertos en Colombia.
5. **Brasil, dos decisiones nuevas** en `docs/PENDIENTES_LEGAL.md`: la hora de
   inicio (00:00 por defecto contra 00:01 en los aprobados) y "um (1) pedido"
   contra "1 (um) pedido".
6. **Los cuatro documentos dorados de Brasil** (`pruebas/salidas_esperadas/BR01.txt`
   a `BR04.txt`) contra los cuatro T&C aprobados que mandó Legal Brasil. Y los dos
   del cashback por ETA (`ETA01.txt`, Bogotá; `ETA02.txt`, Barranquilla) contra
   los dos publicados.
7. **Tres decisiones de texto legal nuevas** en `docs/PENDIENTES_LEGAL.md`
   (puntos 8, 9 y 12): el documento del ETA mezcla "tú" con "el
   Usuario/Consumidor" porque los bloques compartidos tutean; usa "pedido" y
   "orden" para lo mismo; y los dos nombres "Cupon de descuento - Valor fijo" y
   "Cupon de descuento - Toda la tienda" llevan un guion que la regla 8 prohíbe,
   pero vienen así del Sheet de Legal.
8. **Correr `setup()` una vez.** Ya está desplegado (ver abajo), pero `setup()`
   es lo único que no puedo correr yo. Pone al día la lista de datos por
   confirmar de Brasil en la pestaña Paises, de cinco a diez. No crea columnas ni
   toca nada de lo que Legal editó a mano.

### Desplegado

El 17 de septiembre, con la autorización de Juan. Todo lo de esta sesión está en
`main` y en la herramienta:

| Qué | Dónde |
|---|---|
| Código en el proyecto de Apps Script | `clasp push` de la ejecución 55 |
| Versión publicada | la 18, con el despliegue de siempre |
| URL de los comerciales | la misma; no cambia al actualizar la versión |

Las pruebas y el build volvieron a correr dentro de GitHub antes de subir nada:
421 en verde. Falta `setup()`, que lo corre Juan.

## 17 de septiembre · El front actual, en un archivo para Claude chat

### Lo que quedó

`docs/FRONT_ACTUAL.html`, 353 KB, un solo archivo y sin una línea de
JavaScript: **las 44 pantallas de la herramienta funcionando, congeladas**. Cada
bloque es el mismo HTML que dibuja la aplicación con la misma hoja de estilos,
así que se ve como se ve en la app y, a la vez, se lee como texto. Es lo que se
sube al proyecto de Claude chat para que hable del front que existe y no del que
se imagina.

No es una maqueta, no son capturas y no es un resumen escrito a mano. Lo genera
`npm run front`: arma la demostración (que lleva el motor real), la recorre con
un navegador sin interfaz respondiendo la campaña de ejemplo, y guarda el DOM tal
como quedó.

Lo que trae, en cuatro partes:

| Parte | Pantallas |
|---|---|
| El recorrido del comercial | 26, de la portada a la ayuda, una por pregunta |
| Los otros caminos | 11: Legal, el filtro de Travel, los T&C ya publicados y su detalle, un país en piloto, Cashback Multitienda con su lista de tiendas, Carrera de Compras con la opción bloqueada, un error en vivo, ampliar una campaña publicada y administración |
| La interfaz en portugués | 4 |
| En celular | 3, con la hoja deslizable abierta |

Cada pantalla lleva su número, en qué `E.pantalla` vive, el tamaño de ventana, el
idioma y qué hace el comercial ahí. Al final hay cinco anexos: la hoja de estilos
literal, la plantilla, **dónde se cambia cada cosa que se ve**, los archivos del
front y las llaves del estado.

Cinco cosas no salen literales, y el propio archivo lo dice en la portada: el
aviso de "Modo demostración" (no existe en la herramienta real), la vista previa
del documento (completa en tres pantallas y marcada en las demás, para no
repetir el mismo T&C treinta veces), la pantalla final (va la de producción, con
un enlace de Doc de ejemplo), lo que estaba clavado a la ventana (se clavó al
marco de cada pantalla) y la pestaña Administración (sale porque la sesión entra
con rol de administrador, igual que Juan; un CAM no la ve).

### Dónde está

| Archivo | Para qué |
|---|---|
| `docs/FRONT_ACTUAL.html` | El archivo que se sube a Claude chat |
| `scripts/front.js` | La tabla de las 44 pantallas y el orden del documento |
| `scripts/lib/front-recorrido.js` | El recorrido con el navegador y el congelado de cada pantalla |
| `scripts/lib/front-documento.js` | El armado del documento y sus anexos |
| `scripts/lib/estilos-acotados.js` | La hoja de estilos acotada a un marco por pantalla |
| `pruebas/front.test.js` | 11 pruebas del acotador, de la tabla y del archivo generado |

### Cómo probarlo

```
npm test                                          # 432 pruebas
export NODE_PATH=/opt/node22/lib/node_modules     # donde esté playwright
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers  # donde esté Chromium
npm run front                                     # 44 de 44 pantallas
```

Y abrir `docs/FRONT_ACTUAL.html` con doble clic. **Hay que volver a correr
`npm run front` después de cualquier cambio de interfaz**, igual que con las
capturas: un archivo de contexto viejo es peor que no tenerlo, porque nadie nota
que miente. Generarlo necesita un navegador, que no es dependencia del proyecto,
así que ninguna prueba obliga a regenerarlo.

### Un defecto que salió al armarlo

En **Mis campañas**, una campaña publicada y en curso muestra sus dos acciones
pegadas: se lee `Usar como baseAmpliar`. Entre "Abrir" y "Usar como base" hay un
espacio y entre "Usar como base" y "Ampliar" no
(`src/client/js/68-pantallas.js`, la celda de acciones). Se arregla con un
espacio, como el que ya está tres líneas arriba, pero no lo toqué: no era el
encargo y cambiar el front cambia también este archivo. Dime y lo hago.

### Lo que necesito de Juan

1. **Subirlo al proyecto de Claude chat** y decirme si el peso le sirve: son
   353 KB, de los cuales el T&C completo de las tres vistas previas pesa unos
   90. Si es mucho, dejo una sola vista previa completa y bajamos a 260 KB.
2. **Si quieres el código del front dentro del archivo** (los 167 KB de
   `src/client/`), lo agrego como anexo. Hoy va la hoja de estilos y la
   plantilla completas, y de los archivos de JavaScript va la tabla con qué hace
   cada uno, no el código.
3. **El espacio de "Usar como baseAmpliar"**, arriba.


## 18 de septiembre · La respuesta del encargo 02, aplicada a la interfaz

Se trabajó una sola cosa: `docs/encargos/respuestas/02-interfaz.md`. Los otros
dos encargos quedaron sin tocar. Los números de pantalla que usa esta entrada
son los de `docs/FRONT_ACTUAL.html`, que van de 1 a 44.

### Lo primero: el bloque trae 93 líneas, no 94

El archivo tiene 93 líneas `pantalla NN | ACTUAL | PROPUESTO`. Además, el bloque
arranca justo después de "Tres cosas a tener en cuenta al buscar:", sin el
título "PARA EL REPOSITORIO" que el encargo pedía. Puede que al pegar se haya
perdido esa línea de título, o una de las propuestas. **Juan: mira si falta
alguna en la conversación de Claude chat.**

### Cómo se repartieron las 93

| | Cuántas |
|---|---|
| Con un texto ACTUAL de verdad | 68 |
| De esas, encontradas literales en el código | **68, todas. Ninguna se perdió** |
| Con `ACTUAL: "(recorrido)"`, que no son un texto sino un cambio de comportamiento | 25 |
| Que se salen de las reglas de diez palabras, ayuda de una línea o guiones como puntuación | **0** |

Las 68 se buscaron letra por letra en `src/core/`, `src/client/` y `data/`. Cada
una apareció tal cual, sin una sola variante. Y ninguna de las 68 propuestas
rompe las reglas: se midieron las diez palabras de cada pregunta, que la ayuda
sea una sola línea que termina en punto, y que no haya guiones como puntuación.
De paso se midieron las demás reglas de `pruebas/preguntas.test.js` (que la
pregunta sea una pregunta, que hable de tú, que la nota de cada opción explique
algo, que el porqué sea largo) y también pasan.

### Se aplicaron 57 de las 68

Quedaron 11 en espera, abajo. Las 57 tocaron 13 archivos: `preguntas.js` (24),
`ayuda.js` (14), `textos_interfaz.js` (9), `esquemas.js`, `preguntas_pt.js`,
`identificaciones.js` y seis de `src/client/js/`.

Tres cosas se hicieron con cuidado especial:

- **El "99" del porcentaje** (pantalla 11) aparece 64 veces en el repositorio.
  Solo se cambió el ejemplo gris del campo, que ahora dice 20.
- **"Editar" a "Cambiar"** en el resumen: se borró la llave `'Editar'` del
  diccionario de portugués, porque `'Cambiar'` ya estaba traducida y dos llaves
  iguales se pisan. Ver decisión 28.
- **"por el canal de Legal" a "en #tyc-rappi"**: seis sitios, una sola línea del
  bloque. Claude chat avisó que estaba **suponiendo** que el canal de Legal es
  #tyc-rappi. El repositorio le da la razón (`CANAL_TC` en `src/core/ayuda.js`
  ya lo tiene como el canal donde se centraliza todo lo de T&C), así que se
  aplicó. **Si el canal es otro, dilo y lo devuelvo.**

### Lo que NO se aplicó, y por qué

No es que rompan las reglas del texto. Son decisiones tuyas.

**1. Las diez líneas de `data/tyc_genericos.json` (pantalla 30).**
Ese archivo es la lista de Legal transcrita como llegó. `pruebas/tyc_genericos.test.js`
lo dice con todas las letras: las inconsistencias del Excel siguen a la vista y
no "arregladas", porque corregirlas por cuenta propia sería decidir por Legal.
Las diez líneas corrigen exactamente eso. Van en tres grupos, por si quieres
aprobar unos y otros no:

- *Solo tildes y mayúsculas, no cambia lo que dice*: "envio" a "envío",
  "suscripcion" a "suscripción", "miembros rappi pro" a "miembros Rappi Pro",
  "Codigo" a "Código", "Cupon" a "Cupón".
- *Cambian el nombre del T&C en la lista*: "Cupon de descuento - Valor fijo" a
  "Cupón de descuento de valor fijo", y el de "Toda la tienda" igual. Ojo que
  esos dos nombres, como están hoy, usan un guion como puntuación, que es
  justo lo que la regla 8 de `CLAUDE.md` prohíbe. Hay argumento para las dos
  cosas.
- *Reescriben las palabras de Legal*: el "para qué sirve" y el "beneficio" de
  cuatro T&C (tarifa de servicio, suscripción, el del check out y el del canal
  externo).

Y aparte, las cinco líneas de "Decisión tuya" que ya venían marcadas así: el
enlace duplicado, el enlace de 2024 de los cupones de membresía, para qué sirven
los dos cupones, y renovar Tarifa de Servicio Gratis antes del 31 de octubre.

**2. La quinta pregunta del filtro de Travel (pantalla 28).**
La propia respuesta la condiciona: "Sin esa línea, no cambiar la quinta". La
versión corta solo funciona si los ejemplos ("noches o niños gratis, cupones,
millas, eSIM, bonos o cuotas sin interés") se mudan a una línea de ayuda debajo,
y esa línea es uno de los 25 cambios de recorrido, que hoy no se construyeron:
`FILTRO_DE_TRAVEL` no tiene campo de ayuda. Aplicarla sola habría borrado los
ejemplos sin dejarlos en ninguna parte. Las otras siete preguntas del filtro sí
se acortaron.

### Los 25 cambios de recorrido, sin tocar

No son reemplazos de texto: son comportamiento. Ordenar la Ayuda de otra manera,
que Turbo y consumo en el local no se puedan marcar a la vez, que el contador de
preguntas cuente bien, un botón de "Cambiar mi respuesta" en la pantalla de
Legal, que las tres preguntas que vienen premarcadas arranquen sin marcar, que
"Ahora dice" muestre las fechas en palabras, partir en dos la sexta pregunta del
filtro de Travel. Son de otro tamaño y van en su propia sesión, contigo
decidiendo cuáles.

### Un defecto que salió al regenerar el front

`npm run front` se traía 43 de 44 pantallas: la 36, la de ampliar una campaña,
desaparecía. No era el encargo, era el reloj. El recorrido armaba la campaña de
ejemplo con la fecha del contenedor (UTC) y la página corre en `America/Bogota`,
así que de madrugada no son el mismo día: la campaña arrancaba "mañana", nunca
estaba en curso y el botón Ampliar no se dibujaba. Arreglado, y ahora la fecha
sale del mismo reloj que decide si el botón aparece. Ver decisión 27.

### Cómo probarlo

```
npm test                                          # 432 pruebas, todas pasan
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
npm run front                                     # 44 de 44 pantallas
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # el recorrido completo pasa
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # todo bien
node .claude/skills/flujo-y-ux/scripts/capturar-pantallas.js    # 33 de 33 capturas
```

Y para verlo con los ojos: abre `docs/FRONT_ACTUAL.html` con doble clic. Las
pantallas que más cambiaron son la 1 (la portada), la 22 (el resumen, que ahora
dice Cambiar), la 24 y la 26 (Squarespace y la Ayuda, con #tyc-rappi) y la 28
(el filtro de Travel, siete preguntas más cortas).

### Lo que necesito de Juan

1. **Las diez líneas de `data/tyc_genericos.json`**, arriba. Dime si van las
   tres tandas, solo las tildes, o ninguna.
2. **La quinta pregunta del filtro de Travel**: ¿construyo la línea de ayuda del
   filtro y entonces la acorto, o la dejo larga como está?
3. **¿"el canal de Legal" es #tyc-rappi?** Se aplicó suponiendo que sí.
4. **Un texto en portugués quedó descuadrado y no lo toqué.** El botón de la
   pantalla final pasó de "Ver mi historial" a "Ver mis campañas", para que
   coincidiera con la pantalla que abre. En portugués el mismo botón sigue
   diciendo "Ver o meu histórico" y la pantalla se llama "Minhas campanhas": el
   mismo descuadre que acabamos de corregir en español. La traducción que
   cuadraría es "Ver as minhas campanhas", pero no la escribo yo. ¿La pongo?
5. **Los 25 cambios de recorrido**: cuáles entran y en qué orden.
