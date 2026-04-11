export async function loginRequest(payload) {
  const res = await fetch('/api/v1/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : { message: await res.text() };

  if (!res.ok) {
  throw new Error(data?.message || 'Login failed');
  }

  return data;
  }
