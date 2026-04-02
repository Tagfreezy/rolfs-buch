'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, Play, Pause, Square } from 'lucide-react';
import { type ChapterImage, makeSupabasePublicUrl } from '@/lib/book';

type TtsState = 'idle' | 'playing' | 'paused';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface Props {
  content: string;
  images: ChapterImage[];
}

export default function ChapterReader({ content, images }: Props) {
  const [ttsState, setTtsState] = useState<TtsState>('idle');
  const [activePara, setActivePara] = useState(-1);
  const [speed, setSpeed] = useState(1);

  // Refs for use inside speech callbacks (avoid stale closures)
  const ttsStateRef = useRef<TtsState>('idle');
  const activeParaRef = useRef(-1);
  const speedRef = useRef(1);
  const pausedAtRef = useRef(-1); // paragraph index where we paused

  ttsStateRef.current = ttsState;
  activeParaRef.current = activePara;
  speedRef.current = speed;

  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Core speak function — speaks from a given paragraph index onwards
  const speakFrom = useCallback(
    (startIndex: number) => {
      if (typeof window === 'undefined') return;

      window.speechSynthesis.cancel();

      if (startIndex >= paragraphs.length) {
        // Finished the chapter
        setTtsState('idle');
        setActivePara(-1);
        activeParaRef.current = -1;
        pausedAtRef.current = -1;
        return;
      }

      setActivePara(startIndex);
      activeParaRef.current = startIndex;
      setTtsState('playing');
      ttsStateRef.current = 'playing';

      const utter = new SpeechSynthesisUtterance(paragraphs[startIndex]);
      utter.lang = 'de-DE';
      utter.rate = speedRef.current;

      utter.onend = () => {
        // Only advance if we're still in 'playing' state (not stopped/paused)
        if (ttsStateRef.current === 'playing') {
          speakFrom(startIndex + 1);
        }
      };

      utter.onerror = (e) => {
        // 'interrupted' fires on cancel() — that's intentional, ignore it
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          setTtsState('idle');
          setActivePara(-1);
          pausedAtRef.current = -1;
        }
      };

      window.speechSynthesis.speak(utter);
    },
    // paragraphs array is stable for the lifetime of this component instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paragraphs.length]
  );

  const handlePlay = useCallback(() => {
    const resumeFrom = pausedAtRef.current >= 0 ? pausedAtRef.current : 0;
    pausedAtRef.current = -1;
    speakFrom(resumeFrom);
  }, [speakFrom]);

  const handlePause = useCallback(() => {
    // Cancel-and-remember is more reliable than speechSynthesis.pause()
    pausedAtRef.current = activeParaRef.current;
    window.speechSynthesis.cancel();
    setTtsState('paused');
    ttsStateRef.current = 'paused';
    // Keep activePara highlighted so the user sees where they paused
  }, []);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setTtsState('idle');
    ttsStateRef.current = 'idle';
    setActivePara(-1);
    activeParaRef.current = -1;
    pausedAtRef.current = -1;
  }, []);

  const handleToggle = useCallback(() => {
    if (ttsState === 'idle') handlePlay();
    else if (ttsState === 'playing') handlePause();
    else handlePlay(); // paused → resume
  }, [ttsState, handlePlay, handlePause]);

  // When speed changes while playing, restart the current paragraph at new speed
  const prevSpeedRef = useRef(speed);
  useEffect(() => {
    if (prevSpeedRef.current !== speed && ttsStateRef.current === 'playing') {
      speakFrom(activeParaRef.current);
    }
    prevSpeedRef.current = speed;
  }, [speed, speakFrom]);

  // Cancel speech when the component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const isActive = ttsState !== 'idle';

  return (
    <>
      {/* "Vorlesen" trigger button */}
      <div className="mb-8 flex items-center gap-3">
        <button
          onClick={handleToggle}
          className="group flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all"
          style={
            isActive
              ? {
                  background: 'rgba(99,102,241,0.15)',
                  borderColor: 'rgba(99,102,241,0.4)',
                  color: '#818cf8',
                }
              : {
                  background: 'transparent',
                  borderColor: 'rgba(99,102,241,0.3)',
                  color: 'rgba(99,102,241,0.8)',
                }
          }
        >
          <Volume2 className="h-4 w-4" />
          {ttsState === 'idle'
            ? 'Vorlesen'
            : ttsState === 'playing'
            ? 'Pause'
            : 'Fortsetzen'}
        </button>

        {isActive && (
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/40 transition-all hover:border-white/20 hover:text-white/70"
          >
            <Square className="h-3 w-3" />
            Stopp
          </button>
        )}
      </div>

      {/* Chapter text with paragraph highlighting */}
      <div className="font-serif text-[1.2rem] leading-[2] text-white/75">
        {paragraphs.map((para, idx) => {
          const isHighlighted = idx === activePara;
          const paraImages = images.filter(
            (img) => img.position_in_chapter === idx + 1
          );

          return (
            <div key={`${idx}-${para.slice(0, 8)}`}>
              <p
                className="mb-7 -mx-3 rounded-xl px-3 transition-all duration-500"
                style={
                  isHighlighted
                    ? {
                        background: 'rgba(99,102,241,0.08)',
                        boxShadow: '0 0 0 1px rgba(99,102,241,0.15)',
                        color: 'rgba(255,255,255,0.92)',
                      }
                    : {}
                }
              >
                {para}
              </p>

              {paraImages.map((image) => {
                const src = makeSupabasePublicUrl(image.storage_path);
                if (!src) return null;
                return (
                  <figure
                    key={image.id}
                    className="my-10 overflow-hidden rounded-2xl"
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <img
                      src={src}
                      alt={image.caption ?? `Abbildung ${image.id}`}
                      className="w-full object-cover"
                    />
                    {image.caption && (
                      <figcaption className="px-5 py-3 text-center text-sm italic text-white/35">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Floating audio controls bar */}
      <div
        className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 transition-all duration-300"
        style={{
          opacity: isActive ? 1 : 0,
          transform: `translateX(-50%) translateY(${isActive ? '0' : '16px'})`,
          pointerEvents: isActive ? 'auto' : 'none',
        }}
      >
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-3 shadow-2xl"
          style={{
            background: 'rgba(5,10,20,0.92)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
          }}
        >
          {/* Status label */}
          <span className="flex items-center gap-2 text-sm">
            {ttsState === 'playing' ? (
              <>
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    background: '#6366f1',
                    animation: 'tts-pulse 1.5s ease-in-out infinite',
                  }}
                />
                <span className="text-white/60">Wird vorgelesen …</span>
              </>
            ) : (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-white/20" />
                <span className="text-white/40">Pausiert</span>
              </>
            )}
          </span>

          {/* Divider */}
          <div className="h-5 w-px bg-white/10" />

          {/* Play / Pause */}
          <button
            onClick={ttsState === 'playing' ? handlePause : handlePlay}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            title={ttsState === 'playing' ? 'Pause' : 'Fortsetzen'}
          >
            {ttsState === 'playing' ? (
              <Pause className="h-4 w-4 fill-white text-white" />
            ) : (
              <Play className="h-4 w-4 fill-white text-white" />
            )}
          </button>

          {/* Stop */}
          <button
            onClick={handleStop}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:bg-white/10"
            title="Stopp"
          >
            <Square className="h-4 w-4 fill-white/60 text-white/60" />
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-white/10" />

          {/* Speed selector */}
          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="rounded-lg px-2 py-1 text-xs font-mono font-semibold transition-all"
                style={
                  speed === s
                    ? {
                        background: 'rgba(99,102,241,0.2)',
                        color: '#818cf8',
                        border: '1px solid rgba(99,102,241,0.3)',
                      }
                    : {
                        color: 'rgba(255,255,255,0.3)',
                        border: '1px solid transparent',
                      }
                }
              >
                {s === 1 ? '1×' : `${s}×`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pulse animation for the active indicator */}
      <style jsx global>{`
        @keyframes tts-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
