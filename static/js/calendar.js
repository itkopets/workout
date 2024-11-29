document.addEventListener('DOMContentLoaded', () => {
    const calendarElement = document.getElementById('calendar');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateDiv = document.createElement('div');
        dateDiv.textContent = day;
        dateDiv.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dateDiv.addEventListener('click', () => {
            const selectedDate = dateDiv.dataset.date;
            window.location.href = `/day/${selectedDate}`;
        });
        calendarElement.appendChild(dateDiv);
    }
});
