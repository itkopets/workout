from flask import Flask, render_template, request, jsonify
import sqlite3
import calendar
from datetime import datetime

app = Flask(__name__)

# Конфигурация целей для упражнений
EXERCISE_GOALS = {
    'squats': 100,
    'pushups': 50,
    'press': 50,
    'expander': 200
}

# Инициализация базы данных
def init_db():
    with sqlite3.connect('database.db') as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                exercise TEXT NOT NULL,
                count INTEGER NOT NULL
            )
        ''')
        conn.commit()

# Главная страница
@app.route('/')
def index():
    return render_template('index.html')

# Страница для выбранного дня
@app.route('/day/<date>')
def day_view(date):
    return render_template('day.html', date=date)

# API для добавления и получения данных об упражнениях
@app.route('/api/exercise', methods=['POST', 'GET'])
def manage_exercises():
    if request.method == 'POST':
        data = request.json
        date = data['date']
        exercise = data['exercise']
        count = int(data['count'])
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO exercises (date, exercise, count) VALUES (?, ?, ?)', (date, exercise, count))
            conn.commit()
        return jsonify({'status': 'success'})
    elif request.method == 'GET':
        date = request.args.get('date')
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT exercise, SUM(count) FROM exercises WHERE date = ? GROUP BY exercise', (date,))
            results = cursor.fetchall()
        return jsonify({exercise: {"completed": total, "goal": EXERCISE_GOALS[exercise]} for exercise, total in results})

# API для календаря
@app.route('/api/calendar')
def get_calendar():
    year = int(request.args.get('year'))
    month = int(request.args.get('month'))

    # Определяем первый день месяца и количество дней
    _, days_in_month = calendar.monthrange(year, month)
    start_day = (calendar.monthrange(year, month)[0] + 1) % 7  # Понедельник - первый день недели

    return jsonify({'days_in_month': days_in_month, 'start_day': start_day})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
