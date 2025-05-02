/**
 * Clase para manejar el cálculo del IMC
 */
class IMCCalculator {
    /**
     * Constructor de la clase
     * @param {number} weight - Peso en kilogramos
     * @param {number} height - Altura en centímetros
     */
    constructor(weight, height) {
        this.weight = weight;
        this.height = height / 100; // Convertir cm a metros
    }

    /**
     * Calcula el IMC
     * @returns {number} - Valor del IMC redondeado a un decimal
     */
    calculate() {
        const imc = this.weight / (this.height * this.height);
        return Math.round(imc * 10) / 10;
    }

    /**
     * Determina la categoría del IMC
     * @param {number} imc - Valor del IMC
     * @returns {Object} - Objeto con la categoría y la clase CSS
     */
    getCategory(imc) {
        if (imc < 18.5) {
            return {
                name: "Bajo Peso",
                cssClass: "category-underweight"
            };
        } else if (imc < 25) {
            return {
                name: "Peso Normal",
                cssClass: "category-normal"
            };
        } else if (imc < 30) {
            return {
                name: "Sobrepeso",
                cssClass: "category-overweight"
            };
        } else {
            return {
                name: "Obesidad",
                cssClass: "category-obese"
            };
        }
    }
}

/**
 * Clase para manejar el historial de cálculos
 */
class IMCHistory {
    constructor() {
        this.storageKey = 'imcHistory';
        this.maxEntries = 5;
    }

    /**
     * Obtiene el historial almacenado
     * @returns {Array} - Array con el historial
     */
    getHistory() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    /**
     * Guarda un nuevo cálculo en el historial
     * @param {number} weight - Peso en kilogramos
     * @param {number} height - Altura en metros
     * @param {number} imc - Valor del IMC
     * @param {string} category - Categoría del IMC
     */
    saveCalculation(weight, height, imc, category) {
        let history = this.getHistory();
        
        const newEntry = {
            weight: weight,
            height: height,
            imc: imc,
            category: category,
            date: new Date().toISOString()
        };
        
        // Agregar al inicio del array
        history.unshift(newEntry);
        
        // Mantener solo los últimos N cálculos
        if (history.length > this.maxEntries) {
            history = history.slice(0, this.maxEntries);
        }
        
        // Guardar en localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(history));
    }
}

/**
 * Clase para manejar la interfaz de usuario
 */
class IMCApp {
    constructor() {
        // Referencias a los elementos del DOM
        this.weightInput = document.getElementById('weight');
        this.heightInput = document.getElementById('height');
        this.calculateButton = document.getElementById('calculateButton');
        this.resetButton = document.getElementById('resetButton');
        this.helpButton = document.getElementById('helpButton');
        this.imcForm = document.getElementById('imcForm');
        this.resultContainer = document.getElementById('resultContainer');
        this.imcValue = document.getElementById('imcValue');
        this.imcCategory = document.getElementById('imcCategory');
        this.historyList = document.getElementById('historyList');
        this.spinner = document.querySelector('.spinner-border');
        
        // Instanciar el historial
        this.history = new IMCHistory();
        
        // Configurar el modal de ayuda
        this.helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
        
        // Inicializar eventos
        this.initEvents();
        
        // Cargar el historial al iniciar
        this.updateHistoryList();
    }

    /**
     * Inicializa los eventos de la aplicación
     */
    initEvents() {
        // Mostrar el modal de ayuda
        this.helpButton.addEventListener('click', () => {
            this.helpModal.show();
        });
        
        // Calcular IMC
        this.calculateButton.addEventListener('click', () => {
            this.handleCalculation();
        });
        
        // Reiniciar el formulario
        this.resetButton.addEventListener('click', () => {
            this.resetForm();
        });
    }

