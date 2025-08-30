const express = require('express');
const db = require('../db');
const { isAuthenticated } = require('../middleware/authMiddleware');
const router = express.Router();

// === RUTE PENCARIAN & DETAIL KAMAR ===

const calculateDuration = (checkIn, checkOut) => {
    const diffTime = new Date(checkOut) - new Date(checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

// Endpoint untuk mencari kamar berdasarkan tanggal (DIPERBAIKI LAGI)
router.get('/rooms', async (req, res) => {
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
        return res.json({ rooms: [], duration: 0 });
    }

    try {
        const duration = calculateDuration(checkInDate, checkOutDate);
        if (duration <= 0) {
            return res.json({ rooms: [], duration: 0 });
        }

        // --- PERBAIKAN: Menyederhanakan GROUP BY untuk memastikan SUM() bekerja ---
        const sql = `
            SELECT
                r.id, r.name, r.type, r.facilities, r.description,
                r.averageRating, r.numReviews,
                SUM(ra.price) AS total_price,
                MIN(ra.available_quantity) AS available_quantity,
                (SELECT ri.image_url FROM room_images ri WHERE ri.room_id = r.id ORDER BY ri.id ASC LIMIT 1) as image_url
            FROM rooms r
            JOIN room_availability ra ON r.id = ra.room_id
            WHERE
                ra.date >= ? AND ra.date < ?
                AND ra.is_active = TRUE
            GROUP BY
                r.id
            HAVING
                MIN(ra.available_quantity) > 0 AND
                COUNT(ra.date) = ?;
        `;
        
        const [availableRooms] = await db.query(sql, [checkInDate, checkOutDate, duration]);
        
        res.json({ rooms: availableRooms, duration: duration });

    } catch (error) {
        console.error("Error saat mencari ketersediaan kamar:", error);
        res.status(500).json({ message: 'Server Error saat mengambil ketersediaan kamar' });
    }
});


// Endpoint untuk mendapatkan detail satu kamar
router.get('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rooms] = await db.query('SELECT * FROM rooms WHERE id = ?', [id]);
        if (rooms.length === 0) {
            return res.status(404).json({ message: 'Kamar tidak ditemukan' });
        }
        const roomData = rooms[0];
        const [images] = await db.query('SELECT id, image_url FROM room_images WHERE room_id = ? ORDER BY id ASC', [id]);
        roomData.images = images;
        res.json(roomData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// === RUTE BOOKING & PEMBAYARAN ===

// Endpoint untuk membuat booking baru
router.post('/bookings', isAuthenticated, async (req, res) => {
    const { room_id, guest_name, check_in_date, check_out_date } = req.body;
    const user_id = req.user.id;
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const checkAvailabilitySql = `
            SELECT date, available_quantity, price FROM room_availability
            WHERE room_id = ? AND date >= ? AND date < ? AND is_active = TRUE;
        `;
        const [availability] = await connection.query(checkAvailabilitySql, [room_id, check_in_date, check_out_date]);

        const dateDiff = (new Date(check_out_date) - new Date(check_in_date)) / (1000 * 60 * 60 * 24);
        if (availability.length !== dateDiff || availability.some(day => day.available_quantity <= 0)) {
            await connection.rollback();
            return res.status(400).json({ message: 'Kamar tidak tersedia pada sebagian atau seluruh tanggal yang dipilih.' });
        }

        const totalPrice = availability.reduce((sum, day) => sum + parseFloat(day.price), 0);

        const insertBookingSql = `
            INSERT INTO bookings (user_id, room_id, guest_name, total_price, check_in_date, check_out_date) 
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const [insertResult] = await connection.query(insertBookingSql, [user_id, room_id, guest_name, totalPrice, check_in_date, check_out_date]);
        
        await connection.commit();
        res.status(201).json({ 
            message: 'Pemesanan berhasil dibuat, silakan lanjutkan ke pembayaran.',
            bookingId: insertResult.insertId 
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error saat membuat booking:", error);
        res.status(500).json({ message: 'Server Error saat memproses pemesanan' });
    } finally {
        connection.release();
    }
});

// Endpoint untuk pembayaran
router.post('/bookings/:bookingId/pay', isAuthenticated, async (req, res) => {
    const { bookingId } = req.params;
    const { promoCode } = req.body;
    const userId = req.user.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [bookings] = await connection.query(
            "SELECT * FROM bookings WHERE id = ? AND user_id = ? AND payment_status = 'pending' FOR UPDATE", 
            [bookingId, userId]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau sudah diproses.' });
        }
        const booking = bookings[0];
        let finalPrice = booking.total_price;
        let promoId = null;

        if (promoCode) {
            const [promos] = await connection.query(
                'SELECT * FROM promos WHERE code = ? AND is_active = TRUE AND expiry_date >= CURDATE()',
                [promoCode]
            );
            if (promos.length > 0) {
                const promo = promos[0];
                const discountAmount = (booking.total_price * promo.discount_percentage) / 100;
                finalPrice = booking.total_price - discountAmount;
                promoId = promo.id;
            }
        }

        const updateAvailabilitySql = `
            UPDATE room_availability 
            SET available_quantity = available_quantity - 1 
            WHERE room_id = ? AND date >= ? AND date < ?;
        `;
        await connection.query(updateAvailabilitySql, [booking.room_id, booking.check_in_date, booking.check_out_date]);

        await connection.query(
            `UPDATE bookings SET payment_status = 'paid', status = 'pending', final_price = ?, promo_id = ?, is_new = TRUE WHERE id = ?`,
            [finalPrice, promoId, bookingId]
        );

        await connection.commit();
        res.json({ message: 'Pembayaran berhasil! Pesanan Anda menunggu konfirmasi dari admin.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error processing payment:", error);
        res.status(500).json({ message: 'Server error saat proses pembayaran.' });
    } finally {
        connection.release();
    }
});


// Endpoint untuk riwayat booking
router.get('/my-bookings', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
        const bookingsSql = `
            SELECT 
                b.id, b.check_in_date, b.check_out_date, b.created_at, b.status, b.payment_status, b.final_price, b.total_price,
                r.name AS room_name,
                (SELECT ri.image_url FROM room_images ri WHERE ri.room_id = b.room_id ORDER BY ri.id ASC LIMIT 1) as image_url
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?;
        `;
        const [bookings] = await db.query(bookingsSql, [userId, limit, offset]);
        
        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM bookings WHERE user_id = ?', [userId]);

        res.json({
            data: bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Endpoint untuk detail booking
router.get('/booking/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const sql = `
            SELECT b.*, r.name AS room_name, r.type AS room_type
            FROM bookings b JOIN rooms r ON b.room_id = r.id
            WHERE b.id = ? AND b.user_id = ?;
        `;
        const [bookingDetails] = await db.query(sql, [id, userId]);

        if (bookingDetails.length === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau Anda tidak memiliki akses' });
        }
        res.json(bookingDetails[0]);
    } catch (error) {
        console.error("Error fetching booking detail:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Endpoint untuk membatalkan booking
router.put('/bookings/:bookingId/cancel', isAuthenticated, async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        
        const [bookings] = await connection.query('SELECT * FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE', [bookingId, userId]);
        if (bookings.length === 0 || bookings[0].status === 'cancelled') {
            await connection.rollback();
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau sudah dibatalkan.' });
        }
        const booking = bookings[0];

        if (booking.status !== 'pending' && booking.status !== 'rejected') {
            const updateAvailabilitySql = `
                UPDATE room_availability SET available_quantity = available_quantity + 1 
                WHERE room_id = ? AND date >= ? AND date < ?;
            `;
            await connection.query(updateAvailabilitySql, [booking.room_id, booking.check_in_date, booking.check_out_date]);
        }
        
        await connection.query('UPDATE bookings SET status = "cancelled" WHERE id = ?', [bookingId]);
        
        await connection.commit();
        res.json({ message: 'Pesanan berhasil dibatalkan.' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error saat membatalkan pesanan.' });
    } finally {
        connection.release();
    }
});


// === RUTE HALAMAN UTAMA & PROMO ===

// Endpoint untuk kamar unggulan
router.get('/featured-rooms', async (req, res) => {
    try {
        const sql = `
            SELECT 
                r.id, r.name, r.type, ra.price, r.averageRating, r.numReviews,
                (SELECT ri.image_url FROM room_images ri WHERE ri.room_id = r.id ORDER BY ri.id ASC LIMIT 1) as image_url
            FROM rooms r
            JOIN room_availability ra ON r.id = ra.room_id
            WHERE ra.date = CURDATE() AND ra.is_active = 1 AND ra.available_quantity > 0
            ORDER BY r.averageRating DESC, ra.price ASC
            LIMIT 4;
        `;
        const [rooms] = await db.query(sql);
        res.json(rooms);
    } catch (error) {
        console.error("Error fetching featured rooms:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Endpoint untuk verifikasi promo
router.post('/promos/verify', isAuthenticated, async (req, res) => {
    const { code } = req.body;
    if (!code) { return res.status(400).json({ message: 'Kode promo diperlukan.' }); }
    try {
        const [promos] = await db.query(
            'SELECT * FROM promos WHERE code = ? AND is_active = TRUE AND expiry_date >= CURDATE()',
            [code.toUpperCase()]
        );
        if (promos.length === 0) {
            return res.status(404).json({ message: 'Kode promo tidak valid atau sudah kadaluarsa.' });
        }
        res.json({ message: 'Kode promo berhasil diterapkan!', promo: promos[0] });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// === RUTE REVIEW / ULASAN ===

// Endpoint untuk mengambil semua ulasan sebuah kamar
router.get('/rooms/:roomId/reviews', async (req, res) => {
    try {
        const { roomId } = req.params;
        const sql = `
            SELECT rev.id, rev.rating, rev.comment, rev.created_at, u.username
            FROM reviews AS rev
            JOIN users AS u ON rev.user_id = u.id
            WHERE rev.room_id = ?
            ORDER BY rev.created_at DESC
        `;
        const [reviews] = await db.query(sql, [roomId]);
        res.json(reviews);
    } catch (error) {
        console.error("Error saat mengambil ulasan:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Endpoint untuk memeriksa apakah user bisa memberi ulasan
router.get('/rooms/:roomId/can-review', isAuthenticated, async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        // Cari pemesanan terkonfirmasi untuk kamar ini oleh user ini,
        // yang belum memiliki ulasan.
        const sql = `
            SELECT b.id FROM bookings b
            LEFT JOIN reviews r ON b.id = r.booking_id
            WHERE b.user_id = ? 
              AND b.room_id = ? 
              AND b.status = 'confirmed' 
              AND r.id IS NULL
            ORDER BY b.check_in_date DESC
            LIMIT 1;
        `;
        const [results] = await db.query(sql, [userId, roomId]);

        if (results.length > 0) {
            // Jika ditemukan, kirim 'canReview: true' beserta ID booking-nya
            res.json({ canReview: true, bookingId: results[0].id });
        } else {
            // Jika tidak, kirim 'canReview: false'
            res.json({ canReview: false, bookingId: null });
        }

    } catch (error) {
        console.error("Error checking review eligibility:", error);
        res.status(500).json({ message: "Server Error" });
    }
});


// Endpoint untuk mengirim ulasan
router.post('/rooms/:roomId/reviews', isAuthenticated, async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { rating, comment, bookingId } = req.body;

    if (!rating || !comment || !bookingId) {
        return res.status(400).json({ message: "Rating, komentar, dan ID booking tidak boleh kosong" });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const insertReviewSql = 'INSERT INTO reviews (room_id, user_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?)';
        await connection.query(insertReviewSql, [roomId, userId, bookingId, rating, comment]);

        const updateRoomSql = `
            UPDATE rooms SET
                numReviews = (SELECT COUNT(*) FROM reviews WHERE room_id = ?),
                averageRating = (SELECT AVG(rating) FROM reviews WHERE room_id = ?)
            WHERE id = ?
        `;
        await connection.query(updateRoomSql, [roomId, roomId, roomId]);
        
        await connection.commit();
        res.status(201).json({ message: "Ulasan berhasil ditambahkan" });

    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Anda sudah memberikan ulasan untuk pemesanan ini.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan ulasan' });
    } finally {
        connection.release();
    }
});

router.get('/bookings/:bookingId/resume', isAuthenticated, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const sql = `
            SELECT 
                b.id, b.total_price,
                r.name as room_name
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.id = ? AND b.user_id = ? AND b.payment_status = 'pending';
        `;
        const [bookings] = await db.query(sql, [bookingId, userId]);

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau sudah dibayar.' });
        }
        
        res.json(bookings[0]);

    } catch (error) {
        console.error("Error fetching booking details for payment:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});
module.exports = router;

