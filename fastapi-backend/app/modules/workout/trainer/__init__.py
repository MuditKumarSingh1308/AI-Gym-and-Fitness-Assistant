"""Reusable AI workout trainer components."""

from typing import TYPE_CHECKING

__all__ = ["WorkoutTrainerEngine"]

if TYPE_CHECKING:  # pragma: no cover
    from app.modules.workout.trainer.engine import WorkoutTrainerEngine


def __getattr__(name: str):
    if name == "WorkoutTrainerEngine":
        from app.modules.workout.trainer.engine import WorkoutTrainerEngine

        return WorkoutTrainerEngine
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
