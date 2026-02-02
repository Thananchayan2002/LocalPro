const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professionalController');
const { getMulterUpload } = require('../config/multerConfig');
const { protect } = require('../middleware/authMiddleware');

// Create multer upload instance for professionals
const upload = getMulterUpload('professionals');

// Routes
router.get('/', protect, professionalController.getAllProfessionals);
router.get('/:id', protect, professionalController.getProfessionalById);
router.post('/', protect, upload.single('profileImage'), professionalController.createProfessional);
router.put('/:id', protect, upload.single('profileImage'), professionalController.updateProfessional);
router.patch('/:id/status', protect, professionalController.updateProfessionalStatus);
router.post('/:id/approve', protect, professionalController.approveProfessional);
router.post('/:id/pdf', protect, professionalController.generatePDF);
router.delete('/:id', protect, professionalController.deleteProfessional);

module.exports = router;
 