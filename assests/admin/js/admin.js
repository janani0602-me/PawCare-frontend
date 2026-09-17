/* ============================================================
   PAWCARE – ADMIN SCRIPTS
   ============================================================ */

// ---------- AUTH GUARD ----------
function requireAdmin() {
  const admin = getAdminSession();
  if (!admin) {
    location.href = 'login.html';
    return false;
  }
  return true;
}

// ---------- SIDEBAR + TOPBAR RENDER ----------
function renderAdminShell(active = 'dashboard') {
  const admin = getAdminSession() || { name: 'Admin', email: 'admin@pawcare.com' };
  const sidebar = document.getElementById('sidebar');
  const topbar = document.getElementById('topbar');
  if (!sidebar || !topbar) return;

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', href: 'dashboard.html' },
    { key: 'pets', label: 'Manage Pets', icon: 'fa-dog', href: 'pets.html' },
    { key: 'requests', label: 'Adoption Requests', icon: 'fa-clipboard-list', href: 'requests.html' },
    { key: 'records', label: 'Adoption Records', icon: 'fa-file-alt', href: 'records.html' },
    { key: 'users', label: 'Users', icon: 'fa-users', href: 'users.html' },
    { key: 'settings', label: 'Settings', icon: 'fa-cog', href: 'settings.html' }
  ];

  sidebar.innerHTML = `
    <div class="sidebar-logo"><i class="fas fa-paw"></i> PawCare</div>
    <ul class="sidebar-menu">
      ${menuItems.map(m => `
        <li><a href="${m.href}" class="${active === m.key ? 'active' : ''}">
          <i class="fas ${m.icon}"></i> ${m.label}
        </a></li>
      `).join('')}
    </ul>
    <div class="sidebar-footer">
      <a href="#" onclick="adminLogout(event)" class="btn btn-outline" style="width:100%;justify-content:center">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
    </div>
  `;

  const initial = (admin.name || 'A')[0].toUpperCase();
  topbar.innerHTML = `
    <button class="sidebar-toggle" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
    <div class="topbar-search">
      <i class="fas fa-search"></i>
      <input type="text" placeholder="Search..." id="topSearch" oninput="handleTopSearch()">
    </div>
    <div class="topbar-right">
      <div class="topbar-icon" title="Notifications">
        <i class="fas fa-bell"></i>
        <span class="dot"></span>
      </div>
      <div class="admin-profile">
        <div class="admin-avatar">${initial}</div>
        <div class="admin-profile-info">
          <strong>${escapeHtml(admin.name)}</strong>
          <small>Administrator</small>
        </div>
      </div>
    </div>
  `;

  if (!document.querySelector('.sidebar-backdrop')) {
    const bd = document.createElement('div');
    bd.className = 'sidebar-backdrop';
    bd.id = 'sidebarBackdrop';
    bd.onclick = closeSidebar;
    document.body.appendChild(bd);
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarBackdrop').classList.toggle('active');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('active');
}

function handleTopSearch() {
  const q = document.getElementById('topSearch').value.toLowerCase();
  document.querySelectorAll('table tbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function adminLogout(e) {
  if (e) e.preventDefault();
  setAdminSession(null);
  showToast('Logged out', 'info');
  setTimeout(() => location.href = 'login.html', 500);
}

// ---------- ADMIN LOGIN ----------
function initAdminLogin() {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('adminUser').value.trim();
    const p = document.getElementById('adminPass').value.trim();
    if (u === 'admin' && p === '1234') {
      setAdminSession({ name: 'Admin', email: 'admin@pawcare.com' });
      showToast('Welcome, Admin!', 'success');
      setTimeout(() => location.href = 'dashboard.html', 500);
    } else {
      showToast('Invalid admin credentials', 'error');
    }
  });
}

