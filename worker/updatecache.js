const fs = require('fs');
const path = require('path');
const config = require('./config.json');

// Konfigurasi API
const apiKey = config.apiKey;
const channelId = config.channelId;

// Folder target untuk cache JSON
const cacheDir = path.resolve(__dirname, '../cache');
const playlistsPath = path.join(cacheDir, 'playlists.json');
const videosPath = path.join(cacheDir, 'videos.json');

// Ambil semua playlist dari channel
async function fetchAllPlaylists() {
  let playlists = [];
  let nextPageToken = '';
  do {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`);
    const json = await res.json();
    if (json.items) playlists = playlists.concat(json.items);
    nextPageToken = json.nextPageToken || '';
  } while (nextPageToken);
  return playlists;
}

// Ambil semua video dari channel
async function fetchAllVideos() {
  let videos = [];
  let nextPageToken = '';
  do {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&type=video&pageToken=${nextPageToken}&key=${apiKey}`);
    const json = await res.json();
    if (json.items) videos = videos.concat(json.items);
    nextPageToken = json.nextPageToken || '';
  } while (nextPageToken);
  return videos;
}

// Fungsi utama
async function main() {
  try {
    console.log('📦 Mengambil data playlist...');
    const playlists = await fetchAllPlaylists();
    fs.writeFileSync(playlistsPath, JSON.stringify(playlists, null, 2));
    console.log(`✅ Playlist disimpan: ${playlists.length} entri -> ${playlistsPath}`);

    console.log('📦 Mengambil data video...');
    const videos = await fetchAllVideos();
    fs.writeFileSync(videosPath, JSON.stringify(videos, null, 2));
    console.log(`✅ Video disimpan: ${videos.length} entri -> ${videosPath}`);
  } catch (err) {
    console.error('❌ Gagal memperbarui cache:', err.message);
  }
}

main();
