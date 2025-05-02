from flask import Flask, request, jsonify, send_from_directory
import sqlite3
from collections import Counter

app = Flask(__name__)

# Inicimi i databazës
def init_db():
    conn = sqlite3.connect('schedule.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day TEXT,
            subject TEXT,
            professor TEXT,
            time TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Endpoints
@app.route('/')
def index():
    return send_from_directory('.', 'app.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

@app.route('/add', methods=['POST'])
def add_entry():
    data = request.json
    conn = sqlite3.connect('schedule.db')
    c = conn.cursor()
    c.execute('INSERT INTO schedule (day, subject, professor, time) VALUES (?, ?, ?, ?)',
              (data['day'], data['subject'], data['professor'], data['time']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Entry added successfully'})

@app.route('/api/sugjero', methods=['POST'])
def sugjero_orar():
    data = request.json.get('oraret', [])
    dita_zgjedhur = request.json.get('dita', '')
    numer_per_dite = Counter([item['day'] for item in data])
    ngarkesa = numer_per_dite.get(dita_zgjedhur, 0)
    ditet = ['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte']
    alternativa = sorted(ditet, key=lambda d: numer_per_dite.get(d, 0))
    return jsonify({
        'ngarkesa': ngarkesa,
        'ditaSugjeruar': alternativa[0] if alternativa else None
    })

# Nise app-in
if __name__ == '__main__':
    init_db()
    app.run(debug=True)
