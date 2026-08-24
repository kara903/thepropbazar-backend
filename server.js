const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ override: true });

const app = express();
const PORT = process.env.PORT || 3000;
const LEADS_FILE = path.join(__dirname, 'leads_conversations.json');

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Serve static frontend files
app.use(express.static(__dirname));

// Health check endpoint for keep-alive
app.get('/health', (req, res) => res.json({ status: 'ok', time: Date.now() }));

// Load and parse PROPERTY_DATA from details-data.js
let propertyDataSummary = "";
try {
    const dataFileContent = fs.readFileSync(path.join(__dirname, 'details-data.js'), 'utf8');
    const sandbox = {};
    const fn = new Function('sandbox', dataFileContent + '; sandbox.PROPERTY_DATA = PROPERTY_DATA;');
    fn(sandbox);
    const data = sandbox.PROPERTY_DATA;

    // Create a clean summary for AI context
    propertyDataSummary = JSON.stringify(data, (key, value) => {
        if (key === 'flatPhotos' || key === 'flatVideos' || key === 'photos' || key === 'videos') {
            return undefined;
        }
        return value;
    }, 2);
    console.log("✓ Loaded PROPERTY_DATA successfully for AI Voice Knowledge Base.");
} catch (e) {
    console.warn("Notice: Using fallback property summary:", e.message);
}

const { searchVectorDatabase } = require('./vector-search');

// ============================================================================
// 🎯 LAYER 2: CORE GUARDRAILS & CONSULTANT PERSONA
// ============================================================================
const BASE_VOICE_INSTRUCTIONS = `
You are the AI Property Consultant at The Propbazar Haridwar.
You were created and placed by Rahul Dwivedi ji (Founder of The Propbazar, 11-12 years experience in Haridwar real estate) to help clients transparently with comprehensive knowledge of all Haridwar societies.
You speak naturally, friendly, and honestly in spoken Hindi.

CORE BEHAVIOR RULES:
1. - NEVER add unsolicited invitations like "आप ऑफिस आ जाइए", "ओनर से मिलवा देंगे", "साइट विजिट करवा देंगे" or "ध्यान रखिएगा लीजहोल्ड है" unless the customer specifically asks for a site visit, office location, process, or legal details.
2. PURE SPOKEN HINDI:
   - Speak natural, conversational Hindi. Use "स्क्वायर फीट", "27 से 28 लाख", "1 करोड़ 35 लाख", "1 करोड़ 50 लाख".
   - DO NOT USE FORMAL/BOOKISH WORDS like "स्थित" (sthit). Speak naturally using "है", "पड़ता है", "आता है", "बना हुआ है"।
   - Never output meta-notes, bullet points, headers, or English thinking text.
3. MANTRA HAPPY HOMES 2 BHK FOCUS:
   - Mantra Happy Homes is our #1 primary focus project for all 2 BHK inquiries.
   - IMPORTANT: Mantra Happy Homes has ONLY 2 BHK flats (NO 1 BHK, NO 3 BHK). If someone asks for 1 BHK or 3 BHK in Mantra, clearly state: "मंत्रा हैप्पी होम्स में 1 BHK या 3 BHK नहीं आते हैं, यहाँ केवल 2 BHK फ्लैट्स ही मिलते हैं।"
   - When customer asks for 2 BHK options or 2 BHK budget, highlight Mantra Happy Homes (6-acre compact society, 810 sqft @ 27-28L, 950 sqft @ 34-35L, 1010 sqft @ 38L, temple at entrance, 100% freehold).
4. NO ROBOTIC FILLERS OR GREETINGS:
   - Do NOT add trailing fillers like "क्या आप और जानना चाहते हैं?" or "बताइए?".
   - Do NOT repeat greetings like "नमस्ते" or "हेलो" mid-conversation.
5. OPEN BUDGET HANDLING:
   - If customer asks a budget WITHOUT BHK (e.g. "20 लाख में कोई फ्लैट मिल जाएगा?"): Ask: "आप बताएंगे आपको 2 BHK की नीड है कि 1 BHK की?"
   - If 1 BHK for 20-25L / 25-26L: "हाँ जी, 1 BHK में ऑप्शन मिल जाएगा जैसे दीप गंगा में 740 स्क्वायर फीट लगभग 26 लाख से शुरू हो जाता है। वहीं दूसरी ओर हरिद्वार ग्रीन्स में आपको 1 BHK 16-17 लाख से मिल जाएगा।"
   - If 2 BHK for 20L: "जी 2 BHK इस प्राइस में थोड़ा मुश्किल है। अगर आप थोड़ा बजट बढ़ा सकते हैं तो 27 से 28 लाख तक आपको मंत्रा हैप्पी होम्स में 810 स्क्वायर फीट का 2 BHK मिल जाएगा।"
   - If 30-35L 2 BHK: Pitch Mantra happy home's flats.
6. MAXIMUM BUDGET & BOUNDARY HANDLING (ABOVE 1.50 CR):
   - Our most expensive & largest flat in Haridwar is Jurs Country 4 BHK (2710 sqft @ 1 Crore 50 Lakh).
   - If customer asks for properties above 1.50 Crore, asks "इससे महंगा भी कुछ है?", "1.50 करोड़ से ऊपर कुछ है?", or mentions higher budgets (2 Cr, 4 Cr):
     Clearly and politely say: "नहीं जी, हमारे पास सबसे महंगा और बड़ा ऑप्शन जर्स कंट्री में 4 BHK (1 करोड़ 50 लाख) तक का ही है, इससे ऊपर का फ्लैट अभी हमारे पास उपलब्ध नहीं है।"
   - Never repeat the same 1.50 Crore line in a loop.
7. CASUAL BANTER, JOKES & TEASING (HUMAN CONSULTANT TOUCH):
   - If customer teases you, makes jokes, laughs, uses idioms, sarcasm, or talks casually (e.g. "तोता बना दिया", "राम नाम जप कर लेता", "तुम तो रोबोट हो"):
     Reply warmly and sportingly like a friendly consultant with wit, and then guide back to real estate if relevant.
8. NO REPETITIVE LOOPING (CONTEXTUAL INTELLIGENCE):
   - If you have already stated a property price or size in the previous turn and customer asks a follow-up ("इससे ऊपर?", "कुछ और बताओ?"), do NOT repeat the exact same sentence. Acknowledge what the customer said directly and answer contextually.
`;

