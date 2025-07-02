// Game State
let playerName = '';
let gameState = {
    concentration: { level: 1, completed: false, times: [], locked: false },
    shapes: { level: 1, completed: false, times: [], locked: true },
    letters: { level: 1, completed: false, times: [], locked: true }
};

let currentGame = '';
let gameTimer = null;
let startTime = null;
let progressHistory = [];

// Concentration Game Variables
let currentTarget = -1;
let gameActive = false;
let correctClicks = 0;
let targetClicks = 0;

// Audio Context for sounds
let audioContext = null;

// Initialize audio context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play success sound
function playSuccessSound() {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Play encouragement sound
function playEncouragementSound() {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.15); // C5

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Start game
function startGame() {
    const nameInput = document.getElementById('player-name').value.trim();
    if (!nameInput) {
        alert('Silakan masukkan nama terlebih dahulu! 😊');
        return;
    }

    playerName = nameInput;
    document.getElementById('player-name-display').textContent = playerName;

    showScreen('main-menu');
    updateUI();
}


// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    // Hide/show timer based on screen
    const timer = document.getElementById('timer');
    if (['concentration-game', 'shapes-game', 'letters-game'].includes(screenId)) {
        timer.style.display = 'block';
        startTimer();
    } else {
        timer.style.display = 'none';
        stopTimer();
    }
}

