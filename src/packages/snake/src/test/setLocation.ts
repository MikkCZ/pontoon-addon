export function setLocation(fullUrl: string, locationFields = {}): void {
  Object.defineProperty(window, 'location', {
    value: new URL(fullUrl),
  });
  for (const [field, value] of Object.entries(locationFields)) {
    Object.defineProperty(window.location, field, { value });
  }
}
