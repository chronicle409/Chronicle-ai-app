import React, { useRef, useState, useEffect } from "react";

export default function FindoraRecorder() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const animRef = useRef(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 320;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const center = size / 2;

    function animate() {
      ctx.clearRect(0, 0, size, size);

      const radius = 105;
      const data = new Uint8Array(128);
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(data);
      }

      // Outer white dotted ring
      for (let i = 0; i < 180; i++) {
        const angle = (i / 180) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(
          center + Math.cos(angle) * radius,
          center + Math.sin(angle) * radius,
          1.7,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 7;
        ctx.shadowColor = "#FFFFFF";
        ctx.fill();
      }

      // Inner white dotted ring
      for (let i = 0; i < 150; i++) {
        const angle = (i / 150) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(
          center + Math.cos(angle) * 91,
          center + Math.sin(angle) * 91,
          1,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 0;
        ctx.fill();
      }

      // Moving white audio bars
      for (let i = 0; i < 180; i++) {
        const angle = (i / 180) * Math.PI * 2;
        const frequency = analyserRef.current
          ? data[Math.floor((i / 180) * 128)] / 255
          : 0.15 + Math.sin(Date.now() / 250 + i * 0.3) * 0.1;

        const length = 5 + frequency * 48;

        ctx.beginPath();
        ctx.moveTo(
          center + Math.cos(angle) * 112,
          center + Math.sin(angle) * 112
        );
        ctx.lineTo(
          center + Math.cos(angle) * (112 + length),
          center + Math.sin(angle) * (112 + length)
        );
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#FFFFFF";
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      alert("Please allow microphone access.");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorderRef.current.mimeType });
        const url = URL.createObjectURL(blob);
        console.log("Recording:", url);
        // you can upload url here
      };
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    analyserRef.current = null;
    setRecording(false);
  }

  return (
    <>
      <div className="findora-recorder">
        <canvas ref={canvasRef} />
        <button
          onClick={recording ? stopRecording : startRecording}
          className="record-control"
        >
          {recording ? "Stop recording" : "Start recording"}
        </button>
      </div>

      <style>{`
        .findora-recorder {
          width: 100%;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000;
          overflow: hidden;
          border-radius: 24px;
        }
        .findora-recorder canvas {
          width: min(90vw, 320px);
          height: auto;
          aspect-ratio: 1;
        }
        .record-control {
          margin-top: 24px;
          padding: 13px 30px;
          border: none;
          border-radius: 30px;
          background: white;
          color: #008cff;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .record-control:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  );
  }
