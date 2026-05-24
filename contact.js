/**
 * gastrowerke – contact.js
 * Kontaktformular: Validierung, Versand über EmailJS
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // --------------------------------------------------------------
  // HIER BITTE IHRE EIGENEN EMAILJS-ZUGANGSDATEN EINTRAGEN:
  // --------------------------------------------------------------
  const EMAILJS_PUBLIC_KEY = '3AEZ-38cqOdRYRyOM';   // z.B. "abc123def456"
  const EMAILJS_SERVICE_ID = 'service_wbps7pe';   // z.B. "service_gastrowerke"
  const EMAILJS_TEMPLATE_ID = 'template_0gxukky'; // z.B. "template_kontakt"
  // --------------------------------------------------------------

  const fields = {
    name:    { el: form.querySelector('#cName'),    msg: 'Bitte geben Sie Ihren Namen ein.' },
    email:   { el: form.querySelector('#cEmail'),   msg: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
    subject: { el: form.querySelector('#cSubject'), msg: 'Bitte wählen Sie ein Betreff.' },
    message: { el: form.querySelector('#cMessage'), msg: 'Bitte geben Sie eine Nachricht ein (mind. 20 Zeichen).' },
    privacy: { el: form.querySelector('#cPrivacy'), msg: 'Bitte bestätigen Sie die Datenschutzerklärung.' },
  };

  function clearError(field) {
    const wrap = field.el?.closest('.form-group');
    wrap?.classList.remove('has-error');
    const err = wrap?.querySelector('.form-error');
    if (err) err.textContent = '';
  }

  function setError(field, msg) {
    const wrap = field.el?.closest('.form-group');
    wrap?.classList.add('has-error');
    const err = wrap?.querySelector('.form-error');
    if (err) err.textContent = msg;
    return false;
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validateAll() {
    let valid = true;
    Object.values(fields).forEach(f => clearError(f));

    if (!fields.name.el?.value.trim()) valid = setError(fields.name, fields.name.msg);
    if (!validateEmail(fields.email.el?.value.trim() || '')) valid = setError(fields.email, fields.email.msg);
    if (!fields.subject.el?.value) valid = setError(fields.subject, fields.subject.msg);
    if ((fields.message.el?.value.trim() || '').length < 20) valid = setError(fields.message, fields.message.msg);
    if (!fields.privacy.el?.checked) valid = setError(fields.privacy, fields.privacy.msg);
    return valid;
  }

  // Live-Validierung
  Object.values(fields).forEach(f => {
    f.el?.addEventListener('input', () => clearError(f));
    f.el?.addEventListener('change', () => clearError(f));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateAll()) return;

    const btn = form.querySelector('#submitBtn');
    const successBox = document.getElementById('contactSuccess');
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '⏳ Wird gesendet …';
    btn.disabled = true;

    try {
      // EmailJS initialisieren (jeder Aufruf, alternativ könnte man es einmalig machen)
      emailjs.init(EMAILJS_PUBLIC_KEY);

      // Daten aus dem Formular holen
      const templateParams = {
        from_name: fields.name.el.value.trim(),
        reply_to: fields.email.el.value.trim(),
        phone: form.querySelector('#cPhone')?.value.trim() || '',
        company: form.querySelector('#cCompany')?.value.trim() || '',
        subject: fields.subject.el.value,
        message: fields.message.el.value.trim(),
        // optional können Sie hier weitere Felder hinzufügen (z.B. Datum)
      };

      // E-Mail versenden
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      // Erfolg: Formular ausblenden, Erfolgsbox einblenden
      form.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Optional: Einsendung im localStorage protokollieren
      const submissions = JSON.parse(localStorage.getItem('gw_contact_submissions') || '[]');
      submissions.push({
        name: fields.name.el.value.trim(),
        email: fields.email.el.value.trim(),
        subject: fields.subject.el.value,
        message: fields.message.el.value.trim(),
        date: new Date().toISOString()
      });
      localStorage.setItem('gw_contact_submissions', JSON.stringify(submissions));

    } catch (error) {
      console.error('EmailJS Fehler:', error);
      alert('Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt per E-Mail.');
      // Button wiederherstellen, Formular bleibt sichtbar
    } finally {
      btn.innerHTML = originalBtnText;
      btn.disabled = false;
    }
  });
});
