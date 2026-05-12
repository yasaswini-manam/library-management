// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let token = null;
let username = '';
let role = '';
let baseUrl = 'http://localhost:8080/api';
let currentBooksTab = 'all';
let currentIssuesTab = 'all';

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('lib_token');
  if (saved) {
    token = saved;
    username = sessionStorage.getItem('lib_user') || '';
    role = sessionStorage.getItem('lib_role') || '';
    baseUrl = document.getElementById('api-base-url').value;
    showApp();
    navigate('dashboard');
  } else {
    showLogin();
  }
});

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────
function fillCreds(u, p) {
  document.getElementById('login-username').value = u;
  document.getElementById('login-password').value = p;
}

async function doLogin() {
  baseUrl = document.getElementById('api-base-url').value.replace(/\/$/, '');
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('btn-login');

  if (!u || !p) { errEl.textContent = 'Please enter credentials.'; return; }

  btn.disabled = true; btn.textContent = 'Signing in…';
  errEl.textContent = '';

  try {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    token = data.data?.token || data.token;
    username = u;
    // infer role from username (or parse JWT)
    role = u === 'librarian' ? 'LIBRARIAN' : 'MEMBER';
    sessionStorage.setItem('lib_token', token);
    sessionStorage.setItem('lib_user', username);
    sessionStorage.setItem('lib_role', role);

    showApp();
    navigate('dashboard');
    toast('Welcome back, ' + username + '!', 'success');
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Sign In →';
  }
}

function logout() {
  token = null; username = ''; role = '';
  sessionStorage.clear();
  showLogin();
}

function showLogin() {
  document.getElementById('login-view').classList.add('show');
  document.getElementById('app-shell').style.display = 'none';
}

function showApp() {
  document.getElementById('login-view').classList.remove('show');
  const shell = document.getElementById('app-shell');
  shell.style.display = 'flex';

  document.getElementById('sidebar-user').classList.add('show');
  document.getElementById('btn-logout').classList.add('show');
  document.getElementById('user-name-display').textContent = username;
  document.getElementById('user-role-display').textContent = role === 'LIBRARIAN' ? 'Librarian' : 'Member';
  document.getElementById('user-avatar').textContent = username.slice(0, 2).toUpperCase();

  // Hide add buttons for non-librarians
  const isLibrarian = role === 'LIBRARIAN';
  ['btn-add-book', 'btn-add-member'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isLibrarian ? '' : 'none';
  });
  const issueNav = document.querySelector('[data-view="issue-book"]');
  if (issueNav) issueNav.style.display = isLibrarian ? '' : 'none';
}

// ─────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: 'Dashboard', books: 'Book Catalog',
  members: 'Members', issues: 'Issue Records', 'issue-book': 'Issue a Book'
};

