import numpy as np

class SwingEquation:
    """
    Simulates the grid frequency using the Swing Equation:
    M * d(Δf)/dt + D * Δf = ΔP

    Where:
    - M is the inertia constant (grid inertia)
    - D is the load damping coefficient
    - Δf is the frequency deviation from nominal (f - f_nominal)
    - ΔP is the power mismatch (P_generation - P_load)
    """

    def __init__(self, f_nominal=50.0, inertia=0.1, damping=0.05, dt=0.1):
        self.f_nominal = f_nominal
        self.inertia = inertia
        self.damping = damping
        self.dt = dt
        self.current_frequency = f_nominal

    def step(self, power_generation: float, power_load: float) -> float:
        """
        Calculates the new grid frequency after one time step based on the given power generation and load.
        """
        # Calculate power mismatch (ΔP)
        delta_p = power_generation - power_load
        
        # Calculate frequency deviation (Δf)
        delta_f = self.current_frequency - self.f_nominal
        
        # Swing equation: d(Δf)/dt = (ΔP - D * Δf) / M
        rate_of_change = (delta_p - self.damping * delta_f) / self.inertia
        
        # Update current frequency using Euler integration: f_new = f_current + d(Δf)/dt * dt
        self.current_frequency += rate_of_change * self.dt
        
        # Return the new frequency, bounded slightly to avoid extreme numerical issues
        self.current_frequency = np.clip(self.current_frequency, 45.0, 55.0)
        
        return float(self.current_frequency)

    def reset(self):
        """Resets the frequency to nominal."""
        self.current_frequency = self.f_nominal
        return float(self.current_frequency)
