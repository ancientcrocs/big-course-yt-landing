const fs = require('fs');
const fetch = require('node-fetch');
const config = require('./config.json');

const apiKey = config.apiKey;
const channelId = config.channelId;

async function fetchAllPlaylists() {
  let playlists = [];
  let nextPageToken = '';
  do {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`);
    const json = await res.json();
    if (json.items) {
      playlists = playlists.concat(json.items);
    }
    nextPageToken = json.nextPageToken || '';
  } while (nextPageToken);
  return playlists;
}

async function fetchAllVideos() {
  let videos = [];
  let nextPageToken = '';
  do {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&type=video&pageToken=${nextPageToken}&key=${apiKey}`);
    const json = await res.json();
    if (json.items) {
      videos = videos.concat(json.items);
    }
    nextPageToken = json.nextPageToken || '';
  } while (nextPageToken);
  return videos;
}

async function main() {
  try {
    console.log('Mengambil data playlist...');
    const playlists = await fetchAllPlaylists();
    fs.writeFileSync('./cache/playlists.json', JSON.stringify(playlists, null, 2));
    console.log(`✅ Playlist disimpan (${playlists.length} entri)`);

    console.log('Mengambil data video...');
    const videos = await fetchAllVideos();
    fs.writeFileSync('./cache/videos.json', JSON.stringify(videos, null, 2));
    console.log(`✅ Video disimpan (${videos.length} entri)`);
  } catch (err) {
    console.error('❌ Gagal memperbarui cache:', err);
  }
}

main();
