#!/usr/bin/env python3
"""
Example: Find and click an image on screen
Save a small screenshot of an element, then use it to find and click that element.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__) + "/..")

from gui_automation import screenshot, find_image, click

# Take screenshot first
print("Taking screenshot...")
screenshot()

# Find an image (provide path to a small screenshot of the target element)
# Example: Find a button you've saved as 'button.png'
target = sys.argv[1] if len(sys.argv) > 1 else None

if target and os.path.exists(target):
    print(f"Looking for {target}...")
    result = find_image(target)
    if result:
        x, y, confidence = result
        print(f"Found at ({x}, {y}) with {confidence * 100:.1f}% confidence")
        click(x, y)
        print("Clicked!")
    else:
        print("Image not found on screen")
else:
    print("Usage: python find_and_click.py <path-to-element-image.png>")
    print(f"Taken screenshot: /tmp/automation/screen.png")
