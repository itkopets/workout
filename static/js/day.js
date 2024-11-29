document.addEventListener('DOMContentLoaded', () => {
    const date = document.querySelector('h1').textContent.split(' ')[2];
    const exerciseBlocks = document.querySelectorAll('.exercise-block');

    // Локальное хранилище целей для каждого упражнения
    const exerciseGoals = {
        squats: 100,    // Пример корректной цели
        pushups: 50,
        press: 50,
        expander: 200
    };

    exerciseBlocks.forEach(block => {
        const exercise = block.dataset.exercise;
        const resultSpan = block.querySelector('.result');
        const input = block.querySelector('input');
        const button = block.querySelector('button');
        const progressBarFill = block.querySelector('.progress-bar-fill');

        // Функция для обновления прогресса
        const updateProgress = (completed, goal) => {
            if (!goal || goal <= 0) {
                console.warn(`Некорректная цель для ${exercise}: ${goal}. Установлена 1.`);
                goal = 1; // Гарантируем, что цель всегда больше 0
            }
            const progress = Math.min((completed / goal) * 100, 100); // Рассчитываем прогресс
            console.log(`Обновляем прогресс для ${exercise}: Выполнено: ${completed}, Цель: ${goal}, Прогресс: ${progress}%`);
            progressBarFill.style.width = `${progress}%`;
        };

        // Загрузка текущих данных
        fetch(`/api/exercise?date=${date}`)
            .then(response => response.json())
            .then(data => {
                // Получаем данные для текущего упражнения
                const exerciseData = data[exercise] || { completed: 0, goal: exerciseGoals[exercise] || 1 };
                const completed = exerciseData.completed || 0; // Если данных нет, начинаем с 0
                const goal = exerciseData.goal > 1 ? exerciseData.goal : exerciseGoals[exercise] || 1; // Используем локальные цели

                // Сохраняем цель локально
                exerciseGoals[exercise] = goal;

                resultSpan.textContent = completed; // Устанавливаем результат
                updateProgress(completed, goal); // Обновляем прогресс-бар
            })
            .catch(err => {
                console.error(`Ошибка при загрузке данных для ${exercise}:`, err);
                resultSpan.textContent = 0; // Если ошибка, результат — 0
                updateProgress(0, exerciseGoals[exercise]); // Используем локальную цель
            });

        // Добавление данных
        button.addEventListener('click', () => {
            const count = parseInt(input.value);
            if (!count || count <= 0 || isNaN(count)) {
                alert('Введите корректное число!');
                return;
            }

            const currentValue = parseInt(resultSpan.textContent) || 0; // Начальное значение
            const newValue = currentValue + count;

            // Получаем цель из локального хранилища
            let goal = exerciseGoals[exercise] || 1;
            if (goal <= 0) {
                console.warn(`Некорректная цель для ${exercise} при добавлении: ${goal}. Установлена 1.`);
                goal = 1; // Гарантируем корректную цель
            }

            console.log(`Добавляем для ${exercise}: Текущие: ${currentValue}, Новое: ${newValue}, Цель: ${goal}`);

            resultSpan.textContent = newValue; // Обновляем текст результата
            updateProgress(newValue, goal); // Обновляем прогресс-бар

            // Отправляем данные на сервер
            fetch('/api/exercise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, exercise, count })
            })
                .then(response => response.json())
                .then(() => {
                    console.log(`Данные для ${exercise} успешно отправлены на сервер.`);
                    input.value = ''; // Очищаем поле ввода
                })
                .catch(err => {
                    console.error(`Ошибка при добавлении данных для ${exercise}:`, err);
                    // Если произошла ошибка, возвращаем прежнее состояние
                    resultSpan.textContent = currentValue;
                    updateProgress(currentValue, goal);
                });
        });
    });
});
