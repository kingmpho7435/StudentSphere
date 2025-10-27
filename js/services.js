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
            <img src="${service.sellerAvatar}" alt="${service.sellerName}" 
                 class="rounded-circle" width="24" height="24">
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
 * Load and display services with optional filters
 * @param {Object} filters - Filter options (search, university, category)
 */
function loadServices(filters = {}) {
  const container = document.getElementById('servicesContainer');
  
  if (!container) return;
  
  // Filter services
  let filteredServices = demoServices.filter(service => {
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
  
  // Display results
  if (filteredServices.length === 0) {
    showEmptyState('servicesContainer', 'No services found. Try adjusting your filters.');
  } else {
    container.innerHTML = `
      <div class="row">
        ${filteredServices.map(service => createServiceCard(service)).join('')}
      </div>
    `;
  }
}

/**
 * Get service by ID
 * @param {string} id - Service ID
 * @returns {Object|null} Service object or null
 */
function getServiceById(id) {
  return demoServices.find(service => service.id === id) || null;
}

/**
 * Load featured services (first 3 services)
 */
function loadFeaturedServices() {
  const container = document.getElementById('featuredServicesContainer');
  if (!container) return;
  
  const featured = demoServices.slice(0, 3);
  container.innerHTML = `
    <div class="row">
      ${featured.map(service => createServiceCard(service)).join('')}
    </div>
  `;
}

/**
 * Load more services (exclude current service)
 * @param {string} excludeId - Service ID to exclude
 */
function loadMoreServices(excludeId) {
  const container = document.getElementById('moreServicesContainer');
  if (!container) return;
  
  const moreServices = demoServices
    .filter(service => service.id !== excludeId)
    .slice(0, 3);
  
  container.innerHTML = `
    <div class="row">
      ${moreServices.map(service => createServiceCard(service)).join('')}
    </div>
  `;
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
