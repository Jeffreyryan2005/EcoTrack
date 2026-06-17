/**
 * @module assistant
 * @description Groq-powered AI Chat Widget (bottom-right corner)
 */

const API_URL = '/api/chat';

let chatWidgetOpen = false;
let chatWidget = null;
let messagesHistory = null;

function createChatWidget() {
  // Don't recreate if already exists
  if (chatWidget) {
    chatWidget.style.display = 'flex';
    chatWidgetOpen = true;
    return;
  }

  chatWidget = document.createElement('div');
  chatWidget.id = 'ai-chat-widget';
  chatWidget.innerHTML = `
    <div class="ai-chat-header">
      <div>
        <strong>✨ Smart EcoAssistant</strong>
        <span style="display:block;font-size:0.75rem;opacity:0.7;">Powered by Groq AI</span>
      </div>
      <button id="ai-chat-close" aria-label="Close chat">&times;</button>
    </div>
    <div class="ai-chat-messages" id="ai-chat-messages">
      <div class="ai-msg"><div class="ai-bubble">Hello! I'm your AI EcoAssistant. How can I help you reduce your carbon footprint today?</div></div>
    </div>
    <form class="ai-chat-input" id="ai-chat-form">
      <input type="text" id="ai-chat-input" placeholder="Ask about your carbon footprint..." required autocomplete="off" aria-label="Message AI Assistant">
      <button type="submit" aria-label="Send">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
      </button>
    </form>
  `;

  document.body.appendChild(chatWidget);
  chatWidgetOpen = true;

  // Close button
  document.getElementById('ai-chat-close').addEventListener('click', () => {
    chatWidget.style.display = 'none';
    chatWidgetOpen = false;
  });

  // Fetch user context from localStorage
  let userContext = 'No footprint calculated yet.';
  try {
    const stored = JSON.parse(localStorage.getItem('ecotrack_data') || 'null');
    if (stored && stored.value) {
      const d = stored.value;
      userContext = `Transport: ${d.transport?.dailyDistance || '?'}km/day, Diet: ${d.food?.beef || '?'} meals, Renewable: ${d.energy?.renewablePercent || '?'}%`;
    }
  } catch (_e) { /* ignore */ }

  messagesHistory = [
    { role: 'system', content: `You are EcoAssistant, a friendly sustainability advisor for EcoTrack. Keep answers under 100 words, practical, and encouraging. User context: ${userContext}` }
  ];

  const messagesEl = document.getElementById('ai-chat-messages');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'user-msg' : 'ai-msg';
    div.innerHTML = `<div class="${role === 'user' ? 'user-bubble' : 'ai-bubble'}">${text.replace(/\n/g, '<br>')}</div>`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    messagesHistory.push({ role: 'user', content: text });
    input.value = '';

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'ai-msg';
    typing.innerHTML = '<div class="ai-bubble typing">Thinking<span class="dots">...</span></div>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messagesHistory,
          temperature: 0.7,
          max_tokens: 256
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        const errMsg = data?.error?.message || `Server error (${res.status})`;
        throw new Error(errMsg);
      }

      const reply = data.choices[0].message.content;
      typing.remove();
      addMessage('assistant', reply);
      messagesHistory.push({ role: 'assistant', content: reply });

    } catch (err) {
      console.error('AI Chat Error:', err);
      typing.remove();
      addMessage('assistant', `⚠️ ${err.message}`);
    }
  });

  setTimeout(() => input.focus(), 150);
}

export function initAssistant() {
  // Replace the existing FAB click handler
  const fab = document.getElementById('ai-fab');
  if (fab) {
    fab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (chatWidgetOpen && chatWidget) {
        chatWidget.style.display = 'none';
        chatWidgetOpen = false;
      } else {
        createChatWidget();
      }
    });
  }
}