function navigate(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('show'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const view = document.getElementById('view-' + viewId);
  if (view) view.classList.add('show');

  const navItem = document.querySelector(`[data-view="${viewId}"]`);
  if (navItem) navItem.classList.add('active');

  document.getElementById('topbar-title').textContent = PAGE_TITLES[viewId] || viewId;
  document.getElementById('topbar-meta').textContent = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Load data
  if (viewId === 'dashboard') loadDashboard();
  else if (viewId === 'books') loadBooks();
  else if (viewId === 'members') loadMembers();
  else if (viewId === 'issues') loadIssues();
  else if (viewId === 'issue-book') loadIssueForm();
}

// ─────────────────────────────────────────────
//  API HELPER
// ─────────────────────────────────────────────
async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(baseUrl + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────
async function loadDashboard() {
  try {
    const [books, avail, members, activeIssues, allIssues] = await Promise.all([
      api('/books'), api('/books/available'), api('/members'),
      api('/issues/active'), api('/issues')
    ]);

    const bs = books.data || [], av = avail.data || [], ms = members.data || [],
          ai = activeIssues.data || [], all = allIssues.data || [];

    document.getElementById('stat-total-books').textContent  = bs.length;
    document.getElementById('stat-available').textContent    = av.length;
    document.getElementById('stat-members').textContent      = ms.length;
    document.getElementById('stat-active-issues').textContent = ai.length;

    // Recent issues (last 8)
    const recentIssues = [...all].reverse().slice(0, 8);
    const rtbody = document.getElementById('recent-issues-tbody');
    rtbody.innerHTML = recentIssues.length ? recentIssues.map(i => `
      <tr>
        <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i.bookTitle || i.book?.title || '—'}</td>
        <td>${i.memberName || i.member?.name || '—'}</td>
        <td style="font-family:'DM Mono',monospace;font-size:12px;">${i.issueDate || '—'}</td>
        <td><span class="badge ${i.status === 'ACTIVE' ? 'badge-amber' : 'badge-green'}">${i.status}</span></td>
      </tr>`).join('') : `<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📭</div><p>No records yet</p></div></td></tr>`;

    // Available books (first 8)
    const avSlice = av.slice(0, 8);
    const avbody = document.getElementById('dash-avail-tbody');
    avbody.innerHTML = avSlice.length ? avSlice.map(b => `
      <tr>
        <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.title}</td>
        <td style="color:var(--warm);">${b.author}</td>
      </tr>`).join('') : `<tr><td colspan="2"><div class="empty-state"><div class="empty-icon">📚</div><p>No books available</p></div></td></tr>`;

  } catch (err) { toast('Dashboard error: ' + err.message, 'error'); }
}

// ─────────────────────────────────────────────
//  BOOKS
// ─────────────────────────────────────────────
async function loadBooks() {
  const tbody = document.getElementById('books-tbody');
  tbody.innerHTML = `<tr><td colspan="6"><div class="loading">LOADING...</div></td></tr>`;
  try {
    let endpoint = '/books';
    if (currentBooksTab === 'available') endpoint = '/books/available';
    const res = await api(endpoint);
    renderBooks(res.data || []);
  } catch (err) { toast(err.message, 'error'); }
}

function renderBooks(books) {
  const tbody = document.getElementById('books-tbody');
  const isLib = role === 'LIBRARIAN';
  if (!books.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📚</div><p>No books found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = books.map((b, i) => `
    <tr>
      <td style="font-family:'DM Mono',monospace;color:var(--warm);font-size:12px;">${i + 1}</td>
      <td><strong>${b.title}</strong></td>
      <td style="color:var(--warm);">${b.author}</td>
      <td style="font-family:'DM Mono',monospace;font-size:11px;">${b.isbn || '—'}</td>
      <td><span class="badge ${b.available ? 'badge-green' : 'badge-red'}">${b.available ? 'Available' : 'Issued'}</span></td>
      <td>${isLib ? `<button class="btn btn-sm btn-danger" onclick="deleteBook(${b.bookId})">Delete</button>` : '—'}</td>
    </tr>`).join('');
}

function switchBooksTab(tab, el) {
  currentBooksTab = tab;
  document.querySelectorAll('#view-books .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const sw = document.getElementById('books-search-kw');
  const sb = document.getElementById('books-search-btn');
  if (tab === 'search') { sw.style.display = ''; sb.style.display = ''; }
  else { sw.style.display = 'none'; sb.style.display = 'none'; loadBooks(); }
}

async function searchBooks() {
  const kw = document.getElementById('books-search-kw').value.trim();
  if (!kw) { loadBooks(); return; }
  const tbody = document.getElementById('books-tbody');
  tbody.innerHTML = `<tr><td colspan="6"><div class="loading">SEARCHING...</div></td></tr>`;
  try {
    const res = await api(`/books/search?keyword=${encodeURIComponent(kw)}`);
    renderBooks(res.data || []);
  } catch (err) { toast(err.message, 'error'); }
}

document.getElementById('books-search-kw')?.addEventListener('keydown', e => { if (e.key === 'Enter') searchBooks(); });

async function addBook() {
  const title  = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const isbn   = document.getElementById('book-isbn').value.trim();
  if (!title || !author || !isbn) { toast('All fields are required', 'error'); return; }
  try {
    await api('/books', 'POST', { title, author, isbn });
    closeModal('modal-add-book');
    ['book-title','book-author','book-isbn'].forEach(id => document.getElementById(id).value = '');
    toast('Book added successfully!', 'success');
    loadBooks();
  } catch (err) { toast(err.message, 'error'); }
}

async function deleteBook(id) {
  if (!confirm('Delete this book?')) return;
  try {
    await api(`/books/${id}`, 'DELETE');
    toast('Book deleted', 'success');
    loadBooks();
  } catch (err) { toast(err.message, 'error'); }
}

// ─────────────────────────────────────────────
//  MEMBERS
// ─────────────────────────────────────────────
async function loadMembers() {
  const tbody = document.getElementById('members-tbody');
  tbody.innerHTML = `<tr><td colspan="5"><div class="loading">LOADING...</div></td></tr>`;
  try {
    const res = await api('/members');
    const members = res.data || [];
    const isLib = role === 'LIBRARIAN';
    if (!members.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">👥</div><p>No members yet</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = members.map((m, i) => `
      <tr>
        <td style="font-family:'DM Mono',monospace;color:var(--warm);font-size:12px;">${i + 1}</td>
        <td><strong>${m.name}</strong></td>
        <td style="color:var(--warm);">${m.email}</td>
        <td style="font-family:'DM Mono',monospace;font-size:12px;">${m.phone || '—'}</td>
        <td><button class="btn btn-sm btn-outline" onclick="viewMemberIssues(${m.memberId},'${m.name}')">View Issues</button></td>
      </tr>`).join('');
  } catch (err) { toast(err.message, 'error'); }
}

async function addMember() {
  const name  = document.getElementById('member-name').value.trim();
  const email = document.getElementById('member-email').value.trim();
  const phone = document.getElementById('member-phone').value.trim();
  if (!name || !email) { toast('Name and email are required', 'error'); return; }
  try {
    await api('/members', 'POST', { name, email, phone });
    closeModal('modal-add-member');
    ['member-name','member-email','member-phone'].forEach(id => document.getElementById(id).value = '');
    toast('Member registered!', 'success');
    loadMembers();
  } catch (err) { toast(err.message, 'error'); }
}

async function viewMemberIssues(memberId, memberName) {
  document.getElementById('member-issues-title').textContent = `Issues — ${memberName}`;
  document.getElementById('member-issues-tbody').innerHTML = `<tr><td colspan="4"><div class="loading">LOADING...</div></td></tr>`;
  openModal('modal-member-issues');
  try {
    const res = await api(`/members/${memberId}/issues`);
    const issues = res.data || [];
    const tbody = document.getElementById('member-issues-tbody');
    if (!issues.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📭</div><p>No issues for this member</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = issues.map(i => `
      <tr>
        <td>${i.bookTitle || i.book?.title || '—'}</td>
        <td style="font-family:'DM Mono',monospace;font-size:12px;">${i.issueDate || '—'}</td>
        <td style="font-family:'DM Mono',monospace;font-size:12px;">${i.returnDate || '—'}</td>
        <td><span class="badge ${i.status === 'ACTIVE' ? 'badge-amber' : 'badge-green'}">${i.status}</span></td>
      </tr>`).join('');
  } catch (err) { toast(err.message, 'error'); }
}

// ─────────────────────────────────────────────
//  ISSUES
// ─────────────────────────────────────────────
async function loadIssues() {
  const tbody = document.getElementById('issues-tbody');
  tbody.innerHTML = `<tr><td colspan="7"><div class="loading">LOADING...</div></td></tr>`;
  try {
    const endpoint = currentIssuesTab === 'active' ? '/issues/active' : '/issues';
    const res = await api(endpoint);
    const issues = res.data || [];
    const isLib = role === 'LIBRARIAN';
    if (!issues.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📋</div><p>No records found</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = issues.map((i, idx) => `
      <tr>
        <td style="font-family:'DM Mono',monospace;color:var(--warm);font-size:12px;">${i.issueId || idx+1}</td>
        <td><strong>${i.bookTitle || i.book?.title || '—'}</strong></td>
        <td>${i.memberName || i.member?.name || '—'}</td>
        <td style="font-family:'DM Mono',monospace;font-size:12px;">${i.issueDate || '—'}</td>
        <td style="font-family:'DM Mono',monospace;font-size:12px;">${i.returnDate || '—'}</td>
        <td><span class="badge ${i.status === 'ACTIVE' ? 'badge-amber' : 'badge-green'}">${i.status}</span></td>
        <td>${isLib && i.status === 'ACTIVE'
          ? `<button class="btn btn-sm btn-primary" onclick="returnBook(${i.issueId})">Return</button>`
          : '—'}</td>
      </tr>`).join('');
  } catch (err) { toast(err.message, 'error'); }
}

function switchIssuesTab(tab, el) {
  currentIssuesTab = tab;
  document.querySelectorAll('#view-issues .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  loadIssues();
}

async function returnBook(issueId) {
  if (!confirm('Mark this book as returned?')) return;
  try {
    await api(`/issues/return/${issueId}`, 'PUT');
    toast('Book returned successfully!', 'success');
    loadIssues();
  } catch (err) { toast(err.message, 'error'); }
}

// ─────────────────────────────────────────────
//  ISSUE FORM
// ─────────────────────────────────────────────
async function loadIssueForm() {
  try {
    const [membersRes, booksRes] = await Promise.all([api('/members'), api('/books/available')]);
    const members = membersRes.data || [];
    const books   = booksRes.data || [];

    const mSel = document.getElementById('issue-member-select');
    const bSel = document.getElementById('issue-book-select');

    mSel.innerHTML = `<option value="">— Select a Member —</option>` +
      members.map(m => `<option value="${m.memberId}">${m.name} (${m.email})</option>`).join('');

    bSel.innerHTML = `<option value="">— Select a Book —</option>` +
      books.map(b => `<option value="${b.bookId}">${b.title} · ${b.author}</option>`).join('');
  } catch (err) { toast(err.message, 'error'); }
}

async function issueBook() {
  const memberId = document.getElementById('issue-member-select').value;
  const bookId   = document.getElementById('issue-book-select').value;
  if (!memberId || !bookId) { toast('Please select both a member and a book', 'error'); return; }
  try {
    await api('/issues/issue', 'POST', { memberId: +memberId, bookId: +bookId });
    toast('Book issued successfully!', 'success');
    loadIssueForm(); // refresh selects
    navigate('issues');
  } catch (err) { toast(err.message, 'error'); }
}

// ─────────────────────────────────────────────
//  MODAL / TOAST HELPERS
// ─────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
});

let toastTimer = {};
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = 'all 0.3s'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ─────────────────────────────────────────────
//  KEYBOARD SHORTCUTS
// ─────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
});
