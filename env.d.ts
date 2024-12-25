declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FAL_KEY: string
      // ... other env vars
    }
  }
}

export {} 