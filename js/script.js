// Data Storage
let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let debts = JSON.parse(localStorage.getItem('debts')) || [];
let savings = JSON.parse(localStorage.getItem('savings')) || [];

// Date Filter Variables
let currentDateFilter = {
    from: null,
    to: null,
    active: false
};

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('incomeDate').valueAsDate = new Date();
    document.getElementById('expenseDate').valueAsDate = new Date();
    document.getElementById('reportMonth').valueAsDate = new Date();

    updateDashboard();
    updateAllLists();

    // Theme initialization
    initThemeToggle();
});

// THEME TOGGLE LOGIC
function initThemeToggle() {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    const STORAGE_KEY = 'emt-theme';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    let stored = localStorage.getItem(STORAGE_KEY);

    function applyTheme(theme) {
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            btn.setAttribute('aria-pressed', 'true');
            btn.setAttribute('aria-label', 'Cambiar a modo claro');
            swapIcon('moon');
        } else {
            root.removeAttribute('data-theme');
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('aria-label', 'Cambiar a modo oscuro');
            swapIcon('sun');
        }
    }

    function swapIcon(mode) {
        const svg = document.getElementById('themeIconSvg');
        if (!svg) return;
        svg.innerHTML = '';
        if (mode === 'moon') {
            // moon icon
            const path = document.createElementNS('http://www.w3.org/2000/svg','path');
            path.setAttribute('d','M21 12.79A9 9 0 0 1 11.21 3 7 7 0 0 0 12 17a7 7 0 0 0 9-4.21Z');
            path.setAttribute('fill','currentColor');
            svg.appendChild(path);
        } else {
            // sun icon
            svg.innerHTML = `
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
        }
    }

    // Determine initial theme
    let initial = stored || (prefersDark.matches ? 'dark' : 'light');
    applyTheme(initial);

    btn.addEventListener('click', () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        const next = isDark ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
    });

    // Sync with system changes if user hasn't explicitly chosen
    prefersDark.addEventListener('change', (e) => {
        const explicit = localStorage.getItem(STORAGE_KEY);
        if (explicit) return; // user preference overrides
        applyTheme(e.matches ? 'dark' : 'light');
    });
}

// NAV TOGGLE LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.nav-toggle');
    const wrapper = document.querySelector('.nav-scroll-wrapper');
    if (!toggle || !wrapper) return;

    function syncVisibility() {
        if (window.innerWidth <= 930) {
            toggle.style.display = 'inline-flex';
        } else {
            toggle.style.display = 'none';
            wrapper.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    toggle.addEventListener('click', () => {
        const isOpen = wrapper.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    window.addEventListener('resize', syncVisibility);
    syncVisibility();
});

// Tab Management
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
tab.classList.remove('active');
});
    document.querySelectorAll('.nav-tab').forEach(tab => {
tab.classList.remove('active');
});

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Validation Functions
function validateInput(value, type = 'text') {
    switch (type) {
case 'number':
    return !isNaN(value) && parseFloat(value) >= 0;
case 'date':
    return new Date(value).getTime() > 0;
case 'text':
    return value.trim().length > 0;
default:
    return true;
}
}

function showAlert(message, type = 'danger') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = message;

    const container = document.querySelector('.tab-content.active .card');
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => alertDiv.remove(), 5000);
}

// Income Management
function addIncome() {
    const validationError = validateForm('income');
    if (validationError) {
showAlert(validationError);
return;
}

    const description = document.getElementById('incomeDescription').value.trim();
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const frequency = document.getElementById('incomeFrequency').value;
    const date = document.getElementById('incomeDate').value;

    const income = {
id: Date.now(),
description,
amount,
frequency,
date,
monthlyAmount: calculateMonthlyAmount(amount, frequency)
};

    incomes.push(income);
    saveToLocalStorage();
    updateDashboard();
    updateIncomeList();
    clearIncomeForm();
    showAlert('Ingreso agregado exitosamente', 'success');
}

function calculateMonthlyAmount(amount, frequency) {
    switch (frequency) {
case 'weekly': return amount * 4.33;
case 'biweekly': return amount * 2;
case 'monthly': return amount;
case 'irregular': return amount / 12; // Promedio anual
default: return amount;
}
}

function clearIncomeForm() {
    document.getElementById('incomeDescription').value = '';
    document.getElementById('incomeAmount').value = '';
    document.getElementById('incomeDate').valueAsDate = new Date();
}

function updateIncomeList() {
    const list = document.getElementById('incomeList');
    list.innerHTML = '';

    incomes.forEach(income => {
const item = document.createElement('div');
item.className = 'item';
item.innerHTML = `
            <div class="item-info">
                <strong>${income.description}</strong><br>
                $${income.amount.toFixed(2)} (${income.frequency}) - Mensual: $${income.monthlyAmount.toFixed(2)}<br>
                <small>Fecha: ${new Date(income.date).toLocaleDateString()}</small>
            </div>
            <div class="item-actions">
                <button class="btn btn-danger btn-small" onclick="deleteIncome(${income.id})">🗑️</button>
            </div>
        `;
list.appendChild(item);
});
}

function deleteIncome(id) {
    incomes = incomes.filter(income => income.id !== id);
    saveToLocalStorage();
    updateDashboard();
    updateIncomeList();
    showAlert('Ingreso eliminado', 'warning');
}

// Expense Management
function addExpense() {
    const validationError = validateForm('expense');
    if (validationError) {
showAlert(validationError);
return;
}

    const description = document.getElementById('expenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const date = document.getElementById('expenseDate').value;
    const expenseType = document.getElementById('expenseType').value;
    const recurringFrequency = document.getElementById('recurringFrequency').value;
    const recurringEndDate = document.getElementById('recurringEndDateInput').value;

    if (expenseType === 'recurring') {
// Generate recurring expenses
const generatedExpenses = generateRecurringExpenses({
    description,
    amount,
    category,
    startDate: new Date(date),
    frequency: recurringFrequency,
    endDate: recurringEndDate ? new Date(recurringEndDate) : null
});

expenses.push(...generatedExpenses);
showAlert(`${generatedExpenses.length} gastos recurrentes generados exitosamente`, 'success');
} else {
// Single expense
const expense = {
    id: Date.now(),
    description,
    amount,
    category,
    date,
    type: 'single'
};

expenses.push(expense);
showAlert('Gasto agregado exitosamente', 'success');
}

    saveToLocalStorage();
    updateDashboard();
    updateExpensesList();
    clearExpenseForm();
}

function clearExpenseForm() {
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDate').valueAsDate = new Date();
    document.getElementById('expenseType').value = 'single';
    document.getElementById('recurringEndDateInput').value = '';
    toggleRecurringOptions();
}

function toggleRecurringOptions() {
    const expenseType = document.getElementById('expenseType').value;
    const recurringOptions = document.getElementById('recurringOptions');
    const recurringEndDate = document.getElementById('recurringEndDate');
    const expenseDateInput = document.getElementById('expenseDate');

    if (expenseType === 'recurring') {
recurringOptions.style.display = 'block';
recurringEndDate.style.display = 'block';

// Auto-set date to first day of next month for recurring expenses
const today = new Date();
const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
expenseDateInput.valueAsDate = nextMonth;
} else {
recurringOptions.style.display = 'none';
recurringEndDate.style.display = 'none';

// Reset to today for single expenses
expenseDateInput.valueAsDate = new Date();
}
}

function generateRecurringExpenses({ description, amount, category, startDate, frequency, endDate }) {
    const expenses = [];
    const today = new Date();
    const maxDate = endDate || new Date(today.getFullYear() + 3, today.getMonth(), today.getDate()); // Default 3 years ahead
    let currentDate = new Date(startDate);

    // Generate up to 36 occurrences to allow for longer planning
    let count = 0;
    const maxOccurrences = 36;

    while (currentDate <= maxDate && count < maxOccurrences) {
expenses.push({
    id: Date.now() + count,
    description: `${description} (${currentDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })})`,
    amount,
    category,
    date: currentDate.toISOString().split('T')[0],
    type: 'recurring',
    originalDescription: description,
    frequency: frequency
});

// Calculate next occurrence
currentDate = getNextRecurringDate(currentDate, frequency);
count++;
}

    return expenses;
}

function getNextRecurringDate(currentDate, frequency) {
    const nextDate = new Date(currentDate);

    switch (frequency) {
case 'monthly':
    nextDate.setMonth(nextDate.getMonth() + 1);
    break;
case 'quarterly':
    nextDate.setMonth(nextDate.getMonth() + 3);
    break;
case 'yearly':
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    break;
}

    return nextDate;
}

function updateExpensesList() {
    const list = document.getElementById('expensesList');
    list.innerHTML = '';

    // Group expenses by type for better organization
    const singleExpenses = expenses.filter(e => !e.type || e.type === 'single');
    const recurringExpenses = expenses.filter(e => e.type === 'recurring');

    // Show single expenses first
    if (singleExpenses.length > 0) {
const singleHeader = document.createElement('div');
singleHeader.innerHTML = '<h4 style="margin: 20px 0 10px 0; color: #2c3e50;">💸 Gastos Únicos</h4>';
list.appendChild(singleHeader);

singleExpenses.forEach(expense => {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
                <div class="item-info">
                    <strong>${expense.description}</strong><br>
                    $${expense.amount.toFixed(2)} - ${expense.category}<br>
                    <small>Fecha: ${new Date(expense.date).toLocaleDateString()}</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-danger btn-small" onclick="deleteExpense(${expense.id})">🗑️</button>
                </div>
            `;
    list.appendChild(item);
});
}

    // Show recurring expenses grouped by original description
    if (recurringExpenses.length > 0) {
const recurringHeader = document.createElement('div');
recurringHeader.innerHTML = '<h4 style="margin: 20px 0 10px 0; color: #2c3e50;">🔄 Gastos Recurrentes</h4>';
list.appendChild(recurringHeader);

// Group by original description
const groupedRecurring = {};
recurringExpenses.forEach(expense => {
    const key = expense.originalDescription || expense.description.split(' (')[0];
    if (!groupedRecurring[key]) {
        groupedRecurring[key] = [];
}
    groupedRecurring[key].push(expense);
});

Object.entries(groupedRecurring).forEach(([originalDesc, expenseGroup]) => {
    const firstExpense = expenseGroup[0];
    const item = document.createElement('div');
    item.className = 'item';
    item.style.borderLeft = '4px solid #f39c12';

    const nextOccurrence = expenseGroup.find(e => new Date(e.date) > new Date());
    const nextDate = nextOccurrence ? new Date(nextOccurrence.date).toLocaleDateString() : 'Completado';

    item.innerHTML = `
                <div class="item-info">
                    <strong>${originalDesc}</strong><br>
                    $${firstExpense.amount.toFixed(2)} - ${firstExpense.category} (${firstExpense.frequency})<br>
                    <small>Próximo: ${nextDate} | Total: ${expenseGroup.length} ocurrencias</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-warning btn-small" onclick="editRecurringExpense('${originalDesc}')">✏️</button>
                    <button class="btn btn-danger btn-small" onclick="deleteRecurringExpense('${originalDesc}')">🗑️</button>
                </div>
            `;
    list.appendChild(item);
});
}

    if (expenses.length === 0) {
list.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay gastos registrados</p>';
}
}

