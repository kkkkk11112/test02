const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 게임 변수들
canvas.width = 1000; // 캔버스 가로 크기 확대
canvas.height = 600; // 캔버스 세로 크기 확대

let ballRadius = 10;
let balls = [
    { x: canvas.width / 2, y: canvas.height - 30, dx: 5, dy: -5, alive: true },  // 첫 번째 공
    { x: canvas.width / 4, y: canvas.height - 30, dx: 5, dy: -5, alive: true },  // 두 번째 공
    { x: (canvas.width / 4) * 3, y: canvas.height - 30, dx: 5, dy: -5, alive: true } // 세 번째 공
];

let paddleHeight = 10;
let paddleWidth = 180;  // 패들 크기 더 크게
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let brickRowCount = 12;  // 블록 행 개수 더 증가
let brickColumnCount = 10;  // 블록 열 개수 더 증가
let brickWidth = 60;  // 블록 크기 유지
let brickHeight = 20;  // 블록 크기 유지
let brickPadding = 15;  // 블록 간격 더 넓게
let brickOffsetTop = 80;  // 블록과 상단 간격 더 넓게
let brickOffsetLeft = 40;  // 블록과 왼쪽 간격 더 넓게
let bricks = [];
let score = 0;
let lives = 3;
let speedIncreaseInterval = 1000;  // 공 속도 증가 간격 (1초마다 증가)

// 블록 초기화
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { 
            x: 0, 
            y: 0, 
            status: 1, 
            color: getRandomColor(), 
            special: Math.random() < 0.2 ? true : false  // 20% 확률로 특수 블록 추가
        };
    }
}

// 키 입력 감지
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

// 무작위 색상 생성 함수
function getRandomColor() {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FFFF33', '#FF33FF', '#33FFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 블록 그리기
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 공 그리기
function drawBalls() {
    balls.forEach(ball => {
        if (ball.alive) {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }
    });
}

// 패들 그리기
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// 점수 표시
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("점수: " + score, 8, 20);
}

// 생명 표시
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("생명: " + lives, canvas.width - 65, 20);
}

// 공과 패들 충돌 감지
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1) {
                balls.forEach(ball => {
                    if (ball.alive && ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score++;
                        // 특수 블록을 부술 때 추가 효과
                        if (b.special) {
                            score += 5; // 특수 블록은 점수를 추가로 얻음
                            ball.dx *= 1.1; // 공의 속도 증가
                            ball.dy *= 1.1;
                        }
                    }
                });
            }
        }
    }
}

// 공 이동
function moveBalls() {
    balls.forEach(ball => {
        if (ball.alive) {
            ball.x += ball.dx;
            ball.y += ball.dy;

            // 화면 경계에서 반사
            if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
                ball.dx = -ball.dx;
            }
            if (ball.y + ball.dy < ballRadius) {
                ball.dy = -ball.dy;
            } else if (ball.y + ball.dy > canvas.height - ballRadius) {
                if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                    ball.dy = -ball.dy;
                } else {
                    // 공이 죽으면 해당 공의 alive 값을 false로 설정
                    ball.alive = false;
                    if (balls.every(b => !b.alive)) {
                        lives--; // 모든 공이 죽으면 생명력 감소
                        if (!lives) {
                            alert("게임 오버!");
                            document.location.reload();
                        } else {
                            // 모든 공이 죽으면 다시 공 3개 생성
                            balls.forEach(b => {
                                b.alive = true;
                                b.x = Math.random() * (canvas.width - ballRadius * 2) + ballRadius;
                                b.y = canvas.height - 30;
                                b.dx = 5;
                                b.dy = -5;
                            });
                        }
                    }
                }
            }
        }
    });
}

// 패들 이동
function movePaddle() {
    const paddleSpeed = 14;  // 패들 속도 2배로 증가 (기존 값의 2배)
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }
}

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBalls();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();
    moveBalls();
    movePaddle();

    // 모든 블록이 부서졌는지 확인
    if (score === brickRowCount * brickColumnCount) {
        alert("축하합니다! 모든 블록을 부셨습니다!");
        document.location.reload();
    }

    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();
