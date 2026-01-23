export function validatePassword(password: string | null): boolean {
  if (!password) return false;
  return password === process.env.ACCESS_PASSWORD;
}
