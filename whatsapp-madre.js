const WA_CACHE_KEY = 'mce_whatsapp_madre_cache_v1';
const WA_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const MADRE_URL = 'https://mercado-central-express.vercel.app';

const WA_EMOJI = {
  smile: String.fromCodePoint(0x1f60a),
  heart: String.fromCodePoint(0x2764, 0xfe0f),
  flower: String.fromCodePoint(0x1f338),
  gift: String.fromCodePoint(0x1f381),
  sparkles: String.fromCodePoint(0x2728),
  star: String.fromCodePoint(0x2b50),
  cooking: String.fromCodePoint(0x1f373),
  beauty: String.fromCodePoint(0x1f484),
  relax: String.fromCodePoint(0x1f9d8),
  point: String.fromCodePoint(0x1f449),
  down: String.fromCodePoint(0x1f447),
};

const MADRE_TEMPLATES = [
  ({ greeting }) =>
    [
      greeting,
      '',
      '🌸 *¡Celebra a mamá con el regalo perfecto!* 🌸',
      '',
      'Tenemos *ofertas especiales por el Día de la Madre* para ti que ya eres parte de nuestra familia ❤️',
      '',
      '🍳 *Pack de Cocina Completo — S/ 120.00*',
      '✅ Procesadora de alimentos multiusos: perfecta para tamales, humitas, moler carnes, semillas y verduras',
      '✅ Molino de granos: ideal para granos y semillas secos',
      '',
      '💆 *Kit de Belleza Facial — S/ 48.00*',
      '✅ Masajeador de rostro',
      '✅ 6 pares de parches hidrogel',
      '',
      '💇 *Pack Estilismo Profesional — S/ 74.00*',
      '✅ Cepillo One Step',
      '✅ Mini plancha de bolsillo',
      '✅ 1 par de parches hidrogel',
      '',
      '━━━━━━━━━━━━━━',
      '',
      '🏍️ *Delivery GRATIS* a tu puerta',
      '💵 *Pago contra entrega* — sin riesgos',
      '',
      '👇 👇 👇 ✨ *Mira todos los packs aquí*',
      `🔗 ${MADRE_URL}`,
      '',
      '📲 *Elige tu combo y envíanos tu pedido directo por WhatsApp* 😊',
    ].join('\n'),
  ({ greeting }) =>
    [
      greeting,
      '',
      '🌷 *Este Día de la Madre sorpréndela con un regalo especial* 🌷',
      '',
      'Preparamos *combos pensados para mamá*, con productos útiles y prácticos que le van a encantar ❤️',
      '',
      '🍳 *Pack Cocina — S/ 120.00*',
      '✅ Procesadora multiusos',
      '✅ Molino para granos y semillas',
      '',
      '💆 *Kit Facial — S/ 48.00*',
      '✅ Masajeador facial',
      '✅ 6 pares de parches hidrogel',
      '',
      '💇 *Pack Estilismo — S/ 74.00*',
      '✅ Cepillo One Step',
      '✅ Mini plancha portátil',
      '✅ 1 par de parches hidrogel',
      '',
      '━━━━━━━━━━━━━━',
      '',
      '🏍️ *Delivery GRATIS*',
      '💵 *Pago contra entrega*',
      '',
      '👇 👇 👇 🛍️ *Ingresa aquí para ver todos los packs*',
      `👉 ${MADRE_URL}`,
      '',
      '📲 *Elige tu favorito y envíanos tu pedido por WhatsApp* 😊',
    ].join('\n'),
  ({ greeting }) =>
    [
      greeting,
      '',
      '💐 *Porque mamá merece lo mejor* 💐',
      '',
      'Tenemos *promociones especiales por el Día de la Madre* para consentirla con algo útil y bonito ❤️',
      '',
      '🍳 *Combo Cocina Completo — S/ 120.00*',
      '✅ Procesadora de alimentos',
      '✅ Molino de granos',
      '',
      '💆 *Combo Belleza Facial — S/ 48.00*',
      '✅ Masajeador de rostro',
      '✅ 6 pares de parches hidrogel',
      '',
      '💇 *Combo Estilismo — S/ 74.00*',
      '✅ Cepillo secador One Step',
      '✅ Mini plancha',
      '✅ Parches hidrogel',
      '',
      '━━━━━━━━━━━━━━',
      '',
      '🚚 *Delivery GRATIS* hasta tu hogar',
      '💵 *Pagas al recibir*',
      '',
      '👇 👇 👇 ✨ *Mira aquí todos los combos disponibles*',
      `🔗 ${MADRE_URL}`,
      '',
      '📲 *Haz tu pedido directo por WhatsApp* 😊',
    ].join('\n'),
  ({ greeting }) =>
    [
      greeting,
      '',
      '🎁 *Haz feliz a mamá en su día con uno de nuestros packs especiales* 🎁',
      '',
      'Tenemos opciones de cocina, belleza y estilismo pensadas especialmente para ella ❤️',
      '',
      '🍳 *Pack Cocina Completo — S/ 120.00*',
      '✅ Procesadora multiusos',
      '✅ Molino para granos secos',
      '',
      '💆 *Kit de Belleza — S/ 48.00*',
      '✅ Masajeador facial',
      '✅ 6 pares de parches hidrogel',
      '',
      '💇 *Pack Profesional — S/ 74.00*',
      '✅ Cepillo One Step',
      '✅ Mini plancha portátil',
      '✅ 1 par de parches hidrogel',
      '',
      '━━━━━━━━━━━━━━',
      '',
      '🏍️ *Envío GRATIS*',
      '💵 *Pago contra entrega*',
      '',
      '👇 👇 👇 🛍️ *Mira todos los packs aquí*',
      `👉 ${MADRE_URL}`,
      '',
      '📲 *Escoge tu favorito y realiza tu pedido por WhatsApp* 😊',
    ].join('\n'),
  ({ greeting }) =>
    [
      greeting,
      '',
      '🌺 *Llegaron las promos especiales por el Día de la Madre* 🌺',
      '',
      'Sorprende a mamá con un regalo práctico, bonito y útil para su día ❤️',
      '',
      '🍳 *Pack Cocina — S/ 120.00*',
      '✅ Procesadora de alimentos',
      '✅ Molino de semillas y granos',
      '',
      '💆 *Pack Facial — S/ 48.00*',
      '✅ Masajeador de rostro',
      '✅ 6 pares de hidrogel',
      '',
      '💇 *Pack Estilismo — S/ 74.00*',
      '✅ Cepillo secador One Step',
      '✅ Mini plancha de bolsillo',
      '✅ 1 par de hidrogel',
      '',
      '━━━━━━━━━━━━━━',
      '',
      '🚚 *Delivery GRATIS* a domicilio',
      '💵 *Pago al momento de recibir*',
      '',
      '👇 👇 👇 ✨ *Mira todos los packs aquí*',
      `🔗 ${MADRE_URL}`,
      '',
      '📲 *Elige el combo ideal y envíanos tu pedido directo* 😊',
    ].join('\n'),
];

