const bgMusic = document.getElementById('bg-music');

function playMusic(volumeLevel) { 
    if (bgMusic) { 
        bgMusic.volume = volumeLevel; 
        if (bgMusic.paused) bgMusic.play().catch(function(e){}); 
    }
}

function switchScreen(hide, show) {
    document.getElementById(hide).classList.remove('active'); 
    document.getElementById(show).classList.add('active');
}

// =======================================================
// GAME 1: CATCH
// =======================================================
let g1Score = 0, isG1Running = false; 
const catchItems = ['💋','💖']; 

function startGame1() { 
    playMusic(0.1); 
    switchScreen('intro-screen', 'game1-screen'); 
    document.getElementById('g1-tutorial').style.display = 'flex'; 
}

function runGame1() {
    document.getElementById('g1-tutorial').style.display = 'none'; 
    isG1Running = true; 
    spawnItems();
    
    const area = document.getElementById('game-area'); 
    const basket = document.getElementById('basket');
    
    area.addEventListener('touchmove', function(e) { 
        basket.style.left = (e.touches[0].clientX - area.getBoundingClientRect().left) + 'px'; 
    });
    area.addEventListener('mousemove', function(e) { 
        basket.style.left = (e.clientX - area.getBoundingClientRect().left) + 'px'; 
    });
}

function spawnItems() {
    if (!isG1Running) return;
    
    const area = document.getElementById('game-area'); 
    const item = document.createElement('div');
    item.className = 'item'; 
    item.innerText = catchItems[Math.floor(Math.random() * catchItems.length)];
    item.style.left = Math.random() * (area.offsetWidth - 40) + 'px'; 
    item.style.top = '0px'; 
    area.appendChild(item);
    
    let fall = setInterval(function() {
        if(!isG1Running) { clearInterval(fall); item.remove(); return; }
        
        let top = parseInt(item.style.top);
        let basketRect = document.getElementById('basket').getBoundingClientRect(); 
        let itemRect = item.getBoundingClientRect();
        
        if (itemRect.bottom >= basketRect.top && itemRect.right >= basketRect.left && itemRect.left <= basketRect.right) {
            g1Score += 10; 
            document.getElementById('score').innerText = g1Score; 
            item.remove(); 
            clearInterval(fall);
            
            if (g1Score >= 100) { 
                isG1Running = false; 
                setTimeout(function() { switchScreen('game1-screen', 'transisi-screen'); }, 500); 
            }
        } else if (top > area.offsetHeight) { 
            item.remove(); clearInterval(fall); 
        } else { 
            item.style.top = (top + 5) + 'px'; 
        }
    }, 25); 
    
    if (isG1Running) setTimeout(spawnItems, 700);
}

// =======================================================
// GAME 2: PUZZLE (PERBAIKAN LOGIC WIN CONDITION)
// =======================================================
let level = 1, selected = null; 
let images = ['puzzle1.jpg', 'puzzle2.jpg', 'puzzle3.jpg'];

function startGame2() { 
    playMusic(0.1); 
    switchScreen('transisi-screen', 'game2-screen'); 
    loadPuzzle(); 
    document.getElementById('g2-tutorial').style.display = 'flex'; 
}

function initGame2() { 
    document.getElementById('g2-tutorial').style.display = 'none'; 
}

