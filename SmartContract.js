import LinkedList from './LinkedList.js';

class SmartContract {
   constructor() {
       this.transacciones = new LinkedList();
       this.empleados = {};
       this.empleadores = {};
       this.saldos = {};
   }

   // Registrar un nuevo empleado
   registrarEmpleado(id, nombre) {
       this.empleados[id] = { nombre, pagos: [] };
       this.saldos[id] = 0;
       return true;
   }

   // Registrar un nuevo empleador
   registrarEmpleador(id, nombre) {
       this.empleadores[id] = { nombre, pagosPendientes: [] };
       this.saldos[id] = 0;
       return true;
   }

   // Crear un nuevo pago pendiente
   crearPagoPendiente(idEmpleador, idEmpleado, monto, fecha, condiciones) {
       try {
           if (!this.empleadores[idEmpleador] || !this.empleados[idEmpleado]) {
               throw new Error("Empleador o empleado no registrado");
           }

           if (monto <= 0) {
               throw new Error("El monto debe ser mayor a 0");
           }

           const pago = {
               id: Date.now(),
               idEmpleador,
               idEmpleado,
               monto,
               fecha,
               condiciones,
               estado: "Pendiente",
               fechaCreacion: new Date()
           };

           this.transacciones.agregarTransaccion(pago);
           return true;
       } catch (error) {
           console.error('Error en crearPagoPendiente:', error);
           return false;
       }
   }

   // Obtener pagos por empleado
   obtenerPagosEmpleado(idEmpleado) {
       if (!this.empleados[idEmpleado]) return [];
       return this.transacciones.mostrarTransacciones().filter(pago => pago.idEmpleado === idEmpleado);
   }

   // Obtener todos los pagos pendientes
   obtenerPagosPendientes() {
       return this.transacciones.obtenerPagosPendientes();
   }

   // Obtener todos los pagos realizados
   obtenerPagosRealizados() {
       return this.transacciones.obtenerPagosRealizados();
   }

   // Actualizar estado de pago
   actualizarEstadoPago(idPago, nuevoEstado) {
       return this.transacciones.actualizarEstadoPago(idPago, nuevoEstado);
   }

   // Obtener información del empleado
   obtenerInfoEmpleado(idEmpleado) {
       return this.empleados[idEmpleado] || null;
   }

   // Obtener información del empleador
   obtenerInfoEmpleador(idEmpleador) {
       return this.empleadores[idEmpleador] || null;
   }

   // Verificar existencia de empleado
   existeEmpleado(idEmpleado) {
       return !!this.empleados[idEmpleado];
   }

   // Verificar existencia de empleador
   existeEmpleador(idEmpleador) {
       return !!this.empleadores[idEmpleador];
   }
}

export default SmartContract;
