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


// Only show welcome message if logged in
if (user) {
  welcome.textContent = `Welcome, ${user.name} (${user.role})`;
  
  // Show provider tab if user is a provider
  if (user.role === 'provider') {
    document.getElementById('provider-tab').style.display = 'flex';

    //hide the booking history tab
    const bookingTab = document.querySelector('[data-tab="bookings"]');
    if (bookingTab) {
      bookingTab.style.display = 'none';
    }
  }
  //only show welcome guest if unresgitered
} else {
  welcome.textContent = `Welcome, Guest`;
}


// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
  const tabButtons = document.querySelectorAll('.tab'); 
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');

      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      this.classList.add('active');
      document.getElementById(targetTab).classList.add('active');

  
      // Load content based on active tab
      if (targetTab === 'bookings') { // 
        loadBookingHistory();
      } else if (targetTab === 'services') { 
        loadServicesForCustomer(user?._id);
      } else if (targetTab === 'provider') { 
        loadProviderDashboard();
      }
    });
  });

  // Load initial content
  loadServicesForCustomer(user?._id);
  if (user) {
    loadBookingHistory();
  }
});

//show the existing service for provider
async function loadProviderServices(providerId) {
  const servicesContainer = document.getElementById('provider-services'); 
  
  // Show loading state
  servicesContainer.innerHTML = `
    <div class="empty">
      <i class="fas fa-spinner fa-spin"></i>
      <h3>Loading your services...</h3>
    </div>
  `;

  try {
    const res = await fetch('http://localhost:3000/api/services');
    const services = await res.json();

    const myServices = services.filter(service => service.provider === providerId);

    if (myServices.length === 0) {
      servicesContainer.innerHTML = `
        <div class="empty">
          <i class="fas fa-plus-circle"></i>
          <h3>No Services Listed</h3>
          <p>You haven't created any services yet. Create your first service above!</p>
        </div>
      `;
    } else {
      let servicesHTML = '<div class="grid">'; 
      
      myServices.forEach(service => {
        servicesHTML += `
          <div class="item">
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            <div class="price">${'€'+parseFloat(service.price).toFixed(2)}</div>
            <div class="actions"> 
              <button class="btn btn-danger" onclick="deleteService('${service._id}')">
                Delete 
              </button>
            </div>
          </div>
        `;
      });
      
      servicesHTML += '</div>';
      servicesContainer.innerHTML = servicesHTML;
    }
  } catch (err) {
    console.error('Failed to load services:', err);
    servicesContainer.innerHTML = `
      <div class="empty">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Services</h3>
        <p>Unable to load your services. Please try again later.</p>
      </div>
    `;
  }
}


//show service 
async function loadServicesForCustomer(customerId) {
  const servicesList = document.getElementById('services-list'); 

  // Show loading state
  servicesList.innerHTML = `
    <div class="empty">
      <i class="fas fa-spinner fa-spin"></i>
      <h3>Loading services...</h3>
      <p>Please wait while we fetch available services</p>
    </div>
  `;

  try {
    const res = await fetch('http://localhost:3000/api/services');
    const services = await res.json();

    if (services.length === 0) {
      servicesList.innerHTML = `
        <div class="empty">
          <i class="fas fa-store-slash"></i>
          <h3>No Services Available</h3>
          <p>There are currently no services available. Please check back later.</p>
        </div>
      `;
    } else {
      let servicesHTML = '<div class="grid">'; 
      
      services.forEach(service => {
        servicesHTML += `
          <div class="item">
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            <div class="price">${'€'+parseFloat(service.price).toFixed(2)}</div>
            ${!user || user.role !== 'provider' ? `
        <div class="actions"> 
          <button class="btn btn-primary" onclick="bookService('${service._id}')">
            Book Service 
          </button>
        </div>
      ` : ''}
    </div>
  `;
});
      
      servicesHTML += '</div>';
      servicesList.innerHTML = servicesHTML;
    }
  } catch (error) {
    console.error('Failed to load services:', error);
    servicesList.innerHTML = `
      <div class="empty">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Services</h3>
        <p>Unable to load services. Please try again later.</p>
      </div>
    `;
  }
}


