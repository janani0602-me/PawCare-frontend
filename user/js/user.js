/* ============================================================
   PAWCARE – USER SIDE SCRIPTS
   ============================================================ */

// ---------- NAV ----------
function toggleUserMenu() {
  document.getElementById('userLinks').classList.toggle('open');
  document.querySelector('.hamburger').classList.toggle('open');
}

// ---------- AUTH GUARD ----------
function requireLogin(redirect = 'login.html') {
  if (!isLoggedIn()) {
    sessionStorage.setItem('pawcare_redirect', location.pathname.split('/').pop());
    showToast('Please login first', 'info');
    setTimeout(() => location.href = redirect, 700);
    return false;
  }
  return true;
}

// ---------- NAVBAR RENDER ----------
function renderUserNavbar(active = '') {
  const user = getCurrentUser();
  const nav = document.getElementById('userNav');
  if (!nav) return;

  const links = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'adopt.html', label: 'Adopt Pets', key: 'adopt' },
    { href: 'how-it-works.html', label: 'How It Works', key: 'how' },
    { href: 'requests.html', label: 'My Requests', key: 'requests' }
  ];

  const linksHtml = links.map(l =>
    `<li><a href="${l.href}" class="${active === l.key ? 'active' : ''}">${l.label}</a></li>`
  ).join('');

  const authHtml = user
    ? `<a href="profile.html" class="btn btn-outline btn-sm"><i class="fas fa-user"></i> ${escapeHtml(user.name.split(' ')[0])}</a>`
    : `<a href="login.html" class="btn btn-primary btn-sm"><i class="fas fa-sign-in-alt"></i> Login</a>`;

  nav.innerHTML = `
    <div class="user-logo" onclick="location.href='index.html'">
      <i class="fas fa-paw"></i> PawCare
    </div>
    <ul class="user-links" id="userLinks">
      ${linksHtml}
    </ul>
    <div class="user-nav-right">
      ${authHtml}
      <button class="hamburger" onclick="toggleUserMenu()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;
}

// ---------- PET CARD ----------
function petCardHtml(pet) {
  const fav = isFavorite(pet.id);
  const badgeClass = pet.status === 'Adopted' ? 'adopted' : (pet.status === 'Pending Adoption' ? 'pending' : '');
  return `
    <div class="pet-card">
      <div class="pet-card-image">
        <img src="${pet.image}" alt="${escapeHtml(pet.name)}" loading="lazy">
        <span class="pet-badge ${badgeClass}">${pet.status}</span>
        <button class="fav-btn ${fav ? 'active' : ''}" onclick="onToggleFav(${pet.id}, event)" aria-label="Favorite">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="pet-card-body">
        <h3>${escapeHtml(pet.name)}</h3>
        <div class="pet-meta">
          <span>${escapeHtml(pet.type)}</span>
          <span>${escapeHtml(pet.breed)}</span>
          <span>${escapeHtml(pet.age)}</span>
          <span>${escapeHtml(pet.gender)}</span>
        </div>
        <p class="desc">${escapeHtml(pet.description.slice(0, 72))}${pet.description.length > 72 ? '…' : ''}</p>
        <div class="pet-card-actions">
          <a href="pet-details.html?id=${pet.id}" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">View Details</a>
          ${pet.status === 'Available'
            ? `<a href="adoption-form.html?id=${pet.id}" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">Adopt Now</a>`
            : `<button class="btn btn-primary btn-sm" disabled style="flex:1;justify-content:center;opacity:.55;cursor:not-allowed">Unavailable</button>`
          }
        </div>
      </div>
    </div>
  `;
}

function onToggleFav(id, e) {
  e.preventDefault();
  const added = toggleFavorite(id);
  showToast(added ? 'Added to favorites ❤️' : 'Removed from favorites', added ? 'success' : 'info');
  e.currentTarget.classList.toggle('active', added);
}

// ---------- HOME PAGE ----------
function initHome() {
  renderUserNavbar('home');
  animateCounters();

  // Featured pets: first 4 available
  const grid = document.getElementById('featuredPets');
  if (grid) {
    const featured = getPets().filter(p => p.status === 'Available').slice(0, 4);
    grid.innerHTML = featured.map(petCardHtml).join('');
  }
  triggerReveal();
}

function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 35));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = current + '+';
    }, 40);
  });
}

// ---------- ADOPT PAGE ----------
function initAdopt() {
  renderUserNavbar('adopt');
  renderAdoptGrid();
  triggerReveal();
}

function renderAdoptGrid() {
  const grid = document.getElementById('adoptGrid');
  const countEl = document.getElementById('adoptCount');
  if (!grid) return;

  const search = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const type = document.getElementById('filterType')?.value || 'all';
  const age = document.getElementById('filterAge')?.value || 'all';
  const gender = document.getElementById('filterGender')?.value || 'all';
  const location = document.getElementById('filterLocation')?.value || 'all';

  let pets = getPets().filter(p => p.status === 'Available');

  if (search) pets = pets.filter(p => p.name.toLowerCase().includes(search));
  if (type !== 'all') pets = pets.filter(p => p.type === type);
  if (gender !== 'all') pets = pets.filter(p => p.gender === gender);
  if (location !== 'all') pets = pets.filter(p => p.location === location);
  if (age !== 'all') {
    pets = pets.filter(p => {
      const y = parseFloat(p.age);
      if (age === 'baby') return y < 1;
      if (age === 'young') return y >= 1 && y <= 3;
      if (age === 'adult') return y > 3;
      return true;
    });
  }

  if (countEl) countEl.textContent = `${pets.length} pet${pets.length !== 1 ? 's' : ''} found`;

  if (pets.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-search"></i><h3>No pets found 🐾</h3><p>Try changing filters.</p></div>`;
    return;
  }
  grid.innerHTML = pets.map(petCardHtml).join('');
}

