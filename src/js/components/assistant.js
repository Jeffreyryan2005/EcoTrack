/**
 * @module assistant
 * @description Groq-powered AI Assistant
 */

const API_URL = '/api/chat';

export function renderAssistantModal(modalContent, overlay) {
  // Setup HTML for Chat UI
  modalContent.innerHTML = `
    <div class="assistant-chat-container">
      <div class="assistant-header">
        <h2>✨ Smart EcoAssistant</h2>
        <p>Powered by Groq Llama 3</p>
      </div>
      <div class="assistant-messages" id="assistant-messages" role="log" aria-live="polite">
        <div class="message assistant-msg">
          <div class="msg-bubble">Hello! I am your AI EcoAssistant. I've analyzed your carbon footprint. How can I help you reduce your emissions today?</div>
        </div>
      </div>
      <form class="assistant-input-area" id="assistant-form">
        <input type="text" id="assistant-input" placeholder="Ask about your carbon footprint..." required autocomplete="off" aria-label="Message AI Assistant">
        <button type="submit" class="btn btn-primary" aria-label="Send Message">Send</button>
      </form>
    </div>
  `;

  // Apply Inline Styles to GUARANTEE Bottom Right Corner Positioning
  overlay.style.alignItems = 'flex-end';
  overlay.style.justifyContent = 'flex-end';
  overlay.style.padding = '2rem';
  
  const modal = modalContent.parentElement;
  if (modal) {
    modal.style.margin = '0';
    modal.style.width = '400px';
    modal.style.maxWidth = '100%';
    modal.style.maxHeight = 'calc(100vh - 100px)';
  }

  // Show Modal
  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');

  const form = document.getElementById('assistant-form');
  const input = document.getElementById('assistant-input');
  const messagesContainer = document.getElementById('assistant-messages');

  // Fetch context
  const storage = JSON.parse(localStorage.getItem('ecotrack_data') || 'null');
  let userContext = "No footprint calculated yet.";
  if (storage && storage.value) {
    const data = storage.value;
    userContext = `User's Data: Transport Daily=${data.transport?.dailyDistance}km, MeatDiet=${data.food?.beef} meals, Renewable Energy=${data.energy?.renewablePercent}%`;
  }

  // Messages History
  const messages = [
    { role: 'system', content: `You are EcoAssistant, an expert sustainability advisor for the EcoTrack app. Keep answers under 100 words, practical, and friendly. Context: ${userContext}` }
  ];

  const appendMessage = (role, text) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role === 'user' ? 'user-msg' : 'assistant-msg'}`;
    msgDiv.innerHTML = `<div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    // Add user msg
    appendMessage('user', userText);
    messages.push({ role: 'user', content: userText });
    input.value = '';

    // Show loading
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant-msg loading-msg';
    loadingDiv.innerHTML = '<div class="msg-bubble">Thinking...</div>';
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: messages,
          temperature: 0.7,
          max_tokens: 256
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch from server API');
      }

      const aiReply = data.choices[0].message.content;

      // Remove loading
      loadingDiv.remove();

      // Add AI reply
      appendMessage('assistant', aiReply);
      messages.push({ role: 'assistant', content: aiReply });

    } catch (err) {
      console.error(err);
      loadingDiv.remove();
      appendMessage('assistant', err.message || "Sorry, I'm having trouble connecting right now.");
    }
  });

  // Focus input
  setTimeout(() => input.focus(), 100);
}
