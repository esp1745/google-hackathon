#!/bin/bash

# Narrative Engine - Quick Deploy to Google Cloud Run
# Run this script to deploy your app in one command

set -e

echo "🚀 Narrative Engine - Google Cloud Run Deployment"
echo "=================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI not found. Install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "⚠️  Not logged in to gcloud. Logging in now..."
    gcloud auth login
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "⚠️  No project set. Please set your project:"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📦 Project: $PROJECT_ID"
echo ""

# Get API key
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️  GOOGLE_API_KEY environment variable not set."
    echo "   Get your key from: https://aistudio.google.com/app/apikey"
    echo ""
    read -p "Enter your Google API Key: " GOOGLE_API_KEY
fi

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable \
    run.googleapis.com \
    texttospeech.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    --project=$PROJECT_ID

echo "✅ APIs enabled"
echo ""

# Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
echo "   Region: us-central1"
echo "   Service: narrative-engine"
echo ""

gcloud run deploy narrative-engine \
    --source ./nextjs-app \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars GOOGLE_API_KEY=$GOOGLE_API_KEY \
    --memory 2Gi \
    --timeout 300 \
    --port 3000 \
    --project=$PROJECT_ID

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is live at:"
gcloud run services describe narrative-engine --region us-central1 --format="value(status.url)" --project=$PROJECT_ID
echo ""
echo "📊 View logs:"
echo "   gcloud run logs read narrative-engine --region us-central1 --project=$PROJECT_ID"
echo ""
echo "🎉 Ready for hackathon demo!"
