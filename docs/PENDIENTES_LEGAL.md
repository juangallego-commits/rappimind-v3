# Pendientes de revisión legal (punto de control A)

Revisar con los textos de `pruebas/salidas_esperadas/`.

El motor ya reproduce esos textos exactamente. Para verlos salir del motor y no
del archivo: `npm run previsualizar CB01` (o CB02, CC01, CD01, MX01). Al
implementar la sección 5 no apareció ningún error en los textos de Legal: todo
lo que hay que confirmar es lo que ya está en esta lista.

## Cashback: cambios frente al modelo aprobado de julio
1. El rol de Rappi pasó a la cláusula 1 (antes estaba al final), para que "Rappi" quede definido antes de usarse.
2. Se agregó la frase: los términos con mayúscula inicial tienen el significado de los T&C de Uso de la Plataforma.
3. La tienda queda nombrada y definida en la cláusula de Cobertura ("Jumbo MT (en adelante, la Tienda Participante)"). Antes el documento nunca decía el nombre de la tienda.
4. "Beneficio" se define en la cláusula de Mecánica y antes solo se usa en minúscula.
5. Se quitaron los asteriscos impresos y el doble punto.
6. Nueva frase opcional de compra mínima.
7. El organizador responde por "el beneficio o premio" (redacción común con Carrera).

## Textos nuevos o ajustados
1. Medios de pago: se agregó en "Todos" y "RappiCard" que los pedidos pagados con Créditos no son válidos (antes solo estaba en "excepto efectivo").
2. Segmentos nuevos: Nuevos usuarios y Usuarios reactivados (con días sin compra).
3. Condiciones opcionales: "solo Turbo" y "solo consumo en el local".
4. Nombres de las secciones para la redención (`data/secciones.json`). En las 1.184
   solicitudes reales aparece una sección **Express** que no está en el archivo, y no
   aparecen **Farmacia** ni **Tiendas especializadas**, que sí están. No toqué
   `data/`: decide tú cuál es la lista correcta. Ver `docs/HALLAZGOS_SOLICITUDES.md`.

## Carrera de Compras
El kit no tenía el .docx v2 de julio. El modelo v3 se armó desde el v1 más las decisiones de julio. Si tienes el v2, compáralo.
1. Organizador: ya no dice "(en adelante, Rappi)".
2. Productos participantes: nueva frase según tres opciones (todos, una marca, productos específicos).
3. Desempate: ahora es una oración que dice quién gana.
4. Premio: "Cada ganador recibirá…" cuando hay varios ganadores.
5. Cláusula de impuestos genérica (nueva).
6. Frase de datos para la entrega cuando entrega el Organizador (nueva).
7. Ley aplicable: igual a Cashback (se quitó la conciliación del v1).

## Cashback Day
1. El máximo de pedidos hoy aplica a toda la campaña. Confirmar si debe ser por tienda.

## Países
1. Por confirmar en las pruebas de cada país: separador de miles, término de días, texto de hora local y texto de derechos de datos.
2. Chile: autoridad de datos (la agencia nueva entra con la Ley 21.719).
3. México: confirmar que abre el link de T&C de Créditos (el enlace dice "terminos-ycondiciones").

## Fuera del alcance de v3, con demanda real
1. **Rappi Travel** es el 12% de las solicitudes (138 de 1.184) y v3 no lo cubre. Hoy
   la interfaz lo manda al formulario de Legal. Confirmar si eso es lo que quieres o
   si Travel entra en una versión siguiente.
2. Descuentos que no son cashback (porcentaje de descuento, cupones, 2x1, combos,
   obsequios) son 319 de 711 promociones y tampoco están en v3.

## De la revisión del primer T&C real generado en Apps Script (16 de septiembre)

Documento revisado: `T&C · 99% de Cashback el Corral 20/09 · Colombia · RM-20260916-0001`.
Salió limpio: cero marcadores, cero valores vacíos, cero tablas y el articulado numerado
de 1 a 20. Lo que sigue son observaciones, no cambios: los textos son de Legal.

