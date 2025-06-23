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

    // Asegurarse de que haya al menos un par de inputs al cargar la página
    initializeConcentrationInputs();
});

// Inicializar inputs de concentración (asegura un campo vacío al inicio)
function initializeConcentrationInputs() {
    // Si no hay inputs para reactivos, añadir uno
    if (document.querySelectorAll('#reactants-inputs-container .input-pair').length === 0) {
        addConcentrationInput('reactants');
    }
    // Si no hay inputs para productos, añadir uno
    if (document.querySelectorAll('#products-inputs-container .input-pair').length === 0) {
        addConcentrationInput('products');
    }
}

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

            // Actualizar la interfaz y limpiar campos al cambiar de tab
            updateCalculatorInterface();
            clearAllInputs(); // Limpiar todos los campos al cambiar de modo
            resetResults(); // Reiniciar la sección de resultados
        });
    });
}

// Actualizar interfaz de la calculadora según el tab seleccionado
function updateCalculatorInterface() {
    // Puedes añadir lógica aquí para mostrar/ocultar campos específicos.
    // Por ejemplo, para Le Chatelier, podrías mostrar un campo para ΔH.
    // Para polímeros, podrías ajustar las etiquetas o mostrar información adicional.
    const temperatureGroup = document.getElementById('temperature').closest('.input-group');
    const calcTargetGroup = document.getElementById('calc-target').closest('.input-group');

    if (currentTab === 'lechatelier') {
        console.log('Modo Le Chatelier: Puedes necesitar input para ΔH.');
        calcTargetGroup.style.display = 'none'; // No se calcula Kc ni concentración directamente
        // Podrías añadir un nuevo input para ΔH si tuvieras la necesidad en el HTML
    } else if (currentTab === 'polimeros') {
        console.log('Modo Polímeros: Consideraciones especiales para ecuaciones de polimerización.');
        calcTargetGroup.style.display = 'block'; // Mostrar selector de cálculo
    } else { // standard
        console.log('Modo Estándar: Cálculo de Kc o concentración.');
        calcTargetGroup.style.display = 'block'; // Mostrar selector de cálculo
    }
    // La temperatura suele ser relevante para todos, así que se mantiene visible.
    temperatureGroup.style.display = 'block';
}

// Limpiar todos los inputs de la calculadora
function clearAllInputs() {
    document.getElementById('equation').value = '';
    document.getElementById('temperature').value = '25'; // Valor por defecto
    document.getElementById('calc-target').value = 'Kc'; // Valor por defecto
    document.getElementById('problem-description').value = ''; // Limpiar descripción

    clearConcentrationInputs('reactants');
    clearConcentrationInputs('products');
}

// Configurar calculadora
function setupCalculator() {
    const calculateBtn = document.getElementById('calculate-btn');
    const addReactantBtn = document.getElementById('add-reactant-btn'); // Usar ID
    const addProductBtn = document.getElementById('add-product-btn'); // Usar ID

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

    // Evento para cargar ejercicios (ya configurado en setupExampleExercises, pero se mantiene aquí por completitud)
    // document.querySelectorAll('.load-exercise').forEach(btn => {
    //     btn.addEventListener('click', function() {
    //         loadExercise(this);
    //     });
    // });
}