// ============================================================================
// 📊 LAYER 1: IMMUTABLE FACTUAL FOUNDATION (MASTER DATA MATRIX)
// ============================================================================
const MASTER_FACTUAL_MATRIX = `
1. MANTRA HAPPY HOMES:
   - Delivery Year: 2019 (इसको लगभग 7-8 साल हुए हैं, सबसे नई फ्लैट सोसाइटी है).
   - Location: Opp. Raja Biscuit Chowk, near Shivalik Nagar & Pentagon Mall (~1 km).
   - Configurations: ONLY 2 BHK flats available (NO 1 BHK, NO 3 BHK).
   - 2 BHK Sizes & Prices: 810 sqft (27-28 Lakh), 950 sqft (34-35 Lakh), 1010 sqft (~38 Lakh).
   - Legal Status: 100% Freehold, RERA & HRDA approved, direct immediate registry.
   - Rental: 950 sqft furnished yields ~18,000 to 20,000/month.
   - 810 sqft furnished yields ~15,000 to 18,000/month.
   - Features: 6 Acres compact society, temple at entrance, park, 24/7 security, power/water backup, pool, club, gym, jogging track, amphitheatre, badminton court, 2 green parks, commercial.

2. HARIDWAR GREENS:
   - Delivery Year: 2017.
   - Location: Roshanabad, Haridwar (near SIDCUL & Roshnabad stadium).
   - Land & Type: 50 Acres massive open gated township (Flats only; NO villas, NO plots).
   - Configurations & Prices:
     * 1 BHK: 575 sqft (starts ~17-18 Lakh).
     * 2 BHK: ~1075 sqft (starts ~38 Lakh).
     * 3 BHK: 1410, 1484, 1700 sqft (55-75Lakh).
   - Amenities: Club House & Gym, massive green parks, wide roads, BML Munjal School inside campus, 24/7 security, water/power backup, shopping complex.
   - Legal Status: 100% Freehold, RERA & HRDA approved, direct immediate registry.

3. JURS COUNTRY:
   - Delivery Year: 2013.
   - Location: Main NH-58 Highway near Singh Dwar & Jwalapur (closest society to Har Ki Pauri, 15-20 min drive).
   - Legal Status: 100% Freehold, RERA & HRDA approved, direct immediate registry.
   - Exact Resale Sizes & Prices:
     * 2 BHK: 880 sqft @ 45 Lakh | 980 sqft @ 49 Lakh
     * 3 BHK: 1210 sqft @ 60 Lakh | 1284 sqft @ 65 Lakh | 1388 sqft @ 70 Lakh | 1645 sqft @ 87 Lakh
     * 4 BHK: 2575 sqft @ 1 Crore 35 Lakh | 2710 sqft @ 1 Crore 50 Lakh
     * 5 BHK: 2296 sqft @ 1 Crore 25 Lakh
   - Amenities: Swimming Pool, Gym, Club House, 'The Wisdom Global School' (Nursery to 12th CBSE) inside campus, Temple, park.

4. DEEP GANGA:
   - Delivery Year: 2015.
   - Location: SIDCUL Sector 5-A (~2.5 km from Pentagon Mall, near BHEL).
   - Legal Status: 90-Year Leasehold (transfer deed & agreement).
   - Configurations & Prices:
     * 1 BHK: 740 sqft @ ~26 Lakh starting.
     * 2 BHK: 38 Lakh to 45 Lakh.
     * 3 BHK: 1478 sqft @ ~55 Lakh starting.
   - Features: Commercial shopping complex inside campus, private gym, parks, 24/7 security, water & power backup.

5. ANTRIKSH NRI CITY:
   - Delivery Year: 2014.
   - Location: SIDCUL Sector 9, directly opposite Pentagon Mall.
   - Legal Status: 90-Year Leasehold.
   - Configurations & Prices:
     * 2 BHK: 915 sqft & 1016 sqft (~4400/sqft, ~40-45 Lakh).
     * 3 BHK: 1315 sqft (~58-60 Lakh).
   - Features: Swimming pool, clubhouse, gym, park, Cricket pitch, Basketball court, jogging track, commercial.

6. MY HOME LAND / HOMELAND (PLOTS):
   - Location: SIDCUL / डेंसो चौक साइड (Hill View).
   - Project: 66 Gated Residential Plots (852 sqft to 2218 sqft, e.g. 1000, 1200, 1400 sqft).
   - Price: Starting ~₹3,500 per sq.ft.
   - Status: Under construction, delivery by early 2027.
   - Legal: 100% Freehold, RERA (UKREP11250000688) & HRDA approved.

7. SHREE HARI DARSHAN CITY (HIGHWAY PLOTS):
   - Location: Main NH-58 Highway, बहादराबाद टोल टैक्स के ठीक सामने, हरिद्वार (~2-3 km from Patanjali).
   - Project: 150+ Gated Residential Plots by Vedanta Buildcon (875 sqft to 2217 sqft).
   - Price: Starting ~₹4,500 per sq.ft.
   - Status: Under construction, delivery by early 2027, but families have already started living. Best for immediate home building.
   - Legal: 100% Freehold, RERA approved (UKREP10230000522).

HARIDWAR LANDMARK DISTANCES:
- Pentagon Mall: ~1 km from Mantra, directly opp Antriksh, ~2.5 km from Deep Ganga, ~3-4 km from Greens.
- Roshanabad: Haridwar Greens.
- SIDCUL: Deep Ganga (Sec 5A), Antriksh (Sec 9), Mantra (opp Raja Biscuit Chowk).
- Har Ki Pauri: ~7-8 km from Jurs Country, ~10-12 km from Mantra, ~14-16 km from Greens.
- Patanjali Yogpeeth: ~2-3 km from Shree Hari Darshan, ~10-12 km from Greens.
- Delhi to Haridwar Driving Time: ~5 hours.

COMPANY & TRANSACTION POLICIES:
- Company: 'The Propbazar' (Founder: Rahul Dwivedi ji, 11-12 years experience in Haridwar, MD : Sarita Dwivedi, IT & Marketing : Karan Aswal).
- Office Location: Main SIDCUL, 1 km ahead of Pentagon Mall, Haridwar.
- Office Hours: 9:00 AM to 8:00 PM, Open all 7 days including Sunday.
- Brokerage: 2% below 40 Lakh, 1% above 40 Lakh, negotiable.
- Bank Loans: 80-90% loan assistance via SBI, PNB, and major banks.
- Resale Nature & Society Age: Mantra Happy Homes is ~7-8 years old; all other flat societies (Haridwar Greens, Jurs Country, Deep Ganga, Antriksh) are ~10-12 years old. All are completely delivered with only resale flats. Always tell customer: 'नहीं जी, ये सारी सोसाइटीज काफी पहले डिलीवर हो चुकी हैं, इसलिए यहाँ पे कोई भी फ्रेश फ्लैट नहीं है। आपको यहाँ सारे रीसेल वाले फ्लैट ही मिलेंगे।'
- Non-Uttarakhand Buyers: Unlimited flats; plots up to 2696 sq.ft (250 sq.m).
- Payment Modes: Cheque, RTGS, Bank Transfer all accepted.
- Legal Verification: Lawyer document verification welcomed; team present at Registry Office on registry day.
`;