1. **El nombre de la campaña contradice el articulado.** El título dice "99% de Cashback"
   y "20/09". La cláusula 6 dice cincuenta por ciento (50%) y la cláusula 3 fija la
   vigencia el 17 de septiembre. Con la cláusula 12 ("en caso de discrepancia se aplicará
   la condición más favorable para ti"), un título publicado que diga 99% es un riesgo
   real: es el texto que el usuario lee primero y el que queda en el buscador. Hoy el
   nombre es texto libre. La propuesta para quitarle el texto libre está en
   `docs/PROPUESTA_NOMBRE_CAMPANA.md` y necesita tu visto bueno.
2. **Acreditación inmediata y verificación previa conviven en la misma cláusula.**
   La cláusula 8 dice que los Créditos se acreditan "de manera inmediata una vez
   finalizada la orden" y, tres líneas después, que "Rappi se reserva el derecho de
   verificar la elegibilidad de cada pedido antes de acreditar el Beneficio". Si la
   verificación es previa, la acreditación no es inmediata. Con la opción "al día
   siguiente" no hay tensión. Decide si la frase de verificación debe salir cuando la
   carga es inmediata, o si el texto se deja como está.
3. **Exclusiones de la redención.** Juan confirmó que estos Créditos casi nunca aplican
   a RappiFavor, Cajero ATM ni RappiTravel. Hoy eso quedó dicho en la ayuda del
   formulario, no en el documento: el texto legal dice "cualquier sección de la
   Plataforma Rappi habilitada para el uso de Créditos". Decide si el modelo debe
   nombrar esas exclusiones de forma expresa.
4. **"Consumo en el local" frente a "la misma tienda".** En la revisión se leyó la
   condición "solo para consumo en el local" como si fuera sobre dónde se gastan los
   Créditos. No lo es: es sobre el pedido con el que el usuario se gana el beneficio,
   y el texto de Legal dice "bajo la modalidad de consumo en el local disponible en la
   Plataforma Rappi". Se reescribió la pregunta del formulario para que eso quede claro,
   sin tocar el texto legal. Si el nombre correcto de esa modalidad en la app cambió,
   avísame y lo anoto aquí.

## Del nombre estructurado de campaña (16 de septiembre, tarde)

1. **El nombre va adentro de una cláusula de la Carrera de Compras.** El modelo dice
   "la campaña promocional denominada “{{NOMBRE_CAMPANA}}”". Con el nombre nuevo queda
   "denominada “Carulla · Carrera de Compras · 5 oct 2026”", que se lee raro dentro de
   un articulado. Es correcto, porque ese es el nombre oficial de la campaña, pero si
   prefieres otra redacción para esa frase, dímelo y la anoto como cambio de modelo.
   En el Cashback el nombre solo va en el título, así que ahí no hay nada que mirar.

## Rappi Travel

Todo lo de esta sección está implementado con el texto propuesto en
`docs/MODELO_BASE_TRAVEL.md` y espera tu revisión. Las referencias R1 a R17 son las
de la sección 13 de ese documento.

### Lo que bloquea la generación hoy

1. ~~**Falta la política de datos de Rappi Travel** (R14).~~ **Resuelto por Juan el 16 de
   septiembre**: "la política de privacidad", en <https://travel.rappi.com.co/private-policy>.
   Con eso Colombia ya genera T&C de Travel.
2. **RNT y su vencimiento** (R15). Va 79000, que es lo que dicen el certificado y las
   respuestas a la SIC, y vencimiento el 31 de marzo de 2027, que es lo que dicen tus
   notas. El certificado del Drive vencía el 31 de marzo de 2026. Si el RNT está vencido,
   la herramienta tampoco genera.

### Textos nuevos que necesitan tu visto bueno

3. **Rol de Rappi Travel** (R1). La cláusula 1 dice que Travel Moustache "actúa como
   agencia de viajes que opera los Sistemas Rappi Travel", no como plataforma de
   intermediación, y trae el RNT. Es un cambio de fondo frente al bloque de delivery.
4. **Créditos sin documento madre** (R2). La cláusula 12 dice que estos Créditos se rigen
   por el propio T&C. Solo cuando la redención incluye toda la Plataforma se agrega el
   párrafo que remite a los T&C de Créditos de Rappi.
5. **Cancelaciones** (R3). Las viñetas de "Reembolso parcial" y "Plazo" son nuevas.
   **Juan aprobó el 16 de septiembre** la propuesta adicional, y ya está aplicada: si el
   Proveedor modifica la reserva y el usuario la acepta sin reembolso, conserva el
   Beneficio. Quien pierde el Beneficio es quien cancela, pide reembolso o modifica él
   mismo la reserva.
6. **Responsabilidad** (R4). **Juan decidió el 16 de septiembre dejarla tal cual** el
   modelo de junio. Queda anotada la observación de Supertransporte, que calificó a Rappi
   Travel como proveedor indirecto con responsabilidad solidaria: una exclusión general de
   responsabilidad por la prestación del servicio puede leerse como cláusula abusiva y no
   protege. La redacción alternativa sigue escrita en R4 por si algún día se retoma.
7. **Entidad de vigilancia** (R5). Va "la Superintendencia de Industria y Comercio y la
   Superintendencia de Transporte, según corresponda".
8. **Base de cálculo** (R6). Falta decidir si los impuestos y las tasas de la tarifa
   cuentan para el cashback. Hoy dice "el valor pagado con dinero real por la tarifa o la
   reserva", sin pronunciarse.
9. **Ejemplo del tope** (R7) y **descuento variable** (R8). Los dos son nuevos y salen del
   criterio de transparencia. El ejemplo del tope nació del reclamo de agosto de 2025.
10. **Conteo por trayecto** (R11). La opción existe en el formulario. Falta confirmar que
    en la práctica alguna campaña la use.
11. **Nombre de la sección de Créditos en la app** (R13). El documento dice las secciones
    "Cuenta" y "Créditos", como en delivery. El modelo de junio decía "Promos y Créditos".
12. **Pagos con Créditos en los descuentos** (R16). La frase que excluye las órdenes
    pagadas con Créditos viene de los cashback y hoy también sale en los descuentos.
    ¿Se queda?
13. **Vigencia mínima de Créditos** (R17). Menos de cinco días muestra un aviso, no
    bloquea. Dime si prefieres que bloquee.

### Lo que encontré yo al armarlo

14. **El texto del ámbito habla de vuelos incluso sin vuelos.** La frase de la sección 5
    dice "Aplica únicamente para vuelos con origen y destino en ... y para servicios que
    se presten en ...". En una campaña solo de hoteles, la primera mitad sobra y queda
    ruido en el documento. Lo dejé tal cual porque el texto es tuyo. Si quieres, lo parto
    en dos y solo sale la mitad que aplica.
15. **"Doscientos órdenes" estaba mal.** Los modelos de delivery solo hablan de pedidos y
    Créditos, que son masculinos. Travel trae órdenes, unidades y noches, que son
    femeninas. Arreglado en el motor, con su prueba. No cambia ni una letra de los
    documentos de delivery.
16. **Una frase del descuento variable quedaba partida.** Tal como está escrita en el
    modelo base, la cláusula salía así: "un descuento de entre el 5% y el 40%, según el
    Producto Participante sobre el valor de la tarifa de los Productos Participantes".
    Moví "según el Producto Participante" al final de la oración. Son exactamente las
    mismas palabras, en otro orden. Si prefieres otra redacción, dímela.
17. **El nombre de una campaña sin marca aliada queda con la razón social.** Por ejemplo
    "OPERADOR DE PRUEBA S.A.S. · 50% CASHBACK TRAVEL · 15 OCT 2026". Se lee raro con el
    "S.A.S." adentro. Si prefieres, pongo "Rappi Travel" cuando no hay marca, o hago la
    marca obligatoria.

## Brasil, de los cuatro T&C aprobados (17 de septiembre)

Documentos revisados: `Desconto % OFF`, `Frete Grátis`, `Taxa de serviço mínimo
de compra` y `Taxa de serviço e entrega grátis`. El mapa completo está en
`docs/MODELO_BASE_BRASIL.md`. No se tocó ni se tradujo una sola línea.

Cinco cosas que hay que decidir antes de armar el modelo:

1. **En los cuatro documentos, Rappi aparece como quien concede y cancela la
   promoción**, y no se nombra a ningún organizador distinto. Dicen "O Rappi se
   reserva o direito de encerrar esta promoção", "O Rappi se reserva o direito
   de modificar as condições ou cancelar esta promoção" y "O Rappi se reserva ao
   direito de cancelar a promoção". Eso choca de frente con la regla número uno
   de este proyecto, que es que Rappi nunca es el organizador y que el
   organizador es siempre la tienda o la marca que fondea. En los modelos de
   Colombia el Organizador está nombrado y definido desde la cláusula 1. **Esta
   es la decisión más importante de Brasil** y no la puedo tomar yo: o el modelo
   brasileño se alinea con la regla, o Brasil es una excepción explícita.

2. **"em caso de fraude ou desviação da doação para terceiros"**, en los cuatro.
   La palabra "doação" (donación) no encaja con una promoción de descuento;
   parece arrastrada de otra plantilla. Si es un error, lo corrige Legal Brasil,
   no yo.

3. **"o frete grátis não será aplicado caso o valor seja superior a 20,00 (vinte
   reais)"**, en Frete Grátis. Le falta el `R$` y "o valor" es ambiguo: por el
   contexto es el valor del envío, pero leído solo puede entenderse como el
   valor del pedido, que diría lo contrario de lo que la campaña quiere.

