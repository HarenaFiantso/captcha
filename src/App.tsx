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

        setSequence([]); // Reset the sequence
        setLoading(true);

        for (let i = 1; i <= inputValue; i++) {
            try {
                const line = await fetchData(i);
                setSequence((prev) => [...prev, line]);
                await delay(1000); // Pause de 1 seconde entre chaque requête
            } catch (error) {
                console.error('Erreur lors de l\'appel API', error);
                setSequence((prev) => [...prev, `${i}. Erreur`]);
            }
        }

        setLoading(false);
    };

    const fetchData = async (index: number): Promise<string> => {
        try {
            const response = await fetch('https://api.prod.jcloudify.com/whoami');
            if (response.status === 403) {
                // WAF Captcha peut apparaître ici
                await handleCaptcha();
                return `${index}. Forbidden (Après Captcha)`;
            }
            return `${index}. Forbidden`;
        } catch (error) {
            console.error('Erreur réseau', error);
            throw new Error('API Fail');
        }
    };

    const handleCaptcha = (): Promise<void> => {
        return new Promise((resolve) => {
            // Le script Captcha AWS est inclus dans le index.html (WAF JS SDK)
            window.document.addEventListener('captcha-resolved', () => resolve(), {once: true});

            // Simuler l'ouverture du captcha
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