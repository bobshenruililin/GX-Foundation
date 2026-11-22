# GX Foundation App — Build Handoff (MVP)

> Handoff for a coding agent (Codex) building the MVP in this repository.
> Read all of it before you start. Anything marked **[ASSUMPTION]** is a reasonable default. Flag it in your summary, but don't block on it.

---

## 1. Context: who this is for

**GX Foundation** (香港 GX 基金會) is a Hong Kong medical humanitarian NGO, founded in 2018. Its global HQ is at 4 Hospital Road, Mid-Levels, opened in November 2025. It serves Belt and Road countries (Laos, Cambodia, Djibouti, Senegal, Mauritania, among others). Its main programme areas, taken from public sources:

1. **Cataract Blindness Elimination**: free sight-restoring surgeries, over 25,000 done so far, with a target of 37,500 for 2023–2027.
2. **Vector-borne disease control**: for example dengue prevention.
3. **Clean drinking water and disaster resilience.**
4. **One Health**: human, animal and environmental health, including a CityUHK partnership signed in 2026.
5. **Youth humanitarian talent development**: the one-year **Youth Ambassador Programme** (first cohort of 28 in 2024; 2025–26 cohort launched November 2025). Ambassadors join public-health activities locally and get overseas fieldwork exposure.

Leadership: Chairman Leung Chun-ying, CEO Emily Chan Ying-yang. The CEO is the main decision-maker and has publicly called on Hong Kong youth to join the foundation's activities. **The MVP is a demo to win the CEO's approval**, so polish and a clear story matter more than breadth.

Brand assets (logo, colours, photos) are public at **https://gxfoundation.hk**. Use them for the demo. They belong to the foundation, and the person commissioning this app is one of its youth ambassadors.

## 2. Product goal

One app that:
- **Runs the ambassador and member community**: events, sign-ups, check-in, participation tracking.
- **Works as outreach**: the public can find events and impact stories and share them.
- **Gives staff data**: who participated, how often, and what the foundation's numbers are, ready for reports and funders.

Core loop: **Discover event → RSVP → QR check-in → hours and impact added to your profile → share.**

## 3. Users and roles

| Role | Who | Can do |
|---|---|---|
| `public` (not logged in) | Anyone | Browse public events, news and impact stats; open shared event links; sign up |
| `member` | Registered supporters/volunteers, **18+ only** | RSVP, check in, see own profile and hours, get news |
| `ambassador` | Youth Ambassador Programme cohort | Everything members can do, plus cohort feed, create *draft* events, scan attendee QR codes at events they're assigned to, see cohort leaderboard |
| `staff` | Foundation employees | Full admin: publish events, verify ambassadors, post news, edit impact stats, view dashboard, export CSV |

**Age:** members must confirm they're 18+ at sign-up (date of birth field plus a checkbox).
**[OPEN QUESTION]** Ambassadors can include secondary-school students under 18. For the MVP, staff create and approve ambassador accounts, and the app collects only the minimum for them: name, school, email. Note this in your summary.

## 4. Tech stack (decided)

- **Mobile:** Expo (React Native) + TypeScript + Expo Router. Builds for iOS and Android stores. Demo through **Expo Go** or a dev build on a phone.
- **Backend:** **Supabase**: Postgres, Auth (email OTP / magic link, plus Apple sign-in later), Storage (images), Row Level Security for every role.
- **Public outreach web:** use Expo Router's web output for `/e/[slug]` (public event page) and `/` (public landing/impact page), so shared links open in a browser without the app. Deep link into the app when it's installed.
- **UI:** a clean, modern component approach (e.g. Tamagui, NativeWind or a small custom kit; your choice). Use `expo-camera` for QR scanning and `react-native-qrcode-svg` for showing QR codes.
- **i18n:** **English + Traditional Chinese (繁體中文) from day one** (`i18next`). This is Hong Kong, and the CEO will notice. Every user-facing string goes through translation keys. Event and news content can have `title_en`/`title_zh` fields.
- **Push notifications:** `expo-notifications`. Stub this in the MVP: register the token and send one "event reminder" through a Supabase Edge Function if time allows.

## 5. Data model (Supabase / Postgres)

