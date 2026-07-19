// Configuration de l'URL de production sur Render
const SERVEUR_URL = "https://detoupro-img.onrender.com/remove-bg";

// Capture de tous les éléments du DOM
const fileInput = document.getElementById('file-input');
const originalPreview = document.getElementById('original-preview');
const resultPreview = document.getElementById('result-preview');
const downloadBtn = document.getElementById('download-btn');
const loading = document.getElementById('loading');
const adContainer = document.getElementById('ad-container');

// Déclencheur principal lors du choix de l'image
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Affichage immédiat de l'image originale de l'utilisateur
    const originalUrl = URL.createObjectURL(file);
    originalPreview.src = originalUrl;
    originalPreview.classList.remove('hidden');

    // Réinitialisation des états précédents pour un nouveau traitement
    resultPreview.classList.add('hidden');
    downloadBtn.classList.add('hidden');
    adContainer.classList.add('hidden');
    
    // Activation de l'état de chargement
    loading.classList.remove('hidden');

    // Préparation des données binaires pour l'envoi
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Envoi de la requête réseau vers l'API du serveur Render
        const response = await fetch(SERVEUR_URL, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Récupération de l'image binaire retournée par l'IA
            const blob = await response.blob();
            const resultUrl = URL.createObjectURL(blob);
            
            // Affichage du résultat détouré
            resultPreview.src = resultUrl;
            resultPreview.classList.remove('hidden');
            
            // RÈGLE : Activation automatique de la publicité avant accès au téléchargement
            adContainer.classList.remove('hidden');
            
            // Configuration du bouton de téléchargement final
            downloadBtn.href = resultUrl;
            downloadBtn.classList.remove('hidden');
        } else {
            alert("Le serveur de détourage a rencontré une erreur interne (Code " + response.status + ").");
        }
    } catch (error) {
        console.error("Erreur réseau rencontrée :", error);
        alert("Impossible de communiquer avec le serveur Render. Vérifiez votre connexion.");
    } finally {
        // Désactivation de l'animation de chargement dans tous les cas
        loading.classList.add('hidden');
    }
});