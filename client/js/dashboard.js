function getUser() {
  const user = localStorage.getItem('localLinkUser'); // MATCH the key used in login.js
  return user ? JSON.parse(user) : null;
}

const user = getUser();
const contentDiv = document.getElementById('content');
const welcome = document.getElementById('welcome');

// LOGIN / LOGOUT LINK LOGIC -for registered user and unregistered user
const authLink = document.getElementById('authLink');

if (authLink) {
  if (user) {
    // Logged in: Show "Logout"
    authLink.textContent = 'Logout';
    authLink.href = '#';
    authLink.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem('localLinkUser');
      popUpMessage('info','You have been logged out.');
      window.location.href = 'index.html';
    });
  } else {
    // Not logged in: Show "Login"
    authLink.textContent = 'Login';
    authLink.href = 'login.html';
  }
}

/*// Always load listings -no matter if customer log in or not
loadServicesForCustomer(user?._id);
*/

// Only show welcome message if logged in
if (user) {
  welcome.textContent = `Welcome, ${user.name} (${user.role})`;

  if (user.role === 'provider') {
    loadProviderBookings(user._id);
  } else if (user.role === 'customer') {
    loadServicesForCustomer(user._id);
    loadCustomerBookings(user._id);
  }
} else {
  welcome.textContent = `Welcome, Guest`;
  loadServicesForCustomer(); 
}

/*//call the relevant function 
if (user.role === 'provider') {
  loadProviderBookings(user._id);
} else if (user.role === 'customer') {
  loadServicesForCustomer(user._id);
  loadCustomerBookings(user._id); 
}
*/

//provider function
async function loadProviderBookings(providerId) {
  const res = await fetch(`http://localhost:3000/api/bookings/provider/${providerId}`);
  const bookings = await res.json();

  const formHtml = `
    <h2>Create New Service</h2>
    <form id="serviceForm">
      <input type="hidden" name="provider" value="${user._id}" />
      <input type="text" name="title" placeholder="Service title" required />
      <input type="text" name="description" placeholder="Description" required />
      <input type="number" name="price" placeholder="Price" required />
      <button type="submit">Create Service</button>
    </form>
    <p id="serviceMessage"></p>
  `;

  let bookingHtml = bookings.length === 0
    ? '<p>No bookings yet.</p>'
    : '<h2>Your Service Bookings</h2>' + bookings.map(b => `
        <div style="border:1px solid #ccc; padding:10px; margin:10px;">
          <p><strong>Service:</strong> ${b.service?.title || 'N/A'}</p>
          <p><strong>Status:</strong> ${b.status}</p>
          <p><strong>Customer:</strong> ${b.customer?.name || 'N/A'}</p>
          <p><strong>Notes:</strong> ${b.notes}</p>
          ${b.status === 'pending' ? `
            <button onclick="updateStatus('${b._id}', 'accepted')">Accept</button>
            <button onclick="updateStatus('${b._id}', 'rejected')">Reject</button>
          ` : ''}
        </div>
      `).join('');

  contentDiv.innerHTML = formHtml + bookingHtml;

  await loadProviderServices(providerId);

  document.getElementById('serviceForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
      title: form.title.value,
      description: form.description.value,
      price: form.price.value,
      provider: form.provider.value
    };

    try {
      const res = await fetch('http://localhost:3000/api/services/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const msg = document.getElementById('serviceMessage');
      if (res.ok) {
        msg.style.color = 'green';
        msg.textContent = 'Service created successfully.';
        form.reset();
        loadProviderBookings(providerId); // Reload bookings
      } else {
        msg.style.color = 'red';
        msg.textContent = data.message || 'Failed to create service.';
      }
    } catch (err) {
      console.error(err);
    }
  });
}

