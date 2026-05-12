'use client';

import { useMusicPlayer } from '@/src/hooks/use-music-player';
import { type Track } from '@/src/data/playlist';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronUp,
  ChevronDown,
  X,
  Music,
} from 'lucide-react';
import Image from 'next/image';

function formatTime(seconds: number) {
  const s = Math.floor(seconds);
  return `0:${s.toString().padStart(2, '0')}`;
}

export function MusicPlayer() {
  const {
    currentTrack,
    currentTrackIndex,
    isPlaying,
    progress,
    currentTime,
    duration,
    isExpanded,
    isVisible,
    playlist,
    togglePlay,
    next,
    prev,
    playTrack,
    seekTo,
    toggleExpanded,
    dismiss,
  } = useMusicPlayer();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 z-40 md:bottom-6 md:right-6 max-md:bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] max-md:right-3"
      >
        {isExpanded ? (
          <ExpandedPlayer
            currentTrack={currentTrack}
            currentTrackIndex={currentTrackIndex}
            isPlaying={isPlaying}
            progress={progress}
            currentTime={currentTime}
            duration={duration}
            playlist={playlist}
            onTogglePlay={togglePlay}
            onNext={next}
            onPrev={prev}
            onPlayTrack={playTrack}
            onSeek={seekTo}
            onCollapse={toggleExpanded}
            onDismiss={dismiss}
          />
        ) : (
          <MiniPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            progress={progress}
            onTogglePlay={togglePlay}
            onNext={next}
            onExpand={toggleExpanded}
            onDismiss={dismiss}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Mini Player ─────────────────────────────────────────────────── */

function MiniPlayer({
  currentTrack,
  isPlaying,
  progress,
  onTogglePlay,
  onNext,
  onExpand,
  onDismiss,
}: {
  currentTrack: Track;
  isPlaying: boolean;
  progress: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onExpand: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      layout
      className="relative w-[260px] bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.06]">
        <motion.div
          className="h-full bg-[var(--primary)]"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.25, ease: 'linear' }}
        />
      </div>

      <div className="flex items-center gap-3 p-3 pt-4">
        {/* Artwork */}
        <div
          className={`relative w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0 ${
            isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''
          }`}
        >
          <Image
            src={currentTrack.artworkUrl}
            alt={currentTrack.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="font-serif text-sm text-white truncate leading-tight">
            {currentTrack.title}
          </p>
          <p className="text-[10px] text-white/40 truncate">{currentTrack.artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onTogglePlay}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--primary)] text-black"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onExpand}
            className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

/* ─── Expanded Player ─────────────────────────────────────────────── */

function ExpandedPlayer({
  currentTrack,
  currentTrackIndex,
  isPlaying,
  progress,
  currentTime,
  duration,
  playlist,
  onTogglePlay,
  onNext,
  onPrev,
  onPlayTrack,
  onSeek,
  onCollapse,
  onDismiss,
}: {
  currentTrack: Track;
  currentTrackIndex: number;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  playlist: Track[];
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onPlayTrack: (index: number) => void;
  onSeek: (percent: number) => void;
  onCollapse: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="w-[300px] max-md:w-[280px] bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 text-[var(--primary)]">
          <Music className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-[0.15em] font-medium">
            Now Playing
          </span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCollapse}
            className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDismiss}
            className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Current track */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`relative w-14 h-14 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 ${
              isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''
            }`}
            style={{ borderRadius: '50%' }}
          >
            <Image
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-sm text-white truncate">{currentTrack.title}</p>
            <p className="text-xs text-white/40 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div
            className="w-full h-1.5 bg-white/[0.06] rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - rect.left) / rect.width) * 100;
              onSeek(Math.max(0, Math.min(100, percent)));
            }}
          >
            <motion.div
              className="h-full bg-[var(--primary)] rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.25, ease: 'linear' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-white/30">{formatTime(currentTime)}</span>
            <span className="text-[10px] text-white/30">
              {duration ? formatTime(duration) : '0:30'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPrev}
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
          >
            <SkipBack className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTogglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--primary)] text-black"
          >
            {isPlaying ? (
              <Pause className="w-4.5 h-4.5" />
            ) : (
              <Play className="w-4.5 h-4.5 ml-0.5" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
          >
            <SkipForward className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Playlist */}
      <div className="border-t border-white/[0.04]">
        <div className="max-h-[200px] overflow-y-auto scrollbar-thin">
          {playlist.map((track, index) => (
            <motion.button
              key={track.id}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              onClick={() => onPlayTrack(index)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                index === currentTrackIndex ? 'bg-white/[0.03]' : ''
              }`}
            >
              <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={track.artworkUrl}
                  alt={track.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {index === currentTrackIndex && isPlaying && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex items-end gap-[2px] h-3">
                      <span className="w-[2px] bg-[var(--primary)] animate-[equalizer_0.5s_ease_infinite_alternate] h-full" />
                      <span className="w-[2px] bg-[var(--primary)] animate-[equalizer_0.5s_ease_0.2s_infinite_alternate] h-2/3" />
                      <span className="w-[2px] bg-[var(--primary)] animate-[equalizer_0.5s_ease_0.4s_infinite_alternate] h-1/3" />
                    </div>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs truncate ${
                    index === currentTrackIndex
                      ? 'text-[var(--primary)] font-medium'
                      : 'text-white/80'
                  }`}
                >
                  {track.title}
                </p>
                <p className="text-[10px] text-white/30 truncate">{track.artist}</p>
              </div>
              <span className="text-[10px] text-white/20 flex-shrink-0">0:30</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
