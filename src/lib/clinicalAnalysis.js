/**
 * Clinical Ocular Blink Rate Standards & Hospital AI Diagnostic Engine
 * Standard Reference:
 * - Normal Spontaneous Blink Rate (Rest / Standard Clinical): 15–20 blinks/minute
 * - Hypo-blinking / Digital Eye Strain / Dry Eye Risk: < 15 blinks/minute (< 10 critical)
 * - Elevated / Fatigue or Irritation Response: > 20 blinks/minute (> 25 high)
 */

export const BLINK_STANDARD = {
  MIN_NORMAL: 15,
  MAX_NORMAL: 20,
  CRITICAL_LOW: 10,
  ELEVATED_WARN: 25,
  TARGET_IDEAL: 17.5,
  INTERVAL_SECONDS: 60,
  NORMAL_BLINK_DURATION_MIN_MS: 100,
  NORMAL_BLINK_DURATION_MAX_MS: 400,
};

/**
 * Evaluate a single 1-minute blink count against standard clinical thresholds.
 */
export function evaluateMinuteBlinkRate(blinksInMinute, avgEar = 0.28, minEar = 0.28, avgDurationMs = 0) {
  const count = Number(blinksInMinute) || 0;
  // Ratio compared to minimum clinical standard (15 bpm) and target midpoint (17.5 bpm)
  const minStandardPct = Math.min(200, Math.round((count / BLINK_STANDARD.MIN_NORMAL) * 100));
  const idealRatio = Number((count / BLINK_STANDARD.MIN_NORMAL).toFixed(2));

  if (count < BLINK_STANDARD.CRITICAL_LOW) {
    return {
      status: 'KRITIS',
      label: 'Defisit Berat (< 10/mnt)',
      severity: 'critical',
      alertTriggered: true,
      minStandardPct,
      idealRatio,
      avgEar,
      minEar,
      avgDurationMs,
      aiNote: `Terdeteksi hanya ${count} kedipan pada menit ini (jauh di bawah standar 15–20/menit). Risiko tinggi mata kering (Dry Eye) & ketegangan visual.`,
    };
  }

  if (count < BLINK_STANDARD.MIN_NORMAL) {
    return {
      status: 'PERINGATAN',
      label: 'Di Bawah Standar (< 15/mnt)',
      severity: 'warning',
      alertTriggered: true,
      minStandardPct,
      idealRatio,
      avgEar,
      minEar,
      avgDurationMs,
      aiNote: `Frekuensi ${count} kedipan/menit masih kurang dari batas minimal standar (${BLINK_STANDARD.MIN_NORMAL} kedipan/menit). Disarankan berkedip lebih sadar.`,
    };
  }

  if (count <= BLINK_STANDARD.MAX_NORMAL) {
    return {
      status: 'NORMAL',
      label: 'Optimal (Standar 15–20/mnt)',
      severity: 'normal',
      alertTriggered: false,
      minStandardPct,
      idealRatio,
      avgEar,
      minEar,
      avgDurationMs,
      aiNote: `Frekuensi kedipan ${count}/menit berada pada rentang fisiologis ideal (15–20 kedipan/menit). Pelumasan lapisan air mata terjaga baik.`,
    };
  }

  if (count <= BLINK_STANDARD.ELEVATED_WARN) {
    return {
      status: 'WASPADA',
      label: 'Sedikit Tinggi (21–25/mnt)',
      severity: 'elevated',
      alertTriggered: false,
      minStandardPct,
      idealRatio,
      avgEar,
      minEar,
      avgDurationMs,
      aiNote: `Frekuensi ${count} kedipan/menit sedikit di atas rentang istirahat normal. Dapat menandakan kelelahan mata ringan atau adaptasi pencahayaan.`,
    };
  }

  return {
    status: 'TINGGI',
    label: 'Hiperaktif (> 25/mnt)',
    severity: 'high',
    alertTriggered: false,
    minStandardPct,
    idealRatio,
    avgEar,
    minEar,
    avgDurationMs,
    aiNote: `Frekuensi kedipan tinggi (${count}/menit). Kemungkinan respons kompensasi terhadap iritasi permukaan okular, silau layar, atau kelelahan.`,
  };
}

/**
 * Generate a deterministic Medical Record Number (MRN) for display.
 */