// Timer functions
function startTimer() {
    startTime = Date.now();
    gameTimer = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function updateTimer() {
    if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer-display').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function getElapsedTime() {
    return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
}

// Update UI
function updateUI() {
    // Update level displays
    document.getElementById('concentration-level').textContent = gameState.concentration.level;
    document.getElementById('shapes-level').textContent = gameState.shapes.level;
    document.getElementById('letters-level').textContent = gameState.letters.level;


    // Lock/unlock games
    const shapesCard = document.getElementById('shapes-card');
    const lettersCard = document.getElementById('letters-card');


    if (shapesCard) {
        if (gameState.shapes.locked) {
            shapesCard.classList.add('locked');
            shapesCard.onclick = null;
        } else {
            shapesCard.classList.remove('locked');
            shapesCard.onclick = () => selectGame('shapes');
        }
    }

    if (gameState.letters.locked) {
        lettersCard.classList.add('locked');
        lettersCard.onclick = null;
    } else {
        lettersCard.classList.remove('locked');
        lettersCard.onclick = () => selectGame('letters');
    }


}



// Select game
function selectGame(game) {
    if (gameState[game].locked) {
        alert('Selesaikan semua level game Konsentrasi & Fokus terlebih dahulu! 🎯');
        return;
    }

    currentGame = game;

    switch (game) {
        case 'concentration':
            showScreen('concentration-game');
            setupConcentrationGame();
            break;
        case 'shapes':
            showScreen('shapes-game');
            setupShapesGame();
            break;
        case 'letters':
            showScreen('letters-game');
            setupLettersGame();
            break;

    }
}



// Concentration Game
function setupConcentrationGame() {
    const level = gameState.concentration.level;
    document.getElementById('current-concentration-level').textContent = level;
    updateProgress('concentration', level);

    const container = document.getElementById('circles-container');
    container.innerHTML = '';

    // Array bentuk dipisah berdasarkan kategori
    const fruitShapes = [
        { emoji: '🍎', name: 'apel', color: '#ff6b6b' },
        { emoji: '🍊', name: 'jeruk', color: '#ffa726' },
        { emoji: '🍌', name: 'pisang', color: '#ffeb3b' },
        { emoji: '🍇', name: 'anggur', color: '#9c27b0' },
        { emoji: '🍓', name: 'strawberry', color: '#e91e63' },
        { emoji: '🥝', name: 'kiwi', color: '#8bc34a' },
        { emoji: '🍑', name: 'peach', color: '#f44336' },
        { emoji: '🍒', name: 'cherry merah', color: '#e91e63' }
    ];

    const vehicleShapes = [
        { emoji: '🚗', name: 'mobil', color: '#2196f3' },
        { emoji: '🚕', name: 'taksi', color: '#ff9800' },
        { emoji: '🚚', name: 'truk', color: '#4caf50' },
        { emoji: '🚌', name: 'bus', color: '#ff5722' },
        { emoji: '✈️', name: 'pesawat', color: '#00bcd4' },
        { emoji: '🚲', name: 'sepeda', color: '#9c27b0' },
        { emoji: '🏍️', name: 'motor', color: '#795548' },
        { emoji: '🚁', name: 'helikopter', color: '#607d8b' }
    ];

    // Tentukan kategori berdasarkan level atau override manual
    const category = window.manualCategoryOverride || getCurrentCategory(level);
    const shapes = category === 'fruits' ? fruitShapes : vehicleShapes;
    const categoryName = category === 'fruits' ? 'Buah-buahan' : 'Kendaraan';

    // Reset override setelah digunakan
    if (window.manualCategoryOverride) {
        delete window.manualCategoryOverride;
    }

    // Jumlah bentuk berdasarkan level
    let numShapes;
    switch (level) {
        case 1: numShapes = 3; break;  // 3 bentuk horizontal
        case 2: numShapes = 4; break;  // 4 bentuk horizontal  
        case 3: numShapes = 5; break;  // 5 bentuk horizontal
        case 4: numShapes = 6; break;  // 6 bentuk horizontal
        case 5: numShapes = 7; break;  // 7 bentuk horizontal
        default: numShapes = 3;
    }

    // Target clicks berdasarkan level
    targetClicks = level + 2; // Level 1 = 3 klik, Level 2 = 4 klik, dst.

    // Pilih bentuk secara acak untuk level ini
    const selectedShapes = [];
    const shuffledShapes = [...shapes].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numShapes; i++) {
        selectedShapes.push(shuffledShapes[i]);
    }

    // Simpan bentuk yang dipilih untuk referensi
    window.currentGameShapes = selectedShapes;
    window.currentCategory = category;

    // Tambahkan indikator kategori
    const categoryIndicator = document.createElement('div');
    categoryIndicator.id = 'category-indicator';

    //categoryIndicator.textContent = `🎯 Kategori: ${categoryName} (Level ${level})`;

    // Insert kategori indicator sebelum container
    container.parentNode.insertBefore(categoryIndicator, container);

    // Set container menjadi horizontal dengan responsivitas
    container.style.cssText = `
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-wrap: ${numShapes > 5 ? 'wrap' : 'nowrap'};
        gap: ${numShapes > 5 ? '20px' : '30px'};
        padding: 60px;
        min-height: 200px;
        max-width: 150%;
        overflow-x: auto;
    `;

    for (let i = 0; i < numShapes; i++) {
        const shape = selectedShapes[i];
        const shapeElement = document.createElement('div');
        shapeElement.className = 'shape-circle';

        // Styling untuk container bentuk - horizontal layout
        shapeElement.style.cssText = `
            width: 190px;
            height: 190px;
            border-radius: 50%;
            background-color: ${shape.color};
            border: 4px solid #ffffff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 110px;
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
            flex-shrink: 0;
        `;

        shapeElement.innerHTML = shape.emoji;
        shapeElement.dataset.index = i;
        shapeElement.dataset.shapeName = shape.name;
        shapeElement.onclick = () => checkClick(i);

        // Hover effect
        shapeElement.onmouseenter = () => {
            if (gameActive) {
                shapeElement.style.transform = 'scale(1.05)';
            }
        };
        shapeElement.onmouseleave = () => {
            if (gameActive && !shapeElement.classList.contains('active')) {
                shapeElement.style.transform = 'scale(1)';
            }
        };

        container.appendChild(shapeElement);
    }

    correctClicks = 0;
    gameActive = false;
    currentTarget = -1;

    document.getElementById('instruction-text').textContent = `Tekan tombol "🌟 Mulai" untuk bermain dengan ${categoryName.toLowerCase()}!`;
    document.getElementById('start-sequence-btn').disabled = false;
}

// Fungsi untuk menentukan kategori berdasarkan level
function getCurrentCategory(level) {
    // Opsi 1: Bergantian antara buah dan kendaraan setiap level (default)
    return level % 2 === 1 ? 'fruits' : 'vehicles';

    // Opsi 2: Level 1-3 buah-buahan, level 4-5 kendaraan
    // return level <= 3 ? 'fruits' : 'vehicles';

    // Opsi 3: Selalu buah-buahan
    // return 'fruits';

    // Opsi 4: Selalu kendaraan
    // return 'vehicles';

    // Opsi 5: Random setiap level
    // return Math.random() > 0.5 ? 'fruits' : 'vehicles';
}

// Fungsi untuk mengubah kategori secara manual (opsional)
function switchCategory() {
    if (!gameActive) {
        // Toggle kategori dan setup ulang
        const currentLevel = gameState.concentration.level;
        const newCategory = window.currentCategory === 'fruits' ? 'vehicles' : 'fruits';

        // Override kategori sementara
        window.manualCategoryOverride = newCategory;
        setupConcentrationGame();
    }
}

