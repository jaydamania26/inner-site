/* ========================
   1. CLOCK FUNCTIONALITY
   ======================== */
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ========================
   2. WINDOW MANAGEMENT
   ======================== */
// Portfolio Window
const windowEl = document.getElementById("portfolio-window");
const taskTab = document.getElementById("taskbar-tab");

// STATE TRACKER
let isMaximized = false;

// Global Window Functions (Wrappers defined at bottom for persistence)
function openPortfolio() {
    _openPortfolioInternal();
    saveState(true);
}

function closePortfolio() {
    _closePortfolioInternal();
    saveState(false);
}

// Internal Logic
function _openPortfolioInternal() {
    windowEl.style.display = "flex";
    taskTab.style.display = "flex";
    document.getElementById('start-menu').classList.remove('show');
    bringToFront(windowEl);
    // Ensure we start at splash if it's a fresh open
    if (document.getElementById('view-content').style.display === "none") {
        returnToSplash();
    }
}

function _closePortfolioInternal() {
    windowEl.style.display = "none";
    taskTab.style.display = "none";
}

function minimizeWindow() {
    windowEl.style.display = "none";
    taskTab.style.background = "#c0c0c0";
}

// MAXIMIZE FUNCTION
function toggleMaximize() {
    if (!isMaximized) {
        windowEl.classList.add("maximized");
        isMaximized = true;
    } else {
        windowEl.classList.remove("maximized");
        isMaximized = false;
    }
}

function toggleMinimize() {
    if (windowEl.style.display === "none") {
        windowEl.style.display = "flex";
        bringToFront(windowEl);
    } else {
        minimizeWindow();
    }
}

// Credits Window
const creditsWindow = document.getElementById("credits-window");

function openCredits() {
    creditsWindow.style.display = "flex";
    document.getElementById('start-menu').classList.remove('show');
    bringToFront(creditsWindow);
}

function closeCredits() {
    creditsWindow.style.display = "none";
}

// Helper: Bring clicked window to front
function bringToFront(element) {
    document.getElementById("portfolio-window").style.zIndex = "10";
    document.getElementById("credits-window").style.zIndex = "10";
    document.getElementById("game-window").style.zIndex = "10";
    document.getElementById("shutdown-window").style.zIndex = "10";
    document.getElementById("rr-window").style.zIndex = "10";
    element.style.zIndex = "30";
}

/* ========================
   3. VIEW NAVIGATION (Splash -> Content)
   ======================== */
const splashView = document.getElementById('view-splash');
const contentView = document.getElementById('view-content');

// Switch from Splash to specific section
function enterMainLayout(sectionId) {
    splashView.style.display = "none";
    contentView.style.display = "flex";

    // Reset all nav items
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Find the link that corresponds to the section and activate it
    const sidebarLinks = document.querySelectorAll('.nav-links .nav-item');
    sidebarLinks.forEach(link => {
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(sectionId)) {
            link.classList.add('active');
        }
    });

    // Show content
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

// Sidebar Navigation logic
function navigate(sectionId, linkElement) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (linkElement) linkElement.classList.add('active');
}

// Go back to Splash
function returnToSplash() {
    contentView.style.display = "none";
    splashView.style.display = "flex";
}

/* ========================
   4. START MENU LOGIC
   ======================== */
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    const btn = document.querySelector('.start-btn');

    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
        btn.style.borderStyle = "outset";
    } else {
        menu.classList.add('show');
        btn.style.borderStyle = "inset";
        menu.style.zIndex = "1001";
    }
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    const btn = document.querySelector('.start-btn');
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('show');
        btn.style.borderStyle = "outset";
    }
});

/* ========================
   5. DRAG LOGIC (GENERIC)
   ======================= */