const waState = {
  contacts: [],
  skippedRows: 0,
  sentPhones: {},
  messageTemplateByPhone: {},
  hasPendingTemplatePersist: false,
  hasNotifiedCacheError: false,
};

const waElements = {
  input: document.getElementById('waMadrePasteInput'),
  processBtn: document.getElementById('waMadreProcessBtn'),
  resetBtn: document.getElementById('waMadreResetBtn'),
  previewBody: document.getElementById('waMadrePreviewBody'),
  contactCount: document.getElementById('waMadreContactCount'),
  skippedCount: document.getElementById('waMadreSkippedCount'),
  toastStack: document.getElementById('waMadreToastStack'),
  srStatus: document.getElementById('waMadreSrStatus'),
};

initializeWhatsappMadreModule();

function initializeWhatsappMadreModule() {
  if (!waElements.input) {
    return;
  }

  waElements.processBtn.addEventListener('click', processWhatsappList);
  waElements.resetBtn.addEventListener('click', resetWhatsappModule);
  waElements.input.addEventListener('input', handleWhatsappInputChange);
  waElements.previewBody.addEventListener('click', handlePreviewActionClick);

  resetWhatsappResults(false);
  restoreWhatsappCache();

  if (!waState.contacts.length) {
    announceWhatsapp('Listo para procesar contactos y abrir WhatsApp directo.', 'info', false);
  }
}

function handleWhatsappInputChange() {
  if (!waElements.input.value.trim()) {
    resetWhatsappResults(false);
  }

  persistWhatsappCache();
}

