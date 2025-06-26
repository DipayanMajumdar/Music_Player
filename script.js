let songs = [];
let currentIndex = 0;
let audio = new Audio();
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

const seekbar = document.querySelector(".seekbar");
const currentTimeSpan = document.getElementById("currentTime");
const totalTimeSpan = document.getElementById("totalTime");
const playPauseBtn = document.getElementById("playPauseBtn");
const volumeRange = document.getElementById("volumeRange");
const currentSongLabel = document.getElementById("currentSong");
const repeatBtn = document.getElementById("repeatBtn");
const shuffleBtn = document.getElementById("shuffleBtn");

// ⏱️ Format seconds into MM:SS
function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// 🔁 Get .mp3 files from GitHub
async function getMusicFilesFromGitHub() {
  const response = await fetch("https://raw.githubusercontent.com/DipayanMajumdar/Music_Player/main/Musics/playlist.json");
  const songs = await response.json();
  return data
    .filter(file => file.name.endsWith(".mp3"))
    .map(file => ({
      name: file.name,
      url: file.download_url
    }));
}

// 🔊 Load a song by index
async function loadSong(index) {
  const song = songs[index];
  audio.src = song.url;
  audio.load();
  currentSongLabel.textContent = `🎶 Now Playing: ${song.name}`;

  document.querySelectorAll(".songlist li").forEach((li, i) => {
    li.classList.toggle("active", i === index);
  });

  audio.addEventListener("loadedmetadata", () => {
    seekbar.max = Math.floor(audio.duration);
    totalTimeSpan.textContent = formatTime(audio.duration);
    currentTimeSpan.textContent = "0:00";
  });
}

// 🔁 Update seekbar as song plays
function updateSeekbar() {
  seekbar.value = Math.floor(audio.currentTime);
  currentTimeSpan.textContent = formatTime(audio.currentTime);
}

// ▶️⏸️ Play / Pause
function playSong() {
  audio.play();
  isPlaying = true;
  playPauseBtn.textContent = "pause";
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playPauseBtn.textContent = "play_arrow";
}

function togglePlayPause() {
  isPlaying ? pauseSong() : playSong();
}

// ⏭️⏮️ Next / Previous
function playNext() {
  if (isShuffle) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === currentIndex && songs.length > 1);
    currentIndex = nextIndex;
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  loadSong(currentIndex);
  playSong();
}

function playPrev() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  playSong();
}

// 🛠️ Set up controls
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
  });

  audio.addEventListener("timeupdate", updateSeekbar);

  audio.addEventListener("ended", () => {
    if (isRepeat) {
      audio.currentTime = 0;
      playSong();
    } else {
      playNext();
    }
  });
}

// 🚀 Start the player
async function main() {
  songs = await getMusicFilesFromGitHub();
  songs.sort((a, b) => a.name.localeCompare(b.name));

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
    songul.appendChild(li);
  });

  setupControls();
}

main();
