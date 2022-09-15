export function generateUUID(): string {
  return (window.crypto as any).randomUUID()
}
