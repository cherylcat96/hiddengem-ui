# HiddenGem — User Interface

A community-powered web application for discovering and sharing extraordinary local locations.

## What is HiddenGem?

HiddenGem lets real people share the places that most people never find — a hidden waterfall trail, a rooftop garden, a decades-old café known only to locals. Users submit locations with photos and descriptions, and others discover them through an interactive map and card feed.

## What this repo is

This is the **React frontend** for HiddenGem. It handles all user-facing pages, UI state, and communication with the API service via REST calls.

**Tech stack:**
- React (Vite)
- Google Maps JavaScript API — interactive map and pin rendering
- Deployed on Vercel

## How it fits into the overall application

```
[ This repo: React UI ]  →  REST/JSON  →  [ hiddengem-api ]  →  [ PostgreSQL ]
                                                              →  [ Cloudinary ]
```

The UI is a pure client — it never touches the database directly. All data operations go through the API service.

## Pages (MVP)

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing page with sign up / sign in CTAs |
| Sign Up | `/signup` | Account creation form |
| Sign In | `/signin` | Login form |
| Email Verification | `/verify-email` | Post-registration email confirmation |
| Discover | `/discover` | Feed + map view of community gems |
| Gem Detail | `/gems/:id` | Full gem page with photos, comments, saves |
| Create Gem | `/create` | Submission form with photo upload and map picker |
| Edit Gem | `/gems/:id/edit` | Edit or delete own gem |
| User Profile | `/profile/:username` | Submitted gems, saved gems, profile info |

## Stretch feature

**Follow / Unfollow social graph** — Community page, follower/following lists, and a personalized "Following" feed filter. Implemented after MVP is complete.

## Design documents

All UI design documents are in the `/design` folder:

- `personas_storyboards.docx` — User personas (MVP + stretch), storyboards for all interaction flows
- `styleguide.html` — Color palette, typography, spacing, components — open in any browser
- `wireframes/` — Annotated wireframes for all MVP pages
