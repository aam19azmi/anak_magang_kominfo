# from flask import Flask, request, jsonify
# from sentence_transformers import SentenceTransformer, util
# import torch
# import json
# from flask_cors import CORS
# import logging
# from typing import List, Dict, Any
# import gspread
# from oauth2client.service_account import ServiceAccountCredentials

# # Setup basic logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Constants
# MODEL_NAME = "all-MiniLM-L6-v2"
# SIMILARITY_THRESHOLD = 0.6
# INTENTS_FILE = "intents.json"
# SPREADSHEET_NAME = "Data Peserta Magang"

# class ChatBot:
#     def __init__(self):
#         self.model = SentenceTransformer(MODEL_NAME)
#         self.intents = self._load_intents()
#         self.patterns, self.responses = self._prepare_training_data()
#         self.pattern_embeddings = self.model.encode(self.patterns, convert_to_tensor=True)

#     def _load_intents(self) -> List[Dict[str, Any]]:
#         try:
#             with open(INTENTS_FILE, "r", encoding="utf-8") as file:
#                 return json.load(file).get("intents", [])
#         except Exception as e:
#             logger.error(f"Error loading intents: {e}")
#             return []

#     def _prepare_training_data(self) -> tuple[List[str], List[str]]:
#         patterns = []
#         responses = []
#         for intent in self.intents:
#             for pattern in intent.get("patterns", []):
#                 patterns.append(pattern)
#                 responses.append(intent.get("response", ""))
#         return patterns, responses

#     def _read_participant_count(self, bidang: str) -> int:
#         try:
#             scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
#             creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
#             client = gspread.authorize(creds)
#             sheet = client.open(SPREADSHEET_NAME).sheet1
#             records = sheet.get_all_records()
#             count = sum(1 for row in records if str(row.get("bidang", "")).lower() == bidang.lower())
#             return count
#         except Exception as e:
#             logger.error(f"Error reading Google Sheet: {e}")
#             return -1

#     def get_best_response(self, user_input: str) -> str:
#         try:
#             if not user_input.strip():
#                 return "Silakan masukkan pertanyaan Anda."

#             if "jumlah peserta" in user_input.lower() and "bidang" in user_input.lower():
#                 bidang = user_input.lower().split("bidang")[-1].strip()
#                 jumlah = self._read_participant_count(bidang)
#                 if jumlah >= 0:
#                     return f"Jumlah peserta magang pada bidang {bidang} adalah {jumlah} orang."
#                 else:
#                     return "Maaf, saya tidak dapat mengambil data saat ini."

#             input_embedding = self.model.encode(user_input, convert_to_tensor=True)
#             cosine_scores = util.pytorch_cos_sim(input_embedding, self.pattern_embeddings)
#             best_match_idx = torch.argmax(cosine_scores).item()
#             best_score = cosine_scores[0][best_match_idx].item()

#             logger.info(f"Best match score: {best_score}")

#             if best_score >= SIMILARITY_THRESHOLD:
#                 return self.responses[best_match_idx]
#             else:
#                 return self._get_fallback_response()

#         except Exception as e:
#             logger.error(f"Error processing user input: {e}")
#             return "Maaf, terjadi kesalahan dalam memproses permintaan Anda."

#     def _get_fallback_response(self) -> str:
#         return "Maaf, saya tidak yakin dengan pertanyaan Anda. Bisakah Anda menjelaskan lebih lanjut?"

# # Initialize chatbot instance
# chatbot = ChatBot()

# @app.route("/chat", methods=["POST"])
# def chat_endpoint():
#     try:
#         data = request.get_json()
#         if not data or "message" not in data:
#             return jsonify({"error": "Invalid request format"}), 400

#         user_input = data["message"]
#         response = chatbot.get_best_response(user_input)

#         return jsonify({
#             "response": response,
#             "status": "success"
#         })

#     except Exception as e:
#         logger.error(f"Error in chat endpoint: {e}")
#         return jsonify({
#             "error": "Internal server error",
#             "status": "error"
#         }), 500

# if __name__ == "__main__":
#     logger.info("Starting chatbot server...")
#     from waitress import serve
#     serve(app, host="0.0.0.0", port=5000)


from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import torch
import json
from flask_cors import CORS
import logging
from typing import List, Dict, Any

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Constants
MODEL_NAME = "all-MiniLM-L6-v2"
SIMILARITY_THRESHOLD = 0.6
INTENTS_FILE = "intents.json"

class ChatBot:
    def __init__(self):
        self.model = SentenceTransformer(MODEL_NAME)
        self.intents = self._load_intents()
        self.patterns, self.responses = self._prepare_training_data()
        self.pattern_embeddings = self.model.encode(self.patterns, convert_to_tensor=True)
    
    def _load_intents(self) -> List[Dict[str, Any]]:
        """Load intents from JSON file with error handling"""
        try:
            with open(INTENTS_FILE, "r", encoding="utf-8") as file:
                return json.load(file).get("intents", [])
        except Exception as e:
            logger.error(f"Error loading intents: {e}")
            return []
    
    def _prepare_training_data(self) -> tuple[List[str], List[str]]:
        """Extract patterns and corresponding responses"""
        patterns = []
        responses = []
        
        for intent in self.intents:
            for pattern in intent.get("patterns", []):
                patterns.append(pattern)
                responses.append(intent.get("response", ""))
        
        return patterns, responses
    
    def get_best_response(self, user_input: str) -> str:
        """Find the most appropriate response for user input"""
        try:
            if not user_input.strip():
                return "Silakan masukkan pertanyaan Anda."
                
            input_embedding = self.model.encode(user_input, convert_to_tensor=True)
            cosine_scores = util.pytorch_cos_sim(input_embedding, self.pattern_embeddings)
            
            best_match_idx = torch.argmax(cosine_scores).item()
            best_score = cosine_scores[0][best_match_idx].item()
            
            logger.info(f"Best match score: {best_score}")
            
            if best_score >= SIMILARITY_THRESHOLD:
                return self.responses[best_match_idx]
            else:
                return self._get_fallback_response()
                
        except Exception as e:
            logger.error(f"Error processing user input: {e}")
            return "Maaf, terjadi kesalahan dalam memproses permintaan Anda."
    
    def _get_fallback_response(self) -> str:
        """Default response when no good match is found"""
        return "Maaf, saya tidak yakin dengan pertanyaan Anda. Bisakah Anda menjelaskan lebih lanjut?"

# Initialize chatbot instance
chatbot = ChatBot()

@app.route("/chat", methods=["POST"])
def chat_endpoint():
    """Handle chat requests"""
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "Invalid request format"}), 400
            
        user_input = data["message"]
        response = chatbot.get_best_response(user_input)
        
        return jsonify({
            "response": response,
            "status": "success"
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return jsonify({
            "error": "Internal server error",
            "status": "error"
        }), 500

if __name__ == "__main__":
    logger.info("Starting chatbot server...")
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)