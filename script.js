document.addEventListener('DOMContentLoaded', function() {
    
    const greetings = [
        "Halooo...", 
        "Selamat datang sayangg ❤️", 
        "Aku ada sedikit hadiah kejutan buat kamu 🎁", 
        "Bacanya pelan-pelan ya...", 
        "Semoga kamu suka sama apa yang aku buat ini", 
        "Hmm...", 
        "Kira-kira apa ya isinya?"
    ];
    let msgIndex = 0; 
    let noClickCount = 0;
    
    let mediaRecorder = null; let audioChunks = []; let audioUrl = ""; 
    let isRecording = false; let recordInterval; let recordSeconds = 0; let currentPreviewAudio = null;

    // ELEMEN HTML
    const messageEl = document.getElementById('message');
    const textArea = document.getElementById('text-area');
    const interactionArea = document.getElementById('interaction-area');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const popup = document.getElementById('popup');
    const btnClosePopup = document.getElementById('btn-close-popup');
    
    const contentContainer = document.getElementById('content-container');
    const poemPanel = document.getElementById('poem-panel'); 
    const flowerScene = document.getElementById('flower-scene');
    
    const bgMusic = document.getElementById('bg-music');
    
    const chatOverlay = document.getElementById('panel-chat-final'); 
    const chatBox = document.getElementById('chat-body');
    const btnMic = document.getElementById('btn-mic');
    const inputStatus = document.getElementById('input-status');
    const previewControls = document.getElementById('preview-controls');
    const btnPlayPreview = document.getElementById('btn-play-preview');
    const btnTrash = document.getElementById('btn-trash');
    const btnSend = document.getElementById('btn-send');
    const iconPlay = document.getElementById('icon-play');
    
    // VARIABEL TOMBOL LANJUT
    const btnNextIndex = document.getElementById('btn-next-index');

    function playBackgroundMusic(volumeLevel) {
        if (bgMusic) {
            bgMusic.volume = volumeLevel;
            if (bgMusic.paused) { bgMusic.play().catch(function(e){}); }
        }
    }

    // FASE 1
    if (textArea) {
        textArea.addEventListener('click', function() {
            playBackgroundMusic(0.3); 
            messageEl.classList.add('text-hidden');
            setTimeout(function() {
                if (msgIndex < greetings.length) {
                    messageEl.innerText = greetings[msgIndex];
                    messageEl.classList.remove('text-hidden'); 
                    msgIndex++;
                } else {
                    textArea.style.display = 'none';
                    interactionArea.style.display = 'block';
                    interactionArea.style.animation = 'popIn 0.5s ease';
                }
            }, 500);
        });
    }

    if (btnNo) {
        btnNo.addEventListener('click', function() {
            playBackgroundMusic(0.3);
            noClickCount++;
            if (noClickCount >= 10) { popup.style.display = 'flex'; return; }
            btnNo.style.transform = "translate(" + (Math.random() * 100 - 50) + "px, " + (Math.random() * 100 - 50) + "px)";
        });
    }
    if (btnClosePopup) { btnClosePopup.addEventListener('click', function() { popup.style.display = 'none'; noClickCount = 0; btnNo.style.transform = 'translate(0,0)'; }); }

    // FASE 2
    if (btnYes) {
        btnYes.addEventListener('click', function() {
            playBackgroundMusic(0.3);
            contentContainer.style.opacity = '0'; 
            
            setTimeout(function() {
                contentContainer.style.display = 'none';
                if (poemPanel) {
                    poemPanel.style.display = 'flex';
                    setTimeout(function() { poemPanel.classList.add('show'); }, 50);
                    setTimeout(function() {
                        poemPanel.classList.remove('show'); 
                        setTimeout(function() {
                            poemPanel.style.display = 'none';
                            flowerScene.style.display = 'flex';
                            setTimeout(function() {
                                flowerScene.classList.remove("not-loaded");
                                setTimeout(function() {
                                    startChatSequence();
                                }, 5000);
                            }, 100);
                        }, 1500); 
                    }, 12000); 
                }
            }, 1000);
        });
    }

    // FASE 3
    function startChatSequence() {
        if (!chatOverlay) return; 
        flowerScene.style.display = 'none';
        chatOverlay.style.display = 'flex'; 
        
        setTimeout(function() {
            addMessage('in', 'audio', 'audio1.mp3'); 
            setTimeout(function() {
                inputStatus.innerText = "Ketuk mic untuk balas...";
                btnMic.style.display = 'flex';
            }, 1000);
        }, 1000);
    }

    function addMessage(side, type, content) {
        if (!chatBox) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = "msg msg-" + side;
        if (type === 'audio') {
            msgDiv.innerHTML = '<audio controls><source src="' + content + '" type="audio/mpeg"></audio>';
        } else if (type === 'vn-sent') {
             if (content === 'bypass') { msgDiv.innerHTML = '<audio controls src="data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"></audio>'; } 
             else { msgDiv.innerHTML = '<audio controls src="' + content + '"></audio>'; }
        }
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // DOI REKAM SUARA
    if (btnMic) {
        btnMic.addEventListener('click', async function() {
            if (!isRecording) {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    isRecording = true; playBackgroundMusic(0.1); btnMic.classList.add('recording');
                    btnMic.innerHTML = '<i class="fas fa-stop"></i>'; inputStatus.innerText = "Merekam (Simulasi)... 0s";
                    recordSeconds = 0; recordInterval = setInterval(function() { recordSeconds++; inputStatus.innerText = "Merekam (Simulasi)... " + recordSeconds + "s"; }, 1000); return; 
                }
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream); audioChunks = [];
                    mediaRecorder.ondataavailable = function(e) { audioChunks.push(e.data); };
                    mediaRecorder.onstop = function() {
                        const blob = new Blob(audioChunks, { type: 'audio/mp3' });
                        audioUrl = URL.createObjectURL(blob);
                        currentPreviewAudio = new Audio(audioUrl);
                        currentPreviewAudio.onended = function() { iconPlay.className = "fas fa-play"; };
                    };
                    mediaRecorder.start(); isRecording = true; playBackgroundMusic(0.1);
                    btnMic.classList.add('recording'); btnMic.innerHTML = '<i class="fas fa-stop"></i>'; 
                    inputStatus.innerText = "Merekam... 0s"; recordSeconds = 0;
                    recordInterval = setInterval(function() { recordSeconds++; inputStatus.innerText = "Merekam... " + recordSeconds + "s"; }, 1000);
                } catch (err) { 
                    isRecording = true; playBackgroundMusic(0.1); btnMic.classList.add('recording');
                    btnMic.innerHTML = '<i class="fas fa-stop"></i>'; inputStatus.innerText = "Merekam (Simulasi)... 0s";
                    recordSeconds = 0; recordInterval = setInterval(function() { recordSeconds++; inputStatus.innerText = "Merekam (Simulasi)... " + recordSeconds + "s"; }, 1000);
                }
            } else {
                if (mediaRecorder && mediaRecorder.state === "recording") { mediaRecorder.stop(); }
                isRecording = false; clearInterval(recordInterval); playBackgroundMusic(0.3);
                btnMic.classList.remove('recording'); btnMic.innerHTML = '<i class="fas fa-microphone"></i>';
                btnMic.style.display = 'none'; previewControls.style.display = 'flex';
                inputStatus.innerText = "Kirim VN kamu (" + recordSeconds + "s):";
            }
        });
    }

    if (btnPlayPreview) {
        btnPlayPreview.addEventListener('click', function() {
            if (currentPreviewAudio) {
                if (currentPreviewAudio.paused) { playBackgroundMusic(0.1); currentPreviewAudio.play(); iconPlay.className = "fas fa-pause"; } 
                else { currentPreviewAudio.pause(); playBackgroundMusic(0.3); iconPlay.className = "fas fa-play"; }
            }
        });
    }

    if (btnTrash) {
        btnTrash.addEventListener('click', function() {
            if(currentPreviewAudio) { currentPreviewAudio.pause(); currentPreviewAudio = null; }
            playBackgroundMusic(0.3); previewControls.style.display = 'none'; btnMic.style.display = 'flex';
            inputStatus.innerText = "Ketuk mic untuk balas..."; iconPlay.className = "fas fa-play";
        });
    }

    // PENGIRIMAN VN DAN MENAMPILKAN TOMBOL LANJUT
    if (btnSend) {
        btnSend.addEventListener('click', function() {
            if (currentPreviewAudio) { currentPreviewAudio.pause(); } playBackgroundMusic(0.3);
            
            addMessage('out', 'vn-sent', audioUrl || 'bypass'); 
            
            previewControls.style.display = 'none'; 
            inputStatus.innerText = "Pesan terkirim!";
            
            setTimeout(function() {
                inputStatus.innerText = "my bubub sedang mengetik...";
                setTimeout(function() {
                    addMessage('in', 'audio', 'audio2.mp3'); 
                    
                    // ==========================================
                    // PERINTAH PINDAH HALAMAN SUDAH DIHAPUS DARI SINI
                    // DIGANTI DENGAN MEMUNCULKAN TOMBOL LANJUT
                    // ==========================================
                    
                    inputStatus.innerText = "Dengarkan VN lalu ketuk lanjut 👉";
                    if (btnNextIndex) {
                        btnNextIndex.style.display = 'flex';
                    }
                }, 2000);
            }, 1000);
        });
    }

    // EVENT LISTENER HANYA UNTUK TOMBOL LANJUT
    if (btnNextIndex) {
        btnNextIndex.addEventListener('click', function() {
            btnNextIndex.style.display = 'none';
            inputStatus.innerText = "Membuka halaman game...";
            
            setTimeout(function() { 
                window.location.href = "minigame.html"; 
            }, 1500);
        });
    }
});