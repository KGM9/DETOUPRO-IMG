from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove, new_session
import io
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialisation de la session IA ultra-légère
session = new_session("u2netp")

@app.route('/', methods=['GET'])
def health_check():
    # Route pour indiquer à Render que le serveur est bien vivant
    return "Serveur DétourPro Opérationnel", 200

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier détecté"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Fichier vide"}), 400

    try:
        input_bytes = file.read()
        output_bytes = remove(input_bytes, session=session)
        
        return send_file(
            io.BytesIO(output_bytes),
            mimetype='image/png',
            as_attachment=False
        )

    except Exception as e:
        print(f"Erreur interne : {str(e)}")
        return jsonify({"error": "Erreur serveur", "details": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
    
