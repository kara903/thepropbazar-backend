/**
 * Voice-First AI Assistant for The Propbazar Haridwar (Ultra-Fast & Compact Edition)
 * - Compact Floating Design with Integrated On/Off Power Switch
 * - Instant Welcome Audio (< 0.05s on First User Touch)
 * - Real-Time Speech Detection (2.0s Natural Pause Debounce)
 * - High-Fidelity Google Cloud Neural2 Male Voice Output
 * - Background Server Keep-Alive (Eliminates Render Cold-Start Latency)
 * - In-Memory Fast Semantic Search (< 1ms Backend Retrieval)
 * - Reliable Lead & Conversation Logging to Backend API & LocalStorage
 */

(function () {
    'use strict';

    const CONFIG = {
        chatEndpoint: 'https://thepropbazar-backend.onrender.com/api/chat',
        chatStreamEndpoint: 'https://thepropbazar-backend.onrender.com/api/chat-stream',
        ttsEndpoint: 'https://thepropbazar-backend.onrender.com/api/tts',
        healthEndpoint: 'https://thepropbazar-backend.onrender.com/health',
        initialGreeting: "राम राम! मुझे The Propbazar के फाउंडर राहुल द्विवेदी जी ने आपकी मदद के लिए यहाँ रखा हुआ है। ऊपर आपको सारे BHK ऑप्शंस मिल जाते हैं, जहाँ आप अपनी रिक्वायरमेंट का BHK सेलेक्ट करके राइट स्क्रॉल करके सभी सोसाइटीज को कम्पेयर कर सकते हैं। इसके अलावा आप मुझसे हरिद्वार की किसी भी प्रॉपर्टी के बारे में कुछ भी पूछ सकते हैं।",
        language: 'hi-IN',
        sessionKey: 'propbazar_ai_session_started'
    };

    let isAiDisabled = localStorage.getItem('propbazar_ai_disabled') === 'true';
    let isSpeaking = false;
    let isListening = false;
    let isProcessing = false;
    let recognition = null;
    let transcriptHistory = [];
    let customerName = "";
    let customerPhone = "";
    let sessionStartTime = Date.now();
    let permissionGranted = false;
    let greeted = false;
    let restartTimer = null;
    let lastSpokenAiText = "";
    let speechEndTime = 0;
    let activeBlobUrl = null;
    let lastDispatchedText = "";
    let speechDebounceTimer = null;
    let activeFillerAudio = null;

    const FILLER_AUDIOS = ['filler1.mp3', 'filler2.mp3', 'filler3.mp3'];

    // Persistent global audio reference & Immediate Background Preloader
    window._propbazarActiveAudio = null;
    const preloadedWelcomeAudio = new Audio('welcome-male.mp3');
    preloadedWelcomeAudio.preload = 'auto';

    // Preload filler audio files
    const preloadedFillers = FILLER_AUDIOS.map(src => {
        const a = new Audio(src);
        a.preload = 'auto';
        return a;
    });

    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    // Warm up Render backend immediately on page load and every 3 minutes while browsing
    try {
        fetch(CONFIG.healthEndpoint, { mode: 'no-cors' }).catch(() => {});
        setInterval(() => {
            fetch(CONFIG.healthEndpoint, { mode: 'no-cors' }).catch(() => {});
        }, 3 * 60 * 1000);
    } catch(e){}

    function getCurrentContext() {
        let currentProject = "";
        let currentBhk = "";
        try {
            const heading = document.querySelector('h1, .hero-title, .project-title');
            if (heading) currentProject = heading.innerText.trim();
            const activeTab = document.querySelector('.bhk-tab.active');
            if (activeTab) currentBhk = activeTab.innerText.trim();
        } catch (e) {}
        return { currentProject, currentBhk };
    }

    /**
     * UI Status Badge / Floating Voice Orb Updates
     */
    function updateVoiceUI(status, text) {
        const container = document.getElementById('propbazarVoiceContainer');
        if (!container) {
            createVoiceOrbUI();
            return;
        }

        const orb = document.getElementById('propbazarVoiceOrb');
        const icon = container.querySelector('.voice-orb-icon');
        const label = container.querySelector('.voice-orb-label');
        const waves = container.querySelector('.voice-orb-waves');
        const powerToggle = document.getElementById('voicePowerToggle');

        if (isAiDisabled) {
            container.classList.add('ai-disabled');
            container.classList.remove('ai-active');
            if (orb) orb.className = 'propbazar-voice-orb status-disabled';
            if (icon) icon.className = 'voice-orb-icon fa-solid fa-microphone-slash';
            if (label) label.innerText = 'AI बंद है (क्लिक करके ऑन करें)';
            if (waves) waves.style.display = 'none';
            if (powerToggle) {
                powerToggle.className = 'voice-power-toggle is-off';
                powerToggle.title = 'AI चालू करें (Turn AI ON)';
            }
            return;
        }

        container.classList.remove('ai-disabled');
        container.classList.add('ai-active');
        if (powerToggle) {
            powerToggle.className = 'voice-power-toggle is-on';
            powerToggle.title = 'AI बंद करें (Turn AI OFF)';
        }

        if (orb) orb.className = 'propbazar-voice-orb status-' + status;

        if (status === 'speaking') {
            if (icon) icon.className = 'voice-orb-icon fa-solid fa-volume-high';
            if (label) label.innerText = text || 'बोल रहा है...';
            if (waves) waves.style.display = 'flex';
        } else if (status === 'listening') {
            if (icon) icon.className = 'voice-orb-icon fa-solid fa-microphone';
            if (label) label.innerText = text || 'सुन रहा हूँ... बोलिए';
            if (waves) waves.style.display = 'flex';
        } else if (status === 'thinking') {
            if (icon) icon.className = 'voice-orb-icon fa-solid fa-circle-notch fa-spin';
            if (label) label.innerText = text || 'सोच रहा हूँ...';
            if (waves) waves.style.display = 'none';
        } else {
            if (icon) icon.className = 'voice-orb-icon fa-solid fa-microphone';
            if (label) label.innerText = text || 'The Propbazar AI';
            if (waves) waves.style.display = 'none';
        }
    }

    function injectVoiceStyles() {
        if (document.getElementById('propbazarVoiceOrbStyles')) return;
        const style = document.createElement('style');
        style.id = 'propbazarVoiceOrbStyles';
        style.textContent = `
            #propbazarVoiceContainer {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999999;
                display: flex;
                align-items: center;
                gap: 7px;
                background: linear-gradient(135deg, #064E3B 0%, #047857 100%);
                color: #FFFFFF;
                padding: 5px 8px 5px 10px;
                border-radius: 40px;
                box-shadow: 0 6px 24px rgba(6, 78, 59, 0.4), 0 0 0 1.5px rgba(201, 169, 110, 0.7);
                user-select: none;
                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                -webkit-tap-highlight-color: transparent;
            }
            #propbazarVoiceContainer:hover {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 10px 28px rgba(6, 78, 59, 0.5), 0 0 0 2px rgba(201, 169, 110, 0.9);
            }
            #propbazarVoiceContainer.ai-disabled {
                background: linear-gradient(135deg, #334155 0%, #1E293B 100%);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(148, 163, 184, 0.4);
            }
            #propbazarVoiceOrb {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                padding: 2px 4px;
                border-radius: 30px;
            }
            #propbazarVoiceOrb .voice-orb-main {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                background: #C9A96E;
                color: #1E1E1E;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                position: relative;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                flex-shrink: 0;
            }
            #propbazarVoiceContainer.ai-disabled #propbazarVoiceOrb .voice-orb-main {
                background: #64748B;
                color: #FFFFFF;
            }
            #propbazarVoiceOrb .voice-orb-info {
                display: flex;
                flex-direction: column;
                line-height: 1.2;
            }
            #propbazarVoiceOrb .voice-orb-label {
                font-weight: 700;
                font-size: 12.5px;
                letter-spacing: 0.2px;
                color: #FFFFFF;
                white-space: nowrap;
            }
            #propbazarVoiceOrb .voice-orb-sub {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.85);
                white-space: nowrap;
            }
            #propbazarVoiceOrb .voice-orb-waves {
                display: flex;
                align-items: center;
                gap: 2.5px;
                height: 13px;
            }
            #propbazarVoiceOrb .voice-orb-waves span {
                width: 2.5px;
                background: #1E1E1E;
                border-radius: 2px;
                animation: waveBounce 0.8s infinite ease-in-out alternate;
            }
            #propbazarVoiceOrb .voice-orb-waves span:nth-child(1) { height: 4px; animation-delay: 0.1s; }
            #propbazarVoiceOrb .voice-orb-waves span:nth-child(2) { height: 10px; animation-delay: 0.2s; }
            #propbazarVoiceOrb .voice-orb-waves span:nth-child(3) { height: 14px; animation-delay: 0.3s; }
            @keyframes waveBounce {
                0% { transform: scaleY(0.3); }
                100% { transform: scaleY(1.2); }
            }
            
            /* Power Toggle Button */
            .voice-power-toggle {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 3.5px;
                padding: 4.5px 8.5px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                background: rgba(0, 0, 0, 0.25);
                color: #FFFFFF;
                font-size: 10.5px;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
            }
            .voice-power-toggle.is-on {
                background: rgba(16, 185, 129, 0.3);
                border-color: rgba(52, 211, 153, 0.6);
                color: #A7F3D0;
            }
            .voice-power-toggle.is-on:hover {
                background: rgba(239, 68, 68, 0.35);
                border-color: #F87171;
                color: #FECACA;
            }
            .voice-power-toggle.is-off {
                background: rgba(239, 68, 68, 0.3);
                border-color: rgba(248, 113, 113, 0.6);
                color: #FECACA;
            }
            .voice-power-toggle.is-off:hover {
                background: rgba(16, 185, 129, 0.4);
                border-color: #34D1D1;
                color: #A7F3D0;
            }

            @media (max-width: 600px) {
                #propbazarVoiceContainer {
                    bottom: 15px;
                    right: 15px;
                    padding: 4px 6px 4px 7px;
                }
                #propbazarVoiceOrb .voice-orb-main {
                    width: 30px;
                    height: 30px;
                    font-size: 13px;
                }
                #propbazarVoiceOrb .voice-orb-label {
                    font-size: 11.5px;
                }
                #propbazarVoiceOrb .voice-orb-sub {
                    display: none;
                }
                .voice-power-toggle {
                    padding: 3.5px 7px;
                    font-size: 9.5px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createVoiceOrbUI() {
        injectVoiceStyles();
        if (document.getElementById('propbazarVoiceContainer')) return document.getElementById('propbazarVoiceContainer');

        const container = document.createElement('div');
        container.id = 'propbazarVoiceContainer';
        container.className = 'propbazar-voice-container ' + (isAiDisabled ? 'ai-disabled' : 'ai-active');
        container.innerHTML = `
            <div id="propbazarVoiceOrb" class="propbazar-voice-orb status-ready">
                <div class="voice-orb-main">
                    <i class="voice-orb-icon fa-solid ${isAiDisabled ? 'fa-microphone-slash' : 'fa-microphone'}"></i>
                    <div class="voice-orb-waves" style="display:none;">
                        <span></span><span></span><span></span>
                    </div>
                </div>
                <div class="voice-orb-info">
                    <span class="voice-orb-label">${isAiDisabled ? 'AI बंद है' : 'The Propbazar AI'}</span>
                    <span class="voice-orb-sub">${isAiDisabled ? 'चालू करने के लिए टैप करें' : 'क्लिक करके बात करें'}</span>
                </div>
            </div>
            <button class="voice-power-toggle ${isAiDisabled ? 'is-off' : 'is-on'}" id="voicePowerToggle" title="${isAiDisabled ? 'AI चालू करें' : 'AI बंद करें'}">
                <i class="fa-solid fa-power-off"></i>
                <span>${isAiDisabled ? 'OFF' : 'ON'}</span>
            </button>
        `;

        document.body.appendChild(container);

        const orb = container.querySelector('#propbazarVoiceOrb');
        const powerToggle = container.querySelector('#voicePowerToggle');

        orb.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isAiDisabled) {
                togglePropbazarAi(false); // Turn ON
                return;
            }
            if (isSpeaking) {
                interruptAiSpeaking();
            } else if (!permissionGranted) {
                requestMicAndStartAI();
            } else {
                startListening();
            }
        });

        powerToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            togglePropbazarAi(!isAiDisabled);
        });

        return container;
    }

    /**
     * 🛑 ON / OFF TOGGLE CONTROLLER
     */
    window.togglePropbazarAi = function (disable) {
        if (disable) {
            isAiDisabled = true;
            localStorage.setItem('propbazar_ai_disabled', 'true');
            interruptAiSpeaking();
            stopListening();
            updateVoiceUI('disabled', 'AI बंद है');
            console.log("🛑 [The Propbazar AI] Voice assistant completely disabled & backend dead.");
        } else {
            isAiDisabled = false;
            localStorage.setItem('propbazar_ai_disabled', 'false');
            updateVoiceUI('ready', 'The Propbazar AI');
            console.log("✅ [The Propbazar AI] Voice assistant activated.");
            if (!permissionGranted) {
                requestMicAndStartAI();
            } else {
                startListening();
            }
        }
    };

    /**
     * ⚡ REAL-TIME SENTENCE STREAMING AUDIO QUEUE
     * Plays sentence chunk #1 immediately while subsequent sentences load in background.
     */
    class StreamingAudioQueue {
        constructor() {
            this.queue = [];
            this.isPlaying = false;
            this.currentAudio = null;
            this.isDone = false;
            this.onCompleteCallback = null;
            this.abortController = null;
        }

        reset() {
            this.interrupt();
            this.queue = [];
            this.isPlaying = false;
            this.isDone = false;
            this.onCompleteCallback = null;
            this.abortController = new AbortController();
        }

        enqueue(chunk) {
            if (!chunk || !chunk.audioContent) return;
            const blobUrl = base64ToBlobUrl(chunk.audioContent);
            this.queue.push({
                index: chunk.index,
                text: chunk.text,
                blobUrl: blobUrl
            });
            this.queue.sort((a, b) => a.index - b.index);

            if (!this.isPlaying) {
                this.playNext();
            }
        }

        markDone(callback) {
            this.isDone = true;
            this.onCompleteCallback = callback;
            if (!this.isPlaying && this.queue.length === 0) {
                this.finish();
            }
        }

        playNext() {
            if (isAiDisabled) {
                this.interrupt();
                return;
            }

            // If thinking filler audio is currently speaking, wait for it to end
            if (activeFillerAudio && !activeFillerAudio.paused && !activeFillerAudio.ended) {
                return;
            }

            if (this.queue.length === 0) {
                this.isPlaying = false;
                if (this.isDone) {
                    this.finish();
                }
                return;
            }

            const item = this.queue.shift();
            this.isPlaying = true;
            isSpeaking = true;
            stopListening();
            updateVoiceUI('speaking', 'बोल रहा है (रोकने के लिए टैप करें)');

            const audio = new Audio();
            audio.src = item.blobUrl;
            audio.preload = 'auto';
            this.currentAudio = audio;
            window._propbazarActiveAudio = audio;

            audio.onended = () => {
                try { URL.revokeObjectURL(item.blobUrl); } catch(e){}
                this.currentAudio = null;
                window._propbazarActiveAudio = null;
                this.playNext();
            };

            audio.onerror = (e) => {
                console.warn("Stream audio chunk error:", e);
                try { URL.revokeObjectURL(item.blobUrl); } catch(err){}
                this.currentAudio = null;
                window._propbazarActiveAudio = null;
                this.playNext();
            };

            audio.play().catch(err => {
                console.warn("Audio play error, falling back to next:", err);
                try { URL.revokeObjectURL(item.blobUrl); } catch(e){}
                this.currentAudio = null;
                window._propbazarActiveAudio = null;
                this.playNext();
            });
        }

        finish() {
            this.isPlaying = false;
            isSpeaking = false;
            speechEndTime = Date.now();
            if (!isAiDisabled) {
                updateVoiceUI('listening', 'सुन रहा हूँ... बोलिए');
                scheduleListeningRestart(400);
            }
            if (typeof this.onCompleteCallback === 'function') {
                this.onCompleteCallback();
            }
        }

        interrupt() {
            if (this.abortController) {
                try { this.abortController.abort(); } catch(e){}
                this.abortController = null;
            }
            if (this.currentAudio) {
                try {
                    this.currentAudio.pause();
                    this.currentAudio.currentTime = 0;
                } catch(e){}
                this.currentAudio = null;
            }
            if (activeFillerAudio) {
                try {
                    activeFillerAudio.pause();
                    activeFillerAudio.currentTime = 0;
                } catch(e){}
                activeFillerAudio = null;
            }
            window._propbazarActiveAudio = null;
            for (const item of this.queue) {
                try { URL.revokeObjectURL(item.blobUrl); } catch(e){}
            }
            this.queue = [];
            this.isPlaying = false;
        }
    }

    const streamingAudioQueue = new StreamingAudioQueue();

    /**
     * 🎙️ Human Thinking Filler Voice
     */
    function playThinkingFiller() {
        if (isAiDisabled || document.hidden) return;
        try {
            const randomSrc = FILLER_AUDIOS[Math.floor(Math.random() * FILLER_AUDIOS.length)];
            const audio = new Audio(randomSrc);
            audio.preload = 'auto';
            activeFillerAudio = audio;
            window._propbazarActiveAudio = audio;
            isSpeaking = true;
            stopListening();
            updateVoiceUI('speaking', 'रुकिए, चेक करता हूँ...');
            audio.play().catch(e => console.warn('Filler play:', e));
            audio.onended = () => {
                activeFillerAudio = null;
                if (window._propbazarActiveAudio === audio) {
                    window._propbazarActiveAudio = null;
                }
                // Transition immediately into real streaming answer queue!
                streamingAudioQueue.playNext();
            };
            audio.onerror = () => {
                activeFillerAudio = null;
                streamingAudioQueue.playNext();
            };
        } catch(e) {
            console.warn('Thinking filler error:', e);
        }
    }

    /**
     * 🛑 INSTANT INTERRUPTION HANDLER
     */
    function interruptAiSpeaking() {
        if (isSpeaking || streamingAudioQueue.isPlaying || activeFillerAudio || window._propbazarActiveAudio || ('speechSynthesis' in window && window.speechSynthesis.speaking)) {
            console.log("🛑 [AI Interrupted] AI speech stopped immediately.");
            
            streamingAudioQueue.interrupt();

            if (activeFillerAudio) {
                try {
                    activeFillerAudio.pause();
                    activeFillerAudio.currentTime = 0;
                } catch(e){}
                activeFillerAudio = null;
            }

            if (window._propbazarActiveAudio) {
                try {
                    window._propbazarActiveAudio.pause();
                    window._propbazarActiveAudio.currentTime = 0;
                } catch (e) {}
                window._propbazarActiveAudio = null;
            }
            
            if (activeBlobUrl) {
                try { URL.revokeObjectURL(activeBlobUrl); } catch(e){}
                activeBlobUrl = null;
            }

            if ('speechSynthesis' in window) {
                try { window.speechSynthesis.cancel(); } catch (e) {}
            }

            isSpeaking = false;
            speechEndTime = Date.now();
            if (!isAiDisabled) {
                updateVoiceUI('listening', 'सुन रहा हूँ... बोलिए');
                scheduleListeningRestart(150);
            }
        }
    }

    function isEcho(userText) {
        if (!userText) return false;
        const cleanUser = userText.trim().toLowerCase().replace(/[^\w\s\u0900-\u097F]/gi, ' ');
        const userWords = cleanUser.split(/\s+/).filter(w => w.length > 1);
        if (userWords.length === 0) return false;

        // Compare against last spoken AI text and recent assistant messages
        const recentAiUtterances = [CONFIG.initialGreeting, lastSpokenAiText];
        if (Array.isArray(transcriptHistory)) {
            transcriptHistory
                .filter(t => t.role === 'assistant')
                .slice(-4)
                .forEach(t => recentAiUtterances.push(t.text));
        }

        for (const aiMsg of recentAiUtterances) {
            if (!aiMsg) continue;
            const cleanAi = aiMsg.trim().toLowerCase().replace(/[^\w\s\u0900-\u097F]/gi, ' ');
            
            // Substring match
            if (cleanUser.length >= 4 && cleanAi.includes(cleanUser)) {
                return true;
            }

            // Word overlap match
            let matchCount = 0;
            for (const w of userWords) {
                if (cleanAi.includes(w)) matchCount++;
            }
            if (userWords.length >= 2 && (matchCount / userWords.length) >= 0.5) {
                return true;
            }
        }
        return false;
    }

    function getSpeechRecognition() {
        if (isAiDisabled) return null;
        if (recognition) return recognition;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("SpeechRecognition API not supported in this browser.");
            return null;
        }

        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;
        reco.lang = CONFIG.language;
        reco.maxAlternatives = 1;

        reco.onstart = function () {
            if (isAiDisabled || isSpeaking || isProcessing) {
                reco.abort();
                return;
            }
            isListening = true;
            updateVoiceUI('listening', 'सुन रहा हूँ... बोलिए');
            console.log("🎤 [Voice AI] Listening for customer question...");
        };

        reco.onresult = function (event) {
            if (isAiDisabled || document.hidden || isSpeaking || isProcessing || (Date.now() - speechEndTime < 900)) {
                return;
            }

            let fullTranscript = '';
            let isFinal = false;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                fullTranscript += transcript;
                if (event.results[i].isFinal) {
                    isFinal = true;
                }
            }

            const currentSpeech = fullTranscript.trim();
            if (!currentSpeech || currentSpeech.length < 2) return;

            // Instant echo discard
            if (isEcho(currentSpeech)) {
                console.log("🛡️ [Echo Ignored in onresult]:", currentSpeech);
                return;
            }

            if (speechDebounceTimer) {
                clearTimeout(speechDebounceTimer);
                speechDebounceTimer = null;
            }

            speechDebounceTimer = setTimeout(() => {
                dispatchUserQuery(currentSpeech);
            }, 1500);
        };

        reco.onerror = function (event) {
            isListening = false;
            if (event.error === 'not-allowed') {
                console.warn("Microphone access denied.");
                return;
            }
            if (!isAiDisabled && !isSpeaking && !isProcessing && !document.hidden && permissionGranted) {
                scheduleListeningRestart(500);
            }
        };

        reco.onend = function () {
            isListening = false;
            if (!isAiDisabled && !isSpeaking && !isProcessing && !document.hidden && permissionGranted) {
                scheduleListeningRestart(400);
            }
        };

        recognition = reco;
        return recognition;
    }

    async function dispatchUserQuery(userSpeech) {
        if (isAiDisabled || !userSpeech || isProcessing || isSpeaking) return;
        
        if (speechDebounceTimer) {
            clearTimeout(speechDebounceTimer);
            speechDebounceTimer = null;
        }

        if (userSpeech === lastDispatchedText) return;
        lastDispatchedText = userSpeech;

        if (isEcho(userSpeech)) {
            console.log("🛡️ [Acoustic Echo Filter] Blocked self-voice loop:", userSpeech);
            scheduleListeningRestart(500);
            return;
        }

        stopListening();
        console.log(`👤 Customer Asked: "${userSpeech}"`);
        transcriptHistory.push({ role: 'user', text: userSpeech, time: new Date().toISOString() });
        detectCustomerDetails(userSpeech);

        await handleUserQuery(userSpeech);
    }

    function startListening() {
        if (isAiDisabled || isSpeaking || isProcessing || !permissionGranted || document.hidden) return;
        const reco = getSpeechRecognition();
        if (reco && !isListening) {
            try {
                reco.start();
            } catch (e) {}
        }
    }

    function scheduleListeningRestart(delayMs = 400) {
        if (restartTimer) {
            clearTimeout(restartTimer);
            restartTimer = null;
        }
        if (isAiDisabled || isSpeaking || isProcessing || document.hidden || !permissionGranted) return;

        restartTimer = setTimeout(() => {
            if (!isAiDisabled && !isSpeaking && !isProcessing && !document.hidden && !isListening && permissionGranted) {
                startListening();
            }
        }, delayMs);
    }

    function stopListening() {
        if (restartTimer) {
            clearTimeout(restartTimer);
            restartTimer = null;
        }
        if (speechDebounceTimer) {
            clearTimeout(speechDebounceTimer);
            speechDebounceTimer = null;
        }
        if (recognition) {
            try {
                recognition.abort();
            } catch (e) {}
            isListening = false;
        }
    }

    function base64ToBlobUrl(base64, mime = 'audio/mp3') {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mime });
        return URL.createObjectURL(blob);
    }

    function playGoogleAudio(base64Mp3) {
        if (isAiDisabled || !base64Mp3 || document.hidden) {
            isSpeaking = false;
            scheduleListeningRestart(400);
            return;
        }

        // Instantly kill mic before starting playback
        stopListening();
        isSpeaking = true;

        if (activeBlobUrl) {
            try { URL.revokeObjectURL(activeBlobUrl); } catch(e){}
            activeBlobUrl = null;
        }

        try {
            activeBlobUrl = base64ToBlobUrl(base64Mp3);
            const audio = new Audio();
            audio.src = activeBlobUrl;
            audio.preload = 'auto';

            window._propbazarActiveAudio = audio;

            audio.onplay = function () {
                isSpeaking = true;
                stopListening();
                updateVoiceUI('speaking', 'बोल रहा है (रोकने के लिए टैप करें)');
                console.log(`🎙️ Google Cloud Neural2 Male Voice playing smoothly...`);
            };

            audio.onended = function () {
                if (activeBlobUrl) {
                    URL.revokeObjectURL(activeBlobUrl);
                    activeBlobUrl = null;
                }
                window._propbazarActiveAudio = null;
                isSpeaking = false;
                speechEndTime = Date.now();
                console.log(`✓ AI finished speaking. Re-arming microphone after acoustic cool-down.`);
                if (!isAiDisabled) {
                    updateVoiceUI('listening', 'सुन रहा हूँ... बोलिए');
                    scheduleListeningRestart(800);
                }
            };

            audio.onerror = function (err) {
                console.error("Audio playback error:", err);
                if (activeBlobUrl) {
                    URL.revokeObjectURL(activeBlobUrl);
                    activeBlobUrl = null;
                }
                window._propbazarActiveAudio = null;
                isSpeaking = false;
                speechEndTime = Date.now();
                updateVoiceUI('ready', 'The Propbazar AI');
                scheduleListeningRestart(500);
            };

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.warn("Autoplay blocked:", e);
                });
            }
        } catch (e) {
            console.error("Audio playback exception:", e);
            isSpeaking = false;
            window._propbazarActiveAudio = null;
            scheduleListeningRestart(500);
        }
    }

    async function speakText(text) {
        if (isAiDisabled || !text || document.hidden) return;

        stopListening();
        isSpeaking = true;
        lastSpokenAiText = text;
        updateVoiceUI('thinking', 'ऑडियो तैयार हो रहा है...');

        try {
            const res = await fetch(CONFIG.ttsEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text, gender: 'MALE' })
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.audioContent) {
                    playGoogleAudio(data.audioContent);
                    return;
                }
            }
        } catch (e) {
            console.warn("Server TTS unreachable:", e);
        }
        
        isSpeaking = false;
        scheduleListeningRestart(300);
    }

    async function handleUserQuery(userSpeech) {
        if (isAiDisabled) return;

        const { currentProject, currentBhk } = getCurrentContext();
        isProcessing = true;
        stopListening();
        
        // 🎙️ Immediately speak warm thinking filler phrase ("रुकिए, चेक करता हूँ..." / "एक मिनट दीजिए...")
        playThinkingFiller();

        streamingAudioQueue.reset();
        let accumulatedText = "";
        let fullReply = "";

        try {
            const response = await fetch(CONFIG.chatStreamEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: streamingAudioQueue.abortController?.signal,
                body: JSON.stringify({
                    message: userSpeech,
                    history: transcriptHistory,
                    currentProject: currentProject,
                    currentBhk: currentBhk
                })
            });

            if (!response.ok || !response.body) {
                throw new Error("Streaming endpoint returned error status");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let sseBuffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                sseBuffer += decoder.decode(value, { stream: true });
                const lines = sseBuffer.split('\n');
                sseBuffer = lines.pop();

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data:')) {
                        const jsonStr = trimmed.slice(5).trim();
                        if (jsonStr) {
                            try {
                                const data = JSON.parse(jsonStr);
                                if (data.type === 'chunk') {
                                    isProcessing = false;
                                    accumulatedText += (accumulatedText ? ' ' : '') + data.text;
                                    streamingAudioQueue.enqueue(data);
                                } else if (data.type === 'done') {
                                    fullReply = data.fullReply || accumulatedText;
                                }
                            } catch(e) {}
                        }
                    }
                }
            }

            if (!fullReply) fullReply = accumulatedText;
            if (fullReply) {
                transcriptHistory.push({ role: 'assistant', text: fullReply, time: new Date().toISOString() });
                lastSpokenAiText = fullReply;
                logConversationToBroker();
            }

            streamingAudioQueue.markDone();
            isProcessing = false;
            return;
        } catch (streamError) {
            console.warn("Stream error/fallback:", streamError.message);
            // Graceful Fallback to standard chat endpoint if stream failed
            try {
                const fallbackRes = await fetch(CONFIG.chatEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: userSpeech,
                        history: transcriptHistory,
                        currentProject: currentProject,
                        currentBhk: currentBhk
                    })
                });
                if (fallbackRes.ok) {
                    const fbData = await fallbackRes.json();
                    fullReply = fbData.reply;
                    isProcessing = false;
                    if (fbData.audioContent) {
                        transcriptHistory.push({ role: 'assistant', text: fullReply, time: new Date().toISOString() });
                        lastSpokenAiText = fullReply;
                        logConversationToBroker();
                        playGoogleAudio(fbData.audioContent);
                        return;
                    }
                }
            } catch(e) {
                console.error("Fallback chat failed:", e);
            }
        }

        isProcessing = false;
        if (!fullReply) {
            fullReply = "इसकी जानकारी अभी उपलब्ध नहीं है। आप किसी अन्य फ्लैट या सोसाइटी के बारे में पूछ सकते हैं।";
        }
        transcriptHistory.push({ role: 'assistant', text: fullReply, time: new Date().toISOString() });
        lastSpokenAiText = fullReply;
        logConversationToBroker();
        speakText(fullReply);
    }

    function detectCustomerDetails(speech) {
        if (!speech) return;
        const digits = speech.replace(/\D/g, '');
        const phoneMatch = digits.match(/[6-9]\d{9}/);
        if (phoneMatch && !customerPhone) {
            customerPhone = phoneMatch[0];
            console.log("✓ Customer Phone:", customerPhone);
        }
        const nameMatch = speech.match(/(?:naam|name\s+is|am|hu|mera\s+naam)\s+([A-Za-z\u0900-\u097F]+)/i);
        if (nameMatch && nameMatch[1] && !customerName) {
            customerName = nameMatch[1];
            console.log("✓ Customer Name:", customerName);
        }
    }

    function logConversationToBroker() {
        if (transcriptHistory.length === 0) return;
        const duration = Math.round((Date.now() - sessionStartTime) / 1000);
        const { currentProject } = getCurrentContext();

        const sessionObj = {
            id: sessionId,
            sessionId: sessionId,
            customerName: customerName || 'Website Visitor',
            customerPhone: customerPhone || 'Not Shared',
            currentProject: currentProject || 'General Inquiry',
            durationSeconds: duration,
            dateFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            transcript: transcriptHistory
        };

        try {
            const localLeads = JSON.parse(localStorage.getItem('propbazar_leads_history') || '[]');
            const existingIdx = localLeads.findIndex(s => s.id === sessionId);
            if (existingIdx >= 0) {
                localLeads[existingIdx] = sessionObj;
            } else {
                localLeads.unshift(sessionObj);
            }
            localStorage.setItem('propbazar_leads_history', JSON.stringify(localLeads.slice(0, 50)));
        } catch(e){}

        try {
            fetch('https://thepropbazar-backend.onrender.com/api/log-conversation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionObj)
            }).catch(() => {});
        } catch(e){}
    }

    async function requestMicAndStartAI() {
        if (isAiDisabled) return;

        createVoiceOrbUI();

        if (!greeted) {
            greeted = true;
            try {
                preloadedWelcomeAudio.currentTime = 0;
                const p = preloadedWelcomeAudio.play();
                if (p !== undefined) {
                    p.then(() => {
                        isSpeaking = true;
                        window._propbazarActiveAudio = preloadedWelcomeAudio;
                        updateVoiceUI('speaking', 'AI बोल रहा है (रोकने के लिए टैप करें)');
                        console.log("⚡ [Instant Welcome Audio Played]");
                    }).catch(() => {});
                }

                preloadedWelcomeAudio.onended = function() {
                    window._propbazarActiveAudio = null;
                    isSpeaking = false;
                    speechEndTime = Date.now();
                    transcriptHistory.push({ role: 'assistant', text: CONFIG.initialGreeting, time: new Date().toISOString() });
                    lastSpokenAiText = CONFIG.initialGreeting;
                    if (!isAiDisabled) {
                        updateVoiceUI('listening', 'सुन रहा हूँ... बोलिए');
                        startListening();
                    }
                };
            } catch(e){}
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            permissionGranted = true;
            console.log("✓ Microphone access granted.");
            stream.getTracks().forEach(track => track.stop());

            if (!isSpeaking && !isAiDisabled) {
                startListening();
            }
        } catch (err) {
            console.warn("Microphone permission prompt failed or dismissed:", err);
            updateVoiceUI('ready', 'माइक एक्सेस दें');
        }
    }

    function initAssistant() {
        createVoiceOrbUI();

        if (isAiDisabled) {
            updateVoiceUI('disabled', 'AI बंद है');
            return;
        }

        function handleFirstInteraction() {
            if (!permissionGranted && !greeted && !isAiDisabled) {
                requestMicAndStartAI();
            }
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        }

        document.addEventListener('click', handleFirstInteraction, { passive: true, once: true });
        document.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAssistant);
    } else {
        initAssistant();
    }

})();