// Añadir campo de concentración
function addConcentrationInput(type) {
    const containerId = type === 'reactants' ? 'reactants-inputs-container' : 'products-inputs-container';
    const container = document.getElementById(containerId);

    const inputPair = document.createElement('div');
    inputPair.className = 'input-pair';
    inputPair.innerHTML = `
        <input type="text" placeholder="Especie" class="species">
        <input type="number" placeholder="Conc. (M)" class="concentration" step="any">
        <button class="remove-btn" title="Eliminar"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(inputPair); // Añadir al final del contenedor específico

    // Añadir evento al botón de eliminar para el nuevo par
    inputPair.querySelector('.remove-btn').addEventListener('click', function() {
        // Asegurarse de que siempre quede al menos un campo de entrada
        if (container.querySelectorAll('.input-pair').length > 1) {
            inputPair.remove();
        } else {
            alert('Debe haber al menos un campo para especie y concentración.');
        }
    });
}

// Cargar ejercicio
function loadExercise(button) {
    const equation = button.dataset.equation;
    const reactantsData = button.dataset.reactants;
    const productsData = button.dataset.products;
    const target = button.dataset.target;
    const dh = button.dataset.dh || '';

    // Establecer el tab correcto
    const tabToActivate = document.querySelector(`.calc-tab[data-tab="${target}"]`) || document.querySelector(`.calc-tab[data-tab="standard"]`);
    if (tabToActivate) {
        document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
        tabToActivate.classList.add('active');
        currentTab = tabToActivate.dataset.tab;
        updateCalculatorInterface(); // Actualizar interfaz según el tab
    }


    // Establecer ecuación
    document.getElementById('equation').value = equation;

    // Limpiar y añadir reactivos
    clearConcentrationInputs('reactants');
    const reactants = parseConcentrations(reactantsData);
    for (const [species, conc] of Object.entries(reactants)) {
        addConcentrationWithValues('reactants', species, conc);
    }

    // Limpiar y añadir productos
    clearConcentrationInputs('products');
    const products = parseConcentrations(productsData);
    for (const [species, conc] of Object.entries(products)) {
        addConcentrationWithValues('products', species, conc);
    }

    // Establecer tipo de cálculo si el tab es "standard" o "polimeros"
    const calcTargetSelect = document.getElementById('calc-target');
    if (currentTab === 'standard' || currentTab === 'polimeros') {
        calcTargetSelect.value = target;
    } else {
        // Para Le Chatelier, puede que no haya un 'target' directo para el select
        // y este podría estar oculto. Se ignora o se establece un valor por defecto si es visible.
        calcTargetSelect.value = 'Kc'; // Por defecto
    }

    // Si hay un valor de ΔH, puedes usarlo para el análisis de Le Chatelier.
    // La UI aún necesita un lugar para mostrar o usar este ΔH explícitamente si es necesario.
    if (dh) {
        console.log(`ΔH para el ejercicio cargado: ${dh} kJ/mol`);
        // Podrías mostrarlo en algún lugar, o usarlo en la función analyzeLeChatelier
        // (que ya lo recibe como argumento aunque actualmente no lo usa para el cálculo directo)
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
        // Validar que la concentración sea un número válido antes de añadir
        const parsedConc = parseFloat(conc);
        if (species.trim() && !isNaN(parsedConc)) {
            result[species.trim()] = parsedConc;
        }
    });
    return result;
}

// Limpiar inputs de concentración
function clearConcentrationInputs(type) {
    const containerId = type === 'reactants' ? 'reactants-inputs-container' : 'products-inputs-container';
    const container = document.getElementById(containerId);

    // Eliminar todos los input-pair
    container.innerHTML = '';

    // Asegurarse de que al menos un par de inputs esté presente después de limpiar
    addConcentrationInput(type);
}

// Añadir concentración con valores
function addConcentrationWithValues(type, species, concentration) {
    const containerId = type === 'reactants' ? 'reactants-inputs-container' : 'products-inputs-container';
    const container = document.getElementById(containerId);

    // Si hay un input-pair vacío, lo usamos
    let targetInputPair = null;
    const existingPairs = container.querySelectorAll('.input-pair');
    for (const pair of existingPairs) {
        const speciesInput = pair.querySelector('.species');
        const concInput = pair.querySelector('.concentration');
        if ((speciesInput && !speciesInput.value.trim()) && (concInput && !concInput.value.trim())) {
            targetInputPair = pair;
            break;
        }
    }

    // Si no hay un input-pair vacío, creamos uno nuevo
    if (!targetInputPair) {
        addConcentrationInput(type); // Esta función ya añade el event listener
        targetInputPair = container.querySelector('.input-pair:last-child'); // Obtener el que se acaba de añadir
    }

    if (targetInputPair) {
        targetInputPair.querySelector('.species').value = species;
        targetInputPair.querySelector('.concentration').value = concentration;
    }
}

// Calcular equilibrio químico
function calculateEquilibrium() {
    const equation = document.getElementById('equation').value.trim();
    const problemDescription = document.getElementById('problem-description').value.trim();
    const target = document.getElementById('calc-target').value;
    const temperature = parseFloat(document.getElementById('temperature').value) || 25; // Asegurar que sea número

    const reactants = getSpeciesConcentrations('reactants');
    const products = getSpeciesConcentrations('products');

    // Validaciones iniciales
    if (!equation && !problemDescription && currentTab === 'standard') {
        showError('Por favor, ingresa una ecuación química o describe tu problema.');
        return;
    }
    if (Object.keys(reactants).length === 0 && Object.keys(products).length === 0) {
        showError('Debes ingresar al menos una especie con su concentración, ya sea como reactivo o producto.');
        return;
    }
    if (isNaN(temperature)) {
        showError('La temperatura debe ser un valor numérico válido.');
        return;
    }

    showLoading();

    setTimeout(() => {
        let result, steps;

        try {
            if (currentTab === 'standard') {
                [result, steps] = calculateStandardEquilibrium(equation, reactants, products, target);
            } else if (currentTab === 'lechatelier') {
                [result, steps] = analyzeLeChatelier(equation, reactants, products, temperature);
            } else if (currentTab === 'polimeros') {
                [result, steps] = analyzePolymerSystem(equation, reactants, products);
            } else {
                result = 'N/A';
                steps = 'Tipo de cálculo no reconocido. Por favor, selecciona un tab válido.';
            }

            // Añadir descripción del problema al inicio de los pasos si existe
            if (problemDescription) {
                steps = `Descripción del problema: "${problemDescription}"\n` + steps;
            }

            displayResults({
                balancedEquation: equation || 'No especificada',
                calculationType: getCalculationTypeDescription(target, currentTab),
                result: result,
                steps: steps,
                temperature: temperature
            });

        } catch (error) {
            console.error("Error durante el cálculo:", error);
            showError(`Ocurrió un error inesperado: ${error.message || error}. Por favor, revisa tus entradas.`);
        }
    }, 1500);
}

// Función para reiniciar los resultados a su estado inicial
function resetResults() {
    document.getElementById('result-value').textContent = '-';
    document.getElementById('result-value').style.color = 'var(--accent-color)'; // Color por defecto
    document.getElementById('balanced-equation').textContent = '-';
    document.getElementById('calculation-type').textContent = '-';
    document.getElementById('temperature-value').textContent = '25°C';
    document.getElementById('system-state').textContent = '-';
    document.getElementById('steps-content').innerHTML = '<div class="step">Ingresa una ecuación química y las concentraciones conocidas para ver el proceso de cálculo.</div>';
}

// Cálculo estándar de equilibrio (mejorado)
function calculateStandardEquilibrium(equation, reactants, products, target) {
    let result = '';
    let steps = [];

    steps.push('1. Analizando la ecuación ingresada y sus componentes.');

    // Simple validación de la ecuación (se podría mejorar con regex para parsing)
    if (!equation.includes('⇌')) {
        return ['Error', 'Error: La ecuación no parece ser un equilibrio. Asegúrate de usar "⇌".'];
    }

    // Validación de datos para cálculo de Kc/Concentración
    if (Object.keys(reactants).length === 0 && Object.keys(products).length === 0) {
        return ['Error', 'Error: Se requieren concentraciones de reactivos y productos para el cálculo.'];
    }

    // Simulación de cálculo de Kc
    if (target === 'Kc') {
        let productTerm = 1;
        let reactantTerm = 1;
        let productExpressions = [];
        let reactantExpressions = [];

        // Esto es una simplificación. No parsea coeficientes estequiométricos de la ecuación real.
        // Asume coeficiente 1 para todos, o que el usuario ya ajustó las "concentraciones" para reflejar el coef.
        for (const [species, conc] of Object.entries(products)) {
            productTerm *= conc;
            productExpressions.push(`[${species}] = ${conc} M`);
        }
        for (const [species, conc] of Object.entries(reactants)) {
            reactantTerm *= conc;
            reactantExpressions.push(`[${species}] = ${conc} M`);
        }

        if (reactantTerm === 0) {
            result = 'Kc = Indefinido';
            steps.push('Error: Concentración de reactivos es cero, Kc es indefinido.');
        } else {
            const Kc = (productTerm / reactantTerm).toFixed(4);
            result = `Kc = ${Kc}`;

            steps.push('2. Identificando las especies involucradas y sus concentraciones en equilibrio:');
            steps.push(`   Reactivos: ${reactantExpressions.join(', ')}`);
            steps.push(`   Productos: ${productExpressions.join(', ')}`);
            steps.push('3. Aplicando la Ley de Acción de Masas para Kc:');
            steps.push(`   Kc = [Productos]ⁿ / [Reactivos]ᵐ`);
            steps.push(`4. Sustituyendo valores (asumiendo coeficientes 1 por simplicidad en esta simulación):`);
            steps.push(`   Kc = (${productExpressions.map(e => e.split('=')[1].trim()).join(' × ')}) / (${reactantExpressions.map(e => e.split('=')[1].trim()).join(' × ')})`);
            steps.push(`5. Calculando: Kc = ${Kc}`);
            steps.push('6. El valor de Kc indica la extensión de la reacción hacia los productos en equilibrio.');
        }
    } else if (target === 'concentration') {
        result = 'Cálculo de [X] pendiente';
        steps.push('2. Para calcular una concentración en equilibrio, se necesita la constante Kc de la reacción y/o la concentración inicial/final de todas las demás especies.');
        steps.push('3. Se debe configurar una tabla ICE (Inicial, Cambio, Equilibrio) utilizando la ecuación química balanceada y el valor de Kc (si se conoce).');
        steps.push('4. La resolución generalmente implica resolver una ecuación (cuadrática, cúbica, etc.) para la variable desconocida (x).');
        steps.push('5. Esto es una funcionalidad avanzada que requiere un motor de cálculo simbólico o numérico.');
    }

    return [result, steps.join('\n')];
}

// Análisis de Le Chatelier (mejorado)
function analyzeLeChatelier(equation, reactants, products, temperature) {
    const result = "Análisis del Principio de Le Chatelier";
    let steps = [];

    steps.push('1. Ecuación química bajo análisis: ' + equation);
    steps.push('2. El Principio de Le Chatelier predice cómo un sistema en equilibrio responde a una perturbación.');

    // Aquí podrías parsear la ecuación para contar moles de gas y determinar si es exo/endo.
    // Esto es complejo y requeriría un parser de ecuaciones químicas robusto.
    // Por ahora, asumimos algunos efectos genéricos o basándonos en 'data-dh' del ejercicio.
    // Si tienes un ΔH específico cargado del ejercicio, puedes añadirlo aquí.

    let enthalpyChange = null; // Necesitarías una forma de obtener ΔH
    // Ejemplo: si el ejercicio carga un ΔH:
    // const loadedExerciseDH = document.querySelector('.load-exercise[data-target="lechatelier"].active')?.dataset.dh;
    // if (loadedExerciseDH) enthalpyChange = parseFloat(loadedExerciseDH);

    steps.push('3. Factores que afectan el equilibrio y su efecto:');

    steps.push('   - **Cambio de Concentración:**');
    steps.push('     * Aumentar la concentración de un <b>reactivo</b>: El equilibrio se desplaza hacia los <b>productos</b> (para consumir el exceso).');
    steps.push('     * Disminuir la concentración de un <b>reactivo</b>: El equilibrio se desplaza hacia los <b>reactivos</b> (para reponerlo).');
    steps.push('     * Aumentar la concentración de un <b>producto</b>: El equilibrio se desplaza hacia los <b>reactivos</b> (para consumir el exceso).');
    steps.push('     * Disminuir la concentración de un <b>producto</b>: El equilibrio se desplaza hacia los <b>productos</b> (para reponerlo).');

    steps.push('   - **Cambio de Presión/Volumen (solo para gases):**');
    steps.push('     * <b>Aumento de Presión</b> (Disminución de Volumen): El equilibrio se desplaza hacia el lado con <b>menor número de moles de gas</b>.');
    steps.push('     * <b>Disminución de Presión</b> (Aumento de Volumen): El equilibrio se desplaza hacia el lado con <b>mayor número de moles de gas</b>.');
    steps.push('     * La adición de un gas inerte a volumen constante no afecta el equilibrio.');

    steps.push(`   - **Cambio de Temperatura (actual: ${temperature}°C):**`);
    if (enthalpyChange !== null) {
        if (enthalpyChange < 0) { // Exotérmica
            steps.push('     * Reacción <b>exotérmica</b> (ΔH < 0):');
            steps.push('       * Aumento de temperatura: Desplaza el equilibrio hacia los <b>reactivos</b> (para absorber el calor extra).');
            steps.push('       * Disminución de temperatura: Desplaza el equilibrio hacia los <b>productos</b> (para liberar más calor).');
        } else if (enthalpyChange > 0) { // Endotérmica
            steps.push('     * Reacción <b>endotérmica</b> (ΔH > 0):');
            steps.push('       * Aumento de temperatura: Desplaza el equilibrio hacia los <b>productos</b> (para absorber más calor).');
            steps.push('       * Disminución de temperatura: Desplaza el equilibrio hacia los <b>reactivos</b> (para reponer el calor).');
        } else {
            steps.push('     * No se ha especificado si la reacción es endotérmica o exotérmica (ΔH = 0).');
        }
    } else {
        steps.push('     * Se necesita el valor de ΔH (cambio de entalpía) para predecir con exactitud el efecto de la temperatura.');
        steps.push('       * (Generalmente: un aumento de T favorece la reacción endotérmica; una disminución de T favorece la exotérmica).');
    }


    steps.push('   - **Adición de un Catalizador:**');
    steps.push('     * Un catalizador <b>no afecta la posición del equilibrio</b>. Solo acelera la velocidad a la que se alcanza el equilibrio, tanto en la reacción directa como en la inversa.');

    steps.push('4. Conclusión: El sistema se ajustará para minimizar el efecto de la perturbación y establecerá un nuevo estado de equilibrio.');

    return [result, steps.join('\n')];
}

// Análisis de sistema de polímeros (mejorado)
function analyzePolymerSystem(equation, reactants, products) {
    let result = "Análisis del Sistema de Polímeros";
    let steps = [];

    steps.push('1. Analizando el sistema de polímeros: ' + (equation || 'sin ecuación específica, asumiendo generalidades.'));
    steps.push('2. La química de polímeros se rige por equilibrios de polimerización y despolimerización.');

    // Simulación de cálculo de Kc para SIS: 2S + I ⇌ SIS
    // Asume que las especies ingresadas son S, I, SIS
    if (equation.toLowerCase().includes('sis') || equation.toLowerCase().includes('estireno') || equation.toLowerCase().includes('isopreno')) {
        let S_conc = reactants['S'] || reactants['s'] || 0;
        let I_conc = reactants['I'] || reactants['i'] || 0;
        let SIS_conc = products['SIS'] || products['sis'] || 0;

        // Si tenemos las tres concentraciones, calculamos una Kc de ejemplo
        if (S_conc > 0 && I_conc > 0 && SIS_conc > 0) {
            // Kc = [SIS] / ([S]^2 * [I])
            if (Math.pow(S_conc, 2) * I_conc !== 0) {
                const Kc_sis = (SIS_conc / (Math.pow(S_conc, 2) * I_conc)).toFixed(4);
                result = `Kc (SIS) = ${Kc_sis}`;
                steps.push(`3. Calculando la constante de equilibrio (Kc) para la formación de SIS:`);
                steps.push(`   Para 2S + I ⇌ SIS: Kc = [SIS] / ([S]² × [I])`);
                steps.push(`   Sustituyendo valores: Kc = ${SIS_conc} / (${S_conc}² × ${I_conc})`);
                steps.push(`   Kc (simulado) = ${Kc_sis}`);
            } else {
                steps.push('3. No se pudo calcular Kc: Denominador cero. Revisa las concentraciones de monómeros.');
                result = 'Kc no calculable';
            }
        } else {
            steps.push('3. No hay suficientes datos de concentración (S, I, SIS) para calcular Kc en este sistema polimérico.');
        }
    } else {
        steps.push('3. No se ha reconocido una ecuación específica para polímeros; se realizará un análisis general.');
    }

    steps.push('4. Consideraciones clave en sistemas de polímeros en equilibrio:');
    steps.push('   - **Grado de Polimerización:** Altas concentraciones de monómero y bajas temperaturas favorecen un mayor grado de polimerización (más unidades unidas).');
    steps.push('   - **Temperatura:** Para muchas polimerizaciones (exotérmicas), un aumento de temperatura favorece la despolimerización (rompimiento del polímero).');
    steps.push('   - **Entropía:** La polimerización a menudo disminuye la entropía, lo que la hace menos favorable a altas temperaturas.');
    steps.push('   - **Cinetica vs. Termodinámica:** La velocidad de reacción (cinética) y la posición del equilibrio (termodinámica) son cruciales para el control de la síntesis de polímeros.');
    steps.push('5. Aplicaciones: Los polímeros como SIS son elastómeros termoplásticos con diversas aplicaciones, desde adhesivos hasta calzado, debido a su capacidad de formar redes físicas reversibles.');

    return [result, steps.join('\n')];
}

// Obtener descripción del tipo de cálculo
function getCalculationTypeDescription(target, tab) {
    if (tab === 'lechatelier') return 'Análisis de Le Chatelier';
    if (tab === 'polimeros') return 'Análisis de Sistema Polimérico';
    return target === 'Kc' ? 'Cálculo de Kc' : 'Cálculo de Concentración en Equilibrio';
}

// Obtener concentraciones de especies
function getSpeciesConcentrations(type) {
    const containerId = type === 'reactants' ? 'reactants-inputs-container' : 'products-inputs-container';
    const container = document.getElementById(containerId);

    const result = {};
    const inputPairs = container.querySelectorAll('.input-pair');

    inputPairs.forEach(pair => {
        const speciesInput = pair.querySelector('.species');
        const concentrationInput = pair.querySelector('.concentration');

        if (speciesInput && concentrationInput) {
            const species = speciesInput.value.trim();
            const concentration = parseFloat(concentrationInput.value);

            if (species && !isNaN(concentration)) {
                result[species] = concentration;
            }
        }
    });

    return result;
}

// Mostrar error
function showError(message) {
    const resultValue = document.getElementById('result-value');
    const stepsContent = document.getElementById('steps-content');
    const calculationType = document.getElementById('calculation-type');
    const systemState = document.getElementById('system-state');
    const balancedEquation = document.getElementById('balanced-equation'); // También limpiar esto

    resultValue.textContent = '¡Error!';
    resultValue.style.color = 'var(--error-color)';
    calculationType.textContent = 'Problema detectado';
    systemState.textContent = 'Revisa los datos';
    balancedEquation.textContent = 'N/A'; // Reiniciar ecuación


    stepsContent.innerHTML = `<div class="step" style="color: var(--error-color);"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
}

