import { Slide } from '../schemas/message.schema';

export class MessageResponseDto {
  id: string;
  code: string;
  audienceType: string;
  recipientName: string | null;
  slides: Slide[];
}
