"""ML utilities for habit and workout adherence prediction."""

from typing import TYPE_CHECKING

__all__ = ["WorkoutSkipPredictor"]

if TYPE_CHECKING:  # pragma: no cover
    from app.modules.habits.ml.skip_workout_model import WorkoutSkipPredictor


def __getattr__(name: str):
    if name == "WorkoutSkipPredictor":
        from app.modules.habits.ml.skip_workout_model import WorkoutSkipPredictor

        return WorkoutSkipPredictor
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
