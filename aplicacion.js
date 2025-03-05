import SmartContract from './SmartContract.js';
import GeneradorPDFPagos from './GeneradorPDFPagos.js';

const contratoInteligente = new SmartContract();

const USUARIOS_VALIDOS = {
    'PAT001': { tipo: 'patrono', nombre: 'Manuel Monzón', puesto: 'Patrono', estado: 'Activo' },
    'EMP001': { tipo: 'empleado', nombre: 'Nayeli Urrutia', puesto: 'Empleado', estado: 'Activo' },
    'EMP002': { tipo: 'empleado', nombre: 'Ivania Palma', puesto: 'Empleado', estado: 'Activo' },
    'EMP003': { tipo: 'empleado', nombre: 'Alexander Palma', puesto: 'Empleado', estado: 'Activo' }
};

Object.entries(USUARIOS_VALIDOS).forEach(([id, usuario]) => {
    if (usuario.tipo === 'empleado') {
        contratoInteligente.registrarEmpleado(id, usuario.nombre, usuario.puesto);
    } else {
        contratoInteligente.registrarEmpleador(id, usuario.nombre, usuario.puesto);
    }
});

function mostrarMensaje(texto, tipo) {
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje-sistema mensaje-${tipo}`;
    mensaje.innerHTML = `<i class="fas ${tipo === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${texto}`;
    document.body.appendChild(mensaje);
    setTimeout(() => mensaje.remove(), 3000);
}
function mostrarPanelPrincipal(usuario) {
    // Ocultar login y mostrar panel
    document.getElementById('seccionLogin').classList.add('oculto');
    document.getElementById('panelPrincipal').classList.remove('oculto');
    
    // Mostrar nombre de usuario
    document.getElementById('nombreUsuario').textContent = `${usuario.nombre} (${usuario.puesto})`;
    
    // Mostrar menú correspondiente
    document.getElementById('menuPatrono').classList.add('oculto');
    document.getElementById('menuEmpleado').classList.add('oculto');
    document.getElementById(`menu${usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}`).classList.remove('oculto');
    
    // Cargar vista inicial
    document.getElementById('tituloSeccion').textContent = `Bienvenido, ${usuario.nombre}`;
    document.getElementById('vistaContenido').innerHTML = '<p>Seleccione una opción del menú para comenzar.</p>';
}
export function iniciarSesion(event) {
    if (event) event.preventDefault();
    console.log('Iniciando sesión...'); // Para debugging
    
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const idUsuario = document.getElementById('idUsuario').value.toUpperCase();

    try {
        if (!tipoUsuario || !idUsuario) {
            throw new Error('Complete todos los campos');
        }

        const usuario = USUARIOS_VALIDOS[idUsuario];
        if (!usuario || usuario.tipo !== tipoUsuario) {
            throw new Error('Credenciales inválidas');
        }

        usuario.id = idUsuario;
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        
        console.log('Usuario válido:', usuario); // Para debugging
        mostrarPanelPrincipal(usuario);
        mostrarMensaje('Bienvenido al sistema', 'exito');
        
    } catch (error) {
        console.error('Error:', error.message); // Para debugging
        mostrarMensaje(error.message, 'error');
    }
}
export function cargarVista(vista) {
    const usuario = validarSesion();
    if (!usuario) return;
    // Actualizar menú activo
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('activo'));
    document.querySelector(`[onclick="cargarVista('${vista}')"]`).classList.add('activo');
    const contenido = document.getElementById('vistaContenido');
    contenido.innerHTML = '';
    
    switch(vista) {
        case 'nuevoPago':
            mostrarFormularioPago();
            break;
        case 'historialPagos':
            mostrarHistorialPagos(usuario);
            break;
        case 'plantilla':
            mostrarPlantilla();
            break;
        case 'boletas':
            mostrarBoletas(usuario);
            break;
    }
}
function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    document.getElementById('panelPrincipal').classList.add('oculto');
    document.getElementById('seccionLogin').classList.remove('oculto');
    document.getElementById('idUsuario').value = '';
    document.getElementById('tipoUsuario').value = '';
    mostrarMensaje('Sesión cerrada', 'exito');
}
function validarSesion() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
        cerrarSesion();
        return false;
    }
    return usuario;
}

