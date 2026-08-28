# DeniDental

Cuaderno de trabajo y generador de facturas para **odontólogos autónomos** que
prestan servicios a clínicas dentales.

Registras los tratamientos que haces en cada clínica, la app aplica el modelo de
cobro acordado con cada una y al final de mes genera la factura en PDF con su
anexo detallado. Nada más. La idea es dejar de llevar esto en un Excel.

**Todo funciona en tu navegador. No hay servidor, no hay cuenta, no hay nube.**

---

## Aviso importante

Antes de usarlo, hay cuatro cosas que conviene tener claras:

1. **Tus datos se guardan solo en el navegador que estás usando.** No hay
   servidor. Nadie más los ve. Y nadie —tampoco el autor— puede recuperarlos
   por ti si los pierdes.

2. **Las copias de seguridad son tu responsabilidad.** Si borras los datos de
   navegación, cambias de dispositivo o usas otro navegador sin haber hecho
   copia, los datos se pierden. Hazla a menudo desde *Ajustes → Gestión de
   Datos*.

3. **No es un programa de facturación certificado.** No cumple con Verifactu
   (obligatorio para sociedades desde el 1 de enero de 2027 y para autónomos
   desde el 1 de julio de 2027, según el RDL 15/2025). Trátalo como un cuaderno
   de trabajo y un borrador de factura, y revisa siempre los importes antes de
   enviar nada.

4. **Tú eres responsable de los datos que introduces y de las facturas que
   emites.** El software se entrega tal cual, sin garantía de ningún tipo (ver
   [LICENSE](LICENSE)).

**No introduzcas datos de pacientes.** La app no los necesita para nada: le
basta con la clínica, el tratamiento y el importe. El campo de notas es libre,
así que evita escribir ahí nombres o información clínica — ese texto acaba en el
anexo que envías a la clínica y en el archivo de copia de seguridad, que no está
cifrado.

---

## Cómo usarlo

### Opción 1: en local (recomendado)

1. Descarga `index.html`.
2. Ábrelo con doble clic en cualquier navegador.
3. Guárdalo donde te sea cómodo. Los datos quedan asociados a ese archivo.

> **Ojo con los orígenes.** Un `index.html` abierto desde tu disco y la versión
> publicada en internet son, para el navegador, dos sitios distintos: **no
> comparten datos**. Si empiezas en uno y luego quieres cambiar al otro, exporta
> una copia desde el primero e impórtala en el segundo.

**Funciona sin conexión.** El `index.html` lleva dentro todo lo que necesita
(React, Tailwind, Babel y jsPDF), así que arranca aunque no haya cobertura ni
wifi. Por eso pesa unos 3,6 MB: son los mismos bytes que antes se descargaban
de internet en cada apertura, solo que ahora ya vienen dentro.

### Opción 2: versión publicada

<https://javiergarridoanllo.github.io/denidental/>

Los datos quedan asociados a ese dominio.

### Si te cambias de una a otra

Para el navegador, la versión de internet y un archivo descargado son **dos
sitios distintos y no comparten datos**. Al abrir la nueva la verás vacía, pero
no has perdido nada: tus datos siguen donde los tenías. Para traerlos:

1. Abre la versión que usabas → *Ajustes → Compartir copia* (o Descargar).
2. Abre la nueva → *Ajustes → Cargar Archivo* y selecciona esa copia.

La app te avisa de esto al arrancar si detecta que no hay ningún dato.

---

## Puesta en marcha

Al abrirlo por primera vez:

1. **Ajustes → Datos Fiscales**: tu nombre, NIF, dirección, ciudad, IBAN y tu
   porcentaje de IRPF. La ciudad es la que sale en el pie de la factura.
2. **Ajustes → Nueva Clínica**: nombre, razón social, CIF, dirección, serie de
   facturación (una letra, por ejemplo `A`) y el modelo de cobro.
3. **Ajustes → Tratamientos**: la lista de lo que haces.
4. **Ajustes → Laboratorio** (opcional): conceptos de laboratorio, si los
   compartes con la clínica.
5. **Haz una copia de seguridad.** En serio, hazla ya.

---

## Modelos de cobro

| Modelo | Cómo se calcula |
|---|---|
| **Porcentaje** | Un % de la tarifa de cada tratamiento. |
| **Pago fijo** | Días trabajados × importe diario. Los días salen de la Agenda y aquí sí cuentan las medias jornadas. |
| **Mínimo diario** | Por cada día, lo que produces o el mínimo, lo que sea mayor. Días enteros: no hace falta usar la Agenda. |
| **Mínimo mensual** | Igual, pero comparando el total del mes contra días × mínimo. |

En los modelos de mínimo se puede elegir **por clínica** el orden respecto a los
gastos de laboratorio:

