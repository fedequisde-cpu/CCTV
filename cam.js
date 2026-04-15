export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || !/^[0-9a-zA-Z]+$/.test(id)) {
    return res.status(400).send('ID inválido');
  }

  const url = `http://camaras.vigo.org/webcam/camv2.php?id=${id}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VigoProxy/1.0)',
        'Referer': 'http://hoxe.vigo.org/',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('Error al obtener imagen');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).send('Error de proxy');
  }
}
