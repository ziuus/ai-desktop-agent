# Integration Methods

## 1. MCP Server (Recommended)

**What is it:** Model Context Protocol - Standard way to give AI agents tools.

**How it works:**
```json
// In your AI tool's config (e.g., opencode.json, claude_desktop_config.json)
{
  "mcpServers": {
    "desktop": {
      "command": "node",
      "args": ["/path/to/mcp-server.js"]
    }
  }
}
```

**AI can then call tools like:**
- `screenshot` - Take a picture of the screen
- `click` - Move mouse and click
- `type_text` - Type on keyboard
- `find_image` - Locate an element visually

## 2. Direct Shell Commands

**What is it:** AI runs bash commands directly.

**How it works:** (What I do now)
```bash
gui-automation click 100 200
gui-automation type "Hello"
```

**Pros:** Simple, works everywhere
**Cons:** AI needs to know the commands

## 3. Python API

**What is it:** Import our functions into Python scripts.

**How it works:**
```python
from gui_automation import click, type_text, screenshot

screenshot()
click(100, 200)
type_text("Hello World")
```

## 4. REST API

**What is it:** Run a web server that AI can call via HTTP.

**How it works:**
```bash
python3 api-server.py
# AI calls: curl localhost:5000/click?x=100&y=200
```

## 5. Browser Extension

**What is it:** Chrome/Edge extension that AI controls.

**How it works:** (Already have - browser plugin)
- AI controls browser tabs
- Can take screenshots
- Can interact with web pages

## Comparison

| Method | Setup | AI Native | Use Case |
|--------|-------|-----------|----------|
| MCP | Medium | ✅ Best | Modern AI agents |
| Shell | Easy | ✅ Good | Current setup |
| Python API | Easy | ⚠️ Limited | Scripting |
| REST API | Medium | ⚠️ Limited | External access |
| Browser | Easy | ✅ Good | Web tasks |

## Best Integration: MCP

**Steps to use:**
1. Install MCP SDK
2. Run our mcp-server.js
3. Add to AI tool config
4. AI gets automatic access to desktop tools

**Already working in:**
- ✅ OpenCode (we set this up)
- ✅ Claude Desktop
- ✅ Cursor
- ✅ Other MCP-compatible tools