function handlePreviewActionClick(event) {
  const actionLink = event.target.closest('a[data-wa-phone]');
  if (!actionLink) {
    return;
  }

  event.preventDefault();

  const phone = String(actionLink.dataset.waPhone || '').trim();
  if (!phone) {
    return;
  }

  markPhoneAsSent(phone);
  const message = getMessageForPhone(phone);
  const whatsappUrl = String(actionLink.getAttribute('href') || '').trim();
  openWhatsappOrCopyFallback(whatsappUrl, message);
}

function processWhatsappList() {
  const rawText = waElements.input.value || '';

  if (!rawText.trim()) {
    resetWhatsappResults(false);
    persistWhatsappCache();
    announceWhatsapp('Pega texto con nombres y teléfonos antes de procesar.', 'error', true, 'Entrada vacía');
    return;
  }

  const processed = parseClipboardText(rawText);

  if (!processed.contacts.length) {
    resetWhatsappResults(false);
    waState.skippedRows = processed.skippedRows;
    updateWhatsappSummary();
    persistWhatsappCache();
    announceWhatsapp('No se detectaron teléfonos válidos para WhatsApp.', 'error', true, 'Sin contactos válidos');
    return;
  }

  waState.contacts = processed.contacts;
  waState.skippedRows = processed.skippedRows;

  cleanupSentPhones();
  renderWhatsappPreview(waState.contacts);
  updateWhatsappSummary();
  persistWhatsappCache();

  announceWhatsapp(
    `Se prepararon ${processed.contacts.length} enlaces directos para WhatsApp.`,
    'success',
    true,
    'Lista procesada'
  );
}

function resetWhatsappModule() {
  waElements.input.value = '';
  resetWhatsappResults(true);
  announceWhatsapp('Se limpió la lista para pegar nuevos contactos.', 'success', true, 'Lista limpiada');
}

function resetWhatsappResults(shouldClearCache) {
  waState.contacts = [];
  waState.skippedRows = 0;
  waState.sentPhones = {};
  waState.messageTemplateByPhone = {};
  renderWhatsappPreview([]);
  updateWhatsappSummary();

  if (shouldClearCache) {
    clearWhatsappCache();
  }
}

function restoreWhatsappCache() {
  const payload = readWhatsappCache();
  if (!payload) {
    return;
  }

  const cachedInput = typeof payload.rawInput === 'string' ? payload.rawInput : '';
  const cachedSkipped = Number.isFinite(payload.skippedRows) ? Math.max(0, payload.skippedRows) : 0;

  waElements.input.value = cachedInput;
  waState.skippedRows = cachedSkipped;
  waState.sentPhones = normalizeSentPhones(payload.sentPhones);
  waState.messageTemplateByPhone = normalizeTemplateByPhone(payload.messageTemplateByPhone);
  waState.contacts = normalizeCachedContacts(payload.contacts);

  cleanupSentPhones();
  renderWhatsappPreview(waState.contacts);
  updateWhatsappSummary();

  if (waState.contacts.length) {
    announceWhatsapp(
      'Se restauró tu lista guardada, ten en cuenta que se perderá en 24 horas.',
      'success',
      true,
      'Lista recuperada'
    );
  }
}

function persistWhatsappCache() {
  const payload = {
    version: 1,
    expiresAt: Date.now() + WA_CACHE_TTL_MS,
    rawInput: waElements.input.value || '',
    contacts: waState.contacts,
    skippedRows: waState.skippedRows,
    sentPhones: waState.sentPhones,
    messageTemplateByPhone: waState.messageTemplateByPhone,
  };

  try {
    localStorage.setItem(WA_CACHE_KEY, JSON.stringify(payload));
    waState.hasNotifiedCacheError = false;
  } catch (_error) {
    if (!waState.hasNotifiedCacheError) {
      announceWhatsapp('No fue posible guardar tu lista local en este navegador.', 'error', true, 'Guardado no disponible');
      waState.hasNotifiedCacheError = true;
    }
  }
}

function clearWhatsappCache() {
  try {
    localStorage.removeItem(WA_CACHE_KEY);
  } catch (_error) {
    // No-op
  }
}

function readWhatsappCache() {
  try {
    const raw = localStorage.getItem(WA_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      clearWhatsappCache();
      return null;
    }

    const expiresAt = Number(parsed.expiresAt);
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
      clearWhatsappCache();
      return null;
    }

    return parsed;
  } catch (_error) {
    clearWhatsappCache();
    return null;
  }
}

