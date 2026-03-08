# Narrative Engine - Multimodal AI Marketing Campaign Generator

**🏆 Built for Google AI Hackathon | Deployed on Google Cloud**

Transform your business brief into a complete marketing campaign with **multimodal output** - text, images, and audio - powered by Google Gemini AI and Google Cloud APIs.

## 🎯 Multimodal Output (Text + Images + Audio)

This app goes beyond text-only generation by providing:

### **1. Text Content** (via Gemini 1.5 Flash)
- Core narrative, positioning, brand story
- 4 strategic key messages
- Social media posts (LinkedIn, Instagram, Twitter/X, Facebook)
- 3-email nurture sequence
- Landing page copy with CTAs

### **2. Visual Content** (AI-Generated Images)
- **Scene-by-scene storyboard visuals** for video campaigns
- Dynamically generated images based on scene descriptions
- 16:9 cinematic format thumbnails
- Industry-specific visual styling

### **3. Audio Content** (Google Cloud Neural2 TTS)
- **Premium neural voices** for all voiceover scripts
- Play/pause/stop controls for each scene
- Full campaign voiceover playback
- Downloadable audio files
- 10 professional voice options with pitch/rate/volume controls

## 🚀 Google Cloud Integration

### **Google SDKs Used:**
- ✅ `@google/generative-ai` - Gemini AI for campaign generation
- ✅ Google Cloud Text-to-Speech API - Neural2 voices
- ✅ Deployed on **Google Cloud Run** or **Firebase Hosting**

### **Why It's Not Text-Only:**
We generate **interleaved multimodal output** - each storyboard scene includes:
- Visual description (text)
- Generated scene image (image)
- Voiceover script (text)
- Playable audio (audio)

This weaves text, images, and audio together into a cohesive campaign package.

## Features

- **Powered by Google Gemini 1.5 Pro**: Leverages advanced AI for creative, contextual content generation
- **Consistent Brand Voice**: All content maintains your chosen tone throughout
- **Cohesive Messaging**: Every element tells the same story and works together
- **Industry-Specific**: Tailored to your industry, audience, and goals
- **Audio Generation**: Optional TTS integration converts voiceover scripts to audio
- **Beautiful UI**: Modern, gradient-styled Streamlit interface
- **Export Options**: Download complete campaign as JSON or individual audio files

## Prerequisites

- Python 3.8 or higher
- Google API Key (for Gemini)
- Google Cloud Service Account (optional, for Text-to-Speech)

## Installation

1. **Clone or download this project**

```bash
cd creative-storyteller-ai
```

2. **Create a virtual environment** (recommended)

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Set up environment variables**

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Google API key:

```
GOOGLE_API_KEY=your_actual_api_key_here
```

### Getting Your Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into your `.env` file

### Setting Up Text-to-Speech (Optional)

For audio generation:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Cloud Text-to-Speech API"
4. Create a service account and download the JSON key file
5. Add to your `.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account-key.json
   ```

**Note**: TTS is optional. The app will work without it but won't generate audio.

## 🎮 Usage

1. **Start the application**

```bash
streamlit run app.py
```

2. **Open your browser**

The app will automatically open at `http://localhost:8501`

3. **Fill in the campaign brief**

Use the sidebar to enter:
- **Industry**: Your business sector (e.g., SaaS, E-commerce, Healthcare)
- **Product/Offer**: What you're marketing
- **Target Audience**: Who you're trying to reach
- **Campaign Goal**: What you want to achieve
- **Brand Voice**: Tone for all content (Professional, Friendly, Bold, etc.)

4. **Generate your campaign**

Click "Generate Campaign" and wait 30-60 seconds

5. **Review and download**

- Review all generated content
- Listen to the AI-generated voiceover
- Download the complete campaign as JSON
- Download the audio file for use in videos

## Project Structure

```
creative-storyteller-ai/
│
├── app.py                  # Main Streamlit application
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variable template
├── .env                   # Your actual API keys (not in git)
└── README.md              # This file
```

## Campaign Components Explained

### Core Narrative & Positioning
The foundation of your campaign - includes a positioning statement that clearly defines your market position, a compelling brand story that connects emotionally with your audience, and a unique value proposition that sets you apart.

### Key Messages
Four strategic messages that form the pillars of your campaign communications, covering primary benefits, secondary benefits, emotional appeals, and call-to-action themes.

### Social Media Posts
Platform-optimized content:
- **LinkedIn**: Professional, value-focused
- **Instagram**: Visual-first, emoji-rich
- **Twitter/X**: Concise, impactful
- **Facebook**: Community-driven, conversational

### Email Sequence
Three-part nurture sequence:
1. **Email 1**: Curiosity-building introduction
2. **Email 2**: Value delivery and social proof
3. **Email 3**: Strong CTA with urgency

### Landing Page Copy
Complete page structure ready to implement, including hero section, benefits breakdown, social proof elements, and primary/secondary CTAs.

### Video Storyboard
5-scene video breakdown with:
- Visual descriptions for each shot
- Exact voiceover scripts
- On-screen text suggestions
- Timing recommendations
- Complete combined script for TTS

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and private
- Rotate keys if they're accidentally exposed
- Use service accounts with minimal permissions for production

## Troubleshooting

### "GOOGLE_API_KEY not found"
- Make sure you created a `.env` file in the project root
- Verify the API key is correctly formatted
- Try restarting the Streamlit app

### "Error parsing campaign data"
- This usually means Gemini returned non-JSON content
- Try running the generation again
- Check your API key has sufficient quota

### Audio generation fails
- TTS requires additional Google Cloud setup
- The app will continue working without audio
- Follow the TTS setup instructions above

### Slow generation
- First-time generation may take 45-60 seconds
- Subsequent generations should be faster
- Complex briefs may take longer to process

## Tips for Best Results

1. **Be Specific**: The more detailed your brief, the better the output
2. **Clear Goals**: Define what success looks like for your campaign
3. **Know Your Audience**: Provide demographic and psychographic details
4. **Choose the Right Voice**: Select a brand voice that matches your company culture
5. **Iterate**: Generate multiple versions and combine the best parts

## Limitations

- Requires internet connection for API calls
- Content requires human review and editing
- Audio generation requires separate GCP setup
- Rate limits apply based on your Google API tier

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions, issues, and feature requests are welcome!

## Support

If you encounter any issues or have questions:
- Check the Troubleshooting section above
- Review Google Gemini API documentation
- Open an issue on the project repository

## Acknowledgments

- Powered by Google Gemini AI
- Built with Streamlit
- Text-to-Speech via Google Cloud

---

**Ready to create amazing marketing campaigns?** Get started now!