- **1º resto el laboratorio, 2º aplico el mínimo** (por defecto). Con 300 € de
  producción, 100 € de laboratorio a tu cargo y un mínimo de 250 €: `300 − 100 =
  200`, que es menor que 250, así que cobras **250 €**.
- **1º aplico el mínimo, 2º resto el laboratorio**: `max(300, 250) − 100` =
  **200 €**.

## Gastos de laboratorio

Se anotan dentro del tratamiento. Introduces el **coste total** que factura el
laboratorio y la app calcula tu parte con el porcentaje de esa clínica. Con un
coste de 100 € y un 40 %: pagas 40 € y la clínica 60 €.

En la factura aparece desglosado, y el IRPF se aplica sobre la base ya neta de
laboratorio:

```
Servicios odontológicos      1.000,00 €
Gastos de laboratorio         -400,00 €
─────────────────────────────────────────
Base imponible                 600,00 €
Retenciones IRPF (15%)          -90,00 €
─────────────────────────────────────────
TOTAL A PERCIBIR               510,00 €
```

## Tratamientos pendientes de validar

Para los casos en que no está claro que la clínica te lo vaya a pagar: rehacer
el trabajo de otro profesional, tratamientos de cortesía, etc.

- **Pendiente de validar**: no entra en la factura salvo que lo incluyas al
  generarla.
- **Anulado**: no se factura nunca, pero queda registrado.

Antes de facturar puedes sacar un **informe de pendientes** en PDF con el motivo
de cada uno, para negociar con la clínica. Y puedes emitir una **factura solo de
los pendientes** si acabáis acordando cobrarlos aparte.

## Facturas

La numeración es por serie y **solo sube**: si anulas una factura, su número no
se reutiliza y no quedan huecos. Las facturas se **anulan**, no se borran: se
quedan tachadas, con su motivo, y el PDF sale marcado como ANULADA.

Cada factura guarda una copia congelada de tu IRPF y tus datos fiscales, así que
si mañana cambias de porcentaje o de dirección, las facturas antiguas se siguen
imprimiendo tal como se emitieron.

---

## Copias de seguridad

*Ajustes → Gestión de Datos*:

- **Compartir copia**: abre el menú de compartir del móvil (WhatsApp, correo,
  Drive…). En el ordenador copia el contenido al portapapeles.
- **Descargar**: guarda un archivo `.json`.
- **Cargar archivo** / **Pegar código**: restaura una copia.

La copia lo lleva todo: perfil, clínicas, tratamientos, laboratorio, tarifas,
histórico de precios, agenda, facturas y contadores de numeración.

Las copias de versiones anteriores se pueden cargar sin problema. Al revés no:
una copia hecha con una versión nueva, restaurada en una versión antigua,
perdería los datos que esa versión no conoce.

---

## Nota para quien lo modifique

Los datos viven en `localStorage` con el prefijo **`deni_v10_`**.

> **No cambies nunca ese prefijo.** El 22 de marzo de 2026 pasó de `deni_v9_` a
> `deni_v10_` y todos los usuarios perdieron el acceso a sus datos: seguían en el
> navegador, pero la app ya no miraba ahí. La versión de la aplicación y la
> versión del almacén son cosas distintas. La app puede ir a v11, v12, v20; el
> almacén se queda en `deni_v10_`.
>
> Los campos nuevos se **añaden**. Nunca se renombran ni se borran.

Todo es un único `index.html` sin proceso de compilación. Las librerías van
empotradas al principio del fichero y **el código de la app está al final**, en
el bloque `<script type="text/babel">`. Ahí se edita con un editor de texto
normal, igual que siempre: Babel viene dentro y traduce el JSX en el navegador.

`build-offline.js` solo hace falta para **actualizar la versión de una
librería**. Regenera el fichero empotrando las librerías de `node_modules` y el
CSS de Tailwind. Acepta como entrada el propio `index.html` ya empotrado, así
que no hay dos ficheros que se puedan desincronizar:

```
npm install react@18.2.0 react-dom@18.2.0 @babel/standalone@7.23.6 \
            jspdf@2.5.1 jspdf-autotable@3.5.28 tailwindcss@3.4.17
node build-offline.js      # genera index.offline.html
```

El CSS de Tailwind se genera con la paleta de colores completa en las utilidades
que usa la app (`bg-`, `text-`, `border-`, `border-l-`, `border-t-`), así que
añadir a mano una clase de color nueva funciona sin regenerar nada. Si añades
una utilidad de otro tipo que no se usaba antes, esa sí habría que regenerarla.

---

## Licencia

[MIT](LICENSE). Puedes usarlo, copiarlo, modificarlo y distribuirlo libremente.
Se entrega **sin garantía de ningún tipo**.
