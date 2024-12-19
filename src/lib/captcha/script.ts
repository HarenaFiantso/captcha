export function loadScript(integration_url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const id = 'aws_waf_captcha_integration_url';
    if (document.getElementById(id)) return resolve();

    const script = document.createElement('script');
    script.id = id;
    script.async = false;
    script.src = integration_url;
    script.type = 'text/javascript';
    document.head.appendChild(script);

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load aws waf cdn api'));
  });
}

export function removeScript() {
  const script = document.getElementById('aws_waf_captcha_integration_url');
  if (script) {
    script.onload = null;
    script.onerror = null;
    script.remove();
  }
}
