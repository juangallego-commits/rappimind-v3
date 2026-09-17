# Paquete de revisión legal de RappiMind

Documento para pegar completo en una conversación nueva de Claude chat.
Fecha: 17 de septiembre de 2026. Preparado por Juan Camilo Gallego, Legal Rappi Colombia.

---

## Prompt para Claude chat

Hola. Necesito que actúes como **abogado revisor senior** de una herramienta legal
que estoy a punto de abrir a los equipos legales de todos los países donde opera
Rappi. No tienes acceso al código ni a los archivos: todo lo que necesitas saber
está en este mensaje.

**Qué es RappiMind, en tres frases.** Es una aplicación interna de Rappi donde el
equipo comercial (los CAM y KAM que trabajan con las tiendas y las marcas) genera
por sí mismo los Términos y Condiciones de sus campañas de marketing, sin
escribirle a Legal. El comercial solo responde hechos (nombres, fechas, montos,
porcentajes, listas) y la herramienta arma el documento a partir de modelos que
Legal ya aprobó, palabra por palabra. Si falta un dato, el sistema no genera:
nunca sale un documento con espacios en blanco, con marcadores sin llenar ni con
frases a medias.

**Qué necesito de ti.** Abajo hay preguntas numeradas. Para cada una quiero:
1. Una recomendación concreta, en una o dos frases, que diga qué hacer.
2. El riesgo principal de la opción contraria, en una frase.
3. Si hace falta texto, el texto exacto que debería ir impreso, listo para pegar.

No quiero un ensayo ni un memorando. Quiero un punto por pregunta, en el mismo
orden y con el mismo número. Si una pregunta no se puede responder sin un dato
que no está aquí, dilo en una línea y sigue con la siguiente. Si crees que una
pregunta está mal planteada, dilo también.

**Advertencia: hay una regla no negociable.** En este proyecto **Rappi nunca es el
organizador de una campaña**. El organizador es siempre la tienda aliada o la marca
que fondea el beneficio. Rappi es plataforma de intermediación y responsable del
tratamiento de los datos personales. Que Rappi opere la mecánica, cargue los
Créditos o gestione la entrega de un premio no la convierte en organizadora.
Ninguna recomendación tuya puede romper esa regla.

**La única excepción ya autorizada es Brasil.** Los cuatro T&C que Legal Brasil
tiene aprobados están escritos con Rappi como quien concede, modifica y cancela la
promoción, y no nombran a ningún organizador distinto. Yo autoricé esa excepción
el 17 de septiembre de 2026, solo para el modelo de Brasil. No se extiende a
ningún otro país ni sirve de precedente. Si al responder una pregunta de otro país
te parece natural poner a Rappi como organizadora, no lo hagas: propón la
alternativa que mantenga a la tienda o a la marca en ese rol.

**Un segundo principio que conviene que conozcas: el determinismo.** El texto legal
sale únicamente de los modelos aprobados. El comercial no escribe cláusulas ni
puede editar el documento. Los únicos campos de texto libre que existen son
nombres, razones sociales, ciudades, la descripción de un premio físico y la lista
de productos participantes. Por eso, cuando una pregunta de abajo dice "el texto
dice hoy", ese texto es literal: es lo que va impreso y publicado.

---

## Los bloques de decisión

- **Bloque A. Brasil.** El país acaba de entrar en pruebas con un modelo propio,
  armado desde cuatro T&C que mandó Legal Brasil. Hay correcciones aplicadas que
  necesitan confirmación y un dato que falta.
- **Bloque B. El cashback por incumplimiento del ETA en Colombia.** La campaña de
  "15 minutos o cashback" de Turbo. Es el único modelo donde no hay tienda aliada
  ni marca que fondee, y donde Rappi promete su propio tiempo de entrega.
- **Bloque C. Los ocho países en piloto.** México, Perú, Argentina, Chile, Ecuador,
  Uruguay, Costa Rica y Brasil. A cada uno le faltan cuatro datos legales por
  confirmar para poder salir a producción.
- **Bloque D. Lo que venía pendiente de antes.** Cashback, Carrera de Compras,
  Cashback Day y la lista de secciones donde se redimen los Créditos.
- **Bloque E. Rappi Travel.** El modelo de vuelos y hoteles, que es nuevo y trae
  cláusulas que no existen en el resto.
- **Bloque F. Alcance.** Qué queda fuera de la herramienta.

Las preguntas van numeradas de corrido. Primero todas las **bloqueantes**, que son
las que impiden publicar o hacen que un documento salga mal, y después las **no
bloqueantes**, que son confirmaciones y mejoras.

---
---

# PARTE 1. BLOQUEANTES

---

## Bloque A. Brasil

### 1. Falta la frase que enumera los derechos del titular sobre sus datos en Brasil
**BLOQUEANTE**

**Qué dice hoy:** nada. El campo está vacío. En Colombia esa frase dice: "Podrás
ejercer en cualquier momento tus derechos a conocer, actualizar, rectificar y
suprimir tus datos personales, y a revocar la autorización otorgada". En Brasil
ese espacio está en blanco.

**Por qué se pregunta:** la herramienta no genera documentos con valores vacíos.
Mientras esa frase no exista, Brasil no produce ni un solo T&C. Y la redacción
tiene que salir de la LGPD, no de una traducción de la frase colombiana.

**Qué pasa según la respuesta:** con la frase escrita, Brasil queda listo para
generar. Sin ella, Brasil sigue bloqueado aunque todo lo demás esté resuelto.
Necesito el texto exacto en portugués.

### 2. El tope del envío gratis en Brasil: ¿se cubre hasta R$20 y el resto lo paga el usuario, o el envío gratis no aplica?
**BLOQUEANTE**

**Qué decía el documento aprobado:** "Esclarece-se que o frete grátis não será
aplicado caso **o valor** seja superior a **20,00 (vinte reais)**."

