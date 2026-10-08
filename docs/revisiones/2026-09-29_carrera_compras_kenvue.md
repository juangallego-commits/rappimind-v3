# Carrera de Compras: revisión del modelo y del feedback de Kenvue (campaña Skindays)

29 de septiembre de 2026, con decisiones del 8 de octubre de 2026 · Para Juan Camilo Gallego · Insumo para Claude Code (repo `juangallego-commits/rappimind-v3`, rama `main`)

## Decisiones del 8 de octubre de 2026

Juan me delegó las decisiones de este informe el 8 de octubre de 2026: decidir con criterio de abogado de promociones y preguntarle solo lo que yo no pudiera saber. Cada línea **Decisión de Juan** ya tiene su decisión y su razón. Juan sigue siendo el aprobador: revisa lo que entregue Claude Code antes de autorizar el push.

Lo que cambió desde el 29 de septiembre:

1. **`main` coincide con el informe.** El 8 de octubre cloné `main` (último commit del 2 de octubre de 2026) y busqué cada "Texto actual": todos están letra por letra. Los que viven en `src/core/derivados.js` están armados por partes y también coinciden. Desde el 23 de septiembre la Carrera solo cambió en dos cosas que no tocan este informe: acepta hasta 500 ganadores y un doble espacio en una respuesta ya no bloquea la generación.
2. **Varias tiendas (K1).** Juan aclaró que el KAM quiso decir que suman las compras hechas en la tienda virtual de Éxito y en la tienda virtual Turbo Carulla, y que en una Carrera es normal fijar uno o más comercios donde las compras suman. La herramienta tiene que soportarlo. K1 pasa de "aviso que manda el caso a Legal" a "la Carrera acepta una o varias Tiendas Participantes con un solo ranking".
3. **Quién vende en Turbo (pregunta 2).** Los T&C del Botón Turbo que Rappi publica en https://legal.rappi.com.co/colombia/terminos-y-condiciones-del-boton-turbo/ dicen que los productos del botón los ofrecen y comercializan directamente terceros aliados, no Rappi (página consultada el 8 de octubre de 2026; no muestra fecha de actualización). La frase de K1.c sigue esa misma línea, así que no hace falta una frase distinta para Turbo.
4. **La Carrera corre en los nueve países.** `data/paises.json` la tiene habilitada fuera de Colombia, y en Solicitudes ya hay Carreras de México y Argentina. Por eso los plazos en días corridos salen del término de cada país (`termino_dias`), y ninguna frase nueva es solo colombiana.
5. **Corrección mía en H19.** Dije que los Reactivados tenían el mismo problema que los Nuevos. No es así: su frase fija quién puede participar antes del inicio ("no hayan realizado pedidos … anteriores al inicio de la Campaña"), y eso funciona igual en un acumulado. Se quedan como están.
6. **Corrección mía en H8.** Cité un "principio de necesidad" de la Ley 1581 de 2012. No estoy seguro de que ese nombre aparezca así en la ley, así que lo dejo citado en general: solo se trata lo necesario para la finalidad informada.
7. **Respuesta de Juan del 8 de octubre a las decisiones.** Impuestos: no se mete nada de impuestos en este tipo de T&C (H15 queda en No y la cláusula se queda como está). Reemplazo del ganador: el número de intentos de contacto y el plazo para declarar desierto los pone el KAM en el formulario, no el modelo (K9 ajustado). K11, H20, H26 y los puntos en No: confirmados.
8. **Lo que queda en No.** K2 y K10 (no proceden), H15 (decisión de Juan), H22 (no en esta ronda, queda en pendientes), la frase opcional del Centro de Ayuda de H7 y la idea de que regenerar reemplace la versión anterior (pregunta 16). K4 sigue omitido.
9. **Ubicación en Solicitudes, completa.** Esta vez el conector me devolvió la pestaña entera. Las dos filas de Kenvue siguen en estado "generado" y sin enlace publicado; la marca está revisando el documento. La única otra Carrera real de Colombia es `RM-20261002-0001` (ver H1).

## Tabla resumen

Códigos: **K** es un comentario o cambio de la marca; **H** es un hallazgo de la revisión independiente.
Clasificación: (1) texto legal del modelo, (2) bloque compartido, (3) pregunta o derivado de la herramienta, (4) comercial u operativo, (5) no procede.

| Código | Punto | Clasificación | Prioridad | Decisión |
|---|---|---|---|---|
| K1 | "Aliados Comerciales" sin definir, y "Turbo y Éxito" (dos tiendas) metido en un campo para una | (3) principal, más (2) y (1) | Alta | Aprobado (varias tiendas) |
| K2 | "uno o más pedidos" cambiado por "una o más compras (pedidos)" | (5) | Baja | No |
| K3 | "Haber pagado efectivamente" y fusión de la frase de medios de pago con un asterisco | (1) en parte, (5) el resto | Baja | Aprobado |
| K4 | Valor neto cuando el producto tiene descuento | Omitido por instrucción de Juan | No aplica | Omitido |
| K5 | "¿Solo es un ganador?" | (1) y (3) | Media | Aprobado |
| K6 | "Shark®" en la descripción del premio | (4) | Baja | Aprobado con ajuste (solo la ayuda) |
| K7 | "Rappi contactará a cada ganador": decir cuántos ganadores y premios hay | (1) y (3), mismo arreglo de K5 | Media | Aprobado (con K5) |
| K8 | "número registrado en la cuenta [de Rappi] del ganador" | (3) | Baja | Aprobado |
| K9 | "el premio podrá asignarse" cambiado por "se asignará" | (1) y (3) | Alta | Aprobado con ajuste (números del KAM) |
| K10 | "más favorable para ti" cambiado por "para el Participante" | (5) | Baja | No |
| K11 | "El Organizador y Rappi podrán modificar" y cambio de voz en Modificaciones | (1) con bloque nuevo solo para concurso; la voz, (5) | Alta | Aprobado con ajuste |
| H1 | La leyenda dice "Concurso organizado por {{TIENDA}}": nombra a la tienda (aquí, Turbo) y no al Organizador | (1) leyenda | **Crítica** | Aprobado |
| H2 | Bloque organizador: "Rappi actúa únicamente como plataforma y medio de difusión" choca con lo que Rappi hace en la Carrera | (2) con marcador opcional, y (3) | Alta | Aprobado |
| H3 | Premio físico que entrega Rappi: la naturaleza del premio y la cláusula de responsabilidades se contradicen | (3) y (1) | Alta | Aprobado |
| H4 | Desempate: no dice "de Productos Participantes", no hay regla si el empate persiste, y "fecha y hora" es ambigua | (3) y (1) | Alta | Aprobado |
| H5 | Un pedido con cancelación parcial se cae entero del acumulado, aunque el faltante sea culpa de la tienda | (1) | Alta | Aprobado |
| H6 | Devoluciones y reversiones de pago después de armado el ranking | (1) | Media | Aprobado |
| H7 | Verificación: un pedido inválido saca al participante entero; "pedido válido" no está definido; el reemplazo del ganador está regado en tres cláusulas | (1) y (3) | Media | Aprobado |
| H8 | No hay cómo verificar la edad ni la identidad del ganador | (1) | Alta | Aprobado |
| H9 | Inhabilidades: no cubre a los empleados de la Tienda Participante cuando no es el Organizador | (2) solo concursos | Media | Aprobado con ajuste |
| H10 | Modificaciones de un concurso ya iniciado: hoy se puede reducir el premio o adelantar el cierre | (1) con bloque nuevo | Alta | Aprobado (con K11) |
| H11 | Premio en Créditos: "no canjeable por bienes o servicios" contradice qué son los Créditos; sin vigencia ni plazo de acreditación | (1) y (3) | Media | Aprobado con ajuste |
| H12 | Premio físico sin plazo máximo de entrega, sin decir que no tiene costo ni dónde se entrega | (1) y (3) | Alta | Aprobado con ajuste |
| H13 | "Intentos razonables" de contacto sin definir; la llamada no deja soporte | (1), (3) y (4) | Media | Aprobado |
| H14 | Sin regla para cuando el premio físico deja de existir | (3) | Media | Aprobado |
| H15 | Impuestos: la cláusula no le dice al ganador qué le toca pagar | (1), ya decidida sin cambio | Media | No (Juan, 8 de octubre) |
| H16 | Dos marcas en el campo de marca: "de la marca NEUTROGENA® y LUBRIDERM®" | (3) | Media | Aprobado |
| H17 | Compra mínima: no dice sobre qué valor se mide | (3) | Media | Aprobado |
| H18 | Base del acumulado: "sin impuestos" no es algo que el participante pueda verificar | (1) | Media | Aprobado (opción A) |
| H19 | Segmentos Nuevos y Pro no dicen qué pedidos suman en un acumulado de un mes (Reactivados sí funciona) | (3) y (1) | Media | Aprobado con ajuste |
| H20 | El nombre comercial de la campaña no tiene dónde ir (tocó cambiarlo a mano a "Skindays"), y el consecutivo "· 2" queda impreso en el texto legal | (3) | Alta | Aprobado con ajuste (opcional) |
| H21 | "La participación es gratuita" cuando para participar hay que comprar | (1) | Baja | Aprobado |
| H22 | Publicidad: Rappi se compromete como si fuera el anunciante | (2) | Baja | No, en esta ronda |
| H23 | La fecha de notificación no tiene tope | (3) | Baja | Aprobado |
| H24 | Vigencia: pedidos hechos antes del cierre y entregados después | (1) | Baja | Aprobado |
| H25 | Razón social sin punto final ("Kenvue Colombia S.A") | (4) | Baja | Aprobado (operativo) |
| H26 | Cuentas y medios de pago empresariales en un concurso al mayor comprador (nuevo, 8 de octubre) | (1) | Media | Aprobado |

## Fuentes, alcance y lo que no cuadra

1. **Qué leí.** La copia del repo que está en el Proyecto: `CLAUDE.md`, `modelos/carrera_compras.md`, los bloques (`organizador`, `cobertura_tienda`, `inhabilidades`, `publicidad`, `atencion`, `modificaciones`, `fraude`, `tyc_plataforma`, `responsabilidad`, `datos`, `ley`), `modelos/leyendas/leyenda_carrera_compras_co.md`, `src/core/derivados.js`, `src/core/derivados_leyendas.js`, `src/core/preguntas.js`, `src/core/esquemas.js`, `src/core/nombres.js`, `pruebas/casos_base.json`, las salidas esperadas y `docs/ESPECIFICACION_V3.md`.
2. **Lo que no pude hacer.** No pude clonar `main` (el repo es privado) ni correr `npm run previsualizar`. En su lugar usé el documento real que generó la herramienta para esta campaña (Drive: "T&C · Turbo y Éxito · Carrera de Compras · 15 oct 2026 · 2 · Colombia · RM-20260923-0001"). Ese documento coincide palabra por palabra con el modelo y los derivados de la copia del Proyecto, así que no veo desfase entre la copia y lo que corría el 23 de septiembre. Si `main` cambió después de esa fecha, Claude Code lo tiene que confirmar antes de implementar (está en el prompt).
3. **El nombre del Word.** El Word que revisó la marca no es exactamente lo que generó la herramienta: el documento generado se llama "Turbo y Éxito · Carrera de Compras · 15 oct 2026 · 2" y en el Word dice "Skindays · Carrera de Compras · 15 oct 2026 · 2". Lo cambió Juan a mano antes de enviarlo, porque la herramienta no tiene dónde poner el nombre comercial de la campaña; es un problema que ya tenía detectado y que no se le había pasado a Claude Code (H20). El resto del Word es idéntico al generado, salvo las marcas de Daniela Rivera. Que la cláusula de Cobertura siga diciendo "Turbo y Éxito" no es parte de ese cambio: ahí va la Tienda Participante, que es otro campo y otro problema (K1).
4. **Ubicación en la hoja Solicitudes** ("RappiMind v3 · Base"). Hay dos filas de esta campaña:
   1. `RM-20260922-0012`, generada el 22/09/2026 a las 6:51 p. m. (hora de Colombia): primera versión, con "Turbo y Exito" sin tilde y "Kenvue Colombia S.A." con punto.
   2. `RM-20260923-0001`, generada el 23/09/2026 a las 9:15 a. m. (hora de Colombia): la que revisó la marca. Lleva "· 2" porque la herramienta compara nombres sin tildes: "Turbo y Exito" y "Turbo y Éxito" le dieron la misma dirección y le puso consecutivo.
   3. (29 de septiembre) El conector de Drive solo me devolvió una muestra de la pestaña Solicitudes, así que ubiqué las filas por el código que lleva el título de cada Doc (las horas las convertí de UTC a Colombia y coinciden con la fecha del código). Las respuestas las reconstruí del documento generado: Colombia, nacional, todos los usuarios, todos los medios de pago, sin compra mínima, tienda "Turbo y Éxito", Organizador "Kenvue Colombia S.A" (NIT 890.101.815-9), productos de marca "NEUTROGENA® y LUBRIDERM®", gana el mayor valor en compras, un ganador, desempate por más pedidos, premio físico "Máscara Facial de luz led CryoGlow Shark" de $1.599.900 IVA incluido, entrega Rappi como operador logístico, aviso por llamada a más tardar el 25/11/2026, ocho días hábiles para aceptar, vigencia del 15/10/2026 al 15/11/2026.
