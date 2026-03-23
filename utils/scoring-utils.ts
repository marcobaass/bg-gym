export function pointsFromEquityDiff(bestEquity: number, userEquity: number): number {
    const equityDiff = Math.abs(bestEquity - userEquity);
  
    if (equityDiff <= 0.02) {
      return 6;
    } else if (equityDiff < 0.08) {
      return 3;
    } else {
      return 1;
    }
  }