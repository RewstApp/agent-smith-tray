# Agent Smith Tray

**Agent Smith Tray** is a Windows system tray application that provides user interactivity and real-time status updates for the Agent Smith service.

---

## Overview

This executable displays a tray icon in the system toolbar and connects to the Agent Smith service to show its status, display messages, and open configurable links.

---

## Build Instructions

### 1. Install Dependencies

Make sure you have [Node.js](https://nodejs.org/) installed.
Use `npm` to install all required project dependencies:

```cmd
npm ci
```

### 2. Build the Installer

To generate the Windows installer, run the following command **as Administrator**:

```cmd
npm run dist
```

> Administrative privileges are required for successful installer creation.

---

## Development

To run the tray app in development mode:

```cmd
npm start
```

This will launch the app without creating an installer, useful for testing changes.

---

## Installation

You can download the latest installer (`agent-smith-tray-installer.exe`) from the [Releases page](https://github.com/RewstApp/agent-smith-tray/releases/latest/).

### Requirements

* The **Agent Smith** service must be installed before running the tray installer.

### Steps

1. Run the installer and follow the on-screen instructions.
2. The installer automatically configures and registers the tray app to start on system boot.
3. After installation:

   * If you select **"Run after installation"**, the tray icon will appear immediately.
   * Otherwise, it will appear automatically after the next system restart.

---

## Features

### Real-Time Status

* The tray icon reflects the connection status of the Agent Smith service:

  * **Active** – Normal icon
  * **Offline** – Grayed-out icon

### Workflow Messages

* The tray can display real-time HTML messages sent from workflows via **IoTHub**.

Example message format:

```json
{
  "type": "user_interaction_html",
  "content": "<p>HTML CONTENT</p>"
}
```

### Configurable Links

* Double-clicking the tray icon or selecting **"Show"** from the tray menu opens a list of custom links.

To configure these links, send a message via **IoTHub**:

```json
{
  "type": "links",
  "content": "[{\"name\":\"Rewst\",\"url\":\"https://rewst.io\"}]"
}
```

> Ensure that all linked pages can be embedded inside an **iframe** (you can use the app builder to generate such pages).

---

## Contributing

Contributions are welcome! Please open a Pull Request (PR) for any improvements or bug fixes.

### Commit Convention

This project uses **Commitizen** for standardized commit messages.
After staging your changes, commit using:

```cmd
cz commit
```
