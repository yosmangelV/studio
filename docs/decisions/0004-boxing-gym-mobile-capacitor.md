# 0004 — Boxing Gym mobile: Capacitor over the existing Angular app

- **Status:** accepted
- **Recorded:** 2026-11-16

## Context

The school's admin wants to run the gym from the phone and stop using WhatsApp for notices, and students should reach the gym from the phone too. Two modules are coming, orders and then classes, and both are used by the same people on the web and on the phone:

- **The admin** manages orders, attendance and notices from the phone, and builds the product catalog on the web.
- **Students** browse the catalog, request material and sign up for classes from either.

So the mobile app is not a second product: it is the same screens, rules and users as the web app, installed from the stores. The web app is Angular 21 with its own design system (`projects/design-system`) and talks only to the FastAPI API.

## Decision

Package the existing `projects/boxing-gym` Angular app with **Capacitor** for iOS and Android. One codebase serves the web, iOS and Android.

- **Native features come from Capacitor plugins**, starting with push notifications, which replace the WhatsApp notices.
- **Ionic components are optional and local.** Where a screen needs app-like navigation (tabs, swipe back, pull to refresh) it may use individual Ionic standalone components, themed with the design-system tokens. The app does not adopt Ionic as its UI framework.
- **Platform differences are explicit.** A feature that exists only on one platform, such as building the catalog on the web, is decided by a single platform check in the app, not by separate screens.
- **Built for one school first.** The first native app is El Arte del Guante's. Its name, icon and bundle identifier come from configuration, so another school is another build, not a fork.

## Alternatives

**A separate Ionic app** (`projects/boxing-gym-mobile`) with its own UI. Ionic runs on Capacitor too, so it would not reach the phone in a more native way: the difference is only the UI kit. It would duplicate every screen, its tests and its fixes, and the two apps would drift. Its one advantage, app-like navigation everywhere, is kept by using Ionic components where they help.

**A truly native UI** (Swift and Kotlin, React Native or Flutter). Native rendering is not needed for forms and lists, and it would mean a second and third codebase, outside the Angular and design-system work this repo is built on.

**An installable PWA only.** No store presence, and push notifications on iOS only work after the user adds the site to the home screen, which most students would not do.

## Consequences

- **Every screen has to work at phone width first.** The web app is responsive today, but the new modules are designed for the phone and then widened, not the other way round.
- **No money is charged in the app.** Payments, orders and any paid option are administrative records only (see [`specs/payments.md`](../../apps/boxing-gym-api/specs/payments.md)). The app never sells or links to a purchase, so the App Store and Google Play in-app purchase rules do not apply. Selling anything digital inside the app later would bring those rules, and their fee, into play.
- **The app has to be more than the website.** Apple rejects apps that only wrap a site (guideline 4.2). Push notifications and the logged-in student and admin areas are what make it an app; the public landing page is not part of it.
- **Store accounts.** The apps are published under the developer's own Apple Developer (yearly fee) and Google Play (one-time fee) accounts, which also serve the other apps in this repo. Both stores support transferring an app to another account later; push configuration has to be redone after an iOS transfer. A new personal Google Play account must run a closed test with testers for two weeks before its first production release.
- **Auth links must open the app.** Invitation and password links from Supabase need deep links (iOS universal links, Android app links) that land in the app, as well as the web URL. See [0005](0005-boxing-gym-student-accounts.md).
- **The API's cold start shows.** Render's free plan sleeps the API, so the first request of the day takes 30 to 60 seconds. On a phone used several times a day this is visible; the app needs a clear loading state, and a paid plan becomes worth weighing once the admin relies on it.
- **Releases are no longer one deploy.** Capacitor bundles the built web app inside the native app, so the web gets a change with the next Vercel deploy, but the phones only get it with the next store build and review. The API has to stay compatible with app versions that are a few weeks old, because students update when they update. Over-the-air update services exist and can be weighed later; they are not part of this decision.
