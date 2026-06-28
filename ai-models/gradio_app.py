import gradio as gr


def predict(x):
    return "Workout detected"


gr.Interface(fn=predict, inputs="text", outputs="text").launch()
