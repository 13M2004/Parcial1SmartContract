import ListaEnlazada from './LinkedList.js';

class SmartContract {
    constructor() {
        this.pagos = new ListaEnlazada();
        this.empleados = [
            { id: 1, nombre: 'Nayeli Urrutia', puesto: 'Empleado', estado: 'Activo' },
            { id: 2, nombre: 'Ivania Palma', puesto: 'Empleado', estado: 'Activo' },
            { id: 3, nombre: 'Alexander Palma', puesto: 'Empleado', estado: 'Activo' }
        ];
        this.contadorPagos = 1;
    }

    registrarPago(datos) {
        const pago = {
            id: this.contadorPagos++,
            ...datos,
            estado: 'pendiente',
            fechaRegistro: new Date().toISOString()
        };
        return this.pagos.agregar(pago);
    }

    obtenerPagos() {
        return this.pagos.obtenerTodos();
    }

    obtenerPagosEmpleado(idEmpleado) {
        return this.pagos.obtenerPorEmpleado(idEmpleado);
    }

    cancelarPago(idPago) {
        return this.pagos.actualizarEstado(idPago, 'cancelado');
    }

    obtenerEmpleados() {
        return this.empleados;
    }

    obtenerEmpleado(id) {
        return this.empleados.find(emp => emp.id === id);
    }
}

export default SmartContract;