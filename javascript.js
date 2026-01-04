// --- CONFIGURAÇÕES GERAIS ---
const statusTxt = document.getElementById('status-txt');
let timerAtivo = null;

// Função para carregar vozes de forma segura
function getFeminineVoice() {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => 
        v.lang.includes('pt') && 
        (v.name.includes('Maria') || v.name.includes('Google') || v.name.includes('Heloisa'))
    ) || voices.find(v => v.lang.includes('pt'));
}

function speak(t) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    
    const voz = getFeminineVoice();
    if (voz) u.voice = voz;

    u.lang = 'pt-BR';
    u.rate = 1.1;
    u.pitch = 1.1; 
    window.speechSynthesis.speak(u);
}

// Carregamento preventivo de vozes
window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();

function setTheme(color, coreBg) {
    document.querySelectorAll('.ring, .bar, .info-panel').forEach(el => {
        el.style.borderColor = color;
        el.style.color = color;
        el.style.boxShadow = `0 0 15px ${color}`;
    });
    const core = document.getElementById('main-core');
    if(core) core.style.background = coreBg;
}

function startListening() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!Speech) {
        alert("ERRO: Seu navegador não suporta voz!");
        return;
    }

    const rec = new Speech();
    rec.lang = 'pt-BR'; 
    rec.continuous = true;
    rec.interimResults = false;

    rec.onstart = () => {
        console.log(">>> MICROFONE ATIVO");
        statusTxt.innerText = "OUVINDO...";
    };

    rec.onerror = (event) => {
        console.error("ERRO NO MICROFONE:", event.error);
        if(event.error === 'not-allowed') {
            alert("ERRO: Microfone bloqueado! Clique no CADEADO na barra de endereços e PERMITA o microfone.");
        }
    };

    rec.onresult = (e) => {
        const msg = e.results[e.results.length-1][0].transcript.toLowerCase().trim();
        console.log("Diana OUVIU: ", msg);

        if (msg.includes("Diana")) {
            statusTxt.style.color = "yellow";
            statusTxt.innerText = "PROCESSANDO...";

            // 1. PARAR
            if (msg.includes("parar") || msg.includes("cancelar") || msg.includes("abortar")) {
                speak("Protocolos interrompidos.");
                if (timerAtivo) { clearInterval(timerAtivo); timerAtivo = null; }
                document.body.classList.remove('modo-intruso', 'intruso-ativa');
                document.querySelectorAll('.ring').forEach(el => el.style.opacity = '1');
                setTheme("#00c8ff", "radial-gradient(circle, #00c8ff 0%, #003264 100%)");
            }
            // 2. COMBATE
            else if (msg.includes("combate")) {
                speak("Modo de combate ativo.");
                setTheme("#ff0000", "radial-gradient(circle, #ff0000 0%, #330000 100%)");
            } 
            // 3. INTRUSO
            else if (msg.includes("intruso") || msg.includes("ameaça")) {
                speak("Protocolo de segurança ativado.");
                document.body.classList.add('modo-intruso');
                setTheme("#ff0000", "#ff0000");
            }
            // 4. ESTUDO
            else if (msg.includes("modo de estudo") || msg.includes("foco")) {
                speak("Modo de estudo iniciado.");
                document.querySelectorAll('.outer, .middle').forEach(el => el.style.opacity = '0.1');
                let tempo = 25 * 60;
                if(timerAtivo) clearInterval(timerAtivo);
                timerAtivo = setInterval(() => {
                    let min = Math.floor(tempo / 60);
                    let seg = tempo % 60;
                    statusTxt.innerText = `FOCO: ${min}:${seg < 10 ? '0'+seg : seg}`;
                    if (tempo-- <= 0) {
                        clearInterval(timerAtivo);
                        speak("Tempo concluído.");
                        document.querySelectorAll('.outer, .middle').forEach(el => el.style.opacity = '1');
                    }
                }, 1000);
            }
            // 5. MÚSICA
            else if (msg.includes("tocar música")) {
                speak("Iniciando música.");
                window.open('https://www.youtube.com/watch?v=jfKfPfyJRdk', '_blank');
            }
            // 6. PESQUISA
            else if (msg.includes("pesquise sobre") || msg.includes("o que é")) {
                let busca = msg.replace("apolo", "").replace("pesquise sobre", "").replace("o que é", "").trim();
                speak("Pesquisando dados.");
                window.open(`https://www.google.com/search?q=${busca}`, '_blank');
            }
            // PADRÃO
            else {
                speak("Sim, senhora. Diana online.");
            }
            
            setTimeout(() => {
                statusTxt.style.color = "#00c8ff";
                if(!msg.includes("estudo")) statusTxt.innerText = "ONLINE";
            }, 2000);
        }
    };

    rec.onend = () => rec.start();
    rec.start();
}

// Vinculação do botão - Certifique-se que o ID no HTML é 'init-btn'
const btnIniciar = document.getElementById('init-btn');
if(btnIniciar) {
    btnIniciar.onclick = function() {
        const overlay = document.getElementById('start-screen');
        if(overlay) overlay.style.display = 'none';
        statusTxt.innerText = "INICIALIZANDO...";
        speak("Sistemas ativos. Diana online.");
        startListening();
    };
} else {
    console.error("Botão 'init-btn' não encontrado no HTML!");
}