# Publicar sin Squarespace: guía de montaje

Escrita el 6 de octubre de 2026. Es para las tres personas que tienen que hacer
algo una sola vez: **TI** (el bucket), **quien administra Squarespace** (la
página `/tyc`) y **Juan** (encenderlo en RappiMind). Después de eso nadie vuelve
a entrar a Squarespace para publicar un T&C.

## Qué cambia

Hoy cada campaña es un evento de Squarespace que alguien crea a mano. Con esto:

- Cada campaña sigue teniendo **su propio T&C y su propio enlace**:
  `https://promos.rappi.com/tyc?co/farmatodo-20-cashback-20-oct-2026`
- El texto vive en un archivo de Rappi en Google Cloud Storage. RappiMind lo
  escribe **en el momento en que el comercial genera**, y lo revisa: si no lo
  puede leer como lo leería cualquier persona, no lo da por publicado.
- Una sola página de promos.rappi.com, `/tyc`, creada una vez, lee el final del
  enlace y muestra ese T&C. La página pinta el texto como texto, nunca como
  HTML: ni con el bucket comprometido se le puede meter código a
  promos.rappi.com.
- **Ampliaciones:** la versión nueva queda en el mismo enlace, y cada versión
  anterior queda guardada con su fecha (`co/<dirección>/v1`, `v2`...).
- **Un error antes de que arranque:** se retira desde Mis campañas. El enlace
  queda diciendo que se retiró, y la corregida se genera de nuevo, con su propio
  enlace.
- **Cada hora** RappiMind revisa la página `/tyc` y lo publicado. Si la página
  deja de mostrar los T&C, le escribe a Legal. Si un archivo desaparece, lo
  vuelve a publicar, pero solo si el texto que rehace es idéntico al documento
  que recibió el comercial.
- Los eventos que ya existen en Squarespace se quedan como están. Las campañas
  de los países que no publican solos siguen el camino de siempre.

## 1. TI: el bucket

Un bucket de Cloud Storage, solo para esto. Necesita cuatro cosas.

**a. Crearlo.** Con acceso uniforme a nivel de bucket. Ejemplo (la ubicación
la elige TI):

```
gcloud storage buckets create gs://NOMBRE_DEL_BUCKET --location=us-east1 --uniform-bucket-level-access
```

El nombre tiene que ser único en todo Cloud Storage, y es público: va a quedar
escrito en el bloque de la página `/tyc`. Algo como `rappi-promos-tyc`, si está
libre. Solo minúsculas, números, guiones, guiones bajos y puntos, y no puede
contener "google".

**b. Lectura pública, sin poder listar.** La página de cada campaña lee su
archivo sin iniciar sesión.

```
gcloud storage buckets add-iam-policy-binding gs://NOMBRE_DEL_BUCKET --member=allUsers --role=roles/storage.legacyObjectReader
```

Ojo con el rol. La guía de Google para hacer público un bucket usa *Storage
Object Viewer* (`roles/storage.objectViewer`), pero ese rol también deja
**listar** el bucket: cualquiera vería los nombres de todas las campañas,
incluidas las que todavía no arrancan. *Storage Legacy Object Reader*
(`roles/storage.legacyObjectReader`) solo deja leer un archivo si se conoce su
nombre. Google lo da como el equivalente, con acceso uniforme, del permiso de
lectura de un archivo.

Si la organización tiene encendida la prevención de acceso público
(`storage.publicAccessPrevention`), este paso falla. Para un bucket que tiene
que ser público, Google indica desactivarla en el proyecto que contiene el
bucket, no en toda la organización.

**c. Escritura para la cuenta con la que corre RappiMind.** Es la que despliega
la web app y la que instaló la revisión de cada hora; normalmente es la misma.
`prepararPublicacionWeb` (paso 2) dice cuál es. Solo sobre este bucket, no
sobre el proyecto:

```
gcloud storage buckets add-iam-policy-binding gs://NOMBRE_DEL_BUCKET --member=user:CORREO_DE_QUIEN_DESPLIEGA --role=roles/storage.objectUser
```

*Storage Object User* deja crear, leer, reemplazar y borrar archivos. Reemplazar
hace falta: cada ampliación reescribe el archivo vigente del enlace.

**d. Permiso para que promos.rappi.com lo lea desde el navegador (CORS).** Un
archivo `cors.json`:

```json
[
  {
    "origin": ["https://promos.rappi.com"],
    "method": ["GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

```
gcloud storage buckets update gs://NOMBRE_DEL_BUCKET --cors-file=cors.json
```

Sin esto el archivo existe y es público, pero la página `/tyc` no lo puede leer
y muestra "No pudimos cargar los términos y condiciones".

**Lo que TI le devuelve a Juan:** el nombre del bucket.

## 2. Juan: encenderlo en RappiMind

1. **Las propiedades del script** (Apps Script › Configuración del proyecto ›
   Propiedades del script):
   - `PUBLICACION_BUCKET`: el nombre del bucket. Sin esta, todo sigue como
     antes.
   - Opcionales: `PUBLICACION_PAISES` (por ejemplo `CO, MX`; vacía, publican
     solos los países que hoy publican en promos.rappi.com, que son los que
     tienen ruta en la pestaña Países: hoy Colombia), `PUBLICACION_CARPETA`
     (vacía: `tyc`) y `PUBLICACION_VISOR` (vacía:
     `https://promos.rappi.com/tyc`).