// ---------- DASHBOARD ----------
function initAdminDashboard() {
  if (!requireAdmin()) return;
  renderAdminShell('dashboard');

  const pets = getPets();
  const requests = getRequests();
  const users = getUsers();
  const adoptions = getAdoptions();

  const totalPets = pets.length;
  const available = pets.filter(p => p.status === 'Available').length;
  const adopted = pets.filter(p => p.status === 'Adopted').length;
  const pending = requests.filter(r => r.status === 'PENDING').length;
  const approved = requests.filter(r => r.status === 'APPROVED').length;
  const totalUsers = users.length;

  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon blue"><i class="fas fa-paw"></i></div>
      <div class="stat-info"><h4>Total Pets</h4><div class="num">${totalPets}</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
      <div class="stat-info"><h4>Available</h4><div class="num">${available}</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon purple"><i class="fas fa-home"></i></div>
      <div class="stat-info"><h4>Adopted</h4><div class="num">${adopted}</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
      <div class="stat-info"><h4>Pending</h4><div class="num">${pending}</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><i class="fas fa-thumbs-up"></i></div>
      <div class="stat-info"><h4>Approved</h4><div class="num">${approved}</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon teal"><i class="fas fa-users"></i></div>
      <div class="stat-info"><h4>Users</h4><div class="num">${totalUsers}</div></div>
    </div>
  `;

  // Recent requests
  const recentReqs = requests.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  document.getElementById('recentRequests').innerHTML = recentReqs.length
    ? recentReqs.map(r => `
      <tr>
        <td><strong>${escapeHtml(r.id)}</strong></td>
        <td>${escapeHtml(r.userName || r.fullName)}</td>
        <td>${escapeHtml(r.petName)}</td>
        <td>${escapeHtml(r.date)}</td>
        <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
      </tr>
    `).join('')
    : `<tr><td colspan="5" style="text-align:center;color:var(--secondary);padding:2rem">No requests yet</td></tr>`;

  // Recently added pets
  const recentPets = pets.slice(-4).reverse();
  document.getElementById('recentPets').innerHTML = recentPets.map(p => `
    <div style="display:flex;gap:.8rem;align-items:center;padding:.7rem 0;border-bottom:1px solid var(--gray-border)">
      <img src="${p.image}" class="table-pet-img" alt="${escapeHtml(p.name)}">
      <div style="flex:1">
        <strong style="font-size:.9rem">${escapeHtml(p.name)}</strong>
        <div style="font-size:.78rem;color:var(--secondary)">${escapeHtml(p.type)} · ${escapeHtml(p.location)}</div>
      </div>
      <span class="badge badge-${p.status.toLowerCase().replace(' ', '-')}">${p.status}</span>
    </div>
  `).join('');

  // Simple adoption chart (bar chart via divs)
  drawAdoptionChart(pets);
}

function drawAdoptionChart(pets) {
  const el = document.getElementById('adoptionChart');
  if (!el) return;
  const total = pets.length || 1;
  const available = pets.filter(p => p.status === 'Available').length;
  const pending = pets.filter(p => p.status === 'Pending Adoption').length;
  const adopted = pets.filter(p => p.status === 'Adopted').length;
  const items = [
    { label: 'Available', val: available, color: 'var(--success)' },
    { label: 'Pending', val: pending, color: 'var(--warning)' },
    { label: 'Adopted', val: adopted, color: 'var(--primary)' }
  ];
  el.innerHTML = items.map(i => `
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:.3rem">
        <span>${i.label}</span><strong>${i.val}</strong>
      </div>
      <div style="background:var(--gray);height:8px;border-radius:50px;overflow:hidden">
        <div style="width:${(i.val / total) * 100}%;height:100%;background:${i.color};border-radius:50px;transition:width .8s ease"></div>
      </div>
    </div>
  `).join('');
}

// ---------- MANAGE PETS ----------
function initAdminPets() {
  if (!requireAdmin()) return;
  renderAdminShell('pets');
  renderAdminPetsTable();
}

function renderAdminPetsTable() {
  const tbody = document.getElementById('petsTableBody');
  if (!tbody) return;
  const pets = getPets();

  if (pets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fas fa-paw"></i><h3>No pets yet</h3><p>Click "Add Pet" to get started.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = pets.map(p => {
    const badgeCls = p.status === 'Adopted' ? 'badge-adopted' : (p.status === 'Pending Adoption' ? 'badge-pending' : 'badge-available');
    return `
      <tr>
        <td><img src="${p.image}" class="table-pet-img" alt="${escapeHtml(p.name)}"></td>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${escapeHtml(p.breed)}</td>
        <td>${escapeHtml(p.age)}</td>
        <td>${escapeHtml(p.gender)}</td>
        <td>${escapeHtml(p.location)}</td>
        <td><span class="badge ${badgeCls}">${p.status}</span></td>
        <td>
          <div style="display:flex;gap:.3rem">
            <button class="btn btn-outline btn-sm btn-icon" onclick="adminViewPet(${p.id})" title="View"><i class="fas fa-eye"></i></button>
            <button class="btn btn-outline btn-sm btn-icon" onclick="openEditPetModal(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="confirmDeletePet(${p.id})" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddPetModal() {
  document.getElementById('petModalTitle').textContent = 'Add Pet';
  document.getElementById('petForm').reset();
  document.getElementById('petFormId').value = '';
  openAdminModal('petModal');
}

