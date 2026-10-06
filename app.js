/* QR Forge · MIT · JAVIKING190 */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const TYPES = [
    { id: 'url', name: 'Enlace', full: 'Enlace web', icon: '↗', fields: [{ id: 'url', label: '¿A dónde quieres llevarlos?', placeholder: 'https://tusitio.com', value: 'https://github.com/JAVIKING190', type: 'url', help: 'Una web, tu perfil, un menú o cualquier enlace HTTP/HTTPS.' }] },
    { id: 'text', name: 'Texto', full: 'Texto libre', icon: 'T', fields: [{ id: 'text', label: 'Tu mensaje', placeholder: 'Escribe algo que valga la pena descubrir…', type: 'textarea' }] },
    { id: 'wifi', name: 'Wi-Fi', full: 'Red Wi-Fi', icon: '⌁', fields: [{ id: 'ssid', label: 'Nombre de la red (SSID)', placeholder: 'Mi Wi-Fi' }, { id: 'security', label: 'Seguridad', type: 'select', options: [['WPA', 'WPA / WPA2 / WPA3 personal'], ['WEP', 'WEP'], ['nopass', 'Red abierta']] }, { id: 'password', label: 'Contraseña', type: 'password', wide: true }, { id: 'hidden', label: 'Red oculta', type: 'checkbox', wide: true }] },
    { id: 'whatsapp', name: 'WhatsApp', full: 'Chat de WhatsApp', icon: '◉', fields: [{ id: 'phone', label: 'Número con código de país', placeholder: '+593 99 123 4567', type: 'tel' }, { id: 'message', label: 'Mensaje inicial (opcional)', placeholder: 'Hola, quiero más información.', type: 'textarea' }] },
    { id: 'email', name: 'Email', full: 'Correo electrónico', icon: '@', fields: [{ id: 'email', label: 'Correo de destino', placeholder: 'hola@ejemplo.com', type: 'email' }, { id: 'subject', label: 'Asunto (opcional)' }, { id: 'body', label: 'Mensaje (opcional)', type: 'textarea', wide: true }] },
    { id: 'phone', name: 'Teléfono', full: 'Llamada telefónica', icon: '☎', fields: [{ id: 'phone', label: 'Número de teléfono', placeholder: '+593 99 123 4567', type: 'tel' }] },
    { id: 'sms', name: 'SMS', full: 'Mensaje SMS', icon: '☏', fields: [{ id: 'phone', label: 'Número de teléfono', placeholder: '+593 99 123 4567', type: 'tel' }, { id: 'message', label: 'Mensaje (opcional)', type: 'textarea' }] },
    { id: 'vcard', name: 'Contacto', full: 'Tarjeta de contacto', icon: '▣', fields: [{ id: 'first', label: 'Nombre' }, { id: 'last', label: 'Apellido (opcional)' }, { id: 'phone', label: 'Teléfono (opcional)', type: 'tel' }, { id: 'email', label: 'Email (opcional)', type: 'email' }, { id: 'organization', label: 'Organización (opcional)' }, { id: 'website', label: 'Web (opcional)', placeholder: 'https://ejemplo.com', type: 'url' }] },
    { id: 'location', name: 'Ubicación', full: 'Coordenadas geográficas', icon: '⌖', fields: [{ id: 'latitude', label: 'Latitud', placeholder: '-2.170998', type: 'number', help: 'De −90 a 90. Ejemplo: Guayaquil.' }, { id: 'longitude', label: 'Longitud', placeholder: '-79.922359', type: 'number', help: 'De −180 a 180.' }] }
  ];
  const PRESETS = [
    { name: 'Original', color: '#18232b', dots: 'rounded', corners: 'extra-rounded' },
    { name: 'Clásico', color: '#000000', dots: 'square', corners: 'square' },
    { name: 'Violeta', color: '#53268b', dots: 'extra-rounded', corners: 'dot' },
    { name: 'Océano', color: '#13568a', dots: 'rounded', corners: 'extra-rounded' },
    { name: 'Terracota', color: '#933c20', dots: 'classy-rounded', corners: 'extra-rounded' },
    { name: 'Bosque', color: '#23533d', dots: 'dots', corners: 'dot' }
  ];
  const defaults = { foreground: '#18232b', background: '#ffffff', dots: 'rounded', corners: 'extra-rounded', gradient: false, secondary: '#2457c6', 'gradient-type': 'linear', transparent: false, correction: 'H', margin: '0.15', resolution: '1024', format: 'png', 'logo-size': '0.2' };
  let currentType = 'url', logoData = '', logoRevision = 0, logoBusy = false, renderRevision = 0, renderTimer, toastTimer;
  const content = Object.fromEntries(TYPES.map(t => [t.id, Object.fromEntries(t.fields.map(f => [f.id, f.value || (f.options ? f.options[0][0] : f.type === 'checkbox' ? false : '')]))]));
  let presetButtons = [];
  const notify = (message) => { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4000); };
  const fail = (message) => { throw new Error(message); };
  const escapeWifi = (value) => value.replace(/([\\;,:"])/g, '\\$1');
  const escapeVcard = (value) => value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/[,;]/g, '\\$&');
  const checkEmail = (value) => { if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(value)) fail('Escribe una dirección de correo válida.'); return value; };
  const checkPhone = (value, international = false) => {
    if (!/^[+\d\s().-]+$/.test(value)) fail('Usa un número de teléfono válido.');
    const clean = value.replace(/[\s().-]/g, '');
    if (!/^\+?\d{5,15}$/.test(clean)) fail('El teléfono debe tener de 5 a 15 dígitos.');
    if (international && !/^\+?\d{8,15}$/.test(clean)) fail('Añade el código de país al número de WhatsApp.');
    return international ? clean.replace(/^\+/, '') : clean;
  };
  const checkUrl = (value) => {
    if (!value) fail('Escribe el enlace de destino.');
    const normalized = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
    let url; try { url = new URL(normalized); } catch { fail('Escribe un enlace válido, como https://ejemplo.com.'); }
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || /\s/.test(value)) fail('Usa un enlace web HTTP o HTTPS válido.');
    return url.href;
  };
  function payload() {
    const v = content[currentType];
    let data = '';
    switch (currentType) {
      case 'url': data = checkUrl(v.url.trim()); break;
      case 'text': if (!v.text.trim()) fail('Escribe el texto que quieres incluir.'); data = v.text; break;
      case 'wifi': {
        if (!v.ssid.trim()) fail('Escribe el nombre de la red Wi-Fi.');
        if (new TextEncoder().encode(v.ssid).length > 32) fail('El nombre de la red Wi-Fi admite hasta 32 bytes.');
        if (v.security !== 'nopass' && !v.password) fail('Escribe la contraseña de la red.');
        data = `WIFI:T:${v.security};S:${escapeWifi(v.ssid)};${v.security !== 'nopass' ? `P:${escapeWifi(v.password)};` : ''}H:${v.hidden ? 'true' : 'false'};;`;
        break;
      }
      case 'whatsapp': data = `https://wa.me/${checkPhone(v.phone, true)}${v.message ? `?text=${encodeURIComponent(v.message)}` : ''}`; break;
      case 'email': {
        const query = [v.subject ? `subject=${encodeURIComponent(v.subject)}` : '', v.body ? `body=${encodeURIComponent(v.body)}` : ''].filter(Boolean).join('&');
        data = `mailto:${checkEmail(v.email.trim())}${query ? '?' + query : ''}`; break;
      }
      case 'phone': data = `tel:${checkPhone(v.phone)}`; break;
      case 'sms': data = `SMSTO:${checkPhone(v.phone)}:${v.message}`; break;
      case 'vcard': {
        if (!v.first.trim()) fail('Escribe al menos el nombre del contacto.');
        const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${escapeVcard(v.last)};${escapeVcard(v.first)};;;`, `FN:${escapeVcard([v.first, v.last].filter(Boolean).join(' '))}`];
        if (v.phone) lines.push(`TEL;TYPE=CELL:${checkPhone(v.phone)}`);
        if (v.email) lines.push(`EMAIL:${escapeVcard(checkEmail(v.email.trim()))}`);
        if (v.organization) lines.push(`ORG:${escapeVcard(v.organization)}`);
        if (v.website) lines.push(`URL:${escapeVcard(checkUrl(v.website.trim()))}`);
        data = [...lines, 'END:VCARD'].join('\r\n'); break;
      }
      case 'location': {
        if (!v.latitude.trim() || !v.longitude.trim()) fail('Escribe las dos coordenadas.');
        const lat = Number(v.latitude), lon = Number(v.longitude);
        if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) fail('Revisa las coordenadas: latitud −90 a 90, longitud −180 a 180.');
        data = `geo:${lat},${lon}`; break;
      }
    }
    if (new TextEncoder().encode(data).length > 1200) fail('Hay demasiado contenido. Reduce el texto a menos de 1200 bytes para mantener el QR manejable.');
    return data;
  }
  function buildFields() {
    const type = TYPES.find(t => t.id === currentType), root = document.createElement('div');
    root.className = type.fields.length > 1 ? 'form-grid' : '';
    for (const f of type.fields) {
      const label = document.createElement('label'); label.textContent = f.label;
      if (f.wide) label.className = 'wide';
      let input;
      if (f.type === 'textarea') input = document.createElement('textarea');
      else if (f.type === 'select') { input = document.createElement('select'); for (const [value, name] of f.options) { const option = document.createElement('option'); option.value = value; option.textContent = name; input.append(option); } }
      else { input = document.createElement('input'); input.type = f.type || 'text'; }
      input.id = `field-${f.id}`; input.name = f.id; input.autocomplete = 'off';
      if (f.type === 'number') input.step = 'any';
      if (f.type === 'checkbox') { input.checked = !!content[currentType][f.id]; label.classList.add('switch-row'); }
      else { input.value = content[currentType][f.id]; input.placeholder = f.placeholder || ''; if (input.tagName !== 'SELECT') input.maxLength = 1600; }
      input.addEventListener('input', () => { content[currentType][f.id] = f.type === 'checkbox' ? input.checked : input.value; if (f.id === 'security') syncWifi(); scheduleRender(); });
      label.append(input);
      if (f.help) { const help = document.createElement('p'); help.className = 'help'; help.textContent = f.help; label.append(help); }
      root.append(label);
    }
    $('fields').replaceChildren(root); $('type-name').textContent = type.full; syncWifi();
  }
  function syncWifi() { if (currentType === 'wifi') { const open = content.wifi.security === 'nopass'; $('field-password').disabled = open; $('field-password').closest('label').hidden = open; } }
  function settings() { return Object.fromEntries(Object.keys(defaults).map(id => [id, $(id).type === 'checkbox' ? $(id).checked : $(id).value])); }
  function applySettings(values) {
    for (const [id, value] of Object.entries(values)) {
      if (!(id in defaults)) continue;
      const input = $(id);
      if (input.type === 'checkbox') { if (typeof value === 'boolean') input.checked = value; }
      else if (input.type === 'color') { if (/^#[0-9a-f]{6}$/i.test(value)) input.value = value; }
      else if (input.tagName === 'SELECT') { if ([...input.options].some(option => option.value === value)) input.value = value; }
      else if (input.type === 'range' && Number.isFinite(Number(value))) input.value = String(Math.max(Number(input.min), Math.min(Number(input.max), Number(value))));
    }
    syncSettings();
  }
  function syncSettings() {
    for (const id of ['foreground', 'background', 'secondary']) $(id + '-hex').textContent = $(id).value.toUpperCase();
    $('gradient-controls').hidden = !$('gradient').checked;
    $('background').disabled = $('transparent').checked;
    $('size-label').textContent = $('format').value === 'svg' ? 'SVG · escalable' : `${$('resolution').value} × ${$('resolution').value} px`;
    const isJpeg = $('format').value === 'jpeg' && $('transparent').checked;
    $('export-note').textContent = isJpeg ? 'JPG no admite transparencia: se exportará con fondo blanco.' : 'Listo para guardar y compartir. Sin marcas de agua.';
  }
  function options(data, size, s, image) {
    return {
      // The bundled Byte encoder consumes each character's low byte. Supply
      // UTF-8 bytes explicitly so accents, non-Latin scripts and emoji survive.
      width: size, height: size, type: 'svg', data: Array.from(new TextEncoder().encode(data), byte => String.fromCharCode(byte)).join(''), margin: Math.ceil(size * Number(s.margin)), image: image || undefined,
      qrOptions: { errorCorrectionLevel: s.correction, mode: 'Byte' },
      dotsOptions: { type: s.dots, color: s.foreground, ...(s.gradient ? { gradient: { type: s['gradient-type'], rotation: Math.PI / 4, colorStops: [{ offset: 0, color: s.foreground }, { offset: 1, color: s.secondary }] } } : {}) },
      cornersSquareOptions: { type: s.corners, color: s.foreground },
      cornersDotOptions: { type: s.corners === 'square' ? 'square' : 'dot', color: s.foreground },
      backgroundOptions: { color: s.transparent ? 'transparent' : s.background },
      imageOptions: { hideBackgroundDots: true, imageSize: Number(s['logo-size']), margin: Math.ceil(size * 0.01), saveAsBlob: true }
    };
  }
  function luminance(hex) { const c = hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return c[0] * .2126 + c[1] * .7152 + c[2] * .0722; }
  function designStatus(data, s) {
    const bg = luminance(s.transparent ? '#ffffff' : s.background), colors = [s.foreground, ...(s.gradient ? [s.secondary] : [])];
    const contrast = Math.min(...colors.map(c => (bg + .05) / (luminance(c) + .05)));
    const warnings = [];
    let severity = '';
    if (contrast < 4.5) { severity = 'bad'; warnings.push('Usa puntos más oscuros sobre un fondo claro.'); }
    else if (contrast < 7) { severity = 'warn'; warnings.push('Aumentar el contraste puede mejorar la lectura.'); }
    if (s.transparent) { severity ||= 'warn'; warnings.push('La lectura depende del fondo donde coloques el QR.'); }
    if (logoData) { severity ||= 'warn'; warnings.push(s.correction !== 'H' ? 'Con logo, usa corrección H.' : 'El logo tapa parte del código: comprueba el escaneo.'); }
    if (new TextEncoder().encode(data).length > 500) { severity ||= 'warn'; warnings.push('El QR es denso: imprímelo grande y prueba la lectura.'); }
    $('design-status').className = `design-status ${severity}`;
    $('status-icon').textContent = severity ? '!' : '✓';
    $('status-title').textContent = severity === 'bad' ? 'Revisa el contraste' : severity ? 'Prueba el escaneo' : 'Buen contraste';
    $('status-detail').textContent = warnings.length ? warnings.join(' ') : 'Revisión de diseño, no validación de escaneo. Prueba con tu cámara antes de compartirlo.';
  }
  function scheduleRender() { clearTimeout(renderTimer); renderRevision++; $('download').disabled = true; renderTimer = setTimeout(render, 120); }
  async function render() {
    const revision = ++renderRevision;
    $('download').disabled = true; syncSettings();
    try {
      const data = payload(), s = settings();
      if (typeof QRCodeStyling === 'undefined') fail('No se pudo cargar el generador. Recarga la página.');
      const code = new QRCodeStyling(options(data, 320, s, logoData));
      const blob = await code.getRawData('svg');
      if (revision !== renderRevision) return;
      const xml = await blob.text();
      if (revision !== renderRevision) return;
      // All SVG comes from the local QR renderer and a rasterized, local logo.
      const doc = new DOMParser().parseFromString(xml, 'image/svg+xml');
      if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') fail('No se pudo dibujar el QR.');
      $('qr').replaceChildren(document.importNode(doc.documentElement, true));
      $('content-error').hidden = true; designStatus(data, s); $('download').disabled = logoBusy;
    } catch (error) {
      if (revision !== renderRevision) return;
      $('qr').replaceChildren(); $('content-error').hidden = false;
      $('content-error').textContent = error instanceof Error ? error.message : 'No se pudo generar el QR. Reduce el contenido e inténtalo de nuevo.';
      $('design-status').className = 'design-status warn'; $('status-title').textContent = 'Completa el contenido'; $('status-icon').textContent = '!'; $('status-detail').textContent = 'Tu QR aparecerá cuando los datos sean válidos.';
    }
  }
  async function uploadLogo(file) {
    const revision = ++logoRevision;
    $('logo-error').hidden = true;
    if (!file) return;
    logoBusy = true; $('download').disabled = true;
    try {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) fail('Elige una imagen PNG, JPG o WebP.');
      if (file.size > 2 * 1024 * 1024) fail('El logo debe pesar menos de 2 MB.');
      const bitmap = await createImageBitmap(file);
      if (revision !== logoRevision) { bitmap.close(); return; }
      const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      logoData = canvas.toDataURL('image/png'); $('logo-label').textContent = file.name; $('logo-controls').hidden = false;
      $('correction').value = 'H';
    } catch (error) {
      if (revision === logoRevision) { $('logo-error').hidden = false; $('logo-error').textContent = error instanceof Error ? error.message : 'No se pudo leer la imagen.'; }
    } finally {
      if (revision === logoRevision) { logoBusy = false; scheduleRender(); }
    }
  }
  function clearLogo() { ++logoRevision; logoBusy = false; logoData = ''; $('logo').value = ''; $('logo-label').textContent = 'Añade tu logo'; $('logo-controls').hidden = true; $('logo-error').hidden = true; }
  async function download() {
    $('download').disabled = true; $('download').firstElementChild.textContent = 'Preparando…';
    try {
      const data = payload(), s = settings(), format = s.format, size = Number(s.resolution), image = logoData, type = currentType;
      const code = new QRCodeStyling(options(data, size, s, image));
      let blob;
      if (format === 'svg') blob = await code.getRawData('svg');
      else {
        const png = await code.getRawData('png'), bitmap = await createImageBitmap(png), canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d');
        if (format === 'jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size); }
        ctx.drawImage(bitmap, 0, 0); bitmap.close();
        blob = await new Promise(resolve => canvas.toBlob(resolve, `image/${format}`, .96));
        if (!blob || blob.type !== `image/${format}`) fail('Este navegador no admite el formato elegido. Prueba PNG.');
      }
      if (!blob) fail('No se pudo exportar el QR.');
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = `qr-forge-${type}.${format === 'jpeg' ? 'jpg' : format}`;
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
      notify('Tu QR está listo. Prueba un escaneo antes de compartirlo.');
    } catch (error) { notify(error instanceof Error ? error.message : 'No se pudo descargar. Inténtalo de nuevo.'); }
    finally { $('download').firstElementChild.textContent = 'Descargar QR'; scheduleRender(); }
  }
  for (const type of TYPES) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'type-button'; button.dataset.type = type.id; button.setAttribute('aria-pressed', String(type.id === currentType));
    const icon = document.createElement('span'); icon.className = 'type-icon'; icon.textContent = type.icon; icon.setAttribute('aria-hidden', 'true'); button.append(icon, document.createTextNode(type.name));
    button.addEventListener('click', () => { currentType = type.id; for (const b of $('types').children) b.setAttribute('aria-pressed', String(b === button)); buildFields(); scheduleRender(); }); $('types').append(button);
  }
  for (const [index, preset] of PRESETS.entries()) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'preset'; button.setAttribute('aria-pressed', String(index === 0));
    const swatch = document.createElement('span'); swatch.className = 'preset-swatch'; swatch.style.background = preset.color; swatch.setAttribute('aria-hidden', 'true'); button.append(swatch, document.createTextNode(preset.name));
    button.addEventListener('click', () => { applySettings({ foreground: preset.color, background: '#ffffff', dots: preset.dots, corners: preset.corners, gradient: false, transparent: false }); presetButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button))); scheduleRender(); }); $('presets').append(button); presetButtons.push(button);
  }
  for (const id of Object.keys(defaults)) $(id).addEventListener('input', () => { presetButtons.forEach(b => b.setAttribute('aria-pressed', 'false')); syncSettings(); scheduleRender(); });
  $('content-form').addEventListener('submit', event => event.preventDefault());
  $('logo').addEventListener('change', () => uploadLogo($('logo').files[0]));
  $('remove-logo').addEventListener('click', () => { clearLogo(); scheduleRender(); });
  $('download').addEventListener('click', download);
  $('save-design').addEventListener('click', () => { try { localStorage.setItem('qr-forge:design:v1', JSON.stringify(settings())); notify('Diseño guardado. Tu contenido y logo no se guardan.'); } catch { notify('El navegador no permite guardar el diseño.'); } });
  $('restore-design').addEventListener('click', () => { try { const saved = localStorage.getItem('qr-forge:design:v1'); if (!saved) { notify('Todavía no hay un diseño guardado.'); return; } const parsed = JSON.parse(saved); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) fail('El diseño guardado no es válido.'); applySettings(parsed); presetButtons.forEach(b => b.setAttribute('aria-pressed', 'false')); scheduleRender(); notify('Diseño recuperado.'); } catch { notify('No se pudo recuperar el diseño.'); } });
  $('reset').addEventListener('click', () => { applySettings(defaults); clearLogo(); presetButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === 0))); scheduleRender(); notify('Diseño restablecido.'); });
  function setTheme(theme) { document.documentElement.dataset.theme = theme; $('theme').textContent = theme === 'dark' ? '☀' : '☾'; $('theme').setAttribute('aria-label', `Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`); document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101112' : '#f4f5f0'; }
  $('theme').addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(theme); try { localStorage.setItem('qr-forge:theme', theme); } catch { /* Theme still works without storage. */ } });
  try { const savedTheme = localStorage.getItem('qr-forge:theme'); if (['dark', 'light'].includes(savedTheme)) setTheme(savedTheme); } catch { /* Storage is optional. */ }
  buildFields(); applySettings(defaults); render();
})();
