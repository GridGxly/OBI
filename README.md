<p align="center">
  <img src="frontend/public/obilogo.png" alt="OBI Logo" width="200" />
</p>

<h1 align="center">OBI</h1>

<p align="center">
  <strong>The Sonic Search Engine</strong><br/>
  <em>Shazam for producers — search for sounds the way you hear them.</em>
</p>

<p align="center">
  <a href="#about">About</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16 badge" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19 badge" /></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi" alt="FastAPI badge" /></a>
  <a href="https://qdrant.tech/"><img src="https://img.shields.io/badge/Qdrant-Vector_DB-dc244c?style=flat-square" alt="Qdrant badge" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS v4 badge" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT license badge" /></a>
</p>

<br/>

---

## About

**OBI** is an audio-similarity search engine built for music producers, sound designers, and sample hunters. Instead of browsing through endless folders or typing keywords into a traditional search bar, OBI lets you find sounds by _describing a vibe_, _uploading a clip_, or _recording a snippet straight from your mic_.

Think **Shazam, but for producers** — you feed it audio DNA and it finds you the sounds you're hearing in your head.

<br/>

## Features

**Multi-Modal Search** — Search three ways from one interface: type a vibe (_"dusty jazz drums from the 70s"_), upload a `.wav`/`.mp3`, or record a snippet directly in-browser.

**Custom Waveform Player** — Hand-built SVG audio player with 48-bar visualization, gold fill progress tracking, and click-to-seek.

**Cinematic Scan Animation** — Full-screen overlay with expanding ripple rings, counter-rotating arcs, a breathing visualizer orb, and phased status text on a 3.2-second choreography.

**ML Embedding Pipeline** — MFCC-based audio fingerprinting converts any sound into a 128-dimensional vector for cosine similarity search via Qdrant.

<br/>

## Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend — Next.js 16"]
        UI[page.tsx]
        PC[ParticleCanvas]
        SO[ScanningOverlay]
        AP[AudioPlayer]
        AM[AuthModal]
        PP[profile/page.tsx]
        VK[VibeKnob]
        UI --> PC & SO & AP & AM
        PP --> VK
    end

    subgraph Backend ["Backend — FastAPI"]
        MAIN[main.py]
        ER[embed router]
        ES[embeddings service]
        SS[search service]
        ST[storage service]
        MAIN --> ER
        ER --> ES & SS & ST
    end

    subgraph ML ["ML Pipeline — Python"]
        EMB[embed.py — MFCC → 128-d vector]
        IDX[index_seed_data.py]
        EVAL[evaluate.py]
    end

    QD[(Qdrant Vector DB)]

    Frontend -- "POST /embed" --> Backend
    Backend --> ML
    ML --> QD

    style Frontend fill:#0d0d0d,stroke:#d4af37,stroke-width:2px,color:#fff
    style Backend fill:#0d0d0d,stroke:#d4af37,stroke-width:2px,color:#fff
    style ML fill:#0d0d0d,stroke:#d4af37,stroke-width:2px,color:#fff
    style QD fill:#1a1a1a,stroke:#d4af37,stroke-width:2px,color:#d4af37
```

<br/>

## Tech Stack

| Layer         | Technology                       | Purpose                                         |
| ------------- | -------------------------------- | ----------------------------------------------- |
| **Frontend**  | Next.js 16, React 19, TypeScript | App Router, SSR, type-safe UI                   |
| **Styling**   | Tailwind CSS v4                  | Utility-first styling                           |
| **Animation** | Framer Motion 12                 | Page transitions, scanning overlay, orb effects |
| **Audio**     | Custom SVG + Canvas              | Waveform rendering and particle system          |
| **Backend**   | Python, FastAPI                  | REST API, audio processing orchestration        |
| **ML**        | librosa, MFCC → CLAP             | Audio feature extraction and embedding          |
| **Vector DB** | Qdrant                           | High-speed cosine similarity search             |
| **Storage**   | Supabase                         | Audio file hosting                              |
| **Hosting**   | Vercel, Modal, Railway           | Serverless deployment                           |

<br/>

## Getting Started

<details>
<summary><strong>Prerequisites</strong></summary>
<br/>

- **Node.js** ≥ 20
- **Python** ≥ 3.10
- **pnpm** (recommended) or npm

</details>

<details>
<summary><strong>Frontend</strong></summary>
<br/>

```bash
cd frontend
pnpm install
pnpm dev
```

Runs at `http://localhost:3000`.

</details>

<details>
<summary><strong>Backend</strong></summary>
<br/>

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API at `http://localhost:8000` — health check: `GET /health`.

</details>

<details>
<summary><strong>ML Pipeline</strong></summary>
<br/>

```bash
cd ml
pip install -r requirements.txt

python embed.py path/to/audio.wav        # Embed a single file
python index_seed_data.py                # Index seed data into Qdrant
python evaluate.py path/to/query.wav     # Evaluate search quality
```

</details>

<br/>

## Contributing

Contributions are welcome — read the [Contributing Guide](CONTRIBUTING.md) before opening a PR.

<br/>

## License

MIT — see [LICENSE](LICENSE) for details.
