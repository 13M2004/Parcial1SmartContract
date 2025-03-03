// Funciones de inicio de sesión
// Inicializar arreglo de pagos desde el almacenamiento local
let pagos = JSON.parse(localStorage.getItem('pagos')) || [];

// Configuración de usuarios válidos del sistema
const USUARIOS_VALIDOS = {
    'PAT001': { tipo: 'patrono', nombre: 'Manuel Monzón', puesto: 'Patrono', estado: 'Activo' },
    'EMP001': { tipo: 'empleado', nombre: 'Nayeli Urrutia', puesto: 'Empleado', estado: 'Activo' },
    'EMP002': { tipo: 'empleado', nombre: 'Ivania Palma', puesto: 'Empleado', estado: 'Activo' },
    'EMP003': { tipo: 'empleado', nombre: 'Alexander Palma', puesto: 'Empleado', estado: 'Activo' }
};

// Base de datos de usuarios para validación de inicio de sesión
const usuarios = {
    patrono: {
        'PAT001': { tipo: 'patrono', nombre: 'Manuel Monzón' }
    },
    empleado: {
        'EMP001': { tipo: 'empleado', nombre: 'Nayeli Urrutia' },
        'EMP002': { tipo: 'empleado', nombre: 'Ivania Palma' },
        'EMP003': { tipo: 'empleado', nombre: 'Alexander Palma' }
    }
};

// Función para manejar el inicio de sesión
function iniciarSesion() {
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const idUsuario = document.getElementById('idUsuario').value;
    const contenedorMensaje = document.getElementById('mensajeLogin');

    contenedorMensaje.innerHTML = '';

    if (!tipoUsuario || !idUsuario) {
        mostrarMensajeLogin('Por favor complete todos los campos', 'error');
        return;
    }

    if (usuarios[tipoUsuario] && usuarios[tipoUsuario][idUsuario]) {
        const usuario = usuarios[tipoUsuario][idUsuario];
        localStorage.setItem('idUsuarioActual', idUsuario);
        localStorage.setItem('tipoUsuarioActual', tipoUsuario);
        
        document.getElementById('seccionLogin').classList.add('oculto');
        
        // Mostrar solo el panel correspondiente al tipo de usuario
        if (tipoUsuario === 'patrono') {
            document.getElementById('panelPatrono').classList.remove('oculto');
            document.getElementById('panelEmpleado').classList.add('oculto');
            cargarMenuPatrono();
        } else {
            document.getElementById('panelEmpleado').classList.remove('oculto');
            document.getElementById('panelPatrono').classList.add('oculto');
            cargarMenuEmpleado();
        }
        
        mostrarMensajeLogin(`Bienvenido ${usuario.nombre}`, 'exito');
    } else {
        mostrarMensajeLogin('Usuario o tipo de usuario incorrecto', 'error');
    }
}

function cargarMenuPatrono() {
    const contenidoPatrono = document.getElementById('contenidoPatrono');
    contenidoPatrono.innerHTML = `
        <div class="menu-principal">
            <h2>Panel de Control - Patrono</h2>
            <div class="menu-botones">
                <button onclick="mostrarSeccionPatrono('nuevoPago')" class="btn-action">REGISTRAR NUEVO PAGO</button>
                <button onclick="mostrarSeccionPatrono('pagosPendientes')" class="btn-action">PAGOS PENDIENTES</button>
                <button onclick="mostrarSeccionPatrono('historial')" class="btn-action">HISTORIAL DE PAGOS</button>
            </div>
        </div>
    `;
}

