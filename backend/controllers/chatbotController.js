import doctorModel from "../models/doctorModel.js";
import { classifyIntent } from "../nlp/nlpService.js";
import { enhanceWithOpenAI, isOpenAIAvailable } from "../nlp/openaiService.js";

const formatDoctorInfo = (doctor) => {
    return `**Dr. ${doctor.name}** - ${doctor.speciality}
   • Experience: ${doctor.experience}
   • Fees: ₹${doctor.fees}
   • Degree: ${doctor.degree}`;
};

const getDoctorsBySpecialty = async (specialty) => {
    const doctors = await doctorModel.find({
        speciality: { $regex: specialty, $options: 'i' },
        available: true
    }).select('name speciality experience fees degree image').limit(3);
    return doctors;
};

const intentHandlers = {
    emergency: async () => ({
        response: `🚨 **EMERGENCY - IMMEDIATE ACTION REQUIRED**

**Call emergency services NOW: 108 (Ambulance) or 112**

While waiting for help:
• Stay calm and don't move the patient unnecessarily
• If conscious, keep them comfortable and talking
• Loosen any tight clothing
• If not breathing, begin CPR if trained
• Do NOT give food or water

**This is not something to book an appointment for. Get emergency help immediately.**`,
        doctors: [],
        actionType: 'emergency'
    }),

    greeting: async () => ({
        response: `Hello! I'm MediConnect AI, here to help solve your health concerns.

**Tell me what's bothering you** and I'll:
✅ Suggest immediate relief measures
✅ Recommend the right specialist
✅ Show you available doctors you can book right now

What health issue can I help you with today?`,
        doctors: [],
        actionType: 'greeting'
    }),

    'symptom.headache': async (message) => {
        const doctors = await getDoctorsBySpecialty('Neurologist');
        const generalDocs = await getDoctorsBySpecialty('General Physician');

        return {
            response: `**Solutions for Your Headache:**

**Immediate Relief:**
• Take OTC pain reliever (Paracetamol 500mg)
• Rest in a dark, quiet room
• Apply cold compress to forehead
• Stay hydrated - drink water
• Massage temples gently

**When to See a Doctor:**
• Headache persists more than 2-3 days
• Severe/worst headache of your life
• Accompanied by fever, stiff neck, confusion
• After head injury

**Recommended Doctors Available Now:**
${doctors.length > 0 ? doctors.map(d => formatDoctorInfo(d)).join('\n\n') : 'No Neurologists currently available'}

${generalDocs.length > 0 ? `\n**For immediate consultation:**\n${formatDoctorInfo(generalDocs[0])}` : ''}

👉 **Click on "Doctors" in the menu and select your preferred doctor to book an appointment.**`,
            doctors: [...doctors, ...generalDocs.slice(0, 1)],
            actionType: 'symptom',
            specialty: 'Neurologist'
        };
    },

    'symptom.fever_cold': async () => {
        const doctors = await getDoctorsBySpecialty('General Physician');

        return {
            response: `**Solutions for Fever/Cold/Flu:**

**Immediate Relief:**
• Take Paracetamol (500-650mg) for fever above 100°F
• Stay hydrated - warm water, soups, herbal tea
• Rest as much as possible
• Gargle with warm salt water for sore throat
• Steam inhalation for congestion
• Honey with warm water for cough

**Home Remedies:**
• Ginger-tulsi tea
• Turmeric milk before bed
• Vitamin C rich foods (citrus fruits)

**See a Doctor If:**
• Fever above 103°F or lasting more than 3 days
• Difficulty breathing
• Chest pain
• Severe throat pain

**Available General Physicians:**
${doctors.length > 0 ? doctors.map(d => formatDoctorInfo(d)).join('\n\n') : 'No doctors currently available'}

👉 **Book an appointment now for proper diagnosis and prescription.**`,
            doctors,
            actionType: 'symptom',
            specialty: 'General Physician'
        };
    },

    'symptom.skin': async (message) => {
        const doctors = await getDoctorsBySpecialty('Dermatologist');
        const text = message.toLowerCase();

        let specificAdvice = '';
        if (text.includes('acne') || text.includes('pimple')) {
            specificAdvice = `**For Acne/Pimples:**
• Wash face twice daily with gentle cleanser
• Don't pop or squeeze pimples
• Use non-comedogenic products
• Apply benzoyl peroxide or salicylic acid
• Keep hands away from face`;
        } else if (text.includes('itch') || text.includes('rash') || text.includes('allergy')) {
            specificAdvice = `**For Itching/Rash:**
• Apply calamine lotion
• Take antihistamine (Cetirizine)
• Avoid scratching
• Wear loose cotton clothes
• Use mild, fragrance-free soap`;
        } else if (text.includes('hair fall') || text.includes('dandruff')) {
            specificAdvice = `**For Hair Issues:**
• Use anti-dandruff shampoo (ketoconazole)
• Oil massage 2-3 times a week
• Avoid hot water on scalp
• Eat protein-rich diet
• Reduce stress`;
        }

        return {
            response: `**Solutions for Your Skin Concern:**

${specificAdvice || `**General Skin Care:**
• Keep the area clean and dry
• Avoid harsh soaps
• Don't scratch affected areas
• Use moisturizer for dry skin`}

**When to See a Dermatologist:**
• Condition persists more than a week
• Spreading to other areas
• Signs of infection (pus, warmth)
• Severe discomfort

**Available Dermatologists:**
${doctors.length > 0 ? doctors.map(d => formatDoctorInfo(d)).join('\n\n') : 'No Dermatologists currently available'}

👉 **Book an appointment for proper diagnosis and prescription treatment.**`,
            doctors,
            actionType: 'symptom',
            specialty: 'Dermatologist'
        };
    },

    'symptom.stomach': async (message) => {
        const doctors = await getDoctorsBySpecialty('Gastroenterologist');
        const generalDocs = await getDoctorsBySpecialty('General Physician');
        const text = message.toLowerCase();

        let specificAdvice = '';
        if (text.includes('acidity') || text.includes('gastric') || text.includes('indigestion')) {
            specificAdvice = `**For Acidity/Indigestion:**
• Take antacid (Gelusil/Digene)
• Drink cold milk
• Avoid spicy, oily food
• Don't lie down after eating
• Eat smaller, frequent meals`;
        } else if (text.includes('constipation')) {
            specificAdvice = `**For Constipation:**
• Drink plenty of water (8-10 glasses)
• Eat fiber-rich foods (fruits, vegetables)
• Take Isabgol (psyllium husk) with water
• Exercise regularly
• Don't ignore urge to go`;
        } else if (text.includes('diarrhea') || text.includes('loose motion')) {
            specificAdvice = `**For Diarrhea:**
• ORS (Oral Rehydration Solution) - MOST IMPORTANT
• BRAT diet (Banana, Rice, Apple, Toast)
• Avoid dairy and spicy foods
• Take probiotics
• See doctor if blood in stool or fever`;
        }

        return {
            response: `**Solutions for Your Digestive Issue:**

${specificAdvice || `**General Digestive Care:**
• Stay hydrated
• Eat light, easily digestible food
• Avoid oily and spicy food
• Take probiotics (curd/yogurt)`}

**See a Doctor If:**
• Symptoms last more than 2-3 days
• Blood in vomit or stool
• Severe abdominal pain
• High fever with vomiting
• Signs of dehydration

**Available Gastroenterologists:**
${doctors.length > 0 ? doctors.map(d => formatDoctorInfo(d)).join('\n\n') : generalDocs.length > 0 ? `\n**General Physicians:**\n${generalDocs.map(d => formatDoctorInfo(d)).join('\n\n')}` : 'No doctors currently available'}

👉 **Book an appointment for proper treatment.**`,
            doctors: doctors.length > 0 ? doctors : generalDocs,
            actionType: 'symptom',
            specialty: 'Gastroenterologist'
        };
    },

    'symptom.womens_health': async (message) => {
        const doctors = await getDoctorsBySpecialty('Gynecologist');
        const text = message.toLowerCase();

        let specificAdvice = '';
        if (text.includes('cramp') || text.includes('period pain')) {
            specificAdvice = `**For Period Cramps:**
• Take Mefenamic acid or Ibuprofen
• Apply heating pad to lower abdomen
• Light exercise/yoga
• Drink warm water/herbal tea
• Gentle massage with essential oils`;
        } else if (text.includes('irregular')) {
            specificAdvice = `**For Irregular Periods:**
• Maintain healthy weight
• Reduce stress
• Exercise regularly
• Track your cycle
• **Consult a gynecologist** - could indicate PCOS/hormonal issues`;
        }

        return {
            response: `**Solutions for Your Concern:**

${specificAdvice || `**General Advice:**
• Maintain menstrual hygiene
• Track your cycle
• Eat iron-rich foods
• Stay hydrated`}

**When to See a Gynecologist:**
• Irregular or missed periods
• Severe pain during periods
• Heavy bleeding
• Unusual discharge
• Pregnancy planning/concerns

**Available Gynecologists:**
${doctors.length > 0 ? doctors.map(d => formatDoctorInfo(d)).join('\n\n') : 'No Gynecologists currently available'}

👉 **Book a confidential appointment with a gynecologist.**`,
            doctors,
            actionType: 'symptom',
            specialty: 'Gynecologist'
        };
    },

    'symptom.child_health': async () => {
        const doctors = await getDoctorsBySpecialty('Pediatrician');

        return {
            response: `**For Your Child's Health:**

**General Child Care:**
• Ensure proper nutrition and hydration
• Monitor temperature if fever suspected
• Keep vaccinations up to date
• Maintain hygiene

**When to See a Pediatrician Immediately:**
• High fever (above 102°F)
• Difficulty breathing
• Refusing to eat/drink
• Unusual rash or spots
• Excessive crying/lethargy
• Vomiting/diarrhea (risk of dehydration)

**Available Pediatricians:**
${doctors.length > 0 ? doctors.map(d => formatDoctorInfo(d)).join('\n\n') : 'No Pediatricians currently available'}

👉 **Book an appointment with a pediatrician for proper care.**`,
            doctors,
            actionType: 'symptom',
            specialty: 'Pediatricians'
        };
    },

    'symptom.pain': async () => {
        const doctors = await getDoctorsBySpecialty('General Physician');

        return {
            response: `**Solutions for Pain/Joint Issues:**

**Immediate Relief:**
• Rest the affected area
• Apply ice pack (first 48 hours) then heat
• Take OTC pain reliever (Ibuprofen/Diclofenac)
• Gentle stretching exercises
• Maintain good posture

**For Back Pain:**
• Sleep on firm mattress
• Avoid lifting heavy objects
• Use lumbar support while sitting
• Hot water bag for muscle relaxation

**See a Doctor If:**
• Pain persists more than a week
• Numbness or tingling
• Weakness in limbs
• Pain after injury
• Fever with pain

**Available Doctors:**
${doctors.length > 0 ? doctors.map(d => formatDoctorInfo(d)).join('\n\n') : 'No doctors currently available'}

👉 **Book an appointment for proper examination.**`,
            doctors,
            actionType: 'symptom',
            specialty: 'General Physician'
        };
    },

    'symptom.mental_health': async () => {
        const doctors = await getDoctorsBySpecialty('General Physician');

        return {
            response: `**Support for Your Mental Wellbeing:**

**Immediate Self-Care:**
• Practice deep breathing (4-7-8 technique)
• Talk to someone you trust
• Take a walk in nature
• Limit caffeine and alcohol
• Maintain regular sleep schedule
• Exercise regularly - even 20 mins helps

**For Better Sleep:**
• Fixed sleep/wake time
• No screens 1 hour before bed
• Keep room dark and cool
• Avoid heavy meals at night
• Try relaxation techniques

**Please Reach Out If:**
• Feeling hopeless or worthless
• Having thoughts of self-harm
• Unable to function daily
• Symptoms persist over 2 weeks

**iCall Helpline: 9152987821**
**Vandrevala Foundation: 1860-2662-345**

**Available Doctors for Consultation:**
${doctors.length > 0 ? doctors.map(d => formatDoctorInfo(d)).join('\n\n') : 'No doctors currently available'}

👉 **Your mental health matters. Book an appointment to talk to a doctor.**`,
            doctors,
            actionType: 'symptom',
            specialty: 'General Physician'
        };
    },

    'symptom.eye': async () => {
        const doctors = await getDoctorsBySpecialty('General Physician');

        return {
            response: `**Solutions for Eye Concerns:**

**Immediate Care:**
• Rest your eyes from screens every 20 mins
• Use artificial tears for dryness
• Wash eyes with clean, cool water
• Don't rub eyes
• Wear sunglasses outdoors

**For Red/Irritated Eyes:**
• Cold compress
• Avoid touching/rubbing
• Remove contact lenses if wearing
• Use preservative-free eye drops

**See a Doctor Urgently If:**
• Sudden vision changes
• Severe eye pain
• Injury to eye
• Discharge from eye
• Flashes of light or floaters

**Available Doctors:**
${doctors.length > 0 ? doctors.map(d => formatDoctorInfo(d)).join('\n\n') : 'No doctors currently available'}

👉 **Book an appointment for proper eye examination.**`,
            doctors,
            actionType: 'symptom',
            specialty: 'General Physician'
        };
    },

    booking: async () => {
        const allDoctors = await doctorModel.find({ available: true }).select('name speciality experience fees').limit(5);

        return {
            response: `**How to Book an Appointment:**

**Step 1:** Click on **"Doctors"** in the navigation menu

**Step 2:** Choose a specialty or browse all doctors

**Step 3:** Click on a doctor to see their profile

**Step 4:** Select an available date and time slot

**Step 5:** Confirm your booking

**Step 6:** Pay online or at the clinic

**Currently Available Doctors:**
${allDoctors.length > 0 ? allDoctors.map(d => formatDoctorInfo(d)).join('\n\n') : 'No doctors currently available'}

**Need help choosing?** Tell me your symptoms and I'll recommend the right specialist!`,
            doctors: allDoctors,
            actionType: 'booking'
        };
    },

    find_doctor: async () => {
        const allDoctors = await doctorModel.find({ available: true }).select('name speciality experience fees').limit(6);

        return {
            response: `**Available Doctors on MediConnect:**

${allDoctors.length > 0 ? allDoctors.map(d => formatDoctorInfo(d)).join('\n\n') : 'No doctors currently available'}

**Specialties Available:**
• General Physician - Common illnesses & checkups
• Gynecologist - Women's health
• Dermatologist - Skin conditions
• Pediatrician - Children's health
• Neurologist - Brain & nerves
• Gastroenterologist - Digestive issues

👉 **Tell me your health concern and I'll recommend the best specialist for you!**`,
            doctors: allDoctors,
            actionType: 'listing'
        };
    },

    thanks: async () => ({
        response: `You're welcome! I'm glad I could help. 

**Remember:**
• Take medications as advised
• Don't hesitate to book an appointment if symptoms persist
• Stay hydrated and rest well

Is there anything else I can help you with? Feel free to ask about any other health concerns!`,
        doctors: [],
        actionType: 'closing'
    }),

    none: async () => {
        const allDoctors = await doctorModel.find({ available: true }).select('name speciality experience fees').limit(3);

        return {
            response: `I'm here to help solve your health concerns!

**Please describe:**
• What symptoms are you experiencing?
• How long have you had them?
• Any other relevant details?

**Or ask me about:**
• Specific symptoms (headache, fever, skin issues, etc.)
• Finding a specialist
• Booking an appointment
• Home remedies

**Quick Options:**
• "I have a headache"
• "Show me available doctors"
• "Help me book an appointment"

${allDoctors.length > 0 ? `\n**Some Available Doctors:**\n${allDoctors.map(d => `• Dr. ${d.name} - ${d.speciality}`).join('\n')}` : ''}`,
            doctors: allDoctors,
            actionType: 'clarification'
        };
    },
};

