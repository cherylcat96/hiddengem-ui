# HiddenGem — Frontend

React (Vite) frontend for HiddenGem, a community-powered app for discovering and sharing hidden local spots.

**Live URL:** https://hiddengem-ui.vercel.app

---

## Features

- **Discover** — Browse gems in a card feed or interactive Google Maps view. Filter by category, sort by newest or most saved, and search by name or description.
- **Gem Detail** — View photos (carousel with arrows), description, location on Google Maps, save count, and comments.
- **Create Gem** — Upload up to 3 photos to Cloudinary, detect your location, add tags and category, set privacy.
- **Edit / Delete Gem** — Update any field including photos. Only the gem's owner can edit or delete.
- **User Profile** — View any user's submitted gems, follower/following counts (clickable), and bio. Follow or unfollow directly from the profile.
- **Edit Profile** — Update your display name, bio, and profile photo from a modal on your own profile page.
- **Saves** — Save gems from the detail page. View all saved gems on your profile's Saved tab.
- **Comments** — Post comments on any gem. Author badge displayed for the gem owner's comments.
- **Follow / Unfollow** — Follow other users. View followers and following lists in a modal.
- **Email Verification** — New accounts require email verification before signing in.
- **Mobile Responsive** — All pages adapt to mobile viewports.
- **Loading Skeletons** — Feed cards animate while data loads.
- **Error Pages** — 404 and error boundary pages included.

---

## Getting Started

### Register an account

Visit https://hiddengem-ui.vercel.app and click **Get Started Free** to register. You will receive a verification email — click the link to activate your account before signing in.

### Explore the app

- Browse the **Discover** page to see community gems
- Switch to **Map** view to see gem locations on Google Maps
- Click any gem card to view details
- Create your own gem via the **Create** button in the nav

---

## Tech Stack

- React 18 (Vite)
- React Router v6
- Axios
- Google Maps JavaScript API
- Cloudinary (photo uploads)
- Deployed on Vercel

---

## Local Development

```bash
