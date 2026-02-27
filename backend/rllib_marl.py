import ray
from ray.tune.registry import register_env
from backend.vpp_env import VPPEnv
from ray.rllib.algorithms.ppo import PPOConfig
class MARLController:

    def __init__(self, n_homes=100):

        self.n_homes = n_homes
        self.algo = None   # lazy load later

        register_env(
            "vpp_env",
            lambda config: VPPEnv(config)
        )

        env = VPPEnv({"n_homes":n_homes})

        obs_space = next(iter(env.observation_spaces.values()))
        act_space = next(iter(env.action_spaces.values()))

        self.policies = {
            f"home_{i}":(
                None,
                obs_space,
                act_space,
                {}
            )
            for i in range(n_homes)
        }
        self.config = (
            PPOConfig()
        .environment(
            env=VPPEnv,
            env_config={"n_homes":n_homes}
        )
        .framework("tf2")
        .env_runners(
        num_env_runners=4,
            num_envs_per_env_runner=1
        )
        .multi_agent(
            policies=self.policies,
            policy_mapping_fn=lambda agent_id,*a:agent_id
        )
        )

    # 🔴 THIS WAS MISSING
    def init_model(self):

        if self.algo is None:

            print("Initializing PPO model...")

            self.algo = self.config.build()

            try:
                self.algo.restore("checkpoints/vpp_policy")
                print("Checkpoint loaded")
            except:
                print("No checkpoint found, running fresh")

    # 🔴 NEW RLlib 2.7 INFERENCE
    def get_actions(self, observations):

        self.init_model()

        result = self.algo.compute_actions(
            observations
        )

        return result[0]