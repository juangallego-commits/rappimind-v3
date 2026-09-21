# Lo que depende de Juan

Actualizado el 21 de septiembre de 2026, al cerrar D1.

Este es el documento de trabajo: **lo que sigue pendiente**. Lo decidido pasó al
bloque G con su fecha y no vuelve a aparecer como pregunta.
`docs/PENDIENTES_LEGAL.md` se queda como historia: ahí está cómo llegó cada cosa.

El 20 de septiembre se cerraron **31 de los 41 puntos** y el 21 los **diez que
quedaban**, D1 incluido. **No queda ninguna pregunta abierta.**

Lo que sí queda es **un bloque de tareas de ejecución**, que ya no dependen de
ninguna decisión: alguien tiene que hacerlas fuera del repositorio.

Y queda **una cosa que leer, no que decidir**: el texto de la cláusula 5 del
cashback por ETA lo escribió la herramienta, porque elegiste la forma y no el
texto. Está entero, con el antes y el después, en `docs/PENDIENTES_LEGAL.md`.
Conviene que lo mires antes de publicar el primer T&C de ese tipo.

## Cómo está armado

Cada punto dice cuatro cosas, siempre en el mismo orden:

1. **Qué hay que decidir.**
2. **Por qué existe la duda.**
3. **Las opciones.**
4. **Qué pasa con la herramienta con cada una.** Es el que importa para decidir.

Y al final de cada punto, **quién decide**: tú solo, o tú después de preguntarle
a alguien concreto.

Los bloques que quedan:

- **H.** Tareas de ejecución fuera del repositorio. Sin decisión pendiente.
- **G.** Cerrado, con su fecha. No vuelve a aparecer como pregunta.

Los bloques A, B, C, D, E y F se vaciaron: ya no queda nada que impida generar
un documento, usar un país, entregar una leyenda o recorrer una pantalla.

Todo lo que un punto necesita está escrito adentro: las cláusulas van copiadas,
las pantallas descritas. No hace falta abrir el repositorio.

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
| **B2.** Los cuatro documentos de Brasil | Comparados contra BR01 a BR04. La única diferencia de fondo era el orden de la cifra y las letras, que corrigió B3 | 21 sep |
| **B3.** Brasil: la hora y el límite | La campaña arranca a las 00:01, y los pedidos y los porcentajes van con la cifra primero: "1 (um) pedido", "10% (dez por cento)" | 21 sep |
| **C3.** "Solo consumo en el local" | **Se borra.** En Rappi no existe esa modalidad. Sale del formulario, del modelo, de la leyenda, de las pruebas y de la fila del país | 21 sep |
| **C5.** Las veintiuna que quedaban | Siete cambian algo y catorce se cierran como hoy se imprimen. Las de medicamentos y nicotina se resolvieron con la regla nueva de Colombia | 21 sep |
| **D1.** Turbo no es una modalidad, son tiendas por zona | El T&C las nombra una por una. La lista manda y la segunda frase se queda hablando solo de disponibilidad. El texto lo escribió la herramienta y está en `docs/PENDIENTES_LEGAL.md`, para que Juan lo lea | 21 sep |
| **D3.** El valor del premio en la Carrera | Entra, con los dos textos de la decisión 36 (ii). Solo en Colombia y solo con premio físico | 21 sep |
| **D4.** Los productos con nombre y EAN | Entra. Filas con nombre y código de barras, validado con su dígito de control | 21 sep |
| **D6.** El filtro antes de los T&C generales | Entra. Seis preguntas de sí o no, con tres salidas, y los tres requisitos de la pieza en la pantalla del enlace | 21 sep |
| **E2.** La interfaz de Brasil | Aplicadas las correcciones que aprobó Juan. **Queda pendiente** la lectura de los abogados de Brasil en la prueba | 21 sep |
| **F6.** La quinta pregunta del filtro de Travel | **Se acorta.** El campo de ayuda que hacía falta entró con F8 | 21 sep |
| **F8.** Los cambios de recorrido que quedaban | "¿Quién puede publicar?" con su botón, el atajo por encima de los tipos, la calculadora del tope, el filtro de Travel partido en diez, el contador, el negocio en países sin Travel y el orden de la Ayuda | 21 sep |
| **Nuevo.** Medicamentos, fitoterapéuticos y nicotina | No se hacen esas campañas en Colombia. Advertencia, opción bloqueada y exclusión en el T&C | 21 sep |
| **Nuevo.** En cuál de sus tiendas se gana el cashback | Cuatro respuestas, con su frase en el T&C, en la leyenda y en el nombre de la campaña. Una por marca en el Multitienda | 21 sep |

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
