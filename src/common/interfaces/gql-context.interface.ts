import type { Request, Response } from 'express';

export interface GqlContent {
  req: Request;
  res: Response;
}
