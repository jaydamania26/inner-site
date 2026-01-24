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

// Maximize Logic
function toggleMaximize(elementId) {
    const el = document.getElementById(elementId);
    if (!el.classList.contains("maximized")) {
        el.classList.add("maximized");
    } else {
        el.classList.remove("maximized");
    }
    // If it's the snake window, resize the canvas
    if (elementId === 'snake-window' && typeof resizeSnakeCanvas === 'function') {
        resizeSnakeCanvas();
    }
}

function toggleMinimize(elementId, tabId) {
    const el = document.getElementById(elementId);
    if (el.style.display === "none") {
        el.style.display = "flex";
        bringToFront(el);
    } else {
        el.style.display = "none";
        if (tabId) document.getElementById(tabId).style.background = "#c0c0c0";
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
    const windows = ["portfolio-window", "credits-window", "snake-window", "shutdown-window"];
    windows.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.zIndex = "10";
    });
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
makeDraggable(document.getElementById("snake-window"), document.getElementById("snake-handle"));
makeDraggable(document.getElementById("shutdown-window"), document.getElementById("shutdown-handle"));


/* ========================
   6. SNAKE.EXE GAME LOGIC
   ======================== */
const snakeWindow = document.getElementById("snake-window");
const snakeTaskTab = document.getElementById("snake-taskbar-tab");
const snakeCanvas = document.getElementById("snakeCanvas");
const sCtx = snakeCanvas.getContext("2d");

// Game Constants
const GRID_SIZE = 20;
let snakeRunning = false;
let snakeLoop;
let snake = [];
let food = { x: 0, y: 0 };
let direction = 'right';
let nextDirection = 'right';
let snakeScore = 0;
let snakeLevel = 1;

function openSnake() {
    snakeWindow.style.display = "flex";
    if (snakeTaskTab) snakeTaskTab.style.display = "flex";
    bringToFront(snakeWindow);
    document.getElementById('start-menu').classList.remove('show');

    // Auto-resize canvas to match container but stay grid-aligned
    resizeSnakeCanvas();
}

function resizeSnakeCanvas() {
    const container = snakeWindow.querySelector('.snake-body');
    if (!container) return;
    const width = Math.floor((container.clientWidth * 0.9) / GRID_SIZE) * GRID_SIZE;
    const height = Math.floor((container.clientHeight * 0.7) / GRID_SIZE) * GRID_SIZE;
    snakeCanvas.width = width || 400;
    snakeCanvas.height = height || 400;
}

window.addEventListener('resize', () => {
    if (snakeWindow.style.display === "flex") resizeSnakeCanvas();
});

function closeSnake() {
    snakeWindow.style.display = "none";
    if (snakeTaskTab) snakeTaskTab.style.display = "none";
    stopSnake();
}

function startSnake() {
    snake = [
        { x: GRID_SIZE * 5, y: GRID_SIZE * 5 },
        { x: GRID_SIZE * 4, y: GRID_SIZE * 5 },
        { x: GRID_SIZE * 3, y: GRID_SIZE * 5 }
    ];
    direction = 'right';
    nextDirection = 'right';
    snakeScore = 0;
    snakeLevel = 1;

    // Ensure canvas is correctly sized before spawning food
    resizeSnakeCanvas();
    spawnFood();

    document.getElementById("snake-ui").style.display = "none";
    document.getElementById("snake-over-ui").style.display = "none";
    document.getElementById("snake-hud").style.display = "flex";

    updateSnakeHUD();

    if (snakeLoop) clearInterval(snakeLoop);
    snakeRunning = true;
    snakeLoop = setInterval(gameStep, 150);
}

function stopSnake() {
    snakeRunning = false;
    clearInterval(snakeLoop);
}

function spawnFood() {
    const cols = snakeCanvas.width / GRID_SIZE;
    const rows = snakeCanvas.height / GRID_SIZE;
    food.x = Math.floor(Math.random() * cols) * GRID_SIZE;
    food.y = Math.floor(Math.random() * rows) * GRID_SIZE;

    // Don't spawn on snake body
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) return spawnFood();
    }
}

function changeSnakeDir(dir) {
    if (dir === 'up' && direction !== 'down') nextDirection = 'up';
    if (dir === 'down' && direction !== 'up') nextDirection = 'down';
    if (dir === 'left' && direction !== 'right') nextDirection = 'left';
    if (dir === 'right' && direction !== 'left') nextDirection = 'right';
}

window.addEventListener("keydown", (e) => {
    if (['ArrowUp', 'w', 'W'].includes(e.key)) changeSnakeDir('up');
    if (['ArrowDown', 's', 'S'].includes(e.key)) changeSnakeDir('down');
    if (['ArrowLeft', 'a', 'A'].includes(e.key)) changeSnakeDir('left');
    if (['ArrowRight', 'd', 'D'].includes(e.key)) changeSnakeDir('right');
    if (e.key === "Escape") closeSnake();
});

function gameStep() {
    if (!snakeRunning) return;

    direction = nextDirection;
    const head = { ...snake[0] };

    if (direction === 'up') head.y -= GRID_SIZE;
    if (direction === 'down') head.y += GRID_SIZE;
    if (direction === 'left') head.x -= GRID_SIZE;
    if (direction === 'right') head.x += GRID_SIZE;

    // Wall Collision
    if (head.x < 0 || head.x >= snakeCanvas.width || head.y < 0 || head.y >= snakeCanvas.height) {
        return snakeGameOver();
    }

    // Body Collision
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) return snakeGameOver();
    }

    snake.unshift(head);

    // Food Collision
    if (head.x === food.x && head.y === food.y) {
        snakeScore += 10;
        if (snakeScore % 50 === 0) {
            snakeLevel++;
            clearInterval(snakeLoop);
            snakeLoop = setInterval(gameStep, Math.max(50, 150 - (snakeLevel * 10)));
        }
        updateSnakeHUD();
        spawnFood();
        playProfessionalSound('mouse'); // Re-use click sound for food
    } else {
        snake.pop();
    }

    drawSnake();
}

