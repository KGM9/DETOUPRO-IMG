from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove, new_session
import io
import os

app = Flask(__name__)
# Autoriser les requêtes CORS depuis ta PWA GitHub Pages
CORS(app, resources={r"/*": {"origins": "*"}})

# Charger le modèle IA ultra-léger en mémoire locale
# u2netp est optimisé pour les serveurs gratuits à mémoire limitée
session = new_session("u2netp")

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier détecté"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nom de fichier vide"}), 400

    try:
        # 1. Lecture directe des données de l'image
        input_bytes = file.read()
        
        # 2. Détourage IA exécuté en LOCAL sur ton serveur Python (Pas d'Internet / Pas de DNS)
        output_bytes = remove(input_bytes, session=session)
        
        # 3. Renvoi direct du PNG détouré
        return send_file(
            io.BytesIO(output_bytes),
            mimetype='image/png',
            as_attachment=False
        )

    except Exception as e:
        print(f"Erreur interne : {str(e)}")
        return jsonify({"error": "Erreur lors du traitement local", "details": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
    
