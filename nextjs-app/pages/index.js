import { useState } from 'react';
import Head from 'next/head';
import { FaRocket, FaLightbulb, FaBullseye, FaCheckCircle, FaDownload, FaStar, FaChartLine, FaUsers, FaHashtag, FaVolumeUp } from 'react-icons/fa';
import CampaignDisplay from '../components/CampaignDisplay';
import ParticleBackground from '../components/ParticleBackground';

export default function Home() {
  const [formData, setFormData] = useState({
    industry: '',
    product: '',
    targetAudience: '',
    goal: 'awareness',
    brandVoice: 'Professional & Authoritative'
  });

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAudienceTags, setSelectedAudienceTags] = useState([]);

  const campaignGoals = [
    { value: 'awareness', label: 'Awareness', icon: FaStar },
    { value: 'conversion', label: 'Conversion', icon: FaChartLine },
    { value: 'engagement', label: 'Engagement', icon: FaUsers }
  ];

  const audienceTags = [
    'Millennials', 'Gen Z', 'Professionals', 'Entrepreneurs',
    'Tech-savvy', 'Budget-conscious', 'Premium buyers', 'Decision makers'
  ];

  const brandVoiceOptions = [
    'Professional & Authoritative',
    'Friendly & Conversational',
    'Bold & Edgy',
    'Inspirational & Uplifting',
    'Witty & Humorous',
    'Empathetic & Caring',
    'Innovative & Forward-thinking'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to generate campaign');
        throw new Error(errorMsg);
      }

      setCampaign(data);
    } catch (err) {
      console.error('Campaign generation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleAudienceTag = (tag) => {
    setSelectedAudienceTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const setGoal = (goalValue) => {
    setFormData({ ...formData, goal: goalValue });
  };

  const downloadCampaign = () => {
    const dataStr = JSON.stringify(campaign, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `campaign_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <Head>
        <title>Narrative Engine - AI Campaign Platform</title>
        <meta name="description" content="Transform your business brief into a complete marketing campaign powered by AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ParticleBackground />

      {/* Left Sidebar - Fixed */}
      <aside className="w-full lg:w-[420px] lg:fixed lg:h-screen overflow-y-auto border-r border-dark-border glass-card relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <FaRocket className="text-white text-sm" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Narrative Engine</h1>
            </div>
            <p className="text-sm text-white/50 mb-3">Multimodal AI campaign platform</p>
            
            {/* Multimodal Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-1">
                <FaLightbulb className="text-primary text-xs" />
                <FaVolumeUp className="text-primary text-xs" />
                <FaBullseye className="text-primary text-xs" />
              </div>
              <span className="text-xs font-medium text-primary">Text + Images + Audio</span>
            </div>
          </div>

          {/* Campaign Brief Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Industry Field */}
            <div className="relative">
              <label className="label-text">Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="SaaS, E-commerce, Healthcare..."
                className="input-field"
                required
              />
            </div>

            {/* Product/Offer Field */}
            <div className="relative">
              <label className="label-text">Product/Offer</label>
              <textarea
                name="product"
                value={formData.product}
                onChange={handleChange}
                placeholder="Describe what you're marketing"
                className="input-field min-h-[100px] resize-none"
                required
              />
            </div>

            {/* Campaign Goal - Segmented Control */}
            <div>
              <label className="label-text mb-3 block">Campaign Goal</label>
              <div className="segmented-control w-full">
                {campaignGoals.map(goal => (
                  <div
                    key={goal.value}
                    onClick={() => setGoal(goal.value)}
                    className={`segmented-option flex-1 flex items-center justify-center gap-2 ${
                      formData.goal === goal.value ? 'active' : ''
                    }`}
                  >
                    <goal.icon className="text-sm" />
                    <span>{goal.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience Tags - Multi-select Pills */}
            <div>
              <label className="label-text mb-3 block">
                <span className="flex items-center gap-2">
                  <FaHashtag className="text-xs" />
                  Audience Tags
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {audienceTags.map(tag => (
                  <div
                    key={tag}
                    onClick={() => toggleAudienceTag(tag)}
                    className={`pill cursor-pointer ${
                      selectedAudienceTags.includes(tag) ? 'selected' : ''
                    }`}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience Field */}
            <div className="relative">
              <label className="label-text">Target Audience Details</label>
              <textarea
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                placeholder="Who are you trying to reach?"
                className="input-field min-h-[80px] resize-none"
                required
              />
            </div>

            {/* Brand Voice Dropdown */}
            <div className="relative">
              <label className="label-text">Brand Voice</label>
              <select
                name="brandVoice"
                value={formData.brandVoice}
                onChange={handleChange}
                className="input-field appearance-none cursor-pointer"
              >
                {brandVoiceOptions.map((voice) => (
                  <option key={voice} value={voice}>
                    {voice}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button with High Glow */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full pulse-glow"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <FaRocket className={loading ? 'animate-bounce' : ''} />
                {loading ? 'Generating...' : 'Generate Campaign'}
              </span>
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-dark-border">
            <p className="text-xs text-white/40 flex items-center gap-2">
              <FaRocket className="text-primary" />
              Powered by Google Gemini AI
            </p>
          </div>
        </div>
      </aside>

      {/* Right Canvas - Scrollable */}
      <main className="flex-1 lg:ml-[420px] min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {loading && (
            <div className="campaign-card flex flex-col items-center justify-center py-20">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-dark-border"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              </div>
              <p className="text-lg font-medium mb-2">Creating your campaign...</p>
              <p className="text-sm text-white/50">This may take 30-60 seconds</p>
            </div>
          )}

          {!loading && !campaign && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-4xl font-semibold mb-3 tracking-tight">
                  Welcome to Narrative Engine
                </h2>
                <p className="text-lg text-white/60 mb-4">
                  Multimodal AI campaign creation with text, images, and audio output.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
                  <FaCheckCircle className="text-primary text-sm" />
                  <span className="text-sm text-white/70">Powered by Google Gemini + Cloud TTS + Scene Generation</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: FaBullseye, title: 'Core Narrative', desc: 'Strategic positioning & messaging' },
                  { icon: FaLightbulb, title: 'Key Messages', desc: 'Compelling talking points' },
                  { icon: FaUsers, title: 'Social Content', desc: 'Posts for 4 platforms' },
                  { icon: FaCheckCircle, title: 'Email Sequence', desc: '3-part nurture campaign' },
                  { icon: FaChartLine, title: 'Landing Page', desc: 'Conversion-optimized copy' },
                  { icon: FaRocket, title: 'Video Storyboard', desc: 'Images + script + voiceover audio', badge: 'Multimodal' }
                ].map((item, i) => (
                  <div key={i} className="campaign-card stagger-item flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="text-primary text-lg" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.badge && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {campaign && !loading && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight mb-1">Your Campaign</h2>
                  <p className="text-white/50">AI-generated marketing package</p>
                </div>
                <button
                  onClick={downloadCampaign}
                  className="px-4 py-2 rounded-lg font-medium transition-all bg-dark-card hover:bg-dark-hover border border-dark-border flex items-center gap-2"
                >
                  <FaDownload />
                  Download
                </button>
              </div>
              <CampaignDisplay campaign={campaign} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
