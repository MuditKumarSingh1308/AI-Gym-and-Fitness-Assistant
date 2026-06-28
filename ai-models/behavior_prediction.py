from sklearn.linear_model import LogisticRegression
import numpy as np

X = np.array([[1, 30], [2, 60], [3, 90]])
y = np.array([0, 1, 1])

model = LogisticRegression()
model.fit(X, y)


def predict_behavior(days, minutes):
    return model.predict([[days, minutes]])


if __name__ == "__main__":
    print(predict_behavior(2, 60))
