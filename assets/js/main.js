let allPlaylists = [];
let dataTablePlaylist, dataTableVideo;

function showTable(type) {
  document.getElementById('playlistSection').classList.add('d-none');
  document.getElementById('videoSection').classList.add('d-none');
  if (type === 'playlist') {
    document.getElementById('playlistSection').classList.remove('d-none');
  } else {
    document.getElementById('videoSection').classList.remove('d-none');
  }
}

function filterCategory(category) {
  let filtered = allPlaylists;
  if (category !== 'all') {
    filtered = allPlaylists.filter(item =>
      item.snippet.title.toLowerCase().includes(category)
    );
  }
  renderPlaylistTable(filtered);
}

function renderPlaylistTable(items) {
  const rows = items.map(item => {
    const title = item.snippet.title;
    const description = item.snippet.description || '-';
    const playlistId = item.id;
    const videoCount = item.contentDetails?.itemCount || '-';
    const thumbnailUrl = item.snippet.thumbnails?.medium?.url || '';
    const link = `<a class="btn btn-sm btn-primary mt-1" href="https://www.youtube.com/playlist?list=${playlistId}" target="_blank">Lihat Playlist</a>`;

    return `
      <tr>
        <td><img src="${thumbnailUrl}" alt="Thumbnail" class="img-fluid" style="max-width: 120px;"></td>
        <td class="text-break" style="min-width: 200px;">
          ${title}<br>${link}
        </td>
        <td class="text-break" style="min-width: 200px;">${description}</td>
        <td class="text-center">${videoCount}</td>
      </tr>
    `;
  });

  if (dataTablePlaylist) dataTablePlaylist.clear().destroy();
  $('#playlistTable tbody').html(rows.join(''));
  dataTablePlaylist = $('#playlistTable').DataTable({
    responsive: true,
    layout: {
      topStart: {
        search: {
          placeholder: 'Cari playlist...',
          className: 'form-control form-control-sm'
        }
      },
      topEnd: {
        pageLength: {
          className: 'form-select form-select-sm'
        }
      }
    }
  });
}

function renderVideoTable(items) {
  const rows = items.map(item => {
    const title = item.snippet.title;
    const description = item.snippet.description || '-';
    const videoId = item.id.videoId;
    const publishDate = new Date(item.snippet.publishedAt).toLocaleDateString('id-ID');
    const thumbnail = item.snippet.thumbnails?.medium?.url || '';
    const link = `<a class="btn btn-sm btn-outline-primary mt-1" href="https://www.youtube.com/watch?v=${videoId}" target="_blank">Tonton</a>`;

    return `
      <tr>
        <td><img src="${thumbnail}" class="img-fluid" style="max-width: 120px;"></td>
        <td class="text-break" style="min-width: 200px;">
          ${title}<br>${link}
        </td>
        <td class="text-break" style="min-width: 200px;">${description}</td>
        <td class="text-nowrap text-center">${publishDate}</td>
      </tr>
    `;
  });

  if (dataTableVideo) dataTableVideo.clear().destroy();
  $('#videoTable tbody').html(rows.join(''));
  dataTableVideo = $('#videoTable').DataTable({
    responsive: true,
    layout: {
      topStart: {
        search: {
          placeholder: 'Cari video...',
          className: 'form-control form-control-sm'
        }
      },
      topEnd: {
        pageLength: {
          className: 'form-select form-select-sm'
        }
      }
    }
  });
}

$(document).ready(function () {
  fetch('cache/playlists.json')
    .then(res => res.json())
    .then(data => {
      allPlaylists = data;
      renderPlaylistTable(data);
    });

  fetch('cache/videos.json')
    .then(res => res.json())
    .then(data => {
      renderVideoTable(data);
    });

  showTable('playlist');
  filterCategory('all');

  document.querySelectorAll('.btn-group .btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.btn-outline-primary').classList.add('active');
});
