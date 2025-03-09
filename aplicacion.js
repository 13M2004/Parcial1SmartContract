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

    if (usuario.tipo === 'patron') {
        menuPatrono.style.display = 'flex';
        menuEmpleado.style.display = 'none';
    } else {
        menuPatrono.style.display = 'none';
        menuEmpleado.style.display = 'flex';
    }
}

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
            <form id="formPago" onsubmit="event.preventDefault(); validarYRegistrarPago();">
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
                    <input type="number" id="monto" min="3000" step="0.01" required placeholder="Mínimo Q3,000">
                </div>
                <div class="grupo-formulario">
                    <label><i class="fas fa-calendar"></i> Fecha:</label>
                    <input type="date" id="fecha" required>
                </div>
                <div class="grupo-formulario">
                    <label><i class="fas fa-chart-pie"></i> Asistencia (%):</label>
                    <input type="number" id="asistencia" min="0" max="100" required placeholder="Mínimo 30%">
                </div>
                <div id="mensajeFormulario"></div>
                <div class="botones-grupo">
                    <button type="submit" class="btn-primario">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                    <button type="button" class="btn-secundario" onclick="limpiarFormulario()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </form>
        </div>
    `;
}

// Función para Historial de Pagos
// Función para mostrar historial de pagos del empleado
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
                    </tr>
                </thead>
                <tbody>
                    ${misPagos.map(pago => `
                        <tr>
                            <td>${new Date(pago.fecha).toLocaleDateString()}</td>
                            <td>Q ${pago.monto.toFixed(2)}</td>
                            <td>${pago.asistencia}%</td>
                            <td><span class="estado ${pago.estado}">${pago.estado}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${misPagos.length === 0 ? '<p class="mensaje-info">No hay pagos registrados aún.</p>' : ''}
        </div>
    `;
}

// Función para mostrar planilla (vista de empleado)
function mostrarPlanillaEmpleado() {
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
                    </tr>
                </thead>
                <tbody>
                    ${empleados.map(emp => `
                        <tr>
                            <td>${emp.id}</td>
                            <td>${emp.nombre}</td>
                            <td>${emp.puesto}</td>
                            <td><span class="estado ${emp.estado.toLowerCase()}">${emp.estado}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Exportar las funciones
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
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Asistencia</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagos.map(pago => `
                        <tr>
                            <td>${obtenerNombreEmpleado(pago.idEmpleado)}</td>
                            <td>Q ${pago.monto.toFixed(2)}</td>
                            <td>${new Date(pago.fecha).toLocaleDateString()}</td>
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
                        <th>Total Pagos</th>
                        <th>Promedio Asistencia</th>
                    </tr>
                </thead>
                <tbody>
                    ${empleados.map(emp => {
                        const totalPagos = calcularTotalPagos(emp.id);
                        const promedioAsistencia = calcularPromedioAsistencia(emp.id);
                        return `
                            <tr>
                                <td>${emp.id}</td>
                                <td>${emp.nombre}</td>
                                <td>${emp.puesto}</td>
                                <td><span class="estado ${emp.estado.toLowerCase()}">${emp.estado}</span></td>
                                <td>Q ${emp.salarioBase.toFixed(2)}</td>
                                <td>Q ${totalPagos}</td>
                                <td>${promedioAsistencia}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <div class="resumen-planilla">
                <h3>Resumen de Planilla</h3>
                <p>Total Empleados: ${empleados.length - 1}</p>
                <p>Total Salarios Base: Q ${empleados.reduce((sum, emp) => sum + emp.salarioBase, 0).toFixed(2)}</p>
            </div>
        </div>
    `;
}

function calcularPromedioAsistencia(idEmpleado) {
    const pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
    const pagosFiltrados = pagos.filter(p => p.idEmpleado === idEmpleado);
    if (pagosFiltrados.length === 0) return '0.00';
    const promedio = pagosFiltrados.reduce((sum, p) => sum + p.asistencia, 0) / pagosFiltrados.length;
    return promedio.toFixed(2);
}

// Funciones auxiliares
function validarYRegistrarPago() {
    const idEmpleado = document.getElementById('idEmpleado').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const fecha = document.getElementById('fecha').value;
    const asistencia = parseFloat(document.getElementById('asistencia').value);

    if (!idEmpleado || !monto || !fecha || !asistencia) {
        mostrarMensajeFormulario('Complete todos los campos', 'error');
        return;
    }

    if (monto < 3000) {
        mostrarMensajeFormulario('El monto debe ser mayor a Q3,000', 'error');
        return;
    }

    if (asistencia < 30) {
        mostrarMensajeFormulario('La asistencia debe ser mayor al 30%', 'error');
        return;
    }

    const pago = {
        idEmpleado,
        monto,
        fecha,
        asistencia,
        estado: 'pendiente'
    };

    const pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
    pagos.push(pago);
    localStorage.setItem('pagos', JSON.stringify(pagos));

    mostrarMensajeFormulario('Pago registrado exitosamente', 'exito');
    setTimeout(() => mostrarHistorialPagos(), 1500);
}

function obtenerNombreEmpleado(id) {
    const empleados = {
        'EMP001': 'Nayeli Urrutia',
        'EMP002': 'Ivania Palma',
        'EMP003': 'Alexander Palma'
    };
    return empleados[id] || 'Desconocido';
}

function calcularTotalPagos(idEmpleado) {
    const pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
    return pagos
        .filter(p => p.idEmpleado === idEmpleado && p.estado !== 'cancelado')
        .reduce((total, p) => total + p.monto, 0)
        .toFixed(2);
}

// Exportar funciones
window.mostrarRegistroPago = mostrarRegistroPago;
window.mostrarHistorialPagos = mostrarHistorialPagos;
window.mostrarPlanilla = mostrarPlanilla;
window.validarYRegistrarPago = validarYRegistrarPago;
window.generarPDF = generarPDF;
window.cancelarPago = cancelarPago;

function mostrarMensajeFormulario(texto, tipo) {
    const mensajeDiv = document.getElementById('mensajeFormulario');
    mensajeDiv.innerHTML = `
        <div class="mensaje ${tipo}">
            <i class="fas fa-${tipo === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            ${texto}
        </div>
    `;
}

function limpiarFormulario() {
    document.getElementById('formPago').reset();
    document.getElementById('mensajeFormulario').innerHTML = '';
}

// Agregar al objeto window para acceso global
window.mostrarRegistroPago = mostrarRegistroPago;
window.validarYRegistrarPago = validarYRegistrarPago;
window.limpiarFormulario = limpiarFormulario;

export function registrarNuevoPago() {
    const datos = {
        idEmpleado: parseInt(document.getElementById('idEmpleado').value),
        monto: parseFloat(document.getElementById('monto').value),
        fecha: document.getElementById('fecha').value,
        porcentajeHoras: parseInt(document.getElementById('porcentajeHoras').value)
    };

    smartContract.registrarPago(datos);
    mostrarMensaje('Pago registrado exitosamente', 'exito');
    mostrarHistorialPagos();
}

export function mostrarHistorialPagos() {
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));
    const pagos = usuario.tipo === 'patron' ? 
        smartContract.obtenerPagos() : 
        smartContract.obtenerPagosEmpleado(usuario.id);

    const contenido = `
        <div class="contenedor-tabla">
            <h3>Historial de Pagos</h3>
            <table class="tabla-historial-pagos">
                <thead>
                    <tr>
                        ${usuario.tipo === 'patron' ? '<th>Empleado</th>' : ''}
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagos.map(pago => {
                        const empleado = smartContract.obtenerEmpleado(pago.idEmpleado);
                        return `
                            <tr>
                                ${usuario.tipo === 'patron' ? `<td>${empleado.nombre}</td>` : ''}
                                <td>Q ${pago.monto.toFixed(2)}</td>
                                <td>${new Date(pago.fecha).toLocaleDateString()}</td>
                                <td><span class="estado-pago ${pago.estado}">${pago.estado}</span></td>
                                <td>
                                    ${usuario.tipo === 'patron' && pago.estado === 'pendiente' ? 
                                        `<button class="btn-cancelar-pago" onclick="cancelarPago(${pago.id})">
                                            <i class="fas fa-times"></i> Cancelar
                                        </button>` : 
                                        pago.estado === 'cancelado' ?
                                        `<button class="btn-pdf" onclick="verPDF(${pago.id})">
                                            <i class="fas fa-file-pdf"></i> Ver PDF
                                        </button>` : ''}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <button class="btn-cerrar-vista" onclick="cerrarVista()">
                <i class="fas fa-times"></i> Cerrar
            </button>
        </div>
    `;
    document.getElementById('contenidoDinamico').innerHTML = contenido;
}

export function mostrarPlanilla() {
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