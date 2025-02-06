from flask import Flask, render_template, session, url_for, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
import random
from faker import Faker
import uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey

from helpers import apology

app = Flask(__name__)
fake = Faker()

# Database
# Following Flask-SQLAlchemy Docs https://flask-sqlalchemy.readthedocs.io/en/stable/quickstart/#
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///binary_speed.db'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
Session(app)
db.init_app(app)

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    session_id: Mapped[str] = mapped_column(unique=False, nullable=False)
    username: Mapped[str] = mapped_column(unique=False, nullable=False)
    score: Mapped["Score"] = relationship("Score", back_populates="user", uselist=False)
class Score(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    points: Mapped[int] = mapped_column(nullable=False)
    correct_answers: Mapped[int] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="score")

with app.app_context():
    db.create_all()

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.errorhandler(404)
def page_not_found(event):
    return apology("Page not found", 404)

@app.route("/")
def play():
    return render_template("play.html")

@app.route('/leaderboard')
def leaderboard():
    try:
        # Get top 10 scores
        top_scores = db.session.query(
            User, Score
        ).join(Score).order_by(
            Score.points.desc()
        ).limit(10).all()

        # Initialize scores list
        scores_list = []
        user_in_top_10 = False
        user_score = None
        
        # Process top 10 scores
        for rank, (user, score) in enumerate(top_scores, 1):
            scores_list.append({
                'rank': rank,
                'username': user.username,
                'points': score.points,
                'correct_answers': score.correct_answers,
                'is_current_user': user.session_id == session.get('session_id', None)
            })
            if user.session_id == session.get('session_id', None):
                user_in_top_10 = True

        # If user is logged in but not in top 10, get their score
        if 'session_id' in session and not user_in_top_10:
            user = User.query.filter_by(session_id=session['session_id']).first()
            if user and user.score:
                # Calculate user's rank
                higher_scores = Score.query.filter(
                    Score.points > user.score.points
                ).count()
                user_rank = higher_scores + 1
                
                # Add user's score to list
                user_score = {
                    'rank': user_rank,
                    'username': user.username,
                    'points': user.score.points,
                    'correct_answers': user.score.correct_answers,
                    'is_current_user': True
                }
                scores_list.append(user_score)

        return render_template(
            'leaderboard.html',
            scores=scores_list,
            user_logged_in='session_id' in session
        )
        
    except Exception as e:
        print(f"Error fetching leaderboard: {str(e)}")
        return apology("Error loading leaderboard")

@app.route('/set_username', methods=['POST'])
def set_username():
    # Check if user has form username
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
        session['username'] = fake.first_name()
    
    return redirect(url_for('play'))
    
@app.route('/start_game')
def start_game():
    questions = [f"{i:04b}" for i in range(16)]
    
    random.shuffle(questions)
    
    return jsonify(questions)

@app.route('/submit_score', methods=['POST'])
def submit_score():
    try:
        data = request.json
        
        # Check if user already is on the database
        user = User.query.filter_by(session_id=session['session_id']).first()
        if not user:
            # Create the user
            user = User(
                session_id = session['session_id'],
                username = session['username']
            )
            db.session.add(user)
            db.session.commit()
        
        # Create or update score
        if user.score:
            user.score.points = data['points']
            user.score.correct_answers = data['correctAnswers']
                
        else:
            # Create new score
            score = Score(
                points = data['points'],
                correct_answers = data['correctAnswers'],
                user_id = user.id
            )
            db.session.add(score)
            
        db.session.commit()
        print("Submit Committed Successfully")
        return jsonify({'status': 'success'})   
    
    except Exception as e:
        db.session.rollback()
        print("Exception Triggered")
        return jsonify({'status': 'error', 'message': str(e)}, 500)