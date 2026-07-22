const SERVEUR_URL = "https://detoupro-img.onrender.com";

const fileInput = document.getElementById('file-input');
const originalPreview = document.getElementById('original-preview');
const resultPreview = document.getElementById('result-preview');
const downloadBtn = document.getElementById('download-btn');
const loading = document.getElementById('loading');
const adContainer = document.getElementById('ad-container');

// Fonction pour redimensionner l'image sur le téléphone avant envoi
function redimensionnerImage(file, maxDimension = 1080) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.85);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Affichage immédiat de la source
    originalPreview.src = URL.createObjectURL(file);
    originalPreview.classList.remove('hidden');

    resultPreview.classList.add('hidden');
    downloadBtn.classList.add('hidden');
    adContainer.classList.add('hidden');
    
    // Message de chargement
    loading.textContent = "Optimisation de la photo...";
    loading.classList.remove('hidden');

    try {
        // Step 1: Réduction de l'image côté client (évite le plantage serveur)
        const imageOptimisee = await redimensionnerImage(file);

        loading.textContent = "L'IA détoure votre image (Patientez)...";

        const formData = new FormData();
        formData.append('file', imageOptimisee, 'image.jpg');

        // Step 2: Envoi avec Timeout de sécurité
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 sec max

        const response = await fetch(SERVEUR_URL, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const blob = await response.blob();
            const resultUrl = URL.createObjectURL(blob);
            
            resultPreview.src = resultUrl;
            resultPreview.classList.remove('hidden');
            
            adContainer.classList.remove('hidden');
            
            downloadBtn.href = resultUrl;
            downloadBtn.classList.remove('hidden');
        } else {
            alert("Le serveur est en train de se réveiller ou a rencontré une erreur. Réessayez dans 10 secondes.");
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            alert("Le traitement a pris trop de temps. Le serveur Render était probablement endormi, réessayez maintenant !");
        } else {
            alert("Erreur de connexion au serveur. Assurez-vous d'avoir Internet.");
        }
    } finally {
        loading.classList.add('hidden');
    }
});
