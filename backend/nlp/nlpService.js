import { NlpManager } from 'node-nlp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MODEL_PATH, CONFIDENCE_THRESHOLD, trainChatbotModel } from './train.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let manager = null;
let loadPromise = null;

async function ensureModelExists() {
    if (!fs.existsSync(MODEL_PATH)) {
        console.log('NLP model not found. Training initial model...');
        await trainChatbotModel();
    }
}

export async function initNlp() {
    if (manager) return manager;
    if (loadPromise) return loadPromise;

    loadPromise = loadModel();
    return loadPromise;
}

async function loadModel() {
    await ensureModelExists();
    const nlp = new NlpManager({ languages: ['en'], forceNER: true, nlu: { log: false } });
    nlp.load(MODEL_PATH);
    manager = nlp;
    console.log('MediConnect chatbot NLP model loaded');
    return manager;
}

export async function reloadNlp() {
    manager = null;
    loadPromise = null;
    return initNlp();
}

/**
 * Classify user message into an intent using the trained NLP model.
 * Falls back to keyword hints when confidence is low.
 */
export async function classifyIntent(message) {
    const nlp = await initNlp();
    const result = await nlp.process('en', message);
    const intent = result.intent || 'none';
    const score = result.score ?? 0;

    if (intent !== 'None' && intent !== 'none' && score >= CONFIDENCE_THRESHOLD) {
        return { intent, score, source: 'nlp' };
    }

    const fallback = keywordFallback(message);
    return { intent: fallback, score: 0, source: 'fallback' };
}

/** Lightweight fallback when NLP confidence is below threshold */
function keywordFallback(message) {
    const text = message.toLowerCase();

    if (/emergency|chest pain|heart attack|stroke|unconscious|can't breathe|cannot breathe|suicide/.test(text)) {
        return 'emergency';
    }
    if (/^(hello|hi|hey)\b|good (morning|evening|afternoon)/.test(text)) {
        return 'greeting';
    }
    if (/headache|migraine|head pain/.test(text)) return 'symptom.headache';
    if (/fever|cold|cough|flu|throat|sneez/.test(text)) return 'symptom.fever_cold';
    if (/skin|acne|pimple|rash|itch|eczema|dandruff|hair fall/.test(text)) return 'symptom.skin';
    if (/stomach|acidity|constipation|diarrhea|nausea|vomit|bloat|gas|digest/.test(text)) {
        return 'symptom.stomach';
    }
    if (/period|pregnancy|gynec|pcod|pcos|menstrual/.test(text)) return 'symptom.womens_health';
    if (/child|baby|kid|infant|toddler|vaccin|pediatric/.test(text)) return 'symptom.child_health';
    if (/back pain|joint|knee|arthritis|muscle|sprain|neck pain|shoulder/.test(text)) {
        return 'symptom.pain';
    }
    if (/stress|anxiety|depress|insomnia|mental|panic|worried|sad/.test(text)) {
        return 'symptom.mental_health';
    }
    if (/eye|vision|sight|glasses|red eye/.test(text)) return 'symptom.eye';
    if (/book|appointment|schedule/.test(text)) return 'booking';
    if (/doctor|specialist|show me|list/.test(text)) return 'find_doctor';
    if (/thank/.test(text)) return 'thanks';

    return 'none';
}
