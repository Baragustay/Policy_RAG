# Policy Translator

Privacy policies and terms of service of 23 popular apps, explained in plain English, so you understand what you agree to. Every answer links each claim to the original policy paragraph, one tap away.

This repository is the frontend: a static React site. The answers come from a separate RAG backend (FAISS search over the collected policies, Google Gemini for the plain-language answer), hosted as a Gradio Space on Hugging Face. The frontend holds no API keys.

## Features

- **Ask in plain words.** One question gives one answer: a short answer, what it means for you, and a "Watch out" note, each claim with a numbered source.
- **Original text one tap away.** Citations open the exact policy paragraph, with a link to the full policy.
- **All apps or one.** Ask across every app, or focus on one from the logo strip, the app list or the scope picker. Changing app starts fresh.
- **Follow-ups keep context.** "Can I opt out?" is understood in light of the previous question. Earlier answers collapse into a Recent list.
- **Squinty**, the mascot, guides the search and reacts to answers.
- **Accessible by design:** keyboard use, screen reader announcements, WCAG AA contrast, light and dark themes, reduced motion and reduced transparency support.

## Tech

React 19, TypeScript, Vite, Motion, react-markdown, `@gradio/client`, Simple Icons. Plain CSS with design tokens, no CSS framework.

## Getting started

Requires Node 20 or newer.

```sh
npm install
cp .env.example .env   # then set VITE_HF_SPACE to the Gradio Space id
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check and build the static site into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | Lint with oxlint |

`VITE_HF_SPACE` is the public id of the Gradio Space (for example `username/policy-translator-api`). It is not a secret. The free Space sleeps when unused, so the first answer can take up to a minute. The site starts waking it up as soon as the page loads.

## Project structure

```
src/
  App.tsx              App state: questions, answers, focused app, views
  components/
    Home.tsx           Home page: hero, search and answers, footer
    TopBar.tsx         Squinty, portfolio and contact links, theme toggle
    SplitHero.tsx      Split title, logo strip, clickable app names
    QA.tsx             Search box, Squinty's guidance, newest answer, Recent
    ScopePicker.tsx    "All apps" / one-app pill and app list
    AnswerCard.tsx     Answer parts, citations, related questions, sources
    Sources.tsx        Expandable original policy text
    About.tsx          How it works
  lib/
    api.ts             Gradio client: /ask and /list_apps
    answer.ts          Splitting and summarising answers
    apps.ts            App list context; Gmail and YouTube ask as Google
  assets/squint/       Squinty's artwork, one SVG per mood
  index.css            All styles, organised by section
scripts/logos-plugin.ts  Resolves app logos at build time (see LOGOS.md)
apps.config.json         App ids, display names and logo sources
public/logos/            Official logo files added by hand
```

## Logos

Logos are resolved at build time: an official file in `public/logos/` first, then Simple Icons, then a tile with the app's name. Logos are never drawn by hand. See [LOGOS.md](LOGOS.md) for which app uses which source. Logos belong to their owners; the site is not affiliated with any of the apps shown.

## Deploy

The build is plain static files and can be hosted anywhere. See [DEPLOY.md](DEPLOY.md) for Hostinger steps.

## Credits

Design and build: [Barbora Gustafsson](https://barboragustafsson.com/). Brand icons from [Simple Icons](https://simpleicons.org/).

Plain-language summaries, not legal advice.
