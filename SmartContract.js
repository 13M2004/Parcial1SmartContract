import LinkedList from './LinkedList.js';

class SmartContract {
   constructor() {
       this.transactions = new LinkedList();
       this.employees = {};
       this.employers = {};
       this.balances = {};
   }

   // Register a new employee
   registerEmployee(id, name) {
       this.employees[id] = { name, payments: [] };
       this.balances[id] = 0;
       return true;
   }

   // Register a new employer
   registerEmployer(id, name) {
       this.employers[id] = { name, pendingPayments: [] };
       this.balances[id] = 0;
       return true;
   }

   // Create a new pending payment
   createPendingPayment(employerId, employeeId, amount, date, conditions) {
       try {
           if (!this.employers[employerId] || !this.employees[employeeId]) {
               throw new Error("Empleador o empleado no registrado");
           }

           if (amount <= 0) {
               throw new Error("El monto debe ser mayor a 0");
           }

           const payment = {
               id: Date.now(),
               employerId,
               employeeId,
               amount,
               date,
               conditions,
               status: "Pendiente",
               createdAt: new Date()
           };

           this.transactions.addTransaction(payment);
           return true;
       } catch (error) {
           console.error('Error en createPendingPayment:', error);
           return false;
       }
   }

   // Get payments by employee
   getEmployeePayments(employeeId) {
       if (!this.employees[employeeId]) return [];
       return this.transactions.displayTransactions().filter(payment => payment.employeeId === employeeId);
   }
}

export default SmartContract;
