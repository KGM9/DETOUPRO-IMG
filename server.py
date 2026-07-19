from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import requests
import io
import os

app = Flask(__name__)

# Activation complète du CORS pour autoriser les requêtes provenant de tous types d'appareils (locaux ou distants)
CORS(app, resources={r"/*": {"origins": "*"}})

# Lien vers le moteur d'IA gratuit Cloud de Hugging Face
API_URL = "https://api-inference.huggingface.co/models/briaai/RMBG-1.4"

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    # Vérification de sécurité de la présence du fichier dans la requête
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier détecté dans la requête"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Le nom du fichier est vide"}), 400

    try:
        # Lecture des octets bruts de l'image envoyée par le client
        image_bytes = file.read()
        
        # Configuration des en-têtes requis pour transmettre des données binaires à Hugging Face
        headers = {
            "Content-Type": "application/octet-stream"
        }
        
        # Envoi direct vers l'API de traitement par IA avec une attente maximale de 60 secondes
        response = requests.post(API_URL, headers=headers, data=image_bytes, timeout=60)
        
        # Si l'IA répond avec succès, on renvoie directement le fichier binaire au format PNG
        if response.status_code == 200:
            return send_file(
                io.BytesIO(response.content),
                mimetype='image/png',
                as_attachment=False
            )
        else:
            return jsonify({
                "error": "L'API de l'IA est actuellement saturée ou indisponible",
                "status_code": response.status_code
            }), 500

    except requests.exceptions.Timeout:
        return jsonify({"error": "Le délai de traitement de la requête a expiré (Timeout)"}), 504
    except Exception as e:
        return jsonify({"error": "Erreur interne du serveur", "details": str(e)}), 500

if __name__ == '__main__':
    # Configuration dynamique du port requise par la plateforme Render
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)