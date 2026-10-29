
const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

// SERVIDOR HTTP
const servidor = http.createServer((req, res) => {
    console.log("Método:", req.method);
    console.log("URL:", req.url);

    // ROTA 1 - Página HTML
    if (req.method === "GET" && req.url === "/") {
        const caminhoHTML = path.join(__dirname, "public", "index.html");

        fs.readFile(caminhoHTML, (erro, conteudo) => {
            if (erro) {
                console.error("Erro ao ler HTML:", erro);

                res.writeHead(500, {
                    "Content-Type": "text/plain; charset=utf-8"
                });

                res.end("Erro interno do servidor.");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            });

            res.end(conteudo);
        });

    // ROTA 2 - Arquivo CSS
    } else if (req.method === "GET" && req.url === "/style.css") {
        const caminhoCSS = path.join(__dirname, "public", "style.css");

        fs.readFile(caminhoCSS, (erro, conteudo) => {
            if (erro) {
                console.error("Erro ao ler CSS:", erro);

                res.writeHead(500, {
                    "Content-Type": "text/plain; charset=utf-8"
                });

                res.end("Erro interno do servidor.");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/css; charset=utf-8"
            });

            res.end(conteudo);
        });

    // ROTA 3 - Arquivo JavaScript
    } else if (req.method === "GET" && req.url === "/script.js") {
        const caminhoJS = path.join(__dirname, "public", "script.js");

        fs.readFile(caminhoJS, (erro, conteudo) => {
            if (erro) {
                console.error("Erro ao ler JavaScript:", erro);

                res.writeHead(500, {
                    "Content-Type": "text/plain; charset=utf-8"
                });

                res.end("Erro interno do servidor.");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/javascript; charset=utf-8"
            });

            res.end(conteudo);
        });

    // ROTA 4 - Página não encontrada
    } else {
        res.writeHead(404, {
            "Content-Type": "text/plain; charset=utf-8"
        });

        res.end("Página não encontrada!");
    }
});

// SERVIDOR WEBSOCKET
const wss = new WebSocket.Server({
    server: servidor
});

// Envia um objeto como JSON
function enviarJSON(socket, dados) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(dados));
    }
}

// Envia mensagens aos participantes identificados
function transmitir(dados, excluirSocket = null) {
    wss.clients.forEach((cliente) => {
        if (
            cliente !== excluirSocket &&
            cliente.identificado &&
            cliente.readyState === WebSocket.OPEN
        ) {
            enviarJSON(cliente, dados);
        }
    });
}

// Verifica se o nickname já está em uso
function nicknameEmUso(nickname) {
    for (const cliente of wss.clients) {
        if (
            cliente.identificado &&
            cliente.readyState === WebSocket.OPEN &&
            cliente.username.toLowerCase() === nickname.toLowerCase()
        ) {
            return true;
        }
    }

    return false;
}

// EVENTO DE CONEXÃO
wss.on("connection", (socket) => {

    // Cliente começa sem identificação
    socket.identificado = false;
    socket.username = null;

    console.log("Novo cliente WebSocket conectado.");

    // EVENTO DE MENSAGEM
    socket.on("message", (mensagem, isBinary) => {

        // Aceitamos apenas mensagens de texto
        if (isBinary) {
            return;
        }

        let dados;

        // Converte JSON recebido em objeto
        try {
            dados = JSON.parse(mensagem.toString());
        } catch (erro) {
            enviarJSON(socket, {
                type: "error",
                message: "Formato de mensagem inválido."
            });
            return;
        }

        if (
            dados === null ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            enviarJSON(socket, {
                type: "error",
                message: "Dados inválidos."
            });
            return;
        }

        // REGISTRO DO NICKNAME
        if (dados.type === "register") {

            // Impede registrar novamente o mesmo socket
            if (socket.identificado) {
                enviarJSON(socket, {
                    type: "register_error",
                    message: "Você já está identificado."
                });
                return;
            }

            if (typeof dados.nickname !== "string") {
                enviarJSON(socket, {
                    type: "register_error",
                    message: "Informe um nickname válido."
                });
                return;
            }

            const nickname = dados.nickname.trim();

            // Validação de tamanho
            if (nickname.length < 3 || nickname.length > 20) {
                enviarJSON(socket, {
                    type: "register_error",
                    message: "O nickname deve ter entre 3 e 20 caracteres."
                });
                return;
            }

            // Validação dos caracteres permitidos
            if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
                enviarJSON(socket, {
                    type: "register_error",
                    message: "Use apenas letras, números e underline (_)."
                });
                return;
            }

            // Verifica duplicidade
            if (nicknameEmUso(nickname)) {
                enviarJSON(socket, {
                    type: "register_error",
                    message: "Este nickname já está em uso."
                });
                return;
            }

            // Registra o nickname aprovado
            socket.username = nickname;
            socket.identificado = true;

            console.log("Usuário identificado:", nickname);

            // Confirma o registro ao próprio usuário
            enviarJSON(socket, {
                type: "register_success",
                nickname: nickname
            });

            // Avisa os outros participantes
            transmitir({
                type: "system",
                message: `${nickname} entrou`
            }, socket);

            return;
        }

        // MENSAGENS DO CHAT
        if (dados.type === "chat") {

            // Impede mensagens sem identificação
            if (!socket.identificado) {
                enviarJSON(socket, {
                    type: "error",
                    message: "Escolha um nickname antes de enviar mensagens."
                });
                return;
            }

            if (typeof dados.text !== "string") {
                return;
            }

            const texto = dados.text.trim();

            if (texto === "" || texto.length > 1000) {
                return;
            }

            console.log(`${socket.username}: ${texto}`);

            // Envia para todos, inclusive o remetente
            transmitir({
                type: "chat",
                nickname: socket.username,
                text: texto
            });

            return;
        }

        // Tipo de mensagem desconhecido
        enviarJSON(socket, {
            type: "error",
            message: "Tipo de mensagem não reconhecido."
        });
    });

    // EVENTO DE DESCONEXÃO
    socket.on("close", () => {

        if (!socket.identificado) {
            console.log("Cliente não identificado desconectou.");
            return;
        }

        console.log("Cliente desconectado:", socket.username);

        // Notifica os outros participantes
        transmitir({
            type: "system",
            message: `${socket.username} saiu`
        }, socket);
    });
});

// INICIALIZAÇÃO
servidor.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
