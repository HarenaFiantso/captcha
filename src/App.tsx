import axios, {AxiosError} from 'axios';
import {useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useScriptLoader} from './hook/captcha';
import {renderCaptcha} from './lib/captcha';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

export type Form = {
    num: number;
}

export default function App() {
    useScriptLoader(import.meta.env.VITE_INTEGRATION_URL);

    const ref = useRef<HTMLDivElement | null>(null);

    const {register, handleSubmit, formState} = useForm<Form>();
    const [messages, setMessage] = useState<number[]>([]);
    const [last_stop, setStop] = useState(0);

    const sendWhoami = async (i: number) => {
        try {
            const response = await client.get('/whoami');
            console.log(response);
        } catch (e) {
            const error = e as AxiosError;
            if (error.status === 403) {
                setMessage(prev => prev.concat(i));
            } else {
                throw e;
            }
        }
    }

    const displayCaptcha = () => {
        renderCaptcha(ref.current!, import.meta.env.VITE_API_KEY, {
            onSuccess: async () => {
                await sendRequests(last_stop);
            }
        });
    }

    const sendRequests = async (total: number) => {
        if (total <= 0 || total > 1000) return;
        let i = last_stop;
        const interval = setInterval(() => {
            sendWhoami(i)
                .catch((error: AxiosError) => {
                    if (error.status === 405) {
                        displayCaptcha();
                        setStop(i);
                        clearInterval(interval);
                    }
                });
            if (i >= total) {
                clearInterval(interval);
                return;
            }
            i++;
        }, 1000);
    }

    const submitCount = async (form: Form) => {
        return sendRequests(form.num);
    }

    return (
        <div>
            {
                formState.isSubmitSuccessful
                    ? messages.map(v => <div key={v}>{v}. Forbidden</div>)
                    : (
                        <form onSubmit={handleSubmit(submitCount)}>
                            <input {...register(
                                'num',
                                {required: true, valueAsNumber: true}
                            )}
                            />
                            <button type="submit">Submit</button>
                        </form>
                    )
            }
            <div id="captcha_container" ref={ref}></div>
        </div>
    );
}
