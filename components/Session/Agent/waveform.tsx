import React, { useEffect, useRef, useState } from "react";
import { useVoiceClientMediaTrack } from "realtime-ai-react";

interface WaveFormProps {
  isThinking: boolean;
  scanningSpeed?: number;
}

const WaveForm: React.FC<WaveFormProps> = React.memo(
  ({ isThinking, scanningSpeed = 0.5 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [transitionProgress, setTransitionProgress] = useState(
      isThinking ? 1 : 0
    );

    const track: MediaStreamTrack | null = useVoiceClientMediaTrack(
      "audio",
      "bot"
    );

    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const scaleFactor = 2;
      const canvasCtx = canvas.getContext("2d")!;

      const resizeCanvas = () => {
        const parentElement = canvas.parentElement;
        const containerWidth = parentElement ? parentElement.clientWidth : 300;
        const containerHeight = parentElement
          ? parentElement.clientHeight
          : 150;

        canvas.width = containerWidth * scaleFactor;
        canvas.height = containerHeight * scaleFactor;

        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerHeight}px`;

        canvasCtx.lineCap = "round";
        canvasCtx.scale(scaleFactor, scaleFactor);
      };

      resizeCanvas();

      let audioContext: AudioContext | null = null;
      let analyser: AnalyserNode | null = null;
      let frequencyData: Uint8Array | null = null;

      if (track) {
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(
          new MediaStream([track])
        );
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
      }

      const bands = [
        { startFreq: 85, endFreq: 255, smoothValue: 0 },
        { startFreq: 255, endFreq: 500, smoothValue: 0 },
        { startFreq: 500, endFreq: 2000, smoothValue: 0 },
        { startFreq: 2000, endFreq: 4000, smoothValue: 0 },
        { startFreq: 4000, endFreq: 8000, smoothValue: 0 },
      ];

      const barWidth = 30;
      const barGap = 12;
      const maxBarHeight = 160;

      const getFrequencyBinIndex = (frequency: number) => {
        if (!audioContext) return 0;
        const nyquist = audioContext.sampleRate / 2;
        return Math.round(
          (frequency / nyquist) * ((analyser?.frequencyBinCount || 0) - 1)
        );
      };

      let animationFrame = 0;

      function drawSpectrum() {
        canvasCtx.clearRect(
          0,
          0,
          canvas.width / scaleFactor,
          canvas.height / scaleFactor
        );

        const totalBarsWidth =
          bands.length * barWidth + (bands.length - 1) * barGap;
        const startX = (canvas.width / scaleFactor - totalBarsWidth) / 2;
        const y = canvas.height / scaleFactor / 2;

        const thinkingHeights = getThinkingHeights();
        const speakingHeights = getSpeakingHeights(analyser, frequencyData);

        bands.forEach((_, i) => {
          const x = startX + i * (barWidth + barGap);
          const thinkingHeight = thinkingHeights[i];
          const speakingHeight = speakingHeights[i];
          const height =
            thinkingHeight * transitionProgress +
            speakingHeight * (1 - transitionProgress);
          drawBar(x, y, height);
        });

        animationFrame = requestAnimationFrame(drawSpectrum);
      }

      function getThinkingHeights() {
        const time = Date.now() / 1000;
        const scanPosition = (time * scanningSpeed) % (bands.length * 2 - 2);
        const adjustedScanPosition =
          scanPosition < bands.length
            ? scanPosition
            : bands.length * 2 - 2 - scanPosition;

        return bands.map((_, i) => {
          const distance = Math.abs(i - adjustedScanPosition);
          return Math.max(0, 60 - distance * 20);
        });
      }

      function getSpeakingHeights(
        analyser: AnalyserNode | null,
        frequencyData: Uint8Array | null
      ) {
        if (!analyser || !frequencyData) {
          return bands.map(() => 0);
        }

        analyser.getByteFrequencyData(frequencyData);

        return bands.map((band, i) => {
          const startIndex = getFrequencyBinIndex(band.startFreq);
          const endIndex = getFrequencyBinIndex(band.endFreq);
          const bandData = frequencyData.slice(startIndex, endIndex);
          const bandValue =
            bandData.reduce((acc, val) => acc + val, 0) / bandData.length;

          const smoothingFactor = 0.2;
          band.smoothValue =
            band.smoothValue + (bandValue - band.smoothValue) * smoothingFactor;

          return Math.min(
            (band.smoothValue / 255) * maxBarHeight,
            maxBarHeight
          );
        });
      }

      function drawBar(x: number, y: number, height: number) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(x + barWidth / 2, y - height / 2);
        canvasCtx.lineTo(x + barWidth / 2, y + height / 2);
        canvasCtx.lineWidth = barWidth;
        canvasCtx.strokeStyle = "rgba(255, 255, 255, 1)";
        canvasCtx.stroke();
      }

      drawSpectrum();

      window.addEventListener("resize", resizeCanvas);

      return () => {
        cancelAnimationFrame(animationFrame);
        audioContext?.close();
        window.removeEventListener("resize", resizeCanvas);
      };
    }, [track, scanningSpeed, transitionProgress]);

    // Smooth transition effect
    useEffect(() => {
      let animationFrame: number;
      const animate = () => {
        setTransitionProgress((prev) => {
          const target = isThinking ? 1 : 0;
          const diff = target - prev;
          if (Math.abs(diff) < 0.01) return target;
          return prev + diff * 0.1;
        });
        animationFrame = requestAnimationFrame(animate);
      };
      animate();
      return () => cancelAnimationFrame(animationFrame);
    }, [isThinking]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    );
  }
);

WaveForm.displayName = "WaveForm";

export default WaveForm;
