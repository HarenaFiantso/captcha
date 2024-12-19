import React, {useState} from 'react';

const App = () => {
    const [inputValue, setInputValue] = useState<number | ''>('');
    const [sequence, setSequence] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof inputValue !== 'number' || inputValue < 1 || inputValue > 1000) {
            alert('Veuillez entrer un nombre valide entre 1 et 1000.');
            return;
        }

        setSequence([]);
        setLoading(true);

        for (let i = 1; i <= inputValue; i++) {
            try {
                const line = await fetchData(i);
                setSequence((prev) => [...prev, line]);
                await delay(1000);
            } catch (error) {
                console.error('Erreur lors de l\'appel API', error);
                setSequence((prev) => [...prev, `${i}. Erreur`]);
            }
        }

        setLoading(false);
    };

    const fetchData = async (index: number): Promise<string> => {
        try {
            const response = await fetch('https://api.prod.jcloudify.com/whoami', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({requestId: index}),
            });

            if (response.status === 403) {
                await handleCaptcha();
                return `${index}. Forbidden (Après Captcha)`;
            }

            if (response.ok) {
                return `${index}. Forbidden`;
            }

            return `${index}. Erreur (${response.status})`;
        } catch (error) {
            console.error('Erreur réseau :', error);
            throw new Error('API Fail');
        }
    };

    const handleCaptcha = (): Promise<void> => {
        return new Promise((resolve) => {
            window.document.addEventListener('captcha-resolved', () => resolve(), {once: true});

            console.log('Captcha demandé : Résolvez le Captcha pour continuer...');
        });
    };

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    return (
        <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
            <h1>Application Séquence AWS WAF</h1>
            {!loading ? (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="numberInput">
                        Entrez un nombre entre 1 et 1000 :
                    </label>
                    <input
                        id="numberInput"
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(Number(e.target.value))}
                        min="1"
                        max="1000"
                        required
                    />
                    <button type="submit">Soumettre</button>
                </form>
            ) : (
                <p>Chargement...</p>
            )}

            <div style={{marginTop: '20px'}}>
                {sequence.map((line, index) => (
                    <div key={index}>{line}</div>
                ))}
            </div>
        </div>
    );
};

export default App;