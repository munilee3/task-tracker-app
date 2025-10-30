const db = require('../db/db');


function createTask({ title, description, priority = 'Medium', due_date, status = 'Open' }) {
    const stmt = db.prepare(`INSERT INTO tasks (title, description, priority, due_date, status) VALUES (?,?,?,?,?)`);
    const info = stmt.run(title, description, priority, due_date, status);
    return { id: info.lastInsertRowid, title, description, priority, due_date, status };
}


function getTasks({ status, priority, sortByDue } = {}) {
    const where = [];
    const params = [];
    if (status) { where.push('status = ?'); params.push(status); }
    if (priority) { where.push('priority = ?'); params.push(priority); }


    let sql = 'SELECT * FROM tasks';
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    if (sortByDue === 'asc') sql += ' ORDER BY due_date ASC';
    if (sortByDue === 'desc') sql += ' ORDER BY due_date DESC';


    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);
    return rows;
}


function updateTask(id, { status, priority }) {
    const updates = [];
    const params = [];
    if (status) {
        updates.push('status = ?'); params.push(status);
    }
    if (priority) {
        updates.push('priority = ?'); params.push(priority);
    }
    if (!updates.length) return null;
    params.push(id);
    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(sql);
    const info = stmt.run(...params);
    return info.changes > 0;
}


function getTaskById(id) {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}


module.exports = { createTask, getTasks, updateTask, getTaskById };