4. **El cierre no lleva enlaces.** Dice "Consulte nossos Termos de Uso e
   Condições da Plataforma Rappi e Aviso de Privacidade de Dados", sin ninguna
   dirección. En Colombia esos dos van con su enlace. ¿Se agregan los de Brasil,
   o el documento brasileño va sin ellos a propósito?

5. **"São Paulo/SP"** aparece al final de uno solo de los cuatro. ¿Va siempre,
   nunca, o depende?

Y un dato que falta en `data/paises.json`: Brasil tiene vacío
`texto_derechos_datos`, que es la frase que enumera los derechos del titular
sobre sus datos. En Colombia dice "tus derechos a conocer, actualizar,
rectificar y suprimir...". Para Brasil tendría que salir de la LGPD, y esa
redacción es de Legal.

## 15 minutos o Cashback, de los T&C publicados de Bogotá y Barranquilla (17 de septiembre)

El modelo quedó armado y genera. Las mejoras aplicadas están en
`docs/MEJORAS_ETA.md`, con su antes y su después. Tres cosas para ti:

1. **Este modelo no tiene organizador aliado.** Participan todas las tiendas
   Turbo de una ciudad, el presupuesto lo pone Rappi y la cláusula del beneficio
   dice "Rappi se obliga a cumplir con el ETA exhibido dentro de la Plataforma
   Rappi". Mi lectura es que no choca con la regla 1, porque el documento nunca
   usa la palabra "Organizador" y lo que Rappi promete es su propio tiempo de
   entrega, que es una garantía de servicio y no una promoción de un tercero.
   Por eso **no** lo anoté como excepción. Si prefieres que quede escrita como
   la de Brasil, dímelo.