**Qué dice ahora, tras la corrección que se aplicó:** "Esclarece-se que o frete
grátis está limitado a **R$20,00 (vinte reais)**; o valor que exceder esse limite
será cobrado do Usuário."

**Por qué se pregunta:** la frase original tenía tres problemas en una línea. Le
faltaba el símbolo R$. "O valor" no decía de qué valor hablaba: leída sola, un
usuario entiende el valor **del pedido**, es decir, que si compra más de R$20
pierde el envío gratis, que es exactamente lo contrario de lo que la campaña
quiere. Y "não será aplicado" sugiere que el beneficio desaparece entero, cuando
la intención parece ser cubrir hasta ese tope.

**Qué pasa según la respuesta:** la corrección que está puesta **supone** que la
intención es cubrir hasta R$20 y cobrar el excedente. Si la intención real es que
el envío gratis no aplique del todo cuando el flete pasa de R$20, el texto tiene
que decir otra cosa y hay que cambiarlo antes de publicar. Es la diferencia entre
que el usuario pague R$5 o que pague R$25.

### 3. Los datos de configuración de Brasil están escritos mezclando español y portugués, y uno de ellos dice "(confirmar)"
**BLOQUEANTE**

**Qué dice hoy,** literal, en la configuración de la que salen impresos los
documentos de Brasil:
- País: "a República Federativa del Brasil" (mezcla "a" en portugués con "del" en español).
- Ley aplicable: "a Leis da República Federativa do Brasil" (concordancia rota entre "a" y "Leis").
- Jurisdicción: "à Foro Central da comarca da cidade de São Paulo" ("à" delante de un sustantivo masculino).
- Entidad de vigilancia: "el PROCON y la Secretaría Nacional del Consumidor (SENACON)", en español dentro de un documento en portugués.
- Autoridad de datos: "a Autoridade Nacional de Proteção de Dados (ANPD) **(confirmar)**", con la palabra "(confirmar)" adentro.

**Por qué se pregunta:** estos valores no son notas internas, son texto que se
imprime. Si el modelo brasileño los usa, salen tal cual en un documento publicado,
incluida la palabra "(confirmar)" entre paréntesis.

**Qué pasa según la respuesta:** con las cinco frases correctas en portugués, se
cambian en la hoja de configuración y listo, sin tocar código. Sin eso, el primer
documento de Brasil sale con errores de idioma visibles.

### 4. El cierre de los documentos de Brasil: ¿llevan los enlaces a los T&C de la plataforma y al aviso de privacidad?
**BLOQUEANTE**

**Qué decía el documento aprobado:** "Consulte nossos Termos de Uso e Condições da
Plataforma Rappi e Aviso de Privacidade de Dados", sin ninguna dirección.

**Qué dice ahora:** "Consulte nossos Termos de Uso e Condições da Plataforma
Rappi, disponíveis em: [enlace], e o Aviso de Privacidade de Dados, disponível em:
[enlace]." Los dos enlaces que están puestos son:
- Plataforma: https://legal.rappi.com.co/brazil/termos-e-condicoes-de-uso-da-plataforma-rappi/
- Privacidad: https://legal.rappi.com.co/brazil/aviso-de-privacidade-e-politicas-de-uso-das-informacao-utilizadas-pela-rappi/

**Por qué se pregunta:** en Colombia esos dos documentos siempre van con su enlace.
En Brasil el texto aprobado los nombra sin dirección, y no sé si eso es a propósito
o un olvido. Además no se pudo comprobar desde el entorno de desarrollo que esos
dos enlaces abran.

**Qué pasa según la respuesta:** si van, hay que darles clic antes de publicar el
primer documento, porque un enlace roto dentro de un T&C publicado es peor que no
ponerlo. Si no van, se quitan y el cierre vuelve a la forma aprobada.

---

## Bloque B. El cashback por incumplimiento del ETA en Colombia

Contexto común de este bloque: la campaña se llama "15 minutos o cashback" y ya
está publicada en Bogotá (16 de septiembre de 2026) y en Barranquilla (1 de
septiembre de 2026). Los dos documentos son el mismo, con la ciudad, la fecha, las
horas y el presupuesto cambiados. Si el pedido de Turbo llega después del tiempo
estimado de entrega que la app mostró, el usuario recibe el 100% del valor de los
productos en Créditos, con un tope.

### 5. ¿"15 minutos o cashback" es una segunda excepción a la regla de que Rappi nunca es el organizador?
**BLOQUEANTE**

**Qué dice hoy el documento:** participan todas las tiendas Turbo de una ciudad, el
presupuesto lo pone Rappi, y la cláusula del beneficio dice literalmente "Rappi se
obliga a cumplir con el ETA exhibido dentro de la Plataforma Rappi". No hay tienda
aliada ni marca que fondee. El documento **nunca usa la palabra "Organizador"**.

**Por qué se pregunta:** es el único modelo de la herramienta donde no existe
ninguno de los dos organizadores posibles. La lectura que se dejó puesta es que
**no choca con la regla**, porque lo que Rappi promete aquí no es la promoción de
un tercero sino su propio tiempo de entrega, es decir, una garantía de servicio,
que es otra figura jurídica. Por eso no se anotó como excepción.

**Qué pasa según la respuesta:** si estás de acuerdo, el modelo se queda como está
y la regla sigue teniendo una sola excepción, Brasil. Si prefieres que quede
escrita como excepción explícita, igual que Brasil, se escribe y queda registrada.
Importa porque esta noche la herramienta se abre a los equipos legales de todos los
países y alguien va a preguntar exactamente esto.

### 6. Los dos T&C publicados del ETA no tienen cláusula de tratamiento de datos personales
**BLOQUEANTE**

**Qué dicen los documentos publicados:** nada sobre datos personales. Ni cláusula,
ni mención de la política de privacidad, ni nombre de la autoridad de protección de
datos. Es el único modelo de todo el repositorio al que le falta, y es una campaña
publicada en Colombia donde el usuario entrega datos para recibir Créditos.

