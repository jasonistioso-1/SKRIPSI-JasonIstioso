import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  HeartPulse,
  Printer,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserCheck,
  Edit3,
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
  const cardDisplayName = report.displayName;
  const activeSeconds = stats.elapsedSeconds || 0;
  const totalBlinks = stats.totalBlinks || 0;

  const severityMeta = {
    normal: {
      accent: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      icon: CheckCircle2,
    },
    warning: {
      accent: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      icon: AlertTriangle,
    },
    critical: {
      accent: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.14)',
      border: 'rgba(244, 63, 94, 0.4)',
      icon: ShieldAlert,
    },
    elevated: {
      accent: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.35)',
      icon: Activity,
    },
    high: {
      accent: '#fb923c',
      bg: 'rgba(251, 146, 60, 0.12)',
      border: 'rgba(251, 146, 60, 0.35)',
      icon: AlertTriangle,
    },
    neutral: {
      accent: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.1)',
      border: 'rgba(148, 163, 184, 0.25)',
      icon: Clock,
    },
  };

  const activeMeta = severityMeta[report.severity] || severityMeta.neutral;
  const SeverityIcon = activeMeta.icon;

  const maxChartVal = Math.max(
    28,
    ...minuteLogs.map((m) => m.blinksInMinute),
    currentCycleBlinks
  );

  const recentEvents = [...blinkEvents].slice(-12).reverse();

  return (
    <div className="results-page-shell">
      <div className="results-page-inner">
        {/* Hospital AI Top Record Header */}
        <section className="hosp-record-header">
          <div className="hosp-record-left">
            <div className="hosp-badge-row">
              <span className="hosp-dept-pill">
                <Stethoscope size={13} />
                <span>OCULARVISION AI • OPHTHALMOLOGY TELEMETRY</span>
              </span>
              <span className="hosp-mrn-pill">{report.mrnId}</span>
            </div>
            <h1 className="hosp-main-title">
              Laporan Hasil Analisis Kedipan Mata
            </h1>
            <p className="hosp-subtitle">
              Evaluasi rasio kedipan per menit berbasis standar klinis umum (
              <strong>{BLINK_STANDARD.MIN_NORMAL}–{BLINK_STANDARD.MAX_NORMAL} kedipan/menit</strong>)
              • Diperiksa: {report.evaluatedAt}
            </p>
          </div>

          <div className="hosp-header-actions">
            <button
              type="button"
              onClick={onBackToStudio}
              className="hosp-btn-secondary"
            >
              <ArrowLeft size={15} />
              <span>Kembali ke Studio</span>
            </button>
            <button
              type="button"
              onClick={onEditUsername}
              className="hosp-btn-secondary"
              title="Ubah nama pasien / operator di Name Card"
            >
              <Edit3 size={14} />
              <span>{hasCustomName ? 'Ubah Nama' : 'Isi Username'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="hosp-btn-secondary"
            >
              <Printer size={14} />
              <span>Cetak / PDF</span>
            </button>
            <button
              type="button"
              onClick={onExportCSV}
              className="hosp-btn-primary"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </section>

        {/* Row 1: Personalized Holographic Name Card + Hospital AI Assessment */}
        <section className="hosp-hero-grid">
          {/* Left: Same Holographic Namecard from Home Page, personalized to Username */}
          <div className="hosp-card-panel hosp-namecard-panel">
            <div className="hosp-panel-label-row">
              <span className="hosp-panel-tag">
                <UserCheck size={13} />
                <span>IDENTITAS PASIEN / OPERATOR</span>
              </span>
              <button
                type="button"
                onClick={onEditUsername}
                className="hosp-inline-edit-btn"
              >
                <Edit3 size={12} />
                <span>{hasCustomName ? cardDisplayName : 'Set Nama'}</span>
              </button>
            </div>

            <div className="hosp-namecard-stage">
              <BusinessCard
                effect="shards"
                intensity={0.38}
                greeting={`Patient • ${cardDisplayName}`}
                title={cardDisplayName}
                subtitle={
                  report.severity === 'normal'
                    ? 'normal ocular rhythm'
                    : report.severity === 'neutral'
                      ? 'ocular assessment'
                      : 'eye strain monitor'
                }
                location="OCULAR AI CLINIC"
                websiteUrl={null}
                websiteLabel={`${report.validatedAvgBpm} BPM • ${totalBlinks} Blinks`}
                name={cardDisplayName}
                nameJp={`PATIENT ID: ${report.mrnId}`}
                tagline={`Standar Klinis: ${BLINK_STANDARD.MIN_NORMAL}–${BLINK_STANDARD.MAX_NORMAL} kedipan/menit`}
                taglineJp={`Avg: ${report.validatedAvgBpm} BPM • EAR ${report.avgEar.toFixed(3)} • Skor ${report.healthScore}/100`}
                email="OcularVision AI Medical Telemetry"
                qrCaption="OcularVision Record"
                qrCaptionJp="カルテ記録 • Tap untuk balik"
              />
            </div>

            <p className="hosp-namecard-hint">
              Arahkan kursor atau klik kartu nama di atas untuk efek holografik 3D & detail rekam medis pasien.
            </p>
          </div>

          {/* Right: Hospital AI Diagnostic Assessment */}
          <div className="hosp-card-panel hosp-ai-diagnosis-panel">
            <div className="hosp-ai-top">
              <div className="hosp-ai-title-wrap">
                <span className="hosp-panel-tag">
                  <Sparkles size={13} />
                  <span>AI CLINICAL DIAGNOSIS ENGINE</span>
                </span>
                <div
                  className="hosp-verdict-pill"
                  style={{
                    color: activeMeta.accent,
                    background: activeMeta.bg,
                    borderColor: activeMeta.border,
                  }}
                >
                  <SeverityIcon size={14} />
                  <span>{report.diagnosisBadge}</span>
                </div>
              </div>

              <div className="hosp-score-box" style={{ borderColor: activeMeta.border }}>
                <span className="hosp-score-label">SKOR KESEHATAN MATA</span>
                <div className="hosp-score-value-row">
                  <span className="hosp-score-num" style={{ color: activeMeta.accent }}>
                    {report.healthScore}
                  </span>
                  <span className="hosp-score-max">/100</span>
                </div>
              </div>
            </div>

            <h2 className="hosp-diagnosis-heading">{report.diagnosisTitle}</h2>
            <p className="hosp-diagnosis-summary">{report.summaryText}</p>

            {/* 4 Key Vital Metrics */}
            <div className="hosp-vitals-grid">
              <div className="hosp-vital-tile">
                <span className="hosp-vital-label">Rasio Kedipan / Menit</span>
                <strong className="hosp-vital-val" style={{ color: activeMeta.accent }}>
                  {report.validatedAvgBpm} <small>BPM</small>
                </strong>
                <span className="hosp-vital-sub">
                  Standar: {BLINK_STANDARD.MIN_NORMAL}–{BLINK_STANDARD.MAX_NORMAL}/mnt
                </span>
              </div>

              <div className="hosp-vital-tile">
                <span className="hosp-vital-label">Total Kedipan & Durasi</span>
                <strong className="hosp-vital-val">
                  {totalBlinks} <small>kedipan</small>
                </strong>
                <span className="hosp-vital-sub">
                  Durasi aktif {formatDuration(activeSeconds)} ({report.completedMinutes} mnt selesai)
                </span>
              </div>

              <div className="hosp-vital-tile">
                <span className="hosp-vital-label">Rata-rata Rasio EAR</span>
                <strong className="hosp-vital-val text-cyan">
                  {report.avgEar.toFixed(3)}
                </strong>
                <span className="hosp-vital-sub">
                  Threshold: {threshold.toFixed(3)}
                </span>
              </div>

              <div className="hosp-vital-tile">
                <span className="hosp-vital-label">Alert Evaluasi 1 Menit</span>
                <strong
                  className="hosp-vital-val"
                  style={{ color: report.alertMinutesCount > 0 ? '#f43f5e' : '#10b981' }}
                >
                  {report.alertMinutesCount} <small>alert</small>
                </strong>
                <span className="hosp-vital-sub">
                  {report.alertMinutesCount > 0
                    ? 'Ada menit di bawah 15 kedipan'
                    : 'Tidak ada pelanggaran standar'}
                </span>
              </div>
            </div>

            {/* Hospital AI Recommendations */}
            <div className="hosp-rx-box">
              <div className="hosp-rx-header">
                <HeartPulse size={15} className="text-cyan" />
                <span>Rekomendasi Klinis AI Rumah Sakit</span>
              </div>
              <ul className="hosp-rx-list">
                {report.recommendations.map((rec, idx) => (
                  <li key={idx}>
                    <span className="hosp-rx-num">{idx + 1}</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Row 2: Visual Minute-by-Minute Blink Rate Chart vs Clinical Standard */}
        <section className="hosp-card-panel hosp-chart-section">
          <div className="hosp-section-head">
            <div>
              <span className="hosp-panel-tag">
                <Activity size={13} />
                <span>GRAFIK RASIO KEDIPAN PER 1 MENIT</span>
              </span>
              <h3 className="hosp-section-title">
                Perbandingan Siklus 1 Menit Terhadap Zona Standar Normal (15–20 Kedipan/Menit)
              </h3>
            </div>
            <div className="hosp-legend-row">
              <span className="hosp-legend-item">
                <i className="dot normal" /> Normal (15–20)
              </span>
              <span className="hosp-legend-item">
                <i className="dot warning" /> Kurang / Alert (&lt; 15)
              </span>
              <span className="hosp-legend-item">
                <i className="dot elevated" /> Tinggi (&gt; 20)
              </span>
            </div>
          </div>

          {minuteLogs.length === 0 ? (
            <div className="hosp-empty-state">
              <Clock size={22} />
              <div>
                <strong>Menunggu Siklus 1 Menit Pertama Selesai</strong>
                <p>
                  Progres menit berjalan saat ini: <strong>{currentCycleSeconds}s / 60s</strong>{' '}
                  dengan <strong>{currentCycleBlinks} kedipan</strong> (estimasi saat ini:{' '}
                  {report.validatedAvgBpm} kedipan/menit). Selesaikan minimal 1 menit di Detection
                  Studio untuk menampilkan grafik & tabel evaluasi per menit.
                </p>
              </div>
            </div>
          ) : (
            <div className="hosp-bar-chart-wrap">
              {/* Shaded Normal Zone Band (15 to 20 bpm) */}
              <div
                className="hosp-standard-zone-band"
                style={{
                  bottom: `${(BLINK_STANDARD.MIN_NORMAL / maxChartVal) * 100}%`,
                  height: `${((BLINK_STANDARD.MAX_NORMAL - BLINK_STANDARD.MIN_NORMAL) / maxChartVal) * 100}%`,
                }}
              >
                <span>Zona Standar (15–20/mnt)</span>
              </div>

              <div className="hosp-bar-columns">
                {minuteLogs.map((m) => {
                  const pct = Math.max(6, Math.min(100, (m.blinksInMinute / maxChartVal) * 100));
                  return (
                    <div key={m.minuteNumber} className="hosp-bar-col">
                      <span className="hosp-bar-value">{m.blinksInMinute}</span>
                      <div className="hosp-bar-track">
                        <div
                          className={`hosp-bar-fill ${m.severity}`}
                          style={{ height: `${pct}%` }}
                          title={`Menit ke-${m.minuteNumber}: ${m.blinksInMinute} kedipan/menit (${m.label})`}
                        />
                      </div>
                      <span className="hosp-bar-label">M{m.minuteNumber}</span>
                    </div>
                  );
                })}

                {currentCycleSeconds > 0 && (
                  <div className="hosp-bar-col in-progress">
                    <span className="hosp-bar-value">{currentCycleBlinks}*</span>
                    <div className="hosp-bar-track">
                      <div
                        className="hosp-bar-fill progress"
                        style={{
                          height: `${Math.max(6, Math.min(100, (currentCycleBlinks / maxChartVal) * 100))}%`,
                        }}
                        title={`Menit berjalan (${currentCycleSeconds}s/60s): ${currentCycleBlinks} kedipan`}
                      />
                    </div>
                    <span className="hosp-bar-label">M{minuteLogs.length + 1}*</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Row 3: Tabel Analisis Per 1 Menit */}
        <section className="hosp-card-panel">
          <div className="hosp-section-head">
            <div>
              <span className="hosp-panel-tag">
                <FileText size={13} />
                <span>TABEL EVALUASI KEDIPAN TIAP 1 MENIT</span>
              </span>
              <h3 className="hosp-section-title">
                Rekapitulasi Rasio Kedipan & Peringatan Standar Per Menit
              </h3>
            </div>
            <span className="hosp-table-count-pill">
              {minuteLogs.length} Siklus Selesai
            </span>
          </div>

          <div className="hosp-table-scroll">
            <table className="hosp-table">
              <thead>
                <tr>
                  <th>Siklus Menit</th>
                  <th>Rentang Waktu</th>
                  <th>Jumlah Kedipan</th>
                  <th>Rasio / Menit</th>
                  <th>Rasio vs Standar (15/mnt)</th>
                  <th>Avg EAR</th>
                  <th>Status & Alert</th>
                  <th>Analisis Klinis AI</th>
                </tr>
              </thead>
              <tbody>
                {minuteLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="hosp-table-empty">
                      Belum ada siklus 1 menit yang selesai. Saat ini berjalan{' '}
                      <strong>{currentCycleSeconds} detik</strong> ({currentCycleBlinks} kedipan).
                    </td>
                  </tr>
                ) : (
                  minuteLogs.map((m) => (
                    <tr key={m.minuteNumber} className={m.alertTriggered ? 'row-alert' : ''}>
                      <td className="mono font-bold">Menit ke-{m.minuteNumber}</td>
                      <td className="mono text-dim">{m.windowRange}</td>
                      <td className="mono font-bold">{m.blinksInMinute} kedipan</td>
                      <td className="mono">{m.blinksInMinute}.0 BPM</td>
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
                          {m.alertTriggered ? `⚠ ${m.status}` : `✓ ${m.status}`}
                        </span>
                      </td>
                      <td className="hosp-note-cell">{m.aiNote}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Row 4: Hospital Diagnostic Parameters Table & Recent Blink Events */}
        <section className="hosp-bottom-grid">
          <div className="hosp-card-panel">
            <div className="hosp-section-head">
              <div>
                <span className="hosp-panel-tag">
                  <Eye size={13} />
                  <span>PARAMETER DIAGNOSTIK OFTALMOLOGI</span>
                </span>
                <h3 className="hosp-section-title">Tabel Pemeriksaan Klinis Terpadu</h3>
              </div>
            </div>

            <div className="hosp-table-scroll">
              <table className="hosp-table">
                <thead>
                  <tr>
                    <th>Parameter Uji</th>
                    <th>Hasil Terukur</th>
                    <th>Nilai Rujukan</th>
                    <th>Interpretasi</th>
                  </tr>
                </thead>
                <tbody>
                  {report.diagnosticTable.map((row, idx) => (
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

          <div className="hosp-card-panel">
            <div className="hosp-section-head">
              <div>
                <span className="hosp-panel-tag">
                  <Clock size={13} />
                  <span>LOG KEJADIAN KEDIPAN TERBARU</span>
                </span>
                <h3 className="hosp-section-title">Telemetri Per Kedipan ({blinkEvents.length} Total)</h3>
              </div>
            </div>

            <div className="hosp-table-scroll">
              <table className="hosp-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Waktu</th>
                    <th>EAR</th>
                    <th>Durasi</th>
                    <th>Kondisi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="hosp-table-empty">
                        Belum ada kedipan yang tercatat pada sesi ini.
                      </td>
                    </tr>
                  ) : (
                    recentEvents.map((ev, idx) => (
                      <tr key={ev.id || idx}>
                        <td className="mono text-dim">#{ev.id || blinkEvents.length - idx}</td>
                        <td className="mono">{ev.clockTime || formatDuration(Math.floor((ev.timestamp || 0) / 1000))}</td>
                        <td className="mono">{Number(ev.ear).toFixed(3)}</td>
                        <td className="mono">{ev.durationMs ? `${ev.durationMs} ms` : '—'}</td>
                        <td>
                          <span className="hosp-status-chip normal">Valid Blink</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Bottom Reset / Back Action Footer */}
        <div className="hosp-footer-bar">
          <span className="hosp-footer-note">
            Catatan: Hasil analisis ini dihasilkan oleh sistem visi komputer MediaPipe Face Mesh & EAR untuk pemantauan kelelahan mata dan riset skripsi.
          </span>
          <div className="hosp-footer-btns">
            <button type="button" onClick={onReset} className="hosp-btn-danger">
              <RotateCcw size={14} />
              <span>Reset Semua Data Sesi</span>
            </button>
            <button type="button" onClick={onBackToStudio} className="hosp-btn-primary">
              <ArrowLeft size={14} />
              <span>Lanjutkan Pemantauan di Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
