class SlotGame {
    constructor() {
        this.symbols = ['🍎', '🍊', '🍇', '🍒', '🍋', '💎', '7️⃣', '🎰'];
        this.balance = 1000;
        this.betAmount = 10;
        this.spins = 1;
        this.remainingSpins = 0;
        this.isSpinning = false;
        this.slots = Array.from({ length: 25 }, (_, i) => document.getElementById(`slot${i + 1}`));
        this.winningSlots = new Set();
        
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
        this.winningSlots.clear();
        
        // 檢查水平線
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols - 2; col++) {
                const index = row * cols + col;
                const symbol1 = this.slots[index].querySelector('.symbol').textContent;
                const symbol2 = this.slots[index + 1].querySelector('.symbol').textContent;
                const symbol3 = this.slots[index + 2].querySelector('.symbol').textContent;
                
                if (symbol1 === symbol2 && symbol2 === symbol3) {
                    winnings += this.getSymbolValue(symbol1);
                    this.addWinningSlots(index, index + 1, index + 2);
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
                    this.addWinningSlots(index, index + cols, index + 2 * cols);
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
                    this.addWinningSlots(index, index + cols + 1, index + 2 * cols + 2);
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
                    this.addWinningSlots(index, index + cols - 1, index + 2 * cols - 2);
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

    addWinningSlots(index1, index2, index3) {
        this.winningSlots.add(index1);
        this.winningSlots.add(index2);
        this.winningSlots.add(index3);
    }

    showWinningSlots() {
        // 清除之前的中獎效果
        this.slots.forEach(slot => {
            slot.classList.remove('winning');
        });

        // 顯示新的中獎效果
        this.winningSlots.forEach(index => {
            this.slots[index].classList.add('winning');
        });
    }

    fadeOutWinningEffects() {
        // 淡出中獎格子效果
        this.slots.forEach(slot => {
            if (slot.classList.contains('winning')) {
                slot.classList.add('fade-out');
                setTimeout(() => {
                    slot.classList.remove('winning', 'fade-out');
                }, 250);
            }
        });
    }

    async spinSlots() {
        const currentSpins = this.remainingSpins;
        for (let spin = 0; spin < currentSpins; spin++) {
            // 更新剩餘次數顯示
            this.remainingSpins--;
            this.updateDisplay();
            
            // 所有格子同時開始轉動
            const spinPromises = this.slots.map((slot, index) => {
                return new Promise(resolve => {
                    // 計算該格子的列和行
                    const col = index % 5;
                    const row = Math.floor(index / 5);
                    
                    // 基礎延遲時間（每列增加30ms）
                    const baseDelay = col * 30;
                    
                    // 隨機停止時間（300-500ms）
                    const randomDelay = Math.random() * 200 + 300;
                    
                    // 總延遲時間
                    const totalDelay = baseDelay + randomDelay;
                    
                    // 開始轉動
                    slot.classList.add('spinning');
                    
                    // 在轉動過程中隨機更新圖示
                    const updateInterval = setInterval(() => {
                        const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                        const symbolContainer = slot.querySelector('.symbol-container');
                        const symbol = slot.querySelector('.symbol');
                        symbol.textContent = randomSymbol;
                        symbolContainer.style.transform = `translateY(${Math.random() * -100}%)`;
                    }, 80); // 從100ms改為80ms
                    
                    // 設置停止時間
                    setTimeout(() => {
                        clearInterval(updateInterval);
                        slot.classList.remove('spinning');
                        resolve();
                    }, totalDelay);
                });
            });
            
            // 等待所有格子停止
            await Promise.all(spinPromises);
            
            // 更新所有格子的最終圖示
            this.slots.forEach(slot => {
                const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                const symbolContainer = slot.querySelector('.symbol-container');
                const symbol = slot.querySelector('.symbol');
                symbol.textContent = randomSymbol;
                symbolContainer.style.transform = 'translateY(0)';
            });
            
            // 計算獎勵
            const winnings = this.calculateWinnings();
            
            // 更新餘額
            this.balance += winnings;
            this.updateDisplay();
            
            // 顯示中獎效果
            if (winnings > 0) {
                this.showWinningSlots();
                // 等待閃爍效果完成（0.4秒 * 2次 = 0.8秒）
                await new Promise(resolve => setTimeout(resolve, 800));
                // 淡出效果
                this.fadeOutWinningEffects();
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // 等待一段時間後進行下一次轉動
            await new Promise(resolve => setTimeout(resolve, 150));
        }
        
        // 遊戲結束
        this.isSpinning = false;
        const spinButton = document.getElementById('spinButton');
        spinButton.disabled = false;
        spinButton.textContent = '開始遊戲';
        
        if (this.calculateWinnings() > 0) {
            this.showAlert(`恭喜獲得 ${this.calculateWinnings()} 點！`);
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
        this.remainingSpins = this.spins; // 設置剩餘次數
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