# Case study: turning Boxing Gym into a template

Boxing Gym is a public website and a management panel for a boxing school: students, monthly payments and classes. It runs today at El Arte del Guante. This page explains how it is being turned into something other schools can adopt, what is already in place and what is still left.

## The problem

A second school should be able to run Boxing Gym with its own name, logo, colours, contact details, schedule and domain, without anyone editing components or forking the repo. At the same time, each school's students and payments must stay completely separate from every other school's.

## The decision: one deployment per school

The schools are independent businesses with nothing in common, so Boxing Gym is a template rather than a shared platform: each school deploys its own copy of the whole stack (Vercel site, Render API, Supabase project). The reasoning, the multi-school alternative and the costs are in [ADR 0001](../decisions/0001-boxing-gym-one-deployment-per-school.md).

The rest of this page follows from that decision. Isolation is solved by the infrastructure, so the work left is about configuration: making everything that changes between schools live outside the code.

## What already varies per school without code changes

- **Contact, schedule, classes and the figures on the landing page** live in Supabase (`gym_profile` and related tables), and the school's admin edits them from the panel. See [`specs/gym-profile.md`](../../apps/boxing-gym-api/specs/gym-profile.md).
- **The figures are derived, not typed as numbers**: active students are counted and rounded in Postgres, the number of disciplines comes from the active classes, and the years since opening are calculated in the frontend from `founded_on`. That date is still entered by hand, so the years figure is only as right as it is.
- **The landing page works while the API sleeps.** Render's free plan takes 30 to 60 seconds to wake up, so the public data is read straight from Supabase with the anon key. `gym_profile`, `gym_classes` and `gym_schedule_slots` have a read-only RLS policy for anon, and the site reads them through the `public_gym_profile` view (`security_invoker`), which returns only the fields the page shows. The tables themselves are readable too, so nothing in them should be treated as private. All writes go through FastAPI with an admin guard, and personal data (students, payments) is only ever read through the API.

## What is in configuration, but still in code

[`gym.config.ts`](../../projects/boxing-gym/src/app/core/config/gym.config.ts) holds the brand and fixed texts: name, subtitle, tagline, the "about us" text, logo paths and the copyright line. The colours and typefaces live in [`tokens.boxing-gym.scss`](../../projects/boxing-gym/src/styles/tokens.boxing-gym.scss). Keeping the brand out of the database is deliberate: it changes rarely and a change should go through review.

## What still names El Arte del Guante directly

These places repeat the school's name instead of reading it from configuration, and are the next step for the template:

| File | What it holds |
|---|---|
| `projects/boxing-gym/src/index.html` | Page title and meta description |
| `projects/boxing-gym/public/manifest.webmanifest` | App name and description of the installable app |
| `projects/boxing-gym/src/app/shared/components/loading/loading.component.html` | The name shown on the loading screen |
| `projects/boxing-gym/design.md` | The product's design rules, written for this school's brand |
| `projects/boxing-gym/public/assets/logo.svg` | The logo, which spells part of the name as text |
| `apps/boxing-gym-api/migrations/003_create_gym_profile.sql` | Seeds this school's phone, address, opening date, schedule and classes |
| `render.yaml` | One Render blueprint for both APIs in the monorepo, including the unrelated announcement API |

Once these are separated, onboarding a school should come down to a config file, a tokens file, its logos, its own seed data, and a new Vercel, Render and Supabase project. Three things need work first:

- **Choosing a school at build time.** `app.config.ts` provides the single `gym.config.ts` through the `GYM_CONFIG` token, and `scripts/set-env.js` only generates the connection variables. Two deployments of the same code would show the same brand, so a build needs a way to pick a school's config, tokens and assets without a fork. The token keeps that change in one place.
- **Seed data per school.** The migration has to stop carrying one school's data: a migration should create the schema, and each school's data should be entered from its panel or a per-school seed.
- **A Render blueprint per school,** with only the Boxing Gym API.

Onboarding also has a manual step that stays manual on purpose: the school's first admin is created by hand in its Supabase project, with `admin` in `app_metadata.permissions` (see [`specs/user-management.md`](../../apps/boxing-gym-api/specs/user-management.md)). Without that user nobody can open the settings or create other users, and no migration or seed in the repo may create users.

## The cost of this approach

Every release has to reach every school: one deploy per Vercel and Render project, and the migrations, which are run by hand today, once per Supabase project. With one school that is free; with several it is the main operational cost of this design, and the first thing to automate as schools are added.
