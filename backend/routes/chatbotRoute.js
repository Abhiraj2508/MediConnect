import express from 'express';
import { chat, getSuggestions, getDoctorsForSpecialty, retrainChatbot, getChatbotStatus } from '../controllers/chatbotController.js';

const chatbotRouter = express.Router();

// Chat endpoint - no auth required for basic queries
chatbotRouter.post('/chat', chat);

// NLP + OpenAI status
chatbotRouter.get('/status', getChatbotStatus);

// Get quick suggestions
chatbotRouter.get('/suggestions', getSuggestions);

// Get doctors for a specific specialty
chatbotRouter.get('/doctors/:specialty', getDoctorsForSpecialty);

// Retrain NLP model (add auth in production)
chatbotRouter.post('/retrain', retrainChatbot);

export default chatbotRouter;