**Qué dice el modelo ahora:** se le agregó el mismo bloque que usan Cashback,
Carrera de Compras y Cashback Multitienda. Nombra a Rappi S.A.S. como responsable,
cita la Política de Tratamiento de Datos Personales con su enlace, enumera los
derechos del titular y nombra a la Superintendencia de Industria y Comercio.

**Por qué se pregunta:** puede haber una razón para que no estuviera y yo no la
conozco. También hay que decidir qué se hace con los dos documentos ya publicados.

**Qué pasa según la respuesta:** si se queda, todas las campañas nuevas de ETA
salen con la cláusula y habría que decidir si se corrigen las dos publicadas. Si
hay razón para que no vaya, se saca del modelo.

---

## Bloque C. Los ocho países en piloto

Contexto común de este bloque: "piloto" es el estado donde el país solo lo ve el
equipo de pruebas. Para que un país salga a producción hay que confirmar **cuatro
datos legales que van impresos en el documento**. Los tres primeros son de forma;
el cuarto es el que más importa, porque enumera derechos.

**Advertencia que aplica a las ocho preguntas siguientes: ninguno de estos valores
está confirmado por un abogado. Los puso Claude por analogía con Colombia y con la
legislación de cada país.** Hay que marcar el que esté bien o escribir el correcto.
Cuando se confirma uno, se cambia en la hoja de configuración y listo, sin
desplegar nada.

Así se ven los cuatro datos dentro de una frase, con los valores de México:

> Los Créditos tendrán una vigencia de siete (7) **días naturales**...
> ...hasta las 11:59 p. m. del 31 de octubre de 2026 (**hora de la Ciudad de México**).
> ...un tope de **$25,000** por pedido.
> Podrás ejercer en cualquier momento **tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO)**.

Para comparar, así están los cuatro en **Colombia**, que sí está confirmado y en
producción: separador de miles `.`, término `días calendario`, hora local `hora
local de la República de Colombia`, derechos `tus derechos a conocer, actualizar,
rectificar y suprimir tus datos personales, y a revocar la autorización otorgada`.

Confirmar los cuatro datos deja al país listo **solo para Cashback**, que es el
único tipo de campaña habilitado hoy en los ocho. Habilitar más tipos en un país
es otra decisión: hay que revisar que el modelo de ese tipo funcione con la
legislación local.

### 7. México: confirmar los cuatro datos legales que van impresos
**BLOQUEANTE**

Entidad legal: Tecnologías Rappi, S.A.P.I. de C.V., RFC TRA150604TW1. Moneda: pesos
MXN ($). Persona: persona física.

Valores puestos hoy, **ninguno confirmado**:
- Separador de miles: `,`
- Término de días: `días naturales`
- Texto de hora local: `hora de la Ciudad de México`
- Derechos sobre los datos: `tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO)`

**Qué pasa según la respuesta:** con los cuatro confirmados, México sale de piloto
y sus KAM pueden generar Cashback. Sin confirmar, cada documento que genere México
lleva una frase de derechos que no revisó un abogado mexicano.

### 8. Perú: confirmar los cuatro datos legales que van impresos
**BLOQUEANTE**

Entidad legal: Rappi S.A.C., RUC 20602985971. Moneda: soles (S/). Persona: persona
natural.

Valores puestos hoy, **ninguno confirmado**:
- Separador de miles: `,`
- Término de días: `días calendario`
- Texto de hora local: `hora local de la República del Perú`
- Derechos sobre los datos: `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

**Nota sobre el cuarto:** esa frase genérica es la que se puso en seis de los ocho
países. Dice que el usuario tiene derechos, pero no dice cuáles. En Colombia y en
México sí se enumeran. La pregunta de fondo es si en cada país conviene enumerarlos
con los nombres que usa su propia ley.

### 9. Argentina: confirmar los cuatro datos legales que van impresos
**BLOQUEANTE**

Entidad legal: RAPPI ARG S.A.S., CUIT 30-71580389-1. Moneda: pesos ARS ($).
Persona: persona humana.

Valores puestos hoy, **ninguno confirmado**:
- Separador de miles: `.`
- Término de días: `días corridos`
- Texto de hora local: `hora local de la República Argentina`
- Derechos sobre los datos: `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

### 10. Chile: confirmar los cuatro datos legales que van impresos
**BLOQUEANTE**

Entidad legal: Rappi Chile SpA, RUT 76.837.223-3. Moneda: pesos CLP ($). Persona:
persona natural.

Valores puestos hoy, **ninguno confirmado**:
- Separador de miles: `.`
- Término de días: `días corridos`
- Texto de hora local: `hora de Santiago de Chile`
- Derechos sobre los datos: `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

Chile tiene además una pregunta propia, la número 11.

### 11. Chile: qué autoridad de protección de datos se nombra, con la Ley 21.719 en camino
**BLOQUEANTE**

**Qué dice hoy:** la configuración de Chile nombra a "la Agencia de Protección de
Datos Personales".

**Por qué se pregunta:** esa agencia es la que crea la Ley 21.719. Según el momento
en que entre en funciones, nombrarla puede ser correcto, prematuro o directamente
equivocado, y ese nombre va impreso en la cláusula de datos de cada documento
chileno.

**Qué pasa según la respuesta:** hay que decidir si se nombra la agencia nueva, si
se nombra a la autoridad que hoy ejerce, o si la cláusula se redacta sin nombrar
ninguna hasta que la agencia esté operando.

### 12. Ecuador: confirmar los cuatro datos legales que van impresos
**BLOQUEANTE**

Entidad legal: RAPPIEC S.A.S., RUC 1793010105001. Moneda: dólares USD ($). Persona:
persona natural.

Valores puestos hoy, **ninguno confirmado**:
- Separador de miles: `,`
- Término de días: `días calendario`
- Texto de hora local: `hora del Ecuador continental`
- Derechos sobre los datos: `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

