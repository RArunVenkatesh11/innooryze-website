// Deployment-owned adapters. Keep provider secrets on the server.
// A consent-aware provider may install window.innooryzeIntegrations before use.
export async function getSpamToken({signal}={}) {
  const adapter=window.innooryzeIntegrations?.getSpamToken;
  return adapter ? await adapter({signal,action:'enquiry'}) : null;
}
export function recordSuccessfulEnquiry(interest) {
  const detail={event:'enquiry_submitted',interest,source:'innooryze-website'};
  document.dispatchEvent(new CustomEvent('innooryze:enquiry-submitted',{detail}));
  // Never pass names, emails, company names or message text to analytics.
  const track=window.innooryzeIntegrations?.track;
  if(track)try{track(detail,{id:document.querySelector('meta[name="analytics-id"]')?.content||''});}catch{/* Analytics must not change the delivery result. */}
}
