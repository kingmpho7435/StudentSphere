// Student Sphere Service Functions

/**
 * Create HTML for a service card
 * @param {Object} service - Service object
 * @returns {string} HTML string for service card
 */
function createServiceCard(service) {
  const badgeClass = getCategoryBadgeClass(service.category);
  const verifiedIcon = service.verified ? '<i class="bi bi-patch-check-fill verified-badge ms-1"></i>' : '';

  return `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100 shadow-sm card-hover">
        <div class="position-relative">
          <img src="${service.imageUrl}" class="card-img-top service-card-img" alt="${service.title}">
          <span class="badge ${badgeClass} position-absolute top-0 start-0 m-2">${capitalize(service.category)}</span>
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
            <img src="${service.sellerAvatar}" alt="${service.sellerName}" class="rounded-circle" width="24" height="24">
            <small>${service.sellerName}</small>
            ${verifiedIcon}
          </div>
          
          <div class="d-flex flex-wrap gap-2 mb-3">
            ${service.paymentMethods.map(method => `
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
 * Get service by ID from demo services
 * @param {string} id 
 * @returns {Object|null}
 */
function getServiceById(id) {
  return demoServices.find(service => service.id === id) || null;
}

/**
 * Load and display services with optional filters
 * @param {Object} filters 
 */
async function loadServices(filters = {}) {
  const container = document.getElementById('servicesContainer');
  if (!container) return;

  try {
    let allServices = [...demoServices];

    // Fetch real services from Supabase
    const { data: realServices, error } = await supabase
      .from('services')
      .select(`
        *,
        profiles(full_name, avatar_url)
      `);

    if (error) console.error('Supabase fetch error:', error.message);

    if (realServices && realServices.length > 0) {
      const mappedServices = realServices.map(service => {
        const profile = service.profiles || {};
        let initials = '';
        if (profile.full_name) {
          const parts = profile.full_name.split(' ');
          initials = parts.map(p => p[0]).join('').toUpperCase();
        }

        return {
          id: service.id,
          title: service.title || 'Untitled Service',
          description: service.description || 'No description provided',
          category: service.category || 'General',
          price: service.price || 0,
          location: service.university || service.location || 'Any University',
          imageUrl: service.image_url || 'images/default-service.jpg',
          sellerAvatar: profile.avatar_url
            ? profile.avatar_url
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || initials)}&background=random`,
          sellerName: profile.full_name || 'Anonymous',
          verified: service.verified || false,
          paymentMethods: service.payment_methods || ['Cash']
        };
      });

      allServices = [...mappedServices, ...demoServices];
    }

    // Apply filters
    const filteredServices = allServices.filter(service => {
      const matchesSearch = !filters.search ||
        service.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        service.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesUniversity = !filters.university ||
        filters.university === 'all' ||
        service.location === filters.university;

      const matchesCategory = !filters.category ||
        filters.category === 'all' ||
        service.category === filters.category;

      return matchesSearch && matchesUniversity && matchesCategory;
    });

    if (filteredServices.length === 0) {
      showEmptyState('servicesContainer', 'No services found. Try adjusting your filters.');
    } else {
      container.innerHTML = `<div class="row">${filteredServices.map(createServiceCard).join('')}</div>`;
    }

  } catch (err) {
    console.error('Error loading services:', err);
    showEmptyState('servicesContainer', 'Failed to load services.');
  }
}

/**
 * Load more services excluding a specific service
 * @param {string} excludeId 
 */
async function loadMoreServices(excludeId) {
  const container = document.getElementById('moreServicesContainer');
  if (!container) return;

  try {
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        profiles(full_name, avatar_url)
      `)
      .neq('id', excludeId)
      .limit(3);

    if (error) throw error;

    if (!services || services.length === 0) {
      container.innerHTML = '<p class="text-muted">No more services available.</p>';
      return;
    }

    container.innerHTML = services.map(service => {
      const profile = service.profiles || {};
      let initials = '';
      if (profile.full_name) {
        const parts = profile.full_name.split(' ');
        initials = parts.map(p => p[0]).join('').toUpperCase();
      }
      const sellerAvatar = profile.avatar_url
        ? profile.avatar_url
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || initials)}&background=random`;
      const sellerName = profile.full_name || 'Anonymous';

      return `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm">
            <img src="${service.image_url || 'images/default-service.jpg'}" class="card-img-top" alt="${service.title}">
            <div class="card-body">
              <h5 class="card-title">${service.title}</h5>
              <p class="card-text text-muted">${service.description}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold text-primary">R${service.price}</span>
                <a href="service-detail.html?id=${service.id}" class="btn btn-sm btn-outline-primary">View</a>
              </div>
              <div class="d-flex align-items-center gap-2 mt-2">
                <img src="${sellerAvatar}" class="rounded-circle" width="24" height="24">
                <small>${sellerName}</small>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading more services:', err);
    container.innerHTML = '<p class="text-danger">Failed to load more services.</p>';
  }
}

/**
 * Initialize filters
 */
function initializeFilters() {
  const searchInput = document.getElementById('searchInput');
  const universitySelect = document.getElementById('universitySelect');
  const categorySelect = document.getElementById('categorySelect');

  const applyFilters = async () => {
    const filters = {
      search: searchInput?.value || '',
      university: universitySelect?.value || '',
      category: categorySelect?.value || ''
    };
    await loadServices(filters);
  };

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (universitySelect) universitySelect.addEventListener('change', applyFilters);
  if (categorySelect) categorySelect.addEventListener('change', applyFilters);
}

/**
 * Populate university dropdown
 */
function populateUniversityDropdown() {
  const select = document.getElementById('universitySelect');
  if (!select) return;

  select.innerHTML = '<option value="all">All Universities</option>';
  universities.forEach(uni => {
    const option = document.createElement('option');
    option.value = uni;
    option.textContent = uni;
    select.appendChild(option);
  });
}

/**
 * Populate category dropdown
 */
function populateCategoryDropdown() {
  const select = document.getElementById('categorySelect');
  if (!select) return;

  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.value;
    option.textContent = cat.label;
    select.appendChild(option);
  });
}

// Initialize page after DOM loads
document.addEventListener('DOMContentLoaded', async function() {
  populateUniversityDropdown();
  populateCategoryDropdown();

  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam && document.getElementById('categorySelect')) {
    document.getElementById('categorySelect').value = categoryParam;
  }

  await loadServices();
  initializeFilters();
  updateNavbarAuth();
  updateResultsCount();
});
