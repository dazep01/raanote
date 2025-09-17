
window.jsPDF = window.jspdf.jsPDF;

// Additional utility functions
class Utils {
    static generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Custom event dispatcher for inter-component communication
class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        
        this.events[event] = this.events[event].filter(
            cb => cb !== callback
        );
    }

    emit(event, data) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            callback(data);
        });
    }
}

// Create global event bus
window.eventBus = new EventBus();
