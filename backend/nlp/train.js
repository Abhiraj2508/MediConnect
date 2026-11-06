import { NlpManager } from 'node-nlp';
import path from 'path';
import { fileURLToPath } from 'url';
import { intents } from './trainingData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MODEL_PATH = path.join(__dirname, 'models', 'chatbot-model.nlp');

const CONFIDENCE_THRESHOLD = 0.55;

export async function trainChatbotModel() {
    const manager = new NlpManager({
        languages: ['en'],
        forceNER: true,
        nlu: { log: false },
    });

    for (const intent of intents) {
        for (const utterance of intent.utterances) {
            manager.addDocument('en', utterance, intent.name);
        }
    }

    console.log('Training NLP model...');
    await manager.train();
    manager.save(MODEL_PATH);
    console.log(`Model saved to ${MODEL_PATH}`);
    return manager;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
    trainChatbotModel()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('Training failed:', err);
            process.exit(1);
        });
}

export { CONFIDENCE_THRESHOLD };
