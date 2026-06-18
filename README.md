# Sage — AI Chatbot

A polished, production-style **streaming AI chatbot** with switchable personas. Built as a portfolio demo to showcase real-world AI app development.

🔗 **Live demo:** _(add Vercel URL after deploy)_

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6-7c6cff) ![Gemini](https://img.shields.io/badge/Google_Gemini-free_tier-c084fc)

## Features

- 🌊 **Token-by-token streaming** responses via the Vercel AI SDK
- 🎭 **Switchable personas** — friendly assistant, senior engineer, copywriter, tutor (each with its own system prompt & starter prompts)
- 📝 **Markdown rendering** — code blocks, lists, tables, links
- ⏹️ **Stop generation** mid-stream, **new chat** reset, auto-growing composer
- 📱 Fully **responsive**, dark "Aurora" design system shared across the portfolio
- 💸 **$0 to run** — powered by Google Gemini's free tier

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Vercel AI SDK v6 + `@ai-sdk/google` (Gemini) |
| Hosting | Vercel |

## Run locally

```bash
npm install
cp .env.example .env.local   # then paste your free Gemini key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Get a free Gemini key (no card) at <https://aistudio.google.com/apikey>.

## Deploy

Push to GitHub, import the repo on [Vercel](https://vercel.com/new), and add the
`GOOGLE_GENERATIVE_AI_API_KEY` environment variable. That's it.

## How it works

The browser uses the AI SDK's `useChat` hook, which streams `UIMessage`s from the
`/api/chat` route handler. The route picks the selected persona's system prompt,
converts the UI messages with `convertToModelMessages`, and pipes Gemini's output
back with `streamText(...).toUIMessageStreamResponse()`. Swapping Gemini for Groq
or OpenRouter is a one-line provider change.

---

Part of [Ramit's freelance portfolio](https://github.com/ramitworks) — building AI apps, chatbots, agents, and modern web experiences.
