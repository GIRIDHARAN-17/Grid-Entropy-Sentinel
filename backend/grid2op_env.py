import grid2op
from grid2op.Parameters import Parameters
import logging

logger = logging.getLogger(__name__)

class Grid2OpEnvWrapper:
    """
    Optional fallback grid simulation using Grid2Op.
    Grid2Op focuses on dispatching energy across an L2EO grid, simulating thermal lines and load flows.
    """
    def __init__(self, env_name="rte_case5_example"):
        self.env_name = env_name
        self.env = None
        self.obs = None
        self.reward = None
        self.done = False
        self.info = None

    def make_env(self):
        """Initializes the Grid2Op environment."""
        try:
            param = Parameters()
            param.HARD_OVERFLOW_THRESHOLD = 5.0
            self.env = grid2op.make(self.env_name, param=param)
            logger.info("Grid2Op environment initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Grid2Op environment: {e}")

    def reset(self):
        """Resets the state of the grid."""
        if self.env is None:
             raise ValueError("Grid2Op Environment has not been initialized.")
        try:
             self.obs = self.env.reset()
             logger.info("Grid2Op simulation reset.")
             return self.obs
        except Exception as e:
             logger.error(f"Error resetting Grid2Op environment: {e}")
             return None

    def step(self, action=None):
        """Steps through the Grid2Op environment."""
        if self.env is None:
            raise ValueError("Grid2Op Environment has not been initialized.")
        
        # If no specific action, 'do nothing' action is used
        if action is None:
             action = self.env.action_space({})
             
        self.obs, self.reward, self.done, self.info = self.env.step(action)
        return {"obs": self.obs, "reward": self.reward, "done": self.done, "info": self.info}

    def close(self):
         """Closes the environment and releases resources."""
         if self.env:
             self.env.close()
             self.env = None
             logger.info("Grid2Op environment closed.")