5. **El feedback.** Daniela Rivera (Kenvue) dejó tres comentarios y siete cambios con control de cambios. Lorena Castrillón respondió dos de los comentarios ("un único ganador"). No encontré otros comentarios en el archivo.

**Decisión de Juan** va al final de cada punto. Claude Code implementa solo lo que diga "Aprobado" o "Aprobado con ajuste: …". Lo que diga "Pendiente" o "No" no se toca. Desde el 8 de octubre de 2026 todos los puntos tienen decisión (ver "Decisiones del 8 de octubre de 2026"). Cuando una decisión ajusta un texto, el "Texto propuesto" de ese punto ya trae el texto final.

---

## B. Feedback de la marca, comentario por comentario

### K1. "Aliados Comerciales" y la tienda "Turbo y Éxito"

**Dónde.** Cláusula 2 (Cobertura), bloque `cobertura_tienda`: "…los horarios de operación de los Aliados Comerciales."

**Resumen.** Daniela pregunta si los Aliados Comerciales son Turbo y Éxito, porque el término no está definido en el documento, y pide incluirlo.

**¿Es válido?** Sí, y señala algo más grande que una definición.

1. En sentido estricto el término sí está definido: la cláusula 1 remite los términos con mayúscula a los T&C de Uso de la Plataforma. Pero quien lee solo este documento ve que la cláusula 2 define una sola "Tienda Participante" y, en la misma frase, habla de "los Aliados Comerciales" en plural. La duda es razonable.
2. El problema de fondo es que el comercial escribió dos tiendas en un campo que es para una ("Tienda (marca comercial)"). El modelo de Carrera es de una sola tienda, y el filtro de entrada pregunta "¿Participan varias tiendas?" justamente para mandar este caso a Legal. La herramienta no cruza la respuesta del filtro con lo que se escribe después, así que el caso pasó. Resultado: el documento dice que la Tienda Participante es "Turbo y Éxito", que no es una tienda, y no dice si las compras en Turbo y en Éxito se suman en un mismo acumulado. En un concurso eso define quién gana.
3. La Carrera no tiene la pregunta de Turbo que sí tienen Cashback, Descuento y Cupón, así que el documento no puede decir si cuentan los pedidos dentro o fuera del botón Turbo. Además, según `data/paises.json`, Turbo en Colombia lo opera Moustache Beams S.A.S., una empresa de Rappi (ver H1 y la pregunta 2).

**Clasificación.** (3) principal, más (2) y (1). Actualizado el 8 de octubre de 2026 con la aclaración de Juan: el KAM quiso decir que suman las compras en la tienda virtual de Éxito y en la tienda virtual Turbo Carulla, y en una Carrera es normal fijar uno o más comercios donde las compras suman. La propuesta del 29 de septiembre (avisar y mandar el caso a Legal) queda reemplazada por esta.

**Propuesta.**

K1.a · (3) La Carrera acepta una o varias Tiendas Participantes, con un solo ranking. Archivos: `src/core/esquemas.js`, `src/core/preguntas.js`, `src/core/validaciones.js`, `src/core/nombres.js`, `src/core/ayuda.js`, `src/core/derivados.js`, la pantalla del formulario (skill `flujo-y-ux`) y lo que guarda la columna `tienda` de Solicitudes (`src/server/Api.js`, skill `frontera-apps-script`).

1. En la Carrera, la pregunta `tienda` pasa a ser una lista de filas, como la de tiendas del Cashback Multitienda, con mínimo una y máximo diez. Cada fila tiene dos preguntas:
   1. "Tienda". Ayuda: "Como aparece en la app, sin la palabra Turbo. Por ejemplo: Éxito o Carulla. Si son varias, agrega una fila por tienda."
   2. "En cuál de sus tiendas", con las mismas cuatro opciones de hoy (`OPCIONES_TIENDA_TURBO`).
2. Los pedidos en todas las tiendas de la lista suman a un mismo acumulado por participante y a un solo ranking.
3. Sale del filtro de entrada de la Carrera la pregunta "¿Participan varias tiendas?". La línea de la ayuda que hoy dice "Participan varias tiendas en un mismo concurso: consúltalo." se quita, porque la herramienta ya lo hace.
4. Aviso suave si una fila trae " y ", ",", "/", "+" o la palabra "Turbo" junto a otro nombre: "Parece que escribiste más de una tienda en la misma fila. Agrega cada tienda en su propia fila." Con un botón para seguir ("Es una sola tienda, se llama así"), porque hay marcas con "y" o "&" en el nombre.
5. La columna `tienda` de Solicitudes guarda los nombres separados por coma. Una campaña guardada antes, con `tienda` como texto, se lee como una lista de una fila, para que Ampliar y el historial sigan funcionando.
6. El nombre de registro con una tienda no cambia. Con varias, lo decide Claude Code en `src/core/nombres.js` y lo deja escrito en `docs/DECISIONES.md` (por ejemplo, "Éxito y Carulla · Carrera de Compras · 15 oct 2026"), sin tocar los nombres de una tienda.

Derivados nuevos de la Carrera (`derivadosCarrera`). Con una tienda, el documento sale igual que hoy, salvo los cambios aprobados en este informe.

`TEXTO_TIENDAS_PARTICIPANTES` (FRAGMENTO, nuevo):

```
Una tienda:  **{tienda}** (en adelante, la “Tienda Participante”)
Varias:      las tiendas **{tienda 1}**, **{tienda 2}** y **{tienda 3}** (en adelante, cada una, una “Tienda Participante” y, en conjunto, las “Tiendas Participantes”)
```

`LA_TIENDA` (FRAGMENTO, nuevo):

```
Una tienda:  la Tienda Participante
Varias:      las Tiendas Participantes
```

`EN_LA_TIENDA` (FRAGMENTO, nuevo):

```
Una tienda:  en la Tienda Participante
Varias:      en cualquiera de las Tiendas Participantes
```

`TEXTO_ACUMULADO_TIENDAS` (ORACIÓN, nuevo, solo con varias tiendas; con una, vacío):

```
Los pedidos de Productos Participantes realizados en cualquiera de las Tiendas Participantes suman a un mismo acumulado por participante.
```

Modelo (`modelos/carrera_compras.md`), cláusula de Cobertura. La Carrera deja de incluir el bloque compartido y lleva su propia cláusula. Texto actual:

```
[[INCLUIR:cobertura_tienda]]
```

Texto propuesto:

```
§ Cobertura. La Campaña es válida exclusivamente en **{{TEXTO_TERRITORIO}}** (en adelante, el “Territorio”), dentro de las zonas de cobertura de {{TEXTO_TIENDAS_PARTICIPANTES}} en la Plataforma Rappi. La disponibilidad puede variar según tu ubicación y los horarios de operación de {{LA_TIENDA}}.
```

Con una tienda sale letra por letra igual al bloque compartido con el cambio de K1.c.

Modelo, Mecánica, primera viñeta. Texto actual:

```
• Realizar uno o más pedidos de Productos Participantes en la Tienda Participante a través de la Plataforma Rappi durante la vigencia de la Campaña.
```

Texto propuesto:

```
• Realizar uno o más pedidos de Productos Participantes {{EN_LA_TIENDA}} a través de la Plataforma Rappi durante la vigencia de la Campaña.
```

Modelo, párrafo del acumulado: al final del párrafo que deja H5 se agrega `[[?TEXTO_ACUMULADO_TIENDAS]] {{TEXTO_ACUMULADO_TIENDAS}}[[/?]]`.

`textoProductos` (`src/core/derivados.js`): las tres frases dicen hoy "de la Tienda Participante" o "en la Tienda Participante". Con varias tiendas usan las formas de `LA_TIENDA` y `EN_LA_TIENDA`. Con una tienda, salen como hoy (más el cambio de marcas de H16).

```
todos:        Participan en el concurso todos los productos del catálogo de {LA_TIENDA} en la Plataforma Rappi (en adelante, los “Productos Participantes”).
marca:        Participan en el concurso únicamente los productos de {la marca X / las marcas X y Y} disponibles {EN_LA_TIENDA} a través de la Plataforma Rappi (en adelante, los “Productos Participantes”).
especificos:  Participan en el concurso únicamente los siguientes productos de {LA_TIENDA}, identificados con su nombre y su código de barras EAN (en adelante, los “Productos Participantes”):
```

K1.b · (3) y (1) Turbo en la Carrera, tienda por tienda. `TEXTO_TIENDA_TURBO` de la Carrera (ORACIÓN, nuevo en la Carrera) es una oración por cada tienda que tenga respuesta de Turbo, en el orden de la lista, separadas por un espacio. "No tiene tienda en Turbo" no imprime nada. `{referencia}` es "la Tienda Participante" con una tienda, y el nombre de la tienda en negrilla con varias. Las frases del Cashback hablan del "Beneficio", que en la Carrera no existe; por eso son propias:

```
normal: En {referencia}, solo suman al acumulado los pedidos realizados por fuera del botón “Turbo” de la Plataforma Rappi.
turbo:  En {referencia}, solo suman al acumulado los pedidos realizados dentro del botón “Turbo” de la Plataforma Rappi.
ambas:  En {referencia}, suman al acumulado los pedidos realizados tanto dentro como por fuera del botón “Turbo” de la Plataforma Rappi.
```

Modelo, cláusula Productos participantes (incluye K1.c). Texto actual:

```
§ Productos participantes. {{TEXTO_PRODUCTOS}} Los productos son ofrecidos y comercializados directamente por los Aliados Comerciales.
```

Texto propuesto:

```
§ Productos participantes. {{TEXTO_PRODUCTOS}}[[?TEXTO_TIENDA_TURBO]] {{TEXTO_TIENDA_TURBO}}[[/?]] Los Productos Participantes son ofrecidos y comercializados directamente por {{LA_TIENDA}}, y no por Rappi.
```

Así quedaría en esta campaña, después de la frase de productos: "En **Éxito**, solo suman al acumulado los pedidos realizados por fuera del botón “Turbo” de la Plataforma Rappi. En **Carulla**, solo suman al acumulado los pedidos realizados dentro del botón “Turbo” de la Plataforma Rappi. Los Productos Participantes son ofrecidos y comercializados directamente por las Tiendas Participantes, y no por Rappi."

**Decisión de Juan (K1.a):** Aprobado. Juan confirmó que la Carrera debe aceptar uno o más comercios con un solo ranking. Es un hecho del negocio, y los textos nuevos salen de la estructura de frases ya aprobadas (Cobertura y Turbo).

**Decisión de Juan (K1.b):** Aprobado. Sin esta frase el documento no dice si cuenta la tienda de Turbo, que en esta campaña es justo la diferencia entre Éxito y Carulla.

K1.c · (2) Bloque `cobertura_tienda`. Con el cambio de K1.a la Carrera ya no lo incluye; lo siguen usando `cashback`, `descuento` y `cupon`, los tres de una sola tienda (confirmado en `main` el 8 de octubre), así que la frase nueva es exacta en todos.

Texto actual:

```
La disponibilidad puede variar según tu ubicación y los horarios de operación de los Aliados Comerciales.
```

Texto propuesto:

```
La disponibilidad puede variar según tu ubicación y los horarios de operación de la Tienda Participante.
```

La frase de quién comercializa en la Carrera ya va en el texto propuesto de K1.b. "Y no por Rappi" repite lo que publican los T&C del Botón Turbo (los productos los comercializan terceros aliados, no Rappi) y lo que dice el objeto social de Rappi S.A.S. (conecta, no vende), y refuerza la regla 1.

**Decisión de Juan (K1.c):** Aprobado. En los tres modelos que conservan el bloque hay una sola tienda, y "los Aliados Comerciales" en plural fue lo que confundió a la marca.

K1.d · (4) Esta campaña. Como está, no se publica: el documento dice que hay una sola tienda llamada "Turbo y Éxito" y no dice que suman Éxito y Carulla en Turbo.

**Decisión de Juan (K1.d):** Aprobado: cuando Claude Code termine y Juan autorice el push, el KAM vuelve a generar la Carrera con dos filas, Éxito con "Solo en la tienda normal" y Carulla con "Solo en la tienda de Turbo" (así lo describió Juan; el KAM lo confirma al llenar), con el Organizador "Kenvue Colombia S.A." (con punto) y el nombre comercial "Skindays" (H20).