function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveToLocalStorage();
    updateDashboard();
    updateExpensesList();
    showAlert('Gasto eliminado', 'warning');
}

function deleteRecurringExpense(originalDescription) {
    if (confirm(`¿Estás seguro de que quieres eliminar TODOS los gastos recurrentes de "${originalDescription}"?`)) {
expenses = expenses.filter(expense =>
    !expense.originalDescription ||
    expense.originalDescription !== originalDescription
);
saveToLocalStorage();
updateDashboard();
updateExpensesList();
showAlert('Gastos recurrentes eliminados', 'warning');
}
}

function editRecurringExpense(originalDescription) {
    const recurringExpenses = expenses.filter(expense =>
expense.originalDescription === originalDescription
    );

    if (recurringExpenses.length === 0) return;

    const firstExpense = recurringExpenses[0];

    // Fill the form with current values
    document.getElementById('expenseDescription').value = originalDescription;
    document.getElementById('expenseAmount').value = firstExpense.amount;
    document.getElementById('expenseCategory').value = firstExpense.category;
    document.getElementById('expenseDate').value = firstExpense.date;
    document.getElementById('expenseType').value = 'recurring';
    document.getElementById('recurringFrequency').value = firstExpense.frequency;

    toggleRecurringOptions();

    // Delete the old recurring expenses
    deleteRecurringExpense(originalDescription);

    showAlert('Gasto recurrente cargado para edición. Modifica los valores y guarda.', 'info');
}

function quickSetupExpense(description, category, frequency) {
    // Fill the form with preset values
    document.getElementById('expenseDescription').value = description;
    document.getElementById('expenseCategory').value = category;
    document.getElementById('expenseType').value = 'recurring';
    document.getElementById('recurringFrequency').value = frequency;

    // Set default amounts based on type
    const defaultAmounts = {
'Arriendo': 800,
'Luz': 80,
'Agua': 40,
'Internet': 60,
'Gas': 30,
'Celular': 50,
'Seguro Auto': 120,
'Gym': 40
};

    document.getElementById('expenseAmount').value = defaultAmounts[description] || 100;

    // Set date to first day of next month
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    document.getElementById('expenseDate').valueAsDate = nextMonth;

    toggleRecurringOptions();

    showAlert(`${description} configurado. Ajusta el monto si es necesario y guarda.`, 'info');
}

// Debt Management
function addDebt() {
    const validationError = validateForm('debt');
    if (validationError) {
showAlert(validationError);
return;
}

    const description = document.getElementById('debtDescription').value.trim();
    const amount = parseFloat(document.getElementById('debtAmount').value);
    const total = parseFloat(document.getElementById('debtTotal').value);
    const rate = parseFloat(document.getElementById('debtRate').value);

    const debt = {
id: Date.now(),
description,
monthlyPayment: amount,
totalDebt: total,
interestRate: rate,
remainingMonths: calculateRemainingMonths(total, amount, rate)
};

    debts.push(debt);
    saveToLocalStorage();
    updateDashboard();
    updateDebtsList();
    clearDebtForm();
    showAlert('Deuda agregada exitosamente', 'success');
}

function calculateRemainingMonths(total, payment, rate) {
    if (rate === 0) return Math.ceil(total / payment);
    const monthlyRate = rate / 100 / 12;
    if (payment <= total * monthlyRate) return Infinity;
    return Math.ceil(-Math.log(1 - (total * monthlyRate) / payment) / Math.log(1 + monthlyRate));
}

function clearDebtForm() {
    document.getElementById('debtDescription').value = '';
    document.getElementById('debtAmount').value = '';
    document.getElementById('debtTotal').value = '';
    document.getElementById('debtRate').value = '';
}

function updateDebtsList() {
    const list = document.getElementById('debtsList');
    list.innerHTML = '';

    debts.forEach(debt => {
const item = document.createElement('div');
item.className = 'item';
const remainingText = debt.remainingMonths === Infinity ?
    'Pago insuficiente' : `${debt.remainingMonths} meses`;

item.innerHTML = `
            <div class="item-info">
                <strong>${debt.description}</strong><br>
                Pago mensual: ${debt.monthlyPayment.toFixed(2)}<br>
                Deuda total: ${debt.totalDebt.toFixed(2)} | Tasa: ${debt.interestRate}%<br>
                <small>Tiempo restante: ${remainingText}</small>
            </div>
            <div class="item-actions">
                <button class="btn btn-danger btn-small" onclick="deleteDebt(${debt.id})">🗑️</button>
            </div>
        `;
list.appendChild(item);
});
}

function deleteDebt(id) {
    debts = debts.filter(debt => debt.id !== id);
    saveToLocalStorage();
    updateDashboard();
    updateDebtsList();
    showAlert('Deuda eliminada', 'warning');
}

// Savings Management
function addSavings() {
    const validationError = validateForm('savings');
    if (validationError) {
showAlert(validationError);
return;
}

    const description = document.getElementById('savingsDescription').value.trim();
    const target = parseFloat(document.getElementById('savingsTarget').value);
    const monthly = parseFloat(document.getElementById('savingsMonthly').value);
    const date = document.getElementById('savingsDate').value;

    const saving = {
id: Date.now(),
description,
target,
monthlyAmount: monthly,
targetDate: date,
currentAmount: 0,
monthsToTarget: Math.ceil(target / monthly)
};

    savings.push(saving);
    saveToLocalStorage();
    updateDashboard();
    updateSavingsList();
    updateSavingsSuggestions();
    clearSavingsForm();
    showAlert('Meta de ahorro agregada exitosamente', 'success');
}

