import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Download,
  FileDown,
  RotateCcw,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Stethoscope,
  Lock,
  Pause,
} from 'lucide-react';
import BusinessCard from './ui/holographic-business-card';
import { BLINK_STANDARD, generateHospitalClinicalReport } from '../lib/clinicalAnalysis';

function formatDuration(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ResultsPage({
  username = '',
  onEditUsername,
  stats = {},
  minuteLogs = [],
  blinkEvents = [],
  currentCycleSeconds = 0,
  currentCycleBlinks = 0,
  threshold = 0.22,
  baselineOpenEar = 0.28,
  isSessionPaused = false,
  onPauseAndUnlock,
  onBackToStudio,
  onReset,
  onExportCSV,
}) {
  const report = useMemo(
    () =>
      generateHospitalClinicalReport({
        username,
        stats,
        minuteLogs,
        blinkEvents,
        threshold,
        baselineOpenEar,
      }),
    [username, stats, minuteLogs, blinkEvents, threshold, baselineOpenEar]
  );

  // Guard: Hasil hanya bisa dilihat saat sesi dalam kondisi Pause
  if (!isSessionPaused) {
    return (
      <div className="doc-page">
        <div className="doc-lock-card">
          <div className="doc-lock-icon">
            <Lock size={24} />
          </div>
          <h2>Sesi Masih Berjalan</h2>
          <p>
            Tekan tombol <strong>Pause</strong> terlebih dahulu agar surat hasil pemeriksaan dapat
            dibuka dengan data terbaru.
          </p>
          <div className="doc-lock-actions">
            <button type="button" onClick={onBackToStudio} className="res-btn secondary">
              <ArrowLeft size={15} />
              <span>Kembali ke Studio</span>
            </button>
            <button type="button" onClick={onPauseAndUnlock} className="res-btn primary">
              <Pause size={15} />
              <span>Pause &amp; Buka Hasil</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasCustomName = Boolean(username && username.trim().length > 0);
  const displayName = report.displayName;
  const activeSeconds = stats.elapsedSeconds || 0;
  const totalBlinks = stats.totalBlinks || 0;

  const now = new Date();
  const docCode = `JIC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const dateOnly = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const statusTone =
    report.severity === 'normal'
      ? 'normal'
      : report.severity === 'critical'
        ? 'critical'
        : report.severity === 'warning'
          ? 'warning'
          : report.severity === 'elevated' || report.severity === 'high'
            ? 'elevated'
            : 'neutral';

  const statusShortLabel = report.diagnosisBadge;

  const handlePrintPdf = () => {
    const prevTitle = document.title;
    const safeName = displayName.replace(/[^a-zA-Z0-9_-]/g, '_');
    document.title = `Surat_Hasil_Pemeriksaan_${safeName}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  };

  // Spectrum needle (0..32 BPM)
  const maxGaugeBpm = 32;
  const markerLeftPct = Math.max(2, Math.min(98, (report.validatedAvgBpm / maxGaugeBpm) * 100));
  const normalZoneLeftPct = (BLINK_STANDARD.MIN_NORMAL / maxGaugeBpm) * 100;
  const normalZoneWidthPct =
    ((BLINK_STANDARD.MAX_NORMAL - BLINK_STANDARD.MIN_NORMAL) / maxGaugeBpm) * 100;

  return (
    <div className="doc-page">
      {/* ========================================================
          SCREEN VIEW: REFINED EDITORIAL PAPER LETTER
          ======================================================== */}
      <div className="doc-container screen-only-results">
        {/* Top Action Toolbar */}
        <div className="doc-toolbar">
          <button type="button" onClick={onBackToStudio} className="res-btn secondary">
            <ArrowLeft size={15} />
            <span>Kembali ke Studio</span>
          </button>

          <div className="doc-toolbar-right">
            <button type="button" onClick={onReset} className="simple-reset-link">
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
            <button type="button" onClick={onExportCSV} className="res-btn secondary">
              <Download size={15} />
              <span>Export CSV</span>
            </button>
            <button type="button" onClick={handlePrintPdf} className="res-btn primary">
              <FileDown size={15} />
              <span>Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Crisp Paper Letter Sheet */}
        <article className="paper-letter">
          {/* Kop Surat Resmi */}
          <header className="paper-letterhead">
            <div className="paper-clinic-side">
              <div className="paper-clinic-brand">
                <span className="paper-clinic-icon">
                  <Stethoscope size={15} />
                </span>
                <span>Jason Istioso&apos;s Clinic</span>
              </div>
              <h1 className="paper-letter-title">Surat Hasil Pemeriksaan Kedipan Mata</h1>
              <p className="paper-letter-sub">
                Eye Blink Detection System — Evaluasi Frekuensi Kedipan &amp; Eye Aspect Ratio
              </p>
            </div>

            <div className="paper-meta-grid">
              <div>
                <span>No. Dokumen</span>
                <strong className="mono">{docCode}</strong>
              </div>
              <div>
                <span>Tanggal</span>
                <strong>{dateOnly}</strong>
              </div>
              <div>
                <span>Durasi Sesi</span>
                <strong className="mono">{formatDuration(activeSeconds)}</strong>
              </div>
            </div>
          </header>

          {/* Bagian I: Identitas Pasien & Kartu Nama */}
          <section className="paper-section">
            <div className="paper-sec-title">
              <span>I.</span> Identitas Pasien
            </div>

            <div className="paper-identity-row">
              <div className="paper-identity-list">
                <div className="paper-id-item">
                  <span className="paper-id-label">Nama Lengkap</span>
                  <div className="paper-id-val-row">
                    <strong>{displayName}</strong>
                    <button type="button" onClick={onEditUsername} className="paper-edit-btn">
                      <Edit3 size={12} />
                      <span>{hasCustomName ? 'Ubah Nama' : 'Isi Nama'}</span>
                    </button>
                  </div>
                </div>

                <div className="paper-id-item">
                  <span className="paper-id-label">Waktu Pemeriksaan</span>
                  <span>{report.evaluatedAt}</span>
                </div>

                <div className="paper-id-item">
                  <span className="paper-id-label">Metode Pengukuran</span>
                  <span>Kamera &amp; Rasio Keterbukaan Mata (EAR)</span>
                </div>

                <div className="paper-id-item">
                  <span className="paper-id-label">Standar Normal</span>
                  <span>
                    <strong>
                      {BLINK_STANDARD.MIN_NORMAL}–{BLINK_STANDARD.MAX_NORMAL} kedipan per menit
                    </strong>{' '}
                    (Threshold {threshold.toFixed(3)})
                  </span>
                </div>

                <div className="paper-id-item">
                  <span className="paper-id-label">Ringkasan Sesi</span>
                  <span>
                    {totalBlinks} kedipan selama {formatDuration(activeSeconds)} (
                    {report.completedMinutes} siklus 1 menit selesai)
                  </span>
                </div>
              </div>

              {/* Holographic Namecard (Same as Home, clean balanced strip) */}
              <div className="paper-namecard-wrap">
                <BusinessCard
                  effect="shards"
                  intensity={0.35}
                  greeting={`Halo, ${displayName}`}
                  title={displayName}
                  subtitle="hasil pemeriksaan"
                  location="JAKARTA"
                  websiteUrl={null}
                  websiteLabel={`${report.validatedAvgBpm} BPM • ${totalBlinks} kedipan`}
                  name={displayName}
                  nameJp="Jason Istioso's Clinic"
                  tagline="Eye Blink Detection System"
                  taglineJp={`Rata-rata ${report.validatedAvgBpm} BPM • EAR ${report.avgEar.toFixed(3)}`}
                  email={`No. ${docCode}`}
                  qrCaption="Klik kartu untuk balik"
                  qrCaptionJp={`${displayName} • ${dateOnly}`}
                />
              </div>
            </div>
          </section>

          {/* Bagian II: Ringkasan & Hasil Evaluasi */}
          <section className="paper-section">
            <div className="paper-sec-title">
              <span>II.</span> Ringkasan &amp; Hasil Evaluasi
            </div>

            <div className={`paper-verdict-card ${statusTone}`}>
              <div className="paper-verdict-main">
                <span className="paper-verdict-kicker">Status Pemeriksaan</span>
                <div className="paper-verdict-badge">
                  {statusTone === 'normal' ? (
                    <CheckCircle2 size={18} />
                  ) : statusTone === 'neutral' ? (
                    <Clock size={18} />
                  ) : statusTone === 'critical' ? (
                    <ShieldAlert size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                  <strong>{statusShortLabel}</strong>
                </div>
                <div className="paper-verdict-heading">{report.diagnosisTitle}</div>
              </div>

              <div className="paper-bpm-box">
                <span>Frekuensi Kedipan</span>
                <strong>{report.validatedAvgBpm}</strong>
                <small>kedipan / menit</small>
              </div>
            </div>

            {/* Spectrum Bar */}
            <div className="paper-spectrum-wrap">
              <div className="paper-spectrum-bar">
                <div
                  className="paper-spectrum-zone"
                  style={{
                    left: `${normalZoneLeftPct}%`,
                    width: `${normalZoneWidthPct}%`,
                  }}
                >
                  <span>Standar 15–20</span>
                </div>
                {(activeSeconds > 0 || totalBlinks > 0) && (
                  <div
                    className={`paper-spectrum-needle ${statusTone}`}
                    style={{ left: `${markerLeftPct}%` }}
                  />
                )}
              </div>
              <div className="paper-spectrum-ticks">
                <span>0</span>
                <span>10 (Kurang)</span>
                <span>15</span>
                <span>20</span>
                <span>25+ (Tinggi)</span>
              </div>
            </div>

            {/* 4 Key Numbers */}
            <div className="paper-kpi-grid">
              <div className="paper-kpi-tile">
                <span>Frekuensi Rata-rata</span>
                <strong>{report.validatedAvgBpm} / menit</strong>
              </div>
              <div className="paper-kpi-tile">
                <span>Total Kedipan</span>
                <strong>{totalBlinks} kali</strong>
              </div>
              <div className="paper-kpi-tile">
                <span>Rata-rata EAR</span>
                <strong>{report.avgEar.toFixed(3)}</strong>
              </div>
              <div className="paper-kpi-tile">
                <span>Peringatan Kurang Kedip</span>
                <strong className={report.alertMinutesCount > 0 ? 'txt-rose' : 'txt-emerald'}>
                  {report.alertMinutesCount} kali
                </strong>
              </div>
            </div>

            {/* Concise Notes */}
            <div className="paper-advice-box">
              <p className="paper-advice-summary">{report.summaryText}</p>
              <div className="paper-advice-title">Anjuran Perawatan Mata</div>
              <ol className="paper-advice-list">
                {report.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ol>
            </div>
          </section>

          {/* Bagian III: Catatan Kedipan Per Menit */}
          <section className="paper-section">
            <div className="paper-sec-title">
              <span>III.</span> Catatan Kedipan Per Menit
            </div>

            <div className="paper-table-wrap">
              <table className="paper-table">
                <thead>
                  <tr>
                    <th>Menit</th>
                    <th>Rentang</th>
                    <th>Kedipan</th>
                    <th>Frekuensi</th>
                    <th>Standar</th>
                    <th>Avg EAR</th>
                    <th>Status</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {minuteLogs.map((m) => (
                    <tr key={m.minuteNumber} className={m.alertTriggered ? 'row-alert' : ''}>
                      <td className="mono bold">Menit {m.minuteNumber}</td>
                      <td className="mono muted">{m.windowRange}</td>
                      <td className="mono bold">{m.blinksInMinute} kali</td>
                      <td className="mono">{m.blinksInMinute} / mnt</td>
                      <td className="mono">{m.minStandardPct}%</td>
                      <td className="mono">{Number(m.avgEar || 0.28).toFixed(3)}</td>
                      <td>
                        <span className={`paper-chip ${m.severity}`}>
                          {m.alertTriggered ? `Alert: ${m.status}` : m.status}
                        </span>
                      </td>
                      <td>{m.aiNote}</td>
                    </tr>
                  ))}

                  {(currentCycleSeconds > 0 || minuteLogs.length === 0) && (
                    <tr>
                      <td className="mono muted">Menit {minuteLogs.length + 1}</td>
                      <td className="mono muted">{currentCycleSeconds}s / 60s</td>
                      <td className="mono">{currentCycleBlinks} kali</td>
                      <td className="mono muted">
                        {currentCycleSeconds > 0
                          ? `${((currentCycleBlinks / currentCycleSeconds) * 60).toFixed(1)} / mnt`
                          : '—'}
                      </td>
                      <td className="mono muted">
                        {Math.round((currentCycleBlinks / BLINK_STANDARD.MIN_NORMAL) * 100)}%
                      </td>
                      <td className="mono">{report.avgEar.toFixed(3)}</td>
                      <td>
                        <span className="paper-chip neutral">Sementara</span>
                      </td>
                      <td className="muted">
                        Catatan sementara sebelum siklus genap 60 detik.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bagian IV: Rincian Parameter */}
          <section className="paper-section">
            <div className="paper-sec-title">
              <span>IV.</span> Rincian Parameter Pemeriksaan
            </div>

            <div className="paper-table-wrap">
              <table className="paper-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Hasil Terukur</th>
                    <th>Nilai Rujukan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.diagnosticTable.map((row, idx) => (
                    <tr key={idx}>
                      <td className="bold">{row.parameter}</td>
                      <td className="mono bold">{row.measured}</td>
                      <td className="mono muted">{row.reference}</td>
                      <td>
                        <span className={`paper-chip ${row.tone}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bagian V: Penutup & Pengesahan */}
          <footer className="paper-footer">
            <div className="paper-disclaimer">
              Dokumen ini merupakan hasil pemeriksaan dari <strong>Jason Istioso&apos;s Clinic</strong>{' '}
              melalui <strong>Eye Blink Detection System</strong> sebagai acuan pemantauan
              kesehatan mata.
            </div>

            <div className="paper-signature">
              <span>Jakarta, {dateOnly}</span>
              <span className="paper-sign-role">Pemeriksa</span>
              <div className="paper-sign-script">Jason Istioso</div>
              <strong>Jason Istioso&apos;s Clinic</strong>
            </div>
          </footer>
        </article>
      </div>

      {/* ========================================================
          DEDICATED CLEAN A4 PRINT / PDF SHEET
          ======================================================== */}
      <div className="pdf-print-sheet" aria-hidden="true">
        <header className="pdf-letterhead">
          <div>
            <div className="pdf-clinic-name">Jason Istioso&apos;s Clinic</div>
            <div className="pdf-system-name">
              <strong>Surat Hasil Pemeriksaan Kedipan Mata</strong> — Eye Blink Detection System
            </div>
          </div>
          <div className="pdf-meta-right">
            <div>
              <strong>No. Dokumen:</strong> {docCode}
            </div>
            <div>
              <strong>Tanggal:</strong> {dateOnly}
            </div>
            <div>
              <strong>Durasi Sesi:</strong> {formatDuration(activeSeconds)}
            </div>
          </div>
        </header>

        <section className="pdf-section">
          <h2 className="pdf-section-title">I. Identitas Pasien</h2>
          <div className="pdf-patient-box">
            <div className="pdf-patient-grid">
              <div>
                <span className="pdf-field-label">Nama Lengkap</span>
                <strong className="pdf-field-value">{displayName}</strong>
              </div>
              <div>
                <span className="pdf-field-label">Waktu Pemeriksaan</span>
                <strong className="pdf-field-value">{report.evaluatedAt}</strong>
              </div>
              <div>
                <span className="pdf-field-label">Standar Normal</span>
                <strong className="pdf-field-value">
                  {BLINK_STANDARD.MIN_NORMAL}–{BLINK_STANDARD.MAX_NORMAL} kedipan/menit
                </strong>
              </div>
              <div>
                <span className="pdf-field-label">Threshold EAR</span>
                <strong className="pdf-field-value">{threshold.toFixed(3)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="pdf-section">
          <h2 className="pdf-section-title">II. Ringkasan &amp; Hasil Evaluasi</h2>
          <div className="pdf-kpi-row">
            <div className="pdf-kpi-box">
              <span>Status</span>
              <strong>{statusShortLabel}</strong>
            </div>
            <div className="pdf-kpi-box">
              <span>Frekuensi</span>
              <strong>{report.validatedAvgBpm} / menit</strong>
            </div>
            <div className="pdf-kpi-box">
              <span>Total Kedipan &amp; EAR</span>
              <strong>
                {totalBlinks} ({report.avgEar.toFixed(3)})
              </strong>
            </div>
            <div className="pdf-kpi-box">
              <span>Peringatan (&lt; 15/mnt)</span>
              <strong>{report.alertMinutesCount} kali</strong>
            </div>
          </div>

          <p className="pdf-summary-heading">{report.diagnosisTitle}</p>
          <p className="pdf-summary-text">{report.summaryText}</p>
          <ol className="pdf-advice-list" style={{ paddingLeft: 18 }}>
            {report.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ol>
        </section>

        <section className="pdf-section">
          <h2 className="pdf-section-title">III. Catatan Kedipan Per Menit</h2>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Menit</th>
                <th>Rentang</th>
                <th>Kedipan</th>
                <th>Frekuensi</th>
                <th>Avg EAR</th>
                <th>Status</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {minuteLogs.length === 0 ? (
                <tr>
                  <td>Menit 1</td>
                  <td>{currentCycleSeconds}s / 60s</td>
                  <td>{currentCycleBlinks} kali</td>
                  <td>{report.validatedAvgBpm} / mnt</td>
                  <td>{report.avgEar.toFixed(3)}</td>
                  <td>Sementara</td>
                  <td>Catatan sementara sebelum siklus genap 60 detik.</td>
                </tr>
              ) : (
                minuteLogs.map((m) => (
                  <tr key={m.minuteNumber}>
                    <td>Menit {m.minuteNumber}</td>
                    <td>{m.windowRange}</td>
                    <td>{m.blinksInMinute} kali</td>
                    <td>
                      {m.blinksInMinute} / mnt ({m.minStandardPct}%)
                    </td>
                    <td>{Number(m.avgEar || 0.28).toFixed(3)}</td>
                    <td>{m.alertTriggered ? `Alert (${m.status})` : m.status}</td>
                    <td>{m.aiNote}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="pdf-section">
          <h2 className="pdf-section-title">IV. Rincian Parameter Pemeriksaan</h2>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Hasil Terukur</th>
                <th>Nilai Rujukan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.diagnosticTable.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.parameter}</td>
                  <td>{row.measured}</td>
                  <td>{row.reference}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="pdf-footer">
          <div style={{ maxWidth: '62%' }}>
            Dokumen resmi hasil pemeriksaan dari <strong>Jason Istioso&apos;s Clinic</strong>{' '}
            melalui <strong>Eye Blink Detection System</strong>.
          </div>
          <div className="pdf-sign-box">
            <span>Jakarta, {dateOnly}</span>
            <div className="pdf-sign-line" />
            <strong>Jason Istioso&apos;s Clinic</strong>
          </div>
        </footer>
      </div>
    </div>
  );
}
