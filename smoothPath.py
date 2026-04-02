import json
import math
import numpy as np

# --- PARAMETERS ---
input_file = "public/path.json"          # your original JSON
output_file = "public/path.json"
max_step = 0.05          # maximum distance allowed between consecutive points
arch_factor = 0.05       # how much to raise midpoint for a gentle arch, 0 = straight

# --- HELPER FUNCTIONS ---
def distance(p1, p2):
    dx = p2[0] - p1[0]
    dz = p2[1] - p1[1]
    return math.sqrt(dx*dx + dz*dz)

def densify(points):
    dense = []
    for i, p1 in enumerate(points):
        dense.append(p1)
        if i < len(points) - 1:
            p2 = points[i+1]
            dist = distance(p1, p2)
            if dist > max_step:
                steps = int(math.ceil(dist / max_step))  # how many points to insert
                for s in range(1, steps):
                    t = s / steps
                    # Linear interpolation
                    x = p1[0] + (p2[0] - p1[0]) * t
                    z = p1[1] + (p2[1] - p1[1]) * t
                    # Optional mild arch: perpendicular offset
                    dx = p2[0] - p1[0]
                    dz = p2[1] - p1[1]
                    perp_x = -dz
                    perp_z = dx
                    # normalize
                    norm = math.sqrt(perp_x**2 + perp_z**2)
                    if norm != 0:
                        perp_x /= norm
                        perp_z /= norm
                    # apply small offset
                    x += perp_x * arch_factor
                    z += perp_z * arch_factor
                    dense.append([x, z])
    return dense

# --- MAIN ---
with open(input_file, "r") as f:
    points = json.load(f)

dense_points = densify(points)

with open(output_file, "w") as f:
    json.dump(dense_points, f, indent=4)

print(f"Densified points written to {output_file}, total points: {len(dense_points)}")