function openEditPetModal(id) {
  const p = getPetById(id);
  if (!p) return;
  document.getElementById('petModalTitle').textContent = 'Edit Pet';
  document.getElementById('petFormId').value = p.id;
  document.getElementById('pfName').value = p.name;
  document.getElementById('pfType').value = p.type;
  document.getElementById('pfBreed').value = p.breed;
  document.getElementById('pfAge').value = p.age;
  document.getElementById('pfGender').value = p.gender;
  document.getElementById('pfLocation').value = p.location;
  document.getElementById('pfVaccinated').value = p.vaccinated;
  document.getElementById('pfHealth').value = p.health;
  document.getElementById('pfTemperament').value = p.temperament;
  document.getElementById('pfDescription').value = p.description;
  document.getElementById('pfImage').value = p.image;
  document.getElementById('pfStatus').value = p.status;
  openAdminModal('petModal');
}

function savePetForm(e) {
  e.preventDefault();
  const id = document.getElementById('petFormId').value;
  const pets = getPets();

  const data = {
    name: document.getElementById('pfName').value.trim(),
    type: document.getElementById('pfType').value,
    breed: document.getElementById('pfBreed').value.trim() || 'Mixed',
    age: document.getElementById('pfAge').value.trim(),
    gender: document.getElementById('pfGender').value,
    location: document.getElementById('pfLocation').value,
    vaccinated: document.getElementById('pfVaccinated').value,
    health: document.getElementById('pfHealth').value.trim() || 'Healthy',
    temperament: document.getElementById('pfTemperament').value.trim() || 'Friendly',
    description: document.getElementById('pfDescription').value.trim() || 'A lovely pet looking for a home.',
    image: document.getElementById('pfImage').value.trim() || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80',
    status: document.getElementById('pfStatus').value
  };

  if (id) {
    const idx = pets.findIndex(p => p.id === parseInt(id));
    if (idx !== -1) pets[idx] = { ...pets[idx], ...data };
    showToast('Pet updated ✅', 'success');
  } else {
    const newId = pets.length ? Math.max(...pets.map(p => p.id)) + 1 : 1;
    pets.push({ id: newId, ...data });
    showToast('Pet added ✅', 'success');
  }
  savePets(pets);
  closeAdminModal('petModal');
  renderAdminPetsTable();
}

function confirmDeletePet(id) {
  const p = getPetById(id);
  if (!p) return;
  document.getElementById('confirmTitle').textContent = 'Delete Pet';
  document.getElementById('confirmMsg').textContent = `Delete "${p.name}" permanently? This cannot be undone.`;
  document.getElementById('confirmYes').onclick = () => {
    const pets = getPets().filter(x => x.id !== id);
    savePets(pets);
    showToast('Pet deleted', 'info');
    closeAdminModal('confirmModal');
    renderAdminPetsTable();
  };
  openAdminModal('confirmModal');
}

