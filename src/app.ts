import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { errorHandler } from './core/middlewares/errorHandler'
import { notFound } from './core/middlewares/notFound'
import { requestLogger } from './core/middlewares/requestLogger'
import { routes } from './routes'

export const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

