import SmartContract from './SmartContract.js';
import { generarPDFPago } from './generadorPDFPago.js';

const smartContract = new SmartContract();

const USUARIOS_VALIDOS = {
    'PAT001': { tipo: 'patron', nombre: 'Manuel Monzón', puesto: 'Patrono', estado: 'Activo', id: 0 },
    'EMP001': { tipo: 'empleado', nombre: 'Nayeli Urrutia', puesto: 'Empleado', estado: 'Activo', id: 1 },
    'EMP002': { tipo: 'empleado', nombre: 'Ivania Palma', puesto: 'Empleado', estado: 'Activo', id: 2 },
    'EMP003': { tipo: 'empleado', nombre: 'Alexander Palma', puesto: 'Empleado', estado: 'Activo', id: 3 }
};

function validarLogin() {
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!usuario || !password) {
        mostrarMensaje('Complete todos los campos', 'error');
        return;
    }

    if (!USUARIOS_VALIDOS[usuario]) {
        mostrarMensaje('Usuario no encontrado', 'error');
        return;
    }

    if (password !== '123') {
        mostrarMensaje('Contraseña incorrecta', 'error');
        document.getElementById('password').value = '';
        return;
    }

    const userData = USUARIOS_VALIDOS[usuario];
    localStorage.setItem('usuarioActual', JSON.stringify(userData));
    mostrarMensaje('Inicio de sesión exitoso', 'exito');

    setTimeout(() => {
        window.location.href = 'panel.html';
    }, 1000);
}

function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensajeLogin');
    mensajeDiv.innerHTML = `
        <div class="mensaje ${tipo}">
            <i class="fas fa-${tipo === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            ${texto}
        </div>
    `;

    setTimeout(() => {
        mensajeDiv.innerHTML = '';
    }, 3000);
}

// Funciones del panel
function inicializarPanel() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('nombreUsuario').textContent = usuario.nombre;
    document.getElementById('tituloPagina').textContent = `Bienvenido, ${usuario.nombre}`;

    const menuPatrono = document.getElementById('menuPatrono');
    const menuEmpleado = document.getElementById('menuEmpleado');

    // Asegurar que los menús estén visibles según el tipo de usuario
    if (usuario.tipo === 'patron') {
        menuPatrono.style.display = 'flex';
        menuEmpleado.style.display = 'none';
    } else {
        menuPatrono.style.display = 'none';
        menuEmpleado.style.display = 'flex';
    }
}

// Asegurar que el script se ejecute cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarPanel);

