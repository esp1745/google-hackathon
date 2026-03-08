# Telegram AI Bot Integration Plan
## Using Vercel AI SDK for Query Routing & API Orchestration

**Project Goal**: Build an intelligent Telegram bot that uses AI to understand user queries and automatically trigger appropriate internal APIs, then format and return results through Telegram.

---

## 📋 Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐      ┌──────────────────┐
│   Telegram  │─────►│  Telegram    │─────►│   AI SDK Core   │─────►│  Internal APIs   │
│    User     │      │   Bot API    │      │  (Tool Router)  │      │  - Campaign Gen  │
│             │      │              │      │                 │      │  - TTS           │
└─────────────┘      └──────────────┘      └─────────────────┘      │  - Video Gen     │
      ▲                                             │                │  - Image Gen     │
      │                                             │                └──────────────────┘
      │                                             ▼
      │                                    ┌─────────────────┐
      └────────────────────────────────────│  Response       │
                                           │  Formatter      │
                                           └─────────────────┘
```

---

## 🎯 Phase 1: Core Infrastructure Setup

### 1.1 Install Dependencies

```bash
cd nextjs-app
npm install ai @ai-sdk/anthropic grammy zod
```

**Dependencies**:
- `ai` - Vercel AI SDK Core
- `@ai-sdk/anthropic` - Claude Sonnet 4.5 (best for tool calling)
- `grammy` - Modern Telegram bot framework for Node.js
- `zod` - Schema validation (AI SDK requirement)

### 1.2 Environment Setup

Add to `.env.local`:
```bash
# Existing
GOOGLE_API_KEY=AIza...
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# New for Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ANTHROPIC_API_KEY=sk-ant-...  # For Claude Sonnet 4.5
```

---

## 🤖 Phase 2: Telegram Bot Setup

### 2.1 Create Bot with BotFather

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow prompts to name your bot
4. Save the API token

### 2.2 Basic Bot Structure

Create `/nextjs-app/telegram/bot.js`:

```javascript
import { Bot } from 'grammy';
import { handleUserMessage } from './ai-handler.js';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Handle all text messages
bot.on('message:text', async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;
  const userMessage = ctx.message.text;

  // Show typing indicator
  await ctx.replyWithChatAction('typing');

  try {
    const response = await handleUserMessage({
      userId,
      username,
      message: userMessage,
      chatId: ctx.chat.id
    });

    await ctx.reply(response, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Bot error:', error);
    await ctx.reply('Sorry, something went wrong. Please try again.');
  }
});

// Start bot
bot.start();
console.log('🤖 Telegram bot is running...');
```

---

## 🧠 Phase 3: AI SDK Tool Definitions

### 3.1 Define Internal API Tools

Create `/nextjs-app/telegram/tools.js`:

```javascript
import { tool } from 'ai';
import { z } from 'zod';

// Tool 1: Generate Marketing Campaign
export const generateCampaignTool = tool({
  description: 'Generate a complete AI-powered marketing campaign including narrative, social posts, email sequences, and video storyboards. Use when user asks to create campaign, marketing content, or campaign strategy.',
  inputSchema: z.object({
    industry: z.string().describe('The industry or business sector (e.g., "E-commerce", "SaaS", "Healthcare")'),
    product: z.string().describe('The product or service to market'),
    targetAudience: z.string().describe('The target audience (e.g., "millennials", "B2B executives")'),
    goal: z.enum(['awareness', 'lead generation', 'sales', 'engagement']).describe('The campaign goal'),
    brandVoice: z.string().describe('The brand voice (e.g., "Professional & Authoritative", "Friendly & Casual")')
  }),
  execute: async ({ industry, product, targetAudience, goal, brandVoice }) => {
    const response = await fetch('http://localhost:3002/api/generate-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry, product, targetAudience, goal, brandVoice })
    });

    const campaign = await response.json();
    
    return {
      success: true,
      campaign: {
        narrative: campaign.core_narrative,
        keyMessages: campaign.key_messages,
        socialPosts: campaign.social_media_content,
        emailSequence: campaign.email_nurture_sequence,
        landingPage: campaign.landing_page_copy,
        videoScenes: campaign.video_storyboard.scenes.length
      }
    };
  }
});

