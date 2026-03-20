#!/bin/bash
set -e

echo "🤖 AI Desktop Agent Kit - Setup"
echo "================================"
echo ""

# Detect OS
if [ -f /etc/arch-release ]; then
    OS="arch"
elif [ -f /etc/debian_version ]; then
    OS="debian"
elif [ -f /etc/fedora-release ]; then
    OS="fedora"
else
    OS="unknown"
fi

echo "📦 Detected: $OS"

# Install dependencies
echo ""
echo "🔧 Installing dependencies..."

if [ "$OS" = "arch" ]; then
    sudo pacman -Syu --noconfirm ydotool scrot python python-pip || true
    pip install opencv-python numpy pillow --break-system-packages 2>/dev/null || pip install opencv-python numpy pillow
elif [ "$OS" = "debian" ] || [ "$OS" = "fedora" ]; then
    sudo apt install -y ydotool scrot python3-pip || sudo dnf install -y ydotool scrot python3-pip
    pip3 install opencv-python numpy pillow
fi

# Install ydotoold service
echo ""
echo "⚙️  Setting up ydotoold service..."
sudo tee /etc/systemd/system/ydotoold.service << 'EOF'
[Unit]
Description=ydotool daemon for GUI automation
After=graphical.target

[Service]
Type=simple
ExecStart=/usr/bin/ydotoold
Restart=on-failure
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ydotoold || true

# Create udev rule
echo ""
echo "🔐 Setting up udev rules for input access..."
sudo tee /etc/udev/rules.d/99-uinput.rules << 'EOF'
KERNEL=="uinput", TAG+="uaccess", OPTIONS+="static_node=uinput"
EOF

echo ""
echo "⚠️  IMPORTANT: You need to either:"
echo "   1. Reboot your computer (recommended)"
echo "   2. Or run: sudo chmod 666 /dev/uinput && sudo systemctl start ydotoold"
echo ""

# Create bin directory
mkdir -p ~/bin
cp ./gui-automation ~/bin/
cp ./working-indicator ~/bin/

echo "📁 Scripts installed to ~/bin/"
echo ""

# Add to PATH if needed
SHELL_RC="$HOME/.zshrc"
if [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
fi

if ! grep -q "export PATH=.*bin" "$SHELL_RC" 2>/dev/null; then
    echo 'export PATH="$HOME/bin:$PATH"' >> "$SHELL_RC"
    echo "✅ Added ~/bin to PATH in $SHELL_RC"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart terminal or run: source ~/.zshrc"
echo "2. Reboot (recommended) or run: sudo chmod 666 /dev/uinput && sudo systemctl start ydotoold"
echo "3. Test: gui-automation screenshot"
echo ""
