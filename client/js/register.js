//JS for registration page
document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = {
    name: form.name.value,
    email: form.email.value,
    password: form.password.value,
    role: form.role.value
  };

  //connect to database
  try {
    const res = await fetch('http://localhost:3000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    const message = document.getElementById('message');

    if (res.ok) {
      message.style.color = 'green';
      message.textContent = data.message;
      form.reset();
    } else {
      message.style.color = 'red';
      message.textContent = data.errors?.[0]?.msg || data.message || 'Registration failed.';
    }
  } catch (err) {
    console.error('Error:', err);
    document.getElementById('message').textContent = 'Network error';
  }
});