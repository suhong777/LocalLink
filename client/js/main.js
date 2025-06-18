// Register
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    role: document.getElementById('role').value
  };

  const res = await fetch('http://localhost:3000/api/users/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(user)
  });

  const data = await res.json();
  alert(data.message || 'Registered!');
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const credentials = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  const res = await fetch('http://localhost:3000/api/users/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(credentials)
  });

  const data = await res.json();
  if (data._id) {
    alert('Login successful!');
    localStorage.setItem('user', JSON.stringify(data));
    window.location.href = 'dashboard.html';
  } else {
    alert('Login failed');
  }
  
  // On dashboard load
if (window.location.pathname.includes('dashboard.html')) {
  fetch('http://localhost:3000/api/services')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('serviceList');
      data.forEach(service => {
        const div = document.createElement('div');
        div.className = 'col-md-4';
        div.innerHTML = `
          <div class="card mb-3">
            <div class="card-body">
              <h5>${service.title}</h5>
              <p>${service.category} in ${service.location}</p>
            </div>
          </div>
        `;
        list.appendChild(div);
      });
    });
}
});