function makeDraggable(element, handle) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    handle.addEventListener("mousedown", (e) => {
        // Prevent drag if maximizing or clicking buttons
        if (e.target.tagName === "BUTTON") return;
        if (element.classList.contains("maximized")) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = element.getBoundingClientRect();

        bringToFront(element);

        // Reset transform if exists to avoid offset issues
        if (window.getComputedStyle(element).transform !== 'none') {
            element.style.transform = "none";
            element.style.left = rect.left + "px";
            element.style.top = rect.top + "px";
        }

        initialLeft = rect.left;
        initialTop = rect.top;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            element.style.left = `${initialLeft + dx}px`;
            element.style.top = `${initialTop + dy}px`;
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}

makeDraggable(document.getElementById("portfolio-window"), document.getElementById("drag-handle"));
makeDraggable(document.getElementById("credits-window"), document.getElementById("credits-handle"));
makeDraggable(document.getElementById("game-window"), document.getElementById("game-handle"));
makeDraggable(document.getElementById("shutdown-window"), document.getElementById("shutdown-handle"));
makeDraggable(document.getElementById("rr-window"), document.getElementById("rr-handle"));


/* ========================
   6. ZOMBIE.EXE GAME LOGIC
   ======================== */
const gameWindow = document.getElementById("game-window");
const gameTaskTab = document.getElementById("game-taskbar-tab");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameRunning = false;
let animationId;
let score = 0;
let hp = 100;
let frameCount = 0;

const keys = { w: false, a: false, s: false, d: false };
const mouse = { x: 0, y: 0 };

let player = { x: 320, y: 240, size: 20, speed: 4 };
let bullets = [];
let zombies = [];
let particles = [];

function openGame() {
    gameWindow.style.display = "flex";
    if (gameTaskTab) gameTaskTab.style.display = "flex";
    bringToFront(gameWindow);
    document.getElementById('start-menu').classList.remove('show');
}

function closeGame() {
    gameWindow.style.display = "none";
    if (gameTaskTab) gameTaskTab.style.display = "none";
    gameRunning = false;
    cancelAnimationFrame(animationId);
}

window.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "ArrowUp") keys.w = true;
    if (e.key === "a" || e.key === "ArrowLeft") keys.a = true;
    if (e.key === "s" || e.key === "ArrowDown") keys.s = true;
    if (e.key === "d" || e.key === "ArrowRight") keys.d = true;
});
window.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "ArrowUp") keys.w = false;
    if (e.key === "a" || e.key === "ArrowLeft") keys.a = false;
    if (e.key === "s" || e.key === "ArrowDown") keys.s = false;
    if (e.key === "d" || e.key === "ArrowRight") keys.d = false;
});

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener("mousedown", () => {
    if (gameRunning) shoot();
});

// Mobile Controls for Zombie Game
function shootMobile() {
    if (gameRunning) {
        let targetX = mouse.x;
        let targetY = mouse.y;

        if (zombies.length > 0) {
            let closest = zombies[0];
            let minDist = 99999;
            zombies.forEach(z => {
                let d = Math.hypot(z.x - player.x, z.y - player.y);
                if (d < minDist) { minDist = d; closest = z; }
            });
            targetX = closest.x;
            targetY = closest.y;
        } else {
            targetY = player.y - 100;
        }

        const angle = Math.atan2(targetY - player.y, targetX - player.x);
        bullets.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            life: 100
        });
    }
}

function startGame() {
    score = 0;
    hp = 100;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    bullets = [];
    zombies = [];
    particles = [];
    gameRunning = true;

    document.getElementById("game-ui").style.display = "none";
    document.getElementById("game-over-ui").style.display = "none";
    document.getElementById("game-hud").style.display = "flex";

    updateHUD();
    loop();
}

function shoot() {
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * 8,
        vy: Math.sin(angle) * 8,
        life: 100
    });
}

function spawnZombie() {
    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -30 : canvas.width + 30;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? -30 : canvas.height + 30;
    }

    zombies.push({
        x: x,
        y: y,
        size: 24,
        speed: 1 + Math.random() * 1.5,
        hp: 3
    });
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 20,
            color: color
        });
    }
}

