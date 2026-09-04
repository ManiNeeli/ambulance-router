/**
 * Browser AudioContext Emergency Siren Synthesizer & Speech Guidance
 */

let audioCtx = null;
let sirenOsc = null;
let sirenGain = null;
let sirenInterval = null;

export function playSirenSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (sirenOsc) return; // already playing

    sirenOsc = audioCtx.createOscillator();
    sirenGain = audioCtx.createGain();

    sirenOsc.type = 'sawtooth';
    sirenGain.gain.setValueAtTime(0.08, audioCtx.currentTime); // gentle volume

    sirenOsc.connect(sirenGain);
    sirenGain.connect(audioCtx.destination);
    sirenOsc.start();

    // Two-tone European / US EMS wail: 650Hz to 950Hz oscillation
    let high = false;
    sirenOsc.frequency.setValueAtTime(650, audioCtx.currentTime);
    sirenInterval = setInterval(() => {
      if (!audioCtx || !sirenOsc) return;
      high = !high;
      const targetFreq = high ? 950 : 650;
      sirenOsc.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.35);
    }, 450);
  } catch (err) {
    console.warn("AudioContext error:", err);
  }
}

export function stopSirenSound() {
  try {
    if (sirenInterval) {
      clearInterval(sirenInterval);
      sirenInterval = null;
    }
    if (sirenOsc) {
      sirenOsc.stop();
      sirenOsc.disconnect();
      sirenOsc = null;
    }
  } catch (err) {
    console.warn("Error stopping siren:", err);
  }
}

export function speakDispatch(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // cancel prior utterances
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
}