// ---------- PET DETAILS ----------
function initPetDetails() {
  renderUserNavbar('adopt');
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const pet = getPetById(id);
  const wrap = document.getElementById('petDetailsWrap');

  if (!pet) {
    wrap.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-paw"></i><h3>Pet not found</h3><a href="adopt.html" class="btn btn-primary mt-1" style="margin-top:1rem">Back to Adopt</a></div>`;
    return;
  }

  document.title = `${pet.name} – PawCare`;

  wrap.innerHTML = `
    <div class="pet-details-image">
      <img src="${pet.image}" alt="${escapeHtml(pet.name)}">
    </div>
    <div class="pet-details-info">
      <span class="pet-badge ${pet.status === 'Adopted' ? 'adopted' : (pet.status === 'Pending Adoption' ? 'pending' : '')}" style="position:static;display:inline-block;margin-bottom:.8rem">${pet.status}</span>
      <h1>${escapeHtml(pet.name)}</h1>
      <div class="pet-breed">${escapeHtml(pet.type)} · ${escapeHtml(pet.breed)}</div>

      <div class="detail-grid">
        <div class="detail-item"><label>Age</label><strong>${escapeHtml(pet.age)}</strong></div>
        <div class="detail-item"><label>Gender</label><strong>${escapeHtml(pet.gender)}</strong></div>
        <div class="detail-item"><label>Location</label><strong>${escapeHtml(pet.location)}</strong></div>
        <div class="detail-item"><label>Vaccinated</label><strong>${escapeHtml(pet.vaccinated)}</strong></div>
        <div class="detail-item"><label>Health</label><strong>${escapeHtml(pet.health)}</strong></div>
        <div class="detail-item"><label>Temperament</label><strong>${escapeHtml(pet.temperament)}</strong></div>
      </div>

      <div class="about-pet">
        <h3>About ${escapeHtml(pet.name)}</h3>
        <p>${escapeHtml(pet.description)}</p>
      </div>

      <div class="about-pet">
        <h3>Shelter Information</h3>
        <p>PawCare Partner Shelter · ${escapeHtml(pet.location)} · Verified Partner since 2023. All pets are health-checked by our vet team.</p>
      </div>

      ${pet.status === 'Available'
        ? `<a href="adoption-form.html?id=${pet.id}" class="btn btn-primary btn-lg"><i class="fas fa-paw"></i> Adopt This Pet</a>`
        : `<button class="btn btn-primary btn-lg" disabled style="opacity:.55;cursor:not-allowed">Already Adopted</button>`
      }
    </div>
  `;
}

