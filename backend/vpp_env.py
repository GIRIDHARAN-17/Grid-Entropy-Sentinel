from ray.rllib.env.multi_agent_env import MultiAgentEnv
from gymnasium.spaces import Box
import numpy as np

class VPPEnv(MultiAgentEnv):

    def __init__(self, config=None):

        self.n_homes = config.get("n_homes",100)

        obs_space = Box(
            low=np.array([49,0,0,0]),
            high=np.array([51,10,5,1]),
            dtype=np.float32
        )

        act_space = Box(
            low=np.array([0,0,-1]),
            high=np.array([1,1,1]),
            dtype=np.float32
        )

        self._agent_ids = {
            f"home_{i}" for i in range(self.n_homes)
        }

        self.observation_spaces = {
            agent:obs_space
            for agent in self._agent_ids
        }

        self.action_spaces = {
            agent:act_space
            for agent in self._agent_ids
        }

        self.H=5
        self.freq=50

        self.reset()

    def reset(self,*,seed=None,options=None):

        self.freq=50

        self.homes={
            agent:{
                "load":np.random.uniform(3,6),
                "pv":np.random.uniform(0,3),
                "soc":np.random.uniform(0.4,0.9)
            }
            for agent in self._agent_ids
        }

        obs={
            agent:np.array([
                self.freq,
                h["load"],
                h["pv"],
                h["soc"]
            ],dtype=np.float32)
            for agent,h in self.homes.items()
        }

        return obs,{}

    def step(self,actions):

        total_load=0
        total_pv=0

        for agent,action in actions.items():

            ev,ac,battery=action
            home=self.homes[agent]

            home["load"]+=ev*0.5
            home["load"]-=ac*0.3
            home["soc"]-=battery*0.01

            total_load+=home["load"]
            total_pv+=home["pv"]

        Pm=total_pv
        Pe=total_load
        self.freq+=(Pm-Pe)/(2*self.H)

        obs,rewards,dones,infos={},{},{},{}

        for agent in self._agent_ids:

            h=self.homes[agent]

            obs[agent]=np.array([
                self.freq,
                h["load"],
                h["pv"],
                h["soc"]
            ],dtype=np.float32)

            rewards[agent]=-(self.freq-50)**2
            dones[agent]=False
            infos[agent]={}

        dones["__all__"]=False

        return obs,rewards,dones,infos