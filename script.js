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
   2. WINDOW LOGIC (MAIN PORTFOLIO)
   ======================== */
const windowEl = document.getElementById("portfolio-window");
const taskTab = document.getElementById("taskbar-tab");

function openPortfolio() {
    windowEl.style.display = "flex";
    taskTab.style.display = "flex";
    document.getElementById('start-menu').classList.remove('show');
    document.querySelector('.start-btn').style.borderStyle = "outset";
}

function closePortfolio() {
    windowEl.style.display = "none";
    taskTab.style.display = "none";
}

function minimizeWindow() {
    windowEl.style.display = "none";
    taskTab.style.borderStyle = "outset";
    taskTab.style.background = "#c0c0c0";
}

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
   3. CREDITS WINDOW LOGIC
   ======================== */
const creditsWindow = document.getElementById("credits-window");

function openCredits() {
    creditsWindow.style.display = "flex";
    document.getElementById('start-menu').classList.remove('show');
    // Ensure it pops on top
    creditsWindow.style.zIndex = "30";
}

function closeCredits() {
    creditsWindow.style.display = "none";
}

/* ========================
   4. NAVIGATION (Sidebar)
   ======================== */
function navigate(sectionId, linkElement) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    linkElement.classList.add('active');
}

/* ========================
   5. START MENU LOGIC
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
   6. DRAGGABLE LOGIC (GENERIC)
   ======================= */
function makeDraggable(element, handle) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    handle.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "BUTTON") return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = element.getBoundingClientRect();

        // Handle initial center positioning
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

// Apply Drag to both windows
makeDraggable(document.getElementById("portfolio-window"), document.getElementById("drag-handle"));
makeDraggable(document.getElementById("credits-window"), document.getElementById("credits-handle"));

// === AUTO OPEN ON LOAD ===
openPortfolio();