const SERVEUR_URL = "https://detoupro-img.onrender.com";

const fileInput = document.getElementById('file-input');
const originalPreview = document.getElementById('original-preview');
const resultPreview = document.getElementById('result-preview');
const downloadBtn = document.getElementById('download-btn');
const loading = document.getElementById('loading');
const adContainer = document.getElementById('ad-container');

fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const originalUrl = URL.createObjectURL(file);
    originalPreview.src = originalUrl;
    originalPreview.classList.remove('hidden');

    resultPreview.classList.add('hidden');
    downloadBtn.classList.add('hidden');
    adContainer.classList.add('hidden');
    loading.classList.remove('hidden');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(SERVEUR_URL, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const resultUrl = URL.createObjectURL(blob);
            
            resultPreview.src = resultUrl;
            resultPreview.classList.remove('hidden');
            
            adContainer.classList.remove('hidden');
            
            downloadBtn.href = resultUrl;
            downloadBtn.classList.remove('hidden');
        } else {
            // Extraction de l'erreur réelle renvoyée par le serveur Python
            const errorData = await response.json().catch(() => ({}));
            const messageErreur = errorData.details || errorData.error || "Une erreur inconnue est survenue.";
            alert("Erreur de l'IA : " + messageErreur);
        }
    } catch (error) {
        alert("Impossible de communiquer avec le serveur Render. Vérifiez votre connexion.");
    } finally {
        loading.classList.add('hidden');
    }
});
