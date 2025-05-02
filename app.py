from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os

app = Flask(__name__)

# ===================== INIT DATABASE =====================
def init_db():
    conn = sqlite3.connect('schedule.db')
    c = conn.cursor()

    # Tabela për orare
    c.execute('''
        CREATE TABLE IF NOT EXISTS schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day TEXT,
            subject TEXT,
            professor TEXT,
            time TEXT
        )
    ''')

    # Tabela për përdoruesit
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    ''')

    conn.commit()
    conn.close()


# ===================== ROUTES =====================

# Root për të shfaqur HTML-in
@app.route('/')
def index():
    return send_from_directory('.', 'app.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

# ===================== API: REGISTER =====================
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

# ===================== API: LOGIN =====================
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect('schedule.db')
    c = conn.cursor()
    c.execute('SELECT name, password FROM users WHERE email = ?', (email,))
    result = c.fetchone()
    conn.close()

    if result:
        name, saved_password = result
        if saved_password == password:
            return jsonify({'message': 'Login successful', 'name': name})
        else:
            return jsonify({'error': 'Password is incorrect'}), 401
    else:
        return jsonify({'error': 'Email not found'}), 401

# ===================== API: SHTO LËNDË =====================
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

# ===================== API: LISTO LËNDËT =====================
@app.route('/list', methods=['GET'])
def list_entries():
    conn = sqlite3.connect('schedule.db')
    c = conn.cursor()
    c.execute('SELECT day, subject, professor, time FROM schedule')
    data = c.fetchall()
    conn.close()
    result = [{'day': d, 'subject': s, 'professor': p, 'time': t} for d, s, p, t in data]
    return jsonify(result)


# ===================== START APP =====================
if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))  # për Render
    app.run(host='0.0.0.0', port=port)
