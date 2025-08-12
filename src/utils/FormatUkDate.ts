export default function formatUkDate(date: string | Date | number): string {
  let d: Date;
  if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date);
  } else {
    d = date;
  }
  if (d instanceof Date && !isNaN(d.getTime())) {
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  return String(date);
}
