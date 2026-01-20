export interface UserInfo {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    companyName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthResponse {
    token: string;
    user: UserInfo;
}
