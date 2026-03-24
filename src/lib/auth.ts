export function validateAdminPin(pin: string): boolean {
  const adminPin = process.env.ADMIN_PIN || '1234';
  return pin === adminPin;
}

export function isAdminRequest(request: Request): boolean {
  const headerPin = request.headers.get('x-admin-pin');
  if (headerPin && validateAdminPin(headerPin)) {
    return true;
  }

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'admin_pin' && validateAdminPin(value)) {
        return true;
      }
    }
  }

  return false;
}
