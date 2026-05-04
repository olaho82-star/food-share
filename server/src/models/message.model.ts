import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  listingId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
}

const messageSchema = new Schema<IMessage>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ listingId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, read: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
