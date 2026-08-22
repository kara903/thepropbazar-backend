/**
 * ============================================================
 * VECTOR SEARCH MODULE (pgvector + Transformers.js)
 * Mathematical Cosine Similarity Search for Propbazar Haridwar
 * ============================================================
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fs = require('fs');
let jursCountryQA = [];
let mantraHappyHomesQA = [];
let haridwarGreensQA = [];
let deepGangaQA = [];
let antrikshNRICityQA = [];
let myHomeLandQA = [];
let shreeHariDarshanQA = [];

try {
    const jursPath = path.join(__dirname, 'jurs-country-qa.json');
    if (fs.existsSync(jursPath)) {
        jursCountryQA = JSON.parse(fs.readFileSync(jursPath, 'utf8'));
        console.log(`✓ Loaded ${jursCountryQA.length} JURS Country Q&A pairs.`);
    }
    const mantraPath = path.join(__dirname, 'mantra-happy-homes-qa.json');
    if (fs.existsSync(mantraPath)) {
        mantraHappyHomesQA = JSON.parse(fs.readFileSync(mantraPath, 'utf8'));
        console.log(`✓ Loaded ${mantraHappyHomesQA.length} Mantra Happy Homes Q&A pairs.`);
    }
    const greensPath = path.join(__dirname, 'haridwar-greens-qa.json');
    if (fs.existsSync(greensPath)) {
        haridwarGreensQA = JSON.parse(fs.readFileSync(greensPath, 'utf8'));
        console.log(`✓ Loaded ${haridwarGreensQA.length} Haridwar Greens Q&A pairs.`);
    }
    const deepPath = path.join(__dirname, 'deep-ganga-qa.json');
    if (fs.existsSync(deepPath)) {
        deepGangaQA = JSON.parse(fs.readFileSync(deepPath, 'utf8'));
        console.log(`✓ Loaded ${deepGangaQA.length} Deep Ganga Q&A pairs.`);
    }
    const antrikshPath = path.join(__dirname, 'antriksh-nri-city-qa.json');
    if (fs.existsSync(antrikshPath)) {
        antrikshNRICityQA = JSON.parse(fs.readFileSync(antrikshPath, 'utf8'));
        console.log(`✓ Loaded ${antrikshNRICityQA.length} Antriksh NRI City Q&A pairs.`);
    }
    const homelandPath = path.join(__dirname, 'my-home-land-qa.json');
    if (fs.existsSync(homelandPath)) {
        myHomeLandQA = JSON.parse(fs.readFileSync(homelandPath, 'utf8'));
        console.log(`✓ Loaded ${myHomeLandQA.length} My Home Land Q&A pairs.`);
    }
    const hariPath = path.join(__dirname, 'shree-hari-darshan-qa.json');
    if (fs.existsSync(hariPath)) {
        shreeHariDarshanQA = JSON.parse(fs.readFileSync(hariPath, 'utf8'));
        console.log(`✓ Loaded ${shreeHariDarshanQA.length} Shree Hari Darshan City Q&A pairs.`);
    }
} catch (err) {
    console.warn("Notice: Error loading Q&A datasets:", err.message);
}

let supabase = null;
let embedder = null;
let isInitializing = false;

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)?.trim();

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log("✓ Supabase client initialized for Vector DB Search.");
    } catch (e) {
        console.warn("Supabase init error:", e.message);
    }
}

/**
 * Lazy-load the local embedding pipeline (384-dimensional)
 */
async function getEmbedder() {
    if (embedder) return embedder;
    if (isInitializing) {
        while (isInitializing) {
            await new Promise(r => setTimeout(r, 100));
        }
        return embedder;
    }
    
    isInitializing = true;
    try {
        const { pipeline } = await import('@xenova/transformers');
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log("✓ Transformers.js Embedding Pipeline ready for real-time vector queries.");
    } catch (err) {
        console.error("Failed to initialize Transformers.js embedder:", err.message);
    } finally {
        isInitializing = false;
    }
    return embedder;
}

