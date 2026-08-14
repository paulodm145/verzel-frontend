import type { ValidationResultKind } from "../types";

/**
 * Vibração e som na confirmação (06.6) — opcionais e degradando em
 * silêncio: `navigator.vibrate` não existe em desktop, e `AudioContext`
 * pode ser bloqueado por política de autoplay. Nenhum dos dois pode
 * quebrar o fluxo de validação se falhar.
 *
 * Som gerado por osciladores do Web Audio, não um arquivo de áudio — evita
 * carregar um asset binário só para três bipes, e o tom muda com o
 * resultado sem precisar de múltiplos arquivos.
 */
const VIBRATION_PATTERN: Record<ValidationResultKind, number[]> = {
  VALID: [80],
  ALREADY_USED: [80, 60, 80],
  WRONG_EVENT: [80, 60, 80],
  INVALID: [200, 80, 200],
};

const TONE_FREQUENCY_HZ: Record<ValidationResultKind, number> = {
  VALID: 880,
  ALREADY_USED: 440,
  WRONG_EVENT: 440,
  INVALID: 220,
};

export function playResultFeedback(result: ValidationResultKind, soundEnabled: boolean): void {
  vibrate(result);
  if (soundEnabled) playTone(result);
}

function vibrate(result: ValidationResultKind): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(VIBRATION_PATTERN[result]);
  } catch {
    // Degrada em silêncio — vibração é reforço, não parte crítica do fluxo.
  }
}

function playTone(result: ValidationResultKind): void {
  if (typeof window === "undefined") return;
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = TONE_FREQUENCY_HZ[result];
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.15, context.currentTime);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);
    oscillator.onended = () => void context.close();
  } catch {
    // Autoplay bloqueado ou contexto indisponível — som é reforço, não
    // parte crítica do fluxo.
  }
}
