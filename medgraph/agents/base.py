import time
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class BaseAgent:
    """Base class for all specialized MedGraph clinical agents."""
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Executes the agent logic on the shared workflow state."""
        start_time = time.time()
        logger.info("Executing Agent: %s (%s)", self.name, self.role)
        try:
            result = self.run(state)
            duration_ms = round((time.time() - start_time) * 1000, 2)
            result["latency_ms"] = duration_ms
            logger.info("Completed Agent: %s in %s ms", self.name, duration_ms)
            return result
        except Exception as e:
            logger.error("Error running agent %s: %s", self.name, e, exc_info=True)
            duration_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "error": str(e),
                "status": "failed",
                "latency_ms": duration_ms
            }

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Override this method in subclasses."""
        raise NotImplementedError