//Customer: booking services
async function bookService(serviceId) {
  // If not registered user, then ask user to log in first before booking service
  if (!user) {
    popUpMessage('warning','Please log in to book a service.');
    return;
  }

  // Get notes from user
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
        notes: notes || '' 
      })
    });

    const data = await res.json();
    
    // Add proper error handling
    if (res.ok) {
      popUpMessage('success', data.message || 'Booking created successfully!');
      // Refresh bookings to show the new one
      loadCustomerBookings(user._id);
    } else {
      popUpMessage('error', data.message || 'Failed to create booking');
    }
  } catch (error) {
    console.error('Booking error:', error);
    popUpMessage('error', 'Network error. Please try again.');
  }
}


// Load customer booking history
function loadBookingHistory() {
  const bookingsList = document.getElementById('bookings-list'); 
  
  if (!user) {
    // Guest user
    bookingsList.innerHTML = `
      <div class="empty"> 
        <i class="fas fa-user-lock"></i>
        <h3>Login Required</h3>
        <p>Please log in to view your booking history</p>
        <button class="btn btn-primary" onclick="window.location.href='login.html'">
          Login 
        </button>
      </div>
    `;
  } else {
    // Load customer bookings
    loadCustomerBookings(user._id);
  }
}

//customer:show booking history
async function loadCustomerBookings(customerId) {
   const bookingsList = document.getElementById('bookings-list'); 
  
  // Show loading state
  bookingsList.innerHTML = `
    <div class="empty"> 
      <i class="fas fa-spinner fa-spin"></i>
      <h3>Loading bookings...</h3>
      <p>Please wait while we fetch your bookings</p>
    </div>
  `;

  try {
    const res = await fetch(`http://localhost:3000/api/bookings/customer/${customerId}`);
    const bookings = await res.json();

    if (bookings.length === 0) {
      bookingsList.innerHTML = `
        <div class="empty">
          <i class="fas fa-calendar-times"></i>
          <h3>No Bookings Yet</h3>
          <p>You have not booked any services yet.</p>
        </div>
      `;
    } else {
      let bookingsHTML = '<div class="grid">'; // 
      
      bookings.forEach(booking => {
        let statusClass = 'pending';
        if (booking.status === 'accepted') statusClass = 'accepted';
        if (booking.status === 'rejected') statusClass = 'rejected';
        
        bookingsHTML += `
          <div class="item">
            <h3>${booking.service?.title || 'Service No Longer Available'}</h3>
            <p><strong>Status:</strong> <span class="status ${statusClass}">${booking.status}</span></p>
            <p><strong>Notes:</strong> ${booking.notes || 'No notes'}</p>
            <div class="actions"> 
              <button class="btn btn-danger" onclick="deleteBooking('${booking._id}')">
                Delete 
              </button>
            </div>
          </div>
        `;
      });
      
      bookingsHTML += '</div>';
      bookingsList.innerHTML = bookingsHTML;
    }
  } catch (err) {
    console.error('Failed to load bookings:', err);
    bookingsList.innerHTML = `
      <div class="empty">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Bookings</h3>
        <p>Unable to load your bookings. Please try again later.</p>
      </div>
    `;
  }
}


// Load provider dashboard
function loadProviderDashboard() {
  if (!user || user.role !== 'provider') {
    return;
  }
  
  loadProviderForm();
  loadProviderBookings(user._id);
  loadProviderServices(user._id);
}