function adminViewPet(id) {
  const p = getPetById(id);
  if (!p) return;
  document.getElementById('viewPetContent').innerHTML = `
    <img src="${p.image}" style="width:100%;height:220px;object-fit:cover;border-radius:12px;margin-bottom:1rem" alt="${escapeHtml(p.name)}">
    <h2 style="font-size:1.3rem;margin-bottom:.3rem">${escapeHtml(p.name)}</h2>
    <div style="color:var(--secondary);margin-bottom:1rem;font-size:.9rem">${escapeHtml(p.type)} · ${escapeHtml(p.breed)}</div>
    <div class="form-row" style="margin-bottom:1rem">
      <div><small style="color:var(--secondary)">Age</small><div><strong>${escapeHtml(p.age)}</strong></div></div>
      <div><small style="color:var(--secondary)">Gender</small><div><strong>${escapeHtml(p.gender)}</strong></div></div>
      <div><small style="color:var(--secondary)">Location</small><div><strong>${escapeHtml(p.location)}</strong></div></div>
      <div><small style="color:var(--secondary)">Vaccinated</small><div><strong>${escapeHtml(p.vaccinated)}</strong></div></div>
      <div><small style="color:var(--secondary)">Health</small><div><strong>${escapeHtml(p.health)}</strong></div></div>
      <div><small style="color:var(--secondary)">Status</small><div><strong>${escapeHtml(p.status)}</strong></div></div>
    </div>
    <p style="color:var(--secondary)">${escapeHtml(p.description)}</p>
  `;
  openAdminModal('viewPetModal');
}

// ---------- ADOPTION REQUESTS ----------
function initAdminRequests() {
  if (!requireAdmin()) return;
  renderAdminShell('requests');
  renderAdminRequests();
}

