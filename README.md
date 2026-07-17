<div align="center">

# Brandcast

### One brand. Every platform. Zero chaos.

**The AI marketing studio that studies your company, routes the best model for every post, and can plan a full month of content.**

Brandcast uses **Marketing Context Protocol** (website brand research) and **Model Context Protocol** (CRM, databases, apps, data sources) so every post is grounded in real company context.

</div>

---

## Why Brandcast is different

- **Marketing Context Protocol** — study a company website for voice, industry, audience, offerings.
- **Model Context Protocol (built-in)** — CRM, databases, Slack, Notion, Sheets, Airtable feed generation automatically — no Integrations page.
- **Smart multi-model routing + Hybrid Fusion** — routes each brief to the best model, or fuses two.
- **Monthly content plans** — one goal prompt → a balanced 4-week board of posts.
- **Works with zero keys** — realistic offline engine; add provider keys to go live.
- **Simple login** — email Continue or Google — no passwords, no codes.

## Quick start

```bat
start.bat
```

Or:

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Open http://localhost:5173

## Demo sign-in

Email Continue (no password / no code) or Continue with Google.

## API highlights

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/content/mcp/research` | Marketing Context Protocol website research |
| GET  | `/api/mcp/context` | Built-in MCP context (auto — no setup page) |
| POST | `/api/content/generate` | Generate one post (MCP context included automatically) |
| POST | `/api/content/monthly` | Generate an 8–15 post monthly plan |

See full docs in the previous README sections for auth, schedule, and analytics.
