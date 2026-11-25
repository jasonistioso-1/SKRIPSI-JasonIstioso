import React from 'react';
import { X, BookOpen, Check } from 'lucide-react';

export default function FormulaModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(9, 9, 11, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-card" style={{
        maxWidth: '640px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '24px',
        background: '#111114',
        border: '1px solid var(--border-hairline)',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#18181b',
            border: '1px solid var(--border-hairline)',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a1a1aa',
            cursor: 'pointer',
          }}
        >
          <X size={15} />
        </button>

        <div className="theory-title" style={{ marginBottom: '12px' }}>
          <BookOpen size={18} />
          <span>Dasar Teori: Eye Aspect Ratio (EAR)</span>
        </div>

        <p className="theory-desc" style={{ marginBottom: '14px' }}>
          Formulasi <strong>Eye Aspect Ratio (EAR)</strong> diperkenalkan oleh Soukupová & Čech (2016) dan dikembangkan oleh Dewi et al. (2021) untuk mendeteksi kedipan mata secara invarian terhadap skala dan jarak kamera.
        </p>

        <div className="formula-box" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f4f4f5' }}>
            EAR = ( ||p₂ - p₆|| + ||p₃ - p₅|| ) / ( 2 · ||p₁ - p₄|| )
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            EAR_avg = ( EAR_kanan + EAR_kiri ) / 2
          </div>
        </div>

        <h4 style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#ffffff' }}>
          Indeks Landmark MediaPipe FaceMesh yang Digunakan:
        </h4>
        <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: 1.8, marginBottom: '16px' }}>
          <li><strong>Mata Kanan:</strong> p₁=33, p₂=159, p₃=158, p₄=133, p₅=153, p₆=145</li>
          <li><strong>Mata Kiri:</strong> p₁=362, p₂=380, p₃=374, p₄=263, p₅=386, p₆=385</li>
          <li><strong>||p₂ - p₆|| & ||p₃ - p₅||:</strong> Mengukur jarak vertikal pembukaan kelopak mata.</li>
          <li><strong>||p₁ - p₄||:</strong> Mengukur lebar horizontal mata sebagai faktor normalisasi skala.</li>
        </ul>

        <h4 style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#ffffff' }}>
          Arsitektur Hybrid Pipeline (Skripsi Jason Istioso):
        </h4>
        <ol style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: 1.8, marginBottom: '16px' }}>
          <li><strong>Tahap 1 — Haar Cascade ROI:</strong> Melakukan lokalisasi awal area wajah dan mata (*Region of Interest Bounding Boxes*) secara cepat.</li>
          <li><strong>Tahap 2 — MediaPipe Landmark EAR:</strong> Mengekstraksi 6 titik kelopak mata ($p_1$ s/d $p_6$) di dalam ROI mata untuk menghitung rasio EAR matematis secara kontinu.</li>
          <li><strong>Tahap 3 — Modifikasi Frame Counting:</strong> Menerapkan <em>state machine</em> fisiologis (durasi kedipan 40ms – 650ms / 1–20 frame) dengan filter refrakter 180ms untuk menyaring kedipan palsu dan kelelahan mata (*prolonged closure*).</li>
        </ol>

        <h4 style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#ffffff' }}>
          Logika Deteksi Kedipan:
        </h4>
        <p className="theory-desc" style={{ marginBottom: '20px' }}>
          Kedipan dikonfirmasi saat nilai <code>EAR &lt; Threshold</code> terdeteksi selama durasi frame berturut-turut yang valid, kemudian nilai EAR kembali pulih di atas ambang batas.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-primary">
            <Check size={14} />
            <span>Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
