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
