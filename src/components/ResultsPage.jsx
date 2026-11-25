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

  const hasCustomName = Boolean(username && username.trim().length > 0);
  const displayName = report.displayName;
  const activeSeconds = stats.elapsedSeconds || 0;
  const totalBlinks = stats.totalBlinks || 0;

  const now = new Date();
  const docCode = `DOC-JIC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
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

  const statusShortLabel =
    report.severity === 'normal'
      ? 'NORMAL — Sesuai Standar'
      : report.severity === 'critical'
        ? 'PERHATIAN KHUSUS — Kurang Kedipan Berat'
        : report.severity === 'warning'
          ? 'DI BAWAH STANDAR (< 15 kedipan/menit)'
          : report.severity === 'elevated' || report.severity === 'high'
            ? 'FREKUENSI TINGGI (> 20 kedipan/menit)'
            : 'BELUM LENGKAP — Menunggu Pengukuran';

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
          SCREEN VIEW: STRUCTURED DOCTOR'S RESULT LETTER
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
              <span>Reset Data</span>
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

        {/* Formal Letter Paper Container */}
        <article className="doc-letter">
          {/* Kop Surat */}
          <header className="doc-letterhead">
            <div className="doc-clinic-block">
              <div className="doc-clinic-badge">
                <Stethoscope size={16} />
                <span>JASON ISTIOSO&apos;S CLINIC</span>
              </div>
              <h1 className="doc-letter-title">SURAT HASIL PEMERIKSAAN KEDIPAN MATA</h1>
              <p className="doc-letter-sub">
                Eye Blink Detection System • Evaluasi Frekuensi Kedipan &amp; Eye Aspect Ratio (EAR)
              </p>
            </div>

            <div className="doc-meta-box">
              <div>
                <span>No. Dokumen</span>
                <strong className="mono">{docCode}</strong>
              </div>
              <div>
                <span>Tanggal</span>
                <strong>{dateOnly}</strong>
              </div>
              <div>
                <span>Durasi Uji</span>
                <strong className="mono">{formatDuration(activeSeconds)}</strong>
              </div>
            </div>
          </header>

          {/* Bagian I: Identitas Pasien & Kartu Nama */}
          <section className="doc-section">
            <div className="doc-section-heading">
              <span className="doc-sec-num">I.</span>
              <h2>IDENTITAS PASIEN / PESERTA</h2>
            </div>

            <div className="doc-identity-grid">
              <div className="doc-info-table-wrap">
                <table className="doc-info-table">
                  <tbody>
                    <tr>
                      <th>Nama Lengkap</th>
                      <td>
                        <div className="doc-name-cell">
                          <strong>{displayName}</strong>
                          <button type="button" onClick={onEditUsername} className="doc-edit-btn">
                            <Edit3 size={12} />
                            <span>{hasCustomName ? 'Ubah' : 'Isi Nama'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>Waktu Pemeriksaan</th>
                      <td>{report.evaluatedAt}</td>
                    </tr>
                    <tr>
                      <th>Metode Pengukuran</th>
                      <td>MediaPipe Face Mesh (468 Titik) &amp; Kalkulasi EAR Real-Time</td>
                    </tr>
                    <tr>
                      <th>Standar Acuan Normal</th>
                      <td>
                        <strong>
                          {BLINK_STANDARD.MIN_NORMAL}–{BLINK_STANDARD.MAX_NORMAL} kedipan / menit
                        </strong>{' '}
                        (Ambang batas EAR: {threshold.toFixed(3)})
                      </td>
                    </tr>
                    <tr>
                      <th>Keterangan Sesi</th>
                      <td>
                        {totalBlinks} kedipan tercatat dalam {formatDuration(activeSeconds)} (
                        {report.completedMinutes} siklus 1 menit selesai)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Same Holographic Namecard from Home */}
              <div className="doc-namecard-slot">
                <BusinessCard
                  effect="shards"
                  intensity={0.35}
                  greeting={`Pasien: ${displayName}`}
                  title={displayName}
                  subtitle="kartu pemeriksaan"
                  location="JASON ISTIOSO'S CLINIC"
                  websiteUrl={null}
                  websiteLabel={`${report.validatedAvgBpm} BPM • ${totalBlinks} kedipan`}
                  name={displayName}
                  nameJp="Jason Istioso's Clinic"
                  tagline="Eye Blink Detection System"
                  taglineJp={`Hasil: ${report.validatedAvgBpm} BPM • EAR ${report.avgEar.toFixed(3)}`}
                  email={`No. ${docCode}`}
                  qrCaption="Klik kartu untuk balik"
                  qrCaptionJp={`${displayName} • ${dateOnly}`}
                />
              </div>
            </div>
          </section>

          {/* Bagian II: Hasil Pemeriksaan & Kesimpulan Dokter */}
          <section className="doc-section">
            <div className="doc-section-heading">
              <span className="doc-sec-num">II.</span>
              <h2>HASIL PEMERIKSAAN &amp; KESIMPULAN MEDIS</h2>
            </div>

            <div className={`doc-verdict-banner ${statusTone}`}>
              <div className="doc-verdict-left">
                <span className="doc-verdict-kicker">Status Akhir Pemeriksaan</span>
                <div className="doc-verdict-status">
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
                <p className="doc-verdict-sub">{report.diagnosisTitle}</p>
              </div>

              <div className="doc-verdict-bpm">
                <span>Laju Kedipan</span>
                <strong>{report.validatedAvgBpm}</strong>
                <small>kedipan / menit</small>
              </div>
            </div>

            {/* Visual Spectrum */}
            <div className="res-spectrum-box" style={{ marginTop: 14 }}>
              <div className="res-spectrum-bar">
                <div
                  className="res-spectrum-normal-zone"
                  style={{
                    left: `${normalZoneLeftPct}%`,
                    width: `${normalZoneWidthPct}%`,
                  }}
                >
                  <span className="res-zone-tag">Standar 15–20</span>
                </div>
                {(activeSeconds > 0 || totalBlinks > 0) && (
                  <div
                    className={`res-spectrum-marker ${statusTone}`}
                    style={{ left: `${markerLeftPct}%` }}
                  >
                    <span className="res-marker-dot" />
                  </div>
                )}
              </div>
              <div className="res-spectrum-ticks">
                <span>0</span>
                <span>10 (Kurang)</span>
                <span>15</span>
                <span>20</span>
                <span>25+ (Tinggi)</span>
              </div>
            </div>

            {/* 4 Ringkasan Angka */}
            <div className="doc-kpi-strip">
              <div className="doc-kpi-item">
                <span>Rasio / Menit</span>
                <strong>{report.validatedAvgBpm} BPM</strong>
              </div>
              <div className="doc-kpi-item">
                <span>Total Kedipan</span>
                <strong>{totalBlinks} kali</strong>
              </div>
              <div className="doc-kpi-item">
                <span>Rata-rata EAR</span>
                <strong>{report.avgEar.toFixed(3)}</strong>
              </div>
              <div className="doc-kpi-item">
                <span>Alert (&lt; 15/mnt)</span>
                <strong style={{ color: report.alertMinutesCount > 0 ? '#fb7185' : '#34d399' }}>
                  {report.alertMinutesCount} kali
                </strong>
              </div>
            </div>

            {/* Catatan & Anjuran */}
            <div className="doc-notes-box">
              <div className="doc-notes-title">Interpretasi &amp; Anjuran:</div>
              <p className="doc-notes-summary">{report.summaryText}</p>
              <ol className="doc-notes-list">
                {report.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ol>
            </div>
          </section>

          {/* Bagian III: Rincian Pengukuran Tiap 1 Menit */}
          <section className="doc-section">
            <div className="doc-section-heading">
              <span className="doc-sec-num">III.</span>
              <h2>RINCIAN EVALUASI TIAP 1 MENIT</h2>
            </div>

            <div className="hosp-table-scroll">
              <table className="hosp-table">
                <thead>
                  <tr>
                    <th>Menit</th>
                    <th>Rentang</th>
                    <th>Kedipan</th>
                    <th>Rasio / Menit</th>
                    <th>Rasio Standar</th>
                    <th>Avg EAR</th>
                    <th>Status</th>
                    <th>Catatan Pemeriksaan</th>
                  </tr>
                </thead>
                <tbody>
                  {minuteLogs.map((m) => (
                    <tr key={m.minuteNumber} className={m.alertTriggered ? 'row-alert' : ''}>
                      <td className="mono font-bold">Menit {m.minuteNumber}</td>
                      <td className="mono text-dim">{m.windowRange}</td>
                      <td className="mono font-bold">{m.blinksInMinute} kedipan</td>
                      <td className="mono">{m.blinksInMinute} BPM</td>
                      <td className="mono">{m.minStandardPct}%</td>
                      <td className="mono">{Number(m.avgEar || 0.28).toFixed(3)}</td>
                      <td>
                        <span className={`hosp-status-chip ${m.severity}`}>
                          {m.alertTriggered ? `Alert: ${m.status}` : m.status}
                        </span>
                      </td>
                      <td className="hosp-note-cell">{m.aiNote}</td>
                    </tr>
                  ))}

                  {(currentCycleSeconds > 0 || minuteLogs.length === 0) && (
                    <tr>
                      <td className="mono text-dim">Menit {minuteLogs.length + 1}</td>
                      <td className="mono text-dim">{currentCycleSeconds}s / 60s</td>
                      <td className="mono">{currentCycleBlinks} kedipan</td>
                      <td className="mono text-dim">
                        {currentCycleSeconds > 0
                          ? `${((currentCycleBlinks / currentCycleSeconds) * 60).toFixed(1)} BPM (est.)`
                          : '—'}
                      </td>
                      <td className="mono text-dim">
                        {Math.round((currentCycleBlinks / BLINK_STANDARD.MIN_NORMAL) * 100)}%
                      </td>
                      <td className="mono">{report.avgEar.toFixed(3)}</td>
                      <td>
                        <span className="hosp-status-chip neutral">Berjalan</span>
                      </td>
                      <td className="hosp-note-cell">
                        Menunggu genap 60 detik aktif untuk evaluasi penuh menit ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bagian IV: Parameter Pemeriksaan */}
          <section className="doc-section">
            <div className="doc-section-heading">
              <span className="doc-sec-num">IV.</span>
              <h2>TABEL PARAMETER PEMERIKSAAN</h2>
            </div>

            <div className="hosp-table-scroll">
              <table className="hosp-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Hasil Terukur</th>
                    <th>Nilai Rujukan Standar</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.diagnosticTable.slice(0, 4).map((row, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold">{row.parameter}</td>
                      <td className="mono font-bold">{row.measured}</td>
                      <td className="mono text-dim">{row.reference}</td>
                      <td>
                        <span className={`hosp-status-chip ${row.tone}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bagian V: Penutup & Pengesahan Surat */}
          <footer className="doc-letter-footer">
            <div className="doc-disclaimer">
              <strong>Catatan:</strong> Surat hasil pemeriksaan ini diterbitkan secara otomatis oleh{' '}
              <em>Eye Blink Detection System</em> di <em>Jason Istioso&apos;s Clinic</em> untuk
              pemantauan kesehatan kedipan mata dan dokumentasi riset.
            </div>

            <div className="doc-signature-block">
              <span>Jakarta, {dateOnly}</span>
              <span className="doc-sign-role">Pemeriksa / Sistem</span>
              <div className="doc-sign-script">Jason Istioso</div>
              <strong>Jason Istioso&apos;s Clinic</strong>
            </div>
          </footer>
        </article>
      </div>

      {/* ========================================================
          DEDICATED CLEAN A4 PRINT / PDF LETTER
          ======================================================== */}
      <div className="pdf-print-sheet" aria-hidden="true">
        <header className="pdf-letterhead">
          <div>
            <div className="pdf-clinic-name">JASON ISTIOSO&apos;S CLINIC</div>
            <div className="pdf-system-name">
              <strong>SURAT HASIL PEMERIKSAAN KEDIPAN MATA</strong> — Eye Blink Detection System
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
              <strong>Durasi Uji:</strong> {formatDuration(activeSeconds)}
            </div>
          </div>
        </header>

        <section className="pdf-section">
          <h2 className="pdf-section-title">I. Identitas Pasien / Peserta</h2>
          <div className="pdf-patient-box">
            <div className="pdf-patient-grid">
              <div>
                <span className="pdf-field-label">Nama Pasien</span>
                <strong className="pdf-field-value">{displayName}</strong>
              </div>
              <div>
                <span className="pdf-field-label">Waktu Pemeriksaan</span>
                <strong className="pdf-field-value">{report.evaluatedAt}</strong>
              </div>
              <div>
                <span className="pdf-field-label">Standar Rujukan</span>
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
          <h2 className="pdf-section-title">II. Hasil Pemeriksaan &amp; Kesimpulan</h2>
          <div className="pdf-kpi-row">
            <div className="pdf-kpi-box">
              <span>Status Pemeriksaan</span>
              <strong>{statusShortLabel}</strong>
            </div>
            <div className="pdf-kpi-box">
              <span>Rasio Kedipan / Menit</span>
              <strong>{report.validatedAvgBpm} BPM</strong>
            </div>
            <div className="pdf-kpi-box">
              <span>Total Kedipan &amp; EAR</span>
              <strong>
                {totalBlinks} ({report.avgEar.toFixed(3)})
              </strong>
            </div>
            <div className="pdf-kpi-box">
              <span>Alert (&lt; 15/menit)</span>
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
          <h2 className="pdf-section-title">III. Rincian Evaluasi Tiap 1 Menit</h2>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Menit</th>
                <th>Rentang</th>
                <th>Kedipan</th>
                <th>Rasio / Menit</th>
                <th>Avg EAR</th>
                <th>Status</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {minuteLogs.length === 0 ? (
                <tr>
                  <td>Menit 1</td>
                  <td>{currentCycleSeconds}s / 60s</td>
                  <td>{currentCycleBlinks} kedipan</td>
                  <td>{report.validatedAvgBpm} BPM</td>
                  <td>{report.avgEar.toFixed(3)}</td>
                  <td>Berjalan</td>
                  <td>Sesi belum mencapai 60 detik penuh.</td>
                </tr>
              ) : (
                minuteLogs.map((m) => (
                  <tr key={m.minuteNumber}>
                    <td>Menit {m.minuteNumber}</td>
                    <td>{m.windowRange}</td>
                    <td>{m.blinksInMinute}</td>
                    <td>
                      {m.blinksInMinute} BPM ({m.minStandardPct}%)
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
          <h2 className="pdf-section-title">IV. Tabel Parameter Pemeriksaan</h2>
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
              {report.diagnosticTable.slice(0, 4).map((row, idx) => (
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
            <strong>Catatan:</strong> Surat hasil pemeriksaan ini diterbitkan secara otomatis oleh{' '}
            <em>Eye Blink Detection System</em> — <strong>Jason Istioso&apos;s Clinic</strong>.
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
