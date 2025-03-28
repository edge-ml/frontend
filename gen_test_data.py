from tqdm import tqdm
import math


header = "time, sensor_001, sensor_002"

lines = []
for i in tqdm(range(100000)):
    lines.append(f"{i}, {i * 1000}, {math.sin(i * 0.2)}")


with open("test_data.csv", "w") as f:
    f.write(header + "\n")
    for line in lines:
        f.write(line + "\n")