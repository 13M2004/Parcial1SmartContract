// Base de datos del sistema
let pagos = JSON.parse(localStorage.getItem('pagos')) || [];

const USUARIOS_VALIDOS = {
    'PAT001': { tipo: 'patrono', nombre: 'Manuel Monzón', puesto: 'Patrono', estado: 'Activo' },
    'EMP001': { tipo: 'empleado', nombre: 'Nayeli Urrutia', puesto: 'Empleado', estado: 'Activo' },
    'EMP002': { tipo: 'empleado', nombre: 'Ivania Palma', puesto: 'Empleado', estado: 'Activo' },
    'EMP003': { tipo: 'empleado', nombre: 'Alexander Palma', puesto: 'Empleado', estado: 'Activo' }
};

// Función de inicio de sesión
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

function iniciarSesion() {
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const idUsuario = document.getElementById('idUsuario').value.toUpperCase();
    const loginBox = document.querySelector('.login-box');

    // Validaciones mejoradas
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

    // Validar usuario y estado
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

    // Inicio de sesión exitoso
    mostrarMensajeLogin('Inicio de sesión exitoso', 'exito');
    
    setTimeout(() => {
        // Ocultar login y mostrar panel principal
        document.getElementById('seccionLogin').classList.add('oculto');
        const panelPrincipal = document.getElementById('panelPrincipal');
        panelPrincipal.classList.remove('oculto');
        panelPrincipal.classList.add('activo');

        // Mostrar menú según rol
        if (tipoUsuario === 'patrono') {
            document.getElementById('menuPatrono').classList.add('activo');
            cargarVista('nuevoPago'); // Vista inicial para patrono
        } else {
            document.getElementById('menuEmpleado').classList.add('activo');
            cargarVista('misPagos'); // Vista inicial para empleado
        }

        document.getElementById('nombreUsuario').textContent = usuario.nombre;
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    }, 1000);
}

function cerrarSesion() {
    // Remover clases activas
    document.getElementById('panelPrincipal').classList.remove('activo');
    document.getElementById('menuPatrono').classList.remove('activo');
    document.getElementById('menuEmpleado').classList.remove('activo');
    
    // Mostrar login
    document.getElementById('seccionLogin').classList.remove('oculto');
    
    // Limpiar datos
    localStorage.removeItem('usuarioActual');
    document.getElementById('idUsuario').value = '';
    document.getElementById('tipoUsuario').value = '';
}

// Estructura HTML inicial
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = `
        <!-- Pantalla de Login -->
        <div id="seccionLogin" class="login-section">
            <div class="login-box">
                <img src="assets/logo.png" alt="SGE TECH" class="logo">
                <h1>SGE TECH</h1>
                <p>Sistema de Gestión Empresarial</p>
                <h2>Inicio de Sesión</h2>
                <div class="form-group">
                    <label>Tipo de Usuario:</label>
                    <select id="tipoUsuario" required>
                        <option value="">Seleccione...</option>
                        <option value="patrono">Patrono</option>
                        <option value="empleado">Empleado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>ID de Usuario:</label>
                    <input type="text" id="idUsuario" placeholder="Ingrese su ID" required>
                </div>
                <div id="mensajeLogin"></div>
                <button onclick="iniciarSesion()" class="btn-ingresar">INGRESAR AL SISTEMA</button>
            </div>
        </div>

        <!-- Panel Principal -->
        <div id="panelPrincipal" class="panel-principal oculto">
            <div class="sidebar">
                <div class="logo-container">
                    <h1>SGE TECH</h1>
                </div>
                <!-- Menú Patrono -->
                <div id="menuPatrono" class="menu-opciones oculto">
                    <button onclick="cargarVista('nuevoPago')" class="menu-item">
                        <i class="fas fa-plus-circle"></i> Registro de Nuevo Pago
                    </button>
                    <button onclick="cargarVista('historialPagos')" class="menu-item">
                        <i class="fas fa-history"></i> Historial de Pagos
                    </button>
                    <button onclick="cargarVista('plantilla')" class="menu-item">
                        <i class="fas fa-users"></i> Plantilla
                    </button>
                </div>
                <!-- Menú Empleado -->
                <div id="menuEmpleado" class="menu-opciones oculto">
                    <button onclick="cargarVista('misPagos')" class="menu-item">
                        <i class="fas fa-money-bill-wave"></i> Mis Pagos
                    </button>
                </div>
                <button onclick="cerrarSesion()" class="btn-cerrar-sesion">
                    <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
            </div>
            <div class="contenido">
                <header>
                    <h2 id="tituloSeccion"></h2>
                    <span id="nombreUsuario"></span>
                </header>
                <main id="vistaContenido"></main>
            </div>
        </div>
    `;

    // Verificar sesión existente
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        mostrarPanelPrincipal(usuario);
    }
});