// Mostrar loading
function showLoading() {
    const resultValue = document.getElementById('result-value');
    const stepsContent = document.getElementById('steps-content');
    const balancedEquation = document.getElementById('balanced-equation');
    const calculationType = document.getElementById('calculation-type');
    const temperatureValue = document.getElementById('temperature-value');
    const systemState = document.getElementById('system-state');

    resultValue.textContent = 'Calculando...';
    resultValue.style.color = 'var(--primary-color)'; // Color de carga
    balancedEquation.textContent = 'Procesando...';
    calculationType.textContent = 'Procesando...';
    temperatureValue.textContent = document.getElementById('temperature').value + '°C';
    systemState.textContent = 'Analizando sistema...';


    stepsContent.innerHTML = `
        <div class="step loading-step">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
            <p>Procesando tu solicitud, por favor espera...</p>
        </div>
    `;
    // Scroll a los resultados para que el usuario vea el loading
    document.getElementById('results-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    resultValue.style.color = 'var(--success-color)'; // Éxito
    balancedEquation.textContent = data.balancedEquation;
    calculationType.textContent = data.calculationType;
    temperatureValue.textContent = `${data.temperature}°C`;
    systemState.textContent = 'Cálculo completado';

    // Mostrar pasos
    stepsContent.innerHTML = '';
    const steps = data.steps.split('\n');
    steps.forEach(stepText => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step';
        // Usar innerHTML para permitir negritas o HTML simple en los pasos
        stepElement.innerHTML = `<i class="fas fa-check-circle"></i> ${stepText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}`;
        stepsContent.appendChild(stepElement);
    });

    // Scroll a los resultados para que el usuario vea el resultado final
    document.getElementById('results-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// Configurar chatbot
function setupChatbot() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const closeChatbot = document.querySelector('.close-chatbot');
    const sendChatbotBtn = document.getElementById('send-chatbot');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotContainer = document.querySelector('.chatbot-container');

    // Alternar visibilidad del chatbot
    chatbotToggle.addEventListener('click', function() {
        chatbotContainer.style.display = chatbotContainer.style.display === 'flex' ? 'none' : 'flex';
        chatOpen = !chatOpen;
        if (chatOpen) {
            chatbotInput.focus(); // Enfocar el input cuando se abre el chat
            document.getElementById('chatbot-messages').scrollTop = document.getElementById('chatbot-messages').scrollHeight;
        }
    });

    // Cerrar chatbot
    closeChatbot.addEventListener('click', function() {
        chatbotContainer.style.display = 'none';
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
        botMessage.innerHTML = response; // Usar innerHTML para el formato HTML de la respuesta

        chatWindow.appendChild(botMessage);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }, 1500);
}

// Generar respuesta del chatbot (mejorada)
function generateChatbotResponse(message) {
    const lowerMsg = message.toLowerCase();

    // Respuestas específicas para temas químicos
    if (lowerMsg.includes('equilibrio') || lowerMsg.includes('equilibrium') || lowerMsg.includes('equilibrio quimico')) {
        return `
            <p>El <strong>equilibrio químico</strong> es un estado dinámico donde las velocidades de las reacciones directa e inversa son iguales, y las concentraciones de reactivos y productos permanecen constantes.</p>
            <p>Es un concepto fundamental en química que nos ayuda a entender hasta qué punto avanza una reacción. ¿Te gustaría calcular un equilibrio o analizar una reacción específica?</p>
        `;
    } else if (lowerMsg.includes('chatelier') || lowerMsg.includes('perturbación') || lowerMsg.includes('le chatelier')) {
        return `
            <p>El <strong>Principio de Le Chatelier</strong> predice que si un sistema en equilibrio es perturbado, se ajustará para minimizar esa perturbación y restablecer un nuevo equilibrio.</p>
            <p>Las principales perturbaciones incluyen cambios de <strong>concentración</strong>, <strong>presión</strong> (para gases) y <strong>temperatura</strong>. ¿Quieres un ejemplo de cómo cada uno afecta el equilibrio?</p>
        `;
    } else if (lowerMsg.includes('kc') || lowerMsg.includes('constante') || lowerMsg.includes('calculo kc')) {
        return `
            <p>La <strong>constante de equilibrio (Kc)</strong> es un valor numérico que relaciona las concentraciones de productos y reactivos en el equilibrio de una reacción.</p>
            <p style="text-align: center; font-family: 'Courier New', monospace; background-color: #e9ecef; padding: 8px; border-radius: 5px;">Kc = [Productos]^(coef.) / [Reactivos]^(coef.)</p>
            <p>Un valor alto de Kc indica que en el equilibrio hay más productos que reactivos. ¿Tienes una reacción y concentraciones para calcularla?</p>
        `;
    } else if (lowerMsg.includes('polímero') || lowerMsg.includes('sis') || lowerMsg.includes('estireno') || lowerMsg.includes('isopreno')) {
        return `
            <p>Los <strong>sistemas de polímeros</strong>, como el estireno-isopreno-estireno (SIS), implican complejos equilibrios de polimerización y despolimerización.</p>
            <p>Factores como la temperatura, presión y concentración de monómeros son críticos para controlar el proceso y las propiedades del polímero final. ¿Qué tipo de equilibrio te interesa sobre polímeros?</p>
        `;
    } else if (lowerMsg.includes('hola') || lowerMsg.includes('hi') || lowerMsg.includes('qué tal') || lowerMsg.includes('saludos')) {
        const greetings = [
            "¡Hola! Soy tu asistente de química, listo para ayudarte. ¿En qué podemos sumergirnos hoy?",
            "¡Saludos! ¿Cómo puedo ayudarte con el fascinante mundo del equilibrio químico?",
            "¡Hola! Dime qué problema o pregunta de química tienes en mente. ¡Estoy aquí para resolverlo!"
        ];
        return `<p>${greetings[Math.floor(Math.random() * greetings.length)]}</p>`;
    } else if (lowerMsg.includes('gracias') || lowerMsg.includes('muchas gracias') || lowerMsg.includes('agradezco')) {
        const thanks = [
            "¡De nada! Es un placer ayudarte. No dudes en preguntar si surge algo más.",
            "¡Siempre a la orden! Me alegra poder contribuir a tu aprendizaje.",
            "¡Con gusto! Sigo aquí por si necesitas más ayuda con la química."
        ];
        return `<p>${thanks[Math.floor(Math.random() * thanks.length)]}</p>`;
    } else if (lowerMsg.includes('adiós') || lowerMsg.includes('hasta luego') || lowerMsg.includes('chao')) {
        const goodbyes = [
            "¡Hasta pronto! Que tengas un excelente día de estudio.",
            "¡Adiós! No dudes en volver si te surge otra pregunta química.",
            "¡Cuídate! Sigue explorando el mundo de la química. ¡Es apasionante!"
        ];
        return `<p>${goodbyes[Math.floor(Math.random() * goodbyes.length)]}</p>`;
    }
    // Respuestas por defecto más variadas
    else {
        const defaultResponses = [
            "Hmm, esa es una pregunta interesante. No estoy seguro de si está directamente relacionada con equilibrio químico, pero soy un asistente de química y ¡estoy aquí para explorar contigo! ¿Qué tema de química te gustaría que revisáramos?",
            "Mi fuerte es el equilibrio químico y Le Chatelier, pero puedo intentar ayudarte con otros temas de química. ¿Podrías darme más detalles o reformular tu pregunta?",
            "Esa pregunta va un poco más allá de mi conocimiento actual. Sin embargo, si está relacionada con química, podemos intentar desglosarla. ¿Es sobre reacciones, estequiometría, termodinámica o algo más específico?",
            "¡Me encanta la curiosidad! Si no es sobre equilibrio, a veces puedo conectar ideas. ¿Puedes especificar si es sobre algún otro concepto de química que te interese?"
        ];
        return `<p>${defaultResponses[Math.floor(Math.random() * defaultResponses.length)]}</p>`;
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