### 13. Uruguay: confirmar los cuatro datos legales que van impresos
**BLOQUEANTE**

Entidad legal: Brisanier S.A., RUT 218175850017. Moneda: pesos UYU ($). Persona:
persona física.

Valores puestos hoy, **ninguno confirmado**:
- Separador de miles: `.`
- Término de días: `días corridos`
- Texto de hora local: `hora local de la República Oriental del Uruguay`
- Derechos sobre los datos: `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

### 14. Costa Rica: confirmar los cuatro datos legales que van impresos
**BLOQUEANTE**

Entidad legal: RAPPI PURA VIDA, S.A., cédula jurídica 3-101-768820. Moneda: colones
CRC (₡). Persona: persona física.

Valores puestos hoy, **ninguno confirmado**:
- Separador de miles: `.`
- Término de días: `días naturales`
- Texto de hora local: `hora local de la República de Costa Rica`
- Derechos sobre los datos: `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

### 15. Brasil: confirmar los cuatro datos legales que van impresos
**BLOQUEANTE**

Entidad legal: RAPPI BRASIL INTERMEDIAÇÃO DE NEGÓCIOS LTDA, CNPJ 26.900.161/0001-25.
Moneda: reais (R$). Persona: pessoa física.

Valores puestos hoy, **ninguno confirmado**:
- Separador de miles: `.`
- Término de días: `dias corridos`
- Texto de hora local: `horário de Brasília`
- Derechos sobre los datos: **vacío**, que es la pregunta número 1 de este paquete.

### 16. México: el enlace a los T&C de Créditos parece tener una errata
**BLOQUEANTE**

**Qué dice hoy:** el enlace que se imprime en los documentos mexicanos es
https://legal.rappi.com.co/mexico/terminos-ycondiciones-de-funcionamiento-de-los-creditos-de-la-plataforma-rappi-mexico/

**Por qué se pregunta:** dice "terminos-ycondiciones", junto, cuando en el resto de
los países dice "terminos-y-condiciones". Puede ser una errata al copiarlo o puede
ser la dirección real con la que está publicado el documento.

**Qué pasa según la respuesta:** si abre, se deja tal cual. Si no abre, hay que
conseguir la dirección correcta antes de que México salga de piloto, porque ese
enlace es el que remite al documento madre de los Créditos.

---

## Bloque D. Lo que venía pendiente de antes

### 17. El nombre de la campaña es texto libre y puede contradecir el articulado
**BLOQUEANTE**

**Qué pasó, con un caso real:** el primer T&C generado en producción se tituló "99%
de Cashback el Corral 20/09". La cláusula 6 de ese mismo documento dice cincuenta
por ciento (50%) y la cláusula 3 fija la vigencia el 17 de septiembre. El título lo
escribió a mano el comercial.

**Por qué es grave:** el modelo trae una cláusula que dice "en caso de discrepancia
se aplicará la condición más favorable para ti". Un título publicado que diga 99%,
con esa cláusula al lado, es un riesgo real. Además el título es lo primero que lee
el usuario y lo que queda indexado en el buscador.

**Qué pasa según la respuesta:** hay una propuesta escrita para quitarle el texto
libre y armar el nombre solo con datos que el comercial ya respondió, del estilo
"Carulla · Carrera de Compras · 5 oct 2026". Si se aprueba, ningún título puede
volver a contradecir el articulado. Si no, el riesgo sigue abierto en cada campaña.

### 18. La misma cláusula dice que el Créditos se acredita de inmediato y que Rappi verifica antes de acreditar
**BLOQUEANTE**

**Qué dice hoy la cláusula 8 del modelo de Cashback:** que los Créditos se acreditan
"de manera inmediata una vez finalizada la orden" y, tres líneas después, que
"Rappi se reserva el derecho de verificar la elegibilidad de cada pedido antes de
acreditar el Beneficio".

**Por qué se pregunta:** si la verificación es previa, la acreditación no es
inmediata. Las dos frases no pueden ser ciertas a la vez. Con la otra opción del
formulario, la de acreditación "al día siguiente", no hay tensión: solo aparece
cuando el comercial elige acreditación inmediata.

**Qué pasa según la respuesta:** o la frase de verificación desaparece cuando la
carga es inmediata, o el texto se deja como está y se asume la contradicción.

### 19. La lista de secciones donde se redimen los Créditos no coincide con las campañas reales
**BLOQUEANTE**

**Qué dice hoy:** el formulario ofrece una lista cerrada de secciones de la
plataforma para decir dónde se pueden gastar los Créditos, y esa lista sale impresa
en el documento.

**Qué se encontró:** al revisar 1.184 solicitudes reales de campañas, aparece una
sección **Express** que no está en la lista, y **no aparecen nunca** dos que sí
están: **Farmacia** y **Tiendas especializadas**.

**Por qué se pregunta:** la lista define qué promete el documento. Si falta Express,
un comercial no puede describir bien su campaña. Si sobran dos, el documento puede
prometer redención en secciones donde en la práctica no aplica.

**Qué pasa según la respuesta:** hay que fijar cuál es la lista correcta de
secciones. Es un cambio de un archivo de configuración, no de código.

### 20. Cashback Day: el máximo de pedidos, ¿es por toda la campaña o por tienda?
**BLOQUEANTE**

**Qué dice hoy:** en el modelo de Cashback Day, que es la campaña con varias tiendas
participantes a la vez, el máximo de pedidos con beneficio aplica a **toda la
campaña**.

**Por qué se pregunta:** no está confirmado que ese sea el diseño querido. Lo lógico
en una campaña multitienda podría ser un máximo por tienda participante.

**Qué pasa según la respuesta:** cambia el número que lee el usuario y cambia la
exposición económica de quien fondea. Es una frase del modelo, pero es de las que
generan reclamos.

---

## Bloque E. Rappi Travel