2. **Faltaba la cláusula de tratamiento de datos personales**, en los dos
   documentos publicados. Se la puse, con el mismo bloque que usan los demás
   modelos de Colombia. Si hay una razón para que no estuviera, la saco.

3. **"Rappi se obliga a cumplir con el ETA"** es una obligación de resultado con
   su remedio tasado. No la toqué. La dejo señalada por si conviene matizarla
   con las causas que no dependen de Rappi.

Y una pregunta de producto: hoy la modalidad está fija en "Turbo Restaurantes",
que es lo que dicen los dos documentos publicados. Si existen otras (Turbo
Mercados, por ejemplo), se vuelve una pregunta con opciones.

## La interfaz en portugués (17 de septiembre)

El formulario ya se puede leer en portugués, con el botón de abajo a la derecha.
Dos cosas que conviene que sepas:

1. **La traducción la escribí yo, y es de producto, no de Legal.** Ninguna
   cláusula se tradujo: el documento sigue saliendo de `modelos/`. Lo que está en
   portugués son los enunciados de las preguntas, las ayudas, los mensajes de
   error y los botones. Aun así, conviene que lo lea alguien que hable portugués
   antes de que lo usen los KAM de Brasil: una ayuda mal traducida puede inducir
   una respuesta equivocada, y esa respuesta sí sale impresa.

2. **Solo están traducidas las preguntas que un KAM de Brasil recorre de
   verdad**, que son las del tipo `promocao_br` más las tres de arranque.
   Traducir las ochenta y nueve preguntas sería traducir pantallas que en Brasil
   no existen, porque el país solo tiene habilitado su propio tipo. Lo que no
   está traducido sale en español, que se entiende, en vez de romperse.

## Tres cosas de la configuración de Brasil (17 de septiembre, noche)

Salieron al armar el paquete de revisión, y ninguna estaba anotada antes.