function cargarMenuEmpleado() {
    const contenidoEmpleado = document.getElementById('contenidoEmpleado');
    contenidoEmpleado.innerHTML = `
        <div class="menu-principal">
            <h2>Panel de Control - Empleado</h2>
            <div class="menu-botones">
                <button onclick="mostrarSeccionEmpleado('verPagos')" class="btn-action">VER MIS PAGOS</button>
                <button onclick="mostrarSeccionEmpleado('boletas')" class="btn-action">MIS BOLETAS</button>
            </div>
        </div>
    `;
}
function mostrarMensajeLogin(mensaje, tipo) {
    const contenedor = document.getElementById('mensajeLogin');
    if (contenedor) {
        contenedor.innerHTML = `<div class="mensaje ${tipo}">${mensaje}</div>`;
        if (tipo === 'exito') {
            setTimeout(() => {
                contenedor.innerHTML = '';
            }, 2000);
        }
    }
}
function cerrarSesion() {
    localStorage.removeItem('idUsuarioActual');
    localStorage.removeItem('tipoUsuarioActual');
    document.getElementById('panelPatrono').classList.add('oculto');
    document.getElementById('panelEmpleado').classList.add('oculto');
    document.getElementById('seccionLogin').classList.remove('oculto');
    document.getElementById('tipoUsuario').value = '';
    document.getElementById('idUsuario').value = '';
}

// Función para ocultar todas las secciones
function ocultarTodasLasSecciones() {
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(seccion => seccion.classList.add('oculto'));
}
// Funciones para el panel del patrono
function mostrarSeccionPatrono(seccion) {
    const contenidoPatrono = document.getElementById('contenidoPatrono');
    
    switch(seccion) {
        case 'nuevoPago':
            contenidoPatrono.innerHTML = `
                <div class="seccion">
                    <div class="seccion-header">
                        <h3>Registrar Nuevo Pago</h3>
                        <button onclick="volverMenu('patrono')" class="btn-cerrar">Cerrar</button>
                    </div>
                    <form id="formularioPago" onsubmit="return validarYEnviarPago(event)">
                        <div class="form-group">
                            <label>ID del Empleado:</label>
                            <input type="text" id="idEmpleado" required placeholder="Ejemplo: EMP001">
                        </div>
                        <div class="form-group">
                            <label>Monto (Q):</label>
                            <input type="number" id="monto" required min="0" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Fecha:</label>
                            <input type="date" id="fechaPago" required>
                        </div>
                        <div class="form-group">
                            <label>Asistencia (%):</label>
                            <input type="number" id="asistencia" required min="0" max="100">
                        </div>
                        <div class="form-group">
                            <label>Horas Trabajadas:</label>
                            <input type="number" id="horasTrabajadas" required min="0">
                        </div>
                        <button type="submit" class="btn-action">Registrar Pago</button>
                    </form>
                </div>
            `;
            break;

        case 'pagosPendientes':
            contenidoPatrono.innerHTML = `
                <div class="seccion">
                    <div class="seccion-header">
                        <h3>Pagos Pendientes</h3>
                        <button onclick="volverMenu('patrono')" class="btn-cerrar">Cerrar</button>
                    </div>
                    <div class="contenedor-tabla">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Empleado</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tablaPagosPendientes">
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            cargarPagosPendientes();
            break;

        case 'historial':
            contenidoPatrono.innerHTML = `
                <div class="seccion">
                    <div class="seccion-header">
                        <h3>Historial de Pagos</h3>
                        <button onclick="volverMenu('patrono')" class="btn-cerrar">Cerrar</button>
                    </div>
                    <div class="contenedor-tabla">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Empleado</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="tablaHistorial">
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            cargarHistorialPagos();
            break;
    }
}
// Funciones para el panel del empleado
function mostrarSeccionEmpleado(seccion) {
    const contenidoEmpleado = document.getElementById('contenidoEmpleado');
    
    switch(seccion) {
        case 'verPagos':
            contenidoEmpleado.innerHTML = `
                <div class="seccion">
                    <div class="seccion-header">
                        <h3>Mis Pagos</h3>
                        <button onclick="volverMenu('empleado')" class="btn-cerrar">Cerrar</button>
                    </div>
                    <div class="contenedor-tabla">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                    <th>Detalles</th>
                                </tr>
                            </thead>
                            <tbody id="tablaPagosEmpleado">
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            cargarPagosEmpleado();
            break;

        case 'boletas':
            contenidoEmpleado.innerHTML = `
                <div class="seccion">
                    <div class="seccion-header">
                        <h3>Mis Boletas de Pago</h3>
                        <button onclick="volverMenu('empleado')" class="btn-cerrar">Cerrar</button>
                    </div>
                    <div class="contenedor-tabla">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                    <th>Detalles</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tablaBoletasEmpleado">
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            cargarBoletasEmpleado();
            break;
    }
}
function volverMenu(tipo) {
    if (tipo === 'patrono') {
        document.getElementById('contenidoPatrono').innerHTML = '';
    } else {
        document.getElementById('contenidoEmpleado').innerHTML = '';
    }
}
function mostrarHistorialPagos() {
    const contenido = `
        <div class="seccion">
            <h3>Historial de Pagos</h3>
            <div class="contenedor-tabla">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Empleado</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagos.map(pago => `
                            <tr>
                                <td>${pago.fecha}</td>
                                <td>${USUARIOS_VALIDOS[pago.idEmpleado]?.nombre || 'No encontrado'}</td>
                                <td>Q${pago.monto.toFixed(2)}</td>
                                <td>${pago.estado}</td>
                                <td>
                                    Asistencia: ${pago.asistencia}%<br>
                                    Horas: ${pago.horasTrabajadas}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('contenidoPatrono').innerHTML = contenido;
}