Contexto común de este bloque: Rappi Travel es vuelos y hoteles, y lo opera Travel
Moustache S.A.S., NIT 901.337.236-7, que es una agencia de viajes, no la misma
entidad que hace delivery. Es el 12% de todas las solicitudes de campaña que
recibe Legal (138 de 1.184). El modelo ya está construido y genera, y espera
revisión.

### 21. El Registro Nacional de Turismo de Travel Moustache: número y fecha de vencimiento
**BLOQUEANTE**

**Qué dice hoy:** RNT número 79000, con vencimiento el 31 de marzo de 2027. El
número sale del certificado y de las respuestas dadas a la SIC. La fecha de
vencimiento sale de notas internas.

**Por qué se pregunta:** el certificado que está guardado en Drive vencía el **31 de
marzo de 2026**, no de 2027. Una de las dos fechas está mal.

**Qué pasa según la respuesta:** el RNT va impreso en la cláusula que identifica a
Travel Moustache como agencia de viajes. Si el RNT está vencido, la herramienta no
genera Travel, y publicar una campaña de viajes citando un RNT vencido es un
problema frente a la autoridad de turismo.

### 22. La base de cálculo del cashback de Travel: ¿los impuestos y las tasas cuentan?
**BLOQUEANTE**

**Qué dice hoy:** "el valor pagado con dinero real por la tarifa o la reserva". La
frase no se pronuncia sobre si los impuestos y las tasas de la tarifa entran en la
base sobre la que se calcula el cashback.

**Por qué se pregunta:** en un tiquete aéreo los impuestos y las tasas son una parte
enorme del precio. Un usuario que compra un vuelo de un millón de pesos con
cuatrocientos mil de impuestos va a calcular su cashback sobre el total que pagó.

**Qué pasa según la respuesta:** si cuentan, el cashback es mayor y hay que decirlo.
Si no cuentan, hay que decirlo con esas palabras, porque el silencio se interpreta a
favor del consumidor. Necesito la frase exacta.

### 23. En Travel, Rappi no aparece como plataforma de intermediación sino como agencia de viajes
**BLOQUEANTE**

**Qué dice hoy la cláusula 1 del modelo de Travel:** que Travel Moustache "actúa
como agencia de viajes que opera los Sistemas Rappi Travel", y trae su RNT. En el
resto de los modelos, la cláusula equivalente dice que Rappi es plataforma de
intermediación.

**Por qué se pregunta:** es un cambio de fondo, no de forma. Cambia el rol que Rappi
asume frente al usuario y frente a la autoridad. Va unido a la observación de la
Superintendencia de Transporte, que calificó a Rappi Travel como proveedor
indirecto con responsabilidad solidaria.

**Qué pasa según la respuesta:** si el rol de agencia es el correcto, el modelo se
queda y hay que revisar que el resto del articulado sea coherente con ese rol. Si no
lo es, la cláusula 1 se reescribe y con ella cambia todo el documento.

---
---

# PARTE 2. NO BLOQUEANTES

---

## Bloque A. Brasil, confirmaciones

Contexto común: Legal Brasil mandó cuatro T&C aprobados, descritos por ellos como
"los que más les piden": Desconto % OFF, Frete Grátis, Taxa de serviço mínimo de
compra y Taxa de serviço e entrega grátis. Los cuatro son **la misma estructura
palabra por palabra**, y solo cambia el tramo que dice qué recibe el usuario, así
que se armó **un solo modelo con cuatro formas del beneficio**. Ninguno de los
cuatro entrega Créditos: son descuentos directos y exenciones de tarifa.

**Un recordatorio que aplica a todo este bloque:** Brasil no es jurisdicción
colombiana. Todo esto debería pasar por Legal Brasil antes de publicarse, aunque
sean correcciones de redacción.

### 24. Ratificar con Legal Brasil la excepción sobre quién concede la promoción
**NO BLOQUEANTE, ya decidido, falta ratificarlo**

**Qué dicen los cuatro documentos:** "O Rappi se reserva o direito de encerrar esta
promoção", "O Rappi se reserva o direito de modificar as condições ou cancelar esta
promoção" y "O Rappi se reserva ao direito de cancelar a promoção". No nombran a
ningún organizador distinto.

**Qué se decidió:** Brasil es excepción explícita a la regla de que Rappi nunca es
organizador, autorizada el 17 de septiembre de 2026, solo para el modelo brasileño
y sin valor de precedente.

**Por qué sigue en la lista:** conviene que Legal Brasil sepa que se aceptó su
redacción tal cual, y que quede claro frente a los demás países que es una
excepción y no el nuevo estándar. Es justo el punto que va a levantar preguntas en
el canal de Legal Global.

### 25. Confirmar las correcciones de redacción que se aplicaron al texto brasileño
**NO BLOQUEANTE**

Se autorizó corregir errores verificables sin tocar criterio jurídico. Esto es todo
lo que cambió:

- **"doação" por "benefício"**, en los cuatro documentos. Decía "em caso de fraude
  ou **desviação da doação** para terceiros" y ahora dice "em caso de fraude ou
  **desvio do benefício** para terceiros". "Doação" es donación, que no tiene que
  ver con una promoción de descuento y parece arrastrada de otra plantilla, y
  "desviação" no es la palabra portuguesa para desvío en este sentido.
- **Un gerundio que rompía la enumeración.** Decía "cancelar a promoção, cancelar o
  código e **bloqueando** a conta do Usuário" y ahora dice "e **bloquear** a conta".
- **Una frase sin verbo principal.** Decía "...são fictícias ou falsas. **Usuários
  que realmente não constituem uma pessoa física identificável** por meio de um
  documento de identidade..." y ahora dice "...são fictícias ou falsas, **ou seja,
  que não constituem uma pessoa física identificável** por meio de...".
- **Dos concordancias rotas.** Decía "no momento do carregamento **do dados**
  solicitados **pelos Usuário**" y ahora dice "**dos dados** solicitados **ao
  Usuário**".
- **Una fecha a la que le faltaba una palabra.** Decía "20 de janeiro 2025" y ahora
  dice "20 de janeiro **de** 2025".