### K2. "uno o más pedidos" por "una o más compras (pedidos)"

**Dónde.** Cláusula 7 (Mecánica), primera viñeta.

**Resumen.** Cambia "Realizar uno o más pedidos" por "Realizar una o más compras (pedidos)".

**¿Es válido?** No. "Pedido" es la unidad que usa todo el documento: el acumulado, las cancelaciones, las exclusiones y el desempate hablan de pedidos. Meter "compras" con un paréntesis crea un segundo término y deja la duda de si un pedido con varios productos es una compra o varias, que en el criterio de "más pedidos" cambia el resultado. El "una" solo se sigue del cambio a "compras".

**Clasificación.** (5). Sin cambio.

**Decisión de Juan:** No. "Pedido" es la unidad que usa todo el documento y meter "compras" cambia el conteo del criterio de más pedidos.

### K3. "Haber pagado efectivamente" y la frase de medios de pago

**Dónde.** Cláusula 7 (Mecánica), tercera viñeta y el párrafo siguiente.

**Resumen.** Cambia "Pagar los pedidos con un medio de pago válido para la Campaña" por "Haber pagado efectivamente los pedidos con cualquiera de los medios de pago habilitados en la Plataforma Rappi*", y borra la frase "Campaña válida para pedidos pagados con cualquiera de los medios de pago habilitados en la Plataforma Rappi.", dejando un asterisco.

**¿Es válido?** En parte.

1. Lo que sirve: "efectivamente". Deja claro que cuenta el pedido pagado de verdad, no uno con pago rechazado.
2. Lo que no: la viñeta es texto fijo y el medio de pago es variable (todos, todos menos efectivo, solo RappiCard). Escribir "cualquiera de los medios" en la viñeta la vuelve falsa en las otras dos opciones. El asterisco es un recurso que la herramienta quitó a propósito (`docs/PENDIENTES_LEGAL.md`, cambio 5 frente al modelo de julio: "Se quitaron los asteriscos impresos").

**Clasificación.** (1) la palabra; (5) el resto. Solo Carrera: la viñeta de Cashback y Descuento es otra y no se toca.

Texto actual:

```
• Pagar los pedidos con un medio de pago válido para la Campaña.
```

Texto propuesto:

```
• Pagar efectivamente los pedidos con un medio de pago válido para la Campaña, según se indica a continuación.
```

**Decisión de Juan:** Aprobado. "Efectivamente" deja claro que no cuenta un pedido con pago rechazado; la frase de la marca sobre todos los medios de pago no se toma porque el medio de pago es variable.

### K4. Valor neto después de descuento

Omitido por instrucción tuya. No lo analicé ni lo toco en ningún otro punto de este informe.

### K5. "¿Solo es un ganador?"

**Dónde.** Cláusula 9 (Premio), con eco en la introducción y en las cláusulas 8 y 11.

**Resumen.** Daniela pregunta si hay un solo ganador; Lorena responde que sí.

**¿Es válido?** Sí. Los derivados ya se ajustan al número ("Resultará ganador el participante que ocupe la primera posición", "El ganador recibirá"), pero cuatro frases fijas del modelo quedan siempre en plural: la introducción ("Los ganadores se determinan…"), la cláusula 8 ("Antes de declarar a los ganadores"), la cláusula 11 ("Rappi contactará a cada ganador") y la cláusula 9, que dice "La cantidad de premios es limitada y corresponde a la indicada en esta cláusula" cuando la cláusula no indica ningún número. La promoción tiene que informar con claridad cuántos premios hay (Ley 1480 de 2011, art. 33), y una duda en eso se lee a favor del consumidor (art. 34).

**Clasificación.** (1) y (3). Tres derivados nuevos que salen de `numeroGanadores`; no hay pregunta nueva.

**Propuesta.** Archivos: `modelos/carrera_compras.md` y `src/core/derivados.js` (`derivadosCarrera`).

1. Introducción. Texto actual:

```
Los ganadores se determinan exclusivamente con base en un criterio objetivo, medible y verificable de compras efectivamente realizadas durante la vigencia, y en ningún caso por sorteo, rifa, azar o cualquier otro mecanismo de suerte.
```

Texto propuesto:

```
El resultado del concurso se define exclusivamente con base en un criterio objetivo, medible y verificable de compras efectivamente realizadas durante la vigencia, y en ningún caso por sorteo, rifa, azar o cualquier otro mecanismo de suerte.
```

2. Cláusula 8. Texto actual: `Antes de declarar a los ganadores, Rappi verificará…` Texto propuesto: `Antes de declarar {{GANADOR_OBJETO}}, Rappi verificará…` (si apruebas H7, el párrafo completo es el de H7).

   `GANADOR_OBJETO` (FRAGMENTO, nuevo): con 1, `al ganador`; con más de 1, `a los ganadores`.

3. Cláusula 9. Texto actual:

```
La cantidad de premios es limitada y corresponde a la indicada en esta cláusula.
```

Texto propuesto:

```
{{TEXTO_CANTIDAD_PREMIOS}}
```

   `TEXTO_CANTIDAD_PREMIOS` (ORACIÓN, nuevo, con `letrasYCifra`):
   Con 1: `La Campaña tiene un (1) solo ganador y entrega un (1) solo premio.`
   Con más de 1: `La Campaña tiene {N en letras} ({N}) ganadores y entrega {N en letras} ({N}) premios iguales, uno para cada ganador.`

4. Cláusula 11, viñeta Notificación. Texto actual:

```
• **Notificación:** Rappi contactará a cada ganador mediante {{MEDIO_NOTIFICACION}}, a más tardar el **{{FECHA_NOTIFICACION}}**.
```

Texto propuesto:

```
• **Notificación:** Rappi contactará {{A_CADA_GANADOR}} mediante {{MEDIO_NOTIFICACION}}, a más tardar el **{{FECHA_NOTIFICACION}}**.
```

   `A_CADA_GANADOR` (FRAGMENTO, nuevo): con 1, `al ganador`; con más de 1, `a cada ganador`.

El título "Selección de ganadores y desempate" lo dejo igual: es un encabezado genérico.

**Decisión de Juan:** Aprobado. La promoción tiene que decir cuántos premios hay, y el singular y el plural deben cuadrar con el número de ganadores.

### K6. "Shark®"

**Dónde.** Cláusula 9, descripción del premio.

**Resumen.** Agrega "®" después de "Shark".

**¿Es válido?** Como dato, sí; no es un tema legal del modelo. La descripción del premio es texto libre del comercial (regla 6 de `CLAUDE.md`): si la marca lo quiere con ®, el comercial lo escribe así. Una nota para la pieza: nombrar el producto de un tercero para describir el premio es uso informativo de la marca ajena y está permitido, siempre que el arte no sugiera que Shark patrocina el concurso (por ejemplo, con su logo en protagonismo).

**Clasificación.** (4). Opcional (3): ayuda de la pregunta `descripcionPremio`: "Escríbelo como lo nombra la marca, con ® si lo lleva."

**Decisión de Juan:** Aprobado con ajuste: solo la ayuda de `descripcionPremio` ("Escríbelo como lo nombra la marca, con ® si lo lleva."). El texto legal no cambia.

### K7. "Rappi contactará a cada ganador"

**Dónde.** Cláusula 11, viñeta Notificación.

**Resumen.** Daniela repite la pregunta y pide que el documento diga cuántos ganadores hay, cuántos premios y cómo se definen. Lorena responde que es un único ganador.

**¿Es válido?** Sí. Lo resuelven los puntos 3 y 4 de K5: con `TEXTO_CANTIDAD_PREMIOS` el documento dice cuántos ganadores y cuántos premios, y "cómo se definen" ya está en las cláusulas 7 y 8 (criterio y ranking).

**Clasificación.** (1) y (3), mismo arreglo de K5.

**Decisión de Juan:** Aprobado, con el mismo arreglo de K5.

### K8. "cuenta [de Rappi] del ganador"

**Dónde.** Cláusula 11, viñeta Notificación (derivado `MEDIO_NOTIFICACION`).

**Resumen.** Agrega "de Rappi" para aclarar de qué cuenta se habla.

**¿Es válido?** Sí, es cosmético. Mejor con el término que el documento sí define, "Plataforma Rappi".

**Clasificación.** (3). Solo lo usa la Carrera. Cambian las salidas esperadas de CC01, CC03, CC04 y CC06.

Texto actual (`MEDIO_NOTIFICACION_POR_OPCION` en `src/core/derivados.js`):

```
correo:  el correo electrónico registrado en la cuenta del ganador
llamada: una llamada telefónica al número registrado en la cuenta del ganador
```

Texto propuesto:

```
correo:  el correo electrónico registrado en la cuenta del ganador en la Plataforma Rappi
llamada: una llamada telefónica al número registrado en la cuenta del ganador en la Plataforma Rappi
```

La opción `plataforma` queda igual.

**Decisión de Juan:** Aprobado. La frase de llamada queda como la de H13, que ya incluye "en la Plataforma Rappi".

### K9. "podrá asignarse" por "se asignará"

**Dónde.** Cláusula 11, viñeta Aceptación.

**Resumen.** Vuelve obligatorio pasar el premio al siguiente del ranking cuando el ganador no aparece o no acepta.

**¿Es válido?** Sí, con condiciones.

1. "Podrá" deja al Organizador y a Rappi la opción de no entregar el premio anunciado. El premio anunciado obliga (Ley 1480, arts. 29 y 33), y una condición que permite no entregarlo por decisión de quien lo ofrece es la que la SIC lee en contra del anunciante (art. 34).
2. El mismo documento ya usa la regla obligatoria en la cláusula de inhabilidades ("se seleccionará a un nuevo ganador"). Con "podrá" en aceptación, hay dos reglas distintas para el mismo hecho.
3. Menos discreción es menos espacio para que alguien sostenga que el ganador lo eligió una persona y no el ranking, que es la defensa frente al régimen de azar.
4. Las condiciones: el reemplazo tiene que cumplir los requisitos, debe tener el mismo plazo para aceptar, y la cadena necesita un final. Sin final, un premio sin reclamar queda en el aire.

**Clasificación.** (1). El texto incluye H8 (identidad y edad) y H13 (intentos de contacto); si alguno no se aprueba, se quita su parte.

Texto actual:

```
• **Aceptación:** el ganador deberá aceptar el premio y confirmar sus datos, y su dirección de entrega cuando corresponda, dentro de un plazo de **{{PLAZO_CONFIRMACION}}** a partir de la notificación. Si Rappi no logra contactarlo tras intentos razonables, o si no acepta el premio o no confirma sus datos dentro de ese plazo, el premio podrá asignarse al siguiente participante del ranking, de forma sucesiva.
```

Texto propuesto:

```
• **Aceptación:** el ganador deberá aceptar el premio, confirmar sus datos y su dirección de entrega cuando corresponda, y acreditar su identidad y su mayoría de edad con su documento de identidad, dentro de un plazo de **{{PLAZO_CONFIRMACION}}** a partir de la notificación. Al aceptar el premio, el ganador declara que cumple los requisitos para participar y que no se encuentra en ninguno de los casos de la cláusula “Quiénes no pueden participar”. Si Rappi no logra contactarlo después de {{TEXTO_INTENTOS_CONTACTO}}, o si no acepta el premio, no confirma sus datos o no acredita su identidad dentro de ese plazo, perderá el derecho al premio, y este se asignará al siguiente participante del ranking que cumpla los requisitos de la Campaña, de forma sucesiva y con el mismo plazo para aceptarlo. Si dentro de los **{{DIAS_DESIERTO}}** siguientes a la fecha de notificación indicada en esta cláusula ningún participante acepta el premio, este se declarará desierto.
```

Ajuste del 8 de octubre de 2026 (instrucción de Juan): el número de intentos y el plazo para declarar desierto no los fija el modelo; los pone el KAM en el formulario, como el plazo para aceptar. Lo legal queda fijo: el premio pasa al siguiente del ranking de manera obligatoria, el reemplazo tiene que cumplir los requisitos, tiene el mismo plazo y la cadena tiene un final.

Preguntas nuevas (`src/core/esquemas.js` y `src/core/preguntas.js`), en el paso del premio, al lado de `plazoConfirmacion`:

1. `intentosContacto`: número de 1 a 5, obligatoria. Enunciado: "¿Cuántas veces se intenta contactar al ganador antes de pasar al siguiente del ranking?" Ayuda: "Lo que de verdad se va a hacer. Con varios intentos, cada uno va en un día hábil distinto." Por qué: "Si el ganador dice que nunca lo contactaron, el documento muestra cuántas veces había que intentarlo."
2. `diasDesierto`: número de 15 a 90, obligatoria. Enunciado: "Si nadie acepta el premio, ¿en cuántos días, contados desde la fecha de aviso, se declara desierto?" Ayuda: "Deja tiempo para que el premio pase a los siguientes del ranking." Por qué: "La cadena de reemplazos necesita un final; si no lo tiene, el premio queda en el aire." Aviso suave si es menor que tres veces el plazo para aceptar: "Con ese plazo casi no alcanza a pasar el premio al siguiente del ranking."

