# Lo que depende de Juan

Actualizado el 18 de septiembre de 2026, al cerrar la revisión general.

Este es el documento de trabajo. `docs/PENDIENTES_LEGAL.md` se queda como
historia: ahí está cómo llegó cada cosa, aquí está lo que falta decidir.

## Cómo está armado

Cada punto dice cuatro cosas, siempre en el mismo orden:

1. **Qué hay que decidir.**
2. **Por qué existe la duda.**
3. **Las opciones.**
4. **Qué pasa con la herramienta con cada una.** Es el que importa para decidir.

Y al final de cada punto, **quién decide**: tú solo, o tú después de preguntarle
a alguien concreto.

Los bloques van **de lo que más desbloquea a lo que menos**:

- **A.** Hoy impide que alguien genere un documento, o que un país se use.
- **B.** Ya sale impreso y nadie lo ha confirmado.
- **C.** La pieza publicitaria.
- **D.** Producto: abre un camino que hoy no existe.
- **E.** Se lo tienes que pedir a otra persona.
- **F.** Se puede vivir sin resolver.
- **G.** Cerrado, con su fecha. No vuelve a aparecer como pregunta.

Todo lo que un punto necesita está escrito adentro: las cláusulas van copiadas,
las pantallas descritas. No hace falta abrir el repositorio.

---

# A. Hoy impide generar, o impide que un país se use

## A1. Los nombres de las secciones de la app, fuera de Colombia

**Qué hay que decidir.** Cómo se llaman, dentro de la app, las secciones donde
un usuario puede gastar sus Créditos, en México, Perú, Argentina, Chile,
Uruguay, Ecuador y Costa Rica. En Colombia la lista que tú confirmaste es:
Restaurantes, Turbo, Supermercados, CPGs y Turbo Restaurantes.

**Por qué existe la duda.** El cashback pregunta "¿Dónde puede gastar los
Créditos?" con tres respuestas: solo en esa tienda, en ciertas secciones de
Rappi, o en cualquier parte. Si el comercial elige la segunda, el documento
imprime los nombres **entre comillas**, así que tienen que ser exactamente los
de la app de ese país. Hoy solo existe la lista de Colombia.

**Lo que pasaba hasta esta revisión.** En los cinco países activos que no son
Colombia, el comercial elegía esa opción y se quedaba delante de una pregunta
sin una sola casilla que marcar, con un error que le pedía marcar al menos una.
Imposible de cumplir. **Ya está tapado**: la opción se ve bloqueada y dice
"Todavía no tenemos la lista de secciones de la app en México, y el documento
tiene que nombrarlas igual que la app. Si tu campaña las necesita, escríbenos a
#tyc-rappi." Las otras dos respuestas siguen disponibles.

**Opciones.**

- (a) Conseguir la lista de cada país y pasarla. Se desbloquea sola.
- (b) Dejar la opción bloqueada fuera de Colombia, a propósito, hasta que
  alguien la pida.

**Qué pasa con la herramienta.** Con (a), el comercial de ese país puede hacer
campañas con redención por secciones el mismo día en que llegue la lista: es
pegar los nombres. Con (b), en esos países solo se pueden hacer campañas con
redención "solo en esta tienda" o "en cualquier parte de Rappi", que es la
mayoría de los casos. Ninguna de las dos rompe nada.

**Y de paso, la lista de Colombia.** En las 1.184 solicitudes reales aparece una
sección **Express** que no está en la lista, y no aparecen **Farmacia** ni
**Tiendas especializadas**, que sí están. Si la app cambió de secciones, la
lista de Colombia también hay que ponerla al día, porque esos nombres salen
entre comillas en el documento.

**Quién decide.** Tú, con un dato que tiene que salir de la app de cada país.
Lo puede mirar cualquiera con la app instalada en ese país, o Producto.

---

## A2. Ecuador y Costa Rica: con punto o con coma

**Qué hay que decidir.** Si en Ecuador y en Costa Rica los montos de un T&C se
escriben `20.000` o `20,000`.

**Por qué existe la duda.** Es el único dato que falta para que esos dos países
salgan de piloto. Hoy Ecuador escribe con coma y Costa Rica con punto, elegido
por analogía y sin que nadie lo confirme. El monto sale impreso en varias
cláusulas, por ejemplo "un tope de veinte mil (20.000) Créditos por pedido".

**Opciones.**

- (a) Confirmar el separador de cada uno y sacarlos de piloto.
- (b) Dejarlos en piloto.

**Qué pasa con la herramienta.** Con (a), los dos países pasan a estar
disponibles para cualquier comercial, se les quita el aviso de "está en pruebas:
genera y revisa, pero todavía no publiques" y sus documentos se pueden publicar.
Es un cambio de una celda más una tanda de confirmaciones, y está el mismo día.
Con (b), esos dos países solo los ve el equipo de pruebas y ningún comercial
puede generar ahí.

**Quién decide.** Alguien de Legal de cada país, mirando cómo escriben los
montos sus propios T&C publicados. Contacto en Ecuador: Claudia Apolo. En Costa
Rica no hay contacto confirmado, y ese es el bloqueo real.

---

## A3. Brasil imprime, y le faltan datos de su propia fila

**Qué hay que decidir.** Tres valores de la configuración de Brasil que hoy
están vacíos o en español, con Brasil ya en producción desde el 18 de
septiembre.

**Por qué existe la duda.** Estos son los tres, tal como están hoy:

- **`texto_derechos_datos`: vacío.** En Colombia dice "tus derechos a conocer,
  actualizar, rectificar y suprimir tus datos personales, y a revocar la
  autorización otorgada". Para Brasil tendría que salir de la LGPD.
- **`pais_legal`: "a República Federativa del Brasil".** Mezcla portugués y
  español; debería decir "do Brasil".
