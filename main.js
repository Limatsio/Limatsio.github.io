// Datos de masas atómicas (en g/mol)
const masasAtomicas = {
    H: 1.008,
    HE: 4.0026,
    LI: 6.94,
    BE: 9.0122,
    B: 10.81,
    C: 12.011,
    N: 14.007,
    O: 15.999,
    F: 18.998,
    NE: 20.180,
    NA: 22.990,
    MG: 24.305,
    AL: 26.982,
    SI: 28.085,
    P: 30.974,
    S: 32.06,
    CL: 35.453,
    AR: 39.948,
    K: 39.098,
    CA: 40.078,
    SC: 44.956,
    TI: 47.867,
    V: 50.942,
    CR: 52.00,
    MN: 54.938,
    FE: 55.845,
    CO: 58.933,
    NI: 58.693,
    CU: 63.546,
    ZN: 65.38,
    GA: 69.723,
    GE: 72.63,
    AS: 74.922,
    SE: 78.971,
    BR: 79.904,
    KR: 83.798,
    RB: 85.468,
    SR: 87.62,
    Y: 88.906,
    ZR: 91.224,
    NB: 92.906,
    MO: 95.95,
    TC: 98,
    RU: 101.07,
    RH: 102.91,
    PD: 106.42,
    AG: 107.868,
    CD: 112.41,
    IN: 114.82,
    SN: 118.71,
    SB: 121.76,
    I: 126.904,
    XE: 131.293,
    CS: 132.905,
    BA: 137.33,
    LA: 138.905,
    CE: 140.116,
    PR: 140.907,
    ND: 144.242,
    PM: 145,
    SM: 150.36,
    EU: 152.00,
    GD: 157.25,
    TB: 158.925,
    DY: 162.50,
    HO: 164.930,
    ER: 167.259,
    TM: 168.934,
    YB: 173.04,
    LU: 175.00,
    HF: 178.49,
    TA: 180.947,
    W: 183.84,
    RE: 186.207,
    OS: 190.23,
    IR: 192.217,
    PT: 195.084,
    AU: 196.967,
    HG: 200.592,
    TL: 204.38,
    PB: 207.2,
    BI: 208.980,
    PO: 209,
    AT: 210,
    RN: 222,
    FR: 223,
    RA: 226.03,
    AC: 227,
    TH: 232.038,
    PA: 231.035,
    U: 238.028,
    NP: 237,
    PU: 244,
    AM: 243,
    CM: 247,
    BK: 247,
    CF: 251,
    ES: 252,
    FM: 257,
    MD: 258,
    NO: 259,
    LR: 262,
    RF: 267,
    DB: 270,
    SG: 271,
    BH: 270,
    HS: 277,
    MT: 276,
    DS: 281,
    RG: 280,
    CN: 285,
    NH: 284,
    FL: 289,
    MC: 288,
    LV: 293,
    TS: 294,
    OG: 294
  };
  
  // Función para calcular la masa molar
  function calcularMasaMolar() {
    const formula = document.getElementById('formula').value.trim();
    if (!formula) {
      mostrarError('Por favor, ingresa una fórmula química.');
      return;
    }
  
    try {
      const masaMolar = obtenerMasaMolar(formula);
      mostrarResultado(`Masa molar de ${formula}: ${masaMolar.toFixed(3)} g/mol`, 'resultado-masa-molar');
    } catch (error) {
      mostrarError(error.message, 'resultado-masa-molar');
    }
  }
  
  // Función para obtener la masa molar de una fórmula
  function obtenerMasaMolar(formula) {
    const regex = /([A-Z][a-z]*)(\d*)/g;
    let match;
    let masaMolar = 0;
  
    while ((match = regex.exec(formula)) !== null) {
      const elemento = match[1];
      const cantidad = match[2] ? parseInt(match[2]) : 1;
  
      if (!masasAtomicas[elemento]) {
        throw new Error(`Elemento desconocido: ${elemento}`);
      }
  
      masaMolar += masasAtomicas[elemento] * cantidad;
    }
  
    if (masaMolar === 0) {
      throw new Error('Fórmula no válida.');
    }
  
    return masaMolar;
  }
  
  // Función para mostrar resultados
  function mostrarResultado(mensaje, id) {
    const resultadoDiv = document.getElementById(id);
    resultadoDiv.innerHTML = `<p>${mensaje}</p>`;
    resultadoDiv.style.display = 'block';
  }
  
  // Función para mostrar errores
  function mostrarError(mensaje, id) {
    const resultadoDiv = document.getElementById(id);
    resultadoDiv.innerHTML = `<p style="color: var(--color-error);">${mensaje}</p>`;
    resultadoDiv.style.display = 'block';
  }
  
  // Configuración de la API del chatbot
  const API_KEY = "AIzaSyC01ZtSqf7IMrHFZvPU9fP1Fyh0dFP_Nrw"; // Reemplaza con tu API Key
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
  // Elementos del DOM del chatbot
  const chatBody = document.querySelector(".chat-body");
  const messageInput = document.querySelector(".message-input");
  const sendMessageButton = document.querySelector("#send-message");
  const fileInput = document.querySelector("#file-input");
  const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
  const fileCancelButton = document.querySelector("#file-cancel");
  const chatbotToggler = document.querySelector("#chatbot-toggler");
  const closeChatbot = document.querySelector("#close-chatbot");
  
  // Datos del usuario y historial del chat
  const userData = {
    message: null,
    file: {
      data: null,
      mime_type: null
    }
  };
  
  const chatHistory = [];
  const initialInputHeight = messageInput.scrollHeight;
  
  // Scroll to the latest message
  const scrollToLatestMessage = () => {
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  };
  
  // Create message element with dynamic classes and return it
  const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
  };
  
  // Generate bot response using API
  const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
  
    // Add user message to chat history
    chatHistory.push({
      role: "user",
      parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
    });
  
    // API request options
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: chatHistory
      })
    };
  
    try {
      // Fetch bot response from API
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);
  
      // Extract and display bot's response text
      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      messageElement.innerText = apiResponseText;
  
      // Add bot response to chat history
      chatHistory.push({
        role: "model",
        parts: [{ text: apiResponseText }]
      });
  
    } catch (error) {
      // Handle error in API response
      console.error(error);
      messageElement.innerText = error.message;
      messageElement.style.color = "#ff0000";
    } finally {
      // Reset user's file data, removing thinking indicator and scroll chat to bottom
      userData.file = {};
      incomingMessageDiv.classList.remove("thinking");
      scrollToLatestMessage();
    }
  };
  
  // Handle outgoing user messages
  const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));
  
    // Create display user message
    const messageContent = `<div class="message-text"></div>
                            ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;
  
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    scrollToLatestMessage();
  
    // Simulate bot response with thinking indicator after a delay
    setTimeout(() => {
      const messageContent = `
              <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                  <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
              </svg>
              <div class="message-text">
                  <div class="thinking-indicator">
                      <div class="dot"></div>
                      <div class="dot"></div>
                      <div class="dot"></div>
                  </div>
              </div>`;
  
      const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
      chatBody.appendChild(incomingMessageDiv);
      scrollToLatestMessage();
      generateBotResponse(incomingMessageDiv);
    }, 600);
  };
  
  // Handle Enter key press for sending messages
  messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
      handleOutgoingMessage(e);
    }
  });
  
  // Adjust input field height dynamically
  messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
  });
  
  // Handle file input change and preview the selected file
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      fileUploadWrapper.querySelector("img").src = e.target.result;
      fileUploadWrapper.classList.add("file-uploaded");
      const base64String = e.target.result.split(",")[1];
  
      // Store file data in userData
      userData.file = {
        data: base64String,
        mime_type: file.type
      };
  
      fileInput.value = "";
    };
  
    reader.readAsDataURL(file);
  });
  
  // Cancel file upload
  fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
  });
  
  // Initialize emoji picker and handle emoji selection
  const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
      const { selectionStart: start, selectionEnd: end } = messageInput;
      messageInput.setRangeText(emoji.native, start, end, "end");
      messageInput.focus();
    },
    onClickOutside: (e) => {
      if (e.target.id === "emoji-picker") {
        document.body.classList.toggle("show-emoji-picker");
      } else {
        document.body.classList.remove("show-emoji-picker");
      }
    }
  });
  
  document.querySelector(".chat-form").appendChild(picker);
  
  sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
  document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
  chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
  closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));