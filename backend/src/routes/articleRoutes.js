const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/articleController');
const upload = require('../middleware/upload');

// PENTING: /stats harus didaftarkan SEBELUM /:id
router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

// upload.single('thumbnail') memproses multipart/form-data:
// - field file bernama 'thumbnail' -> tersedia di req.file
// - field teks lainnya (title, category, dst) -> tersedia di req.body
router.post('/', upload.single('thumbnail'), ctrl.create);
router.put('/:id', upload.single('thumbnail'), ctrl.update);

router.delete('/:id', ctrl.remove);

module.exports = router;
