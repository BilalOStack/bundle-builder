/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the optional catalog API, e.g. http://localhost:5174/api */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