function limpiarMensajes() {
    const mensajes = document.querySelectorAll('.mensaje-sistema');
    mensajes.forEach(mensaje => mensaje.remove());
}
// Resto de funciones para manejar pagos y vistas
function mostrarFormularioPago() {
    const template = document.createElement('template');
    template.innerHTML = `
        <form id="formPago" class="formulario-pago" onsubmit="registrarPago(event)">
            <div class="form-group">
                <label for="empleadoPago">Empleado:</label>
                <select id="empleadoPago" required>
                    ${Object.entries(USUARIOS_VALIDOS)
                        .filter(([_, user]) => user.tipo === 'empleado')
                        .map(([id, user]) => `<option value="${id}">${user.nombre}</option>`)
                        .join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="montoPago">Monto:</label>
                <input type="number" id="montoPago" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="fechaPago">Fecha:</label>
                <input type="date" id="fechaPago" required>
            </div>
            <div class="form-group">
                <label for="porcentajeHoras">Porcentaje de Horas:</label>
                <input type="number" id="porcentajeHoras" min="0" max="100" required>
            </div>
            <button type="submit" class="btn-primario">Registrar Pago</button>
        </form>
    `;
    document.getElementById('vistaContenido').appendChild(template.content);
}

function registrarPago(event) {
    if (event) event.preventDefault();
    
    const empleado = document.getElementById('empleadoPago').value;
    const monto = parseFloat(document.getElementById('montoPago').value);
    const fecha = document.getElementById('fechaPago').value;
    const porcentaje = document.getElementById('porcentajeHoras').value;
    const usuario = validarSesion();

    if (!usuario || usuario.tipo !== 'patrono') {
        mostrarMensaje('No tiene permisos para realizar esta acción', 'error');
        return;
    }

    // Validar fecha
    const fechaPago = new Date(fecha);
    const hoy = new Date();
    if (fechaPago < hoy) {
        mostrarMensaje('La fecha no puede ser anterior a hoy', 'error');
        return;
    }

    const resultado = contratoInteligente.crearPagoPendiente(
        usuario.id,
        empleado,
        monto,
        fecha,
        { 
            descripcion: 'Pago de salario',
            porcentajeHoras: porcentaje 
        }
    );

    if (resultado) {
        mostrarMensaje('Pago registrado exitosamente', 'exito');
        cargarVista('historialPagos');
    } else {
        mostrarMensaje('Error al registrar el pago', 'error');
    }
}

function mostrarHistorialCompleto() {
    const pagos = contratoInteligente.transacciones.mostrarTransacciones();
    const template = document.createElement('template');
    template.innerHTML = `
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
                <tbody>
                    ${pagos.map(pago => `
                        <tr>
                            <td>${pago.fecha}</td>
                            <td>${USUARIOS_VALIDOS[pago.empleadoId].nombre}</td>
                            <td>Q${pago.monto.toFixed(2)}</td>
                            <td><span class="estado-pago ${pago.estado.toLowerCase()}">${pago.estado}</span></td>
                            <td>
                                <button onclick="verPDF('${pago.id}')" class="btn-pdf">
                                    <i class="fas fa-file-pdf"></i> Ver PDF
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('vistaContenido').appendChild(template.content);
}
function mostrarPlantilla() {
    const template = document.createElement('template');
    template.innerHTML = `
        <div class="contenedor-tabla">
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
                    ${Object.entries(USUARIOS_VALIDOS)
                        .filter(([_, user]) => user.tipo === 'empleado')
                        .map(([id, user]) => `
                            <tr>
                                <td>${id}</td>
                                <td>${user.nombre}</td>
                                <td>${user.puesto}</td>
                                <td><span class="estado-usuario ${user.estado.toLowerCase()}">${user.estado}</span></td>
                            </tr>
                        `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('vistaContenido').appendChild(template.content);
}
function mostrarBoletas() {
    const usuario = validarSesion();
    if (!usuario) {
        mostrarMensaje('Sesión inválida', 'error');
        return;
    }
    const pagos = contratoInteligente.obtenerPagosEmpleado(usuario.id);
    const template = document.createElement('template');
    template.innerHTML = `
        <div class="contenedor-tabla">
            <table class="tabla-datos">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagos.length ? pagos.map(pago => `
                        <tr>
                            <td>${pago.fecha}</td>
                            <td>Q${pago.monto.toFixed(2)}</td>
                            <td><span class="estado-pago ${pago.estado.toLowerCase()}">${pago.estado}</span></td>
                            <td>
                                <button onclick="verPDF('${pago.id}')" class="btn-pdf">
                                    <i class="fas fa-file-pdf"></i> Ver PDF
                                </button>
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="4">No hay boletas registradas</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('vistaContenido').appendChild(template.content);
}

function verPDF(idPago) {
    const pago = contratoInteligente.transacciones.buscarPago(idPago);
    if (pago) {
        window.open(`generarPDF.html?id=${idPago}`, '_blank');
    }
}