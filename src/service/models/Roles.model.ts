
export interface Roles {
  id?: number;
  name?:string;
  isActive?:boolean;
}

export interface AddOrUpdateRole {
  id?:number;
  name:string;
}