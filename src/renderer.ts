declare type AwsWafCaptchaOptions = {
    apiKey: string;
    onLoad?: () => void;
    onSuccess?: (token: string) => void;
    onError?: (error: unknown) => void;
    onPuzzleTimeout?: () => void;
    onPuzzleIncorrect?: () => void;
    onPuzzleCorrect?: () => void;
};

declare class AwsWafCaptcha {
    public static renderCaptcha(
        container: HTMLElement,
        options: AwsWafCaptchaOptions,
    ): void;
}

export type RendererCaptchaOptions = Omit<AwsWafCaptchaOptions, 'apiKey'>;

export function renderCaptcha(
    container: HTMLElement,
    api_key: string,
    options: RendererCaptchaOptions = {},
) {
    if (!('AwsWafCaptcha' in window))
        throw new Error('AwsWafCaptcha is not defined. Could not render captcha');
    AwsWafCaptcha.renderCaptcha(container, {
        apiKey: api_key,
        ...options,
    });
}
