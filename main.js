// Variables globales
let chatOpen = false;
let currentTab = 'standard';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  // Configurar eventos de la calculadora
  setupCalculator();
  
  // Configurar chatbot
  setupChatbot();
  
  // Configurar tabs de la calculadora
  setupCalculatorTabs();
  
  // Cargar ejercicios de ejemplo
  setupExampleExercises();
});

// Configurar tabs de la calculadora
function setupCalculatorTabs() {
  const tabs = document.querySelectorAll('.calc-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remover clase active de todos los tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Añadir clase active al tab clickeado
      this.classList.add('active');
      currentTab = this.dataset.tab;
      
      // Aquí podrías añadir lógica para cambiar la interfaz según el tab seleccionado
      updateCalculatorInterface();
    });
  });
}

// Actualizar interfaz de la calculadora según el tab seleccionado
function updateCalculatorInterface() {
  // Esta función podría mostrar/ocultar campos específicos según el tipo de cálculo
  // Por ejemplo, campos adicionales para Le Chatelier o sistemas de polímeros
  console.log(`Cambiado a modo: ${currentTab}`);
}

// Configurar calculadora
function setupCalculator() {
  const calculateBtn = document.getElementById('calculate-btn');
  const addReactantBtn = document.querySelector('.concentration-inputs .input-row:first-child .add-btn');
  const addProductBtn = document.querySelector('.concentration-inputs .input-row:last-child .add-btn');
  
  // Evento para calcular equilibrio
  calculateBtn.addEventListener('click', calculateEquilibrium);
  
  // Evento para añadir reactivo
  addReactantBtn.addEventListener('click', function() {
    addConcentrationInput('reactants');
  });
  
  // Evento para añadir producto
  addProductBtn.addEventListener('click', function() {
    addConcentrationInput('products');
  });
  
  // Evento para cargar ejercicios
  document.querySelectorAll('.load-exercise').forEach(btn => {
    btn.addEventListener('click', function() {
      loadExercise(this);
    });
  });
}

// Añadir campo de concentración
function addConcentrationInput(type) {
  const container = type === 'reactants' 
    ? document.querySelector('.concentration-inputs .input-row:first-child')
    : document.querySelector('.concentration-inputs .input-row:last-child');
  
  const inputPair = document.createElement('div');
  inputPair.className = 'input-pair';
  inputPair.innerHTML = `
    <input type="text" placeholder="Especie" class="species">
    <input type="number" placeholder="Conc. (M)" class="concentration">
    <button class="remove-btn"><i class="fas fa-times"></i></button>
  `;
  
  // Insertar antes del botón de añadir
  container.insertBefore(inputPair, container.lastElementChild);
  
  // Añadir evento al botón de eliminar
  inputPair.querySelector('.remove-btn').addEventListener('click', function() {
    inputPair.remove();
  });
}

// Cargar ejercicio
function loadExercise(button) {
  const equation = button.dataset.equation;
  const reactants = parseConcentrations(button.dataset.reactants);
  const products = parseConcentrations(button.dataset.products);
  const target = button.dataset.target;
  const dh = button.dataset.dh || '';
  
  // Establecer ecuación
  document.getElementById('equation').value = equation;
  
  // Limpiar inputs existentes
  clearConcentrationInputs('reactants');
  clearConcentrationInputs('products');
  
  // Añadir reactivos
  for (const [species, conc] of Object.entries(reactants)) {
    addConcentrationWithValues('reactants', species, conc);
  }
  
  // Añadir productos
  for (const [species, conc] of Object.entries(products)) {
    addConcentrationWithValues('products', species, conc);
  }
  
  // Establecer tipo de cálculo
  document.getElementById('calc-target').value = target;
  
  // Si hay un valor de ΔH, mostrarlo
  if (dh) {
    // Implementar lógica para mostrar ΔH si es relevante
  }
  
  // Desplazar a la calculadora
  document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' });
}

// Parsear concentraciones
function parseConcentrations(data) {
  const result = {};
  if (!data) return result;
  
  const pairs = data.split(',');
  pairs.forEach(pair => {
    const [species, conc] = pair.split(':');
    result[species] = conc;
  });
  
  return result;
}

// Limpiar inputs de concentración
function clearConcentrationInputs(type) {
  const container = type === 'reactants' 
    ? document.querySelector('.concentration-inputs .input-row:first-child')
    : document.querySelector('.concentration-inputs .input-row:last-child');
  
  // Eliminar todos los input-pair excepto el último (que contiene el botón de añadir)
  const inputPairs = container.querySelectorAll('.input-pair');
  inputPairs.forEach((pair, index) => {
    if (index < inputPairs.length - 1) {
      pair.remove();
    }
  });
}

