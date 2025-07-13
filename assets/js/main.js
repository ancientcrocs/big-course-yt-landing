let allPlaylists = [];
let allVideos = [];
let currentPage = 1;
const itemsPerPage = 9;

// ========== Render Card ==========
function renderCards(items) {
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(start, start + itemsPerPage);

  const cardsHTML = paginatedItems.map((item, index) => {
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
        <div class="card h-100 shadow-sm card-animate" style="animation-delay: ${index * 50}ms">
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

  const container = document.getElementById('cardContainer');
  container.innerHTML = cardsHTML;
  renderPagination(items.length);
  smoothScrollTo(container);
}

// ========== Render Pagination ==========
function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxVisible = 2;
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

  let html = `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" data-page="${currentPage - 1}" aria-label="Sebelumnya">⏪</button>
    </li>

    <li class="page-item ${currentPage === 1 ? 'active' : ''}">
      <button class="page-link" data-page="1">1</button>
    </li>
  `;

  if (start > 2) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;

  for (let i = start; i <= end; i++) {
    html += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>
    `;
  }

  if (end < totalPages - 1) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;

  if (totalPages > 1) {
    html += `
      <li class="page-item ${currentPage === totalPages ? 'active' : ''}">
        <button class="page-link" data-page="${totalPages}">${totalPages}</button>
      </li>
    `;
  }

  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <button class="page-link" data-page="${currentPage + 1}" aria-label="Berikutnya">⏩</button>
    </li>
  `;

  document.getElementById('pagination').innerHTML = html;
}

// ========== Navigasi Halaman ==========
function goToPage(page) {
  const totalItems = [...allPlaylists, ...allVideos].length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    sessionStorage.setItem('currentPage', currentPage);
    applyFilters();
  }
}

// ========== Filter dan Pencarian ==========
function applyFilters() {
  const category = document.getElementById('categoryFilter').value;
  const search = document.getElementById('searchInput').value.toLowerCase().trim();

  let filtered =
    category === 'playlist' ? allPlaylists
    : category === 'video' ? allVideos
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

// ========== Scroll Smooth Ke Elemen ==========
function smoothScrollTo(el) {
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ========== Mode Gelap ==========
function updateDarkModeIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('darkModeToggle').textContent = isDark ? '☀️' : '🌙';
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  updateDarkModeIcon();
}

// ========== Inisialisasi ==========
document.addEventListener('DOMContentLoaded', () => {
  // Dark mode awal
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

    const savedPage = parseInt(sessionStorage.getItem('currentPage'), 10);
    if (!isNaN(savedPage)) currentPage = savedPage;

    applyFilters();
  });

  // Event listeners
  document.getElementById('categoryFilter').addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    applyFilters();
  });

  document.getElementById('pagination').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (btn && !btn.closest('.disabled')) {
      const page = parseInt(btn.dataset.page, 10);
      if (!isNaN(page)) goToPage(page);
    }
  });

  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
});
