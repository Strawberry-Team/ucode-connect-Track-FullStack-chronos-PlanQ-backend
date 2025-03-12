// src/common/services/password.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordService {
    private readonly saltRounds: number;

    constructor(private configService: ConfigService) {
        // Get salt rounds from environment with fallback to 10
        this.saltRounds = Number(this.configService.get<number>('app.passwordSaltRounds'));
    }

    async hash(plainPassword: string): Promise<string> {
        return bcrypt.hash(plainPassword, this.saltRounds);
    }

    async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}