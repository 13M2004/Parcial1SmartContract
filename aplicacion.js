// Base de datos del sistema
let pagos = JSON.parse(localStorage.getItem('pagos')) || [];

// Base de datos de usuarios válidos
const USUARIOS_VALIDOS = {
    'PAT001': { tipo: 'patrono', nombre: 'Manuel Monzón', puesto: 'Patrono', estado: 'Activo' },
    'EMP001': { tipo: 'empleado', nombre: 'Nayeli Urrutia', puesto: 'Empleado', estado: 'Activo' },
    'EMP002': { tipo: 'empleado', nombre: 'Ivania Palma', puesto: 'Empleado', estado: 'Activo' },
    'EMP003': { tipo: 'empleado', nombre: 'Alexander Palma', puesto: 'Empleado', estado: 'Activo' }
};

function iniciarSesion() {
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const idUsuario = document.getElementById('idUsuario').value.toUpperCase();
    const loginBox = document.querySelector('.login-box');

    // Validación de campos vacíos
    if (!tipoUsuario || !idUsuario) {
        mostrarMensajeLogin('Por favor complete todos los campos', 'error');
        return;
    }

    // Validación de formato de ID
    const formatoPatrono = /^PAT[0-9]{3}$/;
    const formatoEmpleado = /^EMP[0-9]{3}$/;

    if (tipoUsuario === 'patrono' && !formatoPatrono.test(idUsuario)) {
        mostrarMensajeLogin('ID de patrono inválido (Formato: PAT001)', 'error');
        return;
    }

    if (tipoUsuario === 'empleado' && !formatoEmpleado.test(idUsuario)) {
        mostrarMensajeLogin('ID de empleado inválido (Formato: EMP001)', 'error');
        return;
    }

    // Validación de usuario existente
    const usuario = USUARIOS_VALIDOS[idUsuario];
    if (!usuario) {
        mostrarMensajeLogin('Usuario no encontrado', 'error');
        return;
    }

    // Validación de tipo de usuario
    if (usuario.tipo !== tipoUsuario) {
        mostrarMensajeLogin(`El ID no corresponde a un ${tipoUsuario}`, 'error');
        return;
    }

    // Validación de estado
    if (usuario.estado !== 'Activo') {
        mostrarMensajeLogin('Usuario inactivo', 'error');
        return;
    }

    // Inicio de sesión exitoso
    const loginSection = document.getElementById('seccionLogin');
    loginSection.classList.add('oculto');
    document.getElementById('panelPrincipal').classList.remove('oculto');
    
    // Mostrar menú correspondiente
    document.getElementById(`menu${tipoUsuario === 'patrono' ? 'Patrono' : 'Empleado'}`).classList.remove('oculto');
    document.getElementById('nombreUsuario').textContent = usuario.nombre;
    
    // Guardar sesión
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
}

function mostrarMensajeLogin(texto, tipo) {
    const contenedor = document.getElementById('mensajeLogin');
    contenedor.innerHTML = `<div class="mensaje ${tipo}">${texto}</div>`;
    
    // Auto-ocultar mensajes de éxito después de 3 segundos
    if (tipo === 'exito') {
        setTimeout(() => {
            contenedor.innerHTML = '';
        }, 3000);
    }
}


// Función para cargar vistas
function cargarVista(vista) {
    const contenedor = document.getElementById('vistaContenido');
    const tituloSeccion = document.getElementById('tituloSeccion');

    switch(vista) {
        case 'nuevoPago':
            tituloSeccion.textContent = 'Registro de Nuevo Pago';
            contenedor.innerHTML = generarFormularioPago();
            inicializarFormularioPago();
            break;
        case 'historialPagos':
            tituloSeccion.textContent = 'Historial de Pagos';
            contenedor.innerHTML = `
                <div class="contenedor-tabla">;
                    <table class="tabla-datos">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Empleado</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaHistorial"></tbody>
                    </table>
                </div>
            `;
            cargarHistorialPagos();
            break;

        case 'plantilla':
            tituloSeccion.textContent = 'Plantilla de Empleados';
            mostrarPlantilla();
            break;
    }
}

function generarFormularioPago() {
    return `
        <div class="formulario-registro">
            <form id="formPago" onsubmit="registrarPago(event)">
                <div class="form-group">
                    <label>ID del Empleado:</label>
                    <input type="text" id="idEmpleado" required pattern="EMP[0-9]{3}" placeholder="Ejemplo: EMP001">
                </div>
                <div class="form-group">
                    <label>Empleado:</label>
                    <select id="empleadoSelect" required>
                        <option value="">Seleccione un empleado...</option>
                        ${generarOpcionesEmpleados()}
                    </select>
                </div>
                <div class="form-group">
                    <label>Monto (Q):</label>
                    <input type="number" id="montoPago" required min="3500" step="0.01">
                </div>
                <div class="form-group">
                    <label>Asistencia (%):</label>
                    <input type="number" id="asistencia" required min="0" max="100" value="100">
                    <div id="mensajeAsistencia" class="mensaje-validacion"></div>
                </div>
                <div class="form-group">
                    <label>Fecha:</label>
                    <input type="date" id="fechaPago" required>
                </div>
                <button type="submit" class="btn-registrar">Registrar Pago</button>
            </form>
        </div>
    `;
}

function inicializarFormularioPago() {
    const formPago = document.getElementById('formPago');
    const asistenciaInput = document.getElementById('asistencia');
    const montoInput = document.getElementById('montoPago');
    const mensajeAsistencia = document.getElementById('mensajeAsistencia');

    asistenciaInput.addEventListener('input', function() {
        const asistencia = parseFloat(this.value);
        if (asistencia < 40) {
            mensajeAsistencia.textContent = 'La asistencia mínima debe ser 40%';
            mensajeAsistencia.classList.add('error');
            montoInput.value = '';
            montoInput.disabled = true;
        } else {
            mensajeAsistencia.textContent = '';
            mensajeAsistencia.classList.remove('error');
            montoInput.disabled = false;
        }
    });
}
function registrarPago(event) {
    event.preventDefault();
    
    const idEmpleado = document.getElementById('idEmpleado').value;
    const monto = parseFloat(document.getElementById('montoPago').value);
    const asistencia = parseFloat(document.getElementById('asistencia').value);
    const fecha = document.getElementById('fechaPago').value;

    if (asistencia < 40) {
        mostrarMensaje('La asistencia mínima debe ser 40%', 'error');
        return;
    }

    if (monto < 3500) {
        mostrarMensaje('El monto mínimo debe ser Q3,500', 'error');
        return;
    }

    const nuevoPago = {
        id: Date.now(),
        idEmpleado,
        monto,
        asistencia,
        fecha,
        estado: 'pendiente'
    };

    pagos.push(nuevoPago);
    localStorage.setItem('pagos', JSON.stringify(pagos));
    
    mostrarMensaje('Pago registrado exitosamente', 'exito');
    document.getElementById('formPago').reset();
}

function cargarHistorialPagos() {
    const tabla = document.getElementById('tablaHistorial');
    const pagosOrdenados = [...pagos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    tabla.innerHTML = pagosOrdenados.map(pago => `
        <tr>
            <td>${pago.fecha}</td>
            <td>${USUARIOS_VALIDOS[pago.idEmpleado].nombre}</td>
            <td>Q${pago.monto.toFixed(2)}</td>
            <td><span class="estado-pago ${pago.estado}">${pago.estado}</span></td>
            <td>
                <button onclick="generarPDF('${pago.id}')" class="btn-pdf">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
            </td>
        </tr>
    `).join('');
}
