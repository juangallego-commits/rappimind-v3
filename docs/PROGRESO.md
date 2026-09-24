# Progreso

La tabla es el resumen. Lo que sigue es el diario, sesión por sesión, y crece
por abajo: lo último está al final. Si buscas qué falta, la tabla y
`docs/PENDIENTES_LEGAL.md` lo dicen sin leer el diario.

| Bloque | Estado | Cómo probarlo | Qué necesito de Juan |
|---|---|---|---|
| 0 | cerrado | `npm test` (32 pruebas), `npm run build` y el flujo de Actions en verde | Crear el despliegue de la web app (lo hace el disparo manual) |
| 1 | listo, en punto de control A | `npm test` (103 pruebas) y `npm run previsualizar` | Revisar 3 textos y `docs/PENDIENTES_LEGAL.md` |
| 2 | listo, falta verificar en Google | `npm test` (157 pruebas) | Correr `setup()` y completar las propiedades |
| 3 | listo | `npm run demo` y abrir `demo/index.html` | Revisar las capturas y los textos |
| 4 | pendiente | | Falta el despliegue versionado, que lo dispara Juan |
| 11 · descuentos, cupones y concursos fuera de Colombia | cerrado | `npm test` | Nada para seguir: lo que falta lo revisa el abogado de cada país en `docs/PENDIENTES_LEGAL.md` |
| 12 · revisión legal global | listo, falta que Juan lo mande | `python3 scripts/hoja_feedback.py salida.xlsx` y abrir el archivo | Subir la hoja a Drive, pegar el enlace en el mensaje, poner las menciones y mandarlo por #legalglobal |
| 9 · identidad | cerrado | `npm test` (681), `npm run contraste` y los dos recorridos | Mirar el titular y la píldora Publicado en pantalla, y decidir el correo, el lockup y los estados del historial |
| 13 · Legal por país | cerrado | `npm test` (728) y los dos recorridos | Confirmar con cada equipo legal el formulario o canal real de su país |

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

Las capturas de ese día se borraron el 21 de septiembre de 2026, junto con el
resto de las capturas versionadas. Se sacan de la aplicación cuando hacen falta.

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


## 18 de septiembre · La respuesta del encargo 01, aplicada

Entró `docs/encargos/respuestas/01-legal.md`: las 49 preguntas respondidas y un
cierre de 34 líneas de decisiones más los valores por país. Se aplicó solo lo que
venía con texto exacto. Lo demás quedó en `docs/PENDIENTES_LEGAL.md`, en la
sección nueva del final, con veintisiete puntos repartidos en seis grupos.

Solo se tocó el encargo 01. Los otros dos (la interfaz y las leyendas) siguen sin
empezar.

### Lo que cambió en los valores de cada país

En `data/paises.json`. **Ojo: la pestaña Países del Sheet manda sobre esto**, así
que estos cambios no llegan solos a producción. Hay que escribirlos allá a mano.

| País | Qué cambió |
|---|---|
| Brasil | Los cinco valores que estaban en español pasaron a portugués, y el nombre de la política de privacidad cambia de artículo ("o", no "a"). La autoridad de datos pasa de Autoridade a **Agência** Nacional de Proteção de Dados: la MP 1.317/2025 la convirtió en agencia y la sigla ANPD se mantuvo. |
| México | Los derechos de datos suman la revocación del consentimiento. |
| Perú, Argentina, Chile, Ecuador, Uruguay, Costa Rica | Los derechos de datos dejan de ser la frase genérica y pasan a enumerarse con los nombres de la ley de cada país. |
| Chile | La autoridad de datos pasa a "las autoridades competentes". La Agencia de Protección de Datos Personales todavía no existe operando, y nombrarla remite al usuario a una entidad que no lo puede atender. |
| Uruguay | La entidad de vigilancia dice ahora de qué ministerio es esa área. |

### Lo que cambió en el texto legal

| Dónde | Qué |
|---|---|
| `modelos/bloques/acreditacion.md` y `modelos/cashback_travel.md` | Con carga inmediata (o "al confirmarse la reserva" en Travel), la verificación de elegibilidad pasa a ser posterior y con reversión de los Créditos. Con las otras cargas, la frase se queda igual. |
| `modelos/cashback_eta.md` | Oración nueva al final del beneficio: no hay Beneficio si el retraso es por causas del Usuario/Consumidor (dirección errada, cambio de la orden, no estar para recibirla) ni por fuerza mayor. |
| `modelos/promocao_br.md` | "pessoa humana" pasa a "pessoa física". |
| `modelos/bloques/br_condicoes_gerais.md` | La única "a Rappi" del documento pasa a "o Rappi", como las otras nueve. |
| `src/core/derivados.js` | Los días de "usuarios reactivados" se nombran con el término de cada país ("días calendario" en Colombia), no con "días" a secas. |
| `src/core/derivados_travel.js` | La base de cálculo del cashback de Travel excluye impuestos, tasas y contribuciones, y lo dice con esas palabras. El ejemplo del tope habla del valor que cuenta para el cálculo, no del valor pagado. La frase del ámbito se parte según las categorías: una campaña solo de vuelos ya no habla de servicios, y una de hoteles ya no habla de vuelos. |
| `data/tyc_genericos.json` | "Descuento en Productos Seleccionados" deja de estar repetido: la herramienta ofrece solo el de la ruta con año. Quedan catorce T&C generales, no quince. |

### Las salidas esperadas que cambiaron

Catorce de las dieciocho. **Estas son las que hay que mirar**, y lo que cambió en
cada una es exactamente una de las líneas de arriba, nada más:

| Caso | Qué cambió |
|---|---|
| CB01, CB02, CD01 | La verificación de elegibilidad (los tres tienen carga inmediata). |
| ETA01, ETA02 | La salvedad nueva del retraso imputable al usuario. |
| MX01 | Los derechos de datos de México. |
| TV01, TV02, TV03, TV05 | La base de cálculo sin impuestos y el ejemplo del tope. |
| TV01, TV03 | Además, el ámbito partido: TV01 es solo vuelos y TV03 solo hoteles. |
| TV03 | Además, la verificación de Travel (carga al confirmarse la reserva). |
| BR01 a BR04 | "pessoa física" y "não sendo o Rappi responsável". |

No cambiaron CC01 (Carrera de Compras), TV04, TV06 ni TV07.

### Cómo probarlo

```
npm test                                                        # 448 pruebas
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # el recorrido completo pasa
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # todo bien
```

Y en la demostración, para ver lo que cambió sin leer código: elige Cashback,
llega a "¿Cuándo le llegan los Créditos?" y cambia entre "Apenas termina el
pedido" y "Al día siguiente del pedido". El "Así queda en tu T&C" de esa pregunta
muestra ahora las dos frases que la respuesta produce, y la cláusula de
acreditación del documento de la derecha cambia con ella.

### Pruebas nuevas

| Archivo | Qué protege |
|---|---|
| `pruebas/decisiones_legales.test.js` | Doce pruebas: que la frase cambie cuando tiene que cambiar y se quede igual cuando no. La verificación según la carga (delivery y Travel), los días del país en "reactivados", la base de cálculo con y sin Asistencia, el ejemplo del tope y las cinco formas del ámbito de Travel. |
| `pruebas/brasil.test.js` | Dos pruebas nuevas: que los valores legales de Brasil no traigan palabras en español, y que el documento diga "pessoa física" y "o Rappi" una sola vez cada uno. |
| `pruebas/paises_en_pruebas.test.js` | Que un dato confirmado salga de la lista y que el aviso no se apague por eso. |
| `pruebas/servidor.test.js` | Que `setup()` no borre de la hoja un dato por confirmar que la semilla ya no trae. Es la razón por la que hay que limpiar el Sheet a mano. |

### Lo que necesito de Juan

1. **Cambiar a mano los valores en la pestaña Países del Sheet.** La hoja manda
   sobre `data/paises.json` y `setup()` solo completa celdas vacías: los valores
   que ya están escritos allá no se tocan solos. Son los de la tabla de arriba.
2. **Borrar a mano, en esa misma pestaña, los datos por confirmar que ya se
   confirmaron.** Esa columna solo crece con `setup()`. Después de desplegar,
   `setup()` va a agregarle a cada país en piloto el pendiente nuevo
   (`visto_bueno_legal_local`), pero los cuatro viejos se quedan hasta que los
   borres.
3. **Las cinco preguntas bloqueantes que no cerraron**: el tope del frete grátis
   de Brasil, la autoridad de consumo de Argentina, el separador de miles de
   Ecuador y de Costa Rica, y si CRM puede configurar el límite por tienda del
   Cashback Multitienda. Están en el grupo A de `docs/PENDIENTES_LEGAL.md`.
4. **La cláusula de responsabilidad de Rappi Travel** (decisión 40). El texto
   alternativo está escrito y la respuesta dice que la decisión es tuya. Dime sí
   o no y se aplica, o se anota como riesgo aceptado.
5. **La tanda de Carrera de Compras** (la pregunta de quién entrega el premio, la
   viñeta de premios en Créditos y la frase de datos del ganador). El texto de la
   frase de datos es exacto, pero no puede entrar solo sin empeorar el caso de
   premio en Créditos. Grupo B de los pendientes.
6. **Las capturas no se regeneraron.** La pregunta de la carga cambió lo que se
   ve en "Así queda en tu T&C". No corrí `capturar-pantallas.js` para no
   desincronizar `docs/encargos/02-revision-interfaz.md`, que es el documento del
   encargo que todavía no se ha trabajado. Se regeneran en esa sesión.

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

## 18 de septiembre · Seis países salen de piloto

Juan aprobó que México, Perú, Argentina, Chile, Uruguay y Brasil pasen de piloto
a activo. Ecuador y Costa Rica se quedan, porque nadie ha dicho todavía si
escriben los miles con punto o con coma.

### Qué cambia en la pantalla

1. **Los seis países le salen a cualquier comercial.** Hasta hoy solo los veía
   quien tuviera rol legal, pruebas o admin. En el selector la nota pasa de "En
   piloto: solo para el equipo de pruebas." a "Disponible.".
