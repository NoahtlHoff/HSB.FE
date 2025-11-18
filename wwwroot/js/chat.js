const ctx = (() => {
  const seedElement = document.getElementById("chat-seed");
  if (!seedElement) {
    return null;
  }

  try {
    return JSON.parse(seedElement.textContent);
  } catch (error) {
    console.error("Unable to parse chat seed payload", error);
    return null;
  }
})();

if (ctx) {
  const traderSelect = document.getElementById("traderSelect");
  const strategySelect = document.getElementById("strategySelect");
  const strategyNotes = document.getElementById("strategyNotes");
  const tradeIdeasToggle = document.getElementById("tradeIdeasToggle");
  const watchlistToggle = document.getElementById("watchlistIdeasToggle");
  const ideaDeck = document.getElementById("ideaDeck");
  const watchlist = document.getElementById("watchlist");
  const chatLog = document.getElementById("chatLog");
  const chatComposer = document.getElementById("chatComposer");
  const chatInput = document.getElementById("chatInput");
  const chatMain = document.getElementById("chatMain");
  const profilePanel = document.querySelector("[data-profile-panel]");
  const profilePanelOverlay = document.querySelector("[data-profile-panel-overlay]");
  const profilePanelToggleButtons = document.querySelectorAll("[data-profile-panel-toggle]");
  const profilePanelClose = document.querySelector("[data-profile-panel-close]");
  const profileSummary = document.getElementById("profileSummary");
  const profilePanelMediaQuery = window.matchMedia("(max-width: 720px)");

  const profiles = Object.fromEntries(
    (ctx.traderProfiles ?? []).map((profile) => [profile.id, profile])
  );

  let ideaCursor = 0;

  const activateConversation = () => {
    if (chatMain && chatMain.dataset.empty !== "false") {
      chatMain.dataset.empty = "false";
    }
  };

  if (chatMain && chatLog && chatLog.children.length > 0) {
    chatMain.dataset.empty = "false";
  }

  const parsePoints = (datasetPoints) =>
    datasetPoints
      .split(",")
      .map((value) => Number.parseFloat(value))
      .filter((value) => Number.isFinite(value));

  const drawSparkline = (canvas, points, options = {}) => {
    if (!canvas || !canvas.getContext || points.length === 0) {
      return;
    }

    const ctx2d = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx2d.clearRect(0, 0, width, height);

    const min = Math.min(...points);
    const max = Math.max(...points);
    const spread = max - min || 1;
    const step = width / Math.max(points.length - 1, 1);

    ctx2d.lineWidth = 2.5;
    ctx2d.strokeStyle = options.stroke || "#8df2ff";
    ctx2d.beginPath();
    points.forEach((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / spread) * height;
      if (index === 0) {
        ctx2d.moveTo(x, y);
      } else {
        ctx2d.lineTo(x, y);
      }
    });
    ctx2d.stroke();

    if (options.fill) {
      const gradient = ctx2d.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, options.fillStart ?? "rgba(141, 242, 255, 0.32)");
      gradient.addColorStop(1, options.fillEnd ?? "rgba(22, 15, 60, 0)");
      ctx2d.lineTo(width, height);
      ctx2d.lineTo(0, height);
      ctx2d.closePath();
      ctx2d.fillStyle = gradient;
      ctx2d.fill();
    }
  };

  const updateProfileSummary = () => {
    if (!profileSummary || !traderSelect || !strategySelect) {
      return;
    }
    const traderLabel = traderSelect.selectedOptions[0]?.textContent?.trim();
    const strategyLabel = strategySelect.selectedOptions[0]?.textContent?.trim();
    const summary = [traderLabel, strategyLabel].filter(Boolean).join(" • ");
    profileSummary.textContent = summary || "Adjust settings";
  };

  const refreshStrategyOptions = () => {
    const profile = profiles[traderSelect.value];
    if (!profile) {
      return;
    }

    strategySelect.innerHTML = "";
    profile.strategies.forEach((strategy, index) => {
      const option = document.createElement("option");
      option.value = strategy.id;
      option.textContent = strategy.label;
      option.dataset.description = strategy.description;
      if (index === 0) {
        option.selected = true;
      }
      strategySelect.appendChild(option);
    });

    strategyNotes.textContent = profile.strategies[0]?.description ?? "";
    updateProfileSummary();
  };

  const updateStrategyNotes = () => {
    const selected = strategySelect.selectedOptions[0];
    if (selected) {
      strategyNotes.textContent = selected.dataset.description ?? "";
    }
    updateProfileSummary();
  };

  let profileOverlayTimeout;

  const setProfilePanelState = (open) => {
    if (!profilePanel) {
      return;
    }

    profilePanel.dataset.open = String(open);

    if (!profilePanelMediaQuery.matches) {
      profilePanel.setAttribute("aria-hidden", "false");
      document.body.classList.remove("profile-panel-open");
      if (profilePanelOverlay) {
        profilePanelOverlay.classList.remove("is-active");
        profilePanelOverlay.hidden = true;
      }
      return;
    }

    profilePanel.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("profile-panel-open", open);

    if (profilePanelOverlay) {
      if (profileOverlayTimeout) {
        clearTimeout(profileOverlayTimeout);
        profileOverlayTimeout = null;
      }

      if (open) {
        profilePanelOverlay.hidden = false;
        const animate = window.requestAnimationFrame ?? ((cb) => setTimeout(cb, 0));
        animate(() => {
          profilePanelOverlay.classList.add("is-active");
        });
      } else {
        profilePanelOverlay.classList.remove("is-active");
        profileOverlayTimeout = window.setTimeout(() => {
          profilePanelOverlay.hidden = true;
        }, 220);
      }
    }

    if (open && profilePanelMediaQuery.matches && typeof profilePanel.focus === "function") {
      try {
        profilePanel.focus({ preventScroll: true });
      } catch (error) {
        profilePanel.focus();
      }
    }
  };

  const ensureEmptyState = () => {
    const hasCards = watchlist.querySelector(".watchlist-card");
    const emptyState = watchlist.querySelector(".empty-state");
    if (!hasCards && !emptyState) {
      const placeholder = document.createElement("div");
      placeholder.className = "empty-state";
      placeholder.textContent = "No stocks pinned yet. Add candidates from the idea deck.";
      watchlist.appendChild(placeholder);
    } else if (hasCards && emptyState) {
      emptyState.remove();
    }
  };

  const buildWatchlistCard = (idea) => {
    const existing = watchlist.querySelector(`[data-ticker="${idea.ticker}"]`);
    if (existing) {
      existing.classList.add("pulse");
      setTimeout(() => existing.classList.remove("pulse"), 700);
      return;
    }

    const card = document.createElement("article");
    card.className = "watchlist-card";
    card.dataset.ticker = idea.ticker;
    card.innerHTML = `
      <header>
        <span class="ticker">${idea.ticker}</span>
        <button type="button" class="remove" aria-label="Remove ${idea.ticker}">Remove</button>
      </header>
      <div class="chart">
        <canvas width="260" height="70"></canvas>
      </div>
      <div class="annotation">
        <span class="entry">Entry ${idea.entry}</span>
        <span class="exit">Exit ${idea.exit}</span>
      </div>
      <p class="note">${idea.risk}</p>
    `;

    const removeButton = card.querySelector(".remove");
    removeButton.addEventListener("click", () => {
      card.remove();
      ensureEmptyState();
    });

    watchlist.appendChild(card);
    ensureEmptyState();

    const canvas = card.querySelector("canvas");
    drawSparkline(canvas, idea.points, {
      stroke: "#ffdf7e",
      fill: true,
      fillStart: "rgba(255, 223, 126, 0.32)",
      fillEnd: "rgba(16, 10, 40, 0)",
    });
    applyWatchlistToggleState();
  };

  const applyIdeaToggleState = () => {
    const show = tradeIdeasToggle.checked;
    ideaDeck.querySelectorAll(".idea-levels").forEach((section) => {
      section.style.display = show ? "grid" : "none";
    });
  };

  const applyWatchlistToggleState = () => {
    const show = watchlistToggle.checked;
    watchlist.querySelectorAll(".annotation, .note").forEach((element) => {
      element.style.display = show ? "" : "none";
    });
  };

  const appendMessage = (role, text) => {
    activateConversation();
    const article = document.createElement("article");
    article.className = `chat-message chat-message-${role}`;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    article.appendChild(bubble);
    chatLog.appendChild(article);
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  const suggestIdea = (profileLabel, strategyLabel) => {
    const ideas = ctx.featuredIdeas ?? [];
    if (ideas.length === 0) {
      return `Scanning for ${profileLabel} opportunities focused on ${strategyLabel}.`;
    }

    const idea = ideas[ideaCursor % ideas.length];
    ideaCursor += 1;
    return `Scanning ${profileLabel} setups using ${strategyLabel}. ${idea.ticker} stands out with ${idea.thesis.toLowerCase()} Consider entries near ${idea.suggestedEntry.toFixed(2)} with exits around ${idea.suggestedExit.toFixed(2)}.`;
  };

    // Function for when user submits a chat message.
    async function handleComposerSubmit(e) {
        e.preventDefault();
        const userText = chatInput.value.trim();
        if (!userText) return;

        // Display user message
        appendMessage("user", userText);
        chatInput.value = "";

        // Show temporary "Thinking..." message
        const thinkingMsg = document.createElement("article");
        thinkingMsg.className = "chat-message chat-message-assistant";
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.textContent = "Thinking...";
        thinkingMsg.appendChild(bubble);
        chatLog.appendChild(thinkingMsg);
        chatLog.scrollTop = chatLog.scrollHeight;

        try {
            const headers = {
                "Content-Type": "application/json"
            };

            // Add Authorization header if JWT token is available
            if (window.JWT_TOKEN) {
                headers["Authorization"] = `Bearer ${window.JWT_TOKEN}`;
            }

            const response = await fetch(`${window.API_BASE_URL}/chat`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    role: "user",
                    content: userText,
                    userId: window.USER_ID || "1",
                    // Get conversationId if user selected a previous conversations or generate one if it's fresh.
                    //conversationId: currentConvId
                })
            });

            if (!response.ok) {
                bubble.textContent = "Error: " + response.statusText;
                return;
            }

            // Stream the response
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";
            let accumulatedText = ""; // Store all text for markdown rendering

            bubble.textContent = ""; // clear "Thinking..."

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let parts = buffer.split("\n\n");
                // Keep the last partial piece in buffer
                buffer = parts.pop();

                for (const part of parts) {
                    if (part.startsWith("data: ")) {
                        const jsonText = part.replace(/^data: /, "");
                        try {
                            // Parse the JSON-escaped text
                            const text = JSON.parse(jsonText);
                            accumulatedText += text;

                            // Render markdown
                            if (typeof marked !== 'undefined') {
                                bubble.innerHTML = marked.parse(accumulatedText);
                            }
                            else {
                                // Fallback: at least preserve newlines
                                bubble.innerHTML = accumulatedText.replace(/\n/g, '<br>');
                            }

                            chatLog.scrollTop = chatLog.scrollHeight;

                            // Delay the output for a more readable response.
                            await new Promise(resolve => setTimeout(resolve, 50));

                        } catch (parseErr) {
                            console.error("Failed to parse SSE data:", parseErr, jsonText);
                        }
                    }
                }
            }

            // Handle any remaining buffer
            if (buffer && buffer.startsWith("data: ")) {
                const jsonText = buffer.replace(/^data: /, "");
                try {
                    const text = JSON.parse(jsonText);
                    accumulatedText += text;
                    if (typeof marked !== 'undefined') {
                        bubble.innerHTML = marked.parse(accumulatedText);
                    } else {
                        bubble.innerHTML = accumulatedText.replace(/\n/g, '<br>');
                    }
                } catch (parseErr) {
                    console.error("Failed to parse final SSE data:", parseErr);
                }
            }

        } catch (err) {
            bubble.textContent = "Error: " + err.message;
        }
    }

  const initializeIdeaDeck = () => {
    ideaDeck.querySelectorAll(".idea-card").forEach((card) => {
      const dataset = card.dataset;
      const points = parsePoints(dataset.points ?? "");
      const canvas = card.querySelector("canvas");
      if (canvas) {
        drawSparkline(canvas, points, { fill: true });
      }

      const button = card.querySelector(".idea-add");
      if (button) {
        button.addEventListener("click", () => {
          buildWatchlistCard({
            ticker: dataset.ticker,
            company: dataset.company,
            entry: dataset.entry,
            exit: dataset.exit,
            risk: dataset.risk,
            points,
          });
        });
      }
    });

    ensureEmptyState();
    applyIdeaToggleState();
  };

  if (profilePanel) {
    setProfilePanelState(profilePanelMediaQuery.matches ? false : true);

    profilePanelToggleButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        if (!profilePanelMediaQuery.matches) {
          return;
        }
        event.preventDefault();
        const isOpen = profilePanel.dataset.open === "true";
        setProfilePanelState(!isOpen);
      });
    });

    if (profilePanelClose) {
      profilePanelClose.addEventListener("click", () => setProfilePanelState(false));
    }

    if (profilePanelOverlay) {
      profilePanelOverlay.addEventListener("click", () => setProfilePanelState(false));
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && profilePanelMediaQuery.matches && profilePanel.dataset.open === "true") {
        setProfilePanelState(false);
      }
    });

    const handleProfileViewportChange = (event) => {
      if (event.matches) {
        setProfilePanelState(false);
      } else {
        setProfilePanelState(true);
      }
    };

    if (typeof profilePanelMediaQuery.addEventListener === "function") {
      profilePanelMediaQuery.addEventListener("change", handleProfileViewportChange);
    } else if (typeof profilePanelMediaQuery.addListener === "function") {
      profilePanelMediaQuery.addListener(handleProfileViewportChange);
    }
  } else if (profilePanelOverlay) {
    profilePanelOverlay.hidden = true;
  }

  traderSelect.addEventListener("change", () => {
    refreshStrategyOptions();
  });

  strategySelect.addEventListener("change", updateStrategyNotes);
  tradeIdeasToggle.addEventListener("change", applyIdeaToggleState);
  watchlistToggle.addEventListener("change", applyWatchlistToggleState);
  chatComposer.addEventListener("submit", handleComposerSubmit);

  refreshStrategyOptions();
  initializeIdeaDeck();
  applyWatchlistToggleState();
}
