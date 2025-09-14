# Alternative: Simple Deployment Method

If wasm-bindgen continues to have issues, macroquad has a simpler deployment method:

## Method 1: Use cargo-make (Recommended)
```bash
# Install cargo-make
cargo install cargo-make

# Deploy to web (this handles everything automatically)
cargo make serve
```

## Method 2: Manual simple deployment
1. Create a simple `index.html` in your game directory:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bitcoin Runner</title>
    <style>
        html, body, canvas {
            margin: 0px;
            padding: 0px;
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: absolute;
            background: black;
            z-index: 0;
        }
    </style>
</head>
<body>
    <canvas id="glcanvas" tabindex='1'></canvas>
    <script src="https://cdn.jsdelivr.net/npm/gl-matrix@3.3.0/gl-matrix-min.js"></script>
    <script>
        import("./bitcoin_runner.js").then(module => {
            module.main();
        });
    </script>
</body>
</html>
```

## Method 3: Try different wasm-bindgen command
```bash
# Sometimes this variant works better
wasm-bindgen --out-dir web --target web --no-typescript --omit-default-module-path target/wasm32-unknown-unknown/release/bitcoin_runner.wasm
```

Try the steps in the main conversation first, but if they fail, these alternatives should work!