function loadPuzzle() {
    document.getElementById('level-text').innerText = level; 
    const board = document.getElementById('puzzle-board'); 
    board.innerHTML = '';
    
    let idx = [0,1,2,3,4,5,6,7,8];
    // Acak posisi awal
    let shuffled = [...idx].sort(function() { return Math.random() - 0.5; });
    
    shuffled.forEach(function(i) {
        let div = document.createElement('div'); 
        div.className = 'piece'; 
        div.style.backgroundImage = 'url(' + images[level-1] + ')'; 
        div.style.backgroundPosition = ((i%3)*-100) + 'px ' + (Math.floor(i/3)*-100) + 'px';
        div.dataset.correctIndex = i; // Menyimpan ID asli kotak agar bisa dicek kebenarannya
        
        div.onclick = function() {
            if(!selected) { 
                selected = div; div.classList.add('selected'); 
            } else {
                // Tukar gambar
                let tempBg = selected.style.backgroundPosition; 
                selected.style.backgroundPosition = div.style.backgroundPosition; 
                div.style.backgroundPosition = tempBg;
                
                // Tukar ID
                let tempIdx = selected.dataset.correctIndex;
                selected.dataset.correctIndex = div.dataset.correctIndex;
                div.dataset.correctIndex = tempIdx;
                
                selected.classList.remove('selected'); 
                selected = null; 
                
                // PENGECEKAN WIN: Harus 100% pas
                let allPieces = document.querySelectorAll('#puzzle-board .piece');
                let isWin = true;
                allPieces.forEach(function(p, pIdx) {
                    if (parseInt(p.dataset.correctIndex) !== pIdx) {
                        isWin = false; // Kalau ada 1 saja yang salah posisi, belum menang
                    }
                });
                
                if(isWin) { 
                    setTimeout(function() { 
                        document.getElementById('level-up-title').innerText = "Level " + level + " Selesai! 🎉"; 
                        document.getElementById('level-up-modal').style.display = 'flex'; 
                    }, 300); 
                }
            }
        }; 
        board.appendChild(div);
    });
}

window.proceedNextLevel = function() {
    document.getElementById('level-up-modal').style.display = 'none'; 
    level++;
    if (level > 3) { switchScreen('game2-screen', 'chat-screen'); } 
    else { loadPuzzle(); }
}

// =======================================================
// CHAT & VN ALUR MINIGAME (PERBAIKAN MENJADI REAL RECORD)
// =======================================================
const chatBox = document.getElementById('chat-body');
const inputStatus = document.getElementById('input-status');
const btnMic = document.getElementById('btn-mic'); 
const previewControls = document.getElementById('preview-controls');
const btnTrash = document.getElementById('btn-trash');
const btnPlayPreview = document.getElementById('btn-play-preview');
const btnSend = document.getElementById('btn-send');
const iconPlay = document.getElementById('icon-play');
const btnNextChat = document.getElementById('btn-next-chat');

let isActionRunning = false; 
let vnStep = 1; // 1: VN Muach, 2: VN Doa

let mediaRecorder = null; let audioChunks = []; let audioUrl = ""; 
let isRecording = false; let recordInterval; let recordSeconds = 0; let currentPreviewAudio = null;

function enterChatRoom() {
    if (isActionRunning) return;
    isActionRunning = true;
    
    playMusic(0.3); 
    document.getElementById('chat-intro').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    
    setTimeout(function() {
        addMsg('in', 'text', 'Muach dulu dong sebelum lanjut... 😘'); 
        
        setTimeout(function() {
            inputStatus.innerText = "Ketuk mic untuk kirim VN Muach...";
            btnMic.style.display = 'flex';
            vnStep = 1;
            isActionRunning = false; 
        }, 1000);
    }, 1000);
}

function addMsg(side, type, content) {
    const div = document.createElement('div'); 
    div.className = "msg msg-" + side;
    
    if (type === 'text') div.innerText = content;
    else if (type === 'audio') div.innerHTML = '<audio controls src="' + content + '"></audio>';
    
    chatBox.appendChild(div); 
    chatBox.scrollTop = chatBox.scrollHeight;
}

