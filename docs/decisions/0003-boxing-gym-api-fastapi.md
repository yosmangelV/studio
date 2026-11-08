# 0003 — Boxing Gym API: Python and FastAPI

- **Status:** accepted
- **Recorded:** 2026-11-08

## Context

Boxing Gym manages a school's students, payments and classes, and it is meant to grow into a template for other schools (see [0001](0001-boxing-gym-one-deployment-per-school.md)). Its API carries most of the product's business rules and authorization.

## Decision

Build it with Python and FastAPI, on Supabase.

## Why

- **Learning Python on a real product.** The project was a deliberate chance to learn Python on something that ships, instead of on exercises.
- **Room to grow.** For the part of the product with the most rules, a more robust base that can scale in several directions was preferred over the quickest option.

## Consequences

- The API's contract is its OpenAPI spec, which FastAPI generates; the Angular app builds its TypeScript client from it (`npm run generate:api`).
- The monorepo has two backend stacks (this one and NestJS for the announcement API, see [0002](0002-announcement-api-nestjs.md)), each with its own tooling, CI and Render service.
