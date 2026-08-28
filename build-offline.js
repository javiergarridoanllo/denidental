/*
 * build-offline.js — genera la versión autocontenida de DeniDental
 * ---------------------------------------------------------------------------
 * QUÉ HACE
 *   Coge el index.html de desarrollo (el que enlaza las librerías a internet)
 *   y produce un único fichero que las lleva dentro, para que la app funcione
 *   SIN CONEXIÓN.
 *
 * POR QUÉ
 *   Hoy la app descarga ~3,5 MB de React, Tailwind, Babel y jsPDF en cada
 *   arranque. Sin cobertura no arranca: pantalla en blanco. Además, si algún
 *   día un CDN deja de servir esas versiones, la app se rompe para todo el
 *   mundo a la vez sin haber tocado nada.
 *
 * IMPORTANTE
 *   El fichero resultante SIGUE llevando Babel dentro, así que el código de la
 *   app continúa siendo JSX editable a mano, igual que antes. Está al final
 *   del fichero, dentro de <script type="text/babel">.
 *
 * CÓMO SE USA
 *   npm install react@18.2.0 react-dom@18.2.0 @babel/standalone@7.23.6 \
 *               jspdf@2.5.1 jspdf-autotable@3.5.28 tailwindcss@3.4.17
 *   node build-offline.js
 *
 * SALIDA
 *   index.offline.html
 * ---------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = __dirname;
const ENTRADA = path.join(RAIZ, 'index.html');
const SALIDA = path.join(RAIZ, 'index.offline.html');
const NM = path.join(RAIZ, 'node_modules');

const kb = (n) => Math.round(n / 1024) + ' KB';

// Un '</script' dentro de una cadena de JavaScript cerraría la etiqueta antes
// de tiempo y rompería el HTML. Se escapa la barra: el JS sigue siendo válido.
const seguro = (js) => js.replace(/<\/script/gi, '<\\/script');

// --- 1. Librerías JavaScript -----------------------------------------------
const LIBS = [
    ['react',            'react/umd/react.production.min.js'],
    ['react-dom',        'react-dom/umd/react-dom.production.min.js'],
    ['babel',            '@babel/standalone/babel.min.js'],
    ['jspdf',            'jspdf/dist/jspdf.umd.min.js'],
    ['jspdf-autotable',  'jspdf-autotable/dist/jspdf.plugin.autotable.min.js'],
];

const leidas = LIBS.map(([nombre, rel]) => {
    const f = path.join(NM, rel);
    if (!fs.existsSync(f)) {
        console.error(`\n  FALTA ${nombre}: no existe ${f}`);
        console.error('  Ejecuta el npm install que hay en la cabecera de este script.\n');
        process.exit(1);
    }
    const código = fs.readFileSync(f, 'utf8');
    console.log(`  ${nombre.padEnd(18)} ${kb(código.length)}`);
    return { nombre, código };
});

// --- 2. Localizar y quitar el bloque de librerías --------------------------
// Se acepta como entrada TANTO el fichero con enlaces a internet COMO uno ya
// autocontenido: en ese caso se quita el bloque viejo y se vuelve a empotrar.
// Así hay un solo fichero de referencia y no dos que se puedan desincronizar.
let html = fs.readFileSync(ENTRADA, 'utf8');
const original = html.length;

const BLOQUE_CDN = /<!-- LIBRERÍAS[\s\S]*?jspdf\.plugin\.autotable\.min\.js"><\/script>/;
const BLOQUE_YA_EMPOTRADO = /<!-- ═+\s*[\r\n]+\s*VERSIÓN AUTOCONTENIDA[\s\S]*?\/\* jspdf-autotable \*\/[\s\S]*?<\/script>/;
const MARCA = '<!--__LIBRERIAS__-->';

if (BLOQUE_YA_EMPOTRADO.test(html)) {
    console.log('  (la entrada ya era autocontenida: se regeneran las librerías)');
    html = html.replace(BLOQUE_YA_EMPOTRADO, () => MARCA);
    html = html.replace(/const ES_AUTOCONTENIDA = true;\r?\n\s*/, () => '');
    html = html.replace(/^\s*<style>\/\* tailwind \*\/[\s\S]*?<\/style>\s*$/m, () => '');
} else if (BLOQUE_CDN.test(html)) {
    html = html.replace(BLOQUE_CDN, () => MARCA);
} else {
    console.error('\n  No se encuentra el bloque de librerías en index.html.');
    console.error('  Si se han cambiado las etiquetas <script>, hay que ajustar este script.\n');
    process.exit(1);
}

