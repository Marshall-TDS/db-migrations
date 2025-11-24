import { Router } from 'express'
import { migrationController } from '../modules/migrations/controllers/MigrationController'

export const routes = Router()

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'db-migrations' })
})

routes.post('/migrations/run', migrationController.run)

