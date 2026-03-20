# AI Desktop Agent

Give any AI agent full desktop control. Mouse, keyboard, screenshots, and visual element detection - all via MCP (Model Context Protocol).

## Features

- **Mouse Control** - Move, click, right-click, double-click, drag anywhere on screen
- **Keyboard Control** - Type text, press keys, hotkeys (Ctrl+C, etc.)
- **Screenshots** - Capture and analyze screen content
- **Image Recognition** - Find elements by matching images (OpenCV)
- **Working Indicator** - See when AI is actively working
- **MCP Server** - Works with OpenCode, Claude Desktop, Cursor, and any MCP-compatible AI

## Quick Start

```bash
git clone https://github.com/ziuus/ai-desktop-agent.git
cd ai-desktop-agent
chmod +x setup.sh
./setup.sh
```

## Demo

```
"Open calculator"
"Click search box"
"Type 7+12="
Result: 19 ✓
```

The AI literally controls your mouse and keyboard.

## How It Works

- **ydotool** - Linux input automation
- **scrot** - Screenshot capture
- **OpenCV** - Image recognition
- **MCP** - Model Context Protocol for AI integration

## Supported Platforms

- Linux (Arch, Ubuntu, Fedora)
- Wayland (COSMIC, KDE, GNOME)
- X11

## Integrations

Works with:
- OpenCode
- Claude Desktop
- Cursor
- Any MCP-compatible AI agent

## Star the Repo

If you find this useful, please star the repo!

⭐ [github.com/ziuus/ai-desktop-agent](https://github.com/ziuus/ai-desktop-agent)

## Sponsor

Support this project: [GitHub Sponsors](https://github.com/sponsors/ziuus)

## License

MIT
