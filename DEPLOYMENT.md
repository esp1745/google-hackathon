# Google Cloud Deployment Guide

This app is built to run on **Google Cloud Platform** using **Google Gemini AI SDK** and **Google Cloud Text-to-Speech API**.

## Prerequisites

- Google Cloud Project with billing enabled
- Google Cloud CLI installed (`gcloud`)
- Docker installed (for Cloud Run deployment)

## Required APIs

Enable these APIs in your Google Cloud Console:

```bash
gcloud services enable \
  run.googleapis.com \
  generativelanguage.googleapis.com \
  texttospeech.googleapis.com \
  artifactregistry.googleapis.com
```

## Environment Variables

Create a `.env.local` file:

```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

## Deployment Options

### Option 1: Cloud Run (Recommended)

1. **Build & Deploy:**

```bash
cd nextjs-app

# Build for production
npm run build

# Deploy to Cloud Run
gcloud run deploy narrative-engine \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY=$GOOGLE_API_KEY \
  --memory 2Gi \
  --timeout 300
```

2. **Your app will be live at:** `https://narrative-engine-[hash].run.app`

### Option 2: Firebase Hosting + Cloud Functions

1. **Install Firebase CLI:**

```bash
npm install -g firebase-tools
firebase login
```

2. **Initialize Firebase:**

```bash
firebase init hosting
# Choose your project
# Set public directory to: nextjs-app/out
# Configure as single-page app: Yes
```

3. **Deploy:**

```bash
npm run build
firebase deploy
```

## Verify Google SDK Usage

✅ **This app uses official Google SDKs:**
- `@google/generative-ai` - For Gemini AI (text generation)
- `@google-cloud/text-to-speech` - For Neural2 voices (audio)
- Next.js API routes hosted on Google Cloud Run

## Multimodal Output

✅ **This app provides multimodal output:**
1. **Text**: Campaign narratives, messages, emails, social posts
2. **Audio**: Google Cloud TTS Neural2 voices for voiceovers
3. **Images**: AI-generated scene visuals for storyboard (SVG-based)

This satisfies the hackathon requirement of **not being text-only** - we output text + audio + images.

## Production Checklist

- [ ] Environment variables set in Cloud Run/Firebase
- [ ] All Google APIs enabled
- [ ] CORS configured if using custom domain
- [ ] Error logging enabled (Cloud Logging)
- [ ] Budget alerts configured
- [ ] Application deployed and accessible

## Monitoring

View logs:
```bash
gcloud run logs read narrative-engine --project YOUR_PROJECT_ID
```

## Cost Optimization

- Gemini 1.5 Flash: ~$0.075 per 1M input tokens
- Cloud TTS Neural2: ~$16 per 1M characters
- Cloud Run: Pay per request, auto-scales to zero

Estimated cost for hackathon demo: **< $5/day** with moderate usage.
