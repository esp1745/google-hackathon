# Vertex AI Setup Guide (Veo 3.1 + Imagen 3)

This guide explains how to enable **real AI-generated videos and images** using Google's Vertex AI platform.

## 🎯 What You Get

### Without Vertex AI (Default)
- ✅ Text campaigns via Gemini 2.5 Flash
- ✅ TTS audio via Google Cloud Text-to-Speech
- ✅ SVG-based product images (programmatically generated)
- ✅ SVG-based video animations

### With Vertex AI (Enhanced) ⭐
- ✅ All default features PLUS:
- ✅ **Veo 3.1 real video generation** (1080p MP4s, 24fps, cinematic quality)
- ✅ **Imagen 3 photorealistic images** (professional product photography)
- ✅ Automatic fallback to SVG if Vertex AI unavailable

## 📋 Prerequisites

1. Google Cloud account
2. Active billing enabled (Vertex AI requires billing)
3. Service account with proper permissions

## 🚀 Setup Steps

### 1. Enable Vertex AI APIs

```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable compute.googleapis.com
```

### 2. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create vertex-ai-user \
  --display-name="Vertex AI Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:vertex-ai-user@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Download JSON key
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=vertex-ai-user@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 3. Configure Environment Variables

Update your `.env` file:

```bash
# Your Google API key (for Gemini)
GOOGLE_API_KEY=AIza...

# Vertex AI Project ID
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Path to service account key
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/vertex-ai-key.json
```

### 4. Install Dependencies

```bash
cd nextjs-app
npm install google-auth-library
```

### 5. Test the Integration

1. Start the dev server: `npm run dev`
2. Generate a campaign
3. Click **"Generate Product Images"** in the Landing Page tab
4. Click **"Play"** in the Video Storyboard tab
5. Check console logs for Vertex AI status:
   - ✅ "Using Veo 3.1 for video generation"
   - ✅ "Using Imagen 3 for images"
   - ⚠️ "Falling back to SVG" (if Vertex AI unavailable)

## 🔍 Troubleshooting

### "Project ID not found"
- Ensure `GOOGLE_CLOUD_PROJECT_ID` is set in `.env`
- Verify project exists: `gcloud projects list`

### "Permission denied"
- Check service account has `roles/aiplatform.user`
- Verify credentials file path is absolute
- Restart dev server after env changes

### "Billing not enabled"
- Enable billing in Google Cloud Console
- Vertex AI requires an active billing account

### "Model not available"
- Veo 3.1 may be in limited preview
- Check regional availability (currently `us-central1`)
- Fallback to SVG is automatic

## 💰 Pricing

**Veo 3.1 (Video Generation)**:
- ~$0.10-0.20 per second of video
- 5-second scene = ~$0.50-1.00
- Full campaign (5 scenes) = ~$2.50-5.00

**Imagen 3 (Image Generation)**:
- ~$0.02-0.05 per image
- 3 product images = ~$0.06-0.15
- 5 scene thumbnails = ~$0.10-0.25

**Total per campaign**: ~$2.66-5.40

**Note**: Prices are approximate and may vary by region. Check [Google Cloud Pricing](https://cloud.google.com/vertex-ai/pricing) for current rates.

## 🔐 Security Best Practices

1. **Never commit credentials**:
   ```bash
   # Add to .gitignore
   echo "*.json" >> .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use environment-specific keys**:
   - Development: Local service account
   - Production: Cloud Run/Firebase with Workload Identity

3. **Rotate keys regularly**:
   ```bash
   gcloud iam service-accounts keys list \
     --iam-account=vertex-ai-user@PROJECT_ID.iam.gserviceaccount.com
   ```

## 📊 Monitoring Usage

Track API usage in Cloud Console:
1. Go to [Vertex AI Dashboard](https://console.cloud.google.com/vertex-ai)
2. Navigate to "Usage and billing"
3. Monitor:
   - API calls per day
   - Cost per model
   - Error rates

## 🎨 Customizing Prompts

### Video Prompts (Veo 3.1)

Edit `/nextjs-app/components/VideoPlayer.js`:

```javascript
const prompt = `${scene.visual_description}, cinematic 4K commercial, professional lighting, smooth camera movement, ${scene.duration}`;
```

### Image Prompts (Imagen 3)

Edit `/nextjs-app/components/CampaignDisplay.js`:

```javascript
const prompt = `Professional product photography of ${product}, studio lighting, commercial quality, ${industry} aesthetic`;
```

## 🚀 Next Steps

1. ✅ Complete setup steps above
2. ✅ Test with sample campaign
3. ✅ Monitor costs in first week
4. ✅ Deploy to production (Cloud Run/Firebase)
5. ✅ Set up budget alerts in Cloud Console

## 📚 Resources

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Veo 3.1 Model Card](https://cloud.google.com/vertex-ai/docs/generative-ai/video/overview)
- [Imagen 3 Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)

---

**Need Help?** 
- GitHub Issues: https://github.com/esp1745/google-hackathon/issues
- Google Cloud Support: https://cloud.google.com/support
