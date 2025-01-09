from flask import Flask, render_template, session, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy

from helpers import apology

app = Flask(__name__)

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///binary_speed.db'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
db = SQLAlchemy(app)

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/")
def play():
    return render_template("play.html")

@app.route('/leaderboard')
def leaderboard():
    return render_template("leaderboard.html")

@app.route('/play_now')
def play_now():
    return apology("TODO")

@app.route('/set_username', methods=['POST'])
def set_username():
    # Check if user has form username
    username = request.form.get("username", "Guest")
    
    session['username'] = username
    return redirect('/')
    

