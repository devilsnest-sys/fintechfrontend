import { PermissionWithRoleName } from "./Permission.model";

export interface UserInterface {
  id: number;
  name: string;
  email: string;
  phoneNumber:string;
  userType?:string;
  role: PermissionWithRoleName;
  isActive:boolean
  token?: string;
}