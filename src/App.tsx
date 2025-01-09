import axios, { AxiosError } from 'axios';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useScriptLoader } from './hook/useScriptLoader';
import { renderCaptcha, RendererCaptchaOptions } from './lib/captcha';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const getWhoami = () => client.get('/whoami');

const REQUEST_LIMIT= 1000;

export type Form = {
  num: number;
};

export default function App() {
  useScriptLoader(import.meta.env.VITE_INTEGRATION_URL);

  const ref = useRef<HTMLDivElement | null>(null);
  const { register, handleSubmit, formState } = useForm<Form>();
  const [forbiddenCount, setForbiddenCount] = useState(0);
  const [captchaDisplay, setCaptchaDisplay] = useState(false);

  const displayCaptcha = (options?: RendererCaptchaOptions) => {
    if(!ref.current) return;
    if(ref.current.children.length == 0){
      const subContainer = document.createElement("div");
      ref.current.appendChild(subContainer);
      renderCaptcha(subContainer, import.meta.env.VITE_API_KEY, options);
      setCaptchaDisplay(true);
    }
  }

  const removeCaptcha = () => {
    if(!ref.current || ref.current.children.length === 0) return;
    ref.current.children.item(0)?.remove();
    setCaptchaDisplay(false);
  }

  const sendRequests = async (total: number) => {
    if (total <= 0 || total > REQUEST_LIMIT) return;
    const interval = setInterval(() => {
      if(forbiddenCount >= total){
        clearInterval(interval);
        return;
      }

      getWhoami()
        .catch((error: AxiosError) => {
          switch (error.status) {
            case 403: {
              setForbiddenCount(prev => prev + 1);
              break;
            }
            case 405: {
              clearInterval(interval);
              const resetRequests = () => {
                removeCaptcha();
                const remainingRequest = total - forbiddenCount;
                sendRequests(remainingRequest);
              }
              displayCaptcha({ onSuccess: resetRequests });
              break;
            }
            default: throw error;
          }
        })
    }, 1000);
  };

  const submitRequestCount = (form: Form) => sendRequests(form.num);

  return (
    <div>
      {!formState.isSubmitSuccessful && (
        <form onSubmit={handleSubmit(submitRequestCount)}>
          <input
            placeholder="Enter request count"
            {...register('num', { required: true, valueAsNumber: true })}
          />
          <button type="submit">
            Submitteo
          </button>
        </form>
      )}

      {
        !captchaDisplay && Array(forbiddenCount)
          .fill('Forbidden')
          .map((msg, i) => <div key={i}>{i}. {msg}</div>)
      }

      <div
        ref={ref}
        id="captcha_container"
        style={captchaDisplay ? undefined : { display: 'none' }}
      ></div>
    </div>
  );
}