- **`entidad_vigilancia`: "el PROCON y la Secretaría Nacional del Consumidor
  (SENACON)".** Está en español, y son nombres de autoridades.

**Opciones.**

- (a) Pedirle a Legal BR las tres frases como se llaman de verdad.
- (b) Traducirlas por cuenta propia.

**Qué pasa con la herramienta.** Hoy ninguno de los tres sale impreso, porque el
modelo brasileño no usa esos bloques. Con (a) quedan bien para el día en que un
modelo de Brasil los pida, y se puede agregar la cláusula de datos personales
que hoy Brasil no lleva. Con (b) se publicaría un T&C nombrando mal a una
autoridad, que es exactamente lo que no se puede hacer. No se tradujo nada.

**Quién decide.** Legal Brasil. Contacto: Amannda Moreira.

---

## A4. "Dentro de los un (1) día hábil siguientes"

**Qué hay que decidir.** Una frase de la Carrera de Compras, cuando el plazo
para aceptar el premio es de un solo día hábil.

**Por qué existe la duda.** La cláusula dice, textualmente:

> • **Aceptación:** el ganador deberá aceptar el premio y confirmar sus datos, y
> su dirección de entrega cuando corresponda, dentro de los **{{PLAZO}}**
> siguientes a la notificación. Si Rappi no logra contactarlo tras intentos
> razonables, o si no acepta el premio o no confirma sus datos dentro de ese
> plazo, el premio podrá asignarse al siguiente participante del ranking, de
> forma sucesiva.

Con cinco días sale "dentro de los cinco (5) días hábiles siguientes", que está
bien. Con uno sale **"dentro de los un (1) día hábil siguientes"**, que está mal
escrito: "los" y "siguientes" están en plural y viven dentro de la cláusula, no
en el motor. Esta revisión arregló ocho frases del mismo tipo que sí estaban
enteras en el motor; esta es la única que queda, porque tocarla es tocar el
texto de Legal.

**Opciones.**

- (a) Que la cláusula diga "dentro de {{PLAZO}} siguiente(s)" y el motor entregue
  "un (1) día hábil siguiente" o "los cinco (5) días hábiles siguientes"
  completos. Con más de un día, el documento sale palabra por palabra igual que
  hoy.
- (b) Que el plazo mínimo pase a dos días hábiles, y la frase nunca quede en
  singular.
- (c) Dejarla como está.

**Qué pasa con la herramienta.** Con (a) no cambia nada para nadie salvo quien
ponga un día. Con (b) se bloquea una respuesta que hoy es válida, con un mensaje
que lo explique. Con (c) se publica esa frase mal escrita cada vez que alguien
ponga un día, que es un plazo razonable para un concurso corto.

**Quién decide.** Tú. Es una cláusula.

---

## A5. Los KAM no pueden abrir la carpeta de Drive

**Qué hay que decidir.** Quién le da acceso de lectura a los comerciales a la
carpeta donde está el modelo de acuerdo de transferencia de datos.

**Por qué existe la duda.** En el hilo, dos personas no pudieron abrirla. La
herramienta ya les muestra el botón "Abrir el modelo de acuerdo" en Carrera de
Compras cuando el premio es físico y lo entrega el Organizador.

**Opciones.**

- (a) Dar acceso de lectura a quien use la herramienta.
- (b) Quitar el botón y decirle al comercial que lo pida por #tyc-rappi.

**Qué pasa con la herramienta.** Hoy el botón lleva a una pantalla de "pide
permiso", que es el peor final posible: el comercial hizo lo que la herramienta
le dijo y se topó con una puerta cerrada. Con (a) el botón cumple lo que
promete. Con (b) el comercial tiene que esperar a que alguien le conteste, que
es justo lo que esta herramienta existe para evitar.

**Quién decide.** Tú, con quien administre esa carpeta de Drive.

---

# B. Ya sale impreso y nadie lo ha confirmado

## B1. Perú, Argentina, Chile y Uruguay no tienen caso dorado

**Qué hay que decidir.** Si se congelan cuatro documentos de ejemplo, uno por
país, para que nadie pueda moverlos sin darse cuenta.

**Por qué existe la duda.** Un "caso dorado" es un documento completo guardado
letra por letra: si mañana alguien cambia algo y ese documento sale distinto,
las pruebas se caen y dicen qué línea cambió. Hoy hay 32 casos: 26 de Colombia,
uno de México, cuatro de Brasil y uno de Ecuador. Perú, Argentina, Chile y
Uruguay están **activos en producción** y no tienen ninguno.

**Cuánto riesgo es, medido.** El documento de cada país imprime **16 valores que
salen de la fila de ese país**: la entidad legal, el domicilio, el nombre del
país, la ley aplicable, la jurisdicción, la entidad de vigilancia, la autoridad
de datos, tres enlaces, el nombre de la política de privacidad, cómo se llaman
los días, el texto de la hora local y el texto de los derechos de datos. Son 64
valores en total, en documentos que se publican, sin nadie que avise si alguno
cambia. Si alguien edita la pestaña Paises del Sheet o la semilla, hoy no se
cae ninguna prueba.

**Cuánto cuesta.** Cada documento son 55 líneas. Son cuatro entradas nuevas en
el archivo de casos y cuatro archivos de texto de 55 líneas. Generarlos y
revisarlos línea a línea: una sesión corta. Mantenerlos no cuesta nada: solo
avisan cuando algo cambia.

**Opciones.** (a) Agregarlos. (b) No agregarlos.

**Qué pasa con la herramienta.** Con (a), mover una cláusula compartida o un
dato de esos cuatro países se cae en `npm test` antes de llegar a producción.
Con (b), se entera quien lea el documento publicado, si lo lee.

**Quién decide.** Tú. Es técnico de hacer, pero es tu llamada sobre el riesgo.
La oferta sigue en pie desde el 18 de septiembre.

---

## B2. Los cuatro documentos de Brasil no se compararon con los aprobados

