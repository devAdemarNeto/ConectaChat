
const socket = new WebSocket("ws://localhost:3000");

const formularioNickname = document.getElementById("nickname-form");
const campoNickname = document.getElementById("nickname-input");
const erroNickname = document.getElementById("nickname-error");

const telaLogin = document.getElementById("login-screen");
const telaChat = document.getElementById("chat-screen");

const formulario = document.getElementById("chat-form");
const campoMensagem = document.getElementById("message-input");
const botaoEnviar = document.getElementById("send-button");
const areaMensagens = document.getElementById("messages");

let usuarioIdentificado = false;
let meuNickname = "";

// Adiciona mensagens à interface
function adicionarMensagem(texto, tipo = "chat", nickname = "") {
    const mensagemInicial = document.getElementById("empty-message");

    if (mensagemInicial) {
        mensagemInicial.remove();
    }

    const elemento = document.createElement("div");

    if (tipo === "system") {
        elemento.classList.add("mensagem-sistema");
        elemento.textContent = texto;
    } else {
        elemento.classList.add("mensagem-chat");

        if (nickname === meuNickname) {
            elemento.classList.add("minha-mensagem");
        } else {
            elemento.classList.add("outra-mensagem");
        }

        const autor = document.createElement("strong");
        autor.textContent = nickname;

        const conteudo = document.createElement("p");
        conteudo.textContent = texto;

        elemento.appendChild(autor);
        elemento.appendChild(conteudo);
    }

    areaMensagens.appendChild(elemento);
    areaMensagens.scrollTop = areaMensagens.scrollHeight;
}

// Conexão estabelecida
socket.onopen = () => {
    console.log("Conexão WebSocket estabelecida!");
};

// Recebimento de dados
socket.onmessage = (event) => {
    let dados;

    try {
        dados = JSON.parse(event.data);
    } catch (erro) {
        console.error("JSON inválido:", erro);
        return;
    }

    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
        return;
    }

    // Nickname aprovado
    if (dados.type === "register_success") {
        usuarioIdentificado = true;
        meuNickname = dados.nickname;

        erroNickname.textContent = "";

        telaLogin.style.display = "none";
        telaChat.style.display = "block";

        campoMensagem.disabled = false;
        botaoEnviar.disabled = false;

        campoMensagem.focus();
        return;
    }

    // Nickname recusado
    if (dados.type === "register_error") {
        erroNickname.textContent = dados.message;
        return;
    }

    // Mensagens dos participantes
    if (dados.type === "chat" && usuarioIdentificado) {
        adicionarMensagem(dados.text, "chat", dados.nickname);
        return;
    }

    // Avisos de entrada e saída
    if (dados.type === "system" && usuarioIdentificado) {
        adicionarMensagem(dados.message, "system");
        return;
    }

    if (dados.type === "error") {
        console.error("Erro do servidor:", dados.message);
    }
};

// Conexão encerrada
socket.onclose = () => {
    usuarioIdentificado = false;
    campoMensagem.disabled = true;
    botaoEnviar.disabled = true;

    if (telaLogin.style.display !== "none") {
        erroNickname.textContent =
            "Conexão encerrada. Atualize a página para tentar novamente.";
    } else {
        adicionarMensagem("Conexão com o servidor encerrada.", "system");
    }
};

socket.onerror = (erro) => {
    console.error("Erro no WebSocket:", erro);
};

// Registro de nickname
formularioNickname.addEventListener("submit", (event) => {
    event.preventDefault();

    const nickname = campoNickname.value.trim();

    if (nickname.length < 3 || nickname.length > 20) {
        erroNickname.textContent =
            "O nickname deve ter entre 3 e 20 caracteres.";
        return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
        erroNickname.textContent =
            "Use apenas letras, números e underline (_).";
        return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
        erroNickname.textContent =
            "Não foi possível conectar ao servidor.";
        return;
    }

    erroNickname.textContent = "";

    socket.send(JSON.stringify({
        type: "register",
        nickname: nickname
    }));
});

// Envio de mensagens
formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!usuarioIdentificado) {
        return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
        return;
    }

    const mensagem = campoMensagem.value.trim();

    if (mensagem === "" || mensagem.length > 1000) {
        return;
    }

    socket.send(JSON.stringify({
        type: "chat",
        text: mensagem
    }));

    campoMensagem.value = "";
    campoMensagem.focus();
});
