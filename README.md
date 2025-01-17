# BrainWaves - Client

## NOTE: This is a WIP.

In the meantime, feel free to check out my other pinned [repos](https://github.com/wolfpilot)!

## Table of contents

- [Intro](#intro)
- [Demo](#demo)
- [Features (done)](#features-done)
- [Features (TBA)](#features-tba)
- [Technologies](#technologies)
- [Getting started](#getting-started)
- [License](#license)

## Intro

_“The spice must flooow! \*ahem\*, sorry for that. What I meant was - let your ideas flooooow!”_

Flow chart / diagram type webapp for organising your ideas, tooling, etc.

## Demo

Playground: [https://brain-waves-client.vercel.app/](https://brain-waves-client.vercel.app/) \
Playground w. debug: [https://brain-waves-client.vercel.app/?debug=true](https://brain-waves-client.vercel.app/?debug=true)

## Features (done)

- State management

  - Multi-store using Pinia

- UI & UX

  - Logo animation

- Behaviours

  - Pan
  - Zoom
    - Zoom toward pointer
  - Limit to boundaries on resize and rescale

- Toolbar

  - Tools

    - Select pointer
    - Add shapes (square, circle)

  - Controls
    - Zoom in/out
    - Reset

- Connectivity

  - WebSocket client

- QOL (Quality of Life)

  - Debug tools
    - Add `debug=true` param to any URL

- Config

  - Import path aliases

## Features (TBA)

## Technologies

## Getting started

### Requirements

- [Pnpm](https://pnpm.io/) (built on v9.14.2)

### Installation

```bash
# Clone and install dependencies
$ git clone https://github.com/wolfpilot/brain-waves-client.git
$ cd brain-waves-client
$ pnpm install
```

```sh
# Install browsers for the first run
npx playwright install
```

## Resources

### Guides

- [Pan & Zoom with JavaScript](https://www.youtube.com/watch?v=S4HMcN2YlgU&list=PLB0Tybl0UNfYoJE7ZwsBQoDIG4YN9ptyY) by Radu Mariescu-Istodor

### Assets

- [Hero icons pack](https://github.com/tailwindlabs/heroicons)
- [Feather icons pack](https://github.com/feathericons/feather)
