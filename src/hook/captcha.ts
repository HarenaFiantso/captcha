import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import {
  createAxiosInterceptor,
  loadScript,
  renderCaptcha,
  removeScript,
  RendererCaptchaOptions,
} from '../lib/captcha';

export function useScriptLoader(integration_url: string) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadScript(integration_url)
      .then(() => setError(null))
      .catch(setError);
    return removeScript;
  }, [integration_url]);

  return {
    error,
    success: error === null,
  };
}

export type AutoCaptchaOptions = {
  api_key: string;
  integration_url: string;
  container: HTMLElement | null;
  cross_domain_request?: boolean;
  render_options?: Omit<RendererCaptchaOptions, 'onError' | 'onSuccess'>;
};

export function useAutoCaptcha(client: AxiosInstance, options: AutoCaptchaOptions) {
  const { error: script_error } = useScriptLoader(options.integration_url);

  useEffect(() => {
    if (script_error) return;

    return createAxiosInterceptor(
      client,
      () => {
        return new Promise<string>((resolve, reject) => {
          if (options.container === null) {
            return reject(new Error('container is null'));
          }

          renderCaptcha(options.container, options.api_key, {
            onSuccess: resolve,
            onError: reject,
            ...options.render_options,
          });
        });
      },
      {
        cross_domain_request: options.cross_domain_request,
      },
    );
  }, [client, options, script_error]);
}
