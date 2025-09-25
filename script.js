// script.js (전체 코드 - 최종 수정)
document.addEventListener('DOMContentLoaded', function() {
    const windowsArea = document.getElementById('windows-area');
    const menuLinks = document.querySelectorAll('.sidebar-menu a[id]');
    const submenuLinks = document.querySelectorAll('.submenu a');

    let galleryImages = [];
    let currentIndex = 0;
    let highestZIndex = 0;

    // --- (HTML 템플릿 코드는 이전과 동일) ---
    const dDayStickerHTML = `
        <div class="d-day-sticker" id="d-day-counter-popup">
            <span class="d-day-text">D + 0</span>
        </div>`;

    const calendarWindowHTML = `
        <div class="window-box calendar-window">
            <div class="window-header">
                <span class="window-title" id="calendar-year">YYYY</span>
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
            </div>
            <div class="window-content gallery-content" id="post-list-container">
                </div>
        </div>`;

    function bringToFront(windowEl) {
        if (!windowEl) return;
        highestZIndex++;
        windowEl.style.zIndex = highestZIndex;
    }

    // --- (페이지 로드 및 표시 관련 함수들은 이전과 동일) ---
    function showPost(postUrl, postTitle) {
        windowsArea.innerHTML = '';
        fetch(postUrl)
            .then(response => response.text())
            .then(htmlString => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');
                const postContentHTML = doc.body.innerHTML;
                const postViewerHTML = `<div class="window-box post-viewer-window"><div class="window-header"><span class="window-title">${postTitle}</span><div class="window-buttons"><i class="fa-solid fa-xmark" onclick="window.showHomePage()"></i></div></div><div class="window-content post-viewer-content">${postContentHTML}</div></div>`;
                windowsArea.innerHTML = postViewerHTML;
                initDraggableWindows(); // 창 드래그 기능 초기화
            })
            .catch(error => console.error('포스트를 불러오는 중 오류 발생:', error));
    }

    function loadPosts() {
        const postContainer = document.getElementById('post-list-container');
        if (!postContainer) return;
        fetch('posts.json')
            .then(response => response.json())
            .then(posts => {
                let htmlContent = '';
                posts.forEach(post => {
                    htmlContent += `<div class="gallery-item-wrapper" onclick="showPost('${post.url}', '${post.title}')"><div class="gallery-item"><div class="gallery-thumbnail"></div><p>${post.title}</p></div></div>`;
                });
                postContainer.innerHTML = htmlContent;
            })
            .catch(error => console.error('포스트 목록을 불러오는 중 오류 발생:', error));
    }

    function showHomePage() {
        menuLinks.forEach(l => l.classList.remove('active'));
        document.getElementById('menu-home').classList.add('active');
        windowsArea.innerHTML = dDayStickerHTML + calendarWindowHTML + postWindowHTML;
        runDday();
        runCalendar();
        initDraggableWindows();
        loadPosts();
    }

    function showGalleryPage() {
        clearPage();
        const galleryWindowHTML = `<div class="window-box post-viewer-window"><div class="window-header"><span class="window-title">gallery</span><div class="window-buttons"><i class="fa-solid fa-xmark" id="gallery-close-btn"></i></div></div><div class="window-content post-viewer-content" id="gallery-content-wrapper"></div></div>`;
        windowsArea.innerHTML = galleryWindowHTML;
        document.getElementById('gallery-close-btn').addEventListener('click', showGalleryGrid);
        loadGalleryImages();
        initDraggableWindows();
    }

    function loadGalleryImages() {
        const galleryContentWrapper = document.getElementById('gallery-content-wrapper');
        if (!galleryContentWrapper) return;
        fetch('gallery.json')
            .then(response => response.json())
            .then(images => {
                galleryImages = images;
                showGalleryGrid();
            })
            .catch(error => console.error('이미지를 불러올 수 없습니다.', error));
    }

    function showGalleryGrid() {
        const galleryContentWrapper = document.getElementById('gallery-content-wrapper');
        const closeBtn = document.getElementById('gallery-close-btn');
        if (!galleryContentWrapper || !closeBtn) return;
        closeBtn.style.display = 'none';
        galleryContentWrapper.style.padding = '20px';
        let htmlContent = '<div class="gallery-grid-container">';
        galleryImages.forEach((image, index) => {
            htmlContent += `<img src="${image.url}" alt="${image.alt}" style="cursor: pointer;" data-index="${index}">`;
        });
        htmlContent += '</div>';
        galleryContentWrapper.innerHTML = htmlContent;
        galleryContentWrapper.querySelector('.gallery-grid-container').addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                const index = parseInt(e.target.dataset.index, 10);
                initImageViewer(index);
            }
        });
    }

    function initImageViewer(index) {
        const galleryContentWrapper = document.getElementById('gallery-content-wrapper');
        const closeBtn = document.getElementById('gallery-close-btn');
        if (!galleryContentWrapper || !closeBtn) return;
        closeBtn.style.display = 'block';
        galleryContentWrapper.style.padding = '0';
        const viewerHTML = `<div class="image-viewer-wrapper"><img id="viewer-image-element" class="viewer-image"><div class="nav-button prev" id="viewer-prev-btn"><i class="fa-solid fa-chevron-left"></i></div><div class="nav-button next" id="viewer-next-btn"><i class="fa-solid fa-chevron-right"></i></div></div>`;
        galleryContentWrapper.innerHTML = viewerHTML;
        document.getElementById('viewer-prev-btn').addEventListener('click', () => navigateGallery(-1));
        document.getElementById('viewer-next-btn').addEventListener('click', () => navigateGallery(1));
        updateImageViewer(index);
    }

    function updateImageViewer(index) {
        currentIndex = index;
        const imageEl = document.getElementById('viewer-image-element');
        const prevBtn = document.getElementById('viewer-prev-btn');
        const nextBtn = document.getElementById('viewer-next-btn');
        if (!imageEl || !prevBtn || !nextBtn) return;
        imageEl.src = galleryImages[index].url;
        imageEl.alt = galleryImages[index].alt;
        prevBtn.classList.toggle('hidden', index === 0);
        nextBtn.classList.toggle('hidden', index === galleryImages.length - 1);
    }
    
    function navigateGallery(direction) {
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < galleryImages.length) {
            updateImageViewer(newIndex);
        }
    }

    function showCharacterPage() {
        clearPage();
        const characterWindowsHTML = `
            <div class="window-box character-window" id="leona-window">
                <div class="window-header">
                    <span class="window-title">Leona Kingscholar</span>
                    <div class="window-buttons">
                        <i class="fa-regular fa-square maximize-btn"></i>
                    </div>
                </div>
                <div class="window-content">
                    <img src="leona-profile.jpg" class="character-profile-img" alt="Leona Kingscholar Profile">
                </div>
            </div>
            <div class="window-box character-window" id="nea-window">
                <div class="window-header">
                    <span class="window-title">Nea Florian</span>
                    <div class="window-buttons">
                        <i class="fa-regular fa-square maximize-btn"></i>
                    </div>
                </div>
                <div class="window-content">
                    <img src="nea-profile.jpg" class="character-profile-img" alt="Nea Florian Profile">
                </div>
            </div>
        `;
        windowsArea.innerHTML = characterWindowsHTML;
        initDraggableWindows();
    }
    
    function toggleMaximize(windowEl) {
        if (!windowEl) return;
        const button = windowEl.querySelector('.maximize-btn');
        const isMaximized = windowEl.classList.contains('maximized');
        const allWindows = document.querySelectorAll('.window-box');

        if (isMaximized) {
            windowEl.classList.remove('maximized');
            windowEl.style.top = windowEl.dataset.originalTop;
            windowEl.style.left = windowEl.dataset.originalLeft;
            windowEl.style.width = windowEl.dataset.originalWidth;
            windowEl.style.height = 'auto';
            windowEl.style.zIndex = windowEl.dataset.originalZIndex;
            windowEl.style.transform = 'none';

            button.classList.remove('fa-window-restore');
            button.classList.add('fa-square');

            allWindows.forEach(win => {
                if (win !== windowEl) {
                    win.style.display = '';
                }
            });

        } else {
            const containerRect = windowsArea.getBoundingClientRect();
            windowEl.dataset.originalTop = getComputedStyle(windowEl).top;
            windowEl.dataset.originalLeft = getComputedStyle(windowEl).left;
            windowEl.dataset.originalWidth = getComputedStyle(windowEl).width;
            windowEl.dataset.originalZIndex = getComputedStyle(windowEl).zIndex;

            const margin = 20; // 여백을 줄여서 더 크게 보이도록 수정
            const availableWidth = containerRect.width - margin;
            const availableHeight = containerRect.height - margin;
            const contentAspectRatio = 1200 / 810;
            const headerHeight = windowEl.querySelector('.window-header').offsetHeight;
            
            let newWidth;

            if (availableWidth / contentAspectRatio + headerHeight <= availableHeight) {
                newWidth = availableWidth;
            } else {
                newWidth = (availableHeight - headerHeight) * contentAspectRatio;
            }
            
            windowEl.classList.add('maximized');
            windowEl.style.width = `${newWidth}px`;
            windowEl.style.height = 'auto';
            
            windowEl.style.top = '50%';
            windowEl.style.left = '50%';
            windowEl.style.transform = 'translate(-50%, -50%)';
            
            windowEl.style.zIndex = 9999;

            button.classList.remove('fa-square');
            button.classList.add('fa-window-restore');

            allWindows.forEach(win => {
                if (win !== windowEl) {
                    win.style.display = 'none';
                }
            });
        }
    }

    window.showHomePage = showHomePage;
    window.showPost = showPost;

    function clearPage() {
        windowsArea.innerHTML = '';
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (!this.id) return;

            const characterSubmenu = document.getElementById('character-submenu');
            const isActive = this.classList.contains('active');

            if (this.id === 'menu-character') {
                characterSubmenu.classList.toggle('open');
                if (!isActive) {
                    menuLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    showCharacterPage();
                }
            } else {
                if (!isActive) {
                    menuLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    characterSubmenu.classList.remove('open');

                    if (this.id === 'menu-home') {
                        showHomePage();
                    } else if (this.id === 'menu-gallery') {
                        showGalleryPage();
                    } else {
                        clearPage();
                    }
                }
            }
        });
    });

    submenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('menu-character').classList.remove('active');
            clearPage();
            submenuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    windowsArea.addEventListener('click', function(e) {
        if (e.target.classList.contains('maximize-btn')) {
            const windowEl = e.target.closest('.window-box');
            toggleMaximize(windowEl);
        }
    });

    // ▼▼▼ [새로 추가/수정됨] 창 드래그 기능 및 z-index 관리 ▼▼▼
    function initDraggableWindows() {
        const windows = document.querySelectorAll('.window-box');
        highestZIndex = windows.length;
        
        windows.forEach((window, index) => {
            const header = window.querySelector('.window-header');
            // 초기 z-index 설정
            window.style.zIndex = index + 1;

            if (!header) return;

            header.addEventListener('mousedown', (e) => {
                // 확대 버튼 클릭 시에는 드래그 안 함
                if (e.target.classList.contains('maximize-btn') || e.target.parentElement.classList.contains('maximize-btn')) return;

                // 확대된 상태에서는 드래그 안 함
                if (window.classList.contains('maximized')) return;

                e.preventDefault();
                window.classList.add('dragging');
                bringToFront(window);

                const startX = e.clientX;
                const startY = e.clientY;
                const startLeft = window.offsetLeft;
                const startTop = window.offsetTop;

                const containerRect = windowsArea.getBoundingClientRect();

                function onMouseMove(moveEvent) {
                    const newLeft = startLeft + moveEvent.clientX - startX;
                    const newTop = startTop + moveEvent.clientY - startY;
                    
                    // 데스크탑 영역 밖으로 나가지 않도록 위치 제한
                    const maxLeft = containerRect.width - window.offsetWidth;
                    const maxTop = containerRect.height - window.offsetHeight;

                    window.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
                    window.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
                }

                function onMouseUp() {
                    window.classList.remove('dragging');
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });

            // 창 자체를 클릭했을 때도 앞으로 오도록 함
            window.addEventListener('mousedown', () => {
                if (!window.classList.contains('maximized')) {
                    bringToFront(window);
                }
            });
        });
    }

    // --- (달력 및 D-Day 함수는 이전과 동일) ---
    function runDday() {
        const dDayText = document.querySelector('.d-day-text');
        if(!dDayText) return;
        const startDate = new Date('2025-06-23');
        const now = new Date();
        const todayForDday = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
        startDate.setHours(0,0,0,0);
        todayForDday.setHours(0,0,0,0);
        const diffTime = todayForDday - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        dDayText.textContent = `D + ${diffDays + 1}`;
    }

    function runCalendar() {
        const monthYearElement = document.getElementById('calendar-year');
        if(!monthYearElement) return;
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
    
    // 초기 페이지 로드
    showHomePage();
});

