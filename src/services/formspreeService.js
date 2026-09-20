/**
 * Forward enquiry data to Formspree endpoint so all submissions
 * are visible on the user's Formspree dashboard.
 */
async function forwardToFormspree(enquiryData) {
    const formspreeUrl = process.env.FORMSPREE_URL || 'https://formspree.io/f/xrpbbnyv';

    try {
        const payload = {
            name: enquiryData.name,
            business_name: enquiryData.business_name,
            phone: enquiryData.phone,
            email: enquiryData.email || 'not-provided@kahaani.in',
            preferred_contact: enquiryData.preferred_contact || 'WhatsApp',
            services: Array.isArray(enquiryData.services) ? enquiryData.services.join(', ') : enquiryData.services,
            requirements: enquiryData.message || 'None provided',
            status: enquiryData.status || 'New',
            submitted_at: new Date().toISOString(),
        };

        const response = await fetch(formspreeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            console.log('[Formspree] Enquiry successfully forwarded to Formspree dashboard.');
            return { success: true };
        } else {
            const errData = await response.json().catch(() => ({}));
            console.warn('[Formspree] Forwarding responded with non-200 status:', response.status, errData);
            return { success: false, status: response.status, details: errData };
        }
    } catch (err) {
        console.error('[Formspree] Error forwarding to Formspree:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    forwardToFormspree,
};

