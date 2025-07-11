let allPlaylists = [];
let allVideos = [];
let currentPage = 1;
const itemsPerPage = 9;

function renderCards(items) {
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(start, start + itemsPerPage);

  const cardsHTML = paginatedItems.map(item => {
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

  document.getElementById('cardContainer').innerHTML = cardsHTML;
  renderPagination(items.length);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let paginationHTML = '';

  // Tombol Previous
  paginationHTML += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" data-page="${currentPage - 1}" aria-label="Sebelumnya">⏪</button>
    </li>
  `;

  const maxVisible = 5;
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(2, currentPage - half);
  let end = Math.min(totalPages - 1, currentPage + half);

  if (currentPage <= half + 1) {
    start = 2;
    end = Math.min(totalPages - 1, maxVisible);
  } else if (currentPage >= totalPages - half) {
    start = Math.max(2, totalPages - maxVisible + 1);
    end = totalPages - 1;
  }

  // Selalu tampilkan halaman 1
  paginationHTML += `
    <li class="page-item ${currentPage === 1 ? 'active' : ''}">
      <button class="page-link" data-page="1">1</button>
    </li>
  `;

  // Ellipsis sebelum range
  if (start > 2) {
    paginationHTML += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
  }

  // Range halaman tengah
  for (let i = start; i <= end; i++) {
    paginationHTML += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>
    `;
  }

  // Ellipsis setelah range
  if (end < totalPages - 1) {
    paginationHTML += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
  }

  // Halaman terakhir
  if (totalPages > 1) {
    paginationHTML += `
      <li class="page-item ${currentPage === totalPages ? 'active' : ''}">
        <button class="page-link" data-page="${totalPages}">${totalPages}</button>
      </li>
    `;
  }

  // Tombol Next
  paginationHTML += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <button class="page-link" data-page="${currentPage + 1}" aria-label="Berikutnya">⏩</button>
    </li>
  `;

  document.getElementById('pagination').innerHTML = paginationHTML;
}

function goToPage(page) {
  const totalItems = [...allPlaylists, ...allVideos].length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    sessionStorage.setItem('currentPage', currentPage); // SIMPAN DI SINI
    applyFilters();
  }
}

function applyFilters() {
  const category = document.getElementById('categoryFilter').value;
  const search = document.getElementById('searchInput').value.toLowerCase().trim();

  let filtered = category === 'playlist'
    ? allPlaylists
    : category === 'video'
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

function updateDarkModeIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('darkModeToggle').textContent = isDark ? '☀️' : '🌙';
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  updateDarkModeIcon();
}

document.addEventListener('DOMContentLoaded', () => {
  // Mode gelap otomatis
  if (
    localStorage.getItem('darkMode') === 'true' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    document.body.classList.add('dark-mode');
  }
  updateDarkModeIcon();

  // Ambil data JSON
  Promise.all([
    fetch('cache/playlists.json').then(res => res.json()),
    fetch('cache/videos.json').then(res => res.json())
  ]).then(([playlists, videos]) => {
    allPlaylists = playlists;
    allVideos = videos;
    applyFilters();
  });

  // Filter kategori & pencarian
  document.getElementById('categoryFilter').addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    applyFilters();
  });

   // Ambil currentPage dari sessionStorage jika tersedia
  const savedPage = parseInt(sessionStorage.getItem('currentPage'), 10);
  if (!isNaN(savedPage)) {
    currentPage = savedPage;
  }

  // Event pagination
  document.getElementById('pagination').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (btn && !btn.closest('.disabled')) {
      const page = parseInt(btn.dataset.page, 10);
      if (!isNaN(page)) goToPage(page);
    }
  });

  // Dark mode toggle
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
});
