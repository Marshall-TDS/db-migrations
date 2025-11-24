import { config } from 'dotenv'

config()

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  app: {
    port: Number(process.env.PORT ?? 3444),
  },
}

