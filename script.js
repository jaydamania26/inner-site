/* ========================
   1. CLOCK functionality
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
   2. WINDOW LOGIC
   ======================== */
const windowEl = document.getElementById("portfolio-window");
const taskTab = document.getElementById("taskbar-tab");

// Open Window
function openPortfolio() {
    windowEl.style.display = "flex";
    taskTab.style.display = "flex";
    document.getElementById('start-menu').classList.remove('show');
    document.querySelector('.start-btn').style.borderStyle = "outset";
}

// Close Window
function closePortfolio() {
    windowEl.style.display = "none";
    taskTab.style.display = "none";
}

// Minimize (Toggle visibility)
function minimizeWindow() {
    windowEl.style.display = "none";
    taskTab.style.borderStyle = "outset"; 
    taskTab.style.background = "#c0c0c0"; 
}

// Toggle from Taskbar
function toggleMinimize() {
    if (windowEl.style.display === "none") {
        windowEl.style.display = "flex";
        taskTab.style.borderStyle = "solid"; 
        taskTab.style.borderColor = "#808080 #fff #fff #808080";
        taskTab.style.backgroundImage = "linear-gradient(45deg, #d4d0c8 25%, #ffffff 25%, #ffffff 50%, #d4d0c8 50%, #d4d0c8 75%, #ffffff 75%, #ffffff 100%)";
    } else {
        minimizeWindow();
    }
}

/* ========================
   3. NAVIGATION (Sidebar)
   ======================== */
function navigate(sectionId, linkElement) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    linkElement.classList.add('active');
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
   5. DRAGGABLE WINDOW
   ======================= */
const dragHandle = document.getElementById("drag-handle");
let isDragging = false;
let startX, startY, initialLeft, initialTop;

dragHandle.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return; 
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = windowEl.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    windowEl.style.transform = "none";
    windowEl.style.left = initialLeft + "px";
    windowEl.style.top = initialTop + "px";
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        windowEl.style.left = `${initialLeft + dx}px`;
        windowEl.style.top = `${initialTop + dy}px`;
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

/* ========================
   6. RIGHT CLICK CONTEXT MENU (REFRESH SYSTEM)
   ======================== */
const contextMenu = document.getElementById("context-menu");
const desktopArea = document.getElementById("desktop-area");

// Show menu on Right Click
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    
    // Only show if clicking on desktop background or body, NOT inside the portfolio window
    if (!windowEl.contains(e.target) || windowEl.style.display === 'none') {
        const { clientX: mouseX, clientY: mouseY } = e;
        contextMenu.style.top = `${mouseY}px`;
        contextMenu.style.left = `${mouseX}px`;
        contextMenu.style.display = "block";
    }
});

// Close menu on Left Click
document.addEventListener("click", (e) => {
    if (e.target.offsetParent != contextMenu) {
        contextMenu.style.display = "none";
    }
});