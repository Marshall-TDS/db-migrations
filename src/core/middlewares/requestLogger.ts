import type { NextFunction, Request, Response } from 'express'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = performance.now()

  res.on('finish', () => {
    const duration = (performance.now() - startedAt).toFixed(2)
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`

    if (res.statusCode >= 400) {
      console.warn(message)
    } else {
      console.info(message)
    }
  })

  next()
}

