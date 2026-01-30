class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 适配不同屏幕尺寸
        const maxWidth = Math.min(window.innerWidth * 0.9, 400);
        this.canvas.width = maxWidth;
        this.canvas.height = maxWidth;
        
        this.grid = Math.floor(maxWidth / 20); // 保持20个格子的宽度
        this.tileCount = 20;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = this.generateFood();
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.speed = 150; // 初始速度（毫秒）
        this.speedLevel = 1;
        this.gameRunning = false;
        this.gameLoopId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.updateHighScoreDisplay();
    }
    
    initializeElements() {
        document.getElementById('high-score').textContent = this.highScore;
    }
    
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.direction !== 'down') this.nextDirection = 'up';
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.direction !== 'up') this.nextDirection = 'down';
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.direction !== 'right') this.nextDirection = 'left';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.direction !== 'left') this.nextDirection = 'right';
                    break;
                case ' ':
                    e.preventDefault();
                    if (!this.gameRunning) {
                        this.startGame();
                    } else {
                        this.togglePause();
                    }
                    break;
            }
        });
        
        // 按钮事件
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        
        // 移动端控制按钮
        document.getElementById('up-btn').addEventListener('click', () => {
            if (this.direction !== 'down') this.nextDirection = 'up';
        });
        document.getElementById('down-btn').addEventListener('click', () => {
            if (this.direction !== 'up') this.nextDirection = 'down';
        });
        document.getElementById('left-btn').addEventListener('click', () => {
            if (this.direction !== 'right') this.nextDirection = 'left';
        });
        document.getElementById('right-btn').addEventListener('click', () => {
            if (this.direction !== 'left') this.nextDirection = 'right';
        });
        
        // 触摸滑动事件，用于移动设备
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            // 确定主要滑动方向
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // 水平滑动
                if (diffX > 0 && this.direction !== 'right') {
                    // 向左滑动
                    this.nextDirection = 'left';
                } else if (diffX < 0 && this.direction !== 'left') {
                    // 向右滑动
                    this.nextDirection = 'right';
                }
            } else {
                // 垂直滑动
                if (diffY > 0 && this.direction !== 'down') {
                    // 向上滑动
                    this.nextDirection = 'up';
                } else if (diffY < 0 && this.direction !== 'up') {
                    // 向下滑动
                    this.nextDirection = 'down';
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
            e.preventDefault();
        }, { passive: false });
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            // 确保食物不在蛇身上
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }
    
    moveSnake() {
        this.direction = this.nextDirection;
        
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // 检查碰撞边界
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // 检查碰撞自己
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            
            // 每50分增加速度等级
            if (this.score % 50 === 0) {
                this.increaseSpeed();
            }
            
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    increaseSpeed() {
        this.speedLevel++;
        this.speed = Math.max(50, this.speed - 20); // 最高速度限制
        
        document.getElementById('speed-level').textContent = this.speedLevel;
        
        if (this.gameRunning) {
            clearInterval(this.gameLoopId);
            this.startGameLoop();
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            document.getElementById('high-score').textContent = this.highScore;
        }
    }
    
    drawGame() {
        // 清除画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格背景
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        for (let i = 0; i < this.tileCount; i++) {
            for (let j = 0; j < this.tileCount; j++) {
                this.ctx.strokeRect(i * this.grid, j * this.grid, this.grid, this.grid);
            }
        }
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#00ff88';
                this.ctx.fillRect(segment.x * this.grid, segment.y * this.grid, this.grid - 1, this.grid - 1);
                
                // 添加发光效果
                this.ctx.shadowColor = '#00ff88';
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(segment.x * this.grid, segment.y * this.grid, this.grid - 1, this.grid - 1);
                this.ctx.shadowBlur = 0;
            } else {
                // 蛇身 - 创建渐变色效果
                const gradient = this.ctx.createLinearGradient(
                    segment.x * this.grid, 
                    segment.y * this.grid, 
                    segment.x * this.grid + this.grid, 
                    segment.y * this.grid + this.grid
                );
                gradient.addColorStop(0, '#00cc6a');
                gradient.addColorStop(1, '#009955');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(segment.x * this.grid, segment.y * this.grid, this.grid - 1, this.grid - 1);
                
                // 添加边框
                this.ctx.strokeStyle = '#00ff88';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(segment.x * this.grid, segment.y * this.grid, this.grid - 1, this.grid - 1);
            }
        });
        
        // 绘制食物
        this.ctx.fillStyle = '#ff4757';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.grid + this.grid/2,
            this.food.y * this.grid + this.grid/2,
            this.grid/2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // 食物发光效果
        this.ctx.shadowColor = '#ff4757';
        this.ctx.shadowBlur = 15;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    startGameLoop() {
        this.gameLoopId = setInterval(() => {
            this.moveSnake();
            this.drawGame();
        }, this.speed);
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            document.getElementById('game-status').textContent = '游戏中';
            this.startGameLoop();
        }
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gameRunning = false;
            clearInterval(this.gameLoopId);
            document.getElementById('game-status').textContent = '已暂停';
        } else {
            this.startGame();
            document.getElementById('game-status').textContent = '游戏中';
        }
    }
    
    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.speed = 150;
        this.speedLevel = 1;
        
        this.updateScore();
        document.getElementById('speed-level').textContent = this.speedLevel;
        document.getElementById('game-status').textContent = '按空格键开始游戏';
        
        if (this.gameRunning) {
            clearInterval(this.gameLoopId);
            this.gameRunning = false;
        }
        
        this.drawGame();
    }
    
    updateHighScoreDisplay() {
        document.getElementById('high-score').textContent = this.highScore;
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameLoopId);
        document.getElementById('game-status').textContent = `游戏结束! 得分: ${this.score}`;
        
        // 绘制游戏结束覆盖层
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${this.canvas.width/10}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 20);
        
        this.ctx.font = `${this.canvas.width/15}px Arial`;
        this.ctx.fillText(`最终得分: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 20);
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    
    // 绘制初始画面
    game.drawGame();
});

// 页面可见性变化时暂停/恢复游戏
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.gameInstance && window.gameInstance.gameRunning) {
        window.gameInstance.togglePause();
    }
});