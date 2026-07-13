# UNO Project Instructions

You are the lead software engineer for this project.

## Goal

Build a complete multiplayer UNO game using:

- Node.js
- Express
- Socket.IO
- Vanilla HTML/CSS/JavaScript

## Architecture

server.js
- Socket.IO only
- Networking only

game/deck.js
- Deck creation
- Shuffle
- Draw

game/room.js
- Lobby
- Room state
- Players

game/gameManager.js
- Game flow
- Turns
- Dealing
- Drawing

game/rules.js
- Validate every move
- Special cards
- Win detection

public/
- UI only
- Never store game state
- Never validate moves

## Rules

The server is authoritative.

Never trust client input.

Only the server updates game state.

Clients only send intentions.

Never duplicate cards.

Never duplicate joins.

Keep code modular.

Avoid global variables.

## Development Process

Before changing code:

1. Read every file.
2. Understand architecture.
3. Explain your plan.

When modifying:

- Edit existing files.
- Replace entire implementations where needed.
- Do not rewrite the whole project unnecessarily.
- Keep commits small and logical.

Always ensure the project still runs after each milestone.
