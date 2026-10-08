# RappiMind v3 · Especificación

Versión 1.0 · septiembre de 2026 · Dueño: Juan Camilo Gallego (Legal CO)

## 0. Objetivo y alcance de hoy

Liberar a Legal de la redacción manual de T&C de campañas. El comercial elige país y tipo de campaña, responde preguntas cerradas, revisa un resumen y obtiene un Google Doc listo para publicar en Squarespace. Legal solo mantiene los modelos.

**Alcance de hoy (3 horas):**

1. Motor de documentos nuevo, con pruebas.
2. Tres tipos de campaña: Cashback (una tienda), Carrera de Compras y Cashback Day (varias tiendas).
3. Interfaz nueva por pasos (ver sección 8), con historial, ayuda y administración básica.
4. Países: Colombia activo; México, Perú, Argentina, Chile, Ecuador, Uruguay y Costa Rica en piloto (solo el equipo de pruebas los ve); Brasil bloqueado (su modelo va en portugués).

**Prioridad si el tiempo no alcanza:** Cashback completo de punta a punta primero; luego Carrera; luego Cashback Day. Nunca se sacrifican las validaciones.

**Fuera de alcance hoy:** publicación automática en Squarespace, integración con Campaign Manager, carga masiva, pegado desde Sheet en Cashback Day, modelo en portugués, leyendas para piezas.

## 1. Reglas no negociables

Ver `CLAUDE.md`. Resumen: Rappi nunca es organizador; determinismo total; el texto legal solo sale de `modelos/`; oración vs fragmento; sin tablas; sin texto libre legal.

## 2. Arquitectura

**Plataforma:** Google Apps Script (V8) como web app, administrado con `clasp` desde un repo nuevo de GitHub.

**Despliegue de la web app:** ejecutar como el propietario (la cuenta de Juan); acceso para cualquier usuario del dominio rappi.com. El correo del usuario se obtiene con `Session.getActiveUser().getEmail()` y se rechaza cualquier correo que no sea @rappi.com.

**Código compartido:** todo lo que no depende de Google (motor, derivados, validaciones, números, fechas, esquemas) vive en `src/core/` como funciones globales (sin `import`), y al final de cada archivo:

```js
if (typeof module !== 'undefined') { module.exports = { /* funciones */ }; }
```

Así corre igual en Node (pruebas) y en Apps Script, y también en el navegador (vista previa y validación en vivo).

**Build (`scripts/build.js`):**

1. Copia `src/core/*.js` y `src/server/*.js` a `dist/`.
2. Convierte `modelos/**/*.md` en `dist/Modelos.js` (un objeto `MODELOS` con el texto de cada modelo y cada bloque) y `data/paises.json` en `dist/PaisesSemilla.js`.
3. Arma `dist/Index.html`, `dist/Estilos.html`, `dist/App.html` y `dist/MotorCliente.html` (este último envuelve el código de `src/core` en una etiqueta script para la vista previa en el navegador).
4. Copia `appsscript.json` a `dist/`. `.clasp.json` apunta a `rootDir: dist`.

**Pruebas:** `node --test` (sin dependencias). Todo cambio en `src/core` o `modelos/` debe mantener las pruebas en verde.

**appsscript.json (referencia):**

```json
{
  "timeZone": "America/Bogota",
  "runtimeVersion": "V8",
  "exceptionLogging": "STACKDRIVER",
  "webapp": { "executeAs": "USER_DEPLOYING", "access": "DOMAIN" },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}
```

## 3. Datos

**Script Properties:** `SHEET_ID`, `CARPETA_RAIZ_ID`, `URL_FORMULARIO_LEGAL` (formulario manual de Legal), `CANAL_AYUDA_URL`, `CORREO_COPIA_LEGAL` (opcional).

**Función `setup()` (idempotente):** si no existen, crea el Google Sheet "RappiMind v3 · Base" y la carpeta "RappiMind v3" con una subcarpeta por país; guarda los IDs en Script Properties; crea las pestañas con encabezados; carga `Paises` desde `PaisesSemilla` solo si la pestaña está vacía; agrega a Juan Camilo Gallego, Anna Habermann y Paula Barahona como administradores. Nunca borra ni sobrescribe filas existentes.

**Pestañas:**

| Pestaña | Columnas |
|---|---|
| Paises | codigo, estado, y todas las llaves de `data/paises.json` |
| Equipo | email, nombre, rol (admin, legal, pruebas), pais, activo |
| Solicitudes | id, fecha, email, pais, tipo, version_modelo, nombre_campana, tienda, organizador, id_organizador, fecha_inicio, fecha_fin, link_doc, estado (generado, publicado), link_publicado, fecha_publicacion, datos_json |
| Registro | fecha, email, accion, detalle |

