/**
 * Standar Frekuensi Kedipan Mata & Evaluasi Hasil Pemeriksaan
 * Referensi Standar Umum: 15–20 kedipan per menit
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
 * Evaluasi jumlah kedipan dalam 1 menit terhadap standar umum (15–20 kedipan/menit).
 */
export function evaluateMinuteBlinkRate(blinksInMinute, avgEar = 0.28, minEar = 0.28, avgDurationMs = 0) {
  const count = Number(blinksInMinute) || 0;
  const minStandardPct = Math.min(200, Math.round((count / BLINK_STANDARD.MIN_NORMAL) * 100));
  const idealRatio = Number((count / BLINK_STANDARD.MIN_NORMAL).toFixed(2));

  if (count < BLINK_STANDARD.CRITICAL_LOW) {
    return {
      status: 'KRITIS',
      label: 'Sangat Kurang (< 10/mnt)',
      severity: 'critical',
      alertTriggered: true,
      minStandardPct,
      idealRatio,
      avgEar,
      minEar,
      avgDurationMs,
      aiNote: `Hanya ${count} kedipan pada menit ini (standar 15–20/menit). Segera istirahatkan mata.`,
    };
  }

  if (count < BLINK_STANDARD.MIN_NORMAL) {
    return {
      status: 'PERINGATAN',
      label: 'Kurang (< 15/mnt)',
      severity: 'warning',
      alertTriggered: true,
      minStandardPct,
      idealRatio,
      avgEar,
      minEar,
      avgDurationMs,
      aiNote: `${count} kedipan/menit masih di bawah batas normal minimal (${BLINK_STANDARD.MIN_NORMAL}/menit).`,
    };
  }

  if (count <= BLINK_STANDARD.MAX_NORMAL) {
    return {
      status: 'NORMAL',
      label: 'Normal (15–20/mnt)',
      severity: 'normal',
      alertTriggered: false,
      minStandardPct,
      idealRatio,
      avgEar,
      minEar,
      avgDurationMs,
      aiNote: `${count} kedipan/menit sesuai rentang normal (15–20/menit).`,
    };
  }

  if (count <= BLINK_STANDARD.ELEVATED_WARN) {
    return {
      status: 'WASPADA',
      label: 'Agak Tinggi (21–25/mnt)',
      severity: 'elevated',
      alertTriggered: false,
      minStandardPct,
      idealRatio,
      avgEar,
      minEar,
      avgDurationMs,
      aiNote: `${count} kedipan/menit sedikit di atas rentang normal (15–20/menit).`,
    };
  }

  return {
    status: 'TINGGI',
    label: 'Tinggi (> 25/mnt)',
    severity: 'high',
    alertTriggered: false,
    minStandardPct,
    idealRatio,
    avgEar,
    minEar,
    avgDurationMs,
    aiNote: `Frekuensi tinggi (${count} kedipan/menit). Mata kemungkinan sedang lelah atau silau.`,
  };
}

export function buildPatientMrn(username = '') {
  const base = (username || 'GUEST').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'GUEST';
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `JIC-${yymm}-${base}`;
}

/**
 * Susun laporan pemeriksaan untuk Surat Hasil Pemeriksaan Dokter.
 */
