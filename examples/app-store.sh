#!/bin/bash
# Example: Search in Cosmic App Store

source ../gui-automation

echo "Opening Cosmic Store..."
cosmic-store &
sleep 3

echo "Clicking search box..."
gui-automation click 530 80

echo "Typing search query..."
gui-automation type "food"
gui-automation press RETURN

sleep 2

echo "Taking screenshot of results..."
gui-automation screenshot
echo "Screenshot saved to /tmp/automation/screen.png"
