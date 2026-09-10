# Video Block

Embeds a video (YouTube, Vimeo, or a direct `.mp4`/`.webm`/`.ogg` file) referenced
by a link, either as a click-to-play embed or an autoplaying background video.

## Structure

```html
<div class="video">
  <p><a href="https://example.com/video.mp4">Video</a></p>
  <picture><img src="poster.jpg" alt=""></picture>
</div>
```

- **Link**: required. The video source — a YouTube/Vimeo URL or a direct video file.
- **Poster image** (optional `picture`): shown as a placeholder with a play button
  until the visitor clicks it. Omit it to load the embed automatically once the
  block scrolls into view.

## Variants

- **Default**: shows the poster with a play button; clicking loads the video with
  sound and controls.
- **`autoplay`** (add `(autoplay)` to the block name in DA): the video loads and
  plays muted/looped/without controls as soon as it's visible, ignoring the poster
  click-to-play gate. Respects `prefers-reduced-motion`.

## Behavior

- Loads lazily via `IntersectionObserver` — the embed isn't fetched until the block
  is visible.
- YouTube/Vimeo links become an `<iframe>` embed; direct file links become a native
  `<video>` element.
- Embed logic (YouTube/Vimeo/native detection, autoplay/background params) lives in
  `scripts/video-embed.js`, shared with `hero-v2`'s optional video-background field.
