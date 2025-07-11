let allPlaylists = [];
let allVideos = [];
let currentPage = 1;
const itemsPerPage = 9;

// Render kartu berdasarkan data yang difilter dan halaman saat ini
function renderCards(items) {
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = items.slice(start, start + itemsPerPage);

  const html = paginated.map(item => {
    const isVideo = !!item.id.videoId;
    const title = item.snippet.title;
    const description = item.snippet.description || '-';
    const thumbnail = item.snippet.thumbnails?.medium?.url || '';
    const link = isVideo
      ? `https://www.youtube.com/watch?v=${item.id.videoId}`
      : `https://www.youtube.com/playlist?list=${item.id}`;
    const date = isVideo
      ? new Date(item.snippet.publishedAt).toLocaleDateString('id-ID')
      : '';
    const label = isVideo ? 'Tonton Video' : 'Lihat Playlist';

    return `
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <img src="${thumbnail}" alt="Thumbnail" width="320" height="180" class="img-thumbnail mb-2">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title playlist-title">${title}</h5>
            ${date ? `<small class="text-muted mb-2">📅 ${date}</small>` : ''}
            <p class="card-text">${description}</p>
            <a href="${link}" target="_blank" class="btn btn-sm btn-primary mt-auto">${label}</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('cardContainer').innerHTML = html;
  renderPagination(items.length);
}

// Render navigasi pagination
function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagination = Array.from({ length: totalPages }, (_, i) => {
    const page = i + 1;
    return `
      <li class="page-item ${page === currentPage ? 'active' : ''}">
        <button class="page-link" onclick="goToPage(${page})">${page}</button>
      </li>
    `;
  }).join('');

  document.getElementById('pagination').innerHTML = pagination;
}

// Navigasi ke halaman tertentu
function goToPage(page) {
  currentPage = page;
  applyFilters();
}

// Terapkan pencarian dan filter kategori
function applyFilters() {
  const category = document.getElementById('categoryFilter').value;
  const search = document.getElementById('searchInput').value.toLowerCase().trim();

  let filtered = (category === 'playlist')
    ? allPlaylists
    : (category === 'video')
    ? allVideos
    : [...allPlaylists, ...allVideos];

  if (['matematika', 'kimia', 'fisika'].includes(category)) {
    filtered = filtered.filter(item =>
      item.snippet.title.toLowerCase().includes(category)
    );
  }

  if (search) {
    filtered = filtered.filter(item =>
      item.snippet.title.toLowerCase().includes(search)
    );
  }

  renderCards(filtered);
}

// Toggle mode gelap dan simpan preferensi
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
  updateDarkModeIcon();
}

function updateDarkModeIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('darkModeToggle').textContent = isDark ? '☀️' : '🌙';
}

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', () => {
  // Mode gelap otomatis
  if (
    localStorage.getItem('darkMode') === 'true' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    document.body.classList.add('dark-mode');
  }
  updateDarkModeIcon();

  // Ambil data
  Promise.all([
    fetch('cache/playlists.json').then(res => res.json()),
    fetch('cache/videos.json').then(res => res.json())
  ]).then(([playlists, videos]) => {
    allPlaylists = playlists;
    allVideos = videos;
    applyFilters();
  });

  // Event filter dan pencarian
  document.getElementById('categoryFilter').addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    applyFilters();
  });

  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
});
