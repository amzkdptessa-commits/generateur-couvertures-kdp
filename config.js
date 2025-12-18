/* ===========================
   config.js  (frontend only)
   =========================== */

// ✅ NOUVELLES CREDENTIALS SUPABASE (projet gabaritkdp actif)
window.SUPABASE_URL = 'https://kucwdaicplajljpfkzhu.supabase.co';
window.SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1Y3dkYWljcGxhamxqcGZremh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzMxMjQsImV4cCI6MjA3NzUwOTEyNH0.0IDHysD84_0ghjb-a4K0UkNrJbzdQBKUjm5mQbSfro8';

window.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Buckets & paths
window.BUCKETS = {
  previews: 'previews',     // public
  deliveries: 'deliveries'  // private
};
window.previewPath = (listingId, filename = 'cover.jpg') => `previews/${listingId}/${filename}`;
window.deliveryPath = (orderId, filename = 'file.zip') => `deliveries/${orderId}/${filename}`;

// -------- Auth helpers --------
window.auth = {
  signInEmailOtp: async (email) => sb.auth.signInWithOtp({ email }),
  signOut: async () => sb.auth.signOut(),
  getSession: async () => (await sb.auth.getSession()).data.session,
  getUser: async () => (await sb.auth.getUser()).data.user,
  requireUserId: async () => {
    const { data } = await sb.auth.getUser();
    if (!data?.user) throw new Error('Not authenticated');
    return data.user.id;
  }
};

// -------- Storage helpers (previews) --------
window.storage = {
  uploadPreview: async (listingId, file, filename = 'cover.jpg') => {
    const path = window.previewPath(listingId, filename);
    const { error } = await sb.storage
      .from(BUCKETS.previews)
      .upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type || 'image/jpeg' });
    if (error) throw error;
    const { data } = sb.storage.from(BUCKETS.previews).getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  },
  getPreviewUrl: (listingId, filename = 'cover.jpg') => {
    const path = window.previewPath(listingId, filename);
    return sb.storage.from(BUCKETS.previews).getPublicUrl(path).data.publicUrl;
  }
};

// -------- DB helpers (alignés avec tes pages) --------
// Tes pages lisent: id, title, description, price, kdp_format, licence_type, status
// et filtrent status='published'. (Marketplace & Listing)  ← important
window.db = {
  listPublishedListings: async ({ search = '', limit = 60 } = {}) => {
    let q = sb.from('listings')
      .select('id, title, description, price, kdp_format, licence_type, status')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (search) q = q.ilike('title', `%${search}%`);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  getListing: async (id) => {
    const { data, error } = await sb
      .from('listings')
      .select('id, seller_id, title, description, price, kdp_format, licence_type, status')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Respecte les noms de colonnes actuels (price en euros, pas price_cents)
  createListing: async ({ title, description, price, licence_type = 'non-exclusive', kdp_format, status = 'draft' }) => {
    const payload = {
      title: title?.trim(),
      description: description?.trim(),
      price: Number(price) || 0,           // en € pour coller à tes pages actuelles
      licence_type,                        // orthographe FR pour matcher tes fichiers
      kdp_format: kdp_format || null,
      status                               // 'draft' puis 'published' quand prêt
    };
    const { data, error } = await sb.from('listings').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  publishListing: async (listingId) => {
    const { error } = await sb.from('listings').update({ status: 'published' }).eq('id', listingId);
    if (error) throw error;
    return true;
  }
};

// -------- Petit utilitaire global --------
window.toastError = (e) => {
  console.error(e);
  alert(e?.message || 'An unexpected error occurred.');
};
