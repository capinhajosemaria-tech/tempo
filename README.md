# Tempo

A personal training app for gym, running and cycling. It works offline and installs on iPhone and Android as a web app.

**Version 6.0.** New Pro style (flat black, Whoop-like) as the default, a settings page reachable from the gear on every screen, and a full visual customization section: style, accent, background, typeface, number weight, corners, spacing, tab labels and card outlines. Workout days can still have options.

- `index.html`, `sw.js`, `manifest.json` and the icons are the built app that GitHub Pages serves.
- `src/` holds the source files. `python3 src/build.py` rebuilds the app into `build/`.

Your training data never goes into this repository. It stays on your devices and, if you turn on sync, in a private GitHub Gist.
