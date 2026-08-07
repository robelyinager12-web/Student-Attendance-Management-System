require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected\n');

        const u = await User.findOne({ where: { email: 'admin@school.com' } });
        const h = u.password;

        // Hypothesis 1: stored hash is double-hashed (bcrypt of bcrypt)
        const h1 = bcrypt.hashSync('admin123', 10);
        const h2 = bcrypt.hashSync('password123', 10);
        console.log('double-hash admin123  ->', await bcrypt.compare(h1, h));
        console.log('double-hash password123 ->', await bcrypt.compare(h2, h));

        // Hypothesis 2: was the plaintext itself the hash? No.
        // Hypothesis 3: maybe compare with a different cost or the hash is of some other string
        // Try common passwords
        const candidates = ['admin123', 'password123', 'Admin123', 'admin', 'password', '123456', 'admin@123', 'Admin@123', '12345678', 'admin2024', 'admin2025', 'admin2026', 'password1', '1234', '12345'];
        for (const c of candidates) {
            const ok = await bcrypt.compare(c, h);
            if (ok) console.log('  MATCH candidate:', c);
        }
        console.log('candidate scan done');

        // Check for other admin users and their plaintext if any
        const admins = await User.findAll({ where: { role: 'ADMIN' }, attributes: ['email', 'password'] });
        for (const a of admins) {
            for (const c of ['admin123', 'password123', 'Admin@123', 'admin@123']) {
                const ok = await bcrypt.compare(c, a.password);
                console.log(`  admin ${a.email} vs ${c} ->`, ok);
            }
        }

        await sequelize.close();
    } catch (e) {
        console.error('FATAL', e);
        process.exit(1);
    }
})();
