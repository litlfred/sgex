/**
 * Video Processing Service
 * Optimizes videos for GitHub Pages hosting with MP4 format and lightweight controls
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VideoProcessor {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'tutorials');
    this.tempDir = path.join(process.cwd(), 'temp-video');
    this.ensureDirectoriesExist();
  }

  /**
   * Ensure output directories exist
   */
  ensureDirectoriesExist() {
    [this.outputDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Convert video to MP4 format optimized for web hosting
   */
  async convertToOptimizedMP4(inputVideoPath, outputPath, options = {}) {
    const {
      width = 1366,
      height = 768,
      fps = 30,
      bitrate = '2000k',
      audioCodec = 'aac',
      videoCodec = 'libx264'
    } = options;

    console.log(`🎬 Converting ${path.basename(inputVideoPath)} to optimized MP4...`);

    const ffmpegCommand = [
      'ffmpeg',
      '-y', // Overwrite output files
      `-i "${inputVideoPath}"`,
      `-c:v ${videoCodec}`,
      `-c:a ${audioCodec}`,
      `-b:v ${bitrate}`,
      `-r ${fps}`,
      `-vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2"`,
      '-movflags +faststart', // Optimize for streaming
      '-preset medium', // Balance between compression and speed
      '-profile:v baseline', // Maximum compatibility
      '-level 3.0',
      '-pix_fmt yuv420p', // Maximum compatibility
      `"${outputPath}"`
    ].join(' ');

    try {
      execSync(ffmpegCommand, { stdio: 'inherit' });
      console.log(`  ✅ Converted to: ${path.basename(outputPath)}`);
      return outputPath;
    } catch (error) {
      console.error(`  ❌ Failed to convert video: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add audio track to video
   */
  async addAudioToVideo(videoPath, audioPath, outputPath, options = {}) {
    const {
      audioDelay = 0,
      audioVolume = 1.0,
      videoCodec = 'libx264',
      audioCodec = 'aac'
    } = options;

    console.log(`🎵 Adding audio track to ${path.basename(videoPath)}...`);

    const ffmpegCommand = [
      'ffmpeg',
      '-y',
      `-i "${videoPath}"`,
      `-i "${audioPath}"`,
      `-c:v ${videoCodec}`,
      `-c:a ${audioCodec}`,
      `-filter:a "volume=${audioVolume},adelay=${audioDelay * 1000}|${audioDelay * 1000}"`,
      '-shortest', // End when shortest input ends
      '-preset medium',
      '-movflags +faststart',
      `"${outputPath}"`
    ].join(' ');

    try {
      execSync(ffmpegCommand, { stdio: 'inherit' });
      console.log(`  ✅ Audio added to: ${path.basename(outputPath)}`);
      return outputPath;
    } catch (error) {
      console.error(`  ❌ Failed to add audio: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate subtitle file (SRT) from narrations
   */
  generateSubtitles(narrations, outputPath, options = {}) {
    const {
      startTime = 0,
      defaultDuration = 3000
    } = options;

    console.log(`📝 Generating subtitles: ${path.basename(outputPath)}`);

    let srtContent = '';
    let currentTime = startTime;

    narrations.forEach((narration, index) => {
      const startTimeStr = this.millisecondsToSRT(currentTime);
      const endTime = currentTime + (narration.duration || defaultDuration);
      const endTimeStr = this.millisecondsToSRT(endTime);

      srtContent += `${index + 1}\n`;
      srtContent += `${startTimeStr} --> ${endTimeStr}\n`;
      srtContent += `${narration.text}\n\n`;

      currentTime = endTime + 500; // 500ms gap between subtitles
    });

    fs.writeFileSync(outputPath, srtContent, 'utf8');
    console.log(`  ✅ Subtitles generated: ${path.basename(outputPath)}`);
    return outputPath;
  }

  /**
   * Convert milliseconds to SRT time format (HH:MM:SS,mmm)
   */
  millisecondsToSRT(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  /**
   * Create HTML video player with lightweight controls
   */
  generateVideoPlayerHTML(videoPath, subtitlePath = null, options = {}) {
    const {
      title = 'SGEX Tutorial',
      width = 1366,
      height = 768,
      autoplay = false,
      muted = true,
      controls = true
    } = options;

    const videoFileName = path.basename(videoPath);
    const subtitleFileName = subtitlePath ? path.basename(subtitlePath) : null;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }
        .video-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
            max-width: 100%;
        }
        video {
            width: 100%;
            max-width: ${width}px;
            height: auto;
            border-radius: 4px;
        }
        .video-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #333;
            text-align: center;
        }
        .video-controls {
            margin-top: 16px;
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .control-button {
            padding: 8px 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }
        .control-button:hover {
            background: #f0f0f0;
            border-color: #ccc;
        }
        .control-button.active {
            background: #0066cc;
            color: white;
            border-color: #0066cc;
        }
        @media (max-width: 768px) {
            .video-container {
                margin: 10px;
                padding: 16px;
            }
            .video-title {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="video-container">
        <div class="video-title">${title}</div>
        <video 
            id="tutorialVideo"
            ${controls ? 'controls' : ''}
            ${muted ? 'muted' : ''}
            ${autoplay ? 'autoplay' : ''}
            preload="metadata"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui' font-size='24' fill='%23666' text-anchor='middle' dy='0.3em'%3EClick to play tutorial%3C/text%3E%3C/svg%3E"
        >
            <source src="${videoFileName}" type="video/mp4">
            ${subtitleFileName ? `<track kind="subtitles" src="${subtitleFileName}" srclang="en" label="English" default>` : ''}
            Your browser does not support the video tag.
        </video>
        <div class="video-controls">
            <button class="control-button" onclick="toggleMute()">🔊 Toggle Audio</button>
            <button class="control-button" onclick="toggleSubtitles()">📝 Toggle Subtitles</button>
            <button class="control-button" onclick="changeSpeed(0.5)">0.5x</button>
            <button class="control-button active" onclick="changeSpeed(1)">1x</button>
            <button class="control-button" onclick="changeSpeed(1.5)">1.5x</button>
            <button class="control-button" onclick="changeSpeed(2)">2x</button>
        </div>
    </div>

    <script>
        const video = document.getElementById('tutorialVideo');
        
        function toggleMute() {
            video.muted = !video.muted;
            updateButtonText();
        }
        
        function toggleSubtitles() {
            const tracks = video.textTracks;
            if (tracks.length > 0) {
                const track = tracks[0];
                track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
            }
        }
        
        function changeSpeed(speed) {
            video.playbackRate = speed;
            document.querySelectorAll('.control-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }
        
        function updateButtonText() {
            const muteBtn = document.querySelector('.control-button');
            muteBtn.textContent = video.muted ? '🔇 Unmute' : '🔊 Mute';
        }
        
        // Initialize
        updateButtonText();
    </script>
</body>
</html>`;

    const htmlPath = videoPath.replace(/\.[^.]+$/, '.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`  ✅ Video player generated: ${path.basename(htmlPath)}`);
    return htmlPath;
  }

  /**
   * Process a complete tutorial (video + audio + subtitles)
   */
  async processTutorial(rawVideoPath, audioPath, narrations, featureName, language = 'en', options = {}) {
    const outputDir = path.join(this.outputDir, featureName, language);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const videoWithAudio = path.join(this.tempDir, `${featureName}-${language}-with-audio.mp4`);
    const finalVideo = path.join(outputDir, `${featureName}-${language}.mp4`);
    const subtitleFile = path.join(outputDir, `${featureName}-${language}.srt`);
    const htmlFile = path.join(outputDir, `${featureName}-${language}.html`);

    try {
      // Step 1: Add audio to video
      if (audioPath && fs.existsSync(audioPath)) {
        await this.addAudioToVideo(rawVideoPath, audioPath, videoWithAudio, options);
      } else {
        // Just copy the original video if no audio
        fs.copyFileSync(rawVideoPath, videoWithAudio);
      }

      // Step 2: Convert to optimized MP4
      await this.convertToOptimizedMP4(videoWithAudio, finalVideo, options);

      // Step 3: Generate subtitles
      if (narrations && narrations.length > 0) {
        this.generateSubtitles(narrations, subtitleFile, options);
      }

      // Step 4: Generate HTML player
      const title = `SGEX Tutorial: ${featureName.replace(/-/g, ' ')} (${language.toUpperCase()})`;
      this.generateVideoPlayerHTML(finalVideo, subtitleFile, { ...options, title });

      // Clean up temp files
      if (fs.existsSync(videoWithAudio)) {
        fs.unlinkSync(videoWithAudio);
      }

      console.log(`✅ Tutorial processed: ${featureName} (${language})`);
      return {
        video: finalVideo,
        subtitles: subtitleFile,
        html: htmlFile
      };

    } catch (error) {
      console.error(`❌ Failed to process tutorial ${featureName} (${language}):`, error.message);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   */
  cleanup() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }
}

module.exports = VideoProcessor;