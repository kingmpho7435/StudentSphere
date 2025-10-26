// Student Sphere Utility Functions

/**
 * Format price in South African Rand
 * @param {number} amount - The price amount
 * @returns {string} Formatted price string
 */
function formatPrice(amount) {
  return `R${Math.round(amount)}`;
}

/**
 * Contact seller via WhatsApp
 * @param {string} phone - Phone number (with country code)
 * @param {string} serviceName - Name of the service
 */
function contactViaWhatsApp(phone, serviceName) {
  const message = encodeURIComponent(`Hi! I'm interested in your service: ${serviceName}`);
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info, warning)
 */
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  
  const toast = document.createElement('div');
  toast.className = `toast-custom alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : type} alert-dismissible fade show`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 150);
  }, 4000);
}

/**
 * Get payment method icon HTML
 * @param {string} method - Payment method (Cash, EFT, Card)
 * @returns {string} Icon HTML
 */
function getPaymentIcon(method) {
  const icons = {
    'Cash': '<i class="bi bi-cash"></i>',
    'EFT': '<i class="bi bi-bank"></i>',
    'Card': '<i class="bi bi-credit-card"></i>'
  };
  return icons[method] || '';
}

/**
 * Get category badge class
 * @param {string} category - Service category
 * @returns {string} Badge class name
 */
function getCategoryBadgeClass(category) {
  const classes = {
    'tutoring': 'badge-tutoring',
    'tech': 'badge-tech',
    'beauty': 'badge-beauty',
    'food': 'badge-food',
    'transport': 'badge-transport'
  };
  return classes[category] || 'bg-secondary';
}

/**
 * Render star rating
 * @param {number} rating - Rating value (0-5)
 * @returns {string} Star rating HTML
 */
function renderStarRating(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<i class="bi bi-star-fill star-filled"></i>';
    } else {
      stars += '<i class="bi bi-star star-empty"></i>';
    }
  }
  return stars;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get URL parameter
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value
 */
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show loading spinner
 * @param {string} containerId - Container element ID
 */
function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-custom mx-auto mb-3"></div>
        <p class="text-muted">Loading...</p>
      </div>
    `;
  }
}

/**
 * Show empty state
 * @param {string} containerId - Container element ID
 * @param {string} message - Message to display
 */
function showEmptyState(containerId, message = 'No items found') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-inbox" style="font-size: 4rem; color: #dee2e6;"></i>
        <p class="text-muted mt-3 fs-5">${message}</p>
      </div>
    `;
  }
}

/**
 * Format date to relative time (e.g., "2 weeks ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
