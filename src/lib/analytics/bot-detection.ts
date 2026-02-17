/**
 * Bot detection utilities
 * Identifies bots and crawlers based on user agent patterns and behavioral signals
 */

// Known bot user agent patterns
const BOT_PATTERNS = [
  // Search engines
  /googlebot/i,
  /bingbot/i,
  /slurp/i, // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /exabot/i,
  
  // AI crawlers
  /gptbot/i, // OpenAI
  /claudebot/i, // Anthropic
  /cohere-ai/i,
  /anthropic-ai/i,
  /perplexitybot/i,
  /youbot/i,
  /chatgpt/i,
  
  // Social media
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /slackbot/i,
  /discordbot/i,
  /telegrambot/i,
  /whatsapp/i,
  
  // SEO & monitoring
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /rogerbot/i,
  /screaming frog/i,
  /sitebulb/i,
  
  // Generic bot indicators
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /go-http-client/i,
  /java/i,
  /okhttp/i,
  /axios/i,
  /node-fetch/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
];

// Known good bot patterns (for allowlisting)
const GOOD_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
];

/**
 * Check if user agent matches known bot patterns
 */
export function isBotUserAgent(userAgent: string): boolean {
  if (!userAgent) return true; // No user agent = likely bot
  
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

/**
 * Check if bot is a "good" bot (search engines, etc.)
 */
export function isGoodBot(userAgent: string): boolean {
  if (!userAgent) return false;
  
  return GOOD_BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

/**
 * Detect bot based on behavioral signals
 */
export interface BehavioralSignals {
  timeSpent?: number; // milliseconds
  scrollDepth?: number; // percentage 0-100
  hasJavaScript?: boolean; // did client-side JS execute?
}

export function isBotBehavior(signals: BehavioralSignals): boolean {
  // Very fast page loads (< 100ms) suggest automated access
  if (signals.timeSpent !== undefined && signals.timeSpent < 100) {
    return true;
  }
  
  // No scroll activity on long content suggests bot
  if (signals.scrollDepth !== undefined && signals.scrollDepth === 0 && signals.timeSpent && signals.timeSpent > 1000) {
    return true;
  }
  
  // No JavaScript execution is a strong bot signal
  if (signals.hasJavaScript === false) {
    return true;
  }
  
  return false;
}

/**
 * Comprehensive bot detection combining user agent and behavior
 */
export function detectBot(userAgent: string, signals?: BehavioralSignals): {
  isBot: boolean;
  isGoodBot: boolean;
  confidence: "high" | "medium" | "low";
  reason: string;
} {
  const userAgentBot = isBotUserAgent(userAgent);
  const goodBot = isGoodBot(userAgent);
  const behaviorBot = signals ? isBotBehavior(signals) : false;
  
  // High confidence: user agent matches known bot
  if (userAgentBot) {
    return {
      isBot: true,
      isGoodBot: goodBot,
      confidence: "high",
      reason: "User agent matches known bot pattern",
    };
  }
  
  // Medium confidence: behavioral signals suggest bot
  if (behaviorBot) {
    return {
      isBot: true,
      isGoodBot: false,
      confidence: "medium",
      reason: "Behavioral signals suggest automated access",
    };
  }
  
  // Low confidence: likely human
  return {
    isBot: false,
    isGoodBot: false,
    confidence: "low",
    reason: "No bot indicators detected",
  };
}

/**
 * Extract bot type from user agent
 */
export function getBotType(userAgent: string): string | null {
  if (!userAgent) return null;
  
  const botTypes: Record<string, RegExp> = {
    "Google": /googlebot/i,
    "Bing": /bingbot/i,
    "Yahoo": /slurp/i,
    "DuckDuckGo": /duckduckbot/i,
    "Baidu": /baiduspider/i,
    "Yandex": /yandexbot/i,
    "OpenAI": /gptbot/i,
    "Anthropic": /claudebot/i,
    "Perplexity": /perplexitybot/i,
    "Facebook": /facebookexternalhit/i,
    "Twitter": /twitterbot/i,
    "LinkedIn": /linkedinbot/i,
    "Ahrefs": /ahrefsbot/i,
    "Semrush": /semrushbot/i,
  };
  
  for (const [name, pattern] of Object.entries(botTypes)) {
    if (pattern.test(userAgent)) {
      return name;
    }
  }
  
  return "Unknown Bot";
}