function clearSavingsForm() {
    document.getElementById('savingsDescription').value = '';
    document.getElementById('savingsTarget').value = '';
    document.getElementById('savingsMonthly').value = '';
    document.getElementById('savingsDate').value = '';
}

function updateSavingsList() {
    const list = document.getElementById('savingsList');
    list.innerHTML = '';

    savings.forEach(saving => {
const progress = Math.min((saving.currentAmount / saving.target) * 100, 100);
const item = document.createElement('div');
item.className = 'item';

item.innerHTML = `
            <div class="item-info" style="width: 100%;">
                <strong>${saving.description}</strong><br>
                Meta: ${saving.target.toFixed(2)} | Mensual: ${saving.monthlyAmount.toFixed(2)}<br>
                <small>Fecha objetivo: ${new Date(saving.targetDate).toLocaleDateString()}</small>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <small>${progress.toFixed(1)}% completado</small>
            </div>
            <div class="item-actions">
                <button class="btn btn-small" onclick="addToSaving(${saving.id})">💰</button>
                <button class="btn btn-danger btn-small" onclick="deleteSaving(${saving.id})">🗑️</button>
            </div>
        `;
list.appendChild(item);
});
}

function addToSaving(id) {
    const amount = prompt('¿Cuánto deseas agregar a este ahorro?');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
const saving = savings.find(s => s.id === id);
saving.currentAmount += parseFloat(amount);
saveToLocalStorage();
updateSavingsList();
updateDashboard();
showAlert('Cantidad agregada al ahorro', 'success');
}
}

function deleteSaving(id) {
    savings = savings.filter(saving => saving.id !== id);
    saveToLocalStorage();
    updateDashboard();
    updateSavingsList();
    updateSavingsSuggestions();
    showAlert('Meta de ahorro eliminada', 'warning');
}

function updateSavingsSuggestions() {
    const container = document.getElementById('savingsSuggestions');
    const totalIncome = getTotalMonthlyIncome();
    const totalExpenses = getTotalMonthlyExpenses();
    const totalDebts = getTotalMonthlyDebts();
    const totalExpensesAndDebts = totalExpenses + totalDebts;
    const availableForSavings = totalIncome - totalExpensesAndDebts;

    let suggestions = '<h4>💡 Sugerencias Personalizadas</h4>';

    if (availableForSavings > 0) {
suggestions += `
            <div class="alert alert-success">
                <strong>¡Excelente!</strong> Tienes $${availableForSavings.toFixed(2)} disponibles mensualmente después de gastos y deudas.
                <ul style="margin: 10px 0 0 20px;">
                    <li>Regla 50/30/20: Ahorra $${(totalIncome * 0.2).toFixed(2)} (20% de ingresos)</li>
                    <li>Fondo de emergencia: $${(totalExpensesAndDebts * 6).toFixed(2)} (6 meses de gastos totales)</li>
                    <li>Ahorro conservador: $${(availableForSavings * 0.5).toFixed(2)} (50% del disponible)</li>
                    <li>Ahorro agresivo: $${(availableForSavings * 0.8).toFixed(2)} (80% del disponible)</li>
                </ul>
            </div>
        `;
} else if (availableForSavings < 0) {
suggestions += `
            <div class="alert alert-danger">
                <strong>⚠️ Atención:</strong> Gastas $${Math.abs(availableForSavings).toFixed(2)} más de lo que ingresas.
                <br>Considera reducir gastos variables o aumentar ingresos antes de establecer metas de ahorro.
                <br><strong>Prioridad:</strong> Primero cubre tus gastos básicos y pagos de deudas.
            </div>
        `;
} else {
suggestions += `
            <div class="alert alert-warning">
                <strong>Equilibrio exacto:</strong> Tus ingresos igualan tus gastos y deudas.
                <br>Considera aumentar ingresos o reducir gastos variables para crear capacidad de ahorro.
            </div>
        `;
}

    container.innerHTML = suggestions;
}

// Dashboard Updates
function updateDashboard() {
    const totalIncome = currentDateFilter.active ? getFilteredIncomes() : getTotalMonthlyIncome();
    const totalExpenses = currentDateFilter.active ? getFilteredExpenses() : getTotalMonthlyExpenses();
    const totalDebts = getTotalMonthlyDebts(); // Always monthly
    const totalSavings = getTotalMonthlySavings(); // Always monthly
    const totalExpensesAndDebts = totalExpenses + totalDebts;
    const remainingBalance = totalIncome - totalExpensesAndDebts - totalSavings;

    document.getElementById('totalIncome').textContent = '$' + totalIncome.toFixed(2);
    document.getElementById('totalExpenses').textContent = '$' + totalExpensesAndDebts.toFixed(2);
    document.getElementById('totalSavings').textContent = '$' + totalSavings.toFixed(2);
    document.getElementById('remainingBalance').textContent = '$' + remainingBalance.toFixed(2);

    // Update card titles to show if filtered
    const incomeCard = document.querySelector('.summary-card.income h4');
    const expenseCard = document.querySelector('.summary-card.expense h4');

    if (currentDateFilter.active) {
incomeCard.textContent = 'Ingresos del Período';
expenseCard.textContent = 'Gastos del Período';
} else {
incomeCard.textContent = 'Ingresos Mensuales';
expenseCard.textContent = 'Gastos Totales';
}

    // Update balance card color
    const balanceCard = document.getElementById('balanceCard');
    balanceCard.className = 'summary-card ' + (remainingBalance >= 0 ? 'income' : 'expense');

    updateFinancialSummary();
    updateExpenseChart();
    updateFixedExpensesCard();
}

function updateFixedExpensesCard() {
    const card = document.getElementById('fixedExpensesCard');
    const list = document.getElementById('fixedExpensesList');

    const recurringExpenses = expenses.filter(e => e.type === 'recurring');
    const upcomingExpenses = recurringExpenses.filter(e => new Date(e.date) > new Date());

    if (upcomingExpenses.length === 0) {
card.style.display = 'none';
return;
}

    card.style.display = 'block';

    // Group by original description
    const groupedUpcoming = {};
    upcomingExpenses.forEach(expense => {
const key = expense.originalDescription || expense.description.split(' (')[0];
if (!groupedUpcoming[key]) {
    groupedUpcoming[key] = [];
}
groupedUpcoming[key].push(expense);
});

    let html = '';
    Object.entries(groupedUpcoming).forEach(([originalDesc, expenseGroup]) => {
const nextExpense = expenseGroup.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
const nextDate = new Date(nextExpense.date);
const daysUntil = Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24));

html += `
            <div class="item" style="margin-bottom: 10px;">
                <div class="item-info">
                    <strong>${originalDesc}</strong><br>
                    $${nextExpense.amount.toFixed(2)} - ${nextExpense.category}<br>
                    <small>Próximo: ${nextDate.toLocaleDateString()} (${daysUntil} días)</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small" onclick="markAsPaid('${originalDesc}', '${nextExpense.date}')">✅ Pagado</button>
                </div>
            </div>
        `;
});

    list.innerHTML = html;
}

function markAsPaid(originalDescription, date) {
    if (confirm(`¿Marcar como pagado "${originalDescription}" del ${new Date(date).toLocaleDateString()}?`)) {
// Find and update the expense
const expense = expenses.find(e =>
    (e.originalDescription === originalDescription || e.description.includes(originalDescription)) &&
    e.date === date
);

if (expense) {
    expense.paid = true;
    expense.paidDate = new Date().toISOString().split('T')[0];
    saveToLocalStorage();
    updateDashboard();
    updateExpensesList();
    showAlert('Gasto marcado como pagado', 'success');
}
}
}

function getTotalMonthlyIncome() {
    return incomes.reduce((total, income) => total + income.monthlyAmount, 0);
}

function getTotalMonthlyExpenses() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return expenses
.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
})
.reduce((total, expense) => total + expense.amount, 0);
}