export function buildPatientMrn(username = '') {
  const base = (username || 'GUEST').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'GUEST';
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `MRN-OCV-${yymm}-${base}`;
}

/**
 * Build full Hospital AI Clinical Assessment report for the Results Page.
 */
export function generateHospitalClinicalReport({
  username = '',
  stats = {},
  minuteLogs = [],
  blinkEvents = [],
  threshold = 0.22,
  baselineOpenEar = 0.28,
}) {
  const displayName = username?.trim() || 'Pasien / Operator';
  const activeSeconds = Math.max(0, stats.elapsedSeconds || 0);
  const totalBlinks = stats.totalBlinks || 0;
  const completedMinutes = minuteLogs.length;

  // Prefer validated average of completed 1-minute intervals when available, else live extrapolated BPM
  const validatedAvgBpm = completedMinutes > 0
    ? Number((minuteLogs.reduce((sum, m) => sum + m.blinksInMinute, 0) / completedMinutes).toFixed(1))
    : (activeSeconds > 0 ? Number(((totalBlinks / activeSeconds) * 60).toFixed(1)) : 0);

  const avgEar = Number((stats.avgEar || baselineOpenEar || 0.28).toFixed(3));
  const avgBlinkDurationMs = blinkEvents.length > 0
    ? Math.round(
        blinkEvents.reduce((sum, ev) => sum + (ev.durationMs || 180), 0) / blinkEvents.length
      )
    : 0;

  const alertMinutesCount = minuteLogs.filter((m) => m.alertTriggered).length;
  const normalMinutesCount = minuteLogs.filter((m) => m.severity === 'normal').length;
  const complianceRate = completedMinutes > 0
    ? Math.round((normalMinutesCount / completedMinutes) * 100)
    : (validatedAvgBpm >= BLINK_STANDARD.MIN_NORMAL && validatedAvgBpm <= BLINK_STANDARD.MAX_NORMAL ? 100 : 0);

  // Clinical Health Score (0-100)
  let healthScore = 88;
  if (activeSeconds < 5 && totalBlinks === 0) {
    healthScore = 0;
  } else {
    const distFromIdeal =
      validatedAvgBpm < BLINK_STANDARD.MIN_NORMAL
        ? (BLINK_STANDARD.MIN_NORMAL - validatedAvgBpm) * 4.2
        : validatedAvgBpm > BLINK_STANDARD.MAX_NORMAL
          ? (validatedAvgBpm - BLINK_STANDARD.MAX_NORMAL) * 2.5
          : Math.abs(validatedAvgBpm - BLINK_STANDARD.TARGET_IDEAL) * 1.2;
    const alertPenalty = alertMinutesCount * 6;
    healthScore = Math.max(18, Math.min(99, Math.round(98 - distFromIdeal - alertPenalty)));
  }

  // Primary clinical classification
  let diagnosisTitle = 'Belum Ada Data Sesi';
  let diagnosisBadge = 'MENUNGGU DATA';
  let severity = 'neutral';
  let cvsRisk = 'Belum Dinilai';
  let summaryText = 'Mulai sesi kamera atau video di Detection Studio selama minimal 1 menit untuk mendapatkan evaluasi klinis tervalidasi.';
  let recommendations = [
    'Lakukan pemantauan aktif minimal 1 menit (60 detik) pada Detection Studio agar sistem dapat mengevaluasi rasio kedipan per menit.',
    'Gunakan fitur Kalibrasi (3s) sebelum memulai pengukuran untuk menyesuaikan ambang batas EAR dengan anatomi mata Anda.',
  ];

  if (activeSeconds >= 5 || totalBlinks > 0) {
    if (validatedAvgBpm < BLINK_STANDARD.CRITICAL_LOW) {
      diagnosisTitle = 'Hypo-Blinking Berat (Risiko Tinggi Dry Eye / CVS)';
      diagnosisBadge = 'PERLU TINDAKAN SEGERA';
      severity = 'critical';
      cvsRisk = 'Tinggi (High Risk)';
      summaryText = `Evaluasi AI untuk ${displayName} menunjukkan rata-rata kedipan ${validatedAvgBpm} kedipan/menit, jauh di bawah standar fisiologis normal (15–20 kedipan/menit). Kondisi ini sangat berkaitan dengan penguapan film air mata berlebih saat menatap layar.`;
      recommendations = [
        'Terapkan aturan 20-20-20 segera: setiap 20 menit melihat layar, alihkan pandangan ke objek berjarak 20 kaki (±6 meter) selama 20 detik.',
        'Lakukan latihan kedipan sadar penuh (complete blink) 10 kali setiap 15 menit untuk mengembalikan distribusi lapisan lipid air mata.',
        'Pertimbangkan penggunaan tetes air mata artifisial (preservative-free) dan turunkan posisi layar 10–15° di bawah garis pandang mata.',
      ];
    } else if (validatedAvgBpm < BLINK_STANDARD.MIN_NORMAL) {
      diagnosisTitle = 'Frekuensi Kedipan Di Bawah Standar (Mild Hypo-Blinking)';
      diagnosisBadge = 'PERHATIAN • ALERT AKTIF';
      severity = 'warning';
      cvsRisk = 'Sedang (Moderate Risk)';
      summaryText = `Rata-rata kedipan ${displayName} tercatat ${validatedAvgBpm} kedipan/menit (di bawah batas minimal standar umum 15 kedipan/menit). Terjadi ${alertMinutesCount} kali peringatan pada evaluasi siklus 1 menit.`;
      recommendations = [
        'Tingkatkan kesadaran berkedip saat membaca atau fokus pada layar digital agar mencapai target 15–20 kedipan/menit.',
        'Sesuaikan tingkat kecerahan monitor dengan cahaya ruangan dan hindari aliran angin AC langsung ke arah wajah.',
        'Ambil jeda mikro (micro-break) selama 20–30 detik setiap selesai satu siklus pemantauan 1 menit yang memicu peringatan.',
      ];
    } else if (validatedAvgBpm <= BLINK_STANDARD.MAX_NORMAL) {
      diagnosisTitle = 'Fungsi Kedipan Okular Normal & Stabil';
      diagnosisBadge = 'NORMAL • SESUAI STANDAR';
      severity = 'normal';
      cvsRisk = 'Rendah (Low Risk)';
      summaryText = `Hasil pemantauan ${displayName} menunjukkan laju kedipan ${validatedAvgBpm} kedipan/menit yang berada tepat dalam rentang standar klinis umum (15–20 kedipan/menit). Rasio keterbukaan mata (EAR rata-rata ${avgEar}) terpantau stabil.`;
      recommendations = [
        'Pertahankan ritme kedipan alami Anda serta pencahayaan kerja yang ergonomis untuk mencegah kelelahan mata digital.',
        'Tetap lakukan istirahat berkala setiap 20–30 menit penggunaan layar intensif agar kesehatan permukaan kornea tetap optimal.',
        'Simpan atau ekspor log CSV sebagai dokumentasi telemetri penelitian maupun catatan kesehatan mata berkala.',
      ];
    } else if (validatedAvgBpm <= BLINK_STANDARD.ELEVATED_WARN) {
      diagnosisTitle = 'Frekuensi Kedipan Sedikit Meningkat';
      diagnosisBadge = 'PANTAU KELELAHAN';
      severity = 'elevated';
      cvsRisk = 'Rendah–Sedang';
      summaryText = `Laju kedipan ${displayName} berada pada ${validatedAvgBpm} kedipan/menit, sedikit di atas rentang istirahat standar (15–20 kedipan/menit). Hal ini umum terjadi saat adaptasi silau layar atau kelelahan visual ringan.`;
      recommendations = [
        'Periksa apakah terdapat pantulan cahaya berlebih (glare) pada layar atau kacamata Anda.',
        'Kurangi ketegangan fokus dengan mengistirahatkan mata selama 1–2 menit bila kelopak mata terasa berat.',
      ];
    } else {
      diagnosisTitle = 'Hiper-Frekuensi Kedipan (Indikasi Iritasi / Kelelahan)';
      diagnosisBadge = 'EVALUASI KELELAHAN';
      severity = 'high';
      cvsRisk = 'Sedang (Ocular Fatigue)';
      summaryText = `Terdeteksi ${validatedAvgBpm} kedipan/menit pada sesi ${displayName}, melebihi 25 kedipan/menit. Peningkatan refleks berkedip sering menjadi mekanisme kompensasi mata terhadap kekeringan awal, silau, atau iritasi.`;
      recommendations = [
        'Hentikan paparan layar sejenak, pejamkan mata secara rileks selama 30 detik, dan periksa kenyamanan lensa/kacamata.',
        'Jika kedipan berlebih disertai rasa perih atau berair berkelanjutan, disarankan konsultasi ke dokter spesialis mata.',
      ];
    }
  }

  const diagnosticTable = [
    {
      parameter: 'Laju Kedipan Rata-rata (Blink Rate)',
      measured: `${validatedAvgBpm} kedipan/mnt`,
      reference: `${BLINK_STANDARD.MIN_NORMAL}–${BLINK_STANDARD.MAX_NORMAL} kedipan/mnt`,
      status:
        activeSeconds < 5 && totalBlinks === 0
          ? 'Menunggu'
          : validatedAvgBpm < BLINK_STANDARD.MIN_NORMAL
            ? 'Di Bawah Standar'
            : validatedAvgBpm <= BLINK_STANDARD.MAX_NORMAL
              ? 'Normal'
              : 'Di Atas Standar',
      tone:
        activeSeconds < 5 && totalBlinks === 0
          ? 'neutral'
          : validatedAvgBpm < BLINK_STANDARD.CRITICAL_LOW
            ? 'critical'
            : validatedAvgBpm < BLINK_STANDARD.MIN_NORMAL
              ? 'warning'
              : validatedAvgBpm <= BLINK_STANDARD.MAX_NORMAL
                ? 'normal'
                : 'elevated',
    },
    {
      parameter: 'Kepatuhan Siklus Evaluasi 1 Menit',
      measured:
        completedMinutes > 0
          ? `${normalMinutesCount} / ${completedMinutes} menit (${complianceRate}%)`
          : 'Belum genap 1 menit',
      reference: '≥ 80% siklus normal (≥ 15/mnt)',
      status:
        completedMinutes === 0
          ? 'Dalam Proses'
          : alertMinutesCount === 0
            ? 'Memenuhi Standar'
            : `${alertMinutesCount} Menit Alert`,
      tone:
        completedMinutes === 0
          ? 'neutral'
          : alertMinutesCount === 0
            ? 'normal'
            : 'warning',
    },
    {
      parameter: 'Eye Aspect Ratio (EAR) Rata-rata',
      measured: avgEar.toFixed(3),
      reference: `> ${threshold.toFixed(3)} (Baseline: ${Number(baselineOpenEar).toFixed(3)})`,
      status: avgEar >= threshold ? 'Keterbukaan Stabil' : 'Rendah / Sering Menutup',
      tone: avgEar >= threshold ? 'normal' : 'warning',
    },
    {
      parameter: 'Durasi Kedipan Rata-rata',
      measured: avgBlinkDurationMs > 0 ? `${avgBlinkDurationMs} ms` : '—',
      reference: `${BLINK_STANDARD.NORMAL_BLINK_DURATION_MIN_MS}–${BLINK_STANDARD.NORMAL_BLINK_DURATION_MAX_MS} ms`,
      status:
        avgBlinkDurationMs === 0
          ? 'Belum Ada Kedipan'
          : avgBlinkDurationMs <= BLINK_STANDARD.NORMAL_BLINK_DURATION_MAX_MS
            ? 'Fisiologis Normal'
            : 'Kedipan Lambat (Fatigue)',
      tone:
        avgBlinkDurationMs === 0
          ? 'neutral'
          : avgBlinkDurationMs <= BLINK_STANDARD.NORMAL_BLINK_DURATION_MAX_MS
            ? 'normal'
            : 'warning',
    },
    {
      parameter: 'Indeks Risiko Computer Vision Syndrome',
      measured: cvsRisk,
      reference: 'Risiko Rendah (Low Risk)',
      status: severity === 'normal' ? 'Aman' : severity === 'neutral' ? 'Menunggu' : 'Perlu Pengawasan',
      tone: severity,
    },
  ];

  return {
    mrnId: buildPatientMrn(displayName),
    displayName,
    evaluatedAt: new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    healthScore,
    validatedAvgBpm,
    avgEar,
    avgBlinkDurationMs,
    completedMinutes,
    alertMinutesCount,
    complianceRate,
    diagnosisTitle,
    diagnosisBadge,
    severity,
    cvsRisk,
    summaryText,
    recommendations,
    diagnosticTable,
  };
}

