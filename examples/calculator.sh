#!/bin/bash
# Example: Open calculator and perform calculation

source ../gui-automation

echo "Opening calculator..."
gnome-calculator &
sleep 2

echo "Clicking calculator to focus..."
gui-automation click 960 540

echo "Typing calculation..."
gui-automation type "7+12="

echo "Done! Check the calculator for the result."