1. **La autoridad de datos llevaba una nota interna dentro del valor que se
   imprime.** Decía "a Autoridade Nacional de Proteção de Dados (ANPD)
   **(confirmar)**". Ese valor va tal cual a la cláusula de datos personales, así
   que un T&C publicado habría salido con la palabra "(confirmar)" adentro. No
   llegó a pasar porque el modelo brasileño no usa ese bloque, pero bastaba con
   que alguien se lo agregara. Ya saqué la nota del valor y marqué el dato en la
   columna de pendientes, que es para lo que existe. Y ahora hay una validación
   que no deja generar si un dato del país trae una anotación así, en cualquier
   país. **Sigue pendiente confirmar que la ANPD es la autoridad correcta.**

2. **La fila de Brasil mezcla español y portugués.** El país imprime en
   portugués, pero tiene estos valores en español:
   - `entidad_vigilancia`: "el PROCON y la Secretaría Nacional del Consumidor (SENACON)"
   - `pais_legal`: "a República Federativa **del** Brasil" (debería ser "do")
   - `politica_privacidad`: "**a** Aviso de Privacidade e Políticas de uso das **Informação**"

   No los traduje porque son nombres de entidades y de documentos publicados, y
   ahí una traducción mía puede nombrar mal a una autoridad. Los necesito de
   Legal Brasil escritos como se llaman de verdad.

3. **El modelo de Brasil no lleva cláusula de tratamiento de datos personales, y
   el del ETA sí se la puse.** Es una inconsistencia mía y quiero que la sepas.
   La razón: en el ETA tenía el texto de Colombia para reusar; en Brasil el campo
   `texto_derechos_datos` está **vacío** y la redacción tendría que salir de la
   LGPD, que no me corresponde inventar. Así que Brasil se quedó como el
   documento aprobado, sin esa cláusula. Si debe llevarla, necesito de Legal
   Brasil la frase que enumera los derechos del titular.

## T&C generales de Colombia que ya están publicados (17 de septiembre)

Vienen del Excel **"T&C Generales 2026"**, hoja `T&C Generales 2026`, quince filas
desde la fila 3. Quedaron transcritos en `data/tyc_genericos.json` y la
herramienta ya los ofrece: el comercial que va a hacer un descuento o un cupón no
genera documento, copia el enlace.

Juan avisó que no había revisado el archivo. **No corregí nada**: todo lo que
sigue está tal cual salió del Excel, y lo que confunde se le dice al comercial en
pantalla en vez de resolverlo por cuenta propia.

1. **"Descuento en Productos Seleccionados" está dos veces**, en las filas 4 y 16,
   con el mismo nombre, el mismo beneficio, la misma descripción y **enlaces
   distintos**: `/colombia/2026/descuentoprodselecc` y `/colombia/descuentosenprod`.
   Los dos quedaron en la lista, con un aviso que le dice al comercial que
   confirme cuál va. **Necesito saber cuál es el bueno y si el otro se retira.**
2. **Las filas 14 y 15** (Cupón de descuento por valor fijo y Cupón de descuento
   de toda la tienda) **no traen Beneficio Ofrecido ni Descripción**. Se quedaron
   vacías y la pantalla dice que Legal no explicó para qué sirven. Son dos de los
   quince, y cupones es de lo que más se pide.
3. **"Tarifa de Servicio Gratis" vence el 31 de octubre de 2026** y arranca el 1
   de febrero; los otros catorce van del 1 de enero al 31 de diciembre. La
   herramienta ya lo respeta: a partir del 1 de noviembre deja de ofrecerlo y dice
   que venció. **Si se va a renovar, hay que actualizar el archivo.**
4. **"Cupones de Descuento para Membresía Rappi Pro y Black" tiene vigencia 2026
   pero su enlace apunta a `/colombia/2024/`.** Es el único de los quince cuyo
   enlace es de un año distinto al de su vigencia. Se conservó el enlace tal cual,
   con un aviso en pantalla.
5. **La descripción de "Codigo de descuento para eventos externos" repite el
   nombre de la campaña** en vez de explicar para qué sirve.
6. **Los enlaces no siguen un patrón**: nueve llevan el año (`/2026/...`), cinco no
   lo llevan (`/colombia/enviogratis`, `/colombia/tarifadeservicio`,
   `/colombia/cuponvalorfijoco`, `/colombia/cupondescuentoco`,
   `/colombia/descuentosenprod`) y uno es de 2024. Los cuatro sin año coinciden
   letra por letra con los del archivo de 2024, así que 2026 está reusando las
   direcciones viejas de esos cuatro.
