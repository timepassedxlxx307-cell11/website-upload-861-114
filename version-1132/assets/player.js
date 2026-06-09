import { H as Hls } from "./hls.js";

export function setupMoviePlayer(video, overlay, source) {
  if (!video || !overlay || !source) {
    return;
  }

  var initialized = false;
  var hls = null;

  function requestPlay() {
    var play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  function start() {
    overlay.classList.add("is-hidden");
    video.controls = true;

    if (!initialized) {
      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", requestPlay, { once: true });
        video.load();
        requestPlay();
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, requestPlay);
        window.setTimeout(requestPlay, 600);
      } else {
        video.src = source;
        video.addEventListener("loadedmetadata", requestPlay, { once: true });
        video.load();
        requestPlay();
      }
    } else {
      requestPlay();
    }
  }

  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!initialized) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
