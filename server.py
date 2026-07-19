from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import requests
import io
from datetime import date

app = Flask(__name__)
CORS(app)

# Sécurité financière : 100 requêtes max par jour pour rester à 0$ de frais
LIMIT_PAR_JOUR = 100
compteur_du_jour = 0
derniere_date = date.today()

# Moteur d'IA gratuit Cloud de Hugging Face
API_URL = "https://api-inference.huggingface.co/models/briaai/RMBG-1.4"

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    global compteur_du_jour, derniere_date
    
    if date.today() != derniere_date:
        compteur_du_jour = 0
        derniere_date = date.today()
        
    if compteur_du_jour >= LIMIT_PAR_JOUR:
        return jsonify({"message": "Le quota gratuit d'aujourd'hui est épuisé. Reviens demain !"}), 429

    if 'file' not in request.files: 
        return jsonify({"error": "Aucun fichier détecté"}), 400
    try:
        # Envoi de la requête avec un en-tête qui aide l'API à mieux traiter l'image
        headers = {"Content-Type": "application/octet-stream"}
        response = requests.post(API_URL, headers=headers, data=request.files['file'].read(), timeout=60)
        
        if response.status_code == 200:
            compteur_du_jour += 1
            return send_file(io.BytesIO(response.content), mimetype='image/png')
        else:
            # On renvoie l'erreur réelle pour comprendre pourquoi ça bloque
            return jsonify({"error": f"Erreur IA: {response.status_code}", "details": response.text}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
