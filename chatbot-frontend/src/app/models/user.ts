
export interface User{
    idUser?:number;
    email:string;
    password:string;
    name?:string;
    surname?:string;
    role?:string;
    banned?:boolean;
}

export interface AuthToken{
    accessToken:string;
}