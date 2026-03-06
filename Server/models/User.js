const { get, run, all } = require('../db');
const bcrypt = require('bcryptjs');

const User = {
    async findOne(query) {
        let user;
        if (query.email) {
            // Search by email or name, since frontend says "Email or Username"
            user = await get('SELECT * FROM users WHERE email = ? OR name = ?', [query.email, query.email.trim()]);
        } else {
            // fallback
            const keys = Object.keys(query);
            if (keys.length > 0) {
                user = await get(`SELECT * FROM users WHERE ${keys[0]} = ?`, [query[keys[0]]]);
            }
        }

        if (user) {
            // Add matchPassword method to the user object
            user.matchPassword = async function (enteredPassword) {
                return await bcrypt.compare(enteredPassword, this.password);
            };
        }
        return user;
    },

    async create({ name, email, password, role }) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        try {
            const { id } = await run(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, role || 'citizen']
            );
            return { id, name, email, role: role || 'citizen' };
        } catch (error) {
            throw error;
        }
    },

    async findById(id) {
        return await get('SELECT * FROM users WHERE id = ?', [id]);
    },

    async find() {
        return await all('SELECT id, name, email, role, location, skills, createdAt FROM users');
    }
};

module.exports = User;