// ============================================================================
// 🧠 LAYER 3: DYNAMIC JUST-IN-TIME PSYCHE PERSONA SCANNER (<0.001s)
// ============================================================================
function detectCustomerPsyche(message, history = []) {
    const fullText = (history.map(h => (h && h.text) || '').join(' ') + ' ' + (message || '')).toLowerCase();

    // 1. Comparison / Dilemma / Trade-Off Psyche (Evaluated first for vs/fark/better questions)
    if (/(difference|compare|versus|\bvs\b|fark|antar|tulna|dono me|in dono|se behtar|se achha|better than|kisme lu|kisme invest|फर्क|अंतर|तुलना|दोनों में|इन दोनों|से बेहतर|से अच्छा|किसमें लूं)/i.test(fullText)) {
        return {
            type: "COMPARISON_SHOPPER",
            instruction: `🎯 LAYER 3 - ACTIVE OBJECTIVE: COMPARISON & VALUE-FOR-MONEY BUYER
- The customer is evaluating trade-offs between two societies, legal models, or configurations.
- Angle: Clearly explain the HONEST trade-offs (e.g. Deep Ganga offers larger space on 90-yr leasehold vs Mantra offers 100% Freehold immediate registry; Jurs Country is on NH-58 highway closer to Har Ki Pauri vs Greens is 50-acre large campus in Roshanabad).
- Do not criticize any society; present clear value-for-money facts so the customer can decide confidently.`
        };
    }

    // 2. Investor / ROI Psyche
    if (/(rent|rental|kiraya|income|yield|invest|investment|roi|appreciation|growth|कमाई|किराया|इन्वेस्टमेंट|रिटर्न|मुनाफा)/i.test(fullText)) {
        return {
            type: "INVESTOR_ROI",
            instruction: `🎯 LAYER 3 - ACTIVE OBJECTIVE: INVESTOR / ROI BUYER
- The customer's primary focus is rental returns, tenant occupancy, or capital appreciation.
- Angle: Highlight rental income (Mantra 2 BHK furnished yields ₹18,000-20,000/mo near SIDCUL) or high capital appreciation of Highway Plots (Shree Hari Darshan / Homeland).
- Keep responses sharp, analytical, and numbers-focused.`
        };
    }

    // 3. Luxury / Spiritual / Second Home Psyche (exclude bare 'ganga' to prevent Deep Ganga conflict)
    if (/(har ki pauri|har ki podi|ganga ji|ganga ghat|ganga view|temple|mandir|swimming pool|pool|gym|clubhouse|luxury|3 bhk|4 bhk|5 bhk|1 cr|1\.5|crore|पूल|जिम|क्लब|लक्जरी|बड़ा फ्लैट|हर की पौड़ी|हर की पैड़ी|गंगा जी|गंगा घाट|गंगा व्यू|माँ गंगा)/i.test(fullText)) {
        return {
            type: "LUXURY_LIFESTYLE",
            instruction: `🎯 LAYER 3 - ACTIVE OBJECTIVE: LUXURY, SPIRITUAL & SECOND HOME BUYER
- The customer values space, premium lifestyle, peaceful greenery, and proximity to Har Ki Pauri/Ganga.
- Angle: Highlight Jurs Country (Closest to Har Ki Pauri, on highway, school & pool inside campus) and Haridwar Greens (50-acre massive resort lifestyle with 12-month active gym & parks).
- Speak with warmth and respect, emphasizing peace of mind, divine environment, and spacious living.`
        };
    }

    // 4. Safe Family / Budget First-Time Home Buyer (Default)
    return {
        type: "SAFE_FAMILY_BUDGET",
        instruction: `🎯 LAYER 3 - ACTIVE OBJECTIVE: SAFE FAMILY & BUDGET BUYER
- The customer wants safe, secure, freehold home within budget without any legal or financial risk.
- Angle: Highlight 100% Freehold registry, 80-90% easy bank loans (SBI/PNB), gated 24/7 security, and budget options starting from ₹27-28 Lakh in Mantra Happy Homes or ₹16-17 Lakh in Greens.
- Give reassuring, transparent, and trustworthy guidance.`
    };
}

