# Sistem Deteksi Kedipan Mata Real-Time Berbasis MediaPipe Face Mesh, Haar Cascade ROI, dan Real-Time EAR Plotting

<div align="center">

### **SKRIPSI PROGRAM STUDI TEKNIK INFORMATIKA**
### **INSTITUT BISNIS DAN INFORMATIKA KWIK KIAN GIE**

**Peneliti & Pengembang:** **Jason Istioso**  
Jakarta, Indonesia

---

![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.8%2B%20%7C%20OpenCV-3776AB?logo=python&logoColor=white)
![MediaPipe](https://img.shields.io/badge/AI%20Engine-MediaPipe%20Face%20Mesh-00897B?logo=google&logoColor=white)
![Status](https://img.shields.io/badge/Research%20Status-Complete-success)

</div>

---

## 📖 Ringkasan Penelitian

Proyek ini merupakan implementasi sistem visi komputer (*Computer Vision*) berkecepatan tinggi untuk **mendeteksi frekuensi kedipan mata secara *real-time*** dengan memanfaatkan kalkulasi **Eye Aspect Ratio (EAR)**. Sistem memadukan keunggulan lokalisasi *Region of Interest* (ROI) wajah berbasis algoritma **Viola-Jones Haar Cascade** dengan ketepatan ekstraksi 468 titik koordinat spasial 3D dari **MediaPipe Face Mesh**.

Sistem ini dikembangkan dalam dua lingkungan yang saling melengkapi:
1. **Aplikasi Web Studio Interaktif (React + Vite + MediaPipe Web SDK)**: Antarmuka berbasis web modern dengan visualisasi osiloskop gelombang EAR *real-time*, kalibrasi baseline otomatis 3 detik, sistem umpan balik audio chime adaptif, ekspor data telemetri ke format CSV, serta *Landing Page* sinematik bertema *Marvel Studios*.
2. **Modul Pengolahan Python & Jupyter Notebook**: Skrip pengolahan video offline dengan *overlay* komputasi metrik dan analisis grafik multi-threshold berbasis Matplotlib & Plotly.

---

## ✨ Fitur Utama Sistem

- **Deteksi Kedipan Real-Time Berakurasi Tinggi**: Menganalisis rasio geometris kelopak mata atas, bawah, dan sudut lateral mata pada setiap *frame* video (>25–30 FPS).
- **Kalibrasi Baseline Adaptif Otomatis**: Prosedur sampling 3 detik untuk menentukan ambang batas (*threshold*) EAR optimal secara personal, sangat andal bagi pengguna berkacamata maupun variasi anatomi mata.
- **Visualisasi Osiloskop EAR Real-Time**: Plotting dinamis nilai EAR dengan garis ambang batas horizontal dan indikator visual status mata (*Open* / *Blinking*).
- **Dual Input Feed**: Mendukung pengujian langsung melalui kamera web (*Live Webcam*) maupun berkas video rekaman dataset (*Sample Video*).
- **Pemberitahuan Audio Adaptif (*Audio Feedback*)**: Sintesis suara chime Web Audio API yang memberikan indikator audio instan setiap kali kedipan terdeteksi tanpa *delay*.
- **Ekspor Telemetri Data CSV**: Mencatat setiap kedipan (timestamp, nilai EAR saat terdeteksi, durasi) ke berkas `.csv` untuk keperluan validasi statistik skripsi.
- **Tampilan Sinematik Marvel Studios**: Desain *Landing Page* modern dengan koridor rel video 3D dan logo *cutout* video bergerak.

---

## 🧮 Landasan Teori: Eye Aspect Ratio (EAR)

### 1. Rumus Matematis
Metrik *Eye Aspect Ratio* (EAR) pertama kali diperkenalkan oleh Soukupová dan Čech (2016) untuk mengukur keterbukaan mata secara invarian terhadap skala dan rotasi kepala:

$$\text{EAR} = \frac{\|p_2 - p_6\| + \|p_3 - p_5\|}{2 \cdot \|p_1 - p_4\|}$$

Keterangan:
- $p_1, p_4$ : Titik sudut lateral luar dan sudut medial dalam mata (panjang horizontal).
- $p_2, p_6$ : Pasangan titik vertikal atas dan bawah bagian luar kelopak mata.
- $p_3, p_5$ : Pasangan titik vertikal atas dan bawah bagian dalam kelopak mata.
- $\|\cdot\|$ : Jarak Euclidean (*Euclidean distance*) antara dua titik koordinat.

### 2. Indeks Landmark MediaPipe Face Mesh
Sistem memetakan indeks koordinat spesifik dari 468 titik *MediaPipe Face Mesh*:
- **Mata Kanan**: `[33, 160, 158, 133, 153, 144]` *(atau subset poligon 16 titik kontur)*
- **Mata Kiri**: `[362, 385, 387, 263, 373, 380]` *(atau subset poligon 16 titik kontur)*

### 3. Logika Deteksi Kedipan
Kedipan dikonfirmasi apabila nilai rata-rata EAR kedua mata berada di bawah nilai ambang batas (*threshold*) selama sejumlah *frame* berturut-turut (*consecutive frames*):

$$\text{EAR}_{\text{avg}} = \frac{\text{EAR}_{\text{kanan}} + \text{EAR}_{\text{kiri}}}{2}$$

- **Mata Terbuka Normal**: $\text{EAR}_{\text{avg}} \approx 0.28 - 0.38$
- **Mata Tertutup / Berkedip**: $\text{EAR}_{\text{avg}} < \text{Threshold}$ (Ambang standar adaptif: $0.220$)
- **Frame Berturut-turut (*Consecutive Frames*)**: $\ge 2$ frame (mencegah *noise* atau kedipan palsu).

---

## 📁 Struktur Direktori Proyek

```text
SKRIPSI JASON ISTIOSO/
├── DATA/
│   ├── IMAGES/
│   │   ├── BLINK_DETECTION/          # Hasil plot grafik EAR & landmark (.html & .png)
│   │   └── DOWNLOADED_IMAGES/        # Citra referensi mata
│   └── VIDEOS/
│       ├── INPUTS/                   # Berkas video input riset (blinking_0 s/d 4.mp4)
│       └── OUTPUTS/                  # Hasil video beranotasi deteksi kedipan
├── public/
│   ├── mediapipe/                    # WebAssembly & model offline MediaPipe FaceMesh
│   ├── posters/                      # Poster thumbnail instan setiap video
│   └── videos/                       # Berkas video sampel web (blinking_0 s/d 4.mp4)
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx           # Landing page sinematik tema Marvel Studios
│   │   ├── Navbar.jsx                # Header telemetri Studio, kalibrator, & micro-tuner
│   │   ├── RealtimeEARPlot.jsx       # Osiloskop gelombang EAR dinamis (HTML5 Canvas)
│   │   └── VideoCanvasFeed.jsx       # Feed kamera/video, visualisasi ROI & landmark poligon
│   ├── lib/
│   │   ├── audioFeedback.js          # Web Audio API synthesizer chime kedipan
│   │   ├── earMath.js                # Algoritma kalkulasi EAR & tracker kedipan
│   │   └── haarCascadeRoi.js         # Akselerator Region of Interest Viola-Jones
│   ├── App.jsx                       # State manager utama aplikasi web
│   ├── index.css                     # Sistem desain & styling sinematik
│   └── main.jsx                      # Entry point React
├── blink_counter.py                  # Skrip Python pemroses kedipan video
├── blink_counter_and_EAR_plot.py     # Skrip Python pemroses video + visualisasi grafik
├── blink_detection_notebook.ipynb    # Jupyter Notebook eksperimen & analisis data
├── package.json                      # Konfigurasi dependensi JavaScript
└── README.md                         # Dokumentasi resmi skripsi
```

---

## 🚀 Petunjuk Menjalankan Aplikasi

### 1. Menjalankan Aplikasi Web Studio (React + Vite)

Pastikan **Node.js** (versi 18 ke atas) sudah terpasang di komputer Anda.

```bash
# 1. Buka terminal di folder proyek
cd "d:\SKRIPSI JASON ISTIOSO"

# 2. Pasang seluruh dependensi proyek
npm install

# 3. Jalankan server pengembang lokal
npm run dev
```

Buka peramban (*browser*) Anda dan akses:  
👉 **`http://localhost:5174/`** *(atau port yang ditampilkan di terminal)*.

---

### 2. Menjalankan Skrip Pemrosesan Python

Pastikan **Python 3.8+** sudah terpasang.

```bash
# 1. Pasang dependensi pustaka Python
pip install -r requirements.txt

# 2. Menjalankan detektor kedipan berbasis video input
python blink_counter_and_EAR_plot.py
```

---

## 🔬 Spesifikasi Algoritma & Konfigurasi

| Parameter | Nilai Standar | Keterangan |
| :--- | :---: | :--- |
| **Model Landmark** | MediaPipe Face Mesh | 468 Titik Koordinat 3D Wajah |
| **Ambang Batas (EAR Threshold)** | `0.220` (Adaptif) | Optimal untuk anatomi Asia dan kacamata |
| **Consecutive Frames** | `2 Frame` | Durasi minimum penutupan mata valid |
| **Durasi Kalibrasi Otomatis** | `3 Detik` | Sampling baseline mata terbuka normal |
| **Toleransi Offset Kalibrasi** | `75% Baseline` | Formula adaptif penentuan ambang batas |
| **Target Frame Rate** | `> 30 FPS` | Efisiensi tinggi pada komputasi web client-side |

---

## 📚 Referensi Akademik

1. **Soukupová, T., & Čech, J. (2016)**. *Real-Time Eye Blink Detection using Facial Landmarks*. 21st Computer Vision Winter Workshop (CVWW), Rimske Toplice, Slovenia.
2. **Dewi, C., Chen, R. C., Chang, C. W., Wu, S. H., Jiang, X., & Yu, H. (2021)**. *Eye Aspect Ratio for Real-Time Drowsiness Detection to Improve Driver Safety*. Electronics, 11(19), 3183. [https://doi.org/10.3390/electronics11193183](https://doi.org/10.3390/electronics11193183)
3. **Lugaresi, C., et al. (2019)**. *MediaPipe: A Framework for Building Perception Pipelines*. arXiv preprint arXiv:1906.08172.
4. **Viola, P., & Jones, M. (2004)**. *Robust Real-Time Face Detection*. International Journal of Computer Vision, 57(2), 137-154.

---

## 👨‍💻 Hak Cipta & Informasi Pengembang

Dokumentasi dan kode sumber proyek ini disusun untuk memenuhi persyaratan kelulusan Program Sarjana (S1) pada Program Studi Teknik Informatika, **Institut Bisnis dan Informatika Kwik Kian Gie (IBI KKG)**, Jakarta.

* **Penulis / Peneliti**: **Jason Istioso**
* **Institusi**: Institut Bisnis dan Informatika Kwik Kian Gie (IBI KKG)
* **Tahun**: 2026
* **Lisensi**: Hak Cipta Dilindungi Undang-Undang © 2026 Jason Istioso.
