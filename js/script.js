// Life Dashboard Script

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initClockAndGreeting();
    initUserName();
    initFocusTimer();
    initTodoList();
    initQuickLinks();
    initCursor();
    initTiltEffect();
    initScrollReveal();
});

/* ==============================
   1. Theme Management
============================== */
function initTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';
    setTheme(savedTheme);

    themeBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('dashboard-theme', theme);
        
        // Update Icon (Sun for Dark Mode to switch to Light, Moon for Light Mode to switch to Dark)
        if (theme === 'dark') {
            themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        } else {
            themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
    }
}

/* ==============================
   2. Clock & Greeting
============================== */
function initClockAndGreeting() {
    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');
    const greetingTime = document.getElementById('greeting-time');

    function updateTime() {
        const now = new Date();
        
        // Time format HH:MM
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}`;

        // Date format: Day, Month Date
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString(undefined, options);

        // Greeting logic
        const currentHour = now.getHours();
        let greeting = 'Good Evening,';
        if (currentHour >= 5 && currentHour < 12) {
            greeting = 'Good Morning,';
        } else if (currentHour >= 12 && currentHour < 17) {
            greeting = 'Good Afternoon,';
        }
        greetingTime.textContent = greeting;
    }

    updateTime();
    setInterval(updateTime, 1000); // Update every second
}

/* ==============================
   3. Custom Name
============================== */
function initUserName() {
    const userNameEl = document.getElementById('user-name');
    
    // Load from local storage
    const savedName = localStorage.getItem('dashboard-name') || 'Developer';
    userNameEl.textContent = savedName;

    // Save on blur or enter key
    userNameEl.addEventListener('blur', saveName);
    userNameEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            userNameEl.blur();
        }
    });

    function saveName() {
        let newName = userNameEl.textContent.trim();
        if (!newName) {
            newName = 'Developer';
            userNameEl.textContent = newName;
        }
        localStorage.setItem('dashboard-name', newName);
    }
}

/* ==============================
   4. Focus Timer (Pomodoro)
============================== */
function initFocusTimer() {
    const display = document.getElementById('timer-display');
    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    const customTimeInput = document.getElementById('pomodoro-time');
    const progressCircle = document.querySelector('.progress-ring__circle');
    
    // Circle properties
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;

    let timer;
    let totalSeconds = parseInt(customTimeInput.value) * 60;
    let remainingSeconds = totalSeconds;
    let isRunning = false;

    function setProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }

    function updateDisplay() {
        const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const seconds = String(remainingSeconds % 60).padStart(2, '0');
        display.textContent = `${minutes}:${seconds}`;
        
        const percent = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
        setProgress(percent);
    }

    function startTimer() {
        if (isRunning) return;
        if (remainingSeconds <= 0) return;
        
        isRunning = true;
        timer = setInterval(() => {
            remainingSeconds--;
            updateDisplay();

            if (remainingSeconds <= 0) {
                clearInterval(timer);
                isRunning = false;
                alert("Focus time is over! Take a break.");
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
        isRunning = false;
    }

    function resetTimer() {
        stopTimer();
        totalSeconds = parseInt(customTimeInput.value) * 60;
        remainingSeconds = totalSeconds;
        updateDisplay();
        setProgress(0);
    }

    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);

    customTimeInput.addEventListener('change', () => {
        let val = parseInt(customTimeInput.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 120) val = 120;
        customTimeInput.value = val;
        
        if (!isRunning) {
            resetTimer();
        }
    });

    // Initialize display
    updateDisplay();
    setProgress(0);
}

/* ==============================
   5. To-Do List
============================== */
function initTodoList() {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const list = document.getElementById('todo-list');
    const countDisplay = document.getElementById('task-count');

    let tasks = JSON.parse(localStorage.getItem('dashboard-tasks')) || [];

    function saveTasks() {
        localStorage.setItem('dashboard-tasks', JSON.stringify(tasks));
        updateCount();
    }

    function updateCount() {
        const pending = tasks.filter(t => !t.completed).length;
        countDisplay.textContent = `${pending} task${pending !== 1 ? 's' : ''}`;
    }

    function renderTasks() {
        list.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="todo-content">
                    <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
                    <span class="todo-text">${escapeHTML(task.text)}</span>
                </div>
                <div class="todo-actions">
                    <button class="btn-icon-sm edit-btn" data-index="${index}" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                    </button>
                    <button class="btn-icon-sm delete-btn" data-index="${index}" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            list.appendChild(li);
        });
        updateCount();
    }

    // Add Task
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            tasks.push({ text, completed: false });
            input.value = '';
            saveTasks();
            renderTasks();
        }
    });

    // Handle Click Actions
    list.addEventListener('click', (e) => {
        // Toggle Complete
        if (e.target.classList.contains('todo-checkbox')) {
            const index = e.target.getAttribute('data-index');
            tasks[index].completed = e.target.checked;
            saveTasks();
            renderTasks();
        }
        
        // Delete
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const index = deleteBtn.getAttribute('data-index');
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }

        // Edit
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const index = editBtn.getAttribute('data-index');
            const newText = prompt('Edit task:', tasks[index].text);
            if (newText !== null && newText.trim() !== '') {
                tasks[index].text = newText.trim();
                saveTasks();
                renderTasks();
            }
        }
    });

    // Helper
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    renderTasks();
}

/* ==============================
   6. Quick Links
============================== */
function initQuickLinks() {
    const form = document.getElementById('link-form');
    const titleInput = document.getElementById('link-title');
    const urlInput = document.getElementById('link-url');
    const container = document.getElementById('quick-links-container');

    const defaultLinks = [
        { title: 'GitHub', url: 'https://github.com/ramzal01' },
        { title: 'tiktok', url: 'https://www.tiktok.com/@rizaldeveloper1' }
    ];

    let links = JSON.parse(localStorage.getItem('dashboard-links')) || defaultLinks;

    function saveLinks() {
        localStorage.setItem('dashboard-links', JSON.stringify(links));
    }

    function getDomainInitial(url) {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return domain.charAt(0).toUpperCase();
        } catch {
            return 'L';
        }
    }

    function renderLinks() {
        container.innerHTML = '';
        links.forEach((link, index) => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'link-item';
            
            a.innerHTML = `
                <div class="link-icon">${getDomainInitial(link.url)}</div>
                <span class="link-title">${escapeHTML(link.title)}</span>
                <button class="delete-link-btn" data-index="${index}" title="Remove link" aria-label="Remove link">×</button>
            `;
            container.appendChild(a);
        });
    }

    // Add Link
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        let url = urlInput.value.trim();
        
        if (title && url) {
            // Auto add http if missing
            if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
            }
            
            links.push({ title, url });
            titleInput.value = '';
            urlInput.value = '';
            saveLinks();
            renderLinks();
        }
    });

    // Delete Link
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-link-btn')) {
            e.preventDefault(); // prevent navigation
            const index = e.target.getAttribute('data-index');
            if (confirm('Remove this link?')) {
                links.splice(index, 1);
                saveLinks();
                renderLinks();
            }
        }
    });

    // Helper
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    renderLinks();
}

/* ==============================
   7. Interactive Enhancements
============================== */
function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    const dot = document.getElementById('custom-cursor-dot');
    
    if (!cursor || !dot) return;

    // Use a slightly delayed animation for the outer ring
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Immediate update for the dot
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    // Lerp loop for the outer circle
    function renderCursor() {
        // Smooth interpolation
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Add hovering effect to interactive elements
    const updateInteractives = () => {
        const interactives = document.querySelectorAll('button, a, input, [contenteditable="true"], .todo-checkbox, .link-item, .delete-link-btn, .btn-icon-sm');
        interactives.forEach(el => {
            // avoid attaching multiple times
            if (el.dataset.cursorAttached) return;
            el.dataset.cursorAttached = 'true';
            
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    };
    
    updateInteractives();
    
    // Re-bind when DOM changes (like adding tasks or links)
    const observer = new MutationObserver(() => updateInteractives());
    observer.observe(document.body, { childList: true, subtree: true });
}

function initTiltEffect() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Max rotation of 4 degrees for subtle effect
            const rotateX = ((y - centerY) / centerY) * -4; 
            const rotateY = ((x - centerX) / centerX) * 4;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            // Wait for transition then remove inline transform
            setTimeout(() => {
                if (!card.matches(':hover')) {
                    card.style.transform = '';
                }
            }, 500);
        });
    });
}

function initScrollReveal() {
    const reveals = document.querySelectorAll('.blur-reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            
            // Add active class to trigger CSS transition
            entry.target.classList.add('active');
            
            // Stop observing once revealed
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });
}