7. **Detalles de forma que dejé como están**: "Cupon" y "Codigo" sin tilde en las
   filas 14, 15 y 17; los nombres de las filas 14 y 15 usan un guion como
   puntuación ("Cupon de descuento - Valor fijo"), que es justo lo que la regla 8
   de `CLAUDE.md` no deja hacer en lo que se ve en pantalla; y las filas 10 y 11
   traían un espacio de más al final del nombre (ese sí lo quité, porque es
   espacio en blanco, no texto).

**No pude abrir ninguno de los quince enlaces**: la red de este entorno bloquea
`promos.rappi.com` y `legal.rappi.com.co`. Así que está verificado que el enlace
está bien copiado del Excel, pero **no** que la página exista ni que su título
coincida. Alguien con acceso tiene que abrirlos.

### Qué cambió entre el archivo de 2024 y el de 2026

El archivo viejo (`Legal - Términos y condiciones generales -V- 05.09.2024`) trae
dos listas: la hoja 1 está encabezada **"Términos y condiciones generales 2025"**
y la hoja 2, en las filas 22 a 44, trae la de **2024** con las mismas campañas y
las direcciones de ese año. O sea que el archivo llamado 2024 es en realidad el de
2025 con el histórico de 2024 al lado.

**Salieron de la lista en 2026** (estaban en 2024 y 2025 y ya no están):

- **Cashback** (`/2025/cashbackco`). Tiene sentido: es el tipo que RappiMind
  genera. Conviene confirmarlo, porque si el T&C general de cashback sigue
  publicado, hay dos respaldos distintos para la misma campaña.
- **Campañas 2x1** (`/2025/promo2x1`) y **campañas 3x2** (`/2025/promo3x2`).
- **Botón Turbo** (`legal.rappi.com.co/colombia/terminos-y-condiciones-del-boton-turbo/`).
- **Hora Loca Turbo del 31 de julio**, que era de un solo día de 2024.
- **Cajero ATM y Rappi Favor** (`/colombia/terminosycondicionesbotones`).
- **T&C de funcionamiento de Créditos** (`/colombia/funcionamiento-creditos-plataforma-rappi`).
- Las cuatro filas de **Travel** (descuentos en hoteles, carros y paquetes;
  cashback RappiCard; cashback por ser Pro; cashback para Travel), que en 2024
  tampoco tenían enlace: estaban nombradas y vacías.

**Entraron en 2026** (no estaban antes):

- **Descuento para Usuarios Nuevos en Turbo**.
- **Cupones de Descuento para Membresía Rappi Pro y Black** (con enlace de 2024).
- **Código de descuento para eventos externos**.
- La **segunda** "Descuento en Productos Seleccionados" de la fila 16.

**Cambiaron de nombre, con el mismo enlace de fondo**: "Descuento en tienda
específica" pasó a **"Descuento en Toda la Tienda"**; "Descuento en porcentaje
sobre productos seleccionados" a **"Descuento en Productos Seleccionados"**;
"Descuento en pesos sobre productos seleccionados" a **"Descuento en Valor"**; y
los dos cupones ("descuento en porcentaje sobre el valor total de la orden" y
"descuento en pesos...") a **"Cupon de descuento - Toda la tienda"** y
**"Cupon de descuento - Valor fijo"**.

**Lo que es nuevo del formato**: el archivo de 2026 trae por primera vez vigencia
de inicio y fin, beneficio ofrecido y descripción. El de 2024 era solo nombre y
enlace. Esa descripción es lo que hoy lee el comercial en pantalla para elegir,
así que las dos filas que llegaron sin ella se notan.

La otra hoja del archivo viejo ("Hoja 2", arriba) es una tabla distinta: **cuándo
hace falta un T&C específico** (cashback con vigencia de Créditos distinta de seis
meses, cupones que se redimen fuera de Rappi, concursos) y **qué tiene que decir
la pieza publicitaria** (siempre el mínimo de compra, siempre el máximo de
cashback, siempre a qué usuarios aplica). Eso no está en el archivo de 2026 y no
lo metí en la herramienta, pero es exactamente el criterio que decide si una
campaña necesita documento propio o le basta el general. **Si sigue vigente,
vale la pena que entre.**

