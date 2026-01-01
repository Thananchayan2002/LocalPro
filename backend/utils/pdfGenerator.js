const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF document for a professional
 * @param {Object} professional - Professional data object
 * @param {String} filePath - Path where PDF will be saved
 * @returns {Promise} - Resolves when PDF is generated
 */
function generateProfessionalPDF(professional, filePath) {
    return new Promise((resolve, reject) => {
        try {
            // Create a document
            const doc = new PDFDocument({ margin: 50 });

            // Pipe to file
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header with gradient effect (simulated with rectangles)
            doc.rect(0, 0, doc.page.width, 120).fill('#6366f1');

            // Title
            doc.fontSize(28)
                .fillColor('#ffffff')
                .text('Professional Profile', 50, 40, { align: 'center' });

            doc.fontSize(12)
                .fillColor('#e0e7ff')
                .text('DialForHelp - Professional Details', 50, 75, { align: 'center' });

            // Reset position
            let yPosition = 150;

            // Professional Information Section
            doc.fontSize(18)
                .fillColor('#4338ca')
                .text('Personal Information', 50, yPosition);

            yPosition += 30;
            doc.fontSize(11).fillColor('#1f2937');

            // Helper function to add field
            const addField = (label, value) => {
                doc.font('Helvetica-Bold').text(label + ':', 50, yPosition);
                doc.font('Helvetica').text(value || 'N/A', 200, yPosition);
                yPosition += 25;
            };

            addField('Name', professional.name);
            addField('Email', professional.email || 'Not provided');
            addField('Phone', professional.phone);
            addField('NIC Number', professional.nicNumber);
            addField('District', professional.district);
            addField('Location', professional.location);

            yPosition += 10;

            // Professional Details Section
            doc.fontSize(18)
                .fillColor('#4338ca')
                .text('Professional Details', 50, yPosition);

            yPosition += 30;
            doc.fontSize(11).fillColor('#1f2937');

            addField('Service', professional.serviceId?.service || professional.service || 'N/A');
            addField('Experience', professional.experience + ' years');
            addField('Rating', professional.rating + ' / 5');
            addField('Total Jobs Completed', professional.totalJobs.toString());
            addField('Registration Method', professional.way.charAt(0).toUpperCase() + professional.way.slice(1));
            addField('Status', professional.status.charAt(0).toUpperCase() + professional.status.slice(1));

            // Account Credentials Section (if available)
            if (professional.username && professional.plainPassword) {
                yPosition += 10;

                doc.fontSize(18)
                    .fillColor('#4338ca')
                    .text('Account Credentials', 50, yPosition);

                yPosition += 30;
                doc.fontSize(11).fillColor('#1f2937');

                addField('Username', professional.username);
                addField('Password', professional.plainPassword);

                // Security notice
                yPosition += 5;
                doc.fontSize(9)
                    .fillColor('#dc2626')
                    .text('⚠ Important: Please keep these credentials secure. Change your password after first login.', 50, yPosition, {
                        width: 500,
                        align: 'left'
                    });
            }

            // Footer
            const footerY = doc.page.height - 80;
            doc.fontSize(9)
                .fillColor('#6b7280')
                .text('Generated on: ' + new Date().toLocaleString(), 50, footerY, { align: 'center' });

            doc.fontSize(8)
                .fillColor('#9ca3af')
                .text('DialForHelp - Professional Service Management System', 50, footerY + 20, { align: 'center' });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateProfessionalPDF };
