export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || !/^[0-9a-zA-Z]+$/.test(id)) {
    return res.status(400).send('ID invalido');
  }

  const url = `http://camaras.vigo.org/webcam/camv2.php?id=${id}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Referer': 'http://hoxe.vigo.org/conecenos/trafico.php?lang=cas',
        'Origin': 'http://hoxe.vigo.org',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).send(`Error ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).send('Timeout');
    }
    console.error('Proxy error:', err.message);
    res.status(500).send('Error de proxy');
  }
}