Cada dato va en su columna; `datos_json` guarda el formulario completo. El `id` tiene la forma `RM-AAAAMMDD-NNNN`.

## 4. Motor de documentos

### 4.1 Sintaxis de los modelos (`modelos/*.md`)

| Elemento | Significado |
|---|---|
| Línea que empieza con `%%` | Comentario (se ignora). La primera línea indica la versión del modelo. |
| `# Texto` | Título (negrita, centrado). |
| `## Texto` | Subtítulo (negrita, centrado). |
| `§ Título. Texto` | Cláusula numerada. El título es lo que va hasta el primer ". " (punto y espacio). Se renderiza como `N. Título.` en negrita seguido del texto. Si la línea solo tiene el título (`§ Topes y límites.`), se renderiza `N. Topes y límites.` sin agregar otro punto. La numeración se calcula al final, después de quitar bloques opcionales. |
| `• Texto` | Viñeta. |
| `**texto**` | Negrita. |
| Cualquier otra línea no vacía | Párrafo. |
| `{{CAMPO}}` | Placeholder. |
| `[[?CAMPO]]…[[/?]]` | Bloque opcional: se conserva si CAMPO tiene valor; si no, se borra completo con sus marcadores. Si la línea queda vacía, se elimina. |
| `[[#TIENDAS]]` y `[[/TIENDAS]]` (cada uno en su línea) | Bloque repetible: las líneas internas se repiten una vez por tienda, reemplazando los `{{TIENDA_*}}` de cada una. |
| `[[INCLUIR:nombre]]` (en su línea) | Se reemplaza por el contenido de `modelos/bloques/nombre.md` antes de todo lo demás. |

### 4.2 Pasos del render

1. Expandir `[[INCLUIR:…]]`.
2. Calcular valores: datos del formulario, datos del país y derivados (sección 5).
3. Expandir bloques repetibles.
4. Resolver bloques opcionales.
5. Reemplazar placeholders.
6. Numerar cláusulas.
7. Validar el resultado (4.3). Si falla, no se crea el Doc y se devuelve la lista de errores en lenguaje claro.

### 4.3 Validación (bloquea la generación)

1. Campos obligatorios del tipo y del país completos y con formato válido (sección 6).
2. Validaciones cruzadas del tipo (sección 5).
3. Todo placeholder fuera de un bloque opcional resuelve a un valor no vacío.
4. El texto final no contiene `{{`, `}}`, `[[` ni `]]`.
5. Red de seguridad sobre el texto final: falla si aparece `" ,"`, `" ."`, `".."` (sin contar `"..."`), `"()"`, `"( )"`, dos espacios seguidos, `", ."` o una línea de viñeta vacía.
6. El país está activo, o está en piloto y el usuario pertenece al Equipo.
7. El tipo de campaña está habilitado para ese país.

### 4.4 Documento de Google

1. Crear un Doc nuevo con `DocumentApp`, título `T&C · {nombre de la campaña} · {país} · {id}`.
2. Construir el cuerpo desde el texto renderizado: títulos centrados en negrita, cláusulas con el título en negrita, viñetas como lista, negrillas donde haya `**`. Fuente Arial 11, interlineado 1,15, justificado.
3. Moverlo a la subcarpeta del país (nunca a una carpeta general).
4. Compartirlo con el solicitante como lector (sin notificación de Drive).
5. Enviar un correo al solicitante (y copia opcional a `CORREO_COPIA_LEGAL`) con el link y los pasos para publicar.
6. Registrar la solicitud en `Solicitudes`.

## 5. Tipos de campaña

Cada tipo se define en `src/core/esquemas.js`: pasos, campos, reglas de visibilidad, validaciones y el modelo que usa. La interfaz se arma a partir del esquema: agregar un tipo nuevo no debe requerir tocar la interfaz.

**Marcas en los textos derivados:** (v2) texto que ya estaba aprobado en producción; (nuevo) texto propuesto que Juan debe confirmar en el punto de control A.

### 5.1 Campos comunes

