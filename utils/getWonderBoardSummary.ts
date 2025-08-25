export function getWonderBoardSummary(count: number): string {
  if (count === 0) {
    return '7 original wonder boards available';
  }
  return `${7 + count * 2} wonder boards available (7 base + ${count * 2} expansion${count > 1 ? 's' : ''})`;
}