2. **Desplegar la versión nueva** (`npm test`, `npm run push` y el despliegue
   versionado de siempre).
3. **Autorizar el permiso nuevo.** RappiMind ahora pide permiso de Cloud
   Storage. En el editor de Apps Script, corre `prepararPublicacionWeb` y
   acepta. El disparador de cada hora corre con la autorización de quien lo
   instaló: si fue la misma cuenta, debería quedar cubierto con esto, pero
   `prepararPublicacionWeb` no lo comprueba. Al día siguiente conviene mirar en
   Apps Script › Ejecuciones que `revisarPublicacionesPendientes` siga corriendo
   sin errores.

`prepararPublicacionWeb` dice con qué cuenta corre, publica una prueba y dice
qué encontró, en tres líneas:

1. Si la prueba quedó escrita en el bucket y se lee en público.
2. Si la página `/tyc` ya tiene el bloque de RappiMind (antes del paso 3 de
   esta guía va a decir que no: es normal).
3. El enlace para abrir la prueba en el navegador.

Si en la línea 1 dice que **la API de Cloud Storage no está habilitada**, hay
que habilitarla en el proyecto de Google Cloud de RappiMind. Si es el proyecto
que Apps Script crea por defecto, ese no se puede tocar a mano: según Google,
para manejar sus APIs hay que pasar el proyecto de Apps Script a un proyecto
estándar (Apps Script › Configuración del proyecto › Proyecto de Google Cloud).
Ese cambio no tiene vuelta atrás, pide volver a autorizar y, como RappiMind usa
Drive, hay que habilitar también la API de Drive en el proyecto nuevo.

Si dice que **la cuenta no tiene permiso para escribir**, falta el paso 1c.

## 3. Quien administra Squarespace: la página `/tyc`

Una vez, en el sitio de promos.rappi.com:

1. Pídele el bloque a Juan. Sale del repositorio con
   `npm run visor -- --bucket NOMBRE_DEL_BUCKET`, que deja
   `docs/VISOR_SQUARESPACE.html` listo para copiar entero. Va en ASCII puro para
   que ningún editor le cambie las tildes.
2. Crea una página que no salga en el menú, con la dirección `tyc` (queda en
   `https://promos.rappi.com/tyc`).
3. Agrégale un **bloque de código**. En su editor:
   - En el desplegable del modo, **HTML**. Según la ayuda de Squarespace, en
     modo JavaScript el código se muestra como texto en vez de correr.
   - **Display Source** apagado.
   - Pega el bloque completo, sin cambiarle nada.
4. Guarda y publica.

El bloque solo corre en los planes que permiten JavaScript en un bloque de
código: según la ayuda de Squarespace, Core, Plus, Advanced, Business, Commerce
Basic y Commerce Advanced.

Si en el editor de Squarespace el bloque dice que no pudo cargar, revisa en
promos.rappi.com antes de cambiar nada: el permiso del bucket (1d) es solo para
esa dirección.

## 4. La prueba de punta a punta

1. Juan vuelve a correr `prepararPublicacionWeb`. Las líneas 1 y 2 tienen que
   decir "Bien".
2. Abre el enlace de la línea 3
   (`https://promos.rappi.com/tyc?zz/prueba-de-rappimind`). Tiene que verse el
   texto de la prueba. Si dice que no pudo cargarlos, falta el CORS (1d).
3. Con la primera campaña real de Colombia, la pantalla final tiene que decir
   "Tu T&C está publicado", con su enlace. Ábrelo. Si algo sale mal y la
   campaña no ha arrancado, se retira desde Mis campañas.

## Cómo se apaga

Borrando `PUBLICACION_BUCKET`. Las campañas nuevas vuelven al camino de
Squarespace. Las que ya publicó RappiMind siguen en su enlace mientras existan
el bucket y la página `/tyc`, pero sin bucket configurado RappiMind ya no las
puede revisar, y no deja ampliarlas: la versión nueva no tendría dónde
publicarse.

## Lo que queda vigilado, y lo que no

- **La página `/tyc`** es el único punto del que dependen todos los enlaces
  nuevos. RappiMind la revisa cada hora y le escribe a Legal
  (`CORREO_COPIA_LEGAL`, o a los administradores si no hay) cuando deja de
  mostrar los T&C y cuando vuelve. La revisión busca una marca que solo existe
  dentro del código del bloque: si Squarespace dejara de correrlo, también se
  nota.
- **Cada campaña verificada** se revisa una vez al día mientras está vigente; la
  que quedó pendiente, cada hora.
- **Caché:** el archivo vigente se publica para que un navegador lo guarde
  máximo un minuto (`max-age=60`, lo que Google recomienda para un archivo que
  cambia). Después de una ampliación, alguien puede ver la versión anterior
  durante ese minuto.
- **Lo que RappiMind no corrige sola:** si lo publicado no coincide con el
  documento, avisa al comercial con Legal en copia y no lo reemplaza, porque
  alguien tiene que mirar qué cambió.

## Dónde está cada cosa en el código

- `src/core/publicacion_web.js`: el enlace, el archivo, las versiones y la
  lectura de lo publicado. Puro, con sus pruebas.
- `src/visor/visor.js`: el visor que va dentro del bloque.
- `scripts/visor.js`: arma el bloque (`npm run visor`).
- `src/server/PublicadorWeb.js`: subir, leer, retirar, reponer y vigilar.
- Decisiones 143 a 149 en `docs/DECISIONES.md`.
