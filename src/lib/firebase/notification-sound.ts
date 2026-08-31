let audioContext: AudioContext | null = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext()
  }

  return audioContext
}

export function playNotificationSound() {
  try {
    const context = getAudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(880, context.currentTime)
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45)

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.45)
  } catch {
    // Ignore browsers that block audio without a user gesture.
  }
}
