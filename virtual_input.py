#!/usr/bin/env python3
"""Virtual Input Device - Creates a virtual mouse/keyboard that bypasses Wayland restrictions."""

import evdev
from evdev import UInput, AbsInfo, ecodes as e
import sys
import time


class VirtualInput:
    def __init__(self):
        self.mouse = None
        self.keyboard = None

    def create_mouse(self, name="Virtual Mouse", width=1920, height=1080):
        caps = {
            e.EV_ABS: [
                (
                    e.ABS_X,
                    AbsInfo(value=0, min=0, max=width, resolution=1, fuzz=0, flat=0),
                ),
                (
                    e.ABS_Y,
                    AbsInfo(value=0, min=0, max=height, resolution=1, fuzz=0, flat=0),
                ),
            ],
            e.EV_REL: [e.REL_X, e.REL_Y, e.REL_WHEEL, e.REL_HWHEEL],
            e.EV_KEY: [e.BTN_LEFT, e.BTN_RIGHT, e.BTN_MIDDLE, e.BTN_SIDE, e.BTN_EXTRA],
        }
        self.mouse = UInput(caps, name=name)
        print(f"Created virtual mouse: {name} ({width}x{height})")
        self._abs_x, self._abs_y = 0, 0
        self._width, self._height = width, height
        return self.mouse

    def create_keyboard(self, name="Virtual Keyboard"):
        caps = {
            e.EV_KEY: [
                e.KEY_ESC,
                e.KEY_1,
                e.KEY_2,
                e.KEY_3,
                e.KEY_4,
                e.KEY_5,
                e.KEY_6,
                e.KEY_7,
                e.KEY_8,
                e.KEY_9,
                e.KEY_0,
                e.KEY_MINUS,
                e.KEY_EQUAL,
                e.KEY_BACKSPACE,
                e.KEY_TAB,
                e.KEY_Q,
                e.KEY_W,
                e.KEY_E,
                e.KEY_R,
                e.KEY_T,
                e.KEY_Y,
                e.KEY_U,
                e.KEY_I,
                e.KEY_O,
                e.KEY_P,
                e.KEY_LEFTBRACE,
                e.KEY_RIGHTBRACE,
                e.KEY_ENTER,
                e.KEY_LEFTCTRL,
                e.KEY_A,
                e.KEY_S,
                e.KEY_D,
                e.KEY_F,
                e.KEY_G,
                e.KEY_H,
                e.KEY_J,
                e.KEY_K,
                e.KEY_L,
                e.KEY_SEMICOLON,
                e.KEY_APOSTROPHE,
                e.KEY_GRAVE,
                e.KEY_LEFTSHIFT,
                e.KEY_BACKSLASH,
                e.KEY_Z,
                e.KEY_X,
                e.KEY_C,
                e.KEY_V,
                e.KEY_B,
                e.KEY_N,
                e.KEY_M,
                e.KEY_COMMA,
                e.KEY_DOT,
                e.KEY_SLASH,
                e.KEY_RIGHTSHIFT,
                e.KEY_KPASTERISK,
                e.KEY_LEFTALT,
                e.KEY_SPACE,
                e.KEY_CAPSLOCK,
                e.KEY_F1,
                e.KEY_F2,
                e.KEY_F3,
                e.KEY_F4,
                e.KEY_F5,
                e.KEY_F6,
                e.KEY_F7,
                e.KEY_F8,
                e.KEY_F9,
                e.KEY_F10,
                e.KEY_F11,
                e.KEY_F12,
                e.KEY_NUMLOCK,
                e.KEY_SCROLLLOCK,
                e.KEY_KP7,
                e.KEY_KP8,
                e.KEY_KP9,
                e.KEY_KPMINUS,
                e.KEY_KP4,
                e.KEY_KP5,
                e.KEY_KP6,
                e.KEY_KPPLUS,
                e.KEY_KP1,
                e.KEY_KP2,
                e.KEY_KP3,
                e.KEY_KP0,
                e.KEY_KPDOT,
                e.KEY_UP,
                e.KEY_DOWN,
                e.KEY_LEFT,
                e.KEY_RIGHT,
                e.KEY_HOME,
                e.KEY_END,
                e.KEY_PAGEUP,
                e.KEY_PAGEDOWN,
                e.KEY_INSERT,
                e.KEY_DELETE,
                e.KEY_KPENTER,
                e.KEY_RIGHTCTRL,
                e.KEY_RIGHTALT,
                e.KEY_RIGHTMETA,
                e.KEY_KPEQUAL,
                e.KEY_PAUSE,
                e.KEY_PRINT,
                e.KEY_PLAYPAUSE,
                e.KEY_STOPCD,
                e.KEY_MUTE,
                e.KEY_VOLUMEUP,
                e.KEY_VOLUMEDOWN,
            ]
        }
        self.keyboard = UInput(caps, name=name)
        print(f"Created virtual keyboard: {name}")
        return self.keyboard

    def move_mouse(self, dx, dy):
        if self.mouse:
            self.mouse.write(e.EV_REL, e.REL_X, dx)
            self.mouse.write(e.EV_REL, e.REL_Y, dy)
            self.mouse.syn()

    def move_mouse_abs(self, x, y):
        if self.mouse:
            self.mouse.write(e.EV_ABS, e.ABS_X, x)
            self.mouse.write(e.EV_ABS, e.ABS_Y, y)
            self.mouse.syn()
            self._abs_x, self._abs_y = x, y

    def click(self, button="left"):
        if self.mouse:
            btn = {"left": e.BTN_LEFT, "right": e.BTN_RIGHT, "middle": e.BTN_MIDDLE}[
                button
            ]
            self.mouse.write(e.EV_KEY, btn, 1)
            self.mouse.syn()
            self.mouse.write(e.EV_KEY, btn, 0)
            self.mouse.syn()

    def scroll(self, amount):
        if self.mouse:
            self.mouse.write(e.EV_REL, e.REL_WHEEL, amount)
            self.mouse.syn()

    def type_key(self, key_code):
        if self.keyboard:
            self.keyboard.write(e.EV_KEY, key_code, 1)
            self.keyboard.syn()
            self.keyboard.write(e.EV_KEY, key_code, 0)
            self.keyboard.syn()

    def type_text(self, text):
        if not self.keyboard:
            print("No keyboard created")
            return
        for char in text.lower():
            key_code = self._char_to_keycode(char)
            if key_code:
                self.type_key(key_code)
            time.sleep(0.01)

    def _char_to_keycode(self, char):
        mapping = {
            "a": e.KEY_A,
            "b": e.KEY_B,
            "c": e.KEY_C,
            "d": e.KEY_D,
            "e": e.KEY_E,
            "f": e.KEY_F,
            "g": e.KEY_G,
            "h": e.KEY_H,
            "i": e.KEY_I,
            "j": e.KEY_J,
            "k": e.KEY_K,
            "l": e.KEY_L,
            "m": e.KEY_M,
            "n": e.KEY_N,
            "o": e.KEY_O,
            "p": e.KEY_P,
            "q": e.KEY_Q,
            "r": e.KEY_R,
            "s": e.KEY_S,
            "t": e.KEY_T,
            "u": e.KEY_U,
            "v": e.KEY_V,
            "w": e.KEY_W,
            "x": e.KEY_X,
            "y": e.KEY_Y,
            "z": e.KEY_Z,
            "0": e.KEY_0,
            "1": e.KEY_1,
            "2": e.KEY_2,
            "3": e.KEY_3,
            "4": e.KEY_4,
            "5": e.KEY_5,
            "6": e.KEY_6,
            "7": e.KEY_7,
            "8": e.KEY_8,
            "9": e.KEY_9,
            " ": e.KEY_SPACE,
            "\n": e.KEY_ENTER,
            "\t": e.KEY_TAB,
            "-": e.KEY_MINUS,
            "=": e.KEY_EQUAL,
            "[": e.KEY_LEFTBRACE,
            "]": e.KEY_RIGHTBRACE,
            ";": e.KEY_SEMICOLON,
            "'": e.KEY_APOSTROPHE,
            "`": e.KEY_GRAVE,
            ",": e.KEY_COMMA,
            ".": e.KEY_DOT,
            "/": e.KEY_SLASH,
            "\\": e.KEY_BACKSLASH,
        }
        return mapping.get(char)

    def press_key(self, key_name):
        if self.keyboard:
            key_code = getattr(e, f"KEY_{key_name.upper()}", None)
            if key_code:
                self.type_key(key_code)

    def close(self):
        if self.mouse:
            self.mouse.close()
        if self.keyboard:
            self.keyboard.close()


# Create singleton instance
_instance = None


def get_virtual_input():
    global _instance
    if _instance is None:
        _instance = VirtualInput()
    return _instance


if __name__ == "__main__":
    vi = VirtualInput()
    vi.create_mouse()
    vi.create_keyboard()

    print("\nVirtual input devices created!")
    print("Testing mouse movement and click...")
    vi.move_mouse(100, 100)
    vi.click("left")
    vi.type_text("hello")
    vi.close()
    print("Done!")
