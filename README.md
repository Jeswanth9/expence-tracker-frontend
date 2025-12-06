# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Docker / Docker Compose

This project includes a multi-stage Dockerfile which builds the Vite React app and serves the built static files with nginx.

You can use docker-compose to build and run the single image (production-ready static site). By default the container listens on port 80 inside the container and is mapped to port 3000 on the host.

Build the image and run the app:

```bash
docker compose build
docker compose up -d

# then open http://localhost:3000
```

Stop and remove the containers:

```bash
docker compose down
```

If you change frontend code and want to re-build the image you can run:

```bash
docker compose build --no-cache
docker compose up -d
```

Notes:
- This setup uses a single Docker image (multi-stage build) and serves the app with nginx. No separate dev/prod images are provided here, per request.
- If you prefer a dev workflow with hot reload, run `npm run dev` locally (Vite). The Docker image is intended as a production-style static build and serve.
