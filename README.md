# Tempo

A personal training app for gym, running and cycling. It works offline and installs on iPhone and Android as a web app.

**Version 5.0.** Glass theme with the Pace ring logo, four tabs (Today, Train, Progress, You), a floating quick-log button, exercise pages, quick exercise swap during workouts, a bottom workout bar and screen transitions.

- `index.html`, `sw.js`, `manifest.json` and the icons are the built app that GitHub Pages serves.
- `src/` holds the source files. `python3 src/build.py` rebuilds the app into `build/`.

Your training data never goes into this repository. It stays on your devices and, if you turn on sync, in a private GitHub Gist.
