# mySWOOOP AI Marketing Studio

An AI-powered social media content generator for mySWOOOP — create engaging posts for Facebook, Instagram, and Twitter in seconds.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js
- **AI**: Anthropic Claude API (claude-3-5-sonnet)

## Quick Setup

### 1. Add your Anthropic API Key

Open `backend/.env` and replace the placeholder:

```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

Get your API key at: https://console.anthropic.com/

### 2. Start the Backend

```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:5000

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Features

- **AI Content Generation** — Generate platform-optimized posts for Facebook, Instagram & Twitter
- **8 Tone Options** — Professional, Friendly, Inspiring, Exciting, Educational, Witty, Urgent, Warm
- **Platform Previews** — See exactly how your post looks in each social network's UI
- **Content Templates** — 8 ready-made templates based on mySWOOOP's brand campaigns
- **History** — All generated posts saved in session with search & filter
- **Bilingual** — Generate content in English or German (Deutsch)
- **mySWOOOP Brand Aligned** — AI is pre-trained on mySWOOOP's brand voice and values

## Project Structure

```
Myswooopmarketing/
├── backend/
│   ├── src/
│   │   ├── controllers/contentController.js
│   │   ├── data/sampleData.js       ← mySWOOOP brand data & sample posts
│   │   ├── middleware/errorHandler.js
│   │   ├── routes/contentRoutes.js
│   │   ├── services/aiService.js    ← Claude AI integration
│   │   └── server.js
│   ├── .env                         ← Add your API key here
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/              ← Layout, Header, Sidebar, ContentPreview
    │   ├── context/AppContext.jsx   ← Global state
    │   ├── pages/                   ← Dashboard, Generate, History, Templates
    │   ├── services/api.js          ← Axios API calls
    │   └── App.jsx
    └── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/content/generate | Generate AI content |
| GET | /api/content/samples | Get sample mySWOOOP posts |
| GET | /api/content/templates | Get content templates |
| GET | /api/content/history | Get generation history |
| DELETE | /api/content/history/:id | Delete history item |
| GET | /api/health | Health check |
