# Quick Start Guide

Get your Creative Storyteller AI up and running in 5 minutes!

## Prerequisites

- Python 3.8+ installed
- Google account (for API key)

## 3-Step Setup

### Step 1: Get Your Google API Key (2 minutes)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### Step 2: Run Setup (2 minutes)

**On Mac/Linux:**
```bash
./setup.sh
```

**On Windows:**
```cmd
setup.bat
```

### Step 3: Add Your API Key (1 minute)

Open the `.env` file and replace `your_google_api_key_here` with your actual key:

```
GOOGLE_API_KEY=AIzaSy...your_actual_key_here
```

## Launch the App

**Activate virtual environment:**

Mac/Linux:
```bash
source venv/bin/activate
```

Windows:
```cmd
venv\Scripts\activate
```

**Start the app:**
```bash
streamlit run app.py
```

Your browser will open automatically at `http://localhost:8501`

## Create Your First Campaign

1. **Fill in the sidebar:**
   - Industry: `SaaS`
   - Product: `AI-powered project management tool`
   - Target Audience: `Remote team managers at tech startups`
   - Goal: `Drive free trial sign-ups`
   - Brand Voice: `Professional & Authoritative`

2. **Click "Generate Campaign"**

3. **Wait 30-60 seconds**

4. **Review your complete campaign!**

## Enable Audio (Optional)

To generate voiceover audio:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable "Cloud Text-to-Speech API"
4. Create a service account → Download JSON key
5. Add to `.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-key.json
   ```

**Note:** The app works perfectly without audio - it's just a bonus feature!

## Troubleshooting

**"GOOGLE_API_KEY not found"**
- Check that `.env` file exists in the project folder
- Make sure the key is on the right line with no extra spaces
- Restart the Streamlit app

**"Module not found" error**
- Make sure you activated the virtual environment
- Run `pip install -r requirements.txt` again

**Generation takes a long time**
- First generation may take 45-60 seconds
- This is normal - Gemini is creating comprehensive content!

## Pro Tips

- Be specific in your brief for better results
- Try different brand voices to see what fits best
- Download campaigns as JSON to save your favorites
- Regenerate if you want different creative directions

## That's It!

You're ready to create amazing marketing campaigns with AI!

Need help? Check the full [README.md](README.md) for detailed documentation.
