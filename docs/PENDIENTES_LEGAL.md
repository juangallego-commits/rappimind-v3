# Pendientes de revisión legal (punto de control A)

Revisar con los textos de `pruebas/salidas_esperadas/`.

El motor ya reproduce esos textos exactamente. Para verlos salir del motor y no
del archivo: `npm run previsualizar CB01` (o CB02, CC01, CD01, MX01). Al
implementar la sección 5 no apareció ningún error en los textos de Legal: todo
lo que hay que confirmar es lo que ya está en esta lista.

## Medicamentos, fitoterapéuticos y nicotina: qué haría falta para reabrirlos

Juan cerró el 20 de septiembre de 2026 que en Colombia **no se hacen campañas
de cashback, descuento ni concursos** sobre medicamentos, productos
fitoterapéuticos, cigarrillos, tabaco calentado, vapeadores ni otros productos
con nicotina. Fundamento: para el tabaco y la nicotina, la Ley 1335 de 2009 y la
Ley 2354 de 2024; para medicamentos y fitoterapéuticos, una regla de Legal CO
más estricta que el Playbook Farmacias, que sí permite el descuento anunciado en
el propio medicamento.

Las siete categorías salieron de la pregunta de la pieza y sus siete leyendas
salieron del catálogo. **Los archivos se quedaron** en `modelos/leyendas/`, con
su texto tal cual vino de Legal y con `se_elige_en: no_se_ofrece`. Con ellas se
fueron del formulario la pregunta del registro sanitario y la de la notificación
ante el INVIMA, porque ninguna otra categoría las usaba.

**Si algún día se reabren**, tres cosas:

1. La fórmula aprobada para los medicamentos es la del **Playbook Farmacias de
   Legal** (Drive, id `1iF-ZK8ZoTT0BKQc1GqWLiLS8Mh8pusgK`), no la que está hoy
   en el catálogo:
   - Uno: "Es un medicamento. No exceder su consumo. Leer indicaciones y
     contraindicaciones. Si los síntomas persisten consultar al médico."
   - Varios: "Son medicamentos. No exceder su consumo. Leer indicaciones y
     contraindicaciones. Si los síntomas persisten consultar al médico."
2. Vuelven las dos preguntas del registro sanitario y de la notificación ante el
   INVIMA, que las cuatro leyendas de medicamentos y fitoterapéuticos siguen
   citando con sus marcadores.
3. Hay que decidir si la opción que hoy bloquea se retira o se parte en las
   categorías que se reabran.

En los demás países no cambia nada: lo deciden sus abogados en la prueba.
México sigue ofreciendo sus categorías de medicamentos y de bolsas de nicotina.

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
3. ~~Condiciones opcionales: "solo Turbo" y "solo consumo en el local".~~
   **Cambiado el 20 de septiembre de 2026.** "Solo consumo en el local" se borró
   (en Rappi no existe esa modalidad) y la pregunta pasó a ser en cuál de las dos
   tiendas de la marca se gana el cashback: la normal, la de Turbo, las dos, o
   ninguna porque no tiene tienda en Turbo.
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

4. ~~**El cierre no lleva enlaces.**~~ **Resuelto el 20 de septiembre de 2026
   (punto B2).** Era un error de lectura: los cuatro aprobados **sí** traen sus
   dos enlaces, a `legal.rappi.com/brazil/`. La herramienta usa los de
   `legal.rappi.com.co/brazil/` y Juan decidió dejarlos así, porque las dos
   direcciones abren y `.com.co` es la que usa el resto del sistema.

5. **"São Paulo/SP" al final.** Está en **los cuatro** documentos aprobados, no
   en uno solo como decía esta página hasta el 20 de septiembre de 2026. El
   modelo sigue sin imprimirlo, porque nadie ha dicho si es la sede que debe
   constar siempre o el pie de un documento anterior. **Lo miran los abogados de
   Brasil cuando prueben la herramienta.**

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

1. ~~**Brasil, la hora de inicio.**~~ **Resuelto el 20 de septiembre de 2026
   (punto B3).** El formulario de Brasil arranca en 00:01, como los cuatro
   aprobados. Los demás países siguen en 00:00.
2. ~~**Brasil, "um (1) pedido" o "1 (um) pedido".**~~ **Resuelto el 20 de
   septiembre de 2026 (punto B3).** La forma aprobada es la cifra primero, como
   los montos: "1 (um) pedido", "10% (dez por cento)". El motor imprimía "um (1)
   pedido" y se corrigió.