**Qué hay que decidir.** Si alguien compara, línea por línea, lo que la
herramienta genera para Brasil contra los cuatro T&C que mandó Legal Brasil
(Desconto % OFF, Frete Grátis, Taxa de serviço mínimo de compra, Taxa de serviço
e entrega grátis).

**Por qué existe la duda.** Los cuatro casos dorados de Brasil guardan lo que el
motor produce **hoy**. Protegen ese texto de moverse solo. No dicen que sea el
texto aprobado: nadie ha puesto los dos al lado.

**Opciones.** (a) Comparar y corregir lo que no cuadre. (b) Darlos por buenos.

**Qué pasa con la herramienta.** Con (a), si algo no cuadra se corrige antes de
que un KAM publique. Con (b), Brasil sigue generando y publicando con un texto
que se armó a partir de los cuatro documentos pero que nadie verificó contra
ellos. Brasil ya está en producción desde el 18 de septiembre, así que esto
corre desde hoy.

**Quién decide.** Tú, con Legal Brasil.

---

## B3. Brasil: la hora de inicio y cómo se escribe el límite

**Qué hay que decidir.** Dos detalles del documento brasileño.

**Por qué existe la duda.**

- **La hora.** El formulario deja 00:00 por defecto en todos los países. Los
  cuatro T&C aprobados de Brasil arrancan a las **00:01**. Hoy sale impreso lo
  que el KAM deje, y lo que deja es 00:00.
- **El límite de pedidos.** El motor imprime "um (1) pedido". La ayuda en
  portugués cita el documento aprobado como "1 (um) pedido". Una de las dos está
  mal, y en Brasil los montos van con la cifra primero ("R$300,00 (trezentos
  reais)"), lo que sugiere que la forma aprobada es "1 (um)".

**Opciones.** (a) Confirmar las dos y ajustar. (b) Dejarlo.

**Qué pasa con la herramienta.** Con (a), el valor por defecto de Brasil pasa a
00:01 y el motor escribe el límite como Legal BR diga: dos cambios chicos. Con
(b), cada T&C brasileño que se publique arranca una hora distinta de la de los
aprobados y escribe el límite al revés.

**Quién decide.** Legal Brasil. Va en el mismo mensaje del punto E1.

---

## B4. El cashback por ETA le habla al usuario de dos maneras

**Qué hay que decidir.** Si el modelo de "15 minutos o Cashback" tutea o habla
en tercera persona.

**Por qué existe la duda.** El documento está escrito en tercera persona, como
los dos publicados de Bogotá y Barranquilla:

> **4. Tipo de Usuarios Participantes.** Podrán participar todos los
> Usuarios/Consumidores registrados en la Plataforma Rappi que durante la
> vigencia de la Campaña realicen órdenes en las Tiendas Participantes.

Pero incluye bloques compartidos con los demás modelos de Colombia, que tutean:

> **8. Acreditación del Beneficio.** Los Créditos correspondientes al Beneficio
> se acreditarán en **tu** Billetera de Créditos al día siguiente de la
> finalización de la orden. **Podrás** verificar el estado de **tus** Créditos
> en las secciones "Cuenta" y "Créditos"...

El documento sale mezclado. Se ve entero en el caso dorado ETA01.

**Opciones.**

- (a) El ETA tutea como los demás, y se reescriben sus cláusulas propias.
- (b) Los bloques compartidos se reescriben en tercera persona **solo** para
  este modelo.
- (c) Se queda mezclado.

**Qué pasa con la herramienta.** Con (a) cambia el modelo del ETA y nada más.
Con (b) hay que duplicar cuatro bloques compartidos (acreditación, vigencia de
los Créditos, datos personales y ley) en una versión para el ETA, y a partir de
ahí hay dos copias de cada uno que se pueden desincronizar. Con (c) se sigue
publicando un documento que cambia de persona a mitad.

**Quién decide.** Tú. Es redacción de cláusulas.

---

## B5. El ETA dice "pedido" y "orden" para lo mismo

**Qué hay que decidir.** Cuál de las dos palabras usa el modelo del ETA.

**Por qué existe la duda.** Las definiciones del ETA hablan de "la orden" y de
"un porcentaje o valor del pedido", en la misma cláusula. Los dos T&C publicados
de Bogotá y Barranquilla usan "orden". El bloque compartido de acreditación, que
el ETA incluye, habla de "cada pedido".

**Opciones.** (a) "Orden" en todo el modelo del ETA. (b) "Pedido". (c) Se queda.

**Qué pasa con la herramienta.** Es la misma decisión del punto B4 y conviene
resolverla junta: si los bloques compartidos se quedan como están, la mezcla
sigue; si se hace una versión del bloque para el ETA, se arreglan las dos cosas
de una vez.

**Quién decide.** Tú.

---

## B6. Chile publica "las autoridades competentes"

**Qué hay que decidir.** Nada hoy, y algo el 1 de diciembre de 2026.

**Por qué existe la duda.** La cláusula de datos personales nombra a la
autoridad de protección de datos del país. En Chile dice "las autoridades
competentes", a propósito, porque la agencia que crea la Ley 21.719 todavía no
opera. Esa frase sale impresa en cada T&C chileno que se publique.

**Opciones.**

- (a) El 1 de diciembre de 2026, si la ley entra en vigencia, cambiar el valor a
  "la Agencia de Protección de Datos Personales".
- (b) Dejar "las autoridades competentes" hasta que alguien avise.

**Qué pasa con la herramienta.** Es una celda de la pestaña Paises y un valor de
la semilla. Con (a) hay que acordarse ese día; el Gobierno está evaluando
postergar la ley, así que la fecha puede moverse. Con (b), los T&C chilenos
nombran a una autoridad genérica, que no es incorrecto mientras la agencia no
exista.

**Quién decide.** Tú, con Legal Chile, y hay que ponerle recordatorio.

