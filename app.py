from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

# Инициализация базы данных
def init_db():
    with sqlite3.connect('database.db') as conn:
        cursor = conn.cursor()
        # Таблица для хранения данных упражнений
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                exercise TEXT NOT NULL,
                count INTEGER NOT NULL
            )
        ''')
        conn.commit()

# Главная страница с календарем
@app.route('/')
def index():
    return render_template('index.html')

# Страница для выбранного дня
@app.route('/day/<date>')
def day_view(date):
    return render_template('day.html', date=date)

# API для добавления и получения данных
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
        return jsonify({exercise: total for exercise, total in results})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