// Tool 2: Generate Product Images
export const generateImagesTool = tool({
  description: 'Generate AI-powered product images in multiple styles (Modern, Minimal, Bold) using Nano Banana 2. Use when user requests product photos, images, or visuals.',
  inputSchema: z.object({
    productName: z.string().describe('The product name to generate images for'),
    industry: z.string().describe('The industry context'),
    styles: z.array(z.enum(['modern', 'minimal', 'bold'])).default(['modern', 'minimal', 'bold']).describe('Image styles to generate')
  }),
  execute: async ({ productName, industry, styles }) => {
    const images = {};
    
    for (const style of styles) {
      const promptMap = {
        modern: `Professional lifestyle product photography of ${productName} in modern ${industry} environment, photorealistic, high-end commercial`,
        minimal: `Minimalist product shot of ${productName} on clean white background, elegant composition, professional e-commerce`,
        bold: `Bold dramatic product photography of ${productName}, vibrant colors, creative commercial style`
      };

      const response = await fetch('http://localhost:3002/api/imagen-generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptMap[style],
          aspectRatio: '1:1'
        })
      });

      const data = await response.json();
      images[style] = data.image || 'Image generation pending';
    }

    return {
      success: true,
      images,
      message: `Generated ${styles.length} product images for ${productName}`
    };
  }
});

// Tool 3: Generate Video with Veo 3.1
export const generateVideoTool = tool({
  description: 'Generate AI-powered marketing videos using Veo 3.1. Use when user requests video, commercial, or video ad.',
  inputSchema: z.object({
    prompt: z.string().describe('Detailed description of the video scene'),
    duration: z.number().min(3).max(10).default(5).describe('Video duration in seconds'),
    productName: z.string().describe('Product name for context')
  }),
  execute: async ({ prompt, duration, productName }) => {
    const enhancedPrompt = `Professional ${duration}-second marketing commercial for ${productName}: ${prompt}. Cinematic 4K, dynamic camera movement, professional lighting, engaging composition.`;

    const response = await fetch('http://localhost:3002/api/veo-generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        duration,
        cameraMotion: 'dynamic',
        style: 'commercial'
      })
    });

    const data = await response.json();

    return {
      success: data.success,
      videoUrl: data.videoUrl || 'Video generation in progress',
      message: `Generated ${duration}s video for ${productName}`
    };
  }
});

// Tool 4: Text-to-Speech
export const textToSpeechTool = tool({
  description: 'Convert text to natural speech using Google Cloud Neural2 TTS. Use when user wants audio, voiceover, or speech.',
  inputSchema: z.object({
    text: z.string().describe('The text to convert to speech'),
    voice: z.enum(['en-US-Neural2-F', 'en-US-Neural2-D', 'en-US-Neural2-A']).default('en-US-Neural2-F').describe('Voice to use')
  }),
  execute: async ({ text, voice }) => {
    const response = await fetch('http://localhost:3002/api/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        languageCode: 'en-US',
        voice,
        rate: 1.0,
        pitch: 0
      })
    });

    const data = await response.json();

    return {
      success: true,
      audioUrl: data.audioUrl,
      duration: Math.ceil(text.length / 15) + 's',
      message: 'Audio generated successfully'
    };
  }
});

// Export all tools
export const allTools = {
  generateCampaign: generateCampaignTool,
  generateImages: generateImagesTool,
  generateVideo: generateVideoTool,
  textToSpeech: textToSpeechTool
};
```

---

## 🎨 Phase 4: AI Query Handler

### 4.1 Create AI Handler with Tool Routing

Create `/nextjs-app/telegram/ai-handler.js`:

```javascript
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { allTools } from './tools.js';

export async function handleUserMessage({ userId, username, message, chatId }) {
  console.log(`[${username}] Query: ${message}`);

  try {
    // Use AI SDK to understand intent and call appropriate tools
    const result = await generateText({
      model: anthropic('claude-sonnet-4.5-20241022'),
      tools: allTools,
      maxSteps: 5, // Allow multi-step tool usage
      system: `You are a helpful marketing AI assistant integrated with a powerful campaign generation platform.

Available capabilities:
- Generate complete marketing campaigns (narratives, social posts, emails, landing pages, video storyboards)
- Create professional product images (Modern, Minimal, Bold styles)
- Generate marketing videos using AI
- Convert text to natural speech

When users ask questions:
1. Understand their request
2. Use the appropriate tools to fulfill it
3. Provide clear, formatted responses
4. If generating content, explain what was created

Always be helpful, concise, and professional. Format responses for Telegram using Markdown.`,
      prompt: message,
    });

    // Format response for Telegram
    return formatTelegramResponse(result);

  } catch (error) {
    console.error('AI Handler Error:', error);
    return '❌ Sorry, I encountered an error processing your request. Please try again.';
  }
}

