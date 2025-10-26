// Student Sphere Authentication Functions

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // Validate inputs
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }
  
  // Simulate login (in production, this would call Supabase)
  console.log('Login attempt:', { email });
  
  // Store user session (demo)
  localStorage.setItem('hustlehub_user', JSON.stringify({
    email: email,
    name: 'Demo User',
    loggedIn: true
  }));
  
  showToast('Login successful! Welcome back.', 'success');
  
  // Redirect to browse page after 1 second
  setTimeout(() => {
    window.location.href = 'browse.html';
  }, 1000);
}

/**
 * Handle signup form submission
 * @param {Event} event - Form submit event
 */
function handleSignup(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const university = document.getElementById('university').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validate inputs
  if (name.length < 2) {
    showToast('Please enter your full name', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  
  if (phone.length < 10) {
    showToast('Please enter a valid phone number', 'error');
    return;
  }
  
  if (!university) {
    showToast('Please select your university', 'error');
    return;
  }
  
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }
  
  // Simulate signup (in production, this would call Supabase)
  console.log('Signup attempt:', { name, email, phone, university });
  
  // Store user session (demo)
  localStorage.setItem('hustlehub_user', JSON.stringify({
    email: email,
    name: name,
    phone: phone,
    university: university,
    loggedIn: true
  }));
  
  showToast('Account created successfully! Welcome to Student Sphere.', 'success');
  
  // Redirect to browse page after 1 second
  setTimeout(() => {
    window.location.href = 'browse.html';
  }, 1000);
}

/**
 * Handle logout
 */
function handleLogout() {
  localStorage.removeItem('hustlehub_user');
  showToast('Logged out successfully', 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

/**
 * Check if user is logged in
 * @returns {Object|null} User object or null
 */
function getCurrentUser() {
  const userStr = localStorage.getItem('hustlehub_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

/**
 * Update navbar based on auth state
 */
function updateNavbarAuth() {
  const user = getCurrentUser();
  const authButtons = document.getElementById('authButtons');
  
  if (!authButtons) return;
  
  if (user) {
    authButtons.innerHTML = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
          ${user.name}
        </a>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="profile.html">Profile</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" onclick="handleLogout()">Logout</a></li>
        </ul>
      </li>
    `;
  } else {
    authButtons.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="login.html">Login</a>
      </li>
      <li class="nav-item">
        <a class="btn btn-light btn-sm ms-2" href="signup.html">Sign Up</a>
      </li>
    `;
  }
}

/**
 * Require authentication (redirect to login if not logged in)
 */
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to access this page', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    return false;
  }
  return true;
}