function normalizeCachedContacts(cachedContacts) {
  if (!Array.isArray(cachedContacts)) {
    return [];
  }

  return cachedContacts
    .map((contact) => {
      if (!contact || typeof contact !== 'object') {
        return null;
      }

      const phone = normalizePeruPhone(contact.phone || '');
      if (!phone) {
        return null;
      }

      const name = cleanName(contact.name || '');
      return {
        name: name || 'Cliente',
        phone,
      };
    })
    .filter(Boolean)
    .slice(0, 300);
}

function normalizeSentPhones(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const sentPhones = {};
  Object.entries(value).forEach(([phone, stamp]) => {
    if (!/^519\d{8}$/.test(phone)) {
      return;
    }

    if (!Number.isFinite(stamp)) {
      return;
    }

    sentPhones[phone] = stamp;
  });

  return sentPhones;
}

function normalizeTemplateByPhone(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }
  const clean = {};
  Object.entries(value).forEach(([phone, idx]) => {
    if (/^519\d{8}$/.test(phone) && Number.isInteger(idx)) {
      clean[phone] = idx;
    }
  });
  return clean;
}

function cleanupSentPhones() {
  const phoneSet = new Set(waState.contacts.map((contact) => contact.phone));
  const cleaned = {};

  Object.entries(waState.sentPhones).forEach(([phone, stamp]) => {
    if (!phoneSet.has(phone)) {
      return;
    }

    cleaned[phone] = stamp;
  });

  waState.sentPhones = cleaned;

  const cleanedTemplates = {};
  Object.entries(waState.messageTemplateByPhone).forEach(([phone, templateIndex]) => {
    if (!phoneSet.has(phone)) {
      return;
    }

    cleanedTemplates[phone] = templateIndex;
  });
  waState.messageTemplateByPhone = cleanedTemplates;
}

function markPhoneAsSent(phone) {
  if (!/^519\d{8}$/.test(phone)) {
    return;
  }

  waState.sentPhones[phone] = Date.now();
  renderWhatsappPreview(waState.contacts);
  persistWhatsappCache();
}

function parseClipboardText(rawText) {
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { contacts: [], skippedRows: 0 };
  }

  const rows = lines.map((line) => parseLineColumns(line));
  const hasHeader = detectHeaderRow(rows[0]);
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const contacts = [];
  let skippedRows = 0;
  let generatedNameIndex = 1;

  dataRows.forEach((columns) => {
    const normalized = normalizeContactRow(columns);

    if (!normalized.phone) {
      skippedRows += 1;
      return;
    }

    const name = normalized.name || `Cliente ${generatedNameIndex}`;
    if (!normalized.name) {
      generatedNameIndex += 1;
    }

    contacts.push({
      name,
      phone: normalized.phone,
    });
  });

  return { contacts, skippedRows };
}

function parseLineColumns(line) {
  if (line.includes('\t')) {
    return line.split('\t').map((part) => part.trim()).filter((part) => part !== '');
  }

  if (/\s{2,}/.test(line)) {
    return line
      .split(/\s{2,}/)
      .map((part) => part.trim())
      .filter((part) => part !== '');
  }

  if (line.includes(';')) {
    return line.split(';').map((part) => part.trim());
  }

  if (line.includes(',')) {
    return line.split(',').map((part) => part.trim());
  }

  const extracted = extractPhoneFromLine(line);
  if (extracted.phone) {
    return [extracted.name, extracted.phone].filter((value) => value !== '');
  }

  return [line.trim()];
}

function extractPhoneFromLine(line) {
  const raw = String(line || '').trim();
  if (!raw) {
    return { name: '', phone: '' };
  }

  const candidates = raw.match(/[+]?\d[\d\s().-]{6,}\d/g) || [];

  for (const candidate of candidates) {
    const phone = normalizePeruPhone(candidate);
    if (!phone) {
      continue;
    }

    const name = cleanName(raw.replace(candidate, ' '));
    return { name, phone };
  }

  return { name: cleanName(raw), phone: '' };
}

function detectHeaderRow(columns) {
  const normalized = columns.map((value) => removeDiacritics(value).toLowerCase().trim());
  return normalized.some((value) => {
    return (
      value === 'name' ||
      value === 'phone number' ||
      value === 'phone' ||
      value === 'nombre' ||
      value === 'telefono' ||
      value === 'celular'
    );
  });
}

