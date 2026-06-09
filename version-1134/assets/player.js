import { H as Hls } from './hls.js';

export function initPlayer(options) {
  const video = document.getElementById('movie-video');
  const button = document.getElementById('movie-play-button');

  if (!video || !button || !options || !options.source) {
    return;
  }

  let ready = false;
  let hls = null;

  function bind() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(options.source);
      hls.attachMedia(video);
    } else {
      video.src = options.source;
    }
  }

  function play() {
    bind();
    button.classList.add('hidden');
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        button.classList.remove('hidden');
      });
    }
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('hidden');
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
