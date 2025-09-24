document.addEventListener('DOMContentLoaded', function() {
    const windowsArea = document.getElementById('windows-area');
    const menuLinks = document.querySelectorAll('.sidebar-menu a');

    const dDayStickerHTML = `
        <div class="d-day-sticker" id="d-day-counter-popup">
            <i class="fa-solid fa-heart"></i>
            <span class="d-day-text">D + 0</span>
        </div>`;
    
    const calendarWindowHTML = `
        <div class="window-box calendar-window">
            <div class="window-header">
                <span class="window-title" id="calendar-year">YYYY</span>
                <div class="window-buttons">
                    <i class="fa-solid fa-minus"></i> <i class="fa-regular fa-square"></i> <i class="fa-solid fa-xmark"></i>
                </div>
            </div>
            <div class="window-content calendar-content">
                <div class="month-nav">
                    <span id="prev-month" class="arrow-btn">&lt;</span>
                    <span id="month-name">Month</span>
                    <span id="next-month" class="arrow-btn">&gt;</span>
                </div>
                <div class="days-of-week">
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div class="dates-grid" id="dates-grid"></div>
            </div>
        </div>`;
        
    const postWindowHTML = `
        <div class="window-box gallery-window">
            <div class="window-header">
                <span class="window-title">Post</span>
                <div class="window-buttons">
                    <i class="fa-solid fa-minus"></i> <i class="fa-regular fa-square"></i> <i class="fa-solid fa-xmark"></i>
                </div>
            </div>
            <div class="window-content gallery-content">
                <div class="gallery-item">
                    <img src="https://via.placeholder.com/150x200/d7e0ff" alt="이미지 1">
                    <p>9월 문답</p>
                </div>
            </div>
        </div>`;

    function showHomePage() {
        windowsArea.innerHTML = dDayStickerHTML + calendarWindowHTML + postWindowHTML;
        runDday();
        runCalendar();
        runWindowFocus();
    }

    function clearPage() {
        windowsArea.innerHTML = '';
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            if (this.id === 'menu-home') {
                showHomePage();
            } else {
                clearPage();
            }
        });
    });

    function runWindowFocus() {
        const windows = document.querySelectorAll('.window-box');
        let highestZIndex = windows.length;
        windows.forEach(window => {
            window.addEventListener('mousedown', () => {
                highestZIndex++;
                window.style.zIndex = highestZIndex;
            });
        });
    }

    function runDday() {
        const dDayCounterPopup = document.getElementById('d-day-counter-popup').querySelector('.d-day-text');
        const startDate = new Date('2025-06-23');
        const todayForDday = new Date();
        startDate.setHours(0,0,0,0);
        todayForDday.setHours(0,0,0,0);
        const diffTime = Math.abs(todayForDday - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        dDayCounterPopup.textContent = `D + ${diffDays}`;
    }

    function runCalendar() {
        const monthYearElement = document.getElementById('calendar-year');
        const monthNameElement = document.getElementById('month-name');
        const datesGridElement = document.getElementById('dates-grid');
        const prevMonthButton = document.getElementById('prev-month');
        const nextMonthButton = document.getElementById('next-month');
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let currentDate = new Date();

        function renderCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            monthYearElement.textContent = year;
            monthNameElement.textContent = monthNames[month];
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
            const lastDateOfPrevMonth = new Date(year, month, 0).getDate();
            datesGridElement.innerHTML = '';
            for (let i = firstDayOfMonth; i > 0; i--) { datesGridElement.innerHTML += `<div class="prev-month">${lastDateOfPrevMonth - i + 1}</div>`; }
            for (let i = 1; i <= lastDateOfMonth; i++) {
                let classes = '';
                const today = new Date();
                if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) { classes += ' today'; }
                if ((month === 2 && i === 21) || (month === 6 && i === 27)) { classes += ' birthday'; }
                if (month === 5 && i === 23) { classes += ' anniversary'; }
                datesGridElement.innerHTML += `<div class="${classes}">${i}</div>`;
            }
            const totalCells = datesGridElement.children.length;
            for (let i = 1; i <= 42 - totalCells; i++) { datesGridElement.innerHTML += `<div class="next-month">${i}</div>`; }
        }
        prevMonthButton.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
        nextMonthButton.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
        renderCalendar();
    }
    
    showHomePage();
});
