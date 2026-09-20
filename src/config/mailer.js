const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = process.env.SMTP_USER;
const rawPass = process.env.SMTP_PASS || '';
const smtpPass = rawPass.replace(/\s+/g, '');
const smtpFrom = process.env.SMTP_FROM || (smtpUser ? `"Kahaani Website" <${smtpUser}>` : '"Kahaani Website" <no-reply@kahaani.in>');
const notificationTo = process.env.KAHAANI_NOTIFICATION_EMAIL || smtpUser || 'chitrakavi@kahaani.in';

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
    try {
        const transportConfig = smtpHost === 'smtp.gmail.com'
            ? {
                service: 'gmail',
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            }
            : {
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            };

        transporter = nodemailer.createTransport(transportConfig);
        console.log('[Mailer] SMTP Transporter configured for:', smtpHost);
    } catch (err) {
        console.error('[Mailer] Error creating transporter:', err.message);
    }
} else {
    console.warn('[Mailer] SMTP credentials not set. Notifications will be logged to terminal in Dev Mode.');
}

/**
 * Format phone number for WhatsApp direct link
 * @param {string} phone
 * @returns {string}
 */
function cleanPhoneForWhatsApp(phone) {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length === 10) {
        return '91' + cleaned;
    }
    return cleaned;
}

/**
 * Send an email notification for a new client enquiry
 * @param {Object} enquiry
 * @returns {Promise<{ success: boolean, info?: any, error?: any }>}
 */
async function sendEnquiryNotification(enquiry) {
    const servicesList = Array.isArray(enquiry.services)
        ? enquiry.services.map(s => `<li style="padding: 4px 0; color: #333;"><strong>${s}</strong></li>`).join('')
        : `<li style="padding: 4px 0; color: #333;"><strong>${enquiry.services}</strong></li>`;

    const waPhone = cleanPhoneForWhatsApp(enquiry.phone);
    const waLink = `https://wa.me/${waPhone}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e1e4ea; }
            .header { background: #12151c; color: #ffffff; padding: 24px 30px; text-align: left; border-bottom: 3px solid #e65c00; }
            .header h1 { margin: 0 0 4px 0; font-size: 20px; letter-spacing: -0.02em; color: #ffffff; }
            .header p { margin: 0; font-size: 13px; color: #a1a6b4; }
            .content { padding: 30px; }
            .badge { display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: 700; border-radius: 20px; background: #fff2ea; color: #e65c00; margin-bottom: 20px; text-transform: uppercase; }
            .field-group { margin-bottom: 16px; border-bottom: 1px solid #f0f2f5; padding-bottom: 12px; }
            .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px; font-weight: 600; }
            .field-value { font-size: 16px; color: #111827; font-weight: 600; }
            .services-box { background: #fafbfc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 16px; }
            .message-box { background: #f9fafb; border-left: 4px solid #e65c00; padding: 14px 18px; border-radius: 4px; margin-top: 16px; color: #374151; font-size: 15px; line-height: 1.5; }
            .cta-buttons { margin-top: 24px; text-align: center; }
            .btn { display: inline-block; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; margin: 4px; }
            .btn-wa { background: #25D366; color: #ffffff !important; }
            .btn-call { background: #111827; color: #ffffff !important; }
            .footer { background: #fafbfc; padding: 16px 30px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Kahaani. — New Client Enquiry</h1>
                <p>Received via kahaani website contact form</p>
            </div>
            <div class="content">
                <span class="badge">Status: New Lead</span>

                <div class="field-group">
                    <div class="field-label">Client Name</div>
                    <div class="field-value">${enquiry.name}</div>
                </div>

                <div class="field-group">
                    <div class="field-label">Business / Brand Name</div>
                    <div class="field-value">${enquiry.business_name}</div>
                </div>

                <div class="field-group">
                    <div class="field-label">Phone Number</div>
                    <div class="field-value">
                        <a href="tel:${enquiry.phone}" style="color: #111827; text-decoration: none;">${enquiry.phone}</a>
                    </div>
                </div>

                ${enquiry.email ? `
                <div class="field-group">
                    <div class="field-label">Email</div>
                    <div class="field-value"><a href="mailto:${enquiry.email}" style="color: #e65c00;">${enquiry.email}</a></div>
                </div>
                ` : ''}

                <div class="field-group">
                    <div class="field-label">Preferred Contact Method</div>
                    <div class="field-value">${enquiry.preferred_contact || 'WhatsApp'}</div>
                </div>

                <div class="services-box">
                    <div class="field-label">Selected Services</div>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                        ${servicesList}
                    </ul>
                </div>

                ${enquiry.message ? `
                <div style="margin-top: 20px;">
                    <div class="field-label">Requirements / Notes</div>
                    <div class="message-box">${enquiry.message.replace(/\n/g, '<br>')}</div>
                </div>
                ` : ''}

                <div class="cta-buttons">
                    <a href="${waLink}" class="btn btn-wa" target="_blank">Chat on WhatsApp</a>
                    <a href="tel:${enquiry.phone}" class="btn btn-call">Call Client</a>
                </div>
            </div>
            <div class="footer">
                Kahaani — Your Brand. Your Story. • Built for Indian Brands
            </div>
        </div>
    </body>
    </html>
    `;

    if (!transporter) {
        console.log('\n================== [DEV MODE: EMAIL NOTIFICATION] ==================');
        console.log(`To: ${notificationTo}`);
        console.log(`Subject: ✨ New Enquiry: ${enquiry.business_name} (${enquiry.name})`);
        console.log(`Phone: ${enquiry.phone} (Preferred: ${enquiry.preferred_contact})`);
        console.log(`Email: ${enquiry.email || 'Not provided'}`);
        console.log(`Services: ${Array.isArray(enquiry.services) ? enquiry.services.join(', ') : enquiry.services}`);
        console.log(`Requirements: ${enquiry.message || 'None'}`);
        console.log('====================================================================\n');
        return { success: true, simulated: true };
    }

    try {
        const info = await transporter.sendMail({
            from: smtpFrom,
            to: notificationTo,
            subject: `✨ New Enquiry: ${enquiry.business_name} (${enquiry.name})`,
            html: htmlContent,
        });

        console.log('[Mailer] Notification email sent successfully:', info.messageId);
        return { success: true, info };
    } catch (err) {
        console.error('[Mailer] Failed to send email:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    sendEnquiryNotification,
};