const SKIP_OPENAI_INTENTS = new Set(['emergency']);

const generateSolutionResponse = async (userMessage, conversationHistory = []) => {
    const { intent, score, source } = await classifyIntent(userMessage);
    const handler = intentHandlers[intent] || intentHandlers.none;

    const result = await handler(userMessage);
    let response = result.response;
    let aiEnhanced = false;

    if (!SKIP_OPENAI_INTENTS.has(intent) && isOpenAIAvailable()) {
        response = await enhanceWithOpenAI({
            userMessage,
            intent,
            baseResponse: result.response,
            doctors: result.doctors,
            specialty: result.specialty,
            conversationHistory,
        });
        aiEnhanced = true;
    }

    return {
        ...result,
        response,
        intent,
        confidence: score,
        classificationSource: source,
        aiEnhanced: aiEnhanced && isOpenAIAvailable(),
    };
};

export const getChatbotStatus = async (req, res) => {
    try {
        const fs = await import('fs');
        const { MODEL_PATH } = await import('../nlp/train.js');
        const modelExists = fs.existsSync(MODEL_PATH);

        res.json({
            success: true,
            nlp: { trained: modelExists, modelPath: MODEL_PATH },
            openai: { enabled: isOpenAIAvailable(), model: process.env.OPENAI_MODEL || 'gpt-4o-mini' },
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const chat = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message) {
            return res.json({ success: false, message: "Message is required" });
        }

        const result = await generateSolutionResponse(message, conversationHistory);

        res.json({
            success: true,
            response: result.response,
            doctors: result.doctors,
            actionType: result.actionType,
            specialty: result.specialty || null,
            intent: result.intent,
            confidence: result.confidence,
            aiEnhanced: result.aiEnhanced,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const getSuggestions = async (req, res) => {
    try {
        const suggestions = [
            "I have a headache",
            "Fever and cold",
            "Skin problem",
            "Stomach pain",
            "Show doctors",
            "Book appointment"
        ];

        res.json({ success: true, suggestions });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const getDoctorsForSpecialty = async (req, res) => {
    try {
        const { specialty } = req.params;

        const doctors = await doctorModel.find({
            speciality: { $regex: specialty, $options: 'i' },
            available: true
        }).select('name speciality experience fees degree image address');

        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const retrainChatbot = async (req, res) => {
    try {
        const { trainChatbotModel } = await import('../nlp/train.js');
        const { reloadNlp } = await import('../nlp/nlpService.js');
        await trainChatbotModel();
        await reloadNlp();
        res.json({ success: true, message: 'Chatbot NLP model retrained successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
