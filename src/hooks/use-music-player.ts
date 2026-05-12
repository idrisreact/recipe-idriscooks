'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { playlist, type Track } from '@/src/data/playlist';

interface MusicPlayerState {
  currentTrackIndex: number;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  isExpanded: boolean;
  isVisible: boolean;
}

export function useMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUpdateRef = useRef(0);

  const [state, setState] = useState<MusicPlayerState>({
    currentTrackIndex: 0,
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    duration: 0,
    isExpanded: false,
    isVisible: () => {
      if (typeof window === 'undefined') return true;
      return localStorage.getItem('music-player-dismissed') !== 'true';
    },
  } as unknown as MusicPlayerState);

  // Lazy init on client
  useEffect(() => {
    const dismissed = localStorage.getItem('music-player-dismissed') === 'true';
    setState((s) => ({ ...s, isVisible: !dismissed }));
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 250) return;
      lastUpdateRef.current = now;

      if (audio.duration) {
        setState((s) => ({
          ...s,
          progress: (audio.currentTime / audio.duration) * 100,
          currentTime: audio.currentTime,
          duration: audio.duration,
        }));
      }
    };

    const handleEnded = () => {
      setState((s) => {
        const nextIndex = (s.currentTrackIndex + 1) % playlist.length;
        audio.src = playlist[nextIndex].previewUrl;
        audio.play().catch(() => {});
        return { ...s, currentTrackIndex: nextIndex, progress: 0, currentTime: 0 };
      });
    };

    const handleError = () => {
      // Skip to next track on error
      setState((s) => {
        const nextIndex = (s.currentTrackIndex + 1) % playlist.length;
        audio.src = playlist[nextIndex].previewUrl;
        audio.play().catch(() => {});
        return { ...s, currentTrackIndex: nextIndex, progress: 0, currentTime: 0 };
      });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const currentTrack: Track = playlist[state.currentTrackIndex];

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.src || audio.src !== playlist[state.currentTrackIndex].previewUrl) {
      audio.src = playlist[state.currentTrackIndex].previewUrl;
    }
    audio.play().catch(() => {});
    setState((s) => ({ ...s, isPlaying: true }));
  }, [state.currentTrackIndex]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const next = useCallback(() => {
    const nextIndex = (state.currentTrackIndex + 1) % playlist.length;
    const audio = audioRef.current;
    if (audio) {
      audio.src = playlist[nextIndex].previewUrl;
      if (state.isPlaying) {
        audio.play().catch(() => {});
      }
    }
    setState((s) => ({
      ...s,
      currentTrackIndex: nextIndex,
      progress: 0,
      currentTime: 0,
    }));
  }, [state.currentTrackIndex, state.isPlaying]);

  const prev = useCallback(() => {
    const prevIndex =
      (state.currentTrackIndex - 1 + playlist.length) % playlist.length;
    const audio = audioRef.current;
    if (audio) {
      audio.src = playlist[prevIndex].previewUrl;
      if (state.isPlaying) {
        audio.play().catch(() => {});
      }
    }
    setState((s) => ({
      ...s,
      currentTrackIndex: prevIndex,
      progress: 0,
      currentTime: 0,
    }));
  }, [state.currentTrackIndex, state.isPlaying]);

  const playTrack = useCallback(
    (index: number) => {
      const audio = audioRef.current;
      if (audio) {
        audio.src = playlist[index].previewUrl;
        audio.play().catch(() => {});
      }
      setState((s) => ({
        ...s,
        currentTrackIndex: index,
        isPlaying: true,
        progress: 0,
        currentTime: 0,
      }));
    },
    []
  );

  const seekTo = useCallback((percent: number) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = (percent / 100) * audio.duration;
      setState((s) => ({ ...s, progress: percent }));
    }
  }, []);

  const toggleExpanded = useCallback(() => {
    setState((s) => ({ ...s, isExpanded: !s.isExpanded }));
  }, []);

  const dismiss = useCallback(() => {
    audioRef.current?.pause();
    localStorage.setItem('music-player-dismissed', 'true');
    setState((s) => ({ ...s, isVisible: false, isPlaying: false }));
  }, []);

  const show = useCallback(() => {
    localStorage.removeItem('music-player-dismissed');
    setState((s) => ({ ...s, isVisible: true }));
  }, []);

  return {
    currentTrack,
    currentTrackIndex: state.currentTrackIndex,
    isPlaying: state.isPlaying,
    progress: state.progress,
    currentTime: state.currentTime,
    duration: state.duration,
    isExpanded: state.isExpanded,
    isVisible: state.isVisible,
    playlist,
    play,
    pause,
    togglePlay,
    next,
    prev,
    playTrack,
    seekTo,
    toggleExpanded,
    dismiss,
    show,
  };
}
