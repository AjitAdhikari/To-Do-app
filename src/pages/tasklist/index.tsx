import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface Task {
    task_id?: number;
    user_id: number;
    title: string;
    description: string;
    stored_date: string;
    finished_date: string;
    status: string;
}

export default function TaskListPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'todo' | 'completed'>('todo');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        finished_date: '',
    });
    const [editId, setEditId] = useState<number | null>(null);

    const fetchTasks = async () => {
        try {
            let userDetails = localStorage.getItem('user');
            let userID = JSON.parse(userDetails || '{}').id; // Default to user_id 1 if not found
            const res = await axios.get('/api/tasks', { params: { user_id: userID } });
            setTasks(res.data.tasks || res.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to fetch tasks');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.finished_date) {
            alert('All fields are required');
            return;
        }

        const finishedDateObj = new Date(formData.finished_date);
        if (isNaN(finishedDateObj.getTime())) {
            alert('Invalid date format.');
            return;
        }

        const payload = {
            user_id: JSON.parse(localStorage.getItem('user') || '{}').id, 
            title: formData.title,
            description: formData.description,
            finished_date: finishedDateObj.toISOString(),
        };

        try {
            if (editId) {
                await axios.put(`/api/tasks/${editId}`, payload);
            } else {
                await axios.post('/api/tasks/add', payload);
            }
            setFormData({ title: '', description: '', finished_date: '' });
            setShowForm(false);
            setEditId(null);
            fetchTasks();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save task');
        }
    };

    const handleEdit = (task: Task) => {
        setFormData({
            title: task.title,
            description: task.description,
            finished_date: task.finished_date.slice(0, 10),
        });
        setEditId(task.task_id!);
        setShowForm(true);
    };

    const handleDelete = async (task_id?: number) => {
        if (!task_id) return;
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await axios.delete(`/api/tasks/${task_id}`);
            fetchTasks();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete task');
        }
    };

    const handleComplete = async (task_id?: number) => {
        if (!task_id) return;
        try {
            await axios.put(`/api/tasks/${task_id}/status`, { status: 'completed' });
            fetchTasks();
        } catch (error: any) {
            alert('Failed to mark task as completed');
        }
    };

    const pendingTasks = tasks.filter(task => task.status !== 'completed');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="tasklist-container">
            <h1 className="tasklist-heading">Task List</h1>

            {/* TAB BUTTONS */}
            <div className="tasklist-tabs">
                <button
                    onClick={() => setActiveTab('todo')}
                    className={`tasklist-tab ${activeTab === 'todo' ? 'active' : ''}`}
                >
                    Todo
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`tasklist-tab ${activeTab === 'completed' ? 'active' : ''}`}
                >
                    Completed
                </button>
            </div>

            {/* ADD TASK BUTTON */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setFormData({ title: '', description: '', finished_date: '' });
                        setEditId(null);
                    }}
                    className="tasklist-primaryBtn"
                >
                    {showForm ? 'Close' : '+ Add Task'}
                </button>
            </div>

            {/* FORM */}
            {showForm && (
                <form onSubmit={handleSubmit} className="tasklist-form">
                    <div className="tasklist-inputGroup">
                        <label>Title</label>
                        <input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            type="text"
                            placeholder="Task title"
                        />
                    </div>
                    <div className="tasklist-inputGroup">
                        <label>Description</label>
                        <input
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            type="text"
                            placeholder="Task description"
                        />
                    </div>
                    <div className="tasklist-inputGroup">
                        <label>Complete Date</label>
                        <input
                            required
                            value={formData.finished_date}
                            onChange={(e) => setFormData({ ...formData, finished_date: e.target.value })}
                            type="date"
                        />
                    </div>
                    <button type="submit" className="tasklist-primaryBtn">
                        {editId ? 'Update Task' : 'Add Task'}
                    </button>
                </form>
            )}

            {/* TASK LIST */}
            {!showForm && (
                <div className="tasklist-taskList">
                    {(activeTab === 'todo' ? pendingTasks : completedTasks).map((task) => (
                        <div key={task.task_id} className={`tasklist-taskItem ${task.status === 'completed' ? 'completed' : ''}`}>
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <p><strong>Stored:</strong> {new Date(task.stored_date).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {task.status}</p>
                            {task.status !== 'completed' && (
                                <div style={{ marginTop: 10 }}>
                                    <button className="tasklist-primaryBtn" onClick={() => handleEdit(task)}>Edit</button>
                                    <button className="secondaryBtn" onClick={() => handleDelete(task.task_id)}>Delete</button>
                                    <button className="tasklist-primaryBtn" onClick={() => handleComplete(task.task_id)}>Complete</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