---

## B7. Argentina: el nombre de la autoridad de consumo

**Qué hay que decidir.** Si "la Dirección Nacional de Defensa del Consumidor" es
el nombre vigente.

**Por qué existe la duda.** Esa dependencia ha cambiado de nombre varias veces.
El valor está puesto y sale impreso en cada T&C argentino.

**Opciones.** (a) Confirmarlo o corregirlo. (b) Dejarlo.

**Qué pasa con la herramienta.** Una celda. Con (b), los T&C argentinos pueden
estar mandando al usuario a una autoridad con un nombre viejo.

**Quién decide.** Legal Argentina. Contacto: Milena Casella.

---

# C. La pieza publicitaria

## C1. El banner corto no cabe casi nunca

**Qué hay que decidir.** Qué pasa cuando la leyenda legal no cabe en el formato.

**Por qué existe la duda.** Medido hoy sobre los 14 casos dorados de Colombia
que generan documento:

| Formato | Límite | Cuántos se pasan | El peor |
|---|---|---|---|
| Texto de apoyo | 350 | 0 de 4 | cabe |
| Letra pequeña | 620 | 0 de 13 | cabe |
| **Banner corto** | 300 | **10 de 13** | se pasa por 279 |
| **Valla y exterior** | 300 | **2 de 2** | se pasa por 67 |
| **Push y SMS** | 70 | **4 de 4** | se pasa por 46 |

(Sin tabla en el documento generado; esta tabla es solo para leer aquí.)

La letra pequeña, que era la preocupación anterior, hoy cabe en los 13 casos,
aunque por poco: la campaña de Farmatodo con Turbo y licores mide 609 de 620.

**Opciones.**

- (a) Subir el límite del banner corto y de la valla. Los 300 caracteres salen
  de la sección 7C del encargo de leyendas, no de una regla legal.
- (b) Marcar como recortable algo que hoy es obligatorio dentro de la leyenda.
- (c) Aceptar que esas campañas no salen en banner chico ni en valla, y que el
  arte remite al enlace.

**Qué pasa con la herramienta.** La pantalla final ya dice por cuántos
caracteres se pasa y cuánto de eso son enlaces. Con (a) es cambiar un número.
Con (b) hay que decir qué frase se puede quitar, y eso es una decisión legal.
Con (c) no cambia nada en el código: cambia lo que el comercial puede pedirle a
diseño.

**Quién decide.** Tú.

---

## C2. Push y SMS: el enlace se come el espacio

**Qué hay que decidir.** Si la leyenda de push y SMS lleva enlace.

**Por qué existe la duda.** El límite del formato es 70 caracteres. En los casos
dorados la leyenda mide entre 73 y 116, y el enlace son unos 35 de esos. Sin
enlace cabe siempre. Tú avisaste que en push y SMS casi nunca ponen el enlace.

**Opciones.**

- (a) Que la leyenda de push y SMS salga sin enlace, y la pantalla lo diga.
- (b) Que salga con enlace y quien arma la pieza decida, como hoy.
- (c) Subir el límite de 70.

**Qué pasa con la herramienta.** Con (a) la leyenda cabe siempre y desaparece un
aviso rojo que hoy sale en todas las campañas. Con (b) queda como está: la
pantalla dice "se pasa por 46 caracteres; los enlaces ocupan 35 de los 116". Con
(c) hay que saber cuál es el límite real del canal.

**Quién decide.** Tú. Ojo que choca con lo que decidiste el 18 de septiembre
("el enlace para todo tiene que ser el mismo"): aquí la pregunta no es cuál
enlace, es si va o no va.

---

## C3. Tres frases que no existen, y por eso no hay leyenda

**Qué hay que decidir.** Tres frases cortas para la pieza publicitaria.

**Por qué existe la duda.** Cuando la campaña cae en uno de estos tres casos, la
herramienta no entrega leyenda y dice qué falta, en vez de inventar la frase:

1. **Los Créditos solo sirven en ciertas secciones.** Cómo se dice eso en una
   pieza, en pocas palabras.
2. **La campaña es solo para consumo en el local.** Falta el nombre con el que
   la app muestra hoy esa modalidad en Colombia (`nombre_modalidad_local` está
   vacío). Es el mismo dato del punto D2.
3. **En la Carrera gana quien haga más pedidos.** Cómo se dice el criterio del
   ganador en una pieza.

**Opciones.** (a) Escribir las tres frases. (b) Dejar esas campañas sin leyenda.

**Qué pasa con la herramienta.** Con (a), esas campañas entregan sus cinco
leyendas como las demás. Con (b), el comercial de esas campañas sigue pidiéndole
a Legal el texto del arte, que es justo lo que el encargo de leyendas quitó para
las otras.

**Quién decide.** Tú, porque son frases legales.

---

## C4. Las leyendas de campaña solo existen para Colombia

**Qué hay que decidir.** Si se escriben leyendas de campaña para los otros ocho
países.

**Por qué existe la duda.** El catálogo tiene 55 leyendas. Las de **categoría**
(licores, medicamentos, apuestas, Turbo...) sí existen para varios países. Las
de **campaña**, que son la base donde se pega el complemento de categoría, solo
existen para Colombia: la respuesta del encargo dice "no cubierto" para el
resto.

**Opciones.** (a) Pedirlas para los países que más lo necesiten. (b) Dejarlo.

**Qué pasa con la herramienta.** Con (a), el comercial de ese país recibe sus
leyendas con el documento. Con (b), en los otros ocho países la pregunta de la
categoría del producto no aparece y la pantalla final manda a Legal del país
para el texto de la pieza: el documento sí sale, la leyenda no.

**Quién decide.** Tú, por país y por prioridad. México y Brasil son los
candidatos obvios por volumen.

---

## C5. Las 24 preguntas del encargo de leyendas

