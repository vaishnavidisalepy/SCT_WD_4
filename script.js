class ToDoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Add task
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Clear completed
        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => this.closeEditModal());
        document.getElementById('saveEditBtn').addEventListener('click', () => this.saveEdit());
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModal')) this.closeEditModal();
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const categoryInput = document.getElementById('categoryInput');
        const priorityInput = document.getElementById('priorityInput');
        const dateTimeInput = document.getElementById('dateTimeInput');
        
        const taskText = taskInput.value.trim();
        const category = categoryInput.value;
        const priority = priorityInput.value;
        const dateTime = dateTimeInput.value;

        if (taskText === '') {
            alert('📝 Please enter a task!');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            category: category,
            priority: priority,
            dateTime: dateTime || null,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.render();

        // Clear inputs
        taskInput.value = '';
        dateTimeInput.value = '';
        taskInput.focus();
    }

    deleteTask(id) {
        if (confirm('🗑️ Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            
            if (task.completed) {
                this.celebrateCompletion();
            }
            
            this.render();
        }
    }

    celebrateCompletion() {
        // Create confetti pieces
        const confettiContainer = document.getElementById('confetti');
        const colors = ['#7e22ce', '#c026d3', '#ec4899', '#06b6d4', '#10b981'];
        
        for (let i = 0; i < 30; i++) {
            const confettiPiece = document.createElement('div');
            confettiPiece.className = 'confetti-piece';
            confettiPiece.style.left = Math.random() * 100 + '%';
            confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confettiPiece.style.animation = `confettiFall ${2 + Math.random() * 1}s linear forwards`;
            confettiContainer.appendChild(confettiPiece);
            
            setTimeout(() => confettiPiece.remove(), 3000);
        }
    }

    openEditModal(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            document.getElementById('editTaskInput').value = task.text;
            document.getElementById('editCategoryInput').value = task.category || 'work';
            document.getElementById('editPriorityInput').value = task.priority || 'medium';
            document.getElementById('editDateTimeInput').value = task.dateTime || '';
            document.getElementById('editModal').style.display = 'block';
            document.getElementById('editTaskInput').focus();
        }
    }

    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingTaskId = null;
    }

    saveEdit() {
        if (this.editingTaskId === null) return;

        const newText = document.getElementById('editTaskInput').value.trim();
        const newCategory = document.getElementById('editCategoryInput').value;
        const newPriority = document.getElementById('editPriorityInput').value;
        const newDateTime = document.getElementById('editDateTimeInput').value;

        if (newText === '') {
            alert('📝 Task cannot be empty!');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = newText;
            task.category = newCategory;
            task.priority = newPriority;
            task.dateTime = newDateTime || null;
            this.saveTasks();
            this.render();
            this.closeEditModal();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            default:
                return this.tasks;
        }
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('✅ No completed tasks to clear!');
            return;
        }

        if (confirm(`🗑️ Delete ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }

    getCategoryEmoji(category) {
        const emojis = {
            'work': '💼',
            'personal': '👤',
            'shopping': '🛒',
            'health': '💪',
            'other': '📌'
        };
        return emojis[category] || '📌';
    }

    getPriorityLabel(priority) {
        const labels = {
            'low': '🟢 Low',
            'medium': '🟡 Medium',
            'high': '🔴 High'
        };
        return labels[priority] || '🟡 Medium';
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('pendingCount').textContent = pending;
    }

    formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';

        try {
            const date = new Date(dateTimeString);
            const options = {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString('en-US', options);
        } catch (e) {
            return dateTimeString;
        }
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        const tasksList = document.getElementById('tasksList');

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '<div class="empty-state"><p>🎯 No tasks to display. Add one to get started!</p></div>';
        } else {
            tasksList.innerHTML = filteredTasks
                .map(task => `
                    <div class="task-item ${task.completed ? 'completed' : ''}">
                        <input 
                            type="checkbox" 
                            class="task-checkbox" 
                            ${task.completed ? 'checked' : ''}
                            onchange="app.toggleComplete(${task.id})"
                        >
                        <div class="task-content">
                            <div>
                                <span class="category-badge category-${task.category}">
                                    ${this.getCategoryEmoji(task.category)} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                                </span>
                                <span class="priority-badge priority-${task.priority}">
                                    ${this.getPriorityLabel(task.priority)}
                                </span>
                            </div>
                            <div class="task-title">${this.escapeHtml(task.text)}</div>
                            ${task.dateTime ? `<div class="task-datetime">${this.formatDateTime(task.dateTime)}</div>` : ''}
                        </div>
                        <div class="task-actions">
                            <button class="task-btn edit-btn" onclick="app.openEditModal(${task.id})">✏️ Edit</button>
                            <button class="task-btn delete-btn" onclick="app.deleteTask(${task.id})">🗑️ Delete</button>
                        </div>
                    </div>
                `)
                .join('');
        }

        this.updateStats();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const stored = localStorage.getItem('tasks');
        this.tasks = stored ? JSON.parse(stored) : [];
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ToDoApp();
});
