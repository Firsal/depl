document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const navToggle = document.querySelector('.nav-toggle');
    const hamburger = document.querySelector('.hamburger');
    const mainContent = document.querySelector('.main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Функция для закрытия меню
    function closeMenu() {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    // Функция для плавной прокрутки к секции
    function scrollToSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            const headerOffset = 70; // Высота фиксированного header
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Обработка клика по пунктам меню
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Закрываем меню при клике на мобильных устройствах
            if (window.innerWidth < 768) {
                closeMenu();
            }
            
            // Плавная прокрутка к секции
            scrollToSection(targetId);
        });
    });

    // Отслеживание активного пункта меню при прокрутке
    function updateActiveNavLink() {
        const headerOffset = 70;
        const scrollPosition = window.scrollY + headerOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Проверяем, находимся ли мы в конце страницы
        const isAtBottom = windowHeight + window.scrollY >= documentHeight - 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            // Если мы в конце страницы, активируем последний пункт меню
            if (isAtBottom && sectionId === 'contacts') {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#contacts') {
                        link.classList.add('active');
                    }
                });
                return;
            }

            // Обычная логика для остальных секций
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Обработка клика по гамбургеру
    function toggleMenu() {
        sidebar.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        if (window.innerWidth >= 768) {
            document.body.classList.toggle('no-scroll');
        }
    }

    if (navToggle) {
    navToggle.addEventListener('click', toggleMenu);
    }

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (sidebar && navToggle &&
            !sidebar.contains(e.target) && 
            !navToggle.contains(e.target) && 
            sidebar.classList.contains('active')) {
            closeMenu();
        }
    });

    // Добавляем обработчик прокрутки с debounce для оптимизации
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(() => {
            updateActiveNavLink();
        });
    });

    // Обновляем активный пункт меню при загрузке страницы
    window.addEventListener('load', updateActiveNavLink);

    // Инициализация слайдеров
    function initSliders() {
        // Инициализация слайдера акций
        const promoSlider = document.querySelector('.promo-slider');
        const promoPrev = document.querySelector('#promo .slider-nav.prev');
        const promoNext = document.querySelector('#promo .slider-nav.next');
        let promoCurrentPosition = 0;

        if (promoSlider && promoPrev && promoNext) {
            const promoCardWidth = promoSlider.querySelector('.promo-card').offsetWidth;
            const promoGap = 30;
            const promoScrollAmount = promoCardWidth + promoGap;

            promoPrev.addEventListener('click', () => {
                promoCurrentPosition = Math.min(0, promoCurrentPosition + promoScrollAmount);
                promoSlider.style.transform = `translateX(${promoCurrentPosition}px)`;
            });

            promoNext.addEventListener('click', () => {
                const maxScroll = -(promoSlider.scrollWidth - promoSlider.parentElement.clientWidth);
                promoCurrentPosition = Math.max(maxScroll, promoCurrentPosition - promoScrollAmount);
                promoSlider.style.transform = `translateX(${promoCurrentPosition}px)`;
            });

            // Обработка свайпов для мобильных устройств
            let touchStartX = 0;
            let touchEndX = 0;

            promoSlider.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            promoSlider.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const swipeDistance = touchEndX - touchStartX;
                
                if (Math.abs(swipeDistance) > 50) {
                    if (swipeDistance > 0) {
                        promoCurrentPosition = Math.min(0, promoCurrentPosition + promoScrollAmount);
                    } else {
                        const maxScroll = -(promoSlider.scrollWidth - promoSlider.parentElement.clientWidth);
                        promoCurrentPosition = Math.max(maxScroll, promoCurrentPosition - promoScrollAmount);
                    }
                    promoSlider.style.transform = `translateX(${promoCurrentPosition}px)`;
                }
            }, { passive: true });
        }

        // Инициализация слайдера мероприятий
        const eventsSlider = document.querySelector('.events-slider');
        const eventsPrev = document.querySelector('#events .slider-nav.prev');
        const eventsNext = document.querySelector('#events .slider-nav.next');
        let eventsCurrentPosition = 0;

        if (eventsSlider && eventsPrev && eventsNext) {
            const eventCardWidth = eventsSlider.querySelector('.event-card').offsetWidth;
            const eventsGap = 30;
            const eventsScrollAmount = eventCardWidth + eventsGap;

            eventsPrev.addEventListener('click', () => {
                eventsCurrentPosition = Math.min(0, eventsCurrentPosition + eventsScrollAmount);
                eventsSlider.style.transform = `translateX(${eventsCurrentPosition}px)`;
            });

            eventsNext.addEventListener('click', () => {
                const maxScroll = -(eventsSlider.scrollWidth - eventsSlider.parentElement.clientWidth);
                eventsCurrentPosition = Math.max(maxScroll, eventsCurrentPosition - eventsScrollAmount);
                eventsSlider.style.transform = `translateX(${eventsCurrentPosition}px)`;
            });

            // Обработка свайпов для мобильных устройств
            let touchStartX = 0;
            let touchEndX = 0;

            eventsSlider.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            eventsSlider.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const swipeDistance = touchEndX - touchStartX;
                
                if (Math.abs(swipeDistance) > 50) {
                    if (swipeDistance > 0) {
                        eventsCurrentPosition = Math.min(0, eventsCurrentPosition + eventsScrollAmount);
                    } else {
                        const maxScroll = -(eventsSlider.scrollWidth - eventsSlider.parentElement.clientWidth);
                        eventsCurrentPosition = Math.max(maxScroll, eventsCurrentPosition - eventsScrollAmount);
                    }
                    eventsSlider.style.transform = `translateX(${eventsCurrentPosition}px)`;
                }
            }, { passive: true });
        }
    }

    // Инициализация слайдеров после полной загрузки страницы
    window.addEventListener('load', () => {
        initSliders();
    });

    // Оптимизация ресайза
    let resizeTimer;
    window.addEventListener('resize', () => {
        document.body.classList.add('resize-animation-stopper');
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            document.body.classList.remove('resize-animation-stopper');
            initSliders();
        }, 400);
    });

    // Обработка битых изображений
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.onerror = function() {
            this.src = 'images/placeholder.jpg';
            this.alt = 'Изображение временно недоступно';
        };
    });

    // --- Авторизация: имя пользователя в шапке ---
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        fetch('check_auth.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => {
                // Удаляем старое выпадающее меню, если оно есть
                let oldDropdown = document.querySelector('.user-dropdown');
                if (oldDropdown) oldDropdown.remove();
                // Удаляем старые обработчики с loginBtn
                const newLoginBtn = loginBtn.cloneNode(true);
                loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
                // Теперь работаем с новым loginBtn
                const loginBtnActual = document.querySelector('.login-btn');
                if (data.success && data.authenticated && data.user) {
                    let displayName = data.user.name ? (data.user.name.charAt(0).toUpperCase() + data.user.name.slice(1)) : data.user.email;
                    loginBtnActual.textContent = displayName;
                    loginBtnActual.href = 'cabinet.html';
                    loginBtnActual.classList.add('user-logged-in');
                    // Добавим выпадающее меню (выход и бронирование, и админ-панель для админов)
                    let dropdown = document.createElement('div');
                    dropdown.className = 'user-dropdown';
                    let menuHtml = '';
                    if (data.user.role === 'admin') {
                        menuHtml += `<a href='admin.html'>Админ-панель</a>`;
                    }
                    menuHtml += `<a href='cabinet.html'>Мои бронирования</a><a href='booking.html' id='bookingLink'>Бронирование</a><a href='#' id='logoutLink'>Выйти</a>`;
                    dropdown.innerHTML = menuHtml;
                    document.body.appendChild(dropdown);
                    function positionDropdown() {
                        const rect = loginBtnActual.getBoundingClientRect();
                        dropdown.style.position = 'absolute';
                        dropdown.style.top = (window.scrollY + rect.bottom + 4) + 'px';
                        dropdown.style.left = (window.scrollX + rect.left) + 'px';
                        dropdown.style.minWidth = rect.width + 'px';
                        dropdown.style.zIndex = 99999;

                        // Получаем ширину меню
                        const dropdownRect = dropdown.getBoundingClientRect();
                        // Если меню выходит за правый край — прижимаем к правому краю окна
                        if (dropdownRect.right > window.innerWidth) {
                            dropdown.style.left = (window.scrollX + window.innerWidth - dropdownRect.width - 8) + 'px';
                        }
                        // Если меню выходит за левый край — прижимаем к левому краю окна
                        if (dropdownRect.left < 0) {
                            dropdown.style.left = (window.scrollX + 8) + 'px';
                        }
                    }
                    let hideTimeout;
                    function showDropdown() {
                        clearTimeout(hideTimeout);
                        positionDropdown();
                        dropdown.style.display = 'block';
                    }
                    function hideDropdown() {
                        hideTimeout = setTimeout(() => dropdown.style.display = 'none', 200);
                    }
                    // --- Мобильная адаптивность: открытие меню по тапу ---
                    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                    if (isTouch) {
                        let menuOpen = false;
                        loginBtnActual.addEventListener('click', function(e) {
                            e.preventDefault();
                            menuOpen = !menuOpen;
                            if (menuOpen) {
                                positionDropdown();
                                dropdown.style.display = 'block';
                            } else {
                                dropdown.style.display = 'none';
                            }
                        });
                        document.addEventListener('click', function(e) {
                            if (!dropdown.contains(e.target) && e.target !== loginBtnActual) {
                                dropdown.style.display = 'none';
                                menuOpen = false;
                            }
                        });
                    } else {
                        loginBtnActual.addEventListener('mouseenter', showDropdown);
                        loginBtnActual.addEventListener('mouseleave', hideDropdown);
                        dropdown.addEventListener('mouseenter', showDropdown);
                        dropdown.addEventListener('mouseleave', hideDropdown);
                    }
                    window.addEventListener('scroll', positionDropdown);
                    window.addEventListener('resize', positionDropdown);
                    document.getElementById('logoutLink').onclick = async function(e) {
                        e.preventDefault();
                        await fetch('logout.php', { credentials: 'same-origin' });
                        window.location.reload();
                    };
                } else {
                    loginBtnActual.textContent = 'Вход';
                    loginBtnActual.href = 'login.html';
                    loginBtnActual.classList.remove('user-logged-in');
                    let dropdown = document.querySelector('.user-dropdown');
                    if (dropdown) dropdown.remove();
                }
            });
    }

    // Универсальная проверка авторизации при клике на кнопки бронирования
    function setupBookingAuthCheck() {
        document.querySelectorAll('.booking-main-btn, .nav-link[href="booking.html"]').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                const res = await fetch('check_auth.php', { credentials: 'same-origin' });
                const data = await res.json();
                if (!data.success || !data.authenticated) {
                    e.preventDefault();
                    alert('Для бронирования необходимо авторизоваться!');
                    window.location.href = 'login.html';
                }
                // если авторизован — переход работает как обычно
            });
        });
    }
    setupBookingAuthCheck();

    // === Админ-функции для promo/events ===
    // Проверка роли админа
    fetch('check_auth.php', { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.authenticated && data.user && data.user.role === 'admin') {
                enableAdminPromoEvents();
            }
        });

    function enableAdminPromoEvents() {
        const addPromoBtn = document.getElementById('addPromoBtn');
        const addEventBtn = document.getElementById('addEventBtn');
        const addMasterclassBtn = document.getElementById('addMasterclassBtn');
        if (addPromoBtn) {
            addPromoBtn.style.display = '';
            addPromoBtn.onclick = () => openAdminModal('promo');
        }
        if (addEventBtn) {
            addEventBtn.style.display = '';
            addEventBtn.onclick = () => openAdminModal('event');
        }
        if (addMasterclassBtn) {
            addMasterclassBtn.style.display = '';
            addMasterclassBtn.onclick = () => openAdminModal('masterclass');
        }
    }

    // Модалка
    const adminModal = document.getElementById('adminModal');
    const adminModalClose = document.getElementById('adminModalClose');
    const adminForm = document.getElementById('adminForm');
    const adminFormType = document.getElementById('adminFormType');
    const adminFormId = document.getElementById('adminFormId');
    const adminTitle = document.getElementById('adminTitle');
    const adminDesc = document.getElementById('adminDesc');
    const adminDate = document.getElementById('adminDate');
    const adminValidFrom = document.getElementById('adminValidFrom');
    const adminValidTo = document.getElementById('adminValidTo');
    const adminPromoDates = document.getElementById('adminPromoDates');
    const adminDateGroup = document.getElementById('adminDateGroup');
    const adminImage = document.getElementById('adminImage');
    const adminImageUrl = document.getElementById('adminImageUrl');
    const adminImagePreview = document.getElementById('adminImagePreview');
    const adminFormMsg = document.getElementById('adminFormMsg');
    let editingType = null;

    // Открыть модалку
    window.openAdminModal = function(type, data = null) {
        adminForm.reset();
        adminFormMsg.textContent = '';
        adminImagePreview.innerHTML = '';
        adminFormType.value = type;
        adminFormId.value = data && data.id ? data.id : '';
        editingType = type;
        if (type === 'promo') {
            adminPromoDates.style.display = '';
            adminDate.style.display = 'none';
            adminDateGroup.querySelector('label').textContent = 'Период действия';
        } else if (type === 'event') {
            adminPromoDates.style.display = 'none';
            adminDate.style.display = '';
            adminDateGroup.querySelector('label').textContent = 'Дата';
        } else if (type === 'masterclass') {
            adminPromoDates.style.display = 'none';
            adminDate.style.display = '';
            adminDateGroup.querySelector('label').textContent = 'Дата мастер-класса';
        }
        document.getElementById('adminModalTitle').textContent = data ? 'Редактировать' : 'Добавить';
        if (data) {
            adminTitle.value = data.title || '';
            adminDesc.value = data.description || '';
            if (type === 'promo') {
                adminValidFrom.value = data.valid_from || '';
                adminValidTo.value = data.valid_to || '';
            } else if (type === 'event') {
                adminDate.value = data.event_date || '';
            } else if (type === 'masterclass') {
                adminDate.value = data.masterclass_date || '';
            }
            adminImageUrl.value = data.image || '';
            if (data.image) {
                adminImagePreview.innerHTML = `<img src="${data.image}" style="max-width:180px;max-height:120px;">`;
            }
        }
        adminModal.style.display = 'flex';
    };
    adminModalClose.onclick = () => adminModal.style.display = 'none';
    window.onclick = e => { if (e.target === adminModal) adminModal.style.display = 'none'; };

    // Загрузка картинки
    adminImage.onchange = async function() {
        adminFormMsg.textContent = '';
        if (!this.files[0]) return;
        const formData = new FormData();
        formData.append('image', this.files[0]);
        adminImagePreview.innerHTML = 'Загрузка...';
        try {
            const res = await fetch('upload_image.php', { method: 'POST', body: formData, credentials: 'same-origin' });
            const data = await res.json();
            if (data.success) {
                adminImageUrl.value = data.url;
                adminImagePreview.innerHTML = `<img src="${data.url}" style="max-width:180px;max-height:120px;">`;
            } else {
                adminImagePreview.innerHTML = '';
                adminFormMsg.textContent = data.message || 'Ошибка загрузки';
            }
        } catch (e) {
            adminImagePreview.innerHTML = '';
            adminFormMsg.textContent = 'Ошибка загрузки';
        }
    };

    // Сохранение
    adminForm.onsubmit = async function(e) {
        e.preventDefault();
        adminFormMsg.textContent = '';
        const type = adminFormType.value;
        const id = adminFormId.value;
        const title = adminTitle.value.trim();
        const description = adminDesc.value.trim();
        const image = adminImageUrl.value;
        let body = { title, description, image };
        let url = 'admin_api.php?entity=' + type;
        let method = id ? 'PUT' : 'POST';
        if (type === 'promo') {
            body.valid_from = adminValidFrom.value;
            body.valid_to = adminValidTo.value;
        } else if (type === 'event') {
            body.event_date = adminDate.value;
        } else if (type === 'masterclass') {
            body.masterclass_date = adminDate.value;
        }
        if (id) body.id = id;
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'same-origin'
            });
            const data = await res.json();
            if (data.success) {
                adminModal.style.display = 'none';
                loadPromos();
                loadEvents();
                loadMasterclasses();
            } else {
                adminFormMsg.textContent = data.message || 'Ошибка сохранения';
            }
        } catch (e) {
            adminFormMsg.textContent = 'Ошибка сохранения';
        }
    };

    // Рендер карточек promo/events с иконками для админа
    async function loadPromos() {
        const res = await fetch('admin_api.php?entity=promo&all=1');
        const data = await res.json();
        const slider = document.querySelector('.promo-slider');
        slider.innerHTML = '';
        if (data.success && Array.isArray(data.promos)) {
            data.promos.forEach(promo => {
                const card = document.createElement('div');
                card.className = 'promo-card';
                card.innerHTML = `
                    <img src="${promo.image || 'images/placeholder.jpg'}" alt="${promo.title}">
                    <div class="promo-info">
                        <h3>${promo.title}</h3>
                        <p>${promo.description}</p>
                        <div class="promo-price">${promo.valid_from && promo.valid_to ? `${promo.valid_from} — ${promo.valid_to}` : ''}</div>
                        <div class="admin-card-actions" style="display:none;">
                            <button class="admin-card-btn edit-btn" title="Редактировать">✏️</button>
                            <button class="admin-card-btn delete-btn" title="Удалить">🗑</button>
                        </div>
                    </div>
                `;
                // Для админа — показать кнопки
                if (document.getElementById('addPromoBtn').style.display !== 'none') {
                    card.querySelector('.admin-card-actions').style.display = 'block';
                    card.querySelector('.edit-btn').onclick = () => openAdminModal('promo', promo);
                    card.querySelector('.delete-btn').onclick = async () => {
                        if (confirm('Удалить акцию?')) {
                            await fetch('admin_api.php?entity=promo&id=' + promo.id, { method: 'DELETE', credentials: 'same-origin' });
                            loadPromos();
                        }
                    };
                }
                slider.appendChild(card);
            });
        }
    }
    async function loadEvents() {
        const res = await fetch('admin_api.php?entity=event&all=1');
        const data = await res.json();
        const slider = document.querySelector('.events-slider');
        slider.innerHTML = '';
        if (data.success && Array.isArray(data.events)) {
            data.events.forEach(event => {
                const card = document.createElement('div');
                card.className = 'event-card';
                card.innerHTML = `
                    <img src="${event.image || 'images/placeholder.jpg'}" alt="${event.title}">
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <div class="event-date">${event.event_date || ''}</div>
                        <div class="admin-card-actions" style="display:none;">
                            <button class="admin-card-btn edit-btn" title="Редактировать">✏️</button>
                            <button class="admin-card-btn delete-btn" title="Удалить">🗑</button>
                        </div>
                    </div>
                `;
                if (document.getElementById('addEventBtn').style.display !== 'none') {
                    card.querySelector('.admin-card-actions').style.display = 'block';
                    card.querySelector('.edit-btn').onclick = () => openAdminModal('event', event);
                    card.querySelector('.delete-btn').onclick = async () => {
                        if (confirm('Удалить мероприятие?')) {
                            await fetch('admin_api.php?entity=event&id=' + event.id, { method: 'DELETE', credentials: 'same-origin' });
                            loadEvents();
                        }
                    };
                }
                slider.appendChild(card);
            });
        }
    }
    async function loadMasterclasses() {
        const res = await fetch('admin_api.php?entity=masterclass&all=1');
        const data = await res.json();
        const slider = document.querySelector('.masterclasses-slider');
        slider.innerHTML = '';
        if (data.success && Array.isArray(data.masterclasses)) {
            data.masterclasses.forEach(mc => {
                const card = document.createElement('div');
                card.className = 'masterclass-card';
                card.innerHTML = `
                    <img src="${mc.image || 'images/placeholder.jpg'}" alt="${mc.title}">
                    <div class="masterclass-info">
                        <h3>${mc.title}</h3>
                        <p>${mc.description}</p>
                        <div class="masterclass-date">${mc.masterclass_date || ''}</div>
                        <div class="admin-card-actions" style="display:none;">
                            <button class="admin-card-btn edit-btn" title="Редактировать">✏️</button>
                            <button class="admin-card-btn delete-btn" title="Удалить">🗑</button>
                        </div>
                    </div>
                `;
                if (document.getElementById('addMasterclassBtn').style.display !== 'none') {
                    card.querySelector('.admin-card-actions').style.display = 'block';
                    card.querySelector('.edit-btn').onclick = () => openAdminModal('masterclass', mc);
                    card.querySelector('.delete-btn').onclick = async () => {
                        if (confirm('Удалить мастер-класс?')) {
                            await fetch('admin_api.php?entity=masterclass&id=' + mc.id, { method: 'DELETE', credentials: 'same-origin' });
                            loadMasterclasses();
                        }
                    };
                }
                slider.appendChild(card);
            });
        }
    }
    // Загружаем карточки при загрузке страницы
    loadPromos();
    loadEvents();
    loadMasterclasses();
});

/* CSS для user-logged-in и user-dropdown */
const style = document.createElement('style');
style.textContent = `
.login-btn.user-logged-in {
  background: #f5f5f5;
  color: #2a5248;
  font-weight: 700;
  border-radius: 8px;
  padding: 8px 18px;
  position: relative;
  transition: background 0.18s, color 0.18s;
}
.user-dropdown {
  display: none;
  position: absolute;
  right: 0;
  top: 110%;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 16px #0002;
  min-width: 170px;
  z-index: 100;
  padding: 8px 0;
}
.user-dropdown a {
  display: block;
  padding: 10px 18px;
  color: #234b36;
  text-decoration: none;
  font-size: 1.05rem;
  transition: background 0.15s, color 0.15s;
}
.user-dropdown a:hover {
  background: #e8f5e9;
  color: #2a5248;
}
`;
document.head.appendChild(style);