// ============================================================================
// 🚀 /api/chat ENDPOINT (3-LAYER PROMPT + VECTOR RETRIEVAL + GROQ/GEMINI + DIRECT AUDIO)
// ============================================================================
app.post('/api/chat', async (req, res) => {
    const { message, audioBase64, mimeType = "audio/webm", history = [], currentProject = "", currentBhk = "" } = req.body;

    if ((!message || !message.trim()) && !audioBase64) {
        return res.status(400).json({ error: "Message or audio is required." });
    }

    const groqApiKey = process.env.GROQ_API_KEY?.trim();
    const requestedModel = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-20b';
    const geminiApiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
    const geminiModel = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

    try {
        let cleanMessage = (message || "").trim();
        let userTranscript = cleanMessage;
        const recentHistory = Array.isArray(history) ? history.filter(t => t && t.text && t.role).slice(-8) : [];

        function cleanText(txt) {
            if (!txt) return "";
            let s = String(txt).replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            s = s.replace(/\*\*/g, '').replace(/[\#\_\*]/g, '').trim();
            s = s.replace(/(\d+(?:\.\d+)?)\s*[\-–—‑]\s*(\d+(?:\.\d+)?)/g, '$1 से $2');
            s = s.replace(/sq\.?\s*ft\.?/gi, 'स्क्वायर फीट');
            s = s.replace(/sqft/gi, 'स्क्वायर फीट');
            s = s.replace(/sq\s*feet/gi, 'स्क्वायर फीट');
            s = s.replace(/\bSIDCUL\b/gi, 'सिडकुल');
            s = s.replace(/\bBHEL\b/gi, 'भेल');
            s = s.replace(/\bNH[- ]?58\b/gi, 'नेशनल हाईवे 58');
            s = s.replace(/\bRERA\b/gi, 'रेरा');
            // Strip repetitive leading greetings from mid-conversation replies
            s = s.replace(/^(?:राम[\s\-–—]*राम|नमस्ते|नमस्कार|हेलो|हाय|हैलो)\s*(?:जी)?[\s,।!\-–—]*\s*/i, '');
            // Strip trailing generic robotic follow-up questions like 'क्या आप और कुछ जानना चाहते हैं?'
            s = s.replace(/(?:[।!\n]|^)\s*(?:क्या आप (?:और|कोई और|इसके बारे में)[^।!\n]*\?|क्या मैं आपकी और मदद[^।!\n]*\?)\s*$/i, '');
            return s.trim();
        }

        // 🧠 Detect Buyer Psyche (<0.001s instant scanner)
        let activePsyche = detectCustomerPsyche(cleanMessage, recentHistory);

        let retrievalParts = [];
        if (currentProject) retrievalParts.push(`Project: ${currentProject}`);
        if (currentBhk) retrievalParts.push(`BHK: ${currentBhk}`);

        // Include recent history context so vector search understands conversation flow
        if (recentHistory.length > 0) {
            for (const turn of recentHistory.slice(-4)) {
                retrievalParts.push(`${turn.role}: ${turn.text}`);
            }
        }
        if (cleanMessage) {
            retrievalParts.push(`Current customer request: ${cleanMessage}`);
        }

        const retrievalQuery = retrievalParts.join('\n') || "Haridwar properties";

        const vectorResults = await searchVectorDatabase(retrievalQuery, {
            currentProject,
            currentBhk,
            maxResults: 4
        });

        let dynamicKnowledge = "";
        if (vectorResults && vectorResults.length) {
            dynamicKnowledge = "RELEVANT PROPERTY KNOWLEDGE:\n" + vectorResults.slice(0, 8).map((doc, i) =>
                `${i + 1}. [${doc.project_name || 'Property'} | ${doc.category || 'General'}]\n${doc.content}`
            ).join('\n\n');
        } else if (propertyDataSummary) {
            dynamicKnowledge = `PROPERTY KNOWLEDGE FALLBACK:\n${propertyDataSummary}`;
        } else {
            dynamicKnowledge = "No property information was retrieved.";
        }

        // Assemble Full 3-Layer System Prompt
        const systemPromptText = `${BASE_VOICE_INSTRUCTIONS}

=======================================================
📊 LAYER 1: FACTUAL FOUNDATION (MASTER DATA MATRIX)
=======================================================
${MASTER_FACTUAL_MATRIX}

=======================================================
${activePsyche.instruction}
=======================================================

CURRENT RETRIEVED KNOWLEDGE (VECTOR DB):
${dynamicKnowledge}` +
            (currentProject || currentBhk ? `\n\nCURRENT WEBSITE CONTEXT: ${currentProject || 'all projects'}${currentBhk ? ` | BHK: ${currentBhk}` : ''}` : '');

        let reply = "";
        let usedModel = "";
        const tStartLLM = Date.now();

        // 🎙️ Direct Audio Flow (Gemini 3.6 Flash Multimodal Audio Input)
        if (audioBase64 && geminiApiKey) {
            try {
                const contents = [];
                for (const turn of recentHistory) {
                    contents.push({
                        role: turn.role === 'user' ? 'user' : 'model',
                        parts: [{ text: turn.text }]
                    });
                }
                contents.push({
                    role: 'user',
                    parts: [
                        {
                            inline_data: {
                                mime_type: mimeType || 'audio/webm',
                                data: audioBase64
                            }
                        },
                        {
                            text: `Listen carefully to this customer audio message in Hindi. Check the master factual matrix and reply in natural spoken Hindi.\nFormat:\nTRANSCRIPT: <exact spoken words of customer in Hindi>\nREPLY: <your consultant answer in pure spoken Hindi>`
                        }
                    ]
                });

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;
                const geminiRes = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: {
                        'x-goog-api-key': geminiApiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents,
                        systemInstruction: { parts: [{ text: systemPromptText }] },
                        generationConfig: {
                            temperature: 0.35,
                            maxOutputTokens: 800
                        }
                    })
                });

                const geminiData = await geminiRes.json();
                const rawOutput = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                console.log("🎙️ [Gemini Audio Raw Output]:", rawOutput || JSON.stringify(geminiData));

                if (rawOutput) {
                    const transcriptMatch = rawOutput.match(/TRANSCRIPT:\s*([\s\S]*?)(?=REPLY:|$)/i);
                    const replyMatch = rawOutput.match(/REPLY:\s*([\s\S]*)/i);

                    if (transcriptMatch && transcriptMatch[1]) {
                        userTranscript = transcriptMatch[1].trim();
                        activePsyche = detectCustomerPsyche(userTranscript, recentHistory);
                    }
                    if (replyMatch && replyMatch[1]) {
                        reply = cleanText(replyMatch[1]);
                    } else {
                        reply = cleanText(rawOutput);
                    }
                    usedModel = `Google ${geminiModel} (Direct Audio)`;
                }
            } catch (audioErr) {
                console.warn("Direct Audio Gemini failed:", audioErr.message);
            }
        }

        // Text Flow / Text Fallback
        if (!reply && cleanMessage) {
            async function runGroq() {
                if (!groqApiKey) return null;
                const messages = [
                    {
                        role: 'system',
                        content: systemPromptText
                    }
                ];

                for (const turn of recentHistory) {
                    if (turn.text.trim() === cleanMessage) continue;
                    messages.push({
                        role: turn.role === 'user' ? 'user' : 'assistant',
                        content: turn.text
                    });
                }

                messages.push({ role: 'user', content: cleanMessage });

                const modelsPool = [
                    requestedModel,
                    'qwen/qwen3.6-27b',
                    'openai/gpt-oss-20b',
                    'allam-2-7b',
                    'openai/gpt-oss-120b'
                ].filter((v, i, a) => a.indexOf(v) === i);

                for (const currentModel of modelsPool) {
                    try {
                        let response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${groqApiKey}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                model: currentModel,
                                messages,
                                temperature: 0.35,
                                max_tokens: 600
                            })
                        });
                        let data = await response.json();
                        if (data?.error) continue;
                        const text = cleanText(data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning);
                        if (text && text.length > 2) {
                            usedModel = `Groq ${currentModel}`;
                            return text;
                        }
                    } catch (err) { }
                }
                return null;
            }

            async function runGemini() {
                if (!geminiApiKey) return null;

                const contents = [];
                for (const turn of recentHistory) {
                    if (turn.text.trim() === cleanMessage) continue;
                    contents.push({
                        role: turn.role === 'user' ? 'user' : 'model',
                        parts: [{ text: turn.text }]
                    });
                }
                contents.push({ role: 'user', parts: [{ text: cleanMessage }] });

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
                const geminiRes = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        systemInstruction: { parts: [{ text: systemPromptText }] },
                        generationConfig: {
                            temperature: 0.35,
                            maxOutputTokens: 600
                        }
                    })
                });
                const geminiData = await geminiRes.json();
                const rawReply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
                return rawReply ? cleanText(rawReply) : null;
            }

            try {
                reply = await runGemini();
                if (reply) usedModel = `Google ${geminiModel}`;
            } catch (e) {
                console.warn("Gemini failed, trying Groq:", e.message);
            }
            if (!reply) {
                try {
                    reply = await runGroq();
                    if (reply) usedModel = `Groq ${requestedModel}`;
                } catch (e) {
                    console.warn("Groq fallback failed:", e.message);
                }
            }
        }

        const tLLM = Date.now() - tStartLLM;

        let audioContent = null;
        const tStartTTS = Date.now();
        try {
            const { synthesizeSpeech } = require('./scripts/google-tts');
            if (reply) audioContent = await synthesizeSpeech(reply);
        } catch (ttsErr) {
            console.warn("Google TTS notice:", ttsErr.message);
        }
        const tTTS = Date.now() - tStartTTS;

        console.log(`⚡ [Timing] LLM (${usedModel}): ${tLLM}ms | TTS: ${tTTS}ms | Total Voice Pipeline: ${tLLM + tTTS}ms`);

        if (reply) {
            return res.json({
                reply,
                transcript: userTranscript || cleanMessage,
                model: usedModel || requestedModel,
                audioContent,
                activePsyche: activePsyche.type
            });
        }

        return res.json({ reply: "इसकी exact जानकारी अभी उपलब्ध नहीं है." });
    } catch (err) {
        console.error("Chat API error:", err);
        return res.json({ reply: "इसकी exact जानकारी अभी उपलब्ध नहीं है. थोड़ी देर बाद फिर try करें." });
    }
});

