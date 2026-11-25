import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Video, Upload, Play, Pause, RotateCcw, Eye, FlipHorizontal, AlertCircle, Scan, Maximize2, Minimize2, PictureInPicture2 } from 'lucide-react';
import {
  RIGHT_EYE_LANDMARKS,
  LEFT_EYE_LANDMARKS,
  RIGHT_EYE_EAR_INDICES,
  LEFT_EYE_EAR_INDICES,
  calculateEAR,
} from '../lib/earMath';
import { haarRoiTracker } from '../lib/haarCascadeRoi';

export default function VideoCanvasFeed({
  faceMesh,
  isReady,
  tracker,
  onFrameProcessed,
  onBlinkTrigger,
  threshold = 0.220,
  isCalibrating = false,
  calibrateCountdown = 0,
  initialVideo = '/videos/blinking_1.mp4',
  initialMode = 'sample',
  isSimpleView = false,
  // Coordinated Mobile & Studio Props
  propInputMode,
  onChangeInputMode,
  propSampleVideo,
  onChangeSampleVideo,
  propMirrorCamera,
  onToggleMirror,
  propShowLandmarks,
  onToggleLandmarks,
  propShowHaarRoi,
  onToggleHaarRoi,
  propIsPaused = false,
  onTogglePause,
  onRegisterTogglePip,
  onRegisterFileUpload,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const isProcessingRef = useRef(false);
  const latestDataRef = useRef(null);
  const currentEarRef = useRef(0.280);

  // Input Mode: 'webcam' | 'sample' | 'upload'
  const [localInputMode, setLocalInputMode] = useState(initialMode);
  const inputMode = propInputMode !== undefined ? propInputMode : localInputMode;
  const setInputMode = onChangeInputMode || setLocalInputMode;

  const [localSampleVideo, setLocalSampleVideo] = useState(initialVideo);
  const sampleVideo = propSampleVideo !== undefined ? propSampleVideo : localSampleVideo;
  const setSampleVideo = onChangeSampleVideo || setLocalSampleVideo;

  const [customVideoUrl, setCustomVideoUrl] = useState(null);

  useEffect(() => {
    if (initialVideo) {
      setSampleVideo(initialVideo);
      latestDataRef.current = null;
    }
    if (initialMode) setInputMode(initialMode);
  }, [initialVideo, initialMode]);

  // Display toggles
  const [isPlaying, setIsPlaying] = useState(false);

  const [localShowLandmarks, setLocalShowLandmarks] = useState(true);
  const showLandmarks = propShowLandmarks !== undefined ? propShowLandmarks : localShowLandmarks;
  const setShowLandmarks = onToggleLandmarks || setLocalShowLandmarks;

  const [localShowHaarRoi, setLocalShowHaarRoi] = useState(false);
  const showHaarRoi = propShowHaarRoi !== undefined ? propShowHaarRoi : localShowHaarRoi;
  const setShowHaarRoi = onToggleHaarRoi || setLocalShowHaarRoi;

  const [localMirrorCamera, setLocalMirrorCamera] = useState(true);
  const mirrorCamera = propMirrorCamera !== undefined ? propMirrorCamera : localMirrorCamera;
  const setMirrorCamera = onToggleMirror || setLocalMirrorCamera;

  const [errorMessage, setErrorMessage] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const pipVideoRef = useRef(null);
  const bgWorkerRef = useRef(null);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Toggle Picture-in-Picture floating window (Works on Desktop & Mobile)
  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      let stream = null;
      if (canvas.captureStream) {
        try {
          stream = canvas.captureStream(30);
        } catch (e) {
          console.warn('captureStream error:', e);
        }
      }

      if (!stream && video.srcObject) {
        stream = video.srcObject;
      }

      if (!stream) {
        alert('Fitur Picture-in-Picture tidak didukung pada browser ini.');
        return;
      }

      let pipVideo = pipVideoRef.current;
      if (!pipVideo) {
        pipVideo = document.createElement('video');
        pipVideo.muted = true;
        pipVideo.playsInline = true;
        pipVideo.style.position = 'fixed';
        pipVideo.style.pointerEvents = 'none';
        pipVideo.style.opacity = '0';
        pipVideo.style.width = '1px';
        pipVideo.style.height = '1px';
        document.body.appendChild(pipVideo);
        pipVideoRef.current = pipVideo;
      }

      pipVideo.srcObject = stream;
      await pipVideo.play();
      await pipVideo.requestPictureInPicture();
      setIsPipActive(true);

      pipVideo.onleavepictureinpicture = () => {
        setIsPipActive(false);
      };
    } catch (err) {
      console.warn('Canvas PiP fallback to direct video:', err);
      if (videoRef.current && videoRef.current.requestPictureInPicture) {
        try {
          await videoRef.current.requestPictureInPicture();
          setIsPipActive(true);
        } catch (e) {
          console.error('PiP failed:', e);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (pipVideoRef.current && pipVideoRef.current.parentNode) {
        pipVideoRef.current.parentNode.removeChild(pipVideoRef.current);
        pipVideoRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Clean up media streams
  const stopWebcamStream = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Initialize Camera
  const startCamera = useCallback(async () => {
    stopWebcamStream();
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setErrorMessage('Camera could not be accessed or permission was denied. Please switch to Sample Video mode.');
    }
  }, [stopWebcamStream]);

  // Handle Mode Switch & Video Source Changes
  useEffect(() => {
    isProcessingRef.current = false;
    latestDataRef.current = null;
    if (inputMode === 'webcam') {
      startCamera();
    } else {
      stopWebcamStream();
      const video = videoRef.current;
      if (video) {
        if (video.srcObject) {
          const tracks = video.srcObject.getTracks ? video.srcObject.getTracks() : [];
          tracks.forEach(track => track.stop());
          video.srcObject = null;
        }
        const targetSrc = inputMode === 'sample' ? sampleVideo : customVideoUrl;
        if (targetSrc) {
          video.srcObject = null;
          video.src = targetSrc;
          video.defaultMuted = true;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.crossOrigin = 'anonymous';
          video.load();
          const p = video.play();
          if (p !== undefined) {
            p.then(() => {
              setIsPlaying(true);
            }).catch((err) => {
              console.warn('Video auto-play waiting for user interaction:', err);
              setIsPlaying(false);
            });
          }
        }
      }
    }

    return () => {
      stopWebcamStream();
    };
  }, [inputMode, sampleVideo, customVideoUrl, startCamera, stopWebcamStream]);

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setCustomVideoUrl(objectUrl);
      setInputMode('upload');
    }
  };

  useEffect(() => {
    onRegisterTogglePip?.(togglePictureInPicture);
    onRegisterFileUpload?.(handleFileUpload);
  }, [onRegisterTogglePip, onRegisterFileUpload]);

  // Draw Elegant Vector Eye Contours (Zero Slop)
  const drawEyeContourAndPoints = (ctx, landmarks, indices, strokeColor, fillColor, w, h, isMirrored) => {
    if (!indices || indices.length === 0) return;

    // 1. Draw smooth vector polygon contour
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    indices.forEach((idx, i) => {
      const lm = landmarks[idx];
      if (!lm) return;
      const x = isMirrored ? (1 - lm.x) * w : lm.x * w;
      const y = lm.y * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();

    // 2. Draw subtle node vertices
    ctx.fillStyle = fillColor;
    indices.forEach(idx => {
      const lm = landmarks[idx];
      if (!lm) return;
      const x = isMirrored ? (1 - lm.x) * w : lm.x * w;
      const y = lm.y * h;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  // Draw Vertical and Horizontal EAR Measurement Chords
  const drawEarMeasurementLines = (ctx, landmarks, earIndices, w, h, isMirrored, isBlink) => {
    ctx.strokeStyle = isBlink ? 'rgba(244, 63, 94, 0.75)' : 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    const chords = [
      [earIndices[1], earIndices[5]], // p2 - p6 (vertical 1)
      [earIndices[2], earIndices[4]], // p3 - p5 (vertical 2)
      [earIndices[0], earIndices[3]], // p1 - p4 (horizontal)
    ];

    chords.forEach(([i1, i2]) => {
      const p1 = landmarks[i1];
      const p2 = landmarks[i2];
      if (!p1 || !p2) return;
      const x1 = isMirrored ? (1 - p1.x) * w : p1.x * w;
      const y1 = p1.y * h;
      const x2 = isMirrored ? (1 - p2.x) * w : p2.x * w;
      const y2 = p2.y * h;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  };

  // Frame Processing & Continuous Canvas Render Loop
  useEffect(() => {
    let isMounted = true;

    // Set callback for MediaPipe FaceMesh results
    if (faceMesh && isReady) {
      faceMesh.onResults((results) => {
        isProcessingRef.current = false;
        if (!isMounted) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!canvas || !video) return;

        const w = canvas.width;
        const h = canvas.height;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];

          // 1. Calculate EAR
          const rightEar = calculateEAR(landmarks, RIGHT_EYE_EAR_INDICES, w, h);
          const leftEar = calculateEAR(landmarks, LEFT_EYE_EAR_INDICES, w, h);
          const avgEar = (rightEar + leftEar) / 2.0;
          currentEarRef.current = avgEar;

          // 2. Update Tracker
          const frameIndex = video.currentTime ? Math.floor(video.currentTime * 30) : 0;
          const res = tracker.processFrame(avgEar, leftEar, rightEar, frameIndex);

          if (res.blinkDetected) {
            onBlinkTrigger?.();
          }

          onFrameProcessed?.({
            ear: avgEar,
            leftEar,
            rightEar,
            isBlinking: res.isBlinking,
            blinkDetected: res.blinkDetected,
            totalBlinks: res.totalBlinks,
          });

          // 3. Extract Haar ROIs
          const rois = haarRoiTracker.extractRois(landmarks, w, h);

          latestDataRef.current = {
            landmarks,
            rois,
            avgEar,
            isBlink: avgEar < threshold,
          };
        } else {
          latestDataRef.current = null;
        }
      });
    }

    // Continuous Canvas Render Loop (Guarantees video always renders smoothly, never black)
    const renderLoop = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        const maxDim = 1280;
        let vw = video.videoWidth || 1280;
        let vh = video.videoHeight || 720;
        if (vw > maxDim) {
          vh = Math.round((vh * maxDim) / vw);
          vw = maxDim;
        }

        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw;
          canvas.height = vh;
        }

        const w = canvas.width;
        const h = canvas.height;
        const isMirrored = inputMode === 'webcam' && mirrorCamera;

        // Draw current video frame to canvas
        ctx.save();
        if (isMirrored) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();

        // Draw HUD Overlays if face detected
        const data = latestDataRef.current;
        if (data && data.landmarks) {
          const { landmarks, rois, isBlink } = data;

          // Haar Cascade Face & Eye ROI Bounding Boxes (Dashed lines + labels)
          if (showHaarRoi && rois) {
            haarRoiTracker.drawHaarBoxes(ctx, rois, isMirrored, w, isBlink);
          }

          // MediaPipe Eye Landmarks & EAR Chords
          if (showLandmarks) {
            const contourStroke = isBlink ? 'rgba(244, 63, 94, 0.9)' : 'rgba(56, 189, 248, 0.85)';
            const nodeFill = isBlink ? '#fb7185' : '#38bdf8';

            drawEyeContourAndPoints(ctx, landmarks, RIGHT_EYE_LANDMARKS, contourStroke, nodeFill, w, h, isMirrored);
            drawEyeContourAndPoints(ctx, landmarks, LEFT_EYE_LANDMARKS, contourStroke, nodeFill, w, h, isMirrored);

            drawEarMeasurementLines(ctx, landmarks, RIGHT_EYE_EAR_INDICES, w, h, isMirrored, isBlink);
            drawEarMeasurementLines(ctx, landmarks, LEFT_EYE_EAR_INDICES, w, h, isMirrored, isBlink);
          }
        }

        // Send frame to FaceMesh detector if ready, not paused, and not busy
        if (faceMesh && isReady && !isProcessingRef.current && !video.paused && !propIsPaused) {
          try {
            isProcessingRef.current = true;
            await faceMesh.send({ image: video });
          } catch {
            isProcessingRef.current = false;
          }
        }
      }

      if (isMounted) {
        animFrameRef.current = requestAnimationFrame(renderLoop);
      }
    };

    // Background Web Worker to defeat browser background tab throttling
    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (!timer) {
              timer = setInterval(function() {
                self.postMessage('tick');
              }, 45); // ~22 FPS background loop
            }
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      bgWorkerRef.current = worker;

      worker.onmessage = async () => {
        if (!document.hidden || !isMounted) return;
        const video = videoRef.current;
        if (!video || video.paused || propIsPaused || !faceMesh || !isReady || isProcessingRef.current) return;

        try {
          isProcessingRef.current = true;
          await faceMesh.send({ image: video });
        } catch {
          isProcessingRef.current = false;
        }
      };
    } catch (err) {
      console.warn('Background worker unavailable:', err);
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (bgWorkerRef.current) bgWorkerRef.current.postMessage('start');
      } else {
        if (bgWorkerRef.current) bgWorkerRef.current.postMessage('stop');
        if (isMounted) {
          animFrameRef.current = requestAnimationFrame(renderLoop);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (bgWorkerRef.current) {
        bgWorkerRef.current.postMessage('stop');
        bgWorkerRef.current.terminate();
        bgWorkerRef.current = null;
      }
    };
  }, [faceMesh, isReady, tracker, threshold, showLandmarks, showHaarRoi, mirrorCamera, inputMode, propIsPaused, onFrameProcessed, onBlinkTrigger]);

  // Sync video playback state with propIsPaused when using sample/upload video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || inputMode === 'webcam') return;
    if (propIsPaused && !video.paused) {
      video.pause();
      setIsPlaying(false);
    } else if (!propIsPaused && video.paused && video.src) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [propIsPaused, inputMode]);

  const togglePlay = () => {
    if (onTogglePause) {
      onTogglePause();
      return;
    }
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    tracker.reset();
  };

  return (
    <div ref={containerRef} className={`glass-card ${isFullscreen ? 'is-fullscreen' : ''}`}>
      {/* Card Header & Input Mode Switcher */}
      <div className="feed-header">
        <div className="feed-title-group">
          <Eye size={16} />
          <span className="feed-title">Visual Input & Eye Contour Tracking</span>
        </div>

        {!isSimpleView && (
          <div className="mode-tabs">
            <button
              onClick={() => setInputMode('sample')}
              className={`tab-btn ${inputMode === 'sample' ? 'active' : ''}`}
            >
              <Video size={12} />
              <span>Sample Video</span>
            </button>
            <button
              onClick={() => setInputMode('webcam')}
              className={`tab-btn ${inputMode === 'webcam' ? 'active' : ''}`}
            >
              <Camera size={12} />
              <span>Live Webcam</span>
            </button>
            <label className={`tab-btn ${inputMode === 'upload' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
              <Upload size={12} />
              <span>Upload Video</span>
              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Video & Canvas Frame Area */}
      <div className="video-stage">
        <video
          ref={videoRef}
          playsInline
          muted
          crossOrigin="anonymous"
          className="video-element"
          onLoadedMetadata={() => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (video && canvas) {
              const maxDim = 1280;
              let vw = video.videoWidth || 1280;
              let vh = video.videoHeight || 720;
              if (vw > maxDim) {
                vh = Math.round((vh * maxDim) / vw);
                vw = maxDim;
              }
              canvas.width = vw;
              canvas.height = vh;
            }
          }}
        />

        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="canvas-overlay"
        />

        {isCalibrating && (
          <div style={{
            position: 'absolute',
            padding: '12px 20px',
            background: 'rgba(9, 9, 11, 0.9)',
            border: '1px solid #f59e0b',
            borderRadius: 'var(--radius-md)',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            zIndex: 30,
            boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
          }}>
            <div className="pulse-dot" style={{ backgroundColor: '#f59e0b' }} />
            <span>Calibrating: Look straight at camera with eyes naturally open... ({calibrateCountdown}s)</span>
          </div>
        )}

        {errorMessage && (
          <div style={{
            position: 'absolute',
            padding: '12px 18px',
            background: 'rgba(24, 24, 27, 0.95)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            zIndex: 20,
            maxWidth: '85%',
          }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Floating Paused Overlay Badge */}
        {propIsPaused && (
          <div className="video-paused-overlay">
            <Pause size={18} />
            <div>
              <strong>Sesi Dijeda (Paused)</strong>
              <span>Timer 1 menit &amp; peringatan dihentikan sementara</span>
            </div>
            {onTogglePause && (
              <button type="button" onClick={onTogglePause} className="btn-primary" style={{ padding: '5px 12px' }}>
                <Play size={13} />
                <span>Lanjutkan</span>
              </button>
            )}
          </div>
        )}

        {/* Clean Minimal Bottom Video Corner Controls */}
        <div className="studio-hud-bottom">
          <div className="btn-group">
            {!isSimpleView && inputMode === 'sample' && (
              <>
                <select
                  value={sampleVideo}
                  onChange={(e) => {
                    const newSrc = e.target.value;
                    setSampleVideo(newSrc);
                    tracker.reset();
                    latestDataRef.current = null;
                  }}
                  className="sample-select"
                  style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                >
                  <option value="/videos/blinking_0.mp4">Subject 0</option>
                  <option value="/videos/blinking_1.mp4">Subject 1</option>
                  <option value="/videos/blinking_2.mp4">Subject 2 (Male)</option>
                  <option value="/videos/blinking_3.mp4">Subject 3 (Female)</option>
                  <option value="/videos/blinking_4.mp4">Subject 4</option>
                  <option value="/videos/blinking_5.mp4">Subject 5</option>
                  <option value="/videos/blinking_6.mp4">Subject 6</option>
                  <option value="/videos/blinking_7.mp4">Subject 7</option>
                  <option value="/videos/blinking_8.mp4">Subject 8</option>
                  <option value="/videos/blinking_9.mp4">Subject 9</option>
                  <option value="/videos/blinking_10.mp4">Subject 10</option>
                  <option value="/videos/blinking_11.mp4">Subject 11</option>
                  <option value="/videos/blinking_12.mp4">Subject 12</option>
                </select>
                <button onClick={restartVideo} className="btn-secondary" style={{ padding: '4px 8px' }} title="Ulangi Video">
                  <RotateCcw size={12} />
                  <span>Ulang</span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            className={`btn-secondary ${isFullscreen ? 'active' : ''}`}
            style={{ padding: '4px 9px' }}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span>{isFullscreen ? 'Keluar' : 'Layar Penuh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