// DOI KLIK MIC (Berlaku untuk VN Muach & VN Doa)
if (btnMic) {
    btnMic.addEventListener('click', async function() {
        if (isActionRunning) return; 

        if (!isRecording) {
            // Jika Mic ditolak browser
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                isRecording = true; playMusic(0.1); btnMic.classList.add('recording');
                btnMic.innerHTML = '<i class="fas fa-stop"></i>'; inputStatus.innerText = "Merekam (Simulasi)... 0s";
                recordSeconds = 0; recordInterval = setInterval(function() { recordSeconds++; inputStatus.innerText = "Merekam (Simulasi)... " + recordSeconds + "s"; }, 1000); return; 
            }
            try {
                // Real Recording seperti di halaman awal
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream); audioChunks = [];
                mediaRecorder.ondataavailable = function(e) { audioChunks.push(e.data); };
                mediaRecorder.onstop = function() {
                    const blob = new Blob(audioChunks, { type: 'audio/mp3' });
                    audioUrl = URL.createObjectURL(blob);
                    currentPreviewAudio = new Audio(audioUrl);
                    currentPreviewAudio.onended = function() { iconPlay.className = "fas fa-play"; };
                };
                mediaRecorder.start(); isRecording = true; playMusic(0.1);
                btnMic.classList.add('recording'); btnMic.innerHTML = '<i class="fas fa-stop"></i>'; 
                inputStatus.innerText = "Merekam... 0s"; recordSeconds = 0;
                recordInterval = setInterval(function() { recordSeconds++; inputStatus.innerText = "Merekam... " + recordSeconds + "s"; }, 1000);
            } catch (err) { 
                isRecording = true; playMusic(0.1); btnMic.classList.add('recording');
                btnMic.innerHTML = '<i class="fas fa-stop"></i>'; inputStatus.innerText = "Merekam (Simulasi)... 0s";
                recordSeconds = 0; recordInterval = setInterval(function() { recordSeconds++; inputStatus.innerText = "Merekam (Simulasi)... " + recordSeconds + "s"; }, 1000);
            }
        } else {
            // Berhenti Rekam dan Buka Mode Preview
            if (mediaRecorder && mediaRecorder.state === "recording") { mediaRecorder.stop(); }
            isRecording = false; clearInterval(recordInterval); playMusic(0.3);
            btnMic.classList.remove('recording'); btnMic.innerHTML = '<i class="fas fa-microphone"></i>';
            btnMic.style.display = 'none'; previewControls.style.display = 'flex';
            inputStatus.innerText = "Kirim VN kamu (" + recordSeconds + "s):";
        }
    });
}

// PLAY PREVIEW
if (btnPlayPreview) {
    btnPlayPreview.addEventListener('click', function() {
        if (currentPreviewAudio) {
            if (currentPreviewAudio.paused) { playMusic(0.1); currentPreviewAudio.play(); iconPlay.className = "fas fa-pause"; } 
            else { currentPreviewAudio.pause(); playMusic(0.3); iconPlay.className = "fas fa-play"; }
        }
    });
}

// TONG SAMPAH
if (btnTrash) {
    btnTrash.addEventListener('click', function() {
        if(currentPreviewAudio) { currentPreviewAudio.pause(); currentPreviewAudio = null; }
        playMusic(0.3); previewControls.style.display = 'none'; btnMic.style.display = 'flex';
        inputStatus.innerText = "Ketuk mic untuk rekam ulang..."; iconPlay.className = "fas fa-play";
    });
}