- **Un guion y una redundancia.** Decía "em todo território brasileiro **- Brasil**,
  onde houver lojas..." y ahora dice "em todo **o** território brasileiro, onde
  houver lojas...".
- **Cuatro diferencias de forma entre los cuatro documentos** (cómo se presenta la
  campaña, cómo se nombra al socio, cómo se nombra la plataforma y las mayúsculas
  del beneficio) se unificaron con la forma que usaban tres de los cuatro.

**Qué pasa según la respuesta:** cada corrección tiene una prueba automática que
impide que se deshaga sola. Si alguna no te convence, se devuelve al texto original.

### 26. En Brasil se eliminaron dos cláusulas que estaban repetidas
**NO BLOQUEANTE**

**Qué se quitó:** las CONDIÇÕES GERAIS repetían dos cosas que ya estaban en REGRAS
PRINCIPAIS. "Promoção válida na área de cobertura do Rappi para usuários do Rappi
no Brasil" repetía la viñeta de cobertura, y "Promoção não acumulável com outras
promoções" repetía "Promoção não cumulativa". Quedó una sola vez cada una.

**Por qué se pregunta:** es la corrección más agresiva de la lista, porque quita
texto en vez de arreglarlo. Hay abogados que prefieren la redundancia en un
documento de consumo.

**Qué pasa según la respuesta:** si prefieres que se queden las dos, se devuelven.

### 27. Tres detalles del texto brasileño que no se tocaron porque son criterio de abogado
**NO BLOQUEANTE**

1. **"O Rappi", en masculino,** en los trece párrafos. En portugués de Brasil una
   empresa suele ir en femenino ("a Rappi"), y el propio documento dice "não sendo
   **a Rappi** responsável" en un sitio. Pero "O Rappi" es consistente en los cuatro
   documentos y puede ser una decisión de marca.
2. **"pessoa humana" y "pessoa física" en el mismo documento.** La definición de
   Usuário dice "pessoa humana" y más abajo el mismo documento dice "pessoa física",
   que es también lo que está puesto en la configuración de Brasil. Las dos son
   válidas en derecho brasileño. Que el mismo documento use las dos sí es raro.
3. **"São Paulo/SP" al final.** Aparece en uno solo de los cuatro documentos y no se
   puso en el modelo, porque no se sabe si es la sede que debe constar siempre o si
   quedó de un documento anterior. ¿Va siempre, nunca, o depende?

### 28. El nombre de la política de privacidad de Brasil tiene dos posibles erratas
**NO BLOQUEANTE**

**Qué dice hoy:** el nombre guardado, que se imprime dentro de la cláusula, es "**a**
Aviso de Privacidade e Políticas de uso das **Informação** utilizadas pela Rappi".

**Por qué se pregunta:** en portugués sería "**o** Aviso" (es masculino) y "das
**Informações**" (plural). No se cambió porque puede ser el nombre exacto con el que
está publicado el documento, erratas incluidas, y en ese caso hay que citarlo tal
cual.

**Qué pasa según la respuesta:** si el documento publicado se llama así, se deja. Si
no, se corrige en la hoja de configuración.

### 29. La interfaz en portugués no la ha revisado nadie que hable portugués
**NO BLOQUEANTE**

**Qué está en portugués:** los enunciados de las preguntas, las ayudas, los mensajes
de error y los botones del formulario. **Ninguna cláusula se tradujo**: el documento
sigue saliendo de los modelos aprobados por Legal.

**Por qué se pregunta:** la traducción de la interfaz la escribió Claude, y es de
producto, no de Legal. Una ayuda mal traducida puede inducir una respuesta
equivocada, y esa respuesta sí sale impresa en el documento.

**Qué pasa según la respuesta:** conviene que alguien de Legal Brasil o de negocio
en Brasil la lea antes de que los KAM la usen. Solo están traducidas las preguntas
que un KAM brasileño recorre de verdad; el resto sale en español, que se entiende,
en vez de romperse.

---

## Bloque B. El ETA, confirmaciones

### 30. "Rappi se obliga a cumplir con el ETA" es una obligación de resultado con remedio tasado
**NO BLOQUEANTE**

**Qué dice hoy:** el documento publicado dice literalmente que Rappi se obliga a
cumplir con el tiempo estimado de entrega exhibido en la plataforma, y si no lo
cumple el usuario recibe el 100% del valor de los productos en Créditos, con tope.

**Por qué se pregunta:** no se tocó, porque es exactamente lo que la campaña quiere
decir y porque el texto es de Legal. Pero es una obligación de resultado asumida por
escrito en un documento publicado, sin ninguna salvedad por causas que no dependen
de Rappi.

**Qué pasa según la respuesta:** si conviene matizarla con esas causas, hay que
escribir la frase. Si se deja, queda como está.

### 31. La cláusula de seguridad vial del ETA se reescribió
**NO BLOQUEANTE**

**Antes:** "Rappi no promueve que los repartidores excedan los límites de velocidad.
La velocidad de entrega **es determinada por la gestión del restaurante**."

**Después:** "Rappi no promueve que los repartidores independientes excedan los
límites de velocidad **ni que infrinjan las normas de tránsito**. La velocidad de
entrega **depende de la gestión de la Tienda Participante y de las condiciones de la
vía**."

**Por qué se cambió:** "es determinada por la gestión del restaurante" convive mal
con la cláusula de dos párrafos antes, donde Rappi se obliga a cumplir el ETA: si el
tiempo lo determina el restaurante, la obligación de Rappi queda en el aire. Y decir
que la velocidad depende también de las condiciones de la vía es más cierto, porque
el trayecto no lo controla ni el restaurante.

**Qué pasa según la respuesta:** si prefieres la redacción publicada, se devuelve.

### 32. Cuatro cambios de forma en el modelo del ETA
**NO BLOQUEANTE**