function formatTelegramResponse(result) {
  let response = result.text;

  // If tools were called, add tool results summary
  if (result.toolCalls && result.toolCalls.length > 0) {
    response += '\n\n📊 *Actions Taken:*\n';
    
    result.toolCalls.forEach((toolCall, index) => {
      const toolResult = result.toolResults[index];
      
      switch (toolCall.toolName) {
        case 'generateCampaign':
          response += `\n✅ Generated complete campaign with:`;
          response += `\n   • Core narrative`;
          response += `\n   • ${toolResult.output.campaign.keyMessages.length} key messages`;
          response += `\n   • Social media content`;
          response += `\n   • Email sequence`;
          response += `\n   • Landing page copy`;
          response += `\n   • ${toolResult.output.campaign.videoScenes} video scenes`;
          break;
        
        case 'generateImages':
          response += `\n🎨 Generated images: ${Object.keys(toolResult.output.images).join(', ')}`;
          break;
        
        case 'generateVideo':
          response += `\n🎬 Generated video (${toolCall.input.duration}s)`;
          if (toolResult.output.videoUrl) {
            response += `\n   URL: ${toolResult.output.videoUrl}`;
          }
          break;
        
        case 'textToSpeech':
          response += `\n🔊 Generated audio (${toolResult.output.duration})`;
          if (toolResult.output.audioUrl) {
            response += `\n   URL: ${toolResult.output.audioUrl}`;
          }
          break;
      }
    });
  }

  return response;
}
```

---

## 🚀 Phase 5: API Endpoint for Webhook

### 5.1 Create Telegram Webhook Endpoint

Create `/nextjs-app/pages/api/telegram-webhook.js`:

```javascript
import { Bot, webhookCallback } from 'grammy';
import { handleUserMessage } from '../../telegram/ai-handler.js';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Handle text messages
bot.on('message:text', async (ctx) => {
  await ctx.replyWithChatAction('typing');

  try {
    const response = await handleUserMessage({
      userId: ctx.from.id,
      username: ctx.from.username || ctx.from.first_name,
      message: ctx.message.text,
      chatId: ctx.chat.id
    });

    await ctx.reply(response, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Webhook error:', error);
    await ctx.reply('Sorry, something went wrong.');
  }
});

// Export Next.js API handler
export default webhookCallback(bot, 'next-js');

export const config = {
  api: {
    bodyParser: false, // Required for Grammy webhook
  },
};
```

---

## 📊 Phase 6: Conversation Examples

### Example 1: Campaign Generation
```
User: "Create a marketing campaign for my sustainable bamboo water bottles targeting eco-conscious millennials"

Bot: I'll help you create a comprehensive marketing campaign for your sustainable bamboo water bottles!

[AI calls generateCampaignTool with extracted parameters]

✅ Campaign Generated!

Here's what I've created:

📋 *Core Narrative*
Your brand story emphasizes environmental responsibility and modern sustainability...

💡 *Key Messages* (4)
1. Reduce plastic waste with style
2. Premium bamboo craftsmanship
3. Perfect for active lifestyles
4. Join the sustainability movement

📱 *Social Media*
- Instagram: 3 posts ready
- LinkedIn: 2 professional posts
- Twitter/X: 5 engaging tweets

📧 *Email Sequence* (3 emails)
Day 1: Welcome & Mission
Day 3: Product Benefits
Day 7: Special Offer

🎬 *Video Storyboard*
5 compelling scenes created

Want me to generate product images or videos next?
```

### Example 2: Image Generation
```
User: "Generate product images for this bottle"

Bot: I'll create professional product images in multiple styles!

[AI calls generateImagesTool]

🎨 Generated 3 product images:

1. **Modern** - Lifestyle shot with people using the bottle
2. **Minimal** - Elegant product shot on white background  
3. **Bold** - Dynamic action shot with vibrant colors

Images ready for download! Need anything else?
```

### Example 3: Video + Audio
```
User: "Make a 5-second video ad and add voiceover"

Bot: I'll create a video commercial and generate the voiceover!

[AI calls generateVideoTool and textToSpeechTool]

✅ Content Created:

🎬 Video: 5s commercial (Veo 3.1)
   URL: https://...

🔊 Audio: Voiceover generated
   URL: data:audio/mp3;base64...

Your content is ready!
```

---

## 🔧 Phase 7: Deployment Options

### Option A: Polling (Development)

Create `/nextjs-app/telegram/start-bot.js`:

```javascript
import { Bot } from 'grammy';
import { handleUserMessage } from './ai-handler.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

bot.on('message:text', async (ctx) => {
  await ctx.replyWithChatAction('typing');

  const response = await handleUserMessage({
    userId: ctx.from.id,
    username: ctx.from.username || ctx.from.first_name,
    message: ctx.message.text,
    chatId: ctx.chat.id
  });

  await ctx.reply(response, { parse_mode: 'Markdown' });
});

bot.start();
console.log('🤖 Bot polling started...');
```

Run: `node telegram/start-bot.js`

### Option B: Webhook (Production)

1. Deploy to Vercel/Railway/Render
2. Set webhook:
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://your-domain.vercel.app/api/telegram-webhook"
```

---

## 📈 Phase 8: Advanced Features

### 8.1 Response Streaming

For longer operations, send progress updates:

```javascript
bot.on('message:text', async (ctx) => {
  const statusMsg = await ctx.reply('🔄 Processing your request...');

  // Call AI
  const result = await handleUserMessage(...);

  // Update message
  await ctx.api.editMessageText(
    ctx.chat.id,
    statusMsg.message_id,
    result
  );
});
```

### 8.2 Conversation Memory

Store conversation history using Vercel KV or Redis:

```javascript
import { kv } from '@vercel/kv';

async function handleUserMessage({ userId, message }) {
  // Get conversation history
  const history = await kv.get(`chat:${userId}`) || [];

  // Add to history
  history.push({ role: 'user', content: message });

  // Generate with history
  const result = await generateText({
    model: anthropic('claude-sonnet-4.5'),
    messages: history,
    tools: allTools
  });

  // Save assistant response
  history.push({ role: 'assistant', content: result.text });
  await kv.set(`chat:${userId}`, history);

  return formatResponse(result);
}
```

### 8.3 File Uploads

Handle images/documents:

```javascript
bot.on('message:photo', async (ctx) => {
  const photo = ctx.message.photo[ctx.message.photo.length - 1];
  const file = await ctx.api.getFile(photo.file_id);
  const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
  
  // Process image with vision model
  const result = await generateText({
    model: anthropic('claude-sonnet-4.5'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', url },
          { type: 'text', text: 'Analyze this product and suggest marketing angles' }
        ]
      }
    ]
  });

  await ctx.reply(result.text);
});
```

---

## 🔐 Security Considerations

1. **Validate Webhook Requests**
```javascript
import { createHmac } from 'crypto';

function validateTelegramWebhook(req) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  // Verify request signature
}
```

2. **Rate Limiting**
```javascript
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

// In handler
const { success } = await ratelimit.limit(userId);
if (!success) {
  return 'Rate limit exceeded. Please wait.';
}
```

3. **User Authentication**
```javascript
const ALLOWED_USERS = process.env.TELEGRAM_ALLOWED_USERS?.split(',') || [];

if (!ALLOWED_USERS.includes(String(userId))) {
  return 'Unauthorized. Contact admin for access.';
}
```

---

## 📝 Testing Plan

### Unit Tests
```javascript
// __tests__/tools.test.js
import { generateCampaignTool } from '../telegram/tools';

test('generateCampaign tool execution', async () => {
  const result = await generateCampaignTool.execute({
    industry: 'E-commerce',
    product: 'Test Product',
    targetAudience: 'Millennials',
    goal: 'awareness',
    brandVoice: 'Friendly'
  });

  expect(result.success).toBe(true);
  expect(result.campaign).toBeDefined();
});
```

### Integration Tests
```javascript
// __tests__/ai-handler.test.js
import { handleUserMessage } from '../telegram/ai-handler';

test('handles campaign generation request', async () => {
  const response = await handleUserMessage({
    userId: 123,
    username: 'testuser',
    message: 'Create a campaign for my SaaS product',
    chatId: 456
  });

  expect(response).toContain('campaign');
});
```

---

## 📦 Package Scripts

Add to `/nextjs-app/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "telegram:dev": "node telegram/start-bot.js",
    "telegram:webhook": "node telegram/set-webhook.js",
    "test:telegram": "jest __tests__/telegram"
  }
}
```

---

## 🎯 Success Metrics

Track in analytics:
- Query volume per hour
- Tool usage distribution
- Response time (p50, p95, p99)
- Error rates
- User satisfaction (thumbs up/down)
- Most common query patterns

---

## 🚧 Limitations & Considerations

1. **Cost**: Claude Sonnet 4.5 + Veo + Nano Banana = $$
   - Implement usage limits per user
   - Cache common responses

2. **Latency**: Video generation can take 30-60s
   - Send progress updates
   - Use async job queue for long tasks

3. **Context Window**: Messages get long with tool usage
   - Summarize old conversations
   - Clear context after task completion

4. **File Size**: Telegram has 50MB limit for files
   - Compress videos/images if needed
   - Use external hosting for large files

---

## 📚 Resources

- [Vercel AI SDK Docs](https://ai-sdk.dev/docs)
- [Grammy Bot Framework](https://grammy.dev/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [AI SDK Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)

---

**Next Steps**: 
1. Set up Telegram bot with BotFather
2. Install dependencies
3. Create tools.js with API integrations
4. Test locally with polling
5. Deploy with webhooks
6. Monitor and optimize
