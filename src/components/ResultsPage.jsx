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
  Activity,
  Eye,
  Timer,
  ShieldAlert,
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
      ? 'Normal • Sesuai Standar'
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

  // Position on 0..32 BPM spectrum bar
  const maxGaugeBpm = 32;
  const markerLeftPct = Math.max(2, Math.min(98, (report.validatedAvgBpm / maxGaugeBpm) * 100));
  const normalZoneLeftPct = (BLINK_STANDARD.MIN_NORMAL / maxGaugeBpm) * 100;
  const normalZoneWidthPct =
    ((BLINK_STANDARD.MAX_NORMAL - BLINK_STANDARD.MIN_NORMAL) / maxGaugeBpm) * 100;

  const maxBarBlinks = Math.max(26, ...minuteLogs.map((m) => m.blinksInMinute), currentCycleBlinks);
  const recentBlinks = [...blinkEvents].slice(-8).reverse();

  return (
    <div className="res-page">
      {/* ========================================================
          SCREEN VIEW (Polished, Visual, Clean & Easy to Scan)
          ======================================================== */}
      <div className="res-container screen-only-results">
        {/* Top Header */}
        <header className="res-header">
          <div className="res-header-left">
            <div className="res-eyebrow">
              <span>Jason Istioso&apos;s Clinic</span>
              <span className="res-dot-sep">•</span>
              <span>Eye Blink Detection System</span>
            </div>
            <h1 className="res-title">Hasil Pemeriksaan Kedipan</h1>
            <p className="res-subtitle">
              Peserta <strong>{displayName}</strong> • Durasi aktif{' '}
              <strong>{formatDuration(activeSeconds)}</strong> • Standar umum{' '}
              <strong>
                {BLINK_STANDARD.MIN_NORMAL}–{BLINK_STANDARD.MAX_NORMAL} kedipan/menit
              </strong>
            </p>
          </div>

          <div className="res-header-actions">
            <button type="button" onClick={onBackToStudio} className="res-btn secondary">
              <ArrowLeft size={15} />
              <span>Kembali ke Studio</span>
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
        </header>

        {/* Hero Row: Namecard Stage + Visual Assessment Card */}
        <section className="res-hero-grid">
          {/* Left: Holographic Namecard (Same as Home, personalized to username) */}
          <div className="res-surface res-card-stage-panel">
            <div className="res-card-ambient" />
            <div className="res-stage-top">
              <span className="res-label-cap">Kartu Identitas Peserta</span>
              <button type="button" onClick={onEditUsername} className="res-edit-pill">
                <Edit3 size={12} />
                <span>{hasCustomName ? 'Ubah Nama' : 'Isi Nama'}</span>
              </button>
            </div>

            <div className="res-namecard-wrap">
              <BusinessCard
                effect="shards"
                intensity={0.38}
                greeting={`Halo, ${displayName}`}
                title={displayName}
                subtitle="hasil pemeriksaan"
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

            <p className="res-card-hint">
              Arahkan kursor atau klik kartu untuk melihat detail sisi belakang.
            </p>
          </div>

          {/* Right: Visual Clinical Assessment */}
          <div className="res-surface res-summary-panel">
            <div className="res-summary-top">
              <div>
                <span className="res-label-cap">Evaluasi Laju Kedipan</span>
                <div className="res-hero-bpm-row">
                  <span className={`res-hero-bpm ${statusTone}`}>{report.validatedAvgBpm}</span>
                  <span className="res-hero-unit">kedipan / menit</span>
                </div>
              </div>

              <span className={`res-status-badge ${statusTone}`}>
                {statusTone === 'normal' ? (
                  <CheckCircle2 size={14} />
                ) : statusTone === 'neutral' ? (
                  <Clock size={14} />
                ) : statusTone === 'critical' ? (
                  <ShieldAlert size={14} />
                ) : (
                  <AlertTriangle size={14} />
                )}
                <span>{statusShortLabel}</span>
              </span>
            </div>

            {/* Visual Blink Rate Spectrum Bar */}
            <div className="res-spectrum-box">
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
                    title={`Posisi Anda: ${report.validatedAvgBpm} kedipan/menit`}
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

            {/* 3 Clean Highlight Metrics */}
            <div className="res-kpi-grid">
              <div className="res-kpi-card">
                <div className="res-kpi-head">
                  <Eye size={14} className="icon-cyan" />
                  <span>Total Kedipan</span>
                </div>
                <strong className="res-kpi-val">{totalBlinks}</strong>
                <span className="res-kpi-sub">Durasi aktif {formatDuration(activeSeconds)}</span>
              </div>

              <div className="res-kpi-card">
                <div className="res-kpi-head">
                  <Activity size={14} className="icon-emerald" />
                  <span>Rata-rata EAR</span>
                </div>
                <strong className="res-kpi-val">{report.avgEar.toFixed(3)}</strong>
                <span className="res-kpi-sub">Threshold {threshold.toFixed(3)}</span>
              </div>

              <div className="res-kpi-card">
                <div className="res-kpi-head">
                  <Timer size={14} className={report.alertMinutesCount > 0 ? 'icon-rose' : 'icon-emerald'} />
                  <span>Alert 1 Menit</span>
                </div>
                <strong
                  className="res-kpi-val"
                  style={{ color: report.alertMinutesCount > 0 ? '#fb7185' : '#34d399' }}
                >
                  {report.alertMinutesCount}x
                </strong>
                <span className="res-kpi-sub">{report.completedMinutes} siklus selesai</span>
              </div>
            </div>

            {/* Verdict & Practical Advice */}
            <div className={`res-verdict-box ${statusTone}`}>
              <h2 className="res-verdict-title">{report.diagnosisTitle}</h2>
              <p className="res-verdict-desc">{report.summaryText}</p>
              <ul className="res-advice-list">
                {report.recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Minute-by-Minute Visual Chart + Evaluation Table */}
        <section className="res-surface">
          <div className="res-section-head">
            <div>
              <span className="res-label-cap">Pemantauan Per 60 Detik</span>
              <h2 className="res-section-title">Analisis Kedipan Tiap 1 Menit</h2>
            </div>
            <div className="res-legend">
              <span><i className="dot normal" /> Normal (15–20)</span>
              <span><i className="dot warning" /> Kurang (&lt; 15)</span>
              <span><i className="dot elevated" /> Tinggi (&gt; 20)</span>
            </div>
          </div>

          {/* Clean Visual Bar Strip when there is data */}
          {(minuteLogs.length > 0 || currentCycleSeconds > 0) && (
            <div className="res-chart-box">
              <div
                className="res-chart-band"
                style={{
                  bottom: `${(BLINK_STANDARD.MIN_NORMAL / maxBarBlinks) * 100}%`,
                  height: `${((BLINK_STANDARD.MAX_NORMAL - BLINK_STANDARD.MIN_NORMAL) / maxBarBlinks) * 100}%`,
                }}
              >
                <span>Standar 15–20/mnt</span>
              </div>

              <div className="res-chart-cols">
                {minuteLogs.map((m) => {
                  const hPct = Math.max(8, Math.min(100, (m.blinksInMinute / maxBarBlinks) * 100));
                  return (
                    <div key={m.minuteNumber} className="res-chart-col">
                      <span className="res-bar-num">{m.blinksInMinute}</span>
                      <div className="res-bar-rail">
                        <div className={`res-bar-fill ${m.severity}`} style={{ height: `${hPct}%` }} />
                      </div>
                      <span className="res-bar-lbl">M{m.minuteNumber}</span>
                    </div>
                  );
                })}

                {currentCycleSeconds > 0 && (
                  <div className="res-chart-col">
                    <span className="res-bar-num dim">{currentCycleBlinks}*</span>
                    <div className="res-bar-rail">
                      <div
                        className="res-bar-fill progress"
                        style={{
                          height: `${Math.max(8, Math.min(100, (currentCycleBlinks / maxBarBlinks) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="res-bar-lbl">M{minuteLogs.length + 1} ({currentCycleSeconds}s)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clean Table */}
          <div className="hosp-table-scroll">
            <table className="hosp-table">
              <thead>
                <tr>
                  <th>Menit</th>
                  <th>Rentang</th>
                  <th>Kedipan</th>
                  <th>Rasio / Menit</th>
                  <th>Pencapaian</th>
                  <th>Avg EAR</th>
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
                    <td className="mono">{m.blinksInMinute} BPM</td>
                    <td>
                      <div className="hosp-ratio-cell">
                        <div className="hosp-ratio-bar">
                          <div
                            className={`hosp-ratio-fill ${m.severity}`}
                            style={{ width: `${Math.min(100, m.minStandardPct)}%` }}
                          />
                        </div>
                        <span className="mono">{m.minStandardPct}%</span>
                      </div>
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
                    <td>
                      <div className="hosp-ratio-cell">
                        <div className="hosp-ratio-bar">
                          <div
                            className="hosp-ratio-fill elevated"
                            style={{
                              width: `${Math.min(100, Math.round((currentCycleBlinks / BLINK_STANDARD.MIN_NORMAL) * 100))}%`,
                            }}
                          />
                        </div>
                        <span className="mono">
                          {Math.round((currentCycleBlinks / BLINK_STANDARD.MIN_NORMAL) * 100)}%
                        </span>
                      </div>
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
        </section>

        {/* Bottom 2-Column Row: Parameter Reference + Recent Blink Log */}
        <section className="res-bottom-grid">
          <div className="res-surface">
            <div className="res-section-head">
              <div>
                <span className="res-label-cap">Ringkasan Metrik</span>
                <h2 className="res-section-title">Parameter Pemeriksaan</h2>
              </div>
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

          <div className="res-surface">
            <div className="res-section-head">
              <div>
                <span className="res-label-cap">Telemetri Terakhir</span>
                <h2 className="res-section-title">Catatan Kedipan ({blinkEvents.length})</h2>
              </div>
            </div>

            {recentBlinks.length === 0 ? (
              <div className="res-empty-blinks">
                Belum ada kedipan yang tercatat pada sesi ini.
              </div>
            ) : (
              <div className="res-blink-list">
                {recentBlinks.map((ev, idx) => (
                  <div key={ev.id || idx} className="res-blink-row">
                    <span className="mono text-dim">#{ev.id || blinkEvents.length - idx}</span>
                    <span className="mono">
                      {ev.clockTime || formatDuration(Math.floor((ev.timestamp || 0) / 1000))}
                    </span>
                    <span className="mono text-cyan">EAR {Number(ev.ear).toFixed(3)}</span>
                    <span className="mono text-dim">
                      {ev.durationMs ? `${ev.durationMs} ms` : 'Valid'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ========================================================
          DEDICATED CLEAN A4 PRINT / PDF LAYOUT
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
