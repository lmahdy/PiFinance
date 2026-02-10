import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    companyId: string;
}
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    login(email: string, password: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: string;
            role: import("./roles.enum").UserRole;
            companyId: string;
        };
    }>;
}
