require('dotenv').config();
const connectDB = require('./db');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@aquasphere.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('✅ Admin user already exists');
            process.exit();
        }

        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: 'adminpassword123',
            role: 'admin',
        });

        console.log('✅ Admin user created successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
