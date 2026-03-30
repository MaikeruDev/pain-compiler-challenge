<div align="center">

# ⚡ Pain Compiler Challenge

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![VS Code](https://img.shields.io/badge/VS_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)](https://code.visualstudio.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Hackathon](https://img.shields.io/badge/Hackathon-Project-ff69b4?style=for-the-badge)](#)

*A sadistic Visual Studio Code extension that punishes bad code with physical pain.*

</div>

## 📖 About The Project

**Pain Compiler Challenge** is a unique, hardware-integrated VS Code extension born out of a hackathon. It generates strict Python coding challenges that you must solve directly in your editor. 

Here is the catch: **If your code fails, throws an error, or the output doesn't perfectly match the expected result, the extension sends a network request to a local API that triggers a real electro-shocker.** 

Write clean, exact code, or prepare to be shocked. Literally.

---

## ✨ Key Features

- **🎲 Random Challenge Generation:** Automatically creates a new Python file in your workspace with a randomly selected coding puzzle (e.g., ASCII art, number pyramids).
- **🐍 Local Execution:** Compiles and runs your Python scripts in a safe, temporary environment using Node's `child_process`.
- **📏 Strict Output Validation:** Evaluates your standard output (`stdout`) against the exact expected string. No extra spaces, no extra newlines allowed.
- **⚡ Hardware Punishment Integration:** Hooks into a local HTTP endpoint (`http://192.168.166.203:5000/error`). Upon failure, it sends a `POST` request to activate an external electro-shock device.
- **🔎 Detailed Feedback:** If you fail (and survive the shock), the extension provides a detailed visual breakdown in the Output Panel, replacing spaces with `␣` and newlines with `\n` so you can see exactly where you went wrong.

---

## 🛠️ Installation

Because this is a hackathon prototype with hardware dependencies, it is not available on the VS Code Marketplace. You will need to build it from the source.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Python 3](https://www.python.org/downloads/) (Must be accessible via the `python3` command in your PATH)
- [Visual Studio Code](https://code.visualstudio.com/)
- *Optional but recommended:* A compatible networked electro-shocker API running locally.

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MaikeruDev/pain-compiler-challenge.git
   cd pain-compiler-challenge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile the extension:**
   ```bash
   npm run compile
   ```

4. **Launch in VS Code:**
   Open the project folder in VS Code and press `F5` to open an Extension Development Host window with the plugin loaded.

---

## 🚀 Usage Examples

1. **Start a Challenge:**
   When the extension activates, it will automatically prompt you to select a workspace folder if you haven't already. It then generates a timestamped Python file (e.g., `challenge_15_10_23_14_30.py`) containing your task.

2. **Write your Code:**
   Read the comments at the top of the file. Write a Python script that produces the exact required output.
   ```python
   # Aufgabe: Gib exakt folgenden Output aus:
   #
   #      1
   #     2 2
   #    3   3
   
   print("    1")
   print("   2 2")
   print("  3   3")
   ```

3. **Check your Code (and brace yourself):**
   Open the VS Code Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and execute the check command (internally registered as `extension.checkChallenge`). 
   
   - ✅ **Success:** You get a friendly "Challenge bestanden!" notification.
   - ❌ **Failure:** You get a shock, an error notification, and a detailed breakdown of your formatting errors in the Output Panel.

*(Note: Due to the hackathon nature of the project, you may need to map the `extension.checkChallenge` command to a custom keybinding in your `keybindings.json` for rapid testing).*

---

## 💻 Technologies Used

- **[TypeScript](https://www.typescriptlang.org/)**: Core logic and extension structure.
- **[VS Code Extension API](https://code.visualstudio.com/api)**: Workspace manipulation, file generation, and Output Channel UI.
- **[Node.js](https://nodejs.org/)**: 
  - `child_process.exec` for running the Python runtime.
  - `tmp` package for handling temporary file execution safely.
  - Native `fetch` API for triggering the hardware shocker.
- **[ESBuild](https://esbuild.github.io/)**: Fast bundling of the extension.

---

## 🤝 Contributing Guidelines

Contributions, issues, and feature requests are welcome! If you want to add new challenges, improve the Python execution sandbox, or add support for different shocker APIs, feel free to contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code passes the linter (`npm run lint`) and compiles successfully (`npm run compile`) before submitting a PR.

---

## 📄 License

This project is open-source and available under the **MIT License**. 

> **⚠️ DISCLAIMER:** This software was built as a joke/hackathon project and interacts with physical hardware capable of delivering electric shocks. The creators and contributors are **not responsible** for any physical harm, hardware damage, psychological trauma, or terrible code written while under the pressure of impending electric shocks. Use at your own risk!
