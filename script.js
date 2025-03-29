class SlotGame {
    constructor() {
        this.symbols = ['🍎', '🍊', '🍇', '🍒', '🍋', '💎', '7️⃣', '🎰'];
        this.balance = 1000;
        this.betAmount = 10;
        this.spins = 1;
        this.remainingSpins = 0;
        this.isSpinning = false;
        this.slots = Array.from({ length: 25 }, (_, i) => document.getElementById(`slot${i + 1}`));
        
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
        if (this.isSpinning) {
            this.showAlert('遊戲進行中無法更改次數！');
            return;
        }
        
        const totalCost = spins * this.betAmount;
        if (totalCost > this.balance) {
            this.showAlert(`餘額不足！需要 ${totalCost} 點，當前餘額 ${this.balance} 點`);
            return;
        }
        
        this.spins = spins;
        this.updateDisplay();
    }

    changeBet(amount) {
        if (this.isSpinning) {
            this.showAlert('遊戲進行中無法更改下注金額！');
            return;
        }
        
        const newBet = this.betAmount + amount;
        if (newBet < 10) {
            this.showAlert('最小下注金額為 10！');
            return;
        }
        
        this.betAmount = newBet;
        this.updateDisplay();
    }

    changeSpins(amount) {
        if (this.isSpinning) {
            this.showAlert('遊戲進行中無法更改次數！');
            return;
        }
        
        const newSpins = this.spins + amount;
        if (newSpins < 1) {
            this.showAlert('最少需要 1 次！');
            return;
        }
        
        const totalCost = newSpins * this.betAmount;
        if (totalCost > this.balance) {
            this.showAlert(`餘額不足！需要 ${totalCost} 點，當前餘額 ${this.balance} 點`);
            return;
        }
        
        this.spins = newSpins;
        this.updateDisplay();
    }

    getRandomSymbol() {
        return this.symbols[Math.floor(Math.random() * this.symbols.length)];
    }

    calculateWinnings() {
        let winnings = 0;
        const rows = 5;
        const cols = 5;
        
        // 檢查水平線
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols - 2; col++) {
                const index = row * cols + col;
                const symbol1 = this.slots[index].querySelector('.symbol').textContent;
                const symbol2 = this.slots[index + 1].querySelector('.symbol').textContent;
                const symbol3 = this.slots[index + 2].querySelector('.symbol').textContent;
                
                if (symbol1 === symbol2 && symbol2 === symbol3) {
                    winnings += this.getSymbolValue(symbol1);
                }
            }
        }
        
        // 檢查垂直線
        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows - 2; row++) {
                const index = row * cols + col;
                const symbol1 = this.slots[index].querySelector('.symbol').textContent;
                const symbol2 = this.slots[index + cols].querySelector('.symbol').textContent;
                const symbol3 = this.slots[index + 2 * cols].querySelector('.symbol').textContent;
                
                if (symbol1 === symbol2 && symbol2 === symbol3) {
                    winnings += this.getSymbolValue(symbol1);
                }
            }
        }
        
        // 檢查對角線
        // 左上到右下
        for (let row = 0; row < rows - 2; row++) {
            for (let col = 0; col < cols - 2; col++) {
                const index = row * cols + col;
                const symbol1 = this.slots[index].querySelector('.symbol').textContent;
                const symbol2 = this.slots[index + cols + 1].querySelector('.symbol').textContent;
                const symbol3 = this.slots[index + 2 * cols + 2].querySelector('.symbol').textContent;
                
                if (symbol1 === symbol2 && symbol2 === symbol3) {
                    winnings += this.getSymbolValue(symbol1);
                }
            }
        }
        
        // 右上到左下
        for (let row = 0; row < rows - 2; row++) {
            for (let col = 2; col < cols; col++) {
                const index = row * cols + col;
                const symbol1 = this.slots[index].querySelector('.symbol').textContent;
                const symbol2 = this.slots[index + cols - 1].querySelector('.symbol').textContent;
                const symbol3 = this.slots[index + 2 * cols - 2].querySelector('.symbol').textContent;
                
                if (symbol1 === symbol2 && symbol2 === symbol3) {
                    winnings += this.getSymbolValue(symbol1);
                }
            }
        }
        
        return winnings;
    }

    getSymbolValue(symbol) {
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

    async spinSlots() {
        const rows = 5;
        const cols = 5;
        let totalWinnings = 0;
        
        for (let i = 0; i < this.remainingSpins; i++) {
            // 從左到右依次轉動每一列
            for (let col = 0; col < cols; col++) {
                // 同時轉動該列的所有格子
                const spinPromises = [];
                for (let row = 0; row < rows; row++) {
                    const index = row * cols + col;
                    const slot = this.slots[index];
                    const symbolContainer = slot.querySelector('.symbol-container');
                    const symbol = slot.querySelector('.symbol');
                    
                    // 添加轉動動畫
                    symbolContainer.classList.add('spinning');
                    
                    // 隨機選擇符號
                    const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                    
                    // 創建一個 Promise 來處理動畫結束
                    const spinPromise = new Promise(resolve => {
                        setTimeout(() => {
                            // 移除轉動動畫並更新符號
                            symbolContainer.classList.remove('spinning');
                            symbol.textContent = randomSymbol;
                            resolve();
                        }, 500); // 動畫持續時間
                    });
                    
                    spinPromises.push(spinPromise);
                }
                
                // 等待該列所有格子轉動完成
                await Promise.all(spinPromises);
                
                // 每列之間稍作停頓
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // 計算獎勵
            const winnings = this.calculateWinnings();
            totalWinnings += winnings;
            
            // 更新餘額
            this.balance += winnings;
            this.updateDisplay();
            
            // 每次轉動後稍作停頓
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.remainingSpins--;
            this.updateDisplay();
        }
        
        // 遊戲結束
        this.isSpinning = false;
        const spinButton = document.getElementById('spinButton');
        spinButton.disabled = false;
        spinButton.textContent = '開始遊戲';
        
        if (totalWinnings > 0) {
            this.showAlert(`恭喜獲得 ${totalWinnings} 點！`);
        }
    }

    async spin() {
        if (this.isSpinning) {
            this.showAlert('遊戲進行中！');
            return;
        }

        const totalCost = this.spins * this.betAmount;
        if (totalCost > this.balance) {
            this.showAlert(`餘額不足！需要 ${totalCost} 點，當前餘額 ${this.balance} 點`);
            return;
        }

        this.isSpinning = true;
        this.balance -= totalCost;
        this.remainingSpins = this.spins;
        this.updateDisplay();
        
        const spinButton = document.getElementById('spinButton');
        spinButton.disabled = true;
        spinButton.textContent = '遊戲中...';
        
        await this.spinSlots();
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