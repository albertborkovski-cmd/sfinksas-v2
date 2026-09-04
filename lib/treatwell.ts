// Public Treatwell availability links use service-option IDs, not profile anchors.
// employeeService initializes both single- and multi-staff calendar selection.
export function treatwellCalendarUrl(
  employeeId: number,
  menuItemId: string,
  optionId: string,
) {
  if (!Number.isSafeInteger(employeeId) || employeeId <= 0 ||
      !/^TR\d+$/.test(menuItemId) || !/^\d+$/.test(optionId)) {
    throw new Error('Invalid Treatwell booking selection');
  }
  const url = new URL('https://www.treatwell.lt/availability');
  url.searchParams.set('venueId', '405427');
  url.searchParams.set('proposedServices', JSON.stringify([
    { menuItemId, optionIds: [optionId], employeeId },
  ]));
  url.searchParams.set('employeeService', JSON.stringify({ [menuItemId]: employeeId }));
  return url.toString();
}

// Treatwell's own venue page uses this OneLink template for opening its consumer app.
// The exact availability URL remains the desktop/browser fallback and deep-link value.
export function treatwellAppBookingUrl(
  employeeId: number,
  menuItemId: string,
  optionId: string,
) {
  const fallback = treatwellCalendarUrl(employeeId, menuItemId, optionId);
  const appRoute = fallback.replace('https://', 'treatwell://');
  const link = new URL('https://treatwell.onelink.me/32083905');
  link.searchParams.set('pid', 'sfinksas-website');
  link.searchParams.set('c', 'service-booking');
  link.searchParams.set('is_retargeting', 'true');
  link.searchParams.set('deep_link_value', fallback);
  link.searchParams.set('af_dp', appRoute);
  link.searchParams.set('af_force_deeplink', 'true');
  link.searchParams.set('af_web_dp', fallback);
  link.searchParams.set('af_param_forwarding', 'false');
  link.searchParams.set('ibi', 'com.wahanda.consumer');
  link.searchParams.set('isi', '814443140');
  return link.toString();
}
