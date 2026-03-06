const { all, run, get } = require('../db');

const Report = {
    async create({ user, location, issue, description }) {
        try {
            const { id } = await run(
                'INSERT INTO reports (userId, location, issue, description, assignedTo) VALUES (?, ?, ?, ?, NULL)',
                [user, location, issue, description]
            );
            return { id, userId: user, location, issue, description, status: 'pending', assignedTo: null };
        } catch (error) {
            throw error;
        }
    },

    async find(query = {}) {
        let sql = `
            SELECT r.*, u.name as citizenName 
            FROM reports r 
            LEFT JOIN users u ON r.userId = u.id
        `;
        const params = [];
        const conditions = [];

        if (query.user) {
            conditions.push('r.userId = ?');
            params.push(query.user);
        }
        if (query.assignedTo) {
            conditions.push('r.assignedTo = ?');
            params.push(query.assignedTo);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        return await all(sql, params);
    },

    async findById(id) {
        return await get('SELECT * FROM reports WHERE id = ?', [id]);
    },

    async count(query = {}) {
        let sql = 'SELECT COUNT(*) as count FROM reports';
        const params = [];
        if (query.user) {
            sql += ' WHERE userId = ?';
            params.push(query.user);
        } else if (query.status) {
            sql += ' WHERE status = ?';
            params.push(query.status);
        }
        const result = await get(sql, params);
        return result.count;
    }
};

module.exports = Report;