export function generateHospitalClinicalReport({
  username = '',
  stats = {},
  minuteLogs = [],
  blinkEvents = [],
  threshold = 0.22,
  baselineOpenEar = 0.28,
}) {
  const displayName = username?.trim() || 'Peserta';
  const activeSeconds = Math.max(0, stats.elapsedSeconds || 0);
  const totalBlinks = stats.totalBlinks || 0;
  const completedMinutes = minuteLogs.length;

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

  let diagnosisTitle = 'Menunggu Data Pengukuran';
  let diagnosisBadge = 'MENUNGGU DATA';
  let severity = 'neutral';
  let summaryText = 'Lakukan pengukuran pada Detection Studio lalu tekan Pause untuk melihat hasil pemeriksaan lengkap.';
  let recommendations = [
    'Lakukan pemantauan minimal 1 menit penuh agar hasil per menit tercatat.',
    'Gunakan Kalibrasi (3s) sebelum mulai agar sensitivitas sesuai kondisi mata.',
  ];

  if (activeSeconds >= 3 || totalBlinks > 0) {
    if (validatedAvgBpm < BLINK_STANDARD.CRITICAL_LOW) {
      diagnosisTitle = 'Frekuensi Kedipan Sangat Rendah';
      diagnosisBadge = 'KURANG KEDIPAN BERAT';
      severity = 'critical';
      summaryText = `Rata-rata kedipan ${displayName} tercatat ${validatedAvgBpm} kedipan/menit, jauh di bawah standar normal (15–20 kedipan/menit). Kondisi ini mudah membuat mata kering dan cepat lelah.`;
      recommendations = [
        'Istirahatkan mata dengan aturan 20-20-20: setiap 20 menit melihat layar, lihat objek berjarak 6 meter selama 20 detik.',
        'Biasakan berkedip penuh secara sadar agar permukaan mata tetap lembap.',
        'Atur pencahayaan ruangan serta posisi layar sedikit di bawah garis pandang mata.',
      ];
    } else if (validatedAvgBpm < BLINK_STANDARD.MIN_NORMAL) {
      diagnosisTitle = 'Frekuensi Kedipan Di Bawah Standar Normal';
      diagnosisBadge = 'DI BAWAH STANDAR';
      severity = 'warning';
      summaryText = `Rata-rata kedipan ${displayName} sebesar ${validatedAvgBpm} kedipan/menit masih kurang dari batas minimal standar (15 kedipan/menit), dengan ${alertMinutesCount} kali peringatan pada evaluasi 1 menit.`;
      recommendations = [
        'Tingkatkan frekuensi berkedip saat fokus membaca atau menatap monitor.',
        'Ambil jeda 20–30 detik setiap kali muncul peringatan 1 menit.',
        'Hindari hembusan AC langsung ke wajah agar mata tidak cepat kering.',
      ];
    } else if (validatedAvgBpm <= BLINK_STANDARD.MAX_NORMAL) {
      diagnosisTitle = 'Frekuensi Kedipan Normal';
      diagnosisBadge = 'NORMAL';
      severity = 'normal';
      summaryText = `Rata-rata kedipan ${displayName} tercatat ${validatedAvgBpm} kedipan/menit, berada tepat dalam standar normal (15–20 kedipan/menit) dengan nilai EAR rata-rata ${avgEar}.`;
      recommendations = [
        'Pertahankan ritme kedipan alami dan pencahayaan layar yang nyaman.',
        'Tetap beri waktu istirahat berkala saat bekerja di depan layar dalam waktu lama.',
      ];
    } else if (validatedAvgBpm <= BLINK_STANDARD.ELEVATED_WARN) {
      diagnosisTitle = 'Frekuensi Kedipan Sedikit Tinggi';
      diagnosisBadge = 'AGAK TINGGI';
      severity = 'elevated';
      summaryText = `Rata-rata kedipan ${displayName} berada pada ${validatedAvgBpm} kedipan/menit, sedikit di atas standar istirahat normal (15–20 kedipan/menit).`;
      recommendations = [
        'Periksa apakah layar terlalu terang atau terdapat pantulan cahaya yang menyilaukan.',
        'Istirahatkan mata sejenak apabila kelopak mata mulai terasa berat.',
      ];
    } else {
      diagnosisTitle = 'Frekuensi Kedipan Tinggi';
      diagnosisBadge = 'FREKUENSI TINGGI';
      severity = 'high';
      summaryText = `Tercatat ${validatedAvgBpm} kedipan/menit pada sesi ${displayName} (melebihi 25 kedipan/menit). Peningkatan kedipan umumnya terjadi saat mata lelah, silau, atau mengalami iritasi ringan.`;
      recommendations = [
        'Pejamkan mata secara rileks selama 30 detik dan kurangi kecerahan layar.',
        'Jika mata sering terasa perih atau berair, periksakan langsung ke dokter mata.',
      ];
    }
  }

  const diagnosticTable = [
    {
      parameter: 'Laju Kedipan Rata-rata',
      measured: `${validatedAvgBpm} kedipan/mnt`,
      reference: `${BLINK_STANDARD.MIN_NORMAL}–${BLINK_STANDARD.MAX_NORMAL} kedipan/mnt`,
      status:
        activeSeconds < 3 && totalBlinks === 0
          ? 'Menunggu'
          : validatedAvgBpm < BLINK_STANDARD.MIN_NORMAL
            ? 'Di Bawah Standar'
            : validatedAvgBpm <= BLINK_STANDARD.MAX_NORMAL
              ? 'Normal'
              : 'Di Atas Standar',
      tone:
        activeSeconds < 3 && totalBlinks === 0
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
      parameter: 'Kepatuhan Siklus 1 Menit',
      measured:
        completedMinutes > 0
          ? `${normalMinutesCount} / ${completedMinutes} menit (${complianceRate}%)`
          : 'Belum genap 1 menit',
      reference: 'Semua siklus ≥ 15 kedipan/mnt',
      status:
        completedMinutes === 0
          ? 'Berjalan'
          : alertMinutesCount === 0
            ? 'Memenuhi Standar'
            : `${alertMinutesCount} Menit Kurang`,
      tone:
        completedMinutes === 0
          ? 'neutral'
          : alertMinutesCount === 0
            ? 'normal'
            : 'warning',
    },
    {
      parameter: 'Rata-rata Eye Aspect Ratio (EAR)',
      measured: avgEar.toFixed(3),
      reference: `> ${threshold.toFixed(3)}`,
      status: avgEar >= threshold ? 'Stabil' : 'Rendah',
      tone: avgEar >= threshold ? 'normal' : 'warning',
    },
    {
      parameter: 'Durasi Kedipan Rata-rata',
      measured: avgBlinkDurationMs > 0 ? `${avgBlinkDurationMs} ms` : '—',
      reference: `${BLINK_STANDARD.NORMAL_BLINK_DURATION_MIN_MS}–${BLINK_STANDARD.NORMAL_BLINK_DURATION_MAX_MS} ms`,
      status:
        avgBlinkDurationMs === 0
          ? 'Belum Ada'
          : avgBlinkDurationMs <= BLINK_STANDARD.NORMAL_BLINK_DURATION_MAX_MS
            ? 'Normal'
            : 'Lambat',
      tone:
        avgBlinkDurationMs === 0
          ? 'neutral'
          : avgBlinkDurationMs <= BLINK_STANDARD.NORMAL_BLINK_DURATION_MAX_MS
            ? 'normal'
            : 'warning',
    },
  ];

  return {
    mrnId: buildPatientMrn(displayName),
    displayName,
    evaluatedAt: new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    validatedAvgBpm,
    avgEar,
    avgBlinkDurationMs,
    completedMinutes,
    alertMinutesCount,
    complianceRate,
    diagnosisTitle,
    diagnosisBadge,
    severity,
    summaryText,
    recommendations,
    diagnosticTable,
  };
}
