/**
 * ChatApi
 * Handles all network requests to the backend.
 */
class ChatApi {
  constructor(baseUrl, jwtToken, userId) {
    this.baseUrl = baseUrl;
    this.jwtToken = jwtToken;
    this.userId = userId;
  }

  get headers() {
    const headers = {
      "Content-Type": "application/json"
    };
    if (this.jwtToken) {
      headers["Authorization"] = `Bearer ${this.jwtToken}`;
    }
    return headers;
  }

  async fetchHistory() {
    try {
      const response = await fetch(`${this.baseUrl}/api/conversations`, {
        method: "GET",
        headers: this.headers
      });
      if (response.ok) {
        return await response.json();
      }
      console.error("Failed to fetch chat history:", response.statusText);
      return [];
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  }

  async fetchConversation(conversationId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/conversations/${conversationId}`, {
        method: "GET",
        headers: this.headers
      });
      if (response.ok) {
        return await response.json();
      }
      console.error("Failed to load conversation:", response.statusText);
      return null;
    } catch (error) {
      console.error("Error loading conversation:", error);
      return null;
    }
  }

  async sendMessage(message, conversationId, onChunk, onComplete) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          role: "user",
          content: message,
          userId: this.userId,
          conversationId: conversationId || ""
        })
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let newConversationId = conversationId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let parts = buffer.split("\n\n");
        buffer = parts.pop();

        for (const part of parts) {
          if (part.startsWith("id: ")) {
            newConversationId = part.replace("id: ", "").trim();
          } else if (part.startsWith("data: ")) {
            const jsonText = part.replace(/^data: /, "");
            try {
              const text = JSON.parse(jsonText);
              if (onChunk) onChunk(text, newConversationId);
            } catch (e) {
              console.error("Failed to parse SSE data", e);
            }
          }
        }
      }

      // Handle remaining buffer
      if (buffer && buffer.startsWith("data: ")) {
        const jsonText = buffer.replace(/^data: /, "");
        try {
          const text = JSON.parse(jsonText);
          if (onChunk) onChunk(text, newConversationId);
        } catch (e) {
          console.error("Failed to parse final SSE data", e);
        }
      }

      if (onComplete) onComplete(newConversationId);

    } catch (error) {
      throw error;
    }
  }
}

/**
 * ChatUI
 * Handles all DOM manipulations and UI state.
 */
class ChatUI {
  constructor() {
    this.elements = {
      chatLog: document.getElementById("chatLog"),
      chatInput: document.getElementById("chatInput"),
      chatComposer: document.getElementById("chatComposer"),
      chatHistoryList: document.getElementById("chatHistoryList"),
      chatMain: document.getElementById("chatMain"),
      traderSelect: document.getElementById("traderSelect"),
      strategySelect: document.getElementById("strategySelect"),
      strategyNotes: document.getElementById("strategyNotes"),
      profileSummary: document.getElementById("profileSummary"),
      profilePanel: document.querySelector("[data-profile-panel]"),
      profilePanelOverlay: document.querySelector("[data-profile-panel-overlay]"),
      profilePanelToggleButtons: document.querySelectorAll("[data-profile-panel-toggle]"),
      profilePanelClose: document.querySelector("[data-profile-panel-close]"),
    };

    this.profileMediaQuery = window.matchMedia("(max-width: 720px)");
    this.initProfilePanel();
  }

  get inputValue() {
    return this.elements.chatInput.value.trim();
  }

  set inputValue(val) {
    this.elements.chatInput.value = val;
  }

  clearChat() {
    this.elements.chatLog.innerHTML = "";
  }

  scrollToBottom() {
    this.elements.chatLog.scrollTop = this.elements.chatLog.scrollHeight;
  }

  showMainChat() {
    if (this.elements.chatMain) {
      this.elements.chatMain.dataset.empty = "false";
    }
  }

  appendMessage(role, text, isHtml = false) {
    this.showMainChat();
    const article = document.createElement("article");
    article.className = `chat-message chat-message-${role}`;
    const bubble = document.createElement("div");
    bubble.className = "bubble";

    if (isHtml) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }

    article.appendChild(bubble);
    this.elements.chatLog.appendChild(article);
    this.scrollToBottom();
    return bubble; // Return bubble for streaming updates
  }

  showThinking() {
    return this.appendMessage("assistant", "Thinking...");
  }

  updateMessageContent(bubbleElement, text) {
    if (typeof marked !== 'undefined') {
      bubbleElement.innerHTML = marked.parse(text);
    } else {
      bubbleElement.innerHTML = text.replace(/\n/g, '<br>');
    }
    this.scrollToBottom();
  }

  renderHistory(conversations, onSelect) {
    const list = this.elements.chatHistoryList;
    if (!list) return;

    list.innerHTML = "";

    if (!conversations || conversations.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No chat history";
      list.appendChild(empty);
      return;
    }

    conversations.forEach(conv => {
      const item = document.createElement("div");
      item.className = "chat-history-item";
      item.dataset.conversationId = conv.conversationId;

      const title = document.createElement("span");
      title.className = "chat-title";
      title.textContent = conv.name || "Untitled Chat";

      item.appendChild(title);
      item.addEventListener("click", () => onSelect(conv.conversationId));
      list.appendChild(item);
    });
  }

  setActiveHistoryItem(conversationId) {
    const items = this.elements.chatHistoryList.querySelectorAll(".chat-history-item");
    items.forEach(item => {
      if (item.dataset.conversationId === conversationId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  // Profile Panel Logic
  initProfilePanel() {
    if (!this.elements.profilePanel) return;

    const setPanelState = (open) => {
      const panel = this.elements.profilePanel;
      const overlay = this.elements.profilePanelOverlay;
      const isMobile = this.profileMediaQuery.matches;

      panel.dataset.open = String(open);

      if (!isMobile) {
        panel.setAttribute("aria-hidden", "false");
        document.body.classList.remove("profile-panel-open");
        if (overlay) overlay.hidden = true;
        return;
      }

      panel.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("profile-panel-open", open);

      if (overlay) {
        overlay.hidden = !open;
        overlay.classList.toggle("is-active", open);
      }
    };

    // Initial state
    setPanelState(!this.profileMediaQuery.matches);

    // Event Listeners
    this.elements.profilePanelToggleButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (!this.profileMediaQuery.matches) return;
        e.preventDefault();
        const isOpen = this.elements.profilePanel.dataset.open === "true";
        setPanelState(!isOpen);
      });
    });

    if (this.elements.profilePanelClose) {
      this.elements.profilePanelClose.addEventListener("click", () => setPanelState(false));
    }

    if (this.elements.profilePanelOverlay) {
      this.elements.profilePanelOverlay.addEventListener("click", () => setPanelState(false));
    }

    this.profileMediaQuery.addEventListener("change", (e) => {
      setPanelState(!e.matches);
    });
  }

  updateProfileSummary() {
    const { traderSelect, strategySelect, profileSummary } = this.elements;
    if (!profileSummary || !traderSelect || !strategySelect) return;

    const trader = traderSelect.selectedOptions[0]?.textContent?.trim();
    const strategy = strategySelect.selectedOptions[0]?.textContent?.trim();
    profileSummary.textContent = [trader, strategy].filter(Boolean).join(" • ") || "Adjust settings";
  }
}

/**
 * ChatApp
 * Main application logic.
 */
class ChatApp {
  constructor() {
    this.api = new ChatApi(window.API_BASE_URL, window.JWT_TOKEN, window.USER_ID);
    this.ui = new ChatUI();
    this.currentConversationId = "";
    this.profiles = this.loadProfiles();

    this.init();
  }

  loadProfiles() {
    const seedElement = document.getElementById("chat-seed");
    if (!seedElement) return {};
    try {
      const data = JSON.parse(seedElement.textContent);
      return Object.fromEntries((data.traderProfiles ?? []).map(p => [p.id, p]));
    } catch (e) {
      console.error("Failed to parse profiles", e);
      return {};
    }
  }

  async init() {
    this.bindEvents();
    this.refreshStrategyOptions(); // Initial render
    await this.loadHistory();
  }

  bindEvents() {
    // Chat Composer
    this.ui.elements.chatComposer.addEventListener("submit", (e) => this.handleSubmit(e));

    // Profile Settings
    this.ui.elements.traderSelect.addEventListener("change", () => this.refreshStrategyOptions());
    this.ui.elements.strategySelect.addEventListener("change", () => this.updateStrategyNotes());
  }

  refreshStrategyOptions() {
    const { traderSelect, strategySelect, strategyNotes } = this.ui.elements;
    const profile = this.profiles[traderSelect.value];

    if (!profile) return;

    strategySelect.innerHTML = "";
    profile.strategies.forEach((strategy, index) => {
      const option = document.createElement("option");
      option.value = strategy.id;
      option.textContent = strategy.label;
      option.dataset.description = strategy.description;
      if (index === 0) option.selected = true;
      strategySelect.appendChild(option);
    });

    if (strategyNotes) {
      strategyNotes.textContent = profile.strategies[0]?.description ?? "";
    }
    this.ui.updateProfileSummary();
  }

  updateStrategyNotes() {
    const { strategySelect, strategyNotes } = this.ui.elements;
    const selected = strategySelect.selectedOptions[0];
    if (selected && strategyNotes) {
      strategyNotes.textContent = selected.dataset.description ?? "";
    }
    this.ui.updateProfileSummary();
  }

  async loadHistory() {
    const conversations = await this.api.fetchHistory();
    this.ui.renderHistory(conversations, (id) => this.loadConversation(id));
  }

  async loadConversation(id) {
    const conversation = await this.api.fetchConversation(id);
    if (!conversation) return;

    this.currentConversationId = id;
    this.ui.clearChat();
    this.ui.showMainChat();
    this.ui.setActiveHistoryItem(id);

    conversation.forEach(msg => {
      const isAssistant = msg.role.toLowerCase() === "assistant";
      if (isAssistant && typeof marked !== 'undefined') {
        this.ui.appendMessage(msg.role.toLowerCase(), marked.parse(msg.content), true);
      } else {
        this.ui.appendMessage(msg.role.toLowerCase(), msg.content);
      }
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const text = this.ui.inputValue;
    if (!text) return;

    this.ui.inputValue = "";
    this.ui.appendMessage("user", text);

    const thinkingBubble = this.ui.showThinking();
    let accumulatedText = "";

    try {
      await this.api.sendMessage(
        text,
        this.currentConversationId,
        (chunk, newId) => {
          // On Chunk
          if (newId) this.currentConversationId = newId;
          accumulatedText += chunk;
          this.ui.updateMessageContent(thinkingBubble, accumulatedText);
        },
        (finalId) => {
          // On Complete
          if (finalId) {
            this.currentConversationId = finalId;
            // Refresh history to show new chat if it was a new conversation
            // Debounce this or check if it's new to avoid unnecessary fetches
            this.loadHistory();
          }
        }
      );
    } catch (err) {
      thinkingBubble.textContent = "Error: " + err.message;
    }
  }
}

// Start App
document.addEventListener("DOMContentLoaded", () => {
  window.chatApp = new ChatApp();
});
