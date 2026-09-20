const validator = require('validator');

/**
 * Middleware to validate and sanitize enquiry form submission
 */
function validateEnquiry(req, res, next) {
    const body = req.body || {};
    const errors = [];

    // 1. Honeypot Spam Check
    // If hidden fields are filled, silently pretend success or drop
    if (body._gotcha || body._honey || body.website_url_trap) {
        console.warn('[Security] Honeypot field triggered. Dropping spam submission silently.');
        return res.status(200).json({
            success: true,
            message: "Thanks! We've received your enquiry. We'll get back to you shortly.",
        });
    }

    // 2. Validate & Sanitize Name
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length < 2) {
        errors.push({ field: 'name', message: 'Please enter your full name (at least 2 characters).' });
    } else if (name.length > 100) {
        errors.push({ field: 'name', message: 'Name cannot exceed 100 characters.' });
    }

    // 3. Validate & Sanitize Business Name
    const businessName = typeof body.business_name === 'string' ? body.business_name.trim() : '';
    if (!businessName || businessName.length < 1) {
        errors.push({ field: 'business_name', message: 'Please enter your business or brand name.' });
    } else if (businessName.length > 150) {
        errors.push({ field: 'business_name', message: 'Business name cannot exceed 150 characters.' });
    }

    // 4. Validate & Sanitize Phone Number
    const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const digitsOnly = rawPhone.replace(/[^0-9]/g, '');
    if (!rawPhone || digitsOnly.length < 8 || digitsOnly.length > 15) {
        errors.push({ field: 'phone', message: 'Please enter a valid phone number (8 to 15 digits).' });
    }

    // 5. Validate Email (Optional, but if supplied must be a valid email)
    let email = null;
    if (body.email && typeof body.email === 'string' && body.email.trim().length > 0) {
        const trimmedEmail = body.email.trim();
        if (!validator.isEmail(trimmedEmail)) {
            errors.push({ field: 'email', message: 'Please enter a valid email address.' });
        } else {
            email = validator.normalizeEmail(trimmedEmail);
        }
    }

    // 6. Validate Preferred Contact Method
    let preferredContact = 'WhatsApp';
    if (body.preferred_contact && typeof body.preferred_contact === 'string') {
        const pref = body.preferred_contact.trim();
        if (['WhatsApp', 'Phone Call', 'Email'].includes(pref)) {
            preferredContact = pref;
        }
    }

    // 7. Validate Services (must have at least one service selected)
    let services = [];
    if (Array.isArray(body.services)) {
        services = body.services.filter(s => typeof s === 'string' && s.trim().length > 0);
    } else if (typeof body.services === 'string' && body.services.trim().length > 0) {
        // Handle comma-separated or single string
        services = body.services.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (services.length === 0) {
        errors.push({ field: 'services', message: 'Please select at least one service.' });
    }

    // 8. Validate Requirements / Message (Optional, max 2000 chars)
    let message = '';
    if (body.requirements || body.message) {
        const rawMsg = (body.requirements || body.message || '');
        if (typeof rawMsg === 'string') {
            message = rawMsg.trim().slice(0, 2000);
        }
    }

    // If validation fails, return 400 Bad Request
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors[0].message,
            errors: errors,
        });
    }

    // Attach sanitized data to request object
    req.cleanData = {
        name: validator.escape(name),
        business_name: validator.escape(businessName),
        phone: rawPhone,
        email: email,
        preferred_contact: preferredContact,
        services: services,
        message: message,
        status: 'New',
    };

    next();
}

module.exports = {
    validateEnquiry,
};

