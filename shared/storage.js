/* ============================================================
   PAWCARE – SHARED STORAGE LOGIC
   Loaded by both user pages and admin pages.
   ============================================================ */

// ---------- DEFAULT SAMPLE DATA ----------
const DEFAULT_PETS = [
  { id: 1, name: "Bruno", type: "Dog", breed: "Indie", age: "2 Years", gender: "Male", location: "Chennai", vaccinated: "Yes", health: "Healthy", temperament: "Friendly, Playful", description: "Bruno is a friendly and playful 2-year-old dog who loves people.", image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80", status: "Available" },
  { id: 2, name: "Milo", type: "Cat", breed: "Persian", age: "1 Year", gender: "Male", location: "Chennai", vaccinated: "Yes", health: "Healthy", temperament: "Calm, Affectionate", description: "Milo is a gentle Persian cat who loves cuddles and quiet afternoons.", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80", status: "Available" },
  { id: 3, name: "Luna", type: "Dog", breed: "Labrador", age: "3 Years", gender: "Female", location: "Coimbatore", vaccinated: "Yes", health: "Healthy", temperament: "Loyal, Energetic", description: "Luna is a loving Labrador who enjoys long walks and playing fetch.", image: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=600&auto=format&fit=crop&q=80", status: "Available" },
  { id: 4, name: "Bella", type: "Cat", breed: "Indian Shorthair", age: "2 Years", gender: "Female", location: "Bangalore", vaccinated: "Yes", health: "Healthy", temperament: "Independent, Curious", description: "Bella is a curious cat who loves exploring.", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80", status: "Available" },
  { id: 5, name: "Rocky", type: "Dog", breed: "Beagle", age: "4 Years", gender: "Male", location: "Chennai", vaccinated: "Yes", health: "Healthy", temperament: "Happy, Social", description: "Rocky is a happy Beagle who gets along with everyone.", image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=600&auto=format&fit=crop&q=80", status: "Available" },
  { id: 6, name: "Coco", type: "Rabbit", breed: "Mini Lop", age: "1 Year", gender: "Female", location: "Chengalpattu", vaccinated: "No", health: "Healthy", temperament: "Gentle, Quiet", description: "Coco is a sweet Mini Lop rabbit who loves fresh greens.", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&auto=format&fit=crop&q=80", status: "Available" },
  { id: 7, name: "Simba", type: "Cat", breed: "Maine Coon", age: "3 Years", gender: "Male", location: "Bangalore", vaccinated: "Yes", health: "Healthy", temperament: "Majestic, Friendly", description: "Simba is a gentle giant with a heart of gold.", image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80", status: "Adopted" },
  { id: 8, name: "Daisy", type: "Dog", breed: "Golden Retriever", age: "6 Months", gender: "Female", location: "Coimbatore", vaccinated: "Yes", health: "Healthy", temperament: "Playful, Loving", description: "Daisy is a playful puppy who loves everyone.", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=80", status: "Available" },
  { id: 9, name: "Oreo", type: "Rabbit", breed: "Dutch", age: "2 Years", gender: "Male", location: "Chennai", vaccinated: "No", health: "Healthy", temperament: "Active, Curious", description: "Oreo is an active rabbit who loves to explore.", image: "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=600&auto=format&fit=crop&q=80", status: "Available" },
  { id: 10, name: "Kiwi", type: "Bird", breed: "Budgerigar", age: "1 Year", gender: "Female", location: "Chengalpattu", vaccinated: "No", health: "Healthy", temperament: "Cheerful, Vocal", description: "Kiwi is a cheerful little bird who loves to chirp.", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&auto=format&fit=crop&q=80", status: "Available" }
];

// ---------- INITIALIZE STORAGE ----------
function initStorage() {
  if (!localStorage.getItem('pawcare_pets')) {
    localStorage.setItem('pawcare_pets', JSON.stringify(DEFAULT_PETS));
  }
  if (!localStorage.getItem('pawcare_requests')) {
    localStorage.setItem('pawcare_requests', JSON.stringify([]));
  }
  if (!localStorage.getItem('pawcare_users')) {
    localStorage.setItem('pawcare_users', JSON.stringify([
      { name: "Demo User", email: "user@pawcare.com", phone: "9876543210", address: "Chennai", password: "1234", joined: "2026-01-15" }
    ]));
  }
  if (!localStorage.getItem('pawcare_favorites')) {
    localStorage.setItem('pawcare_favorites', JSON.stringify([]));
  }
  if (!localStorage.getItem('pawcare_adoptions')) {
    localStorage.setItem('pawcare_adoptions', JSON.stringify([]));
  }
}

// ---------- PETS ----------
function getPets() { return JSON.parse(localStorage.getItem('pawcare_pets')) || []; }
function savePets(pets) { localStorage.setItem('pawcare_pets', JSON.stringify(pets)); }
function getPetById(id) { return getPets().find(p => p.id === parseInt(id)); }

// ---------- REQUESTS ----------
function getRequests() { return JSON.parse(localStorage.getItem('pawcare_requests')) || []; }
function saveRequests(reqs) { localStorage.setItem('pawcare_requests', JSON.stringify(reqs)); }

// ---------- USERS ----------
function getUsers() { return JSON.parse(localStorage.getItem('pawcare_users')) || []; }
function saveUsers(users) { localStorage.setItem('pawcare_users', JSON.stringify(users)); }

// ---------- FAVORITES ----------
function getFavorites() { return JSON.parse(localStorage.getItem('pawcare_favorites')) || []; }
function saveFavorites(favs) { localStorage.setItem('pawcare_favorites', JSON.stringify(favs)); }
function isFavorite(id) { return getFavorites().includes(id); }
function toggleFavorite(id) {
  let favs = getFavorites();
  if (favs.includes(id)) favs = favs.filter(f => f !== id);
  else favs.push(id);
  saveFavorites(favs);
  return favs.includes(id);
}

// ---------- ADOPTION RECORDS ----------
function getAdoptions() { return JSON.parse(localStorage.getItem('pawcare_adoptions')) || []; }
function saveAdoptions(recs) { localStorage.setItem('pawcare_adoptions', JSON.stringify(recs)); }

// ---------- SESSION ----------
function getCurrentUser() {
  const u = localStorage.getItem('pawcare_current_user');
  return u ? JSON.parse(u) : null;
}
function setCurrentUser(user) {
  if (user) localStorage.setItem('pawcare_current_user', JSON.stringify(user));
  else localStorage.removeItem('pawcare_current_user');
}
function isLoggedIn() { return !!getCurrentUser(); }

function getAdminSession() {
  const a = sessionStorage.getItem('pawcare_admin');
  return a ? JSON.parse(a) : null;
}
function setAdminSession(data) {
  if (data) sessionStorage.setItem('pawcare_admin', JSON.stringify(data));
  else sessionStorage.removeItem('pawcare_admin');
}

// ---------- TOAST ----------
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ---------- HELPERS ----------
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function formatDate(d = new Date()) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Init on load
initStorage();