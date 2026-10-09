/**
 * Currency formatting utility for ResQFood
 * Uses Intl.NumberFormat with 'en-IN' and 'ta-IN' locales and INR currency.
 * Outputs consistent 'Rs. ' prefix with Indian numbering system.
 */
export function formatRupees(amount: number, language: string = 'en'): string {
  const locale = language === 'ta' ? 'ta-IN' : 'en-IN';
  const val = Math.round(Number(amount) || 0);
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  const numFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  const formatted = numFormatter.format(absVal);
  // Clean currency symbols (₹, INR, etc.) to keep consistent 'Rs. ' style
  const cleanNumber = formatted.replace(/[^\d,]/g, '').trim();

  return isNegative ? `-Rs. ${cleanNumber}` : `Rs. ${cleanNumber}`;
}

export default formatRupees;
