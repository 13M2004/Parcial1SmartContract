import LinkedList from './LinkedList.js';

class SmartContract {
    constructor() {
        this.empleados = new Map();
        this.empleadores = new Map();
        this.transacciones = new LinkedList();
        this.pagosId = 0;
    }

    registrarEmpleado(id, nombre, puesto) {
        this.empleados.set(id, {
            nombre,
            puesto,
            pagosRecibidos: new LinkedList()
        });
    }

    registrarEmpleador(id, nombre, puesto) {
        this.empleadores.set(id, {
            nombre,
            puesto,
            pagosRealizados: new LinkedList()
        });
    }

    crearPagoPendiente(patronoId, empleadoId, monto, fecha, detalles) {
        const pagoId = `PAG${String(++this.pagosId).padStart(3, '0')}`;
        
        const nuevoPago = {
            id: pagoId,
            patronoId,
            empleadoId,
            monto,
            fecha,
            estado: 'Pendiente',
            detalles,
            timestamp: new Date().toISOString()
        };

        // Agregar a la lista principal de transacciones
        this.transacciones.agregar(nuevoPago);

        // Agregar a los registros específicos
        const empleador = this.empleadores.get(patronoId);
        const empleado = this.empleados.get(empleadoId);

        if (empleador && empleado) {
            empleador.pagosRealizados.agregar(nuevoPago);
            empleado.pagosRecibidos.agregar(nuevoPago);
            return true;
        }
        return false;
    }

    obtenerPagosEmpleado(empleadoId) {
        const empleado = this.empleados.get(empleadoId);
        return empleado ? empleado.pagosRecibidos.toArray() : [];
    }

    obtenerPagosPatrono(patronoId) {
        const empleador = this.empleadores.get(patronoId);
        return empleador ? empleador.pagosRealizados.toArray() : [];
    }

    buscarPago(pagoId) {
        return this.transacciones.buscar(pago => pago.id === pagoId);
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.length = 0;
    }

    agregar(data) {
        const newNode = { data, next: null };
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.length++;
    }

    toArray() {
        const array = [];
        let current = this.head;
        while (current) {
            array.push(current.data);
            current = current.next;
        }
        return array;
    }

    buscar(predicado) {
        let current = this.head;
        while (current) {
            if (predicado(current.data)) {
                return current.data;
            }
            current = current.next;
        }
        return null;
    }
}

export default SmartContract;
