export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { product, industry, style = 'modern' } = req.body;

  if (!product || !industry) {
    return res.status(400).json({ error: 'Product and industry are required' });
  }

  try {
    // Generate creative product showcase SVG
    const svg = generateProductSVG(product, industry, style);
    
    return res.status(200).json({
      success: true,
      image: svg,
      format: 'svg'
    });
  } catch (error) {
    console.error('Product image generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate product image',
      details: error.message 
    });
  }
}

function generateProductSVG(product, industry, style) {
  // Color schemes based on industry
  const colorSchemes = {
    tech: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#EC4899', bg1: '#1E1B4B', bg2: '#312E81' },
    saas: { primary: '#3B82F6', secondary: '#06B6D4', accent: '#10B981', bg1: '#0F172A', bg2: '#1E293B' },
    gaming: { primary: '#F59E0B', secondary: '#EF4444', accent: '#8B5CF6', bg1: '#1C1917', bg2: '#292524' },
    ecommerce: { primary: '#EC4899', secondary: '#F43F5E', accent: '#FB923C', bg1: '#1F2937', bg2: '#374151' },
    finance: { primary: '#10B981', secondary: '#059669', accent: '#14B8A6', bg1: '#064E3B', bg2: '#065F46' },
    health: { primary: '#06B6D4', secondary: '#3B82F6', accent: '#8B5CF6', bg1: '#0C4A6E', bg2: '#075985' },
    education: { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#C4B5FD', bg1: '#4C1D95', bg2: '#5B21B6' },
    default: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#EC4899', bg1: '#1E1B4B', bg2: '#312E81' }
  };

  const colors = colorSchemes[industry.toLowerCase()] || colorSchemes.default;

  // Generate product mockup based on style
  const mockups = {
    modern: generateModernMockup(product, colors),
    minimal: generateMinimalMockup(product, colors),
    bold: generateBoldMockup(product, colors)
  };

  const mockup = mockups[style] || mockups.modern;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" style="background: linear-gradient(135deg, ${colors.bg1}, ${colors.bg2});">
      <defs>
        <linearGradient id="productGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${colors.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="shadow">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Background Elements -->
      <circle cx="200" cy="150" r="120" fill="${colors.primary}" opacity="0.1"/>
      <circle cx="1000" cy="650" r="150" fill="${colors.secondary}" opacity="0.1"/>
      <circle cx="600" cy="100" r="80" fill="${colors.accent}" opacity="0.08"/>
      
      ${mockup}
      
      <!-- Product Name -->
      <text x="600" y="700" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="48" font-weight="700" fill="#ffffff" filter="url(#glow)">
        ${truncateText(product, 30)}
      </text>
      
      <!-- Decorative Elements -->
      <circle cx="100" cy="700" r="4" fill="${colors.primary}" opacity="0.6"/>
      <circle cx="130" cy="700" r="4" fill="${colors.secondary}" opacity="0.6"/>
      <circle cx="160" cy="700" r="4" fill="${colors.accent}" opacity="0.6"/>
      
      <circle cx="1040" cy="700" r="4" fill="${colors.primary}" opacity="0.6"/>
      <circle cx="1070" cy="700" r="4" fill="${colors.secondary}" opacity="0.6"/>
      <circle cx="1100" cy="700" r="4" fill="${colors.accent}" opacity="0.6"/>
    </svg>
  `.trim();
}

function generateModernMockup(product, colors) {
  return `
    <!-- Modern Device Mockup -->
    <g filter="url(#shadow)">
      <!-- Laptop -->
      <rect x="300" y="250" width="600" height="350" rx="20" fill="#1a1a1a" stroke="${colors.primary}" stroke-width="3"/>
      <rect x="320" y="270" width="560" height="300" rx="4" fill="url(#productGrad)" opacity="0.2"/>
      
      <!-- Screen Content -->
      <rect x="340" y="290" width="520" height="40" rx="8" fill="${colors.primary}" opacity="0.3"/>
      <rect x="340" y="350" width="240" height="200" rx="8" fill="${colors.secondary}" opacity="0.4"/>
      <rect x="600" y="350" width="260" height="90" rx="8" fill="${colors.accent}" opacity="0.3"/>
      <rect x="600" y="460" width="260" height="90" rx="8" fill="${colors.primary}" opacity="0.25"/>
      
      <!-- Laptop Base -->
      <path d="M 250 600 L 300 600 L 320 620 L 880 620 L 900 600 L 950 600 L 920 650 L 280 650 Z" 
            fill="#0a0a0a" stroke="${colors.primary}" stroke-width="2"/>
    </g>
    
    <!-- Floating UI Elements -->
    <g opacity="0.8" filter="url(#glow)">
      <circle cx="950" cy="200" r="40" fill="${colors.primary}" opacity="0.6"/>
      <rect x="920" y="180" width="60" height="8" rx="4" fill="#ffffff"/>
      <rect x="930" y="195" width="40" height="8" rx="4" fill="#ffffff"/>
    </g>
    
    <g opacity="0.8" filter="url(#glow)">
      <rect x="180" y="350" width="80" height="80" rx="12" fill="${colors.accent}" opacity="0.5"/>
      <circle cx="220" cy="380" r="12" fill="#ffffff"/>
      <rect x="195" y="405" width="50" height="6" rx="3" fill="#ffffff"/>
    </g>
  `;
}

function generateMinimalMockup(product, colors) {
  return `
    <!-- Minimal Phone Mockup -->
    <g filter="url(#shadow)">
      <rect x="450" y="150" width="300" height="500" rx="30" fill="#0a0a0a" stroke="${colors.primary}" stroke-width="4"/>
      <rect x="470" y="180" width="260" height="440" rx="15" fill="url(#productGrad)" opacity="0.3"/>
      
      <!-- Screen Elements -->
      <circle cx="600" cy="250" r="50" fill="${colors.primary}" opacity="0.6"/>
      <rect x="500" y="330" width="200" height="15" rx="7.5" fill="${colors.secondary}" opacity="0.5"/>
      <rect x="520" y="360" width="160" height="15" rx="7.5" fill="${colors.accent}" opacity="0.4"/>
      
      <rect x="490" y="410" width="220" height="80" rx="12" fill="${colors.primary}" opacity="0.3"/>
      <rect x="490" y="510" width="220" height="80" rx="12" fill="${colors.secondary}" opacity="0.3"/>
      
      <!-- Top Notch -->
      <rect x="550" y="170" width="100" height="25" rx="12" fill="#0a0a0a"/>
    </g>
    
    <!-- Orbiting Elements -->
    <circle cx="350" cy="300" r="30" fill="${colors.accent}" opacity="0.4" filter="url(#glow)"/>
    <circle cx="850" cy="450" r="35" fill="${colors.primary}" opacity="0.4" filter="url(#glow)"/>
    <rect x="800" y="250" width="60" height="60" rx="10" fill="${colors.secondary}" opacity="0.4" filter="url(#glow)"/>
  `;
}

function generateBoldMockup(product, colors) {
  return `
    <!-- Bold Abstract Composition -->
    <g filter="url(#shadow)">
      <!-- Main Display -->
      <rect x="250" y="200" width="700" height="400" rx="25" fill="url(#productGrad)" opacity="0.4"/>
      <rect x="270" y="220" width="660" height="360" rx="15" fill="#0a0a0a" opacity="0.8" stroke="${colors.primary}" stroke-width="3"/>
      
      <!-- Content Blocks -->
      <rect x="300" y="250" width="280" height="300" rx="12" fill="${colors.primary}" opacity="0.5"/>
      <rect x="610" y="250" width="290" height="140" rx="12" fill="${colors.secondary}" opacity="0.5"/>
      <rect x="610" y="410" width="290" height="140" rx="12" fill="${colors.accent}" opacity="0.5"/>
      
      <!-- Icons/Graphics -->
      <circle cx="440" cy="380" r="60" fill="#ffffff" opacity="0.2"/>
      <polygon points="440,350 470,400 410,400" fill="#ffffff" opacity="0.9"/>
      
      <!-- Stats/Badges -->
      <circle cx="850" cy="300" r="35" fill="${colors.primary}" filter="url(#glow)"/>
      <text x="850" y="310" text-anchor="middle" font-family="system-ui" font-size="24" font-weight="700" fill="#ffffff">+</text>
      
      <circle cx="850" cy="480" r="35" fill="${colors.accent}" filter="url(#glow)"/>
      <text x="850" y="490" text-anchor="middle" font-family="system-ui" font-size="24" font-weight="700" fill="#ffffff">★</text>
    </g>
    
    <!-- Geometric Accents -->
    <rect x="150" y="150" width="80" height="80" rx="15" fill="${colors.secondary}" opacity="0.3" transform="rotate(15 190 190)"/>
    <rect x="970" y="520" width="100" height="100" rx="20" fill="${colors.primary}" opacity="0.3" transform="rotate(-20 1020 570)"/>
  `;
}

function truncateText(text, maxLength) {
  const escaped = text.replace(/[<>&'"]/g, (c) => {
    const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
    return entities[c];
  });
  return escaped.length > maxLength ? escaped.substring(0, maxLength) + '...' : escaped;
}
