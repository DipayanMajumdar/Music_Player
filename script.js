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

    function formatTime(sec) {
      const minutes = Math.floor(sec / 60);
      const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    }

    async function getMusicFilesFromHTML() {
      const path = await fetch("https://drive.google.com/drive/folders/13w4OUWfcHSW4dl9or6QE08ZOpao10MO");
      const response = await path.text();
      const div = document.createElement("div");
      div.innerHTML = response;

      const as = div.getElementsByTagName("a");
      const musicFiles = [];

      for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
          const fullURL = element.href;
          const fileName = fullURL.split("/Musics/")[1].replaceAll('%20', ' ');
          musicFiles.push({ name: fileName.split(".mp3")[0], url: fullURL });
        }
      }

      return musicFiles;
    }

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

    function updateSeekbar() {
      seekbar.value = Math.floor(audio.currentTime);
      currentTimeSpan.textContent = formatTime(audio.currentTime);
    }

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

    async function main() {
      songs = await getMusicFilesFromHTML();
      const songul = document.querySelector(".songlist");

      songs.forEach((song, index) => {
        const li = document.createElement("li");
        li.innerHTML =`<span class="material-symbols-outlined">music_note</span>` + song.name+ `<span class="material-symbols-outlined">play_circle</span>`;
        li.addEventListener("click", () => {
          currentIndex = index;
          loadSong(index);
          playSong();
        });
        songul.appendChild(li);
      });

      setupControls();
      //loadSong(currentIndex);
    }

    main();
