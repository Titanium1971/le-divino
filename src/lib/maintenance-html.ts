export const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Site temporairement indisponible</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #0F0A0A;
    color: #FAF6F0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    line-height: 1.6;
  }
  .container {
    max-width: 560px;
    width: 100%;
    text-align: center;
  }
  .brand {
    color: #C5A55A;
    font-size: 32px;
    font-weight: 300;
    letter-spacing: 6px;
    margin-bottom: 8px;
  }
  .tagline {
    color: rgba(250, 246, 240, 0.6);
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 56px;
  }
  .divider {
    width: 60px;
    height: 1px;
    background: #C5A55A;
    margin: 0 auto 40px;
  }
  h1 {
    font-size: 22px;
    font-weight: 400;
    color: #FAF6F0;
    margin-bottom: 24px;
    letter-spacing: 0.5px;
  }
  p {
    color: rgba(250, 246, 240, 0.85);
    font-size: 15px;
    margin-bottom: 16px;
  }
  .contact {
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid rgba(197, 165, 90, 0.3);
  }
  .contact-label {
    color: rgba(250, 246, 240, 0.5);
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .contact-name {
    color: #C5A55A;
    font-size: 16px;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  .contact a {
    color: #FAF6F0;
    text-decoration: none;
    font-size: 14px;
    border-bottom: 1px solid rgba(197, 165, 90, 0.5);
    padding-bottom: 2px;
    transition: border-color 0.2s;
  }
  .contact a:hover {
    border-bottom-color: #C5A55A;
  }
  @media (max-width: 480px) {
    .brand { font-size: 24px; letter-spacing: 4px; }
    h1 { font-size: 18px; }
    p { font-size: 14px; }
  }
</style>
</head>
<body>
  <main class="container" role="main">
    <div class="brand">LE DIVINO</div>
    <div class="tagline">Cuisine traditionnelle française</div>

    <div class="divider"></div>

    <h1>Site temporairement indisponible</h1>
    <p>Pour toute question relative à ce site, merci de contacter le prestataire technique.</p>

    <div class="contact">
      <div class="contact-label">Prestataire technique</div>
      <div class="contact-name">CC Développement</div>
      <a href="mailto:canon@ccdeveloppement.eu">canon@ccdeveloppement.eu</a>
    </div>
  </main>
</body>
</html>`;
