# QR Forge

**Pequeño código. Grandes posibilidades.**

Generador y personalizador de códigos QR en español. Gratis, sin cuentas, sin anuncios y con procesamiento local en tu navegador.

## Qué puedes crear

- Enlaces web, texto, Wi-Fi, WhatsApp, email, teléfono, SMS, contactos vCard y ubicaciones.
- Seis estilos de puntos, tres estilos de esquinas y seis diseños preestablecidos.
- Colores, degradados lineales y radiales, fondo transparente y logos locales.
- Exportaciones PNG, SVG, WebP y JPG a 512, 1024 o 2048 px. SVG es vectorial y escalable.
- Tema claro y oscuro, ajustes de corrección de errores y margen exterior.
- Guardado y recuperación del diseño en tu navegador, sin guardar el contenido ni el logo.
- Avisos de contraste, transparencia, densidad y logos que ayudan a revisar el diseño.

**La revisión de diseño no comprueba el escaneo.** Prueba cada QR con tu cámara antes de imprimirlo o compartirlo. Un contraste bajo, un logo o un fondo inadecuado pueden impedir su lectura. JPG no admite transparencia y se exporta con fondo blanco.

## Publicar en GitHub Pages

En este repositorio, abre **Settings → Pages** y elige:

| Opción | Valor |
| --- | --- |
| Source | Deploy from a branch |
| Branch | main |
| Folder | /(root) |

Pulsa **Save**. Cuando GitHub termine la publicación, el sitio estará en:

**https://JAVIKING190.github.io/QR-Forge/**

Los cambios que hagas en `main` se publicarán automáticamente. No hace falta configurar un workflow propio: GitHub realiza el despliegue de la rama. [Documentación oficial](https://docs.github.com/es/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Usarlo en tu computadora

Descarga el repositorio con **Code → Download ZIP**, descomprímelo y abre `index.html` en un navegador moderno. También puedes servir la carpeta localmente:

```sh
python -m http.server 8000
```

Después abre `http://localhost:8000`. No necesita Node.js, instalaciones de paquetes ni compilación.

## Privacidad y funcionamiento

La aplicación genera QR estáticos. El contenido queda dentro del código y no depende de un servicio de redirección. Para cambiar el destino tendrás que generar un QR nuevo. No se prometen códigos dinámicos, estadísticas ni edición de un QR ya impreso.

La generación y exportación no envían el contenido ni el logo a un servidor. No hay analítica, fuentes remotas ni scripts de CDN. La librería está incluida en `vendor/`. El servidor que aloja la web puede registrar las visitas HTTP normales. Abrir el enlace de GitHub o escanear un QR de un sitio externo conecta con ese servicio.

El navegador solo guarda el tema y, cuando pulsas **Guardar mi diseño**, los ajustes visuales en `localStorage`. El contenido, las contraseñas Wi-Fi y los logos no se guardan. Cualquier persona que escanee un QR Wi-Fi puede obtener los datos que contiene: compártelo con quienes quieras que tengan acceso.

Se limita el contenido a 1200 bytes para mantenerlo dentro de la capacidad de corrección H. Los lectores y sistemas operativos pueden interpretar de manera diferente SMS, vCard, ubicaciones o redes Wi-Fi. Prueba el tipo que necesites en tus dispositivos.

## Estructura

```text
index.html       Interfaz y contenido
styles.css       Diseño adaptable y temas
app.js           Contenido, personalización y exportación
favicon.svg      Icono de QR Forge
vendor/          Librería QR local y avisos de licencia
LICENSE          Licencia MIT del proyecto
```

## Créditos y licencia

Proyecto de [JAVIKING190](https://github.com/JAVIKING190), bajo licencia **MIT**.

La generación usa [qr-code-styling 1.9.2](https://github.com/kozakdenys/qr-code-styling), de Denys Kozak (MIT), que incorpora `qrcode-generator` de Kazuhiko Arase (MIT). Se conservan sus avisos en `vendor/`. El archivo de la librería se distribuye sin modificar.