**Qué hay que decidir.** Contestar las 24 preguntas de la lista 2 de la
respuesta del encargo 03, o al menos las tres que la propia respuesta marca como
las que más cambian el diseño.

**Por qué existe la duda.** Las tres son:

- **La 21:** dónde se redimen los Créditos del cashback por ETA. La pieza y el
  T&C dicen cosas distintas hoy.
- **La 16:** el enlace corto. Quedó cerrado el 18 de septiembre (no hay enlace
  corto), pero la pregunta arrastra cómo se arma el enlace de cada campaña.
- **La 6:** el aviso de tiempo estimado en el ETA.

**Opciones.** (a) Contestarlas. (b) Dejarlas.

**Qué pasa con la herramienta.** Con (a) se puede terminar de afinar lo que sale
en las piezas. Con (b) las leyendas de Colombia siguen saliendo como hoy: no se
rompe nada, pero quedan preguntas abiertas sobre si dicen lo correcto.

**Quién decide.** Tú.

---

# D. Producto: abre un camino que hoy no existe

## D1. Turbo no es una modalidad, son tiendas por zona

**Qué hay que decidir.** Qué nombra el T&C del cashback por ETA: la ciudad, la
zona, o las tiendas una por una.

**Por qué existe la duda.** Hoy la modalidad está fija en "Turbo Restaurantes" y
la cláusula dice:

> **5. Tiendas Participantes.** Participarán todas las tiendas virtuales bajo la
> modalidad "Turbo Restaurantes" al interior de la Plataforma Rappi que se
> encuentren habilitadas en la ciudad de Bogotá durante la vigencia de la
> Campaña.

Tú corregiste que en la práctica son las tiendas Turbo de cada zona, con nombre
propio: Turbo Calleja, Turbo Chico, Turbo Laureles. Eso no es una lista cerrada
de dos opciones.

**Opciones.**

- (a) El T&C nombra la ciudad, como los dos publicados. Se queda igual.
- (b) El T&C nombra la zona, y el formulario pregunta cuál.
- (c) El T&C lista las tiendas una por una, como el Cashback Multitienda.

**Qué pasa con la herramienta.** Con (a) no se toca nada. Con (b) entra una
pregunta nueva de texto libre y cambia la cláusula 5. Con (c) entra una lista
repetible, como la del Multitienda, y cambia la cláusula 5 y la de territorio.
(b) y (c) son pantalla nueva, no un reemplazo de texto.

**Quién decide.** Tú, y conviene saber cómo se anuncia la campaña de verdad.

---

## D2. "Consumo en el local": la pregunta se entiende de dos maneras

**Qué hay que decidir.** Qué pregunta es "solo consumo en el local".

**Por qué existe la duda.** Son dos cosas distintas:

- **Cómo se pide** (la lectura del encargo): si el beneficio se gana en
  cualquier pedido, solo pidiendo por Turbo, o solo consumiendo en el local.
- **Qué tiendas participan** (tu lectura): y anotaste que en el cashback eso ya
  viene implícito con el nombre de la tienda.

Una tienda puede participar y aun así excluir los pedidos a domicilio, así que
no son la misma pregunta.

**Opciones.** (a) Es cómo se pide. (b) Es qué tiendas participan. (c) Se quita.

**Qué pasa con la herramienta.** Hoy la opción está **oculta** para todo el
mundo, porque depende de un dato que falta: el nombre exacto con el que la app
de Colombia muestra esa modalidad. Con (a) las condiciones pasan de casillas a
una sola elección y hay que tener ese nombre, porque el texto lo cita entre
comillas. Con (b) la pregunta desaparece y se resuelve con la tienda. Con (c) se
borra y ya.

**Quién decide.** Tú. Y el nombre de la modalidad lo tiene que dar Producto o
quien mire la app.

---

## D3. El valor del premio en la Carrera de Compras

**Qué hay que decidir.** Si entra una pregunta por el valor del premio.

**Por qué existe la duda.** La respuesta del encargo trae la pregunta y las dos
frases nuevas de la cláusula de premio, listas. Pero los textos dicen "pesos
M/Cte." y "IVA", que son de Colombia.

**Opciones.**

- (a) Se construye solo para Colombia, y Carrera se queda en Colombia.
- (b) Se escriben las frases con el nombre de la moneda y el impuesto de cada
  país, y sirve para todos.
- (c) No se construye.

**Qué pasa con la herramienta.** Hoy Carrera de Compras solo está habilitada en
Colombia, así que (a) no rompe nada hoy y rompería el día que se habilite en
otro país. (b) cuesta más y aguanta. (c) deja el premio sin valor declarado, que
es lo que hay hoy.

**Quién decide.** Tú.

---

## D4. Los productos participantes con nombre y código de barras

**Qué hay que decidir.** Si la lista de productos de la Carrera pasa de un campo
de texto libre a filas con nombre y EAN.

**Por qué existe la duda.** Hoy el comercial escribe los productos en un campo
libre. La propuesta es una tabla con nombre y código de barras, con validación
del dígito de control, que cambia también la cláusula de productos
participantes.

**Opciones.** (a) Construirlo. (b) Dejarlo.

**Qué pasa con la herramienta.** Con (a) el documento nombra los productos sin
ambigüedad y el comercial no puede escribir cualquier cosa, pero es una pantalla
nueva con validación, del tamaño de la lista de tiendas del Multitienda. Con (b)
sigue siendo texto libre, que es uno de los pocos que quedan.

**Quién decide.** Tú.

---

## D5. Las secciones donde los Créditos no aplican

**Qué hay que decidir.** Si el documento dice expresamente dónde **no** se
pueden gastar los Créditos.

**Por qué existe la duda.** Tú confirmaste que estos Créditos casi nunca aplican
a RappiFavor, Cajero ATM ni Rappi Travel. Hoy eso está dicho en la ayuda del
formulario, no en el documento: el texto legal dice "cualquier sección de la
Plataforma Rappi habilitada para el uso de Créditos".

