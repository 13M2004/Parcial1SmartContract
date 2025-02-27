// Initialize payments array
let payments = JSON.parse(localStorage.getItem('payments')) || [];

// Valid users configuration
const VALID_USERS = {
    'EMP001': { type: 'employee', name: 'Empleado 1' },
    'EMP002': { type: 'employee', name: 'Empleado 2' },
    'EMP003': { type: 'employee', name: 'Empleado 3' },
    'PAT001': { type: 'employer', name: 'Patrono' }
};

function login() {
    const userType = document.getElementById('userType').value;
    const userId = document.getElementById('userId').value;
    if (!userId || !userType) {
        alert('Por favor complete todos los campos');
        return;
    }
    const user = VALID_USERS[userId];
    if (!user || user.type !== userType) {
        alert('ID de usuario inválido o tipo de usuario incorrecto');
        return;
    }
    localStorage.setItem('currentUserId', userId);
    document.getElementById('loginSection').classList.add('hidden');
    
    if (userType === 'employer') {
        document.getElementById('employerDashboard').classList.remove('hidden');
    } else {
        document.getElementById('employeeDashboard').classList.remove('hidden');
        showEmployeePayments();
    }
}

function logout() {
    hideAllSections();
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('userType').value = '';
    document.getElementById('userId').value = '';
}

function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.add('hidden'));
}

function showEmployerSection(section) {
    hideAllSections();
    document.getElementById('employerDashboard').classList.remove('hidden');
    
    const contentArea = document.getElementById('employerContent');
    if (!contentArea) {
        const newContentArea = document.createElement('div');
        newContentArea.id = 'employerContent';
        document.getElementById('employerDashboard').appendChild(newContentArea);
    } else {
        contentArea.innerHTML = '';
    }
    
    switch(section) {
        case 'newPayment':
            showNewPaymentForm();
            break;
        case 'pendingPayments':
            showPendingPayments();
            break;
        case 'paymentHistory':
            showPaymentHistory();
            break;
    }
}

function validateAndSubmitPayment(event) {
    event.preventDefault();
    
    const employeeId = document.getElementById('employeeId').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    if (!VALID_USERS[employeeId] || VALID_USERS[employeeId].type !== 'employee') {
        alert('ID de empleado no válido. Use EMP001, EMP002 o EMP003');
        return false;
    }
    
    const paymentData = {
        id: Date.now().toString(),
        employeeId: employeeId,
        employeeName: VALID_USERS[employeeId].name,
        amount: amount,
        date: document.getElementById('paymentDate').value,
        attendance: document.getElementById('attendance').value,
        hoursWorked: document.getElementById('hoursWorked').value,
        status: 'Pendiente'
    };
    
    payments.push(paymentData);
    localStorage.setItem('payments', JSON.stringify(payments));
    
    alert('Pago registrado exitosamente');
    showPendingPayments();
    return false;
}

function showEmployeePayments() {
    const employeeId = localStorage.getItem('currentUserId');
    const employeePayments = payments.filter(payment => payment.employeeId === employeeId);

    const content = `
        <div class="section">
            <div class="section-header">
                <h3>Mis Pagos</h3>
                <button onclick="closeEmployeeTable()" class="close-btn">Cerrar</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employeePayments.length === 0 ? 
                            '<tr><td colspan="4" style="text-align: center; font-style: italic;">No hay pagos registrados</td></tr>' :
                            employeePayments.map(payment => `
                                <tr>
                                    <td>${payment.date}</td>
                                    <td>Q.${payment.amount.toFixed(2)}</td>
                                    <td class="status-${payment.status.toLowerCase()}">${payment.status}</td>
                                    <td>
                                        Asistencia: ${payment.attendance}%<br>
                                        Horas: ${payment.hoursWorked}
                                    </td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('employeeContent').innerHTML = content;
}

function showEmployeeSection(section) {
    hideAllSections();
    document.getElementById('employeeDashboard').classList.remove('hidden');
    
    const contentArea = document.getElementById('employeeContent');
    if (!contentArea) {
        const newContentArea = document.createElement('div');
        newContentArea.id = 'employeeContent';
        document.getElementById('employeeDashboard').appendChild(newContentArea);
    } else {
        contentArea.innerHTML = '';
    }
    
    switch(section) {
        case 'viewPayments':
        case 'viewStatus':
            showEmployeePayments();
            break;
    }
}

function closeEmployeeTable() {
    document.getElementById('employeeContent').innerHTML = '';
}

function closeTable() {
    document.getElementById('employerContent').innerHTML = '';
}

// Initialize employee menu
document.getElementById('employeeMenu').innerHTML = `
    <div class="menu-buttons">
        <button onclick="showEmployeeSection('viewPayments')" class="menu-btn">MIS PAGOS</button>
        <button onclick="showEmployeeSection('viewStatus')" class="menu-btn">ESTADO DE PAGOS</button>
    </div>
`;