// ---------- ADOPTION FORM ----------
function initAdoptionForm() {
  renderUserNavbar('adopt');
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const pet = getPetById(id);
  const banner = document.getElementById('petBanner');

  if (!pet) {
    banner.innerHTML = `<p style="color:var(--secondary)">Please select a pet from the <a href="adopt.html" style="color:var(--primary)">Adopt page</a>.</p>`;
    document.getElementById('adoptionForm').querySelector('button[type=submit]').disabled = true;
    return;
  }

  document.getElementById('adoptPetId').value = pet.id;
  banner.innerHTML = `
    <div style="display:flex;gap:1rem;align-items:center;background:var(--light-blue);padding:1rem;border-radius:var(--radius-sm);margin-bottom:1.5rem">
      <img src="${pet.image}" alt="${escapeHtml(pet.name)}" style="width:70px;height:70px;border-radius:14px;object-fit:cover">
      <div>
        <strong>Adopting: ${escapeHtml(pet.name)}</strong>
        <div style="font-size:.85rem;color:var(--secondary)">${escapeHtml(pet.type)} · ${escapeHtml(pet.breed)} · ${escapeHtml(pet.location)}</div>
      </div>
    </div>
  `;

  // Prefill if logged in
  const user = getCurrentUser();
  if (user) {
    document.getElementById('fullName').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('address').value = user.address || '';
  }
}

function submitAdoptionForm(e) {
  e.preventDefault();
  if (!requireLogin('login.html')) return;

  const petId = parseInt(document.getElementById('adoptPetId').value);
  const pet = getPetById(petId);
  if (!pet) { showToast('Pet not found', 'error'); return; }

  const user = getCurrentUser();

  const req = {
    id: 'REQ-' + Date.now().toString().slice(-6),
    petId: pet.id,
    petName: pet.name,
    petImage: pet.image,
    userName: user.name,
    userEmail: user.email,
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    occupation: document.getElementById('occupation').value.trim(),
    experience: document.getElementById('experience').value.trim(),
    reason: document.getElementById('reason').value.trim(),
    homeType: document.getElementById('homeType').value,
    otherPets: document.getElementById('otherPets').value,
    contactMethod: document.getElementById('contactMethod').value,
    date: formatDate(),
    timestamp: Date.now(),
    status: 'PENDING'
  };

  // Basic validation
  if (!req.fullName || !req.email || !req.phone || !req.reason) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const reqs = getRequests();
  reqs.push(req);
  saveRequests(reqs);

  // Mark pet as pending
  const pets = getPets();
  const p = pets.find(x => x.id === petId);
  if (p) { p.status = 'Pending Adoption'; savePets(pets); }

  // Success modal
  document.getElementById('successMsg').innerHTML = `
    <div style="text-align:center;padding:1rem 0">
      <div style="font-size:3.5rem;margin-bottom:.5rem">🎉</div>
      <h2 style="margin-bottom:.5rem">Request Submitted!</h2>
      <p style="color:var(--secondary)">Your adoption request has been sent for admin review.</p>
      <div style="margin:1.3rem 0;padding:1rem;background:var(--light-blue);border-radius:14px">
        <div style="font-size:.8rem;color:var(--secondary)">Your Request ID</div>
        <div style="font-size:1.3rem;font-weight:800;color:var(--primary)">${req.id}</div>
      </div>
      <a href="requests.html" class="btn btn-primary">View My Requests</a>
    </div>
  `;
  openModal('successModal');
  document.getElementById('adoptionForm').reset();
}

// ---------- MY REQUESTS ----------
function initRequests() {
  renderUserNavbar('requests');
  if (!requireLogin('login.html')) return;
  renderMyRequests();
  triggerReveal();
}

