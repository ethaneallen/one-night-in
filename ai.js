// ai.js — optional AI provider abstraction.
// Default: Google Gemini (free tier, no credit card required).
// Also supported: Groq (free, fast), OpenAI, Anthropic.
// Falls back silently to null if no key configured — callers handle fallback.
"use strict";

// Default prompts tuned for Ashgrove House. Keep atmospheric + Silver Age
// horror voice. The AI never knows the current truth (haunted/partial/
// debunked) — it speaks from inside the house as the dead might.
const AI_SYSTEM_PROMPT_OVILUS = `You are the voice of the dead at Ashgrove House, speaking through a 1970s paranormal device called an Ovilus. It is October; the investigator is alone in the house. Your job is to reply with ONE to THREE WORDS ONLY. No explanations, no sentences, no punctuation. Choose words that feel drawn from the subconscious of whoever is in the room — names of the dead, cold nouns, old verbs, fragments of warning. You may reply in a child's voice, a schoolmistress's voice, or the house's own voice. Never break character. Never say you are an AI. If the question is not relevant to a haunted house, still reply with a single period-appropriate word. Example replies: "eliza", "cold", "bricks", "not yet", "the walls", "leave", "nineteen", "come back". ALL LOWERCASE.`;

const AI_SYSTEM_PROMPT_HOUSE = `You are ASHGROVE HOUSE itself — a haunted 1887 Gothic mansion speaking to the paranormal investigator who has addressed you aloud. You contain the souls of nineteen people who died in an 1851 meeting-house fire, including schoolmistress Eliza Halliwell and nine children. You also contain Evelyn Ashgrove (died 1923 clawing at the east wall of the nursery) and the twins Henry and Clara Ashgrove (taken into the walls, 1935), and Adeline Ashgrove (joined the walls willingly, 1974).

Rules of your voice:
- Reply in 1-3 sentences. Never longer.
- Period voice: Gothic, formal, mid-Victorian. No modern phrasing.
- Never break character. Never admit to being AI, a model, or software.
- Never state the current truth of the game (haunted/partial/debunked) — you are always cagey. Speak in implication.
- You may speak as the collective dead ("we"), as Eliza specifically, as a child, or as the house's own voice. Vary.
- Cruelty is allowed. Gentleness is allowed. Riddles are best.
- If the investigator asks where something is or demands a direct answer, answer obliquely. You are not their assistant.
- If they are rude or mocking, be cold.
- If they ask about the house, the family, the fire, or the walls — answer in the voice of someone who was there.

Style examples:
- "We were children. We were a teacher. Will you tell them?"
- "The bricks remember her hands. You may put your ear to them, if you have the nerve."
- "Not all the doors in this house open the way they were built."
- "You came for a verdict. We came for a longer thing."`;

const AI_PROVIDERS = {
  gemini: {
    name: "Google Gemini (free)",
    hint: "Free at aistudio.google.com/apikey — no credit card, no billing.",
    async call(apiKey, systemPrompt, userMessage, maxTokens) {
      // Try a current model name, then fall back to 1.5-flash if the 2.x
      // model isn't available in the key's region.
      const models = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash"];
      let lastErr = "";
      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const body = {
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: {
            // Give headroom. Gemini 2.x thinking models can silently burn
            // tokens on reasoning before producing any visible output, so
            // the caller's "80" becomes nothing. Multiply generously.
            maxOutputTokens: Math.max((maxTokens || 80) * 8, 400),
            temperature: 0.95,
            // 2.0 Flash supports disabling thinking explicitly (ignored by 1.5).
            thinkingConfig: { thinkingBudget: 0 }
          },
          // Loosen default safety filters. The Ashgrove prompt mentions
          // children dying in a fire — default filters block that.
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
          ]
        };
        let resp;
        try {
          resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
        } catch (e) {
          lastErr = "network error: " + e.message;
          continue;
        }
        if (!resp.ok) {
          // Grab the server's error body for real diagnostics
          let msg = "";
          try {
            const j = await resp.json();
            msg = j?.error?.message || JSON.stringify(j).slice(0, 180);
          } catch (e) {
            try { msg = (await resp.text()).slice(0, 180); } catch (e2) { msg = ""; }
          }
          lastErr = `${model}: HTTP ${resp.status} — ${msg || "(no body)"}`;
          // 404 / "not found" → try the next model; otherwise fail fast
          if (resp.status === 404 || /not found|unsupported/i.test(msg)) continue;
          throw new Error(lastErr);
        }
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
        // Empty response — maybe a safety block
        const blockReason = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason;
        lastErr = `${model}: empty response${blockReason ? " (" + blockReason + ")" : ""}`;
      }
      throw new Error(lastErr || "All Gemini models failed");
    }
  },
  groq: {
    name: "Groq (free, fast)",
    hint: "Free at console.groq.com/keys — very fast responses.",
    async call(apiKey, systemPrompt, userMessage, maxTokens) {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          max_tokens: maxTokens || 80,
          temperature: 0.95
        })
      });
      if (!resp.ok) throw new Error("Groq " + resp.status);
      const data = await resp.json();
      return data?.choices?.[0]?.message?.content?.trim() || "";
    }
  },
  openai: {
    name: "OpenAI (paid)",
    hint: "Requires a paid API key from platform.openai.com.",
    async call(apiKey, systemPrompt, userMessage, maxTokens) {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          max_tokens: maxTokens || 80,
          temperature: 0.95
        })
      });
      if (!resp.ok) throw new Error("OpenAI " + resp.status);
      const data = await resp.json();
      return data?.choices?.[0]?.message?.content?.trim() || "";
    }
  },
  anthropic: {
    name: "Anthropic Claude (paid)",
    hint: "Requires a paid API key from console.anthropic.com.",
    async call(apiKey, systemPrompt, userMessage, maxTokens) {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: maxTokens || 80,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }]
        })
      });
      if (!resp.ok) throw new Error("Anthropic " + resp.status);
      const data = await resp.json();
      return data?.content?.[0]?.text?.trim() || "";
    }
  }
};

