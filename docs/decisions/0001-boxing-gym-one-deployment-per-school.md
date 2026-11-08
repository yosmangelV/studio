# 0001 — Boxing Gym: one deployment per school

- **Status:** accepted
- **Recorded:** 2026-11-08

## Context

Boxing Gym started for one school, El Arte del Guante, and the goal is to offer it to other boxing schools. That raises the shape of the product: one central app that hosts many schools, or a template that each school deploys on its own.

The schools are independent businesses. Each one needs its own public landing page on its own domain, and they have no relation to each other: no shared students, classes or reporting.

## Decision

Boxing Gym is a template, not a central platform. Each school gets its own deployment of the whole stack: the Angular site on Vercel, the FastAPI API on Render and its own Supabase project.

## Alternatives

**One multi-school app** with a `school_id` on every table and per-school domains routed to one deployment. It would serve a product whose schools share something, such as a federation or a franchise. Here they share nothing, so every query, policy and screen would carry tenancy only to keep apart data that never meets.

## Consequences

- **Data isolation comes from the infrastructure.** A school's students and payments live in its own Supabase project, so a missing filter or policy cannot leak them to another school.
- **No tenancy in the code.** Tables, RLS policies and endpoints stay single-school, as they are today.
- **Each school owns its domain and brand** without routing logic in the app.
- **Every release is rolled out once per school.** Code ships through each school's Vercel and Render projects, and migrations are run by hand in each Supabase project, so the operational cost grows with the number of schools.
- **Deployment config has to be per school too.** Today `render.yaml` describes both APIs of the monorepo in one blueprint, and migration `003` seeds El Arte del Guante's own data; both need a per-school form before a second school.
- **The template has to be configurable without forking the code.** What changes per school must live in configuration and data, not in components. See the [case study](../case-studies/boxing-gym-template.md) for where that stands.
