document.addEventListener('DOMContentLoaded', () => {
    let questions = [];
    let currentQuestionIndex = 0;
    let timerInterval;
    let duration = 10 * 1000;
    let timerStop = false;
    let correctAnswers = 0;
    let points = 0;
    let feedbackTimeout;

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
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

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
        
        // Update statistics
        document.getElementById('final-points').textContent = points;
        document.getElementById('accuracy').textContent = 
            `${Math.round((correctAnswers / questions.length) * 100)}%`;
                
        document.getElementById('submit-score').addEventListener('click', function() {
            const notification = document.getElementById('notification');
            const notificationText = document.getElementById('notification-text');

            notificationText.innerHTML = `
                <i class="fas fa-circle-notch fa-spin"></i>
                Submitting score...
                `;
            notification.classList.add('show');
            fetch('/submit_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    points: points,
                    correctAnswers: correctAnswers,
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    notification.classList.add('sucess');
                    notificationText.innerHTML = `
                    <div class="d-flex align-items center">
                        <i class="fas fa-check-circle text-success fa-lg me-3"></i>
                        <div>
                            <div class="fw-bold">Sucess!</div>
                            <small>Score submitted to leaderboard</small>
                        </div>
                    </div>
                    `;
                    setTimeout(() => {
                        notification.classList.remove('show', 'success')
                        //window.location.href = '/leaderboard';
                    }, 3000);
                } else {
                    throw new Error(data.message || 'Failed to submit score');
                }
            })
            .catch(error => {
                notification.classList.add('error');
                notificationText.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-exclamation-circle text-danger fa-lg me-3"></i>
                    <div>
                        <div class="fw-bold">Error</div>
                        <small>${error.message}</small>
                    </div>
                </div>
                `;
                setTimeout(() => {
                    notification.classList.remove('show', 'error');
                }, 3000);
            });
        });

        // Trigger animation
        setTimeout(() => {
            resultContainer.classList.add('fade-in');
        }, 100);
    }

    if (playAgainButton) {
        playAgainButton.addEventListener('click', () => {
            playAgain();
        });
    }

    function playAgain() {

        resultContainer.classList.add('fade-out');

        setTimeout(() => {
            currentQuestionIndex = 0;
            points = 0;
            correctAnswers = 0;
            pointsValueSpan.textContent = points;
            answerInput.value = '';
            resultContainer.style.display = 'none';
            questionContainer.style.display = 'block';

            // Reset animations display
            resultContainer.classList.remove('fade-out', 'fade-in');
            resultContainer.style.display = 'none';
            questionContainer.classList.remove('fade-out', 'fade-in');
            questionContainer.style.display = 'block';
            questionContainer.classList.add('fade-in');

            startGame();
        })
    }

    function playSound(isCorrect) {
        if (isCorrect) {
            correctSound.currentTime = 0;
            correctSound.play();
        } else {
            // nada
            wrongSound.currentTime = 0;
            wrongSound.play();
        }
    }

    function showFeedback(isCorrect, correctAnswer = '') {
        clearTimeout(feedbackTimeout);

        answerInput.classList.remove('bounce', 'correct-focus', 'shake', 'wrong-focus');
        correctAnswerDisplay.classList.remove('fade-in-out');
        correctAnswerDisplay.style.display = 'none';
        correctAnswerDisplay.style.textContent = '';

        void correctAnswerDisplay.offsetWidth;

        playSound(isCorrect);

        if (isCorrect) {
            answerInput.classList.add('bounce', 'correct-focus');
            feedbackTimeout = setTimeout(() => {
                answerInput.classList.remove('bounce', 'correct-focus');
            }, 1000);
        } else {
            answerInput.classList.add('shake', 'wrong-focus');
            correctAnswerDisplay.textContent = `${correctAnswer}`;
            correctAnswerDisplay.classList.add('fade-in-out');
            correctAnswerDisplay.style.display = 'block';
            feedbackTimeout = setTimeout(() => {
                answerInput.classList.remove('shake', 'wrong-focus');
                correctAnswerDisplay.classList.remove('fade-in-out');
                correctAnswerDisplay.textContent = '';
                correctAnswerDisplay.style.display = 'none';
            }, 3000);
        }
    }
});