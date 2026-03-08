import { useState, useEffect } from 'react';
import { FaVolumeUp, FaBullseye, FaComments, FaInstagram, FaLinkedin, FaTwitter, FaFacebook, 
         FaEnvelope, FaGlobe, FaFilm, FaPlay, FaPause, FaStop, FaCheckCircle, FaImage } from 'react-icons/fa';
import VoiceSettings from './VoiceSettings';
import VideoPlayer from './VideoPlayer';

export default function CampaignDisplay({ campaign }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [speaking, setSpeaking] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [activeTab, setActiveTab] = useState('narrative');
  const [sceneImages, setSceneImages] = useState({});
  const [loadingImages, setLoadingImages] = useState(false);
  const [productImages, setProductImages] = useState({ modern: null, minimal: null, bold: null });
  const [loadingProductImages, setLoadingProductImages] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoFrames, setVideoFrames] = useState([]);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'en-US-Neural2-F',
    languageCode: 'en-US',
    rate: 1.0,
    pitch: 0,
    volume: 1
  });

  const tabs = [
    { id: 'narrative', label: 'Core Narrative', icon: FaBullseye },
    { id: 'messages', label: 'Key Messages', icon: FaComments },
    { id: 'social', label: 'Social Media', icon: FaTwitter },
    { id: 'email', label: 'Email Sequence', icon: FaEnvelope },
    { id: 'landing', label: 'Landing Page', icon: FaGlobe },
    { id: 'video', label: 'Video Storyboard', icon: FaFilm },
  ];

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const generateSceneImages = async () => {
    if (!campaign?.video_storyboard?.scenes) return;
    
    setLoadingImages(true);
    const images = {};
    
    try {
      // Generate images for each scene using Imagen 3
      for (const scene of campaign.video_storyboard.scenes) {
        try {
          // Create detailed prompt from scene description
          const prompt = `${scene.visual_description}, cinematic composition, professional commercial photography, high quality, detailed`;
          
          // Try Imagen 3 first
          const response = await fetch('/api/imagen-generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: prompt,
              aspectRatio: '16:9',
              sampleCount: 1
            })
          });
          
          const data = await response.json();
          
          if (data.error) {
            // Fallback to SVG if Imagen unavailable
            console.log(`Imagen unavailable for scene ${scene.scene_number}, falling back to SVG`);
            const svgResponse = await fetch('/api/generate-scene-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                visualDescription: scene.visual_description,
                industry: campaign.core_narrative?.positioning_statement?.split(' ')[0] || 'business',
                sceneNumber: scene.scene_number
              })
            });
            const svgData = await svgResponse.json();
            images[scene.scene_number] = svgData.imageUrl;
          } else {
            images[scene.scene_number] = data.image;
          }
        } catch (error) {
          console.error(`Error generating image for scene ${scene.scene_number}:`, error);
          // Fallback to SVG on error
          const svgResponse = await fetch('/api/generate-scene-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visualDescription: scene.visual_description,
              industry: campaign.core_narrative?.positioning_statement?.split(' ')[0] || 'business',
              sceneNumber: scene.scene_number
            })
          });
          const svgData = await svgResponse.json();
          images[scene.scene_number] = svgData.imageUrl;
        }
      }
      
      setSceneImages(images);
    } catch (error) {
      console.error('Error generating scene images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const generateProductImages = async () => {
    setLoadingProductImages(true);
    const images = {};
    
    try {
      // Extract product info from campaign
      const product = campaign?.core_narrative?.unique_value_proposition || 'Product';
      const industry = campaign?.core_narrative?.positioning_statement?.split(' ')[0]?.toLowerCase() || 'tech';
      
      // Generate 3 different style product images using Imagen 3
      const styles = [
        { name: 'modern', prompt: `Professional product photography of ${product} in a modern tech environment, sleek design, studio lighting, photorealistic, high-end commercial photography, ${industry} industry aesthetic` },
        { name: 'minimal', prompt: `Minimalist product shot of ${product} on clean white background, simple elegant composition, soft shadows, professional e-commerce photography, high resolution` },
        { name: 'bold', prompt: `Bold dramatic product photography of ${product} with vibrant colors and dynamic lighting, creative commercial style, eye-catching composition, ${industry} branding` }
      ];
      
      for (const style of styles) {
        try {
          // Try Imagen 3 first
          const response = await fetch('/api/imagen-generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: style.prompt,
              aspectRatio: '1:1',
              sampleCount: 1
            })
          });
          
          const data = await response.json();
          
          if (data.error) {
            // Fallback to SVG if Imagen unavailable
            console.log(`Imagen unavailable for ${style.name}, falling back to SVG`);
            const svgResponse = await fetch('/api/generate-product-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ product, industry, style: style.name })
            });
            const svgData = await svgResponse.json();
            images[style.name] = svgData.image;
          } else {
            images[style.name] = data.image;
          }
        } catch (error) {
          console.error(`Error generating ${style.name} image:`, error);
          // Fallback to SVG on error
          const svgResponse = await fetch('/api/generate-product-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product, industry, style: style.name })
          });
          const svgData = await svgResponse.json();
          images[style.name] = svgData.image;
        }
      }
      
      setProductImages(images);
    } catch (error) {
      console.error('Error generating product images:', error);
    } finally {
      setLoadingProductImages(false);
    }
  };

  const generateVideoPreview = async () => {
    if (!campaign?.video_storyboard) return;
    
    setLoadingVideo(true);
    
    try {
      const product = campaign?.core_narrative?.unique_value_proposition || 'Product';
      const industry = campaign?.core_narrative?.positioning_statement?.split(' ')[0]?.toLowerCase() || 'tech';
      
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyboard: campaign.video_storyboard,
          product,
          industry
        })
      });
      
      const data = await response.json();
      setVideoPreview(data.preview);
      setVideoFrames(data.frames || []);
    } catch (error) {
      console.error('Error generating video preview:', error);
    } finally {
      setLoadingVideo(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const speak = async (text, id) => {
    // If same ID, toggle pause/resume
    if (speaking === id && currentAudio) {
      if (isPaused) {
        currentAudio.play();
        setIsPaused(false);
      } else {
        currentAudio.pause();
        setIsPaused(true);
      }
      return;
    }

    // Stop any current audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }

    setIsLoading(true);
    setSpeaking(id);

    try {
      // Call the Google Cloud TTS API
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: voiceSettings.voice,
          languageCode: voiceSettings.languageCode,
          speakingRate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.fallback) {
        // Check if it's an API not enabled error
        if (data.details && data.details.includes('has not been used') || data.details && data.details.includes('is disabled')) {
          const enableUrl = 'https://console.developers.google.com/apis/api/texttospeech.googleapis.com/overview';
          if (confirm(
            '⚠️ Google Cloud Text-to-Speech API is not enabled yet.\n\n' +
            'Click OK to open the setup page in a new tab, then:\n' +
            '1. Click "Enable API"\n' +
            '2. Wait 1-2 minutes\n' +
            '3. Refresh this page and try again'
          )) {
            window.open(enableUrl, '_blank');
          }
          throw new Error('API not enabled');
        }
        throw new Error(data.error || 'Failed to generate speech');
      }

      // Convert base64 to audio and play
      const audioData = `data:audio/mp3;base64,${data.audio}`;
      const audio = new Audio(audioData);
      audio.volume = voiceSettings.volume;

      audio.onplay = () => {
        setIsPaused(false);
        setIsLoading(false);
      };

      audio.onended = () => {
        setSpeaking(null);
        setIsPaused(false);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        setSpeaking(null);
        setIsPaused(false);
        setIsLoading(false);
        setCurrentAudio(null);
        alert('Error playing audio');
      };

      setCurrentAudio(audio);
      await audio.play();

    } catch (error) {
      console.error('TTS Error:', error);
      setIsLoading(false);
      setSpeaking(null);
      
      // Don't show alert if user cancelled the enable API dialog
      if (error.message !== 'API not enabled') {
        alert('Failed to generate speech. Please check the console for details.');
      }
    }
  };

  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
    }
    setSpeaking(null);
    setIsPaused(false);
  };

  if (!campaign) return null;

  return (
    <div className="space-y-8">
      {/* Voice Controls Header */}
      <div className="campaign-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <FaVolumeUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Neural Voice Controls</h3>
              <p className="text-sm text-white/50">Premium Google Cloud TTS - Click play to preview</p>
            </div>
          </div>
          <VoiceSettings onSettingsChange={setVoiceSettings} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-dark-card rounded-lg p-1 border border-dark-border inline-flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon className="w-3.5 h-3.5 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'narrative' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positioning Statement */}
            <div className="campaign-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FaBullseye className="text-primary text-sm" />
                </div>
                <h3 className="font-semibold">Positioning Statement</h3>
              </div>
              <p className="font-serif text-white/80 leading-relaxed">
                {campaign.core_narrative.positioning_statement}
              </p>
            </div>

            {/* Value Proposition */}
            <div className="campaign-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <FaCheckCircle className="text-secondary text-sm" />
                </div>
                <h3 className="font-semibold">Unique Value Proposition</h3>
              </div>
              <p className="font-serif text-white/80 leading-relaxed">
                {campaign.core_narrative.unique_value_proposition}
              </p>
            </div>

            {/* Brand Story - Full Width */}
            <div className="campaign-card md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <FaBullseye className="text-accent text-sm" />
                </div>
                <h3 className="font-semibold">Brand Story</h3>
              </div>
              <p className="font-serif text-white/80 leading-relaxed whitespace-pre-line">
                {campaign.core_narrative.brand_story}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaign.key_messages.map((message, index) => (
              <div key={index} className="campaign-card flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                  {index + 1}
                </div>
                <p className="text-white/80 flex-1">{message}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'social' && (
          <>
            {/* Product Images for Social Media */}
            {!productImages.modern ? (
              <div className="campaign-card mb-4 text-center">
                <button
                  onClick={generateProductImages}
                  disabled={loadingProductImages}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loadingProductImages ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
                      Generating Assets...
                    </>
                  ) : (
                    <>
                      <FaImage />
                      Generate Social Media Assets
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="campaign-card mb-4">
                <h5 className="font-semibold mb-4 flex items-center gap-2">
                  <FaImage className="text-primary" />
                  Social Media Assets
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg overflow-hidden border border-dark-border">
                    <div dangerouslySetInnerHTML={{ __html: productImages.minimal }} className="w-full aspect-square bg-dark-bg" />
                    <div className="p-2 bg-dark-bg border-t border-dark-border">
                      <p className="text-xs text-white/50">Instagram Post</p>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-dark-border">
                    <div dangerouslySetInnerHTML={{ __html: productImages.bold }} className="w-full aspect-square bg-dark-bg" />
                    <div className="p-2 bg-dark-bg border-t border-dark-border">
                      <p className="text-xs text-white/50">Twitter/X Card</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaign.social_media_posts.map((post, index) => {
              const platformIcons = {
                'LinkedIn': FaLinkedin,
                'Instagram': FaInstagram,
                'Twitter': FaTwitter,
                'Facebook': FaFacebook
              };
              const Icon = platformIcons[post.platform] || FaTwitter;
              return (
                <div key={index} className="campaign-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="text-primary text-sm" />
                    </div>
                    <h3 className="font-semibold">{post.platform}</h3>
                  </div>
                  <div className="mb-3 p-3 rounded-lg bg-primary/5 border-l-2 border-primary">
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary/80">Hook</span>
                    <p className="mt-1 text-white/85">{post.hook}</p>
                  </div>
                  <p className="text-white/70 text-sm whitespace-pre-line leading-relaxed">{post.copy}</p>
                </div>
              );
            })}
            </div>
          </>
        )}

        {activeTab === 'email' && (
          <div className="space-y-3">
            {campaign.email_sequence.map((email) => (
              <div key={email.email_number} className="campaign-card overflow-hidden">
                <button
                  onClick={() => toggleSection(`email-${email.email_number}`)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center transition-all hover:bg-dark-hover rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold mb-1">
                      Email {email.email_number}: {email.subject_line}
                    </h3>
                    <p className="text-sm text-white/50">{email.preview_text}</p>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform text-white/40 ${
                      expandedSections[`email-${email.email_number}`] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedSections[`email-${email.email_number}`] && (
                  <div className="px-5 pb-5 border-t border-dark-border">
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Subject</p>
                        <p className="text-white/85">{email.subject_line}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Preview</p>
                        <p className="text-white/85">{email.preview_text}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Body</p>
                        <p className="text-white/70 text-sm whitespace-pre-line leading-relaxed">{email.body}</p>
                      </div>
                      <div className="pt-2">
                        <button className="btn-primary text-sm">
                          {email.cta}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'landing' && (
          <div className="campaign-card">
            <h3 className="text-3xl font-semibold mb-2 tracking-tight">
              {campaign.landing_page.headline}
            </h3>
            <h4 className="text-xl mb-6 text-white/60">
              {campaign.landing_page.subheadline}
            </h4>
            <p className="mb-8 text-white/70 leading-relaxed">{campaign.landing_page.hero_copy}</p>
            
            {/* Product Showcase Images */}
            {!productImages.modern ? (
              <div className="mb-8 text-center">
                <button
                  onClick={generateProductImages}
                  disabled={loadingProductImages}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {loadingProductImages ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
                      Generating Product Showcase...
                    </>
                  ) : (
                    <>
                      <FaImage />
                      Generate Product Showcase
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold flex items-center gap-2">
                    <FaImage className="text-primary" />
                    Product Showcase
                  </h5>
                  {loadingProductImages && (
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <div className="animate-spin w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full"></div>
                      Generating...
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg overflow-hidden border border-dark-border hover:border-primary/50 transition-all cursor-pointer group">
                    <div dangerouslySetInnerHTML={{ __html: productImages.modern }} className="w-full aspect-[3/2] bg-dark-bg group-hover:scale-105 transition-transform" />
                    <div className="p-2 bg-dark-bg border-t border-dark-border">
                      <p className="text-xs text-white/50 text-center">Modern Style</p>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-dark-border hover:border-primary/50 transition-all cursor-pointer group">
                    <div dangerouslySetInnerHTML={{ __html: productImages.minimal }} className="w-full aspect-[3/2] bg-dark-bg group-hover:scale-105 transition-transform" />
                    <div className="p-2 bg-dark-bg border-t border-dark-border">
                      <p className="text-xs text-white/50 text-center">Minimal Style</p>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-dark-border hover:border-primary/50 transition-all cursor-pointer group">
                    <div dangerouslySetInnerHTML={{ __html: productImages.bold }} className="w-full aspect-[3/2] bg-dark-bg group-hover:scale-105 transition-transform" />
                    <div className="p-2 bg-dark-bg border-t border-dark-border">
                      <p className="text-xs text-white/50 text-center">Bold Style</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <h5 className="font-semibold mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-primary" />
                Key Benefits
              </h5>
              <div className="space-y-2">
                {campaign.landing_page.benefits_section.map((benefit, index) => (
                  <div key={index} className="flex items-start p-3 rounded-lg bg-dark-bg border border-dark-border hover:border-dark-hover transition-all">
                    <FaCheckCircle className="w-4 h-4 flex-shrink-0 mr-3 mt-1 text-primary" />
                    <p className="text-white/75 text-sm">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8 p-4 rounded-lg border-l-4 border-primary bg-primary/5">
              <p className="italic text-white/70">{campaign.landing_page.social_proof}</p>
            </div>
            
            <div className="flex gap-3">
              <button className="btn-primary flex-1">
                {campaign.landing_page.cta_primary}
              </button>
              <button className="flex-1 px-6 py-3 border border-dark-border font-semibold rounded-lg hover:bg-dark-hover transition-all">
                {campaign.landing_page.cta_secondary}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="space-y-6">
            {/* Video Player with Sound */}
            <VideoPlayer 
              storyboard={campaign.video_storyboard}
              productName={campaign.core_narrative?.unique_value_proposition || 'Product Ad'}
              voiceSettings={voiceSettings}
            />
            
            {/* Full Voiceover Script */}
            <div className="campaign-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FaVolumeUp className="text-primary" />
                  Full Voiceover Script
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => speak(campaign.video_storyboard.full_voiceover_script, 'full-voiceover')}
                    disabled={isLoading && speaking === 'full-voiceover'}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all disabled:opacity-50 text-sm font-medium"
                  >
                    {isLoading && speaking === 'full-voiceover' ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
                        Loading...
                      </>
                    ) : speaking === 'full-voiceover' ? (
                      <>
                        {isPaused ? <FaPlay className="w-4 h-4" /> : <FaPause className="w-4 h-4" />}
                        {isPaused ? 'Resume' : 'Pause'}
                      </>
                    ) : (
                      <>
                        <FaPlay className="w-4 h-4" />
                        Play Full
                      </>
                    )}
                  </button>
                  {speaking && (
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-all text-sm font-medium"
                    >
                      <FaStop className="w-4 h-4" />
                      Stop
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-dark-bg border border-dark-border">
                <p className="whitespace-pre-line text-white/75 text-sm leading-relaxed">{campaign.video_storyboard.full_voiceover_script}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