function getTotalMonthlyDebts() {
    return debts.reduce((total, debt) => total + debt.monthlyPayment, 0);
}

function getTotalMonthlySavings() {
    return savings.reduce((total, saving) => total + saving.monthlyAmount, 0);
}

function updateFinancialSummary() {
    const totalIncome = currentDateFilter.active ? getFilteredIncomes() : getTotalMonthlyIncome();
    const totalExpenses = currentDateFilter.active ? getFilteredExpenses() : getTotalMonthlyExpenses();
    const totalDebts = getTotalMonthlyDebts();
    const totalSavings = getTotalMonthlySavings();
    const totalExpensesAndDebts = totalExpenses + totalDebts;
    const remainingBalance = totalIncome - totalExpensesAndDebts - totalSavings;
    const spendingCapacity = totalIncome - totalDebts - totalSavings;

    let summaryHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Desglose de Gastos</h4>
                <div style="text-align: left; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Gastos variables:</span>
                        <span>$${totalExpenses.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Pagos de deudas:</span>
                        <span>$${totalDebts.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Ahorros:</span>
                        <span>$${totalSavings.toFixed(2)}</span>
                    </div>
                    <hr style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                        <span>Total comprometido:</span>
                        <span>$${(totalExpensesAndDebts + totalSavings).toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div class="summary-card">
                <h4>Capacidad de Gasto</h4>
                <div class="amount">$${spendingCapacity.toFixed(2)}</div>
                <small>Disponible para gastos variables</small>
            </div>
        </div>
    `;

    if (remainingBalance < 0) {
summaryHTML += `
            <div class="alert alert-danger">
                <strong>⚠️ Déficit Presupuestario:</strong> Estás gastando $${Math.abs(remainingBalance).toFixed(2)} más de lo que ingresas mensualmente.
                <br>Considera reducir gastos variables o aumentar ingresos.
            </div>
        `;
} else if (remainingBalance > 0) {
summaryHTML += `
            <div class="alert alert-success">
                <strong>✅ Superávit:</strong> Te sobran $${remainingBalance.toFixed(2)} mensualmente. 
                <br>¡Considera aumentar tus ahorros o pagar más deudas!
            </div>
        `;
} else {
summaryHTML += `
            <div class="alert alert-warning">
                <strong>⚖️ Balance Equilibrado:</strong> Tus ingresos igualan exactamente tus gastos y ahorros.
            </div>
        `;
}

    document.getElementById('financialSummary').innerHTML = summaryHTML;
}

function updateExpenseChart() {
    const chart = document.getElementById('expenseChart');
    const categoryTotals = getFilteredExpensesByCategory();

    // Add debts as a special category
    const totalDebts = getTotalMonthlyDebts();
    if (totalDebts > 0) {
categoryTotals['Pagos de Deudas'] = totalDebts;
}

    if (Object.keys(categoryTotals).length === 0) {
chart.innerHTML = '<p>No hay gastos registrados para mostrar</p>';
return;
}

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    let chartHTML = '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';

    Object.entries(categoryTotals).forEach(([category, amount]) => {
const percentage = ((amount / total) * 100).toFixed(1);
const isDebt = category === 'Pagos de Deudas';
const color = isDebt ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #3498db, #2980b9)';

chartHTML += `
            <div style="text-align: center; min-width: 120px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: ${color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin: 0 auto 10px;">${percentage}%</div>
                <div style="font-size: 14px; color: #666;">${category}</div>
                <div style="font-weight: bold;">$${amount.toFixed(2)}</div>
            </div>
        `;
});

    chartHTML += '</div>';
    chart.innerHTML = chartHTML;
}

// Projections
function calculateProjections() {
    const incomeIncrease = parseFloat(document.getElementById('incomeIncrease').value) || 0;
    const expenseIncrease = parseFloat(document.getElementById('expenseIncrease').value) || 0;
    const months = parseInt(document.getElementById('projectionMonths').value) || 12;
    const additionalExpense = parseFloat(document.getElementById('additionalExpense').value) || 0;

    const currentIncome = getTotalMonthlyIncome();
    const currentExpenses = getTotalMonthlyExpenses();
    const currentDebts = getTotalMonthlyDebts();
    const currentSavings = getTotalMonthlySavings();

    const projectionData = [];
    let cumulativeBalance = 0;

    for (let month = 1; month <= months; month++) {
const projectedIncome = currentIncome * (1 + incomeIncrease / 100);
const projectedExpenses = (currentExpenses + additionalExpense) * (1 + expenseIncrease / 100);
const monthlyBalance = projectedIncome - projectedExpenses - currentDebts - currentSavings;
cumulativeBalance += monthlyBalance;

projectionData.push({
    month,
    monthlyBalance,
    cumulativeBalance,
    income: projectedIncome,
    expenses: projectedExpenses + currentDebts + currentSavings
});
}

    displayProjectionChart(projectionData);
    displayProjectionResults(projectionData, months);
}

function displayProjectionChart(data) {
    const chart = document.getElementById('projectionChart');
    const maxBalance = Math.max(...data.map(d => d.cumulativeBalance));
    const minBalance = Math.min(...data.map(d => d.cumulativeBalance));
    const range = maxBalance - minBalance || 1000;

    // Create a more sophisticated chart
    let chartHTML = `
        <div style="position: relative; height: 300px; margin: 20px; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
            <h4 style="text-align: center; margin-bottom: 20px; color: #2c3e50;">Proyección de Saldo Acumulado</h4>
            <div style="position: relative; height: 200px; display: flex; align-items: end; justify-content: space-between; border-bottom: 2px solid #3498db; border-left: 2px solid #3498db;">
    `;

    // Add Y-axis labels
    const yAxisLabels = [];
    for (let i = 0; i <= 4; i++) {
const value = minBalance + (range * i / 4);
yAxisLabels.push(value);
}

    chartHTML += '<div style="position: absolute; left: -60px; top: 0; height: 200px; display: flex; flex-direction: column; justify-content: space-between; font-size: 12px; color: #666;">';
    yAxisLabels.reverse().forEach(label => {
chartHTML += `<div style="text-align: right; width: 50px;">$${label.toFixed(0)}</div>`;
});
    chartHTML += '</div>';

    // Add data points
    const step = Math.max(1, Math.floor(data.length / 12));
    data.forEach((point, index) => {
if (index % step === 0 || index === data.length - 1) {
    const height = Math.max(5, ((point.cumulativeBalance - minBalance) / range) * 180);
    const color = point.cumulativeBalance >= 0 ? '#27ae60' : '#e74c3c';
    const opacity = point.cumulativeBalance >= 0 ? 0.8 : 0.9;

    chartHTML += `
                <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
                    <div style="position: absolute; top: -25px; font-size: 10px; color: #666; white-space: nowrap;">$${point.cumulativeBalance.toFixed(0)}</div>
                    <div style="width: 15px; height: ${height}px; background: ${color}; border-radius: 3px 3px 0 0; opacity: ${opacity}; transition: all 0.3s ease;" 
                         onmouseover="this.style.opacity='1'; this.style.transform='scale(1.1)'" 
                         onmouseout="this.style.opacity='${opacity}'; this.style.transform='scale(1)'"></div>
                    <div style="font-size: 10px; margin-top: 5px; color: #666; writing-mode: vertical-rl; text-orientation: mixed;">M${point.month}</div>
                </div>
            `;
}
});

    chartHTML += '</div>';

    // Add trend line
    if (data.length > 1) {
const firstPoint = data[0];
const lastPoint = data[data.length - 1];
const trend = (lastPoint.cumulativeBalance - firstPoint.cumulativeBalance) / data.length;

chartHTML += `
            <div style="margin-top: 15px; text-align: center;">
                <div style="font-size: 14px; color: #666;">
                    Tendencia: ${trend >= 0 ? '+' : ''}$${trend.toFixed(2)} por mes
                    <span style="color: ${trend >= 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                        (${trend >= 0 ? '↗️' : '↘️'} ${trend >= 0 ? 'Positiva' : 'Negativa'})
                    </span>
                </div>
            </div>
        `;
}

    chartHTML += '</div>';
    chart.innerHTML = chartHTML;
}

function displayProjectionResults(data, months) {
    const finalBalance = data[data.length - 1].cumulativeBalance;
    const avgMonthlyBalance = data.reduce((sum, d) => sum + d.monthlyBalance, 0) / months;
    const worstMonth = Math.min(...data.map(d => d.monthlyBalance));
    const bestMonth = Math.max(...data.map(d => d.monthlyBalance));

    const resultsHTML = `
        <div class="summary-cards">
            <div class="summary-card ${finalBalance >= 0 ? 'income' : 'expense'}">
                <h4>Saldo Final Proyectado</h4>
                <div class="amount">${finalBalance.toFixed(2)}</div>
                <small>Después de ${months} meses</small>
            </div>
            <div class="summary-card">
                <h4>Balance Mensual Promedio</h4>
                <div class="amount">${avgMonthlyBalance.toFixed(2)}</div>
            </div>
            <div class="summary-card ${worstMonth >= 0 ? 'income' : 'expense'}">
                <h4>Peor Mes</h4>
                <div class="amount">${worstMonth.toFixed(2)}</div>
            </div>
            <div class="summary-card income">
                <h4>Mejor Mes</h4>
                <div class="amount">${bestMonth.toFixed(2)}</div>
            </div>
        </div>
        
        ${finalBalance < 0 ?
    '<div class="alert alert-danger"><strong>⚠️ Advertencia:</strong> La proyección muestra un déficit acumulado. Considera ajustar tus gastos o aumentar ingresos.</div>' :
    '<div class="alert alert-success"><strong>✅ Proyección Positiva:</strong> Mantienes un saldo favorable durante el período proyectado.</div>'
}
    `;

    document.getElementById('projectionResults').style.display = 'block';
    document.getElementById('projectionSummary').innerHTML = resultsHTML;
}

// Reports
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportMonth = document.getElementById('reportMonth').value;
    const reportContent = document.getElementById('reportContent');

    let report = '';

    switch (reportType) {
case 'monthly':
    report = generateMonthlyReport(reportMonth);
    break;
case 'annual':
    report = generateAnnualReport(reportMonth);
    break;
case 'category':
    report = generateCategoryReport();
    break;
case 'complete':
    report = generateCompleteReport();
    break;
}

    reportContent.innerHTML = report;
}

function generateMonthlyReport(monthYear) {
    const [year, month] = monthYear.split('-').map(Number);
    const monthExpenses = expenses.filter(expense => {
const expenseDate = new Date(expense.date);
return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
});

    const categoryTotals = {};
    monthExpenses.forEach(expense => {
categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
});

    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    const monthlyIncome = getTotalMonthlyIncome();
    const monthlyDebts = getTotalMonthlyDebts();
    const balance = monthlyIncome - totalExpenses - monthlyDebts;

    let report = `
        <h4>📊 Reporte Mensual - ${new Date(year, month - 1).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</h4>
        <div class="summary-cards">
            <div class="summary-card income">
                <h5>Ingresos</h5>
                <div class="amount">${monthlyIncome.toFixed(2)}</div>
            </div>
            <div class="summary-card expense">
                <h5>Gastos</h5>
                <div class="amount">${totalExpenses.toFixed(2)}</div>
            </div>
            <div class="summary-card debt">
                <h5>Deudas</h5>
                <div class="amount">${monthlyDebts.toFixed(2)}</div>
            </div>
            <div class="summary-card ${balance >= 0 ? 'savings' : 'expense'}">
                <h5>Balance</h5>
                <div class="amount">${balance.toFixed(2)}</div>
            </div>
        </div>
        
        <h5>Gastos por Categoría:</h5>
        <div style="margin-top: 15px;">
    `;

    Object.entries(categoryTotals).forEach(([category, amount]) => {
const percentage = ((amount / totalExpenses) * 100).toFixed(1);
report += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <span>${category}</span>
                <span>${amount.toFixed(2)} (${percentage}%)</span>
            </div>
        `;
});

    report += '</div>';
    return report;
}

function generateAnnualReport(monthYear) {
    const [year] = monthYear.split('-').map(Number);
    const annualExpenses = expenses.filter(expense => {
const expenseDate = new Date(expense.date);
return expenseDate.getFullYear() === year;
});

    const monthlyTotals = {};
    const categoryTotals = {};

    annualExpenses.forEach(expense => {
const month = new Date(expense.date).getMonth();
monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
});

    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    const avgMonthlyExpenses = totalExpenses / 12;
    const annualIncome = getTotalMonthlyIncome() * 12;
    const annualDebts = getTotalMonthlyDebts() * 12;

    let report = `
        <h4>📅 Reporte Anual - ${year}</h4>
        <div class="summary-cards">
            <div class="summary-card income">
                <h5>Ingresos Anuales</h5>
                <div class="amount">${annualIncome.toFixed(2)}</div>
            </div>
            <div class="summary-card expense">
                <h5>Gastos Anuales</h5>
                <div class="amount">${totalExpenses.toFixed(2)}</div>
            </div>
            <div class="summary-card">
                <h5>Promedio Mensual Gastos</h5>
                <div class="amount">${avgMonthlyExpenses.toFixed(2)}</div>
            </div>
        </div>
    `;

    return report;
}

function generateCategoryReport() {
    const categoryTotals = {};
    expenses.forEach(expense => {
categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
});

    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    let report = `
        <h4>📊 Reporte por Categorías</h4>
        <div style="margin-top: 20px;">
    `;

    Object.entries(categoryTotals)
.sort(([, a], [, b]) => b - a)
.forEach(([category, amount]) => {
    const percentage = ((amount / totalExpenses) * 100).toFixed(1);
    report += `
                <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h5 style="margin: 0; color: #2c3e50;">${category}</h5>
                        <span style="font-size: 1.2em; font-weight: bold;">${amount.toFixed(2)}</span>
                    </div>
                    <div style="margin-top: 5px; font-size: 14px; color: #666;">
                        ${percentage}% del total
                    </div>
                    <div class="progress-bar" style="margin-top: 8px;">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
});

    report += '</div>';
    return report;
}

function generateCompleteReport() {
    const totalIncome = getTotalMonthlyIncome();
    const totalExpenses = getTotalMonthlyExpenses();
    const totalDebts = getTotalMonthlyDebts();
    const totalSavings = getTotalMonthlySavings();

    let report = `
        <h4>📋 Reporte Completo</h4>
        
        <div class="summary-cards">
            <div class="summary-card income">
                <h5>Ingresos Mensuales</h5>
                <div class="amount">${totalIncome.toFixed(2)}</div>
            </div>
            <div class="summary-card expense">
                <h5>Gastos Mensuales</h5>
                <div class="amount">${totalExpenses.toFixed(2)}</div>
            </div>
            <div class="summary-card debt">
                <h5>Deudas Mensuales</h5>
                <div class="amount">${totalDebts.toFixed(2)}</div>
            </div>
            <div class="summary-card savings">
                <h5>Ahorros Objetivo</h5>
                <div class="amount">${totalSavings.toFixed(2)}</div>
            </div>
        </div>
        
        <h5>📈 Detalle de Ingresos:</h5>
        <div style="margin: 15px 0;">
    `;

    incomes.forEach(income => {
report += `
            <div style="padding: 10px; background: #e8f5e8; margin-bottom: 5px; border-radius: 5px;">
                <strong>${income.description}</strong> - ${income.monthlyAmount.toFixed(2)}/mes (${income.frequency})
            </div>
        `;
});

    report += `
        </div>
        
        <h5>💸 Gastos por Categoría:</h5>
        <div style="margin: 15px 0;">
    `;

    const categoryTotals = {};
    expenses.forEach(expense => {
categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
});

    Object.entries(categoryTotals).forEach(([category, amount]) => {
report += `
            <div style="padding: 10px; background: #ffe8e8; margin-bottom: 5px; border-radius: 5px;">
                <strong>${category}</strong> - ${amount.toFixed(2)}
            </div>
        `;
});

    report += `
        </div>
        
        <h5>💳 Deudas Activas:</h5>
        <div style="margin: 15px 0;">
    `;

    debts.forEach(debt => {
report += `
            <div style="padding: 10px; background: #fff3cd; margin-bottom: 5px; border-radius: 5px;">
                <strong>${debt.description}</strong> - ${debt.monthlyPayment.toFixed(2)}/mes<br>
                <small>Total: ${debt.totalDebt.toFixed(2)} | Tasa: ${debt.interestRate}%</small>
            </div>
        `;
});

    report += `
        </div>
        
        <h5>🎯 Metas de Ahorro:</h5>
        <div style="margin: 15px 0;">
    `;

    savings.forEach(saving => {
const progress = Math.min((saving.currentAmount / saving.target) * 100, 100);
report += `
            <div style="padding: 10px; background: #e8e5ff; margin-bottom: 5px; border-radius: 5px;">
                <strong>${saving.description}</strong> - ${saving.monthlyAmount.toFixed(2)}/mes<br>
                <small>Meta: ${saving.target.toFixed(2)} | Progreso: ${progress.toFixed(1)}%</small>
            </div>
        `;
});

    report += '</div>';
    return report;
}

// CSV Export Functionality
function exportToCSV() {
    const reportType = document.getElementById('reportType').value;
    const reportMonth = document.getElementById('reportMonth').value;

    let csvData = '';
    let filename = '';

    switch (reportType) {
case 'monthly':
    csvData = generateMonthlyCSV(reportMonth);
    filename = `reporte_mensual_${reportMonth}.csv`;
    break;
case 'annual':
    csvData = generateAnnualCSV(reportMonth);
    filename = `reporte_anual_${reportMonth.split('-')[0]}.csv`;
    break;
case 'category':
    csvData = generateCategoryCSV();
    filename = 'reporte_categorias.csv';
    break;
case 'complete':
    csvData = generateCompleteCSV();
    if (currentDateFilter.active) {
        const fromStr = currentDateFilter.from.toISOString().split('T')[0];
        const toStr = currentDateFilter.to.toISOString().split('T')[0];
        filename = `reporte_completo_${fromStr}_${toStr}.csv`;
} else {
        filename = 'reporte_completo.csv';
}
    break;
}

    downloadCSV(csvData, filename);
}

function generateMonthlyCSV(monthYear) {
    const [year, month] = monthYear.split('-').map(Number);
    const monthExpenses = expenses.filter(expense => {
const expenseDate = new Date(expense.date);
return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
});

    let csv = 'Tipo,Descripcion,Monto,Categoria,Fecha\n';

    // Add incomes
    incomes.forEach(income => {
csv += `Ingreso,"${income.description}",${income.monthlyAmount},${income.frequency},${income.date}\n`;
});

    // Add expenses
    monthExpenses.forEach(expense => {
csv += `Gasto,"${expense.description}",${expense.amount},${expense.category},${expense.date}\n`;
});

    // Add debts
    debts.forEach(debt => {
csv += `Deuda,"${debt.description}",${debt.monthlyPayment},Pago Mensual,${new Date().toISOString().split('T')[0]}\n`;
});

    return csv;
}

function generateAnnualCSV(monthYear) {
    const [year] = monthYear.split('-').map(Number);
    const annualExpenses = expenses.filter(expense => {
const expenseDate = new Date(expense.date);
return expenseDate.getFullYear() === year;
});

    let csv = 'Tipo,Descripcion,Monto,Categoria,Fecha\n';

    // Add incomes
    incomes.forEach(income => {
csv += `Ingreso,"${income.description}",${income.monthlyAmount * 12},${income.frequency},${year}\n`;
});

    // Add expenses
    annualExpenses.forEach(expense => {
csv += `Gasto,"${expense.description}",${expense.amount},${expense.category},${expense.date}\n`;
});

    // Add debts
    debts.forEach(debt => {
csv += `Deuda,"${debt.description}",${debt.monthlyPayment * 12},Pago Anual,${year}\n`;
});

    return csv;
}

function generateCategoryCSV() {
    const categoryTotals = {};
    expenses.forEach(expense => {
categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
});

    let csv = 'Categoria,Monto Total,Porcentaje\n';
    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    Object.entries(categoryTotals).forEach(([category, amount]) => {
const percentage = ((amount / totalExpenses) * 100).toFixed(2);
csv += `"${category}",${amount.toFixed(2)},${percentage}%\n`;
});

    return csv;
}

function generateCompleteCSV() {
    let csv = 'Tipo,Descripcion,Monto,Categoria,Fecha,Detalles\n';

    // Add incomes (filtered if active)
    const incomesToExport = currentDateFilter.active ?
incomes.filter(income => {
    const incomeDate = new Date(income.date);
    return incomeDate >= currentDateFilter.from && incomeDate <= currentDateFilter.to;
}) : incomes;

    incomesToExport.forEach(income => {
csv += `Ingreso,"${income.description}",${income.monthlyAmount},${income.frequency},${income.date},"Mensual: ${income.monthlyAmount}"\n`;
});

    // Add expenses (filtered if active)
    const expensesToExport = currentDateFilter.active ?
expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= currentDateFilter.from && expenseDate <= currentDateFilter.to;
}) : expenses;

    expensesToExport.forEach(expense => {
csv += `Gasto,"${expense.description}",${expense.amount},${expense.category},${expense.date},""\n`;
});

    // Add debts (always include all debts)
    debts.forEach(debt => {
csv += `Deuda,"${debt.description}",${debt.monthlyPayment},Pago Mensual,${new Date().toISOString().split('T')[0]},"Total: ${debt.totalDebt}, Tasa: ${debt.interestRate}%"\n`;
});

    // Add savings (always include all savings)
    savings.forEach(saving => {
const progress = Math.min((saving.currentAmount / saving.target) * 100, 100);
csv += `Ahorro,"${saving.description}",${saving.monthlyAmount},Meta Mensual,${saving.targetDate},"Meta: ${saving.target}, Progreso: ${progress.toFixed(1)}%"\n`;
});

    return csv;
}

function downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
const url = URL.createObjectURL(blob);
link.setAttribute('href', url);
link.setAttribute('download', filename);
link.style.visibility = 'hidden';
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
}
}

// Utility Functions
function updateAllLists() {
    updateIncomeList();
    updateExpensesList();
    updateDebtsList();
    updateSavingsList();
    updateSavingsSuggestions();
}

function saveToLocalStorage() {
    localStorage.setItem('incomes', JSON.stringify(incomes));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('debts', JSON.stringify(debts));
    localStorage.setItem('savings', JSON.stringify(savings));
}

// Enhanced Chart Functions
function createBarChart(data, containerId, title) {
    const container = document.getElementById(containerId);
    const maxValue = Math.max(...data.map(d => d.value));

    let chartHTML = `<h4>${title}</h4><div style="margin: 20px 0;">`;

    data.forEach(item => {
const percentage = (item.value / maxValue) * 100;
chartHTML += `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${item.label}</span>
                    <span>$${item.value.toFixed(2)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%; background: linear-gradient(90deg, #3498db, #2980b9);"></div>
                </div>
            </div>
        `;
});

    chartHTML += '</div>';
    container.innerHTML = chartHTML;
}

// Error Handling and Validation
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    showAlert(`Error en ${context}: ${error.message}`, 'danger');
}

function validateForm(formType) {
    const validations = {
income: () => {
    const description = document.getElementById('incomeDescription').value.trim();
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const date = document.getElementById('incomeDate').value;

    if (!description) return 'La descripción es requerida';
    if (!amount || amount <= 0) return 'El monto debe ser mayor a 0';
    if (!date) return 'La fecha es requerida';
    if (new Date(date) > new Date()) return 'La fecha no puede ser futura';
    return null;
},
expense: () => {
    const description = document.getElementById('expenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const date = document.getElementById('expenseDate').value;
    const expenseType = document.getElementById('expenseType').value;

    if (!description) return 'La descripción es requerida';
    if (!amount || amount <= 0) return 'El monto debe ser mayor a 0';
    if (!date) return 'La fecha es requerida';

    // For single expenses, don't allow future dates
    if (expenseType === 'single' && new Date(date) > new Date()) {
        return 'Los gastos únicos no pueden ser futuros';
}

    // For recurring expenses, allow future dates with more flexibility
    if (expenseType === 'recurring') {
        const expenseDate = new Date(date);
        const today = new Date();
        const twoYearsFromNow = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());

        // Allow up to 2 years in the future for recurring expenses
        if (expenseDate > twoYearsFromNow) {
            return 'Los gastos recurrentes no pueden programarse más de 2 años en el futuro';
        }
}

    return null;
},
debt: () => {
    const description = document.getElementById('debtDescription').value.trim();
    const amount = parseFloat(document.getElementById('debtAmount').value);
    const total = parseFloat(document.getElementById('debtTotal').value);
    const rate = parseFloat(document.getElementById('debtRate').value);

    if (!description) return 'La descripción es requerida';
    if (!amount || amount <= 0) return 'El pago mensual debe ser mayor a 0';
    if (!total || total <= 0) return 'La deuda total debe ser mayor a 0';
    if (rate < 0) return 'La tasa de interés no puede ser negativa';
    if (amount > total) return 'El pago mensual no puede ser mayor a la deuda total';
    return null;
},
savings: () => {
    const description = document.getElementById('savingsDescription').value.trim();
    const target = parseFloat(document.getElementById('savingsTarget').value);
    const monthly = parseFloat(document.getElementById('savingsMonthly').value);
    const date = document.getElementById('savingsDate').value;

    if (!description) return 'La descripción es requerida';
    if (!target || target <= 0) return 'La meta debe ser mayor a 0';
    if (!monthly || monthly <= 0) return 'El ahorro mensual debe ser mayor a 0';
    if (!date) return 'La fecha objetivo es requerida';
    if (new Date(date) <= new Date()) return 'La fecha objetivo debe ser futura';
    return null;
}
};

    return validations[formType] ? validations[formType]() : null;
}

// Enhanced Data Management
function backupData() {
    const backup = {
incomes: incomes,
expenses: expenses,
debts: debts,
savings: savings,
timestamp: new Date().toISOString()
};
    localStorage.setItem('finance_backup', JSON.stringify(backup));
    showAlert('Respaldo creado exitosamente', 'success');
}

function restoreData() {
    const backup = localStorage.getItem('finance_backup');
    if (!backup) {
showAlert('No hay respaldo disponible', 'warning');
return;
}

    if (confirm('¿Estás seguro de que quieres restaurar los datos? Esto sobrescribirá los datos actuales.')) {
const data = JSON.parse(backup);
incomes = data.incomes || [];
expenses = data.expenses || [];
debts = data.debts || [];
savings = data.savings || [];

saveToLocalStorage();
updateDashboard();
updateAllLists();
showAlert('Datos restaurados exitosamente', 'success');
}
}

function clearAllData() {
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
incomes = [];
expenses = [];
debts = [];
savings = [];

saveToLocalStorage();
updateDashboard();
updateAllLists();
showAlert('Todos los datos han sido eliminados', 'warning');
}
}

// Enhanced Projections with More Scenarios
function calculateAdvancedProjections() {
    const incomeIncrease = parseFloat(document.getElementById('incomeIncrease').value) || 0;
    const expenseIncrease = parseFloat(document.getElementById('expenseIncrease').value) || 0;
    const months = parseInt(document.getElementById('projectionMonths').value) || 12;
    const additionalExpense = parseFloat(document.getElementById('additionalExpense').value) || 0;

    // Calculate multiple scenarios
    const scenarios = [
{ name: 'Conservador', incomeInc: incomeIncrease * 0.5, expenseInc: expenseIncrease * 1.2 },
{ name: 'Realista', incomeInc: incomeIncrease, expenseInc: expenseIncrease },
{ name: 'Optimista', incomeInc: incomeIncrease * 1.5, expenseInc: expenseIncrease * 0.8 }
    ];

    const currentIncome = getTotalMonthlyIncome();
    const currentExpenses = getTotalMonthlyExpenses();
    const currentDebts = getTotalMonthlyDebts();
    const currentSavings = getTotalMonthlySavings();

    let resultsHTML = '<div class="summary-cards">';

    scenarios.forEach(scenario => {
const projectionData = [];
let cumulativeBalance = 0;

for (let month = 1; month <= months; month++) {
    const projectedIncome = currentIncome * (1 + scenario.incomeInc / 100);
    const projectedExpenses = (currentExpenses + additionalExpense) * (1 + scenario.expenseInc / 100);
    const monthlyBalance = projectedIncome - projectedExpenses - currentDebts - currentSavings;
    cumulativeBalance += monthlyBalance;

    projectionData.push({
        month,
        monthlyBalance,
        cumulativeBalance
});
}

const finalBalance = projectionData[projectionData.length - 1].cumulativeBalance;
const colorClass = finalBalance >= 0 ? 'income' : 'expense';

resultsHTML += `
            <div class="summary-card ${colorClass}">
                <h4>Escenario ${scenario.name}</h4>
                <div class="amount">$${finalBalance.toFixed(2)}</div>
                <small>Después de ${months} meses</small>
            </div>
        `;
});

    resultsHTML += '</div>';

    // Show the realistic scenario chart
    const realisticScenario = scenarios.find(s => s.name === 'Realista');
    const realisticData = [];
    let cumulativeBalance = 0;

    for (let month = 1; month <= months; month++) {
const projectedIncome = currentIncome * (1 + realisticScenario.incomeInc / 100);
const projectedExpenses = (currentExpenses + additionalExpense) * (1 + realisticScenario.expenseInc / 100);
const monthlyBalance = projectedIncome - projectedExpenses - currentDebts - currentSavings;
cumulativeBalance += monthlyBalance;

realisticData.push({
    month,
    monthlyBalance,
    cumulativeBalance,
    income: projectedIncome,
    expenses: projectedExpenses + currentDebts + currentSavings
});
}

    displayProjectionChart(realisticData);
    document.getElementById('projectionResults').style.display = 'block';
    document.getElementById('projectionSummary').innerHTML = resultsHTML;
}

// Settings Functions
function updateGoals() {
    const monthlyGoal = parseFloat(document.getElementById('monthlyGoal').value);
    const emergencyFund = parseFloat(document.getElementById('emergencyFund').value);

    localStorage.setItem('monthlyGoal', monthlyGoal.toString());
    localStorage.setItem('emergencyFund', emergencyFund.toString());

    showAlert('Metas actualizadas exitosamente', 'success');
    updateGeneralStats();
}

function updateGeneralStats() {
    const container = document.getElementById('generalStats');
    const totalIncome = getTotalMonthlyIncome();
    const totalExpenses = getTotalMonthlyExpenses();
    const totalDebts = getTotalMonthlyDebts();
    const totalSavings = getTotalMonthlySavings();

    const monthlyGoal = parseFloat(localStorage.getItem('monthlyGoal')) || 20;
    const emergencyFund = parseFloat(localStorage.getItem('emergencyFund')) || 6;

    const targetSavings = totalIncome * (monthlyGoal / 100);
    const emergencyTarget = totalExpenses * emergencyFund;

    const statsHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Total de Registros</h4>
                <div class="amount">${incomes.length + expenses.length + debts.length + savings.length}</div>
                <small>Entradas en total</small>
            </div>
            <div class="summary-card ${targetSavings <= totalSavings ? 'income' : 'expense'}">
                <h4>Meta de Ahorro</h4>
                <div class="amount">$${targetSavings.toFixed(2)}</div>
                <small>${monthlyGoal}% de ingresos</small>
            </div>
            <div class="summary-card">
                <h4>Fondo de Emergencia</h4>
                <div class="amount">$${emergencyTarget.toFixed(2)}</div>
                <small>${emergencyFund} meses de gastos</small>
            </div>
            <div class="summary-card">
                <h4>Eficiencia de Ahorro</h4>
                <div class="amount">${totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0}%</div>
                <small>Del total de ingresos</small>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <h4>📈 Análisis de Tendencias</h4>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 10px;">
                ${generateTrendAnalysis()}
            </div>
        </div>
    `;

    container.innerHTML = statsHTML;
}

function generateTrendAnalysis() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthExpenses = expenses.filter(expense => {
const expenseDate = new Date(expense.date);
return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
}).reduce((sum, expense) => sum + expense.amount, 0);

    const lastMonthExpenses = expenses.filter(expense => {
const expenseDate = new Date(expense.date);
const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
}).reduce((sum, expense) => sum + expense.amount, 0);

    const expenseChange = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

    let analysis = '<ul style="margin: 0; padding-left: 20px;">';

    if (expenseChange > 10) {
analysis += '<li style="color: #e74c3c;">⚠️ Gastos aumentaron significativamente este mes</li>';
} else if (expenseChange < -10) {
analysis += '<li style="color: #27ae60;">✅ Gastos disminuyeron considerablemente este mes</li>';
} else {
analysis += '<li style="color: #3498db;">📊 Gastos se mantienen estables</li>';
}

    const totalIncome = getTotalMonthlyIncome();
    const totalExpenses = getTotalMonthlyExpenses();
    const totalDebts = getTotalMonthlyDebts();
    const totalSavings = getTotalMonthlySavings();
    const totalExpensesAndDebts = totalExpenses + totalDebts;
    const remainingBalance = totalIncome - totalExpensesAndDebts - totalSavings;

    if (remainingBalance > 0) {
analysis += '<li style="color: #27ae60;">💰 Tienes superávit mensual</li>';
} else if (remainingBalance < 0) {
analysis += '<li style="color: #e74c3c;">💸 Tienes déficit mensual</li>';
} else {
analysis += '<li style="color: #f39c12;">⚖️ Balance equilibrado</li>';
}

    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    if (savingsRate >= 20) {
analysis += '<li style="color: #27ae60;">🎯 Excelente tasa de ahorro (≥20%)</li>';
} else if (savingsRate >= 10) {
analysis += '<li style="color: #f39c12;">📈 Buena tasa de ahorro (10-20%)</li>';
} else {
analysis += '<li style="color: #e74c3c;">📉 Considera aumentar tu tasa de ahorro</li>';
}

    analysis += '</ul>';
    return analysis;
}

// Date Filter Functions
function setPeriod(periodType) {
    const today = new Date();
    let fromDate, toDate;

    switch (periodType) {
case 'currentMonth':
    fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    break;
case 'lastMonth':
    fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    toDate = new Date(today.getFullYear(), today.getMonth(), 0);
    break;
case 'currentQuarter':
    const currentQuarter = Math.floor(today.getMonth() / 3);
    fromDate = new Date(today.getFullYear(), currentQuarter * 3, 1);
    toDate = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
    break;
case 'lastQuarter':
    const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
    const lastQuarterYear = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
    const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
    fromDate = new Date(lastQuarterYear, adjustedQuarter * 3, 1);
    toDate = new Date(lastQuarterYear, (adjustedQuarter + 1) * 3, 0);
    break;
case 'currentYear':
    fromDate = new Date(today.getFullYear(), 0, 1);
    toDate = new Date(today.getFullYear(), 11, 31);
    break;
case 'lastYear':
    fromDate = new Date(today.getFullYear() - 1, 0, 1);
    toDate = new Date(today.getFullYear() - 1, 11, 31);
    break;
case 'last6Months':
    fromDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    toDate = new Date(today.getFullYear(), today.getMonth(), 0);
    break;
case 'last12Months':
    fromDate = new Date(today.getFullYear(), today.getMonth() - 12, 1);
    toDate = new Date(today.getFullYear(), today.getMonth(), 0);
    break;
}

    document.getElementById('dateFrom').valueAsDate = fromDate;
    document.getElementById('dateTo').valueAsDate = toDate;

    // Highlight the active period button
    document.querySelectorAll('.btn-small').forEach(btn => btn.classList.remove('period-active'));
    event.target.classList.add('period-active');

    applyDateFilter();
}

function applyDateFilter() {
    const fromDate = document.getElementById('dateFrom').value;
    const toDate = document.getElementById('dateTo').value;

    if (!fromDate || !toDate) {
showAlert('Por favor selecciona ambas fechas (desde y hasta)', 'warning');
return;
}

    if (new Date(fromDate) > new Date(toDate)) {
showAlert('La fecha "desde" no puede ser posterior a la fecha "hasta"', 'danger');
return;
}

    currentDateFilter = {
from: new Date(fromDate),
to: new Date(toDate),
active: true
};

    updatePeriodSummary();
    updateDashboard();
    showAlert(`Filtro aplicado: ${formatDateRange(currentDateFilter.from, currentDateFilter.to)}`, 'success');
}

function clearDateFilter() {
    currentDateFilter = {
from: null,
to: null,
active: false
};

    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('periodSummary').innerHTML = '';

    // Remove active class from all period buttons
    document.querySelectorAll('.btn-small').forEach(btn => btn.classList.remove('period-active'));

    updateDashboard();
    showAlert('Filtro de fechas eliminado', 'warning');
}

function formatDateRange(from, to) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return `${from.toLocaleDateString('es-ES', options)} - ${to.toLocaleDateString('es-ES', options)}`;
}

function updatePeriodSummary() {
    if (!currentDateFilter.active) return;

    const periodExpenses = getFilteredExpenses();
    const periodIncomes = getFilteredIncomes();
    const totalDebts = getTotalMonthlyDebts(); // Debts are always monthly
    const totalSavings = getTotalMonthlySavings(); // Savings are always monthly

    const totalExpensesAndDebts = periodExpenses + totalDebts;
    const remainingBalance = periodIncomes - totalExpensesAndDebts - totalSavings;

    const daysInPeriod = Math.ceil((currentDateFilter.to - currentDateFilter.from) / (1000 * 60 * 60 * 24)) + 1;
    const avgDailyExpense = periodExpenses / daysInPeriod;

    const summaryHTML = `
        <div class="alert alert-success">
            <h4>📊 Resumen del Período: ${formatDateRange(currentDateFilter.from, currentDateFilter.to)}</h4>
            <div class="summary-cards" style="margin-top: 15px;">
                <div class="summary-card income">
                    <h5>Ingresos Reales</h5>
                    <div class="amount">$${periodIncomes.toFixed(2)}</div>
                    <small>En el período seleccionado</small>
                </div>
                <div class="summary-card expense">
                    <h5>Gastos Reales</h5>
                    <div class="amount">$${periodExpenses.toFixed(2)}</div>
                    <small>Promedio diario: $${avgDailyExpense.toFixed(2)}</small>
                </div>
                <div class="summary-card ${remainingBalance >= 0 ? 'income' : 'expense'}">
                    <h5>Balance Real</h5>
                    <div class="amount">$${remainingBalance.toFixed(2)}</div>
                    <small>Después de gastos y obligaciones</small>
                </div>
            </div>
        </div>
    `;

    document.getElementById('periodSummary').innerHTML = summaryHTML;
}

function getFilteredExpenses() {
    if (!currentDateFilter.active) return getTotalMonthlyExpenses();

    return expenses
.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= currentDateFilter.from && expenseDate <= currentDateFilter.to;
})
.reduce((total, expense) => total + expense.amount, 0);
}

function getFilteredIncomes() {
    if (!currentDateFilter.active) return getTotalMonthlyIncome();

    return incomes
.filter(income => {
    const incomeDate = new Date(income.date);
    return incomeDate >= currentDateFilter.from && incomeDate <= currentDateFilter.to;
})
.reduce((total, income) => total + income.amount, 0);
}

function getFilteredExpensesByCategory() {
    if (!currentDateFilter.active) {
const categoryTotals = {};
expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
});
return categoryTotals;
}

    const categoryTotals = {};
    expenses
.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= currentDateFilter.from && expenseDate <= currentDateFilter.to;
})
.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
});
    return categoryTotals;
}

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
    try {
// Set default dates
const today = new Date();
document.getElementById('incomeDate').valueAsDate = today;
document.getElementById('expenseDate').valueAsDate = today;
document.getElementById('reportMonth').valueAsDate = today;

// Initialize dashboard
updateDashboard();
updateAllLists();
updateGeneralStats();

// Add event listeners for real-time updates
document.getElementById('incomeAmount').addEventListener('input', updateDashboard);
document.getElementById('expenseAmount').addEventListener('input', updateDashboard);

// Load saved goals
const savedMonthlyGoal = localStorage.getItem('monthlyGoal');
const savedEmergencyFund = localStorage.getItem('emergencyFund');
if (savedMonthlyGoal) document.getElementById('monthlyGoal').value = savedMonthlyGoal;
if (savedEmergencyFund) document.getElementById('emergencyFund').value = savedEmergencyFund;

console.log('Personal Finance Manager initialized successfully');
            } catch (error) {
    handleError(error, 'initialization');
}
});
