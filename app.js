// URL de ton serveur final sur Render
const SERVEUR_URL = "https://detoupro-img.onrender.com";

const fileInput = document.getElementById('file-input');
const originalPreview = document.getElementById('original-preview');
const resultPreview = document.getElementById('result-preview');
const downloadBtn = document.getElementById('download-btn');
const loading = document.getElementById('loading');

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Réinitialisation de l'affichage
    originalPreview.src = URL.createObjectURL(file);
    originalPreview.classList.remove('hidden');
    resultPreview.classList.add('hidden');
    downloadBtn.classList.add('hidden');
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
            const url = URL.createObjectURL(blob);
            
            resultPreview.src = url;
            resultPreview.classList.remove('hidden');
            
            downloadBtn.href = url;
            downloadBtn.classList.remove('hidden');
        } else {
            alert("Erreur serveur. Veuillez réessayer.");
        }
    } catch (err) {
        alert("Erreur de connexion au serveur.");
    } finally {
        loading.classList.add('hidden');
    }
});
