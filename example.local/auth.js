document.addEventListener('DOMContentLoaded', () => {
    // Табы
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toRegister = document.getElementById('toRegister');
    const toLogin = document.getElementById('toLogin');

    function showLogin() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = '';
        registerForm.style.display = 'none';
        bearNod();
    }
    function showRegister() {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.style.display = 'none';
        registerForm.style.display = '';
        bearNod();
    }
    loginTab.addEventListener('click', showLogin);
    registerTab.addEventListener('click', showRegister);
    toRegister.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
    toLogin.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });

    // --- Медвежонок ---
    const pawLeft = document.getElementById('bear-paw-left');
    const pawRight = document.getElementById('bear-paw-right');
    const pupilLeft = document.getElementById('bear-pupil-left');
    const pupilRight = document.getElementById('bear-pupil-right');
    const eyelidLeft = document.getElementById('bear-eyelid-left');
    const eyelidRight = document.getElementById('bear-eyelid-right');
    const bearFace = document.getElementById('bear-face');
    let isPeeking = false;
    let blinkTimeout = null;

    // Моргание
    function blink() {
        if (!eyelidLeft || !eyelidRight) return;
        eyelidLeft.setAttribute('style', 'transition: opacity 0.18s; opacity:1;');
        eyelidRight.setAttribute('style', 'transition: opacity 0.18s; opacity:1;');
        setTimeout(() => {
            eyelidLeft.setAttribute('style', 'transition: opacity 0.18s; opacity:0;');
            eyelidRight.setAttribute('style', 'transition: opacity 0.18s; opacity:0;');
        }, 180);
        scheduleBlink();
    }
    function scheduleBlink() {
        clearTimeout(blinkTimeout);
        blinkTimeout = setTimeout(blink, 2000 + Math.random() * 2000);
    }
    scheduleBlink();

    // Покачивание головы
    function bearNod() {
        if (!bearFace) return;
        bearFace.setAttribute('style', 'transition: transform 0.3s; transform: rotate(-8deg) scale(1.04);');
        setTimeout(() => {
            bearFace.setAttribute('style', 'transition: transform 0.3s; transform: rotate(0deg) scale(1);');
        }, 300);
    }

    // Анимация лапок
    function pawsNormal() {
        if (!pawLeft || !pawRight) return;
        pawLeft.setAttribute('transform', '');
        pawRight.setAttribute('transform', '');
    }
    function pawsPeek() {
        pawLeft.setAttribute('transform', 'translate(12,-28) rotate(-10 57 145)');
        pawRight.setAttribute('transform', 'translate(-12,-28) rotate(10 123 145)');
    }

    // Проверка: нужно ли подсматривать (если открыт хотя бы один из полей пароля)
    function shouldPeek() {
        const loginPass = document.getElementById('login-password');
        const regPass = document.getElementById('register-password');
        const regPass2 = document.getElementById('register-password2');
        // Если loginForm видим и пароль открыт
        if (loginForm.style.display !== 'none' && loginPass && loginPass.type === 'text') return true;
        // Если registerForm видим и хотя бы одно из полей пароля открыто
        if (registerForm.style.display !== 'none' && (
            (regPass && regPass.type === 'text') || (regPass2 && regPass2.type === 'text')
        )) return true;
        return false;
    }

    // Зрачки следят за курсором или смотрят вниз
    function movePupils(e) {
        if (!pupilLeft || !pupilRight) return;
        if (isPeeking) {
            // Смотрим вниз (на поле пароля)
            pupilLeft.setAttribute('cx', 67.5 + 0);
            pupilLeft.setAttribute('cy', 112);
            pupilRight.setAttribute('cx', 112.5 + 0);
            pupilRight.setAttribute('cy', 112);
            return;
        }
        const svg = document.getElementById('bear-svg');
        const rect = svg.getBoundingClientRect();
        // Центры глаз
        const left = {x: rect.left + 67.5 * rect.width/180, y: rect.top + 106.5 * rect.height/160};
        const right = {x: rect.left + 112.5 * rect.width/180, y: rect.top + 106.5 * rect.height/160};
        // Курсор
        const mx = e.clientX, my = e.clientY;
        // Функция для расчёта смещения
        function calc(dx, dy, max) {
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > max) {
                dx = dx * max / dist;
                dy = dy * max / dist;
            }
            return {dx, dy};
        }
        // Левый глаз
        let v1 = calc(mx - left.x, my - left.y, 7);
        pupilLeft.setAttribute('cx', 67.5 + v1.dx);
        pupilLeft.setAttribute('cy', 106.5 + v1.dy);
        // Правый глаз
        let v2 = calc(mx - right.x, my - right.y, 7);
        pupilRight.setAttribute('cx', 112.5 + v2.dx);
        pupilRight.setAttribute('cy', 106.5 + v2.dy);
    }
    window.addEventListener('mousemove', movePupils);

    // Показать/скрыть пароль + лапки/глаза
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            // Определяем, к какому полю относится кнопка
            const isMainPassword = input.id === 'login-password' || input.id === 'register-password';
            const isHidden = input.type === 'password';
            if (isHidden) {
                input.type = 'text';
                this.textContent = '🙈';
            } else {
                input.type = 'password';
                this.textContent = '👁';
            }
            // После смены состояния — обновить анимацию
            if (shouldPeek()) {
                pawsPeek();
                isPeeking = true;
                movePupils({clientX: 0, clientY: 9999}); // сразу смотрит вниз
            } else {
                pawsNormal();
                isPeeking = false;
                movePupils({clientX: window.innerWidth/2, clientY: window.innerHeight/2});
            }
        });
    });
    // При загрузке лапки внизу, глаза следят за курсором
    pawsNormal();
    isPeeking = false;
    movePupils({clientX: window.innerWidth/2, clientY: window.innerHeight/2});

    // Валидация совпадения паролей при регистрации
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const pass1 = document.getElementById('register-password');
        const pass2 = document.getElementById('register-password2');
        const name = document.getElementById('register-name');
        const email = document.getElementById('register-email');

        // Очищаем предыдущие ошибки
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());

        // Валидация на стороне клиента
        if (pass1.value.length < 6) {
            showError(pass1, 'Пароль должен содержать минимум 6 символов');
            return;
        }

        if (pass1.value !== pass2.value) {
            showError(pass2, 'Пароли не совпадают');
            return;
        }

        if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            showError(email, 'Неверный формат email');
            return;
        }

        try {
            const response = await fetch('/register_process.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.value.trim(),
                    email: email.value.trim(),
                    password: pass1.value
                })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                showLogin(); // Переключаем на форму входа после успешной регистрации
            } else {
                // Показываем ошибку под соответствующим полем
                if (data.message.includes('email')) {
                    showError(email, data.message);
                } else if (data.message.includes('пароль')) {
                    showError(pass1, data.message);
                } else {
                    alert(data.message);
                }
                
                // Выводим отладочную информацию в консоль
                if (data.debug) {
                    console.error('Debug info:', data.debug);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
        }
    });

    // Функция для отображения ошибок
    function showError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        // Удаляем предыдущие сообщения об ошибках для этого поля
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        input.parentElement.appendChild(errorDiv);
        input.style.borderColor = 'red';
        
        // Возвращаем нормальный цвет при фокусе
        input.addEventListener('input', function() {
            this.style.borderColor = '';
            const error = this.parentElement.querySelector('.error-message');
            if (error) error.remove();
        }, { once: true });
    }

    // Обработчик входа
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email');
        const password = document.getElementById('login-password');

        try {
            const response = await fetch('login_process.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    email: email.value,
                    password: password.value
                })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                window.location.href = 'index.html';
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Произошла ошибка при входе. Пожалуйста, попробуйте позже.');
            console.error('Error:', error);
        }
    });

    // Обработчик выхода
    async function handleLogout(e) {
        e.preventDefault();
        try {
            const response = await fetch('logout.php', {
                credentials: 'same-origin'
            });
            const data = await response.json();
            
            if (data.success) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }
}); 