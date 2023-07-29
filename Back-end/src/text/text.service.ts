import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createDecipheriv, scrypt } from 'crypto';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/users.schema';
import { decryptData } from 'src/utils/decryption';
import { encryptData } from 'src/utils/ecryption';
import { promisify } from 'util';
import { TextDto } from './dto/text.dto';

@Injectable()
export class TextService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async textEncrypt(fileUserId: string, TextDto: TextDto): Promise<string> {
    const { Text } = TextDto;
    const user = await this.userModel.findById(fileUserId);
    // Get information for decryption
    const ids = user.password.search(`${user._id}`);
    const paswordHash = user.password.slice(0, ids - 20);
    const iv = Buffer.from(user.password.slice(ids - 16, ids), 'binary');
    const coffeSalt = user.password.slice(ids - 20, ids - 16);
    // Encrypt key secret
    const keySecretDec = (await promisify(scrypt)(
      paswordHash,
      coffeSalt,
      32,
    )) as Buffer;
    const decipherKeySecret = createDecipheriv('aes-256-ctr', keySecretDec, iv);
    const decryptedKeySecret = Buffer.concat([
      decipherKeySecret.update(user.keySecret),
      decipherKeySecret.final(),
    ]);
    // Encrypt file properties
    const keySecretFile = decryptedKeySecret.toString();
    const key = (await promisify(scrypt)(
      keySecretFile,
      coffeSalt,
      32,
    )) as Buffer;
    // Implement the 'encryptData' function to encrypt the file data
    const TextEnt = await encryptData(Buffer.from(Text), iv, key).toString();
    return TextEnt;
  }

  async textDecrypt(fileUserId: string, TextDto: TextDto): Promise<string> {
    const user = await this.userModel.findById(fileUserId);
    const { Text } = TextDto;
    // Get information for decryption
    const ids = user.password.search(`${user._id}`);
    const paswordHash = user.password.slice(0, ids - 20);
    const iv = Buffer.from(user.password.slice(ids - 16, ids), 'binary');
    const coffeSalt = user.password.slice(ids - 20, ids - 16);
    // Encrypt key secret
    const keySecretDec = (await promisify(scrypt)(
      paswordHash,
      coffeSalt,
      32,
    )) as Buffer;
    const decipherKeySecret = createDecipheriv('aes-256-ctr', keySecretDec, iv);
    const decryptedKeySecret = Buffer.concat([
      decipherKeySecret.update(user.keySecret),
      decipherKeySecret.final(),
    ]);
    // Encrypt file properties
    const keySecretFile = decryptedKeySecret.toString();
    const key = (await promisify(scrypt)(
      keySecretFile,
      coffeSalt,
      32,
    )) as Buffer;
    // Implement the 'encryptData' function to encrypt the file data
    const TextEnt = await decryptData(Text, iv, key).toString();
    return TextEnt;
  }
}