function updateHUD() {
    document.getElementById("hud-score").innerText = score.toString().padStart(5, '0');
    document.getElementById("hud-hp").innerText = hp;
    if (hp < 30) document.getElementById("hud-hp").style.color = "red";
    else document.getElementById("hud-hp").style.color = "#00ff00";
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    document.getElementById("game-over-ui").style.display = "flex";
    document.getElementById("final-score").innerText = "FINAL SCORE: " + score;
    document.getElementById("game-hud").style.display = "none";
}

function loop() {
    if (!gameRunning) return;
    animationId = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width) player.x += player.speed;

    ctx.fillStyle = "#00ff00";
    ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);

    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.strokeStyle = "rgba(0, 255, 0, 0.2)";
    ctx.stroke();

    ctx.fillStyle = "#ffff00";
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;
        ctx.fillRect(b.x - 2, b.y - 2, 4, 4);

        if (b.life <= 0 || b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }

    let spawnRate = Math.max(20, 100 - Math.floor(score / 100));
    if (frameCount % spawnRate === 0) spawnZombie();

    for (let i = zombies.length - 1; i >= 0; i--) {
        let z = zombies[i];
        let angle = Math.atan2(player.y - z.y, player.x - z.x);
        z.x += Math.cos(angle) * z.speed;
        z.y += Math.sin(angle) * z.speed;

        ctx.fillStyle = "#880000";
        ctx.fillRect(z.x - z.size / 2, z.y - z.size / 2, z.size, z.size);
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(z.x - 5, z.y - 5, 2, 2);
        ctx.fillRect(z.x + 3, z.y - 5, 2, 2);

        let dx = player.x - z.x;
        let dy = player.y - z.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < (player.size / 2 + z.size / 2)) {
            hp -= 2;
            updateHUD();
            createParticles(player.x, player.y, "#ff0000");
            z.x -= Math.cos(angle) * 20;
            z.y -= Math.sin(angle) * 20;

            if (hp <= 0) gameOver();
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            let b = bullets[j];
            let distB = Math.sqrt((b.x - z.x) ** 2 + (b.y - z.y) ** 2);
            if (distB < z.size / 2 + 2) {
                z.hp--;
                bullets.splice(j, 1);
                createParticles(z.x, z.y, "#880000");

                if (z.hp <= 0) {
                    zombies.splice(i, 1);
                    score += 50;
                    updateHUD();
                    createParticles(z.x, z.y, "#00ff00");
                }
                break;
            }
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        if (p.life <= 0) particles.splice(i, 1);
    }
}

/* ========================
   7. CONTEXT MENU (REFRESH)
   ======================== */
const contextMenu = document.getElementById("context-menu");

if (contextMenu) {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.style.display = "flex";
    });

    document.addEventListener('click', (e) => {
        if (contextMenu.style.display === "flex") {
            contextMenu.style.display = "none";
        }
    });
}

function triggerRefresh() {
    location.reload();
}

/* ========================
   8. ROAD RASH (RACING) GAME LOGIC
   ======================== */
const rrWindow = document.getElementById("rr-window");
const rrTaskTab = document.getElementById("rr-taskbar-tab");
const rrCanvas = document.getElementById("rrCanvas");
const rrCtx = rrCanvas.getContext("2d");

let rrRunning = false;
let rrAnimId;
let rrScore = 0;
let rrSpeed = 0;
let rrFrame = 0;

const rrKeys = { left: false, right: false };
let rrPlayer = { x: 320, y: 380, width: 40, height: 60, speed: 5 };
let rrObstacles = [];
let roadLines = [];

function openRR() {
    rrWindow.style.display = "flex";
    if (rrTaskTab) rrTaskTab.style.display = "flex";
    bringToFront(rrWindow);
    document.getElementById('start-menu').classList.remove('show');
}

function closeRR() {
    rrWindow.style.display = "none";
    if (rrTaskTab) rrTaskTab.style.display = "none";
    rrRunning = false;
    cancelAnimationFrame(rrAnimId);
}

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") rrKeys.left = true;
    if (e.key === "ArrowRight" || e.key === "d") rrKeys.right = true;
});
window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") rrKeys.left = false;
    if (e.key === "ArrowRight" || e.key === "d") rrKeys.right = false;
});

