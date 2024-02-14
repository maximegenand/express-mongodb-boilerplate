const allRoles = {
  user: [] as const,
  admin: ["getUsers", "manageUsers"] as const,
};

type Role = keyof typeof allRoles;
type Rights = (typeof allRoles)[Role][number];

const ROLES = Object.keys(allRoles);
const ROLE_RIGHTS = allRoles;

export { ROLES, ROLE_RIGHTS };
export type { Role, Rights };
