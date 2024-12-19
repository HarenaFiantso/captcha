const SCRIPT_ID = 'aws_waf_captcha_integration_url';

export function loadScript(integrationUrl: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (document.getElementById(SCRIPT_ID)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        Object.assign(script, {
            id: SCRIPT_ID,
            async: false,
            src: integrationUrl,
            type: 'text/javascript',
        });

        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load AWS WAF CDN API'));

        document.head.appendChild(script);
    });
}

export function removeScript(): void {
    const script = document.getElementById(SCRIPT_ID);
    if (script) {
        script.onload = null;
        script.onerror = null;
        script.remove();
    }
}