//show the existing service for provider
async function loadProviderServices(providerId) {
  try {
    const res = await fetch('http://localhost:3000/api/services');
    const services = await res.json();

    const myServices = services.filter(service => service.provider === providerId);

    if (myServices.length === 0) {
      contentDiv.innerHTML += '<h2>Your Listings</h2><p>No services listed yet.</p>';
      return;
    }

    const listingsHtml = `
      <h2>Your Listings</h2>
      ${myServices.map(s => `
        <div style="border:1px solid #ccc; padding:10px; margin:10px;">
          <p><strong>${s.title}</strong> - $${s.price}</p>
          <p>${s.description}</p>
          <button onclick="deleteService('${s._id}')">
            Delete Listing
          </button>
        </div>
      `).join('')}
    `;

    contentDiv.innerHTML += listingsHtml;
  } catch (err) {
    console.error('Failed to load services:', err);
    contentDiv.innerHTML += '<p style="color:red;">Error loading your listings.</p>';
  }
}

//show service 
async function loadServicesForCustomer(customerId) {
  const res = await fetch('http://localhost:3000/api/services');
  const services = await res.json();

  if (services.length === 0) {
    contentDiv.innerHTML = '<p>No services available.</p>';
    return;
  }

  contentDiv.innerHTML = '<h2>Available Services</h2>' + services.map(s => `
    <div style="border:1px solid #ccc; padding:10px; margin:10px;">
      <p><strong>${s.title}</strong> - $${s.price}</p>
      <p>${s.description}</p>
      <button onclick="bookService('${s._id}')">Book</button>
    </div>
  `).join('');
}


//Customer: booking services
async function bookService(serviceId) {
  //if not registered user, then ask user to log in first before booking service
  if (!user) {
  popUpMessage('warning','Please log in to book a service.');
  window.location.href = 'login.html';
  return;
}

//Get notes from user
  const notes = prompt('Enter any notes for your booking:');

// Check if user clicked "Cancel" - prompt returns null when cancelled
  if (notes === null) {
    // User clicked "Cancel", so don't proceed with booking
    return;
  }

  try {
  const res = await fetch('http://localhost:3000/api/bookings/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: serviceId,
      customer: user._id,
      notes:notes ||'' 
    })
  });

  const data = await res.json();
  
   // Add proper error handling
    if (res.ok) {
      popUpMessage('success', data.message || 'Booking created successfully!');
      //  Refresh bookings to show the new one
      loadCustomerBookings(user._id);
    } else {
      popUpMessage('error', data.message || 'Failed to create booking');
    }
}catch (error) {  //  Added catch block
    console.error('Booking error:', error);
    popUpMessage('error', 'Network error. Please try again.');
  }
}

//customer:show booking history
async function loadCustomerBookings(customerId) {
  try {
    const res = await fetch(`http://localhost:3000/api/bookings/customer/${customerId}`);
    const bookings = await res.json();

    if (bookings.length === 0) {
      contentDiv.innerHTML = '<h2>Your Bookings</h2><p>You have not booked any services yet.</p>';
      return;
    }

    const bookingsHtml = `
      <h2>Your Bookings</h2>
      ${bookings.map(b => `
        <div style="border:1px solid #ccc; padding:10px; margin:10px;">
          <p><strong>Service:</strong> ${b.service?.title || 'N/A'}</p>
          <p><strong>Status:</strong> ${b.status}</p>
          <p><strong>Notes:</strong> ${b.notes}</p>
          <button onclick="deleteBooking('${b._id}')">
            Delete
          </button>
        </div>
      `).join('')}
    `;

    contentDiv.innerHTML += bookingsHtml;
  } catch (err) {
    console.error('Failed to load bookings:', err);
    contentDiv.innerHTML += '<p style="color:red;">Error loading your bookings.</p>';
  }
}

