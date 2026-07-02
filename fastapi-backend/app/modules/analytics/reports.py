from __future__ import annotations

from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def build_pose_performance_pdf(user_id: str, dashboard, series) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    pdf.setTitle("Pose Performance Report")
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(72, height - 72, "Pose Performance Report")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(72, height - 96, f"User: {user_id}")
    pdf.drawString(72, height - 114, f"Performance score: {dashboard.performance_score}")
    pdf.drawString(72, height - 132, f"Workout sessions: {dashboard.workout.sessions}")
    pdf.drawString(72, height - 150, f"Calories burned: {dashboard.workout.calories_burned}")
    pdf.drawString(72, height - 168, f"Current streak: {dashboard.habits.current_streak}")

    pdf.drawString(72, height - 198, "Weekly series:")
    y = height - 216
    for label, calories, score, completion in zip(
        series.labels,
        series.calories_burned,
        series.form_score,
        series.habit_completion,
    ):
        pdf.drawString(84, y, f"{label}: calories={calories}, form={score}, habit={completion}")
        y -= 16

    pdf.showPage()
    pdf.save()
    return buffer.getvalue()

