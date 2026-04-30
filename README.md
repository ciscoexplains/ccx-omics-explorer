# 🧬 Omics Data Engine

A premium, high-performance search engine for genomic, proteomic, and space biology data, powered by the **NASA Open Science Data Repository (OSDR)** and **NCBI GEO** APIs.

![NASA OSDR](https://img.shields.io/badge/Data%20Source-NASA%20OSDR-blue.svg)
![NCBI GEO](https://img.shields.io/badge/Data%20Source-NCBI%20GEO-green.svg)
![React](https://img.shields.io/badge/Framework-React-61DAFB.svg?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Build%20Tool-Vite-646CFF.svg?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)

## ✨ Overview

This application provides a sophisticated interface to explore and retrieve complex biological data from **NASA's GeneLab**, **Open Science Data Repository**, and **NCBI GEO**. It is designed for researchers and bioinformaticians to quickly find datasets, preview detailed metadata, and access raw data files.

## 🚀 Key Features

- **🔍 Intelligent Search**: Full-text keyword search across NASA OSDR and NCBI GEO datasets.
- **📑 Detailed Metadata Preview**: Access Principal Investigator (PI) info, publication details, DOIs, and study protocols in a sleek side-drawer.
- **💾 Integrated File Downloader**: Browse and download raw dataset files (RNA-Seq, Microarray, etc.) with direct links to NASA's servers.
- **🏷️ Automatic Tagging**: Real-time extraction of experimental tags (e.g., Spaceflight, Microgravity, Transcriptomics).
- **🧪 Dynamic Filtering**: Filter results on-the-fly by Organism and Experiment Type.
- **🎨 Premium Aesthetics**: Modern dark-mode UI with glassmorphism, smooth animations (Framer Motion), and a curated HSL color palette.

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Vanilla CSS (Premium Custom Design System)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: NASA OSDR (Open Science Data Repository) Public API
- **Tooling**: Vite for fast development and building

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd omics-data-se
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔗 API & Proxy Configuration

To avoid CORS (Cross-Origin Resource Sharing) issues during development, this project uses a Vite proxy configuration.

- **Proxy Path**: `/api/nasa` -> `https://osdr.nasa.gov`
- **Configuration**: Located in `vite.config.ts`.

## 📸 Screenshots

*(Add your screenshots here after generating them with `generate_image` or capturing them)*

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Built with 🚀 by Antigravity for NASA Open Science exploration.*
