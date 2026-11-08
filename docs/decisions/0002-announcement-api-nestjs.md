# 0002 — Announcement API: NestJS and MongoDB

- **Status:** accepted
- **Recorded:** 2026-11-08

## Context

The announcement app needed a small API: given a code, return one message with its slides, or tell the reader the code is unknown or deactivated. It had to ship quickly, and the data is a handful of self-contained documents with no relations to model.

## Decision

Build it with NestJS and MongoDB.

## Why

- **Familiarity over novelty.** NestJS was already known from earlier practice projects, which mattered more than anything else on a fast, small project.
- **The data fits a document.** A message and its slides are read together as one unit, so MongoDB stores them as they are served, without schema design up front.

## Consequences

- The monorepo has two backend stacks (this one and FastAPI for Boxing Gym, see [0003](0003-boxing-gym-api-fastapi.md)), each with its own tooling, CI and Render service.
- If the app ever needs relations, such as recipients, permissions or analytics, the storage choice is worth revisiting rather than stretching.