function renderMyRequests() {
  const container = document.getElementById('myRequests');
  const user = getCurrentUser();
  if (!container || !user) return;

  const reqs = getRequests().filter(r => r.userEmail === user.email).sort((a, b) => b.timestamp - a.timestamp);

  if (reqs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>No requests yet</h3>
        <p>You haven't submitted any adoption requests.</p>
        <a href="adopt.html" class="btn btn-primary" style="margin-top:1rem">Browse Pets</a>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="request-list">
      ${reqs.map(r => {
        const cls = r.status.toLowerCase() === 'approved' ? 'status-approved' :
                    r.status.toLowerCase() === 'rejected' ? 'status-rejected' : 'status-pending';
        return `
          <div class="request-card">
            <img src="${r.petImage}" alt="${escapeHtml(r.petName)}">
            <div class="request-info">
              <h3>${escapeHtml(r.petName)}</h3>
              <div class="meta">Request ID: <strong>${r.id}</strong> · Applied: ${r.date}</div>
              ${r.status === 'APPROVED' ? '<div style="color:var(--success);font-weight:600;margin-top:.4rem;font-size:.9rem">🎉 Congratulations! Approved.</div>' : ''}
            </div>
            <span class="status-badge ${cls}">${r.status}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ---------- PROFILE ----------
function initProfile() {
  renderUserNavbar('');
  if (!requireLogin('login.html')) return;
  const user = getCurrentUser();
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('pName').value = user.name || '';
  document.getElementById('pEmail').value = user.email || '';
  document.getElementById('pPhone').value = user.phone || '';
  document.getElementById('pAddress').value = user.address || '';

  // Requests count
  const count = getRequests().filter(r => r.userEmail === user.email).length;
  document.getElementById('reqCount').textContent = count;
}

function saveProfile(e) {
  e.preventDefault();
  const user = getCurrentUser();
  const users = getUsers();
  const idx = users.findIndex(u => u.email === user.email);
  const updated = {
    ...user,
    name: document.getElementById('pName').value.trim(),
    phone: document.getElementById('pPhone').value.trim(),
    address: document.getElementById('pAddress').value.trim()
  };
  if (idx !== -1) users[idx] = { ...users[idx], ...updated };
  saveUsers(users);
  setCurrentUser(updated);
  showToast('Profile updated ✅', 'success');
  setTimeout(() => location.reload(), 800);
}

function userLogout() {
  setCurrentUser(null);
  showToast('Logged out', 'info');
  setTimeout(() => location.href = 'index.html', 600);
}

// ---------- AUTH PAGES ----------
function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { showToast('Fill all fields', 'error'); return; }
    const user = getUsers().find(u => u.email.toLowerCase() === email && u.password === password);
    if (!user) { showToast('Invalid credentials', 'error'); return; }
    setCurrentUser(user);
    showToast('Welcome back, ' + user.name + '!', 'success');
    const redirect = sessionStorage.getItem('pawcare_redirect') || 'index.html';
    sessionStorage.removeItem('pawcare_redirect');
    setTimeout(() => location.href = redirect, 700);
  });
}

function initRegister() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const phone = document.getElementById('regPhone').value.trim();
    const address = document.getElementById('regAddress').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;

    if (!name || !email || !password) { showToast('Fill all required fields', 'error'); return; }
    if (password.length < 4) { showToast('Password must be at least 4 characters', 'error'); return; }
    if (password !== confirm) { showToast('Passwords do not match', 'error'); return; }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email)) {
      showToast('Email already registered', 'error'); return;
    }

    const newUser = { name, email, phone, address, password, joined: new Date().toISOString().slice(0,10) };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    showToast('Account created 🎉', 'success');
    setTimeout(() => location.href = 'index.html', 800);
  });
}

// ---------- SCROLL REVEAL ----------
function triggerReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const h = window.innerHeight;
  reveals.forEach(el => {
    if (el.getBoundingClientRect().top < h - 90) el.classList.add('active');
  });
}

// ---------- MODAL ----------
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

// ---------- GLOBAL ----------
window.addEventListener('scroll', triggerReveal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
});