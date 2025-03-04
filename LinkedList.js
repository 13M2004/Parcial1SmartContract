import Node from './Node.js';

class LinkedList {
    constructor() {
        this.cabeza = null;
        this.cargarDeAlmacenamiento();
    }

    agregarTransaccion(datos) {
        const nuevoNodo = new Node(datos);
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevoNodo;
        }
        this.guardarEnAlmacenamiento();
    }

    actualizarEstadoPago(id, nuevoEstado) {
        let actual = this.cabeza;
        while (actual) {
            if (actual.datos.id === id) {
                actual.datos.estado = nuevoEstado;
                actual.datos.fechaPago = new Date().toISOString();
                this.guardarEnAlmacenamiento();
                return true;
            }
            actual = actual.siguiente;
        }
        return false;
    }

    mostrarTransacciones() {
        let actual = this.cabeza;
        const arregloTransacciones = [];
        while (actual) {
            arregloTransacciones.push(actual.datos);
            actual = actual.siguiente;
        }
        return arregloTransacciones;
    }

    buscarPago(id) {
        let actual = this.cabeza;
        while (actual) {
            if (actual.datos.id === id) {
                return actual.datos;
            }
            actual = actual.siguiente;
        }
        return null;
    }

    obtenerPagosPendientes() {
        return this.mostrarTransacciones().filter(pago => pago.estado === 'Pendiente');
    }

    obtenerPagosRealizados() {
        return this.mostrarTransacciones().filter(pago => pago.estado === 'Cancelado');
    }

    guardarEnAlmacenamiento() {
        const datos = this.mostrarTransacciones();
        localStorage.setItem('listaPagos', JSON.stringify(datos));
    }

    cargarDeAlmacenamiento() {
        const datos = localStorage.getItem('listaPagos');
        if (datos) {
            const transacciones = JSON.parse(datos);
            transacciones.forEach(transaccion => {
                this.agregarTransaccion(transaccion);
            });
        }
    }

    obtenerEstadisticas() {
        const transacciones = this.mostrarTransacciones();
        return {
            totalPagos: transacciones.length,
            pagosPendientes: transacciones.filter(p => p.estado === 'Pendiente').length,
            pagosCancelados: transacciones.filter(p => p.estado === 'Cancelado').length,
            montoTotal: transacciones.reduce((sum, p) => sum + p.monto, 0)
        };
    }
}

export default LinkedList;
