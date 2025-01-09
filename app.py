from flask import Flask, render_template, session, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///binary_speed.db'
app.config['SESSION_TYPE'] = 'filesystem'
db = SQLAlchemy(app)

@app.route("/")
def play():
    return render_template("play.html")

@app.route('/leaderboard')
def leaderboard():
    return render_template("leaderboard.html")

@app.route('/play_now')
def play_now():
    return "nada"

@app.route('/set_username', methods=['POST'])
def set_username():
    # Check if user has form username
    username = request.form.get("username", "Guest")
    
    session['username'] = username
    return redirect('/')
    

