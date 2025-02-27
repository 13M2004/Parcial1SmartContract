import Node from './Node.js';

class LinkedList {
    constructor() {
        this.head = null;
        this.loadFromStorage(); // Load existing data when creating new instance
    }

    addTransaction(data) {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.saveToStorage(); // Save after adding new transaction
    }

    updatePaymentStatus(id, newStatus) {
        let current = this.head;
        while (current) {
            if (current.data.id === id) {
                current.data.status = newStatus;
                this.saveToStorage(); // Save after updating status
                return true;
            }
            current = current.next;
        }
        return false;
    }

    displayTransactions() {
        let current = this.head;
        const transactionsArray = [];
        while (current) {
            transactionsArray.push(current.data);
            current = current.next;
        }
        return transactionsArray;
    }

    saveToStorage() {
        const data = this.displayTransactions();
        localStorage.setItem('paymentsList', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = localStorage.getItem('paymentsList');
        if (data) {
            const transactions = JSON.parse(data);
            transactions.forEach(transaction => {
                const newNode = new Node(transaction);
                if (!this.head) {
                    this.head = newNode;
                } else {
                    let current = this.head;
                    while (current.next) {
                        current = current.next;
                    }
                    current.next = newNode;
                }
            });
        }
    }

    getPendingPayments() {
        return this.displayTransactions().filter(payment => payment.status === 'Pendiente');
    }

    getPaidPayments() {
        return this.displayTransactions().filter(payment => payment.status === 'Pagado');
    }
}

export default LinkedList;
