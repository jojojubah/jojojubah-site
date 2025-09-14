# Building Bitcoin Runner

## Prerequisites

1. Install Rust: https://rustup.rs/
2. Add WASM target:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

## FIXED: Build Commands

### Step 1: Build the game (run this from the game/ directory):
```bash
cargo build --target wasm32-unknown-unknown --release
```

### Step 2: Install wasm-bindgen-cli (one-time setup):
```bash
cargo install wasm-bindgen-cli
```

### Step 3: Generate web files:
```bash
# Create web directory
mkdir web

# Generate web bindings (from game/ directory)
wasm-bindgen --out-dir web --target web --no-typescript target/wasm32-unknown-unknown/release/bitcoin_runner.wasm
```

## Alternative: Use basic-http-server for testing
```bash
# Install basic server
cargo install basic-http-server

# Serve the files (from website root directory)
basic-http-server .
```

## Files Generated:
- `web/bitcoin_runner.js` - JavaScript glue code
- `web/bitcoin_runner_bg.wasm` - Compiled game

## Final Structure:
```
website/
├── game.html (loads the game)
├── game/
│   ├── web/
│   │   ├── bitcoin_runner.js
│   │   └── bitcoin_runner_bg.wasm
│   └── src/main.rs
└── ... (other website files)
```

## Troubleshooting:
- Fixed Cargo.toml library configuration issue
- Simplified dependencies to just macroquad and rand
- Make sure to run commands from correct directory