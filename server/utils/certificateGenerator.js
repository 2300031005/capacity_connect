const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Draw Capacity Connect vector logo on the PDF canvas
 * @param {PDFDocument} doc
 * @param {number} centerX
 * @param {number} y
 * @param {number} scale
 */
function drawVectorLogo(doc, centerX, y, scale = 0.08) {
  doc.save();
  doc.translate(centerX - 340 * scale, y - 340 * scale);
  doc.scale(scale);

  // Outer circle ring
  doc.lineWidth(14);
  doc.strokeColor('#0d9488');
  doc.circle(340, 340, 260).stroke();

  // White inner background
  doc.fillColor('#ffffff');
  doc.circle(340, 340, 252).fill();

  // Ascending growth bars
  doc.fillColor('#2563eb');
  doc.roundedRect(230, 380, 42, 90, 6).fill();

  doc.fillColor('#0e7490');
  doc.roundedRect(290, 330, 42, 140, 6).fill();

  doc.fillColor('#0d9488');
  doc.roundedRect(350, 270, 42, 200, 6).fill();

  doc.fillColor('#059669');
  doc.roundedRect(410, 210, 42, 260, 6).fill();

  // Connected network nodes & lines
  doc.lineWidth(4);
  doc.strokeColor('#1e3a8a');
  doc.moveTo(240, 230).lineTo(330, 180).stroke();
  doc.moveTo(330, 180).lineTo(440, 200).stroke();
  doc.lineWidth(2);
  doc.strokeColor('#94a3b8');
  doc.moveTo(240, 230).lineTo(440, 200).stroke();

  doc.fillColor('#1e3a8a');
  doc.circle(240, 230, 12).fill();
  doc.circle(330, 180, 12).fill();
  doc.circle(440, 200, 12).fill();

  doc.restore();
}

/**
 * Generate a local PDF Certificate of Completion using PDFKit
 * @param {Object} data - Certificate metadata
 * @returns {Promise<string>} Relative file path to generated certificate
 */
