  
    class AuthManager {
  constructor() {
    this.baseURL = 'http://localhost:3500/api/v1/auth';
    this.init();
  }
  init() {
    this.bindEvents();
    this.checkExistingAuth();
  }
  bindEvents() {
    document.getElementById('login-form-element').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
    document.getElementById('register-form-element').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });
  }
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password) {
    return password.length >= 6;
  }
  showError(formType, message) {
    const errorElement = document.getElementById(`${formType}-error`);
    const successElement = document.getElementById(`${formType}-success`);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    successElement.classList.add('hidden');
  }

  showSuccess(formType, message) {
    const errorElement = document.getElementById(`${formType}-error`);
    const successElement = document.getElementById(`${formType}-success`);
    successElement.textContent = message;
    successElement.classList.remove('hidden');
    errorElement.classList.add('hidden');
  }

  hideMessages(formType) {
    document.getElementById(`${formType}-error`).classList.add('hidden');
    document.getElementById(`${formType}-success`).classList.add('hidden');
  }

  setLoading(formType, isLoading) {
    const button = document.getElementById(`${formType}-button`);
    
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  async safeJson(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  async handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    this.hideMessages('login');

    if (!this.validateEmail(email)) {
      this.showError('login', 'Please enter a valid email address');
      return;
    }

    if (!this.validatePassword(password)) {
      this.showError('login', 'Password must be at least 6 characters long');
      return;
    }

    this.setLoading('login', true);

    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await this.safeJson(response);

      if (response.ok) {
        // sessionStorage.setItem('authToken', data.token);
        // sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('userEmail', email);

        setTimeout(() => {
          window.location.href = '../application/index.html'; 
        }, 1500);
      } else {
        this.showError('login', data.message || `Login failed (${response.status})`);
      }
    } catch (error) {
      this.showError('login', 'Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      this.setLoading('login', false);
    }
  }

  async handleRegister() {
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    this.hideMessages('register');

    if (!this.validateEmail(email)) {
      this.showError('register', 'Please enter a valid email address');
      return;
    }

    if (!this.validatePassword(password)) {
      this.showError('register', 'Password must be at least 6 characters long');
      return;
    }

    this.setLoading('register', true);

    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await this.safeJson(response);

      if (response.ok) {
        this.showSuccess('register', 'Registration successful! Please sign in.');
        
        setTimeout(() => {
          switchToLogin();
          document.getElementById('login-email').value = email;
        }, 2000);
      } else {
        this.showError('register', data.message || `Registration failed (${response.status})`);
      }
    } catch (error) {
      this.showError('register', 'Network error. Please try again.');
      console.error('Registration error:', error);
    } finally {
      this.setLoading('register', false);
    }
  }

  checkExistingAuth() {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      setTimeout(()=>{

        window.location.href = '../application/index.html';
      },1200)
    }
  }

  logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userEmail');
    window.location.href = '/';
  }
}

function switchToLogin() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
}

function switchToRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.nextElementSibling;
  
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
  } else {
    input.type = 'password';
    button.textContent = '👁️';
  }
}

function showForgotPassword() {
  alert('Forgot password functionality would be implemented here');
}

const authManager = new AuthManager();
window.authManager = authManager;

  