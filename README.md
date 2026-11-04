
# ConectaChat

Aplicação de chat em tempo real desenvolvida com Node.js, JavaScript e WebSocket.

O ConectaChat permite que vários usuários conversem simultaneamente por meio de uma interface simples, utilizando nicknames personalizados.

## Funcionalidades

- Comunicação em tempo real com WebSocket.
- Escolha obrigatória de nickname.
- Validação de nicknames no servidor.
- Bloqueio de nicknames duplicados.
- Envio de mensagens para todos os participantes conectados.
- Notificações de entrada e saída de usuários.
- Identificação visual das mensagens enviadas e recebidas.
- Interface responsiva.
- Rolagem automática das mensagens.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Biblioteca ws


## Arquitetura e funcionamento

O ConectaChat utiliza uma arquitetura cliente-servidor, com comunicação em tempo real por meio do protocolo WebSocket.

### Backend

O servidor foi desenvolvido em Node.js, utilizando a biblioteca `ws` para gerenciar conexões WebSocket.

Principais responsabilidades:

- Gerenciar conexões dos participantes.
- Validar nicknames e impedir duplicidades.
- Receber e validar mensagens em formato JSON.
- Distribuir mensagens entre os participantes conectados.
- Notificar entradas e desconexões.

### Frontend

A interface foi desenvolvida com HTML, CSS e JavaScript.

Principais responsabilidades:

- Permitir a identificação do usuário.
- Estabelecer comunicação WebSocket com o servidor.
- Enviar e exibir mensagens em tempo real.
- Exibir notificações de entrada e saída.
- Atualizar dinamicamente a interface do chat.

### Fluxo de comunicação

1. O usuário acessa a aplicação pelo navegador.
2. O frontend estabelece uma conexão WebSocket.
3. O usuário informa um nickname.
4. O backend valida e registra o participante.
5. As mensagens são enviadas ao servidor.
6. O servidor distribui as mensagens aos participantes conectados.


## Estrutura do projeto

```text
conectachat/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Como executar

### Pré-requisitos

Ter o Node.js e o npm instalados.

### Instalação

Clone o repositório:

```bash
git clone https://github.com/devAdemarNeto/ConectaChat.git
```

Acesse a pasta:

```bash
cd conectachat
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm start
```

Abra no navegador:

http://localhost:3000

## Como utilizar

1. Acesse o ConectaChat pelo navegador.
2. Escolha um nickname disponível.
3. Clique em "Entrar no chat".
4. Envie mensagens em tempo real.
5. Abra outras abas para simular diferentes participantes.

## Regras de nickname

- O nickname é obrigatório.
- Deve conter entre 3 e 20 caracteres.
- São permitidas letras, números e underline (_).
- Não são permitidos nicknames duplicados.
- O nickname fica disponível novamente após a desconexão.

## Sobre o projeto

Projeto desenvolvido como atividade prática de aprendizagem sobre comunicação em tempo real utilizando WebSocket, durante os estudos na Alpha EdTech.

O objetivo foi aplicar conceitos de comunicação cliente-servidor, eventos, validação de dados e desenvolvimento Web Full Stack.

## Autor

Ademar Neto
```
