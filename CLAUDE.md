# Garlic Tiger - Project Guide

## Overview
Garlic Tiger is a Game Boy-style browser game built with Phaser 3 and Vite. Players guide a tiger through Korea, answering cultural quiz questions to collect garlics and transform into a Korean.

## Tech Stack
- **Framework**: Phaser 3.70
- **Build Tool**: Vite 5
- **Styling**: Pokemon Red/Blue inspired palette with procedural graphics
- **Deployment**: Vercel (with serverless functions)

## Project Structure
```
garlicGame/
├── api/                    # Serverless API functions
│   └── subscribe.js        # Email subscription endpoint
├── src/
│   ├── scenes/             # Phaser scenes
│   │   ├── BootScene.js    # Asset loading
│   │   ├── TitleScene.js   # Title screen
│   │   ├── IntroScene.js   # Story intro
│   │   ├── OverworldScene.js # Map exploration
│   │   ├── QuizScene.js    # NPC quiz encounters
│   │   ├── TransformScene.js # Tiger transformation
│   │   ├── VictoryScene.js # Victory at gate
│   │   ├── ScrollScene.js  # Final scroll + email capture
│   │   └── GameOverScene.js # Game over + share
│   ├── objects/
│   │   ├── Tiger.js        # Tiger player object
│   │   └── DialogueBox.js  # Pokemon-style dialog
│   ├── utils/
│   │   ├── AudioManager.js # Pokemon Gen 1 style sound effects
│   │   ├── StateManager.js # Game state
│   │   ├── ShareManager.js # Social sharing
│   │   └── GBGraphics.js   # Palette & procedural sprites
│   ├── data/
│   │   └── quizData.json   # Quiz questions and answers
│   ├── config.js           # Game configuration
│   └── main.js             # Entry point
├── .env.local              # API keys (gitignored)
└── vercel.json             # Deployment config
```

## Game Flow
1. **Boot** → Initialize audio, show LocalNomad logo
2. **Title** → Press start (shows shared tiger if URL has ?stage=X)
3. **Intro** → Tiger wants to enter Korea, needs 5 garlics
4. **Overworld** → Walk around, random encounters after N tiles
5. **Quiz** → Answer NPC questions (Korean culture)
6. **Transform** → Tiger changes form on correct answer
7. **Victory** → Gate opens after 5 garlics
8. **Scroll** → Tiger absorbs glowing scroll, email capture

## Key Features
- **Pokemon Red/Blue Palette**: Bright colors with white backgrounds (#ffffff), black borders (#000000), light green grass (#90ee90), tan paths (#d2b48c)
- **Procedural Graphics**: All sprites and environments generated via GBGraphics.js (no external image assets)
- **Pokemon-Style UI**: White dialog boxes with 2px black borders, cursor selection, typewriter text
- **Sharing**: Share tiger transformation state with URL parameter
- **Email Capture**: Serverless API to Airtable for lead collection

## Environment Variables (Vercel)
```
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE_NAME=Leads
```

## Development
```bash
npm install
npm run dev     # Start dev server at localhost:3000
npm run build   # Build for production
```

## Screen Dimensions
- Game Boy: 160x144 pixels
- Scaled 2x: 320x288 pixels
- All UI must fit within 288px height

## Important Notes
- All scenes must position elements within 288px height
- Use `getPalette()` from GBGraphics.js for consistent colors
- Use `drawDialogBox()` for Pokemon-style white boxes with black borders
- Quiz data is in `src/data/quizData.json`
- API keys are in `.env.local` (gitignored) - set in Vercel dashboard for production
- All graphics are procedural - no external image assets required
