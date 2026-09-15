const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};


const requireActive = async (req, res, next) => {
    try {
        const user = await prisma.users.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(401).json({ error: 'Account not found' });
        if (user.status !== 'active') {
            return res.status(403).json({
                error: 'Account is not active',
                code: 'NOT_ACTIVE',
                status: user.status,
            });
        }
        req.user.status = user.status;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const requireSuperadmin = (req, res, next) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Owner access required' });
    }
    next();
};


const requireChannel = async (req, res, next) => {
    try {
        const count = await prisma.business_channels.count({
            where: { business_id: req.user.business_id },
        });
        if (count === 0) {
            return res.status(403).json({ error: 'No channel connected yet', code: 'NO_CHANNEL' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { protect, adminOnly, requireActive, requireSuperadmin, requireChannel };