## Dos cosas de los T&C generales que quiero que mires (17 de septiembre, noche)

Salieron al comparar el Excel de 2026 con el de 2024. Están además de las siete
inconsistencias que ya quedaron anotadas arriba.

1. **El T&C general de Cashback salió de la lista de 2026.** En la versión
   anterior estaba, con el enlace `promos.rappi.com/colombia/2025/cashbackco`.
   Cashback es justamente el tipo que RappiMind sí genera, así que si ese
   documento sigue publicado hay dos respaldos distintos para la misma campaña:
   el genérico viejo y el que genera la herramienta. ¿Se dio de baja a
   propósito, o se cayó de la lista?

2. **La hoja 2 del archivo anterior tiene una tabla que no está en el de 2026** y
   que vale mucho: dice cuándo hace falta un T&C específico y qué tiene que decir
   la pieza publicitaria. Por ejemplo, que siempre va el mínimo de compra,
   siempre el tope del cashback y siempre a qué usuarios aplica.

   Eso es exactamente el criterio que decide si una campaña necesita documento
   propio o le basta el genérico, que es la pregunta que la herramienta le tiene
   que responder al comercial. Y es también material para el encargo de las
   leyendas, porque describe lo que la pieza está obligada a decir. Si sigue
   vigente, debería entrar.

También quedan sin verificar los quince enlaces: la red de este entorno bloquea
`promos.rappi.com`. Está comprobado que están copiados letra por letra del Excel,
pero no que las páginas abran. Alguien con acceso tiene que darles clic antes de
que un comercial pegue uno en una pieza.

## De la revisión crítica del 17 de septiembre (noche)

Salieron al revisar lo construido la noche anterior. Ninguno cambia texto legal.

1. **Brasil, la hora de inicio.** El formulario preselecciona 00:00 en todos los
   países. Los cuatro T&C aprobados de Brasil arrancan a las 00:01. La ayuda en
   portugués lo dice ahora con todas las letras ("Deixamos 00:00 por padrão. Os
   quatro documentos aprovados começam às 00:01"), pero si Legal Brasil exige
   00:01, hay que cambiar el valor por defecto para Brasil, no solo la ayuda.
2. **Brasil, "um (1) pedido" o "1 (um) pedido".** La ayuda cita el documento como
   "o limite de 1 (um) pedido por usuário" (cifra primero, como los montos
   brasileños) y el motor imprime "um (1) pedido". Los cuatro aprobados no están en
   el repositorio: hace falta que Legal Brasil diga cuál es la forma aprobada, y se
   corrige la que esté mal.
3. **Brasil, los cuatro casos dorados.** `pruebas/salidas_esperadas/BR01.txt` a
   `BR04.txt` son el documento que el motor produce hoy para Desconto, Frete
   Grátis, Taxa de serviço y Taxa e frete. Protegen el texto de que se mueva sin
   querer; no dicen que sea el aprobado. Conviene compararlos con los cuatro T&C
   que mandó Legal Brasil.
4. **Brasil, montos de un real y con centavos.** El motor escribiría "R$1,00 (um
   reais)" para un tope de 1, y trunca los centavos sin avisar ("R$20,50" sale
   como "R$20,00"). Desde la pantalla no se puede escribir ninguno de los dos (el
   campo solo acepta dígitos), así que no urge, pero queda anotado.
5. **Brasil, los datos en español de la fila del país** (la entidad de vigilancia,
   el nombre del país, la ley aplicable, la jurisdicción y el nombre de la política
   de privacidad) ahora aparecen nombrados en el aviso del resumen como datos por
   confirmar. Son la pregunta 3 del encargo 01.
6. **T&C generales, la fila 17.** El nombre y la descripción traían un doble
   espacio ("20%  para"). Se dejó un solo espacio, con el mismo criterio de las
   filas 10 y 11: es espacio en blanco, no texto. La descripción repite el nombre,
   y la pantalla ya no la muestra dos veces.
7. **T&C generales, el 1 de noviembre y el 1 de enero.** La Tarifa de Servicio
   Gratis vence el 31 de octubre de 2026 y los otros catorce el 31 de diciembre. A
   partir de esas fechas la herramienta deja de ofrecerlos y manda a Legal. Si
   Legal publica las versiones nuevas, hay que actualizar `data/tyc_genericos.json`
   antes, o el 2 de enero ningún comercial de descuentos va a tener enlace.