function mostrarPanelPrincipal(usuario) {
    document.getElementById('seccionLogin').classList.add('oculto');
    const panelPrincipal = document.getElementById('panelPrincipal');
    panelPrincipal.classList.remove('oculto');
    
    if (usuario.tipo === 'patrono') {
        document.getElementById('menuPatrono').classList.remove('oculto');
        cargarVista('nuevoPago');
    } else {
        document.getElementById('menuEmpleado').classList.remove('oculto');
        cargarVista('misPagos');
    }
    
    document.getElementById('nombreUsuario').textContent = usuario.nombre;
}

function cargarVista(vista) {
    const contenedor = document.getElementById('vistaContenido');
    const tituloSeccion = document.getElementById('tituloSeccion');

    // Remover clase activa de todos los botones del menú
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('activo'));
    // Activar el botón correspondiente
    document.querySelector(`[onclick="cargarVista('${vista}')"]`).classList.add('activo');

    switch(vista) {
        case 'nuevoPago':
            tituloSeccion.textContent = 'Registro de Nuevo Pago';
            contenedor.innerHTML = generarFormularioPago();
            inicializarFormularioPago();
            break;
            
        case 'historialPagos':
            tituloSeccion.textContent = 'Historial de Pagos';
            const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
            if (usuario.tipo === 'empleado') {
                mostrarHistorialEmpleado(usuario.id);
            } else {
                mostrarHistorialCompleto();
            }
            break;
            
        case 'plantilla':
            tituloSeccion.textContent = 'Plantilla de Empleados';
            mostrarPlantilla();
            break;
            
        case 'boletas':
            tituloSeccion.textContent = 'Mis Boletas de Pago';
            mostrarBoletas();
            break;
    }
}

function mostrarHistorialEmpleado(idEmpleado) {
    const pagosEmpleado = pagos.filter(pago => pago.idEmpleado === idEmpleado);
    mostrarTablaHistorial(pagosEmpleado);
}

function mostrarHistorialCompleto() {
    mostrarTablaHistorial(pagos);
}

function mostrarTablaHistorial(pagosMostrar) {
    const contenedor = document.getElementById('vistaContenido');
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
                <tbody>
                    ${pagosMostrar.map(pago => `
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
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function mostrarPlantilla() {
    const contenedor = document.getElementById('vistaContenido');
    const empleados = Object.entries(USUARIOS_VALIDOS)
        .filter(([_, usuario]) => usuario.tipo === 'empleado');

    contenedor.innerHTML = `
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
                    ${empleados.map(([id, empleado]) => `
                        <tr>
                            <td>${id}</td>
                            <td>${empleado.nombre}</td>
                            <td>${empleado.puesto}</td>
                            <td><span class="estado-empleado ${empleado.estado.toLowerCase()}">${empleado.estado}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function mostrarBoletas() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    const boletasUsuario = pagos.filter(pago => pago.idEmpleado === usuario.id);
    
    const contenedor = document.getElementById('vistaContenido');
    contenedor.innerHTML = `
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
                    ${boletasUsuario.map(boleta => `
                        <tr>
                            <td>${boleta.fecha}</td>
                            <td>Q${boleta.monto.toFixed(2)}</td>
                            <td><span class="estado-pago ${boleta.estado}">${boleta.estado}</span></td>
                            <td>
                                <button onclick="generarPDF('${boleta.id}')" class="btn-pdf">
                                    <i class="fas fa-file-pdf"></i> Ver Boleta
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
