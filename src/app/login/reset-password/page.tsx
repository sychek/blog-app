'use client';

import { Suspense } from 'react';
import ResetPassword from './resetPassword';

export default function ResetPasswordPage() {

  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}

