export function saveSession(user: { _id: string; fullName: string; username: string }) {
  localStorage.setItem('skillswap_user', JSON.stringify(user));
}

export function getSession() {
  const data = localStorage.getItem('skillswap_user');
  if (!data) return null;
  return JSON.parse(data);
}

export function clearSession() {
  localStorage.removeItem('skillswap_user');
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('skillswap_user');
}