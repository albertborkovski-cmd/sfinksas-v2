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
