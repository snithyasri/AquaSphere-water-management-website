const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        // Map id to _id for frontend compatibility
        const mappedUsers = users.map(u => ({ ...u, _id: u.id }));
        res.json(mappedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
};
