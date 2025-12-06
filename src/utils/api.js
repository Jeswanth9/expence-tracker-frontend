export async function apiFetch(url, options = {}, onLogout) {
    const res = await fetch(url, options);
    let body = null;
    try { body = await res.json(); } catch (err) { /* ignore json parse errors */ }

    if (body && body.msg === 'Token has expired') {
        if (typeof onLogout === 'function') {
            try { onLogout(); } catch (err) { /* ignore */ }
        }
    }

    return { res, body };
}