// Tailwind tiene que escanear SOLO el código de la app. Si escanea el fichero
// con las librerías dentro (3,6 MB de JS minificado) tarda muchísimo y saca
// clases inventadas. Por eso se le pasa una copia ya sin librerías.
const tmpHtml = path.join(RAIZ, '.tw.build.html');
fs.writeFileSync(tmpHtml, html);

// --- 3. CSS de Tailwind ----------------------------------------------------
// En vez de empotrar el motor de Tailwind (que compila en el navegador en cada
// arranque), se genera el CSS ya hecho. Se incluye la paleta de colores
// completa en las utilidades que usa la app (bg, text, border, border-l,
// border-t) para que añadir una clase de color nueva a mano siga funcionando
// sin tener que regenerar nada.
console.log('\n  Generando el CSS de Tailwind...');
const COLORES = ['slate','gray','red','orange','amber','yellow','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','pink','rose'];
const TONOS = [50,100,200,300,400,500,600,700,800,900];
const PREFIJOS = ['bg','text','border','border-l','border-t'];
const safelist = [];
COLORES.forEach(c => TONOS.forEach(t => PREFIJOS.forEach(p => {
    safelist.push(`${p}-${c}-${t}`);
    if (p === 'bg' || p === 'text') safelist.push(`hover:${p}-${c}-${t}`);
})));

const tmpConf = path.join(RAIZ, '.tw.build.js');
const tmpIn = path.join(RAIZ, '.tw.build.css');
const tmpOut = path.join(RAIZ, '.tw.build.out.css');
fs.writeFileSync(tmpConf, `module.exports = ${JSON.stringify({ content: [tmpHtml], safelist, theme: { extend: {} }, plugins: [] })};`);
fs.writeFileSync(tmpIn, '@tailwind base; @tailwind components; @tailwind utilities;');
try {
    execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['tailwindcss', '-c', tmpConf, '-i', tmpIn, '-o', tmpOut, '--minify'],
        { cwd: RAIZ, stdio: 'pipe' });
} catch (e) {
    console.error('\n  No se ha podido generar el CSS de Tailwind.');
    console.error('  ' + (e.stderr ? e.stderr.toString().slice(0, 400) : e.message) + '\n');
    process.exit(1);
}
const css = fs.readFileSync(tmpOut, 'utf8');
[tmpConf, tmpIn, tmpOut, tmpHtml].forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
console.log(`  tailwind (css)     ${kb(css.length)}`);

// --- 4. Montar el fichero ---------------------------------------------------

// El fichero de la app usa CRLF: se mantiene también en lo que se inserta,
// para no dejar el resultado con saltos de línea mezclados. El contenido de
// las librerías se deja tal cual viene, sin tocar ni un byte.
const NL = '\r\n';
const empotrado = [
    '<!-- ═══════════════════════════════════════════════════════════════════',
    '     VERSIÓN AUTOCONTENIDA — las librerías van dentro del fichero.',
    '     No necesita conexión a internet.',
    '     Generado por build-offline.js. NO editar esta zona a mano.',
    '     EL CÓDIGO DE LA APP ESTÁ AL FINAL DEL FICHERO, en el bloque',
    '     <script type="text/babel">. Ahí sí se puede editar con normalidad.',
    '     ═══════════════════════════════════════════════════════════════════ -->',
    '    <style>/* tailwind */',
    css,
    '</style>',
    ...leidas.map(l => `    <script>/* ${l.nombre} */${NL}${seguro(l.código)}${NL}</script>`)
].join(NL);

// OJO: hay que pasar una FUNCIÓN como reemplazo, no una cadena.
// Con una cadena, JavaScript interpreta las secuencias $&, $', $` y $1 como
// patrones especiales, y el código minificado de React las contiene: el
// resultado era una librería corrupta y la app no arrancaba.
html = html.replace(MARCA, () => empotrado);

// Marca para que la app sepa que es la versión autocontenida
html = html.replace("const APP_VERSION = '", () => "const ES_AUTOCONTENIDA = true;\r\n        const APP_VERSION = '");

fs.writeFileSync(SALIDA, html, 'utf8');

console.log('\n  ─────────────────────────────────────────');
console.log(`  index.html          ${kb(original)}  (necesita internet)`);
console.log(`  index.offline.html  ${kb(html.length)}  (funciona sin internet)`);
console.log('  ─────────────────────────────────────────\n');
