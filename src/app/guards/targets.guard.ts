import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const targetsGuard: CanActivateFn = () => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  
  const targets = storageService.getTargets();
  if (!targets) {
    return router.createUrlTree(['/settings']);
  }
  return true;
};