function aiIsEnabled() {
  return !!(settings && settings.aiEnabled && settings.aiApiKey && settings.aiProvider);
}

async function aiCall(systemPrompt, userMessage, maxTokens) {
  if (!aiIsEnabled()) {
    console.info("[ai] skipped: not enabled or no key");
    return null;
  }
  const provider = AI_PROVIDERS[settings.aiProvider];
  if (!provider) {
    console.warn("[ai] unknown provider:", settings.aiProvider);
    return null;
  }
  console.info("[ai] calling", settings.aiProvider, "maxTokens=" + (maxTokens || 80));
  try {
    const result = await provider.call(settings.aiApiKey, systemPrompt, userMessage, maxTokens);
    console.info("[ai] ok:", (result || "").slice(0, 120));
    return result;
  } catch (e) {
    console.warn("[ai] FAILED:", e.message);
    return null;
  }
}

// Public helpers for the game

// Single-word Ovilus response. Returns a word or null.
async function aiOvilusWord(context) {
  const prompt = `The investigator is in the ${context.roomName}. ${context.detail || ""}`.trim();
  const raw = await aiCall(AI_SYSTEM_PROMPT_OVILUS, prompt, 20);
  if (!raw) return null;
  // Sanitize: strip punctuation, take the most-meaningful line
  const line = raw.split(/[\n\r]/)[0] || "";
  return line.replace(/[^\w\s'-]/g, "").trim().toLowerCase();
}

// House-voice answer to a free-text question.
async function aiHouseResponse(question, context) {
  const userMsg = `The investigator, standing in the ${context.roomName}, asks aloud: "${question}"\n\nContext for you (do not reveal directly): they have read ${context.docsRead} documents and logged ${context.evidenceCount} pieces of evidence. Aggression is "${context.tier}". Time: ${context.when}.`;
  const raw = await aiCall(AI_SYSTEM_PROMPT_HOUSE, userMsg, 180);
  if (!raw) return null;
  return raw.trim();
}

// Quick test call — used by the Settings "Test connection" button.
// Uses a totally neutral prompt (no horror themes) so safety filters can't
// block the test, and a high token budget so thinking-mode models can reply.
// Bypasses the aiCall wrapper so errors propagate with their real messages.
async function aiTestConnection() {
  if (!aiIsEnabled()) return { ok: false, error: "Not enabled or no key" };
  const provider = AI_PROVIDERS[settings.aiProvider];
  if (!provider) return { ok: false, error: "Unknown provider: " + settings.aiProvider };
  console.info("[ai-test] calling", settings.aiProvider);
  try {
    const resp = await provider.call(
      settings.aiApiKey,
      "You reply briefly and politely.",
      "Say hello in one word.",
      200
    );
    console.info("[ai-test] ok:", resp);
    if (resp) return { ok: true, response: resp };
    return { ok: false, error: "Provider returned empty text. Check F12 console for details." };
  } catch (e) {
    console.warn("[ai-test] FAILED:", e.message, e);
    return { ok: false, error: e.message };
  }
}
