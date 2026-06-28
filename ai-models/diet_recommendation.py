def recommend_diet(weight, goal):
    if goal == "muscle":
        return "High protein diet: eggs, chicken, paneer"
    elif goal == "fat_loss":
        return "Low calorie diet: oats, fruits, vegetables"
    return "Balanced diet"


if __name__ == "__main__":
    print(recommend_diet(70, "muscle"))