function renderAdminRequests() {
  const tbody = document.getElementById('requestsTableBody');
  if (!tbody) return;
  const reqs = getRequests().sort((a, b) => b.timestamp - a.timestamp);

  if (reqs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-clipboard-list"></i><h3>No requests yet</h3></div></td></tr>`;
    return;
  }

  tbody.innerHTML = reqs.map(r => `
    <tr>
      <td><strong>${escapeHtml(r.id)}</strong></td>
      <td>${escapeHtml(r.fullName)}<div style="font-size:.75rem;color:var(--secondary)">${escapeHtml(r.email)}</div></td>
      <td>${escapeHtml(r.petName)}</td>
      <td>${escapeHtml(r.date)}</td>
      <td>${escapeHtml(r.phone)}</td>
      <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
      <td>
        <div style="display:flex;gap:.3rem;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="viewRequest('${r.id}')">View</button>
          ${r.status === 'PENDING' || r.status === 'UNDER REVIEW' ? `
            <button class="btn btn-success btn-sm" onclick="confirmRequestAction('${r.id}', 'APPROVED')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="confirmRequestAction('${r.id}', 'REJECTED')">Reject</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function viewRequest(id) {
  const r = getRequests().find(x => x.id === id);
  if (!r) return;
  document.getElementById('viewRequestContent').innerHTML = `
    <h2 style="font-size:1.25rem;margin-bottom:1rem">Request ${escapeHtml(r.id)}</h2>
    <div class="form-row" style="margin-bottom:1rem">
      <div><small style="color:var(--secondary)">Applicant</small><div><strong>${escapeHtml(r.fullName)}</strong></div></div>
      <div><small style="color:var(--secondary)">Pet</small><div><strong>${escapeHtml(r.petName)}</strong></div></div>
      <div><small style="color:var(--secondary)">Email</small><div>${escapeHtml(r.email)}</div></div>
      <div><small style="color:var(--secondary)">Phone</small><div>${escapeHtml(r.phone)}</div></div>
      <div><small style="color:var(--secondary)">City</small><div>${escapeHtml(r.city || '-')}</div></div>
      <div><small style="color:var(--secondary)">Home Type</small><div>${escapeHtml(r.homeType || '-')}</div></div>
      <div><small style="color:var(--secondary)">Occupation</small><div>${escapeHtml(r.occupation || '-')}</div></div>
      <div><small style="color:var(--secondary)">Other Pets</small><div>${escapeHtml(r.otherPets || 'No')}</div></div>
    </div>
    <div style="margin-bottom:1rem">
      <small style="color:var(--secondary)">Address</small>
      <div>${escapeHtml(r.address || '-')}</div>
    </div>
    <div style="margin-bottom:1rem">
      <small style="color:var(--secondary)">Reason</small>
      <div style="background:var(--gray);padding:.8rem;border-radius:8px;margin-top:.3rem">${escapeHtml(r.reason)}</div>
    </div>
    <div>
      <small style="color:var(--secondary)">Status</small>
      <div style="margin-top:.3rem"><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></div>
    </div>
  `;
  openAdminModal('viewRequestModal');
}

function confirmRequestAction(id, action) {
  const verb = action === 'APPROVED' ? 'approve' : 'reject';
  document.getElementById('confirmTitle').textContent = action === 'APPROVED' ? 'Approve Request' : 'Reject Request';
  document.getElementById('confirmMsg').textContent = `Are you sure you want to ${verb} this adoption request?`;
  document.getElementById('confirmYes').onclick = () => {
    applyRequestAction(id, action);
    closeAdminModal('confirmModal');
  };
  openAdminModal('confirmModal');
}

function applyRequestAction(id, action) {
  const reqs = getRequests();
  const r = reqs.find(x => x.id === id);
  if (!r) return;
  r.status = action;

  if (action === 'APPROVED') {
    // Mark pet as adopted
    const pets = getPets();
    const p = pets.find(x => x.id === r.petId);
    if (p) { p.status = 'Adopted'; savePets(pets); }

    // Add adoption record
    const records = getAdoptions();
    records.push({
      id: 'ADP-' + Date.now().toString().slice(-6),
      requestId: r.id,
      petId: r.petId,
      petName: r.petName,
      petImage: r.petImage,
      adopterName: r.fullName,
      adopterEmail: r.email,
      adopterPhone: r.phone,
      adoptionDate: formatDate(),
      status: 'Completed'
    });
    saveAdoptions(records);

    showToast('Request approved & pet marked Adopted', 'success');
  } else {
    // If rejecting, mark pet back to Available (if it was pending)
    const pets = getPets();
    const p = pets.find(x => x.id === r.petId);
    if (p && p.status === 'Pending Adoption') { p.status = 'Available'; savePets(pets); }
    showToast('Request rejected', 'info');
  }

  saveRequests(reqs);
  renderAdminRequests();
}

// ---------- ADOPTION RECORDS ----------
function initAdminRecords() {
  if (!requireAdmin()) return;
  renderAdminShell('records');
  renderRecords();
}

function renderRecords() {
  const tbody = document.getElementById('recordsTableBody');
  if (!tbody) return;
  const records = getAdoptions().sort((a, b) => b.requestId.localeCompare(a.requestId));
  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-file-alt"></i><h3>No adoption records yet</h3><p>Approved requests appear here.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = records.map(r => `
    <tr>
      <td><strong>${escapeHtml(r.id)}</strong></td>
      <td style="display:flex;align-items:center;gap:.6rem">
        <img src="${r.petImage}" class="table-pet-img" alt="${escapeHtml(r.petName)}">
        <span>${escapeHtml(r.petName)}</span>
      </td>
      <td>${escapeHtml(r.adopterName)}</td>
      <td>${escapeHtml(r.adoptionDate)}</td>
      <td><span class="badge badge-approved">${r.status}</span></td>
      <td>${escapeHtml(r.adopterPhone)}</td>
      <td><button class="btn btn-outline btn-sm" onclick="viewRecord('${r.id}')">Details</button></td>
    </tr>
  `).join('');
}

function viewRecord(id) {
  const r = getAdoptions().find(x => x.id === id);
  if (!r) return;
  document.getElementById('viewRecordContent').innerHTML = `
    <h2 style="margin-bottom:1rem">Adoption ${escapeHtml(r.id)}</h2>
    <img src="${r.petImage}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:1rem" alt="${escapeHtml(r.petName)}">
    <div class="form-row">
      <div><small style="color:var(--secondary)">Pet</small><div><strong>${escapeHtml(r.petName)}</strong></div></div>
      <div><small style="color:var(--secondary)">Adopter</small><div><strong>${escapeHtml(r.adopterName)}</strong></div></div>
      <div><small style="color:var(--secondary)">Email</small><div>${escapeHtml(r.adopterEmail)}</div></div>
      <div><small style="color:var(--secondary)">Phone</small><div>${escapeHtml(r.adopterPhone)}</div></div>
      <div><small style="color:var(--secondary)">Adoption Date</small><div>${escapeHtml(r.adoptionDate)}</div></div>
      <div><small style="color:var(--secondary)">Status</small><div><span class="badge badge-approved">${r.status}</span></div></div>
    </div>
  `;
  openAdminModal('viewRecordModal');
}

// ---------- USERS ----------
function initAdminUsers() {
  if (!requireAdmin()) return;
  renderAdminShell('users');
  renderUsers();
}

function renderUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  const users = getUsers();
  const reqs = getRequests();

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-users"></i><h3>No users registered</h3></div></td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const count = reqs.filter(r => r.userEmail === u.email).length;
    return `
      <tr>
        <td><div style="display:flex;align-items:center;gap:.6rem">
          <div class="admin-avatar" style="width:32px;height:32px;font-size:.8rem">${escapeHtml(u.name[0])}</div>
          <strong>${escapeHtml(u.name)}</strong>
        </div></td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone || '-')}</td>
        <td>${escapeHtml(u.joined || '-')}</td>
        <td>${count}</td>
        <td><span class="badge badge-approved">Active</span></td>
        <td><button class="btn btn-outline btn-sm" onclick="viewUser('${escapeHtml(u.email)}')">View</button></td>
      </tr>
    `;
  }).join('');
}

function viewUser(email) {
  const u = getUsers().find(x => x.email === email);
  if (!u) return;
  const reqs = getRequests().filter(r => r.userEmail === email);
  document.getElementById('viewUserContent').innerHTML = `
    <h2 style="margin-bottom:1rem">User Details</h2>
    <div class="form-row">
      <div><small style="color:var(--secondary)">Name</small><div><strong>${escapeHtml(u.name)}</strong></div></div>
      <div><small style="color:var(--secondary)">Email</small><div>${escapeHtml(u.email)}</div></div>
      <div><small style="color:var(--secondary)">Phone</small><div>${escapeHtml(u.phone || '-')}</div></div>
      <div><small style="color:var(--secondary)">Joined</small><div>${escapeHtml(u.joined || '-')}</div></div>
    </div>
    <div style="margin-top:1rem">
      <small style="color:var(--secondary)">Address</small>
      <div>${escapeHtml(u.address || '-')}</div>
    </div>
    <div style="margin-top:1rem">
      <h3 style="font-size:1rem;margin-bottom:.5rem">Adoption Requests (${reqs.length})</h3>
      ${reqs.length ? reqs.map(r => `
        <div style="display:flex;justify-content:space-between;padding:.6rem 0;border-bottom:1px solid var(--gray-border);font-size:.85rem">
          <span>${escapeHtml(r.petName)} <small style="color:var(--secondary)">· ${r.id}</small></span>
          <span class="badge badge-${r.status.toLowerCase()}">${r.status}</span>
        </div>
      `).join('') : '<p style="color:var(--secondary);font-size:.85rem">No requests</p>'}
    </div>
  `;
  openAdminModal('viewUserModal');
}

// ---------- SETTINGS ----------
function initAdminSettings() {
  if (!requireAdmin()) return;
  renderAdminShell('settings');
}

function saveSettings(e) {
  e.preventDefault();
  showToast('Settings saved', 'success');
}

function resetAllData() {
  document.getElementById('confirmTitle').textContent = 'Reset All Data';
  document.getElementById('confirmMsg').textContent = 'This will erase all pets, requests, users, and records. Continue?';
  document.getElementById('confirmYes').onclick = () => {
    localStorage.clear();
    sessionStorage.clear();
    showToast('All data reset', 'info');
    setTimeout(() => location.href = 'login.html', 800);
  };
  openAdminModal('confirmModal');
}

// ---------- MODAL ----------
function openAdminModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeAdminModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
});