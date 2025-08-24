export const neighbors = (seat: number, n: number) => ({
  left: (seat - 1 + n) % n,
  right: (seat + 1) % n,
})