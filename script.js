class SlotGame {
    constructor() {
        this.symbols = ['🍎', '🍊', '🍇', '🍒', '🍋', '💎', '7️⃣', '🎰'];
        this.balance = 1000;
        this.betAmount = 10;
        this.spins = 1;
        this.remainingSpins = 0;
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
        document.getElementById('increaseSpins').addEventListener('click', () => this.changeSpins(1));
        document.getElementById('decreaseSpins').addEventListener('click', () => this.changeSpins(-1));
        document.getElementById('resetSpins').addEventListener('click', () => this.resetSpins());
        document.getElementById('resetBet').addEventListener('click', () => this.resetBet());
        
        // 添加快捷下注按鈕的事件監聽
        document.querySelectorAll('.quick-spin-btn').forEach(button => {
            button.addEventListener('click', () => {
                const spins = parseInt(button.dataset.spins);
                this.setQuickSpins(spins);
            });
        });
    }

    updateDisplay() {
        document.getElementById('balance').textContent = this.balance;
        document.getElementById('betAmount').textContent = this.betAmount;
        document.getElementById('spinsAmount').textContent = this.spins;
        document.getElementById('remainingSpins').textContent = this.remainingSpins;
    }

    showAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'alert-notification';
        alert.textContent = message;
        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    resetSpins() {
        if (this.isSpinning) {
            this.showAlert('遊戲進行中無法重置！');
            return;
        }
        
        this.spins = 1;
        this.remainingSpins = 0;
        this.updateDisplay();
        this.showAlert('已重置下注次數！');
    }

    resetBet() {
        if (this.isSpinning) {
            this.showAlert('遊戲進行中無法重置！');
            return;
        }
        
        this.betAmount = 10;
        this.updateDisplay();
        this.showAlert('已重置下注金額！');
    }

    setQuickSpins(spins) {
        if (this.isSpinning) return;
        
        // 檢查積分是否足夠
        const totalCost = this.betAmount * spins;
        if (totalCost <= this.balance) {
            this.spins = spins;
            this.remainingSpins = spins;
            this.updateDisplay();
        } else {
            this.showAlert(`積分不足！需要 ${totalCost} 積分，當前積分：${this.balance}`);
        }
    }

    changeBet(amount) {
        if (this.isSpinning) return;
        
        const newBet = this.betAmount + amount;
        if (newBet >= 10 && newBet <= this.balance) {
            this.betAmount = newBet;
            this.updateDisplay();
        } else if (newBet > this.balance) {
            this.showAlert(`下注金額不能超過當前積分：${this.balance}`);
        }
    }

    changeSpins(amount) {
        if (this.isSpinning) return;
        
        const newSpins = this.spins + amount;
        const totalCost = this.betAmount * newSpins;
        
        if (newSpins >= 1 && newSpins <= 100) {
            if (totalCost <= this.balance) {
                this.spins = newSpins;
                this.remainingSpins = newSpins;
                this.updateDisplay();
            } else {
                this.showAlert(`積分不足！需要 ${totalCost} 積分，當前積分：${this.balance}`);
            }
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

        return winnings;
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

        // 為每個老虎機創建動畫
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
        const totalCost = this.betAmount * this.spins;
        if (this.isSpinning) return;
        
        if (totalCost > this.balance) {
            this.showAlert(`積分不足！需要 ${totalCost} 積分，當前積分：${this.balance}`);
            return;
        }

        this.isSpinning = true;
        this.balance -= totalCost;
        this.remainingSpins = this.spins;
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

            this.remainingSpins--;
            this.updateDisplay();

            // 如果不是最後一次spin，等待一段時間再開始下一次
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
        notification.textContent = `恭喜贏得 ${amount} 積分！`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// 初始化遊戲
const game = new SlotGame(); 