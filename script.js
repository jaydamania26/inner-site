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

function openPortfolio() {
    windowEl.style.display = "flex";
    taskTab.style.display = "flex";
    document.getElementById('start-menu').classList.remove('show');
    bringToFront(windowEl);
    
    // Ensure we start at splash
    returnToSplash();
}

function closePortfolio() {
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
   VIEW NAVIGATION (Splash -> Content)
   ======================== */
const splashView = document.getElementById('view-splash');
const contentView = document.getElementById('view-content');

// Switch from Splash to specific section
function enterMainLayout(sectionId) {
    splashView.style.display = "none";
    contentView.style.display = "flex";
    
    // Trigger the section navigation
    // Reset all nav items
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    // Find the link that corresponds to the section and activate it
    const sidebarLinks = document.querySelectorAll('.nav-links .nav-item');
    sidebarLinks.forEach(link => {
        if(link.getAttribute('onclick').includes(sectionId)) {
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
    linkElement.classList.add('active');
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
        // Ensure menu is on top
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
        if (element.classList.contains("maximized")) return; // Don't drag if maximized

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = element.getBoundingClientRect();

        bringToFront(element);

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
    gameTaskTab.style.display = "flex";
    bringToFront(gameWindow);
    document.getElementById('start-menu').classList.remove('show');
}

function closeGame() {
    gameWindow.style.display = "none";
    gameTaskTab.style.display = "none";
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
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("mousedown", () => {
    if (gameRunning) shoot();
});

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
    const velocity = {
        x: Math.cos(angle) * 8,
        y: Math.sin(angle) * 8
    };
    bullets.push({
        x: player.x,
        y: player.y,
        vx: velocity.x,
        vy: velocity.y,
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

// 1. Listen for Right Click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Stop default browser menu
    
    // Get mouse position
    const x = e.clientX;
    const y = e.clientY;

    // Position menu
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = "flex";
});

// 2. Hide menu on Left Click
document.addEventListener('click', (e) => {
    // If we click anywhere, close the menu
    if (contextMenu.style.display === "flex") {
        contextMenu.style.display = "none";
    }
});

// 3. The Refresh Action
function triggerRefresh() {
    location.reload();
}

/* ========================
   8. SHUTDOWN / RESTART LOGIC
   ======================== */
const shutdownWindow = document.getElementById("shutdown-window");
const shutdownScreen = document.getElementById("shutdown-screen");

function openShutdown() {
    // Close start menu first
    document.getElementById('start-menu').classList.remove('show');
    document.querySelector('.start-btn').style.borderStyle = "outset";
    
    // Open Dialog
    shutdownWindow.style.display = "flex";
    bringToFront(shutdownWindow);
    
    // Position exactly center (JS helper just in case CSS varies)
    const rect = shutdownWindow.getBoundingClientRect();
    shutdownWindow.style.top = (window.innerHeight / 2 - rect.height / 2) + "px";
    shutdownWindow.style.left = (window.innerWidth / 2 - rect.width / 2) + "px";
}

function closeShutdown() {
    shutdownWindow.style.display = "none";
}

function performShutdownAction() {
    const radios = document.getElementsByName('shutdown-action');
    let selectedValue;
    
    for (const radio of radios) {
        if (radio.checked) {
            selectedValue = radio.value;
            break;
        }
    }

    if (selectedValue === 'restart') {
        location.reload();
    } else if (selectedValue === 'shutdown') {
        // Web pages can't actually shut down the computer, so we fake it
        shutdownWindow.style.display = "none";
        shutdownScreen.style.display = "flex";
        
        // Optional: Hide cursor to look more authentic
        document.body.style.cursor = "none";
    }
}

/* ========================
   9. ROAD RASH (RACING) GAME LOGIC
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

// Inputs
const rrKeys = { left: false, right: false };

// Game Objects
let rrPlayer = { x: 320, y: 380, width: 40, height: 60, speed: 5 };
let rrObstacles = []; // Other cars
let roadLines = [];

function openRR() {
    rrWindow.style.display = "flex";
    rrTaskTab.style.display = "flex";
    bringToFront(rrWindow);
    document.getElementById('start-menu').classList.remove('show');
}

function closeRR() {
    rrWindow.style.display = "none";
    rrTaskTab.style.display = "none";
    rrRunning = false;
    cancelAnimationFrame(rrAnimId);
}

// Controls
window.addEventListener("keydown", (e) => {
    if(e.key === "ArrowLeft" || e.key === "a") rrKeys.left = true;
    if(e.key === "ArrowRight" || e.key === "d") rrKeys.right = true;
});
window.addEventListener("keyup", (e) => {
    if(e.key === "ArrowLeft" || e.key === "a") rrKeys.left = false;
    if(e.key === "ArrowRight" || e.key === "d") rrKeys.right = false;
});

function startRR() {
    rrScore = 0;
    rrSpeed = 5;
    rrPlayer.x = rrCanvas.width / 2 - 20;
    rrObstacles = [];
    roadLines = [];
    
    // Init Road Lines
    for(let i=0; i<10; i++) {
        roadLines.push({y: i * 50});
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
    
    // Clear
    rrCtx.fillStyle = "#2c3e50"; // Grass color
    rrCtx.fillRect(0, 0, rrCanvas.width, rrCanvas.height);
    
    // Draw Road
    const roadX = 100;
    const roadW = 440;
    rrCtx.fillStyle = "#555"; // Road color
    rrCtx.fillRect(roadX, 0, roadW, rrCanvas.height);
    
    // Borders
    rrCtx.fillStyle = "#fff";
    rrCtx.fillRect(roadX - 10, 0, 10, rrCanvas.height);
    rrCtx.fillRect(roadX + roadW, 0, 10, rrCanvas.height);

    // Update Speed & Score
    rrSpeed += 0.005; // Acceleration
    rrScore += rrSpeed * 0.01;
    rrFrame++;

    // Move Road Lines
    rrCtx.fillStyle = "#fff";
    roadLines.forEach(line => {
        line.y += rrSpeed * 2;
        if(line.y > rrCanvas.height) line.y = -50;
        rrCtx.fillRect(rrCanvas.width/2 - 5, line.y, 10, 30);
    });

    // Move Player
    if (rrKeys.left && rrPlayer.x > roadX) rrPlayer.x -= 6;
    if (rrKeys.right && rrPlayer.x < roadX + roadW - rrPlayer.width) rrPlayer.x += 6;

    // Draw Player (Bike)
    rrCtx.fillStyle = "#e74c3c"; // Red bike
    rrCtx.fillRect(rrPlayer.x, rrPlayer.y, rrPlayer.width, rrPlayer.height);
    // Bike detail
    rrCtx.fillStyle = "#000"; 
    rrCtx.fillRect(rrPlayer.x + 10, rrPlayer.y - 10, 20, 10); // Handlebars

    // Spawn Obstacles (Cars)
    if (rrFrame % Math.floor(600 / rrSpeed) === 0) {
        let obsX = roadX + Math.random() * (roadW - 50);
        rrObstacles.push({ x: obsX, y: -100, w: 45, h: 70, color: "#3498db" });
    }

    // Handle Obstacles
    for (let i = 0; i < rrObstacles.length; i++) {
        let obs = rrObstacles[i];
        obs.y += rrSpeed * 1.5; // Cars move slower or relative to player
        
        // Draw Car
        rrCtx.fillStyle = obs.color;
        rrCtx.fillRect(obs.x, obs.y, obs.w, obs.h);
        
        // Collision Detection
        if (
            rrPlayer.x < obs.x + obs.w &&
            rrPlayer.x + rrPlayer.width > obs.x &&
            rrPlayer.y < obs.y + obs.h &&
            rrPlayer.height + rrPlayer.y > obs.y
        ) {
            rrGameOver();
        }

        // Remove if off screen
        if (obs.y > rrCanvas.height) {
            rrObstacles.splice(i, 1);
            i--;
        }
    }

    // Update HUD
    document.getElementById("rr-speed").innerText = Math.floor(rrSpeed * 10);
    document.getElementById("rr-score").innerText = Math.floor(rrScore);
}

// Initial Open
openPortfolio();