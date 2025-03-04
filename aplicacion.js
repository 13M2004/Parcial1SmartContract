import SmartContract from './SmartContract.js';

// Inicializar el contrato inteligente
const contratoInteligente = new SmartContract();

// Base de datos del sistema
const USUARIOS_VALIDOS = {
    'PAT001': { tipo: 'patrono', nombre: 'Manuel Monzón', puesto: 'Patrono', estado: 'Activo' },
    'EMP001': { tipo: 'empleado', nombre: 'Nayeli Urrutia', puesto: 'Empleado', estado: 'Activo' },
    'EMP002': { tipo: 'empleado', nombre: 'Ivania Palma', puesto: 'Empleado', estado: 'Activo' },
    'EMP003': { tipo: 'empleado', nombre: 'Alexander Palma', puesto: 'Empleado', estado: 'Activo' }
};

// Inicializar usuarios en el contrato
Object.entries(USUARIOS_VALIDOS).forEach(([id, usuario]) => {
    if (usuario.tipo === 'empleado') {
        contratoInteligente.registrarEmpleado(id, usuario.nombre, usuario.puesto);
    } else {
        contratoInteligente.registrarEmpleador(id, usuario.nombre, usuario.puesto);
    }
});

// Funciones de mensajes del sistema
function mostrarMensajeLogin(texto, tipo) {
    const contenedor = document.getElementById('mensajeLogin');
    contenedor.innerHTML = `<div class="mensaje ${tipo}"><i class="fas ${tipo === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>${texto}</div>`;
    
    if (tipo === 'error') {
        document.querySelector('.login-box').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.login-box').classList.remove('shake');
        }, 500);
    }

    if (tipo === 'exito') {
        setTimeout(() => {
            contenedor.innerHTML = '';
        }, 2000);
    }
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje-sistema mensaje-${tipo}`;
    mensaje.innerHTML = `<i class="fas ${tipo === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${texto}`;
    document.body.appendChild(mensaje);

    setTimeout(() => {
        mensaje.remove();
    }, 3000);
}

// Funciones de inicio de sesión
function iniciarSesion() {
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const idUsuario = document.getElementById('idUsuario').value.toUpperCase();

    if (!tipoUsuario || !idUsuario) {
        mostrarMensajeLogin('Por favor complete todos los campos', 'error');
        return;
    }

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

    const usuario = USUARIOS_VALIDOS[idUsuario];
    if (!usuario) {
        mostrarMensajeLogin('Usuario no encontrado', 'error');
        return;
    }

    if (usuario.tipo !== tipoUsuario) {
        mostrarMensajeLogin(`El ID no corresponde a un ${tipoUsuario}`, 'error');
        return;
    }

    if (usuario.estado !== 'Activo') {
        mostrarMensajeLogin('Usuario inactivo', 'error');
        return;
    }

    mostrarMensajeLogin('Inicio de sesión exitoso', 'exito');
    
    setTimeout(() => {
        document.getElementById('seccionLogin').classList.add('oculto');
        const panelPrincipal = document.getElementById('panelPrincipal');
        panelPrincipal.classList.remove('oculto');
        panelPrincipal.classList.add('activo');

        if (tipoUsuario === 'patrono') {
            document.getElementById('menuPatrono').classList.add('activo');
            cargarVista('nuevoPago');
        } else {
            document.getElementById('menuEmpleado').classList.add('activo');
            cargarVista('misPagos');
        }

        document.getElementById('nombreUsuario').textContent = usuario.nombre;
        localStorage.setItem('usuarioActual', JSON.stringify({...usuario, id: idUsuario}));
    }, 1000);
}

function cerrarSesion() {
    document.getElementById('panelPrincipal').classList.remove('activo');
    document.getElementById('menuPatrono').classList.remove('activo');
    document.getElementById('menuEmpleado').classList.remove('activo');
    document.getElementById('seccionLogin').classList.remove('oculto');
    localStorage.removeItem('usuarioActual');
    document.getElementById('idUsuario').value = '';
    document.getElementById('tipoUsuario').value = '';
}