| Campo | Tipo | Obligatorio | Placeholder o uso |
|---|---|---|---|
| pais | lista (países habilitados) | sí | datos del país |
| tipo | tarjetas | sí | modelo |
| nombreCampana | texto (máx. 80) | sí | NOMBRE_CAMPANA, NOMBRE_CAMPANA_MAYUS |
| tienda | texto (marca comercial) | sí (Cashback y Carrera) | TIENDA |
| alcance | lista: Nacional, Ciudades | sí (Cashback y Carrera) | TEXTO_TERRITORIO |
| ciudades | texto, separado por comas | si alcance = Ciudades | TEXTO_TERRITORIO |
| fechaInicio, horaInicio, fechaFin, horaFin | fecha, hora (00:00 y 23:59 por defecto) | sí | FECHA_INICIO, HORA_INICIO, FECHA_FIN, HORA_FIN |
| organizadorRazonSocial | texto | sí (Cashback y Carrera) | ORGANIZADOR |
| organizadorId | texto con validación por país | sí (Cashback y Carrera) | ID_ORGANIZADOR |
| segmento | lista: Todos, Pro y Pro Black, Nuevos usuarios, Usuarios reactivados | sí | TEXTO_SEGMENTO |
| diasSinCompra | número (1 a 365) | si segmento = reactivados | TEXTO_SEGMENTO |
| metodoPago | lista: Todos, Todos excepto efectivo, Solo RappiCard | sí | TEXTO_METODO_PAGO |
| compraMinima | número (opcional) | no | TEXTO_MINIMO_COMPRA o TEXTO_UMBRAL |
| declaracion | casilla "Confirmo que la información es veraz y corresponde a la campaña aprobada" | sí | no va al documento |

Validaciones cruzadas: fecha y hora de fin posteriores a las de inicio; fechas no anteriores a hoy (permitir hoy). La fecha de referencia se recibe como parámetro para que las pruebas no dependan del día en que se corren (las pruebas usan 16 de septiembre de 2026).

**Derivados comunes:**

- `NOMBRE_CAMPANA_MAYUS`: nombre en mayúsculas.
- `ID_ORGANIZADOR` (FRAGMENTO): `{tipo_id_organizador del país} {número formateado}`. Ejemplo: `NIT 900.111.222-1`.
- `FECHA_*` (FRAGMENTO): `17 de septiembre de 2026`. `HORA_*`: `9:00 a. m.`, `12:00 p. m.`, `12:00 a. m.`, `11:59 p. m.`
- `TEXTO_HORA_LOCAL` (FRAGMENTO): valor `texto_hora_local` del país.
- `TEXTO_TERRITORIO` (FRAGMENTO), (v2 para Nacional):
  - Nacional: `el territorio nacional de {pais_legal}`
  - Una ciudad: `la ciudad de {ciudad}, en {pais_legal}`
  - Varias: `las ciudades de {c1}, {c2} y {c3}, en {pais_legal}`
- `TEXTO_SEGMENTO` (ORACIÓN):
  - Todos (v2): `Pueden participar todos los Usuarios/Consumidores de la Plataforma Rappi que sean mayores de edad.`
  - Pro (v2): `Pueden participar los Usuarios/Consumidores que tengan activa la suscripción RappiPro y/o RappiPro Black.`
  - Nuevos (nuevo): `Pueden participar únicamente los Usuarios/Consumidores mayores de edad que realicen su primer pedido en la Plataforma Rappi durante la vigencia de la Campaña.`
  - Reactivados (nuevo): `Pueden participar únicamente los Usuarios/Consumidores mayores de edad que no hayan realizado pedidos en la Plataforma Rappi durante los {N en letras} ({N}) días anteriores al inicio de la Campaña.`
- `TEXTO_METODO_PAGO` (ORACIÓN), (nuevo: la frase sobre Créditos en "Todos" y "RappiCard" debe confirmarla Juan):
  - Todos: `Campaña válida para pedidos pagados con cualquiera de los medios de pago habilitados en la Plataforma Rappi. Los pedidos pagados total o parcialmente con Créditos no son válidos para la Campaña.`
  - Sin efectivo (v2 ajustado): `Campaña válida para pedidos pagados con todos los medios de pago habilitados en la Plataforma Rappi, excepto efectivo. Los pedidos pagados en efectivo, o total o parcialmente con Créditos, no son válidos para la Campaña.`
  - RappiCard (v2 más frase de Créditos): `Campaña válida únicamente para pedidos pagados con RappiCard. Los pedidos pagados total o parcialmente con Créditos no son válidos para la Campaña.`
