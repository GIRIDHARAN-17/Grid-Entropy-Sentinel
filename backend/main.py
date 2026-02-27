import asyncio
import logging
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from backend.database import Database
from backend.swing_equation import SwingEquation
from backend.homes_mqtt import MQTTHub
from backend.rllib_marl import MARLController
from backend.featherless_client import FeatherlessClient
from backend.grid2op_env import Grid2OpEnvWrapper

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

# Global instances
mqtt_hub = MQTTHub()
swing_eq = SwingEquation()
marl_controller = None  # To be init on startup
featherless_client = FeatherlessClient()
grid_fallback = Grid2OpEnvWrapper()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Failed to send to websocket: {e}")

manager = ConnectionManager()
state_store = {
    "use_featherless": False,
    "current_freq": 50.0,
    "grid2op_fallback_active": False
}

async def orchestration_loop():
    """Main VPP control loop running at fixed intervals."""
    while True:
        try:
            # 1. Gather Telemetry (Simulated or Real from MQTT)
            homes_state = await mqtt_hub.poll_homes()
            
            # Aggregate Power Mismatch
            total_load = sum(h["load_kw"] for h in homes_state.values())
            total_gen = sum(h["generation_kw"] for h in homes_state.values())

            # 2. Physics Simulation: Update Frequency using Swing Equation
            new_freq = swing_eq.step(power_generation=total_gen, power_load=total_load)
            state_store["current_freq"] = new_freq

            # Formulate observations for MARL
            observations = {}
            for home_id, state in homes_state.items():
                observations[home_id] = [new_freq, state["load_kw"], state["generation_kw"]]

            # 3. Decision Making: MARL or Featherless Inference
            if state_store["use_featherless"]:
                actions_dict = featherless_client.infer_action(observations)
            else:
                actions_dict = marl_controller.get_actions(observations)

            # 4. Actuation
            mqtt_hub.send_control_commands(actions_dict)

            # 5. Persistence
            grid_snapshot = {
                "frequency": new_freq,
                "total_load": total_load,
                "total_generation": total_gen,
                "actions": {k: int(v) for k, v in actions_dict.items()},
                "use_featherless": state_store["use_featherless"]
            }
            await Database.save_state("grid_snapshots", grid_snapshot)

            # 6. WebSocket Update Frontend
            await manager.broadcast({
                "type": "GRID_UPDATE",
                "frequency": grid_snapshot["frequency"],
                "total_load": grid_snapshot["total_load"],
                "total_generation": grid_snapshot["total_generation"],
                "sample_actions": dict(list(grid_snapshot["actions"].items())[:5]) # just a sample
            })

        except Exception as e:
             logger.error(f"Error in orchestration loop: {e}", exc_info=True)
             
        await asyncio.sleep(1.0) # 1 second control interval


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Events
    logger.info("Initializing Backend Services...")
    await Database.connect()
    mqtt_hub.connect()
    
    global marl_controller
    marl_controller = MARLController(n_homes=100)
    
    # Start the orchestration loop
    task = asyncio.create_task(orchestration_loop())
    logger.info("Orchestration loop started.")
    
    yield
    
    # Shutdown Events
    logger.info("Shutting down Backend Services...")
    task.cancel()
    mqtt_hub.disconnect()
    await Database.close()

app = FastAPI(title="AI-Driven VPP Orchestrator", lifespan=lifespan)

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "Backend Active"}

@app.post("/api/toggle_inference")
async def toggle_inference(request: Request):
    data = await request.json()
    use_featherless = data.get("use_featherless", False)
    state_store["use_featherless"] = use_featherless
    return {"status": "success", "use_featherless": use_featherless}

@app.post("/api/toggle_grid2op")
async def toggle_grid2op(request: Request):
    """Activates Grid2Op as optional fallback."""
    data = await request.json()
    activate = data.get("activate", False)
    state_store["grid2op_fallback_active"] = activate
    
    if activate and grid_fallback.env is None:
        grid_fallback.make_env()
        grid_fallback.reset()
    elif not activate and grid_fallback.env is not None:
        grid_fallback.close()
        
    return {"status": "success", "grid2op_fallback": activate}

@app.websocket("/ws/grid")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
             # Keep connection alive, listen for client pings/commands if needed
             data = await websocket.receive_text()
             pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
