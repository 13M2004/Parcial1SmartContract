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

    // Validación básica
    if (!tipoUsuario || !idUsuario) {
        mostrarMensajeLogin('Complete todos los campos', 'error');
        return;
    }

    // Validar usuario
    const usuario = USUARIOS_VALIDOS[idUsuario];
    if (!usuario || usuario.tipo !== tipoUsuario) {
        mostrarMensajeLogin('Usuario o tipo de usuario incorrecto', 'error');
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
}

// Función para cargar vistas
function cargarVista(vista) {
    const contenedor = document.getElementById('vistaContenido');
    const tituloSeccion = document.getElementById('tituloSeccion');

    switch(vista) {
        case 'nuevoPago':
            tituloSeccion.textContent = 'Registro de Nuevo Pago';
            contenedor.innerHTML = `
                <div class="formulario-registro">
                    <form id="formPago" onsubmit="registrarPago(event)">
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
                            <input type="number" id="asistencia" required min="40" max="100" value="100">
                        </div>
                        <div class="form-group">
                            <label>Fecha:</label>
                            <input type="date" id="fechaPago" required>
                        </div>
                        <button type="submit" class="btn-registrar">
                            <i class="fas fa-save"></i> Registrar Pago
                        </button>
                    </form>
                    <button onclick="cerrarVista()" class="btn-cerrar-vista">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                </div>
            `;
            inicializarFormularioPago();
            break;

        case 'historialPagos':
            tituloSeccion.textContent = 'Historial de Pagos';
            contenedor.innerHTML = `
                <div class="contenedor-tabla">
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
                    <button onclick="cerrarVista()" class="btn-cerrar-vista">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                </div>
            `;
            cargarHistorialPagos();
            break;
    }
}

// Función para cerrar la vista actual
function cerrarVista() {
    const contenedor = document.getElementById('vistaContenido');
    const tituloSeccion = document.getElementById('tituloSeccion');
    
    contenedor.innerHTML = '';
    tituloSeccion.textContent = '';
}
function registrarPago(event) {
    event.preventDefault();
    
    const empleadoId = document.getElementById('empleadoSelect').value;
    const monto = parseFloat(document.getElementById('montoPago').value);
    const asistencia = parseFloat(document.getElementById('asistencia').value);
    const fecha = document.getElementById('fechaPago').value;

    if (!empleadoId || !monto || !asistencia || !fecha) {
        mostrarMensaje('Complete todos los campos', 'error');
        return;
    }

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
        idEmpleado: empleadoId,
        nombreEmpleado: USUARIOS_VALIDOS[empleadoId].nombre,
        monto,
        asistencia,
        fecha,
        estado: 'Pendiente'
    };

    pagos.push(nuevoPago);
    localStorage.setItem('pagos', JSON.stringify(pagos));
    
    mostrarMensaje('Pago registrado exitosamente', 'exito');
    document.getElementById('formPago').reset();
    cargarHistorialPagos();
}

function cargarHistorialPagos() {
    const tabla = document.getElementById('tablaHistorial');
    if (!tabla) return;

    const pagosOrdenados = [...pagos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    tabla.innerHTML = pagosOrdenados.map(pago => `
        <tr>
            <td>${new Date(pago.fecha).toLocaleDateString()}</td>
            <td>${pago.nombreEmpleado}</td>
            <td>Q${pago.monto.toFixed(2)}</td>
            <td><span class="estado-pago ${pago.estado.toLowerCase()}">${pago.estado}</span></td>
            <td>
                <button onclick="generarPDF('${pago.id}')" class="btn-pdf">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
            </td>
        </tr>
    `).join('');
}
