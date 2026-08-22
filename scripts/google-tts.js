const path = require('path');
const { GoogleAuth } = require('google-auth-library');

let googleAuthClient = null;

async function getGoogleToken() {
    if (!googleAuthClient) {
        let keyFilePath = path.join(__dirname, '..', 'google-service-key.json');
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        }
        
        let authOptions = {
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        };

        if (process.env.GOOGLE_SERVICE_KEY_JSON) {
            try {
                authOptions.credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY_JSON);
            } catch(e) {}
        } else if (fs.existsSync(keyFilePath)) {
            authOptions.keyFile = keyFilePath;
        }

        googleAuthClient = new GoogleAuth(authOptions);
    }
    const client = await googleAuthClient.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token;
}

async function synthesizeSpeech(text, voiceGender = 'MALE') {
    const token = await getGoogleToken();
    // High-Fidelity Google Cloud Neural2 Male Voice
    const voiceName = voiceGender === 'FEMALE' ? 'hi-IN-Neural2-A' : 'hi-IN-Neural2-B';

    // Format text for speech
    let spokenText = text
        .replace(/(\d+)\s*[\-–—‑]\s*(\d+)/g, '$1 से $2')
        .replace(/sq\.?\s*ft\.?/gi, ' स्क्वायर फीट ')
        .replace(/sqft/gi, ' स्क्वायर फीट ')
        .replace(/sq\s*feet/gi, ' स्क्वायर फीट ')
        .replace(/sq\.?\s*yard/gi, ' स्क्वायर यार्ड ')
        .replace(/\bSIDCUL\b/gi, ' सिडकुल ')
        .replace(/\bBHEL\b/gi, ' भेल ')
        .replace(/\bNH[- ]?58\b/gi, ' नेशनल हाईवे 58 ')
        .replace(/\bRERA\b/gi, ' रेरा ')
        .replace(/(\d+)\s*BHK/gi, '$1 बीएचके')
        .replace(/\bBHK\b/gi, 'बीएचके')
        .replace(/₹\s*/g, '')
        .replace(/%/g, ' प्रतिशत ')
        .replace(/\bkm\b/gi, ' किलोमीटर ')
        .replace(/[\*\#\_]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            input: { text: spokenText },
            voice: {
                languageCode: 'hi-IN',
                name: voiceName,
                ssmlGender: voiceGender
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 1.0,
                pitch: 0.0,
                effectsProfileId: ['headphone-class-device']
            }
        })
    });

    const data = await res.json();
    return data.audioContent; // Base64 MP3
}

module.exports = { synthesizeSpeech };
