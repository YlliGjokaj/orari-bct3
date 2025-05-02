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


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    try:
        conn = sqlite3.connect('schedule.db')
        c = conn.cursor()
        c.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', (name, email, password))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 409


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect('schedule.db')
    c = conn.cursor()
    c.execute('SELECT name, password FROM users WHERE email=?', (email,))
    result = c.fetchone()
    conn.close()

    if result:
        name, saved_password = result
        if password == saved_password:
            return jsonify({'message': 'Login successful', 'name': name})
        else:
            return jsonify({'error': 'Password is incorrect'}), 401
    else:
        return jsonify({'error': 'Email not found'}), 401


import os

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get("PORT", 5000))  # Render e cakton PORT si variabël mjedisi
    app.run(host='0.0.0.0', port=port)
