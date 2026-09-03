# Grožio namai Sfinksas — V2

## Atidaryti „GitHub Pages“ demonstraciją

**[ATIDARYTI DEMONSTRACIJĄ →](https://albertborkovski-cmd.github.io/sfinksas-v2/)**

- [Produktai](https://albertborkovski-cmd.github.io/sfinksas-v2/produktai/)
- [Paslaugos](https://albertborkovski-cmd.github.io/sfinksas-v2/paslaugos/)
- [Mūsų meistrai](https://albertborkovski-cmd.github.io/sfinksas-v2/musu-meistrai/)

Tai atskira, vieša dizaino ir sąsajos demonstracija. Galite peržiūrėti 143 produktus, filtruoti, rūšiuoti, atidaryti produktų bei meistrų korteles ir išbandyti vietinį krepšelį. Produktų užsakymų forma ir administravimas išjungti; krepšelio duomenys salonui nesiunčiami. **„Treatwell“ nuorodos įjungtos ir atidaro tikrą registraciją naujame skirtuke. Rezervacijos ten nėra bandomosios.**

Produktų duomenys yra 2026-09-03 viešo katalogo kopija (`demo/products.json`). Jie automatiškai nesinchronizuojami su tikros parduotuvės duomenų baze. Demonstracijoje naudojami bendri svetainės komponentai, todėl dizainas atitinka šios saugyklos kodą.

Apatiniame dešiniajame kampe esanti žmogeliuko su žirklėmis ikona atidaro tikrą AI pokalbį. Asistentas naudoja „Cloudflare Workers AI“ (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`), ne asmeninę „ChatGPT“ prenumeratą. Jis remiasi vieša produktų ir meistrų duomenų kopija; netikrina gyvo kalendoriaus, nerezervuoja laiko ir nepriima užsakymų. Šis valdiklis įjungtas tik „GitHub“ demonstracijoje.

Siunčiama dabartinė žinutė ir ribota pokalbio istorija „Cloudflare“ AI atsakymui parengti. Nesiųskite jautrių ar mokėjimo duomenų. Programa neturi pokalbių duomenų bazės, nelaiko jų localStorage ir neregistruoja žinučių serverio žurnaluose; perkrovus puslapį istorija dingsta. Paslaugos teikėjo duomenų tvarkymui taikomos [„Cloudflare“ sąlygos](https://developers.cloudflare.com/workers-ai/platform/data-usage/). AI atsakymai gali būti netikslūs.

### AI serveris ir nemokamo naudojimo ribos

AI serveris skelbiamas atskirai iš `workers/assistant/wrangler.jsonc`. Jame naudojamas AI binding, todėl jokio API rakto nėra naršyklėje ar „GitHub“. Viešas adresas: `https://sfinksas-assistant.albertborkovski-sfinksas.workers.dev/chat`. Publikavimas: `WRANGLER_SEND_METRICS=false npx wrangler deploy --config workers/assistant/wrangler.jsonc`; būtinas prisijungimas prie tinkamos „Cloudflare“ paskyros.

Savininkas patvirtino „Workers Free“ planą. [Nemokamas AI limitas](https://developers.cloudflare.com/workers-ai/platform/pricing/) yra 10 000 neuronų per parą visai paskyrai; jam pasibaigus užklausos sustoja iki limito atnaujinimo. **Neperjunkite paskyros į „Workers Paid“, jei nenorite galimų viršijimo mokesčių.** Programa pati plano nekeičia. Papildomas 5 užklausų per minutę ribojimas vienam IP veikia atskirai kiekvienoje „Cloudflare“ vietovėje, todėl nėra globalaus dienos biudžeto pakaitalas ir gali būti bendras vieno tinklo lankytojams. CORS leidžia GitHub svetainės origin, tačiau nėra autentifikacija ir neapsaugo nuo visų tiesioginių API užklausų.

Asistentą galima išjungti pakeitus `AI_ENABLED` į `"false"` ir iš naujo paskelbus Worker. Vietinė patikra be AI naudojimo: `npm run test:assistant`. Po duomenų kopijos atnaujinimo reikia iš naujo paskelbti ir Worker; automatinio „Treatwell“ sinchronizavimo nėra.

## Ši versija

Parengta pagal 2026-09-03 svetainės versiją. Įtraukta:

- originalus „Sfinksas“ logotipas ir išplėstas meniu;
- kategorijos vienoje eilutėje ir atnaujintas produktų rūšiavimo meniu;
- platesnis produkto informacijos langas;
- „Paslaugos“ puslapis su paslaugų bloku viršuje;
- meistrų kortelės, siūlomų paslaugų sąrašai ir aktyvios nuorodos į „Treatwell“ kalendorių;
- pašalinti nereikalingi paaiškinimai ir papildomos nuorodos.

## Paleidimas ir paskelbimas

Reikia Node.js 22.13 arba naujesnės 22 versijos.

```sh
npm ci
npm run dev:demo
```

Statinės versijos surinkimas ir patikra:

```sh
npm run build:demo
npm run test:demo
```

„GitHub Pages“ skelbia paruoštus statinius failus iš atskiros `gh-pages` šakos šakninio katalogo. Į ją keliamas tik patikrintas `dist-demo` turinys. Į demonstraciją nepatenka serverio kodas, duomenų bazė, administravimo komponentai ar prisijungimo duomenys.

Vien kodo įkėlimas į `main` demonstracijos neatnaujina: po pakeitimų reikia iš naujo atlikti surinkimą, patikrą ir įkelti rezultatą į `gh-pages`. Dabartinė „GitHub“ prieiga neleidžia kurti pasirinktinių „Actions“ eigų, todėl automatinė surinkimo eiga nesukurta.

## Tikra svetainė

[Veikianti parduotuvė](https://sfinksas-v2.albertborkovski.chatgpt.site/) tebėra talpinama atskirai „Sites“. „GitHub Pages“ paskelbimas jos nekeičia. Tikroje svetainėje užsakymai ir rezervacijos nėra bandomieji.

Meistrų nuotraukos ir aprašymai išsaugoti projekte; automatinis jų sinchronizavimas su „Treatwell“ neįjungtas.
