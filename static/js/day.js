document.addEventListener('DOMContentLoaded', () => {
    const date = document.querySelector('h1').textContent.split(' ')[2];
    const exerciseBlocks = document.querySelectorAll('.exercise-block');

    exerciseBlocks.forEach(block => {
        const exercise = block.dataset.exercise;
        const resultSpan = block.querySelector('.result');
        const input = block.querySelector('input');
        const button = block.querySelector('button');

        // Загрузка текущих данных
        fetch(`/api/exercise?date=${date}`)
            .then(response => response.json())
            .then(data => {
                if (data[exercise]) {
                    resultSpan.textContent = data[exercise].completed;
                } else {
                    resultSpan.textContent = '0';
                }
            });

        // Добавление данных
        button.addEventListener('click', () => {
            const count = parseInt(input.value);
            if (!count || count <= 0 || isNaN(count)) {
                alert('Введите корректное число!');
                return;
            }

            fetch('/api/exercise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, exercise, count })
            })
                .then(response => response.json())
                .then(() => {
                    resultSpan.textContent = parseInt(resultSpan.textContent) + count;
                    input.value = '';
                })
                .catch(err => console.error('Ошибка при добавлении данных:', err));
        });
    });
});
