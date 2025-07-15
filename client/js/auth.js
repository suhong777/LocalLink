// Save & retrieve user info from localStorage
function saveUser(user) {
  localStorage.setItem('localLinkUser', JSON.stringify(user));
}

function getUser() {
  return JSON.parse(localStorage.getItem('localLinkUser'));
}

function logout() {
  localStorage.removeItem('localLinkUser');
  window.location.href = 'login.html';
}