// Load provider form
function loadProviderForm() {
  const formContainer = document.getElementById('service-form'); 
  
  formContainer.innerHTML = `
    <form id="serviceForm" class="service-form">
      <input type="hidden" name="provider" value="${user._id}" />
      <div class="form-group">
        <label for="title">Service Title</label>
        <input type="text" class="form-control" name="title" id="title" placeholder="Enter service title" required />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <input type="text" class="form-control" name="description" id="description" placeholder="Describe your service" required />
      </div>
      <div class="form-group">
        <label for="price">Price (€)</label>
        <input type="number" class="form-control" name="price" id="price" placeholder="0.00" step="0.01" min="0" required />
      </div>
      <button type="submit" class="btn btn-primary">
        Create Service 
      </button>
      <div id="serviceMessage" class="message" style="display: none;"></div>
    </form>
  `;

  // Add form submission handler
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
      if (res.ok) {
        popUpMessage('success', 'Service created successfully.');
        form.reset();
        loadProviderServices(user._id); // Reload services
      } else {
        popUpMessage('error', data.message || 'Failed to create service.');
      }
    } catch (err) {
      console.error(err);
      popUpMessage('error', 'Network error. Please try again.');
    }
  });
}

async function loadProviderBookings(providerId) {
  const bookingsContainer = document.getElementById('provider-bookings'); 
  
  // Show loading state
  bookingsContainer.innerHTML = `
    <div class="empty">
      <i class="fas fa-spinner fa-spin"></i>
      <h3>Loading bookings...</h3>
    </div>
  `;

  try {
    const res = await fetch(`http://localhost:3000/api/bookings/provider/${providerId}`);
    const bookings = await res.json();

    if (bookings.length === 0) {
      bookingsContainer.innerHTML = `
        <div class="empty">
          <i class="fas fa-calendar-times"></i>
          <h3>No Bookings Yet</h3>
          <p>No customers have booked your services yet.</p>
        </div>
      `;
    } else {
      let bookingsHTML = '<div class="grid">'; 
      
      bookings.forEach(booking => {
        let statusClass = 'pending';
        if (booking.status === 'accepted') statusClass = 'accepted';
        if (booking.status === 'rejected') statusClass = 'rejected';
        
        bookingsHTML += `
          <div class="item">
            <h3>${booking.service?.title || 'N/A'}</h3>
            <p><strong>Customer:</strong> ${booking.customer?.name || 'N/A'}</p>
            <p><strong>Status:</strong> <span class="status ${statusClass}">${booking.status}</span></p>
            <p><strong>Notes:</strong> ${booking.notes || 'No notes'}</p>
            <div class="actions"> 
              ${booking.status === 'pending' ? `
                <button class="btn btn-success" onclick="updateStatus('${booking._id}', 'accepted')">
                  Accept 
                </button>
                <button class="btn btn-danger" onclick="updateStatus('${booking._id}', 'rejected')">
                  Reject 
                </button>
              ` : ''}
            </div>
          </div>
        `;
      });
      
      bookingsHTML += '</div>';
      bookingsContainer.innerHTML = bookingsHTML;
    }
  } catch (err) {
    console.error('Failed to load provider bookings:', err);
    bookingsContainer.innerHTML = `
      <div class="empty">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Bookings</h3>
        <p>Unable to load bookings. Please try again later.</p>
      </div>
    `;
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
      loadProviderServices(user._id);
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

  // Hide icon and set title based on type
  icon.textContent = '';
  icon.style.display = 'none';

  // Set icon and title based on type
  if (type === 'success') {
    title.textContent = 'Success';
  } else if (type === 'error') {
    title.textContent = 'Error';
  } else if (type === 'warning') {
    title.textContent = 'Warning';
  } else {
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

function confirmPopUp(titleText,message, confirmFunction) {
  const overlay = document.getElementById('popupOverlay');
  const icon = document.getElementById('popupIcon');
  const titleElement = document.getElementById('popupTitle');
  const text = document.getElementById('popupText');
  const cancelBtn = document.getElementById('popupCancel');
  const okBtn = document.getElementById('popupOK');

  //hide pop up icon
  icon.textContent = '';
  icon.style.display = 'none';

  titleElement.textContent = titleText;
  text.textContent = message;
  
  cancelBtn.style.display = 'inline-block';
  okBtn.textContent = 'Yes';

  overlay.classList.add('show');

   // Clear any existing event
  okBtn.onclick = null;
  cancelBtn.onclick = null;

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