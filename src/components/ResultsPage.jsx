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
      ? 'Normal (Sesuai Standar)'
      : report.severity === 'critical'
        ? 'Kurang Kedipan Berat'
        : report.severity === 'warning'
          ? 'Di Bawah Standar (< 15/mnt)'
          : report.severity === 'elevated' || report.severity === 'high'
            ? 'Frekuensi Tinggi'
            : 'Menunggu Data';

  const handlePrintPdf = () => {
    const prevTitle = document.title;
    const safeName = displayName.replace(/[^a-zA-Z0-9_-]/g, '_');
    document.title = `Eye_Blink_Detection_Report_${safeName}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  };

  return (
    <div className="simple-results-page">
      {/* ========================================================
          SCREEN VIEW (Dark Mode Clean Layout)
          ======================================================== */}
      <div className="simple-results-container screen-only-results">
        {/* Simple Clean Header */}
        <div className="simple-results-header">
          <div>
            <h1 className="simple-results-title">Hasil Pemeriksaan Kedipan Mata</h1>
            <p className="simple-results-sub">
              Jason Istioso&apos;s Clinic • Eye Blink Detection System • {displayName} • Durasi{' '}
              {formatDuration(activeSeconds)}
            </p>
          </div>

          <div className="simple-results-actions">
            <button type="button" onClick={onBackToStudio} className="hosp-btn-secondary">
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </button>
            <button type="button" onClick={onExportCSV} className="hosp-btn-secondary">
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button type="button" onClick={handlePrintPdf} className="hosp-btn-primary">
              <FileDown size={14} />
              <span>Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Row 1: Namecard (Same as Home, username synced) + Clean Summary */}
        <div className="simple-results-top-grid">
          <div className="simple-panel simple-namecard-box">
            <div className="hosp-namecard-stage">
              <BusinessCard
                effect="shards"
                intensity={0.35}
                greeting={`Halo, ${displayName}`}
                title={displayName}
                subtitle="hasil analisis kedipan"
                location="JASON ISTIOSO'S CLINIC"
                websiteUrl={null}
                websiteLabel={`${report.validatedAvgBpm} BPM • ${totalBlinks} kedipan`}
                name={displayName}
                nameJp="Jason Istioso's Clinic"
                tagline="Eye Blink Detection System"
                taglineJp={`Rata-rata: ${report.validatedAvgBpm} BPM • EAR ${report.avgEar.toFixed(3)}`}
                email="Standar: 15–20 kedipan/menit"
                qrCaption="Klik kartu untuk balik"
                qrCaptionJp={`${displayName} • ${formatDuration(activeSeconds)}`}
              />
            </div>

            <button
              type="button"
              onClick={onEditUsername}
              className="simple-edit-name-link"
            >
              <Edit3 size={12} />
              <span>{hasCustomName ? `Ubah nama (${displayName})` : 'Isi username untuk kartu nama'}</span>
            </button>
          </div>

          <div className="simple-panel simple-summary-box">
            <div className="simple-summary-head">
              <span className="simple-section-label">Jason Istioso&apos;s Clinic • Ringkasan</span>
              <span className={`hosp-status-chip ${statusTone}`}>
                {statusTone === 'normal' ? (
                  <CheckCircle2 size={12} />
                ) : statusTone === 'neutral' ? (
                  <Clock size={12} />
                ) : (
                  <AlertTriangle size={12} />
                )}
                <span>{statusShortLabel}</span>
              </span>
            </div>

            <h2 className="simple-diagnosis-title">{report.diagnosisTitle}</h2>
            <p className="simple-diagnosis-desc">{report.summaryText}</p>

            {/* 4 Clean Numbers */}
            <div className="simple-metrics-grid">
              <div className="simple-metric-cell">
                <span className="simple-metric-label">Rasio / Menit</span>
                <strong className="simple-metric-value">{report.validatedAvgBpm}</strong>
                <span className="simple-metric-hint">Standar 15–20/mnt</span>
              </div>
              <div className="simple-metric-cell">
                <span className="simple-metric-label">Total Kedipan</span>
                <strong className="simple-metric-value">{totalBlinks}</strong>
                <span className="simple-metric-hint">Durasi {formatDuration(activeSeconds)}</span>
              </div>
              <div className="simple-metric-cell">
                <span className="simple-metric-label">Rata-rata EAR</span>
                <strong className="simple-metric-value">{report.avgEar.toFixed(3)}</strong>
                <span className="simple-metric-hint">Threshold {threshold.toFixed(3)}</span>
              </div>
              <div className="simple-metric-cell">
                <span className="simple-metric-label">Alert (&lt; 15/mnt)</span>
                <strong
                  className="simple-metric-value"
                  style={{ color: report.alertMinutesCount > 0 ? '#fb7185' : '#34d399' }}
                >
                  {report.alertMinutesCount}x
                </strong>
                <span className="simple-metric-hint">{report.completedMinutes} menit selesai</span>
              </div>
            </div>

            {/* Concise Recommendations */}
            <div className="simple-advice-box">
              <span className="simple-advice-label">Saran</span>
              <ul className="simple-advice-list">
                {report.recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Row 2: Minute-by-Minute Table */}
        <div className="simple-panel">
          <div className="simple-table-head">
            <h3 className="simple-table-title">Tabel Analisis Tiap 1 Menit</h3>
            <span className="simple-table-meta">
              Standar umum: {BLINK_STANDARD.MIN_NORMAL}–{BLINK_STANDARD.MAX_NORMAL} kedipan/menit
            </span>
          </div>

          <div className="hosp-table-scroll">
            <table className="hosp-table">
              <thead>
                <tr>
                  <th>Menit</th>
                  <th>Rentang</th>
                  <th>Jumlah Kedipan</th>
                  <th>Rasio / Menit</th>
                  <th>Rata-rata EAR</th>
                  <th>Status</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {minuteLogs.map((m) => (
                  <tr key={m.minuteNumber} className={m.alertTriggered ? 'row-alert' : ''}>
                    <td className="mono font-bold">Menit {m.minuteNumber}</td>
                    <td className="mono text-dim">{m.windowRange}</td>
                    <td className="mono font-bold">{m.blinksInMinute} kedipan</td>
                    <td className="mono">
                      {m.blinksInMinute} BPM ({m.minStandardPct}%)
                    </td>
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
                    <td className="mono">{report.avgEar.toFixed(3)}</td>
                    <td>
                      <span className="hosp-status-chip neutral">Sedang Berjalan</span>
                    </td>
                    <td className="hosp-note-cell">
                      Evaluasi otomatis tercatat saat mencapai 60 detik aktif.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 3: Simple Parameter Reference Table */}
        <div className="simple-panel">
          <div className="simple-table-head">
            <h3 className="simple-table-title">Parameter Pemeriksaan</h3>
            <button type="button" onClick={onReset} className="simple-reset-link">
              <RotateCcw size={13} />
              <span>Reset Data</span>
            </button>
          </div>

          <div className="hosp-table-scroll">
            <table className="hosp-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Hasil</th>
                  <th>Standar Rujukan</th>
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
        </div>
      </div>

      {/* ========================================================
          DEDICATED CLEAN A4 PRINT / PDF LAYOUT
          (Hidden on screen, crisp white paper format when saved as PDF)
          ======================================================== */}
      <div className="pdf-print-sheet" aria-hidden="true">
        <header className="pdf-letterhead">
          <div>
            <div className="pdf-clinic-name">Jason Istioso&apos;s Clinic</div>
            <div className="pdf-system-name">
              Eye Blink Detection System • Laporan Hasil Pemeriksaan Kedipan Mata
            </div>
          </div>
          <div className="pdf-meta-right">
            <div>
              <strong>Tanggal:</strong> {report.evaluatedAt}
            </div>
            <div>
              <strong>Durasi Sesi:</strong> {formatDuration(activeSeconds)}
            </div>
          </div>
        </header>

        <section className="pdf-patient-box">
          <div className="pdf-patient-grid">
            <div>
              <span className="pdf-field-label">Nama Peserta / Pasien</span>
              <strong className="pdf-field-value">{displayName}</strong>
            </div>
            <div>
              <span className="pdf-field-label">Status Hasil</span>
              <strong className="pdf-field-value">{statusShortLabel}</strong>
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
        </section>

        <section className="pdf-kpi-row">
          <div className="pdf-kpi-box">
            <span>Rasio Kedipan / Menit</span>
            <strong>{report.validatedAvgBpm} BPM</strong>
          </div>
          <div className="pdf-kpi-box">
            <span>Total Kedipan</span>
            <strong>{totalBlinks} kedipan</strong>
          </div>
          <div className="pdf-kpi-box">
            <span>Rata-rata EAR</span>
            <strong>{report.avgEar.toFixed(3)}</strong>
          </div>
          <div className="pdf-kpi-box">
            <span>Alert (&lt; 15/menit)</span>
            <strong>{report.alertMinutesCount} kali</strong>
          </div>
        </section>

        <section className="pdf-section">
          <h2 className="pdf-section-title">Kesimpulan &amp; Saran</h2>
          <p className="pdf-summary-heading">{report.diagnosisTitle}</p>
          <p className="pdf-summary-text">{report.summaryText}</p>
          <ul className="pdf-advice-list">
            {report.recommendations.slice(0, 3).map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </section>

        <section className="pdf-section">
          <h2 className="pdf-section-title">Tabel Analisis Tiap 1 Menit</h2>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Menit</th>
                <th>Rentang</th>
                <th>Kedipan</th>
                <th>Rasio / Menit</th>
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
          <h2 className="pdf-section-title">Parameter Pemeriksaan</h2>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Hasil Terukur</th>
                <th>Standar Rujukan</th>
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
          <div>
            Dicetak dari <strong>Eye Blink Detection System</strong> —{' '}
            <strong>Jason Istioso&apos;s Clinic</strong>
          </div>
          <div className="pdf-sign-box">
            <span>Pemeriksa / Sistem</span>
            <div className="pdf-sign-line" />
            <strong>Jason Istioso&apos;s Clinic</strong>
          </div>
        </footer>
      </div>
    </div>
  );
}
