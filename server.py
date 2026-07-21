from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import requests
import io
import os
import time

app = Flask(__name__)
# Activation globale de CORS pour autoriser la PWA
CORS(app, resources={r"/*": {"origins": "*"}})

# Endpoint officiel de l'IA de détourage
API_URL = "https://api-inference.huggingface.co/models/briaai/RMBG-1.4"

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier détecté dans la requête"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Le nom du fichier est vide"}), 400

    try:
        image_bytes = file.read()
        
        headers = {
            "Content-Type": "application/octet-stream"
        }
        
        # Prise en charge d'un jeton Hugging Face s'il est configuré dans Render
        hf_token = os.environ.get("HF_TOKEN")
        if hf_token:
            headers["Authorization"] = f"Bearer {hf_token}"

        # Système de boucles de réessai (3 tentatives) pour contourner les erreurs DNS/Réseau temporaires
        max_retries = 3
        response = None
        
        for attempt in range(max_retries):
            try:
                response = requests.post(API_URL, headers=headers, data=image_bytes, timeout=60)
                if response.status_code == 200:
                    break
            except requests.exceptions.RequestException as req_err:
                if attempt == max_retries - 1:
                    raise req_err
                time.sleep(2)  # Pause de 2 secondes avant la tentative suivante

        if response and response.status_code == 200:
            return send_file(
                io.BytesIO(response.content),
                mimetype='image/png',
                as_attachment=False
            )
        else:
            try:
                hf_error = response.json().get("error", "L'IA ne répond pas correctement.")
            except:
                hf_error = f"Erreur API IA (Code HTTP {response.status_code if response else 'Inconnu'})"
            return jsonify({"error": "Erreur API Hugging Face", "details": hf_error}), 500

    except requests.exceptions.Timeout:
        return jsonify({"error": "Délai expiré", "details": "L'IA a mis trop de temps à répondre (Timeout)."}), 504
    except Exception as e:
        return jsonify({"error": "Erreur de connexion réseau du serveur", "details": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
    
