import { Router, Request, Response } from 'express';
import { ok } from '../../shared/http';
import { ensureCsrfToken } from '../../middleware/csrf';

const router = Router();

router.get('/csrf', (req: Request, res: Response) => {
  const csrfToken = ensureCsrfToken(req);
  ok(res, { csrfToken });
});

export const authRoutes = router;
export default router;
