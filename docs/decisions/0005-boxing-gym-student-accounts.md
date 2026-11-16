# 0005 — Boxing Gym: student accounts by admin invitation

- **Status:** accepted
- **Recorded:** 2026-11-16

## Context

Until now Boxing Gym's logged-in area has been for staff only: the panel's routes are behind `staffGuard` and `adminGuard`, and every API router declares `require_admin` or `require_instructor`. The orders and classes modules change that, because students request material and sign up for classes themselves (see [0004](0004-boxing-gym-mobile-capacitor.md)).

The pieces of a student account already exist: `students.auth_user_id` links a student to a Supabase Auth user, permissions live in that user's `app_metadata.permissions` (`student`, `instructor`, `admin`), and `require_student` exists in `app/auth.py`. But the accounts cannot be used. `POST /students` with `system_access` creates the auth user with a random 16-character password that nobody receives, marks the email as confirmed and sends nothing, and the app has no way to set or reset a password. [`specs/user-management.md`](../../apps/boxing-gym-api/specs/user-management.md) still describes an admin-typed password, which the code no longer does.

The school does not want self sign-up: the admin decides who is a student.

## Decision

**The admin invites; the student sets the password.**

1. Students are still created only by the admin, from the panel. Giving a student access sends a Supabase invitation email to the address the admin registered. The link opens a page, on the web or in the app, where the student chooses a password.
2. The panel can resend the invitation, and the login page gets a "forgot password" flow, so no account is ever left without a way in. Accounts created before this change get in through that flow.
3. **A student's identity always comes from the token.** Student endpoints resolve the student from the JWT (`sub` → `students.auth_user_id`) through a shared dependency; they never accept a `student_id` from the client. An admin's token does not resolve to a student, so admin-only and student-only endpoints stay separate.
4. **Data access stays API-only.** The API keeps using the service role, and the tables keep row level security on with no policy for `anon` or `authenticated`, as `students` and `payments` have today. Authorization lives in the API's guards and in the "own data" filter of point 3, where the tests can reach it.
5. **Access follows `is_active`.** An inactive student keeps the account but the API refuses their requests until the admin reactivates them, so access is never lost or restored by deleting users.
6. The logged-in area splits by role: staff keep the panel, students get their own area. The public landing page stays on the web and is not part of the app.

## Alternatives

**Self sign-up with admin approval.** It moves typing the email to the student, but the school already registers every student with their email, and a sign-up form is one more thing to protect from abuse.

**Admin-typed or generated passwords handed over in person.** It is what the first spec described. The admin would hold every student's password, and there would still be no reset.

**Per-student RLS policies with the students reading Supabase directly.** Rules would live in SQL as well as in the API, and the service-role API would bypass them anyway, so they would only protect a path the app does not use.

## Consequences

- **Supabase needs a custom SMTP provider.** Its built-in email service only delivers to the project's team members and is heavily rate-limited, so invitations and resets would not reach students. This is project configuration, done once per school's Supabase project (see [0001](0001-boxing-gym-one-deployment-per-school.md)).
- **Auth links need allowed redirect URLs** for the web and for the app's deep links, set per Supabase project.
- **`specs/user-management.md` is replaced** by a spec for this flow, and `system_access` with a generated password goes away.
- **The repo's rule on accounts still holds.** Users and students are created on demand by the admin through the app, never by a migration or a script.
- **Every new student endpoint needs a test that one student cannot read or change another's data**, since that filter, not the database, is what keeps them apart.
