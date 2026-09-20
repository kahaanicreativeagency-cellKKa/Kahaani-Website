const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
        console.log('[Supabase] Client initialized successfully.');
    } catch (err) {
        console.error('[Supabase] Initialization error:', err.message);
    }
} else {
    console.warn('[Supabase] SUPABASE_URL or SUPABASE_ANON_KEY is not set in .env.');
    console.warn('[Supabase] Running in offline mock mode. Enquiries will be logged and forwarded.');
}

/**
 * Check if Supabase client is active
 */
function isSupabaseConfigured() {
    return supabase !== null;
}

/**
 * Insert an enquiry record into Supabase
 * @param {Object} enquiry
 * @returns {Promise<{ data: Object|null, error: Object|null }>}
 */
async function insertEnquiry(enquiry) {
    if (!supabase) {
        return {
            data: {
                id: 'local-' + Date.now(),
                ...enquiry,
                created_at: new Date().toISOString(),
                mock: true,
            },
            error: null,
        };
    }

    try {
        const { data, error } = await supabase
            .from('enquiries')
            .insert([
                {
                    name: enquiry.name,
                    business_name: enquiry.business_name,
                    phone: enquiry.phone,
                    email: enquiry.email || null,
                    preferred_contact: enquiry.preferred_contact || 'WhatsApp',
                    services: enquiry.services,
                    message: enquiry.message || null,
                    status: enquiry.status || 'New',
                },
            ])
            .select()
            .single();

        return { data, error };
    } catch (err) {
        console.error('[Supabase] Exception during insert:', err.message);
        return { data: null, error: err };
    }
}

module.exports = {
    supabase,
    isSupabaseConfigured,
    insertEnquiry,
};

