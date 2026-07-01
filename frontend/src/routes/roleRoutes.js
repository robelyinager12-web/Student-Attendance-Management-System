import { ROLES } from '../utils/constants';

export const roleRoutes = {
  [ROLES.ADMIN]: '/dashboard/admin',
  [ROLES.TEACHER]: '/dashboard/teacher',
  [ROLES.STUDENT]: '/dashboard/student',
};

export function getDefaultRoute(role) {
  return roleRoutes[role] || '/login';
}