**Opciones.**

- (a) Casillas nuevas (Rappi Travel, SOAT, Cajero ATM, Rappi Favor), marcadas de
  entrada, y una frase de exclusión en la cláusula de redención.
- (b) Dejarlo en la ayuda.

**Qué pasa con la herramienta.** Con (a) el usuario se entera leyendo el T&C, y
no cuando intenta gastar. Con (b) queda una diferencia entre lo que el documento
promete y lo que la app deja hacer, que es un reclamo esperando a pasar.

**Quién decide.** Tú.

---

## D6. Un filtro antes de la lista de T&C generales

**Qué hay que decidir.** Si antes de darle el enlace de un T&C general se le
hacen seis preguntas de sí o no al comercial.

**Por qué existe la duda.** Hoy el comercial que va a hacer un descuento entra a
la lista de los 15 T&C publicados y copia el enlace. Nadie revisa si su campaña
de verdad cabe en ese documento. Las seis preguntas y sus textos ya están
escritos en la respuesta del encargo.

**Opciones.** (a) Construirlo. (b) Dejarlo.

**Qué pasa con la herramienta.** Con (a) el comercial cuya campaña no cabe en el
general se entera antes de publicar, y la pantalla final agrega la frase "Tu
pieza debe decir siempre: el mínimo de compra, si lo hay; el máximo de descuento
o de cashback; y a qué usuarios aplica, si no es para todos." Con (b), alguien
publica una campaña bajo un T&C general que no la cubre, y nadie se entera.

**Quién decide.** Tú.

---

## D7. La marca del aliado, obligatoria en Rappi Travel

**Qué hay que decidir.** Si "¿De qué marca son los productos?" pasa a ser
obligatoria en las campañas de Rappi Travel.

**Por qué existe la duda.** Hoy es opcional, y cuando se deja vacía el nombre de
la campaña queda con la razón social adentro: "OPERADOR DE PRUEBA S.A.S. · 50%
CASHBACK TRAVEL · 15 OCT 2026". Ese nombre va en el título del documento y, en
la Carrera, dentro de una cláusula.

**Opciones.**

- (a) La marca pasa a obligatoria. El nombre nunca empieza con una razón social.
- (b) Cuando no hay marca, el nombre empieza con "Rappi Travel".
- (c) Se queda.

**Qué pasa con la herramienta.** (a) y (b) son un cambio del formulario y de la
regla del nombre, no un texto legal. Con (b) hay un riesgo: el título se leería
como si Rappi Travel fuera quien hace la campaña, y eso choca con la regla 1.
Por eso la recomendación del encargo es (a).

**Quién decide.** Tú. Confírmalo y se hace.

---

## D8. Rappi Travel: cuatro decisiones de cláusula que siguen abiertas

**Qué hay que decidir.** Cuatro frases del modelo de Rappi Travel.

**Por qué existe la duda.** Son cuatro puntos sueltos que vienen del modelo
base y nadie ha cerrado:

- **La base de cálculo.** Si los impuestos y las tasas de la tarifa cuentan para
  el cashback. Hoy dice "el valor pagado con dinero real por la tarifa o la
  reserva", sin pronunciarse.
- **La vigencia mínima de los Créditos.** Menos de cinco días muestra un aviso y
  no bloquea. ¿Debería bloquear?
- **El nombre de la sección de Créditos en la app.** El documento dice "Cuenta"
  y "Créditos". El modelo de junio decía "Promos y Créditos".
- **Los pagos con Créditos en los descuentos.** La frase que excluye las órdenes
  pagadas con Créditos viene de los cashback y hoy también sale en los
  descuentos. ¿Se queda?

**Qué pasa con la herramienta.** Las cuatro son cambios de una frase o de una
validación, ninguna es pantalla nueva. Mientras no se decidan, el documento de
Travel sale como está hoy.

**Quién decide.** Tú.

---

# E. Se lo tienes que pedir a otra persona

## E1. Legal Brasil: un solo mensaje con cinco cosas

**A quién.** Amannda Moreira, o quien ella indique.

**Qué pedirle.** El mensaje está redactado en la respuesta del encargo 01,
decisión 24. Pide confirmar cinco cosas:

1. **La excepción del organizador.** Los cuatro T&C aprobados están escritos con
   Rappi como quien concede, modifica y cancela la promoción, sin nombrar a un
   organizador distinto. Eso choca con la regla número uno del proyecto. Tú lo
   autorizaste como excepción el 17 de septiembre; falta que Brasil lo ratifique.
2. **El tope del frete grátis.** Que la app cobra el excedente y no quita el
   beneficio entero. Ya decidiste que se queda así; el texto alternativo está
   escrito por si Brasil dice lo contrario.
3. **Las correcciones de redacción** del anexo.
4. **Si quieren la frase de datos personales** en el cierre.
5. **La hora de inicio y cómo se escribe el límite de pedidos** (punto B3).

**Qué pasa mientras tanto.** Brasil genera y publica desde el 18 de septiembre,
sin aviso en pantalla. La excepción vive solo de tu autorización.

---

## E2. Legal Brasil o un KAM de Brasil: leer la interfaz en portugués

**A quién.** Amannda Moreira y un KAM de Brasil.

**Qué pedirle.** Que lean los textos del formulario en portugués, en este orden:
las cuatro opciones de "O que o usuário ganha?", la ayuda del tope del frete
grátis, la del mínimo de compra y los mensajes de error.

**Por qué importa.** La traducción de la interfaz la escribí yo y es de
producto, no de Legal: ninguna cláusula se tradujo, el documento sigue saliendo
de los modelos. Pero una ayuda mal traducida induce una respuesta equivocada, y
esa respuesta sí sale impresa.

