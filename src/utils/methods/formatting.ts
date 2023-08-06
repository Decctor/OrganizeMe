export function formatDate(value: any) {
  return new Date(value).toISOString().slice(0, 10);
}
