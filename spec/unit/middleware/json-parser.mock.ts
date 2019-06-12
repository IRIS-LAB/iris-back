import express from 'express'

export function expectAllIsFine(body: any) {
  throw new Error('should not be called')
}

export function get(req: express.Request, res: express.Response, next: express.NextFunction) {
  expectAllIsFine(req.body)
  res.send({})
}