function startRR() {
    rrScore = 0;
    rrSpeed = 5;
    rrPlayer.x = rrCanvas.width / 2 - 20;
    rrObstacles = [];
    roadLines = [];
    for (let i = 0; i < 10; i++) {
        roadLines.push({ y: i * 50 });
    }
    rrRunning = true;
    document.getElementById("rr-ui").style.display = "none";
    document.getElementById("rr-over-ui").style.display = "none";
    document.getElementById("rr-hud").style.display = "flex";
    rrLoop();
}

function rrGameOver() {
    rrRunning = false;
    cancelAnimationFrame(rrAnimId);
    document.getElementById("rr-over-ui").style.display = "flex";
    document.getElementById("rr-final-score").innerText = "DISTANCE: " + Math.floor(rrScore) + " Miles";
    document.getElementById("rr-hud").style.display = "none";
}

function rrLoop() {
    if (!rrRunning) return;
    rrAnimId = requestAnimationFrame(rrLoop);

    // Clear & Grass
    rrCtx.fillStyle = "#2c3e50";
    rrCtx.fillRect(0, 0, rrCanvas.width, rrCanvas.height);

    // Road
    const roadX = 100;
    const roadW = 440;
    rrCtx.fillStyle = "#555";
    rrCtx.fillRect(roadX, 0, roadW, rrCanvas.height);

    // Borders
    rrCtx.fillStyle = "#fff";
    rrCtx.fillRect(roadX - 10, 0, 10, rrCanvas.height);
    rrCtx.fillRect(roadX + roadW, 0, 10, rrCanvas.height);

    rrSpeed += 0.005;
    rrScore += rrSpeed * 0.01;
    rrFrame++;

    // Road Lines
    rrCtx.fillStyle = "#fff";
    roadLines.forEach(line => {
        line.y += rrSpeed * 2;
        if (line.y > rrCanvas.height) line.y = -50;
        rrCtx.fillRect(rrCanvas.width / 2 - 5, line.y, 10, 30);
    });

    // Player
    if (rrKeys.left && rrPlayer.x > roadX) rrPlayer.x -= 6;
    if (rrKeys.right && rrPlayer.x < roadX + roadW - rrPlayer.width) rrPlayer.x += 6;
    rrCtx.fillStyle = "#e74c3c";
    rrCtx.fillRect(rrPlayer.x, rrPlayer.y, rrPlayer.width, rrPlayer.height);
    rrCtx.fillStyle = "#000"; // Handlebars
    rrCtx.fillRect(rrPlayer.x + 10, rrPlayer.y - 10, 20, 10);

    // Obstacles
    if (rrFrame % Math.floor(600 / rrSpeed) === 0) {
        let obsX = roadX + Math.random() * (roadW - 50);
        rrObstacles.push({ x: obsX, y: -100, w: 45, h: 70, color: "#3498db" });
    }

    for (let i = 0; i < rrObstacles.length; i++) {
        let obs = rrObstacles[i];
        obs.y += rrSpeed * 1.5;
        rrCtx.fillStyle = obs.color;
        rrCtx.fillRect(obs.x, obs.y, obs.w, obs.h);

        // Collision
        if (rrPlayer.x < obs.x + obs.w && rrPlayer.x + rrPlayer.width > obs.x && rrPlayer.y < obs.y + obs.h && rrPlayer.height + rrPlayer.y > obs.y) {
            rrGameOver();
        }

        if (obs.y > rrCanvas.height) {
            rrObstacles.splice(i, 1);
            i--;
        }
    }

    document.getElementById("rr-speed").innerText = Math.floor(rrSpeed * 10);
    document.getElementById("rr-score").innerText = Math.floor(rrScore);
}

/* ========================
   9. SHUTDOWN / RESTART LOGIC
   ======================== */
const shutdownWindow = document.getElementById("shutdown-window");
const shutdownScreen = document.getElementById("shutdown-screen");

