# Lo que depende de Juan

Actualizado el 20 de septiembre de 2026, al aplicar las decisiones del issue #2.

Este es el documento de trabajo: **lo que sigue pendiente**. Lo decidido pasó al
bloque G con su fecha y no vuelve a aparecer como pregunta.
`docs/PENDIENTES_LEGAL.md` se queda como historia: ahí está cómo llegó cada cosa.

El 20 de septiembre se cerraron **31 de los 41 puntos**. Quedan **diez
preguntas abiertas** y **un bloque de tareas de ejecución** que ya no dependen
de ninguna decisión: alguien tiene que hacerlas fuera del repositorio.

## Cómo está armado

Cada punto dice cuatro cosas, siempre en el mismo orden:

1. **Qué hay que decidir.**
2. **Por qué existe la duda.**
3. **Las opciones.**
4. **Qué pasa con la herramienta con cada una.** Es el que importa para decidir.

Y al final de cada punto, **quién decide**: tú solo, o tú después de preguntarle
a alguien concreto.

Los bloques van **de lo que más desbloquea a lo que menos**:

- **B.** Ya sale impreso y nadie lo ha confirmado.
- **C.** La pieza publicitaria.
- **D.** Producto: abre un camino que hoy no existe.
- **E.** Se lo tienes que pedir a otra persona.
- **H.** Tareas de ejecución fuera del repositorio. Sin decisión pendiente.
- **G.** Cerrado, con su fecha. No vuelve a aparecer como pregunta.

El bloque A se vació el 20 de septiembre: ya no queda nada que impida generar un
documento ni usar un país.

Todo lo que un punto necesita está escrito adentro: las cláusulas van copiadas,
las pantallas descritas. No hace falta abrir el repositorio.

---

# B. Ya sale impreso y nadie lo ha confirmado

> **Nota del 20 de septiembre de 2026.** Este punto se intentó aplicar y no se
> pudo: **los cuatro T&C aprobados por Legal Brasil no están en el repositorio**.
> Se buscó en `docs/`, `docs/encargos/`, `docs/referencia/`, `modelos/`, `data/`
> y `pruebas/`. Lo que hay es `docs/MODELO_BASE_BRASIL.md`, que describe qué
> traen, y `docs/CORRECCIONES_BRASIL.md`, que copia el antes y el después de cada
> corrección; los documentos completos, no. Sin ellos no se puede comparar nada.
> **Lo que falta:** que alguien suba los cuatro documentos al repositorio, o los
> pegue en una conversación.

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

---

> **Nota del 20 de septiembre de 2026.** Saltado por la misma razón que el B2:
> tu instrucción decía que si los cuatro aprobados no estaban, se saltaran los
> dos. `docs/MODELO_BASE_BRASIL.md` dice que los cuatro arrancan a las `00:01`,
> pero eso es el análisis, no el documento, y el límite de pedidos no lo dice.
> **Lo que falta:** lo mismo que el B2, o que confirmes tú las dos cosas sin
> ellos.

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

---

# C. La pieza publicitaria

> **Nota del 20 de septiembre de 2026.** De las tres frases, **dos ya están
> escritas y aplicadas** (punto C3 del bloque G): la de los Créditos por
> secciones y la del ganador por número de pedidos. Queda **solo la tercera**, la
> de consumo en el local, que depende del punto D2: el nombre exacto con el que
> la app de Colombia muestra hoy esa modalidad. Mientras falte, esa opción no se
> ofrece en el formulario, así que hoy no deja a nadie sin leyenda.

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

---

> **Nota del 20 de septiembre de 2026.** Las tres que más cambian el diseño
> quedaron contestadas (punto C5 del bloque G). Quedan **las otras veintiuna**.

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

---

# D. Producto: abre un camino que hoy no existe

> **Nota del 20 de septiembre de 2026.** Elegiste la opción (c), con la cláusula
> escrita y la lista repetible de tiendas. **No se construyó**: abre pantalla
> nueva, con el patrón de la lista de tiendas del Multitienda, así que va en su
> propia sesión. Tu texto está guardado y entra tal cual el día que lo digas.

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

---

