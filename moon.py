import requests

result = requests.get("https://www.solarsystemscope.com/textures/download/2k_moon.jpg")

if result.ok:
    with open("./public/textures/moon.png", "wb") as m:
        m.write(result.content)
