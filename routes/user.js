import { Router } from 'express';

import { getUserStatus, updateUserState } from '../controllers/user.js';

const router = Router();

router.get('/users/:userId/status', getUserStatus);

router.patch('/users/:userId/status', updateUserState);

export default router;
