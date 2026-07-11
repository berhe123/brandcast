<div align="center">

# ⚡ VibePost

### One account. Every platform. Zero chaos.

**The AI content studio that picks — and fuses — the best AI model for every post.**

VibePost routes each marketing brief to the model that does it best, blends two when two are
better than one, then helps you create, schedule, and publish on-brand content across Facebook,
Instagram, X, LinkedIn, TikTok, and your blog — all from one dashboard.

</div>

---

## ✨ Why VibePost is different

Most AI marketing tools pipe every request to a single model. VibePost is built around a
**multi-model AI Router**:

- **Smart routing** — every brief is scored against each model's real strengths (hooks, brand
  voice, long-form depth, multilingual fluency, trend awareness, structure) and routed to the
  best model for *that* task.
- **Hybrid Fusion** — when two models are complementary, VibePost generates both drafts in
  parallel and fuses them into one best-of-both post, then explains exactly why.
- **Fully explainable** — the UI shows which models ran, the fit score, the rationale, and the
  two source drafts behind every fused result.
- **Works with zero keys** — a realistic offline engine means the whole app runs out of the box.
  Add any provider key (Anthropic, OpenAI, Gemini, DeepSeek) and matching models go live instantly.

## 🎯 Features

- **Multi-model AI Router & Hybrid Fusion** — 7 models across 4 providers, chosen per task.
- **Every channel** — Facebook, Instagram, X/Twitter, LinkedIn, TikTok, and long-form blog, each
  with platform-aware length and tone.
- **Unlimited brands** — manage every client or product line with its own voice, channels, and history.
- **Live platform previews** — see exactly how a post looks in each network before you publish.
- **Schedule & auto-publish** — queue posts; a background scheduler ships them at the right time.
- **Analytics** — engagement metrics plus model-usage insights.
- **Content templates** — reusable, proven angles that prefill the studio for your brand.
- **Passwordless auth** — email one-time code or Google sign-in, with admin/member roles (RBAC).
- **Beautiful, responsive dark UI** — built with Tailwind, Framer Motion, and a cohesive design system.

## 🧱 Tech stack

| Layer        | Technology |
|--------------|-----------|
| Frontend     | React 18, Vite, React Router, Tailwind CSS, Framer Motion, lucide-react |
| Backend      | Node.js, Express, dependency-free JWT (HS256), JSON file store |
| AI           | Pluggable adapters for Anthropic, OpenAI, Gemini, DeepSeek + offline demo engine |
| Tooling      | Vitest (frontend), Node test runner (backend), nodemon |

## 📁 Project structure

```
vibepost/
├── backend/
│   └── src/
│       ├── ai/                 # The differentiator
│       │   ├── catalog.js      # Model metadata (skills, providers, availability)
│       │   ├── router.js       # Scoring + single/hybrid selection
│       │   └── adapters.js     # Provider calls + flavoured mocks + fusion
│       ├── controllers/        # auth, content, schedule, analytics, users
│       ├── routes/             # Express routers
│       ├── services/           # aiService (orchestrator), authService, scheduler
│       ├── middleware/         # auth guard, error handler
│       ├── db/store.js         # Tiny swappable JSON repository
│       ├── data/sampleData.js  # Neutral demo brand, samples & templates
│       ├── utils/jwt.js        # HMAC JWT sign/verify
│       └── server.js
└── frontend/
    ├── api/                    # Vercel serverless mirror (optional deploy path)
    └── src/
        ├── components/         # Logo, Layout, Header, Sidebar, ContentPreview, RoutingPanel…
        ├── context/            # AuthContext, AppContext
        ├── pages/              # Landing, Login, Dashboard, Generate, Templates, Schedule, Analytics, Team
        └── services/api.js
```

## 🚀 Quick start

> Requires **Node.js 18+** (Node 20 recommended).

### Windows (one click)

```bat
start.bat
```

This launches the backend (http://localhost:5000) and frontend (http://localhost:5173) in two windows.

### Manual (any OS)

```bash
# 1) Backend
cd backend
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev            # http://localhost:5000

# 2) Frontend (new terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Open **http://localhost:5173** and sign in.

### Signing in

VibePost uses passwordless auth. In demo mode (no email provider configured) the 6-digit
login code is shown right on screen, or use **Continue with Google** (demo). **The first account
to sign in becomes the admin** and unlocks the Team page.

## 🔑 Going live with real AI (optional)

VibePost runs fully without any keys. To upgrade models to live generation, add any of these to
`backend/.env`:

```env
ANTHROPIC_API_KEY=...   # https://console.anthropic.com/
OPENAI_API_KEY=...      # https://platform.openai.com/api-keys
GEMINI_API_KEY=...      # https://aistudio.google.com/apikey
DEEPSEEK_API_KEY=...    # https://platform.deepseek.com/
```

The router automatically uses every provider you supply a key for; the rest keep running on the
realistic demo engine.

## 🧪 Testing

```bash
# Backend (Node test runner)
cd backend && npm test

# Frontend (Vitest)
cd frontend && npm test
```

## 🔌 API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/email/start` | Begin email login (returns demo code) |
| POST | `/api/auth/email/verify` | Verify code → JWT |
| POST | `/api/auth/google` | Google sign-in (demo or real) |
| GET  | `/api/auth/me` | Current user |
| POST | `/api/content/generate` | Generate content via the AI router |
| GET  | `/api/content/templates` | Reusable templates |
| GET  | `/api/content/ai-status` | Live/demo model status |
| GET/POST | `/api/schedule` | List / queue scheduled posts |
| GET  | `/api/analytics` | Engagement + model usage |
| GET  | `/api/health` | Health check |

## 📦 Deployment

- **Frontend** → Vercel (static build + serverless `frontend/api`). Set `VITE_API_URL` to your backend.
- **Backend** → any Node host (Render, Railway, Fly, a VM). Set `FRONTEND_URL`, `JWT_SECRET`, and
  any AI provider keys.

## 📄 License

MIT — build something great with it.