3. ~~**Brasil, los cuatro casos dorados.**~~ **Resuelto el 20 de septiembre de
   2026 (punto B2).** Se compararon línea por línea contra los cuatro aprobados
   del Drive. La única diferencia de fondo era el orden de la cifra y las letras,
   y la corrigió el punto B3. El detalle está en `docs/CORRECCIONES_BRASIL.md`.
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
8. **ETA, "tú" y "el Usuario/Consumidor" en el mismo documento.** El modelo del
   cashback por ETA está escrito en tercera persona ("el Usuario/Consumidor"),
   como los publicados de Bogotá y Barranquilla, pero incluye los bloques
   compartidos de acreditación, vigencia de los Créditos, datos personales y ley,
   que le hablan al lector de "tú" ("se acreditarán en tu Billetera", "se te
   informará a través de la Plataforma"). El documento sale mezclado. Es texto
   legal: hay que decidir si esos bloques se reescriben en tercera persona para
   este modelo o si el ETA tutea como los demás. Se ve en
   `pruebas/salidas_esperadas/ETA01.txt`.
9. **ETA, "pedido" y "orden" para lo mismo.** El bloque compartido de
   acreditación habla de "cada pedido" y las definiciones del ETA de "la orden"
   y de "un porcentaje o valor del pedido". Los publicados usan "orden". Misma
   decisión que la anterior: es del bloque compartido, no del modelo.
10. **ETA, los dos casos dorados.** `ETA01.txt` (Bogotá) y `ETA02.txt`
    (Barranquilla) son lo que el motor produce hoy con los datos de los dos T&C
    publicados. Protegen el texto de que se mueva sin querer; no dicen que sea el
    aprobado. Las diferencias a propósito con los publicados están en
    `docs/MEJORAS_ETA.md`. Conviene compararlos con los dos originales.
11. **Brasil, la fila del país tiene valores en español que hoy no se imprimen.**
    `pais_legal` dice "a República Federativa del Brasil" (mezcla) y
    `entidad_vigilancia` dice "el PROCON y la Secretaría Nacional del Consumidor
    (SENACON)". El modelo brasileño no los usa, así que no salen en el documento,
    y ya están en la lista de datos por confirmar (pregunta 3 del encargo 01).
    Si algún día un modelo de Brasil los pide, saldrían así.
12. **T&C generales, dos nombres con guion.** "Cupon de descuento - Valor fijo" y
    "Cupon de descuento - Toda la tienda" son los únicos textos visibles de toda
    la herramienta con un guion como signo de puntuación (regla 8 de
    `CLAUDE.md`). Están copiados tal cual del Sheet de Legal. Si ese es el nombre
    oficial de las piezas, se quedan; si no, quedarían como "Cupón de descuento:
    valor fijo" y "Cupón de descuento: toda la tienda". Decisión de Juan.

## De la respuesta al encargo 01 (18 de septiembre)

`docs/encargos/respuestas/01-legal.md` respondió las 49 preguntas. Lo que traía
texto exacto y aplicable ya está aplicado (ver `docs/PROGRESO.md`). Aquí queda
lo que no: lo que vino con recomendación sin texto, lo que quedó sujeto a un
dato que nadie tiene todavía, y lo que Juan tiene que decidir o hacer por fuera
del repositorio. Nada de esta lista se redactó aquí.

### A. Las cinco bloqueantes que no quedaron cerradas

1. **Brasil, el tope del frete grátis (pregunta 2).** La decisión es que cubre
   hasta R$20 y el excedente lo paga el Usuário, que es lo que dice el
   documento hoy. Falta que alguien de Brasil confirme que la app cobra el
   excedente y no quita el beneficio entero. Si lo quita, el texto B ya está
   escrito y hay que cambiarlo: "Esclarece-se que o frete grátis não se aplica
   quando o valor do frete for superior a R$20,00 (vinte reais); nesse caso, o
   Usuário pagará o valor integral do frete."
2. **Argentina, la autoridad de consumo (pregunta 9).** Se queda "la Dirección
   Nacional de Defensa del Consumidor" hasta que Legal AR confirme el nombre
   vigente: esa dependencia ha cambiado de nombre varias veces. Contacto en el
   hilo de transferencia de datos: Milena Casella.
3. **Ecuador, el separador de miles (pregunta 12).** Se queda la coma. En
   Ecuador conviven los dos formatos y falta el dato de cómo escribe los montos
   Legal EC en sus T&C publicados. Sigue marcado como dato por confirmar.
   Contacto: Claudia Apolo.
4. **Costa Rica, el separador de miles (pregunta 14).** Igual: se queda el
   punto y sigue marcado como dato por confirmar. No hay contacto legal
   confirmado en Costa Rica.
5. **Cashback Multitienda, el máximo de pedidos (pregunta 20).** La decisión es
   "por tienda", condicionada a que CRM pueda configurar el límite por tienda.
   Si solo puede configurar uno global, se queda por campaña, porque el T&C
   tiene que decir lo que la app hace. **Hasta que Juan confirme lo de CRM, el
   texto sigue siendo el de hoy.** Los tres textos exactos ya están escritos en
   la respuesta (líneas 518 a 520 del bloque "PARA EL REPOSITORIO") y se aplican
   en un rato el día que la respuesta sea "sí, por tienda".

### B. Texto exacto que no se puede aplicar solo

6. **Carrera de Compras, la frase de datos del ganador (decisión 36, falla b).**
   El texto nuevo está completo y es mejor que el de hoy, pero enumera la
   dirección de entrega y el número de documento. Aplicarlo solo empeoraría el
   caso CC01, que es un premio en Créditos "entregado" por el Organizador: hoy
   ya manda datos que no tienen razón de ser, y con el texto nuevo mandaría más.
   Va junto con la falla a (que "¿Quién entrega el premio?" solo salga con
   premio físico) y con la viñeta de entrega para premios en Créditos, que la
   respuesta deja escrita pero marcada como "lo decides tú". Las tres son una
   sola tanda y necesitan tu visto bueno.
7. **Brasil, la frase de datos personales del cierre (decisión 1).** Está
   escrita en portugués y lista, pero solo entra si Legal BR la pide. Va en el
   mensaje de la decisión 24.

### C. Trabajo de producto que la respuesta pide y que no es aplicar un texto

Todo esto trae los enunciados y las ayudas escritos, pero es construir pantalla,
no reemplazar una frase. Hay que hablarlo antes, como el encargo 03.

8. ~~**La pregunta del acuerdo de transferencia de datos** (decisión 36 (i)).~~
   **Construida el 18 de septiembre**, con la pregunta, los tres paneles (el
   circuito de nueve pasos de Colombia, el corto de los países con modelo y el
   de Chile y Costa Rica que no lo tienen), los enlaces en la columna nueva
   `url_acuerdo_datos` y el aviso repetido en la pantalla final. Queda una cosa
   que no es de código: **en el hilo, dos personas no pudieron abrir la carpeta
   de Drive.** Hay que revisar que los KAM tengan acceso de lectura antes de
   enseñarles el enlace, porque hoy la herramienta ya se los muestra.
9. **El valor del premio** (decisión 36 (ii)): pregunta nueva y dos frases
   nuevas para la cláusula de premio. Los textos dicen "pesos M/Cte." y "IVA",
   que son de Colombia: como están, romperían el día que Carrera de Compras se
   habilite en otro país. Hay que decidir si se escriben con el nombre de la
   moneda y el impuesto de cada país o si el tipo se deja solo para Colombia.
10. **Los productos con nombre y EAN** (decisión 36 (iii)): el campo de texto
    libre pasa a filas con nombre y código de barras, con validación del dígito
    de control. Cambia la cláusula de productos participantes y la pantalla.
11. **Las secciones donde los Créditos no aplican** (decisión 38): casillas
    nuevas (Rappi Travel, SOAT, Cajero ATM y Rappi Favor), marcadas de entrada,
    y una frase de exclusión en la cláusula de redención.
12. **"Consumo en el local"** (decisión 39): las condiciones pasan de casillas a
    una sola elección, y la opción local se oculta mientras no sepamos el nombre
    exacto con el que la app la muestra hoy en Colombia. **Ese nombre es el dato
    que falta.** Sin él no se puede escribir la cláusula, porque el texto nuevo
    lo cita entre comillas.
13. **El filtro antes de la lista de T&C generales** (decisión 49): seis
    preguntas de sí o no, con sus textos escritos, más la frase nueva de la
    pantalla final ("Tu pieza debe decir siempre: el mínimo de compra, si lo
    hay; el máximo de descuento o de cashback; y a qué usuarios aplica, si no es
    para todos.").

### D. Lo que decides tú, sin dato que falte

14. **La responsabilidad de Rappi Travel** (decisión 40). La recomendación es
    cambiar la cláusula por la alternativa R4, que está escrita completa en la
    línea 568 de la respuesta. El argumento: con Rappi Travel calificada como
    proveedor indirecto con responsabilidad solidaria, la exclusión general por
    la prestación cae en el artículo 43, numeral 1, de la Ley 1480, es ineficaz
    de pleno derecho y sirve como prueba en una investigación. **No se aplicó
    porque la respuesta dice expresamente que la decisión es tuya.** Si la
    mantienes como está, queda anotada aquí como riesgo aceptado.
15. **Las descripciones de los dos cupones** (decisión 46). Las cuatro frases
    están escritas, pero la respuesta las marca como propuesta pendiente de
    Legal CO. Hoy los dos cupones siguen sin descripción y la pantalla avisa que
    falta. Si Legal CO las aprueba, se aplican tal cual.
16. **El modelo del ETA en "Turbo Restaurantes"** (decisión 33). Falta el dato
    de si la campaña de 15 minutos corre, o va a correr, en Turbo de mercado. Si
    la respuesta es sí, la modalidad pasa a lista cerrada con "Turbo
    Restaurantes" (preseleccionada) y "Turbo". Si es no, se queda fija.
17. **Travel, la marca del aliado obligatoria** (decisión 43). La marca pasaría
    a ser obligatoria y el nombre de la campaña nunca empezaría con "Rappi
    Travel", porque en el título se leería como quien hace la campaña. Es un
    cambio de formulario y de la regla del nombre, no un texto: confírmalo y se
    hace.

### E. Fuera del repositorio: cosas que haces tú

18. **Ratificar la excepción de Brasil con Legal BR** (decisión 24), en un solo
    mensaje que lleva también lo de las decisiones 1, 2, 25, 26, 27 y 28, más la
    hora de inicio (00:00 contra 00:01) y "um (1) pedido" contra "1 (um)
    pedido". El mensaje está redactado en la respuesta 24.
19. **La revisión de la interfaz en portugués** (decisión 29), con Amannda
    Moreira o quien ella indique, y un KAM de Brasil. En este orden: las cuatro
    opciones de "O que o usuário ganha?", la ayuda del teto del frete grátis, la
    del mínimo de compra y los mensajes de error.
20. **El general de cashback de 2025** (decisión 47): se queda publicado, con el
    encabezado "Estos Términos y Condiciones no aplican a campañas iniciadas a
    partir del 1 de enero de 2026. Cada campaña de cashback vigente tiene sus
    propios Términos y Condiciones, publicados en su propio enlace." Eso va en
    Squarespace, no aquí.
21. **El enlace repetido de "Descuento en Productos Seleccionados"** (decisión
    45). La herramienta ya ofrece solo el de `/colombia/2026/descuentoprodselecc`.
    El otro, `/colombia/descuentosenprod`, sigue publicado: si dice lo mismo, se
    redirige con un 301 en Squarespace; si no, se deja con aviso de vigencia.
22. **Republicar "Cupones de Descuento para Membresía Rappi Pro y Black"**
    (decisión 48) en la ruta de 2026. Cuando exista el enlace nuevo, se cambia
    en `data/tyc_genericos.json` y se quita la revisión que hoy anota que la
    vigencia dice 2026 y el enlace apunta a /colombia/2024/.
23. **El certificado del RNT de Travel Moustache** (decisión 21): reemplazar en
    el Drive la copia vencida por la renovada, y poner un recordatorio en
    febrero de 2027. El 31 de marzo de 2027 la herramienta deja de generar
    Travel sola.
24. **Chile, el 1 de diciembre de 2026** (decisión 11). Ese día, y solo si la
    Ley 21.719 entra en vigencia (el Gobierno está evaluando postergarla),
    `CL.autoridad_datos` pasa de "las autoridades competentes" a "la Agencia de
    Protección de Datos Personales". Es un cambio a mano, en el Sheet y en la
    semilla.
25. **Aviso al dueño de los T&C de Uso de la Plataforma** (decisión 41): la
    versión publicada en about.rappi.com todavía define los Créditos como los de
    la sección "Promos y Créditos". Si la app ya dice "Cuenta" y "Créditos", el
    desactualizado es ese documento madre.

### F. Una tensión de la propia respuesta, que resolví como me dijiste

26. **Los datos por confirmar y el visto bueno del abogado local.** Tu
    instrucción fue sacar de `por_confirmar_en_pruebas` cada valor que se
    confirme, y eso se hizo. Pero la línea 511 de la respuesta dice otra cosa:
    que esa lista queda vacía "cuando el abogado local de cada país dé el visto
    bueno". Las dos se pueden cumplir a la vez, y así quedó: los valores
    confirmados salieron, y en su lugar cada país en piloto marca ahora un solo
    pendiente, `visto_bueno_legal_local`, que en pantalla se lee "el visto bueno
    del equipo legal de este país". Si prefieres que la lista quede
    completamente vacía, se quita en un minuto, pero entonces un abogado que
    entre a probar no va a ver ni un pendiente y puede confirmar de pasada toda
    la configuración de su país, que es justo lo que ese aviso existe para
    evitar. Los contactos por país están en la respuesta 7: México, Ana Bravo y
    Samanta Anzaldo; Argentina y Uruguay, Milena Casella; Perú, Álvaro Castro;
    Ecuador, Claudia Apolo; Brasil, Amannda Moreira. Chile y Costa Rica no
    tienen contacto confirmado.
27. **El aviso del resumen dice una frase que se quedó a medias.** La pantalla
    del resumen de un país en piloto sigue diciendo que los datos legales "los
    propuso la herramienta por analogía con Colombia y no los ha confirmado
    nadie". Después de esta respuesta eso ya no es cierto para los cuatro datos
    que Legal confirmó, aunque sigue siéndolo para el resto de la fila. Es texto
    de interfaz: lo dejé quieto para no cruzarme con el encargo 02, que es el
    que toca esas frases.
## De la respuesta al encargo 02 (18 de septiembre)

13. **T&C generales, las diez correcciones que propuso Claude chat (pantalla 30
    del encargo 02).** La respuesta del encargo 02 trae diez líneas que corrigen
    `data/tyc_genericos.json`. No se aplicaron: ese archivo es la lista de Legal
    transcrita como llegó, y `pruebas/tyc_genericos.test.js` deja escrito que las
    inconsistencias del Excel siguen a la vista y no "arregladas", porque
    corregirlas por cuenta propia sería decidir por Legal. Van en tres grupos:
    - *Solo ortografía, no cambia lo que dice*: "el costo de envio" a "envío",
      "el precio de la suscripcion" a "suscripción", "miembros rappi pro" a
      "miembros Rappi Pro" (en dos T&C), y "Codigo de descuento" a "Código".
    - *Cambian el nombre que se ve en la lista*: los dos cupones del punto 12 de
      arriba, que Claude chat dejaría como "Cupón de descuento de valor fijo" y
      "Cupón de descuento en toda la tienda". **Ojo: el punto 12 propone otra
      redacción para los mismos dos nombres ("Cupón de descuento: valor fijo").
      Hay que elegir una.** También "Tarifa de servicio $0 (Service Fee OFF)" a
      "Tarifa de servicio en $0" y "Descuento en el valor de la suscripción (Fee
      de Membresía OFF)" a "Descuento en el valor de la suscripción".
    - *Reescriben las palabras de Legal*: el "beneficio" del T&C del canal de
      venta externo pasaría a "Un externo da el descuento en su propio canal de
      venta. Por ejemplo: un código del 20% para las boletas de un evento.", y el
      "para qué sirve" del de precio tachado pasaría de "El descuento se refleja
      automáticamente en el check out." a "El descuento aparece automáticamente
      al pagar.". Estos dos son los que más se acercan a redactar por Legal.

    Las líneas exactas están en `docs/encargos/respuestas/02-interfaz.md`, en el
    bloque final, marcadas como pantalla 30. Decisión de Juan, grupo por grupo.

## Lo que Juan decidió el 18 de septiembre

Cierra cinco de los pendientes de arriba y abre dos.

**Cerrados.**

- **Brasil, el tope del frete grátis** (grupo A, punto 1): se queda como está,
  con el excedente a cargo del Usuário. El texto alternativo sigue escrito en la
  respuesta por si Brasil dice que la app quita el beneficio entero.
- **Cashback Multitienda, el máximo de pedidos** (grupo A, punto 5): es por cada
  tienda participante. Aplicado.
- **Rappi Travel, la cláusula de responsabilidad** (decisión 40): se queda la de
  hoy. Queda escrito como **riesgo aceptado**, que es lo que la respuesta pedía
  que se anotara si no se cambiaba.
- **Brasil, la ratificación por escrito** (decisión 24): confirmada.
- **Las catorce leyendas con propuesta** (encargo 03): aprobadas las catorce. Se
  ajustan sobre la marcha, mirando cómo salen en el desarrollo.

**Abiertos, con lo que dijo Juan.**

14. **Turbo no es una modalidad, son tiendas por zona.** La decisión 33 proponía
    que `MODALIDAD_TURBO` pasara a una lista cerrada de dos, "Turbo Restaurantes"
    y "Turbo". Juan lo corrigió: en la práctica son las tiendas Turbo de cada
    zona, con nombre propio, como Turbo Calleja, Turbo Chico o Turbo Laureles.
    Eso no es una lista cerrada de dos opciones y cambia el diseño de la pregunta
    del cashback por ETA, porque hoy el documento nombra una sola modalidad para
    toda la ciudad. Hay que decidir si el T&C nombra la ciudad (como los dos
    publicados), la zona, o las tiendas una por una. No se tocó nada.
15. **"Consumo en el local" quedó sin resolver porque la pregunta se entiende de
    dos formas.** La decisión 39 la usa para decir **cómo se pide**: si el
    beneficio se gana en cualquier pedido, solo pidiendo por Turbo, o solo
    consumiendo en el local. Juan la leyó como **qué tiendas participan**, y
    anotó que en el Cashback eso ya viene implícito con el nombre de la tienda.
    Son dos cosas distintas y conviene zanjarlo antes de construir la pantalla:
    una tienda puede participar y aun así excluir los pedidos a domicilio. La
    opción sigue oculta mientras `CO.nombre_modalidad_local` esté vacío, así que
    hoy no le aparece a nadie.

## Brasil ya está en producción, con estos puntos abiertos (18 de septiembre)

El 18 de septiembre Juan sacó a Brasil de piloto junto con México, Perú,
Argentina, Chile y Uruguay. Desde ese momento cualquier KAM de Brasil puede
generar y publicar un T&C en portugués, sin el aviso de "no publiques todavía".

Esta sesión lo advirtió antes de hacerlo y Juan confirmó que Brasil entraba
igual. Lo que sigue abierto queda aquí, para que no se pierda ahora que ya no
hay aviso en pantalla que lo recuerde:

1. **El mensaje a Legal BR no tiene respuesta.** La decisión 24 de la respuesta
   del encargo 01 dejó redactado un mensaje que pide confirmar cinco cosas: (i)
   la excepción de que Rappi concede, modifica y cancela la promoción; (ii) que
   el frete grátis cubre hasta el tope y el excedente lo paga el Usuário; (iii)
   las correcciones de redacción del anexo; (iv) si quieren la frase de datos
   personales en el cierre; y (v) la hora de inicio y cómo se escribe el límite
   de pedidos. Mientras no conteste, la excepción vive solo de la autorización
   de Juan del 17 de septiembre.
2. **La hora de inicio.** El formulario preselecciona 00:00 y los cuatro T&C
   aprobados arrancan a las 00:01. Hoy sale impreso lo que el KAM deje.
3. **"um (1) pedido" contra "1 (um) pedido".** El motor imprime la primera; la
   ayuda en portugués cita la segunda. Una de las dos está mal.
4. **Los cuatro casos dorados `BR01` a `BR04` no se han comparado** con los
   cuatro T&C que mandó Legal Brasil. Protegen el texto de moverse solo; no
   dicen que sea el aprobado.
5. **La interfaz en portugués no la ha leído nadie de Brasil.** Es la decisión
   29 de la respuesta del encargo 01: la lectura de Amannda Moreira, o de quien
   ella indique, más un KAM de Brasil.
6. **El nombre de los países no se traduce.** En la interfaz en portugués la
   lista dice "Ecuador" y no "Equador", "Perú" y no "Peru". Los nombres salen de
   la columna `nombre` de la pestaña Paises, que es una sola por país. Es menor y
   no toca texto legal, pero se ve.

Y de los otros cinco países que salieron de piloto el mismo día:

7. **Chile imprime "las autoridades competentes"** como autoridad de protección
   de datos, a propósito, porque la agencia de la Ley 21.719 todavía no opera.
   Esa frase sale en el documento publicado. Cuando la agencia entre, hay que
   cambiar el valor en la pestaña Paises.
8. **Perú, Argentina, Chile y Uruguay no tienen caso dorado.** Nadie ha leído un
   documento completo de esos cuatro países. Esta sesión sí generó uno de cada
   uno y los cuatro salen limpios, sin huecos ni frases partidas, pero eso no es
   lo mismo que haberlo leído. Claude Code ofreció agregar `PE01`, `AR01`, `CL01`
   y `UY01`; Juan no los pidió. La oferta sigue en pie.

## Las leyendas de piezas publicitarias (18 de septiembre)

El catálogo de las 55 leyendas de la respuesta del encargo 03 ya está en
`modelos/leyendas/`, y la herramienta entrega las de Colombia en la pantalla
final. Lo que queda abierto:

1. **Las 24 preguntas de la lista 2 de la respuesta siguen sin contestar.** Están
   en `docs/encargos/respuestas/03-leyendas.md`, sección 9.3. Las tres que más
   cambian el diseño, según la propia respuesta, son la 21 (dónde se redimen los
   Créditos del ETA, donde la pieza y el T&C dicen cosas distintas), la 16 (el
   enlace corto) y la 6 (el aviso de tiempo estimado en el ETA).
2. ~~El enlace corto no tiene forma definida.~~ **Cerrado el 18 de septiembre:
   no hay enlace corto.** Juan decidió que el enlace sea uno solo y el mismo en
   todas partes, así que la leyenda de push y SMS ya no se retiene: se entrega
   con la dirección del T&C de la campaña. En los casos dorados mide 89
   caracteres contra un límite de 70, y el enlace son 51 de esos 89: sin el
   enlace son 38 y cabe de sobra. Juan avisó que en push y SMS casi nunca ponen
   el enlace, así que quien arma la pieza decide. Lo que sigue abierto es de otra
   naturaleza: el banner chico del cashback por ETA mide 567 caracteres contra un
   límite de 300 y no cabe ni quitando los dos enlaces.
3. **Cuatro casos donde la respuesta no dio frase corta**, y por eso la campaña
   no entrega leyenda y dice qué falta. Son los insumos 3, 4 y 5 de la lista 3:
   cómo se dice en una pieza que los Créditos solo sirven en ciertas secciones;
   cómo se llama dentro de la app la modalidad de consumo en el local
   (`CO.nombre_modalidad_local` sigue vacío); y cómo se dice que en Carrera gana
   quien haga más pedidos. El cuarto es el registro sanitario, que no es una
   frase que falte sino un dato que el comercial tiene que escribir.
4. **Las leyendas de campaña son solo de Colombia.** Para los otros ocho países
   la respuesta dice "no cubierto": el SSL solo da recetas. Los complementos de
   categoría de esos países sí están en el catálogo, pero no hay leyenda de
   campaña donde pegarlos, así que la pregunta de la categoría no aparece y la
   pantalla final manda a Legal del país. Es el punto 9 de la sección 7E.
5. **Cuatro leyendas están en el catálogo y la herramienta no llega a ellas:**
   apuestas y Mundial, que la sección 7E manda escalar a Legal, y las de
   descuentos con T&C general y awareness, que son tipos de campaña que v3 no
   genera. Quedan escritas y marcadas con `se_elige_en: ninguna_parte_todavia`.
6. **Las preguntas de los descuentos con T&C general no se construyeron.** Juan
   decidió el 18 de septiembre dejarlas para cuando exista ese tipo de campaña.
   Hoy los 15 T&C generales solo entregan enlace, sin preguntas ni documento, así
   que no son "dos preguntas más": son un recorrido nuevo completo.
7. **Y no es solo el banner: una campaña corriente ya no cabe en la letra
   pequeña.** Farmatodo, 20% de cashback, solo por Turbo, con compra mínima y
   categoría licores, da una letra pequeña de 645 caracteres contra un límite de
   620, recortada hasta el último nivel. No es el caso extremo que midió la
   respuesta (865 caracteres): es una campaña normal. La causa es que suma dos
   complementos, el de Turbo con su enlace de 74 caracteres y el de licores con
   sus dos leyes. Hay que decidir si el límite de 620 es el correcto, si el
   enlace de Turbo puede ir corto, o qué más se puede marcar como recortable.
8. **La leyenda de banner corto casi nunca cabe.** Con los datos reales de la
   pieza 1 mide 382 caracteres contra un límite de 300, y toda ella es mínimo
   irreductible: no hay nada marcado como recortable. La herramienta lo dice en
   pantalla, que es lo que pide la sección 7D, pero alguien tiene que decidir qué
   se puede quitar o si esas campañas simplemente no salen en banner chico.

   Medido el 18 de septiembre sobre los trece casos dorados de Colombia, seis se
   pasan del límite del banner: 313, 340, 340, 346, 346 y 399 caracteres contra
   300. En todos, el enlace son 52 caracteres, así que un enlace más corto
   arreglaría los cuatro primeros y no los dos últimos. Es el dato que faltaba
   para decidir, y va contra la decisión del enlace único: hay que escoger entre
   un enlace igual en todas partes y un banner que quepa.
9. **El texto de la pregunta nueva en portugués lo escribí yo**, igual que el
   resto de la interfaz en portugués. Va en el mismo paquete que ya está anotado
   para que lo lea alguien de Brasil.

## El acuerdo de transferencia de datos, lo que quedó abierto (18 de septiembre)

La decisión 36 de la respuesta del encargo 01 se aplicó casi entera. Lo que falta:

1. ~~La mitad de la falla (a) que necesita un texto tuyo.~~ **Resuelto el 18 de
   septiembre.** Juan aprobó la frase que la respuesta traía marcada "texto
   nuevo, lo decides tú": "Los Créditos serán acreditados por Rappi en la
   Billetera de Créditos del ganador, por cuenta del Organizador, una vez
   aceptado el premio." Con ella, la pregunta "¿Quién entrega el premio?" ya no
   sale con premio en Créditos, porque con Créditos no hay entrega que repartir,
   y la viñeta del documento imprime esa frase en su lugar. El único caso dorado
   que cambió es CC01, y cambió una sola línea.
2. **El acceso de los KAM a la carpeta de Drive.** En el hilo, dos personas no
   pudieron abrirla. La herramienta ya les muestra el botón "Abrir el modelo de
   acuerdo": si no tienen acceso, ese botón los lleva a una pantalla de permiso.
3. **Una frase del circuito de Colombia cita una opción con otras palabras.** El
   último paso dice: cambia tu respuesta a "Rappi, como operador logístico". La
   opción del formulario se llama "Rappi como operador logístico", sin la coma.
   No se tocó el texto legal por una coma, pero conviene que una de las dos ceda.
4. **Carrera de Compras solo está habilitada en Colombia.** Los paneles de los
   otros países están construidos y probados, pero nadie los va a ver hasta que
   el tipo se habilite fuera de Colombia.

---

## El texto del valor del premio, roto en el archivo del encargo

**Encontrado el 20 de septiembre de 2026, al aplicar las decisiones del issue
#2.** Regla 3 de `CLAUDE.md`: se anota y se sigue.

La decisión 36 (ii) de `docs/encargos/respuestas/01-legal.md` trae las dos
frases del valor del premio de la Carrera de Compras. La del caso de **un
ganador** está entera. La del caso de **varios ganadores** está corrompida en el
archivo: el renderizado la interpretó como fórmula matemática, convirtió cada
letra en un carácter distinto y perdió todos los espacios. Se ve así:

```
DESPUÉS, con varios: "Cada ganador recibirá el siguiente premio: {descripción},
con un valor comercial unitario de {valor en letras} pesos M/Cte. (
𝑣
𝑎
𝑙
...
```

**Por eso el punto D3 no se aplicó.** No es un problema de tamaño: la pregunta
del valor del premio es una sola pregunta con su guarda, y se construye en un
rato. Es que la frase que hay que imprimir no está legible, y reconstruirla es
escribir texto legal.

La reconstrucción, para que Juan la confirme o la corrija, está copiada en el
punto D3 de `docs/PARA_DECIDIR.md`. **No se aplicó nada mientras tanto**: no se
aplica a medias, así que la frase del caso de un ganador tampoco entró.

---

## La cláusula 5 del cashback por ETA: dos formas, y una escrita aquí

**21 de septiembre de 2026, punto D1, en dos vueltas.**

**La primera vuelta se hizo sobre una premisa equivocada, y se deshizo.** La
decisión 33 proponía volver `MODALIDAD_TURBO` una lista cerrada de dos, "Turbo
Restaurantes" y "Turbo". Juan la corrigió diciendo que en la práctica son las
tiendas Turbo de cada zona, con nombre propio: Turbo Calleja, Turbo Chico, Turbo
Laureles. Esa corrección se aplicó al modelo del ETA y el documento pasó a
listar tiendas siempre.

Juan lo leyó y lo paró: **esa corrección era sobre el otro Turbo.** Las dark
stores tipo Turbo Carulla venden CPGs y sí se nombran por zona; las campañas de
"15 minutos o Cashback" corren normalmente en **Turbo Restaurantes**, donde están
El Corral Turbo, McDonald's Turbo y las demás marcas. Listar esas marcas serían
decenas y cambiarían de un día para otro, que es justo lo que resolvía la
segunda frase del texto aprobado.

Lo confirma el repositorio: la pieza real se llama "15 minutos o 100% cashback,
Turbo Restaurantes Bogotá" y dice "para redimir en marcas de Turbo
Restaurantes"; los dos T&C publicados nombran la modalidad; y
`data/secciones.json` lista "Turbo" y "Turbo Restaurantes" como dos secciones
distintas de la app.

**Cómo quedó.** El formulario pregunta primero **"¿En qué corre la campaña?"**,
con tres respuestas, y el documento tiene dos formas.

**Forma 1, categoría** (las dos primeras respuestas: Turbo Restaurantes, que
viene marcada, o Turbo). El texto aprobado, **palabra por palabra**, con su
segunda frase:

> **5. Tiendas Participantes.** Participarán todas las tiendas virtuales bajo la
> modalidad "Turbo Restaurantes" al interior de la Plataforma Rappi que se
> encuentren habilitadas en la ciudad de Bogotá durante la vigencia de la
> Campaña. El listado de Tiendas Participantes será el que se encuentre visible
> y disponible para el Usuario/Consumidor dentro del botón "Turbo" de la
> Plataforma Rappi al momento de realizar la orden, el cual podrá variar en
> función de la operación y disponibilidad de cada Aliado Comercial.

Aquí las dos frases no se contradicen: la primera nombra una categoría y la
segunda dice cómo se sabe quién está dentro. Los casos dorados ETA01 y ETA02
quedaron **idénticos, carácter por carácter, a como estaban antes de D1**.

**Forma 2, tiendas concretas** (la tercera respuesta). Esta sí la escribió la
herramienta, con la forma (b) que eligió Juan, y **está pendiente de su visto
bueno antes de publicar un T&C con ella**:

> **5. Tiendas Participantes.** Participarán únicamente las siguientes tiendas
> virtuales del botón "Turbo" al interior de la Plataforma Rappi, habilitadas en
> la ciudad de Bogotá durante la vigencia de la Campaña:
> • Turbo Calleja
> • Turbo Chico
> La disponibilidad de cada Tienda Participante podrá variar en función de la
> operación de cada Aliado Comercial.

**De dónde salió cada palabra.** La primera frase reusa las del documento
aprobado ("Participarán", "tiendas virtuales", "al interior de la Plataforma
Rappi", "botón «Turbo»", "habilitadas en la ciudad de … durante la vigencia de
la Campaña"); lo nuevo es "únicamente las siguientes" y que la modalidad se fue,
porque aquí sí habría contradicción. La segunda es la que Juan propuso, con el
verbo del documento ("podrá variar" en vez de "puede variar", que es como habla
el resto) y sin "y disponibilidad", que sobraba en una frase que ya habla de
disponibilidad.

**La viñeta de condiciones sigue a la cláusula.** Con categoría dice "órdenes
realizadas a través de las Tiendas Participantes identificadas con la modalidad
«Turbo Restaurantes»", igual que el documento aprobado. Con tiendas concretas no
hay categoría que nombrar y cierra en "las Tiendas Participantes".

**Lo que falta, y es dato de Juan.** Las dos categorías que el documento sabe
nombrar hoy son **"Turbo Restaurantes"** y **"Turbo"**, que son las que propuso
la decisión 33 y las que están en `data/secciones.json`. Si una campaña de ETA
puede correr en **Turbo Carulla** como categoría entera, hace falta **el nombre
exacto con el que Legal quiere que salga impreso**, y entra como una opción más
en `MODALIDAD_POR_ALCANCE` de `src/core/derivados_eta.js`. Mientras tanto, una
campaña en dark stores concretas se cubre con la forma 2, nombrándolas.

**Lo que no cambió, a propósito.** La cláusula de Territorio, que ya decía
"dentro de las zonas de cobertura de las Tiendas Participantes … en la ciudad de
Bogotá" y sirve para las dos formas. Y las leyendas de la pieza, que siguen
diciendo "en todo Turbo Restaurantes Bogotá": salen de piezas reales publicadas
y D1 hablaba del T&C, no del arte. Con la forma 1 ya no hay inconsistencia
ninguna; con la forma 2, la leyenda habría que mirarla.