function startSequence() {
    if (gameActive) return;

    gameActive = true;
    correctClicks = 0;
    document.getElementById('start-sequence-btn').disabled = true;

    const categoryName = window.currentCategory === 'fruits' ? 'buah-buahan' : 'kendaraan';
    document.getElementById('instruction-text').textContent = `Tekan ${categoryName} yang menyala! Target: ${correctClicks}/${targetClicks}`;

    // Mulai game dengan menampilkan target pertama
    showNextTarget();
}

function showNextTarget() {
    if (!gameActive) return;

    // Reset semua bentuk
    const shapes = document.querySelectorAll('.shape-circle');
    shapes.forEach(shape => {
        shape.classList.remove('active');
        shape.style.transform = 'scale(1)';
        shape.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        shape.style.filter = 'brightness(1)';
    });

    // Pilih target baru secara random
    const numShapes = shapes.length;
    currentTarget = Math.floor(Math.random() * numShapes);

    // Aktifkan bentuk target dengan delay untuk memberikan waktu
    setTimeout(() => {
        if (gameActive && currentTarget >= 0) {
            const targetShape = shapes[currentTarget];
            targetShape.classList.add('active');
            targetShape.style.transform = 'scale(1.2)';
            targetShape.style.boxShadow = '0 8px 25px rgba(255,215,0,0.6), 0 0 20px rgba(255,215,0,0.4)';
            targetShape.style.filter = 'brightness(1.2)';

            // Tambahkan efek berkedip
            let blinkCount = 0;
            const blinkInterval = setInterval(() => {
                if (blinkCount >= 6 || !gameActive) {
                    clearInterval(blinkInterval);
                    return;
                }

                targetShape.style.opacity = targetShape.style.opacity === '0.5' ? '1' : '0.5';
                blinkCount++;
            }, 200);

            playEncouragementSound(); // Bunyi saat muncul target
        }
    }, 500);
}

function checkClick(clickedIndex) {
    if (!gameActive) return;

    const shapes = document.querySelectorAll('.shape-circle');
    const clickedShape = shapes[clickedIndex];
    const shapeName = window.currentGameShapes[clickedIndex].name;

    if (clickedIndex === currentTarget) {
        // Benar!
        correctClicks++;
        playSuccessSound();

        // Animasi sukses
        clickedShape.style.background = 'linear-gradient(45deg, #48bb78, #38a169)';
        clickedShape.style.transform = 'scale(1.3)';
        clickedShape.style.boxShadow = '0 8px 25px rgba(72,187,120,0.6)';

        // Efek konfetti mini
        createSuccessParticles(clickedShape);

        // Update instruksi dengan nama bentuk dan kategori
        const categoryName = window.currentCategory === 'fruits' ? 'buah' : 'kendaraan';
        document.getElementById('instruction-text').textContent =
            `Bagus! Kamu berhasil tekan ${shapeName}! ${correctClicks}/${targetClicks} - ${correctClicks < targetClicks ? `Lanjutkan cari ${categoryName} lainnya!` : 'Selesai!'}`;

        setTimeout(() => {
            if (correctClicks >= targetClicks) {
                // Level selesai
                gameActive = false;

                // Hapus kategori indicator saat selesai
                const indicator = document.getElementById('category-indicator');
                if (indicator) indicator.remove();

                completeLevel('concentration');
            } else {
                // Lanjut ke target berikutnya
                showNextTarget();
            }
        }, 1500);

    } else {
        // Salah, tapi tetap positif
        playEncouragementSound();

        // Animasi gentle untuk feedback
        clickedShape.style.transform = 'scale(0.8)';
        clickedShape.style.filter = 'brightness(0.7)';

        setTimeout(() => {
            clickedShape.style.transform = 'scale(1)';
            clickedShape.style.filter = 'brightness(1)';
        }, 300);

        // Pesan penyemangat dengan nama bentuk dan kategori
        const targetShapeName = window.currentGameShapes[currentTarget].name;
        const categoryName = window.currentCategory === 'fruits' ? 'buah' : 'kendaraan';
        document.getElementById('instruction-text').textContent =
            `Kamu tekan ${shapeName}, coba cari ${categoryName} ${targetShapeName} yang menyala! 😊 (${correctClicks}/${targetClicks})`;
    }
}

