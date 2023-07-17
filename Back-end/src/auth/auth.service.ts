import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import * as bcrypt from 'bcryptjs';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  async signUp(
    signUpDto: SignUpDto,
  ): Promise<{ keySecret: String; encryptedText: Buffer; token: string }> {
    const { name, email, password } = signUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const iv = randomBytes(16);
    const passwordAES = hashedPassword;
    //EncryptionAE-256-CTR
    const coffeSalt = randomBytes(4).toString();
    const key = (await promisify(scrypt)(passwordAES, coffeSalt, 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const keySecret = randomBytes(24).toString();
    const textToEncrypt = keySecret.toString();
    const encryptedText = Buffer.concat([
      cipher.update(textToEncrypt),
      cipher.final(),
    ]);
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      encryptedText: encryptedText,
      keySecret: keySecret,
    });
    const token = this.jwtService.sign({ id: user._id });
    return { keySecret, encryptedText, token };
  }
  async LogIn(LogInDto: LogInDto): Promise<{ token: string }> {
    const { email, password } = LogInDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = this.jwtService.sign({ id: user._id });
    return { token };
  }
}
