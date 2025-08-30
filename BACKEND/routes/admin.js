const express = require('express');
const db = require('../db');
const bcrypt = require('bcryptjs');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Middleware ini akan melindungi semua rute di file ini
router.use(isAuthenticated, isAdmin);

// --- KONFIGURASI MULTER ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// === CRUD USERS ===
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;
        const [users] = await db.query(
            'SELECT id, username, email, role FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM users');
        res.json({
            data: users,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { username, email, role } = req.body;
        await db.query('UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?', [username, email, role, req.params.id]);
        res.json({ message: 'User berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// === CRUD ROOMS ===
router.get('/rooms', async (req, res) => {
    try {
        const sql = `
            SELECT 
                r.*,
                COALESCE(ra.price, 0) AS price, 
                COALESCE(ra.available_quantity, 0) AS available_quantity,
                (SELECT ri.image_url FROM room_images ri WHERE ri.room_id = r.id ORDER BY ri.id ASC LIMIT 1) as image_url
            FROM 
                rooms r
            LEFT JOIN 
                room_availability ra ON r.id = ra.room_id AND ra.date = CURDATE()
            ORDER BY 
                r.created_at DESC;
        `;
        const [rooms] = await db.query(sql);
        res.json(rooms);
    } catch (error) {
        console.error("Error fetching admin rooms:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- BAGIAN YANG SUDAH BERSIH DAN FINAL ---
router.post('/rooms', async (req, res) => {
    const { name, type, price, quantity, facilities, description, image_url } = req.body;
    
    if (!name || !type || !price || !quantity) {
        return res.status(400).json({ message: 'Nama, tipe, harga, dan kuantitas awal wajib diisi.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [insertRoomResult] = await connection.query(
            'INSERT INTO rooms (name, type, facilities, description) VALUES (?, ?, ?, ?)',
            [name, type, facilities, description]
        );
        const newRoomId = insertRoomResult.insertId;

        if (image_url && image_url.trim() !== '') {
            await connection.query(
                'INSERT INTO room_images (room_id, image_url, alt_text) VALUES (?, ?, ?)',
                [newRoomId, image_url, `Gambar utama untuk ${name}`]
            );
        }

        const availabilityInserts = [];
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const formattedDate = currentDate.toISOString().split('T')[0];
            availabilityInserts.push([newRoomId, formattedDate, price, quantity, 1]);
        }
        
        const availabilitySql = 'INSERT INTO room_availability (room_id, `date`, price, available_quantity, is_active) VALUES ?';
        await connection.query(availabilitySql, [availabilityInserts]);

        await connection.commit();
        res.status(201).json({ message: 'Kamar dan inventaris harian berhasil ditambahkan' });

    } catch (error) {
        await connection.rollback();
        console.error("Error saat menambah kamar:", error);
        res.status(500).json({ message: 'Server Error saat menambahkan kamar' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


router.put('/rooms/:id', async (req, res) => {
    try {
        const { name, type, facilities, description } = req.body;
        await db.query(
            'UPDATE rooms SET name = ?, type = ?, facilities = ?, description = ? WHERE id = ?',
            [name, type, facilities, description, req.params.id]
        );
        res.json({ message: 'Detail kamar berhasil diperbarui' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/rooms/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
        res.json({ message: 'Kamar berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// === CRUD BOOKINGS ===
router.get('/bookings', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;
        const [bookings] = await db.query(`
            SELECT 
                b.id, b.guest_name, b.status,
                b.created_at, b.check_in_date, b.check_out_date,
                u.username AS user_username,
                r.name AS room_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN rooms r ON b.room_id = r.id
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM bookings');
        res.json({
            data: bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/bookings/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [bookings] = await connection.query('SELECT * FROM bookings WHERE id = ?', [id]);
        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Booking tidak ditemukan' });
        }
        const booking = bookings[0];
        if (booking.status === 'confirmed') {
             const restoreStockSql = `
                UPDATE room_availability 
                SET available_quantity = available_quantity + 1 
                WHERE room_id = ? AND date >= ? AND date < ?;
            `;
            await connection.query(restoreStockSql, [booking.room_id, booking.check_in_date, booking.check_out_date]);
        }
        await connection.query('DELETE FROM bookings WHERE id = ?', [id]);
        await connection.commit();
        res.json({ message: 'Booking berhasil dihapus' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error saat menghapus booking' });
    } finally {
        connection.release();
    }
});

router.get('/booking/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [details] = await db.query(
            `SELECT 
                b.*, r.name AS room_name, r.type AS room_type, r.price, u.username, u.email
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN users u ON b.user_id = u.id
            WHERE b.id = ?`,
            [id]
        );
        if (details.length === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }
        res.json(details[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// === MANAJEMEN INVENTARIS ===
router.get('/availability/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    try {
        const availabilitySql = `
            SELECT 
                id, date, available_quantity, is_active, price
            FROM room_availability
            WHERE 
                room_id = ? 
                AND YEAR(date) = ? 
                AND MONTH(date) = ?
            ORDER BY date ASC;
        `;
        const [availabilityData] = await db.query(availabilitySql, [roomId, year, month]);
        res.json(availabilityData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error saat mengambil data ketersediaan' });
    }
});

router.put('/availability', async (req, res) => {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ message: 'Data update tidak valid' });
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        for (const update of updates) {
            const { id, quantity, isActive, price } = update;
            const updateSql = `
                UPDATE room_availability 
                SET 
                    available_quantity = ?, 
                    is_active = ?,
                    price = ?
                WHERE id = ?;
            `;
            await connection.query(updateSql, [quantity, isActive, price, id]);
        }
        await connection.commit();
        res.json({ message: 'Ketersediaan berhasil diperbarui' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server Error saat memperbarui ketersediaan' });
    } finally {
        connection.release();
    }
});


// === STATISTIK & LAPORAN ===
router.get('/stats', async (req, res) => {
    try {
        const [usersResult] = await db.query("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'user'");
        const [bookingsResult] = await db.query("SELECT COUNT(*) as totalBookings FROM bookings WHERE status = 'confirmed'");
        const [revenueResult] = await db.query(`
            SELECT SUM(COALESCE(final_price, total_price)) as monthlyRevenue
            FROM bookings
            WHERE status = 'confirmed'
            AND MONTH(check_in_date) = MONTH(CURDATE())
            AND YEAR(check_in_date) = YEAR(CURDATE())
        `);
        const [recentBookings] = await db.query(`
            SELECT b.id, r.name as room_name, u.username as user_username, b.created_at
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
            LIMIT 5
        `);
        const [monthlyRevenueData] = await db.query(`
            SELECT 
                DATE_FORMAT(check_in_date, '%Y-%m') AS month,
                SUM(COALESCE(final_price, total_price)) AS revenue
            FROM bookings
            WHERE status = 'confirmed' AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY month
            ORDER BY month ASC;
        `);
        res.json({
            totalUsers: usersResult[0].totalUsers,
            totalBookings: bookingsResult[0].totalBookings,
            monthlyRevenue: revenueResult[0].monthlyRevenue || 0,
            recentBookings,
            monthlyRevenueChart: monthlyRevenueData
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/reports', async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Rentang tanggal (startDate dan endDate) diperlukan.' });
    }
    try {
        const [summary] = await db.query(`
            SELECT
                COUNT(id) AS totalBookings,
                SUM(COALESCE(final_price, total_price)) AS totalRevenue
            FROM bookings
            WHERE status = 'confirmed'
            AND check_in_date BETWEEN ? AND ?;
        `, [startDate, endDate]);
        const [popularRooms] = await db.query(`
            SELECT
                r.name,
                COUNT(b.id) AS bookingCount
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.status = 'confirmed'
            AND b.check_in_date BETWEEN ? AND ?
            GROUP BY r.name
            ORDER BY bookingCount DESC
            LIMIT 5;
        `, [startDate, endDate]);
        res.json({
            summary: {
                totalBookings: summary[0].totalBookings || 0,
                totalRevenue: summary[0].totalRevenue || 0,
            },
            popularRooms
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Server Error saat membuat laporan." });
    }
});


// === NOTIFIKASI & PERSETUJUAN PESANAN ===
router.get('/bookings/new-count', async (req, res) => {
    try {
        const [[{ count }]] = await db.query("SELECT COUNT(*) as count FROM bookings WHERE is_new = TRUE");
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/bookings/:id/confirm', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query(
            "UPDATE bookings SET status = 'confirmed', is_new = FALSE WHERE id = ? AND status = 'pending'",
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau sudah dikonfirmasi.' });
        }
        res.json({ message: 'Pesanan berhasil dikonfirmasi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/bookings/:id/reject', async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [bookings] = await connection.query(
            "SELECT * FROM bookings WHERE id = ? AND status = 'pending' FOR UPDATE",
            [id]
        );
        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau statusnya bukan pending.' });
        }
        const booking = bookings[0];
        await connection.query(
            "UPDATE bookings SET status = 'rejected', is_new = FALSE WHERE id = ?",
            [id]
        );
        const restoreStockSql = `
            UPDATE room_availability 
            SET available_quantity = available_quantity + 1 
            WHERE room_id = ? AND date >= ? AND date < ?;
        `;
        await connection.query(restoreStockSql, [booking.room_id, booking.check_in_date, booking.check_out_date]);
        await connection.commit();
        res.json({ message: 'Pesanan berhasil ditolak.' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server Error saat menolak pesanan.' });
    } finally {
        connection.release();
    }
});


// === MANAJEMEN GALERI & PROMO ===
router.get('/rooms/:roomId/images', async (req, res) => {
    try {
        const { roomId } = req.params;
        const [images] = await db.query('SELECT * FROM room_images WHERE room_id = ? ORDER BY id ASC', [roomId]);
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/rooms/:roomId/upload-image', upload.single('image'), async (req, res) => {
    const { roomId } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
    }
    try {
        const imageUrl = `/uploads/${req.file.filename}`;
        await db.query(
            'INSERT INTO room_images (room_id, image_url, alt_text) VALUES (?, ?, ?)',
            [roomId, imageUrl, req.body.alt_text || 'Gambar kamar']
        );
        res.status(201).json({ message: 'Gambar berhasil diunggah.', imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error saat mengunggah gambar.' });
    }
});

router.delete('/images/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        await db.query('DELETE FROM room_images WHERE id = ?', [imageId]);
        res.json({ message: 'Gambar berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/promos', async (req, res) => {
    try {
        const [promos] = await db.query('SELECT * FROM promos ORDER BY created_at DESC');
        res.json(promos);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/promos', async (req, res) => {
    const { code, discount_percentage, expiry_date } = req.body;
    if (!code || !discount_percentage || !expiry_date) {
        return res.status(400).json({ message: 'Semua field diperlukan.' });
    }
    try {
        await db.query(
            'INSERT INTO promos (code, discount_percentage, expiry_date) VALUES (?, ?, ?)',
            [code.toUpperCase(), discount_percentage, expiry_date]
        );
        res.status(201).json({ message: 'Kode promo berhasil dibuat.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Kode promo ini sudah ada.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/promos/:id', async (req, res) => {
    const { id } = req.params;
    const { discount_percentage, expiry_date, is_active } = req.body;
    try {
        await db.query(
            'UPDATE promos SET discount_percentage = ?, expiry_date = ?, is_active = ? WHERE id = ?',
            [discount_percentage, expiry_date, is_active, id]
        );
        res.json({ message: 'Kode promo berhasil diperbarui.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/promos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM promos WHERE id = ?', [id]);
        res.json({ message: 'Kode promo berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;
