// Save & retrieve user info from localStorage
function saveUser(user) {
  localStorage.setItem('localLinkUser', JSON.stringify(user));
}

function getUser() {
  const user = localStorage.getItem('localLinkUser');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('localLinkUser');
  window.location.href = 'login.html';
}