- `TEXTO_MINIMO_COMPRA` (ORACIÓN, opcional; vacío si no hay monto): `Para acceder al Beneficio, el valor de los productos de tu pedido deberá ser igual o superior a {monto en letras} {moneda_nombre} ({moneda_simbolo}{monto formateado}), sin incluir el costo de envío, la tarifa de servicio ni las propinas.`
- `TEXTO_LIMITE_PEDIDOS` (ORACIÓN), campo `maxPedidos` (número) o casilla `sinLimite`:
  - 1: `Puedes obtener el Beneficio en un máximo de un (1) pedido durante la vigencia de la Campaña; los pedidos adicionales no generarán el Beneficio y se procesarán como pedidos regulares.`
  - N > 1: `Puedes obtener el Beneficio en un máximo de {N en letras} ({N}) pedidos durante la vigencia de la Campaña; los pedidos adicionales no generarán el Beneficio y se procesarán como pedidos regulares.`
  - Sin límite: `La Campaña no establece un número máximo de pedidos con Beneficio por Usuario/Consumidor, sin perjuicio del presupuesto disponible.`
- `TEXTO_CONDICIONES` (ORACIÓN o varias, opcional), casillas `condiciones` (nuevo, confirmar):
  - Solo Turbo: `El Beneficio aplica únicamente para pedidos realizados a través de Turbo.`
  - Solo consumo en el local: `El Beneficio aplica únicamente para pedidos realizados bajo la modalidad de consumo en el local disponible en la Plataforma Rappi.`

### 5.2 Cashback (una tienda) · modelo `cashback`

| Campo | Tipo | Obligatorio | Placeholder |
|---|---|---|---|
| porcentaje | número entero 1 a 100 | sí | PORCENTAJE |
| tope | número (monto por pedido) | sí | TOPE |
| presupuesto | número | sí | PRESUPUESTO |
| maxPedidos / sinLimite | número o casilla | sí (uno de los dos) | TEXTO_LIMITE_PEDIDOS |
| carga | lista: Inmediata, Al día siguiente, En una fecha | sí | TEXTO_CARGA |
| fechaCarga | fecha | si carga = En una fecha | TEXTO_CARGA |
| vigencia | lista: Por días, Hasta una fecha | sí | TEXTO_VIGENCIA_CREDITOS |
| diasVigencia | número 1 a 365 | si vigencia = Por días | TEXTO_VIGENCIA_CREDITOS |
| fechaFinRedencion | fecha | si vigencia = Hasta una fecha | TEXTO_VIGENCIA_CREDITOS |
| redencion | lista: Solo en la tienda, En secciones específicas, En cualquier sección | sí | TEXTO_LUGAR_REDENCION |
| secciones | casillas (lista configurable) | si redencion = secciones | TEXTO_LUGAR_REDENCION |
| condiciones | casillas | no | TEXTO_CONDICIONES |

Validaciones cruzadas: tope y presupuesto mayores que cero; tope menor o igual al presupuesto; fecha de carga dentro o después de la vigencia de la campaña; fecha fin de redención posterior al fin de la campaña.

**Filtro de entrada (preguntas sí o no antes del formulario):** ¿la campaña la fondea Rappi y no una tienda o marca? ¿la tienda o la marca exige sus propios T&C? Si alguna respuesta es sí, no se genera y se muestra la pantalla "Esta campaña la redacta Legal" con el link a `URL_FORMULARIO_LEGAL`.

**Derivados:**

- `PORCENTAJE` (FRAGMENTO, v2): `noventa y nueve por ciento (99%)`. 100 → `cien por ciento (100%)`.
- `TOPE` y `PRESUPUESTO` (FRAGMENTO): función `cantidadCreditos(n)`: `{n en letras} ({n formateado}) Créditos`, agregando `de` antes de "Créditos" cuando las letras terminan en "millón" o "millones". Ejemplos: `treinta mil (30.000) Créditos`, `doce millones (12.000.000) de Créditos`, `un millón quinientos mil (1.500.000) Créditos`.
- `TEXTO_CARGA` (FRAGMENTO): Inmediata (v2) `de manera inmediata una vez finalizada la orden`; Al día siguiente `al día siguiente de la finalización de la orden`; En una fecha `el {fecha}`.
- `TEXTO_VIGENCIA_CREDITOS` (FRAGMENTO): Por días (v2) `tendrán una vigencia de {N en letras} ({N}) {termino_dias del país} contados a partir de su carga`; Hasta una fecha `podrán redimirse hasta las 11:59 p. m. del {fecha}`.
- `TEXTO_LUGAR_REDENCION` (ORACIÓN), (v2 depurado):
  - Tienda: `Los Créditos podrán redimirse únicamente en la Tienda Participante donde se originó el Beneficio, dentro del Territorio.`
  - Secciones: `Los Créditos podrán redimirse en cualquier tienda de la sección “Restaurantes” de la Plataforma Rappi, dentro del Territorio.` (con varias: `de las secciones “Restaurantes” y “Turbo”`)
  - Cualquier sección: `Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio.`
  - Secciones configurables en `data/secciones.json` (nombres a confirmar por Juan).