function generarFormularioPago() {
    const vistaRegistro = document.querySelector('.vista-registro-pago');
    vistaRegistro.classList.remove('oculto');
    const select = document.getElementById('empleadoPago');
    
    select.innerHTML = '<option value="">Seleccione un empleado...</option>';
    
    Object.entries(USUARIOS_VALIDOS)
        .filter(([_, usuario]) => usuario.tipo === 'empleado')
        .forEach(([id, empleado]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = empleado.nombre;
            select.appendChild(option);
        });

    inicializarFormularioPago();
    return vistaRegistro.outerHTML;
}

function inicializarFormularioPago() {
    const fechaHoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaPago').value = fechaHoy;
    document.getElementById('fechaPago').max = fechaHoy;
}

function registrarPago() {
    const empleado = document.getElementById('empleadoPago').value;
    const monto = parseFloat(document.getElementById('montoPago').value);
    const fecha = document.getElementById('fechaPago').value;
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

    if (!empleado || !monto || !fecha) {
        mostrarMensaje('Por favor complete todos los campos', 'error');
        return;
    }

    const resultado = contratoInteligente.crearPagoPendiente(
        usuario.id,
        empleado,
        monto,
        fecha,
        { descripcion: 'Pago de salario' }
    );

    if (resultado) {
        mostrarMensaje('Pago registrado exitosamente', 'exito');
        cargarVista('historialPagos');
    } else {
        mostrarMensaje('Error al registrar el pago', 'error');
    }
}

function mostrarHistorialEmpleado(idEmpleado) {
    const pagosEmpleado = contratoInteligente.obtenerPagosEmpleado(idEmpleado);
    mostrarTablaHistorial(pagosEmpleado);
}

function mostrarHistorialCompleto() {
    const pagos = contratoInteligente.transacciones.mostrarTransacciones();
    mostrarTablaHistorial(pagos);
}

function mostrarPlantilla() {
    const empleados = contratoInteligente.obtenerTodosLosEmpleados();
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
                    ${empleados.map(empleado => `
                        <tr>
                            <td>${empleado.id}</td>
                            <td>${empleado.nombre}</td>
                            <td>${empleado.puesto}</td>
                            <td><span class="estado-empleado ${empleado.estado.toLowerCase()}">${empleado.estado}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('vistaContenido').innerHTML = '';
    document.getElementById('vistaContenido').appendChild(template.content);
}

function mostrarBoletas() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    const pagosEmpleado = contratoInteligente.obtenerPagosEmpleado(usuario.id);
    
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
                    ${pagosEmpleado.map(pago => `
                        <tr>
                            <td>${pago.fecha}</td>
                            <td>Q${pago.monto.toFixed(2)}</td>
                            <td><span class="estado-pago ${pago.estado.toLowerCase()}">${pago.estado}</span></td>
                            <td>
                                <button onclick="generarPDF('${pago.id}')" class="btn-pdf">
                                    <i class="fas fa-file-pdf"></i> Descargar Boleta
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('vistaContenido').innerHTML = '';
    document.getElementById('vistaContenido').appendChild(template.content);
}

function generarPDF(idPago) {
    const resultado = contratoInteligente.actualizarEstadoPago(idPago, "Cancelado");
    if (resultado) {
        mostrarMensaje('Boleta generada y pago actualizado', 'exito');
        const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
        if (usuario.tipo === 'empleado') {
            mostrarBoletas();
        } else {
            mostrarHistorialCompleto();
        }
    } else {
        mostrarMensaje('Error al generar la boleta', 'error');
    }
}

function mostrarPanelPrincipal(usuario) {
    document.getElementById('seccionLogin').classList.add('oculto');
    const panelPrincipal = document.getElementById('panelPrincipal');
    panelPrincipal.classList.remove('oculto');
    panelPrincipal.classList.add('activo');

    if (usuario.tipo === 'patrono') {
        document.getElementById('menuPatrono').classList.add('activo');
        cargarVista('nuevoPago');
    } else {
        document.getElementById('menuEmpleado').classList.add('activo');
        cargarVista('historialPagos');
    }

    document.getElementById('nombreUsuario').textContent = usuario.nombre;
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        mostrarPanelPrincipal(usuario);
    }
});
