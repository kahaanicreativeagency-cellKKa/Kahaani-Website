const { insertEnquiry } = require('../config/supabase');
const { sendEnquiryNotification } = require('../config/mailer');
const { forwardToFormspree } = require('../services/formspreeService');

/**
 * Handle new enquiry submission
 * POST /api/enquiries
 */
async function handleCreateEnquiry(req, res, next) {
    try {
        const cleanData = req.cleanData;

        console.log(`[Enquiry] Processing new submission for: "${cleanData.business_name}" (${cleanData.name})`);

        // 1. Persist to Supabase database
        const { data: dbRecord, error: dbError } = await insertEnquiry(cleanData);
        if (dbError) {
            console.error('[Enquiry] Database persistence error:', dbError.message);
            // Even if DB has a hiccup, we continue so the lead isn't lost to the user
        } else {
            console.log(`[Enquiry] Successfully saved to Supabase (ID: ${dbRecord?.id || 'simulated'}, Status: ${cleanData.status})`);
        }

        // 2. Forward to Formspree dashboard so all entries are visible there
        forwardToFormspree(cleanData).catch(err => {
            console.error('[Enquiry] Formspree background forwarding error:', err.message);
        });

        // 3. Dispatch Email Notification (Nodemailer / SMTP)
        sendEnquiryNotification(cleanData).catch(err => {
            console.error('[Enquiry] Background email notification error:', err.message);
        });

        // 4. Return success response to the client
        return res.status(201).json({
            success: true,
            message: "Thanks! We've received your enquiry. We'll get back to you shortly.",
            id: dbRecord?.id || 'received',
            status: cleanData.status,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Health check endpoint
 * GET /api/health
 */
function handleHealthCheck(req, res) {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: 'Kahaani Website Backend API',
    });
}

module.exports = {
    handleCreateEnquiry,
    handleHealthCheck,
};

