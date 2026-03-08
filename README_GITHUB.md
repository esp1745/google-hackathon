# 🚀 Creative Storyteller AI - Google AI Hackathon

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-blue)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-TTS-red)
![License](https://img.shields.io/badge/license-MIT-green)

An AI-powered marketing campaign generator that creates complete, multimodal marketing campaigns using Google's Gemini AI, Text-to-Speech, and modern web technologies.

## ✨ Features

### 🎯 Complete Campaign Generation
- **Core Narrative**: Brand story, positioning statements, and unique value propositions
- **Key Messages**: 4 compelling brand messages
- **Social Media Posts**: LinkedIn, Instagram, Twitter/X, and Facebook content with hooks
- **Email Sequences**: 3-email campaign with subject lines, preview text, and CTAs
- **Landing Pages**: Complete page structure with headlines, benefits, and social proof
- **Video Storyboards**: 5-scene video scripts with voiceovers and on-screen text

### 🎬 Multimodal Output
- **Text-to-Speech Audio**: Google Cloud Neural2 voices for all content
- **Product Images**: AI-styled product showcase (Modern, Minimal, Bold)
- **Scene Images**: Auto-generated visual thumbnails for video scenes
- **Video Player**: Interactive player with synchronized audio playback

### 🎨 Professional UI
- Linear-inspired dark mode design
- Electric indigo color scheme (#6366F1)
- Smooth animations and transitions
- Responsive split-screen layout
- Tab-based content organization

### 🔊 Video Features
- Sequential scene playback with voiceover
- Play, pause, stop controls
- Mute/unmute functionality
- Progress tracking
- Scene counter
- Export video script
- Share to social media

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.1.0, React 18.3.1, Tailwind CSS 3.4.1
- **AI/ML**: Google Gemini 2.5 Flash, Google Cloud Text-to-Speech
- **Icons**: React Icons 5.6.0
- **Deployment**: Docker, Google Cloud Run ready

## 📋 Prerequisites

- Node.js 18.17 or higher
- Google Cloud API Key with:
  - Gemini API access
  - Text-to-Speech API enabled

## 🚀 Quick Start

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/esp1745/google-hackathon.git
cd google-hackathon
\`\`\`

### 2. Install Dependencies
\`\`\`bash
cd nextjs-app
npm install
\`\`\`

### 3. Set Up Environment Variables
\`\`\`bash
# Create .env.local file
cp ../.env.example .env.local

# Add your Google API key
echo "GOOGLE_API_KEY=your_api_key_here" > .env.local
\`\`\`

Get your API key from: https://aistudio.google.com/app/apikey

### 4. Enable Google Cloud Text-to-Speech API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Text-to-Speech API
3. Wait 1-2 minutes for activation

### 5. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Fill out the Campaign Form**:
   - Industry (e.g., "SaaS", "Gaming", "E-commerce")
   - Product name
   - Target audience
   - Campaign goal (Awareness, Conversion, Engagement)
   - Brand voice

2. **Generate Campaign**: Click "Generate Campaign" (instant!)

3. **Explore Tabs**:
   - **Core Narrative**: Brand story and positioning
   - **Key Messages**: Core messaging pillars
   - **Social Media**: Platform-specific posts
   - **Email Sequence**: Complete email campaign
   - **Landing Page**: Page structure with optional product images
   - **Video Storyboard**: Interactive video player with audio

4. **Video Player**:
   - Click ▶️ Play to generate audio and start playback
   - Use controls to pause, stop, or mute
   - Click Share to post to social media
   - Export script for production use

## 🎥 Video Player Features

- **Audio Generation**: Automatic TTS for all scenes
- **Sequential Playback**: Synced audio and visuals
- **Controls**: Play, Pause, Stop, Mute
- **Progress Bar**: Real-time scene progress
- **Export**: Download video script
- **Share**: Native Web Share API integration

## 🐳 Deployment

### Docker
\`\`\`bash
# Build image
docker build -t creative-storyteller-ai .

# Run container
docker run -p 3000:3000 -e GOOGLE_API_KEY=your_key creative-storyteller-ai
\`\`\`

### Google Cloud Run
\`\`\`bash
# Automated deployment
chmod +x deploy.sh
./deploy.sh
\`\`\`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📁 Project Structure

\`\`\`
creative-storyteller-ai/
├── nextjs-app/
│   ├── components/
│   │   ├── CampaignDisplay.js      # Main content display
│   │   ├── VideoPlayer.js          # Video playback component
│   │   ├── VoiceSettings.js        # TTS configuration
│   │   └── ParticleBackground.js   # Animated background
│   ├── pages/
│   │   ├── index.js                # Main application page
│   │   └── api/
│   │       ├── generate-campaign.js    # Gemini campaign generation
│   │       ├── text-to-speech.js       # Google TTS integration
│   │       ├── generate-product-image.js
│   │       ├── generate-scene-image.js
│   │       └── generate-video.js
│   ├── styles/
│   │   └── globals.css             # Tailwind + custom styles
│   └── package.json
├── DEPLOYMENT.md
├── HACKATHON_CHECKLIST.md
├── Dockerfile
└── README.md
\`\`\`

## 🎯 Hackathon Compliance

✅ **Google AI Integration**:
- Gemini 2.5 Flash for text generation
- Google Cloud Text-to-Speech for audio

✅ **Multimodal Output**:
- Text campaigns
- AI-generated images
- Neural voice audio
- Video storyboards

✅ **Production Ready**:
- Docker containerized
- Google Cloud Run deployment
- Environment-based configuration

See [HACKATHON_CHECKLIST.md](HACKATHON_CHECKLIST.md) for details.

## 🔑 API Endpoints

- \`POST /api/generate-campaign\` - Generate complete campaign
- \`POST /api/text-to-speech\` - Convert text to audio
- \`POST /api/generate-product-image\` - Create product visuals
- \`POST /api/generate-scene-image\` - Generate scene thumbnails
- \`POST /api/generate-video\` - Create video preview

## 🎨 Design System

- **Primary Color**: Electric Indigo (#6366F1)
- **Background**: Charcoal (#0a0a0a)
- **Typography**: Inter (sans-serif), Georgia (serif)
- **Components**: Glass morphism, subtle animations
- **Layout**: Split-screen (420px sidebar + scrollable canvas)

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Google Gemini AI
- Google Cloud Text-to-Speech
- Next.js Team
- Tailwind CSS
- React Icons

## 👤 Author

**Esparance**
- GitHub: [@esp1745](https://github.com/esp1745)
- Project: [google-hackathon](https://github.com/esp1745/google-hackathon)

## 🐛 Known Issues

- Audio may require user interaction on some browsers (autoplay policy)
- Share API fallback to clipboard on desktop
- Product image generation is optional/on-demand

## 🚧 Future Enhancements

- Real AI image generation (Imagen 3)
- Actual video generation (Veo)
- Multi-language support
- Campaign templates
- Export to PDF/PPT
- Collaboration features

---

Built with ❤️ for the Google AI Hackathon 2026
