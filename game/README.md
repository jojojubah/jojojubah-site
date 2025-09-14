# Bitcoin Runner Game Files

## File Structure:
```
website/
├── game.html                    # Main website game page (styled wrapper)
├── index.html                   # Main website homepage  
└── game/                        # Game subdirectory
    ├── index.html               # WASM game loader (this directory)
    ├── src/main.rs              # Rust game source
    ├── Cargo.toml              # Rust project config
    └── target/wasm32.../bitcoin_runner.wasm  # Compiled game
```

## Important Distinctions:

### `/game.html` (Main Website)
- Styled page that's part of JojoJubah website
- Matches site theme and branding
- Will load the WASM game from `/game/` subdirectory
- Accessed via homepage "Play Game" button

### `/game/index.html` (WASM Loader)
- Simple HTML file specifically for loading WASM
- Handles WebGL context and WASM imports
- No website styling - just game functionality  
- Direct access for testing: `localhost:8000/game/`

### `/index.html` (Website Homepage)
- Main JojoJubah website homepage
- Contains all website content, projects, etc.
- Has "Bitcoin Runner Game" card that links to `/game.html`

## Testing:
- For game testing: Serve from `/game/` directory
- For full integration: Serve from website root and click "Play Game"