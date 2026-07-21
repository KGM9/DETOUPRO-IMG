from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import requests
import io
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

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
        
        response = requests.post(API_URL, headers=headers, data=image_bytes, timeout=60)
        
        if response.status_code == 200:
            return send_file(
                io.BytesIO(response.content),
                mimetype='image/png',
                as_attachment=False
            )
        else:
            # Récupération du vrai texte d'erreur de Hugging Face pour l'envoyer au client
            try:
                hf_error = response.json().get("error", "L'IA refuse de répondre.")
            except:
                hf_error = f"Code retour API global : {response.status_code}"
            return jsonify({"error": "Erreur API Hugging Face", "details": hf_error}), 500

    except requests.exceptions.Timeout:
        return jsonify({"error": "Délai expiré", "details": "L'IA a mis trop de temps à répondre (Timeout)."}), 504
    except Exception as e:
        return jsonify({"error": "Erreur interne", "details": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)