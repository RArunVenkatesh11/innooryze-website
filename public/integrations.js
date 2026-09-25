// Deployment-owned integration seam. Provider secrets never belong in browser code.
//
// A captured enquiry is announced once, as a DOM event. consent.js turns it into the GA4
// contact_form_submit event only when the Google tag is already running with analytics consent; nothing
// here loads or enables analytics. A future CRM or chatbot integration can listen to the same event.
export function announceLeadCaptured({area = '', source = ''} = {}) {
  // Never names, emails, company names or message text: only the chosen area and the channel.
  const detail = {event: 'contact_form_submit', area: String(area).slice(0, 100), source};
  document.dispatchEvent(new CustomEvent('innooryze:lead-captured', {detail}));
  const track = window.innooryzeIntegrations?.track;
  if (track) try { track(detail, {id: document.querySelector('meta[name="analytics-id"]')?.content || ''}); } catch { /* Analytics must not change the submission result. */ }
}