```
profiles        id (= auth.users.id), role enum(member|ambassador|staff), full_name, avatar_url,
                date_of_birth, is_18_confirmed bool, school_or_org, cohort_id → cohorts,
                preferred_lang enum(en|zh), created_at
cohorts         id, name (e.g. "2025–26 Youth Ambassadors"), start_date, end_date
programmes      id, slug (cataract|vector|water|one-health|youth), name_en, name_zh, description_en,
                description_zh, icon, color
events          id, slug (unique, for share links), title_en, title_zh, description_en, description_zh,
                programme_id → programmes, type enum(talk|volunteering|training|fundraising|field_trip|social),
                starts_at, ends_at, location_name, location_address, lat, lng, cover_image_url,
                capacity, visibility enum(public|members|ambassadors), status enum(draft|published|cancelled),
                volunteer_hours numeric (credited on check-in), created_by → profiles, created_at
event_staff     event_id, profile_id   -- ambassadors/staff allowed to scan check-ins for this event
rsvps           id, event_id, profile_id, status enum(going|waitlist|cancelled), created_at, UNIQUE(event_id, profile_id)
checkins        id, event_id, profile_id, checked_in_by → profiles, checked_in_at, UNIQUE(event_id, profile_id)
posts           id, title_en, title_zh, body_en, body_zh, image_url, programme_id, audience enum(public|members|ambassadors),
                author_id, published_at
impact_stats    id, key (e.g. cataract_surgeries), label_en, label_zh, value bigint, unit, programme_id, updated_at
push_tokens     profile_id, token, platform
```

Views and functions:
- `profile_stats` view: events attended, total volunteer hours, and current streak per profile.
- `cohort_leaderboard` view: hours per ambassador within a cohort.
- `check_in(event_id, profile_id)` RPC (security definer): checks that the caller is staff or listed in `event_staff`, that the event is within its time window (±2h), and that the attendee has an RSVP or the event allows walk-ins. Inserts the check-in and is idempotent.

**RLS rules (summary):**
- Public (anon): read `events` where `status='published' AND visibility='public'`, public `posts`, `impact_stats` and `programmes`.
- Members see `members` + `public` visibility. Ambassadors also see `ambassadors` visibility.
- Users read and write only their own `rsvps` and `profiles` row (role column not writable by the user).
- Ambassadors can insert events with `status='draft'` only. Staff can publish, edit and delete anything.
- `checkins` insert only through the RPC.

Ship this as SQL migrations in `supabase/migrations/` plus a `supabase/seed.sql`.

## 6. Screens

**Public / logged out**
1. **Welcome / Impact home**: hero with the foundation's mission, animated impact counters (surgeries, countries, ambassadors, volunteer hours), programme tiles, "Upcoming public events", Sign up / Log in.
2. **Public event page** (`/e/[slug]`, also on web): cover image, details, map, "Add to calendar", **Share** (native share sheet with link and an auto-generated share card), RSVP (asks the user to sign up first).

**Member / Ambassador (tab bar)**
3. **Home**: greeting, next RSVP'd event card with a countdown, news feed, impact counters.
4. **Events**: list plus calendar toggle; filter by programme and type; search. Event detail with RSVP / cancel / waitlist state.
5. **My Ticket**: personal QR code (encodes signed `profile_id` + `event_id`, or a profile-level token), used for check-in.
6. **Profile**: avatar, role badge, cohort, hours, events attended, programme badges (e.g. attended 3 cataract-related events → "Sight Saver" badge), language toggle EN/繁.
7. *(Ambassador)* **Cohort**: cohort-only feed, leaderboard by hours, "Propose an event" form (creates a draft for staff).
8. *(Ambassador/Staff assigned)* **Scan**: camera QR scanner for an event, with success/duplicate/error feedback (haptic + colour) and a live "checked in X / RSVP'd Y" count.

**Staff (extra tab "Admin")**
9. **Dashboard**: KPIs (active members, ambassadors, events this month, attendance rate, total hours), attendance-over-time chart, top events, programme breakdown.
10. **Manage events**: create, edit, publish, approve ambassador drafts, assign scanners, view RSVP and check-in list, **export CSV**.
11. **Manage people**: list, filter by role and cohort, promote member → ambassador, assign cohort.
12. **Post news** and **edit impact stats**.