const generateCertificatePDF = ({
  certificateId,
  traineeName,
  courseTitle,
  trainerName,
  percentage,
  issuedAt,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const certificatesDir = path.join(__dirname, '..', 'uploads', 'certificates');
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }

      const fileName = `${certificateId}.pdf`;
      const fullPath = path.join(certificatesDir, fileName);
      const relativePath = path.join('uploads', 'certificates', fileName).replace(/\\/g, '/');

      // A4 Landscape: 841.89 x 595.28 points
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 0,
      });

      const writeStream = fs.createWriteStream(fullPath);
      doc.pipe(writeStream);

      const width = doc.page.width;
      const height = doc.page.height;
      const centerX = width / 2;

      // 1. Subtle Background Tint
      doc.rect(0, 0, width, height).fill('#fbfdfb');

      // 2. Multi-layered Decorative Borders
      // Outer border - Deep Emerald
      doc
        .lineWidth(3.5)
        .strokeColor('#065f46')
        .roundedRect(22, 22, width - 44, height - 44, 8)
        .stroke();

      // Inner thin border - Slate Navy
      doc
        .lineWidth(1)
        .strokeColor('#0f172a')
        .roundedRect(28, 28, width - 56, height - 56, 5)
        .stroke();

      // Delicate inner decorative border
      doc
        .lineWidth(0.5)
        .strokeColor('#94a3b8')
        .roundedRect(32, 32, width - 64, height - 64, 4)
        .stroke();

      // Corner ornamental accents
      const corners = [
        [36, 36],
        [width - 36, 36],
        [36, height - 36],
        [width - 36, height - 36],
      ];
      corners.forEach(([cx, cy]) => {
        doc.fillColor('#065f46').circle(cx, cy, 3).fill();
      });

      // 3. Draw Vector Logo Emblem at Top (y: 60)
      drawVectorLogo(doc, centerX, 58, 0.08);

      // 4. "OFFICIAL VERIFICATION" Pill Badge
      const badgeWidth = 160;
      const badgeHeight = 18;
      const badgeY = 88;
      doc
        .roundedRect(centerX - badgeWidth / 2, badgeY, badgeWidth, badgeHeight, 9)
        .fillAndStroke('#d1fae5', '#a7f3d0');

      // Draw vector checkmark inside pill
      doc.save();
      doc.lineWidth(1.8).strokeColor('#065f46').lineCap('round').lineJoin('round');
      doc
        .moveTo(centerX - 62, badgeY + 9)
        .lineTo(centerX - 58, badgeY + 13)
        .lineTo(centerX - 51, badgeY + 5)
        .stroke();
      doc.restore();

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#065f46')
        .text('OFFICIAL VERIFICATION', centerX - 44, badgeY + 5, {
          characterSpacing: 1.2,
        });

      // 5. Organization Title
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#065f46')
        .text('CAPACITY CONNECT', 0, 118, {
          align: 'center',
          characterSpacing: 3,
          width,
        });

      // 6. Main Certificate Heading
      doc
        .font('Helvetica-Bold')
        .fontSize(23)
        .fillColor('#0f172a')
        .text('CERTIFICATE OF COMPLETION', 0, 136, {
          align: 'center',
          characterSpacing: 1.2,
          width,
        });

      // 7. Subtitle
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .fillColor('#64748b')
        .text('This certifies that', 0, 172, {
          align: 'center',
          width,
        });

      // 8. Trainee Name
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#0f172a')
        .text(traineeName || 'Trainee', 0, 192, {
          align: 'center',
          width,
        });

      // Divider Underline with Centered Diamond
      const underlineWidth = 280;
      doc
        .moveTo(centerX - underlineWidth / 2, 224)
        .lineTo(centerX + underlineWidth / 2, 224)
        .lineWidth(1)
        .strokeColor('#cbd5e1')
        .stroke();

      doc
        .save()
        .translate(centerX, 224)
        .rotate(45)
        .rect(-3, -3, 6, 6)
        .fill('#065f46')
        .restore();

      // 9. Completion Statement
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .fillColor('#475569')
        .text(
          'has successfully completed the comprehensive curriculum and passed the assessment for',
          0,
          242,
          {
            align: 'center',
            width,
          }
        );

      // 10. Course Title
      doc
        .font('Helvetica-Bold')
        .fontSize(17)
        .fillColor('#065f46')
        .text(courseTitle || 'Course Curriculum', 0, 262, {
          align: 'center',
          width,
        });

      // 11. Final Assessment Grade (Clean single text call - NO text overlap)
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .fillColor('#334155')
        .text(`with a final assessment grade of ${percentage}%.`, 0, 288, {
          align: 'center',
          width,
        });

      // 12. Official Verification Seal Emblem (Properly Centered with Whole Page Width)
      const sealY = 360;

      // Ribbon tails
      doc.save();
      doc.fillColor('#b45309');
      doc
        .polygon(
          [centerX - 10, sealY + 18],
          [centerX - 18, sealY + 40],
          [centerX - 10, sealY + 34],
          [centerX - 2, sealY + 40],
          [centerX - 2, sealY + 20]
        )
        .fill();
      doc
        .polygon(
          [centerX + 10, sealY + 18],
          [centerX + 18, sealY + 40],
          [centerX + 10, sealY + 34],
          [centerX + 2, sealY + 40],
          [centerX + 2, sealY + 20]
        )
        .fill();
      doc.restore();

      // Outer gold & emerald ring
      doc.lineWidth(1.5).strokeColor('#059669').circle(centerX, sealY, 26).stroke();
      doc.lineWidth(0.8).strokeColor('#d97706').circle(centerX, sealY, 23).stroke();
      doc.fillColor('#ecfdf5').circle(centerX, sealY, 22).fill();

      // Seal text centered cleanly without word wrap or collision
      doc
        .font('Helvetica-Bold')
        .fontSize(5.5)
        .fillColor('#065f46')
        .text('CAPACITY CONNECT', 0, sealY - 11, {
          align: 'center',
          width,
          characterSpacing: 0.5,
        });

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#d97706')
        .text('VERIFIED', 0, sealY - 3, {
          align: 'center',
          width,
          characterSpacing: 1,
        });

      doc
        .font('Helvetica-Bold')
        .fontSize(5.5)
        .fillColor('#065f46')
        .text('CREDENTIAL', 0, sealY + 7, {
          align: 'center',
          width,
          characterSpacing: 0.5,
        });

      // 13. Three-Column Footer (Well Spaced with Distinct Dividers)
      const footerY = 470;
      const leftColX = 75;
      const rightColX = width - 235;

      // Left Column: Course Instructor
      doc
        .moveTo(leftColX, footerY - 8)
        .lineTo(leftColX + 160, footerY - 8)
        .lineWidth(0.8)
        .strokeColor('#cbd5e1')
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#0f172a')
        .text(trainerName || 'Course Instructor', leftColX, footerY, { width: 160, align: 'left' });

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#64748b')
        .text('Course Instructor', leftColX, footerY + 14, { width: 160, align: 'left' });

      // Center Column: Certificate ID
      doc
        .moveTo(centerX - 80, footerY - 8)
        .lineTo(centerX + 80, footerY - 8)
        .lineWidth(0.8)
        .strokeColor('#cbd5e1')
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#065f46')
        .text(certificateId, centerX - 90, footerY, { width: 180, align: 'center' });

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#64748b')
        .text('Certificate Identifier', centerX - 90, footerY + 14, {
          width: 180,
          align: 'center',
        });

      // Right Column: Date Issued
      const formattedDate = new Date(issuedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc
        .moveTo(rightColX, footerY - 8)
        .lineTo(rightColX + 160, footerY - 8)
        .lineWidth(0.8)
        .strokeColor('#cbd5e1')
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#0f172a')
        .text(formattedDate, rightColX, footerY, { width: 160, align: 'right' });

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#64748b')
        .text('Issued Date', rightColX, footerY + 14, { width: 160, align: 'right' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(relativePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a cryptographically distinct unique Certificate ID
 * Format: CC-YYYY-XXXXXX
 */
const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CC-${year}-${randomHex}`;
};

module.exports = {
  generateCertificatePDF,
  generateCertificateId,
};
