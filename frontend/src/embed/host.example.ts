/**
 * Example: how a host React app mounts EduCRM as `/education` section.
 * This file is documentation-only — copy the pattern into the host router.
 *
 * import { EducationApp } from 'education-crm-frontend/embed';
 * // or relative: import { EducationApp } from '../path-to-educrm/src/embed';
 *
 * function mapHostUser(u: HostUser): User {
 *   return {
 *     id: u.id,
 *     email: u.email,
 *     role: u.role, // must be ADMIN | TEACHER | STUDENT
 *     status: 'ACTIVE',
 *     createdAt: u.createdAt,
 *     profile: { id: u.id, firstName: u.firstName, lastName: u.lastName },
 *   };
 * }
 *
 * <Route
 *   path="/education/*"
 *   element={
 *     <EducationApp
 *       basePath="/education"
 *       apiBaseUrl={import.meta.env.VITE_EDUCRM_API_URL}
 *       token={hostAuth.token}
 *       user={mapHostUser(hostAuth.user)}
 *       onUnauthorized={() => hostAuth.logout() || navigate('/login')}
 *       onLogout={() => hostAuth.logout()}
 *     />
 *   }
 * />
 */
export {};