> **Nota del 20 de septiembre de 2026.** Decidiste que entra, con los textos de
> la decisión 36 (ii) y con la guarda de que la pregunta solo aparece en Colombia
> y con premio físico. **No se aplicó por un texto roto**, no por tamaño: la
> frase del caso de **varios ganadores** está corrompida en
> `docs/encargos/respuestas/01-legal.md`. El renderizado la convirtió en fórmula
> matemática y perdió los espacios. La de un ganador sí está entera.
>
> La de un ganador, tal como está guardada:
>
> > El ganador recibirá el siguiente premio: {descripción}, con un valor
> > comercial de {valor en letras} pesos M/Cte. (${valor}), IVA incluido.
>
> La de varios, tal como quedó rota, reconstruida quitando el formato y
> volviendo a poner los espacios. **No la apliqué: confírmamela o corrígela.**
>
> > Cada ganador recibirá el siguiente premio: {descripción}, con un valor
> > comercial unitario de {valor en letras} pesos M/Cte. (${valor}), IVA
> > incluido. El valor comercial total de los premios de la Campaña es de {total
> > en letras} pesos M/Cte. (${total}).

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

---

> **Nota del 20 de septiembre de 2026.** Decidiste que entra, con los textos de
> la decisión 36 (iii) y con la última frase escrita por ti. **No se construyó**:
> es pantalla nueva, con filas que crecen y validación del dígito de control del
> EAN, así que va en su propia sesión. Tus textos están guardados.

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

---

> **Nota del 20 de septiembre de 2026.** Decidiste que entra, con los textos de
> la decisión 49 y la frase nueva de la pantalla final. **No se construyó**: es
> una bifurcación entera nueva, con seis preguntas, tres salidas distintas y una
> subpregunta de tres opciones, así que va en su propia sesión. Tus textos están
> guardados.

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

---

# E. Se lo tienes que pedir a otra persona

> **Nota del 20 de septiembre de 2026.** Es el único punto del issue que quedó
> sin contestar. Sigue como estaba.

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

---

# F. Se puede vivir sin resolver

> **Nota del 20 de septiembre de 2026.** Entraron dos de los veinticinco (punto
> F8 del bloque G): las tres preguntas premarcadas arrancan sin respuesta
> marcada, y la pantalla de Legal tiene "Cambiar mi respuesta". Uno más,
> "que Turbo y consumo en el local no se puedan marcar a la vez", quedó resuelto
> de paso por el punto D2: ya no son casillas. **Quedan veintidós**, con su
> tamaño y el orden que propongo:
>
> **Pequeños, una sesión los tres juntos.** Que el contador de preguntas cuente
> la que aparece según la respuesta. Que "Ahora dice" muestre las fechas en
> palabras. El aviso de tiempo estimado en el ETA, que ya quedó resuelto por el
> punto C5.
>
> **Medianos, uno por sesión.** Partir en dos la sexta pregunta del filtro de
> Travel. Ordenar la pantalla de Ayuda de otra manera. Subir el atajo a los T&C
> publicados por encima de los cuatro tipos y agregar "Mi campaña no es ninguna
> de estas". Que la calculadora del tope muestre también un pedido grande. No
> preguntar el negocio en países sin tipos de Travel.
>
> **Grandes, sesión propia cada uno.** "¿Quién puede publicar?" con el botón que
> arma el mensaje y los diez pasos de Squarespace plegados. El campo de ayuda del
> filtro de Travel, que es lo que hace falta para el punto F6.
>
> **Y los cambios de texto sueltos**, que son un rato: los de las pantallas 1, 2,
> 7, 8, 9, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21 y 22 del encargo de la
> interfaz. Esos no cambian comportamiento y se pueden aplicar todos de una.

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

---

# H. Tareas de ejecución, fuera del repositorio

No hay nada que decidir en este bloque: ya está decidido. Son cosas que alguien
tiene que hacer en Squarespace, en Drive o con Legal de un país, y que el
repositorio no puede hacer solo. Cada una dice qué pasa mientras no se haga.

## H1. Squarespace: cuatro cosas

1. **El enlace duplicado.** `/colombia/descuentosenprod` sigue publicado y la
   herramienta ofrece solo `/colombia/2026/descuentoprodselecc`. Si dicen lo
   mismo, un redirect 301 del viejo al de 2026. Si no dicen lo mismo, se deja
   quieto con aviso de vigencia. **Mientras tanto:** puede haber piezas vivas
   apuntando a una dirección que nadie mantiene.
2. **Republicar los cupones de membresía Pro y Black** en una ruta de 2026. Hoy
   su vigencia dice 2026 y su enlace apunta a `/colombia/2024/`. **Mientras
   tanto:** la herramienta lo ofrece con un aviso que dice justo eso, y el
   comercial tiene que confirmarlo con Legal antes de publicar la pieza.
