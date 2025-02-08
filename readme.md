# Binary Speed

#### Video Demo: [https://youtu.be/FhszixnjJTE](https://youtu.be/FhszixnjJTE)

#### Description:
Test your binary to hex conversion skills.

---

## Project Overview

Binary Speed is an interactive game designed to help you practice converting binary numbers (which are written with 0s and 1s) into hexadecimal numbers (which use digits 0–9 and letters A–F). This skill is very useful for computer engineering students and others in related fields. The project was created as a final project for CS50x.

---

## Features

- **Interactive Gameplay:**  
  The home page lets you play the game using a clean and modern user interface. It includes a timer and a points system. For example, answering a question within the first two seconds earns you 1000 points.

- **Leaderboard:**  
  A leaderboard is available to foster friendly competition. It shows the top 10 scores, and if your score is not in the top 10, your ranking is still displayed.

- **Engaging Experience:**  
  The game includes animations, color changes, and sounds to make the gameplay more enjoyable.

---

## How It Works

### Server-Side (Backend)

- **Flask:**  
  The project uses Flask as the web framework, which handles routing and server-side logic.

- **Database (SQLite with SQLAlchemy):**  
  The application uses an SQLite database configured in `app.py`. SQLAlchemy is used to define models for users and scores. There is a one-to-one relationship between a user and their score.

- **User Sessions:**  
  Sessions are configured to store user data during gameplay, ensuring that your progress and information are maintained.

- **Routes and Functions:**
  - **`/set_username`:**  
    To avoid inappropriate names, this route automatically generates a username using the Faker library. It also uses UUIDs to safely identify users even if the identifier is visible on the client side.
    
  - **`/start_game`:**  
    This route shuffles binary numbers (from 0 to 16) and sends 16 questions to the game page.
    
  - **`/submit_score`:**  
    This route checks if the user already exists. If the user exists, it updates their score; otherwise, it creates a new user record with the score.
    
  - **Error Handling:**  
    An apology page (inspired by the Finance problem set and included in `helper.py`) handles unintended or invalid URLs gracefully.

### Client-Side (Frontend)

- **JavaScript (`play.js`):**  
  The file `play.js` manages the game mechanics:
  - **Welcome Screen:** Displays your generated username and a start button.
  - **Game Screen:** After starting the game, the browser requests 16 questions from the server, displays each binary number, provides an input field for your answer, and shows a timer.
  - **Smooth Timer:** Uses the `requestAnimationFrame` function for a smooth and efficient countdown timer.
  - **Scoring System:**  
    - If you answer within the first two seconds, you receive 1000 points.
    - If you answer after two seconds, your score is calculated using the formula: `remainingTime * 100`.

- **Animations and Feedback:**  
  To make the game more engaging, animations, color changes, and sound effects have been added throughout the gameplay.

---

## Technologies Used

- **Flask:** Web framework for building the server-side application.
- **Bootstrap:** CSS framework for creating a modern and responsive user interface.
- **SQLite:** Lightweight database for storing user data and scores.
- **SQLAlchemy:** ORM for handling database interactions in Python.
- **JavaScript:** For implementing dynamic game mechanics and smooth animations.

---

## Summary

Binary Speed is both educational and fun. It helps you sharpen your skills in converting binary numbers to hexadecimal by combining interactive gameplay with a competitive leaderboard. This project is ideal for students and anyone interested in learning computer engineering concepts through an engaging and practical game.

Feel free to explore the project and enjoy improving your conversion skills!
