export interface User {
  name: string;
  pin: string;
  role: 'admin' | 'pos';
}

const USERS: User[] = [
  { name: 'Noe', pin: '1234', role: 'admin' },
  { name: 'Mauricio', pin: '5678', role: 'admin' },
  { name: 'FK', pin: '0000', role: 'pos' },
];

export function authenticateUser(name: string, pin: string): User | null {
  return USERS.find(u => u.name === name && u.pin === pin) || null;
}

export function getUsers(): { name: string; role: string }[] {
  return USERS.map(u => ({ name: u.name, role: u.role }));
}

export function getUserFromRequest(request: Request): User | null {
  const userName = request.headers.get('x-user-name');
  const userPin = request.headers.get('x-user-pin');
  if (!userName || !userPin) return null;
  return authenticateUser(userName, userPin);
}

export function isAdmin(request: Request): boolean {
  const user = getUserFromRequest(request);
  return user?.role === 'admin';
}
