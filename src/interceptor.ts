import { AxiosError, AxiosInstance } from 'axios';

declare class AwsWafIntegration {
  public static getToken(): Promise<string>;
}

function captchaRequired(error: AxiosError): boolean {
  return (
    error.response?.status === 405 &&
    error.response?.headers?.['x-amzn-waf-action'] === 'captcha'
  );
}

export type InterceptorOptions = {
  cross_domain_request?: boolean;
};

export function createAxiosInterceptor(
  client: AxiosInstance,
  onCaptchaRequired: () => Promise<void | string /* token */> | void,
  options: InterceptorOptions = {},
): () => void {
  const res_id = client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (captchaRequired(error)) {
        const value = await onCaptchaRequired();
        if (typeof value !== 'undefined' && value !== null) {
          error.config!.headers['x-aws-waf-token'] = value;
        }
        return client.request(error.config!);
      }
      return Promise.reject(error);
    },
  );

  const req_id = client.interceptors.request.use(async (config) => {
    if (options.cross_domain_request) {
      config.headers['x-aws-waf-token'] = await AwsWafIntegration.getToken();
    }
    return config;
  }, Promise.reject);

  return () => {
    client.interceptors.request.eject(req_id);
    client.interceptors.response.eject(res_id);
  };
}