    /**
     * Maneja el proceso de cálculo del IMC
     */
    handleCalculation() {
        // Validar entradas
        if (!this.validateInputs()) return;
        
        // Mostrar el spinner
        this.spinner.style.display = 'inline-block';
        this.calculateButton.disabled = true;
        
        // Simular la llamada a la API
        setTimeout(() => {
            const weight = parseFloat(this.weightInput.value);
            const height = parseFloat(this.heightInput.value);
            
            // Crear instancia del calculador
            const calculator = new IMCCalculator(weight, height);
            
            // Calcular IMC
            const imc = calculator.calculate();
            
            // Obtener categoría
            const category = calculator.getCategory(imc);
            
            // Mostrar el resultado
            this.displayResult(imc, category);
            
            // Guardar en el historial
            this.history.saveCalculation(weight, height/100, imc, category.name);
            
            // Actualizar la lista de historial
            this.updateHistoryList();
            
            // Mostrar el contenedor de resultados y ocultar el formulario
            this.imcForm.style.display = 'none';
            this.resultContainer.style.display = 'block';
            
            // Ocultar el spinner
            this.spinner.style.display = 'none';
            this.calculateButton.disabled = false;
        }, 1500); // Simular tiempo de respuesta
    }

    /**
     * Valida las entradas del formulario
     * @returns {boolean} - true si las entradas son válidas, false en caso contrario
     */
    validateInputs() {
        let isValid = true;
        
        // Validar peso
        if (!this.weightInput.value || this.weightInput.value <= 0) {
            this.weightInput.classList.add('is-invalid');
            isValid = false;
        } else {
            this.weightInput.classList.remove('is-invalid');
        }
        
        // Validar altura
        if (!this.heightInput.value || this.heightInput.value <= 0) {
            this.heightInput.classList.add('is-invalid');
            isValid = false;
        } else {
            this.heightInput.classList.remove('is-invalid');
        }
        
        return isValid;
    }

    /**
     * Muestra el resultado del cálculo
     * @param {number} imc - Valor del IMC
     * @param {Object} category - Objeto con la categoría y la clase CSS
     */
    displayResult(imc, category) {
        this.imcValue.textContent = imc.toFixed(1);
        this.imcCategory.textContent = category.name;
        this.imcCategory.className = `result-category ${category.cssClass}`;
    }

    /**
     * Reinicia el formulario
     */
    resetForm() {
        this.imcForm.style.display = 'block';
        this.resultContainer.style.display = 'none';
        this.weightInput.value = '';
        this.heightInput.value = '';
    }

    /**
     * Actualiza la lista de historial
     */
    updateHistoryList() {
        // Obtener el historial
        const history = this.history.getHistory();
        
        // Limpiar la lista actual
        this.historyList.innerHTML = '';
        
        // Si no hay historial, mostrar un mensaje
        if (history.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'history-item';
            emptyItem.textContent = 'No hay cálculos previos';
            this.historyList.appendChild(emptyItem);
            return;
        }
        
        // Agregar cada entrada a la lista
        history.forEach(entry => {
            const item = document.createElement('li');
            item.className = 'history-item';
            
            // Crear el contenido del item
            const infoDiv = document.createElement('div');
            
            const imcSpan = document.createElement('strong');
            imcSpan.textContent = `IMC: ${entry.imc.toFixed(1)}`;
            
            const categorySpan = document.createElement('span');
            categorySpan.textContent = ` - ${entry.category}`;
            categorySpan.style.marginLeft = '10px';
            
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'small text-muted';
            detailsDiv.textContent = `Peso: ${entry.weight} kg, Altura: ${(entry.height * 100).toFixed(0)} cm`;
            
            infoDiv.appendChild(imcSpan);
            infoDiv.appendChild(categorySpan);
            infoDiv.appendChild(detailsDiv);
            
            // Crear la fecha
            const dateDiv = document.createElement('div');
            dateDiv.className = 'history-date';
            
            // Formatear la fecha con moment.js
            const formattedDate = moment(entry.date).locale('es').format('DD MMM YYYY, HH:mm');
            dateDiv.textContent = formattedDate;
            
            // Agregar todo al item
            item.appendChild(infoDiv);
            item.appendChild(dateDiv);
            
            // Agregar el item a la lista
            this.historyList.appendChild(item);
        });
    }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const app = new IMCApp();
});