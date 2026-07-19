// Enregistrement du Service Worker pour la PWA mobile
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { 
    navigator.serviceWorker.register('./sw.js'); 
  });
}

const fileInput = document.getElementById('file-input');
const originalPreview = document.getElementById('original-preview');
const resultPreview = document.getElementById('result-preview');
const downloadBtn = document.getElementById('download-btn');
const bonusAdBtn = document.getElementById('bonus-ad-btn');
const loading = document.getElementById('loading');
const quotaAlert = document.getElementById('quota-alert');
const adContainer = document.getElementById('ad-container-web');

// URL de ton serveur Python final sur Render
const SERVEUR_URL = "https://ton-serveur-python.onrender.com/remove-bg";

// --- ZONE PUBLICITAIRE PRÉPARÉE (AUTOMATIQUE APRÈS DÉTOURAGE) ---
function AfficherPubliciteAutomatique() {
    console.log("Logique activée : Lancement de la publicité obligatoire.");
    
    // -------------------------------------------------------------
    // AU MOMENT VENU, COLLES LE SCRIPT DE TA RÉGIE JUSTE EN DESSOUS :
    // Exemple de ce que tu mettras :
    // const script = document.createElement('script');
    // script.src = "https://site-de-la-regie.com/ton-code-interstitiel.js";
    // adContainer.appendChild(script);
    // -------------------------------------------------------------
}

// Bouton Bonus Volontaire
bonusAdBtn.addEventListener('click', () => {
    alert("Merci de soutenir l'application ! Chargement de la vidéo...");
});

// Événement principal de détourage
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    originalPreview.src = URL.createObjectURL(file);
    originalPreview.classList.remove('hidden');
    loading.classList.remove('hidden');
    resultPreview.classList.add('hidden');
    downloadBtn.classList.add('disabled');
    quotaAlert.classList.add('hidden');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(SERVEUR_URL, { 
            method: 'POST', 
            body: formData 
        });

        if (response.ok) {
            // LA TRANSFORMATION EST RÉUSSIE : LA PUB SE LANCE DIRECTEMENT ICI
            AfficherPubliciteAutomatique();

            const blob = await response.blob();
            const resultUrl = URL.createObjectURL(blob);
            resultPreview.src = resultUrl;
            resultPreview.classList.remove('hidden');
            downloadBtn.href = resultUrl;
            downloadBtn.classList.remove('disabled');
        } else {
            const data = await response.json();
            quotaAlert.textContent = data.message || "Quota épuisé.";
            quotaAlert.classList.remove('hidden');
        }
    } catch (e) {
        quotaAlert.textContent = "Erreur de connexion au serveur.";
        quotaAlert.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
});