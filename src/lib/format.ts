export function formatPrice(value: number) {
  return `PKR ${new Intl.NumberFormat('en-PK').format(value)}`;
}
export function formatShopDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    timeZone: 'Asia/Karachi',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