### 5.3 Carrera de Compras · modelo `carrera_compras` (solo Colombia hoy)

| Campo | Tipo | Obligatorio | Placeholder |
|---|---|---|---|
| tiendasCarrera | lista de 1 a 10 filas: nombre de la tienda y en cuál de sus tiendas cuentan los pedidos (normal, Turbo, las dos o sin Turbo). Todas suman a un solo ranking (revisión Kenvue, K1, 8 de octubre de 2026) | sí | TEXTO_TIENDAS_PARTICIPANTES, LA_TIENDA, EN_LA_TIENDA, TEXTO_ACUMULADO_TIENDAS, TEXTO_TIENDA_TURBO |
| productos | lista: Todos los de la tienda, Los de una marca, Productos específicos | sí | TEXTO_PRODUCTOS |
| makerMarca | texto | si productos = marca | TEXTO_PRODUCTOS |
| productosLista | texto, separado por comas | si productos = específicos | TEXTO_PRODUCTOS |
| criterioGanador | lista: Mayor valor en compras, Mayor número de pedidos | sí | CRITERIO_GANADOR |
| numeroGanadores | número 1 a 500 | sí | FRASE_GANADORES |
| desempate | lista: Quien llegó primero, Mayor número de pedidos, Mayor valor en compras | sí | TEXTO_DESEMPATE |
| tipoPremio | lista: Créditos, Premio físico | sí | LISTA_PREMIOS, TEXTO_NATURALEZA_PREMIO |
| creditosPremio | número | si tipoPremio = Créditos | LISTA_PREMIOS |
| descripcionPremio | texto (máx. 150) | si tipoPremio = físico | LISTA_PREMIOS |
| entregaPor | lista: El Organizador, Rappi como operador logístico | sí | TEXTO_ENTREGA, TEXTO_DATOS_ENTREGA |
| medioNotificacion | lista: Correo electrónico, Llamada telefónica, Notificación en la Plataforma Rappi | sí | MEDIO_NOTIFICACION |
| fechaNotificacion | fecha | sí | FECHA_NOTIFICACION |
| plazoConfirmacion | número 1 a 30 (5 por defecto) | sí | PLAZO_CONFIRMACION |
| compraMinima | número (opcional) | no | TEXTO_UMBRAL |

Validaciones cruzadas: el desempate no puede ser el mismo criterio del ganador; la fecha de notificación debe ser posterior al fin de la campaña.

**Filtro de entrada:** ¿hay azar (sorteo, rifa, raspa y gana)? ¿hay premios distintos por puesto o tabla de puntos? ¿el premio es una boleta, una experiencia o está ligado a un evento? ¿la tienda o la marca exige sus propios T&C? Si alguna es sí, va a Legal. Ya no se pregunta si participan varias tiendas: la Carrera las acepta (una fila por tienda, un solo ranking).

**Derivados (textos de Legal, julio de 2026, con ajustes marcados):**

- `TEXTO_PRODUCTOS` (ORACIÓN, nuevo):
  - Todos: `Participan en el concurso todos los productos del catálogo de la Tienda Participante en la Plataforma Rappi (en adelante, los “Productos Participantes”).`
  - Marca: `Participan en el concurso únicamente los productos de la marca {makerMarca} disponibles en la Tienda Participante a través de la Plataforma Rappi (en adelante, los “Productos Participantes”).`
  - Específicos: `Participan en el concurso únicamente los siguientes productos de la Tienda Participante (en adelante, los “Productos Participantes”): {lista}.`
- `CRITERIO_GANADOR` (FRAGMENTO): Mayor valor `el mayor valor total en compras de Productos Participantes`; Más pedidos `el mayor número de pedidos válidos con Productos Participantes`.
- `FRASE_GANADORES` (ORACIÓN, v2): 1 `Resultará ganador el participante que ocupe la primera posición del ranking.`; N > 1 `Resultarán ganadores los {N en letras} ({N}) participantes que ocupen las primeras posiciones del ranking.`
- `TEXTO_DESEMPATE` (ORACIÓN, nuevo: reemplaza el fragmento de julio para que diga quién gana):
  - Primero: `En caso de empate, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de su último pedido válido.`
  - Más pedidos: `En caso de empate, ganará el participante con el mayor número de pedidos válidos durante la vigencia.`
  - Mayor valor: `En caso de empate, ganará el participante con el mayor valor total en compras durante la vigencia.`
