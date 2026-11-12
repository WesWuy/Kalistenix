// Capture the session for each request so an account switch cannot change its owner.
export function trainingApi(client, url, key, request = fetch) {
  async function call(userId, path, options = {}) {
    const { data: { session }, error } = await client.auth.getSession();
    if (error || session?.user.id !== userId) throw new Error('Please sign in again');
    const response = await request(`${url}/rest/v1/${path}`, {
      ...options,
      headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    const body = await response.json();
    if (!response.ok) throw Object.assign(new Error('Cloud request failed'), { code: body.code });
    return body;
  }
  return {
    async read(userId) {
      const rows = await call(userId, `training_data?user_id=eq.${encodeURIComponent(userId)}&select=data,revision`);
      if (!Array.isArray(rows) || rows.length > 1) throw new Error('Invalid cloud response');
      return rows[0] || null;
    },
    async write(userId, revision, data) {
      const result = await call(userId, 'rpc/save_training_data', {
        method: 'POST', body: JSON.stringify({ expected_revision: revision, payload: data }),
      });
      if (!Number.isSafeInteger(result) || result !== revision + 1) throw new Error('Invalid cloud revision');
      return result;
    },
  };
}