function removeDiacritics(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeContactRow(columns) {
  if (!columns.length) {
    return { name: '', phone: '' };
  }

  let name = '';
  let phone = '';

  if (columns.length >= 2) {
    const first = columns[0] || '';
    const second = columns[1] || '';
    const firstPhone = normalizePeruPhone(first);
    const secondPhone = normalizePeruPhone(second);

    if (firstPhone && !secondPhone) {
      phone = firstPhone;
      name = second;
    } else if (!firstPhone && secondPhone) {
      name = first;
      phone = secondPhone;
    } else if (firstPhone && secondPhone) {
      phone = firstPhone;
      name = second;
    } else {
      name = first;
    }
  } else {
    const only = columns[0] || '';
    const phoneValue = normalizePeruPhone(only);

    if (phoneValue) {
      phone = phoneValue;
    } else {
      name = only;
    }
  }

  return {
    name: cleanName(name),
    phone,
  };
}

function normalizePeruPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  let normalized = digits;

  if (normalized.startsWith('51') && normalized.length >= 11) {
    normalized = normalized.slice(0, 11);
  } else if (normalized.startsWith('9') && normalized.length >= 9) {
    normalized = `51${normalized.slice(0, 9)}`;
  } else if (normalized.startsWith('0') && normalized.length >= 10 && normalized[1] === '9') {
    normalized = `51${normalized.slice(1, 10)}`;
  } else if (normalized.length >= 9) {
    const lastNine = normalized.slice(-9);
    if (lastNine.startsWith('9')) {
      normalized = `51${lastNine}`;
    }
  }

  return /^519\d{8}$/.test(normalized) ? normalized : '';
}

function cleanName(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[^0-9A-Za-zÀ-ÿÑñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function renderWhatsappPreview(contacts) {
  if (!contacts.length) {
    waElements.previewBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">Aún no se han procesado contactos.</td>
      </tr>
    `;
    return;
  }

  waElements.previewBody.innerHTML = contacts
    .slice(0, 300)
    .map((contact, index) => {
      const message = getMessageForContact(contact);
      const link = buildWhatsappLink(contact.phone, message);
      const isSent = Boolean(waState.sentPhones[contact.phone]);
      const sentClass = isSent ? ' is-sent' : '';
      const sentLabel = isSent ? 'Enviado' : 'Enviar por WhatsApp';

      const actionCell = isSent
        ? `
            <button class="btn btn-whatsapp wa-send-btn${sentClass}" type="button" disabled aria-disabled="true">
              ${sentLabel}
            </button>
          `
        : `
            <a
              class="btn btn-whatsapp wa-send-btn${sentClass}"
              href="${link}"
              target="_blank"
              rel="noopener noreferrer"
              data-wa-phone="${contact.phone}"
            >
              ${sentLabel}
            </a>
          `;

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(contact.name)}</td>
          <td>${escapeHtml(formatWhatsappPhone(contact.phone))}</td>
          <td class="wa-action-cell">
            ${actionCell}
          </td>
        </tr>
      `;
    })
    .join('');

  if (waState.hasPendingTemplatePersist) {
    waState.hasPendingTemplatePersist = false;
    persistWhatsappCache();
  }
}

function buildWhatsappLink(phone, message) {
  const encodedText = encodeWhatsappTextUtf8(String(message || ''));
  const encodedPhone = encodeURIComponent(phone);
  return `https://api.whatsapp.com/send?phone=${encodedPhone}&text=${encodedText}&type=phone_number&app_absent=0`;
}

function formatWhatsappPhone(phone) {
  return `+${phone}`;
}

function updateWhatsappSummary() {
  waElements.contactCount.textContent = String(waState.contacts.length);
  waElements.skippedCount.textContent = String(waState.skippedRows);
}

function announceWhatsapp(message, type = 'info', shouldToast = true, title) {
  if (waElements.srStatus) {
    waElements.srStatus.textContent = message;
  }

  if (shouldToast) {
    showWhatsappToast(title || getToastTitle(type), message, type);
  }
}

function showWhatsappToast(title, message, type = 'info') {
  if (!waElements.toastStack) {
    return;
  }

  const toast = document.createElement('article');
  toast.className = `toast is-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${getToastIcon(type)}</div>
    <div class="toast-body">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>
  `;

  waElements.toastStack.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    toast.style.transition = 'opacity 180ms ease, transform 180ms ease';

    window.setTimeout(() => {
      toast.remove();
    }, 180);
  }, getToastDuration(type));
}