function normalizeQuery(text) {
    if (!text) return "";
    let s = String(text).toLowerCase();

    // 1. ALL PROJECT NAME HINGLISH & PHONETIC VARIATIONS
    const projectAliases = [
        // Mantra Happy Homes
        [/(?:^|\P{L})(mantra|matra|mantraa|mantr|happy\s*homes?|happyhomes?|मंत्रा|मंत्र|मंत्रा\s*हैप्पी\s*होम्स?|हैप्पी\s*होम्स?)(?:$|\P{L})/giu, ' mantra happy homes '],
        // Haridwar Greens
        [/(?:^|\P{L})(haridwar\s*greens?|hardwar\s*greens?|hari\s*dwar\s*greens?|haridwargreens?|greens|हरिद्वार\s*ग्रीन्स?|हरिद्वार\s*ग्रिन्स?|ग्रीन्स?|ग्रिन्स?)(?:$|\P{L})/giu, ' haridwar greens '],
        // Deep Ganga
        [/(?:^|\P{L})(deep\s*ganga|deepganga|dip\s*ganga|deepa?\s*ganga|deep\s*gnga|दीप\s*गंगा|डीप\s*गंगा|दीपगंगा|डीपगंगा)(?:$|\P{L})/giu, ' deep ganga '],
        // Antriksh NRI City
        [/(?:^|\P{L})(antriksh\s*nri\s*city|antriksh\s*nri|antriksh|antrix|antariksh|antarikh|antrishk|nri\s*city|nricity|nri|अंतरिक्ष\s*एनआरआई\s*सिटी|अंतरिक्ष\s*एनआरआई|अंतरिक्ष|एनआरआई\s*सिटी|एनआरआई|अंतरिक्ष\s*सिटी)(?:$|\P{L})/giu, ' antriksh nri city '],
        // Jurs Country
        [/(?:^|\P{L})(jurs\s*country|jur\s*country|jurs\s*contry|jurs\s*cantry|jurs|jurs\s*county|jur'?s\s*country|जर्स\s*कंट्री|जर्स\s*कन्ट्री|जर्स|जर्स\s*काउंटी|ज्यूर्स\s*कंट्री)(?:$|\P{L})/giu, ' jurs country '],
        // My Home Land
        [/(?:^|\P{L})(my\s*home\s*land|myhomeland|homeland|home\s*land|mai\s*home\s*land|माई\s*होम\s*लैंड|माय\s*होम\s*लैंड|होमलैंड|होम\s*लैंड)(?:$|\P{L})/giu, ' my home land '],
        // Shree Hari Darshan City
        [/(?:^|\P{L})(shree\s*hari\s*darshan\s*city|shri\s*hari\s*darshan\s*city|shree\s*hari\s*darshan|shri\s*hari\s*darshan|hari\s*darshan\s*city|hari\s*darshan|haridarshan|vedanta\s*buildcon|श्री\s*हरि\s*दर्शन\s*सिटी|श्री\s*हरि\s*दर्शन|हरि\s*दर्शन\s*सिटी|हरि\s*दर्शन|हरिदर्शन|वेदांता)(?:$|\P{L})/giu, ' shree hari darshan city ']
    ];
    for (const [regex, replacement] of projectAliases) s = s.replace(regex, replacement);

    // 2. CORE TOPICS & HINGLISH SPELLING VARIATIONS
    const topicMap = [
        // Maintenance & Monthly Charges (all Hinglish typos)
        [/(?:^|\P{L})(maintenance|maintanace|maintanence|maintainance|maintainence|maintance|mentenance|mentenence|mentenans|mentinens|mentinance|maintenence|maintanance|monthly\s*maintenance|monthly\s*charge|society\s*charge|society\s*charges|maintenance\s*charge|मेंटेनेंस|मैंटेनेंस|मेंटेनन्स|मेंटेनेन्स|मंथली\s*चार्ज|सोसाइटी\s*चार्ज|रखरखाव|मेंटनेंस)(?:$|\P{L})/giu, ' maintenance '],
        
        // Price, Rate, Cost, Budget
        [/(?:^|\P{L})(price|prices|rate|rates|cost|costs|budget|budgets|daam|dam|kimat|keemat|kitne\s*ka|kitne\s*me|kitne\s*mein|kya\s*rate|kya\s*price|amount|bhav|bhaav|कीमत|दाम|रेट|लागत|बजट|कितने\s*का|कितने\s*में|क्या\s*भाव)(?:$|\P{L})/giu, ' price rate cost '],
        
        // Size, Area, SqFt, Carpet, Super Builtup, Gaj
        [/(?:^|\P{L})(size|sizes|area|sqft|sq\s*ft|sq\.?\s*ft|sqfeet|sq\s*feet|square\s*feet|square\s*foot|squareft|super\s*builtup|builtup|carpet|carpet\s*area|gaj|sq\s*yard|sq\.?\s*yard|square\s*yard|साइज|साइज़|एरिया|क्षेत्रफल|स्क्वायर\s*फीट|वर्ग\s*फीट|कारपेट|बिल्टअप|गज|वर्ग\s*गज|स्क्वायर\s*यार्ड)(?:$|\P{L})/giu, ' size sqft area '],
        
        // BHK Configurations
        [/(?:^|\P{L})(1\s*bhk|one\s*bhk|1\s*bed|1\s*bedroom|1\s*बीएचके|वन\s*बीएचके|एक\s*बीएचके|1\s*रूम|एक\s*रूम)(?:$|\P{L})/giu, ' 1 BHK '],
        [/(?:^|\P{L})(2\s*bhk|two\s*bhk|2\s*bed|2\s*bedroom|2\s*बीएचके|टू\s*बीएचके|दो\s*बीएचके|2\s*रूम|दो\s*रूम)(?:$|\P{L})/giu, ' 2 BHK '],
        [/(?:^|\P{L})(3\s*bhk|three\s*bhk|3\s*bed|3\s*bedroom|3\s*बीएचके|थ्री\s*बीएचके|तीन\s*बीएचके|3\s*रूम|तीन\s*रूम)(?:$|\P{L})/giu, ' 3 BHK '],
        [/(?:^|\P{L})(4\s*bhk|four\s*bhk|4\s*bed|4\s*bedroom|4\s*बीएचके|फोर\s*बीएचके|चार\s*बीएचके)(?:$|\P{L})/giu, ' 4 BHK '],
        [/(?:^|\P{L})(5\s*bhk|five\s*bhk|5\s*bed|5\s*bedroom|5\s*बीएचके|फाइव\s*बीएचके|पांच\s*बीएचके)(?:$|\P{L})/giu, ' 5 BHK '],
        [/(?:^|\P{L})(plots?|plotting|land|zameen|zamin|प्लॉट|प्लाट|प्लॉट्स|प्लाट्स|जमीन|भूखंड)(?:$|\P{L})/giu, ' plots land '],
        [/(?:^|\P{L})(villas?|kothi|duplex|विला|विल्ला|कोठी|डुप्लेक्स)(?:$|\P{L})/giu, ' villa duplex '],

        // Swimming Pool
        [/(?:^|\P{L})(swimming\s*pool|swim\s*pool|pool|swiming\s*pool|swiming|swimming|स्विमिंग\s*पूल|स्विमिंग|पूल|तरणताल)(?:$|\P{L})/giu, ' swimming pool '],
        
        // Gym & Fitness
        [/(?:^|\P{L})(gym|gymnasium|jim|workout|fitness|जिम|व्यायामशाला)(?:$|\P{L})/giu, ' gymnasium '],
        
        // Clubhouse
        [/(?:^|\P{L})(clubhouse|club\s*house|community\s*hall|क्लब\s*हाउस|क्लबहाउस|क्लब)(?:$|\P{L})/giu, ' clubhouse '],
        
        // Temple / Mandir
        [/(?:^|\P{L})(temple|mandir|mandir\s*hai|मंदिर|देवालय)(?:$|\P{L})/giu, ' temple mandir '],
        
        // Park & Garden
        [/(?:^|\P{L})(park|garden|lawn|green\s*area|पार्क|गार्डन|बगीचा)(?:$|\P{L})/giu, ' park garden '],
        
        // Parking
        [/(?:^|\P{L})(parking|car\s*parking|covered\s*parking|गाड़ी\s*पार्किंग|पार्किंग)(?:$|\P{L})/giu, ' parking '],
        
        // Power Backup
        [/(?:^|\P{L})(power\s*backup|powerback|light\s*backup|bijli\s*backup|generator|पावर\s*बैकअप|बिजली\s*बैकअप)(?:$|\P{L})/giu, ' power backup '],
        
        // Security & CCTV
        [/(?:^|\P{L})(security|guard|cctv|gated|suraksha|सिक्योरिटी|सुरक्षा|गार्ड)(?:$|\P{L})/giu, ' security '],
        
        // Lift
        [/(?:^|\P{L})(lift|elevator|लिफ्ट)(?:$|\P{L})/giu, ' lift '],

        // RERA & HRDA Approvals
        [/(?:^|\P{L})(rera|rera\s*approved|rera\s*registered|rera\s*number|रेरा|रेरा\s*अप्रूव्ड)(?:$|\P{L})/giu, ' rera approval '],
        [/(?:^|\P{L})(hrda|hrda\s*approved|haridwar\s*development\s*authority|एचआरडीए|एचआरडीए\s*अप्रूव्ड)(?:$|\P{L})/giu, ' hrda approval '],
        
        // Freehold & Leasehold
        [/(?:^|\P{L})(freehold|free\s*hold|frehold|फ्रीहोल्ड|फ्री\s*होल्ड)(?:$|\P{L})/giu, ' freehold '],
        [/(?:^|\P{L})(leasehold|lease\s*hold|लीजहोल्ड|लीज\s*होल्ड|लीज)(?:$|\P{L})/giu, ' leasehold '],
        
        // Registry & Mutation (Dakhil Kharij)
        [/(?:^|\P{L})(registry|rajistry|ragistry|dakhil\s*kharij|mutation|रजिस्ट्री|दाखिल\s*खारिज|नामांतरण)(?:$|\P{L})/giu, ' registry mutation '],
        
        // Bank Loan & Finance
        [/(?:^|\P{L})(loan|lon|bank\s*loan|home\s*loan|finance|emi|sbi\s*loan|pnb\s*loan|लोन|बैंक\s*लोन|होम\s*लोन|फाइनेंस|ईएमआई)(?:$|\P{L})/giu, ' bank loan finance '],

        // Location & Distance
        [/(?:^|\P{L})(location|lokeshan|kahan\s*hai|kidhar\s*hai|address|adresh|distance|duri|kitna\s*door|kitni\s*dur|लोकेशन|कहाँ\s*है|किधर\s*है|दूरी|कितनी\s*दूर|पता)(?:$|\P{L})/giu, ' location distance '],
        [/(?:^|\P{L})(har\s*ki\s*pauri|harkipauri|ganga\s*ghat|ganga|हर\s*की\s*पौड़ी|गंगा\s*घाट|गंगा)(?:$|\P{L})/giu, ' har ki pauri ganga '],
        [/(?:^|\P{L})(railway\s*station|station|bus\s*stand|bus\s*station|रेलवे\s*स्टेशन|स्टेशन|बस\s*स्टैंड)(?:$|\P{L})/giu, ' railway station bus stand '],
        [/(?:^|\P{L})(highway|nh58|nh\s*58|nh-58|national\s*highway|हाईवे|नेशनल\s*हाईवे)(?:$|\P{L})/giu, ' highway nh58 '],
        [/(?:^|\P{L})(sidcul|sidkul|sitcul|सिडकुल)(?:$|\P{L})/giu, ' sidcul '],
        [/(?:^|\P{L})(shivalik\s*nagar|sivalik\s*nagar|shivalik|शिवालिक\s*नगर)(?:$|\P{L})/giu, ' shivalik nagar '],
        [/(?:^|\P{L})(roshanabad|roshnabad|rosanabad|रोशनबाद|रोशनाबाद)(?:$|\P{L})/giu, ' roshanabad '],
        [/(?:^|\P{L})(pentagon\s*mall|pentagon|mall|पेंटागन\s*मॉल|मॉल)(?:$|\P{L})/giu, ' pentagon mall '],
        [/(?:^|\P{L})(patanjali|patanjali\s*yogpeeth|पतंजलि\s*योगपीठ|पतंजलि)(?:$|\P{L})/giu, ' patanjali yogpeeth '],

        // Brokerage & Commission
        [/(?:^|\P{L})(brokerage|commission|broker\s*commission|दलाली|कमीशन|ब्रोकरेज)(?:$|\P{L})/giu, ' broker brokerage commission '],

        // Outside State Buyer Limits
        [/(?:^|\P{L})(outsider|outside\s*buyer|uttarakhand\s*ke\s*bahar|bahar\s*wale|उत्तराखंड\s*के\s*बाहर|बाहरी\s*खरीदार)(?:$|\P{L})/giu, ' outsider buyer limit ']
    ];
    for (const [regex, replacement] of topicMap) s = s.replace(regex, replacement);

    return s.replace(/\s+/g, ' ').trim();
}

function tokenize(text) {
    return new Set(normalizeQuery(text).replace(/[^\p{L}\p{N}.]+/gu, ' ').split(/\s+/).filter(Boolean));
}

function extractNumbers(text) {
    return String(text || '').match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
}

function detectProject(query) {
    const q = normalizeQuery(query);
    if (q.includes('mantra happy homes')) return 'Mantra Happy Homes';
    if (q.includes('haridwar greens')) return 'Haridwar Greens';
    if (q.includes('deep ganga')) return 'Deep Ganga';
    if (q.includes('antriksh nri city')) return 'Antriksh NRI City';
    if (q.includes('jurs country')) return 'Jurs Country';
    if (q.includes('my home land')) return 'My Home Land';
    if (q.includes('shree hari darshan city')) return 'Shree Hari Darshan City';
    return null;
}

function detectIntent(query) {
    const q = normalizeQuery(query);
    if (/maintenance/i.test(q)) return 'maintenance';
    if (/bank loan finance|loan/i.test(q)) return 'loan';
    if (/rera approval|hrda approval/i.test(q)) return 'approval';
    if (/freehold|leasehold/i.test(q)) return 'ownership';
    if (/price rate cost/i.test(q)) return 'price';
    if (/size sqft area/i.test(q)) return 'size';
    if (/swimming pool/i.test(q)) return 'pool';
    if (/gymnasium/i.test(q)) return 'gym';
    if (/clubhouse/i.test(q)) return 'clubhouse';
    if (/temple mandir/i.test(q)) return 'temple';
    if (/park garden/i.test(q)) return 'park';
    if (/parking/i.test(q)) return 'parking';
    if (/power backup/i.test(q)) return 'power';
    if (/security/i.test(q)) return 'security';
    if (/lift/i.test(q)) return 'lift';
    if (/registry mutation/i.test(q)) return 'registry';
    if (/broker brokerage commission/i.test(q)) return 'brokerage';
    if (/outsider buyer limit/i.test(q)) return 'outsider';
    if (/location distance/i.test(q)) return 'location';
    if (/compare|comparison|difference|फर्क|तुलना/i.test(q)) return 'comparison';
    return 'general';
}

function detectBHK(text) {
    const s = String(text || '').toLowerCase();
    if (/\b1\s*bhk\b|1\s*बीएचके|वन\s*बीएचके/i.test(s)) return '1BHK';
    if (/\b2\s*bhk\b|2\s*बीएचके|टू\s*बीएचके/i.test(s)) return '2BHK';
    if (/\b3\s*bhk\b|3\s*बीएचके|थ्री\s*बीएचके/i.test(s)) return '3BHK';
    if (/\b4\s*bhk\b|4\s*बीएचके/i.test(s)) return '4BHK';
    if (/\b5\s*bhk\b|5\s*बीएचके/i.test(s)) return '5BHK';
    return null;
}

function detectBudgetLakh(text) {
    const s = String(text || '').toLowerCase();
    const match = s.match(/(\d+(?:\.\d+)?)\s*(?:लाख|lakh|lac|lacs)/i);
    if (match) return parseFloat(match[1]);
    return null;
}

function scoreQA(item, query, projectName) {
    const q = normalizeQuery(query);
    const qt = tokenize(q);
    const text = `${item.canonical_question || ''} ${item.answer || ''} ${(item.variations || []).join(' ')}`;
    const tt = tokenize(text);
    let score = 0;

    let overlap = 0;
    for (const token of qt) if (tt.has(token)) overlap++;
    if (qt.size) score += overlap / qt.size;

    const qNums = extractNumbers(q);
    const tNums = extractNumbers(text);
    if (qNums.some(n => tNums.some(m => Math.abs(n - m) < 0.01))) score += 0.25;

    const detected = detectProject(query);
    if (detected === projectName) score += 0.40;

    const intent = detectIntent(query);
    if (intent === 'maintenance' && /maintenance|मेंटेनेंस|रखरखाव|office|कार्यालय/i.test(text)) score += 0.65;
    if (intent === 'loan' && /loan|bank|बैंक|लोन|finance/i.test(text)) score += 0.55;
    if (intent === 'approval' && /rera|hrda|approved|approval|रेरा|एचआरडीए/i.test(text)) score += 0.55;
    if (intent === 'ownership' && /freehold|leasehold|फ्रीहोल्ड|लीजहोल्ड/i.test(text)) score += 0.55;
    if (intent === 'price' && /price|rate|cost|कीमत|रेट|लाख|दाम/i.test(text)) score += 0.35;
    if (intent === 'size' && /size|sq\.?\s*ft|square feet|स्क्वायर फीट|कारपेट|builtup/i.test(text)) score += 0.35;
    if (intent === 'pool' && /pool|swimming|पूल|स्विमिंग/i.test(text)) score += 0.55;
    if (intent === 'gym' && /gym|gymnasium|जिम/i.test(text)) score += 0.55;
    if (intent === 'clubhouse' && /clubhouse|club\s*house|क्लब/i.test(text)) score += 0.55;
    if (intent === 'temple' && /temple|mandir|मंदिर/i.test(text)) score += 0.55;
    if (intent === 'security' && /security|guard|cctv|सुरक्षा|गार्ड/i.test(text)) score += 0.55;
    if (intent === 'parking' && /parking|पार्किंग/i.test(text)) score += 0.55;
    if (intent === 'brokerage' && /broker|brokerage|commission|कमीशन|ब्रोकरेज/i.test(text)) score += 0.55;
    if (intent === 'outsider' && /outside|outsider|uttarakhand|उत्तराखंड/i.test(text)) score += 0.55;
    if (intent === 'registry' && /registry|mutation|दाखिल|खारिज/i.test(text)) score += 0.55;
    if (intent === 'location' && /location|kahan|kidhar|distance|लोकेशन|दूरी/i.test(text)) score += 0.40;

    // Soft BHK Boost: If user asks for 2 BHK, boost matching 2 BHK docs
    const requestedBHK = detectBHK(query);
    if (requestedBHK) {
        const itemBHK = detectBHK(text);
        if (itemBHK === requestedBHK) {
            score += 0.35;
        }
    }

    // Soft Budget Boost: If user asks for a budget (e.g. 30 Lakh), boost in-budget price docs
    const requestedBudget = detectBudgetLakh(query);
    if (requestedBudget && intent === 'price') {
        const lakhMatches = text.match(/(\d+(?:\.\d+)?)\s*(?:लाख|lakh|lac|lacs)/gi);
        if (lakhMatches) {
            for (const lm of lakhMatches) {
                const num = parseFloat(lm.match(/\d+(?:\.\d+)?/)?.[0] || '0');
                if (num > 0 && num <= requestedBudget) {
                    score += 0.35;
                    break;
                }
            }
        }
    }

    for (const v of (item.variations || [])) {
        const vn = normalizeQuery(v);
        if (q.includes(vn) || vn.includes(q)) score += 0.60;
    }

    return score;
}

function searchLocalQA(query, options = {}) {
    const project = options.currentProject || detectProject(query);
    const out = [];

    for (const [projectName, dataset] of Object.entries({
        'Jurs Country': jursCountryQA,
        'Mantra Happy Homes': mantraHappyHomesQA,
        'Haridwar Greens': haridwarGreensQA,
        'Deep Ganga': deepGangaQA,
        'Antriksh NRI City': antrikshNRICityQA,
        'My Home Land': myHomeLandQA,
        'Shree Hari Darshan City': shreeHariDarshanQA
    })) {
        if (!Array.isArray(dataset) || !dataset.length) continue;
        if (project && projectName !== project) continue;

        for (const item of dataset) {
            const score = scoreQA(item, query, projectName);
            if (score >= 0.25) {
                out.push({
                    project_name: projectName,
                    category: item.topic || 'Q&A',
                    content: `Q: ${item.canonical_question || ''} | Answer: ${item.answer || ''}`,
                    similarity: Math.min(score, 0.99),
                    source: 'local_qa'
                });
            }
        }
    }

    out.sort((a, b) => b.similarity - a.similarity);
    return out.slice(0, 6);
}

/**
 * Searches the Supabase Vector Database + Q&A Knowledge Base
 * @param {string} query - Customer question / spoken prompt
 * @param {Object} options - Filtering options (currentProject, currentBhk, maxResults)
 * @returns {Promise<Array<{content: string, similarity: number, project_name: string, category: string}>>}
 */
async function searchVectorDatabase(query, options = {}) {
    const { currentProject = "", currentBhk = "", maxResults = 8 } = options;
    const localResults = searchLocalQA(query, { currentProject });
    const results = [];

    // Keep the existing Supabase semantic search, but retrieve more candidates.
    if (supabase) {
        try {
            const embedPipeline = await getEmbedder();
            if (embedPipeline) {
                let enrichedQuery = normalizeQuery(query);
                if (currentProject) enrichedQuery = `${currentProject} ${enrichedQuery}`;
                if (currentBhk) enrichedQuery = `${currentBhk} ${enrichedQuery}`;

                const output = await embedPipeline(enrichedQuery, { pooling: 'mean', normalize: true });
                const queryEmbedding = Array.from(output.data);

                const { data, error } = await supabase.rpc('match_property_documents', {
                    query_embedding: queryEmbedding,
                    match_threshold: 0.12,
                    match_count: Math.max(Number(maxResults), 8)
                });

                if (!error && Array.isArray(data)) {
                    for (const doc of data) {
                        results.push({ ...doc, similarity: Number(doc.similarity || 0), source: 'vector' });
                    }
                }
            }
        } catch (err) {
            console.error('Vector search exception:', err.message);
        }
    }

    // Merge duplicate chunks and prefer curated local Q&A when the same answer exists.
    const map = new Map();
    for (const item of [...localResults, ...results]) {
        const key = `${item.project_name || ''}::${item.content || ''}`.toLowerCase();
        if (!map.has(key)) {
            map.set(key, item);
        } else {
            const existing = map.get(key);
            if (item.source === 'local_qa' && existing.source !== 'local_qa') {
                map.set(key, { ...item, similarity: Math.max(item.similarity || 0, existing.similarity || 0) + 0.03 });
            }
        }
    }

    let finalResults = Array.from(map.values());
    const detectedProject = currentProject || detectProject(query);
    const targetBHK = currentBhk || detectBHK(query);
    const targetBudget = detectBudgetLakh(query);

    finalResults = finalResults.map(item => {
        let sim = Number(item.similarity || 0);
        if (detectedProject) {
            sim += (item.project_name === detectedProject ? 0.20 : -0.05);
        }
        if (targetBHK) {
            const itemBHK = detectBHK(item.content) || (item.bhk_type === targetBHK ? targetBHK : null);
            if (itemBHK === targetBHK) sim += 0.15;
        }
        if (targetBudget) {
            const lakhMatches = String(item.content).match(/(\d+(?:\.\d+)?)\s*(?:लाख|lakh|lac|lacs)/gi);
            if (lakhMatches) {
                for (const lm of lakhMatches) {
                    const num = parseFloat(lm.match(/\d+(?:\.\d+)?/)?.[0] || '0');
                    if (num > 0 && num <= targetBudget) {
                        sim += 0.20;
                        break;
                    }
                }
            }
        }
        return {
            ...item,
            similarity: sim
        };
    });

    finalResults.sort((a, b) => b.similarity - a.similarity);

    console.log(`[Retrieval] ${String(query).slice(0, 120)} -> ${finalResults.length} candidates`);
    return finalResults.slice(0, Number(maxResults)) || null;
}

module.exports = {
    searchVectorDatabase,
    getEmbedder
};