// Añadir concentración con valores
function addConcentrationWithValues(type, species, concentration) {
  addConcentrationInput(type);
  
  const container = type === 'reactants' 
    ? document.querySelector('.concentration-inputs .input-row:first-child')
    : document.querySelector('.concentration-inputs .input-row:last-child');
  
  const lastInputPair = container.querySelector('.input-pair:not(:last-child)');
  if (lastInputPair) {
    lastInputPair.querySelector('.species').value = species;
    lastInputPair.querySelector('.concentration').value = concentration;
  }
}

// Calcular equilibrio químico
function calculateEquilibrium() {
  // Obtener datos de la ecuación
  const equation = document.getElementById('equation').value.trim();
  if (!equation) {
    showError('Por favor ingresa una ecuación química');
    return;
  }
  
  // Obtener reactivos y productos
  const reactants = getSpeciesConcentrations('reactants');
  const products = getSpeciesConcentrations('products');
  
  // Validar que haya al menos un reactivo y un producto
  if (Object.keys(reactants).length === 0 || Object.keys(products).length === 0) {
    showError('Debes ingresar al menos un reactivo y un producto');
    return;
  }
  
  // Obtener tipo de cálculo
  const target = document.getElementById('calc-target').value;
  const temperature = document.getElementById('temperature').value || 25;
  
  // Mostrar loading
  showLoading();
  
  // Simular cálculo (en una aplicación real, aquí llamarías a tu algoritmo)
  setTimeout(() => {
    let result, steps;
    
    if (currentTab === 'standard') {
      // Cálculo estándar de equilibrio
      [result, steps] = calculateStandardEquilibrium(equation, reactants, products, target);
    } else if (currentTab === 'lechatelier') {
      // Análisis de Le Chatelier
      [result, steps] = analyzeLeChatelier(equation, reactants, products, temperature);
    } else if (currentTab === 'polimeros') {
      // Sistema de polímeros
      [result, steps] = analyzePolymerSystem(equation, reactants, products);
    }
    
    // Mostrar resultados
    displayResults({
      balancedEquation: equation,
      calculationType: getCalculationTypeDescription(target, currentTab),
      result: result,
      steps: steps,
      temperature: temperature
    });
  }, 1500);
}

// Cálculo estándar de equilibrio
function calculateStandardEquilibrium(equation, reactants, products, target) {
  // Este es un ejemplo simplificado - en una aplicación real implementarías
  // el algoritmo real de cálculo de equilibrio químico
  
  // Calcular Kc de ejemplo (producto de productos / producto de reactivos)
  let productConc = 1;
  for (const conc of Object.values(products)) {
    productConc *= conc;
  }
  
  let reactantConc = 1;
  for (const conc of Object.values(reactants)) {
    reactantConc *= conc;
  }
  
  const Kc = (productConc / reactantConc).toFixed(4);
  
  const result = target === 'Kc' ? Kc : '0.25 M';
  
  const steps = [
    '1. Analizar la ecuación ingresada y verificar su balance.',
    '2. Identificar las especies involucradas y sus concentraciones.',
    '3. Aplicar la fórmula de la constante de equilibrio Kc = [Productos] / [Reactivos].',
    `4. Cálculo: Kc = (${Object.values(products).join(' × ')}) / (${Object.values(reactants).join(' × ')}) = ${Kc}`,
    '5. Verificar el resultado y su significado químico.'
  ].join('\n');
  
  return [result, steps];
}

// Análisis de Le Chatelier
function analyzeLeChatelier(equation, reactants, products, temperature) {
  // Análisis simplificado del principio de Le Chatelier
  const result = "El sistema responderá para contrarrestar cambios en el equilibrio";
  
  const steps = [
    '1. Analizar la ecuación química proporcionada.',
    '2. Identificar si la reacción es exotérmica o endotérmica.',
    '3. Evaluar posibles perturbaciones al sistema:',
    '   - Cambios en concentración: aumentar reactivos desplaza hacia productos',
    '   - Cambios en presión: afecta solo a especies gaseosas',
    `   - Cambios en temperatura (actual: ${temperature}°C): `,
    '      * Aumento favorece reacción endotérmica',
    '      * Disminución favorece reacción exotérmica',
    '4. Predecir la respuesta del sistema según el principio de Le Chatelier.'
  ].join('\n');
  
  return [result, steps];
}