// Fungsi untuk membuat efek partikel sukses - disesuaikan untuk layout horizontal
function createSuccessParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: #ffd700;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${centerX}px;
            top: ${centerY}px;
        `;

        document.body.appendChild(particle);

        const angle = (i * 36) * Math.PI / 180;
        const distance = 60;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;

        particle.animate([
            { left: centerX + 'px', top: centerY + 'px', opacity: 1, transform: 'scale(1)' },
            { left: endX + 'px', top: endY + 'px', opacity: 0, transform: 'scale(0.3)' }
        ], {
            duration: 800,
            easing: 'ease-out'
        }).onfinish = () => particle.remove();
    }
}
// Shapes Game
function setupShapesGame() {
    const level = gameState.shapes.level;
    document.getElementById('current-shapes-level').textContent = level;
    updateProgress('shapes', level);

    const shapes = [
        { name: '🍎', color: '#ff6b6b', shape: 'Appel' },
        { name: '🚙', color: '#4ecdc4', shape: 'Car' },
        { name: '🟢', color: '#48bb78', shape: 'circle' },
        { name: '🐯', color: '#feca57', shape: 'Tiger' },
        { name: '🌹', color: '#ff9ff3', shape: 'Rose' },
        { name: '🔷', color: '#45b7d1', shape: 'diamond' },
        { name: '🍔', color: '#EE4025', shape: 'Burger' },
        { name: '🦜', color: '#E0B1D2', shape: 'Bird' }
    ];

    const numShapes = Math.min(1 + level, 8);
    const selectedShapes = shapes.slice(0, numShapes);

    setupShapesLevel(selectedShapes);
}

function setupShapesLevel(shapes) {
    const shapesContainer = document.getElementById('shapes-container');
    const dropZonesContainer = document.getElementById('drop-zones-container');

    shapesContainer.innerHTML = '';
    dropZonesContainer.innerHTML = '';

    // Shuffle shapes for dragging
    const shuffledShapes = [...shapes].sort(() => Math.random() - 0.5);

    // Create draggable shapes
    shuffledShapes.forEach((shape, index) => {
        const shapeEl = document.createElement('div');
        shapeEl.className = 'shape';
        shapeEl.style.backgroundColor = shape.color;
        shapeEl.textContent = shape.name;
        shapeEl.draggable = true;
        shapeEl.dataset.shape = shape.shape;
        shapeEl.dataset.color = shape.color;

        shapeEl.addEventListener('dragstart', handleDragStart);
        shapeEl.addEventListener('dragend', handleDragEnd);

        shapesContainer.appendChild(shapeEl);
    });

    // Create drop zones
    shapes.forEach((shape, index) => {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.dataset.shape = shape.shape;
        dropZone.dataset.color = shape.color;
        dropZone.innerHTML = `<div style="color: #cbd5e0; font-size: 60px;">${shape.name}</div>`;

        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);

        dropZonesContainer.appendChild(dropZone);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');

    if (draggedElement &&
        draggedElement.dataset.shape === e.target.dataset.shape &&
        draggedElement.dataset.color === e.target.dataset.color) {

        // Correct drop
        e.target.appendChild(draggedElement.cloneNode(true));
        draggedElement.style.display = 'none';
        playSuccessSound();

        // Check if all shapes are placed
        const remainingShapes = document.querySelectorAll('#shapes-container .shape:not([style*="display: none"])');
        if (remainingShapes.length === 0) {
            setTimeout(() => completeLevel('shapes'), 500);
        }
    } else {
        // Wrong drop
        playEncouragementSound();
    }
}

function resetShapesLevel() {
    setupShapesGame();
}

// Letters and Numbers Game
function setupLettersGame() {
    const level = gameState.letters.level;
    const currentLettersLevel = document.getElementById('current-letters-level');

    if (currentLettersLevel) {
        currentLettersLevel.textContent = level;
    }
    updateProgress('letters', level);

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const numbers = '0123456789'.split('');

    let items, target, instruction;

    if (level <= 5) {
        // Letters only
        const numLetters = Math.min(4 + level, 10);
        items = letters.slice(0, numLetters);
        target = items[Math.floor(Math.random() * items.length)];
        instruction = `Klik huruf "${target}"`;
    } else if (level <= 8) {
        // Numbers only
        const numNumbers = Math.min(level - 3, 10);
        items = numbers.slice(0, numNumbers);
        target = items[Math.floor(Math.random() * items.length)];
        instruction = `Klik angka "${target}"`;
    } else {
        // Mixed
        const numItems = 8;
        items = [...letters.slice(0, 4), ...numbers.slice(0, 4)];
        target = items[Math.floor(Math.random() * items.length)];
        instruction = `Klik "${target}"`;
    }

    document.getElementById('letters-instruction').textContent = instruction;
    document.getElementById('target-display').textContent = target;

    // Shuffle items
    items = items.sort(() => Math.random() - 0.5);

    const container = document.getElementById('letters-container');
    container.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = isNaN(item) ? 'letter-card' : 'number-card';
        card.textContent = item;
        card.onclick = () => checkLetterNumber(item, target);
        container.appendChild(card);
    });
}

function checkLetterNumber(selected, target) {
    if (selected === target) {
        playSuccessSound();
        completeLevel('letters');
    } else {
        playEncouragementSound();
        // Visual feedback for wrong answer
        event.target.style.transform = 'scale(0.9)';
        setTimeout(() => {
            event.target.style.transform = 'scale(1)';
        }, 200);
    }
}

// Complete level
function completeLevel(gameType) {
    const time = getElapsedTime();
    gameState[gameType].times.push(time);

    const maxLevels = gameType === 'concentration' ? 5 : 10;

    if (gameState[gameType].level < maxLevels) {
        gameState[gameType].level++;

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'level-complete success-animation';
        successDiv.innerHTML = `
                    <h3>🎉 Level Selesai!</h3>
                    <p>Waktu: ${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}</p>
                    <p>Lanjut ke level ${gameState[gameType].level}?</p>
                `;

        const gameArea = document.querySelector(`#${gameType}-game .game-area`);
        gameArea.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
            if (gameType === 'concentration') {
                setupConcentrationGame();
            } else if (gameType === 'shapes') {
                setupShapesGame();
            } else if (gameType === 'letters') {
                setupLettersGame();
            }
        }, 2000);

    } else {
        // Game completed
        gameState[gameType].completed = true;

        // Unlock next games
        if (gameType === 'concentration') {
            gameState.shapes.locked = false;
            gameState.letters.locked = false;
            gameState.letters.locked = false;
        }

        alert(`🎊 Selamat! Kamu telah menyelesaikan semua level ${gameType === 'concentration' ? 'Konsentrasi & Fokus' : gameType}!`);
        backToMenu();
    }

    updateUI();
}

