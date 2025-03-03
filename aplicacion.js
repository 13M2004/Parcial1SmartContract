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
        mostrarMensaje('Por favor complete todos los campos', 'error');
        return;
    }

    if (usuarios[tipoUsuario] && usuarios[tipoUsuario][idUsuario]) {
        localStorage.setItem('idUsuarioActual', idUsuario);
        localStorage.setItem('tipoUsuarioActual', tipoUsuario);
        document.getElementById('seccionLogin').classList.add('oculto');
        
        if (tipoUsuario === 'patrono') {
            document.getElementById('panelPatrono').classList.remove('oculto');
        } else {
            document.getElementById('panelEmpleado').classList.remove('oculto');
        }
    } else {
        mostrarMensaje('Credenciales inválidas', 'error');
    }
}

// Función para cerrar sesión
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

// Función para mostrar secciones del panel del patrono
function mostrarSeccionPatrono(seccion) {
    ocultarTodasLasSecciones();
    
    switch(seccion) {
        case 'planilla':
            mostrarPlanilla();
            break;
        case 'pagosPendientes':
            document.getElementById('seccionPagosPendientes').classList.remove('oculto');
            cargarPagosPendientes();
            break;
        case 'nuevoPago':
            document.getElementById('seccionNuevoPago').classList.remove('oculto');
            break;
    }
}

// Función para mostrar secciones del panel del empleado
function mostrarSeccionEmpleado(seccion) {
    ocultarTodasLasSecciones();
    document.getElementById('panelEmpleado').classList.remove('oculto');
    
    switch(seccion) {
        case 'verPagos':
            mostrarPagosEmpleado();
            break;
        case 'boletas':
            mostrarBoletas();
            break;
    }
}

// Función para mostrar la planilla de empleados
function mostrarPlanilla() {
    const contenido = `
        <div class="seccion">
            <div class="encabezado-seccion">
                <h3>Planilla de Empleados</h3>
                <button onclick="cerrarTabla()" class="boton-cerrar">Cerrar</button>
            </div>
            <div class="contenedor-tabla">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>NOMBRE</th>
                            <th>PUESTO</th>
                            <th>ESTADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(USUARIOS_VALIDOS)
                            .filter(([_, usuario]) => usuario.tipo === 'empleado')
                            .map(([id, usuario]) => `
                                <tr>
                                    <td>${id}</td>
                                    <td>${usuario.nombre}</td>
                                    <td>${usuario.puesto}</td>
                                    <td class="estado-activo">${usuario.estado}</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    let areaContenido = document.getElementById('contenidoPatrono');
    if (!areaContenido) {
        areaContenido = document.createElement('div');
        areaContenido.id = 'contenidoPatrono';
        document.getElementById('panelPatrono').appendChild(areaContenido);
    }
    areaContenido.innerHTML = contenido;
}

// Función para cargar pagos pendientes
function cargarPagosPendientes() {
    const tablaPagosPendientes = document.getElementById('tablaPagosPendientes');
    const pagosPendientes = pagos.filter(p => p.estado === 'Pendiente');

    tablaPagosPendientes.innerHTML = pagosPendientes.length === 0 ? 
        '<tr><td colspan="5" style="text-align: center;">No hay pagos pendientes</td></tr>' :
        pagosPendientes.map(pago => `
            <tr>
                <td>${pago.idEmpleado}</td>
                <td>${USUARIOS_VALIDOS[pago.idEmpleado].nombre}</td>
                <td>Q${pago.monto.toFixed(2)}</td>
                <td class="estado-pendiente">${pago.estado}</td>
                <td>
                    <button onclick="procesarPago('${pago.id}')" class="boton-pagar">Procesar</button>
                </td>
            </tr>
        `).join('');
}

// Función para validar el pago
function validarPago(pago) {
    if (!/^EMP\d{3}$/.test(pago.idEmpleado)) {
        mostrarMensaje('ID de empleado inválido. Debe ser EMP seguido de 3 números', 'error');
        return false;
    }

    if (isNaN(pago.monto) || pago.monto <= 0) {
        mostrarMensaje('El monto debe ser mayor a 0', 'error');
        return false;
    }

    if (!pago.fecha) {
        mostrarMensaje('La fecha es requerida', 'error');
        return false;
    }

    return true;
}

// Función para guardar el pago
function guardarPago(pago) {
    pagos.push(pago);
    localStorage.setItem('pagos', JSON.stringify(pagos));
    
    if (!document.getElementById('seccionPagosPendientes').classList.contains('oculto')) {
        cargarPagosPendientes();
    }
}

// Función para procesar un pago
function procesarPago(idPago) {
    const indicePago = pagos.findIndex(p => p.id === idPago);
    if (indicePago !== -1) {
        pagos[indicePago].estado = 'Pagado';
        localStorage.setItem('pagos', JSON.stringify(pagos));
        cargarPagosPendientes();
        
        const idUsuarioActual = localStorage.getItem('idUsuarioActual');
        if (idUsuarioActual === pagos[indicePago].idEmpleado) {
            mostrarPagosEmpleado();
        }
        
        mostrarMensaje('Pago procesado exitosamente', 'exito');
    }
}

