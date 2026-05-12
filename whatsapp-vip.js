const WA_CACHE_KEY = 'mce_whatsapp_vip_cache_v1';
const WA_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const VIP_LINK = 'https://chat.whatsapp.com/HAyPPVZ8SQOGkH5HhV8gWQ?mode=gi_t';

const VIP_TEMPLATES = [
  () =>
    [
      '✨ *Gracias por ser parte de MERCADO CENTRAL EXPRESS* ✨',
      '',
      'Te invitamos a unirte a nuestro grupo exclusivo de clientes, donde encontrarás:',
      '',
      '✅ *Promociones especiales*',
      '✅ *Descuentos exclusivos*',
      '✅ *Nuevos productos a precios preferenciales*',
      '',
      'Únete aquí 👇',
      VIP_LINK,
      '',
      '🎁 Al llegar a los *400 miembros* realizaremos un sorteo exclusivo.',
      '',
      '¡Te esperamos!',
    ].join('\n'),
  () =>
    [
      '🚨 *CLIENTES VIP MERCADO CENTRAL EXPRESS* 🚨',
      '',
      'Ya estamos compartiendo en nuestro grupo:',
      '',
      '🔥 *Ofertas exclusivas*',
      '🔥 *Productos nuevos*',
      '🔥 *Descuentos especiales*',
      '🔥 *Precios que NO publicamos en otros canales*',
      '',
      'Si ya compraste con nosotros, este grupo es para ti 👇',
      '',
      VIP_LINK,
      '',
      '🎁 Además, al llegar a los *400 integrantes* realizaremos un *SORTEO EXCLUSIVO* entre todos los miembros.',
      '',
      '⚠️ No te quedes fuera y aprovecha los mejores precios antes que todos.',
    ].join('\n'),
  () =>
    [
      '🎉 *¡ÚNETE AL GRUPO OFICIAL DE MERCADO CENTRAL EXPRESS!* 🎉',
      '',
      'Estamos compartiendo diariamente:',
      '',
      '✅ *Ofertas especiales*',
      '✅ *Productos recién llegados*',
      '✅ *Descuentos exclusivos para miembros*',
      '✅ *Promociones limitadas*',
      '',
      'Ingresa aquí 👇',
      VIP_LINK,
      '',
      '🎁 Recuerda que al llegar a los *400 integrantes* realizaremos un sorteo especial entre todos los miembros del grupo.',
    ].join('\n'),
  () =>
    [
      '🚀 *MERCADO CENTRAL EXPRESS* 🚀',
      '',
      'Queremos invitarte a nuestro grupo privado de clientes VIP 😎',
      '',
      'Dentro del grupo publicamos:',
      '🔥 *Ofertas antes que nadie*',
      '🔥 *Productos nuevos*',
      '🔥 *Descuentos especiales*',
      '🔥 *Promociones sorpresa*',
      '',
      'Únete aquí 👇',
      VIP_LINK,
      '',
      '🎁 Muy pronto realizaremos un sorteo exclusivo al llegar a los 400 miembros.',
    ].join('\n'),
  () =>
    [
      '✨ *BENEFICIOS EXCLUSIVOS PARA CLIENTES* ✨',
      '',
      'Si ya eres cliente de MERCADO CENTRAL EXPRESS, no puedes quedarte fuera de nuestro grupo oficial 🛍️',
      '',
      'Encontrarás:',
      '✅ *Mejores precios*',
      '✅ *Ofertas exclusivas*',
      '✅ *Nuevos ingresos*',
      '✅ *Promociones especiales solo para miembros*',
      '',
      'Únete aquí 👇',
      VIP_LINK,
      '',
      '🎁 *Sorteo exclusivo* al completar los 400 integrantes del grupo.',
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
  input: document.getElementById('waVipPasteInput'),
  processBtn: document.getElementById('waVipProcessBtn'),
  resetBtn: document.getElementById('waVipResetBtn'),
  previewBody: document.getElementById('waVipPreviewBody'),
  contactCount: document.getElementById('waVipContactCount'),
  skippedCount: document.getElementById('waVipSkippedCount'),
  toastStack: document.getElementById('waVipToastStack'),
  srStatus: document.getElementById('waVipSrStatus'),
};

initializeWhatsappVipModule();

function initializeWhatsappVipModule() {
  if (!waElements.input) return;

  waElements.processBtn.addEventListener('click', processWhatsappList);
  waElements.resetBtn.addEventListener('click', resetWhatsappModule);
  waElements.input.addEventListener('input', handleWhatsappInputChange);
  waElements.previewBody.addEventListener('click', handlePreviewActionClick);

  resetWhatsappResults(false);
  restoreWhatsappCache();
}

function handleWhatsappInputChange() {
  if (!waElements.input.value.trim()) resetWhatsappResults(false);
  persistWhatsappCache();
}

function handlePreviewActionClick(event) {
  const actionLink = event.target.closest('a[data-wa-phone]');
  if (!actionLink) return;
  
  const phone = String(actionLink.dataset.waPhone || '').trim();
  if (!phone) return;

  markPhoneAsSent(phone);
}

function processWhatsappList() {
  const rawText = waElements.input.value || '';
  if (!rawText.trim()) {
    resetWhatsappResults(false);
    announceWhatsapp('Pega texto con nombres y teléfonos antes de procesar.', 'error', true, 'Entrada vacía');
    return;
  }

  const processed = parseClipboardText(rawText);
  if (!processed.contacts.length) {
    resetWhatsappResults(false);
    waState.skippedRows = processed.skippedRows;
    updateWhatsappSummary();
    announceWhatsapp('No se detectaron teléfonos válidos.', 'error', true, 'Sin contactos');
    return;
  }

  waState.contacts = processed.contacts;
  waState.skippedRows = processed.skippedRows;
  renderWhatsappPreview(waState.contacts);
  updateWhatsappSummary();
  persistWhatsappCache();

  announceWhatsapp(`Se prepararon ${processed.contacts.length} contactos.`, 'success', true, 'Lista procesada');
}

function resetWhatsappModule() {
  waElements.input.value = '';
  resetWhatsappResults(true);
  announceWhatsapp('Lista limpiada.', 'success', true, 'Limpiado');
}

function resetWhatsappResults(shouldClearCache) {
  waState.contacts = [];
  waState.skippedRows = 0;
  waState.sentPhones = {};
  waState.messageTemplateByPhone = {};
  renderWhatsappPreview([]);
  updateWhatsappSummary();
  if (shouldClearCache) clearWhatsappCache();
}

function restoreWhatsappCache() {
  const payload = readWhatsappCache();
  if (!payload) return;

  waElements.input.value = payload.rawInput || '';
  waState.skippedRows = payload.skippedRows || 0;
  waState.sentPhones = payload.sentPhones || {};
  waState.messageTemplateByPhone = payload.messageTemplateByPhone || {};
  waState.contacts = payload.contacts || [];

  renderWhatsappPreview(waState.contacts);
  updateWhatsappSummary();
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
  } catch (e) {}
}

