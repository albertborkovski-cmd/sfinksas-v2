import team from './team.json';
import { sitePath } from './demo';
import { treatwellAppBookingUrl } from './treatwell';

// Public, read-only navigation only. No model-provided URLs or privileged commands.
export type AssistantAction = { type: 'member' | 'booking' | 'page'; target: string };
export const MAX_ACTIONS = 3;
const pages = {
  products: { path: '/produktai', label: 'Visi produktai' },
  services: { path: '/paslaugos', label: 'Mūsų paslaugos' },
  team: { path: '/musu-meistrai', label: 'Mūsų meistrai' },
  contacts: { path: '/kontaktai', label: 'Kontaktai' },
};

export function memberProfileUrl(id: number) {
  return `${sitePath('/musu-meistrai')}?meistras=${id}#meistras-${id}`;
}

export function parseMemberSelection(search: string) {
  const id = new URLSearchParams(search).get('meistras');
  return team.members.find(m => String(m.id) === id)?.id ?? null;
}

export function resolveAssistantAction(action: AssistantAction) {
  if (action.type === 'page') {
    const page = pages[action.target as keyof typeof pages];
    return page && Object.hasOwn(pages, action.target) ? { href: sitePath(page.path), label: page.label, detail: '', external: false } : null;
  }
  if (action.type === 'member') {
    const member = team.members.find(m => String(m.id) === action.target);
    return member ? { href: memberProfileUrl(member.id), label: `${member.name} · Atidaryti kortelę`, detail: member.title, external: false } : null;
  }
  if (action.type === 'booking') {
    const [memberId, serviceId, optionId, extra] = action.target.split(':');
    if (extra !== undefined) return null;
    const member = team.members.find(m => String(m.id) === memberId);
    const service = member?.services.find(s => s.id === serviceId);
    const option = service?.bookingOptions.find(o => o.id === optionId);
    return member && service && option ? {
      href: treatwellAppBookingUrl(member.id, service.id, option.id),
      label: `${member.name} · ${service.name}`,
      detail: `${option.label} · ${option.durationMinutes} min. · Rinktis laiką „Treatwell“`, external: true, newTab: false,
    } : null;
  }
  return null;
}

export function verifiedActions(value: unknown): AssistantAction[] {
  if (!Array.isArray(value) || value.length > MAX_ACTIONS) return [];
  const actions: AssistantAction[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || typeof item.target !== 'string' || !['member', 'booking', 'page'].includes(item.type) || !resolveAssistantAction(item)) return [];
    if (!actions.some(a => a.type === item.type && a.target === item.target)) actions.push({ type: item.type, target: item.target });
  }
  return actions;
}