function openShutdown() {
    document.getElementById('start-menu').classList.remove('show');
    document.querySelector('.start-btn').style.borderStyle = "outset";
    shutdownWindow.style.display = "flex";
    bringToFront(shutdownWindow);
}
function closeShutdown() {
    shutdownWindow.style.display = "none";
}
function performShutdownAction() {
    const radios = document.getElementsByName('shutdown-action');
    let selectedValue;
    for (const radio of radios) { if (radio.checked) { selectedValue = radio.value; break; } }
    if (selectedValue === 'restart') {
        localStorage.setItem('portfolioOpen', 'true'); // Reboot to open
        location.reload();
    }
    else if (selectedValue === 'shutdown') {
        shutdownWindow.style.display = "none";
        shutdownScreen.style.display = "flex";
        document.body.style.cursor = "none";
        localStorage.setItem('portfolioOpen', 'false');
    }
}

/* ========================
   10. SOUND SYSTEM (EXECUTIVE PROFESSIONAL AUDIO)
   ======================== */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 1. Generate High-Density Noise Buffer
// We use noise because professional hardware makes a "texture," not a "beep."
const bufferSize = audioCtx.sampleRate * 1;
const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
const data = noiseBuffer.getChannelData(0);
for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
}

/**
 * Professional Acoustic Engine
 * Optimized for zero-latency sync and premium textures.
 */
function playProfessionalSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const t = audioCtx.currentTime;
    const source = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    source.buffer = noiseBuffer;

    if (type === 'mouse') {
        // ========================
        // MOUSE: THE "MX MASTER" PRECISION TICK
        // ========================
        // High-pass filter at 5000Hz removes all the "hollow" plastic sound
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(5000, t);

        // Short, crisp volume envelope
        gain.gain.setValueAtTime(0.35, t);
        // 0.005s decay ensures a modern "snick" rather than a click
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.005);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        source.start(t);
        source.stop(t + 0.01);

    } else {
        // ========================
        // KEYBOARD: THE "EXECUTIVE" DEEP THOCK
        // ========================
        // Bandpass at 600Hz creates a solid, dampened impact sound
        filter.type = 'bandpass';

        // Frequency randomization for organic variety (removes robotic feel)
        const professionalFreq = 550 + Math.random() * 150;
        filter.frequency.setValueAtTime(professionalFreq, t);

        // Q=2.0 creates a "dense" sound, like thick PBT keycaps hitting an aluminum frame
        filter.Q.value = 2.0;

        // Controlled volume for non-fatiguing long-term use
        gain.gain.setValueAtTime(0.6, t);
        // Clean, fast decay (0.035s) for a high-end lubricated switch feel
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        source.start(t);
        source.stop(t + 0.04);
    }
}

// ========================
// PROFESSIONAL EVENT SYNC
// ========================

// Mouse: Fires on 'mousedown' for 1:1 tactile response (Synced)
document.addEventListener('mousedown', (e) => {
    // Only trigger for primary button (left) or secondary (right)
    if (e.button === 0 || e.button === 2) {
        playProfessionalSound('mouse');
    }
});

// Keyboard: Fires instantly on 'keydown'
document.addEventListener('keydown', (e) => {
    // Prevent "machine gun" sound effect if key is held down
    if (!e.repeat) {
        playProfessionalSound('keyboard');
    }
});

// Mobile: Professional tap sound
document.addEventListener('touchstart', () => {
    playProfessionalSound('mouse');
}, { passive: true });

/* ========================
   11. INITIALIZATION & PERSISTENCE
   ======================== */
// Helper to save state
function saveState(isOpen) {
    localStorage.setItem('portfolioOpen', isOpen ? 'true' : 'false');
}

// Check state on load
window.onload = function () {
    window.focus(); // Ensure keys work immediately

    // Check local storage
    const shouldOpen = localStorage.getItem('portfolioOpen') !== 'false';

    if (shouldOpen) {
        _openPortfolioInternal();
    } else {
        _closePortfolioInternal();
    }
};