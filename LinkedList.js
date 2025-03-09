class Nodo {
    constructor(datos) {
        this.datos = datos;
        this.siguiente = null;
    }
}

class ListaEnlazada {
    constructor() {
        this.cabeza = null;
        this.longitud = 0;
    }

    agregar(datos) {
        const nuevoNodo = new Nodo(datos);
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevoNodo;
        }
        this.longitud++;
        return datos;
    }

    obtenerTodos() {
        const datos = [];
        let actual = this.cabeza;
        while (actual) {
            datos.push(actual.datos);
            actual = actual.siguiente;
        }
        return datos;
    }

    obtenerPorEmpleado(idEmpleado) {
        const pagos = [];
        let actual = this.cabeza;
        while (actual) {
            if (actual.datos.idEmpleado === idEmpleado) {
                pagos.push(actual.datos);
            }
            actual = actual.siguiente;
        }
        return pagos;
    }

    actualizarEstado(id, nuevoEstado) {
        let actual = this.cabeza;
        while (actual) {
            if (actual.datos.id === id) {
                actual.datos.estado = nuevoEstado;
                return true;
            }
            actual = actual.siguiente;
        }
        return false;
    }
}

export default ListaEnlazada;