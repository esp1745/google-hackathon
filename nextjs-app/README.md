# Creative Storyteller AI - Next.js App

A modern web application that transforms a short business brief into a complete, on-brand marketing campaign using Google's Gemini AI, with **premium Google Cloud Text-to-Speech** for professional voiceovers.

## Features

- Generate comprehensive marketing campaigns including:
  - Core narrative and positioning
  - Key messages
  - Social media posts (LinkedIn, Twitter, Instagram, Facebook)
  - Email sequence (3 emails)
  - Landing page copy
  - Video storyboard with full voiceover script
- **Premium Text-to-Speech** powered by Google Cloud Neural2 & Studio voices
  - 10+ professional AI voices (US, UK, Australian accents)
  - Adjustable speed (0.25x - 4x), pitch (-20 to +20), and volume
  - Play individual sections or full scripts
  - High-quality natural-sounding audio
- Modern, responsive UI built with Next.js and Tailwind CSS
- Download campaigns as JSON
- Fast generation powered by Gemini 2.5 Flash

## Setup

### Prerequisites

- Node.js 18.0 or higher
- Google AI Studio API key (get one at https://makersuite.google.com/app/apikey)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with your API key:
```
GOOGLE_API_KEY=your_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Text-to-Speech Setup

The app includes **premium Google Cloud Text-to-Speech** with Neural2 and Studio voices for professional audio playback.

### Quick Setup

The text-to-speech uses the same `GOOGLE_API_KEY` from your `.env.local` file. No additional setup required!

**Note:** You may need to enable the Cloud Text-to-Speech API in your Google Cloud Console:
1. Go to https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
2. Select your project (or create one)
3. Click "Enable"

The API includes a free tier with generous limits for testing.

### Features

- **10+ Professional Voices**: Neural2 and Studio quality voices in US, UK, and Australian accents
- **Customizable**: Adjust speed (0.25x-4x), pitch (-20 to +20), and volume
- **Play Anywhere**: Individual sections or full scripts
- **High Quality**: Natural-sounding AI-generated speech

## Usage

1. Fill in the campaign brief form:
   - Industry (e.g., "SaaS", "E-commerce")
   - Product/Service description
   - Target Audience
   - Campaign Goal
   - Brand Voice (e.g., "Professional", "Playful", "Inspirational")

2. Click "Generate Campaign"

3. Review the generated content across all sections

4. Download the campaign as JSON for future reference

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub

2. Import the project in Vercel

3. Add the `GOOGLE_API_KEY` environment variable in Vercel project settings

4. Deploy

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Project Structure

```
nextjs-app/
├── pages/
│   ├── api/
│   │   └── generate-campaign.js    # API route for Gemini integration
│   ├── _app.js                     # App wrapper
│   └── index.js                    # Main page
├── components/
│   └── CampaignDisplay.js          # Campaign rendering component
├── styles/
│   └── globals.css                 # Global styles with Tailwind
├── .env.local                      # Environment variables (gitignored)
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind configuration
└── package.json                    # Dependencies
```

## API Usage

The app uses Google's Gemini 2.5 Flash model via the `@google/generative-ai` package. The free tier includes generous limits for personal projects.

## Troubleshooting

### API Key Issues

If you see "API key not configured", make sure:
- `.env.local` file exists in the root directory
- The file contains `GOOGLE_API_KEY=your_key`
- You've restarted the dev server after adding the key

### Model Quota Exceeded

Free tier quota limits:
- Switch to `gemini-2.5-flash` if you hit quota limits with `gemini-2.5-pro`
- The app is configured to use `gemini-2.5-flash` by default

### Build Errors

If you encounter build errors:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## License

MIT
