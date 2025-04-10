'use client';

import { useEffect, useRef } from 'react';

export default function DNAAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const helixes = [];
    const dataStreams = [];

    for (let i = 0; i < 5; i++) {
      helixes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rotation: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.2,
        scale: Math.random() * 0.5 + 0.5,
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }

    for (let i = 0; i < 20; i++) {
      dataStreams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 100 + 50,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    function drawHelix(x, y, rotation, opacity, scale) {
      const amplitude = 30 * scale;
      const frequency = 0.02;
      const points = 40;
      
      ctx.strokeStyle = `rgba(147, 51, 234, ${opacity})`;
      ctx.lineWidth = 2;

      for (let strand = 0; strand < 2; strand++) {
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          const xOffset = i * 10;
          const phase = strand * Math.PI;
          const yOffset = Math.sin(frequency * xOffset + phase + rotation) * amplitude;
          
          const rotatedX = x + xOffset * Math.cos(rotation) - yOffset * Math.sin(rotation);
          const rotatedY = y + xOffset * Math.sin(rotation) + yOffset * Math.cos(rotation);

          if (i === 0) {
            ctx.moveTo(rotatedX, rotatedY);
          } else {
            ctx.lineTo(rotatedX, rotatedY);
          }
        }
        ctx.stroke();

        for (let i = 0; i < points; i += 4) {
          const xOffset = i * 10;
          const y1 = Math.sin(frequency * xOffset + rotation) * amplitude;
          const y2 = Math.sin(frequency * xOffset + Math.PI + rotation) * amplitude;
          
          const rotatedX1 = x + xOffset * Math.cos(rotation) - y1 * Math.sin(rotation);
          const rotatedY1 = y + xOffset * Math.sin(rotation) + y1 * Math.cos(rotation);
          const rotatedX2 = x + xOffset * Math.cos(rotation) - y2 * Math.sin(rotation);
          const rotatedY2 = y + xOffset * Math.sin(rotation) + y2 * Math.cos(rotation);

          ctx.beginPath();
          ctx.moveTo(rotatedX1, rotatedY1);
          ctx.lineTo(rotatedX2, rotatedY2);
          ctx.stroke();
        }
      }
    }

    function drawDataStream(x, y, length, opacity) {
      ctx.strokeStyle = `rgba(219, 39, 119, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + length);
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const particleY = y + ((y + length - y) * (i / 2));
        ctx.fillStyle = `rgba(219, 39, 119, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, particleY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(10, 10, 31, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      helixes.forEach(helix => {
        helix.rotation += 0.002 * helix.direction;
        helix.opacity = 0.2 + Math.sin(Date.now() * 0.001) * 0.3;
        drawHelix(helix.x, helix.y, helix.rotation, helix.opacity, helix.scale);
      });

      dataStreams.forEach(stream => {
        stream.y += stream.speed;
        if (stream.y > canvas.height + stream.length) {
          stream.y = -stream.length;
          stream.x = Math.random() * canvas.width;
        }
        drawDataStream(stream.x, stream.y, stream.length, stream.opacity);
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />;
}
