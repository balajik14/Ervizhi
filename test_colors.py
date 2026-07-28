from PIL import Image

def is_plant(img_path):
    img = Image.open(img_path).convert('HSV')
    img_small = img.resize((100, 100))
    pixels = img_small.getdata()
    
    plant_pixels = 0
    total = len(pixels)
    
    for h, s, v in pixels:
        # H is 0-255. 
        # Brown/Orange is ~10-25
        # Yellow is ~30-45
        # Green is ~45-105
        # So 10 to 110 covers dead leaves, yellow leaves, and green leaves.
        # We also need some saturation and value to avoid greyscale/black/white
        if 10 <= h <= 120 and s > 15 and v > 15:
            plant_pixels += 1
            
    ratio = plant_pixels / total
    print(f"{img_path}: ratio {ratio:.3f}")

img_brown = Image.new('RGB', (100, 100), color = (139, 69, 19))
img_brown.save('brown.png')
is_plant('brown.png')

img_white = Image.new('RGB', (100, 100), color = (255, 255, 255))
img_white.save('white.png')
is_plant('white.png')

