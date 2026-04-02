import re
import json

file_path = "public/path.json"  # replace with your file

with open(file_path, "r") as f:
    text = f.read()

# Find all x: <num>, z: <num> pairs
pattern = r"x:\s*(-?\d+\.?\d*),\s*z:\s*(-?\d+\.?\d*)"
matches = re.findall(pattern, text)

# Convert to [[x, z], ...]
points = [[float(x), float(z)] for x, z in matches]

# Write back as JSON
with open(file_path, "w") as f:
    json.dump(points, f, indent=2)

print(f"Converted {len(points)} points.")