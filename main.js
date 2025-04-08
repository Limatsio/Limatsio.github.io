// Elementos de la calculadora
const equationInput = document.getElementById("equation-input");
const calculateButton = document.getElementById("calculate-button");
const balancedEquation = document.getElementById("balanced-equation");
const solutionSteps = document.getElementById("solution-steps");
const copyEquationBtn = document.getElementById("copy-equation");
const copyStepsBtn = document.getElementById("copy-steps");
const toggleTableBtn = document.getElementById("toggle-table");
const periodicTable = document.querySelector(".periodic-table .table-container");
const exampleButtons = document.querySelectorAll(".example-btn");
const copyNotification = document.getElementById("copy-notification");

// Elementos del chat (si existen)
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");

// API Configuration
const API_KEY = "AIzaSyC01ZtSqf7IMrHFZvPU9fP1Fyh0dFP_Nrw";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Datos del usuario y estado
const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};

// Historial de chat con instrucciones específicas para balanceo químico
const chatHistory = [
    {
        role: "user",
        parts: [
            { 
                text: "Eres un experto en química. Cuando te proporcione una ecuación química, debes:" +
                      "\n1. Mostrar la ecuación balanceada correctamente formateada (sin explicación adicional)" +
                      "\n2. Luego, en una sección separada, explicar paso a paso cómo se balanceó la ecuación" +
                      "\n\nEjemplo de formato requerido:" +
                      "\n\nEcuación balanceada: 2H2 + O2 → 2H2O" +
                      "\n\nPaso a paso:" +
                      "\n1. Contar átomos en reactivos y productos" +
                      "\n2. Balancear hidrógeno colocando coeficiente 2 en H2O" +
                      "\n3. Verificar oxígenos y ajustar si es necesario" +
                      "\n\nResponde solo en español y sigue estrictamente este formato."
            }
        ]
    }
];

// Funciones auxiliares
const scrollToLatestMessage = () => { 
    if (chatBody) {
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" }); 
    }
};

const showNotification = (message) => {
    copyNotification.textContent = message;
    copyNotification.classList.add("show");
    setTimeout(() => {
        copyNotification.classList.remove("show");
    }, 2000);
};

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Función principal para generar respuestas
const generateBotResponse = async (equation, isChat = false, incomingMessageDiv = null) => {
    if (isChat) {
        const messageElement = incomingMessageDiv.querySelector(".message-text");
        messageElement.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    } else {
        balancedEquation.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        solutionSteps.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    }

    chatHistory.push({
        role: "user",
        parts: [{ text: `Balancea esta ecuación: ${equation}` }]
    });

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: chatHistory,
            generationConfig: {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
                stopSequences: []
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const apiResponseText = data.candidates[0].content.parts[0].text;
        
        if (isChat) {
            const messageElement = incomingMessageDiv.querySelector(".message-text");
            messageElement.innerText = apiResponseText.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        } else {
            // Procesar la respuesta para separar ecuación balanceada y pasos
            const balancedMatch = apiResponseText.match(/Ecuación balanceada: (.+?)\n/);
            const stepsMatch = apiResponseText.match(/Paso a paso:\n([\s\S]*)/);
            
            if (balancedMatch && balancedMatch[1]) {
                balancedEquation.innerHTML = balancedMatch[1].trim();
            } else {
                balancedEquation.textContent = "No se pudo obtener la ecuación balanceada";
            }
            
            if (stepsMatch && stepsMatch[1]) {
                solutionSteps.innerHTML = stepsMatch[1].trim().replace(/\n/g, '<br>');
            } else {
                solutionSteps.textContent = "No se pudo obtener la explicación paso a paso";
            }
        }

        chatHistory.push({
            role: "model",
            parts: [{ text: apiResponseText }]
        });

    } catch (error) {
        console.error(error);
        if (isChat) {
            const messageElement = incomingMessageDiv.querySelector(".message-text");
            messageElement.innerText = "Error al procesar la ecuación. Intenta nuevamente.";
            messageElement.style.color = "#e74c3c";
        } else {
            balancedEquation.textContent = "Error al procesar la ecuación";
            solutionSteps.textContent = "Intenta nuevamente con una ecuación válida";
        }
    } finally {
        if (isChat) {
            userData.file = {};
            incomingMessageDiv.classList.remove("thinking");
            scrollToLatestMessage();
        }
    }
};

// Funciones específicas para la calculadora
const handleCalculate = () => {
    const equation = equationInput.value.trim();
    if (!equation) return;
    
    generateBotResponse(equation);
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showNotification("¡Texto copiado al portapapeles!");
    }).catch(err => {
        console.error("Error al copiar: ", err);
        showNotification("Error al copiar el texto");
    });
};

// Funciones específicas para el chat
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    if (!userData.message && !userData.file.data) return;
    
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));

    const messageContent = `<div class="message-text"></div>
                            ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    scrollToLatestMessage();

    setTimeout(() => {
        const messageContent = `
                <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
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
        generateBotResponse(userData.message, true, incomingMessageDiv);
    }, 600);
};

// Event Listeners para la calculadora
if (calculateButton) {
    calculateButton.addEventListener("click", handleCalculate);
    equationInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleCalculate();
        }
    });
    
    copyEquationBtn?.addEventListener("click", () => {
        copyToClipboard(balancedEquation.textContent);
    });
    
    copyStepsBtn?.addEventListener("click", () => {
        copyToClipboard(solutionSteps.textContent);
    });
    
    toggleTableBtn?.addEventListener("click", () => {
        periodicTable.classList.toggle("expanded");
        const icon = toggleTableBtn.querySelector("span");
        icon.textContent = periodicTable.classList.contains("expanded") ? "unfold_less" : "unfold_more";
    });
    
    exampleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            equationInput.value = btn.dataset.equation;
        });
    });
}

// Event Listeners para el chat
if (messageInput) {
    const initialInputHeight = messageInput.scrollHeight;
    
    messageInput.addEventListener("keydown", (e) => {
        if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 768){
            handleOutgoingMessage(e);
        }
    });
    
    messageInput.addEventListener("input", () => {
        messageInput.style.height = `${initialInputHeight}px`;
        messageInput.style.height = `${messageInput.scrollHeight}px`;
        document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "25px";
    });
    
    fileInput?.addEventListener("change", () => {
        const file = fileInput.files[0];
        if(!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            fileUploadWrapper.querySelector("img").src = e.target.result;
            fileUploadWrapper.classList.add("file-uploaded");
            const base64String = e.target.result.split(",")[1];
    
            userData.file = {
                data: base64String,
                mime_type: file.type
            };
    
            fileInput.value = "";
        };
        reader.readAsDataURL(file);
    });
    
    fileCancelButton?.addEventListener("click", () => {
        userData.file = {};
        fileUploadWrapper.classList.remove("file-uploaded");
    });
    
    document.querySelector("#file-upload")?.addEventListener("click", () => fileInput.click());
    sendMessageButton?.addEventListener("click", handleOutgoingMessage);
}

// FAQ functionality (común a ambas interfaces)
document.querySelectorAll(".faq-question").forEach(question => {
    question.addEventListener("click", () => {
        const item = question.parentNode;
        const answer = question.nextElementSibling;
        
        document.querySelectorAll(".faq-answer").forEach(ans => {
            ans.style.maxHeight = null;
            ans.parentNode.classList.remove("active");
        });
        
        if (answer.style.maxHeight !== answer.scrollHeight + "px") {
            answer.style.maxHeight = answer.scrollHeight + "px";
            item.classList.add("active");
        }
    });
});
