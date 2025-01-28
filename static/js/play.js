document.addEventListener('DOMContentLoaded', () => {
    let questions = [];
    let currentQuestionIndex = 0;
    let timerInterval;
    let duration = 10 * 1000;
    let timerStop = false;
    let correctAnswers = 0;
    let points = 0;

    const questionContainer = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const binaryQuestion = document.getElementById('binary-question');
    const resultContainer = document.getElementById('result-container');
    const startGameButton = document.getElementById('start-game');
    const loading = document.getElementById('loading');
    const submitAnswerButton = document.getElementById('submit-answer');
    const timeLeftSpan = document.getElementById('time-left');
    const pointsValueSpan = document.getElementById('points-value');
    const answerInput = document.getElementById('answer');
    const resultMessage = document.getElementById('result-message');
    const playAgainButton = document.getElementById('play-again');
    const correctAnswerDisplay = document.getElementById('correct-answer-display');

    const showNextQuestion = () => {
        if (currentQuestionIndex < questions.length) {
            
            questionContainer.style.display = 'block';
            resultContainer.style.display = 'none';
            // Probably the most necessary code in here as it changes the question
            questionElement.textContent = `${currentQuestionIndex}. What is the hexadecimal equivalent of`;
            binaryQuestion.textContent = `${questions[currentQuestionIndex]}?`;
            answerInput.value = '';
            startTimer();
            answerInput.focus();
        } else {
            endGame();
        }
    };

    function startTimer() {
        timerStop = false;
        startTime = performance.now();
        updateTimer();
    }

    function updateTimer() {
        const elapsed = performance.now() - startTime;
        const timeLeft = Math.max(0, (duration - elapsed) / 1000).toFixed(1);
        timeLeftSpan.textContent = timeLeft;

        if (elapsed < duration && !timerStop) {
            timerInterval = requestAnimationFrame(updateTimer);
        } else if (!timerStop){
            submitAnswerButton.click();
        }
    }

    function stopTimer() {
        timerStop = true;
        cancelAnimationFrame(timerInterval); // Just to be safe if its still counting
    }

    // Start Game Logic
    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            
            const welcomeDiv = document.getElementById('welcome-div');
            welcomeDiv.style.visibility = 'hidden';
            welcomeDiv.style.height = '0';
            loading.style.display = 'block';
            
            startGame();
        });
    }

    // Submit Answer
    if (submitAnswerButton) {
        submitAnswerButton.addEventListener('click', () => {
            const userAnswer = document.getElementById('answer').value.toUpperCase().trim();
            const currentQuestion = questions[currentQuestionIndex];
            const correctAnswer = parseInt(currentQuestion, 2).toString(16).toUpperCase();

            // Animation Examples (Especially "tada" and "pulse" https://mdbootstrap.com/docs/standard/content-styles/animations/
            if(userAnswer === correctAnswer) {
                // TODO: Make it dopamine inducing! If possible with sounds and animation effects
                const elapsed = performance.now() - startTime;
                const remainingTime = Math.max(0, (duration - elapsed) / 1000).toFixed(2);
                
                if (elapsed <= 2000) {
                    points += 1000;
                } else {
                    points += remainingTime * 100; 
                }
                pointsValueSpan.textContent = points;
                correctAnswers++;
                showFeedback(true);
            } else {
                showFeedback(false, correctAnswer);
            }

            currentQuestionIndex++;
            showNextQuestion();
        });
    }

    // Since pressing enter doesn't trigger the answer button I added a listener
    answerInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitAnswerButton.click();
        }
    });

    function startGame() {
        fetch('/start_game')
                .then(response => response.json())
                .then(data => {
                    questions = data;
                    currentQuestionIndex = 0;
                    loading.style.display = 'none';
                    showNextQuestion();
                });
    }

    function endGame() {
        stopTimer();
        questionContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultMessage.textContent = `Game Over! Your Total Points: ${points}. You got ${correctAnswers}/${questions.length} correct.`;
    }

    if (playAgainButton) {
        playAgainButton.addEventListener('click', () => {
            playAgain();
        });
    }

    function playAgain() {
        currentQuestionIndex = 0;
        points = 0;
        correctAnswers = 0;
        pointsValueSpan.textContent = points;
        answerInput.value = '';
        resultContainer.style.display = 'none';
        questionContainer.style.display = 'block';
        startGame();
    }

    function showFeedback(isCorrect, correctAnswer = '') {
        if (isCorrect) {
            answerInput.classList.add('bounce', 'correct-focus');
            setTimeout(() => {
                answerInput.classList.remove('bounce', 'correct-focus');
            }, 1000);
        } else {
            answerInput.classList.add('shake', 'wrong-focus');
            correctAnswerDisplay.textContent = `${correctAnswer}`;
            correctAnswerDisplay.classList.add('fade-in-out');
            correctAnswerDisplay.style.display = 'block';
            setTimeout(() => {
                answerInput.classList.remove('shake', 'wrong-focus');
                correctAnswerDisplay.classList.remove('fade-in-out');
                correctAnswerDisplay.textContent = '';
                correctAnswerDisplay.style.display = 'none';
            }, 3000);
        }
    }
});