`TEXTO_INTENTOS_CONTACTO` (FRAGMENTO, nuevo):

```
Uno:    al menos un (1) intento de contacto
Varios: al menos {N en letras} ({N}) intentos realizados en días hábiles distintos
```

`DIAS_DESIERTO` (FRAGMENTO, nuevo): `{N en letras} ({N})` más el término de días del país (`termino_dias`). En Colombia, "treinta (30) días calendario"; en México, "días naturales"; en Argentina, "días corridos".

**Decisión de Juan:** Aprobado con ajuste: el texto propuesto ya trae el ajuste. El reemplazo obligatorio es la regla legal; el número de intentos y el plazo para declarar desierto los pone el KAM (instrucción de Juan del 8 de octubre de 2026). El premio desierto no tiene destino legal obligatorio en un concurso sin azar; queda en cabeza del Organizador.

### K10. "más favorable para ti" por "para el Participante"

**Dónde.** Cláusula 14, bloque `publicidad`.

**Resumen.** Cambia la segunda persona por "el Participante".

**¿Es válido?** No.

1. Todo el documento habla de tú ("debes", "tu cuenta", "descalificarte"). Cambiarlo en una frase deja el documento con dos voces.
2. "Participante" con mayúscula no está definido en el documento.
3. La voz directa es una decisión de claridad frente al consumidor, no un error.
4. El bloque lo comparten Cashback, Cashback Multitienda, Carrera, Descuento y Cupón: el cambio se regaría a todos.

**Clasificación.** (5). Sin cambio.

**Decisión de Juan:** No. El documento entero habla de tú y "Participante" no está definido.

### K11. "El Organizador y Rappi podrán modificar"

**Dónde.** Cláusula 16, bloque `modificaciones`.

**Resumen.** Agrega al Organizador como quien puede modificar, cambia "para ti" por "para los Participantes" y quita el "te" de "informarte".

**¿Es válido?** En el fondo sí; en la forma no.

1. Lo de fondo: el Organizador "responde por su desarrollo, sus condiciones y el beneficio o premio ofrecido" (cláusula 1). Un documento donde solo Rappi puede cambiar las condiciones de una campaña que organiza otro dice lo contrario de la regla 1: cambiar las condiciones es lo que hace un organizador. Lo coherente es que modifique el Organizador, de común acuerdo con Rappi, que publica y opera.
2. Lo de forma: "El Organizador y Rappi podrán" no dice si juntos o cada uno por su lado; el cambio de voz tiene los problemas de K10; y sin el "te", "informar" queda sin a quién.
3. Por qué no en el bloque compartido: `modificaciones` lo incluye el Cashback Multitienda, que no tiene un "Organizador" sino "Tiendas Participantes" que organizan cada una lo suyo. Cambiar el bloque imprimiría allí un término sin definir. Por eso va en un bloque nuevo, solo para concurso, junto con H10.

**Clasificación.** (1): bloque nuevo `modelos/bloques/modificaciones_concurso.md`, incluido solo por `carrera_compras`. La voz, (5). Si después quieres lo mismo en Cashback, Descuento y Cupón, es otra decisión (pregunta 4).

Texto actual (bloque `modificaciones`, tal como sale en la Carrera):

```
§ Modificaciones. Rappi podrá modificar los presentes Términos y Condiciones siempre que se cumplan las siguientes condiciones:
• Las modificaciones se publicarán en el mismo medio en que se publicaron los Términos y Condiciones originales.
• Las modificaciones no afectarán los beneficios ya acreditados ni los premios ya asignados con anterioridad a la modificación.
• Las modificaciones que resulten menos favorables para ti regirán a partir del día siguiente a su publicación y no tendrán efecto retroactivo.
Si las modificaciones implican un cambio sustancial en las condiciones de la Campaña, como la reducción del beneficio o del premio, la modificación de los comercios o productos participantes o la anticipación de la fecha de finalización, Rappi hará esfuerzos razonables para informarte a través de los canales disponibles en la Plataforma Rappi.
```

Texto propuesto (bloque nuevo `modificaciones_concurso.md`):

```
%% Bloque: modificaciones de un concurso · versión 1.0 · 8 de octubre de 2026 · solo para modalidades con premio y ganador
§ Modificaciones. El Organizador, de común acuerdo con Rappi, podrá modificar los presentes Términos y Condiciones siempre que se cumplan las siguientes condiciones:
• Las modificaciones se publicarán en el mismo medio en que se publicaron los Términos y Condiciones originales.
• Las modificaciones no afectarán los premios ya asignados con anterioridad a la modificación.
• Las modificaciones que resulten menos favorables para ti regirán a partir del día siguiente a su publicación y no tendrán efecto retroactivo.
• Una vez iniciada la vigencia, no se reducirán el premio ni el número de ganadores, no se retirarán Productos Participantes ni Tiendas Participantes, no se agregarán requisitos para participar o para sumar al acumulado, no se cambiará el criterio del ranking y no se anticipará la fecha de finalización de la Campaña.
Si las modificaciones implican un cambio sustancial en las condiciones de la Campaña, Rappi hará esfuerzos razonables para informarte a través de los canales disponibles en la Plataforma Rappi.
```

Y en `modelos/carrera_compras.md`: `[[INCLUIR:modificaciones]]` pasa a `[[INCLUIR:modificaciones_concurso]]`.

La cuarta viñeta es H10 y cuadra con la función de "Ampliar" de la herramienta, que solo mueve la vigencia hacia adelante y solo sube los números. Lo de no agregar requisitos sale de un caso real del canal de Legal: una Carrera que, ya publicada, pasó a exigir dos referencias de un producto y después a premiar solo a quienes compraran ese producto.

**Decisión de Juan:** Aprobado con ajuste: el texto propuesto ya trae la cuarta viñeta ajustada (tampoco se retiran Tiendas Participantes ni se agregan requisitos a mitad de camino, por el caso Bocatto). El bloque nuevo queda solo para la Carrera; llevar lo mismo a Cashback, Descuento y Cupón queda anotado para la próxima revisión de bloques compartidos (pregunta 4).

---

## A. Revisión jurídica independiente, cláusula por cláusula

### A.0 ¿Puede calificarse como juego de suerte y azar?

Conclusión: el modelo está bien parado, con cuatro rendijas que conviene cerrar.

La Ley 643 de 2001 define el juego de suerte y azar por la combinación de pago por participar, premio y azar (art. 5), y los promocionales son esa misma figura con fines de publicidad (art. 31); los dos exigen autorización y pago de derechos de explotación. La Carrera tiene pago (la compra) y premio, pero el ganador sale de un ranking objetivo, así que le falta el azar, que es lo que la convertiría en juego. La defienden la frase de la introducción ("en ningún caso por sorteo, rifa, azar…"), el ranking, el desempate objetivo, la leyenda ("Concurso sin azar") y el filtro de entrada, que manda a Legal todo lo que tenga sorteo.

Por dónde podría colarse discreción o azar:

1. El empate que persiste después del desempate no tiene regla (H4).
2. "El premio podrá asignarse" deja el reemplazo a criterio de alguien (K9).
3. En la verificación, un pedido inválido saca al participante sin una regla de recálculo (H7).
4. La base del acumulado ("sin impuestos") no la puede comprobar el participante (H18).

Ninguna vuelve hoy la Carrera un juego de azar, pero todas debilitan la frase "objetivo, medible y verificable", que es la defensa.

### A.1 Encabezado y nombre de la campaña

**H20. El nombre comercial de la campaña no tiene dónde ir.** Prioridad alta. Clasificación (3).

1. **Qué pasa hoy.** El nombre lo arma la herramienta con la tienda, el beneficio y la fecha (`src/core/nombres.js`), por tu decisión del 16 de septiembre de no tener etiqueta libre. Esa convención hace tres cosas bien: el nombre no puede contradecir el articulado (hay una prueba para el caso de un 99 en el título y un 50 abajo), dos campañas nunca se llaman igual (el consecutivo) y el título del Doc, la fila de Solicitudes y la dirección de Squarespace hablan de lo mismo. Lo que no deja es poner el nombre con el que la marca sale al público. Por eso tocó cambiar a mano "Turbo y Éxito · Carrera de Compras · 15 oct 2026 · 2" por "Skindays · …" en el Word. Si cada campaña con nombre propio pasa por una edición a mano, se pierde el determinismo (regla 2 de `CLAUDE.md`) y lo publicado deja de ser lo que está en Drive.
2. **El "· 2".** Como el nombre de registro y el nombre que va en el articulado son el mismo, el consecutivo queda impreso dentro de la denominación legal ("campaña promocional denominada “… · 2”").
3. **Propuesta: separar los dos nombres, sin tocar la convención.**
   1. **Nombre de registro.** El de hoy, sin ningún cambio. Sigue siendo el título del Doc, la columna `nombre_campana` de Solicitudes, la dirección de Squarespace y la base del consecutivo. `nombreDeCampana`, `direccionDeCampana` y `sufijoLibreDeNombre` no se tocan.
   2. **Nombre comercial.** Pregunta nueva `nombreComercial`, que llena el KAM. Es el que se imprime en el articulado, en `{{NOMBRE_CAMPANA}}` y `{{NOMBRE_CAMPANA_MAYUS}}`, en todos los tipos de campaña. Si el KAM no lo llena, se imprime el nombre de registro, como hoy (pregunta 17). Se guarda en una columna nueva al final de Solicitudes y se muestra en el historial junto al nombre de registro, para que la campaña se encuentre por los dos.
   3. **Con nombre comercial, el "· 2" ya no llega al texto legal.** Sigue en el título del Doc y en la dirección, que es donde sirve.
4. **La pregunta** (`src/core/esquemas.js` y `src/core/preguntas.js`, al lado del nombre de la tienda):
   1. Enunciado: "¿Con qué nombre sale la campaña al público?"
   2. Ayuda: "El nombre que va en la pieza, por ejemplo Skindays. Sin porcentajes, precios ni cifras: el beneficio lo dice el documento."
   3. Por qué: "El documento dice cómo se llama la campaña. Si la pieza usa otro nombre, el usuario no sabe cuáles son sus condiciones."
5. **Validación** (`src/core/validaciones.js`), para no revivir el riesgo que llevó a quitar la etiqueta libre:
   1. Entre 3 y 60 caracteres, en una sola línea y sin emojis. Mensaje: "El nombre tiene que tener entre 3 y 60 caracteres, en una sola línea."
   2. Sin porcentajes, signos de moneda ni cifras, salvo un año de cuatro cifras (para que pasen nombres como "Mundial 2026" y no pasen "Skindays 50%" ni "3x2"). Mensaje: "El nombre no puede llevar porcentajes, precios ni cifras, salvo el año. El beneficio lo dice el documento."
   3. Sin palabras de azar: sorteo, rifa, lotería, azar, suerte (y en Brasil sorteio, rifa, loteria, sorte). Un "Gran Sorteo Skindays" le quita a la Carrera su defensa frente al régimen de juegos de suerte y azar (A.0). Mensaje: "El nombre no puede hablar de sorteo, rifa, lotería, azar ni suerte. Esta campaña no es un juego de azar."
   4. La misma revisión de anotaciones internas que ya existe para los valores del país (`tieneMarcaDeAnotacion`): nada de "(confirmar)", "TODO", "??", "{{" ni "[[".
6. **Regla 6 de `CLAUDE.md`.** Hoy el nombre comercial no está en la lista de campos de texto libre permitidos de la especificación. Hay que agregarlo en `docs/ESPECIFICACION_V3.md` y dejar en `docs/DECISIONES.md` que esto complementa la decisión del 16 de septiembre: la etiqueta libre sigue fuera del nombre de registro, y el riesgo que la motivó lo cubre la validación.
7. **Lo operativo, mientras tanto.** Si una campaña tiene que salir antes de que esto exista, la edición a mano se limita al título y a la denominación, y se deja anotada en la fila de Solicitudes.

**Decisión de Juan:** Aprobado con ajuste: el nombre comercial es opcional. Si el KAM no lo llena, sale el nombre de registro como hoy, las salidas esperadas de los casos que ya existen no cambian y un Cashback sencillo no gana un paso más. Regenerar sigue creando una versión nueva con consecutivo y no reemplaza la anterior: un T&C que ya se mandó a una marca o se publicó tiene que poder rastrearse.

### A.2 Introducción

Plural fijo "Los ganadores se determinan…": ver K5, punto 1. Por lo demás, la introducción cumple su función frente al régimen de azar.

### A.3 Cláusula 1. Organizador y rol de Rappi (bloque `organizador`)

