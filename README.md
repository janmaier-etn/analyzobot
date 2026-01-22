# AnalyzoBot

AI-powered company analysis tool that generates PESTLE and Porter's Five Forces analysis based on annual reports, and suggests relevant IT vendors.

## Features

- Fetch company data by IČO (Czech company ID)
- Download and analyze annual reports from the last 3 years
- Generate AI-powered PESTLE analysis
- Generate AI-powered Porter's Five Forces analysis
- Find relevant IT vendors (software development, marketing, CDP, mobile apps, automation)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file and add your AI API key:

Edit `.env` file and uncomment one of these:
```bash
# For Claude (recommended):
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# OR for OpenAI:
OPENAI_API_KEY=sk-your-actual-key-here
```

3. Run locally:
```bash
npm run dev
```

The app will be available at: http://localhost:3000

5. Deploy to Vercel:
```bash
npm run deploy
```

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js serverless functions (Vercel)
- **AI**: Claude API or OpenAI API
- **Data sources**: ARES API, justice.cz

## Project Structure

```
analyzobot/
├── public/           # Frontend files
│   ├── index.html
│   ├── css/
│   └── js/
├── api/             # Serverless API endpoints
├── lib/             # Shared libraries
└── package.json
```

## License

MIT