// Función para validar y enviar el pago
function validarYEnviarPago(evento) {
    evento.preventDefault();
    
    const idEmpleado = document.getElementById('idEmpleado').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const fecha = document.getElementById('fechaPago').value;
    const asistencia = document.getElementById('asistencia').value;
    const horasTrabajadas = document.getElementById('horasTrabajadas').value;
    
    if (!USUARIOS_VALIDOS[idEmpleado] || USUARIOS_VALIDOS[idEmpleado].tipo !== 'empleado') {
        mostrarMensaje('ID de empleado no válido', 'error');
        return false;
    }
    
    const datosPago = {
        id: `PAGO${Date.now()}`,
        idEmpleado: idEmpleado,
        nombreEmpleado: USUARIOS_VALIDOS[idEmpleado].nombre,
        monto: monto,
        fecha: fecha,
        asistencia: asistencia,
        horasTrabajadas: horasTrabajadas,
        estado: 'Pendiente'
    };
    
    if (validarPago(datosPago)) {
        guardarPago(datosPago);
        mostrarMensaje('Pago registrado exitosamente', 'exito');
        evento.target.reset();
    }
    return false;
}

// Función para mostrar pagos del empleado
function mostrarPagosEmpleado() {
    const idEmpleado = localStorage.getItem('idUsuarioActual');
    const pagosEmpleado = pagos.filter(pago => pago.idEmpleado === idEmpleado);
    
    const contenido = `
        <div class="seccion">
            <div class="encabezado-seccion">
                <h3>Estado de Pagos</h3>
                <button onclick="cerrarTablaEmpleado()" class="boton-cerrar">Cerrar</button>
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
                    <tbody>
                        ${pagosEmpleado.length === 0 ? 
                            '<tr><td colspan="4" style="text-align: center; font-style: italic;">No hay pagos registrados</td></tr>' :
                            pagosEmpleado.map(pago => `
                                <tr>
                                    <td>${pago.fecha}</td>
                                    <td>Q${pago.monto.toFixed(2)}</td>
                                    <td class="estado-${pago.estado.toLowerCase()}">${pago.estado}</td>
                                    <td>
                                        Asistencia: ${pago.asistencia}%<br>
                                        Horas: ${pago.horasTrabajadas}
                                    </td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('contenidoEmpleado').innerHTML = contenido;
}

// Función para mostrar boletas de pago
function mostrarBoletas() {
    const idEmpleado = localStorage.getItem('idUsuarioActual');
    const pagosProcesados = pagos.filter(pago => 
        pago.idEmpleado === idEmpleado && pago.estado === 'Pagado'
    );

    const contenido = `
        <div class="seccion">
            <div class="encabezado-seccion">
                <h3>Boletas de Pago</h3>
                <button onclick="cerrarTablaEmpleado()" class="boton-cerrar">Cerrar</button>
            </div>
            <div class="contenedor-tabla">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Detalles</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagosProcesados.length === 0 ? 
                            '<tr><td colspan="4" style="text-align: center; font-style: italic;">No hay boletas disponibles</td></tr>' :
                            pagosProcesados.map(pago => `
                                <tr>
                                    <td>${pago.fecha}</td>
                                    <td>Q${pago.monto.toFixed(2)}</td>
                                    <td>
                                        Asistencia: ${pago.asistencia}%<br>
                                        Horas: ${pago.horasTrabajadas}
                                    </td>
                                    <td>
                                        <button onclick="generarBoleta('${pago.id}')" class="boton-boleta">
                                            Generar Boleta
                                        </button>
                                    </td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('contenidoEmpleado').innerHTML = contenido;
}
function aprobarPago(idPago) {
    const indicePago = pagos.findIndex(p => p.id === idPago);
    if (indicePago !== -1) {
        pagos[indicePago].estado = 'Aprobado';
        localStorage.setItem('pagos', JSON.stringify(pagos));
        cargarPagosPendientes();
        mostrarMensaje('Pago aprobado exitosamente', 'exito');
    }
}

function generarBoleta(idPago) {
    const pago = pagos.find(p => p.id === idPago);
    if (pago) {
        const empleado = USUARIOS_VALIDOS[pago.idEmpleado];
        const contenidoBoleta = {
            titulo: 'Boleta de Pago',
            nombreEmpleado: empleado.nombre,
            idEmpleado: pago.idEmpleado,
            fecha: pago.fecha,
            monto: pago.monto,
            asistencia: pago.asistencia,
            horasTrabajadas: pago.horasTrabajadas
        };
        
        GeneradorPDFPagos.generarBoletaPDF(contenidoBoleta);
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