// Dedicated Google Cloud Text-to-Speech API Endpoint
app.post('/api/tts', async (req, res) => {
    const { text, gender = 'FEMALE' } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });
    try {
        const { synthesizeSpeech } = require('./scripts/google-tts');
        const audioContent = await synthesizeSpeech(text, gender);
        return res.json({ audioContent });
    } catch (e) {
        console.error("TTS endpoint error:", e.message);
        return res.status(500).json({ error: e.message });
    }
});

// /api/log-conversation Endpoint (Real-time Live Sync)
app.post('/api/log-conversation', (req, res) => {
    try {
        const { id, sessionId, transcript = [], customerName = "", customerPhone = "", durationSeconds = 0, currentProject = "" } = req.body;

        if (!transcript || transcript.length === 0) {
            return res.json({ success: true, message: "Empty transcript" });
        }

        const convId = id || sessionId || ('conv_' + Date.now());

        let existingLogs = [];
        if (fs.existsSync(LEADS_FILE)) {
            try {
                const raw = fs.readFileSync(LEADS_FILE, 'utf8');
                existingLogs = JSON.parse(raw);
                if (!Array.isArray(existingLogs)) existingLogs = [];
            } catch (e) {
                existingLogs = [];
            }
        }

        const existingIndex = existingLogs.findIndex(item => item.id === convId);

        const logEntry = {
            id: convId,
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            customerName: customerName || "Anonymous Visitor",
            customerPhone: customerPhone || "Not provided",
            currentProject: currentProject || "General",
            durationSeconds: durationSeconds,
            summary: transcript.filter(t => t.role === 'user').map(t => t.text).slice(0, 3).join(" | ") || "Voice Inquiry",
            transcript: transcript
        };

        if (existingIndex >= 0) {
            logEntry.dateFormatted = existingLogs[existingIndex].dateFormatted;
            existingLogs[existingIndex] = logEntry;
        } else {
            existingLogs.unshift(logEntry);
        }

        fs.writeFileSync(LEADS_FILE, JSON.stringify(existingLogs, null, 2), 'utf8');
        console.log(`[Live Voice Log Updated] ID: ${logEntry.id} | Turns: ${transcript.length}`);

        res.json({ success: true, leadId: logEntry.id });
    } catch (err) {
        console.error("Error logging conversation:", err);
        res.status(500).json({ error: "Failed to save conversation log." });
    }
});