3. **El encabezado del general de cashback de 2025**, que se queda publicado:
   "Estos Términos y Condiciones no aplican a campañas iniciadas a partir del 1
   de enero de 2026. Cada campaña de cashback vigente tiene sus propios Términos
   y Condiciones, publicados en su propio enlace." **Mientras tanto:** un usuario
   de 2026 puede invocarlo si le conviene más.
4. **Ampliar la vigencia de "Tarifa de Servicio Gratis" hasta el 31 de diciembre
   de 2026**, antes del 31 de octubre, que es cuando vence. **Mientras tanto:**
   el 1 de noviembre esa tarjeta se queda a la vista, deshabilitada, diciendo
   cuándo venció y a quién escribirle.

**Ojo con el orden.** La fecha de vencimiento de la herramienta
(`data/tyc_genericos.json`) **no se cambia hasta que la página esté
republicada**: si se cambia antes, la herramienta entregaría como vigente un
enlace que su propio texto dice vencido.

## H2. Drive: el acceso a los modelos de acuerdo

Dar acceso de lectura a los modelos de acuerdo de transferencia de datos a quien
use la herramienta. En el hilo, dos personas no pudieron abrir la carpeta.

**Mientras tanto:** el botón "Abrir el modelo de acuerdo" sigue ahí, y debajo la
línea que le dice al comercial qué hacer si Google no lo deja entrar (punto A5,
aplicado el 20 de septiembre).

## H3. El RNT de Travel Moustache

Reemplazar en el Drive la copia vencida del Registro Nacional de Turismo por la
renovada, y poner un recordatorio en febrero de 2027.

**Por qué importa:** el RNT vence el **31 de marzo de 2027**. Ese día la
herramienta deja de generar documentos de Rappi Travel, sola y sin avisar antes,
porque la validación exige RNT vigente y es lo correcto: un T&C de agencia de
viajes sin RNT vigente no cumple la ley 300 de 1996.

## H4. El enlace de los Créditos de México

Se queda como está. La dirección guardada dice `terminos-ycondiciones`, sin
espacio ni guion entre las dos palabras, y se ve como una errata, pero nadie ha
confirmado que no abra. **Mientras tanto:** si alguien confirma que no abre, se
corrige; si abre, esa es la dirección real y no hay nada que hacer.

## H5. Chile y Costa Rica no tienen modelo de acuerdo de transferencia de datos