**Qué pasa mientras tanto.** Los KAM de Brasil usan un formulario que nadie de
Brasil ha leído.

---

## E3. Legal Colombia: las descripciones de los dos cupones

**A quién.** Legal Colombia.

**Qué pedirle.** El "beneficio ofrecido" y la descripción de dos de los quince
T&C generales: "Cupon de descuento - Valor fijo" y "Cupon de descuento - Toda la
tienda". Llegaron vacíos en el Excel de 2026.

**Qué pasa mientras tanto.** En la pantalla de los T&C publicados esos dos
aparecen con un aviso que dice que Legal no explicó para qué sirven. Cupones es
de lo que más se pide, así que el comercial los ve y no sabe cuál elegir. Las
cuatro frases propuestas están escritas en la respuesta del encargo 01,
decisión 46, y se aplican tal cual el día que Legal CO las apruebe.

---

## E4. Squarespace: cuatro cosas que no son del repositorio

**A quién.** Quien publica en Squarespace.

**Qué pedirle.**

1. **El enlace duplicado.** "Descuento en Productos Seleccionados" está dos
   veces con enlaces distintos. La herramienta ya ofrece solo
   `/colombia/2026/descuentoprodselecc`. El otro, `/colombia/descuentosenprod`,
   sigue publicado: si dice lo mismo, un redirect 301.
2. **Republicar los cupones de membresía Pro y Black** en la ruta de 2026. Hoy
   su vigencia dice 2026 y su enlace apunta a `/colombia/2024/`.
3. **El encabezado del general de cashback de 2025**, que se queda publicado:
   "Estos Términos y Condiciones no aplican a campañas iniciadas a partir del 1
   de enero de 2026. Cada campaña de cashback vigente tiene sus propios Términos
   y Condiciones, publicados en su propio enlace."
4. **Abrir los quince enlaces** y confirmar que la página existe. Están
   verificados contra el Excel letra por letra, pero nadie les ha dado clic:
   este entorno no puede abrir `promos.rappi.com`.

**Qué pasa mientras tanto.** Un comercial puede pegar en una pieza un enlace que
no abre.

---

## E5. Renovar el certificado del RNT de Travel Moustache

**A quién.** Tú, con quien maneje el Drive de Travel.

**Qué pedirle.** Reemplazar en el Drive la copia vencida del Registro Nacional
de Turismo por la renovada, y poner un recordatorio en febrero de 2027.

**Por qué importa.** El RNT vence el **31 de marzo de 2027**. Ese día la
herramienta deja de generar documentos de Rappi Travel, sola y sin avisar antes:
la validación exige RNT vigente y es lo correcto, porque un T&C de agencia de
viajes sin RNT vigente no cumple la ley 300 de 1996.

---

## E6. El general de la Tarifa de Servicio Gratis vence el 31 de octubre

**A quién.** Legal Colombia.

**Qué pedirle.** Si se renueva, la versión nueva antes del 1 de noviembre de
2026. Los otros catorce vencen el 31 de diciembre.

**Qué pasa mientras tanto.** El 1 de noviembre esa tarjeta se queda a la vista,
deshabilitada, diciendo cuándo venció y a quién escribirle. El 2 de enero pasa
lo mismo con los otros catorce: ningún comercial de descuentos va a tener enlace
hasta que se actualice el archivo.

---

## E7. Dos enlaces sueltos que alguien tiene que abrir

**A quién.** Cualquiera con acceso.

**Qué pedirle.**

1. **México:** confirmar que el enlace de los T&C de Créditos abre. La dirección
   guardada dice `terminos-ycondiciones`, sin espacio ni guion entre las dos
   palabras, y se ve como una errata. Sale impreso en cada T&C mexicano.
2. **El documento madre de la Plataforma:** la versión publicada en
   about.rappi.com todavía define los Créditos como los de la sección "Promos y
   Créditos". Si la app ya dice "Cuenta" y "Créditos", el desactualizado es ese
   documento, no el nuestro, y hay que avisarle a su dueño.

**Qué pasa mientras tanto.** Un usuario mexicano que le dé clic al enlace de los
Créditos puede caer en una página que no existe.

---

## E8. Chile y Costa Rica no tienen modelo de acuerdo de transferencia de datos

**A quién.** Legal de cada uno de esos dos países.

**Qué pedirle.** El modelo de acuerdo que se firma con la marca cuando el premio
lo entrega el Organizador. Los demás países sí lo tienen y la herramienta abre
el suyo con un botón.

**Qué pasa mientras tanto.** En Chile y Costa Rica el panel manda al comercial a
Legal en vez de darle el modelo. Hoy no le pasa a nadie, porque Carrera de
Compras solo está habilitada en Colombia: el día que se habilite en otro país,
esos dos quedan sin camino.

---

# F. Se puede vivir sin resolver

## F1. Una coma

El circuito de Colombia del acuerdo de datos dice, en su último paso: cambia tu
respuesta a "Rappi, como operador logístico". La opción del formulario se llama
"Rappi como operador logístico", sin la coma. **Opciones:** cede el texto legal,
o cede la opción del formulario. **Con la herramienta:** hoy el comercial busca
una opción que se llama casi igual y la encuentra igual. No se tocó el texto
legal por una coma. **Decide:** tú.

---

## F2. Los nombres de los países no se traducen

En la interfaz en portugués la lista de países dice "Ecuador" y no "Equador",
"Perú" y no "Peru". Salen de la columna `nombre` de la pestaña Paises, que es
una sola por país. **Con la herramienta:** habría que tener un nombre por
idioma, o traducirlos en la interfaz. No toca texto legal. **Decide:** tú, y es
menor.

---

## F3. Dos nombres con guion en la lista de T&C generales