1. **Rappi no estaba identificada.** El documento publicado abría en impersonal ("Por
   medio del presente documento se dan a conocer los términos y condiciones") y de
   ahí en adelante hablaba de Rappi sin haberla definido. Ahora abre con "Rappi
   S.A.S., identificada con NIT 900.843.898-9 y domiciliada en Bogotá D.C. (en
   adelante, "Rappi")".
2. **El presupuesto iba solo en cifra, y uno tenía decimales.** Bogotá decía "un
   valor total máximo de 37.000.000 de Créditos" y Barranquilla "un valor total
   máximo de **95.087.585,10** de Créditos". Era el único número del documento que no
   iba en letras y cifra, y los Créditos son puntos que no se fraccionan. Ahora sale
   "treinta y siete millones (37.000.000) de Créditos" y la parte decimal se descarta.
3. **La redención estaba suelta entre las restricciones.** La frase sobre dónde se
   pueden usar los Créditos era una viñeta más dentro de "Condiciones y
   Restricciones". Ahora va dentro de "Vigencia y redención de los Créditos", que es
   donde la ponen todos los demás modelos, y se dice una sola vez. Además las cuatro
   secciones excluidas (Rappi Travel, SOAT, Cajero ATM y Rappi Favor) dejaron de ser
   texto fijo y ahora son casillas que el comercial marca.
4. **El formato de la hora.** Los publicados escribían "11:00 a.m." y "07:00 a.m.";
   el motor escribe "11:00 a. m." y "7:00 a. m.", que es el formato del resto de los
   documentos de Colombia. Y "tasa de servicio" pasó a "tarifa de servicio", que es
   como lo llaman el resto de los modelos y la propia app.

**Qué pasa según la respuesta:** si alguno de los cuatro no te convence, se devuelve.

### 33. La modalidad del ETA está fija en "Turbo Restaurantes"
**NO BLOQUEANTE, es de producto**

**Qué dice hoy:** el modelo tiene la modalidad fija en "Turbo Restaurantes", que es
lo que dicen los dos documentos publicados.

**Qué pasa según la respuesta:** si existen otras modalidades, por ejemplo Turbo
Mercados, la modalidad se convierte en una pregunta con opciones para el comercial.

---

## Bloque D. Lo de antes, confirmaciones

### 34. Cashback: siete cambios frente al modelo aprobado de julio
**NO BLOQUEANTE**

1. El rol de Rappi pasó a la cláusula 1, antes estaba al final, para que "Rappi"
   quede definido antes de usarse.
2. Se agregó la frase que dice que los términos con mayúscula inicial tienen el
   significado que les dan los T&C de Uso de la Plataforma.
3. La tienda queda nombrada y definida en la cláusula de Cobertura, por ejemplo
   "Jumbo MT (en adelante, la Tienda Participante)". Antes el documento nunca decía
   el nombre de la tienda.
4. "Beneficio" se define en la cláusula de Mecánica y antes solo se usa en minúscula.
5. Se quitaron los asteriscos impresos y un doble punto.
6. Hay una frase opcional nueva para la compra mínima.
7. El organizador responde por "el beneficio o premio", que es la redacción común con
   Carrera de Compras.

### 35. Tres textos nuevos que se agregaron al catálogo de opciones
**NO BLOQUEANTE**

1. **Medios de pago.** Se agregó en las opciones "Todos" y "RappiCard" la frase que
   dice que los pedidos pagados con Créditos no son válidos. Antes esa frase solo
   estaba en la opción "excepto efectivo".
2. **Dos segmentos nuevos de usuario:** nuevos usuarios y usuarios reactivados, estos
   últimos con el número de días sin comprar.
3. **Dos condiciones opcionales nuevas:** "solo Turbo" y "solo consumo en el local".

### 36. Carrera de Compras: siete cambios, y falta el .docx v2 de julio para comparar
**NO BLOQUEANTE**

El kit que se usó para armar el modelo no traía la versión 2 de julio, así que el
modelo se armó desde la versión 1 más las decisiones de julio. Si tienes el v2,
conviene compararlo. Los cambios son:

1. El organizador ya no dice "(en adelante, Rappi)".
2. Hay una frase nueva de productos participantes con tres opciones: todos, una marca
   o productos específicos.
3. El desempate ahora es una oración que dice quién gana.
4. El premio dice "Cada ganador recibirá..." cuando hay varios ganadores.
5. Hay una cláusula de impuestos genérica, que es nueva.
6. Hay una frase de datos para la entrega cuando entrega el Organizador, también
   nueva.
7. La ley aplicable quedó igual a la de Cashback: se quitó la conciliación que traía
   la versión 1.

### 37. El nombre estructurado de la campaña queda raro dentro de una cláusula de Carrera de Compras
**NO BLOQUEANTE**

**Qué dice hoy el modelo:** "la campaña promocional denominada "{nombre de la
campaña}"". Con el nombre estructurado de la pregunta 17, esa frase queda así: "la
campaña promocional denominada "Carulla · Carrera de Compras · 5 oct 2026"".

**Por qué se pregunta:** se lee raro dentro de un articulado, aunque es correcto,
porque ese sí es el nombre oficial de la campaña. En Cashback el nombre solo va en
el título, así que ahí no hay nada que mirar.

**Qué pasa según la respuesta:** si prefieres otra redacción para esa frase, se
cambia en el modelo.

### 38. ¿El documento debe nombrar expresamente las secciones donde los Créditos no aplican?
**NO BLOQUEANTE**

**Qué dice hoy el texto legal:** que los Créditos se pueden usar "en cualquier
sección de la Plataforma Rappi habilitada para el uso de Créditos".

**Qué se sabe:** que en la práctica estos Créditos casi nunca aplican a RappiFavor,
Cajero ATM ni RappiTravel. Hoy eso está dicho en la **ayuda del formulario**, que la
lee el comercial, no en el documento que lee el usuario.

**Qué pasa según la respuesta:** si el modelo nombra las exclusiones de forma
expresa, el usuario sabe desde el principio dónde no puede gastar. Si no, se
mantiene la fórmula general y la exclusión depende de lo que la plataforma habilite.

### 39. "Consumo en el local": confirmar que ese sigue siendo el nombre de la modalidad en la app
**NO BLOQUEANTE**

**Qué dice el texto legal:** "bajo la modalidad de consumo en el local disponible en
la Plataforma Rappi". Se refiere al pedido **con el que el usuario se gana** el
beneficio, no a dónde se gastan los Créditos. En una revisión se leyó al revés, así
que se reescribió la pregunta del formulario para que quedara claro, sin tocar el
texto legal.

**Qué pasa según la respuesta:** si el nombre de esa modalidad en la app cambió, hay
que actualizar el texto.

---

## Bloque E. Travel, confirmaciones

### 40. La responsabilidad de Rappi Travel se dejó tal cual el modelo de junio
**NO BLOQUEANTE, ya decidido**

**Qué se decidió el 16 de septiembre:** dejar la cláusula de responsabilidad tal como
venía.

**La observación que queda anotada:** la Superintendencia de Transporte calificó a
Rappi Travel como proveedor indirecto con responsabilidad solidaria. Una exclusión
general de responsabilidad por la prestación del servicio puede leerse como cláusula
abusiva y, siendo abusiva, no protege. Hay una redacción alternativa escrita por si
algún día se retoma.

**Por qué sigue en la lista:** es la decisión de Travel con más exposición, y conviene
tener la opinión de un tercero antes de que empiecen a generarse campañas.

### 41. Cuatro decisiones sobre los Créditos que entrega Travel
**NO BLOQUEANTE**

1. **Créditos sin documento madre.** La cláusula 12 dice que estos Créditos se rigen
   por el propio T&C de la campaña. Solo cuando la redención incluye toda la
   plataforma se agrega el párrafo que remite a los T&C de Créditos de Rappi.
   ¿Correcto?
2. **El nombre de la sección de Créditos en la app.** El documento dice las secciones
   "Cuenta" y "Créditos", como en delivery. El modelo de junio de Travel decía "Promos
   y Créditos". ¿Cuál es el nombre real hoy?
3. **Pagos con Créditos en los descuentos.** La frase que excluye las órdenes pagadas
   con Créditos viene de los cashback, y hoy también sale en las campañas de
   descuento de Travel. ¿Se queda?
4. **Vigencia mínima de los Créditos.** Si el comercial pone menos de cinco días, la
   herramienta muestra un aviso pero deja seguir. ¿Debería bloquear?

### 42. Tres frases de Travel que se escribieron nuevas y necesitan visto bueno
**NO BLOQUEANTE**

1. **Cancelaciones.** Las viñetas de "Reembolso parcial" y "Plazo" son nuevas. Ya
   quedó aprobado el 16 de septiembre que si el Proveedor modifica la reserva y el
   usuario la acepta sin reembolso, conserva el Beneficio; pierde el Beneficio quien
   cancela, pide reembolso o modifica él mismo la reserva.
2. **El ejemplo del tope y el descuento variable.** Los dos son nuevos y salen del
   criterio de transparencia. El ejemplo del tope nació de un reclamo de agosto de
   2025.
3. **La entidad de vigilancia de Travel.** Hoy dice "la Superintendencia de Industria
   y Comercio y la Superintendencia de Transporte, según corresponda".

### 43. Tres cosas que quedaron raras en Travel y no se tocaron
**NO BLOQUEANTE**

1. **El texto del ámbito habla de vuelos aunque la campaña no tenga vuelos.** La frase
   dice "Aplica únicamente para vuelos con origen y destino en ... y para servicios
   que se presten en ...". En una campaña solo de hoteles, la primera mitad sobra y
   queda ruido en el documento. Se puede partir en dos para que solo salga la mitad
   que aplica.
2. **El nombre de una campaña sin marca aliada queda con la razón social adentro.**
   Por ejemplo "OPERADOR DE PRUEBA S.A.S. · 50% CASHBACK TRAVEL · 15 OCT 2026". Se
   puede poner "Rappi Travel" cuando no hay marca, o hacer la marca obligatoria.
3. **El conteo del beneficio por trayecto.** La opción existe en el formulario, pero
   falta confirmar que alguna campaña real la use.

---

## Bloque F. Alcance

### 44. Los descuentos que no son cashback no están en la herramienta
**NO BLOQUEANTE, es de producto**

**Qué se sabe:** de 1.184 solicitudes reales revisadas, los descuentos que no son
cashback (porcentaje de descuento, cupones, 2x1, combos y obsequios) son **319 de
711 promociones**, y la herramienta no los cubre. Hoy esas campañas siguen llegando
a Legal por el canal de siempre.

**Qué pasa según la respuesta:** define si la versión siguiente los incluye o si esa
demanda se queda fuera a propósito. Importa esta noche, porque es lo primero que va
a preguntar cualquier equipo legal que mire la herramienta y no encuentre su tipo de
campaña.

---
---

## Resumen para responder rápido

Son **44 preguntas**, de las cuales **23 son bloqueantes** (de la 1 a la 23) y
**21 no lo son** (de la 24 a la 44).

Las tres más importantes, si solo hay tiempo para tres:

1. **Pregunta 2**, el tope del envío gratis en Brasil. Es la única donde la duda
   cambia cuánto dinero paga el usuario, y la frase ambigua ya está en un T&C
   aprobado y publicado.
2. **Pregunta 5**, si el cashback por incumplimiento del ETA es una segunda excepción
   a la regla de que Rappi nunca es el organizador. Es la regla número uno del
   proyecto y va a ser la primera pregunta del canal de Legal Global.
3. **Pregunta 17**, el nombre de campaña como texto libre. Ya produjo un documento
   real titulado "99% de Cashback" cuyo articulado dice 50%, en un modelo que promete
   aplicar "la condición más favorable para ti".
