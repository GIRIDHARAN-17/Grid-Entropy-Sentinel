import asyncio
import json
import random
import logging
from paho.mqtt.client import Client, CallbackAPIVersion
import os

logger = logging.getLogger(__name__)

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))

# Callback functions
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        logger.info(f"Connected to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
        client.subscribe("vpp/control/#")
    else:
        logger.error(f"Failed to connect to MQTT, return code: {rc}")

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload = json.loads(msg.payload.decode())
        logger.info(f"Received MQTT message on {topic}: {payload}")
        # In a real setup, parse the command for specific agents
    except json.JSONDecodeError:
         logger.warning("Failed to decode MQTT message payload.")

class MQTTHub:
    """
    Manages telemetry from and actuation commands to the 100 smart homes.
    """
    def __init__(self, broker: str = MQTT_BROKER, port: int = MQTT_PORT):
        self.client = Client(CallbackAPIVersion.VERSION2, "vpp_backend_mqtt", clean_session=True)
        self.broker = broker
        self.port = port
        self.client.on_connect = on_connect
        self.client.on_message = on_message
        self.homes_state = {f"home_{i}": self._generate_random_home_state() for i in range(100)}
        self.running = False

    def connect(self):
        try:
            self.client.connect(self.broker, self.port, 60)
            self.client.loop_start()
            self.running = True
            logger.info("MQTTHub started.")
        except Exception as e:
            logger.error(f"Failed to start MQTTHub: {e}")

    def disconnect(self):
         if self.running:
             self.client.loop_stop()
             self.client.disconnect()
             self.running = False

    def _generate_random_home_state(self):
        """Simulate initial state of a smart home."""
        return {
            "load_kw": round(random.uniform(0.5, 5.0), 2),
            "generation_kw": round(random.uniform(0.0, 3.0), 2),  # e.g., Solar panels
            "battery_soc": round(random.uniform(20.0, 100.0), 1)  # State of Charge %
        }

    async def poll_homes(self) -> dict:
        """
        In a real scenario, this would wait for telemetry. 
        Here, we slightly permute internal state as a simulation.
        """
        for home_id, state in self.homes_state.items():
             # Add slight noise to simulate natural load variation
             state["load_kw"] = max(0.0, round(state["load_kw"] + random.uniform(-0.1, 0.1), 2))
             state["generation_kw"] = max(0.0, round(state["generation_kw"] + random.uniform(-0.05, 0.05), 2))
             
             # Example: Publish telemetry to MQTT broker
             payload = json.dumps(state)
             self.client.publish(f"vpp/telemetry/{home_id}", payload)
             
        return self.homes_state

    def send_control_commands(self, actions: dict):
        """
        Sends multi-agent RL control actions to the individual smart homes.
        """
        for home_id, action in actions.items():
            payload = json.dumps({"agent_id": home_id, "action": int(action)})
            self.client.publish(f"vpp/control/{home_id}", payload)