Los demás países sí lo tienen y la herramienta abre el suyo con un botón.
**Consecuencia, ya decidida:** Carrera de Compras no se habilita en Chile ni en
Costa Rica hasta que ese modelo exista. Hoy no le pasa a nadie, porque Carrera
solo está habilitada en Colombia.

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
| **A1.** Las secciones de la app fuera de Colombia | Son las mismas en todos los países: una sola lista común. Se quita el bloqueo | 20 sep |
| **A2.** Ecuador y Costa Rica | Salen de piloto. Ecuador con coma, Costa Rica con punto. No queda ningún país en pruebas | 20 sep |
| **A3.** Los datos de Brasil en la hoja | Se vuelven a escribir con una confirmación nueva, sin cambiar ningún valor | 20 sep |
| **A4.** "Dentro de los un (1) día hábil siguientes" | Pasa a "dentro de un plazo de {plazo} a partir de la notificación" | 20 sep |
| **A5.** El acceso a la carpeta de Drive | El botón se queda, y debajo va qué hacer si Google no deja entrar | 20 sep |
| **B1.** Los países sin caso dorado | Entran PE01, AR01, CL01, UY01 y CR01, más la tabla de los 18 valores por país | 20 sep |
| **B4.** El ETA cambiaba de persona | Su cláusula del beneficio tutea, como el resto del documento | 20 sep |
| **B5.** "Pedido" y "orden" en el ETA | **Se queda.** Conviven en todos los modelos: cambiarlo solo en el ETA no arregla nada | 20 sep |
| **B6.** Chile y "las autoridades competentes" | **Se queda hoy.** La regla para el día que cambie está escrita abajo | 20 sep |
| **B7.** La autoridad de consumo de Argentina | "la Dirección Nacional de Defensa del Consumidor y Arbitraje del Consumo, o la autoridad que haga sus veces" | 20 sep |
| **C1.** El banner corto que no cabe | **No se sube ningún límite ni se recorta nada.** Cambia la pantalla, que ahora dice qué hacer | 20 sep |
| **C2.** El enlace en push y SMS | La leyenda sale sin enlace, y la pantalla dice por qué | 20 sep |
| **C3.** Dos de las tres frases que faltaban | Escritas y aplicadas: las secciones y el ganador por número de pedidos | 20 sep |
| **C4.** Las leyendas de campaña fuera de Colombia | Las del cashback sirven en MX, PE, AR, CL, EC, UY y CR. En Perú, con el presupuesto en el anuncio | 20 sep |
| **C5.** Tres de las 24 preguntas del encargo | Cerradas la 21, la 16 y la 6. La 6 tiene efecto: el aviso de tiempo estimado sale del ETA | 20 sep |
| **D2.** "Consumo en el local" | Es cómo se pide. Las condiciones pasan de casillas a una sola elección | 20 sep |
| **D5.** Las secciones donde los Créditos no aplican | Casillas marcadas de entrada, y el documento las nombra entre comillas | 20 sep |
| **D7.** La marca del aliado en Rappi Travel | Obligatoria. El nombre de la campaña nunca empieza con una razón social | 20 sep |
| **D8.** Las cuatro de Rappi Travel | Base de cálculo: ya resuelta por la decisión 22. Vigencia mínima: avisa y no bloquea. Sección de Créditos: se queda. Pagos con Créditos: salen del descuento, se quedan en el cashback | 20 sep |
| **E1.** El mensaje a Legal Brasil | **No se manda.** La excepción del organizador vive de tu autorización del 17 de septiembre y la ratifican los abogados de Brasil cuando prueben la herramienta | 20 sep |
| **E3.** Las descripciones de los dos cupones | Aplicadas las cuatro frases de la decisión 46 | 20 sep |
| **F1.** La coma del operador logístico | La etiqueta dice "Rappi, como operador logístico", con coma | 20 sep |
| **F2.** Los nombres de los países en portugués | Colômbia, Peru, Equador y Uruguai, solo en la pantalla | 20 sep |
| **F3.** Los dos nombres con guion | "Cupón de descuento de valor fijo" y "Cupón de descuento en toda la tienda" | 20 sep |
| **F4.** Las diez correcciones de ortografía | Aplicadas las diez, los tres grupos | 20 sep |
| **F5.** Las tres menores de Rappi Travel | **Se quedan** | 20 sep |
| **F6.** La quinta pregunta del filtro de Travel | **Se queda larga.** Acortarla necesita el campo de ayuda, que está en el F8 | 20 sep |
| **F7.** El botón en portugués | "Ver minhas campanhas", como la pantalla que abre | 20 sep |
| **F8.** Dos de los 25 cambios de recorrido | Las tres preguntas premarcadas arrancan sin marcar, y la pantalla de Legal deja cambiar la respuesta | 20 sep |

**Riesgo aceptado, escrito para que quede constancia.** La cláusula de
responsabilidad de Rappi Travel se queda como está. El argumento en contra:
con Rappi Travel calificada por Supertransporte como proveedor indirecto con
responsabilidad solidaria, una exclusión general de responsabilidad por la
prestación del servicio cae en el artículo 43, numeral 1, de la Ley 1480, es
ineficaz de pleno derecho y sirve como prueba en una investigación. La
redacción alternativa está escrita completa en la respuesta del encargo 01,
por si algún día se retoma.

**La regla de Chile, para el día que haga falta.** `CL.autoridad_datos` pasa de
"las autoridades competentes" a "la Agencia de Protección de Datos Personales"
**solo si la Ley 21.719 entra en vigencia**. El Gobierno radicó el 31 de agosto
de 2026 un proyecto para correr esa fecha al 1 de diciembre de 2027, y la
Agencia sigue sin Consejo Directivo, así que la fecha del 1 de diciembre de 2026
puede no llegar. El cambio se hace a mano ese día, y solo si la fecha se
mantiene. Mientras tanto, "las autoridades competentes" no es incorrecto: la
agencia no existe.

**La excepción de Brasil, y lo que sigue en pie.** Los cuatro T&C aprobados de
Brasil están escritos con Rappi como quien concede, modifica y cancela la
promoción, y no nombran a un organizador distinto. Eso choca con la regla número
uno del proyecto y vive de tu autorización explícita del 17 de septiembre de
2026, que no se extiende a ningún otro país ni sirve de precedente. Los abogados
de Brasil la ratifican cuando prueben la herramienta. Siguen en pie la decisión
1 del encargo 01 (`promocao_br` sin cláusula de datos personales, y
`BR.texto_derechos_datos` vacío a propósito) y la decisión 25 (las siete
correcciones de redacción del anexo).
