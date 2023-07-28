import { Injectable, Search, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import { encryptUserObject } from 'src/utils/ecryption';
import { createPCAES } from 'src/utils/ecryption';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  async signUp(signUpDto: SignUpDto): Promise<{
    token: string;
  }> {
    const { name, email, password } = signUpDto;
    const keySecret = randomBytes(24).toString();
    console.log(keySecret);
    const user = await this.userModel.create({
      name,
      email,
      password: '',
      keySecret: keySecret,
    });
    await encryptUserObject(user, ['keySecret'], user._id, password);
    const { passwordAES } = await createPCAES(password, user._id);
    user.password = passwordAES;

    user.save();
    const token = this.jwtService.sign({ id: user._id });
    return { token };
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
