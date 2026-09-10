/*
 * Shared video-embed helpers used by the `video` block and by `hero-v2`'s
 * optional video-background variant. Keeping this in one place means both
 * blocks stay in sync on YouTube/Vimeo/native-file handling.
 */

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function isVideoLink(href) {
  if (!href) return false;
  try {
    const url = new URL(href, window.location.href);
    if (url.hostname.includes('youtube') || url.hostname.includes('youtu.be')) return true;
    if (url.hostname.includes('vimeo')) return true;
    return /\.(mp4|webm|ogg)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function embedYoutube(url, autoplay, background) {
  const usp = new URLSearchParams(url.search);
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      mute: background ? '1' : '0',
      controls: background ? '0' : '1',
      disablekb: background ? '1' : '0',
      loop: background ? '1' : '0',
      playsinline: background ? '1' : '0',
    };
    suffix = `&${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function embedVimeo(url, autoplay, background) {
  const [, video] = url.pathname.split('/');
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      background: background ? '1' : '0',
    };
    suffix = `?${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function getVideoElement(source, autoplay, background) {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  if (autoplay) video.setAttribute('autoplay', '');
  if (background) {
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.removeAttribute('controls');
    video.addEventListener('canplay', () => {
      video.muted = true;
      if (autoplay) video.play();
    });
  }

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', `video/${source.split('.').pop()}`);
  video.append(sourceEl);

  return video;
}

/**
 * Builds and appends the embed (iframe or <video>) for `link` into `container`.
 * @param {Element} container element to append the embed into
 * @param {string} link video URL (YouTube, Vimeo, or direct file)
 * @param {boolean} autoplay
 * @param {boolean} background mutes + loops + strips controls for ambient/background use
 * @param {(el: Element) => void} [onLoaded] called with the embed wrapper once ready
 */
export function loadVideoEmbed(container, link, autoplay, background, onLoaded) {
  const url = new URL(link, window.location.href);
  const isYoutube = url.hostname.includes('youtube') || url.hostname.includes('youtu.be');
  const isVimeo = url.hostname.includes('vimeo');

  let embedWrapper;
  if (isYoutube) {
    embedWrapper = embedYoutube(url, autoplay, background);
    container.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => onLoaded?.(embedWrapper));
  } else if (isVimeo) {
    embedWrapper = embedVimeo(url, autoplay, background);
    container.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => onLoaded?.(embedWrapper));
  } else {
    embedWrapper = getVideoElement(link, autoplay, background);
    container.append(embedWrapper);
    embedWrapper.addEventListener('canplay', () => onLoaded?.(embedWrapper));
  }
  return embedWrapper;
}
