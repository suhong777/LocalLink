
async function loadListings() {
  try {
    const res = await fetch('http://localhost:3000/api/services');
    const services = await res.json();

    if (services.length === 0) {
      document.getElementById('listings').innerHTML = '<p>No services available.</p>';
      return;
    }
  
    document.getElementById('listings').innerHTML = services.map(s => `
      <div style="border:1px solid #ccc; padding:10px; margin:10px;">
        <p><strong>${s.title}</strong> - €${parseFloat(s.price).toFixed(2)}</p
        <p>${s.description}</p>
        <p><a href="login.html">Log in</a> to book this service</p>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    document.getElementById('listings').innerHTML = '<p>Error loading services.</p>';
  }
}

loadListings();