function getToastTitle(type) {
  if (type === 'success') {
    return 'Operación completada';
  }

  if (type === 'error') {
    return 'Ocurrió un problema';
  }

  return 'Información';
}

function getToastDuration(type) {
  if (type === 'success' || type === 'error') {
    return 5000;
  }

  return 4000;
}

function getToastIcon(type) {
  if (type === 'success') {
    return 'OK';
  }

  if (type === 'error') {
    return '!';
  }

  return 'i';
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value || '-';
  return div.innerHTML;
}

async function copyWhatsappMessageToClipboard(message, options = {}) {
  const textToCopy = String(message || '');
  const successTitle = options.successTitle || 'Mensaje copiado';
  const successMessage = options.successMessage || 'Mensaje copiado. Solo pega y envía en WhatsApp.';
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(textToCopy);
      announceWhatsapp(successMessage, 'success', true, successTitle);
      return;
    }

    fallbackCopyText(textToCopy);
    announceWhatsapp(successMessage, 'success', true, successTitle);
  } catch (_error) {
    announceWhatsapp('No se pudo copiar automático. Cópialo manualmente si tu navegador lo bloquea.', 'error', true, 'Copia bloqueada');
  }
}

function openWhatsappOrCopyFallback(url, message) {
  const targetUrl = String(url || '').trim();
  if (!targetUrl) {
    return;
  }

  if (tryOpenNewTab(targetUrl)) {
    return;
  }

  try {
    window.location.assign(targetUrl);
    return;
  } catch (_error) {
    // Fall back to clipboard
  }

  copyWhatsappMessageToClipboard(message, {
    successTitle: 'WhatsApp bloqueado',
    successMessage: 'No se pudo abrir WhatsApp automáticamente. Mensaje copiado para que lo pegues y envíes.',
  });
}

function tryOpenNewTab(url) {
  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (win) {
      win.opener = null;
      return true;
    }
  } catch (_error) {
    // ignored
  }
  return false;
}

function fallbackCopyText(text) {
  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'fixed';
  helper.style.top = '-9999px';
  helper.style.opacity = '0';
  document.body.appendChild(helper);
  helper.select();
  document.execCommand('copy');
  helper.remove();
}

function encodeWhatsappTextUtf8(text) {
  if (typeof TextEncoder === 'undefined') {
    return encodeURIComponent(text);
  }

  const bytes = new TextEncoder().encode(text);
  let encoded = '';

  bytes.forEach((byte) => {
    encoded += `%${byte.toString(16).toUpperCase().padStart(2, '0')}`;
  });

  return encoded;
}

function getMessageForContact(contact) {
  const phone = contact.phone;
  const firstName = getValidFirstName(contact.name);
  const greeting = firstName
    ? `Hola ${WA_EMOJI.smile} ${firstName}, somos de Mercado Central Express`
    : `Hola ${WA_EMOJI.smile}, somos de Mercado Central Express`;

  let templateIndex = waState.messageTemplateByPhone[phone];
  if (!Number.isInteger(templateIndex) || templateIndex < 0 || templateIndex >= MADRE_TEMPLATES.length) {
    templateIndex = pickRandomIndex(MADRE_TEMPLATES.length);
    waState.messageTemplateByPhone[phone] = templateIndex;
    waState.hasPendingTemplatePersist = true;
  }

  return MADRE_TEMPLATES[templateIndex]({ greeting });
}

function getMessageForPhone(phone) {
  const contact = waState.contacts.find((item) => item.phone === phone);
  if (!contact) {
    return '';
  }
  return getMessageForContact(contact);
}

function pickRandomIndex(maxExclusive) {
  const max = Math.max(1, Number(maxExclusive) || 1);

  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] % max;
    }
  } catch (_error) {
    // ignore
  }

  return Math.floor(Math.random() * max);
}

function getValidFirstName(fullName) {
  const cleaned = cleanName(fullName);
  if (!cleaned) {
    return '';
  }

  const parts = cleaned.split(' ').filter(Boolean);
  if (!parts.length) {
    return '';
  }

  const first = parts[0];
  if (first.length <= 1) {
    return '';
  }

  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