// Update progress bar
function updateProgress(gameType, level) {
    const maxLevels = gameType === 'concentration' ? 5 : 10;
    const progress = (level / maxLevels) * 100;
    document.getElementById(`${gameType}-progress`).style.width = `${progress}%`;
}

// Back to menu
function backToMenu() {
    stopTimer();
    showScreen('main-menu');
    updateUI();
}

function downloadReport() {
    const reportData = {
        ...learningData,
        exportDate: new Date().toLocaleString('id-ID')
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `laporan-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showSaveStatus('success', '📥 Laporan berhasil diunduh!');
}

function saveProgressSnapshot(status = 'Manual Save') {
    const timestamp = new Date().toISOString();
    const snapshot = {
        timestamp: timestamp,
        date: new Date().toLocaleDateString('id-ID'),
        time: new Date().toLocaleTimeString('id-ID'),
        status: status,
        timescreen: timescreen,
        gameState: JSON.parse(JSON.stringify(gameState)), // Deep copy
        totalProgress: calculateTotalProgress()
    };

    progressHistory.push(snapshot);

    // Batasi history maksimal 10 entri untuk menghemat memori
    if (progressHistory.length > 10) {
        progressHistory.shift();
    }

    // Simpan ke localStorage jika tersedia
    try {
        localStorage.setItem('gameProgressHistory', JSON.stringify(progressHistory));
        localStorage.setItem('gameState', JSON.stringify(gameState));
    } catch (e) {
        console.log('LocalStorage tidak tersedia');
    }
}

// Fungsi untuk menghitung total progress
function calculateTotalProgress() {
    let totalLevels = 0;
    let completedLevels = 0;

    Object.values(gameState).forEach(game => {
        totalLevels += game.times.length;
        if (game.completed) completedLevels++;
    });

    return {
        totalLevels,
        completedLevels,
        percentage: totalLevels > 0 ? Math.round((completedLevels / 3) * 100) : 0
    };
}

// Fungsi untuk memuat history dari localStorage
function loadProgressHistory() {
    try {
        const savedHistory = localStorage.getItem('gameProgressHistory');
        const savedGameState = localStorage.getItem('gameState');

        if (savedHistory) {
            progressHistory = JSON.parse(savedHistory);
        }

        if (savedGameState) {
            gameState = JSON.parse(savedGameState);
        }
    } catch (e) {
        console.log('Gagal memuat history dari localStorage');
    }
}

// Show results
function showResults() {
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = '';

    // Tambahkan tombol untuk melihat history
    //const historyButton = document.createElement('button');
    //historyButton.textContent = '';
    //historyButton.className = 'history-btn';
    //historyButton.onclick = showProgressHistory;
    //resultsContent.appendChild(historyButton);

    //baru
    const header = document.createElement('div');
    header.className = 'result-header';
    header.innerHTML = `
        <h2>🎯 Hasil Permainan Kamu</h2>
        <p>Halo, ${playerName} ! ini progress dan nilai belajarmu sejauh ini</p>
        <div class="score-explanation">
            <span>Nilai:</span>
            <span class="score-A">A</span> (Cepat) → 
            <span class="score-E">E</span> (Perlu Latihan)
        </div>
    `;
    resultsContent.appendChild(header);

    // Container untuk game cards - baru
    const gamesContainer = document.createElement('div');
    gamesContainer.className = 'games-container';

    ['concentration', 'shapes', 'letters'].forEach(gameType => {
        const game = gameState[gameType];
        const gameNames = {
            concentration: 'Konsentrasi & Fokus',
            shapes: 'Bentuk & Warna',
            letters: 'Huruf & Angka'
        };

        //baru
        const maxLevels = gameType === 'concentration' ? 5 : 10;
        const progress = (game.level / maxLevels) * 100;
        const isCompleted = game.completed;
        const score = calculateScore(gameType);
        const scoreColor = getScoreColor(score);

        const gameCard = document.createElement('div');
        gameCard.className = `game-result-card ${isCompleted ? 'completed' : ''}`;
        gameCard.innerHTML = `
    
        <div class="game-icon">
                ${gameType === 'concentration' ? '🎯' :
                gameType === 'shapes' ? '🔷' : '🔤'}
            </div>
            <h3>${gameNames[gameType]}</h3>
            
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <h4>${game.level}/${maxLevels} level</h4>
                </div>
                <div class="score-display" style="background: ${scoreColor}">
                ${score}
                </div>
            
            <div class="game-status">
                ${isCompleted ? '✅ Selesai' : game.locked ? '🔒 Terkunci' : '🏃‍♂️ Dalam Progress'}
            ${game.times.length > 0 ?
                `<br>Rata: ${Math.floor(game.times.reduce((a, b) => a + b, 0) / game.times.length)} detik` : ''}
            </div>
            </div>

        `;
        gamesContainer.appendChild(gameCard);
    });

    resultsContent.appendChild(gamesContainer);
    showScreen('results-screen');
}

//const resultCard = document.createElement('div');
//resultCard.className = 'result-card';

//let avgTime = 0;
//if (game.times.length > 0) {
//  avgTime = game.times.reduce((a, b) => a + b, 0) / game.times.length;
//}

//const maxLevels = gameType === 'concentration' ? 5 : 10;

// Tambahkan informasi perkembangan
//const improvement = calculateGameImprovement(gameType);

//resultCard.innerHTML = `
//      < h3 > ${gameNames[gameType]}</h3 >
//    <p>Level Tertinggi: ${game.level - (game.completed ? 0 : 1)}/${maxLevels}</p>
//  <p>Status: ${game.completed ? '✅ Selesai' : game.locked ? '🔒 Terkunci' : '⏳ Dalam Progress'}</p>
//<p>Rata-rata Waktu: ${game.times.length > 0 ? `${Math.floor(avgTime / 60)}:${(Math.floor(avgTime) % 60).toString().padStart(2, '0')}` : 'Belum ada data'}</p>
//<p>Total Level Dimainkan: ${game.times.length}</p>
//${improvement ? `<p class="improvement">📈 ${improvement}</p>` : ''}
//`;

//resultsContent.appendChild(resultCard);
//});

// Tambahkan ringkasan total progress
const totalProgress = calculateTotalProgress();
const summaryCard = document.createElement('div');
summaryCard.className = 'result-card summary-card';
summaryCard.innerHTML = `

            < h3 >📊 Ringkasan Total</h3 >
        <p>Game Selesai: ${totalProgress.completedLevels}/3</p>

        <p>Total Level Dimainkan: ${totalProgress.totalLevels}</p>
        <p>Progress Keseluruhan: ${totalProgress.percentage}%</p>
        `;
resultsContent.appendChild(summaryCard);

showScreen('results-screen');
//}

// Fungsi untuk menghitung perkembangan game
function calculateGameImprovement(gameType) {
    if (progressHistory.length < 2) return null;

    const currentGame = gameState[gameType];
    const previousSnapshot = progressHistory[progressHistory.length - 2];
    const previousGame = previousSnapshot.gameState[gameType];

    const levelImprovement = currentGame.level - previousGame.level;
    const timeImprovement = currentGame.times.length - previousGame.times.length;

    if (levelImprovement > 0) {
        return `Naik ${levelImprovement} level!`;
    } else if (timeImprovement > 0) {
        return `${timeImprovement} level baru dimainkan`;
    }

    return null;
}
function getCurrentDateTime() {
    const now = new Date();

    // Format tanggal dalam bahasa Indonesia
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const date = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} `;
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} `;

    return { date, time };
}
// Fungsi untuk menampilkan history progress
function showProgressHistory() {
    if (progressHistory.length === 0) {
        alert('Belum ada riwayat progress yang tersimpan.');
        return;
    }

    let historyHTML = '<div class="history-container"><h2>📋 Riwayat Progress</h2>';

    progressHistory.slice().reverse().forEach((snapshot, index) => {
        const totalGames = Object.values(snapshot.gameState).reduce((total, game) => total + game.times.length, 0);
        const completedGames = Object.values(snapshot.gameState).filter(game => game.completed).length;


        historyHTML += `
            < div class="history-item" >
                <h4>${snapshot.date} - ${snapshot.time}</h4>
                <p><strong>Status:</strong> ${snapshot.reason}</p>
                <p><strong>Level Selesai:</strong> ${totalGames}</p>
                <p><strong>Rata:</strong> ${completedGames}/3</p>
                <p><strong>Progress:</strong> ${snapshot.totalProgress.percentage}%</p>
            </div >
            `;
    });

    historyHTML += '<button onclick="closeHistory()">Tutup</button></div>';

    // Tampilkan dalam modal atau div khusus
    const historyModal = document.createElement('div');
    historyModal.id = 'history-modal';
    historyModal.className = 'modal';
    historyModal.innerHTML = historyHTML;
    document.body.appendChild(historyModal);
}

function closeHistory() {
    const modal = document.getElementById('history-modal');
    if (modal) {
        modal.remove();
    }
}

// Fungsi reset yang diperbaiki dengan penyimpanan history
function resetAllProgress() {
    if (confirm('Apakah kamu yakin ingin mengulang semua permainan dari awal? Progress saat ini akan disimpan dalam riwayat.')) {
        // Simpan progress saat ini sebelum reset

        saveProgressSnapshot('Reset Progress');

        // Reset game state
        gameState = {
            concentration: { level: 1, completed: false, times: [], locked: false },
            shapes: { level: 1, completed: false, times: [], locked: true },
            letters: { level: 1, completed: false, times: [], locked: true }
        };

        //reset playername
        playerName = '';
        document.getElementById('player-name').value = '';
        localStorage.clear();

        // Simpan state baru
        saveProgressSnapshot('Progress Setelah Reset');

        updateUI();
        showScreen('welcome-screen');

        // Beri feedback visual
        const welcomeScreen = document.getElementById('welcome-screen');
        welcomeScreen.style.animation = 'none';
        void welcomeScreen.offsetWidth; // Trigger reflow
        welcomeScreen.style.animation = 'fadeIn 0.8s ease-out';

        alert('Semua progress telah direset! Silakan mulai permainan baru.');
    }
}


// Fungsi untuk menyimpan progress manual
function saveProgress() {
    saveProgressSnapshot('Simpan Manual');
    alert('Progress berhasil disimpan! 💾');
}

// Fungsi untuk restore progress dari history
function restoreProgress(index) {
    if (index >= 0 && index < progressHistory.length) {
        const snapshot = progressHistory[index];
        gameState = JSON.parse(JSON.stringify(snapshot.gameState));
        saveProgressSnapshot(`Restore dari ${snapshot.date} `);
        updateUI();
        alert('Progress berhasil dipulihkan! 🔄');
    }
}

// Initialize game dengan memuat history
document.addEventListener('DOMContentLoaded', function () {
    loadProgressHistory();
    updateUI();

    // Simpan snapshot awal jika belum ada history
    if (progressHistory.length === 0) {
        saveProgressSnapshot('Game Dimulai');
    }
});

// Tambahkan event listener untuk menyimpan progress otomatis setiap level selesai
// (Ini perlu disesuaikan dengan fungsi game yang sudah ada)
function onLevelComplete(gameType, time) {
    // Kode existing untuk menyelesaikan level...

    // Tambahkan penyimpanan otomatis
    saveProgressSnapshot(`Level selesai - ${gameType} `);
}



// Initialize game
document.addEventListener('DOMContentLoaded', function () {
    updateUI();
});

window.addEventListener('load', () => {
    setTimeout(updateProgressBars, 300);
    setTimeout(animateCounters, 800);
});

function openModal() {
    const modal = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');

    modal.classList.add('show');
    modalContent.classList.remove('closing');

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeModal(event) {
    // Only close if clicked on overlay, not on modal content
    if (event && event.target !== document.getElementById('modalOverlay')) {
        return;
    }

    const modal = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');

    modalContent.classList.add('closing');

    setTimeout(() => {
        modal.classList.remove('show');
        modalContent.classList.remove('closing');
        // Restore body scroll
        document.body.style.overflow = 'auto';
    }, 300);
}

// Close modal with Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Add smooth hover effects to instruction items
document.addEventListener('DOMContentLoaded', function () {
    const instructionItems = document.querySelectorAll('.instruction-item');

    instructionItems.forEach((item, index) => {
        // Stagger animation on modal open
        item.style.animationDelay = `${index * 0.1} s`;
    });
});

const synth = window.speechSynthesis;

function speak(text) {

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = synth.getVoices();
    const indonesianVoice = voices.find(voice =>
        voice.lang.includes('id') ||
        voice.name.toLowerCase().includes('indonesia') ||
        voice.name.toLowerCase().includes('bahasa')
    );
    if (indonesianVoice) {
        utterance.voice = indonesianVoice;
    }
    utterance.lang = 'id-ID'; // Indonesian language
    utterance.rate = 0.6; // Slower, more deliberate pace
    utterance.pitch = 1.1; // Slightly higher pitch for friendliness
    utterance.volume = 0.9; // Slightly softer volume

    // Add a small delay to ensure clarity
    setTimeout(() => {
        synth.speak(utterance);
    }, 100);
}

// Initialize learning grids
function initializeLearningGrids() {
    const lettersGrid = document.getElementById('lettersGrid');
    const numbersGrid = document.getElementById('numbersGrid');

    lettersGrid.innerHTML = '';
    numbersGrid.innerHTML = '';

    // Create letter buttons A-Z
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const button = document.createElement('button');
        button.className = 'learning-item';
        button.textContent = letter;
        button.onclick = () => playLearningSound(letter, button);
        lettersGrid.appendChild(button);
    }

    // Create number buttons 0-9
    for (let i = 0; i <= 9; i++) {
        const button = document.createElement('button');
        button.className = 'learning-item';
        button.textContent = i.toString();
        button.onclick = () => playLearningSound(i.toString(), button);
        numbersGrid.appendChild(button);
    }
}

function playLearningSound(character, button) {
    // Add visual feedback
    button.classList.add('playing');
    setTimeout(() => {
        button.classList.remove('playing');
    }, 600);

    // Speak the character directly without prefix
    speak(character);
}

function openLearningModal() {
    document.getElementById('learningModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    initializeLearningGrids();
}

function closeLearningModal() {
    document.getElementById('learningModal').style.display = 'none';
    document.body.style.overflow = 'hidden';
    synth.cancel(); // Stop any ongoing speech
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('learningModal');
    if (event.target === modal) {
        closeLearningModal();
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeLearningModal();
    }

});

function logout() {
    // Kembali ke halaman awal
    if (confirm("Apakah yakin ingin keluar?")) {
        // Kembali ke halaman awal
        playerName = '';
        localStorage.clear();
        //document.getElementById('welcome-screen').classList.add('hidden');
        //document.getElementById('main-menu').classList.remove('hidden');

        // Tambahkan efek transisi yang smooth
        showScreen('welcome-screen')
        document.getElementById('welcome-screen').style.animation = 'slideIn 0.8s ease-out';
    }
}
document.addEventListener('click', function (e) {
    if (e.target.tagName === 'BUTTON') {
        // Efek visual saat button diklik
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

function calculateScore(gameType) {
    const game = gameState[gameType];
    if (game.times.length === 0) return '-';

    // Hitung rata-rata waktu per level (dalam detik)
    const avgTime = game.times.reduce((a, b) => a + b, 0) / game.times.length;

    // Tentukan grade berdasarkan waktu
    if (avgTime < 300) return 'A';      // < 5 menit
    if (avgTime < 600) return 'B';      // 6-10 menit
    if (avgTime < 900) return 'C';     // 10-15 menit
    if (avgTime < 1200) return 'D';     // 15-20 menit
    return 'E';                        // > 20 menit
}

function getScoreColor(score) {
    const colors = {
        'A': '#48bb78', // Hijau
        'B': '#38a169', // Hijau tua
        'C': '#ecc94b', // Kuning
        'D': '#ed8936', // Oranye
        'E': '#e53e3e'  // Merah
    };
    return colors[score] || '#a0aec0';
}

function showResetConfirmation() {
    const confirmation = document.createElement('div');
    confirmation.className = 'reset-confirmation';
    confirmation.innerHTML = `
        <div class="reset-confirmation-content">
            <h3>Reset Semua Progress?</h3>
            <p>Semua level, nilai, dan riwayat akan dihapus permanen.</p>
            <div class="confirmation-buttons">
                <button class="btn btn-confirm" onclick="resetAllProgress()">Ya, Reset</button>
                <button class="btn btn-cancel" onclick="this.parentElement.parentElement.remove()">Batal</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmation);
}

localStorage.clear();
updateUI();