function validarYEnviarPago(evento) {
    evento.preventDefault();
    
    const idEmpleado = document.getElementById('idEmpleado').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const fecha = document.getElementById('fechaPago').value;
    const asistencia = parseInt(document.getElementById('asistencia').value);
    const horasTrabajadas = parseInt(document.getElementById('horasTrabajadas').value);
    
    // Validaciones específicas
    if (!USUARIOS_VALIDOS[idEmpleado]) {
        mostrarMensajePago('ID de empleado no existe en el sistema', 'error');
        return false;
    }
    
    if (monto <= 0) {
        mostrarMensajePago('El monto debe ser mayor a 0', 'error');
        return false;
    }
    
    if (asistencia < 0 || asistencia > 100) {
        mostrarMensajePago('La asistencia debe estar entre 0 y 100%', 'error');
        return false;
    }
    
    if (horasTrabajadas < 0) {
        mostrarMensajePago('Las horas trabajadas no pueden ser negativas', 'error');
        return false;
    }
    
    const datosPago = {
        id: `PAGO${Date.now()}`,
        idEmpleado,
        monto,
        fecha,
        asistencia,
        horasTrabajadas,
        estado: 'Pendiente'
    };
    
    guardarPago(datosPago);
    mostrarMensajePago('Pago registrado exitosamente', 'exito');
    evento.target.reset();
    return false;
}

function mostrarMensajePago(mensaje, tipo) {
    const contenedor = document.getElementById('mensajePago');
    if (contenedor) {
        contenedor.innerHTML = `<div class="mensaje ${tipo}">${mensaje}</div>`;
        setTimeout(() => {
            contenedor.innerHTML = '';
        }, 3000);
    }
}

// Función para cerrar tabla de empleado
function cerrarTablaEmpleado() {
    document.querySelector('#contenidoEmpleado').innerHTML = '';
}

// Inicialización del sistema
document.addEventListener('DOMContentLoaded', () => {
    const formularioPago = document.getElementById('formularioPago');
    if (formularioPago) {
        formularioPago.addEventListener('submit', validarYEnviarPago);
    }
});

function cerrarSesion() {
    location.reload();
}

function cerrarTabla() {
    document.querySelector('.seccion-contenido:not(.oculto)').classList.add('oculto');
}

function mostrarMensaje(mensaje, tipo) {
    const contenedorMensaje = document.getElementById('mensajeLogin');
    contenedorMensaje.innerHTML = `<div class="mensaje ${tipo}">${mensaje}</div>`;
}