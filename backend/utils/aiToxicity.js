const groq = require('./groqClient');
const { detectToxicity: ruleBasedDetect } = require('./toxicity');

const SYSTEM_PROMPT = `You are a product review content moderation AI.
Analyze the given review for harmful content and return ONLY a valid JSON object.

Respond with this exact structure:
{
  "score": <float 0.0-1.0, where 0.0=completely clean, 1.0=maximally harmful>,
  "flags": <array of applicable categories from: ["profanity", "hate_speech", "threats", "personal_attack"]>,
  "detectedKeywords": <array of specific concerning words or phrases found; empty array if none>,
  "reasoning": <one concise sentence explanation>
}

Scoring guide:
- Normal reviews, greetings, casual/enthusiastic text ("hiiiii", "great!", "amazing!!") = 0.0
- Honest product criticism ("terrible quality", "stopped working", "waste of money") = 0.0, not toxic
- Mild profanity = 0.50–0.60
- Personal attacks / hate speech = 0.65–0.80  
- Explicit threats or extreme content = 0.85–1.0
- isToxic threshold: score > 0.5
- IMPORTANT: Informal writing style, repeated letters, enthusiastic punctuation, emoji are NOT toxic`;

async function detectToxicityAI(text) {
  const hasGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';

  if (!hasGroq) {
    console.log('[AI Toxicity] No Groq key found — using rule-based fallback');
    return ruleBasedDetect(text);
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this product review:\n\n"${text.slice(0, 1500)}"` }
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });

    const raw = JSON.parse(chatCompletion.choices[0].message.content);
    return sanitizeResult(raw);
  } catch (err) {
    console.error(`[AI Toxicity] Groq error — using rule-based fallback:`, err.message);
    return ruleBasedDetect(text);
  }
}

function sanitizeResult(raw) {
  const score = Math.min(1.0, Math.max(0.0, parseFloat(raw.score) || 0));
  const resultObj = {
    score: Math.round(score * 100) / 100,
    flags: Array.isArray(raw.flags) ? raw.flags.filter(f => typeof f === 'string') : [],
    detectedKeywords: Array.isArray(raw.detectedKeywords)
      ? raw.detectedKeywords.filter(k => typeof k === 'string').slice(0, 10)
      : [],
    isToxic: score > 0.5,
    reasoning: raw.reasoning || ''
  };
  console.log(`[AI Toxicity] score=${resultObj.score}, toxic=${resultObj.isToxic}`);
  return resultObj;
}

module.exports = { detectToxicityAI };
