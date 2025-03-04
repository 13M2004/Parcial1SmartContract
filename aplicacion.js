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

function iniciarSesion(event) {
    if (event) event.preventDefault();
    
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

        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        mostrarPanelPrincipal(usuario);
        mostrarMensaje('Bienvenido al sistema', 'exito');
        
    } catch (error) {
        mostrarMensaje(error.message, 'error');
        document.querySelector('.login-box').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.login-box').classList.remove('shake');
        }, 500);
    }
}

function mostrarPanelPrincipal(usuario) {
    document.getElementById('seccionLogin').classList.add('oculto');
    const panelPrincipal = document.getElementById('panelPrincipal');
    panelPrincipal.classList.remove('oculto');

    const menuPatrono = document.getElementById('menuPatrono');
    const menuEmpleado = document.getElementById('menuEmpleado');
    
    if (usuario.tipo === 'patrono') {
        menuPatrono.classList.remove('oculto');
        menuEmpleado.classList.add('oculto');
        cargarVista('nuevoPago');
    } else {
        menuEmpleado.classList.remove('oculto');
        menuPatrono.classList.add('oculto');
        cargarVista('historialPagos');
    }

    document.getElementById('nombreUsuario').textContent = usuario.nombre;
}

function cargarVista(vista) {
    const contenido = document.getElementById('vistaContenido');
    contenido.innerHTML = '';
    
    switch(vista) {
        case 'nuevoPago':
            mostrarFormularioPago();
            document.getElementById('tituloSeccion').textContent = 'Nuevo Pago';
            break;
        case 'historialPagos':
            mostrarHistorialCompleto();
            document.getElementById('tituloSeccion').textContent = 'Historial de Pagos';
            break;
        case 'plantilla':
            mostrarPlantilla();
            document.getElementById('tituloSeccion').textContent = 'Plantilla de Empleados';
            break;
        case 'boletas':
            mostrarBoletas();
            document.getElementById('tituloSeccion').textContent = 'Mis Boletas';
            break;
        default:
            contenido.innerHTML = '<p>Seleccione una opción del menú</p>';
            document.getElementById('tituloSeccion').textContent = 'Bienvenido';
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
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

    if (!usuario) {
        mostrarMensaje('Sesión inválida', 'error');
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

function mostrarBoletas() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
        mostrarMensaje('Sesión inválida', 'error');
        return;
    }
    const pagos = contratoInteligente.obtenerPagosEmpleado(usuario.id);
    mostrarHistorialCompleto(pagos);
}

function verPDF(idPago) {
    const pago = contratoInteligente.transacciones.buscarPago(idPago);
    if (pago) {
        window.open(`generarPDF.html?id=${idPago}`, '_blank');
    }
}

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuario) {
        mostrarPanelPrincipal(usuario);
    }
});