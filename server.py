from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import requests
import io
import os

app = Flask(__name__)
# Autoriser toutes les origines pour faciliter la connexion depuis ton site local vers Render
CORS(app)

# Point de terminaison de l'IA Hugging Face
API_URL = "https://api-inference.huggingface.co/models/briaai/RMBG-1.4"

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier envoyé"}), 400
    
    try:
        # En-tête requis pour l'API
        headers = {"Content-Type": "application/octet-stream"}
        image_data = request.files['file'].read()
        
        # Envoi de la requête à l'IA avec un délai étendu (60s)
        response = requests.post(API_URL, headers=headers, data=image_data, timeout=60)
        
        if response.status_code == 200:
            return send_file(io.BytesIO(response.content), mimetype='image/png')
        else:
            return jsonify({"error": f"Erreur API IA: {response.status_code}"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Render utilise souvent le port 10000 ou celui défini par la variable d'environnement PORT
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
