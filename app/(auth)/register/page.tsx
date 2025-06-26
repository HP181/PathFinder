'use client';

import React, { useState } from 'react';
import { RegisterForm } from '@/components/Auth/Register';
import { UserRole } from '@/lib/Firebase/Auth';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  return <RegisterForm role={selectedRole} onSelectRole={setSelectedRole} />;
}