**H2. "Rappi actúa únicamente como plataforma… y como medio de difusión".** Prioridad alta. Clasificación (2) con marcador opcional, y (3).

En la Carrera, el mismo documento dice que Rappi arma el ranking, verifica la elegibilidad, contacta a los ganadores y, en esta campaña, entrega el premio; la cláusula 20 incluso lo hace responsable de aplicar el criterio. El "únicamente" queda desmentido por el propio documento, y una contradicción sobre el papel de Rappi es justo el hilo del que una autoridad o un reclamante tiraría para decir que Rappi es coorganizador. La regla 1 dice que operar la mecánica no vuelve a Rappi organizador; el documento debería decirlo así, con "por cuenta del Organizador".

Archivos: `modelos/bloques/organizador.md` y `src/core/derivados.js`. El marcador queda vacío en todos los modelos menos la Carrera, así que Cashback, Descuento y Cupón salen idénticos (Claude Code lo comprueba contra sus salidas esperadas).

Texto actual:

```
**{{ENTIDAD_LEGAL}}** (en adelante, “Rappi”) actúa únicamente como plataforma de contacto e intermediación tecnológica y como medio de difusión de la Campaña; Rappi no es el organizador de la Campaña.
```

Texto propuesto:

```
**{{ENTIDAD_LEGAL}}** (en adelante, “Rappi”) actúa únicamente como plataforma de contacto e intermediación tecnológica y como medio de difusión de la Campaña[[?TEXTO_ROL_OPERATIVO]]{{TEXTO_ROL_OPERATIVO}}[[/?]]; Rappi no es el organizador de la Campaña.
```

`TEXTO_ROL_OPERATIVO` (FRAGMENTO, nuevo, solo Carrera):

```
Premio en Créditos:                        , y, por cuenta del Organizador, como operador de la mecánica del concurso y de la acreditación del premio
Premio físico que entrega el Organizador:  , y, por cuenta del Organizador, como operador de la mecánica del concurso
Premio físico que entrega Rappi:           , y, por cuenta del Organizador, como operador de la mecánica del concurso y de la entrega del premio
```

Así queda la frase en esta campaña: "…como medio de difusión de la Campaña, y, por cuenta del Organizador, como operador de la mecánica del concurso y de la entrega del premio; Rappi no es el organizador de la Campaña."

**Decisión de Juan:** Aprobado. El documento tiene que decir lo que Rappi de verdad hace en la Carrera, y decirlo "por cuenta del Organizador" es lo que sostiene la regla 1.

### A.4 Cláusula 2. Cobertura (bloque `cobertura_tienda`)

Ver K1 (varias tiendas, Turbo y la frase de los Aliados Comerciales).

### A.5 Cláusula 3. Vigencia

**H24. Pedidos hechos antes del cierre y entregados después.** Prioridad baja. Clasificación (1).

"Únicamente los pedidos realizados y recibidos de manera exitosa dentro de este periodo" deja por fuera un pedido hecho a las 11:50 p. m. del último día y entregado a las 12:20 a. m. Es claro, pero duro, y es el reclamo típico del segundo lugar. Si quieres incluirlos (pregunta 20):

Texto actual:

```
Únicamente los pedidos realizados y recibidos de manera exitosa dentro de este periodo se tendrán en cuenta para el concurso.
```

Texto propuesto:

```
Únicamente se tendrán en cuenta para el concurso los pedidos realizados dentro de este periodo y entregados de manera exitosa.
```

**Decisión de Juan:** Aprobado. Cuenta el momento en que se hace el pedido; la entrega solo confirma que fue exitoso. Evita el reclamo típico del segundo lugar.

### A.6 Cláusula 4. Quiénes pueden participar

**H8. Edad e identidad del ganador.** Prioridad alta. Clasificación (1).

El documento exige ser mayor de edad, pero no dice cómo se verifica, y las cuentas de la Plataforma no traen la edad verificada. Con premio en Créditos, un menor con la cuenta de un adulto puede ganar sin que nadie lo note. Lo mismo pasa con las inhabilidades: nadie sabe si el ganador es pariente de un empleado del Organizador si no lo declara. Dos cambios: la verificación en la aceptación (ya incluida en el texto de K9) y esta viñeta.

Texto actual:

```
• Tener una cuenta activa en la Plataforma Rappi.
```

Texto propuesto:

```
• Ser titular de una cuenta activa en la Plataforma Rappi y realizar los pedidos desde esa cuenta.
```

Pedir el documento de identidad cabe en la finalidad que ya informa la cláusula de datos ("verificar el cumplimiento de los requisitos"). Recomiendo que se exhiba y no que se guarde copia: la Ley 1581 de 2012 solo permite tratar lo necesario para la finalidad informada. Operación: pregunta 6.

**Decisión de Juan:** Aprobado. Operación: el ganador muestra su documento por el canal que use quien lo contacta; si llega una imagen, se borra una vez verificada y solo se deja constancia de que se verificó. No se guarda copia.

**H19. Segmentos que no encajan con un acumulado.** Prioridad media. Clasificación (3) y (1).

La Carrera ofrece los mismos segmentos que el Cashback, y sus frases están pensadas para un beneficio de un pedido:

1. Nuevos: "que realicen su primer pedido en la Plataforma Rappi durante la vigencia". En un acumulado de un mes no se sabe si cuenta solo ese primer pedido o todos los que vengan después.
2. Reactivados: no tiene el problema (corrección del 8 de octubre de 2026).
3. Pro: no dice si la suscripción tiene que estar activa en cada pedido o al final.

Una duda así se resuelve a favor del participante (Ley 1480, art. 34). Corrección del 8 de octubre: Reactivados no tiene el problema, porque su frase fija la elegibilidad antes del inicio. Propuesta final: no se bloquea ningún segmento; Nuevos y Pro llevan una frase de concurso (solo Carrera, en `derivadosCarrera`), y Reactivados queda igual.

Nuevos. Texto actual (`TEXTO_SEGMENTO_POR_OPCION`):

```
Pueden participar únicamente los Usuarios/Consumidores mayores de edad que realicen su primer pedido en la Plataforma Rappi durante la vigencia de la Campaña.
```

Texto propuesto (solo Carrera):

```
Pueden participar únicamente los Usuarios/Consumidores mayores de edad que realicen su primer pedido en la Plataforma Rappi durante la vigencia de la Campaña. Suman al acumulado ese primer pedido y los demás pedidos que realicen durante la vigencia.
```

Pro:

Texto actual (Pro, `TEXTO_SEGMENTO_POR_OPCION`):

```
Pueden participar los Usuarios/Consumidores que tengan activa la suscripción RappiPro y/o RappiPro Black.
```

Texto propuesto (solo Carrera):

```
Pueden participar los Usuarios/Consumidores que tengan activa la suscripción RappiPro y/o RappiPro Black. Solo suman al acumulado los pedidos realizados mientras la suscripción esté activa.
```

**Decisión de Juan:** Aprobado con ajuste: no se bloquea ningún segmento. Reactivados queda igual (ver la corrección del 8 de octubre); Nuevos y Pro llevan una frase propia del concurso, con el texto propuesto de arriba.

**H21. "La participación es gratuita".** Prioridad baja. Clasificación (1).

Para participar hay que comprar. La frase se salva con "por concepto de inscripción", pero leída sola puede inducir a error (Ley 1480, art. 30).

Texto actual:

```
La participación es gratuita y no exige pago alguno por concepto de inscripción.
```

Texto propuesto:

```
La participación no tiene costo de inscripción; solo exige realizar pedidos de Productos Participantes en los términos de la mecánica.
```

**Decisión de Juan:** Aprobado. Quita una frase que, leída sola, puede hacer creer que no hay que comprar.

### A.7 Cláusula 5. Quiénes no pueden participar (bloque `inhabilidades`)

**H9. Empleados de la Tienda Participante.** Prioridad media. Clasificación (2), pero el bloque solo lo usan las modalidades con premio y ganador: hoy, la Carrera en Colombia y México.

Cuando la marca fondea en la tienda de otro (Kenvue en Éxito, Bimbo en Carulla), los empleados de la tienda no quedan inhabilitados, y son quienes están más cerca de la operación de los pedidos. `LA_TIENDA` es el derivado nuevo de K1 ("la Tienda Participante" o "las Tiendas Participantes"); el bloque solo lo usa la Carrera, así que el placeholder siempre tiene valor. Sube el bloque a la versión 1.2.

Texto actual:

```
• Los empleados, directivos, contratistas y colaboradores de Rappi y del Organizador, incluidas sus filiales, subsidiarias, sucursales, agencias de publicidad y demás proveedores logísticos o de ejecución de la Campaña.
```

Texto propuesto:

```
• Los empleados, directivos, contratistas y colaboradores de Rappi, del Organizador y de {{LA_TIENDA}}, incluidas sus filiales, subsidiarias, sucursales, agencias de publicidad y demás proveedores logísticos o de ejecución de la Campaña.
```

**Decisión de Juan:** Aprobado con ajuste: el texto propuesto ya usa {{LA_TIENDA}} de K1, para que funcione con una o varias tiendas. Es la exclusión usual en promociones de supermercados: quien prepara o despacha los pedidos no puede competir por el premio.

### A.8 Cláusula 6. Productos participantes

**H16. Dos marcas en el campo de marca.** Prioridad media. Clasificación (3). Frase rota.

El comercial escribió "NEUTROGENA® y LUBRIDERM®" en un campo para una marca, y salió "los productos de la marca NEUTROGENA® y LUBRIDERM®". Pasa igual en Descuento y Cupón, que usan la misma frase (`textoProductosDescuento`).

Propuesta. Archivos: `src/core/derivados.js` (`textoProductos`), `src/core/derivados_descuento.js` (`textoProductosDescuento`) y la ayuda de `makerMarca` en `src/core/preguntas.js`: "Si son varias marcas del mismo Organizador, sepáralas con comas." Se separa por comas; si el texto trae " y " sin comas, aviso suave ("¿Son dos marcas? Sepáralas con coma"), porque hay marcas con "y" en el nombre.

Texto actual (Carrera, marca):

```
Participan en el concurso únicamente los productos de la marca {makerMarca} disponibles en la Tienda Participante a través de la Plataforma Rappi (en adelante, los “Productos Participantes”).
```

Texto propuesto (con una marca queda igual; con varias):

```
Participan en el concurso únicamente los productos de las marcas {marca 1, marca 2 y marca 3} disponibles en la Tienda Participante a través de la Plataforma Rappi (en adelante, los “Productos Participantes”).
```

En Descuento y Cupón, el mismo cambio de "de la marca" a "de las marcas". De paso, `textoProductos` de la Carrera debería devolver vacío si la marca está vacía, como ya lo hace `textoProductosDescuento`.

**Decisión de Juan:** Aprobado. Es una frase rota en esta misma campaña.

Turbo en esta cláusula: ver K1.b. "Aliados Comerciales" en esta cláusula: ver K1.c.

### A.9 Cláusula 7. Mecánica del concurso

**H5. La cancelación parcial saca el pedido entero.** Prioridad alta. Clasificación (1).

"Recibir los pedidos de manera exitosa, sin cancelaciones totales ni parciales" y "Los pedidos cancelados total o parcialmente… no suman al acumulado". En supermercados y en Turbo los faltantes son el pan de cada día, y casi siempre los causa la tienda. Con esta regla, un participante que compró $900.000 en Productos Participantes pierde ese pedido entero porque a la tienda le faltó un producto que ni siquiera participa. Castiga al consumidor por el incumplimiento de un tercero, se presta para reclamos y no cuadra con el Descuento, donde el modelo ya dice que un pedido parcial se recalcula sobre lo entregado. Si el equipo de datos puede calcularlo por producto (pregunta 7):

Texto actual (viñeta y párrafo):

```
• Recibir los pedidos de manera exitosa, sin cancelaciones totales ni parciales.
```

```
El concurso consiste en acumular {{CRITERIO_GANADOR}} durante la vigencia de la Campaña. Los pedidos cancelados total o parcialmente, ya sea por el Usuario/Consumidor, por el Aliado Comercial o por el Repartidor Independiente, no suman al acumulado.
```

Texto propuesto:

```
• Recibir los pedidos de manera exitosa.
```

```
El concurso consiste en acumular {{CRITERIO_GANADOR}} durante la vigencia de la Campaña. Los pedidos cancelados en su totalidad, ya sea por el Usuario/Consumidor, por el Aliado Comercial o por el Repartidor Independiente, no suman al acumulado. Si un pedido se entrega de manera parcial, suma al acumulado solo por los Productos Participantes efectivamente entregados y pagados, y cuenta como pedido siempre que incluya al menos uno de ellos.
```

Y en Exclusiones (cláusula 12). Texto actual:

```
• Los pedidos cancelados, devueltos o que no se completen exitosamente por cualquier causa.
```