function cerrarSesion() {
    // Limpiar datos de sesión
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('pagos');
    
    // Mostrar mensaje de cierre de sesión
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje exito';
    mensajeDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Cerrando sesión...
    `;
    document.body.appendChild(mensajeDiv);

    // Redireccionar después de mostrar el mensaje
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Asegurar que el botón de cerrar sesión esté disponible globalmente
window.cerrarSesion = cerrarSesion;

// Inicialización según la página
if (window.location.pathname.includes('panel.html')) {
    document.addEventListener('DOMContentLoaded', inicializarPanel);
}

// Exportar funciones necesarias
window.validarLogin = validarLogin;
window.cerrarSesion = cerrarSesion;

// Función para Registro de Nuevo Pago
function mostrarRegistroPago() {
    const contenidoDinamico = document.getElementById('contenidoDinamico');
    contenidoDinamico.innerHTML = `
        <div class="formulario-container">
            <h2><i class="fas fa-money-bill-wave"></i> Registro de Nuevo Pago</h2>
            <form id="formPago" onsubmit="event.preventDefault(); registrarPago();">
                <div class="grupo-formulario">
                    <label><i class="fas fa-user"></i> Empleado:</label>
                    <select id="idEmpleado" required>
                        <option value="">Seleccione un empleado</option>
                        <option value="EMP001">Nayeli Urrutia</option>
                        <option value="EMP002">Ivania Palma</option>
                        <option value="EMP003">Alexander Palma</option>
                    </select>
                </div>
                <div class="grupo-formulario">
                    <label><i class="fas fa-dollar-sign"></i> Monto (Q):</label>
                    <input type="number" id="monto" min="3000" step="0.01" required>
                </div>
                <div class="grupo-formulario">
                    <label><i class="fas fa-calendar"></i> Fecha:</label>
                    <input type="date" id="fecha" required>
                </div>
                <div class="grupo-formulario">
                    <label><i class="fas fa-percentage"></i> Asistencia (%):</label>
                    <input type="number" id="asistencia" min="0" max="100" required>
                </div>
                <div class="botones-grupo">
                    <button type="submit" class="btn-primario">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </form>
        </div>
    `;
}

// Función para mostrar el historial de pagos
function mostrarHistorialPagos() {
    const pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
    const contenidoDinamico = document.getElementById('contenidoDinamico');
    
    contenidoDinamico.innerHTML = `
        <div class="tabla-container">
            <h2><i class="fas fa-history"></i> Historial de Pagos</h2>
            <table class="tabla-datos">
                <thead>
                    <tr>
                        <th>Empleado</th>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Asistencia</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagos.map(pago => `
                        <tr>
                            <td>${obtenerNombreEmpleado(pago.idEmpleado)}</td>
                            <td>${new Date(pago.fecha).toLocaleDateString()}</td>
                            <td>Q ${pago.monto.toFixed(2)}</td>
                            <td>${pago.asistencia}%</td>
                            <td><span class="estado ${pago.estado}">${pago.estado}</span></td>
                            <td>
                                <button class="btn-accion" onclick="generarPDF('${pago.id}')">
                                    <i class="fas fa-file-pdf"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Función para mostrar la planilla
function mostrarPlanilla() {
    const empleados = [
        { id: 'PAT001', nombre: 'Manuel Monzón', puesto: 'Patrono', estado: 'Activo' },
        { id: 'EMP001', nombre: 'Nayeli Urrutia', puesto: 'Empleado', estado: 'Activo' },
        { id: 'EMP002', nombre: 'Ivania Palma', puesto: 'Empleado', estado: 'Activo' },
        { id: 'EMP003', nombre: 'Alexander Palma', puesto: 'Empleado', estado: 'Activo' }
    ];

    const contenidoDinamico = document.getElementById('contenidoDinamico');
    contenidoDinamico.innerHTML = `
        <div class="tabla-container">
            <h2><i class="fas fa-users"></i> Planilla General</h2>
            <table class="tabla-datos">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Puesto</th>
                        <th>Estado</th>
                        <th>Total Pagos</th>
                    </tr>
                </thead>
                <tbody>
                    ${empleados.map(emp => `
                        <tr>
                            <td>${emp.id}</td>
                            <td>${emp.nombre}</td>
                            <td>${emp.puesto}</td>
                            <td><span class="estado ${emp.estado.toLowerCase()}">${emp.estado}</span></td>
                            <td>Q ${calcularTotalPagos(emp.id)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Funciones auxiliares
function obtenerNombreEmpleado(id) {
    const empleados = {
        'EMP001': 'Nayeli Urrutia',
        'EMP002': 'Ivania Palma',
        'EMP003': 'Alexander Palma'
    };
    return empleados[id] || 'Desconocido';
}

function calcularTotalPagos(id) {
    const pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
    return pagos
        .filter(p => p.idEmpleado === id)
        .reduce((total, p) => total + p.monto, 0)
        .toFixed(2);
}

function registrarPago() {
    const pago = {
        id: Date.now().toString(),
        idEmpleado: document.getElementById('idEmpleado').value,
        monto: parseFloat(document.getElementById('monto').value),
        fecha: document.getElementById('fecha').value,
        asistencia: parseFloat(document.getElementById('asistencia').value),
        estado: 'pendiente'
    };

    if (pago.asistencia < 30) {
        alert('La asistencia debe ser mayor al 30%');
        return;
    }

    if (pago.monto < 3000) {
        alert('El monto debe ser mayor a Q3,000');
        return;
    }

    const pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
    pagos.push(pago);
    localStorage.setItem('pagos', JSON.stringify(pagos));
    
    alert('Pago registrado exitosamente');
    mostrarHistorialPagos();
}

// Exportar funciones
window.mostrarRegistroPago = mostrarRegistroPago;
window.mostrarHistorialPagos = mostrarHistorialPagos;
window.mostrarPlanilla = mostrarPlanilla;
window.registrarPago = registrarPago;

// Función para mostrar el historial de pagos del empleado
function mostrarHistorialEmpleado() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    const pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
    const misPagos = pagos.filter(pago => pago.idEmpleado === usuarioActual.id);

    const contenidoDinamico = document.getElementById('contenidoDinamico');
    contenidoDinamico.innerHTML = `
        <div class="tabla-container">
            <h2><i class="fas fa-history"></i> Mi Historial de Pagos</h2>
            <table class="tabla-datos">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Asistencia</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${misPagos.length === 0 ? `
                        <tr>
                            <td colspan="5" class="mensaje-vacio">No hay pagos registrados</td>
                        </tr>
                    ` : misPagos.map(pago => `
                        <tr>
                            <td>${new Date(pago.fecha).toLocaleDateString()}</td>
                            <td>Q ${pago.monto.toFixed(2)}</td>
                            <td>${pago.asistencia}%</td>
                            <td><span class="estado ${pago.estado.toLowerCase()}">${pago.estado}</span></td>
                            <td>
                                <button class="btn-accion" onclick="verDetallePago('${pago.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Función para mostrar la planilla general
function mostrarPlanillaEmpleado() {
    const empleados = [
        { id: 'PAT001', nombre: 'Manuel Monzón', puesto: 'Patrono', estado: 'Activo', salarioBase: 15000 },
        { id: 'EMP001', nombre: 'Nayeli Urrutia', puesto: 'Empleado', estado: 'Activo', salarioBase: 5000 },
        { id: 'EMP002', nombre: 'Ivania Palma', puesto: 'Empleado', estado: 'Activo', salarioBase: 5000 },
        { id: 'EMP003', nombre: 'Alexander Palma', puesto: 'Empleado', estado: 'Activo', salarioBase: 5000 }
    ];

    const contenidoDinamico = document.getElementById('contenidoDinamico');
    contenidoDinamico.innerHTML = `
        <div class="tabla-container">
            <h2><i class="fas fa-users"></i> Planilla General</h2>
            <table class="tabla-datos">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Puesto</th>
                        <th>Estado</th>
                        <th>Salario Base</th>
                    </tr>
                </thead>
                <tbody>
                    ${empleados.map(emp => `
                        <tr>
                            <td>${emp.id}</td>
                            <td>${emp.nombre}</td>
                            <td>${emp.puesto}</td>
                            <td><span class="estado ${emp.estado.toLowerCase()}">${emp.estado}</span></td>
                            <td>Q ${emp.salarioBase.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Agregar estilos adicionales
const estilos = `
    .mensaje-vacio {
        text-align: center;
        padding: 20px;
        color: #666;
        font-style: italic;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = estilos;
document.head.appendChild(styleSheet);

// Exportar funciones
window.mostrarHistorialEmpleado = mostrarHistorialEmpleado;
window.mostrarPlanillaEmpleado = mostrarPlanillaEmpleado;

function mostrarHistorialPagos() {
    const pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
    const contenidoDinamico = document.getElementById('contenidoDinamico');
    
    contenidoDinamico.innerHTML = `
        <div class="tabla-container">
            <h2><i class="fas fa-history"></i> Historial de Pagos</h2>
            <table class="tabla-datos">
                <thead>
                    <tr>
                        <th>Empleado</th>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Asistencia</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagos.map(pago => `
                        <tr>
                            <td>${obtenerNombreEmpleado(pago.idEmpleado)}</td>
                            <td>${new Date(pago.fecha).toLocaleDateString()}</td>
                            <td>${pago.monto.toFixed(2)}</td>
                            <td>${pago.asistencia}%</td>
                            <td><span class="estado ${pago.estado}">${pago.estado}</span></td>
                            <td>
                                <button class="btn-accion" onclick="generarPDF('${pago.idEmpleado}')">
                                    <i class="fas fa-file-pdf"></i>
                                </button>
                                <button class="btn-accion" onclick="cancelarPago('${pago.idEmpleado}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Función para Planilla
function mostrarPlanilla() {
    const contenido = `
        <div class="contenedor-tabla">
            <h3>Planilla de Empleados</h3>
            <table class="tabla-planilla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Puesto</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.values(USUARIOS_VALIDOS).map(usuario => `
                        <tr>
                            <td>${usuario.id}</td>
                            <td>${usuario.nombre}</td>
                            <td>${usuario.puesto}</td>
                            <td><span class="estado-empleado ${usuario.estado.toLowerCase()}">${usuario.estado}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button class="btn-cerrar-vista" onclick="cerrarVista()">
                <i class="fas fa-times"></i> Cerrar
            </button>
        </div>
    `;
    document.getElementById('contenidoDinamico').innerHTML = contenido;
}

export function verPDF(idPago) {
    const pago = smartContract.obtenerPagos().find(p => p.id === idPago);
    const empleado = smartContract.obtenerEmpleado(pago.idEmpleado);
    const contenidoPDF = generarPDFPago(pago, empleado);
    
    document.getElementById('contenidoDinamico').innerHTML = contenidoPDF;
}

export function cancelarPago(idPago) {
    if (smartContract.cancelarPago(idPago)) {
        mostrarMensaje('Pago cancelado exitosamente', 'exito');
        mostrarHistorialPagos();
    }
}

export function cerrarVista() {
    document.getElementById('contenidoDinamico').innerHTML = '';
}

export function cerrarSesion() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensajeLogin') || document.createElement('div');
    mensajeDiv.innerHTML = `
        <div class="mensaje ${tipo}">
            <i class="fas fa-${tipo === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            ${texto}
        </div>
    `;
    
    setTimeout(() => {
        mensajeDiv.innerHTML = '';
    }, 3000);
}

// Inicialización al cargar la página del panel
if (window.location.pathname.includes('panel.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        if (!usuario) {
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('nombreUsuario').textContent = usuario.nombre;
        document.getElementById(`menu${usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}`).classList.add('activo');
    });
}

// Hacer las funciones disponibles globalmente
Object.entries({
    mostrarRegistroPago,
    mostrarHistorialPagos,
    mostrarPlanilla,
    registrarNuevoPago,
    cancelarPago,
    verPDF,
    cerrarVista,
    cerrarSesion
}).forEach(([nombre, funcion]) => {
    window[nombre] = funcion;
});