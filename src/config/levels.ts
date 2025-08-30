export const XP = {
  minPerMsg: 15,          // losowo za wiadomość: min
  maxPerMsg: 25,          // losowo za wiadomość: max
  cooldownSec: 60,        // anti-spam: 1 nagroda na X sekund
};

// krzywa expu: ile XP potrzeba na poziom N (sumarycznie rośnie ~kwadratowo)
export function xpForLevel(level: number) {
  return Math.floor(5 * level * level + 50 * level + 100);
}
