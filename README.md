# Family Birthday Planner 🎂

Porodični statički web planner za organizaciju više rođendana u jednoj aplikaciji.

## 🔗 Project links

| Servis | Link | Namena |
| --- | --- | --- |
| 🌐 Aplikacija | https://vana89.github.io/ficas-bday/ | Family Birthday Planner |
| 💻 GitHub | https://github.com/vana89/ficas-bday | Source code i istorija izmena |
| 🗄️ Supabase | https://supabase.com/dashboard/project/jylkcztuccjvxtjakscj | Online baza i API |
| 🚀 GitHub Pages | https://github.com/vana89/ficas-bday/settings/pages | Hosting / deployment podešavanja |

> U README ne čuvamo passworde, secret/service-role ključeve niti druge privatne credentials.

## Struktura aplikacije

Glavna `index.html` stranica je Family Birthday Planner i služi za izbor rođendana.

```text
/
├── index.html          Family Birthday Planner / izbor eventa
├── fica/
│   └── index.html      Fićin planner
├── uki/
│   └── index.html      Ukijev planner
├── sync.js             zajednička Supabase sinhronizacija
└── assets/
    └── invitation.png  Fićina pozivnica
```

Live stranice:

- Family planner: https://vana89.github.io/ficas-bday/
- Fićin planner: https://vana89.github.io/ficas-bday/fica/
- Ukijev planner: https://vana89.github.io/ficas-bday/uki/

## Arhitektura

```text
┌──────────────────────┐
│      Korisnik        │
│  browser / telefon   │
└──────────┬───────────┘
           │ HTTPS
           ▼
┌──────────────────────┐
│    GitHub Pages      │
│ Family index +       │
│ birthday planners    │
└──────────┬───────────┘
           │ REST API
           ▼
┌──────────────────────┐
│      Supabase        │
│ PostgreSQL + REST    │
│ shared planner data  │
└──────────────────────┘
```

## Kako radi

Frontend je obična statička web aplikacija napravljena u HTML-u, CSS-u i JavaScript-u. GitHub Pages objavljuje `main` branch kao javni sajt.

Svaki rođendan ima svoju HTML stranicu, ali koristi isti `sync.js` za Supabase sinhronizaciju.

Zajednički podaci koji se sinhronizuju su:

- Gosti i RSVP status
- Budžet
- Checklist

`localStorage` ostaje samo pomoćna lokalna kopija. Supabase je source of truth za zajedničke podatke.

## Pravilo za screenshotove i slike

Kada korisnik pošalje screenshot ili sliku aplikacije i uz nju opiše željenu izmenu, slika služi samo kao vizuelna referenca za deo interfejsa na koji se izmena odnosi.

Ne treba menjati, retuširati niti generisati novu sliku na osnovu screenshota. Izmena se uvek radi u stvarnoj aplikaciji, odnosno u odgovarajućem HTML/CSS/JavaScript kodu u ovom GitHub repository-ju, osim ako korisnik izričito traži izmenu same slike.

## Razdvajanje podataka po rođendanu

Supabase tabela `birthday_state` koristi zaseban `id` za svaki event:

```text
Fića: fica-2026
Uki:  uki-2026
```

`sync.js` čita `data-event-id` sa odgovarajuće birthday stranice i na osnovu njega učitava i čuva pravi shared state. Zato se Fićini i Ukijevi gosti, budžet i checklist ne mešaju.

Za dodavanje sledećeg rođendana dovoljno je napraviti novu birthday stranicu i dodeliti joj novi event ID.

## Tehnologije

- HTML / CSS / JavaScript
- GitHub repository — source control
- GitHub Pages — hosting i deployment
- Supabase — PostgreSQL baza + REST API
- Supabase Row Level Security (RLS)

## Deployment

Deployment je automatski:

```text
Izmena koda
   ↓
Commit na main branch
   ↓
GitHub Pages deployment
   ↓
Nova verzija na postojećem live URL-u
```

## Security

Publishable Supabase key sme da bude u frontend aplikaciji. Secret / service_role key ne sme biti u browser kodu, GitHub repozitorijumu ili dokumentaciji.

## Pozivnica

Fićina finalna pozivnica trenutno se čuva kao:

[`assets/invitation.png`](assets/invitation.png)

Kasnije se asseti mogu organizovati po eventu ako i Ukijev planner dobije zasebne slike i pozivnicu.