// KIRIM VN
if (btnSend) {
    btnSend.addEventListener('click', function() {
        if (currentPreviewAudio) { currentPreviewAudio.pause(); } playMusic(0.3);
        
        let sentUrl = audioUrl;
        if (!audioUrl) {
            // Base64 Kosong jika Mic ditolak tapi maksa kirim
            sentUrl = "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
        }
        addMsg('out', 'audio', sentUrl); 
        
        previewControls.style.display = 'none'; 
        inputStatus.innerText = "Pesan terkirim!";
        
        // PENGATURAN ALUR BERDASARKAN STEP
        if (vnStep === 1) { // Kirim Muach
            isActionRunning = true;
            setTimeout(function() {
                inputStatus.innerText = "my bubub sedang mengetik...";
                setTimeout(function() {
                    addMsg('in', 'audio', 'vn_hbd.mp3'); 
                    setTimeout(function() {
                        addMsg('in', 'text', 'Apa harapan dan doa kamu untuk tahun-tahun kedepannya? ❤️'); 
                        inputStatus.innerText = "Ketuk mic untuk rekam doa...";
                        btnMic.style.display = 'flex'; // Munculkan kembali tombol mic
                        vnStep = 2; // Naik ke step 2
                        isActionRunning = false; 
                    }, 2500);
                }, 2000);
            }, 1000);
            
        } else if (vnStep === 2) { // Kirim Doa
            isActionRunning = true;
            setTimeout(function() {
                addMsg('in', 'text', 'Aamiin paling serius... 🤲❤️'); 
                setTimeout(function() {
                    addMsg('in', 'text', 'Aku ada hadiah nih buat kamu 🎁');
                    btnNextChat.style.display = 'flex'; 
                    inputStatus.innerText = "Lanjut Buka Kado? 👉";
                    isActionRunning = false;
                }, 1500);
            }, 1000);
        }
    });
}

// TOMBOL LANJUT BUKA KADO
if (btnNextChat) {
    btnNextChat.addEventListener('click', function() {
        if (isActionRunning) return;
        isActionRunning = true;
        btnNextChat.style.display = 'none'; 
        inputStatus.innerText = "Membuka kado...";
        setTimeout(function() { 
            switchScreen('chat-screen', 'gift-screen'); 
            isActionRunning = false;
        }, 1000);
    });
}

// =======================================================
// KADO & VIDEO
// =======================================================
const videoEl = document.getElementById('vid-kenangan');

function openGift() {
    const giftBox = document.querySelector('.gift-box'); 
    const giftText = document.getElementById('gift-text-hint');
    
    giftBox.classList.add('open'); 
    giftText.classList.add('hidden');
    
    if(bgMusic) bgMusic.pause(); 
    createEmojiExplosion(giftBox);
    
    setTimeout(function() { 
        giftBox.parentElement.style.display = 'none'; 
        document.getElementById('video-area').style.display = 'block'; 
        videoEl.play(); 
    }, 1500); 
}

videoEl.addEventListener('play', function() { if(bgMusic) bgMusic.pause(); });
videoEl.addEventListener('ended', function() { finishVideo(); });

function createEmojiExplosion(container) {
    const emojis = ['🌸', '🌺', '💖', '❤️', '✨', '🌼'];
    for (let i = 0; i < 40; i++) { 
        const confetti = document.createElement('div'); 
        confetti.className = 'confetti'; 
        confetti.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        confetti.style.left = '50%'; 
        confetti.style.top = '50%';
        
        const angle = Math.random() * Math.PI * 2; 
        const velocity = 150 + Math.random() * 200; 
        const tx = Math.cos(angle) * velocity; 
        const ty = Math.sin(angle) * velocity - 150; 
        
        confetti.animate([ 
            { transform: 'translate(0, 0) scale(0.2) rotate(0deg)', opacity: 1 }, 
            { transform: 'translate('+tx+'px, '+ty+'px) scale(1.5) rotate('+(Math.random() * 360)+'deg)', opacity: 0 } 
        ], { duration: 1500 + Math.random() * 1000, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' });
        
        container.parentElement.appendChild(confetti); 
        setTimeout(function() { confetti.remove(); }, 2500);
    }
}

function finishVideo() { 
    videoEl.pause(); 
    playMusic(0.3); 
    switchScreen('gift-screen', 'outro-screen'); 
}

function kirimWA() { 
    let txt = document.getElementById('pesan-wa').value; 
    // GANTI NOMOR WA KAMU DI SINI
    window.location.href = "https://wa.me/6285150709480?text=" + encodeURIComponent(txt); 
}