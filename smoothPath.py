import json

file_path = "public/path.json"  # your JSON file
alpha = 0.5  # smoothing strength (0 = no change, 1 = full neighbor average)

with open(file_path, "r") as f:
    points = json.load(f)

# Ensure format [[x, z], ...]
smoothed = []

for i in range(len(points)):
    x, z = points[i]

    if i == 0 or i == len(points) - 1:
        # keep endpoints unchanged
        smoothed.append([x, z])
    else:
        x_prev, z_prev = points[i - 1]
        x_next, z_next = points[i + 1]

        avg_x = (x_prev + x_next) / 2
        avg_z = (z_prev + z_next) / 2

        new_x = x + alpha * (avg_x - x)
        new_z = z + alpha * (avg_z - z)

        smoothed.append([new_x, new_z])

# overwrite file
with open(file_path, "w") as f:
    json.dump(smoothed, f, indent=2)

print(f"Smoothed {len(points)} points with alpha={alpha}")