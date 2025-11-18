// Precios de las categorías de boletos
const TICKET_PRICES = {
    vip: 50.00,
    butacas: 30.00,
    generales: 15.00
};

// Nombres completos de las categorias
const CATEGORY_NAMES = {
    vip: "VIP",
    butacas: "Butacas",
    generales: "Generales"
};

// Estado de la aplicación
let sales = [];
let totals = {
    vip: { quantity: 0, amount: 0 },
    butacas: { quantity: 0, amount: 0 },
    generales: { quantity: 0, amount: 0 },
    overall: { quantity: 0, amount: 0 }
};

const ticketForm = document.getElementById('ticketForm');
const clientNameInput = document.getElementById('clientName');
const ticketCategorySelect = document.getElementById('ticketCategory');
const ticketQuantityInput = document.getElementById('ticketQuantity');
const resetFormButton = document.getElementById('resetForm');
const salesTableBody = document.getElementById('salesTableBody');
const noSalesMessage = document.getElementById('noSalesMessage');
const totalTicketsElement = document.getElementById('totalTickets');
const totalAmountElement = document.getElementById('totalAmount');
const vipSummaryElement = document.getElementById('vipSummary');
const butacasSummaryElement = document.getElementById('butacasSummary');
const generalesSummaryElement = document.getElementById('generalesSummary');


document.addEventListener('DOMContentLoaded', function() {

    loadSalesFromStorage();
    
    updateUI();
    
    ticketForm.addEventListener('submit', handleFormSubmit);
    resetFormButton.addEventListener('click', resetForm);
});

function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    

    const clientName = clientNameInput.value.trim();
    const category = ticketCategorySelect.value;
    const quantity = parseInt(ticketQuantityInput.value);
    

    const price = TICKET_PRICES[category];
    const total = price * quantity;
    

    const sale = {
        id: Date.now(),
        clientName,
        category,
        quantity,
        total
    };
    
    // Agregar la venta y impiar el formulario
    addSale(sale);
    
    resetForm();
    
    showMessage('Venta registrada exitosamente', 'success');
}

// Validar el formulario y confirmar que esta correcto
function validateForm() {
    const clientName = clientNameInput.value.trim();
    const category = ticketCategorySelect.value;
    const quantity = parseInt(ticketQuantityInput.value);
    
    if (clientName === '') {
        showMessage('Por favor ingrese el nombre del cliente', 'error');
        clientNameInput.focus();
        return false;
    }
  
    if (category === '') {
        showMessage('Por favor seleccione una categoría de boletos', 'error');
        ticketCategorySelect.focus();
        return false;
    }

    if (isNaN(quantity) || quantity < 1) {
        showMessage('Por favor ingrese una cantidad válida de boletos', 'error');
        ticketQuantityInput.focus();
        return false;
    }
    
    return true;
}

// Agregar una venta
function addSale(sale) {

    sales.push(sale);
    
    updateTotals(sale);
    
    saveSalesToStorage();
    
    updateUI();
}

// Actualizar totales
function updateTotals(sale) {
    const { category, quantity, total } = sale;
    
    totals[category].quantity += quantity;
    totals[category].amount += total;
    

    totals.overall.quantity += quantity;
    totals.overall.amount += total;
}

// Actualizar la interfaz de usuario
function updateUI() {
    updateSalesTable();
    updateSummary();
    updateNoSalesMessage();
}

// Actualizar la tabla de ventas
function updateSalesTable() {

    salesTableBody.innerHTML = '';
    
    // Si no hay ventas, mostrar mensaje
    if (sales.length === 0) {
        noSalesMessage.style.display = 'block';
        return;
    }
    

    noSalesMessage.style.display = 'none';
    
    // Agregar cada venta a la tabla
    sales.forEach(sale => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${sale.clientName}</td>
            <td>${CATEGORY_NAMES[sale.category]}</td>
            <td>${sale.quantity}</td>
            <td>$${sale.total.toFixed(2)}</td>
            <td>
                <button class="delete-btn" data-id="${sale.id}">Eliminar</button>
            </td>
        `;
        
        salesTableBody.appendChild(row);
    });
    
    // Agregar event listeners a los botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const saleId = parseInt(this.getAttribute('data-id'));
            deleteSale(saleId);
        });
    });
}

// Actualizar el resumen
function updateSummary() {

    totalTicketsElement.textContent = totals.overall.quantity;
    totalAmountElement.textContent = `$${totals.overall.amount.toFixed(2)}`;
    
    vipSummaryElement.textContent = `${totals.vip.quantity} boletos - $${totals.vip.amount.toFixed(2)}`;
    butacasSummaryElement.textContent = `${totals.butacas.quantity} boletos - $${totals.butacas.amount.toFixed(2)}`;
    generalesSummaryElement.textContent = `${totals.generales.quantity} boletos - $${totals.generales.amount.toFixed(2)}`;
}


function updateNoSalesMessage() {
    noSalesMessage.style.display = sales.length === 0 ? 'block' : 'none';
}

// Eliminar una venta
function deleteSale(saleId) {
    if (confirm('¿Está seguro de que desea eliminar esta venta?')) {
 
        const saleIndex = sales.findIndex(sale => sale.id === saleId);
        
        if (saleIndex !== -1) {
            const sale = sales[saleIndex];
            
            // Restar de los totales
            totals[sale.category].quantity -= sale.quantity;
            totals[sale.category].amount -= sale.total;
            totals.overall.quantity -= sale.quantity;
            totals.overall.amount -= sale.total;
            
            sales.splice(saleIndex, 1);
          
            saveSalesToStorage();
            
            updateUI();
        
            showMessage('Venta eliminada exitosamente', 'success');
        }
    }
}

// Limpiar el formulario
function resetForm() {
    ticketForm.reset();
    clientNameInput.focus();
}

// Mostrar mensajes temporales
function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    
    // Estilos del mensaje
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    `;
    
    if (type === 'success') {
        messageElement.style.backgroundColor = '#2ecc71';
    } else if (type === 'error') {
        messageElement.style.backgroundColor = '#e74c3c';
    }
    
    // Agregar al documento
    document.body.appendChild(messageElement);
    

    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }, 3000);
}

// Guardar ventas
function saveSalesToStorage() {
    const data = {
        sales,
        totals
    };
    
    localStorage.setItem('eventosPanamaSales', JSON.stringify(data));
}


function loadSalesFromStorage() {
    const storedData = localStorage.getItem('eventosPanamaSales');
    
    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            sales = data.sales || [];
            totals = data.totals || {
                vip: { quantity: 0, amount: 0 },
                butacas: { quantity: 0, amount: 0 },
                generales: { quantity: 0, amount: 0 },
                overall: { quantity: 0, amount: 0 }
            };
        } catch (error) {
            console.error('Error al cargar datos del almacenamiento:', error);
            sales = [];
            totals = {
                vip: { quantity: 0, amount: 0 },
                butacas: { quantity: 0, amount: 0 },
                generales: { quantity: 0, amount: 0 },
                overall: { quantity: 0, amount: 0 }
            };
        }
    }
}