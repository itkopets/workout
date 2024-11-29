from flask import Flask, render_template, request, jsonify
import sqlite3
import calendar
from datetime import datetime

app = Flask(__name__)

# Инициализация базы данных
def init_db():
    with sqlite3.connect('database.db') as conn:
        cursor = conn.cursor()
        # Таблица упражнений
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                exercise TEXT NOT NULL,
                count INTEGER NOT NULL
            )
        ''')
        # Таблица целей
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS goals (
                exercise TEXT PRIMARY KEY,
                goal INTEGER NOT NULL
            )
        ''')
        # Начальные цели, если таблица целей пуста
        cursor.execute('SELECT COUNT(*) FROM goals')
        if cursor.fetchone()[0] == 0:
            default_goals = [
                ('squats', 100),
                ('pushups', 50),
                ('press', 50),
                ('expander', 200)
            ]
            cursor.executemany('INSERT INTO goals (exercise, goal) VALUES (?, ?)', default_goals)
        conn.commit()

# Главная страница
@app.route('/')
def index():
    return render_template('index.html')

# Страница для выбранного дня
@app.route('/day/<date>')
def day_view(date):
    return render_template('day.html', date=date)

# Страница редактирования целей
@app.route('/goals')
def goals_page():
    return render_template('goals.html')

# API для упражнений
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
            cursor.execute('SELECT exercise, goal FROM goals')
            goals = dict(cursor.fetchall())
        return jsonify({exercise: {"completed": total, "goal": goals.get(exercise, 0)} for exercise, total in results})

# API для календаря
@app.route('/api/calendar')
def get_calendar():
    year = int(request.args.get('year'))
    month = int(request.args.get('month'))

    _, days_in_month = calendar.monthrange(year, month)
    start_day = (calendar.monthrange(year, month)[0] + 1) % 7  # Понедельник - первый день недели

    return jsonify({'days_in_month': days_in_month, 'start_day': start_day})

# API для очистки упражнений
@app.route('/api/clear', methods=['POST'])
def clear_exercises():
    with sqlite3.connect('database.db') as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM exercises')
        conn.commit()
    return jsonify({'status': 'success', 'message': 'Все данные удалены'})

# API для целей
@app.route('/api/goals', methods=['GET', 'POST'])
def manage_goals():
    if request.method == 'GET':
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT exercise, goal FROM goals')
            goals = dict(cursor.fetchall())
        return jsonify(goals)
    elif request.method == 'POST':
        new_goals = request.json
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            for exercise, goal in new_goals.items():
                cursor.execute('UPDATE goals SET goal = ? WHERE exercise = ?', (goal, exercise))
            conn.commit()
        return jsonify({'status': 'success'})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