Texto propuesto:

```
• Los pedidos cancelados en su totalidad, los productos devueltos y los pedidos que no se entreguen por cualquier causa.
```

**Decisión de Juan:** Aprobado. El acumulado ya se calcula por producto (solo suman los Productos Participantes), así que contar lo entregado no exige un dato nuevo, y no castiga al participante por un faltante de la tienda.

**H7 (parte 1). "Pedido válido" sin definir.** Prioridad media. Clasificación (1).

El criterio de más pedidos y dos de los tres desempates hablan de "pedidos válidos", y el documento nunca dice qué es eso. Propuesta: definirlo al final de la cláusula 7, como párrafo nuevo, y usar el término definido en los derivados (ver H4):

```
Para efectos del concurso, se entiende por “Pedidos Válidos” los pedidos que cumplan las condiciones de esta cláusula y no estén comprendidos en la cláusula de exclusiones.
```

Con eso, `CRITERIO_GANADOR` de más pedidos pasa de `el mayor número de pedidos válidos con Productos Participantes` a `el mayor número de Pedidos Válidos con Productos Participantes`.

**Decisión de Juan:** Aprobado, con H7 parte 2.

**H17. Compra mínima sin base.** Prioridad media. Clasificación (3).

`TEXTO_UMBRAL` dice "los pedidos cuyo valor sea igual o superior a…", sin decir si es el valor del pedido completo o el de los Productos Participantes, ni si entran el envío y la tarifa. El Cashback sí lo dice ("el valor de los productos de tu pedido… sin incluir el costo de envío, la tarifa de servicio ni las propinas"). Pregunta 12.

Texto actual:

```
Únicamente contabilizarán para el concurso los pedidos cuyo valor sea igual o superior a {monto}.
```

Texto propuesto (si el mínimo se mide sobre lo que participa):

```
Únicamente suman al acumulado los pedidos en los que el valor de los Productos Participantes, sin incluir el costo de envío, la tarifa de servicio ni las propinas, sea igual o superior a {monto}.
```

**Decisión de Juan:** Aprobado. El mínimo se mide sobre los Productos Participantes, sin envío, tarifa de servicio ni propinas, igual que en el Cashback.

**H18. La base del acumulado no es verificable.** Prioridad media. Clasificación (1). (No toco aquí nada de descuentos, que dejaste por fuera.)

La cláusula 12 excluye del acumulado "el valor de… impuestos". Los precios en la app se muestran con IVA incluido, así que la base real sería un valor sin IVA que el participante no ve en ninguna parte. Eso choca con el "verificable" de la introducción. Dos opciones (pregunta 13):

Opción A, con IVA, que es lo que el usuario ve. Texto actual:

```
• El valor de propinas, costos de envío, tarifas de servicio e impuestos.
```

Texto propuesto:

```
• El valor de propinas, costos de envío y tarifas de servicio.
```

Opción B, sin IVA: se deja la viñeta y se agrega en la cláusula 7: "El valor que suma al acumulado es el precio de los Productos Participantes sin el IVA incluido en él." Es exacta, pero el participante no puede hacer la cuenta con lo que ve.

**Decisión de Juan:** Aprobado, opción A. El participante tiene que poder hacer la cuenta con el precio que ve en la app, que incluye el IVA.

K3 (pago efectivo) también es de esta cláusula.

### A.10 Cláusula 8. Selección de ganadores y desempate

**H4. Desempate ambiguo y empate que persiste.** Prioridad alta. Clasificación (3) y (1).

1. Dos de los tres desempates no dicen "de Productos Participantes": "el mayor número de pedidos válidos durante la vigencia" y "el mayor valor total en compras durante la vigencia". Se pueden leer como todos los pedidos y todas las compras del participante en la Plataforma, que es otro número. Esta campaña usa justamente el de más pedidos.
2. Si el empate persiste después del desempate (mismo valor y mismo número de pedidos), no hay regla. Cualquier forma de resolverlo en ese momento sería discrecional, o peor, al azar.
3. "Según la fecha y hora de su último pedido válido" no dice si es la hora en que se hizo o la hora en que se entregó. Como el pedido solo suma cuando se recibe, lo coherente es la entrega (pregunta 8).

Archivo: `TEXTO_DESEMPATE_POR_OPCION` en `src/core/derivados.js`.

Texto actual:

```
primero:     En caso de empate, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de su último pedido válido.
mas_pedidos: En caso de empate, ganará el participante con el mayor número de pedidos válidos durante la vigencia.
mayor_valor: En caso de empate, ganará el participante con el mayor valor total en compras durante la vigencia.
```

Texto propuesto:

```
primero:     En caso de empate, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de entrega de su último Pedido Válido registradas en la Plataforma Rappi.
mas_pedidos: En caso de empate, ganará el participante con el mayor número de Pedidos Válidos con Productos Participantes durante la vigencia. Si el empate persiste, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de entrega de su último Pedido Válido registradas en la Plataforma Rappi.
mayor_valor: En caso de empate, ganará el participante con el mayor valor total en compras de Productos Participantes durante la vigencia. Si el empate persiste, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de entrega de su último Pedido Válido registradas en la Plataforma Rappi.
```

Si no apruebas H7, "Pedido Válido" va en minúscula, como hoy. La regla de "quien llegó primero" no necesita un segundo desempate: el registro llega al segundo.

**Decisión de Juan:** Aprobado. Cuenta la hora de entrega, que es cuando el pedido empieza a sumar, y el empate que persiste se resuelve sin que nadie elija.

**H7 (parte 2). La verificación y el reemplazo.** Prioridad media. Clasificación (1).

"Si la verificación determina que un participante o sus pedidos no cumplen las condiciones…, dicho participante no será considerado ganador." Un solo pedido que no cumpla (por ejemplo, uno pagado en parte con Créditos) saca al participante entero, aunque el resto de su acumulado le alcance para ganar. Eso es más duro que las exclusiones, que solo restan ese pedido, y deja la decisión en manos de quien verifica (Ley 1480, art. 43, sobre cláusulas que le dejan al proveedor decidir solo si se cumplió lo pactado). Además, la regla de reemplazo está repartida en tres cláusulas con palabras distintas (inhabilidades, verificación y aceptación). Propuesta: restar lo inválido, reservar la descalificación para quien no cumple los requisitos o comete fraude, y fijar una sola regla de reemplazo.

Texto actual:

```
Antes de declarar a los ganadores, Rappi verificará la elegibilidad de cada participante y de cada pedido. Si la verificación determina que un participante o sus pedidos no cumplen las condiciones de la Campaña, dicho participante no será considerado ganador y se le informará a través de la Plataforma Rappi.
```

Texto propuesto (incluye H6 al final):

```
Antes de declarar {{GANADOR_OBJETO}}, Rappi verificará la elegibilidad de cada participante y de cada pedido. Los pedidos que no sean Pedidos Válidos se descontarán del acumulado y el ranking se recalculará. Si la verificación determina que un participante no cumple los requisitos para participar o incurrió en alguna de las conductas de la cláusula de fraude, abuso y descalificación, no será considerado ganador y se le informará a través de la Plataforma Rappi. En todos los casos en que un participante no sea declarado ganador o pierda el derecho al premio, ocupará su lugar el siguiente participante del ranking que cumpla los requisitos de la Campaña. Si antes de la entrega del premio se cancela o se devuelve un pedido que sumó al acumulado de un ganador, o se reversa su pago, el acumulado se recalculará y, si el participante deja de ocupar una posición ganadora, perderá el derecho al premio.
```

Opcional, para reforzar lo "verificable" (pregunta 18): "Terminada la vigencia, podrás consultar el valor de tu acumulado a través del Centro de Ayuda de la Plataforma Rappi."

**Decisión de Juan:** Aprobado, sin la frase opcional del Centro de Ayuda: no se promete lo que soporte no ha confirmado que puede dar, y la cláusula de atención ya permite pedir esa información.

**H6. Devoluciones y reversiones después del ranking.** Prioridad media. Clasificación (1).

Sin regla, alguien puede comprar mucho, ganar y después devolver o pedir la reversión del pago a su banco. El texto va como última frase del párrafo de H7. Si no apruebas H7, se agrega sola al final del párrafo actual.

**Decisión de Juan:** Aprobado, como última frase del párrafo de H7.

### A.11 Cláusula 9. Premio

Número de premios: ver K5, punto 3.

**H11 (parte 1). Premio en Créditos "no canjeable por bienes o servicios".** Prioridad media. Clasificación (1) y (3).

La frase fija dice que el premio "no podrá canjearse por dinero en efectivo ni por otros bienes o servicios". Con Créditos es al revés: los Créditos existen justamente para comprar bienes y servicios en la Plataforma. La frase tiene que depender del tipo de premio.

Texto actual:

```
El premio es personal e intransferible y no podrá canjearse por dinero en efectivo ni por otros bienes o servicios.
```

Texto propuesto:

```
{{TEXTO_CANJE_PREMIO}}
```

`TEXTO_CANJE_PREMIO` (ORACIÓN, nuevo):

```
Créditos: El premio es personal e intransferible y no podrá canjearse por dinero en efectivo.
Físico:   El premio es personal e intransferible y no podrá canjearse por dinero en efectivo ni por otros bienes o servicios.
```

**Decisión de Juan:** Aprobado.

### A.12 Cláusula 10. Naturaleza del premio

**H3. Premio físico que entrega Rappi: dos cláusulas que se contradicen.** Prioridad alta. Clasificación (3) y (1). Es exactamente el caso de esta campaña.

1. La cláusula 10 dice que la entrega es "responsabilidad exclusiva del Organizador".
2. La cláusula 11 dice que la entrega "será gestionada por Rappi en su calidad de operador logístico".
3. La cláusula 20 dice que Rappi no responde por la existencia, calidad, idoneidad o entrega del premio "cuando la entrega esté a cargo del Organizador". Leída al revés: cuando la entrega está a cargo de Rappi, Rappi sí responde por todo eso, incluida la calidad de una máscara que no fabrica.

Propuesta: la naturaleza del premio cambia según quién entrega, y la cláusula 20 separa lo que es del Organizador (el bien) de lo que es de Rappi (la acreditación o la logística).

`TEXTO_NATURALEZA_PREMIO`, premio físico. Texto actual:

```
El premio consiste en un bien de carácter físico, cuya existencia, calidad, garantía y entrega son responsabilidad exclusiva del Organizador. Rappi no fabrica, comercializa ni garantiza dicho bien.
```

Texto propuesto:

```
Entrega el Organizador: igual al actual.
Entrega Rappi:          El premio consiste en un bien de carácter físico, cuya existencia, calidad y garantía son responsabilidad exclusiva del Organizador. Rappi no fabrica, comercializa ni garantiza dicho bien, y gestiona su entrega únicamente como operador logístico por cuenta del Organizador, en los términos de la cláusula siguiente.
```

Cláusula 20 (modelo). Texto actual:

```
§ Responsabilidades frente al premio. Rappi no será responsable por la existencia, calidad, idoneidad o entrega del premio cuando la entrega esté a cargo del Organizador. Rappi es responsable de: (i) la aplicación del criterio de selección de ganadores con base en la información transaccional de la Plataforma Rappi; (ii) la publicación veraz y completa de los presentes Términos y Condiciones; y (iii) la atención oportuna de tus peticiones, quejas y reclamos relacionados con la Campaña.
```

Texto propuesto:

```
§ Responsabilidades frente al premio. La existencia, calidad, idoneidad y garantía del premio corresponden al Organizador, y Rappi no responde por ellas ni por la entrega del premio cuando esta esté a cargo del Organizador. Rappi es responsable de: (i) la aplicación del criterio de selección de ganadores con base en la información transaccional de la Plataforma Rappi; (ii) la publicación veraz y completa de los presentes Términos y Condiciones; (iii) la atención oportuna de tus peticiones, quejas y reclamos relacionados con la Campaña; y (iv) la acreditación del premio en Créditos o la gestión logística de la entrega del premio físico, cuando Rappi las realice por cuenta del Organizador.
```

El punto (iv) sigue la misma línea del bloque aprobado `responsabilidad_rappi_beneficio` del Cashback, donde Rappi responde por "la correcta acreditación de los Créditos".

**Decisión de Juan:** Aprobado. Es el caso de esta campaña y hoy el documento hace responder a Rappi por la calidad de un bien que no fabrica.

**H14. Si el premio físico deja de existir.** Prioridad media. Clasificación (3).

No hay regla para cuando el producto se descontinúa o se agota antes de la entrega. Sin ella, el Organizador incumple o entrega lo que quiera. Propuesta: agregar al final de las dos versiones físicas de `TEXTO_NATURALEZA_PREMIO`:

```
Si por causas ajenas al Organizador el premio deja de estar disponible, el Organizador lo reemplazará por otro de características similares y de igual o mayor valor comercial, y se le informará al ganador antes de la entrega.
```

**Decisión de Juan:** Aprobado.

**H11 (parte 2). Créditos del premio sin vigencia, sin lugar de uso y sin plazo de acreditación.** Prioridad media. Clasificación (3) y (1).

El Cashback pregunta cuánto duran los Créditos y dónde se usan; la Carrera no, y solo remite a los T&C de Créditos. El ganador no sabe cuándo le llegan ni hasta cuándo los puede usar. Propuesta (pregunta 10):

1. Reusar en la Carrera las preguntas `vigencia` (con `diasVigencia` o `fechaFinRedencion`) y `redencion`, solo con premio en Créditos. De `redencion`, solo las opciones "en cualquier sección" y "en secciones específicas": la frase de "solo en la tienda" dice "donde se originó el Beneficio", y en la Carrera no hay Beneficio.
2. `TEXTO_NATURALEZA_PREMIO` de Créditos, agregar al final: `Los Créditos del premio {{TEXTO_VIGENCIA_CREDITOS}}. {{TEXTO_LUGAR_REDENCION}}`
3. `TEXTO_ENTREGA` de Créditos, con el número de la pregunta `plazoEntrega` de H12. Texto actual:

```
Los Créditos serán acreditados por Rappi en la Billetera de Créditos del ganador, por cuenta del Organizador, una vez aceptado el premio.
```

Texto propuesto:

```
Los Créditos serán acreditados por Rappi en la Billetera de Créditos del ganador, por cuenta del Organizador, a más tardar dentro de los {N en letras} ({N}) días hábiles siguientes a la aceptación del premio.
```

**Decisión de Juan:** Aprobado con ajuste: el texto propuesto ya lo trae. El plazo de acreditación no se fija en el modelo: sale de la pregunta `plazoEntrega` de H12, que ahora aplica también a los Créditos.

### A.13 Cláusula 11. Notificación, aceptación y entrega del premio

Plural fijo en Notificación: K5, punto 4. "Cuenta de Rappi": K8. Reasignación, identidad e intentos: K9.

**H13. Intentos de contacto y soporte de la llamada.** Prioridad media. Clasificación (1), (3) y (4).

"Tras intentos razonables" no dice cuántos, y con la llamada como único medio no queda prueba de que se intentó. Si el primer puesto dice que nunca lo llamaron, la duda se resuelve a su favor. El número de intentos ya va en el texto de K9. Además, operativo (pregunta 22): que la llamada se confirme siempre por escrito. Si lo apruebas, `MEDIO_NOTIFICACION` de llamada queda así:

```
una llamada telefónica al número registrado en la cuenta del ganador en la Plataforma Rappi, que se confirmará por escrito al correo electrónico registrado en esa cuenta
```

**Decisión de Juan:** Aprobado. Sin constancia escrita, el "nunca me llamaron" se resuelve a favor del primer puesto.

**H12. Premio físico sin plazo, costo ni lugar de entrega.** Prioridad alta. Clasificación (1) y (3).

Las dos frases de entrega dicen que se coordinarán "las condiciones de tiempo, modo y lugar", pero no fijan ninguna. En una promoción esas condiciones son las que hay que informar (Ley 1480, art. 33), y el premio que no llega nunca es de los reclamos que más terminan en la SIC. Propuesta: una pregunta nueva y una frase nueva.

1. Pregunta `plazoEntrega` (`src/core/esquemas.js` y `src/core/preguntas.js`): número de 1 a 30, obligatoria, para los dos tipos de premio. Enunciado: "¿En cuántos días hábiles, como máximo, se entrega el premio después de que el ganador lo acepta?" Ayuda: "Si son Créditos, los acredita Rappi; si es un premio físico, lo entrega quien elegiste. Pon un plazo que se pueda cumplir." Por qué: "El documento le promete al ganador un plazo. Si no se cumple, reclama con el documento en la mano." Mensaje si pasa de 30: "El plazo no puede pasar de 30 días hábiles. Si la marca necesita más, la campaña va a Legal." La llena el comercial; es un dato, no texto legal.
2. Modelo, viñeta Entrega. Texto actual:

```
• **Entrega:** {{TEXTO_ENTREGA}}
```

Texto propuesto:

```
• **Entrega:** {{TEXTO_ENTREGA}}[[?TEXTO_PLAZO_ENTREGA]] {{TEXTO_PLAZO_ENTREGA}}[[/?]]
```

`TEXTO_PLAZO_ENTREGA` (ORACIÓN, nuevo, solo premio físico; con Créditos el plazo va dentro de `TEXTO_ENTREGA`, ver H11 parte 2):

```
El premio se entregará sin costo para el ganador, en la dirección que confirme dentro del Territorio, a más tardar dentro de los {N en letras} ({N}) días hábiles siguientes a su aceptación.
```

**Decisión de Juan:** Aprobado con ajuste: el texto propuesto ya lo trae. La pregunta aplica a los dos tipos de premio y va de 1 a 30 días hábiles; un plazo mayor es una campaña que tiene que mirar Legal.

**H23. Fecha de notificación sin tope.** Prioridad baja. Clasificación (3).

Hoy solo se valida que sea posterior al fin de la campaña; podría ser seis meses después. Propuesta: validación en `src/core/validaciones.js` para que no pase de 30 días calendario después del fin (pregunta 21).

**Decisión de Juan:** Aprobado: hasta 30 días calendario después del fin.

### A.14 Cláusula 12. Exclusiones

Cancelaciones parciales: H5. Impuestos en la base: H18. La exclusión de medicamentos, fitoterapéuticos y nicotina está bien puesta como viñeta.

**H26. Cuentas y medios de pago empresariales.** Prioridad media. Clasificación (1). Nuevo, del 8 de octubre de 2026 (era la pregunta 23).

El concurso es para Usuarios/Consumidores personas naturales, pero nada impide que gane una cuenta empresarial que compra para una oficina o un negocio. En un concurso al mayor comprador, esa cuenta desplaza a cualquier consumidor, y el que compra para su empresa no es consumidor final (Ley 1480 de 2011, art. 5). Las compras para reventa no se excluyen con una regla propia: decidir quién compra para revender sería una valoración caso a caso, y eso le resta objetividad al ranking; para eso está la cláusula de fraude.

Texto propuesto: viñeta nueva en Exclusiones, después de la de medios de pago.

```
• Los pedidos realizados desde cuentas empresariales o corporativas de la Plataforma Rappi, o pagados con medios de pago empresariales o corporativos.
```

**Decisión de Juan:** Aprobado. Protege a quien el concurso quiere premiar y se puede verificar con los datos de la Plataforma.

### A.15 Cláusula 13. Impuestos

**H15. La cláusula no le dice al ganador qué le toca.** Prioridad media. Clasificación (1).

Ya la habías decidido sin cambio (decisión 36 del encargo 01), y el 8 de octubre de 2026 lo reafirmaste: este tipo de T&C no lleva nada de impuestos. Dejo el análisis por si el tema vuelve: los premios son ganancia ocasional para el ganador, en dinero o en especie, esta última por su valor comercial (Estatuto Tributario, art. 304), con tarifa del 20%, y la retención en la fuente procede cuando el pago supera 48 UVT (art. 404-1; DIAN, Oficio 1801 de 2018, https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_1801_2018.htm). En esta campaña ($1.599.900) no hay retención. Con un premio de mayor valor, quién la asume es algo que la marca y el KAM tienen que tener claro por fuera del documento.

**Decisión de Juan:** No. Decisión de Juan del 8 de octubre de 2026: no se mete nada de impuestos en este tipo de T&C. La cláusula de Impuestos se queda como está, palabra por palabra, y no se agrega ninguna pregunta.

### A.16 Cláusula 14. Publicidad y prevalencia (bloque `publicidad`)

K10 no procede.

**H22. Rappi se compromete como si fuera el anunciante.** Prioridad baja. Clasificación (2).

"Rappi se compromete a que la publicidad de la Campaña sea veraz, verificable y no te induzca a error." La publicidad de la campaña es del Organizador, que es el anunciante; el medio solo responde por publicidad engañosa si hay dolo o culpa grave (Ley 1480, art. 30). Con esta frase Rappi se vuelve garante de lo que diga la marca. No propongo texto: el bloque lo comparten todos los modelos con tienda y el Cashback Multitienda, que no tiene un Organizador único, así que cualquier cambio necesita un marcador por modelo. Lo dejo como pregunta 19.

**Decisión de Juan:** No, en esta ronda. El riesgo es bajo y el cambio toca el bloque de cinco modelos; queda anotado en `docs/PENDIENTES_LEGAL.md` para la próxima revisión de bloques compartidos.

### A.17 Cláusula 15. Atención al usuario (bloque `atencion`)

Sin hallazgos.

### A.18 Cláusula 16. Modificaciones

**H10. Modificar un concurso ya iniciado.** Prioridad alta. Clasificación (1), con el bloque nuevo de K11.

El bloque de hoy pone como ejemplos de cambio permitido "la reducción del beneficio o del premio, la modificación de los comercios o productos participantes o la anticipación de la fecha de finalización". En un Cashback eso puede tener sentido, porque cada pedido recibe su beneficio en el momento. En una Carrera, el participante lleva semanas comprando por un premio anunciado y un cierre anunciado: bajarle el premio o adelantarle el cierre a mitad de camino va contra la fuerza vinculante de lo anunciado (Ley 1480, arts. 29 y 33), y el "sin efecto retroactivo" no lo arregla, porque lo que se afecta es una expectativa que se construyó compra a compra. El texto está en la cuarta viñeta del bloque nuevo de K11.

**Decisión de Juan:** Aprobado, dentro del bloque nuevo de K11.

### A.19 Cláusula 17. Fraude, abuso y descalificación (bloque `fraude`)

Sin cambio propuesto. El "a juicio razonable de Rappi" se sostiene porque Rappi tiene que informar la razón. H7 amarra esta cláusula con la verificación y el reemplazo.

### A.20 Cláusulas 18 y 19. T&C de la Plataforma y Limitación de responsabilidad

Sin hallazgos propios de la Carrera. Son bloques aprobados y comunes.

### A.21 Cláusula 20. Responsabilidades frente al premio

Ver H3.

### A.22 Cláusula 21. Datos personales (bloque `datos` y `TEXTO_DATOS_ENTREGA`)

Sin hallazgos de fondo. Con Rappi como operador logístico no hay transferencia de datos al Organizador, y el documento lo resuelve bien: la frase de transferencia no se imprime. La verificación de identidad de H8 cabe en la finalidad ya informada ("verificar el cumplimiento de los requisitos"); lo importante es operativo: exhibir el documento y no guardar copia.

### A.23 Cláusula 22. Ley aplicable

Sin hallazgos.

### A.24 Leyenda de la pieza (`modelos/leyendas/leyenda_carrera_compras_co.md`)

**H1. "Concurso organizado por {{TIENDA}}".** Prioridad **crítica**. Clasificación (1).

`TIENDA` es el nombre de la tienda, no el Organizador: `derivados_leyendas.js` solo lo cambia en Travel. En esta campaña la pieza habría dicho "Concurso organizado por Turbo y Éxito", cuando el T&C dice que organiza Kenvue Colombia S.A.

1. La pieza contradice el T&C en quién organiza. La publicidad obliga (Ley 1480, art. 29) y no puede inducir a error sobre quién responde (art. 30).
2. Turbo lo opera Moustache Beams S.A.S., empresa de Rappi. La pieza estaría diciendo que un negocio de Rappi organiza el concurso: justo lo que prohíbe la regla 1, y lo que el encargo de leyendas dijo que ninguna leyenda puede sugerir.
3. No es un caso raro: pasa en toda Carrera que fondea una marca en la tienda de otro. Bimbo en Carulla diría "organizado por Carulla".

Texto actual:

```
[[R1]] Concurso organizado por {{TIENDA}}.[[/R]]
```

Texto propuesto:

```
[[R1]] Concurso organizado por {{ORGANIZADOR}}.[[/R]]
```

`ORGANIZADOR` ya existe (razón social del Organizador). Sigue siendo lo primero que se recorta si la leyenda no cabe. Acción operativa (pregunta 3), revisada el 8 de octubre en Solicitudes: en Colombia, aparte de Kenvue y de pruebas internas, la única Carrera generada es `RM-20261002-0001`, con tienda "Mars Incorporated" y, en el campo de Organizador, dos sociedades escritas juntas ("Masterfoods Colombia Ltda." y "Effem Colombia Ltda."), vigente del 2 de octubre al 10 de noviembre de 2026. Su leyenda diría "organizado por Mars Incorporated", que no es la razón social del Organizador. Además, esas dos sociedades van con un solo NIT (830.037.955-1): en un T&C el Organizador tiene que ser una sola persona jurídica. Vale la pena mirar con el KAM que la generó cuál de las dos fondea, y la pieza que haya salido.

