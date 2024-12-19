import axios, {AxiosError} from 'axios';
import {useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useScriptLoader} from './hook/captcha';
import {renderCaptcha} from './lib/captcha';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export type Form = {
    num: number;
};

export default function App() {
    useScriptLoader(import.meta.env.VITE_INTEGRATION_URL);

    const captchaContainerRef = useRef<HTMLDivElement | null>(null);
    const {register, handleSubmit, formState} = useForm<Form>();
    const [messages, setMessages] = useState<number[]>([]);
    const [lastStop, setLastStop] = useState(0);

    /**
     * Sends a GET request to the `/whoami` endpoint.
     * Handles specific status codes (e.g., 403).
     */
    const sendWhoami = async (index: number): Promise<void> => {
        try {
            const response = await client.get('/whoami');
            console.log(response);
        } catch (error) {
            const axiosError = error as AxiosError;

            if (axiosError.response?.status === 403) {
                // If 403 Forbidden, add to the message list
                setMessages((prev) => [...prev, index]);
            } else {
                throw error;
            }
        }
    };

    /**
     * Triggers the captcha rendering and resumes requests after successful captcha resolution.
     */
    const displayCaptcha = () => {
        renderCaptcha(captchaContainerRef.current!, import.meta.env.VITE_API_KEY, {
            onSuccess: async () => {
                // Continue sending requests after captcha resolution
                await sendRequests(lastStop);
            },
        });
    };

    /**
     * Sends multiple requests to `/whoami` endpoint at regular intervals (1 second).
     * Stops on reaching the total or a 405 error (Captcha trigger).
     */
    const sendRequests = async (total: number) => {
        if (total <= 0 || total > 1000) return;

        let currentIndex = lastStop;

        const interval = setInterval(async () => {
            try {
                await sendWhoami(currentIndex);

                if (currentIndex >= total) {
                    clearInterval(interval);
                }

                currentIndex++;
            } catch (error) {
                const axiosError = error as AxiosError;

                if (axiosError.response?.status === 405) {
                    // Captcha required, stop the interval and display captcha
                    clearInterval(interval);
                    setLastStop(currentIndex);
                    displayCaptcha();
                }
            }
        }, 1000);
    };

    /**
     * Form submission handler.
     * Triggers the request sending process.
     */
    const submitCount = async (form: Form) => {
        await sendRequests(form.num);
    };

    return (
        <div>
            {formState.isSubmitSuccessful ? (
                // Display the forbidden messages list once the form is submitted
                messages.map((msg) => <div key={msg}>{msg}. Forbidden</div>)
            ) : (
                // Render the form for user input
                <form onSubmit={handleSubmit(submitCount)}>
                    <input
                        {...register('num', {required: true, valueAsNumber: true})}
                        type="number"
                        placeholder="Enter a number"
                    />
                    <button type="submit">Submit</button>
                </form>
            )}

            {/* Captcha container */}
            <div id="captcha_container" ref={captchaContainerRef}></div>
        </div>
    );
}