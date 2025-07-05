let allPlaylists = [];
let dataTablePlaylist, dataTableVideo;

function showTable(type) {
  $('#playlistSection').addClass('d-none');
  $('#videoSection').addClass('d-none');
  $('.btn-group .btn').removeClass('active');

  if (type === 'playlist') {
    $('#playlistSection').removeClass('d-none');
    $('.btn-outline-primary').addClass('active');
  } else {
    $('#videoSection').removeClass('d-none');
    $('.btn-outline-dark').addClass('active');
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
    const link = `<a class="btn btn-sm btn-primary playlist-title-link" href="https://www.youtube.com/playlist?list=${playlistId}" target="_blank">Lihat Playlist</a>`;

    return `
      <tr>
        <td><img src="${thumbnailUrl}" alt="Thumbnail">
          <br>
          ${link}</td>
        <td>${title}</td>
        <td>${description}</td>
        <td class="text-center">${videoCount}</td>
      </tr>
    `;
  });

  if (dataTablePlaylist) dataTablePlaylist.destroy();
  $('#playlistTable tbody').html(rows.join(''));
  dataTablePlaylist = new DataTable('#playlistTable', {
    responsive: true,
    layout: {
      topStart: {
        search: {
          placeholder: 'Cari playlist...'
        }
      },
      topEnd: {
        pageLength: {
          menu: [10, 25, 50, 100]
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
    const link = `<a class="btn btn-sm btn-outline-primary video-title-link" href="https://www.youtube.com/watch?v=${videoId}" target="_blank">Tonton Video</a>`;

    return `
      <tr>
        <td>
        <img src="${thumbnail}" alt="Thumbnail">
        <br>
          ${link}
        </td>
        <td>${title}</td>
        <td>${description}</td>
        <td>${publishDate}</td>
      </tr>
    `;
  });

  if (dataTableVideo) dataTableVideo.destroy();
  $('#videoTable tbody').html(rows.join(''));
  dataTableVideo = new DataTable('#videoTable', {
    responsive: true,
    layout: {
      topStart: {
        search: {
          placeholder: 'Cari video...'
        }
      },
      topEnd: {
        pageLength: {
          menu: [10, 25, 50, 100]
        }
      }
    }
  });
}

$(document).ready(() => {
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

  // Default tampilkan playlist
  showTable('playlist');
  filterCategory('all');
});
