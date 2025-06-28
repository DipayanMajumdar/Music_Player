// Enhanced Music Player with All Features
console.log("Running");

let songs = [];
let currentIndex = 0;
let audio = new Audio();
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let isMuted = false;
const favSongs = JSON.parse(localStorage.getItem("favSongs") || "[]");

// UI Elements
const seekbar = document.querySelector(".seekbar");
const currentTimeSpan = document.getElementById("currentTime");
const totalTimeSpan = document.getElementById("totalTime");
const playPauseBtn = document.getElementById("playPauseBtn");
const volumeRange = document.getElementById("volumeRange");
const currentSongLabel = document.getElementById("currentSong");
const repeatBtn = document.getElementById("repeatBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const muteBtn = document.getElementById("muteBtn");
const forwardBtn = document.getElementById("forwardBtn");
const rewindBtn = document.getElementById("rewindBtn");
const favBtn = document.getElementById("favBtn");
const searchBox = document.getElementById("searchBox");
const localFileInput = document.getElementById("localFiles");

function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

async function getMusicFilesFromGitHub() {
  const response = await fetch("https://raw.githubusercontent.com/DipayanMajumdar/Music_Player/main/Musics/playlist.json");
  const files = await response.json();
  return files.map(file => ({ name: file.name.replace(/\.[^/.]+$/, ""), url: file.download_url }));
}

async function loadSong(index) {
  const song = songs[index];
  if (!song) return;
  audio.src = song.url;
  audio.load();
  currentSongLabel.textContent = `🎶 Now Playing: ${song.name}`;
  document.querySelectorAll(".songlist li").forEach((li, i) => li.classList.toggle("active", i === index));
  audio.addEventListener("loadedmetadata", () => {
    seekbar.max = Math.floor(audio.duration);
    totalTimeSpan.textContent = formatTime(audio.duration);
    currentTimeSpan.textContent = "0:00";
  });
  updateFavoriteIcon();
  Array.from(document.getElementsByClassName("onoff")).forEach(btn => {
    btn.style.pointerEvents = "auto";
    btn.style.opacity = "1";
  });
}

function updateSeekbar() {
  const percent = (audio.currentTime / audio.duration) * 100 || 0;
  seekbar.value = Math.floor(audio.currentTime);
  currentTimeSpan.textContent = formatTime(audio.currentTime);

  seekbar.style.background = `linear-gradient(
  to right,
  transparent ${percent}%,
  #888 ${percent}%
  ),
  linear-gradient(
  to right,
  cyan, #0072ff,rgb(68, 0, 255), #0072ff, cyan
  )`;
}

function playSong() {
  audio.play();
  isPlaying = true;
  playPauseBtn.textContent = "pause";
  loopRotationWhilePlaying();
  document.querySelector(".volume-display img").style.opacity = "1";
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playPauseBtn.textContent = "play_arrow";
  document.querySelector(".volume-display img").style.opacity = "0";
}

function togglePlayPause() {
  isPlaying ? pauseSong() : playSong();
}

function playNext() {
  currentIndex = isShuffle ? (function () {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === currentIndex && songs.length > 1);
    return nextIndex;
  })() : (currentIndex + 1) % songs.length;
  loadSong(currentIndex);
  playSong();
}

function playPrev() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  playSong();
}

function loopRotationWhilePlaying() {
  if (!isPlaying) return;
  const img = document.querySelector("nav > div>img");
  img.classList.remove("rotate-once");
  void img.offsetWidth;
  img.classList.add("rotate-once");
  setTimeout(loopRotationWhilePlaying, 4980);
}

function toggleFavorite(index) {
  const name = songs[index].name;
  const idx = favSongs.indexOf(name);
  if (idx !== -1) {
    favSongs.splice(idx, 1);
  } else {
    favSongs.push(name);
  }
  localStorage.setItem("favSongs", JSON.stringify(favSongs));
  updateFavoriteIcon();
}

function updateFavoriteIcon() {
  if (!favBtn || !songs[currentIndex]) return;
  const name = songs[currentIndex].name;
  favBtn.textContent = favSongs.includes(name) ? "💖" : "🤍";
}

function setupControls() {
  playPauseBtn.addEventListener("click", togglePlayPause);
  document.getElementById("nextBtn").addEventListener("click", playNext);
  document.getElementById("prevBtn").addEventListener("click", playPrev);
  repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.style.color = isRepeat ? "blue" : "";
  });
  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? "blue" : "";
  });
  seekbar.addEventListener("input", () => {
    audio.currentTime = seekbar.value;
    updateSeekbar();
  });
  volumeRange.addEventListener("input", () => {
    audio.volume = volumeRange.value;

    const percent = volumeRange.value * 100;
    volumeRange.style.background = `linear-gradient(
      to right,
      transparent ${percent}%,
      #888 ${percent}%
      ),
      linear-gradient(
      to right,
      green, Chartreuse, yellow, red 
      )`;
  });
  muteBtn?.addEventListener("click", () => {
    isMuted = !isMuted;
    audio.muted = isMuted;
    muteBtn.textContent = isMuted ? "no_sound" : "volume_up";
  });
  forwardBtn?.addEventListener("click", () => {
    audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
  });
  rewindBtn?.addEventListener("click", () => {
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
  });
  favBtn?.addEventListener("click", () => toggleFavorite(currentIndex));
  audio.addEventListener("timeupdate", updateSeekbar);
  audio.addEventListener("ended", () => {
    isRepeat ? (audio.currentTime = 0, playSong()) : playNext();
  });
  document.addEventListener("keydown", e => {
    switch (e.code) {
      case "Space": e.preventDefault(); togglePlayPause(); break;
      case "ArrowRight": playNext(); break;
      case "ArrowLeft": playPrev(); break;
    }
  });
  searchBox.addEventListener("input", () => {
    const query = searchBox.value.toLowerCase();
    document.querySelectorAll(".songlist li").forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(query) ? "flex" : "none";
    });
  });
  localFileInput?.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    const localSongs = files.map(file => ({
      name: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file)
    }));
    songs = localSongs.concat(songs);
    renderSongList();
  });
}

function renderSongList() {
  const songul = document.querySelector(".songlist");
  songul.innerHTML = "";
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="material-symbols-outlined">music_note</span> ${song.name} <span class="material-symbols-outlined">play_circle</span>`;
    li.addEventListener("click", () => {
      currentIndex = index;
      loadSong(index);
      playSong();
    });
    li.addEventListener("mouseenter", () => {
      const tempAudio = new Audio(song.url);
      tempAudio.addEventListener("loadedmetadata", () => {
        li.title = "Duration: " + formatTime(tempAudio.duration);
      });
    });
    songul.appendChild(li);
  });
}

async function main() {
  const githubSongs = await getMusicFilesFromGitHub();
  songs = githubSongs.sort((a, b) => a.name.localeCompare(b.name));
  renderSongList();
  setupControls();
}

main();
