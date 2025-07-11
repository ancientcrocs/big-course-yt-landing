let allPlaylists = [];
let allVideos = [];
let currentPage = 1;
const itemsPerPage = 9;

function renderCards(items) {
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(start, start + itemsPerPage);

  const cards = paginatedItems.map(item => {
    const isVideo = !!item.id.videoId;
    const title = item.snippet.title;
    const description = item.snippet.description || '-';
    const thumbnail = item.snippet.thumbnails?.medium?.url || '';
    const link = isVideo
      ? `https://www.youtube.com/watch?v=${item.id.videoId}`
      : `https://www.youtube.com/playlist?list=${item.id}`;
    const date = isVideo ? new Date(item.snippet.publishedAt).toLocaleDateString('id-ID') : '';
    const label = isVideo ? 'Tonton Video' : 'Lihat Playlist';

    return `
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <img src="${thumbnail}" alt="Thumbnail" loading="lazy" width="320" height="180" class="img-thumbnail mb-2">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title playlist-title">${title}</h5>
            ${date ? `<small class="text-muted mb-2">📅 ${date}</small>` : ''}
            <p class="card-text">${description}</p>
            <a href="${link}" target="_blank" class="btn btn-sm btn-primary mt-auto">${label}</a>
          </div>
        </div>
      </div>
    `;
  });

  $('#cardContainer').html(cards.join(''));
  renderPagination(items.length);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let paginationHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><button class="page-link" onclick="goToPage(${i})">${i}</button></li>`;
  }

  $('#pagination').html(`
    <nav aria-label="Page navigation">
      <ul class="pagination justify-content-center">${paginationHTML}</ul>
    </nav>
  `);
}

function goToPage(page) {
  currentPage = page;
  applyFilters();
}

function applyFilters() {
  const category = $('#categoryFilter').val();
  const search = $('#searchInput').val().toLowerCase();

  let filtered = [];

  if (category === 'playlist') {
    filtered = allPlaylists;
  } else if (category === 'video') {
    filtered = allVideos;
  } else {
    filtered = [...allPlaylists, ...allVideos];
  }

  if (['matematika', 'kimia', 'fisika'].includes(category)) {
    filtered = filtered.filter(item =>
      item.snippet.title.toLowerCase().includes(category)
    );
  }

  if (search.trim() !== '') {
    filtered = filtered.filter(item =>
      item.snippet.title.toLowerCase().includes(search)
    );
  }

  renderCards(filtered);
}

$(document).ready(() => {
  Promise.all([
    fetch('cache/playlists.json').then(res => res.json()),
    fetch('cache/videos.json').then(res => res.json())
  ]).then(([playlists, videos]) => {
    allPlaylists = playlists;
    allVideos = videos;
    applyFilters(); // Render awal
  });

  $('#categoryFilter').on('change', () => {
    currentPage = 1;
    applyFilters();
  });
  $('#searchInput').on('input', () => {
    currentPage = 1;
    applyFilters();
  });
});

function updateDarkModeIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('darkModeToggle').innerText = isDark ? '☀️' : '🌙';
}

document.getElementById('darkModeToggle').addEventListener('click', function () {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  updateDarkModeIcon();
});

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }
  updateDarkModeIcon();
});
