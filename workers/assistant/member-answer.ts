import team from '../../lib/team.json';
import type { AssistantAction } from '../../lib/assistant-actions';

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const stem = (word: string) => word.replace(/(?:as|is|us|a|e)$/u, '');

export function namedMembers(query: string) {
  const words = normalize(query).split(/[^a-z]+/).filter(Boolean);
  const matches = team.members.filter(member => {
    const first = normalize(member.name).split(' ')[0];
    const root = stem(first);
    return words.some(word => root.length >= 3 ? word.startsWith(root) : [first, `${root}os`, `${root}ai`, `${root}a`].includes(word)) || (member.name === 'Styvenas' && words.some(w => w.startsWith('stiven')));
  });
  // A surname resolves duplicate first names, but a first name alone never guesses.
  const specific = matches.filter(m => normalize(m.name).split(' ').slice(1).some(w => w.length > 2 && words.some(word => word.startsWith(stem(w)))));
  return specific.length ? specific : matches;
}

export function directMemberAnswer(query: string, previousUserQuery = '') {
  if (!/nuorod|atidary|parody|pateik|registr|kortel|profil/i.test(normalize(query))) return null;
  let members = namedMembers(query);
  if (!members.length && /\b(ji|jos|jo|pas ta|pas sia)\b/.test(normalize(query))) members = namedMembers(previousUserQuery);
  if (!members.length) return null;
  const actions: AssistantAction[] = members.slice(0, 3).map(m => ({ type: 'member', target: String(m.id) }));
  return {
    productIds: [] as string[], actions,
    text: members.length === 1
      ? `${members[0].name} — ${members[0].title}. ${members[0].description}\n\nAtidarykite kortelę. Joje paspaudę paslaugą pereisite į šio meistro „Treatwell“ kalendorių. Rezervaciją patvirtinsite ten.`
      : 'Šiuo vardu turime kelis meistrus. Pasirinkite, kurio kortelę norite atidaryti:',
  };
}