// /api/leads Endpoint
app.get('/api/leads', (req, res) => {
    try {
        if (fs.existsSync(LEADS_FILE)) {
            const raw = fs.readFileSync(LEADS_FILE, 'utf8');
            return res.json(JSON.parse(raw));
        }
        res.json([]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// /api/clear-leads Endpoint
app.post('/api/clear-leads', (req, res) => {
    try {
        fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf8');
        res.json({ success: true, message: "All conversation logs cleared." });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// /api/vector-search Endpoint
app.get('/api/vector-search', async (req, res) => {
    const query = req.query.q || "2 BHK price";
    try {
        const results = await searchVectorDatabase(query, {
            currentProject: req.query.project || "",
            maxResults: parseInt(req.query.limit) || 3
        });
        res.json({
            query: query,
            vectorSearchActive: !!results,
            results: results || "Vector search unavailable. Check SUPABASE_URL & SUPABASE_KEY in .env"
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// /api/properties Endpoint
app.get('/api/properties', (req, res) => {
    try {
        const dataFileContent = fs.readFileSync(path.join(__dirname, 'details-data.js'), 'utf8');
        const sandbox = {};
        const fn = new Function('sandbox', dataFileContent + '; sandbox.PROPERTY_DATA = PROPERTY_DATA;');
        fn(sandbox);
        res.json(sandbox.PROPERTY_DATA);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Explicit root & details routes (Serving the Property Comparison & AI Voice Assistant App)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 The Propbazar Haridwar Server running on localhost:`);
    console.log(`🔗 Main Website URL: http://localhost:${PORT}/`);
    console.log(`🔗 Domain: https://thepropbazar.com/`);
    console.log(`📋 Broker Leads Dashboard: http://localhost:${PORT}/leads.html`);
    console.log(`🤖 AI Engine: ${process.env.PRIMARY_AI_PROVIDER || 'gemini'}`);
    console.log(`======================================================\n`);
});
