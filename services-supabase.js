// Student Sphere Service Functions - Supabase Version

/**
 * Create HTML for a service card
 * @param {Object} service - Service object from Supabase
 * @returns {string} HTML string for service card
 */
async function createServiceCard(service) {
  const badgeClass = getCategoryBadgeClass(service.category);
  const verifiedIcon = service.profiles?.is_verified ? 
    '<i class="bi bi-patch-check-fill verified-badge ms-1"></i>' : '';
  
  // Handle seller data (could be from profiles join or separate)
  const sellerName = service.profiles?.full_name || service.seller_name || 'Unknown';
  const sellerAvatar = service.profiles?.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=667eea&color=fff`;
  
  return `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100 shadow-sm card-hover">
        <div class="position-relative">
          <img src="${service.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop'}" 
               class="card-img-top service-card-img" alt="${service.title}">
          <span class="badge ${badgeClass} position-absolute top-0 start-0 m-2">
            ${capitalize(service.category)}
          </span>
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title line-clamp-2 mb-2">${service.title}</h5>
          <p class="card-text text-muted line-clamp-3 mb-3">${service.description}</p>
          
          <div class="mb-2">
            <small class="text-muted">
              <i class="bi bi-geo-alt"></i> ${service.location}
            </small>
          </div>
          
          <div class="d-flex align-items-center gap-2 mb-3">
            <img src="${sellerAvatar}" alt="${sellerName}" 
                 class="rounded-circle" width="24" height="24">
            <small>${sellerName}</small>
            ${verifiedIcon}
          </div>
          
          <div class="d-flex flex-wrap gap-2 mb-3">
            ${service.payment_methods.map(method => `
              <span class="payment-badge">
                ${getPaymentIcon(method)} ${method}
              </span>
            `).join('')}
          </div>
          
          <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
            <div class="price-display">${formatPrice(service.price)}</div>
            <a href="service-detail.html?id=${service.id}" class="btn btn-primary btn-sm btn-hover">
              View Details
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Load and display services from Supabase with optional filters
 * @param {Object} filters - Filter options (search, university, category)
 */
async function loadServices(filters = {}) {
  const container = document.getElementById('servicesContainer');
  const resultsCount = document.getElementById('resultsCount');
  
  if (!container) return;
  
  try {
    // Show loading state
    showLoading('servicesContainer');
    
    // Build query
    let query = supabase
      .from('services')
      .select(`
        *,
        profiles:user_id (
          full_name,
          university,
          avatar_url,
          rating,
          is_verified
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    // Apply search filter
    if (filters.search && filters.search.trim()) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    // Apply university filter
    if (filters.university && filters.university !== 'all') {
      query = query.eq('university', filters.university);
    }
    
    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    
    // Execute query
    const { data: services, error } = await query;
    
    if (error) throw error;
    
    // Display results
    if (services.length === 0) {
      showEmptyState('servicesContainer', 'No services found matching your criteria. Try adjusting your filters.');
    } else {
      // Create all service cards
      const serviceCards = await Promise.all(services.map(service => createServiceCard(service)));
      container.innerHTML = `
        <div class="row">
          ${serviceCards.join('')}
        </div>
      `;
    }
    
    // Update results count
    if (resultsCount) {
      resultsCount.textContent = `${services.length} service${services.length !== 1 ? 's' : ''} found`;
    }
    
  } catch (error) {
    console.error('Error loading services:', error);
    showEmptyState('servicesContainer', 'Error loading services. Please try again.');
    showToast('Error loading services', 'danger');
  }
}

/**
 * Get service by ID from Supabase
 * @param {string} id - Service UUID
 * @returns {Object|null} Service object or null
 */
async function getServiceById(id) {
  try {
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          university,
          avatar_url,
          rating,
          total_reviews,
          is_verified,
          phone
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Increment view count
    await incrementServiceViews(id);
    
    return service;
    
  } catch (error) {
    console.error('Error getting service:', error);
    return null;
  }
}

/**
 * Load featured services (latest 3 active services)
 */
async function loadFeaturedServices() {
  const container = document.getElementById('featuredServicesContainer');
  if (!container) return;
  
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) throw error;
    
    container.innerHTML = `
      <div class="row">
        ${services.map(service => createServiceCard(service)).join('')}
      </div>
    `;
    
  } catch (error) {
    console.error('Error loading featured services:', error);
  }
}

/**
 * Load more services (exclude current service)
 * @param {string} excludeId - Service ID to exclude
 */
async function loadMoreServices(excludeId) {
  const container = document.getElementById('moreServicesContainer');
  if (!container) return;
  
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('is_active', true)
      .neq('id', excludeId)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) throw error;
    
    container.innerHTML = `
      <div class="row">
        ${services.map(service => createServiceCard(service)).join('')}
      </div>
    `;
    
  } catch (error) {
    console.error('Error loading more services:', error);
  }
}

/**
 * Create a new service
 * @param {Object} serviceData - Service data
 */
async function createService(serviceData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      showToast('Please login to create a service', 'warning');
      window.location.href = 'login.html';
      return null;
    }
    
    const { data, error } = await supabase
      .from('services')
      .insert([{
        user_id: user.id,
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        price: parseFloat(serviceData.price),
        university: serviceData.university,
        location: serviceData.location,
        image_url: serviceData.image_url,
        payment_methods: serviceData.payment_methods,
        is_active: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    showToast('Service created successfully!', 'success');
    
    // Redirect to service detail page
    setTimeout(() => {
      window.location.href = `service-detail.html?id=${data.id}`;
    }, 1500);
    
    return data;
    
  } catch (error) {
    console.error('Error creating service:', error);
    showToast(error.message || 'Error creating service', 'danger');
    return null;
  }
}

/**
 * Update a service
 * @param {string} serviceId - Service UUID
 * @param {Object} updates - Fields to update
 */
async function updateService(serviceId, updates) {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();
    
    if (error) throw error;
    
    showToast('Service updated successfully!', 'success');
    return data;
    
  } catch (error) {
    console.error('Error updating service:', error);
    showToast(error.message || 'Error updating service', 'danger');
    return null;
  }
}

/**
 * Delete a service
 * @param {string} serviceId - Service UUID
 */
async function deleteService(serviceId) {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
    
    if (error) throw error;
    
    showToast('Service deleted successfully!', 'success');
    return true;
    
  } catch (error) {
    console.error('Error deleting service:', error);
    showToast(error.message || 'Error deleting service', 'danger');
    return false;
  }
}

/**
 * Upload service image to Supabase Storage
 * @param {File} file - Image file
 */
async function uploadServiceImage(file) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Image must be less than 10MB');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('service-images')
      .upload(fileName, file);
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('service-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
    
  } catch (error) {
    console.error('Error uploading image:', error);
    showToast(error.message || 'Error uploading image', 'danger');
    throw error;
  }
}

/**
 * Increment service view count
 * @param {string} serviceId - Service UUID
 */
async function incrementServiceViews(serviceId) {
  try {
    await supabase.rpc('increment_service_views', { service_uuid: serviceId });
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
}

/**
 * Increment contact count when WhatsApp is clicked
 * @param {string} serviceId - Service UUID
 */
async function incrementContactCount(serviceId) {
  try {
    await supabase.rpc('increment_contact_count', { service_uuid: serviceId });
  } catch (error) {
    console.error('Error incrementing contact count:', error);
  }
}

/**
 * Get user's services
 * @param {string} userId - User UUID
 */
async function getUserServices(userId) {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return services;
    
  } catch (error) {
    console.error('Error getting user services:', error);
    return [];
  }
}

/**
 * Initialize service filters
 */
function initializeFilters() {
  const searchInput = document.getElementById('searchInput');
  const universitySelect = document.getElementById('universitySelect');
  const categorySelect = document.getElementById('categorySelect');
  
  const applyFilters = () => {
    const filters = {
      search: searchInput ? searchInput.value : '',
      university: universitySelect ? universitySelect.value : '',
      category: categorySelect ? categorySelect.value : ''
    };
    loadServices(filters);
  };
  
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  
  if (universitySelect) {
    universitySelect.addEventListener('change', applyFilters);
  }
  
  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilters);
  }
}

/**
 * Populate university dropdown from Supabase
 */
async function populateUniversityDropdown() {
  const select = document.getElementById('universitySelect');
  if (!select) return;
  
  try {
    const { data: universities, error } = await supabase
      .from('universities')
      .select('name')
      .order('name');
    
    if (error) throw error;
    
    select.innerHTML = '<option value="all">All Universities</option>';
    universities.forEach(uni => {
      const option = document.createElement('option');
      option.value = uni.name;
      option.textContent = uni.name;
      select.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error loading universities:', error);
    // Fallback to hardcoded list if Supabase fails
    select.innerHTML = '<option value="all">All Universities</option>';
  }
}

/**
 * Populate category dropdown from Supabase
 */
async function populateCategoryDropdown() {
  const select = document.getElementById('categorySelect');
  if (!select) return;
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    if (error) throw error;
    
    select.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error loading categories:', error);
    // Fallback to hardcoded list if Supabase fails
    select.innerHTML = '<option value="all">All Categories</option>';
  }
}
