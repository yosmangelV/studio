# Case study: turning Boxing Gym into a template

Boxing Gym is a public website and a management panel for a boxing school: students, monthly payments and classes. It runs today at El Arte del Guante. This page explains how it is being turned into something other schools can adopt, what is already in place and what is still left.

## The problem

A second school should be able to run Boxing Gym with its own name, logo, colours, contact details, schedule and domain, without anyone editing components or forking the repo. At the same time, each school's students and payments must stay completely separate from every other school's.

## The decision: one deployment per school

The schools are independent businesses with nothing in common, so Boxing Gym is a template rather than a shared platform: each school deploys its own copy of the whole stack (Vercel site, Render API, Supabase project). The reasoning, the multi-school alternative and the costs are in [ADR 0001](../decisions/0001-boxing-gym-one-deployment-per-school.md).

The rest of this page follows from that decision. Isolation is solved by the infrastructure, so the work left is about configuration: making everything that changes between schools live outside the code.

## What already varies per school without code changes

- **Contact, schedule, classes and the figures on the landing page** live in Supabase (`gym_profile` and related tables), and the school's admin edits them from the panel. See [`specs/gym-profile.md`](../../apps/boxing-gym-api/specs/gym-profile.md).
- **The figures are computed, never typed in**: active students are counted and rounded in Postgres, years are derived from the opening date, and the number of disciplines from the active classes.
- **The landing page works while the API sleeps.** Render's free plan takes 30 to 60 seconds to wake up, so the public data is read straight from Supabase through a read-only `security_invoker` view (`public_gym_profile`), under RLS. All writes still go through FastAPI with an admin guard, and personal data (students, payments) is only ever read through the API.

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

Once these read from configuration, onboarding a school should come down to a config file, a tokens file, its logos, and a new Vercel, Render and Supabase project with the migrations applied.

## The cost of this approach

Every release has to reach every school: one deploy per Vercel and Render project, and the migrations, which are run by hand today, once per Supabase project. With one school that is free; with several it is the main operational cost of this design, and the first thing to automate as schools are added.
