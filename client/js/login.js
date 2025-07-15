//JS for login page
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const email = form.email.value;
  const password = form.password.value;

  try {
    const res = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    const message = document.getElementById('message');

    if (res.ok) {
      message.style.color = 'green';
      message.textContent = data.message;

      // Save user info in localStorage
      localStorage.setItem('localLinkUser', JSON.stringify(data.user));

      // Redirect to dashboard page
      window.location.href = 'dashboard.html';
    } else {
      message.style.color = 'red';
      message.textContent = data.message || 'Login failed';
    }
  } catch (err) {
    console.error('Login error:', err);
    document.getElementById('message').textContent = 'Network error';
  }
});