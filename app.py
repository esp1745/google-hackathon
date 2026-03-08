import streamlit as st
import google.generativeai as genai
import os
import json
from datetime import datetime
import base64
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="Creative Storyteller AI",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
    }
    .section-header {
        font-size: 1.8rem;
        font-weight: 600;
        color: #667eea;
        margin-top: 2rem;
        margin-bottom: 1rem;
        border-bottom: 2px solid #667eea;
        padding-bottom: 0.5rem;
    }
    .subsection-header {
        font-size: 1.3rem;
        font-weight: 600;
        color: #764ba2;
        margin-top: 1.5rem;
        margin-bottom: 0.8rem;
    }
    .campaign-card {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 1.5rem;
        margin: 1rem 0;
        border-left: 4px solid #667eea;
    }
    .email-card {
        background: #fff;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 1.2rem;
        margin: 1rem 0;
    }
    .storyboard-scene {
        background: #f1f3f5;
        border-radius: 8px;
        padding: 1rem;
        margin: 0.8rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Initialize Gemini
def init_gemini():
    """Initialize Google Gemini with API key"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        st.error("GOOGLE_API_KEY not found in environment variables. Please set it to use this app.")
        st.stop()
    genai.configure(api_key=api_key)

def generate_campaign(industry, product, target_audience, goal, brand_voice):
    """Generate complete marketing campaign using Gemini"""
    
    prompt = f"""You are an expert creative director and marketing strategist. Generate a complete, professional marketing campaign based on the following brief:

BRIEF:
- Industry: {industry}
- Product/Offer: {product}
- Target Audience: {target_audience}
- Campaign Goal: {goal}
- Brand Voice: {brand_voice}

Generate a comprehensive campaign pack with the following sections. Return ONLY valid JSON with this exact structure:

{{
  "core_narrative": {{
    "positioning_statement": "A concise positioning statement (1-2 sentences)",
    "brand_story": "A compelling narrative that connects the product to the audience's needs (3-4 paragraphs)",
    "unique_value_proposition": "Clear UVP statement"
  }},
  "key_messages": [
    "Message 1: Primary benefit",
    "Message 2: Secondary benefit",
    "Message 3: Emotional appeal",
    "Message 4: Call to action theme"
  ],
  "social_media_posts": [
    {{
      "platform": "LinkedIn",
      "copy": "Professional post copy with relevant hashtags",
      "hook": "Attention-grabbing opening line"
    }},
    {{
      "platform": "Instagram",
      "copy": "Engaging visual-first copy with emojis and hashtags",
      "hook": "Scroll-stopping opening"
    }},
    {{
      "platform": "Twitter/X",
      "copy": "Concise, impactful tweet within character limit",
      "hook": "Thread starter"
    }},
    {{
      "platform": "Facebook",
      "copy": "Community-focused post with call-to-action",
      "hook": "Engaging question or statement"
    }}
  ],
  "email_sequence": [
    {{
      "email_number": 1,
      "subject_line": "Curiosity-building subject line",
      "preview_text": "Preview text that complements subject",
      "body": "Complete email body with personalization, value proposition, and soft CTA",
      "cta": "Primary call-to-action"
    }},
    {{
      "email_number": 2,
      "subject_line": "Value-focused subject line",
      "preview_text": "Preview text",
      "body": "Email body building on email 1, providing more value and social proof",
      "cta": "Call-to-action"
    }},
    {{
      "email_number": 3,
      "subject_line": "Urgency/FOMO subject line",
      "preview_text": "Preview text",
      "body": "Final email with stronger CTA, urgency, and clear next steps",
      "cta": "Strong call-to-action"
    }}
  ],
  "landing_page": {{
    "headline": "Compelling headline",
    "subheadline": "Supporting subheadline",
    "hero_copy": "Opening paragraph that hooks the visitor",
    "benefits_section": [
      "Benefit 1 with explanation",
      "Benefit 2 with explanation",
      "Benefit 3 with explanation"
    ],
    "social_proof": "Testimonial or trust-building statement",
    "cta_primary": "Main call-to-action text",
    "cta_secondary": "Secondary CTA or guarantee"
  }},
  "video_storyboard": {{
    "title": "Video title",
    "duration": "Estimated duration (e.g., '60 seconds')",
    "scenes": [
      {{
        "scene_number": 1,
        "duration": "5-8 seconds",
        "visual_description": "Detailed description of what viewers see",
        "voiceover": "Exact script for voiceover",
        "on_screen_text": "Any text overlays"
      }},
      {{
        "scene_number": 2,
        "duration": "8-10 seconds",
        "visual_description": "Visual description",
        "voiceover": "Voiceover script",
        "on_screen_text": "Text overlays"
      }},
      {{
        "scene_number": 3,
        "duration": "8-10 seconds",
        "visual_description": "Visual description",
        "voiceover": "Voiceover script",
        "on_screen_text": "Text overlays"
      }},
      {{
        "scene_number": 4,
        "duration": "8-10 seconds",
        "visual_description": "Visual description",
        "voiceover": "Voiceover script",
        "on_screen_text": "Text overlays"
      }},
      {{
        "scene_number": 5,
        "duration": "5-8 seconds",
        "visual_description": "Visual description with CTA",
        "voiceover": "Final voiceover with call-to-action",
        "on_screen_text": "CTA text"
      }}
    ],
    "full_voiceover_script": "Complete voiceover script combining all scenes, ready to be read naturally"
  }}
}}

REQUIREMENTS:
- Maintain the {brand_voice} tone throughout all content
- Ensure all messaging is cohesive and tells a consistent story
- Make content specific to {industry} and {target_audience}
- Focus on achieving the goal: {goal}
- Use persuasive copywriting techniques
- Include emotional triggers appropriate for the audience
- Ensure the video storyboard flows naturally and builds to a strong CTA
- DO NOT use placeholders like [Product Name], [Company Name], [Your Name], etc.
- Instead, refer to the product naturally as "our product", "this solution", "the platform", or describe it directly using the product details provided
- Write all content as if it's ready to use immediately without needing placeholder replacements
- For emails, use generic greetings like "Hi there" or "Hello" instead of [First Name]
- For testimonials, use realistic but generic attribution like "Sarah K., Engineering Manager" without company name placeholders

Return ONLY the JSON object, no additional text or markdown formatting."""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        elif response_text.startswith('```'):
            response_text = response_text[3:]
        
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        campaign_data = json.loads(response_text)
        return campaign_data
        
    except json.JSONDecodeError as e:
        st.error(f"Error parsing campaign data: {e}")
        st.error(f"Response received: {response.text[:500]}...")
        return None
    except Exception as e:
        st.error(f"Error generating campaign: {e}")
        return None

def generate_audio_from_script(script, voice_name="en-US-Studio-O"):
    """Generate audio from voiceover script using Gemini TTS"""
    try:
        # Configure TTS model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # For actual TTS, we'd use the Google Cloud Text-to-Speech API
        # Since Gemini doesn't have direct TTS in the genai library yet,
        # we'll integrate with Google Cloud TTS
        from google.cloud import texttospeech
        
        client = texttospeech.TextToSpeechClient()
        
        synthesis_input = texttospeech.SynthesisInput(text=script)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name=voice_name
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,
            pitch=0.0
        )
        
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        return response.audio_content
        
    except Exception as e:
        # Fallback: return None if TTS is not available
        st.warning(f"Text-to-Speech generation skipped: {e}")
        st.info("To enable audio generation, set up Google Cloud Text-to-Speech API credentials.")
        return None

def display_campaign(campaign):
    """Display the generated campaign in a beautiful layout"""
    
    # Core Narrative
    st.markdown('<div class="section-header">Core Narrative & Positioning</div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown('<div class="subsection-header">Positioning Statement</div>', unsafe_allow_html=True)
        st.markdown(f'<div class="campaign-card">{campaign["core_narrative"]["positioning_statement"]}</div>', unsafe_allow_html=True)
        
        st.markdown('<div class="subsection-header">Unique Value Proposition</div>', unsafe_allow_html=True)
        st.markdown(f'<div class="campaign-card">{campaign["core_narrative"]["unique_value_proposition"]}</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="subsection-header">Brand Story</div>', unsafe_allow_html=True)
        st.markdown(f'<div class="campaign-card">{campaign["core_narrative"]["brand_story"]}</div>', unsafe_allow_html=True)
    
    # Key Messages
    st.markdown('<div class="section-header">Key Messages</div>', unsafe_allow_html=True)
    for i, message in enumerate(campaign["key_messages"], 1):
        st.markdown(f"**{i}.** {message}")
    
    # Social Media Posts
    st.markdown('<div class="section-header">Social Media Posts</div>', unsafe_allow_html=True)
    
    cols = st.columns(2)
    for idx, post in enumerate(campaign["social_media_posts"]):
        with cols[idx % 2]:
            with st.expander(f"{post['platform']}", expanded=False):
                st.markdown(f"**Hook:** {post['hook']}")
                st.markdown("---")
                st.markdown(post['copy'])
    
    # Email Sequence
    st.markdown('<div class="section-header">Email Sequence</div>', unsafe_allow_html=True)
    
    for email in campaign["email_sequence"]:
        with st.expander(f"Email {email['email_number']}: {email['subject_line']}", expanded=False):
            st.markdown(f"**Subject:** {email['subject_line']}")
            st.markdown(f"**Preview Text:** {email['preview_text']}")
            st.markdown("---")
            st.markdown(email['body'])
            st.markdown("---")
            st.button(email['cta'], key=f"cta_email_{email['email_number']}", type="primary")
    
    # Landing Page
    st.markdown('<div class="section-header">Landing Page Copy</div>', unsafe_allow_html=True)
    
    lp = campaign["landing_page"]
    st.markdown(f"### {lp['headline']}")
    st.markdown(f"#### {lp['subheadline']}")
    st.markdown(lp['hero_copy'])
    
    st.markdown("**Benefits:**")
    for benefit in lp['benefits_section']:
        st.markdown(f"- {benefit}")
    
    st.markdown(f"**Social Proof:** _{lp['social_proof']}_")
    
    col1, col2 = st.columns(2)
    with col1:
        st.button(lp['cta_primary'], type="primary", use_container_width=True, key="lp_primary")
    with col2:
        st.button(lp['cta_secondary'], use_container_width=True, key="lp_secondary")
    
    # Video Storyboard
    st.markdown('<div class="section-header">Promo Video Storyboard</div>', unsafe_allow_html=True)
    
    video = campaign["video_storyboard"]
    st.markdown(f"**Title:** {video['title']}")
    st.markdown(f"**Duration:** {video['duration']}")
    
    st.markdown("---")
    
    for scene in video['scenes']:
        with st.container():
            st.markdown(f'<div class="storyboard-scene">', unsafe_allow_html=True)
            col1, col2 = st.columns([1, 3])
            
            with col1:
                st.markdown(f"**Scene {scene['scene_number']}**")
                st.caption(scene['duration'])
            
            with col2:
                st.markdown(f"**Visual:** {scene['visual_description']}")
                st.markdown(f"**Voiceover:** _{scene['voiceover']}_")
                if scene['on_screen_text']:
                    st.markdown(f"**On-screen text:** `{scene['on_screen_text']}`")
            
            st.markdown('</div>', unsafe_allow_html=True)
    
    # Full Voiceover Script with Audio
    st.markdown('<div class="section-header">Full Voiceover Script</div>', unsafe_allow_html=True)
    
    st.markdown(f'<div class="campaign-card">{video["full_voiceover_script"]}</div>', unsafe_allow_html=True)
    
    # Generate audio
    with st.spinner("Generating audio from voiceover script..."):
        audio_data = generate_audio_from_script(video["full_voiceover_script"])
    
    if audio_data:
        st.success("Audio generated successfully!")
        st.audio(audio_data, format='audio/mp3')
        
        # Provide download button
        st.download_button(
            label="Download Voiceover Audio",
            data=audio_data,
            file_name=f"voiceover_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3",
            mime="audio/mp3"
        )

def main():
    """Main application"""
    
    # Initialize Gemini
    init_gemini()
    
    # Header
    st.markdown('<h1 class="main-header">Creative Storyteller AI</h1>', unsafe_allow_html=True)
    st.markdown("**Transform your business brief into a complete, on-brand marketing campaign in minutes.**")
    
    st.markdown("---")
    
    # Sidebar for inputs
    with st.sidebar:
        st.markdown("## Campaign Brief")
        st.markdown("Fill in the details below to generate your campaign.")
        
        industry = st.text_input(
            "Industry",
            placeholder="e.g., SaaS, E-commerce, Healthcare, Finance",
            help="What industry does your business operate in?"
        )
        
        product = st.text_area(
            "Product/Offer",
            placeholder="e.g., AI-powered project management tool for remote teams",
            help="Describe what you're marketing"
        )
        
        target_audience = st.text_area(
            "Target Audience",
            placeholder="e.g., Remote team managers at tech startups, ages 30-45",
            help="Who are you trying to reach?"
        )
        
        goal = st.text_input(
            "Campaign Goal",
            placeholder="e.g., Drive sign-ups, Increase brand awareness, Generate leads",
            help="What do you want to achieve?"
        )
        
        brand_voice = st.selectbox(
            "Brand Voice",
            [
                "Professional & Authoritative",
                "Friendly & Conversational",
                "Bold & Edgy",
                "Inspirational & Uplifting",
                "Witty & Humorous",
                "Empathetic & Caring",
                "Innovative & Forward-thinking"
            ],
            help="What tone should your campaign use?"
        )
        
        st.markdown("---")
        
        generate_button = st.button("Generate Campaign", type="primary", use_container_width=True)
    
    # Main content area
    if generate_button:
        if not all([industry, product, target_audience, goal, brand_voice]):
            st.error("Please fill in all fields to generate your campaign.")
        else:
            with st.spinner("Creating your marketing campaign... This may take 30-60 seconds."):
                campaign = generate_campaign(industry, product, target_audience, goal, brand_voice)
            
            if campaign:
                st.success("Your campaign is ready!")
                
                # Add download option for the full campaign
                campaign_json = json.dumps(campaign, indent=2)
                st.download_button(
                    label="Download Complete Campaign (JSON)",
                    data=campaign_json,
                    file_name=f"campaign_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                    mime="application/json"
                )
                
                st.markdown("---")
                
                # Display the campaign
                display_campaign(campaign)
                
                # Store in session state for persistence
                st.session_state['last_campaign'] = campaign
    
    elif 'last_campaign' in st.session_state:
        st.info("Showing your last generated campaign. Use the sidebar to create a new one.")
        
        campaign_json = json.dumps(st.session_state['last_campaign'], indent=2)
        st.download_button(
            label="Download Complete Campaign (JSON)",
            data=campaign_json,
            file_name=f"campaign_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            mime="application/json"
        )
        
        st.markdown("---")
        display_campaign(st.session_state['last_campaign'])
    
    else:
        # Welcome screen
        st.markdown("""
        ## Welcome to Creative Storyteller AI!
        
        This tool helps you generate complete marketing campaigns in minutes. Here's what you'll get:
        
        ### Your Campaign Pack Includes:
        
        - **Core Narrative & Positioning**: Brand story, positioning statement, and unique value proposition
        - **Key Messages**: 4 core messages aligned with your goals
        - **Social Media Posts**: Ready-to-post content for LinkedIn, Instagram, Twitter/X, and Facebook
        - **Email Sequence**: 3 strategically crafted emails to nurture your audience
        - **Landing Page Copy**: Complete page copy with headlines, benefits, and CTAs
        - **Video Storyboard**: Shot-by-shot breakdown with voiceover script
        - **Bonus**: AI-generated voiceover audio you can download and use!
        
        ### How to Get Started:
        
        1. Fill in the campaign brief in the sidebar (left)
        2. Click "Generate Campaign"
        3. Wait 30-60 seconds while AI creates your content
        4. Review, download, and customize as needed
        
        ---
        
        **Ready to create amazing marketing content?** Use the sidebar to begin!
        """)

if __name__ == "__main__":
    main()
