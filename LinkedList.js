import Node from './Node.js';

class LinkedList {
    constructor() {
        this.head = null;
        this.length = 0;
    }

    agregarTransaccion(pago) {
        try {
            const node = new Node(pago);
            if (!this.head) {
                this.head = node;
            } else {
                let current = this.head;
                while (current.next) {
                    current = current.next;
                }
                current.next = node;
            }
            this.length++;
            this.guardarEnLocalStorage();
            return true;
        } catch (error) {
            console.error('Error al agregar transacción:', error);
            throw new Error('No se pudo agregar la transacción');
        }
    }

    buscarPago(id) {
        try {
            let current = this.head;
            while (current) {
                if (current.data.id === id) {
                    return current.data;
                }
                current = current.next;
            }
            return null;
        } catch (error) {
            console.error('Error al buscar pago:', error);
            return null;
        }
    }

    actualizarEstadoPago(id, nuevoEstado) {
        try {
            let current = this.head;
            while (current) {
                if (current.data.id === id) {
                    current.data.estado = nuevoEstado;
                    if (nuevoEstado === 'Cancelado') {
                        current.data.fechaPago = new Date().toISOString();
                    }
                    this.guardarEnLocalStorage();
                    return true;
                }
                current = current.next;
            }
            return false;
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            throw new Error('No se pudo actualizar el estado del pago');
        }
    }

    mostrarTransacciones() {
        const transacciones = [];
        let current = this.head;
        while (current) {
            transacciones.push(current.data);
            current = current.next;
        }
        return transacciones;
    }

    obtenerPagosPendientes() {
        return this.mostrarTransacciones().filter(pago => pago.estado === 'Pendiente');
    }

    obtenerPagosRealizados() {
        return this.mostrarTransacciones().filter(pago => pago.estado === 'Cancelado');
    }

    guardarEnLocalStorage() {
        try {
            const transacciones = this.mostrarTransacciones();
            localStorage.setItem('transacciones', JSON.stringify(transacciones));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            throw new Error('No se pudieron guardar los datos');
        }
    }

    cargarDeLocalStorage() {
        try {
            const transacciones = JSON.parse(localStorage.getItem('transacciones')) || [];
            this.head = null;
            this.length = 0;
            transacciones.forEach(t => this.agregarTransaccion(t));
        } catch (error) {
            console.error('Error al cargar de localStorage:', error);
            throw new Error('No se pudieron cargar los datos');
        }
    }
}

export default LinkedList;