//provider: update the booking status
async function updateStatus(bookingId, newStatus) {
  try {
    const res = await fetch(`http://localhost:3000/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    if (res.ok) {
      popUpMessage('success', `Booking ${newStatus}`);
      loadProviderBookings(user._id); // Refresh
    } else {
      popUpMessage('error', data.message || 'Failed to update booking');
    }
  } catch (err) {
    console.error(err);
    popUpMessage('error', 'Network error. Please try again.');
  }
}
//delete function -customer to delete the booking
async function deleteBooking(bookingId) {
  confirmPopUp(
    'Delete Booking', 
    'Are you sure you want to delete this booking history? This action cannot be undone.',
    () => {
      // Put the actual delete logic here
      performDeleteBooking(bookingId);
    }
  );
}
async function performDeleteBooking(bookingId) {
  try {
    const res = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    
    if (res.ok) {
      popUpMessage('success', data.message || 'Booking deleted successfully!');
      // Refresh the bookings list to remove the deleted booking
      loadCustomerBookings(user._id);
    } else {
      popUpMessage('error', data.message || 'Failed to delete booking');
    }
  } catch (error) {
    console.error('Delete booking error:', error);
    popUpMessage('error', 'Error deleting booking. Please try again.');
  }
}

// Delete service - for providers to delete their listings
async function deleteService(serviceId) {
  confirmPopUp(
    'Delete Service', 
    'Are you sure you want to delete this listing? This action cannot be undone and it might impact your current bookings.',
    () => {
      performDeleteService(serviceId);
    }
  );
}

async function deleteService(serviceId) {
  confirmPopUp(
    'Delete Service', 
    'Are you sure you want to delete this listing? This action cannot be undone and it might impact your current bookings.',
    () => {
      performDeleteService(serviceId);
    }
  );
}
async function performDeleteService(serviceId) {
  try {
    const res = await fetch(`http://localhost:3000/api/services/${serviceId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    
    if (res.ok) {
      popUpMessage('success', data.message || 'Service deleted successfully!');
      // Refresh the page to remove the deleted service
      loadProviderBookings(user._id);
    } else {
      popUpMessage('error', data.message || 'Failed to delete service');
    }
  } catch (error) {
    console.error('Delete service error:', error);
    popUpMessage('error', 'Error deleting service. Please try again.');
  }
}

//pop up function - to replace my alert message 
function popUpMessage(type, message) {
  const overlay = document.getElementById('popupOverlay');
  const icon = document.getElementById('popupIcon');
  const title = document.getElementById('popupTitle');
  const text = document.getElementById('popupText');
  const cancelBtn = document.getElementById('popupCancel');
  const okBtn = document.getElementById('popupOK');

  // Set icon and title based on type
  if (type === 'success') {
    icon.textContent = '✓';
    icon.style.color = '#28a745';
    title.textContent = 'Success';
  } else if (type === 'error') {
    icon.textContent = '✗';
    icon.style.color = '#dc3545';
    title.textContent = 'Error';
  } else if (type === 'warning') {
    icon.textContent = '⚠';
    icon.style.color = '#ffc107';
    title.textContent = 'Warning';
  } else {
    icon.textContent = 'ℹ';
    icon.style.color = '#17a2b8';
    title.textContent = 'Information';
  }

  text.textContent = message;
  cancelBtn.style.display = 'none';
  okBtn.textContent = 'OK';

  overlay.classList.add('show');

  // Close popup when OK clicked
  okBtn.onclick = function() {
    overlay.classList.remove('show');
  };
}

function confirmPopUp(message, confirmFunction) {
  const overlay = document.getElementById('popupOverlay');
  const icon = document.getElementById('popupIcon');
  const title = document.getElementById('popupTitle');
  const text = document.getElementById('popupText');
  const cancelBtn = document.getElementById('popupCancel');
  const okBtn = document.getElementById('popupOK');

  icon.textContent = '?';
  icon.style.color = '#ffc107';
  title.textContent = 'Confirm';
  text.textContent = message;
  
  cancelBtn.style.display = 'inline-block';
  okBtn.textContent = 'Yes';

  overlay.classList.add('show');

  // Handle Yes/No clicks
  okBtn.onclick = function() {
    overlay.classList.remove('show');
    confirmFunction(); // Run the function if Yes clicked
  };

  cancelBtn.onclick = function() {
    overlay.classList.remove('show');
  };
}

// Close popup when clicking outside
document.getElementById('popupOverlay').onclick = function(e) {
  if (e.target === this) {
    this.classList.remove('show');
  }
};