## 7. Seed data (makes the demo feel real)

- 5 programmes (from section 1), with public-sourced descriptions in EN and ZH.
- 1 cohort: "2025–26 Youth Ambassadors".
- Accounts: 1 staff (`staff@demo.gx`), 3 ambassadors, 5 members. Use realistic, clearly fake names.
- About 8 events across the next 6 weeks plus 4 past ones with check-ins, for example: "Cataract Awareness Talk at HQ (4 Hospital Road)", "Dengue Prevention Community Workshop", "Ambassador Training: Humanitarian Basics", "One Health Seminar with CityUHK", "Charity Run fundraiser", "HQ Heritage Building Open Day".
- Impact stats: cataract surgeries 25,000+, countries served, ambassadors trained, volunteer hours (computed).
- 4 news posts.

Label every seeded number that isn't public as demo data in the code comments. Don't invent official claims in the UI copy.

## 8. Build order (milestones)

1. **Scaffold**: Expo + TS + Expo Router, Supabase client, env config (`.env.example`), i18n, theme with GX brand colours, lint/format.
2. **Backend**: migrations, RLS, RPC, seed. Verify RLS with a quick script or SQL tests for each role.
3. **Auth + onboarding**: email OTP, profile setup, 18+ gate, language choice.
4. **Events core**: list, detail, RSVP, My Ticket QR.
5. **Check-in**: scanner + RPC + profile stats update.
6. **Public outreach**: impact home, public event page on web, share links + deep links.
7. **Staff admin**: dashboard, event management, CSV export, people management.
8. **Ambassador extras**: cohort feed, leaderboard, propose event.
9. **Polish**: empty/loading/error states, haptics, animations on counters, app icon + splash with GX logo, dark mode if it's cheap.
10. *(Stretch)* Push reminder 24h before an RSVP'd event (Edge Function + scheduled job).

## 9. Definition of done (demo-ready)

- [ ] `README.md` explains setup: Supabase project or `supabase start` locally, run migrations + seed, `npx expo start`, and how to log in as each demo role.
- [ ] On a real phone via Expo Go, someone can: sign up as a member → RSVP an event → show their QR → an ambassador scans it → the member's hours go up.
- [ ] A public event link opens in a mobile browser and looks good when shared (Open Graph title/image).
- [ ] Staff can create and publish an event, see it appear for members, and export the attendee CSV.
- [ ] The full app switches between EN and 繁中.
- [ ] RLS verified: a member cannot read ambassador-only events or write another user's data. Anon can only read public content.
- [ ] No secrets committed. Supabase anon key comes from env only; the service-role key is never in the app.
- [ ] TypeScript strict, no type errors, lint passes.

## 10. The 3-minute CEO demo script (design toward this)

1. Open the app → **impact home** with live counters and the foundation's programmes (bilingual toggle).
2. Show an upcoming **public event**, tap **Share** → the link opens as a polished web page (outreach).
3. Log in as a **member**, RSVP, show the **ticket QR**.
4. Switch to an **ambassador** phone, **scan** → instant check-in and the hours counter goes up.
5. Log in as **staff** → **dashboard** with participation data → **export CSV** ("this is your funder report").

## 11. Out of scope for MVP

Payments/donations in-app (link out to the existing donation page instead), chat/DMs, multiple chapters/regions, overseas field-trip application workflows, AI features, app store submission (prepare `app.json`/EAS config, but don't submit).

## 12. Sources (public)

- https://gxfoundation.hk (brand, programmes)
- CityUHK × GX Foundation partnership (2026): https://www.cityu.edu.hk/en/media/press-release/2026/06/28/cityuhk-and-gx-foundation-forge-partnership
- HQ opening / 7th anniversary / 2025–26 ambassador launch: https://www.chinadailyhk.com/hk/article/624091 · https://www.scmp.com/news/hong-kong/society/article/3333675/cy-leungs-charity-moves-104-year-old-hong-kong-site-philanthropic-spirit
- First ambassador cohort (2024): https://www.chinadailyhk.com/hk/article/598136
- Cataract programme targets: https://www.thestandard.com.hk/news/article/192886/Thirty-six-thousand-cataract-patients-in-Laos-Cambodia-and-Djibouti-to-receive-surgery-by-Chinese-NGO