**Decisión de Juan:** Aprobado. Es el único punto crítico: la pieza no puede nombrar como organizador a quien no lo es, y menos a un negocio de Rappi.

### A.25 Dato mal escrito

**H25. "Kenvue Colombia S.A" sin punto final.** Prioridad baja. Clasificación (4). La primera generación (RM-20260922-0012) lo tenía bien. Se corrige al regenerar; la razón social tiene que ser la del RUT, letra por letra.

**Decisión de Juan:** Aprobado, como acción operativa: al regenerar se escribe la razón social del RUT, "Kenvue Colombia S.A.", con punto. No hay cambio de código.

---

## C. Resumen priorizado

### Crítico (antes de que se genere otra Carrera)

1. **H1.** La leyenda de la pieza dice que organiza la tienda y no el Organizador. En esta campaña habría dicho que organiza Turbo, un negocio de Rappi. Es cambiar un placeholder en un archivo.

### Alto (antes de publicar esta campaña o la próxima Carrera)

1. **K1.** La Carrera acepta una o varias Tiendas Participantes con un solo ranking, con la pregunta de Turbo por tienda, "horarios de operación de la Tienda Participante" y "comercializados directamente por la Tienda Participante, y no por Rappi". Esta campaña no se publica como está.
2. **H2.** El bloque organizador dice que Rappi actúa "únicamente como plataforma y medio de difusión", y en la Carrera Rappi arma el ranking, contacta al ganador y a veces entrega el premio.
3. **H3.** Premio físico entregado por Rappi: la naturaleza del premio, la entrega y la cláusula 20 dicen cosas distintas sobre quién responde.
4. **K9, con H7, H8 y H13.** Reemplazo obligatorio del ganador, con requisitos, mismo plazo y final de la cadena; los intentos de contacto y el plazo para declarar desierto los pone el KAM.
5. **K11 con H10.** Bloque de modificaciones propio del concurso: el Organizador modifica de común acuerdo con Rappi, y una vez iniciado no se reduce el premio ni se adelanta el cierre.
6. **H4.** Desempate: acumulado de Productos Participantes, regla si el empate persiste y qué hora cuenta.
7. **H5.** Un pedido con faltantes suma por lo entregado, en vez de caerse entero.
8. **H8.** Identidad y mayoría de edad del ganador (va dentro del texto de K9).
9. **H12.** Plazo máximo de entrega del premio físico, sin costo y en la dirección que confirme el ganador.
10. **H20.** Nombre comercial de la campaña propuesto por el KAM, sin tocar la convención de nombres, para que nadie tenga que editar a mano el documento generado.

### Medio

1. **K5 y K7.** Decir cuántos ganadores y premios hay, con el singular y el plural bien puestos.
2. **H6.** Devoluciones y reversiones de pago después de armado el ranking.
3. **H7.** Definir "pedido válido", descontar el pedido inválido en vez de sacar al participante y una sola regla de reemplazo.
4. **H9.** Empleados de la Tienda Participante cuando no es el Organizador.
5. **H11.** Premio en Créditos: la frase de canje, la vigencia y el plazo de acreditación.
6. **H14.** Sustitución del premio físico que deja de existir.
7. **H16.** Dos marcas en el campo de marca.
8. **H17.** Base de la compra mínima.
9. **H18.** IVA en la base del acumulado.
10. **H19.** Segmentos Nuevos y Pro en un concurso de un mes.
11. **H26.** Cuentas y medios de pago empresariales fuera del acumulado.

### Bajo

1. **K2, K3, K6, K8 y K10.** Cambios de redacción de la marca; solo K3 (en parte) y K8 (como derivado) se toman.
2. **H21.** "La participación es gratuita" cuando hay que comprar.
3. **H22.** Rappi como garante de la veracidad de la publicidad de la marca.
4. **H23.** Tope a la fecha de notificación.
5. **H24.** Pedidos hechos antes del cierre y entregados después.
6. **H25.** "Kenvue Colombia S.A" sin punto.

### Omitido

1. **K4.** Valor neto con descuento, por instrucción de Juan.

### Para la campaña de Kenvue

1. El documento actual no se publica: dice que hay una sola tienda llamada "Turbo y Éxito" y no dice que suman Éxito y Carulla en Turbo.
2. Cuando Claude Code termine y Juan autorice el push, el KAM vuelve a generar la Carrera con dos filas (Éxito, "Solo en la tienda normal"; Carulla, "Solo en la tienda de Turbo"), la razón social del RUT ("Kenvue Colombia S.A.", con punto) y el nombre comercial "Skindays" (H20). Se publica tal cual sale, sin ediciones a mano.
3. Si la marca necesita el texto antes de que esté el cambio, la edición a mano se limita a lo aprobado en este informe y se anota en la fila de Solicitudes. La vigencia arranca el 15 de octubre de 2026.

---

## D. Preguntas para Juan y respuestas (8 de octubre de 2026)

1. **Turbo y Éxito (K1.d).** ¿Es una tienda o son dos? Si son dos, ¿las compras en una y otra se suman en un mismo acumulado? Y para esta campaña, ¿qué hacemos: Legal la redacta a mano, se parte en dos Carreras (una por tienda) o se habilita la Carrera con varias tiendas en la herramienta?
    **Respuesta:** Son dos tiendas que suman a un solo ranking: la tienda virtual de Éxito y la tienda virtual Turbo Carulla (respuesta de Juan). La herramienta lo va a soportar (K1.a) y esta campaña se vuelve a generar con las dos (K1.d).
2. **Quién vende en Turbo (K1.c y H1).** En Turbo Colombia, ¿quién le vende el producto al usuario: Moustache Beams S.A.S. o el aliado? Si vende Moustache Beams, la frase "comercializados directamente por la Tienda Participante, en su calidad de Aliado Comercial" no sirve para Turbo y hay que redactar otra.
    **Respuesta:** Los T&C del Botón Turbo que publica Rappi dicen que esos productos los comercializan terceros aliados, no Rappi. La frase "comercializados directamente por la Tienda Participante, y no por Rappi" sirve también para Turbo.
3. **Piezas ya generadas (H1).** ¿Revisamos las leyendas de las Carreras generadas desde que existen las leyendas, para corregir las que dicen que organiza la tienda?
    **Respuesta:** Sí. Revisé Solicitudes: en Colombia, aparte de Kenvue y de pruebas internas, la única Carrera generada es `RM-20261002-0001` (Mars). Ver H1.
4. **Alcance del bloque nuevo de modificaciones (K11).** ¿Queda solo para la Carrera, o también lo quieres para Cashback, Descuento y Cupón?
    **Respuesta:** Solo la Carrera, por ahora. Llevarlo a Cashback, Descuento y Cupón queda para la próxima revisión de bloques compartidos.
5. **Reemplazo del ganador (K9).** ¿Tres intentos de contacto en días hábiles distintos y treinta días para declarar desierto te sirven? ¿Qué pasa con un premio desierto: queda para el Organizador o se usa en otra campaña?
    **Respuesta:** El premio pasa al siguiente del ranking de manera obligatoria. El número de intentos y el plazo para declarar desierto los pone el KAM en el formulario (instrucción de Juan). El premio desierto queda en cabeza del Organizador.
6. **Verificación de identidad (H8).** ¿Quién la hace y por qué canal? Recomiendo que el ganador exhiba el documento y que no se guarde copia. ¿Estás de acuerdo o necesitan guardarla?
    **Respuesta:** Lo hace quien contacta al ganador, por el mismo canal. El ganador muestra su documento; si llega una imagen, se borra una vez verificada y solo queda constancia de la verificación. No se guarda copia.
7. **Cálculo por producto (H5).** ¿El equipo de datos puede calcular el acumulado por producto entregado y no por pedido? Si no puede, H5 cambia.
    **Respuesta:** No hace falta preguntarle a datos: el acumulado ya se calcula por producto, porque solo suman los Productos Participantes. H5 aprobado.
8. **Hora del desempate (H4).** ¿Cuenta la hora en que se hizo el último pedido o la hora en que se entregó? Recomiendo la entrega, porque es cuando el pedido empieza a sumar.
    **Respuesta:** La hora de entrega, que es cuando el pedido empieza a sumar.
9. **Plazo de entrega (H12).** ¿Lo pone el comercial en cada campaña (pregunta nueva, de 1 a 60 días hábiles) o prefieres un plazo fijo en el modelo? Si es fijo, ¿cuántos días?
    **Respuesta:** Lo pone el comercial en cada campaña, de 1 a 30 días hábiles, para premio físico y para Créditos.
10. **Créditos (H11).** ¿Cuánto duran, dónde se redimen y en cuánto tiempo se acreditan después de la aceptación? ¿Lo preguntamos al comercial como en Cashback o lo fijamos en el modelo?
    **Respuesta:** Vigencia y lugar de redención: se reusan las preguntas del Cashback, sin la opción "solo en la tienda". Plazo de acreditación: la pregunta `plazoEntrega` de H12.
11. **Impuestos (H15).** ¿Mantienes la decisión 36? Si la cambias, ¿quién asume la retención cuando el premio pase de 48 UVT: el Organizador o el ganador?
    **Respuesta:** Se mantiene la decisión 36: este tipo de T&C no lleva nada de impuestos (Juan, 8 de octubre de 2026).
12. **Compra mínima (H17).** ¿Se mide sobre los Productos Participantes del pedido o sobre el pedido completo, y sin envío, tarifa de servicio ni propinas?
    **Respuesta:** Sobre los Productos Participantes del pedido, sin envío, tarifa de servicio ni propinas.
13. **IVA en la base (H18).** ¿Opción A (con IVA, lo que ve el usuario) u opción B (sin IVA)?
    **Respuesta:** Opción A, con IVA.
14. **Segmentos (H19).** ¿Bloqueamos Nuevos y Reactivados en la Carrera y le damos a Pro una frase propia del concurso?
    **Respuesta:** No se bloquea ningún segmento. Nuevos y Pro llevan una frase propia del concurso; Reactivados queda igual.
15. **Empleados de la tienda (H9).** ¿Inhabilitamos a los empleados de la Tienda Participante cuando no es el Organizador?
    **Respuesta:** Sí, con {{LA_TIENDA}} para que funcione con una o varias tiendas.
16. **Regenerar (H20).** ¿Regenerar para corregir debe reemplazar la versión anterior en vez de crear una "· 2"? Con el nombre comercial, el "· 2" ya no llega al texto legal cuando el KAM propone un nombre; solo queda en el título del Doc, en la dirección y en el texto legal de las campañas sin nombre comercial.
    **Respuesta:** No. Regenerar crea una versión nueva con consecutivo; la anterior tiene que poder rastrearse.
17. **Nombre comercial (H20).** La dirección ya la diste: lo propone el KAM y la convención no se toca. ¿Es obligatorio u opcional? Recomiendo opcional: si el KAM no lo llena, sale el nombre de hoy, las salidas esperadas de los casos que ya existen no cambian y ningún Cashback sencillo gana un paso más en el formulario.
    **Respuesta:** Opcional.
18. **Consulta del acumulado (A.10).** ¿Agregamos que, terminada la vigencia, el participante puede consultar su acumulado por el Centro de Ayuda? Solo si soporte de verdad puede darlo.
    **Respuesta:** No. No se promete lo que soporte no ha confirmado que puede dar.
19. **Bloque de publicidad (H22).** ¿Revisamos el compromiso de Rappi sobre la veracidad de la publicidad, que hoy lo pone como garante de lo que diga la marca?
    **Respuesta:** No en esta ronda; queda en `docs/PENDIENTES_LEGAL.md`.
20. **Pedidos al cierre (H24).** ¿Cuenta un pedido hecho antes del cierre y entregado después?
    **Respuesta:** Sí. Cuenta si se hizo dentro de la vigencia y se entregó de manera exitosa (H24).
21. **Fecha de notificación (H23).** ¿Tope de treinta días calendario después del fin de la campaña?
    **Respuesta:** Sí, treinta días calendario después del fin.
22. **Llamada (H13).** ¿La llamada se confirma siempre por escrito (correo o notificación en la app)?
    **Respuesta:** Sí, por correo electrónico (H13).
23. **Compras institucionales o para reventa (nueva).** El modelo exige ser persona natural, pero no dice nada de cuentas empresariales (Rappi for Business) ni de compras para reventa, que en un concurso al mayor comprador pueden desplazar al consumidor. ¿Las excluimos de forma expresa, ponemos un tope de unidades por pedido o lo dejamos a la cláusula de fraude?
    **Respuesta:** Se excluyen los pedidos de cuentas o medios de pago empresariales (H26). La reventa se deja a la cláusula de fraude, sin tope de unidades: un tope o una regla de reventa le restarían objetividad al ranking.
