import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageResponseDto } from './dto/message-response.dto';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async findByCode(code: string): Promise<MessageResponseDto> {
    const doc = await this.messageModel
      .findOne({ code: code.toUpperCase() })
      .lean()
      .exec();

    if (!doc) {
      throw new NotFoundException(
        'No pudimos encontrar este mensaje. Revisa que el enlace esté completo o pídenos que te lo enviemos otra vez.',
      );
    }

    if (!doc.isActive) {
      throw new GoneException('Este enlace ya no está disponible.');
    }

    return {
      id: doc._id.toString(),
      code: doc.code,
      audienceType: doc.audienceType,
      recipientName: doc.recipientName,
      slides: doc.slides,
    };
  }
}
