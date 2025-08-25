export const neighbors = (seat: number, n: number) => {
  if (!Number.isInteger(seat) || !Number.isInteger(n)) {
    throw new Error('seat and n must be integers');
  }
  if (n <= 0) {
    throw new Error('number of players must be positive');
  }
  if (seat < 0 || seat >= n) {
    throw new Error('seat must be within range 0..n-1');
  }
  return {
    left: (seat - 1 + n) % n,
    right: (seat + 1) % n,
  };
};
