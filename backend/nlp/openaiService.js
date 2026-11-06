import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are MediConnect AI, a helpful medical assistant on a doctor appointment platform.

Rules:
- Be empathetic, clear, and solution-focused
- Provide practical home care tips when appropriate
- Always recommend consulting a doctor for persistent or severe symptoms
- For emergencies, tell users to call 108 or 112 immediately
- Never claim to diagnose definitively or replace a doctor
- Use markdown: **bold** for headings, bullet points (•) for lists
- Keep responses under 350 words
- Only mention doctors that are provided in the context — never invent names
- Preserve doctor names, fees (₹), and specialties exactly as given`;

let client = null;

export function isOpenAIAvailable() {
    return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function getClient() {
    if (!isOpenAIAvailable()) return null;
    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return client;
}

function buildDoctorContext(doctors = []) {
    if (!doctors.length) return 'No doctors listed for this query.';
    return doctors
        .map((d) => `Dr. ${d.name} — ${d.speciality}, ₹${d.fees}, ${d.experience}`)
        .join('\n');
}

/**
 * Enhance the rule-based NLP response using OpenAI for natural, personalized replies.
 */
export async function enhanceWithOpenAI({
    userMessage,
    intent,
    baseResponse,
    doctors = [],
    specialty,
    conversationHistory = [],
}) {
    const openai = getClient();
    if (!openai) return baseResponse;

    const historyMessages = conversationHistory
        .slice(-6)
        .filter((m) => m?.content && (m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content).slice(0, 500),
        }));

    const userPrompt = `User message: "${userMessage}"

Detected intent: ${intent}
Recommended specialty: ${specialty || 'general'}
Available doctors on MediConnect:
${buildDoctorContext(doctors)}

Base medical guidance (keep all safety warnings and doctor details):
---
${baseResponse}
---

Rewrite as a personalized MediConnect reply. Address the user's exact words. Keep all critical medical advice and listed doctors.`;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...historyMessages,
                { role: 'user', content: userPrompt },
            ],
            max_tokens: 700,
            temperature: 0.35,
        });

        const enhanced = completion.choices[0]?.message?.content?.trim();
        return enhanced || baseResponse;
    } catch (error) {
        console.error('OpenAI enhancement failed:', error.message);
        return baseResponse;
    }
}
