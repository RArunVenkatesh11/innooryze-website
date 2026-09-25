// The normalised lead: one channel-neutral structure for every way a visitor can start a conversation.
// Today only the Contact page produces it; a future website chatbot or a LeadRyze CRM sync would produce
// and consume the same shape. Nothing here knows about Google Sheets, Apps Script or any transport.

export const LEAD_SCHEMA_VERSION = 1;

// key: the lead field (also the form control's name). label: used in "Please enter …" messages.
export const leadFields = [
 {key:'firstname', label:'your first name', required:true, max:120},
 {key:'lastname', label:'your last name', required:true, max:120},
 {key:'workemail', label:'your work email', required:true, max:254},
 {key:'company', label:'your company', required:true, max:120},
 {key:'role', label:'your role', required:false, max:120},
 {key:'countryregion', label:'your country or region', required:true, max:120},
 {key:'whatcanwehelp', label:'an area of interest', required:true, max:120},
 {key:'message', label:'a message', required:true, max:4000}
];
export const leadKeys = leadFields.map(f => f.key);

// Deliberately simple: the server repeats this check, and real deliverability is proven by the
// acknowledgement email, not by a pattern.
export const EMAIL_PATTERN = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;

// input: any object keyed by lead field (FormData entries, a chatbot transcript summary …).
// Returns the trimmed lead, per-field errors and whether it may be sent. A filled honeypot is reported as a
// form-level error so no channel ever forwards it.
export function normalizeLead(input = {}) {
 const lead = {};
 const errors = {};
 for (const {key, label, required, max} of leadFields) {
  const value = String(input[key] ?? '').trim();
  lead[key] = value;
  if (required && !value) errors[key] = `Please enter ${label}.`;
  else if (value.length > max) errors[key] = 'Please shorten this field.';
 }
 if (lead.workemail && !errors.workemail && !EMAIL_PATTERN.test(lead.workemail)) errors.workemail = 'Please enter a valid email address.';
 if (String(input.website ?? '').trim()) errors.form = 'We could not send this enquiry. Please email us directly.';
 return {lead, errors, valid: Object.keys(errors).length === 0};
}

// The lead plus where it came from. Attribution keys match the enquiry record's columns.
export function leadEnvelope(lead, {source, attribution = {}} = {}) {
 return {
  ...lead,
  submittedfrom: source,
  referrer: attribution.referrer || '',
  utmsource: attribution.utmsource || '',
  utmmedium: attribution.utmmedium || '',
  utmcampaign: attribution.utmcampaign || '',
  utmcontent: attribution.utmcontent || '',
  utmterm: attribution.utmterm || ''
 };
}
