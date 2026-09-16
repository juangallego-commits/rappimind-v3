# Los defectos reales de los que salieron las reglas

Cinco defectos que llegaron a la pantalla de Juan. Ninguno lanzó una excepción:
los cinco fallaron en silencio y el síntoma apareció lejos de la causa.

Están en orden de aparición. Si estás persiguiendo un síntoma raro, búscalo aquí
primero: es probable que ya haya pasado.

---

## 1. La vista previa en blanco, y la opción que no se resaltaba

**Lo que vio Juan.** El cuadro de la derecha, donde el documento se va llenando,
salía vacío. Y al elegir el tipo de campaña, la tarjeta no se marcaba. Lo reportó
como dos defectos distintos.

**Lo que pasaba.** Uno solo. `MotorCliente.html` llevaba los quince archivos de
`src/core/*.js` al navegador, pero no los textos legales. `Modelos.js`,
`PaisesSemilla.js` y `Secciones.js` quedaban sueltos en `dist/`, que es el lado
del servidor. En el navegador `MODELOS` quedaba sin definir,
`renderizarVistaPrevia` reventaba, y como reventaba a mitad del manejador del
clic, la línea que repinta la pantalla nunca se ejecutaba. De ahí que la opción
tampoco se marcara.

**Por qué no se vio antes.** En la demostración sí iban en la misma página,
porque `scripts/demo.js` los inyectaba aparte. La demo funcionaba y Apps Script
no.

**El arreglo.** `scripts/build.js` mete los datos dentro de `MotorCliente.html`.

**La prueba.** `MotorCliente.html corre solo en el navegador y arma la vista
previa`, en `pruebas/build.test.js`. Ejecuta el HTML en un contexto sin `module`
ni `require` y exige que la vista previa salga con sus huecos marcados.

---

## 2. "Mis campañas" con `Cannot read properties of null`

**Lo que vio Juan.** La pantalla del historial, con un mensaje rojo:
`No pudimos cargar tu historial: Cannot read properties of null (reading 'length')`.

**Lo que pasaba.** `google.script.run` solo transporta números, textos,
booleanos, nulos, listas y objetos de esos. Las fechas no. Y no falla avisando:
le entrega `null` al `withSuccessHandler`. Google Sheets había convertido sola la
celda `fecha_inicio` a una fecha de verdad, así que la respuesta del historial
llevaba un objeto `Date` y toda la respuesta llegó como `null`.

**Por qué no se vio antes.** Los dobles del Sheet devuelven texto, no fechas. Y
la demostración no pasa por esa tubería.

**El arreglo.** `filasPlanas()` en `src/core/tablas.js`, aplicado en la frontera:
el historial, el estado inicial y las dos pantallas de administración.

**La prueba.** `el historial no devuelve fechas, que Apps Script convierte en
null`. Mete una fecha de verdad en la hoja del doble y exige que la respuesta no
lleve ninguna.

---

## 3. La lista de tipos de campaña vacía

**Lo que vio Juan.** La pregunta "¿Qué tipo de campaña vas a hacer?" sin una sola
opción debajo.

**Lo que pasaba.** La sobrecorrección del defecto anterior. `filasPlanas`
convertía a texto todo lo que no fuera primitivo, y las listas caían ahí. La
lista de modelos del país llegaba como `"cashback,carrera_compras,..."` en vez de
una lista, y `tiposDelPais()` devolvía cero.

**Por qué no se vio antes.** Otra vez la demostración: su servidor simulado no
limpia nada.

**El arreglo.** `valorPlano` recorre listas y objetos en vez de convertirlos.
Solo las fechas se vuelven texto.

**La prueba.** `el estado inicial conserva las listas, no las vuelve texto`.
Corre `estadoInicial()` con los dobles y exige que `pais.modelos` siga siendo una
lista con los cinco tipos.

**La lección de fondo.** Arreglar una frontera de más es tan peligroso como
arreglarla de menos. La regla no es "conviértelo todo a texto por si acaso", sino
"convierte exactamente lo que no pasa".

---

## 4. Las filas del Sheet corridas de columna

**Lo que casi pasa.** Al agregar las 43 columnas de auditoría, una hoja que ya
existía con las columnas viejas habría recibido filas de 60 valores contra 17
encabezados. Los datos habrían quedado corridos y nadie lo habría notado hasta
auditar.

**El arreglo inicial.** Pedirle a Juan que corriera `setup()`. Funciona hasta que
a alguien se le olvida.

**El arreglo bueno.** `encabezadosDeLaHoja()` en `src/server/Datos.js`: al
escribir una fila se miran los encabezados que la hoja tiene de verdad y se
agregan al final los que falten. Nunca se mueve ni se borra una columna
existente, porque eso desalinearía todo el histórico.

**La prueba.** `una hoja vieja se pone al día sola, sin correr setup otra vez`.

---

## 5. La navegación que mandaba al resumen vacío

**Lo que vio Juan.** Al elegir "Rappi" en la primera pregunta, la pantalla
saltaba al resumen final con el formulario en blanco.

**Lo que pasaba.** No es una frontera de datos, pero falla igual de callado. El
manejador de la respuesta cambiaba de pantalla, y **después** el control de
opciones llamaba a `avanzar()` encima. Como cambiar de negocio borra el tipo
elegido, el paso se quedaba sin preguntas, y `avanzar()` interpretó "no quedan
preguntas" como "ya terminó" y se fue al resumen.

**El arreglo.** `alResponder` devuelve `true` cuando ya navegó, y quien llama lo
respeta.

**La lección.** Cuando un manejador puede navegar, tiene que decirlo. Si no,
quien sigue en la cadena actúa sobre una pantalla que ya no existe.

---

## Lo que tienen en común

Los cinco se veían en Apps Script y no en la demostración, o al revés. Ninguno
dejó rastro en un registro. En los cinco, el síntoma estaba lejos de la causa: la
vista previa vacía era un problema del build, el historial roto era una fecha en
una celda, la lista sin opciones era una lista convertida a texto tres capas
atrás.

De ahí la regla que más vale la pena: **cuando algo se rompa en silencio,
reprodúcelo en Node contra los dobles antes de arreglarlo**. Si no logras que
falle ahí, no has entendido la causa todavía.
