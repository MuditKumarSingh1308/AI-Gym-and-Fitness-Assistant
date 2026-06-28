import sys

from diet_recommendation import recommend_diet


weight = float(sys.argv[1]) if len(sys.argv) > 1 else 70
goal = sys.argv[2] if len(sys.argv) > 2 else "muscle"

print(recommend_diet(weight, goal))
