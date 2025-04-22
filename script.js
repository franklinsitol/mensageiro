document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    
    // Carrega as mensagens do arquivo JSON
    fetch('mensagens/franklin_amanda.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Arquivo de mensagens não encontrado');
            }
            return response.json();
        })
        .then(data => {
            displayMessages(data.messages);
        })
        .catch(error => {
            console.error('Erro ao carregar mensagens:', error);
            chatMessages.innerHTML = '<div class="error-message">Não foi possível carregar as mensagens. Tente novamente mais tarde.</div>';
        });

    function displayMessages(messages) {
        // Filtra mensagens com menos de 24 horas
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        const recentMessages = messages.filter(message => {
            const messageDate = new Date(message.timestamp);
            return messageDate > twentyFourHoursAgo;
        });

        if (recentMessages.length === 0) {
            chatMessages.innerHTML = '<div class="info-message">Nenhuma mensagem recente. As mensagens são apagadas após 24 horas.</div>';
            return;
        }

        chatMessages.innerHTML = '';
        
        recentMessages.forEach(message => {
            const messageElement = createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });
        
        // Rolagem para a última mensagem
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(message.sender === 'Franklin' ? 'sent' : 'received');
        
        const senderSpan = document.createElement('div');
        senderSpan.classList.add('sender');
        senderSpan.textContent = message.sender;
        
        const textDiv = document.createElement('div');
        textDiv.classList.add('text');
        textDiv.textContent = message.text;
        
        const timestampDiv = document.createElement('div');
        timestampDiv.classList.add('timestamp');
        timestampDiv.textContent = formatTimestamp(message.timestamp);
        
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(timestampDiv);
        
        return messageDiv;
    }

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
               ' · ' + 
               date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
});
