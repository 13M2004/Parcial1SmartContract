import LinkedList from './LinkedList.js';

class SmartContract {
    constructor() {
        this.transacciones = new LinkedList();
        this.empleados = {};
        this.empleadores = {};
        this.cargarDatos();
    }

    crearPagoPendiente(idEmpleador, idEmpleado, monto, fecha, condiciones) {
        try {
            // Validaciones mejoradas
            if (!this.empleadores[idEmpleador]) {
                throw new Error("Empleador no registrado");
            }
            if (!this.empleados[idEmpleado]) {
                throw new Error("Empleado no registrado");
            }
            
            // Validación de monto
            const MONTO_MINIMO = 3500;
            const MONTO_MAXIMO = 25000;
            
            if (monto < MONTO_MINIMO) {
                throw new Error(`El monto debe ser mayor a Q${MONTO_MINIMO}`);
            }
            if (monto > MONTO_MAXIMO) {
                throw new Error(`El monto no puede exceder Q${MONTO_MAXIMO}`);
            }

            // Validación de duplicados
            const pagosExistentes = this.transacciones.mostrarTransacciones();
            const pagosDuplicados = pagosExistentes.filter(p => 
                p.idEmpleado === idEmpleado && 
                p.fecha === fecha && 
                p.estado === 'Pendiente'
            );
            
            if (pagosDuplicados.length > 0) {
                throw new Error("Ya existe un pago pendiente para este empleado en la fecha especificada");
            }

            // Crear pago con validaciones adicionales
            const horasTrabajadas = parseInt(condiciones.porcentajeHoras) || 100;
            if (horasTrabajadas < 0 || horasTrabajadas > 100) {
                throw new Error("El porcentaje de horas debe estar entre 0 y 100");
            }

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
            throw error;
        }
    }

    actualizarEstadoPago(idPago, nuevoEstado) {
        try {
            const pago = this.transacciones.buscarPago(idPago);
            if (!pago) {
                throw new Error("Pago no encontrado");
            }
            
            if (pago.estado === nuevoEstado) {
                throw new Error(`El pago ya está en estado ${nuevoEstado}`);
            }
            
            const resultado = this.transacciones.actualizarEstadoPago(idPago, nuevoEstado);
            if (resultado) {
                if (nuevoEstado === 'Cancelado') {
                    pago.fechaPago = new Date().toISOString();
                }
                this.guardarDatos();
            }
            return resultado;
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            throw error;
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
