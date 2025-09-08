import { Roles } from "./Roles.model";

export interface Representative {
  id: number;
  username?: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  token: string | null;
  name:string;
  role:Roles;
  isRepresentative:boolean;
}

export interface AddOrUpdateRepresentativeData {
  id?:number;
  username: string;
  name:string;
  email: string;
  phoneNumber: string;
  isActive:boolean;
  userStatus: string;
  roleId:number
  isRepresentative:boolean
}