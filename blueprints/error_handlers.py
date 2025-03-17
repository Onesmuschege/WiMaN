from flask import jsonify
from werkzeug.exceptions import HTTPException
import logging

logger = logging.getLogger(__name__)
def handle_generic_error(error):
    """Handles all unexpected errors and logs them"""
    logging.error(f"Unhandled Error: {error}")  # Save error to wiman.log

    response = {
        "error": "Internal Server Error",
        "message": "Something went wrong, please try again later."
    }
    return jsonify(response), 500


def handle_http_error(error):
    """Handles known HTTP errors"""
    if error.code == 404:
        logging.info(f"404 Not Found: {error.description}")  # Keep as INFO
    elif error.code == 500:
        logging.error(f"500 Internal Server Error: {error.description}")  # Log as ERROR
    else:
        logging.warning(f"HTTP Error {error.code}: {error.description}")  # Log others as WARNING

    response = {
        "error": error.name,
        "message": error.description
    }
    return jsonify(response), error.code


def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(error):
        logger.error(f"404 Error: {error}")  # Log the error
        return jsonify({"error": "Not Found", "message": "The requested URL was not found on the server."}), 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 Error: {error}", exc_info=True)  # Log full traceback
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500