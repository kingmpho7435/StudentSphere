// Student Sphere Authentication Functions - Supabase Version

/**
 * Handle signup form submission with Supabase
 */
async function handleSignup(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const university = document.getElementById('university').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const termsChecked = document.getElementById('terms')?.checked;
  
  // Validation
  if (!name || name.length < 2) {
    showToast('Please enter your full name', 'danger');
    return;
  }
  
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'danger');
    return;
  }
  
  // Validate phone number (remove spaces/dashes and check if at least 9 digits)
  const phoneDigits = phone.replace(/\D/g, ''); // Remove non-digits
  if (!phone || phoneDigits.length < 9) {
    showToast('Please enter a valid phone number (at least 9 digits)', 'danger');
    return;
  }
  
  if (!university) {
    showToast('Please select your university', 'danger');
    return;
  }
  
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'danger');
    return;
  }
  
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'danger');
    return;
  }
  
  if (!termsChecked) {
    showToast('Please accept the Terms & Conditions', 'danger');
    return;
  }
  
  try {
    showLoading('signup-btn');
    
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          phone: phone,
          university: university
        }
      }
    });
    
    if (authError) throw authError;
    
    // Check if user was created
    if (!authData || !authData.user) {
      throw new Error('Failed to create user account. Please try again.');
    }
    
    console.log('User created:', authData.user.id);
    
    // Sign in the user immediately to establish session for RLS
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (signInError) {
      console.error('Auto sign-in error:', signInError);
      // User was created but couldn't sign in automatically
      // They can still login manually
      showToast('Account created! Please login to continue.', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }
    
    console.log('User signed in, session established');
    
    // Now create profile in profiles table (RLS will pass because user is authenticated)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email: email,
        full_name: name,
        phone: phone,
        university: university,
        is_verified: false
      }]);
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }
    
    console.log('Profile created successfully');
    
    showToast('Account created successfully! Redirecting to browse...', 'success');
    
    // Redirect to browse page after 2 seconds (user is now logged in)
    setTimeout(() => {
      window.location.href = 'browse.html';
    }, 2000);
    
  } catch (error) {
    console.error('Signup error:', error);
    
    // Show more specific error messages
    let errorMessage = error.message || 'Error creating account. Please try again.';
    
    // Handle common Supabase errors
    if (error.message?.includes('User already registered')) {
      errorMessage = 'This email is already registered. Please login instead.';
    } else if (error.message?.includes('Invalid email')) {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.message?.includes('Password')) {
      errorMessage = 'Password must be at least 6 characters.';
    } else if (error.message?.includes('violates')) {
      errorMessage = 'Invalid data. Please check all fields and try again.';
    }
    
    showToast(errorMessage, 'danger');
  } finally {
    hideLoading('signup-btn');
  }
}

/**
 * Handle login form submission with Supabase
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  // Validation
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'danger');
    return;
  }
  
  if (!password) {
    showToast('Please enter your password', 'danger');
    return;
  }
  
  try {
    showLoading('login-btn');
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) throw error;
    
    showToast('Login successful! Redirecting...', 'success');
    
    // Redirect to browse page
    setTimeout(() => {
      window.location.href = 'browse.html';
    }, 1000);
    
  } catch (error) {
    console.error('Login error:', error);
    showToast(error.message || 'Invalid email or password', 'danger');
  } finally {
    hideLoading('login-btn');
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    showToast('Logged out successfully', 'success');
    
    // Redirect to home page
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Error logging out', 'danger');
  }
}

/**
 * Get current logged-in user
 * @returns {Object|null} User profile or null
 */
async function getCurrentUser() {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (!session) {
      return null;
    }
    
    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) throw profileError;
    
    return profile;
    
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
async function requireAuth() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    showToast('Please login to access this page', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return false;
  }
  
  return true;
}

/**
 * Update navbar based on authentication state
 */
async function updateNavbarAuth() {
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getCurrentUser() : null;
  
  // Find navbar elements
  const loginLink = document.querySelector('a[href="login.html"]');
  const signupBtn = document.querySelector('a[href="signup.html"]');
  const profileLink = document.querySelector('a[href="profile.html"]');
  
  if (authenticated && user) {
    // User is logged in - show profile, hide login/signup
    if (loginLink) {
      loginLink.parentElement.style.display = 'none';
    }
    if (signupBtn) {
      signupBtn.parentElement.style.display = 'none';
    }
    
    // Add user dropdown if not exists
    if (!document.getElementById('userDropdown')) {
      const navbarNav = document.querySelector('.navbar-nav');
      if (navbarNav) {
        const userDropdown = document.createElement('li');
        userDropdown.className = 'nav-item dropdown';
        userDropdown.innerHTML = `
          <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" 
             data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle"></i> ${user.full_name}
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><a class="dropdown-item" href="profile.html">
              <i class="bi bi-person"></i> My Profile
            </a></li>
            <li><a class="dropdown-item" href="create-service.html">
              <i class="bi bi-plus-circle"></i> Post Service
            </a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="handleLogout(); return false;">
              <i class="bi bi-box-arrow-right"></i> Logout
            </a></li>
          </ul>
        `;
        navbarNav.appendChild(userDropdown);
      }
    }
  } else {
    // User is not logged in - show login/signup, hide profile
    if (loginLink) {
      loginLink.parentElement.style.display = 'block';
    }
    if (signupBtn) {
      signupBtn.parentElement.style.display = 'block';
    }
    
    // Remove user dropdown if exists
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
      userDropdown.parentElement.remove();
    }
  }
}

/**
 * Handle password reset request
 */
async function handlePasswordReset(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });
    
    if (error) throw error;
    
    showToast('Password reset email sent! Check your inbox.', 'success');
    
  } catch (error) {
    console.error('Password reset error:', error);
    showToast(error.message || 'Error sending password reset email', 'danger');
  }
}

/**
 * Update user profile
 */
async function updateProfile(profileData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id);
    
    if (error) throw error;
    
    showToast('Profile updated successfully!', 'success');
    return true;
    
  } catch (error) {
    console.error('Profile update error:', error);
    showToast(error.message || 'Error updating profile', 'danger');
    return false;
  }
}

/**
 * Upload profile avatar
 */
async function uploadAvatar(file) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Image must be less than 5MB');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true // Replace if exists
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    // Update profile with avatar URL
    await updateProfile({ avatar_url: publicUrl });
    
    return publicUrl;
    
  } catch (error) {
    console.error('Avatar upload error:', error);
    showToast(error.message || 'Error uploading avatar', 'danger');
    return null;
  }
}

// Helper functions for loading states
function showLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
  }
}

function hideLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = false;
    // Restore original text (you may want to store this)
    if (buttonId === 'login-btn') {
      button.innerHTML = 'Login';
    } else if (buttonId === 'signup-btn') {
      button.innerHTML = 'Sign Up';
    }
  }
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
  
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
