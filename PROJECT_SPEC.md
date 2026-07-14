# UNO Multiplayer
Version: 1.0
Status: Active Development

---

# Objective

Develop a production-quality multiplayer UNO game using Node.js, Express, Socket.IO, HTML, CSS and JavaScript.

The server is authoritative.

Clients never decide game state.

---

# Tech Stack

Backend
- Node.js
- Express
- Socket.IO

Frontend
- HTML
- CSS
- Vanilla JavaScript

No frontend frameworks.

---

# Current Architecture

server.js

Responsibilities

- Express server
- Socket.IO
- Room networking
- Broadcasting sanitized state
- No game logic

---

game/room.js

Responsibilities

Stores game state only.

Contains

- players
- deck
- discardPile
- currentPlayer
- direction
- started

No rules.

No socket code.

---

game/deck.js

Responsibilities

Deck only.

Contains

- createDeck()
- shuffleDeck()
- drawCard()

Nothing else.

---

game/gameManager.js

Responsibilities

Controls the game.

Contains

- startGame()
- playCardAction()
- drawCardAction()
- advanceTurn()
- winner detection

Calls rules.js.

Never performs networking.

---

game/rules.js

Responsibilities

UNO rules only.

Contains

- isValidPlay()

Future

- applySkip()
- applyReverse()
- applyDrawTwo()
- applyWild()
- applyWildDrawFour()

Never touches sockets.

---

Frontend

script.js

Responsibilities

User input only.

Examples

Join

Start Game

Draw

Play Card

Only emits socket events.

Never validates anything.

---

ui.js

Responsibilities

Rendering only.

Receives server state.

Updates DOM.

No game logic.

No validation.

---

index.html

Structure only.

---

style.css

Presentation only.

---

# Networking

Server is authoritative.

Client only sends intentions.

Example

socket.emit("playCard")

Server validates.

Server updates room.

Server broadcasts sanitized state.

---

# Socket Events

Client → Server

join

startGame

playCard

drawCard

Server → Client

playerList

host

gameState

gameReset

gameOver

joinError

startError

actionError

---

# Security

Clients NEVER validate moves.

Clients NEVER modify room state.

Clients NEVER know opponents' hands.

Server broadcasts

Own hand

Opponent card counts

Top discard

Deck count

Turn

Direction

Nothing else.

---

# Coding Rules

Do not rename socket events.

Do not rename DOM ids.

Do not rewrite architecture.

Prefer extending existing code.

Never break existing functionality.

If one file changes,
check every dependent file.

No duplicated game logic.

Comments required for complex logic.

---

# Current Milestones

Completed

✓ Lobby

✓ Multiplayer

✓ Host

✓ Start Game

✓ Deck

✓ Shuffle

✓ Deal

✓ Number Card Validation

✓ Turn System

✓ Server Authoritative State

In Progress

□ Draw Card

Upcoming

□ Skip

□ Reverse

□ Draw Two

□ Wild

□ Wild Draw Four

□ UNO

□ Winner Screen

□ Restart

□ Reconnect

□ Mobile Layout

□ Animations

□ Sounds

---

# Git

Commit after every milestone.

Never commit known bugs.

Commit message format

Milestone X - Description

Example

Milestone 3 - Draw Card

---

# Testing Checklist

Every feature must preserve

Join

Lobby

Host

Start Game

Turn Order

Sanitized State

Reconnect Safety

No duplicate players

Server does not crash

No console errors

---

# Engineering Philosophy

Never sacrifice architecture for speed.

Working code is more valuable than clever code.

Every new feature should require minimal modification of existing files.

The server is always the single source of truth.

# Change Policy

Before implementing a feature:

1. Determine the minimum number of files that must change.
2. Do not modify any unrelated file.
3. Preserve all working functionality.
4. Backend changes require verifying frontend compatibility.
5. Frontend changes require verifying backend compatibility.
6. Every change must include a regression analysis before code generation.