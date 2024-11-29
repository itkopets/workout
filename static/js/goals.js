document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('goals-form');

    // Загрузка текущих целей
    fetch('/api/goals')
        .then(response => response.json())
        .then(data => {
            Object.keys(data).forEach(exercise => {
                const input = document.getElementById(`${exercise}-goal`);
                if (input) {
                    input.value = data[exercise]; // Устанавливаем текущее значение цели
                }
            });
        })
        .catch(err => console.error('Ошибка загрузки целей:', err));

    // Сохранение целей
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const goals = {};
        new FormData(form).forEach((value, key) => {
            goals[key] = parseInt(value) || 0; // Собираем данные из формы
        });

        fetch('/api/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goals)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Цели успешно обновлены!');
                }
            })
            .catch(err => console.error('Ошибка сохранения целей:', err));
    });
});
