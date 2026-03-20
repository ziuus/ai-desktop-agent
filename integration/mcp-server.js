#!/usr/bin/env node
/**
 * MCP Server for Desktop Automation
 * 
 * This lets any AI agent (OpenCode, Claude, Cursor, etc.) 
 * control the desktop through standard MCP tools.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'desktop-automation', version: '1.0.0' },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools = [
  {
    name: 'screenshot',
    description: 'Take a screenshot of the entire screen',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Optional path to save screenshot'
        }
      }
    }
  },
  {
    name: 'click',
    description: 'Move mouse to coordinates and click',
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
    description: 'Move mouse to coordinates without clicking',
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
    name: 'type_text',
    description: 'Type text using keyboard',
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
          description: 'Key name (e.g., RETURN, ESC, CTRL+C)',
          enum: ['RETURN', 'ESC', 'TAB', 'CTRL+C', 'CTRL+V', 'ENTER', 'SPACE']
        }
      }
    }
  },
  {
    name: 'find_image',
    description: 'Find an image on screen and return its center coordinates',
    inputSchema: {
      type: 'object',
      required: ['image_path'],
      properties: {
        image_path: { type: 'string', description: 'Path to image to find' },
        threshold: { type: 'number', description: 'Match threshold (0-1)', default: 0.8 }
      }
    }
  },
  {
    name: 'open_app',
    description: 'Open an application',
    inputSchema: {
      type: 'object',
      required: ['command'],
      properties: {
        command: { type: 'string', description: 'Command to run (e.g., firefox, gnome-calculator)' }
      }
    }
  },
  {
    name: 'get_screen_size',
    description: 'Get screen dimensions',
    inputSchema: { type: 'object', properties: {} }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'screenshot':
        return await runCommand('scrot', args?.path ? [args.path] : ['/tmp/automation/screen.png'])
          .then(() => ({ content: [{ type: 'text', text: `Screenshot saved to ${args?.path || '/tmp/automation/screen.png'}` }] }));
      
      case 'click':
        await runCommand('ydotool', ['mousemove', String(args.x), String(args.y)]);
        return runCommand('ydotool', ['click', '0'])
          .then(() => ({ content: [{ type: 'text', text: `Clicked at ${args.x}, ${args.y}` }] }));
      
      case 'move_mouse':
        return runCommand('ydotool', ['mousemove', String(args.x), String(args.y)])
          .then(() => ({ content: [{ type: 'text', text: `Mouse moved to ${args.x}, ${args.y}` }] }));
      
      case 'type_text':
        return runCommand('ydotool', ['type', '--', args.text])
          .then(() => ({ content: [{ type: 'text', text: `Typed: ${args.text}` }] }));
      
      case 'press_key':
        return runCommand('ydotool', ['key', args.key])
          .then(() => ({ content: [{ type: 'text', text: `Pressed key: ${args.key}` }] }));
      
      case 'find_image':
        const result = await findImageOnScreen(args.image_path, args.threshold);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      
      case 'open_app':
        return runCommand('sh', ['-c', `${args.command} &`])
          .then(() => ({ content: [{ type: 'text', text: `Opened: ${args.command}` }] }));
      
      case 'get_screen_size':
        const size = await getScreenSize();
        return { content: [{ type: 'text', text: JSON.stringify(size) }] };
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

async function runCommand(cmd, args) {
  const { exec } = await import('child_process');
  return new Promise((resolve, reject) => {
    const proc = exec([cmd, ...args].join(' '), { env: { ...process.env, YDOTOOL_SOCKET: '/tmp/.ydotool_socket' } }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err));
      else resolve(stdout);
    });
  });
}

async function findImageOnScreen(imagePath, threshold = 0.8) {
  // Implementation using OpenCV would go here
  return { found: false, message: 'Image recognition requires Python integration' };
}

async function getScreenSize() {
  const { execSync } = await import('child_process');
  try {
    const output = execSync('xdpyinfo 2>/dev/null | grep dimensions').toString();
    const match = output.match(/(\d+)x(\d+)/);
    return { width: parseInt(match[1]), height: parseInt(match[2]) };
  } catch {
    return { width: 1920, height: 1080 };
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Desktop Automation MCP Server running');
}

main().catch(console.error);
