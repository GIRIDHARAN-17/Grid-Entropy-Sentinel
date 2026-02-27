import logging
import numpy as np

logger = logging.getLogger(__name__)

class PatchTSTForecaster:
    """
    Forecasting grid load and solar generation using PatchTST time-series models.
    """
    def __init__(self, model_path=None):
        self.model_path = model_path
        logger.info("PatchTST Forecaster initialized.")

    def forecast_next_hour(self, current_data: dict) -> dict:
        """
        Uses the provided historical/current data to forecast the next 1 hour of load and generation.
        """
        # Placeholder for actual model inference
        # e.g. model.predict(current_data)
        logger.info("Running PatchTST inference on current grid data...")
        
        # Simulated forecast: adds a trend to the current data
        forecasted_load = sum(h.get("load_kw", 0) for h in current_data.values()) * 1.05
        forecasted_gen = sum(h.get("generation_kw", 0) for h in current_data.values()) * 0.95
        
        return {
            "predicted_load": round(forecasted_load, 2),
            "predicted_gen": round(forecasted_gen, 2),
            "confidence_interval": 0.95
        }
