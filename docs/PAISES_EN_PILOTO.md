# Los países en piloto: los cuatro datos que faltan por confirmar

Ocho países están en piloto, que es el estado donde solo los ve el equipo de
pruebas. Para que un país salga a producción hay que confirmar cuatro datos
legales que van impresos en el documento. Los tres primeros son de forma; el
cuarto es el que más importa, porque enumera derechos.

Estos son los valores que la herramienta tiene puestos hoy. **Ninguno está
confirmado**: los puse yo por analogía con Colombia y con la legislación de cada
país. Marca el que esté bien o escribe el correcto.

Cuando confirmes uno, se cambia en la pestaña Países del Sheet y listo, sin
desplegar nada.

---

## México (MX)

Entidad legal: Tecnologías Rappi, S.A.P.I. de C.V. · RFC TRA150604TW1
Moneda: pesos MXN ($) · Persona: persona física

- **Separador de miles** (por confirmar): `,`
- **Término de días** (por confirmar): `días naturales`
- **Texto de hora local** (por confirmar): `hora de la Ciudad de México`
- **Derechos sobre los datos** (por confirmar): `tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO)`

## Perú (PE)

Entidad legal: Rappi S.A.C. · RUC 20602985971
Moneda: soles (S/ ) · Persona: persona natural

- **Separador de miles** (por confirmar): `,`
- **Término de días** (por confirmar): `días calendario`
- **Texto de hora local** (por confirmar): `hora local de la República del Perú`
- **Derechos sobre los datos** (por confirmar): `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

## Argentina (AR)

Entidad legal: RAPPI ARG S.A.S. · CUIT 30-71580389-1
Moneda: pesos ARS ($) · Persona: persona humana

- **Separador de miles** (por confirmar): `.`
- **Término de días** (por confirmar): `días corridos`
- **Texto de hora local** (por confirmar): `hora local de la República Argentina`
- **Derechos sobre los datos** (por confirmar): `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

## Chile (CL)

Entidad legal: Rappi Chile SpA · RUT 76.837.223-3
Moneda: pesos CLP ($) · Persona: persona natural

- **Separador de miles** (por confirmar): `.`
- **Término de días** (por confirmar): `días corridos`
- **Texto de hora local** (por confirmar): `hora de Santiago de Chile`
- **Derechos sobre los datos** (por confirmar): `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

## Ecuador (EC)

Entidad legal: RAPPIEC S.A.S. · RUC 1793010105001
Moneda: dólares USD ($) · Persona: persona natural

- **Separador de miles** (por confirmar): `,`
- **Término de días** (por confirmar): `días calendario`
- **Texto de hora local** (por confirmar): `hora del Ecuador continental`
- **Derechos sobre los datos** (por confirmar): `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

## Uruguay (UY)

Entidad legal: Brisanier S.A. · RUT 218175850017
Moneda: pesos UYU ($) · Persona: persona física

- **Separador de miles** (por confirmar): `.`
- **Término de días** (por confirmar): `días corridos`
- **Texto de hora local** (por confirmar): `hora local de la República Oriental del Uruguay`
- **Derechos sobre los datos** (por confirmar): `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

## Costa Rica (CR)

Entidad legal: RAPPI PURA VIDA, S.A. · cédula jurídica 3-101-768820
Moneda: colones CRC (₡) · Persona: persona física

- **Separador de miles** (por confirmar): `.`
- **Término de días** (por confirmar): `días naturales`
- **Texto de hora local** (por confirmar): `hora local de la República de Costa Rica`
- **Derechos sobre los datos** (por confirmar): `los derechos que la legislación aplicable te reconoce sobre tus datos personales`

## Brasil (BR)

Entidad legal: RAPPI BRASIL INTERMEDIAÇÃO DE NEGÓCIOS LTDA · CNPJ 26.900.161/0001-25
Moneda: reais (R$) · Persona: pessoa física

- **Separador de miles** (por confirmar): `.`
- **Término de días** (por confirmar): `dias corridos`
- **Texto de hora local** (por confirmar): `horário de Brasília`
- **Derechos sobre los datos** (por confirmar): _vacío_

---

## Cómo se ven en el documento

Así queda una frase con esos cuatro datos, con los valores de México:

> Los Créditos tendrán una vigencia de siete (7) **días naturales**...
> ...hasta las 11:59 p. m. del 31 de octubre de 2026 (**hora de la Ciudad de México**).
> ...un tope de **$25,000** por pedido.
> Podrás ejercer en cualquier momento **tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO)**.

## Lo que hace falta además de estos cuatro

Confirmar los cuatro datos deja el país listo **para Cashback**, que es el único
tipo habilitado hoy en los ocho. Habilitar más tipos en un país es otra decisión:
hay que revisar que el modelo de ese tipo funcione con su legislación.

Y en dos países hay una pregunta abierta, que ya estaba anotada en
`docs/PENDIENTES_LEGAL.md`:

- **Chile:** la autoridad de datos, porque la agencia nueva entra con la Ley 21.719.
- **México:** confirmar que el enlace de los T&C de Créditos abre (el enlace dice
  "terminos-ycondiciones", que parece una errata).
