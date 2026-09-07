# Fićin 9. rođendan 🎉

Mali statički web planner za organizaciju Fićinog 9. rođendana.

## 🔗 Project links

| Servis | Link | Namena |
| --- | --- | --- |
| 🌐 Aplikacija | https://vana89.github.io/ficas-bday/ | Live Birthday Planner |
| 💻 GitHub | https://github.com/vana89/ficas-bday | Source code i istorija izmena |
| 🗄️ Supabase | https://supabase.com/dashboard/project/jylkcztuccjvxtjakscj | Online baza i API |
| 🚀 GitHub Pages | https://github.com/vana89/ficas-bday/settings/pages | Hosting / deployment podešavanja |

> U README ne čuvamo passworde, secret/service-role ključeve niti druge privatne credentials.

## 🎨 Pozivnica

Finalna pozivnica za rođendan čuva se u repozitorijumu kao:

[`assets/invitation.png`](assets/invitation.png)

Ovaj fajl je source of truth za finalnu verziju pozivnice i treba ga zameniti kada se odobri nova verzija dizajna.

![Fićin 9. rođendan – pozivnica](assets/invitation.png)

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
│  statički hosting    │
│  HTML / CSS / JS     │
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

Frontend je obična statička web aplikacija napravljena u HTML-u, CSS-u i JavaScript-u. Kod se nalazi u ovom GitHub repozitorijumu, a GitHub Pages ga objavljuje kao javni sajt.

GitHub Pages ovde služi kao statički hosting. Ne postoji poseban aplikacioni backend server koji izvršava naš kod.

Zajednički podaci se čuvaju u Supabase-u. Browser direktno poziva Supabase REST API koristeći publishable key i RLS pravila.

Trenutno se online sinhronizuju:

- Gosti i RSVP status
- Budžet
- Checklist

Više ljudi može da otvori isti link i vidi iste podatke.

## Tehnologije

- HTML / CSS / JavaScript
- GitHub repository — source control
- GitHub Pages — hosting i deployment
- Supabase — PostgreSQL baza + REST API
- Supabase Row Level Security (RLS)

Za trenutni obim projekta koriste se free tier opcije GitHub-a i Supabase-a.

## Deployment

Deployment je automatski.

Tok izgleda ovako:

```text
Izmena koda
   ↓
Commit / push na main branch
   ↓
GitHub Pages deployment
   ↓
Nova verzija dostupna na istom URL-u
```

Nema FTP-a, ručnog kopiranja fajlova na server niti posebnog backend deployment-a.

GitHub Pages-u obično treba kratko vreme da objavi novi commit, pa browser ponekad zahteva hard refresh zbog cache-a.

## Podaci i sinhronizacija

Supabase tabela koristi jedan shared state zapis za ovaj događaj:

```text
id: fica-2026
```

U JSON podatku se čuvaju guests, tasks i budget.

Frontend periodično proverava Supabase i osvežava lokalni prikaz, dok izmene korisnika šalje nazad u bazu.

`localStorage` se i dalje koristi kao lokalna pomoćna kopija, ali Supabase je izvor zajedničkih podataka između uređaja.

## Security napomena

Publishable Supabase key sme da bude u frontend aplikaciji. Secret / service_role key ne sme biti u browser kodu ili GitHub repozitorijumu.

Pošto je ovo mali privatni porodični planner, pristup je namerno jednostavan: svako ko ima link može da menja zajedničke podatke. Za ozbiljniju javnu aplikaciju trebalo bi dodati autentikaciju i stroža RLS pravila.

## Glavni fajlovi

- `index.html` — UI, planner logika i lokalno stanje
- `sync.js` — Supabase sinhronizacija
- `assets/invitation.png` — finalna pozivnica za rođendan

## Trenutni event

- Datum: 26. septembar 2026.
- Escape room: 17:00
- Lokacija: PIN Escape Rooms 3 – Sklonište
- Nakon toga: druženje kod kuće
