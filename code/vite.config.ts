import path from "path"
import { defineConfig } from 'vitest/config'
import { loadEnv } from "vite"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function normalizeBasePath(value: string | undefined): string {
  if (!value || value.trim() === "") {
    return "/"
  }

  const trimmed = value.trim()
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`
}

function getManualChunkName(id: string): string | undefined {
  if (!id.includes("node_modules")) {
    return undefined
  }

  if (
    id.includes("/@tiptap/")
    || id.includes("/prosemirror-")
    || id.includes("/orderedmap/")
    || id.includes("/rope-sequence/")
    || id.includes("/w3c-keyname/")
  ) {
    return "vendor-editor"
  }

  if (
    id.includes("/@base-ui/")
    || id.includes("/@floating-ui/")
    || id.includes("/@radix-ui/")
  ) {
    return "vendor-ui"
  }

  if (id.includes("/@dnd-kit/")) {
    return "vendor-dnd"
  }

  if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) {
    return "vendor-react"
  }

  return undefined
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    base: normalizeBasePath(env.APP_BASE_PATH),
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            return getManualChunkName(id)
          },
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setupTests.ts",
    },
  }
})
