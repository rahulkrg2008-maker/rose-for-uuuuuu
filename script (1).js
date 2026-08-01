document.addEventListener('DOMContentLoaded', () => {

    /* ======================== PAGE NAVIGATION ======================== */
    window.goToPage = function(pageName) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => {
            p.classList.add('fade-out');
            setTimeout(() => {
                p.classList.remove('active', 'fade-out');
                if (p.id === 'page-' + pageName) {
                    p.classList.add('active');
                    // Re-trigger animations if needed
                    if (pageName === 'music') initMusicParticles();
                    if (pageName === 'gif') initGifHearts();
                }
            }, 400);
        });
        // Stop music when leaving music page
        if (pageName !== 'music') stopAllTracks();
    };

    /* ======================== ROSE PAGE (from uploaded files) ======================== */
    const triggerOverlay = document.getElementById('triggerOverlay');
    const startButton = document.getElementById('startButton');
    const loadingBar = document.getElementById('loadingBar');
    const statusText = document.getElementById('statusText');
    const ambientLight = document.getElementById('ambientLight');
    const ambientLight2 = document.getElementById('ambientLight2');
    const spotlightWarm = document.getElementById('spotlightWarm');
    const roseWrapper = document.getElementById('roseWrapper');
    const roseHead = document.getElementById('roseHead');
    const calyx = document.getElementById('calyx');
    const stem = document.getElementById('stem');
    const leafLeft = document.getElementById('leafLeft');
    const leafRight = document.getElementById('leafRight');
    const endText = document.getElementById('endText');
    const fallingPetalsEl = document.getElementById('fallingPetals');
    const dustParticlesEl = document.getElementById('dustParticles');
    const sparklesEl = document.getElementById('sparkles');
    const bokehCanvas = document.getElementById('bokehCanvas');
    const groundReflection = document.getElementById('groundReflection');

    const PETAL_LAYERS = [
        { count: 4, w: 24, h: 46, curl: 78, delayBase: 0, tz: 2, cls: 'petal-bud' },
        { count: 5, w: 34, h: 58, curl: 65, delayBase: 0.3, tz: 9, cls: 'petal-core' },
        { count: 6, w: 46, h: 72, curl: 48, delayBase: 0.65, tz: 18, cls: 'petal-inner' },
        { count: 7, w: 58, h: 88, curl: 22, delayBase: 1.05, tz: 30, cls: 'petal-mid-inner' },
        { count: 8, w: 72, h: 104, curl: -5, delayBase: 1.50, tz: 44, cls: 'petal-mid' },
        { count: 9, w: 86, h: 118, curl: -25, delayBase: 2.00, tz: 60, cls: 'petal-outer' },
        { count: 10, w: 98, h: 130, curl: -48, delayBase: 2.55, tz: 76, cls: 'petal-blush' },
    ];
    const SEPALS_COUNT = 5;
    const FALLING_PETAL_COLORS = [
        ['#a40020', '#3d0008'], ['#8c001a', '#2b0005'], ['#b80025', '#480008'],
        ['#cc002c', '#52000c'], ['#960019', '#350005'],
    ];
    let fallingPetalInterval = null;

    /* Bokeh Background */
    function initBokeh() {
        const ctx = bokehCanvas.getContext('2d');
        let w, h;
        const bokehDots = [];
        const BOKEH_COUNT = 35;
        function resize() { w = bokehCanvas.width = window.innerWidth; h = bokehCanvas.height = window.innerHeight; }
        resize();
        window.addEventListener('resize', resize);
        for (let i = 0; i < BOKEH_COUNT; i++) {
            bokehDots.push({
                x: Math.random() * w, y: Math.random() * h, r: Math.max(1, 2 + Math.random() * 18),
                dx: (Math.random() - 0.5) * 0.15, dy: (Math.random() - 0.5) * 0.12,
                opacity: 0.01 + Math.random() * 0.04, hue: Math.random() > 0.7 ? (340 + Math.random() * 30) : (350 + Math.random() * 20),
                pulse: Math.random() * Math.PI * 2, pulseSpeed: 0.003 + Math.random() * 0.008,
            });
        }
        function drawBokeh() {
            ctx.clearRect(0, 0, w, h);
            bokehDots.forEach(d => {
                d.x += d.dx; d.y += d.dy; d.pulse += d.pulseSpeed;
                if (d.x < -d.r) d.x = w + d.r; if (d.x > w + d.r) d.x = -d.r;
                if (d.y < -d.r) d.y = h + d.r; if (d.y > h + d.r) d.y = -d.r;
                const pulseOp = d.opacity * (0.6 + 0.4 * Math.sin(d.pulse));
                const r = Math.max(1, d.r);
                const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r);
                grad.addColorStop(0, `hsla(${d.hue}, 80%, 60%, ${pulseOp})`);
                grad.addColorStop(0.5, `hsla(${d.hue}, 70%, 45%, ${pulseOp * 0.4})`);
                grad.addColorStop(1, `hsla(${d.hue}, 60%, 30%, 0)`);
                ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
            });
            requestAnimationFrame(drawBokeh);
        }
        drawBokeh();
    }

    /* Dust Particles */
    function createDustParticles() {
        const count = 25;
        for (let i = 0; i < count; i++) {
            const dust = document.createElement('div');
            dust.className = 'dust-particle';
            const size = 1 + Math.random() * 2.5;
            const x = Math.random() * 100;
            const y = 20 + Math.random() * 70;
            const dur = 10 + Math.random() * 15;
            const fadeDelay = Math.random() * 3;
            const opacity = 0.15 + Math.random() * 0.35;
            dust.style.left = `${x}vw`; dust.style.top = `${y}vh`;
            dust.style.setProperty('--dust-size', `${size}px`);
            dust.style.setProperty('--dust-opacity', opacity);
            dust.style.setProperty('--dust-dur', `${dur}s`);
            dust.style.setProperty('--dust-delay', `${Math.random() * dur}s`);
            dust.style.setProperty('--dust-fade', `${fadeDelay}s`);
            dust.style.setProperty('--dx1', `${(Math.random() - 0.5) * 30}px`);
            dust.style.setProperty('--dy1', `${-15 - Math.random() * 30}px`);
            dust.style.setProperty('--dx2', `${(Math.random() - 0.5) * 25}px`);
            dust.style.setProperty('--dy2', `${-30 - Math.random() * 30}px`);
            dust.style.setProperty('--dx3', `${(Math.random() - 0.5) * 35}px`);
            dust.style.setProperty('--dy3', `${-10 - Math.random() * 20}px`);
            dustParticlesEl.appendChild(dust);
            setTimeout(() => dust.classList.add('visible'), 100);
        }
    }

    /* Sparkles */
    function createSparkles() {
        const count = 18;
        for (let i = 0; i < count; i++) {
            const sp = document.createElement('div');
            sp.className = 'sparkle';
            const angle = Math.random() * Math.PI * 2;
            const dist = 60 + Math.random() * 120;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist - 30;
            sp.style.left = `calc(50% + ${x}px)`;
            sp.style.bottom = `calc(245px + ${-y}px)`;
            sp.style.setProperty('--sp-size', `${1.5 + Math.random() * 3}px`);
            sp.style.setProperty('--sp-dur', `${2.5 + Math.random() * 4}s`);
            sp.style.setProperty('--sp-delay', `${Math.random() * 5}s`);
            roseWrapper.appendChild(sp);
        }
    }

    /* Card Loader */
    function startCardLoader() {
        const duration = 2800;
        const steps = [
            { threshold: 15, text: 'Loading Love.css...' },
            { threshold: 35, text: 'Parsing <3 selectors...' },
            { threshold: 55, text: 'Growing digital petals...' },
            { threshold: 72, text: 'Adding velvet textures...' },
            { threshold: 88, text: 'Optimizing 3D rendering...' },
            { threshold: 96, text: 'Compiling romance...' },
            { threshold: 100, text: 'Ready to bloom ♥' }
        ];
        let startTimestamp = null;
        function animateLoader(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const percent = Math.floor(eased * 100);
            loadingBar.style.width = `${percent}%`;
            const activeStep = steps.find(s => percent <= s.threshold) || steps[steps.length - 1];
            statusText.textContent = activeStep.text;
            if (progress < 1) { requestAnimationFrame(animateLoader); }
            else { startButton.removeAttribute('disabled'); }
        }
        requestAnimationFrame(animateLoader);
    }

    /* Create Sepals */
    function createSepals() {
        const step = 360 / SEPALS_COUNT;
        for (let i = 0; i < SEPALS_COUNT; i++) {
            const sepal = document.createElement('div');
            sepal.className = 'sepal';
            const angle = i * step + (Math.random() - 0.5) * 5;
            const delay = 0.35 + i * 0.07;
            const curl = 16 + Math.random() * 10;
            sepal.style.setProperty('--sepal-angle', `${angle}deg`);
            sepal.style.setProperty('--sepal-curl', `${curl}deg`);
            sepal.style.setProperty('--sepal-delay', `${delay}s`);
            calyx.appendChild(sepal);
        }
    }

    /* Create Petals */
    function createPetals() {
        PETAL_LAYERS.forEach((layer, li) => {
            const angleStep = 360 / layer.count;
            const layerOffset = li * 22 + (Math.random() - 0.5) * 10;
            for (let i = 0; i < layer.count; i++) {
                const petal = document.createElement('div');
                petal.className = `petal ${layer.cls}`;
                const angle = layerOffset + i * angleStep + (Math.random() - 0.5) * 6;
                const delay = layer.delayBase + i * 0.06;
                const curlJitter = (Math.random() - 0.5) * 7;
                const scaleJitter = 0.92 + Math.random() * 0.16;
                const bloomDur = 2.2 + Math.random() * 0.5;
                petal.style.width = `${layer.w}px`;
                petal.style.height = `${layer.h}px`;
                petal.style.setProperty('--angle', `${angle}deg`);
                petal.style.setProperty('--curl', `${layer.curl + curlJitter}deg`);
                petal.style.setProperty('--scale', scaleJitter);
                petal.style.setProperty('--delay', `${delay}s`);
                petal.style.setProperty('--tz', `${layer.tz}px`);
                petal.style.setProperty('--bloom-dur', `${bloomDur}s`);
                roseHead.appendChild(petal);
            }
        });
    }

    /* Grow Stem */
    function growStem() {
        return new Promise(resolve => {
            stem.classList.add('grow');
            setTimeout(() => leafLeft.classList.add('visible'), 900);
            setTimeout(() => leafRight.classList.add('visible'), 1200);
            setTimeout(resolve, 2500);
        });
    }

    /* Bloom */
    function bloom() {
        calyx.classList.add('visible');
        ambientLight.classList.add('visible');
        ambientLight2.classList.add('visible');
        spotlightWarm.classList.add('visible');
        groundReflection.classList.add('visible');
        roseHead.classList.add('blooming');
    }

    /* Falling Petals */
    function spawnFallingPetal() {
        if (fallingPetalsEl.childElementCount > 12) return;
        const petal = document.createElement('div');
        petal.className = 'falling-petal';
        const w = 9 + Math.random() * 14;
        const h = w * (1.2 + Math.random() * 0.2);
        const x = 15 + Math.random() * 70;
        const y = 2 + Math.random() * 12;
        const dur = 5 + Math.random() * 4;
        const delay = Math.random() * 0.8;
        const colors = FALLING_PETAL_COLORS[Math.floor(Math.random() * FALLING_PETAL_COLORS.length)];
        const sign = () => (Math.random() > 0.5 ? 1 : -1);
        petal.style.left = `${x}vw`; petal.style.top = `${y}vh`;
        petal.style.setProperty('--fp-w', `${w}px`);
        petal.style.setProperty('--fp-h', `${h}px`);
        petal.style.setProperty('--fp-c1', colors[0]);
        petal.style.setProperty('--fp-c2', colors[1]);
        petal.style.setProperty('--f-dur', `${dur}s`);
        petal.style.setProperty('--f-delay', `${delay}s`);
        petal.style.setProperty('--s1', `${sign() * (15 + Math.random() * 30)}px`);
        petal.style.setProperty('--s2', `${sign() * (10 + Math.random() * 25)}px`);
        petal.style.setProperty('--s3', `${sign() * (20 + Math.random() * 35)}px`);
        petal.style.setProperty('--s4', `${sign() * (10 + Math.random() * 18)}px`);
        fallingPetalsEl.appendChild(petal);
        setTimeout(() => { if (petal.parentNode) petal.remove(); }, (dur + delay) * 1000 + 500);
    }
    function startFallingPetals() {
        for (let i = 0; i < 4; i++) setTimeout(() => spawnFallingPetal(), i * 250);
        fallingPetalInterval = setInterval(() => spawnFallingPetal(), 1800);
    }

    /* Animation Sequence */
    async function startAnimationSequence() {
        bokehCanvas.classList.add('visible');
        createDustParticles();
        createSparkles();
        await growStem();
        await delay(150);
        bloom();
        setTimeout(() => roseWrapper.classList.add('rotating'), 2800);
        setTimeout(() => startFallingPetals(), 3600);
        setTimeout(() => endText.classList.add('visible'), 5000);
    }
    function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    /* Init Rose */
    startButton.addEventListener('click', () => {
        triggerOverlay.classList.add('fade-out');
        setTimeout(() => startAnimationSequence(), 900);
    });
    createSepals();
    createPetals();
    initBokeh();
    setTimeout(() => startCardLoader(), 500);

    /* ======================== PAGE 2: MUSIC ======================== */
    let audioCtx = null;
    let currentTrack = -1;
    let trackInterval = null;
    let trackNoteIndex = 0;

    // 4 unique Indian-inspired melodies
    const TRACKS = [
        { // Track 0: Raat Ki Rani - slow, dreamy
            name: 'Raat Ki Rani',
            tempo: 520,
            notes: [262, 294, 330, 349, 392, 440, 494, 523],
            pattern: [0,2,4,2,0,2,4,5, 4,2,1,2,4,2,0,-1, 2,4,5,7,5,4,2,1, 0,2,1,2,4,5,4,2],
            type: 'sine', vol: 0.08
        },
        { // Track 1: Subah Ki Kiran - bright, uplifting
            name: 'Subah Ki Kiran',
            tempo: 380,
            notes: [330, 349, 392, 440, 494, 523, 587, 659, 698, 784],
            pattern: [2,4,5,7,5,4,2,0, 4,5,7,9,7,5,4,2, 0,2,4,5,4,2,0,-1, 2,4,2,0,2,4,5,7],
            type: 'triangle', vol: 0.06
        },
        { // Track 2: Bollywood Beats - energetic
            name: 'Bollywood Beats',
            tempo: 300,
            notes: [262, 294, 330, 349, 392, 440, 494, 523, 587, 659],
            pattern: [0,2,4,5,4,2,0,2, 4,5,7,5,4,2,4,5, 7,9,7,5,4,2,0,2, 4,5,4,2,0,-1,0,2],
            type: 'sawtooth', vol: 0.04
        },
        { // Track 3: Spiritual Vibes - meditative
            name: 'Spiritual Vibes',
            tempo: 650,
            notes: [196, 220, 262, 294, 330, 349, 392, 440],
            pattern: [2,4,2,0,2,4,5,4, 2,0,-1,0,2,4,2,0, 4,5,7,5,4,2,4,2, 0,2,0,-1,0,2,4,5],
            type: 'sine', vol: 0.1
        }
    ];

    function ensureAudioCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playTone(freq, duration, type, vol) {
        ensureAudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol || 0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    }

    function playTrackStep(trackIdx) {
        const track = TRACKS[trackIdx];
        const idx = track.pattern[trackNoteIndex % track.pattern.length];
        if (idx >= 0) {
            const freq = track.notes[idx % track.notes.length];
            playTone(freq, 0.4, track.type, track.vol);
            // Harmony layer
            if (trackIdx !== 2) {
                setTimeout(() => playTone(freq * 1.5, 0.3, 'sine', track.vol * 0.4), 50);
            }
        }
        trackNoteIndex++;
    }

    window.playTrack = function(trackIdx) {
        // Stop current if playing
        if (currentTrack === trackIdx) {
            stopAllTracks();
            return;
        }
        stopAllTracks();
        currentTrack = trackIdx;
        trackNoteIndex = 0;

        // Update UI
        document.querySelectorAll('.music-tab').forEach((tab, i) => {
            const status = document.getElementById('status-' + i);
            if (i === trackIdx) {
                tab.classList.add('active');
                status.textContent = '⏸ Pause';
            } else {
                tab.classList.remove('active');
                status.textContent = '▶ Play';
            }
        });

        // Start playing
        const track = TRACKS[trackIdx];
        playTrackStep(trackIdx);
        trackInterval = setInterval(() => playTrackStep(trackIdx), track.tempo);
    };

    function stopAllTracks() {
        if (trackInterval) { clearInterval(trackInterval); trackInterval = null; }
        currentTrack = -1;
        document.querySelectorAll('.music-tab').forEach((tab, i) => {
            tab.classList.remove('active');
            document.getElementById('status-' + i).textContent = '▶ Play';
        });
    }
    window.stopAllTracks = stopAllTracks;

    /* Music Particles */
    function initMusicParticles() {
        const container = document.getElementById('musicParticles');
        if (container.childElementCount > 0) return;
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'music-particle';
            p.style.left = `${Math.random() * 100}vw`;
            p.style.top = `${Math.random() * 100}vh`;
            p.style.setProperty('--mp-size', `${1 + Math.random() * 3}px`);
            p.style.setProperty('--mp-op', `${0.1 + Math.random() * 0.3}`);
            p.style.setProperty('--mp-dur', `${8 + Math.random() * 12}s`);
            p.style.setProperty('--mp-delay', `${Math.random() * 5}s`);
            p.style.setProperty('--mp-dx', `${(Math.random() - 0.5) * 40}px`);
            p.style.setProperty('--mp-dy', `${-20 - Math.random() * 40}px`);
            container.appendChild(p);
        }
    }

    /* ======================== PAGE 3: GIF + SEALED ======================== */
    function initGifHearts() {
        const container = document.getElementById('gifHearts');
        if (container.childElementCount > 0) return;
        for (let i = 0; i < 12; i++) {
            const h = document.createElement('div');
            h.style.position = 'fixed';
            h.style.left = `${Math.random() * 100}vw`;
            h.style.top = `${Math.random() * 100}vh`;
            h.style.fontSize = `${12 + Math.random() * 16}px`;
            h.style.opacity = '0.15';
            h.style.animation = `floatFigure ${3 + Math.random() * 4}s ease-in-out infinite`;
            h.style.animationDelay = `${Math.random() * 3}s`;
            h.style.pointerEvents = 'none';
            h.style.zIndex = '5';
            h.textContent = ['💖', '💕', '💗', '💝', '💘'][Math.floor(Math.random() * 5)];
            container.appendChild(h);
        }
    }

    /* Unseal */
    window.unseal = function() {
        const stamp = document.getElementById('sealedStamp');
        const actions = document.getElementById('sealedActions');
        stamp.classList.add('opened');
        setTimeout(() => {
            actions.style.display = 'flex';
            setTimeout(() => actions.classList.add('visible'), 50);
        }, 300);
    };

    /* Send Love - Heart Explosion */
    window.sendLove = function() {
        const btn = document.getElementById('sendLoveBtn');
        const explosion = document.getElementById('heartExplosion');
        const globalHearts = document.getElementById('globalHearts');
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Local explosion from button
        const hearts = ['💖', '💕', '💗', '💝', '💘', '❤️', '🩷', '💓'];
        for (let i = 0; i < 20; i++) {
            const h = document.createElement('div');
            h.className = 'explode-heart';
            h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.5;
            const dist = 60 + Math.random() * 150;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist - 40;
            h.style.setProperty('--eh-x', `${x}px`);
            h.style.setProperty('--eh-y', `${y}px`);
            h.style.setProperty('--eh-size', `${14 + Math.random() * 20}px`);
            h.style.setProperty('--eh-dur', `${0.8 + Math.random() * 0.8}s`);
            h.style.setProperty('--eh-scale', `${0.3 + Math.random() * 0.5}`);
            explosion.appendChild(h);
            setTimeout(() => { if (h.parentNode) h.remove(); }, 2000);
        }

        // Global hearts floating up from button position
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const gh = document.createElement('div');
                gh.className = 'global-heart';
                gh.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                gh.style.left = `${centerX + (Math.random() - 0.5) * 100}px`;
                gh.style.top = `${centerY}px`;
                gh.style.setProperty('--gh-size', `${16 + Math.random() * 24}px`);
                gh.style.setProperty('--gh-dur', `${2 + Math.random() * 3}s`);
                gh.style.setProperty('--gh-y', `${-150 - Math.random() * 300}px`);
                gh.style.setProperty('--gh-rot', `${(Math.random() - 0.5) * 60}deg`);
                globalHearts.appendChild(gh);
                setTimeout(() => { if (gh.parentNode) gh.remove(); }, 5000);
            }, i * 80);
        }

        // Button feedback
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = '', 150);
    };

    /* Init music particles early so they're ready */
    initMusicParticles();
});
