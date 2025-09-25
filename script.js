// script.js (전체 코드 - 최종 수정)
document.addEventListener('DOMContentLoaded', function() {
    const windowsArea = document.getElementById('windows-area');
    const menuLinks = document.querySelectorAll('.sidebar-menu a[id]');
    const submenuLinks = document.querySelectorAll('.submenu a');
    let highestZIndex = 0;

    // HTML 템플릿 (변경 없음)
    const dDayStickerHTML = `<div class="d-day-sticker" id="d-day-counter-popup"><span class="d-day-text">D + 0</span></div>`;
    const calendarWindowHTML = `<div class="window-box calendar-window"><div class="window-header"><span class="window-title" id="calendar-year">YYYY</span></div><div class="window-content calendar-content"><div class="month-nav"><span id="prev-month" class="arrow-btn">&lt;</span><span id="month-name">Month</span><span id="next-month" class="arrow-btn">&gt;</span></div><div class="days-of-week"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div class="dates-grid" id="dates-grid"></div></div></div>`;
    const postWindowHTML = `<div class="window-box gallery-window"><div class="window-header"><span class="window-title">Post</span></div><div class="window-content gallery-content" id="post-list-container"></div></div>`;

    // ▼▼▼ [재작성] 창 관련 기능 초기화 함수 ▼▼▼
    function initWindows() {
        const windows = document.querySelectorAll('.window-box');
        highestZIndex = windows.length;
        windows.forEach((win, index) => {
            // 1. 초기 z-index 설정
            win.style.zIndex = index + 1;
            
            // 2. 드래그 기능 추가
            makeDraggable(win);

            // 3. 클릭 시 맨 앞으로 가져오기
            win.addEventListener('mousedown', () => {
                if (!win.classList.contains('maximized')) {
                    bringToFront(win);
                }
            }, true); // 이벤트 캡처링 사용
        });
    }

    // ▼▼▼ [신규] 창을 맨 앞으로 가져오는 함수 ▼▼▼
    function bringToFront(win) {
        if (!win) return;
        highestZIndex++;
        win.style.zIndex = highestZIndex;
    }

    // ▼▼▼ [재작성] 드래그 기능 함수 ▼▼▼
    function makeDraggable(win) {
        const header = win.querySelector('.window-header');
        if (!header) return;

        header.onmousedown = function(e) {
            if (e.target.closest('.window-buttons')) return; // 버튼 클릭 시 제외
            if (win.classList.contains('maximized')) return; // 확대 시 제외

            e.preventDefault();
            win.classList.add('dragging');
            bringToFront(win);

            const container = windowsArea;
            const rect = win.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            function onMouseMove(moveEvent) {
                let newLeft = moveEvent.clientX - offsetX - containerRect.left;
                let newTop = moveEvent.clientY - offsetY - containerRect.top;

                // 영역 제한 로직
                const maxLeft = container.clientWidth - win.offsetWidth;
                const maxTop = container.clientHeight - win.offsetHeight;

                newLeft = Math.max(0, Math.min(newLeft, maxLeft));
                newTop = Math.max(0, Math.min(newTop, maxTop));
                
                win.style.left = `${newLeft}px`;
                win.style.top = `${newTop}px`;
            }

            function onMouseUp() {
                win.classList.remove('dragging');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
    }

    // 페이지 표시 함수들 (initWindows() 호출 추가)
    function showHomePage() {
        windowsArea.innerHTML = dDayStickerHTML + calendarWindowHTML + postWindowHTML;
        initWindows();
        // ... (달력, D-Day, 포스트 로드 함수 호출)
    }

    function showCharacterPage() {
        windowsArea.innerHTML = `...`; // 캐릭터 HTML 정의
        const leona = document.getElementById('leona-window');
        const nea = document.getElementById('nea-window');
        
        initWindows(); // 먼저 모든 창 초기화
        
        // 레오나 창을 맨 앞으로 가져옴
        if(leona) bringToFront(leona);
    }
    
    // ... (나머지 페이지 표시 함수들도 initWindows() 호출 추가) ...

    // 메뉴 클릭 이벤트 핸들러 (변경 없음)
    menuLinks.forEach(link => { /* ... */ });
    submenuLinks.forEach(link => { /* ... */ });

    // 확대/축소 버튼 클릭 이벤트 (변경 없음)
    windowsArea.addEventListener('click', function(e) {
        if (e.target.classList.contains('maximize-btn')) {
            const windowEl = e.target.closest('.window-box');
            toggleMaximize(windowEl);
        }
    });

    // ... (toggleMaximize, 달력, D-Day 등 나머지 함수들은 이전과 동일) ...

    // 초기 페이지 로드
    showHomePage();
});