2. **Se va el freno de publicación.** Desaparece el aviso del formulario ("está
   en pruebas: genera y revisa, pero todavía no publiques") y el bloque del
   resumen ("no publiques este documento todavía"). El documento de esos seis
   países pasa a ser publicable.
3. **Ecuador y Costa Rica siguen igual**, con su aviso y con "cómo se separan los
   miles en un monto" en la lista de lo que falta.

### Antes de tocar nada, se generó un documento de cada país

Con los mismos datos, para ver qué sale de verdad y no fiarse de la lista de
pendientes. Los cinco de habla hispana salen limpios: cero `{{ }}`, cero `[[ ]]`,
sin dobles puntos, sin paréntesis vacíos y sin frases partidas. México 11.935
caracteres, Perú 12.025, Argentina 11.900, Chile 11.836 y Uruguay 11.938.

### Brasil entró con advertencia

Esta sesión recomendó dejar a Brasil en piloto hasta que Legal BR contestara el
mensaje del encargo 01. Juan confirmó que entrara igual, y entró. Los cinco
puntos que siguen abiertos quedaron escritos en `docs/PENDIENTES_LEGAL.md`, en la
sección "Brasil ya está en producción, con estos puntos abiertos", porque ya no
hay aviso en pantalla que los recuerde.

### Cómo llega el cambio al Sheet

`data/paises.json` declara ahora una tanda nueva, `estados-2026-09-18`, con las
seis columnas de estado. La pestaña Paises manda sobre la semilla, así que sin
esa tanda cambiar el archivo no habría movido ni una fila del Sheet de Juan.

**Después de desplegar hay que correr `setup()` una vez.** Eso es lo que escribe
"activo" en las seis filas. Lo corre Juan; Claude Code no puede.

### Cómo probarlo

```
npm test                                                        # 455 pruebas, todas pasan
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # el recorrido completo pasa
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # todo bien
npm run front                                                   # 44 de 44 pantallas
node .claude/skills/flujo-y-ux/scripts/capturar-pantallas.js    # 33 de 33 capturas
```

Y con los ojos: abre `docs/FRONT_ACTUAL.html` y mira la pantalla del país en
piloto, que ahora es Ecuador y no México.

### Pruebas nuevas

- `la tanda de estados saca de piloto a los seis países en una hoja vieja`, que
  corre el camino entero contra una hoja que decía "piloto" en las ocho filas.
  Comprobado que falla si se quita la tanda.
- `si Juan vuelve a poner un país en piloto, setup no lo saca otra vez`.
- `los seis que salieron de piloto no llevan el aviso de pruebas`.
- En el navegador: que México y Brasil, ya activos, no lleven el aviso, y que
  Ecuador sí lo lleve también en portugués.

### Lo que necesito de Juan

1. **Correr `setup()`** en Apps Script después de desplegar. Sin eso el Sheet
   sigue diciendo "piloto" y no cambia nada de lo de arriba.
2. **Los casos dorados de Perú, Argentina, Chile y Uruguay**: no los pediste, así
   que no los hice. Cuatro países sin caso dorado quedan sin nadie que avise si
   una cláusula compartida se mueve. La oferta sigue en pie.
3. **Ecuador y Costa Rica**: con que alguien diga si escriben los miles con punto
   o con coma, salen de piloto el mismo día.

## 18 de septiembre · Las leyendas de piezas publicitarias, del encargo 03

El comercial ya no tiene que pedirle a Legal el texto legal que va dentro del
arte. Sale con el documento, en la misma pantalla, lleno con los mismos datos
que llenaron el T&C.

### Qué ve el comercial

1. **Una pregunta nueva al final del formulario**, en un paso que se llama "La
   pieza publicitaria": "¿Qué categoría tiene el producto de la pieza?", con
   Ninguna marcada. Cada opción adelanta la advertencia que se va a imprimir, así
   que se elige viendo lo que sale. Si eliges un medicamento se abren dos
   preguntas más: el registro sanitario y la notificación ante el INVIMA.
2. **En la pantalla final, un bloque nuevo, "El texto legal de tus piezas"**, con
   una leyenda por formato (texto de apoyo, letra pequeña, banner corto, valla) y
   un botón de copiar en cada una. Debajo dice cuánto mide y cuánto admite el
   formato.
3. **Cuando una leyenda no cabe, lo dice.** Con los datos de la pieza real de El
   Corral, el banner corto mide 382 caracteres y admite 300, y no hay nada que
   quitar porque todo lo que queda es obligatorio. Eso hay que saberlo antes de
   mandar a diseñar, no después.
4. **El enlace por confirmar.** La leyenda sale completa el mismo día, con la
   dirección donde va a quedar publicado el T&C. Cuando pegas el enlace real, la
   herramienta compara: si es igual, dice "enlace confirmado"; si es distinto,
   rehace las leyendas y avisa en rojo que hay que cambiar el arte.

### La prueba que más vale

Reproduce la pieza publicitaria real de El Corral con los datos que la respuesta
dice que usó. El texto de apoyo sale idéntico, 146 caracteres, y la letra pequeña
palabra por palabra. Si un marcador cambia de forma, esa comparación se cae.

Y hay otra que compara letra por letra las 55 leyendas del repositorio contra la
respuesta de Claude chat: si alguien "mejora" una frase o arregla una tilde, se
cae. Comprobado que falla al cambiar una palabra.

### Lo que no se construyó, y por qué

- **Las preguntas de los descuentos con T&C general.** Decidiste dejarlas: hoy
  ese tipo de campaña no existe en la herramienta, así que no son dos preguntas
  más sino un recorrido nuevo completo.
- **La leyenda de push y SMS.** Necesita el enlace corto, y aunque aprobaste que
  sea una dirección propia dentro de promos.rappi.com, falta definir cómo se arma
  y quién crea la página. Se entrega como pendiente, con esa razón en pantalla,
  para no tumbar con ella las otras cuatro leyendas.
- **Las leyendas de los otros ocho países.** La respuesta dice "no cubierto": el
  SSL solo da recetas. Los complementos de categoría de esos países sí están en
  el catálogo, pero no hay leyenda de campaña donde pegarlos.

### Defectos reales que salieron al construirlo

1. **`dist/Leyendas.js` habría pisado a `leyendas.js`** en Apps Script, que no
   distingue mayúsculas. Lo cazó el propio build.
2. **`comoLista` estaba declarada dos veces**, en `paises.js` y en `leyendas.js`.
   En Apps Script la segunda pisa a la primera sin avisar.
3. **Nueve alias de `require` con nombre distinto al global**, que en el navegador
   quedan sin definir: la pantalla final se quedó sin leyendas con "tieneValorLey
   is not a function". Hay una prueba nueva que caza esta clase entera.
4. **El largo máximo lo ponía la leyenda y tiene que ponerlo el formato.** Un
   banner de Carrera de 500 caracteres pasaba por bueno.
5. **La lista de tiendas del Multitienda salía vacía**, porque leía `nombre` y
   `alcance` y los datos traen `marca`, `nacional` y `ciudades`.
6. **`partesDeFecha` devuelve `anio` y el código decía `ano`.** Una campaña de fin
   de año salía "del 30 de diciembre al 2 de enero de 2027", sin decir de qué año
   era el 30 de diciembre.
7. **Una razón social que termina en abreviatura ya trae su punto.** "Cashback
   ofrecido por Operador de Prueba S.A.S.." tumbaba la leyenda entera del caso
   TV05.
8. **Con siete pasos, la barra de arriba se leía "OrganizadorCuándo".** Solo se
   vio abriendo el navegador.

### Cómo probarlo

```
npm test                                                        # 528 pruebas
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # el recorrido completo pasa
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # todo bien
npm run front                                                   # 45 de 45 pantallas
node .claude/skills/flujo-y-ux/scripts/capturar-pantallas.js    # 33 de 33 capturas
```

Y con los ojos: abre `docs/FRONT_ACTUAL.html` y mira la pantalla 22, la de la
categoría del producto, y la 25, la pantalla final con las leyendas.

### Lo que necesito de Juan

1. **Las 24 preguntas de la lista 2 de la respuesta.** Sobre todo la 21, la 16 y
   la 6, que son las que más cambian el diseño.
2. **La forma del enlace corto**: cómo se arma la dirección y quién crea esa
   página en Squarespace. Sin eso no hay leyenda de push ni de SMS.
3. **El espacio no alcanza, y no solo en el banner.** Una campaña corriente
   (Farmatodo, 20%, solo Turbo, con compra mínima y categoría licores) da una
   letra pequeña de 645 caracteres contra un límite de 620, ya recortada hasta el
   último nivel. El banner corto de esa misma campaña mide 734 contra 300. Hay
   que decidir si el límite es el correcto, si el enlace de Turbo puede ir corto,
   o qué más se puede marcar como recortable dentro del texto legal.
4. **Correr `setup()`** después de desplegar, por lo de los países.

## 18 de septiembre · El acuerdo de transferencia de datos

Juan preguntó si le había llegado a Claude Code lo del acuerdo que hay que firmar
en cada país cuando el premio lo entrega el Organizador. Sí había llegado, en la
respuesta del encargo 01 (decisión 36), pero estaba sin construir: era el
pendiente 8 de la lista de trabajo de producto. Ahora está.

### Qué ve el comercial

1. **Una pregunta nueva en Carrera de Compras**, en el paso del premio: "¿El
   Organizador ya firmó el acuerdo de transferencia de datos?". Sale solo cuando
   el premio es físico y lo entrega el Organizador, que es la única combinación
   en la que Rappi le pasa a la marca el nombre, la dirección y el documento del
   ganador. Es opcional: no bloquea el T&C.
2. **Si responde "No, o no sé", se abre el camino para firmarlo.** En Colombia,
   el circuito completo de nueve pasos, con la tabla de acuerdos marco, la Orden
   de Transferencia por campaña, el certificado de supresión y la salida de
   emergencia (cambiar a Rappi como operador logístico). En los países con
   modelo, una línea y un botón que abre el modelo de Legal de ese país. En Chile
   y Costa Rica, que no tienen modelo, la línea que manda a Legal.
3. **La pantalla final repite el aviso**, con su botón. Entre el formulario y la
   entrega del premio pasan semanas, y para entonces nadie se acuerda.

### Y dos cosas que estaban mal desde antes, en producción

1. **El documento anunciaba una transferencia de datos que nunca ocurre.** La
   cláusula se imprimía mirando solo quién entrega, sin mirar qué se entrega, así
   que una Carrera con premio en Créditos decía que Rappi podría compartir los
   datos del ganador. Con Créditos no hay nada que compartir. El caso dorado CC01
   lo imprimía, y ahora vigila lo contrario.
2. **La cláusula no cuadraba con el Acuerdo Marco.** Hablaba solo de "datos de
   contacto" cuando el Anexo A incluye también la dirección de entrega y el
   número de documento; dejaba la autorización para después cuando el acuerdo
   dice que consta en el T&C; y no decía la finalidad, que la cláusula cuarta
   obliga a informar. Entró el texto corregido de la respuesta, letra por letra.

Entra `CC03`, un caso dorado nuevo con premio físico entregado por el
Organizador: es la única combinación en la que los datos viajan, y hasta hoy no
tenía quién la protegiera.

### Un defecto que salió al construirlo, y que solo vio el navegador

El aviso del acuerdo sale solo en Carrera. En un cashback devolvía nada, y se
agregaba igual a la pantalla: lo que veía el comercial era **"No pudimos generar
el documento" encima de un documento que sí se había generado**. `npm test` no lo
vio; lo cazó el recorrido de navegador. Ahora hay tres revisiones nuevas ahí para
que no vuelva a pasar en silencio.

### Cómo probarlo

```
npm test                                                        # 542 pruebas
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # 50 revisiones
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # todo bien
```

Con los ojos: arma una Carrera con premio físico entregado por el Organizador y
responde "No, o no sé" en la pregunta del acuerdo.

### Lo que necesito de Juan

1. **Una frase, para cerrar la otra mitad del arreglo.** La respuesta dice que la
   pregunta "¿Quién entrega el premio?" no debería salir con premio en Créditos,
   y propone el texto que reemplaza la viñeta de entrega, pero viene marcado "lo
   decides tú". Sin tu visto bueno no se puede aplicar: la viñeta no es opcional
   y esconder la pregunta la dejaría rota. Está en `PENDIENTES_LEGAL.md`.
2. **El acceso de los KAM a la carpeta de Drive.** En el hilo, dos personas no
   pudieron abrirla, y la herramienta ya les muestra el botón.
3. **Una coma.** El circuito de Colombia dice: cambia tu respuesta a "Rappi, como
   operador logístico". La opción del formulario se llama "Rappi como operador
   logístico", sin coma. No toqué el texto legal por eso; dime cuál cede.

## 18 de septiembre (noche) · Un solo enlace, y las tres cosas que vio Juan usando la herramienta

Cierra el día: la decisión del enlace, la frase de los Créditos aprobada y los
tres reportes que Juan mandó después de entrar a la herramienta. Dos eran
defectos reales, el tercero no lo era.

### El enlace es uno solo

Juan lo zanjó así: "el enlace para todo tiene que ser el mismo". Se acabó la
espera por una dirección corta que nadie había definido. La leyenda de push y SMS
ya no se retiene como pendiente: sale, con la misma dirección del T&C que va en
la letra pequeña. En los casos dorados mide 89 caracteres contra un límite de 70,
y el enlace son 51 de esos 89: sin el enlace son 38 y cabe de sobra. La pantalla
dice por cuánto se pasa y cuánto pesa el enlace, así que quien arma la pieza
decide, que es justo lo que Juan dijo que hacen.

De paso, cuando una leyenda no cabe la pantalla ya no dice solo que no cabe:
dice por cuántos caracteres se pasa y cuánto de ese texto son enlaces. Es
exactamente el dato que falta para decidir lo que sigue abierto: si sobra el
límite, si sobra el enlace o si sobra texto legal.

### La frase de los Créditos, aprobada

Con el visto bueno de Juan entró la frase que faltaba: **"Los Créditos serán
acreditados por Rappi en la Billetera de Créditos del ganador, por cuenta del
Organizador, una vez aceptado el premio."** Con ella, la pregunta "¿Quién entrega
el premio?" desaparece cuando el premio es en Créditos, porque con Créditos no
hay entrega que repartir. Un caso dorado cambió, `CC01`, y cambió una sola línea.

### Los tres reportes de Juan

1. **El enlace de Drive no aparecía. Era verdad, y era el peor sitio posible.**
   El panel del acuerdo devolvía la caja antes de llegar al botón en la rama de
   Colombia, así que el único país donde la herramienta se usa hoy era justo el
   único que no veía el enlace. Las pruebas comprobaban que el dato estuviera en
   el país; nadie comprobaba que el botón llegara a la pantalla. Ahora el botón
   se arma en su propia función, se agrega en las dos ramas, y hay una prueba que
   lee el archivo y falla si vuelve a colgar de un solo país.
2. **El NIT rechazado no era un defecto.** `900.898.545-1` de verdad no es
   válido: para ese cuerpo el dígito de verificación es 0, no 1. Lo comprobé con
   NITs reales conocidos antes de decirlo. Lo que sí estaba mal era el mensaje,
   que no daba por dónde buscar. Ahora dice cuál es el dígito que corresponde y
   pide revisar el número completo.
3. **Las pantallas del front.** `docs/FRONT_ACTUAL.html` no tenía la pantalla del
   acuerdo de transferencia de datos: se construyó la pregunta y se olvidó
   agregarla al documento de pantallas. Ya está, y el documento pasó de 45 a 46
   pantallas.

### Cómo probarlo

```
npm test                                                        # 543 pruebas
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # 50 revisiones
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # 26 revisiones
npm run front                                                   # 46 de 46 pantallas
```

Con los ojos, en la demostración: arma una Carrera de Colombia con premio físico
entregado por el Organizador y mira que el botón "Abrir el modelo de acuerdo"
esté ahí. Y en un cashback de Farmatodo, mira el bloque de leyendas de la
pantalla final: la de push ya no dice "pendiente", dice por cuánto se pasa.

### Lo que necesito de Juan

1. **Qué más no cuadra en las pantallas del front.** Encontré y arreglé la
   pantalla que faltaba, pero si lo que viste era otra cosa, dime cuál pantalla y
   qué esperabas ver.
2. Lo de siempre, que sigue abierto: el acceso de los KAM a la carpeta de Drive,
   la coma de "Rappi, como operador logístico", las 24 preguntas de la lista 2 y
   el espacio de la letra pequeña y el banner.

## 18 de septiembre (cierre) · La revisión general, antes de la etapa de diseño

Última pasada sobre el fondo. De aquí en adelante solo se toca cómo se ve.

### Lo que estaba roto y se arregló

**1. Con la respuesta "1", ocho frases del documento salían en plural.** Un
cashback con un día de vigencia de los Créditos publicaba "tendrán una vigencia
de **un (1) días calendario** contados a partir de su carga". Lo mismo con un
día sin comprar, un día de anticipación, una noche mínima de hotel, un día de
alquiler, una unidad con descuento y un producto con el descuento máximo.
Ninguna prueba lo veía porque ninguno de los treinta y dos casos dorados
responde 1 a esas preguntas, y la red de seguridad del motor tampoco puede
verlo: esas frases no tienen ningún signo roto, están bien formadas y mal
escritas. Con dos o más, el documento sale carácter por carácter igual que
antes.

**2. Con la respuesta "0", el documento se generaba diciendo cualquier cosa.**
Una compra mínima de cero salía como "el valor de los productos de tu pedido
deberá ser igual o superior a cero pesos M/Cte. ($0)". Un premio de cero
Créditos, como "Cada ganador recibirá cero (0) Créditos". Un tope de cero en
Rappi Travel, como "sin que puedas recibir más de cero (0) Créditos por orden".
Una tienda del Multitienda con presupuesto cero, como "Beer Station (Bogotá):
cero (0) Créditos". Lo más raro: los mensajes de error ya estaban escritos, uno
por uno, y nadie los disparaba.

**3. El cashback por ETA aceptaba cualquier porcentaje.** Con 500, el título del
documento salía "15 MINUTOS O 500% CASHBACK". Con 0, el título perdía el
porcentaje entero: "15 MINUTOS O CASHBACK". El cashback de delivery lo revisa
desde el principio; el ETA se construyó después y se quedó sin esa revisión.

**4. Cinco países activos ofrecían una respuesta que no podían cumplir.** En
México, Perú, Argentina, Chile y Uruguay, el comercial elegía "En ciertas
secciones de Rappi" y se quedaba delante de una pregunta sin una sola casilla
que marcar, con un error que le pedía marcar al menos una. Sin salida más que
adivinar que había que devolverse. Ahora la opción se ve bloqueada y dice por
qué, nombrando al país.

**5. Cuando Google fallaba, el comercial leía inglés.** Los nueve sitios de la
interfaz que muestran un fallo imprimían el texto crudo de Apps Script: "No
pudimos generar el documento: Lock timeout: another process was holding the lock
for too long." Ese caso es el de dos comerciales generando a la vez, o sea el
más probable, y se arregla esperando diez segundos. Ahora lo dice así.

**6. Un documento podía quedar huérfano en Drive, con el identificador
repetido.** Si el Sheet se caía después de crear el Doc, el Doc se quedaba en la
carpeta del país y en el Sheet no quedaba nada. Como el consecutivo sale del
Sheet, la siguiente generación creaba otro documento con el mismo identificador
y el mismo título. Comprobado: dos "RM-20260916-0001 · Colombia" en la misma
carpeta.

**7. Quien no ve la pantalla no se enteraba de que cambió.** La aplicación
redibuja todo en cada cambio de pantalla. Medido: la región de anuncios quedaba
vacía y el foco volvía al `<body>`, así que el lector de pantalla se quedaba
callado y quien navega con teclado tenía que recorrer otra vez la barra de
arriba antes de llegar a la primera pregunta, en cada pantalla.

### Lo que se revisó y está bien

- **El motor.** Se generaron **26.768 documentos** con todas las combinaciones
  de respuestas de opción de cada tipo en cada país. Cero marcas sin resolver,
  cero valores vacíos, cero frases rotas. Los detectores que se probaron encima
  (comas dobles, paréntesis vacíos, conjunciones colgando, palabras repetidas,
  `undefined`, `NaN`) no encontraron ni un caso real.
- **Las fechas.** Un solo día, cambio de mes, cambio de año, fin de febrero, año
  bisiesto y un año entero, en todos los tipos y países: 1.134 documentos de
  borde. Lo único que salió fueron los defectos 1 y 2 de arriba.
- **La red de seguridad del núcleo.** Se rompió el código a propósito en nueve
  sitios (el límite del banner, el idioma por defecto, el nombre de campaña, el
  consecutivo, el dominio de publicación, el correo, el canal de la ayuda, el
  enlace del T&C en las leyendas, la estructura del Doc) y **las nueve veces las
  pruebas fallaron**. No hay pruebas de adorno en el núcleo.
- **`setup()` corrido tres veces seguidas** no duplica nada: un libro, diez
  carpetas, nueve países, una persona en el equipo, cuatro pestañas. Lo único
  que crece es el Registro, que es correcto.
- **Un correo que no sale no tumba la generación** y queda anotado en el
  Registro. Un fallo de Drive no deja ninguna fila escrita. El bloqueo agotado
  no escribe nada y la siguiente generación funciona igual.
- **Ningún placeholder de los modelos se quedó sin quien lo llene**, ningún
  bloque compartido quedó huérfano, y ningún país habilita un tipo que no
  exista.

### Lo que está frágil y no se arregló, y por qué

- **"Dentro de los un (1) día hábil siguientes"**, en la Carrera de Compras. Es
  la novena frase de la familia del defecto 1, y la única cuyo artículo y
  adjetivo viven dentro de la cláusula. Arreglarla es tocar texto de Legal.
  Punto A4 de `docs/PARA_DECIDIR.md`.
- **Perú, Argentina, Chile y Uruguay siguen sin caso dorado.** Medido: el
  documento de cada país imprime 16 valores que salen de su propia fila. Son 64
  valores publicándose sin que nadie avise si cambian. Punto B1, con el costo.
- **En celular, "Ayuda" se sale de la pantalla** en ventanas de 360 y 390 px. Se
  llega deslizando la barra de lado, pero nada dice que se pueda. No se tocó
  porque es distribución y la etapa de diseño la va a rehacer: queda en
  `docs/PARA_EL_DISENO.md` con las medidas.
- **La interfaz sigue sin pruebas de comportamiento en Node.** Son 4.782 líneas
  entre JavaScript y estilos. Lo que corre sin navegador son revisiones
  mecánicas (traducciones, ámbitos, variables repetidas, paridad con la
  demostración, y las nuevas de accesibilidad y de opciones por país). El
  comportamiento lo ven solo los dos recorridos de navegador, que ahora hacen
  57 y 26 comprobaciones. **Es el hueco más grande que queda.** Lo que se puede
  probar sin navegador es que un mecanismo siga enchufado; lo que no se puede es
  qué ve la persona.

### Lo que no se alcanzó a revisar

- **La pantalla de administración**, con ojos de producto. Se sabe que funciona
  (está cubierta por pruebas de servidor), no si se entiende.
- **El historial con muchas campañas.** Se probó con una y con dos. Nadie ha
  mirado qué pasa con doscientas, ni si la búsqueda sirve a esa escala.
- **El correo que recibe el comercial**, leído como correo. Se sabe que se manda
  y qué lleva dentro.
- **La pantalla de Ayuda entera**, línea por línea, contra el flujo de hoy.

### Los dos documentos nuevos

- **`docs/PARA_DECIDIR.md`**, 41 puntos, ordenados por lo que desbloquean. Se
  entiende solo: las cláusulas van copiadas y las pantallas descritas, para
  poder trabajarlo en Claude chat sin el repositorio. Los tres que más
  desbloquean: **A1** (los nombres de las secciones de la app fuera de
  Colombia), **A2** (el separador de miles de Ecuador y Costa Rica, que es lo
  único que les falta para salir de piloto) y **B1** (los cuatro países activos
  sin caso dorado).
- **`docs/PARA_EL_DISENO.md`**, con lo que se ve mal y, sobre todo, con lo que
  **no** se puede tocar.

`docs/PENDIENTES_LEGAL.md` se queda como está, como historia.

### Cómo probarlo

```
npm test                                                        # 580 pruebas
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # 57 revisiones
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # 26 revisiones
npm run front                                                   # 46 de 46 pantallas
```

Con los ojos, en la demostración: pon un día de vigencia de los Créditos y mira
la cláusula 10; escribe 0 en la compra mínima; elige México y mira la pregunta
de dónde se gastan los Créditos.

### Lo que necesito de Juan

1. **Lee `docs/PARA_DECIDIR.md`**, al menos el bloque A. Son cinco puntos y
   ninguno pasa de una pantalla.
2. **Los casos dorados de Perú, Argentina, Chile y Uruguay**: el costo y el
   riesgo están medidos en el punto B1. Dime sí o no.
3. **Correr `setup()`** sigue pendiente de la vez pasada, por lo de los países
   que salieron de piloto.
4. **El despliegue de GitHub Actions**: avísame si lo lanzo.

## El paquete para revisar el front con Claude chat

### Qué quedó

`docs/revision/`, que es el front partido en tandas para poder revisarlo
pantalla por pantalla y caso por caso en Claude chat, y que lo que salga se
pueda aplicar sin volver a escribirlo a mano.

- **`LEEME.md`**: cómo se hace cada tanda, paso a paso, sin tocar la terminal,
  y cómo se sube la respuesta desde GitHub.
- **`PROMPT.md`**: lo que se pega al empezar cada conversación. Quién revisa,
  qué es RappiMind, quién es el comercial, las seis reglas que no se pueden
  romper (empezando por que Rappi nunca es el organizador y que el texto legal
  no se revisa), los nueve criterios de cada pantalla y el formato exacto de
  respuesta.
- **Siete tandas**, de 14 a 29 KB cada una: la entrada, el Cashback, el cierre,
  los otros tipos de Rappi, Rappi Travel, Brasil y el portugués, y los
  alrededores (Mis campañas, la Ayuda, Administración y los errores).
- **`pantallas.json`**: el texto de las 46 pantallas sacado del navegador, del
  que se arman las tandas.

**Las fotos las toma Juan**, de la aplicación, cuando va a hacer la tanda. Cada
tanda le dice al principio qué pantallas suyas vale la pena fotografiar, y son
21 en total. El recorrido las tomaba solo y dejaba 5,5 MB en el repositorio;
Juan lo cambió el 21 de septiembre, y así además son de la versión que corre ese
día y no de un recorrido viejo. Hay una prueba que avisa si vuelve a aparecer
`docs/revision/capturas/`.

**El celular quedó fuera**, por decisión de Juan del 21 de septiembre: no es por
donde los comerciales usan la herramienta, y sus tres pantallas se llevaban el
sitio de Administración, Mis campañas y la Ayuda, que sí importan y nunca se
habían mirado con ojos de producto. No se borró nada: las pantallas siguen en
`docs/FRONT_ACTUAL.html`, y la exclusión está escrita con su motivo en
`FUERA_DE_REVISION`, con una prueba que obliga a que toda pantalla esté en una
tanda o ahí.

### Por qué en tandas y no el archivo único

`docs/FRONT_ACTUAL.html` sigue existiendo y sigue sirviendo: es el front entero
en un archivo, se abre con doble clic y se ve como la aplicación. Para revisarlo
en Claude chat tiene un problema, y es que pesa noventa mil fichas de contexto,
la mitad en etiquetas y estilos que no aportan nada a una revisión de copy.
Entra en una conversación, pero deja poco aire, y una revisión de 46 pantallas
con poco aire vuelve con quince observaciones generales.

Partido en siete, cada conversación revisa entre siete y dieciocho pantallas con
la ventana entera libre. Es la diferencia entre "esta pantalla está bien" y una
ficha con el texto de hoy y el texto propuesto.

### Lo que apareció de paso

- **`docs/PREGUNTAS_KAM.md` estaba viejo.** Las preguntas habían mejorado en el
  código y el documento no se había vuelto a generar: 394 líneas de diferencia.
  Ya está al día, y con él `docs/CONTENIDO_AYUDA.md`.
- **Las 41 preguntas propias de Rappi Travel nunca han pasado por una revisión
  de copy.** Son la tanda 5 y, de todo el paquete, es donde más hay que mirar.
- **`docs/encargos/02-revision-interfaz.md` quedó
  atrás.** Los reemplaza este paquete. Se dejan como historia de lo que ya se
  revisó una vez.

### Cómo probarlo

```
npm test                                                  # 590 pruebas
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
npm run front        # recorre, deja el HTML y pantallas.json
npm run revision     # arma las siete tandas, sin navegador, al instante
```

Con los ojos: abre `docs/revision/LEEME.md` y sigue los seis pasos con la tanda
1. Si la respuesta que vuelve trae fichas con "Dice hoy" copiado letra por
letra, el paquete funcionó.

### Lo que necesito de Juan

1. **Empieza por la tanda 1.** Son las once pantallas donde el comercial decide
   si se queda o te escribe. Si solo hay tiempo para tres, que sean la 1, la 2
   y la 3.
2. **Guarda cada respuesta entera** en `docs/revision/respuestas/tanda-N.md`,
   sin resumir. De ahí salen los cambios.
3. **Mira con lupa lo que proponga sobre texto legal.** El prompt le dice que no
   lo toque, pero va a proponer mejoras de redacción que suenan bien y que no se
   aplican.

## Las decisiones del issue #2, aplicadas

**20 de septiembre de 2026.** Juan contestó 40 de los 41 puntos de
`docs/PARA_DECIDIR.md` en el issue #2 de GitHub. Esta sesión aplicó lo que se
podía aplicar y dejó escrito, punto por punto, lo que no.

### El número

**31 puntos cerrados de 41.** Quedan **diez preguntas abiertas** y un bloque
nuevo de **cinco tareas de ejecución** que ya no dependen de ninguna decisión.

Las pruebas pasaron de **589 a 623**. El recorrido de navegador pasó de 57 a 70
comprobaciones y el de portugués de 26 a 28. Después de traer los arreglos de
Travel que entraron en paralelo, el total queda en **627**.

### Qué cambia para el comercial

- **Siete países más pueden hacer cashback con redención por secciones.** La
  opción estaba bloqueada en México, Perú, Argentina, Chile, Uruguay, Ecuador y
  Costa Rica porque solo existía la lista de secciones de Colombia. Son las
  mismas en todos lados, así que ahora es una sola lista.
- **Ecuador y Costa Rica salieron de piloto.** Ya no queda ningún país en
  pruebas: los nueve los ve cualquier comercial y sus documentos se publican.
- **Siete países más reciben leyendas de campaña.** Antes solo Colombia. Hoy
  reciben las dos que no necesitan enlace, y las otras tres dicen exactamente
  qué falta para poder armarlas: la ruta con la que ese país publica sus T&C.
  Es un dato de la fila del país, no código.
- **La leyenda de push y SMS ya cabe.** Salía siempre en rojo porque el enlace
  se comía 35 de los 70 caracteres del formato. Ahora sale sin enlace y la
  pantalla dice por qué: el push lleva a la campaña dentro de la app.
- **Dos tipos de campaña dejaron de quedarse sin leyenda:** el cashback con
  redención por secciones y la Carrera que se gana por número de pedidos.
- **El documento dice dónde NO valen los Créditos.** Estaba en la ayuda del
  formulario y no en el T&C, que es donde el usuario puede leerlo.
- **La pantalla de Legal deja volver.** Antes, marcar mal una casilla del filtro
  era un callejón: el único camino de vuelta borraba todo lo respondido.
- **Tres preguntas dejaron de venir con la respuesta puesta:** dónde se gastan
  los Créditos, quiénes participan y con qué se paga. Son las tres que deciden a
  quién se le puede negar el beneficio.
- **Ya no se pueden marcar dos condiciones incompatibles.** "Solo por Turbo" y
  "Solo consumo en el local" se podían marcar a la vez y el documento salía con
  dos "únicamente" que no pueden ser ciertos los dos.
- **Los dos cupones de descuento ya dicen para qué sirven.** Era lo que más se
  pide y la pantalla decía que Legal no lo había explicado.
- **En portugués, los países se leen en portugués** y el botón dice lo mismo que
  la pantalla que abre.

### Lo que no se aplicó, y por qué

- **B2 y B3, Brasil.** Los cuatro T&C aprobados por Legal Brasil no están en el
  repositorio. Se buscó en todo el árbol. Sin ellos no hay nada que comparar, y
  la instrucción de Juan decía que en ese caso se saltaran los dos.
- **D1, D4 y D6.** Son pantalla nueva, no reemplazo de texto, y la instrucción
  era pararse y avisar antes de construirlas. Los textos aprobados están
  guardados y entran el día que Juan lo diga.
- **D3, el valor del premio.** No es tamaño: la frase del caso de varios
  ganadores está corrompida en `docs/encargos/respuestas/01-legal.md`. La
  reconstrucción está copiada en el punto D3 para que Juan la confirme.
- **E2** es el único punto que Juan no contestó.

### Lo que hay que mirar de cerca

- **Los cinco casos dorados nuevos.** PE01, AR01, CL01, UY01 y CR01 se
  generaron con el motor de hoy, no se compararon contra ningún documento
  publicado. Protegen que esos textos no se muevan solos, no dicen que sean los
  textos aprobados: es la misma advertencia que ya tenían los cuatro de Brasil.
- **El `paraQue` del código de descuento para eventos externos** quedó igual al
  nombre. La corrección de la pantalla 30 cambiaba esa frase, y esa frase estaba
  escrita dos veces en el archivo: como nombre y como descripción. El ejemplo que
  llevaba dentro no se perdió, porque pasó al beneficio.
- **`nombre_modalidad_local` sigue vacío en los nueve países.** Mientras siga
  así, "Solo consumo en el local" no se ofrece y la tercera frase de leyenda del
  punto C3 no hace falta.


### Cómo probarlo

```
npm test                                                        # 627 pruebas
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js        # 70 revisiones
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js # 28 revisiones
npm run front                                                   # 46 de 46 pantallas
npm run tabla-paises                                            # docs/VALORES_POR_PAIS.md
```

Con los ojos, en la demostración: elige México y mira que la redención por
secciones ya ofrezca las cinco casillas; llega al final de un cashback de
Colombia y mira la leyenda de push y la que no cabe; marca "Sí" en la primera
pregunta del filtro y pulsa "Cambiar mi respuesta".

### Lo que necesito de Juan

1. **Los cuatro T&C aprobados de Brasil**, para poder cerrar B2 y B3.
2. **La frase de varios ganadores del valor del premio** (punto D3),
   confirmada o corregida.
3. **Cuál de las tres pantallas nuevas va primero**: D1, D4 o D6.
4. **Correr `setup()`** sigue pendiente, y ahora hace más falta: esta sesión
   agregó tres tandas de confirmaciones (`estados-2026-09-20`,
   `brasil-2026-09-20` y `argentina-2026-09-20`) y una columna nueva. Sin
   `setup()`, Ecuador y Costa Rica siguen en piloto en el Sheet de producción.
5. **El despliegue de GitHub Actions**: avísame si lo lanzo.


## Los cuatro defectos que Juan encontró probando Rappi Travel

Juan probó el formulario de Travel el 21 de septiembre y trajo diez
observaciones. Cuatro eran defectos, no opiniones, y están arreglados. El resto
son decisiones suyas y están en `docs/PARA_DECIDIR.md`.

### 1. El mensaje del NIT nombraba la empresa equivocada

Escribió el NIT de Rappi S.A.S. (900.843.898-9) y la herramienta le respondió
"Rappi Travel nunca es el Organizador". Ese NIT no es el de Rappi Travel. El
mensaje era uno solo para las dos empresas.

Ahora hay tres entidades mapeadas en la fila del país, planas, una llave por
columna: `entidad_legal` (Rappi S.A.S., la que opera la Plataforma),
`travel_entidad` (Travel Moustache S.A.S., la agencia de viajes) y
`turbo_entidad` (Moustache Beams S.A.S., la que opera Turbo, nueva). El mensaje
nombra la que el comercial escribió de verdad.

### 2. La regla del Organizador solo corría en Travel

Buscando lo anterior salió algo más grande: `validarOrganizadorDeTravel` se
llamaba únicamente desde los dos tipos de Travel. En un Cashback cualquiera se
podía poner a Rappi S.A.S. de Organizador y el documento salía diciéndolo. La
regla 1 de `CLAUDE.md` no es de Travel, es de todos los flujos, y ahora corre en
`validarOrganizador`, que es por donde pasan todos.

### 3. setup decía que completaba el país, y no escribía nada

Al agregar las dos columnas de Moustache Beams, `setup()` empezó a decir
"1 país completado con lo que faltaba de la semilla" en cada corrida, sin
escribir nunca. La causa: la lista de columnas se escribe a mano en
`PESTANAS` de `src/server/Config.js`, la semilla vive en `data/paises.json`, y
`actualizarFila` descartaba en silencio (`continue`) todo valor sin columna.

Ahora `actualizarFila` revienta con el nombre de la llave y dónde agregarla, y
una prueba compara las llaves de la semilla contra las columnas de la pestaña.
Esto valía para cualquier columna futura, no solo para esta.

### 4. Rappi Travel estaba muerto en la pregunta de las categorías

"¿Qué categorías de Travel participan?" salía con cero casillas y sin nada que
marcar, y como el campo es obligatorio, no se podía avanzar. Travel entero
terminaba ahí.

El catálogo de categorías nunca se le mandaba al navegador:
`estadoInicial()` entregaba `secciones` pero no `categoriasTravel`. Es la
frontera 2 de la skill, con su síntoma de siempre, la pantalla sin opciones.

Y de paso, el arreglo no se veía en la demostración, porque `scripts/demo.js`
tiene su propio `estadoInicial` que imita al del servidor: dos sitios
describiendo lo mismo. Ahora una prueba compara las llaves de los dos.


### Cómo probarlo

```
npm test                                                  # 593 pruebas
npm run demo
```

Con los ojos, en la demostración: entra a Rappi Travel, elige Cashback Travel y
mira que la pregunta de las categorías traiga las ocho de la app y deje avanzar.
Y en la pregunta del NIT del Organizador, escribe 900.843.898-9: el mensaje
tiene que decir Rappi S.A.S., no Rappi Travel.

## Las cuatro decisiones que Juan cerró el 21 de septiembre

### Lo que quedó

**El filtro de Rappi Travel baja de nueve preguntas a ocho.**

- Se fue **"¿La paga Rappi o Rappi Travel, no un aliado?"**. Rappi Travel nunca
  fondea una campaña, así que la pregunta no filtraba nada: el Organizador
  siempre es la marca que da origen a la dinámica. Y la regla ya la cuida
  `validarOrganizadorNoEsRappi`, que corre en todos los flujos.
- **"¿Hay sorteo o concurso, o la pieza dice 'gana'?"** queda en **"¿Hay sorteo
  o concurso?"**. Una pieza que dice "gana" no es, por sí sola, un concurso, y
  la pregunta larga mandaba a Legal campañas que la herramienta sí sabe hacer.

**La cláusula de inhabilidades, solo para concursos.** Nueva, en
`modelos/bloques/inhabilidades.md`, incluida en `modelos/carrera_compras.md`
después de quiénes pueden participar. El texto es el que dio Juan, ajustado al
modelo: usa "Rappi" y "el Organizador", que el documento ya define, en vez de
"Rappi Inc." y "Organizador/Aliado Comercial", y va en viñetas porque el
párrafo original eran once líneas seguidas. Las salidas esperadas de CC01 y CC03
se regeneraron.

**El copy de los T&C ya publicados.** Decía "Descuentos, cupones, envío gratis y
tarifa de servicio" y la lista trae catorce, con las de Rappi Pro, la de Turbo y
los códigos para eventos externos afuera. Ahora dice "Descuentos, cupones, envío
gratis, Rappi Pro y más", y la nota invita a entrar a ver la lista completa.

### Lo que falta, y por qué no se hizo en el mismo bloque

Quedan tres de las decisiones de Juan, y las tres tocan los modelos de Rappi
Travel:

1. **El precio "desde"** deja de bloquear y pasa a ser una pregunta del
   formulario de Travel.
2. **El beneficio variable por destino** deja de bloquear.
3. **El beneficio que depende de un banco o de cuotas** deja de bloquear.

Las tres piden texto legal nuevo en el modelo de Travel, que es de Legal y lo
aprueba Juan, y las tres tocan los mismos archivos que la sesión del modelo de
millas está modificando ahora mismo en `claude/modelo-millas`. Hacerlas en
paralelo es pedir un conflicto en `esquemas.js`, `preguntas.js` y el propio
filtro. Van después de que entre millas.

Sobre la **3**, además, hay algo que mirar antes: `metodoPago` ya existe en los
dos tipos de Travel y el modelo ya lo imprime, pero sus opciones son "cualquier
medio", "todo menos efectivo" y "solo RappiCard". No cubren "solo con tarjeta de
tal banco" ni las cuotas sin interés, que es lo que de verdad pregunta el
filtro. Las cuotas, además, meten a otra entidad responsable.
---

## Las decisiones del 20 de septiembre de 2026, aplicadas

Las respuestas a los diez puntos que quedaban en `docs/PARA_DECIDIR.md`, más los
dos puntos nuevos que Juan agregó y el orden de construcción que dejó escrito.

### El número

De los diez puntos abiertos quedan **nueve cerrados y uno bloqueado**. El orden
de construcción de diez pasos entra **completo**, salvo el paso 6 (D1), que
depende de un texto legal que Juan tiene que escribir.

### Qué cambia para el comercial

- **Ya no se hacen campañas sobre medicamentos, fitoterapéuticos, cigarrillos,
  tabaco calentado, vapeadores ni otros productos con nicotina, en Colombia.**
  La advertencia sale arriba de la lista de tipos, la categoría de la pieza tiene
  una sola opción que no deja seguir y lo dice con el canal para preguntar, y el
  T&C lo deja escrito en las exclusiones del Cashback, del Multitienda y de la
  Carrera.
- **El Cashback pregunta en cuál de las dos tiendas de la marca se gana**: la
  normal, la de Turbo, las dos, o ninguna porque no tiene tienda en Turbo. De ahí
  sale una frase de la cláusula de tienda participante, la frase de la pieza y,
  si es solo Turbo, el nombre de la campaña ("El Corral Turbo"). En el
  Multitienda se pregunta una vez por marca.
- **"Solo consumo en el local" desapareció.** En Rappi no existe esa modalidad.
- **Antes de dar el enlace de un T&C general hay seis preguntas de sí o no.** Si
  la campaña no cabe en el general, el comercial se entera antes de publicar.
- **El atajo a los T&C publicados va por encima de los cuatro tipos**, y debajo
  de ellos está "Mi campaña no es ninguna de estas", que lleva a Legal con el
  motivo escrito.
- **La pantalla final arranca por quién puede publicar**, con un botón que arma
  el mensaje para esa persona; los diez pasos de Squarespace quedan plegados.
- **La Carrera declara el valor comercial del premio** cuando el premio es físico
  y el país es Colombia, y sus productos específicos entran con nombre y código
  de barras EAN, validado con su dígito de control.
- **La calculadora del tope muestra un pedido donde el tope se nota.**
- **El filtro de Travel son diez preguntas**, ninguna de más de diez palabras.
- **El contador de preguntas ya no promete de menos.**
- **En los países sin Rappi Travel no se pregunta el negocio.**
- **La Ayuda abre por la pregunta que más se hace**, la de descuentos y cupones.
- **En Brasil**, la campaña arranca a las 00:01 y los pedidos y los porcentajes
  salen con la cifra primero: "1 (um) pedido", "10% (dez por cento)". Y el
  formulario en portugués lleva las correcciones que aprobó Juan.

### Lo que no se aplicó, y por qué

- **D1, las tiendas del cashback por ETA.** Juan eligió la opción (c), que el
  T&C liste las tiendas una por una. El texto de la cláusula 5 y el de la
  cláusula de Territorio para esa opción **no están en el repositorio**: se buscó
  en `docs/`, `docs/encargos/`, `modelos/` y `data/`. La decisión 33 del encargo
  01 solo propuso una lista cerrada de dos modalidades, que Juan descartó.
  Redactar esa cláusula es una decisión legal, y la regla 3 de `CLAUDE.md` dice
  que el texto legal es de Legal. **Lo que hace falta** está escrito en
  `docs/PARA_DECIDIR.md`, con la pregunta concreta.

### Lo que hay que mirar de cerca

- **Los textos de pantalla que propuse yo.** El enunciado y la ayuda del valor
  del premio, el mensaje que arma el botón de "¿Quién puede publicar?", las
  razones de las dos mitades de la sexta pregunta del filtro de Travel y los
  textos de la pantalla del filtro de los T&C generales. La decisión traía los
  textos del documento, no los de la pantalla.
- **Las siete leyendas que salieron del catálogo** siguen en `modelos/leyendas/`
  con su texto tal cual vino de Legal, marcadas `se_elige_en: no_se_ofrece`. Qué
  haría falta para reabrirlas está en `docs/PENDIENTES_LEGAL.md`.
- **Las campañas guardadas antes del cambio.** Una con "Solo pedidos por Turbo"
  abre en "Solo en la tienda de Turbo" y una con "En cualquier pedido" abre sin
  respuesta, como pidió Juan. Vale la pena abrir una del historial y mirarlo.

### Cómo probarlo

```
npm test                                                  # 627 pruebas
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js  # el recorrido completo pasa
```

Con los ojos: entra a Rappi Travel y cuenta las preguntas del filtro, que ahora
son ocho. Y genera una Carrera de Compras para ver la cláusula nueva.
npm test                                                  # 658 pruebas
npm run demo
```

Con los ojos, en la demostración:

1. **Colombia, Cashback.** Mira la advertencia de medicamentos arriba de los
   tipos, responde "Solo en la tienda de Turbo" en la pregunta nueva y comprueba
   que el documento de al lado trae la frase del botón "Turbo" y que el nombre
   de la campaña dice "Turbo".
2. **El atajo de descuentos**, que ahora está por encima de los tipos: entra y
   contesta "sí" a la primera pregunta, que te devuelve a los tipos; vuelve a
   entrar y contesta "sí" a la de eventos especiales, que te lleva a Legal; y
   vuelve otra vez y contesta que no a las seis, para llegar a la lista.
3. **Carrera de Compras con productos específicos**: agrega dos productos con
   su EAN y cámbiale un dígito a uno, para ver el mensaje.
4. **La categoría de la pieza en Colombia**: elige la opción de medicamentos y
   nicotina y comprueba que no deja seguir.
5. **La Ayuda**, que ahora abre por la pregunta de descuentos y cupones.

Y sin navegador:

```
npm run previsualizar CB01   # la cláusula de la tienda de Turbo
npm run previsualizar CC04   # los productos con su EAN
npm run previsualizar CC03   # el valor comercial del premio
npm run previsualizar BR01   # "1 (um) pedido" y "10% (dez por cento)"
```

### Lo que necesito de Juan

1. **El texto de la cláusula 5 y del Territorio para D1** (la única que bloquea
   algo). La pregunta concreta está en `docs/PARA_DECIDIR.md`.
2. **Los textos de pantalla que propuse yo**, listados arriba.
3. **La lectura de los abogados de Brasil** del formulario en portugués, que es
   lo que quedó pendiente del punto E2.

---

## D1: el cashback por ETA pregunta en qué corre

**21 de septiembre de 2026, en dos vueltas.** La primera la hice sobre una
premisa equivocada y Juan la paró antes de que llegara a `main`.

### Qué pasó

La decisión 33 proponía una lista cerrada de dos categorías del botón Turbo.
Juan la corrigió diciendo que son tiendas por zona con nombre propio, como Turbo
Calleja o Turbo Chico, y yo apliqué esa corrección al modelo del ETA: el
documento pasó a listar tiendas siempre. Juan lo leyó y aclaró que **esa
corrección era sobre el otro Turbo**: las dark stores tipo Turbo Carulla, que
venden CPGs. Las campañas de "15 minutos o Cashback" corren normalmente en
**Turbo Restaurantes**, donde están El Corral Turbo, McDonald's Turbo y las
demás marcas. Listarlas serían decenas y cambiarían de un día para otro.

Lo confirmaba el propio repositorio, que no miré a tiempo: la pieza real se
llama "15 minutos o 100% cashback, Turbo Restaurantes Bogotá", y
`data/secciones.json` tiene "Turbo" y "Turbo Restaurantes" como dos secciones
distintas de la app.

### Qué cambia para el comercial

Justo después de la ciudad aparece **"¿En qué corre la campaña?"**, con tres
respuestas:

- **En todo Turbo Restaurantes de la ciudad**, que viene marcada porque es como
  corren casi todas. No pide ninguna lista.
- **En todo Turbo de la ciudad**, la otra categoría que propuso la decisión 33.
- **En unas tiendas concretas de Turbo**, y ahí sí aparece la lista que crece,
  un nombre por fila, con aviso de tienda repetida y pegado desde una hoja de
  cálculo.

### Qué cambia en el documento

Con categoría, la cláusula es **el texto aprobado palabra por palabra**, con su
segunda frase. Ahí las dos frases no se contradicen: una nombra una categoría y
la otra dice cómo se sabe quién está dentro. Con tiendas concretas, la cláusula
las nombra una por una y la segunda frase se queda hablando solo de
disponibilidad, que es la forma que eligió Juan. La viñeta de condiciones sigue
a la cláusula, y el título de la campaña también: "Turbo Restaurantes Bogotá",
"Turbo Bogotá" o solo "Bogotá" según la respuesta.

**ETA01 y ETA02 quedaron idénticos, carácter por carácter, a como estaban antes
de todo esto.** Entró ETA03, que protege la otra forma con el mismo detalle.

### Un defecto que salió de paso

Agregar una segunda tienda sin haber hecho clic fuera del primer nombre dejaba
la pantalla a medio pintar. La causa no era de esa pantalla: quitar de la
pantalla el campo que tiene el foco dispara su `blur` en ese mismo instante, y
el redibujo se llamaba a sí mismo en mitad de su propio trabajo. La lista de
productos de la Carrera tenía el mismo defecto y nadie lo había disparado.
Arreglado en `dibujar()` de `70-app.js`, que ahora lleva cerrojo.

### Cómo probarlo

```
npm test                                # 669 pruebas
npm run demo
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js
npm run previsualizar ETA01             # la categoría, como el publicado
npm run previsualizar ETA03             # las tiendas nombradas una por una
```

Con los ojos: **Colombia > Rappi > 15 minutos o Cashback**, escribe Bogotá y
mira la pregunta nueva. Con la primera respuesta el documento tiene que decir
"bajo la modalidad Turbo Restaurantes" y no pedirte ninguna lista. Con la
tercera, agrega dos tiendas, escribe la misma dos veces para ver el aviso, y
agrega una tercera sin salir del campo anterior, que es el caso que rompía la
pantalla. La captura está en `docs/FRONT_ACTUAL.html`, número 37.

### Lo que necesito de Juan

1. **El nombre exacto de Turbo Carulla como categoría**, si una campaña de ETA
   puede correr ahí entera. Hoy el documento sabe nombrar "Turbo Restaurantes" y
   "Turbo"; una campaña en dark stores concretas se cubre nombrándolas.
2. **El visto bueno de la cláusula de tiendas concretas**, la única que escribí
   yo, tal como quedó en `docs/PENDIENTES_LEGAL.md`.
3. **Los textos de pantalla que propuse yo**, listados más arriba.
4. **La lectura de los abogados de Brasil** del formulario en portugués.

## Los tres bloqueos de Rappi Travel, resueltos

Juan pidió el 21 de septiembre de 2026 que actuara como abogado y resolviera los
tres bloqueos que quedaban del filtro de Travel. El análisis y el texto están en
`docs/PROPUESTA_TRES_BLOQUEOS_TRAVEL.md`. **El filtro baja de nueve preguntas a
siete.**

### 1. El precio "desde"

Lo que la ley castiga no es anunciar un precio, es anunciarlo mal. El Estatuto
del Consumidor pide información veraz y suficiente, y en tarifas aéreas el
Reglamento Aeronáutico exige que el precio anunciado sea el final, con impuestos
y cargos: de ahí la sanción que citaba la razón vieja. Bloquear a todo el que
anuncia un precio mandaba a Legal las campañas correctas junto con las malas.

Ahora son dos preguntas del paso de la pieza. La primera enciende la cláusula
"§ Precio anunciado"; la segunda, cuando el precio no es el valor final, para la
generación y manda a Legal, porque eso no se arregla con una cláusula: se
arregla la pieza.

### 2. El beneficio que cambia según el producto

Era el bloqueo más caro: dos de las cinco piezas publicadas son exactamente ese
caso, y la del Caribe Mexicano trae veintitrés hoteles, cada uno con su
porcentaje y con sus propias fechas de venta y de viaje. No hay nada ilegal ahí,
solo un límite del modelo, que estaba escrito con un beneficio y solo uno.

Se resuelve como ya se había resuelto en Cashback Multitienda: una lista de
filas que el comercial pega desde su hoja de cálculo, con el nombre, el
porcentaje y las dos fechas opcionales. En el documento sale en viñetas, nunca
en tabla. El componente es `src/client/js/67-beneficios.js`.

**Lo que NO salió del filtro** es mezclar descuento con cashback. Ahí no es que
el beneficio cambie de tamaño: son dos beneficios de naturaleza distinta en el
mismo documento, y eso sí es un límite del modelo.

### 3. El banco

La pregunta metía dos cosas. Que la campaña aplique pagando con cierta tarjeta
es un medio de pago, igual que en las campañas de Rappi, y el banco no responde
por nada: salió del filtro como una opción nueva del medio de pago, con el
nombre que escribe el comercial.

Las cuotas sin interés se quedan, y **aquí me aparté de lo que Juan pidió**:
quien otorga la financiación es el banco, con su tasa, su plazo y su aprobación,
y esa publicidad la vigila la Superintendencia Financiera, no la SIC. Sin una
pieza firmada de la que partir, la cláusula habría que inventarla. La pregunta
ahora dice eso en vez de ser un "no" seco.

### Cómo probarlo

```
npm test                                                  # 672 pruebas
npm run demo
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js  # el recorrido pasa
```

Con los ojos: entra a Rappi Travel, elige Cashback Travel y en el paso del
beneficio di que cambia según el producto. Pega esto en el área de pegar:

```
Hard Rock Hotel Los Cabos	55	2026-12-18	2026-12-18
AVA Resort Cancún	50%
Hotel Dalí Plaza	65
```

Tienen que quedar tres filas, el "50%" convertido en 50, y la cláusula llenándose
en la columna de la derecha mientras pegas.

### Lo que necesito de Juan

1. **Las tres cláusulas nuevas**, leídas. Son texto que se publica.
2. **La frase que le da al Proveedor la última palabra** frente a lo que Rappi
   anunció, en el beneficio por producto. Viene de las dos piezas publicadas, no
   la inventé, pero conviene confirmarla a propósito.
3. **Lo de las cuotas**, que es donde no le di la razón.

---

# Bloque 9 · El cambio de identidad

Cerrado el 21 de septiembre de 2026. Es el encargo de `docs/PROMPT_IDENTIDAD.md`,
ejecutado entero: la foto del antes, la ronda de lectura, las ocho fases, las cinco
auditorías y el revisor.

**Es un cambio de piel, no de producto.** Cero líneas tocadas en `modelos/`,
`data/` y `src/core/`, que es donde vive el texto legal y la lógica del documento.

## Cómo probarlo

```
npm test                       681 pruebas
npm run contraste              la puerta de contraste, devuelve 1 si algo no llega
npm run demo                   abre demo/index.html con doble clic
export NODE_PATH=/opt/node22/lib/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js
npm run front                  regenera docs/FRONT_ACTUAL.html, 48 pantallas
```

**Lo primero que conviene mirar con los ojos**, porque es lo que más cambia de
aspecto y es reversible en una línea:

1. El titular. Abre `demo/index.html` y compara el inicio, que va a 48px, con
   cualquier pregunta, que va a 34px. Hasta la ronda 4 iba a 28px, que era el
   tamaño del sistema anterior.
2. La píldora "Publicado" del historial. Lleva un gradiente hundido, más terroso
   que el de marca, porque el de marca con letra blanca encima no llega al mínimo
   de contraste en ningún punto de su recorrido.

## Qué quedó

**Los tokens que se sirven viven en `src/client/tokens/`**, cinco archivos que el
build concatena en ese orden, con `rappimind.css` el último porque es la capa de
aplicación y pisa a los de marca. `docs/diseno/tokens/` se queda como la entrega
original de Claude Design, intacta: producción lleva seis valores cambiados, que
son los arreglos de contraste, y sin ellos `npm run contraste` devuelve 1.

**No hay ningún `@import`.** El orden está escrito una sola vez, en
`scripts/lib/hoja-completa.js`, y lo usan los cuatro que sirven la hoja: el build,
la demostración, `npm run front` y las pruebas. Que las pruebas lean por ahí es la
red, no comodidad.

**La letra.** PP Object Sans viaja incrustada en base64, y solo una cara, la de
peso 900, para los titulares y la marca. El cuerpo va con Archivo desde Google
Fonts. La decisión la tomó Juan con la medición delante: los cuatro pesos costaban
un 42,9% más en cada carga, y uno solo cuesta un 10,4%. La primera visita pesa
menos que antes del cambio.

**El contraste pasó de 9 pares por debajo a cero**, con 52 pares medidos. Entre
ellos, dos que no existían y que dejaron pasar defectos reales: el blanco sobre el
gradiente sin recortar y la superficie de un control contra el fondo de página.

## Qué falta, y de quién es

| Qué | De quién |
|---|---|
| El correo que envía la herramienta sigue con la paleta y la letra anteriores | De Juan. Está en `src/core/correo.js` y el encargo prohibió esa carpeta |
| El lockup de la marca | De Juan. La marca de la barra es texto en el DOM y el SVG no es autosuficiente. Decisión 110 |
| El adorno del bigote del héroe | De Juan. Cuesta 67 KB sin comprimir por una decoración al 10%. Decisión 111 |
| Si el historial emite sus cuatro estados o se queda con dos | De Juan. La hoja tiene los cuatro escritos; el JavaScript emite dos |
| El color del contador de la hoja por estado | Necesita una clase del JavaScript, que esta ronda no podía tocar. Hoy va neutro |

## Lo que nadie ha mirado, y conviene decirlo

- **Esto nunca se ha abierto en Apps Script.** El encargo prohibió `clasp push` y
  se respetó. Las cuatro comprobaciones de frontera están en verde, pero verde en
  la prueba no es verde en producción.
- **Nadie probó qué pasa si Archivo no llega.** Se pide a Google Fonts por la red.
  Si no llega, todo menos el titular cae a la letra del sistema.
- **El estado "vencido" de una opción nunca se ha visto pintado**, porque los T&C
  generales de Colombia vencen el 31 de diciembre. Su estilo existe y se midió
  sobre los tokens, no en pantalla.
- **`docs/FRONT_ACTUAL.html` no puede medir grosores de borde.** Encoge cada
  pantalla con zoom 0.78, y un borde de 1px y otro de 2px le salen los dos en
  1,28px. Cuatro de los cinco auditores midieron grosores ahí sin saberlo.

## Tres cosas que se dieron por hechas y no lo estaban

Van escritas porque el patrón importa más que los tres casos: **en esta aplicación
el modo de falla es silencioso**, y un mensaje de commit que dice "arreglado" no es
una prueba.

1. *"El botón conserva su nombre y su tamaño de blanco"* al caer las etiquetas de
   la barra. El nombre sí; el blanco medía 4px de alto.
2. *"Los tres niveles de aviso se reconocen en blanco y negro."* En modo de
   colores forzados el informativo y el serio salían idénticos.
3. *"Se esconde el nombre en las mismas cinco condiciones."* Las cinco reglas
   usaban `:has()` dentro de `:has()`, que no existe: el navegador las tiraba
   enteras sin decir nada.

Las tres las encontraron los auditores, no yo, y las tres están arregladas. De la
tercera salió la prueba que ahora comprueba que las reglas de la hoja se puedan
leer, que no existía.

## La vara

El encargo pide que al final el diff de `textos.json` salga vacío. **No sale
vacío, y no se está escondiendo.** Al cerrar el bloque 9 salían 15 pantallas
idénticas de 31, y 16 con diferencias registradas una a una; quince de esas
dieciséis eran la línea "Paso n de m", que la especificación manda hacer visible
cuando las etiquetas de la barra se caen. Después entraron el lockup y el pie de
página, que tocan las 31, así que hoy no queda ninguna idéntica y las 31 tienen su
diferencia escrita.

La vara pasó a comprobar algo más útil que "el diff está vacío": que las únicas
diferencias contra la foto del antes sean exactamente las aceptadas. Cualquier
línea de más o de menos es una regresión.

Y desde la ronda 4 compara también la vara ancha de 48 pantallas, que la fase 0
guardó y que hasta entonces nadie había comparado. Cubre lo que la de 31 no
alcanza: Travel, los T&C generales, el país en piloto, la ampliación, la
administración y las tres vistas de celular.

---

# Bloque 9b · El lockup, el pie de página y el "v3"

Lo pidió Juan al ver las capturas del bloque 9, en dos puntos. Está hecho.

## Qué va a ver

**La marca de la barra superior es ahora el lockup completo:** el logotipo de
Rappi, un divisor fino y "Mind" en Heavy con la corona encima. Antes decía
"RappiMind" en texto con un `v3` pequeño al lado.

**Abajo de todas las pantallas** sale "Hecho con amor ♥ por el equipo Legal",
centrado, sobre una línea fina. En portugués, "Feito com amor ♥ pelo time do
Jurídico".

**Se fue el "v3"** de la barra, del título de la pestaña y del título que pone
Apps Script.

## Lo único que necesito decirte, Juan

**El "v3" se queda en un sitio, y a propósito: `src/server/Config.js`.** Ahí está
escrito que el Google Sheet se llama `RappiMind v3 · Base` y la carpeta de Drive
`RappiMind v3`. Esos dos nombres no son una etiqueta: son con lo que el código
encuentra la hoja y la carpeta que ya existen, con tus campañas dentro. Si les
quito el "v3", `setup` no las encuentra, crea unas nuevas vacías, y el historial se
queda en las viejas sin que nada avise.

Nadie los ve desde la aplicación. Solo salen si abres Drive. Si algún día quieres
renombrarlos, se puede, pero es renombrar la hoja en Drive **y** el archivo, en ese
orden, y eso sí es una operación sobre producción.

## Cómo comprobarlo

Lo de siempre, y todo está verde:

```
npm test                 681 pruebas
npm run contraste        53 pares, todos llegan
npm run demo && node .claude/skills/flujo-y-ux/scripts/recorrer-flujo.js
node .claude/skills/flujo-y-ux/scripts/recorrer-en-portugues.js
npm run front            48 pantallas en docs/FRONT_ACTUAL.html
```

La vara de las 31 pantallas pasa: lo único que entra en cada una es el pie, y en
la barra "RappiMind v3" sale y entra "Mind". La vara ancha de 48 dice lo mismo.

## Lo que cuesta

El logotipo suma **5,56 KiB en base64**, que sobre la página comprimida es
**+2,13%**. La alternativa evidente, el PNG que ya estaba en el repositorio,
costaba +10,10%. Está medido paso a paso en `docs/diseno/MEDICION_LOGOTIPO.md`.

El pie y el corazón no suman nada medible: son texto y un trazo SVG.

Decisiones 119 a 122.

---

# Bloque 10 · El correo, pendiente

No está hecho y es el siguiente. Se deja escrito aquí para que no se pierda, con
el contexto completo, porque quien lo tome puede no haber estado en el bloque 9.

**Qué es.** Cuando el comercial genera su T&C, RappiMind le manda un correo con el
documento y los pasos para publicarlo. Ese correo lo arma `src/core/correo.js`, y
su apariencia está escrita a mano dentro del código, no en la hoja de estilos.

**Qué pasa.** Los cuatro colores están clavados en las líneas 29 a 32 y son los del
sistema anterior: `#FF441F`, `#16181D`, `#5D626D` y `#E3E5EA`. La línea 81 pide la
letra Lato, que el bloque 9 quitó de la aplicación, y las líneas 77 y 78 pintan el
fondo con el gris frío viejo. O sea que desde el cambio de identidad la aplicación
se ve de una marca y el correo que la aplicación envía se ve de otra.

Importa más de lo que parece: es el único artefacto de RappiMind que sale de la
herramienta y llega a la bandeja de alguien.

**Por qué no entró en el bloque 9.** El encargo dice, con esas palabras, "cero
cambios en `modelos/`, `data/` y `src/core/`: nada de ahí es estilo". Esa regla se
escribió para proteger el texto legal, y `correo.js` es lo único de esa carpeta que
sí es estilo. Se dejó fuera a propósito, para no saltarse la regla por cuenta
propia, y Juan lo sabe.

**Qué haría falta.** Cuatro colores y una familia de letra. Dos avisos para quien
lo tome:

- Los clientes de correo no cargan fuentes web con fiabilidad, así que PP Object
  Sans no se puede dar por hecha. La pila tiene que aguantar caer a la del sistema.
- Los tokens ya tienen lo que hace falta y hoy no los usa nadie:
  `--color-email-text` en `colors.css` y `--email-title-size`, `--email-body-size`
  y `--email-cta-size` en `typography.css`.

**Y una vara propia.** El correo no pasa por `npm run contraste`, porque ese script
mide los tokens que se sirven en la aplicación. Si el correo entra al sistema, sus
pares tienen que entrar a `PARES` en `scripts/contraste.js`, o se queda fuera de la
única puerta que hay.

---

# Bloque 11 · Descuentos, cupones y concursos fuera de Colombia

**Qué pidió Juan**, el 21 de septiembre de 2026 y con estas palabras: habilitar
para todos los países excepto Colombia los flujos para pedir T&C de descuentos,
cupones y concursos; construir a partir de los modelos que ya existen; ajustar
los placeholders para que entre la data de cada país y el wording de las
preguntas (el ejemplo que puso: "el equivalente al NIT de Colombia en MX"); y no
devolverle preguntas, porque los equipos locales revisan en las pruebas internas.

## Qué quedó

**Dos tipos de campaña nuevos, en español, en siete países.** Descuento y Cupón
en México, Perú, Argentina, Chile, Ecuador, Uruguay y Costa Rica. Los dos son el
mismo documento menos una cláusula: el Descuento se aplica solo en el precio, y
el Cupón lo activa el usuario con un código o desde la sección "Cupones". El
beneficio tiene cinco formas (porcentaje, monto fijo, envío gratis, tarifa de
servicio gratis y las dos juntas) y **cada una trae su propia base de cálculo**,
porque un documento que diga "el Beneficio no cubre el envío" en una campaña
cuyo beneficio es el envío se contradice solo.

**La Carrera de Compras, habilitada en los mismos siete países.** El modelo ya
existía y solo le faltaba dejar de hablar como si el mundo fuera Colombia: el
grado de parentesco de la cláusula de inhabilidades sale ahora de la fila del
país, y el valor comercial del premio se pregunta en todos lados, con el impuesto
que cada uno nombra (IVA, IGV, ICMS). Colombia imprime exactamente lo mismo que
antes, letra por letra, y hay pruebas que lo comprueban.

**Un Cupom para Brasil, en portugués.** `cupom_br` es la Promoção con dos viñetas
más: la del código y la de que el cupom es personal. No copia las trece variantes
de texto de la Promoção, las hereda (`VARIANTES_HEREDADAS`), para que corregir
una corrija las dos.

**Brasil no tiene concurso, y es a propósito.** La Ley 5.768 de 1971 pide
autorización previa de la Secretaria de Prêmios e Apostas para un concurso con
premio. Generar solo ese T&C sería invitar a publicar una promoción sin
certificado. La Ayuda lo explica y manda a Legal con tiempo, que es lo que hay
que hacer ahí.

**Las preguntas dejaron de hablar en colombiano.** "¿Cuál es el NIT de esa
empresa?" decía NIT en los nueve países, con un ejemplo colombiano. Ahora la
pregunta pide `{ID_FISCAL}`, `{DONDE_ID_FISCAL}` y `{EJEMPLO_ID_FISCAL}`, y los
rellena la fila del país: un KAM de México lee "¿Cuál es el número de RFC de esa
empresa? Escríbelo completo, tal como sale en la constancia de situación fiscal
del SAT: PRU200101AB5". Lo mismo en la lista de tiendas del Multitienda y en la
razón social. Funciona igual con la interfaz en portugués, porque la sustitución
va al final, después de elegir idioma y variante.

## Cómo probarlo

1. `npm test`. Son 726 pruebas, 45 más que antes. Las nuevas están en
   `pruebas/paises_habilitados.test.js` (qué ofrece cada país, y que ninguna
   pregunta se quede con un marcador crudo en ninguno de los nueve) y
   `pruebas/descuento_y_cupon.test.js` (lo que cambia al cambiar la forma del
   beneficio, el código del cupón y el nombre de la campaña).
2. `npm run previsualizar DC01` para ver el documento de un Descuento mexicano.
   También `DC02`, `CU01`, `CU02`, `CC06` y `BR05`, que son los otros cinco casos
   dorados nuevos. `CU03` y `DC03` son los dos que deben fallar.
3. `npm run demo` y abrir `demo/index.html`. México → Descuento es el camino
   corto: veinte preguntas y el documento llenándose al lado.
4. Los dos recorridos de la skill de flujo pasan enteros, el de español y el de
   portugués.

## Qué necesita Juan, y qué necesitan los equipos de país

**De Juan, nada para seguir.** Lo que hay que revisar está en
`docs/PENDIENTES_LEGAL.md`, en la sección nueva del final, escrito para que lo
lea el abogado de cada país y no él: qué frases son texto nuevo y no vienen de un
documento aprobado, qué cuatro datos por país se escribieron por analogía (el
parentesco es el que más conviene mirar) y las cinco cosas que cada país tiene
que decidir, entre ellas si su concurso necesita algún trámite y si el envío y la
tarifa de servicio se pueden regalar como beneficio de una tienda.

**Una corrección que ya se aplicó y conviene saber:** `montoConMoneda()` escribía
"tres millones pesos" en vez de "tres millones de pesos". Era un defecto viejo
que solo se veía con millones redondos, y ningún caso dorado tenía uno. Afecta de
aquí en adelante a todo monto impreso, en los nueve países.

## Lo que no entró, y por qué

- **Colombia no se tocó.** Juan dijo "excepto Colombia" y la fila de Colombia
  está igual: allí el Descuento y el Cupón siguen sin existir, y los T&C
  generales publicados siguen siendo el camino.
- **El Cashback Multitienda, el cashback por ETA y Rappi Travel siguen siendo
  solo de Colombia.** No estaban en el encargo, y los tres dependen de datos que
  hoy solo existen en la fila de Colombia.
- **Ningún país nuevo salió a piloto ni cambió de estado.** Los nueve estaban ya
  activos desde el 20 de septiembre.

---

# Bloque 12 · La revisión legal con los nueve países

Es la apertura a los equipos legales de los nueve países, antes de que la
herramienta la vea un comercial. Está preparado, falta que Juan lo mande.

## Qué quedó

- **`docs/REVISION_LEGAL_GLOBAL.md`**: el mensaje del canal y los dos del hilo,
  escritos para pegar; el mapa de la hoja de feedback pestaña por pestaña; la
  regla de los accesos a Squarespace; y qué se hace el lunes con lo que llegue.
- **`scripts/hoja_feedback.py`**: arma el libro que se sube a Drive y se
  convierte en el Google Sheet. Once pestañas, con los 194 datos legales de los
  nueve países y las 55 leyendas ya escritas desde el repositorio, listas
  desplegables, fórmulas de resumen y una hoja de LÉEME.

## Cómo probarlo

```
pip install openpyxl
python3 scripts/hoja_feedback.py /tmp/revision.xlsx
```

Abre el archivo y mira la pestaña LÉEME primero, que es lo que van a leer ellos.

## Qué necesito de Juan

1. **Subir la hoja a Drive.** Se arrastra el `.xlsx` y Drive lo convierte en
   Sheet con todo dentro. Compartirla con `rappi.com` como editor, porque el
   enlace va a un canal de nueve países.
2. **Pegar el enlace de la hoja** donde el mensaje dice `LINK_DEL_SHEET`.
3. **Confirmar el enlace de la web app.** El que hay escrito es el del despliegue
   de aquella noche.
4. **Las menciones y el `cc`**, que los pone él.
5. **Confirmar quién es Maca** y avisarle antes de que empiecen a llegar nombres
   a la pestaña 6.

La fecha límite del mensaje es el **viernes 25 de septiembre a las 6:00 p.m. hora
de Colombia**. Si se manda otro día, hay que cambiarla en el mensaje y en la
constante `FECHA_LIMITE` del script, que la escribe en la hoja.

## 22 de septiembre · La pantalla de Legal ya distingue el país

Juan reportó que "Ir al formulario de Legal" llevaba siempre al mismo
formulario, el de Colombia, sin importar de qué país fuera el comercial. Se lo
mostré armado en un mockup antes de tocar código, y lo confirmó tal cual.

### Qué quedó

`pantallaLegal()` (`src/client/js/60-flujo.js`) ahora mira si el país ya se
respondió de verdad (`E.respondidas.pais`, no el valor por defecto) antes de
decidir qué mostrar:

- Colombia o Costa Rica (`PAISES_DEL_FORMULARIO_DE_LEGAL`): igual que antes, el
  botón al formulario.
- Cualquier otro país, ya confirmado: se quita el botón y sale un mensaje con el
  nombre del país, pidiendo escribir a su equipo legal por los canales de
  siempre.
- País todavía sin confirmar (el "sí" vino del filtro general, que corre antes
  de preguntar el país): un mensaje que cubre los dos casos, con el botón
  etiquetado "(Colombia y Costa Rica)".

Los tres textos nuevos quedaron traducidos al portugués en
`src/core/textos_interfaz.js`, y la Ayuda (`src/core/ayuda.js`) suma una
pregunta frecuente que explica el caso. El detalle técnico de por qué "país
conocido" se mide como se mide está en `docs/DECISIONES.md`, punto 133, y lo
que falta confirmar por país en `docs/PENDIENTES_LEGAL.md`.

### Cómo probarlo

1. `npm test` (728 pruebas, ninguna nueva: el cambio es de pantalla, no de
   motor).
2. `npm run demo` y los dos recorridos de la skill de flujo
   (`recorrer-flujo.js` y `recorrer-en-portugues.js`), completos.
3. Con la demo abierta, en la consola: `RM.estado.reiniciarFormulario(Object.assign(RM.app.valoresIniciales(), {pais: 'MX'}), {pais: true}); RM.estado.estado.motivoDeLegal = 'prueba'; RM.app.ir('legal')` para ver el mensaje de otro país sin el botón, y lo mismo con `pais: 'CO'` o sin fijar `pais` para ver los otros dos casos.

### Qué necesita Juan

Confirmar con cada equipo legal de país cuál es su formulario o canal real, para
reemplazar el mensaje genérico por el enlace correcto de cada uno (queda anotado
en `docs/PENDIENTES_LEGAL.md`).

## Bloque 24: la revisión general del código, y los seis arreglos que salieron de ella

### Qué quedó

Primero la revisión, que está entera en `docs/REVISION_CODIGO.md`: qué se buscó,
qué se encontró, qué parecía defecto y no lo era, y las dos preguntas que son de
negocio. Después los arreglos. Los seis son de código, ninguno toca el texto de
`modelos/`.

**Un T&C ya no se publica con "undefined" adentro.** Si a la pestaña Paises le
falta una columna (porque se creó antes de que existiera, como pasó con
`travel_*` y con `turbo_id_fiscal`), esa llave no llega y el valor cruzaba como
`undefined`. El documento salía dado por bueno diciendo "un millón
(1undefined000undefined000) de Créditos", ya creado en Drive. Ahora la red de
seguridad del motor mira también las palabras que deja JavaScript cuando un
dato no existe, `formatearMiles` no las fabrica, y las tres columnas con que el
país escribe cualquier cifra se revisan antes de generar.

**Los decimales no entran.** La revisión numérica miraba el mínimo y el máximo y
nunca si el número era entero, así que un 50,5 salía titulado "50.5% CASHBACK"
sobre una cláusula que decía "cincuenta por ciento (50%)". Eran 47 campos en los
diez tipos, más los de cada tienda del Multitienda. Se rechaza en vez de
redondear.

**Los números gigantes tampoco.** `numeroEnLetras` llega hasta 999.999.999.999 y
pasado ese punto repetía la palabra ("un millón millones"). Ahora se rechaza con
un aviso que habla de ceros de más, que es la vía real.

**Un campo con espacios ya no atasca al comercial.** Un "   " se daba por
respondido y el error que volvía nombraba un marcador del modelo, asociado al
campo "documento" y no a su pregunta. Ahora cuenta como vacío, el error apunta a
la pregunta, y cuando un hueco llega igual por otro camino se nombra en palabras.

**El CSV de administración** escribe las fechas como la pantalla y ya no deja que
una respuesta se ejecute como fórmula al abrirlo en Excel.

**Y dos protecciones que faltaban donde estaban prometidas:** la vista previa
aguanta una entrada sin país, como dice su comentario, y la ampliación usa la
misma fecha de fin que el resto del sistema, así que una campaña de un solo día
ya no queda "en curso" para siempre.

### Cómo probarlo

1. `npm test`: 746 pruebas, 738 pasan, 0 fallan, 8 saltadas (las de siempre, que
   dependen de artefactos que no se versionan).
2. `npm run build`, que queda limpio y sin colisiones de nombre.
3. Para ver los dos primeros con los ojos: en la demo, escribe 50,5 en el
   porcentaje de un cashback, y luego un presupuesto con cinco ceros de más. Los
   dos tienen que rebotar con un mensaje en español, no generar.

### Qué necesita Juan

Las dos preguntas de la sección 3 de `docs/REVISION_CODIGO.md`, que son de
negocio y no de código:

1. Tres leyendas que Legal ya aprobó (`leyenda_descuento_co`,
   `leyenda_membresia_pro_co` y la rama de descuento de `leyenda_push_co`) están
   escritas y no las alcanza nadie, porque el camino de los T&C generales no
   llama a las leyendas. ¿Se conectan?
2. En ocho países hay categorías con leyenda aprobada que el comercial nunca ve,
   porque la pregunta depende de que el país tenga leyenda de campaña y hoy solo
   la tiene Colombia. México tiene cinco esperando. ¿Se ofrecen igual?

Y una decisión pequeña, por si algún día hace falta: hoy un porcentaje con
decimales se rechaza. Si Legal quiere permitir un 12,5%, el texto en letras lo
tiene que escribir Legal y la regla se afloja para ese campo.

## Bloque 25: las tres leyendas muertas, conectadas

### Qué quedó

Legal había escrito y aprobado tres leyendas para las campañas que usan un T&C
general de Colombia, y las tres estaban en el repositorio sin manera de llegar a
una pieza. El comercial se llevaba el enlace y escribía la letra pequeña de
memoria, con la forma de dos frases que la pantalla le mostraba.

Ahora, en la pantalla del T&C que eligió, debajo del enlace, hay un bloque que
le arma la letra pequeña. Le pide la vigencia (que la leyenda nombra) y, si los
tiene, las unidades disponibles, el máximo por usuario y la compra mínima; y
marca si es solo para Pro o si es de Turbo. Le devuelve la leyenda de Legal
lista para copiar, en sus cuatro formatos, y le dice por cuántos caracteres se
pasa cuando no cabe en uno.

El enlace se sigue dando antes y sin preguntar nada. Esa es la promesa de esa
pantalla y no se tocó: la letra pequeña es un extra.

Dos decisiones de criterio, las dos anotadas en `docs/PENDIENTES_LEGAL.md`:

- **Dónde no se ofrece.** La leyenda dice "El descuento no incluye tarifa de
  servicio y costo de envío", y esa frase es obligatoria. En Envío Gratis y en
  Tarifa de Servicio Gratis le negaría al usuario lo que la campaña le promete,
  y en el código para eventos externos habla de cosas que ahí no existen. En los
  tres no sale nada y se dice por qué.
- **Dónde va el texto de la membresía.** Explica qué incluye la membresía Pro,
  así que va en las campañas que son sobre la membresía, no en los descuentos
  que son solo para usuarios Pro. Puestas las dos, el enlace de Pro salía
  repetido y la leyenda se pasaba del largo del formato: 625 caracteres contra
  620. Separadas, queda en 397 y cabe.

### Cómo probarlo

1. `npm test`: 762 pruebas, 754 pasan, 0 fallan, 8 saltadas.
2. `npm run demo` y el recorrido completo de la skill de flujo, que pasa entero.
3. Con los ojos, que es lo que importa aquí: en la demo, entra a "Descuentos,
   cupones, envío gratis, Rappi Pro y más", pasa el filtro con seis noes, elige
   "Descuento en Toda la Tienda" y baja hasta "La letra pequeña de tu pieza".
   Pon 2026-10-01 y 2026-10-31, 10000 unidades y 6 por usuario, y dale a armar.
   Después vuelve a la lista y abre "Envío Gratis": ahí no tiene que ofrecerte
   ninguna leyenda, y tiene que decirte por qué.

### Qué necesita Juan

Las cuatro de `docs/PENDIENTES_LEGAL.md`, sección "La letra pequeña de los T&C
generales", que son de Legal y no de código:

1. Si Envío Gratis, Tarifa de Servicio Gratis y el código para eventos externos
   deberían tener su propia leyenda escrita.
2. Si "Ofertas entre $10.000 hasta $40.000" se queda así, que es como lo escribe
   el Playbook, o pasa a "entre $10.000 y $40.000".
3. Qué hacer cuando la leyenda no cabe en un banner corto: una versión recortada
   o revisar el límite de 300 caracteres de ese formato.
4. Confirmar el criterio de dónde va el texto de la membresía Pro.
