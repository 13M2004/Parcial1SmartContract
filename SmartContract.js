import LinkedList from './LinkedList.js';

class SmartContract {
    constructor() {
        this.transacciones = new LinkedList();
        this.empleados = {};
        this.empleadores = {};
        this.cargarDatos();
    }

    cargarDatos() {
        const datosEmpleados = localStorage.getItem('empleados');
        const datosEmpleadores = localStorage.getItem('empleadores');
        
        if (datosEmpleados) {
            this.empleados = JSON.parse(datosEmpleados);
        }
        if (datosEmpleadores) {
            this.empleadores = JSON.parse(datosEmpleadores);
        }
    }

    guardarDatos() {
        localStorage.setItem('empleados', JSON.stringify(this.empleados));
        localStorage.setItem('empleadores', JSON.stringify(this.empleadores));
    }

    registrarEmpleado(id, nombre, puesto = 'Empleado') {
        this.empleados[id] = { 
            nombre, 
            puesto,
            estado: 'Activo',
            fechaRegistro: new Date().toISOString(),
            pagosRecibidos: 0,
            totalRecibido: 0
        };
        this.guardarDatos();
        return true;
    }

    registrarEmpleador(id, nombre, puesto = 'Patrono') {
        this.empleadores[id] = {
            nombre,
            puesto,
            estado: 'Activo',
            fechaRegistro: new Date().toISOString(),
            pagosRealizados: 0,
            totalPagado: 0
        };
        this.guardarDatos();
        return true;
    }

    crearPagoPendiente(idEmpleador, idEmpleado, monto, fecha, condiciones) {
        try {
            if (!this.empleadores[idEmpleador] || !this.empleados[idEmpleado]) {
                throw new Error("Empleador o empleado no registrado");
            }

            if (monto <= 0) {
                throw new Error("El monto debe ser mayor a 0");
            }

            const horasTrabajadas = condiciones.porcentajeHoras || 100;
            const montoFinal = (monto * horasTrabajadas) / 100;

            const pago = {
                id: Date.now().toString(),
                idEmpleador,
                idEmpleado,
                monto: montoFinal,
                montoOriginal: monto,
                fecha,
                horasTrabajadas,
                condiciones,
                estado: "Pendiente",
                fechaCreacion: new Date().toISOString(),
                fechaPago: null
            };

            this.transacciones.agregarTransaccion(pago);
            return true;
        } catch (error) {
            console.error('Error en crearPagoPendiente:', error);
            return false;
        }
    }

    procesarPago(idPago) {
        const pago = this.transacciones.buscarPago(idPago);
        if (!pago || pago.estado !== 'Pendiente') return false;

        const empleado = this.empleados[pago.idEmpleado];
        const empleador = this.empleadores[pago.idEmpleador];

        if (!empleado || !empleador) return false;

        empleado.pagosRecibidos++;
        empleado.totalRecibido += pago.monto;
        empleador.pagosRealizados++;
        empleador.totalPagado += pago.monto;

        pago.estado = 'Cancelado';
        pago.fechaPago = new Date().toISOString();

        this.guardarDatos();
        this.transacciones.actualizarEstadoPago(idPago, 'Cancelado');
        return true;
    }

    obtenerPagosEmpleado(idEmpleado) {
        if (!this.empleados[idEmpleado]) return [];
        return this.transacciones.mostrarTransacciones()
            .filter(pago => pago.idEmpleado === idEmpleado);
    }

    obtenerPagosEmpleador(idEmpleador) {
        if (!this.empleadores[idEmpleador]) return [];
        return this.transacciones.mostrarTransacciones()
            .filter(pago => pago.idEmpleador === idEmpleador);
    }

    obtenerPagosPendientes() {
        return this.transacciones.obtenerPagosPendientes();
    }

    obtenerPagosRealizados() {
        return this.transacciones.obtenerPagosRealizados();
    }

    actualizarEstadoPago(idPago, nuevoEstado) {
        return this.transacciones.actualizarEstadoPago(idPago, nuevoEstado);
    }

    obtenerInfoEmpleado(idEmpleado) {
        return this.empleados[idEmpleado] || null;
    }

    obtenerInfoEmpleador(idEmpleador) {
        return this.empleadores[idEmpleador] || null;
    }

    existeEmpleado(idEmpleado) {
        return !!this.empleados[idEmpleado];
    }

    existeEmpleador(idEmpleador) {
        return !!this.empleadores[idEmpleador];
    }

    obtenerTodosLosEmpleados() {
        return Object.entries(this.empleados).map(([id, datos]) => ({
            id,
            ...datos
        }));
    }

    obtenerTodosLosEmpleadores() {
        return Object.entries(this.empleadores).map(([id, datos]) => ({
            id,
            ...datos
        }));
    }
}

export default SmartContract;