function drawSnake() {
    sCtx.fillStyle = "#000";
    sCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    // Food
    sCtx.fillStyle = "#ff0000";
    sCtx.fillRect(food.x + 2, food.y + 2, GRID_SIZE - 4, GRID_SIZE - 4);

    // Snake
    snake.forEach((part, index) => {
        sCtx.fillStyle = index === 0 ? "#00ff00" : "#00aa00";
        sCtx.fillRect(part.x + 1, part.y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });
}

function updateSnakeHUD() {
    document.getElementById("snake-score").innerText = snakeScore;
    document.getElementById("snake-level").innerText = snakeLevel;
}

function snakeGameOver() {
    stopSnake();
    document.getElementById("snake-over-ui").style.display = "flex";
    document.getElementById("snake-final-score").innerText = "SCORE: " + snakeScore;
    document.getElementById("snake-hud").style.display = "none";
}

/* ========================
   REFRSH / CONTEXT MENU LOGIC
   ======================== */
const contextMenu = document.getElementById('context-menu');

// Show menu on LEFT click (if on desktop background)
document.addEventListener('click', (e) => {
    // Only show if clicking the desktop background, not an icon or window
    if (e.target.tagName === 'BODY' || e.target.classList.contains('desktop-icons')) {
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
    } else if (!e.target.closest('#context-menu')) {
        contextMenu.style.display = 'none';
    }
});

// Also keep standard Right-Click for the context menu
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'BODY' || e.target.classList.contains('desktop-icons')) {
        e.preventDefault();
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
    }
});

function triggerRefresh() {
    contextMenu.style.display = 'none';

    // Satisfying "System Refresh" visual flicker
    const desktopIcons = document.querySelector('.desktop-icons');
    desktopIcons.style.opacity = '0';

    playProfessionalSound('mouse');

    setTimeout(() => {
        desktopIcons.style.opacity = '1';
    }, 100);
}

/* ========================
   ICON MANAGEMENT LOGIC
   ======================== */
function arrangeIcons() {
    contextMenu.style.display = 'none';
    const icons = document.querySelectorAll('.icon');
    const startX = 30;
    const startY = 30;
    const gap = 30;
    const iconHeight = 110;

    icons.forEach((icon, index) => {
        icon.style.transition = "all 0.4s ease-out";
        icon.style.position = "absolute";
        icon.style.left = `${startX}px`;
        icon.style.top = `${startY + (index * (iconHeight + gap))}px`;
    });

    playProfessionalSound('mouse');

    // Clear transition after move
    setTimeout(() => {
        icons.forEach(i => i.style.transition = "");
    }, 500);
}

function lineUpIcons() {
    contextMenu.style.display = 'none';
    const icons = document.querySelectorAll('.icon');
    const GRID_X = 140;
    const GRID_Y = 140;

    icons.forEach(icon => {
        icon.style.transition = "all 0.3s ease-out";
        const currentLeft = parseInt(icon.style.left) || icon.offsetLeft;
        const currentTop = parseInt(icon.style.top) || icon.offsetTop;

        const snappedX = Math.round((currentLeft - 30) / GRID_X) * GRID_X + 30;
        const snappedY = Math.round((currentTop - 30) / GRID_Y) * GRID_Y + 30;

        icon.style.left = `${snappedX}px`;
        icon.style.top = `${snappedY}px`;
    });

    playProfessionalSound('mouse');

    setTimeout(() => {
        icons.forEach(i => i.style.transition = "");
    }, 400);
}

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

// Global flag to ensure we only resume once
let audioStarted = false;
function ensureAudioStarted() {
    if (!audioStarted && audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            audioStarted = true;
        });
    }
}

/**
 * Professional Acoustic Engine
 * Optimized for zero-latency sync and premium textures.
 */
function playProfessionalSound(type) {
    ensureAudioStarted();

    const t = audioCtx.currentTime;
    const source = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    source.buffer = noiseBuffer;

    // Node Cleanup: Disconnect to free up resources immediately
    source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
    };

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

let isScrolling = false;
let scrollTimeout;

// Handle globally to detect any scroll
window.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, 150); // Small threshold to reset after scroll stops
}, { passive: true });

// Mouse: Fires on 'mousedown' for 1:1 tactile response (Synced)
document.addEventListener('mousedown', (e) => {
    if (isScrolling) return; // Skip if currently scrolling
    // Only trigger for primary button (left) or secondary (right)
    if (e.button === 0 || e.button === 2) {
        playProfessionalSound('mouse');
    }
});

// Keyboard: Fires instantly on 'keydown'
let lastKeyTime = 0;
document.addEventListener('keydown', (e) => {
    // Prevent "machine gun" sound effect if key is held down
    if (!e.repeat) {
        // Performance guard: limit sound frequency on mobile/slow devices
        const now = Date.now();
        if (now - lastKeyTime > 50) {
            playProfessionalSound('keyboard');
            lastKeyTime = now;
        }
    }
});

// Mobile: Professional tap sound
document.addEventListener('touchstart', () => {
    if (isScrolling) return; // Skip if currently scrolling
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

    // Always start with the showcase open as requested
    _openPortfolioInternal();
    saveState(true);
};