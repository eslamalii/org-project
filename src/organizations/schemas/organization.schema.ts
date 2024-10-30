import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true })
export class Organization {
  @Prop({
    required: true,
    unique: true,
    default: uuidv4(),
  })
  organization_id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  organization_members: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