- `LISTA_PREMIOS` (ORACIÓN, v2 ajustado a varios ganadores; "Cada ganador" si N > 1, "El ganador" si N = 1):
  - Créditos: `Cada ganador recibirá {cantidadCreditos(creditosPremio)}, que serán acreditados en su Billetera de Créditos.`
  - Físico: `Cada ganador recibirá el siguiente premio: {descripcionPremio}.`
- `TEXTO_NATURALEZA_PREMIO` (ORACIÓN, v2 con el link agregado):
  - Créditos: `El premio consiste en Créditos acreditados en la Billetera de Créditos de la Plataforma Rappi, los cuales son intangibles, no constituyen dinero en efectivo, no son transferibles a terceros y se rigen por los Términos y Condiciones de Funcionamiento de los Créditos de la Plataforma Rappi, disponibles en: {url_tc_creditos}.`
  - Físico: `El premio consiste en un bien de carácter físico, cuya existencia, calidad, garantía y entrega son responsabilidad exclusiva del Organizador. Rappi no fabrica, comercializa ni garantiza dicho bien.`
- `TEXTO_ENTREGA` (ORACIÓN, v2):
  - Organizador: `La entrega del premio estará a cargo exclusivamente del Organizador, quien coordinará directamente con el ganador las condiciones de tiempo, modo y lugar de entrega, siendo el único responsable de la misma.`
  - Rappi: `La entrega del premio será gestionada por Rappi en su calidad de operador logístico y por cuenta del Organizador, quien conserva la calidad de responsable del premio; Rappi coordinará con el ganador las condiciones de tiempo, modo y lugar de entrega.`
- `TEXTO_DATOS_ENTREGA` (ORACIÓN, opcional, nuevo; solo si entrega el Organizador): `Para la entrega del premio, Rappi podrá compartir con el Organizador únicamente los datos de contacto del ganador que sean estrictamente necesarios para ese fin, previa autorización del ganador.`
- `MEDIO_NOTIFICACION` (FRAGMENTO, v2): Correo `el correo electrónico registrado en la cuenta del ganador`; Llamada `una llamada telefónica al número registrado en la cuenta del ganador`; Plataforma `una notificación dentro de la Plataforma Rappi`.
- `PLAZO_CONFIRMACION` (FRAGMENTO): `cinco (5) días hábiles`; 1 → `un (1) día hábil`.
- `TEXTO_UMBRAL` (ORACIÓN, v2 con moneda): sin monto `No se exige un valor mínimo de compra por pedido para participar en la Campaña.`; con monto `Únicamente contabilizarán para el concurso los pedidos cuyo valor sea igual o superior a {monto en letras} {moneda_nombre} ({moneda_simbolo}{monto formateado}).`

### 5.4 Cashback Day · modelo `cashback_day` (solo Colombia hoy)

Tipo separado del Cashback. Los datos globales (porcentaje, tope, vigencia de créditos, carga, redención, segmento, método de pago, mínimo de compra, máximo de pedidos, condiciones, fechas y horas) se preguntan una sola vez. El horario es global.

**Lista `tiendas`** (mínimo 2, máximo 60), componente repetible con "Agregar tienda" y "Quitar":

| Campo por tienda | Tipo | Placeholder |
|---|---|---|
| marca | texto | TIENDA_MARCA |
| razonSocial | texto | TIENDA_RAZON_SOCIAL |
| id | texto con validación por país | TIENDA_ID (formateado con tipo de ID) |
| ciudades | texto separado por comas, o casilla "Nacional" | TIENDA_CIUDADES |
| presupuesto | número | TIENDA_PRESUPUESTO (con `cantidadCreditos`) |

Todos los campos de cada tienda son obligatorios. El error indica la fila y el campo. No se permiten dos tiendas con el mismo ID. `TIENDA_CIUDADES`: `Cali`, `Barranquilla, Cartagena y Santa Marta` o `cobertura nacional`.

El organizador es colectivo: cada tienda organiza su propio beneficio. No existen `ORGANIZADOR` ni `ID_ORGANIZADOR` en este tipo.

Pendiente de confirmar por Juan: si el máximo de pedidos aplica en toda la campaña o por tienda (hoy: en toda la campaña).

## 6. Validación de ID por país

