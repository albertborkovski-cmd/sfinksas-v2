export type AssistantReply = {
  text: string;
  link?: { label: string; href: string };
};

// Local, prewritten demo replies. No AI service, message storage or network calls.
export function demoReply(message: string): AssistantReply {
  const query = message.toLocaleLowerCase('lt-LT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/registr|rezerv|kalend|laisv|laika/.test(query)) {
    return {
      text: 'Registruotis galite per „Treatwell“. Jei norite pasirinkti konkretų meistrą, atverkite „Mūsų meistrai“, jo kortelę ir paspauskite paslaugą. Atsidarys tikras registracijos kalendorius — rezervacijos nėra bandomosios.',
      link: { label: 'Pasirinkti meistrą', href: '/musu-meistrai' },
    };
  }
  if (/meistr|komand|kirpej/.test(query)) {
    return {
      text: 'Komandos puslapyje galite filtruoti meistrus pagal sritį ir atverti jų siūlomas paslaugas.',
      link: { label: 'Susipažinti su meistrais', href: '/musu-meistrai' },
    };
  }
  if (/paslaug|kirp|dazym|maniki|pediki/.test(query)) {
    return {
      text: 'Paslaugų puslapyje rasite salono paslaugų grupes. Individualias paslaugas peržiūrėkite meistrų kortelėse; aktualūs laikai ir kainos pateikiami „Treatwell“.',
      link: { label: 'Peržiūrėti paslaugas', href: '/paslaugos' },
    };
  }
  if (/produkt|preki|preke|sampun|plauk|kauk|kondicion/.test(query)) {
    return {
      text: 'Produktus galite rinktis pagal kategoriją ir prekių ženklą. Paspaudę produkto kortelę matysite aprašymą, kiekį ir kainą. Šioje demonstracijoje užsakymai išjungti.',
      link: { label: 'Atidaryti produktų katalogą', href: '/produktai' },
    };
  }
  if (/adres|kur es|kontakt/.test(query)) {
    return { text: 'Grožio namai „Sfinksas“ — Konstitucijos pr. 21B, Vilnius.', link: { label: 'Apie saloną ir paslaugas', href: '/paslaugos' } };
  }
  return {
    text: 'Tai pokalbio demonstracija su iš anksto paruoštais atsakymais — AI modelis dar neprijungtas. Galiu parodyti, kur rasti produktus, paslaugas, meistrus ar registraciją. Kuri tema domina?',
  };
}
