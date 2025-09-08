
export interface PermissionsList {
  id?: number;
  name?:string;
  description?:string;
    category: string;
  checkBoxChecked?:boolean
}

export interface UpdatePermissionWithRoleId {
  id:number;
  name?:string;
  permissions:{id:number}[];
}
export interface PermissionWithRoleName {
  id:number;
  name:string;
  permissions:PermissionsList[];
}