"Cupon de descuento - Valor fijo" y "Cupon de descuento - Toda la tienda" son
los únicos textos visibles de toda la herramienta con un guion como signo de
puntuación, que es lo que la regla 8 del proyecto no deja hacer. Están copiados
tal cual del Excel de Legal. **Opciones:** se quedan si ese es el nombre oficial
de la pieza; si no, "Cupón de descuento: valor fijo". Ojo que el encargo de la
interfaz propone otra redacción para los mismos dos ("Cupón de descuento de
valor fijo"): hay que elegir una. **Decide:** tú.

---

## F4. Las diez correcciones de ortografía del archivo de T&C generales

El archivo `data/tyc_genericos.json` es la lista de Legal transcrita como llegó,
con sus erratas a la vista y no "arregladas". Hay diez líneas propuestas, en
tres grupos, y se pueden aprobar por grupo:

- **Solo tildes y mayúsculas:** "envio" a "envío", "suscripcion" a
  "suscripción", "miembros rappi pro" a "miembros Rappi Pro", "Codigo" a
  "Código", "Cupon" a "Cupón".
- **Cambian el nombre que se ve en la lista:** los dos cupones del punto F3, más
  "Tarifa de servicio $0 (Service Fee OFF)" a "Tarifa de servicio en $0".
- **Reescriben las palabras de Legal:** el "beneficio" del T&C del canal de
  venta externo y el "para qué sirve" del de precio tachado.

**Con la herramienta:** es texto de pantalla, no de documento. El primer grupo no
cambia lo que dice nada. El tercero sí. **Decide:** tú, grupo por grupo.

---

## F5. Cosas menores de Rappi Travel

Tres, juntas porque cada una es una línea:

- **El ámbito habla de vuelos aunque no haya vuelos.** En una campaña solo de
  hoteles, la frase "Aplica únicamente para vuelos con origen y destino en..."
  sobra. Ya hay un mecanismo que la acorta cuando no hay duda ("solo vuelos" y
  "sin vuelos"); los casos intermedios se quedan con la frase larga.
- **El conteo por trayecto.** La opción existe en el formulario y falta
  confirmar que alguna campaña la use de verdad.
- **El ejemplo del tope y el descuento variable.** Los dos son textos nuevos que
  salieron del criterio de transparencia y esperan tu visto bueno.

**Decide:** tú.

---

## F6. La quinta pregunta del filtro de Rappi Travel

El encargo de la interfaz propuso acortarla, pero solo funciona si los ejemplos
("noches o niños gratis, cupones, millas, eSIM, bonos o cuotas sin interés") se
mudan a una línea de ayuda debajo, y ese filtro no tiene campo de ayuda.
**Opciones:** se construye el campo de ayuda y entonces se acorta, o se deja
larga. **Con la herramienta:** aplicarla sola habría borrado los ejemplos sin
dejarlos en ninguna parte. Las otras siete preguntas del filtro sí se
acortaron. **Decide:** tú.

---

## F7. Un botón en portugués que quedó descuadrado

En la pantalla final, el botón pasó de "Ver mi historial" a "Ver mis campañas"
para que coincidiera con la pantalla que abre. En portugués sigue diciendo "Ver
o meu histórico" y la pantalla se llama "Minhas campanhas": el mismo descuadre
que se acaba de corregir en español. La traducción que cuadraría es "Ver as
minhas campanhas", pero no la escribo yo. **Decide:** tú, o quien lea la
interfaz en portugués (punto E2).

---

## F8. Los 25 cambios de recorrido del encargo de la interfaz

No son reemplazos de texto: son comportamiento. Ordenar la Ayuda de otra manera,
que Turbo y consumo en el local no se puedan marcar a la vez, que el contador de
preguntas cuente bien, un botón de "Cambiar mi respuesta" en la pantalla de
Legal, que las tres preguntas premarcadas arranquen sin marcar, que "Ahora dice"
muestre las fechas en palabras, partir en dos la sexta pregunta del filtro de
Travel.

**Con la herramienta:** son de otro tamaño y van en su propia sesión. **Decide:**
tú, cuáles entran y en qué orden.

---

# G. Cerrado

No vuelve a aparecer como pregunta abierta.

| Qué | Cómo quedó | Cuándo |
|---|---|---|
| Rappi Travel: la política de datos | "la política de privacidad", travel.rappi.com.co/private-policy | 16 sep |
| Rappi Travel: cancelaciones | Aprobada la propuesta adicional | 16 sep |
| Rappi Travel: responsabilidad | Se queda la de hoy. **Riesgo aceptado** | 18 sep |
| El nombre de la campaña | Se calcula, no se escribe | 16 sep |
| Brasil: el organizador | Excepción explícita, solo para Brasil | 17 sep |
| Brasil: el tope del frete grátis | Se queda, con el excedente a cargo del Usuário | 18 sep |
| Cashback Multitienda: el máximo de pedidos | Por cada tienda participante | 18 sep |
| Las catorce leyendas con propuesta | Aprobadas las catorce | 18 sep |
| El enlace corto | No hay enlace corto: el enlace es uno solo | 18 sep |
| La frase de los Créditos en Carrera | Aprobada, y la pregunta de quién entrega desaparece con Créditos | 18 sep |
| El visto bueno del abogado de cada país | No se corre ese circuito | 18 sep |
| Seis países salen de piloto | MX, PE, AR, CL, UY y BR, activos | 18 sep |
| El canal de Legal | Es #tyc-rappi | 18 sep |

**Riesgo aceptado, escrito para que quede constancia.** La cláusula de
responsabilidad de Rappi Travel se queda como está. El argumento en contra:
con Rappi Travel calificada por Supertransporte como proveedor indirecto con
responsabilidad solidaria, una exclusión general de responsabilidad por la
prestación del servicio cae en el artículo 43, numeral 1, de la Ley 1480, es
ineficaz de pleno derecho y sirve como prueba en una investigación. La
redacción alternativa está escrita completa en la respuesta del encargo 01,
por si algún día se retoma.