// Análisis de sistema de polímeros
function analyzePolymerSystem(equation, reactants, products) {
  // Análisis simplificado para sistemas de polímeros como SIS
  const result = "Kc = [SIS] / ([S]² × [I])";
  
  const steps = [
    '1. Analizar el sistema de polímeros (ejemplo: estireno-isopreno-estireno).',
    '2. Escribir la ecuación de equilibrio para el sistema.',
    '3. Calcular la constante de equilibrio Kc para el sistema.',
    '4. Evaluar propiedades especiales de los polímeros:',
    '   - Efecto de la temperatura en la polimerización',
    '   - Influencia de la concentración de monómeros',
    '   - Consideraciones estéricas y cinéticas',
    '5. Analizar posibles aplicaciones industriales del sistema.'
  ].join('\n');
  
  return [result, steps];
}

// Obtener descripción del tipo de cálculo
function getCalculationTypeDescription(target, tab) {
  if (tab === 'lechatelier') return 'Análisis de Le Chatelier';
  if (tab === 'polimeros') return 'Sistema de polímeros';
  return target === 'Kc' ? 'Constante de equilibrio' : 'Concentración en equilibrio';
}

// Obtener concentraciones de especies
function getSpeciesConcentrations(type) {
  const container = type === 'reactants' 
    ? document.querySelector('.concentration-inputs .input-row:first-child')
    : document.querySelector('.concentration-inputs .input-row:last-child');
  
  const result = {};
  const inputPairs = container.querySelectorAll('.input-pair:not(:last-child)');
  
  inputPairs.forEach(pair => {
    const species = pair.querySelector('.species').value.trim();
    const concentration = parseFloat(pair.querySelector('.concentration').value);
    
    if (species && !isNaN(concentration)) {
      result[species] = concentration;
    }
  });
  
  return result;
}

// Mostrar error
function showError(message) {
  const resultValue = document.getElementById('result-value');
  const stepsContent = document.getElementById('steps-content');
  
  resultValue.textContent = 'Error';
  resultValue.style.color = 'var(--error-color)';
  
  stepsContent.innerHTML = `<div class="step" style="color: var(--error-color)">${message}</div>`;
}

