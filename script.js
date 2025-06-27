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

// New UI Elements (ensure these exist in your HTML)
const muteBtn = document.getElementById("muteBtn");
const forwardBtn = document.getElementById("forwardBtn");
const rewindBtn = document.getElementById("rewindBtn");
const favBtn = document.getElementById("favBtn");

// Format seconds into MM:SS
function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// Fetch music files from GitHub
async function getMusicFilesFromGitHub() {
  const response = await fetch("https://raw.githubusercontent.com/DipayanMajumdar/Music_Player/main/Musics/playlist.json");
  const files = await response.json();
  return files.map(file => ({ name: file.name, url: file.download_url }));
}

// Load a song by index
async function loadSong(index) {
  const song = songs[index];
  if (!song) return;

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

  updateFavoriteIcon();

  // Enable all disabled controls
  const onoffButtons = document.getElementsByClassName("onoff");
  for (let i = 0; i < onoffButtons.length; i++) {
    onoffButtons[i].style.pointerEvents = "auto";
    onoffButtons[i].style.opacity = "1";
  }
}

// Update seekbar and time
function updateSeekbar() {
  seekbar.value = Math.floor(audio.currentTime);
  currentTimeSpan.textContent = formatTime(audio.currentTime);
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

function loopRotationWhilePlaying() {
  if (!isPlaying) return;
  const img = document.querySelector("nav > img");
  img.classList.remove("rotate-once");
  void img.offsetWidth;
  img.classList.add("rotate-once");
  setTimeout(loopRotationWhilePlaying, 4980);
}

function toggleFavorite(index) {
  const name = songs[index].name;
  if (favSongs.includes(name)) {
    favSongs.splice(favSongs.indexOf(name), 1);
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
  });

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      isMuted = !isMuted;
      audio.muted = isMuted;
      muteBtn.textContent = isMuted ? "no_sound" : "volume_up";
    });
  }

  if (forwardBtn) {
    forwardBtn.addEventListener("click", () => {
      audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
    });
  }

  if (rewindBtn) {
    rewindBtn.addEventListener("click", () => {
      audio.currentTime = Math.max(audio.currentTime - 10, 0);
    });
  }

  if (favBtn) {
    favBtn.addEventListener("click", () => toggleFavorite(currentIndex));
  }

  audio.addEventListener("timeupdate", updateSeekbar);

  audio.addEventListener("ended", () => {
    if (isRepeat) {
      audio.currentTime = 0;
      playSong();
    } else {
      playNext();
    }
  });

  document.addEventListener("keydown", e => {
    switch (e.code) {
      case "Space":
        e.preventDefault();
        togglePlayPause();
        break;
      case "ArrowRight":
        playNext();
        break;
      case "ArrowLeft":
        playPrev();
        break;
    }
  });
}

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

    li.addEventListener("mouseenter", () => {
      const tempAudio = new Audio(songs[index].url);
      tempAudio.addEventListener("loadedmetadata", () => {
        li.title = "Duration: " + formatTime(tempAudio.duration);
      });
    });

    songul.appendChild(li);
  });

  setupControls();
  //loadSong(currentIndex);
}

main();

