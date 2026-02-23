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
const catchItems = ['❤️', '🌸', '🎁', '🍰', '🧸', '💖']; 

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
// GAME 2: PUZZLE
// =======================================================
let level = 1, moves = 0, selected = null; 
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
    
    let idx = [0,1,2,3,4,5,6,7,8].sort(function() { return Math.random() - 0.5; });
    idx.forEach(function(i) {
        let div = document.createElement('div'); 
        div.className = 'piece'; 
        div.style.backgroundImage = 'url(' + images[level-1] + ')'; 
        div.style.backgroundPosition = ((i%3)*-100) + 'px ' + (Math.floor(i/3)*-100) + 'px';
        
        div.onclick = function() {
            if(!selected) { 
                selected = div; div.classList.add('selected'); 
            } else {
                let temp = selected.style.backgroundPosition; 
                selected.style.backgroundPosition = div.style.backgroundPosition; 
                div.style.backgroundPosition = temp;
                selected.classList.remove('selected'); 
                selected = null; 
                moves++;
                if(moves >= 3) { 
                    moves = 0; 
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
// CHAT & VN ALUR MINIGAME (ANTI SPAM & ANTI ALERT)
// =======================================================
const chatBox = document.getElementById('chat-body');
const inputStatus = document.getElementById('input-status');
const btnMic1 = document.getElementById('btn-mic-1'); 
const btnMic2 = document.getElementById('btn-mic-2'); 

let isActionRunning = false; // FLAG KUNCI ANTI SPAM

function enterChatRoom() {
    if (isActionRunning) return;
    isActionRunning = true;
    
    playMusic(0.3); 
    document.getElementById('chat-intro').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    
    setTimeout(function() {
        addMsg('in', 'text', 'Muach dulu dong sebelum lanjut... 😘'); // Halim (Kiri)
        
        setTimeout(function() {
            inputStatus.innerText = "Ketuk mic untuk kirim VN Muach...";
            btnMic1.style.display = 'flex';
            isActionRunning = false; // Buka kunci agar Doi bisa klik
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

// DOI KLIK MIC 1 (VN MUACH)
btnMic1.addEventListener('click', function() {
    if (isActionRunning) return; // Kalau sedang diproses, abaikan klik ekstra
    isActionRunning = true;

    btnMic1.classList.add('recording');
    inputStatus.innerText = "Merekam Muach...";
    
    setTimeout(function() {
        btnMic1.classList.remove('recording');
        btnMic1.style.display = 'none'; 
        
        addMsg('out', 'audio', 'vn_muach.mp3'); // Doi (Kanan) kirim
        
        setTimeout(function() {
            inputStatus.innerText = "my bubub sedang merekam...";
            
            setTimeout(function() {
                addMsg('in', 'audio', 'vn_hbd.mp3'); // Halim (Kiri) kirim
                
                setTimeout(function() {
                    addMsg('in', 'text', 'Apa harapan dan doa kamu untuk tahun-tahun kedepannya? ❤️'); 
                    
                    inputStatus.innerText = "Ketuk mic untuk rekam doa...";
                    btnMic2.style.display = 'flex';
                    isActionRunning = false; // Buka kunci lagi
                }, 2500);
            }, 2000);
        }, 1500);
    }, 1500); 
});

// DOI REKAM DOA ASLI (TANPA ALERT JIKA DITOLAK BROWSER)
let isRec = false, mediaRecorder, audioChunks;

btnMic2.addEventListener('click', async function() {
    if (!isRec) {
        // Fallback rahasia jika mic ditolak (HTTP lokal)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            isRec = true; 
            playMusic(0.1); 
            btnMic2.classList.add('recording'); 
            inputStatus.innerText = "Merekam (Simulasi)..."; 
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream); 
            audioChunks = [];
            
            mediaRecorder.ondataavailable = function(e) { audioChunks.push(e.data); };
            mediaRecorder.onstop = function() {
                const blob = new Blob(audioChunks, { type: 'audio/mp3' });
                const url = URL.createObjectURL(blob);
                
                addMsg('out', 'audio', url);  // Doi kirim hasil rekaman
                
                document.getElementById('btn-next-chat').style.display = 'flex'; 
                inputStatus.innerText = "Lanjut Buka Kado? 👉";
            };
            
            mediaRecorder.start(); 
            isRec = true; 
            btnMic2.classList.add('recording');
            inputStatus.innerText = "Merekam... (Ketuk lagi untuk stop)"; 
            playMusic(0.1);
        } catch (e) { 
            // Langsung simulasi tanpa alert agar mulus
            isRec = true; 
            playMusic(0.1); 
            btnMic2.classList.add('recording'); 
            inputStatus.innerText = "Merekam (Simulasi)..."; 
        }
    } else {
        if(mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
        
        isRec = false; 
        btnMic2.classList.remove('recording'); 
        playMusic(0.3);
        
        // Pura-pura kirim jika masuk mode simulasi
        if(!mediaRecorder) {
            addMsg('out', 'audio', 'vn_muach.mp3'); 
            document.getElementById('btn-next-chat').style.display = 'flex'; 
            inputStatus.innerText = "Lanjut Buka Kado? 👉";
        }
    }
});

// TOMBOL LANJUT
document.getElementById('btn-next-chat').addEventListener('click', function() {
    if (isActionRunning) return;
    isActionRunning = true;

    document.getElementById('btn-next-chat').style.display = 'none'; 
    btnMic2.style.display = 'none'; 
    inputStatus.innerText = "Menunggu balasan...";
    
    setTimeout(function() {
        addMsg('in', 'text', 'Aamiin paling serius... 🤲❤️'); // Halim balas
        
        setTimeout(function() {
            addMsg('in', 'text', 'Aku ada hadiah nih buat kamu 🎁');
            
            setTimeout(function() { 
                switchScreen('chat-screen', 'gift-screen'); 
                isActionRunning = false;
            }, 2000);
        }, 1500);
    }, 1000);
});

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
    window.location.href = "https://wa.me/6281234567890?text=" + encodeURIComponent(txt); 
}