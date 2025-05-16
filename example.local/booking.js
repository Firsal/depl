document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    const selectedTableInput = document.getElementById('selectedTable');
    let selectedTableGroup = null;

    // Обработка клика по SVG-группам столов
    document.querySelectorAll('.table-group').forEach(group => {
        group.addEventListener('click', function () {
            if (this.classList.contains('booked')) {
                alert('Этот столик уже занят на выбранное время.');
                return;
            }
            if (this.classList.contains('pending')) {
                alert('Этот столик ожидает подтверждения. Попробуйте выбрать другой или позже.');
                return;
            }
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedTableGroup = null;
                selectedTableInput.value = '';
                return;
            }
            // Снять выделение со всех
            document.querySelectorAll('.table-group').forEach(g => g.classList.remove('selected'));
            // Выделить выбранный
            this.classList.add('selected');
            selectedTableGroup = this;
            selectedTableInput.value = this.dataset.table;
        });
    });

    // Валидация и отправка формы
    bookingForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        if (!selectedTableInput.value) {
            alert('Пожалуйста, выберите столик на карте!');
            return;
        }

        const phoneValue = document.getElementById('phone').value.trim();
        // Универсальная проверка: минимум 10 цифр, разрешены +, пробелы, скобки, дефисы
        const digits = phoneValue.replace(/\D/g, '');
        if (digits.length < 10) {
            alert('Пожалуйста, введите корректный номер телефона (минимум 10 цифр, можно с +, пробелами, скобками, дефисами).');
            return;
        }

        const formData = {
            table_number: selectedTableInput.value,
            booking_date: document.getElementById('date').value,
            time_from: document.getElementById('time').value,
            duration: document.getElementById('duration').value,
            phone: document.getElementById('phone').value,
            comments: document.getElementById('comments').value
        };

        try {
            const response = await fetch('booking_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                window.location.href = 'cabinet.html';
            } else {
                alert(data.message || 'Произошла ошибка при бронировании');
            }
        } catch (error) {
            alert('Произошла ошибка при отправке данных');
            console.error('Error:', error);
        }
    });

    // Установка минимальной даты (сегодня)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;

    // Установка времени работы (10:00 - 22:00)
    document.getElementById('time').min = '10:00';
    document.getElementById('time').max = '22:00';

    // Сброс выделения при сбросе формы
    bookingForm.addEventListener('reset', function () {
        document.querySelectorAll('.table-group').forEach(g => g.classList.remove('selected'));
        selectedTableInput.value = '';
        selectedTableGroup = null;
    });

    // --- Загрузка статусов столов ---
    async function updateTableStatuses() {
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const duration = document.getElementById('duration').value;
        if (!date || !time || !duration) return;
        // Получаем статусы с сервера
        const res = await fetch(`get_table_status.php?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&duration=${encodeURIComponent(duration)}`);
        const data = await res.json();
        document.querySelectorAll('.table-group').forEach(group => {
            group.classList.remove('booked', 'pending', 'available');
            const table = group.dataset.table;
            if (data[table] === 'confirmed') {
                group.classList.add('booked');
            } else if (data[table] === 'pending') {
                group.classList.add('pending');
            } else {
                group.classList.add('available');
            }
        });
    }
    // Обновлять статусы при изменении даты/времени/длительности
    document.getElementById('date').addEventListener('change', updateTableStatuses);
    document.getElementById('time').addEventListener('change', updateTableStatuses);
    document.getElementById('duration').addEventListener('change', updateTableStatuses);
    // При загрузке страницы
    updateTableStatuses();
});

// Стилизация выделения через CSS:
// .table-group.selected rect { stroke: #2a5248; stroke-width: 6; filter: drop-shadow(0 0 10px #2a5248); } 