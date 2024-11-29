document.addEventListener('DOMContentLoaded', () => {
    const calendarElement = document.getElementById('calendar');
    const monthDisplay = document.getElementById('month-display');

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const dayToday = today.getDate();

    const months = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    monthDisplay.textContent = `${months[month]} ${year}`;

    fetch(`/api/calendar?year=${year}&month=${month + 1}`)
        .then(response => response.json())
        .then(data => {
            let currentRow = document.createElement('tr');
            for (let i = 0; i < data.start_day; i++) {
                const emptyCell = document.createElement('td');
                emptyCell.classList.add('empty-day');
                currentRow.appendChild(emptyCell);
            }

            for (let day = 1; day <= data.days_in_month; day++) {
                if (currentRow.children.length === 7) {
                    calendarElement.appendChild(currentRow);
                    currentRow = document.createElement('tr');
                }

                const dayCell = document.createElement('td');
                dayCell.classList.add('calendar-day');
                dayCell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                const dayLink = document.createElement('a');
                dayLink.href = `/day/${dayCell.dataset.date}`;
                dayLink.classList.add('day-link');

                const dateText = document.createElement('div');
                dateText.classList.add('date-text');
                dateText.textContent = day;

                const resultsDiv = document.createElement('div');
                resultsDiv.classList.add('results');

                dayLink.appendChild(dateText);
                dayLink.appendChild(resultsDiv);
                dayCell.appendChild(dayLink);

                if (day === dayToday) {
                    dayCell.classList.add('today');
                }

                fetch(`/api/exercise?date=${dayCell.dataset.date}`)
                    .then(response => response.json())
                    .then(summary => {
                        resultsDiv.innerHTML = `
                            Приседания: <span class="exercise-value">${summary.squats || 0}</span><br>
                            Отжимания: <span class="exercise-value">${summary.pushups || 0}</span><br>
                            Пресс: <span class="exercise-value">${summary.press || 0}</span><br>
                            Эспандер: <span class="exercise-value">${summary.expander || 0}</span>
                        `;
                    });

                currentRow.appendChild(dayCell);
            }

            if (currentRow.children.length > 0) {
                calendarElement.appendChild(currentRow);
            }
        });
});
