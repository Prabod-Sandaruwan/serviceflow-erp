const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertGroup(n: number): string {
  let s = '';
  if (n >= 100) {
    s += ONES[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    s += TENS[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    s += ONES[n] + ' ';
  }
  return s.trim();
}

export function numberToWords(amount: number | string, currency = 'US Dollars'): string {
  const num = Math.abs(Number(amount) || 0);
  const dollars = Math.floor(num);
  const cents = Math.round((num - dollars) * 100);

  if (dollars === 0 && cents === 0) return `Zero ${currency} and Zero Cents Only`;

  const scales = ['', 'Thousand', 'Million', 'Billion'];
  let current = dollars;
  let scaleIdx = 0;
  const parts: string[] = [];

  while (current > 0 && scaleIdx < scales.length) {
    const chunk = current % 1000;
    if (chunk > 0) {
      const chunkStr = convertGroup(chunk);
      const scaleStr = scales[scaleIdx] ? ' ' + scales[scaleIdx] : '';
      parts.unshift(chunkStr + scaleStr);
    }
    current = Math.floor(current / 1000);
    scaleIdx++;
  }

  const dollarsText = parts.length > 0 ? parts.join(' ') : 'Zero';
  const centsText = cents > 0 ? `${cents} Cents` : 'Zero Cents';
  return `${dollarsText} ${currency} and ${centsText} Only`;
}
