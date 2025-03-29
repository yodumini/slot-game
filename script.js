class SlotGame {
    constructor() {
        this.symbols = ['🍎', '🍊', '🍇', '🍒', '🍋', '💎', '7️⃣', '🎰'];
        this.balance = 1000;
        this.betAmount = 10;
        this.lines = 1;
        this.spins = 1;
        this.isSpinning = false;
        this.slots = [
            document.getElementById('slot1'),
            document.getElementById('slot2'),
            document.getElementById('slot3')
        ];
        
        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        document.getElementById('spinButton').addEventListener('click', () => this.spin());
        document.getElementById('increaseBet').addEventListener('click', () => this.changeBet(10));
        document.getElementById('decreaseBet').addEventListener('click', () => this.changeBet(-10));
        document.getElementById('increaseLines').addEventListener('click', () => this.changeLines(1));
        document.getElementById('decreaseLines').addEventListener('click', () => this.changeLines(-1));
        document.getElementById('increaseSpins').addEventListener('click', () => this.changeSpins(1));
        document.getElementById('decreaseSpins').addEventListener('click', () => this.changeSpins(-1));
    }

    updateDisplay() {
        document.getElementById('balance').textContent = this.balance;
        document.getElementById('betAmount').textContent = this.betAmount;
        document.getElementById('linesAmount').textContent = this.lines;
        document.getElementById('spinsAmount').textContent = this.spins;
    }

    changeBet(amount) {
        if (this.isSpinning) return;
        
        const newBet = this.betAmount + amount;
        if (newBet >= 10 && newBet <= this.balance) {
            this.betAmount = newBet;
            this.updateDisplay();
        }
    }

    changeLines(amount) {
        if (this.isSpinning) return;
        
        const newLines = this.lines + amount;
        if (newLines >= 1 && newLines <= 10) {
            this.lines = newLines;
            this.updateDisplay();
        }
    }

    changeSpins(amount) {
        if (this.isSpinning) return;
        
        const newSpins = this.spins + amount;
        if (newSpins >= 1 && newSpins <= 10) {
            this.spins = newSpins;
            this.updateDisplay();
        }
    }

    getRandomSymbol() {
        return this.symbols[Math.floor(Math.random() * this.symbols.length)];
    }

    calculateWinnings(results) {
        const counts = {};
        results.forEach(symbol => {
            counts[symbol] = (counts[symbol] || 0) + 1;
        });

        let winnings = 0;
        for (const [symbol, count] of Object.entries(counts)) {
            if (count >= 3) {
                const multiplier = this.getMultiplier(symbol);
                winnings += this.betAmount * multiplier;
            }
        }

        return winnings * this.lines;
    }

    getMultiplier(symbol) {
        const multipliers = {
            '💎': 10,
            '7️⃣': 8,
            '🎰': 6,
            '🍎': 3,
            '🍊': 3,
            '🍇': 3,
            '🍒': 3,
            '🍋': 3
        };
        return multipliers[symbol] || 1;
    }

    async singleSpin() {
        const results = [];
        const spinDuration = 2000; // 2秒

        // 为每个老虎机创建动画
        const spinPromises = this.slots.map((slot, index) => {
            return new Promise(resolve => {
                const symbol = slot.querySelector('.symbol');
                symbol.style.animation = 'spin 0.1s linear infinite';
                
                const interval = setInterval(() => {
                    symbol.textContent = this.getRandomSymbol();
                }, 100);

                setTimeout(() => {
                    clearInterval(interval);
                    symbol.style.animation = 'none';
                    const finalSymbol = this.getRandomSymbol();
                    symbol.textContent = finalSymbol;
                    results[index] = finalSymbol;
                    resolve();
                }, spinDuration + (index * 200));
            });
        });

        await Promise.all(spinPromises);
        return results;
    }

    async spin() {
        if (this.isSpinning || this.balance < this.betAmount * this.lines * this.spins) return;

        this.isSpinning = true;
        this.balance -= this.betAmount * this.lines * this.spins;
        this.updateDisplay();

        const spinButton = document.getElementById('spinButton');
        spinButton.disabled = true;

        let totalWinnings = 0;
        const spinDuration = 2000; // 2秒
        const delayBetweenSpins = 500; // 0.5秒

        for (let i = 0; i < this.spins; i++) {
            const results = await this.singleSpin();
            const winnings = this.calculateWinnings(results);
            totalWinnings += winnings;

            if (winnings > 0) {
                this.showWinnings(winnings);
            }

            // 如果不是最后一次spin，等待一段时间再开始下一次
            if (i < this.spins - 1) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenSpins));
            }
        }

        this.balance += totalWinnings;
        this.updateDisplay();
        this.isSpinning = false;
        spinButton.disabled = false;
    }

    showWinnings(amount) {
        const notification = document.createElement('div');
        notification.className = 'win-notification';
        notification.textContent = `恭喜赢得 ${amount} 积分！`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// 初始化游戏
const game = new SlotGame(); 