| País | Tipo | Regla |
|---|---|---|
| CO | NIT | 9 dígitos más dígito de verificación. Pesos desde la derecha: 3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71. r = suma mod 11; dv = r si r es 0 o 1, si no 11 − r. Formato de salida `NIT 900.111.222-1`. |
| MX | RFC | Persona moral: 3 letras, 6 dígitos (fecha) y 3 de homoclave. Dígito: se antepone un espacio, se mapea cada carácter (0 a 9 → 0 a 9; A a N → 10 a 23; & → 24; O a Z → 25 a 36; espacio → 37; Ñ → 38), pesos 13 a 2 sobre los primeros 12; r = suma mod 11; dv = 0 si r = 0; "A" si 11 − r = 10; si no 11 − r. Aceptar también RFC de persona física (13 caracteres, sin espacio antepuesto). |
| PE | RUC | 11 dígitos. Pesos 5, 4, 3, 2, 7, 6, 5, 4, 3, 2. dv = 11 − (suma mod 11); 10 → 0; 11 → 1. |
| AR | CUIT | 11 dígitos. Pesos 5, 4, 3, 2, 7, 6, 5, 4, 3, 2. dv = 11 − (suma mod 11); 11 → 0; 10 → inválido. Formato `CUIT 30-71580389-1`. |
| CL | RUT | Cuerpo más dígito. Pesos 2 a 7 cíclicos desde la derecha. dv = 11 − (suma mod 11); 11 → 0; 10 → K. Formato `RUT 76.837.223-3`. |
| EC | RUC | 13 dígitos terminados en 001. Si el tercer dígito es 9 (sociedad privada): pesos 4, 3, 2, 7, 6, 5, 4, 3, 2 sobre los primeros 9; r = suma mod 11; dv = 0 si r = 0, si no 11 − r; debe coincidir con el décimo dígito. Otros casos: solo formato. |
| UY | RUT | 12 dígitos. Pesos 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2. dv = 11 − (suma mod 11); 11 → 0; 10 → inválido. |
| CR | cédula jurídica | Formato `3-XXX-XXXXXX`. Sin dígito verificador. |

Estos algoritmos ya se verificaron contra los ID reales de las sociedades Rappi de cada país (todos válidos).

## 7. Números, montos y fechas

- `numeroEnLetras(n)` en español hasta 999.999.999.999: cien/ciento; dieciséis, veintidós, veintitrés, veintiséis con tilde; "mil" (nunca "un mil"); "un millón", "dos millones".
- Apócope ante sustantivo masculino (pedido, día, participante, Crédito) y ante "mil": uno → un, veintiuno → veintiún, "treinta y uno" → "treinta y un". Ejemplos: `un (1) pedido`, `veintiún (21) participantes`, `veintiún mil (21.000) Créditos`. No hay apócope ante "por ciento": `veintiuno por ciento (21%)`.
- Montos: enteros, con el separador de miles del país (`separador_miles`). CO: `12.000.000`; MX: `12,000,000`.
- Fechas: `17 de septiembre de 2026`. Horas: `9:00 a. m.`

## 8. Experiencia de usuario

### 8.1 Flujo

0. **Inicio.** Qué hace la herramienta y los tres pasos: "Llena el formulario", "Revisa y genera", "Publica los T&Cs" ("En 2 minutos recibirás un email con el documento generado y listo para publicar en SquareSpace. Recuerda seguir las instrucciones para asegurar que los T&Cs queden publicados exitosamente.").
1. **País.**
2. **Tipo de campaña** (solo los habilitados para el país) y **filtro de entrada**.
3. **Datos de la campaña** (nombre, tienda o tiendas, territorio, fechas).
4. **Organizador** (no aplica en Cashback Day, donde va dentro de cada tienda).
5. **Mecánica y beneficio**, una pregunta a la vez, con ejemplo debajo de cada campo.
6. **Condiciones** (casillas cuando las opciones no son excluyentes).
7. **Resumen** con todo lo ingresado, links para editar cada sección y la casilla de declaración. El botón "Generar T&C" queda deshabilitado hasta que todo esté completo y válido, y muestra qué falta.
8. **Listo:** link al documento, instructivo para publicar en Squarespace (paso a paso con capturas) y campo "Pega aquí el link publicado" (debe empezar por `https://promos.rappi.com/`).