function clearWhatsappCache() {
  localStorage.removeItem(WA_CACHE_KEY);
}

function readWhatsappCache() {
  try {
    const raw = localStorage.getItem(WA_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt < Date.now()) {
      clearWhatsappCache();
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

function markPhoneAsSent(phone) {
  waState.sentPhones[phone] = Date.now();
  renderWhatsappPreview(waState.contacts);
  persistWhatsappCache();
}

function parseClipboardText(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const contacts = [];
  let skippedRows = 0;

  lines.forEach((line, idx) => {
    // Basic CSV/TSV/Space split
    const parts = line.split(/\t| {2,}|;|\|/).map(p => p.trim());
    let name = '', phone = '';

    if (parts.length >= 2) {
      const p1 = normalizePeruPhone(parts[0]);
      const p2 = normalizePeruPhone(parts[1]);
      if (p1) { phone = p1; name = parts[1]; }
      else if (p2) { phone = p2; name = parts[0]; }
    } else {
      phone = normalizePeruPhone(parts[0]);
      name = `Contacto ${idx + 1}`;
    }

    if (phone) {
      contacts.push({ name: name || `Contacto ${idx + 1}`, phone });
    } else {
      skippedRows++;
    }
  });

  return { contacts, skippedRows };
}

function normalizePeruPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 9) return '';
  let normalized = digits;
  if (normalized.length === 9 && normalized.startsWith('9')) normalized = '51' + normalized;
  if (normalized.length === 11 && normalized.startsWith('519')) return normalized;
  if (normalized.length > 9) {
    const last9 = normalized.slice(-9);
    if (last9.startsWith('9')) return '51' + last9;
  }
  return '';
}

function getMessageForContact(contact) {
  if (!waState.messageTemplateByPhone[contact.phone]) {
    waState.messageTemplateByPhone[contact.phone] = Math.floor(Math.random() * VIP_TEMPLATES.length);
    waState.hasPendingTemplatePersist = true;
  }
  const idx = waState.messageTemplateByPhone[contact.phone];
  const template = VIP_TEMPLATES[idx];
  
  return template();
}

function renderWhatsappPreview(contacts) {
  if (!contacts.length) {
    waElements.previewBody.innerHTML = '<tr><td colspan="4">Aún no se han procesado contactos.</td></tr>';
    return;
  }

  waElements.previewBody.innerHTML = contacts.map((c, i) => {
    const isSent = !!waState.sentPhones[c.phone];
    const msg = getMessageForContact(c);
    const link = `https://api.whatsapp.com/send?phone=${c.phone}&text=${encodeURIComponent(msg)}`;
    
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${c.name}</td>
        <td>+${c.phone}</td>
        <td>
          <a href="${link}" target="_blank" data-wa-phone="${c.phone}" class="btn btn-whatsapp ${isSent ? 'is-sent' : ''}">
            ${isSent ? 'Enviado' : 'Enviar WhatsApp'}
          </a>
        </td>
      </tr>
    `;
  }).join('');

  if (waState.hasPendingTemplatePersist) {
    waState.hasPendingTemplatePersist = false;
    persistWhatsappCache();
  }
}

function updateWhatsappSummary() {
  waElements.contactCount.textContent = waState.contacts.length;
  waElements.skippedCount.textContent = waState.skippedRows;
}

function announceWhatsapp(message, type, shouldToast, title) {
  if (shouldToast) showWhatsappToast(title, message, type);
}

function showWhatsappToast(title, message, type) {
  const toast = document.createElement('div');
  toast.className = `toast is-${type}`;
  toast.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
  waElements.toastStack.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