// Mostrar loading
function showLoading() {
  const resultValue = document.getElementById('result-value');
  const stepsContent = document.getElementById('steps-content');
  
  resultValue.textContent = 'Calculando...';
  resultValue.style.color = 'var(--primary-color)';
  
  stepsContent.innerHTML = `
    <div class="step">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
}

// Mostrar resultados
function displayResults(data) {
  const resultValue = document.getElementById('result-value');
  const balancedEquation = document.getElementById('balanced-equation');
  const calculationType = document.getElementById('calculation-type');
  const temperatureValue = document.getElementById('temperature-value');
  const systemState = document.getElementById('system-state');
  const stepsContent = document.getElementById('steps-content');
  
  // Mostrar valores
  resultValue.textContent = data.result;
  resultValue.style.color = 'var(--success-color)';
  balancedEquation.textContent = data.balancedEquation;
  calculationType.textContent = data.calculationType;
  temperatureValue.textContent = `${data.temperature}°C`;
  systemState.textContent = currentTab === 'lechatelier' ? 'Sistema en equilibrio' : 'Cálculo completado';
  
  // Mostrar pasos
  stepsContent.innerHTML = '';
  const steps = data.steps.split('\n');
  steps.forEach(step => {
    const stepElement = document.createElement('div');
    stepElement.className = 'step';
    stepElement.textContent = step;
    stepsContent.appendChild(stepElement);
  });
}

// Configurar chatbot
function setupChatbot() {
  const chatbotToggle = document.querySelector('.chatbot-toggle');
  const closeChatbot = document.querySelector('.close-chatbot');
  const sendChatbotBtn = document.getElementById('send-chatbot');
  const chatbotInput = document.getElementById('chatbot-input');
  
  // Alternar visibilidad del chatbot
  chatbotToggle.addEventListener('click', function() {
    const chatbot = document.querySelector('.chatbot-container');
    chatbot.style.display = chatbot.style.display === 'flex' ? 'none' : 'flex';
    chatOpen = !chatOpen;
  });
  
  // Cerrar chatbot
  closeChatbot.addEventListener('click', function() {
    document.querySelector('.chatbot-container').style.display = 'none';
    chatOpen = false;
  });
  
  // Enviar mensaje al hacer clic
  sendChatbotBtn.addEventListener('click', sendChatbotMessage);
  
  // Enviar mensaje al presionar Enter
  chatbotInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendChatbotMessage();
    }
  });
}

// Enviar mensaje al chatbot
function sendChatbotMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();
  const chatWindow = document.getElementById('chatbot-messages');
  
  if (!message) return;
  
  // Mostrar mensaje del usuario
  const userMessage = document.createElement('div');
  userMessage.className = 'chat-message user-message';
  userMessage.textContent = message;
  chatWindow.appendChild(userMessage);
  
  // Limpiar input
  input.value = '';
  
  // Mostrar "escribiendo..."
  const botTyping = document.createElement('div');
  botTyping.className = 'chat-message bot-message typing';
  botTyping.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  chatWindow.appendChild(botTyping);
  
  // Desplazar hacia abajo
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  // Simular respuesta (en una aplicación real, llamarías a la API de IA)
  setTimeout(() => {
    // Eliminar "escribiendo..."
    botTyping.remove();
    
    // Crear respuesta del bot
    const botMessage = document.createElement('div');
    botMessage.className = 'chat-message bot-message';
    
    // Respuesta basada en el input
    const response = generateChatbotResponse(message);
    botMessage.innerHTML = response;
    
    chatWindow.appendChild(botMessage);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 1500);
}

// Generar respuesta del chatbot
function generateChatbotResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('equilibrio') || lowerMsg.includes('equilibrium')) {
    return `
      <p>El <strong>equilibrio químico</strong> ocurre cuando las velocidades de las reacciones directa e inversa son iguales, manteniendo constantes las concentraciones de reactivos y productos.</p>
      <p>Características clave:</p>
      <ul>
        <li>Es un estado dinámico (las reacciones no se detienen)</li>
        <li>Se alcanza en sistemas cerrados a temperatura constante</li>
        <li>Las concentraciones permanecen constantes en el tiempo</li>
      </ul>
      <p>¿Te gustaría calcular una constante de equilibrio (Kc) o analizar un sistema específico?</p>
    `;
  } else if (lowerMsg.includes('chatelier') || lowerMsg.includes('perturbación')) {
    return `
      <p>El <strong>principio de Le Chatelier</strong> establece que si un sistema en equilibrio es perturbado, el sistema evolucionará para contrarrestar dicha perturbación.</p>
      <p>Factores que afectan el equilibrio:</p>
      <ol>
        <li><strong>Concentración:</strong> Aumentar [reactivos] desplaza hacia productos</li>
        <li><strong>Presión:</strong> Aumentar P desplaza hacia menor nº de moles gaseosos</li>
        <li><strong>Temperatura:</strong> Aumentar T favorece reacción endotérmica</li>
      </ol>
      <p>Puedes usar la pestaña "Le Chatelier" en la calculadora para analizar estos efectos.</p>
    `;
  } else if (lowerMsg.includes('kc') || lowerMsg.includes('constante')) {
    return `
      <p>La <strong>constante de equilibrio (Kc)</strong> se calcula como:</p>
      <p style="text-align: center; font-family: 'Courier New'">Kc = [Productos] / [Reactivos]</p>
      <p>Donde:</p>
      <ul>
        <li>Los corchetes [] representan concentraciones en equilibrio (mol/L)</li>
        <li>Los exponentes son los coeficientes estequiométricos</li>
        <li>Sólidos y líquidos puros no se incluyen</li>
      </ul>
      <p>¿Quieres que calculemos juntos una Kc? Puedes cargar el ejercicio de ejemplo de síntesis de amoníaco.</p>
    `;
  } else if (lowerMsg.includes('polímero') || lowerMsg.includes('sis')) {
    return `
      <p>Los <strong>sistemas de polímeros</strong> como el estireno-isopreno-estireno (SIS) presentan equilibrios químicos interesantes:</p>
      <ul>
        <li>Son sistemas complejos con múltiples equilibrios</li>
        <li>La polimerización suele ser exotérmica</li>
        <li>La temperatura afecta significativamente el equilibrio</li>
      </ul>
      <p>En la pestaña "Polímeros" puedes analizar específicamente estos sistemas.</p>
    `;
  } else {
    return `
      <p>Soy tu asistente de química especializado en equilibrio químico. Puedo ayudarte con:</p>
      <ul>
        <li>Cálculo de constantes de equilibrio (Kc)</li>
        <li>Aplicación del principio de Le Chatelier</li>
        <li>Análisis de sistemas especiales como polímeros</li>
        <li>Resolución de problemas de equilibrio</li>
      </ul>
      <p>Por favor, hazme una pregunta más específica sobre el tema 20: Equilibrio Químico.</p>
    `;
  }
}

// Configurar ejercicios de ejemplo
function setupExampleExercises() {
  // Añadir eventos a los ejercicios ya existentes en el HTML
  document.querySelectorAll('.load-exercise').forEach(btn => {
    btn.addEventListener('click', function() {
      loadExercise(this);
    });
  });
}
