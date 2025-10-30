const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, getTaskById } = require('../services/task.service');


// POST /tasks
router.post('/', (req, res) => {
    const { title, description, priority, due_date, status } = req.body;
    if (!title || !due_date || !priority) {
        return res.status(400).json({ error: 'Missing required fields: title, priority, due_date' });
    }


    try {
        const task = createTask({ title, description, priority, due_date, status });
        res.status(201).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});


// GET /tasks
router.get('/', (req, res) => {
    const { status, priority, sortByDue } = req.query;
    try {
        const tasks = getTasks({ status, priority, sortByDue });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});


// PATCH /tasks/:id
router.patch('task/:id', (req, res) => {
    const id = Number(req.params.id);
    const { status, priority } = req.body;
    try {
        const updated = updateTask(id, { status, priority });
        if (!updated) return res.status(404).json({ error: 'Task not found or no changes' });
        const task = getTaskById(id);
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});


module.exports = router;