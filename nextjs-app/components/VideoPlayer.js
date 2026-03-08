import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaVolumeMute, FaDownload, FaShareAlt } from 'react-icons/fa';

export default function VideoPlayer({ storyboard, productName, voiceSettings }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [sceneAudios, setSceneAudios] = useState({});
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [sceneVideos, setSceneVideos] = useState({});
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [useVeo, setUseVeo] = useState(true);
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const videoRef = useRef(null);

  const scenes = storyboard?.scenes || [];
  const currentScene = scenes[currentSceneIndex];

  const generateAllSceneAudios = async () => {
    if (loadingAudio || audioLoaded) return;
    
    setLoadingAudio(true);
    const audios = {};

    try {
      console.log('Generating audio for', scenes.length, 'scenes...');
      for (const scene of scenes) {
        if (scene.voiceover) {
          const response = await fetch('/api/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: scene.voiceover,
              voice: voiceSettings.voice,
              languageCode: voiceSettings.languageCode,
              rate: voiceSettings.rate,
              pitch: voiceSettings.pitch
            })
          });

          const data = await response.json();
          if (data.audioUrl) {
            audios[scene.scene_number] = data.audioUrl;
            console.log('Audio generated for scene', scene.scene_number);
          } else {
            console.error('No audio URL returned for scene', scene.scene_number, data);
          }
        }
      }
      setSceneAudios(audios);
      setAudioLoaded(true);
      console.log('All audio generated:', Object.keys(audios).length, 'scenes');
    } catch (error) {
      console.error('Error generating scene audios:', error);
    } finally {
      setLoadingAudio(false);
    }
  };

  const generateAllSceneVideos = async () => {
    if (loadingVideos || videosLoaded || !useVeo) return;
    
    setLoadingVideos(true);
    const videos = {};

    try {
      console.log('Generating Veo videos for', scenes.length, 'scenes...');
      for (const scene of scenes) {
        // Create detailed video prompt
        const videoPrompt = `Create a ${parseDuration(scene.duration)}-second professional marketing video: ${scene.visual_description}. ${scene.on_screen_text ? `Display text: "${scene.on_screen_text}".` : ''} Cinematic, high quality, smooth camera movements.`;
        
        const response = await fetch('/api/veo-generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: videoPrompt,
            duration: parseDuration(scene.duration)
          })
        });

        const data = await response.json();
        
        if (data.success && data.videoUrl) {
          videos[scene.scene_number] = data.videoUrl;
          console.log('Veo video generated for scene', scene.scene_number);
        } else if (data.fallback) {
          console.log('Veo unavailable, using SVG fallback');
          setUseVeo(false);
          break;
        }
      }
      
      if (Object.keys(videos).length > 0) {
        setSceneVideos(videos);
        setVideosLoaded(true);
        console.log('All Veo videos generated:', Object.keys(videos).length, 'scenes');
      }
    } catch (error) {
      console.error('Error generating Veo videos:', error);
      setUseVeo(false);
    } finally {
      setLoadingVideos(false);
    }
  };

  const playScene = async (sceneIndex) => {
    const scene = scenes[sceneIndex];
    if (!scene) return;

    console.log('Playing scene', sceneIndex, 'muted:', isMuted);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const audioUrl = sceneAudios[scene.scene_number];
    console.log('Audio URL for scene', scene.scene_number, ':', audioUrl);
    
    if (audioUrl && !isMuted) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      audioRef.current = audio;
      
      audio.onended = () => {
        console.log('Audio ended for scene', sceneIndex);
        moveToNextScene();
      };

      audio.onerror = (e) => {
        console.error('Error playing audio:', e);
        // Move to next scene even if audio fails
        timeoutRef.current = setTimeout(() => moveToNextScene(), parseDuration(scene.duration) * 1000);
      };

      try {
        await audio.play();
        console.log('Audio playing for scene', sceneIndex);
      } catch (error) {
        console.error('Error playing audio:', error);
        // Move to next scene even if audio fails
        timeoutRef.current = setTimeout(() => moveToNextScene(), parseDuration(scene.duration) * 1000);
      }
    } else {
      // No audio or muted, just wait for scene duration
      console.log('No audio, waiting', parseDuration(scene.duration), 'seconds');
      timeoutRef.current = setTimeout(() => moveToNextScene(), parseDuration(scene.duration) * 1000);
    }

    // Start progress tracking
    startProgressTracking(scene.duration);
  };

  const parseDuration = (duration) => {
    // Parse duration like "8s", "10s", "5-8s", etc.
    const match = duration?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 5;
  };

  const startProgressTracking = (duration) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const durationMs = parseDuration(duration) * 1000;
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const sceneProgress = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(sceneProgress);

      if (sceneProgress >= 100) {
        clearInterval(progressIntervalRef.current);
      }
    }, 50);
  };

  const moveToNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Video finished
      handleStop();
    }
  };

  // Play scene when playing state or scene changes
  useEffect(() => {
    if (isPlaying && currentScene && audioLoaded) {
      playScene(currentSceneIndex);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentSceneIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePlay = async () => {
    // Generate audio first if not loaded
    if (!audioLoaded && !loadingAudio) {
      await generateAllSceneAudios();
    }
    // Generate videos if not loaded (Veo 3.1)
    if (!videosLoaded && !loadingVideos && useVeo) {
      await generateAllSceneVideos();
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentSceneIndex(0);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleDownload = () => {
    // Create a text file with the video script
    const scriptContent = `${storyboard.title}\n${productName}\n\n` +
      scenes.map((scene, idx) => 
        `Scene ${scene.scene_number} (${scene.duration})\n` +
        `Visual: ${scene.visual_description}\n` +
        `Voiceover: ${scene.voiceover}\n` +
        `On-screen: ${scene.on_screen_text || 'N/A'}\n\n`
      ).join('---\n\n');

    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName.replace(/[^a-z0-9]/gi, '_')}_video_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: storyboard.title,
      text: `Check out this ${productName} video campaign!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Successfully shared');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      // Ignore AbortError (user cancelled the share dialog)
      if (error.name === 'AbortError') {
        console.log('Share cancelled by user');
        return;
      }
      
      // Handle other errors
      if (error.name === 'NotAllowedError') {
        console.log('Share permission denied');
        return;
      }
      
      // For other errors, try clipboard fallback
      console.log('Share failed, trying clipboard fallback');
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  if (!currentScene) {
    return (
      <div className="campaign-card text-center py-12">
        <p className="text-white/50">No video storyboard available</p>
      </div>
    );
  }

  return (
    <div className="campaign-card">
      {/* Video Display Area */}
      <div className="relative rounded-lg overflow-hidden border border-dark-border bg-black mb-4">
        {/* 16:9 Video Canvas */}
        <div className="aspect-video relative">
          
          {/* Real Veo 3.1 Video (if available) */}
          {useVeo && sceneVideos[currentScene.scene_number] ? (
            <video
              ref={videoRef}
              src={sceneVideos[currentScene.scene_number]}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay={isPlaying}
              muted={isMuted}
              onEnded={() => moveToNextScene()}
            />
          ) : (
            <>
              {/* Fallback: SVG Scene Background */}
              <div 
                className="absolute inset-0 transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, 
                    ${getSceneColors(currentSceneIndex).bg1}, 
                    ${getSceneColors(currentSceneIndex).bg2})`,
                  opacity: isPlaying ? 1 : 0.7
                }}
              />
            </>
          )}
          
          {/* Scene Background (only for non-video mode) */}
          {!sceneVideos[currentScene.scene_number] && (
            <div 
              className="absolute inset-0 transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, 
                  ${getSceneColors(currentSceneIndex).bg1}, 
                  ${getSceneColors(currentSceneIndex).bg2})`,
                opacity: isPlaying ? 1 : 0.7
              }}
            />
          )}

          {/* Scene Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            {/* Scene Number Badge */}
            <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{currentScene.scene_number}</span>
            </div>

            {/* Duration Badge */}
            <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
              <span className="text-sm text-white/90">{currentScene.duration}</span>
            </div>

            {/* On-Screen Text */}
            {currentScene.on_screen_text && (
              <div className="mb-8 animate-fade-in">
                <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight">
                  {currentScene.on_screen_text}
                </h2>
              </div>
            )}

            {/* Visual Description */}
            <div className="max-w-2xl animate-fade-in-delay">
              <p className="text-lg text-white/80 leading-relaxed">
                {currentScene.visual_description}
              </p>
            </div>

            {/* Loading Audio Indicator */}
            {loadingAudio && (
              <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-full border border-primary/50">
                <div className="animate-spin w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full"></div>
                <span className="text-xs text-white/80">Loading audio...</span>
              </div>
            )}

            {/* Loading Veo 3.1 Video Indicator */}
            {loadingVideos && (
              <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-full border border-purple-500/50">
                <div className="animate-spin w-3 h-3 border-2 border-purple-500/20 border-t-purple-500 rounded-full"></div>
                <span className="text-xs text-white/80">Generating Veo 3.1 videos...</span>
              </div>
            )}
          </div>

          {/* Voiceover Subtitle */}
          {currentScene.voiceover && isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-center text-white/90 text-base md:text-lg drop-shadow-lg">
                {currentScene.voiceover}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              disabled={loadingAudio}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlay className="text-white ml-0.5" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center transition-all"
            >
              <FaPause className="text-white" />
            </button>
          )}

          {/* Stop Button */}
          <button
            onClick={handleStop}
            className="w-10 h-10 rounded-full bg-dark-border hover:bg-dark-hover flex items-center justify-center transition-all"
          >
            <FaStop className="text-white/70 text-sm" />
          </button>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-full bg-dark-border hover:bg-dark-hover flex items-center justify-center transition-all"
          >
            {isMuted ? (
              <FaVolumeMute className="text-white/70" />
            ) : (
              <FaVolumeUp className="text-white/70" />
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-dark-border mx-1"></div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-10 h-10 rounded-full bg-dark-border hover:bg-dark-hover flex items-center justify-center transition-all group"
            title="Download video script"
          >
            <FaDownload className="text-white/70 group-hover:text-primary transition-colors" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-dark-border hover:bg-dark-hover flex items-center justify-center transition-all group"
            title="Share to social media"
          >
            <FaShareAlt className="text-white/70 group-hover:text-primary transition-colors" />
          </button>
        </div>

        {/* Scene Counter */}
        <div className="text-sm text-white/50">
          Scene {currentSceneIndex + 1} of {scenes.length}
        </div>
      </div>

      {/* Product Title & Export Options */}
      <div className="border-t border-dark-border pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white/90">{storyboard.title}</h3>
            <p className="text-sm text-white/50">{productName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-dark-border hover:bg-dark-hover rounded-lg text-sm text-white/70 hover:text-white transition-all flex items-center gap-2"
            >
              <FaDownload className="w-3 h-3" />
              Export Script
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm text-white transition-all flex items-center gap-2"
            >
              <FaShareAlt className="w-3 h-3" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSceneColors(index) {
  const colorSchemes = [
    { bg1: '#1a1a2e', bg2: '#16213e' },
    { bg1: '#0f3460', bg2: '#16213e' },
    { bg1: '#1c1c1c', bg2: '#2d1b00' },
    { bg1: '#0a192f', bg2: '#172a45' },
    { bg1: '#1a1a1a', bg2: '#2d2d2d' }
  ];
  return colorSchemes[index % colorSchemes.length];
}
