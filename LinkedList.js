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

    guardarEnAlmacenamiento() {
        const datos = this.mostrarTransacciones();
        localStorage.setItem('listaPagos', JSON.stringify(datos));
    }

    cargarDeAlmacenamiento() {
        const datos = localStorage.getItem('listaPagos');
        if (datos) {
            const transacciones = JSON.parse(datos);
            transacciones.forEach(transaccion => {
                const nuevoNodo = new Node(transaccion);
                if (!this.cabeza) {
                    this.cabeza = nuevoNodo;
                } else {
                    let actual = this.cabeza;
                    while (actual.siguiente) {
                        actual = actual.siguiente;
                    }
                    actual.siguiente = nuevoNodo;
                }
            });
        }
    }

    obtenerPagosPendientes() {
        return this.mostrarTransacciones().filter(pago => pago.estado === 'Pendiente');
    }

    obtenerPagosRealizados() {
        return this.mostrarTransacciones().filter(pago => pago.estado === 'Pagado');
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
}

export default LinkedList;