Además:
- **Historial:** mis solicitudes (los administradores ven todas), con estado, link al documento, link publicado (editable) y "Usar como base" para una campaña nueva.
- **Ayuda:** preguntas frecuentes, incluido un aviso destacado: si tienes dudas sobre si la dinámica tiene azar o suerte, confirma primero con el equipo legal de tu país, con ejemplos de concursos no válidos. Contactos: Paula Barahona, Anna Habermann y Juan Camilo Gallego. Link al canal de ayuda (`CANAL_AYUDA_URL`).
- **Administración** (solo admin): países (cambiar estado), equipo (agregar o desactivar), solicitudes (filtrar y exportar CSV).
- **Vista previa en vivo** (deseable si hay tiempo): panel lateral con el texto del T&C que se va llenando mientras el comercial responde, con los datos resaltados. Usa el mismo motor de `src/core`.

### 8.2 Comentarios de Anna y cómo se resuelven

| Comentario | Solución en v3 |
|---|---|
| El paso 3 debe ser "Publica los T&Cs" con explicación | Inicio y paso 8 con ese texto e instructivo |
| "Consumo en el local" confunde con la redención | Se separa: la redención es una pregunta; "consumo en el local" es una condición opcional con explicación |
| Opciones que no son excluyentes | Casillas en condiciones y en secciones de redención |
| El botón Generar se ve activo todo el tiempo | Deshabilitado hasta completar, con lista de faltantes |
| Aviso sobre azar en preguntas frecuentes, con ejemplos | Ayuda, más la pregunta del filtro de entrada |
| Quitar a Dave | Contactos actualizados (Paula Barahona) |
| Canal global | Link configurable en Ayuda |
| Fotos de Squarespace | Instructivo con capturas en el paso 8 y en Ayuda |
| La prueba se guardó en la carpeta ALL | Siempre en la carpeta del país |
| Campo para el link publicado | Paso 8 e Historial |
| Le gustó la coronita | Se conserva la coronita en la identidad de la app |

### 8.3 Dirección visual

- Identidad Rappi: acento naranja `#FF441F` sobre fondo claro (blanco o gris muy claro, no crema), texto casi negro sobre blanco, un gris medio para ayudas.
- Tipografía: Poppins para títulos y botones, Lato para el cuerpo.
- Un solo elemento memorable: la vista previa del documento que se arma en vivo. Todo lo demás, sobrio.
- Nada de kit genérico de tarjetas idénticas con sombras; nada de etiquetas en mayúsculas sostenidas.
- Barra de progreso por pasos (el flujo sí es una secuencia).
- Adaptable a celular, foco visible con teclado, contraste accesible.
- Textos cortos, en voz activa y en español; los botones dicen lo que pasa ("Generar T&C", "Guardar link publicado"). Los errores dicen qué pasó y cómo arreglarlo.

## 9. Roles

| Rol | Puede |
|---|---|
| comercial (cualquier @rappi.com) | Generar en países activos, ver su historial, guardar link publicado |
| pruebas | Lo anterior y generar en países en piloto |
| legal | Lo anterior y ver todas las solicitudes de su país |
| admin | Todo, incluida la administración |

## 10. Criterios de aceptación

1. `npm test` en verde, con los casos de `pruebas/casos_base.json` (los que deben pasar pasan y los que deben fallar fallan con el error esperado).
2. Pruebas de números: `un (1) pedido`, `veintiún (21) participantes`, `un millón (1.000.000) de Créditos`, `un millón quinientos mil (1.500.000) Créditos`, `cien por ciento (100%)`.
3. Un Cashback real de Colombia generado desde la web app: Doc en la carpeta de Colombia, compartido con el solicitante, correo recibido, fila completa en Solicitudes.
4. Una Carrera y un Cashback Day generados sin errores.
5. Un intento con organizador vacío o NIT inválido no genera nada y explica el error.
6. Un país en piloto no aparece para un comercial que no está en Equipo.
7. Guardar un link publicado actualiza el estado a "publicado".

## 11. Plan de 3 horas

| Bloque | Tiempo | Entregable | Punto de control |
|---|---|---|---|
| 0 | 15 min | Repo, `package.json`, build, `.clasp.json`, `appsscript.json` | Juan confirma que `clasp push` funciona |
| 1 | 45 min | `src/core` completo, esquemas de los 3 tipos, pruebas en verde, `npm run previsualizar` | **A:** Juan pega en el chat de Legal los textos de 3 casos para revisión |
| 2 | 60 min | `setup()`, servidor, interfaz por pasos para Cashback, Doc, correo, Solicitudes, despliegue de prueba | **B:** Juan genera el caso Jumbo desde la web app |
| 3 | 45 min | Carrera y Cashback Day en la interfaz, Historial, Ayuda, Administración | **C:** tres documentos generados sin errores |
| 4 | 15 min | Ajustes finales, despliegue versionado, `docs/PROGRESO.md` y guía rápida | Juan aprueba la salida |
