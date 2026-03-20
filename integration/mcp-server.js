#!/usr/bin/env node
/**
 * MCP Server for Desktop Automation
 * 
 * Gives AI agents full desktop control via Model Context Protocol
 * Works with: OpenCode, Claude Desktop, Cursor, any MCP client
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn, execSync } from 'child_process';

const YDOTOOL_SOCKET = process.env.YDOTOOL_SOCKET || '/tmp/.ydotool_socket';

const server = new Server(
  { name: 'desktop-automation', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

function runCommand(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      env: { ...process.env, YDOTOOL_SOCKET },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '', stderr = '';
    proc.stdout.on('data', d => stdout += d);
    proc.stderr.on('data', d => stderr += d);
    proc.on('close', code => code === 0 ? resolve(stdout) : reject(new Error(stderr || `Exit code ${code}`)));
    proc.on('error', reject);
  });
}

function runShell(cmd) {
  return execSync(cmd, { 
    encoding: 'utf-8',
    env: { ...process.env, YDOTOOL_SOCKET }
  });
}

const tools = [
  {
    name: 'screenshot',
    description: 'Take a screenshot of the entire screen and save to a file',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to save screenshot', default: '/tmp/automation/screen.png' }
      }
    }
  },
  {
    name: 'click',
    description: 'Move mouse to X,Y coordinates and click (left click by default)',
    inputSchema: {
      type: 'object',
      required: ['x', 'y'],
      properties: {
        x: { type: 'number', description: 'X coordinate on screen' },
        y: { type: 'number', description: 'Y coordinate on screen' },
        button: { type: 'number', description: 'Mouse button (0=left, 1=mid, 2=right)', default: 0 }
      }
    }
  },
  {
    name: 'double_click',
    description: 'Double click at the specified coordinates',
    inputSchema: {
      type: 'object',
      required: ['x', 'y'],
      properties: {
        x: { type: 'number', description: 'X coordinate' },
        y: { type: 'number', description: 'Y coordinate' }
      }
    }
  },
  {
    name: 'right_click',
    description: 'Right click at the specified coordinates',
    inputSchema: {
      type: 'object',
      required: ['x', 'y'],
      properties: {
        x: { type: 'number', description: 'X coordinate' },
        y: { type: 'number', description: 'Y coordinate' }
      }
    }
  },
  {
    name: 'move_mouse',
    description: 'Move mouse to X,Y coordinates without clicking',
    inputSchema: {
      type: 'object',
      required: ['x', 'y'],
      properties: {
        x: { type: 'number', description: 'X coordinate' },
        y: { type: 'number', description: 'Y coordinate' }
      }
    }
  },
  {
    name: 'drag',
    description: 'Drag from one point to another (click, move, release)',
    inputSchema: {
      type: 'object',
      required: ['x1', 'y1', 'x2', 'y2'],
      properties: {
        x1: { type: 'number', description: 'Start X coordinate' },
        y1: { type: 'number', description: 'Start Y coordinate' },
        x2: { type: 'number', description: 'End X coordinate' },
        y2: { type: 'number', description: 'End Y coordinate' }
      }
    }
  },
  {
    name: 'type_text',
    description: 'Type text using the keyboard',
    inputSchema: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string', description: 'Text to type' }
      }
    }
  },
  {
    name: 'press_key',
    description: 'Press a keyboard key',
    inputSchema: {
      type: 'object',
      required: ['key'],
      properties: {
        key: { 
          type: 'string', 
          description: 'Key name',
          enum: ['RETURN', 'ENTER', 'ESC', 'TAB', 'SPACE', 'BACKSPACE', 'DELETE',
                 'UP', 'DOWN', 'LEFT', 'RIGHT', 'CTRL', 'SHIFT', 'ALT', 'META',
                 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
                 'HOME', 'END', 'PAGEUP', 'PAGEDOWN', 'INSERT']
        }
      }
    }
  },
  {
    name: 'hotkey',
    description: 'Press a keyboard shortcut combination',
    inputSchema: {
      type: 'object',
      required: ['keys'],
      properties: {
        keys: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Keys to press together (e.g., ["CTRL", "C"])',
          minItems: 2
        }
      }
    }
  },
  {
    name: 'open_app',
    description: 'Open an application by command name',
    inputSchema: {
      type: 'object',
      required: ['command'],
      properties: {
        command: { type: 'string', description: 'Command to run (e.g., firefox, gnome-calculator, cosmic-store)' },
        wait: { type: 'number', description: 'Seconds to wait after opening', default: 2 }
      }
    }
  },
  {
    name: 'get_screen_size',
    description: 'Get the screen dimensions in pixels',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_mouse_position',
    description: 'Get the current mouse cursor position',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'scroll',
    description: 'Scroll the mouse wheel',
    inputSchema: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: { type: 'number', description: 'Scroll amount (positive=up, negative=down)' }
      }
    }
  },
  {
    name: 'working_indicator',
    description: 'Show or hide a working indicator on screen',
    inputSchema: {
      type: 'object',
      required: ['action'],
      properties: {
        action: { type: 'string', enum: ['show', 'hide', 'status'], description: 'Show, hide, or check status' },
        message: { type: 'string', description: 'Message to display when showing' }
      }
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const response = (text) => [{ type: 'text', text }];
  
  try {
    switch (name) {
      case 'screenshot': {
        const path = args?.path || '/tmp/automation/screen.png';
        await runCommand('mkdir', ['-p', '/tmp/automation']);
        await runCommand('scrot', [path]);
        return { content: response(`Screenshot saved to ${path}`) };
      }
      
      case 'click':
        await runCommand('ydotool', ['mousemove', String(args.x), String(args.y)]);
        await runCommand('ydotool', ['click', String(args.button || 0)]);
        return { content: response(`Clicked at ${args.x}, ${args.y}`) };
      
      case 'double_click':
        await runCommand('ydotool', ['mousemove', String(args.x), String(args.y)]);
        await runCommand('ydotool', ['click', '0']);
        await runCommand('ydotool', ['click', '0']);
        return { content: response(`Double-clicked at ${args.x}, ${args.y}`) };
      
      case 'right_click':
        await runCommand('ydotool', ['mousemove', String(args.x), String(args.y)]);
        await runCommand('ydotool', ['click', '2']);
        return { content: response(`Right-clicked at ${args.x}, ${args.y}`) };
      
      case 'move_mouse':
        await runCommand('ydotool', ['mousemove', String(args.x), String(args.y)]);
        return { content: response(`Mouse moved to ${args.x}, ${args.y}`) };
      
      case 'drag':
        await runCommand('ydotool', ['mousemove', String(args.x1), String(args.y1)]);
        await runCommand('ydotool', ['click', '0']);
        await runCommand('ydotool', ['mousemove', String(args.x2), String(args.y2)]);
        await runCommand('ydotool', ['click', '0']);
        return { content: response(`Dragged from (${args.x1},${args.y1}) to (${args.x2},${args.y2})`) };
      
      case 'type_text':
        await runCommand('ydotool', ['type', '--', args.text]);
        return { content: response(`Typed: ${args.text}`) };
      
      case 'press_key':
        await runCommand('ydotool', ['key', args.key]);
        return { content: response(`Pressed key: ${args.key}`) };
      
      case 'hotkey':
        for (const key of args.keys) {
          await runCommand('ydotool', ['key', key]);
        }
        return { content: response(`Pressed hotkey: ${args.keys.join('+')}`) };
      
      case 'open_app':
        spawn('sh', ['-c', `${args.command} &`], { detached: true, stdio: 'ignore' }).unref();
        if (args.wait) await new Promise(r => setTimeout(r, args.wait * 1000));
        return { content: response(`Opened: ${args.command}`) };
      
      case 'get_screen_size':
        try {
          const output = runShell('xdpyinfo 2>/dev/null | grep dimensions');
          const match = output.match(/(\d+)x(\d+)/);
          return { content: response(`Screen size: ${match[1]}x${match[2]}`) };
        } catch {
          return { content: response('Screen size: 1920x1080 (default)') };
        }
      
      case 'get_mouse_position':
        try {
          const output = runShell('xdotool getmouselocation 2>/dev/null || echo "x:0 y:0"');
          const match = output.match(/x:(\d+) y:(\d+)/);
          return { content: response(`Mouse position: ${match[1]}, ${match[2]}`) };
        } catch {
          return { content: response('Could not get mouse position') };
        }
      
      case 'scroll':
        await runCommand('ydotool', ['click', args.amount > 0 ? '4' : '5']);
        return { content: response(`Scrolled ${args.amount > 0 ? 'up' : 'down'}`) };
      
      case 'working_indicator':
        if (args.action === 'show') {
          spawn('sh', ['-c', `notify-send -u critical -t 0 "🤖 Working..." "${args.message || 'AI is working...'}"`], { stdio: 'ignore' });
          return { content: response(`Showing indicator: ${args.message || 'Working...'}`) };
        } else if (args.action === 'hide') {
          spawn('sh', ['-c', 'notify-send -u low -t 1000 "✅ Done" "Task complete."'], { stdio: 'ignore' });
          return { content: response('Hidden indicator') };
        } else {
          return { content: response('Indicator status: Unknown') };
        }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return { content: response(`Error: ${error.message}`), isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Desktop Automation MCP Server running on stdio');
}

main().catch(console.error);
