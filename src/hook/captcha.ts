import { useEffect, useState } from 'react';
import { loadScript, removeScript } from '../lib/captcha';

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
