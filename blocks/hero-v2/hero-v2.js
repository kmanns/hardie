import { createOptimizedPicture } from '../../scripts/aem.js';
import { isVideoLink, loadVideoEmbed, prefersReducedMotion } from '../../scripts/video-embed.js';

export default function decorate(block) {
  const heromain = document.createElement('div');
  heromain.className = 'hero-v2-main';
  [...block.querySelector('div:nth-child(1)>div:nth-child(1)').children].forEach((row) => {
    const herocontent = document.createElement('div');
    herocontent.className = 'hero-v2-content';

    const heroimage = document.createElement('div');
    heroimage.className = 'hero-v2-image';
    const herobody = document.createElement('div');
    herobody.className = 'hero-v2-body';

    let videoLink;

    // Move each child to either heroimage (if picture), the video-link slot
    // (a standalone link to a video file/YouTube/Vimeo, not the CTA button),
    // or herobody (everything else).
    while (row.firstElementChild) {
      const child = row.firstElementChild;
      // A CTA link is authored bold (`**Label**`) and has already been
      // buttonized (class `button-wrapper`) by scripts.js#decorateButtons,
      // which runs before block decoration. A bare, un-buttonized link is
      // the video-url field.
      const bareLink = child.tagName === 'P' && !child.classList.contains('button-wrapper')
        ? child.querySelector('a[href]')
        : null;
      if (child.querySelector && child.querySelector('picture')) {
        heroimage.append(child);
      } else if (bareLink && isVideoLink(bareLink.href) && !videoLink) {
        videoLink = bareLink.href;
        child.remove();
      } else {
        herobody.append(child);
      }
    }

    // Append heroimage and herobody (picture first, then all rest) to herocontent
    herocontent.append(heroimage);
    herocontent.append(herobody);
    heromain.append(herocontent);

    if (videoLink) {
      heroimage.classList.add('has-video');
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          const playOnLoad = !prefersReducedMotion.matches;
          loadVideoEmbed(heroimage, videoLink, playOnLoad, true, (embed) => {
            embed.classList?.add('hero-v2-video');
            heroimage.classList.add('video-ready');
          });
        }
      });
      observer.observe(heroimage);
    }
  });

  // Fix: Use img.getAttribute('src') instead of img.src in case src hasn't resolved properly
  heromain.querySelectorAll('picture > img').forEach((img) => {
    const src = img.getAttribute('src') || img.src;
    const alt = img.getAttribute('alt') || '';
    if (src) {
      img.closest('picture').replaceWith(createOptimizedPicture(src, alt, false, [{ width: '750' }]));
    }
  });
  block.replaceChildren(heromain);
}
