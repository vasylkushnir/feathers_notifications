import Joi from 'joi';
import { NotificationType } from '../../models/notifications.model';
const description = Joi.string().trim().min(1).max(100);
const isRead = Joi.boolean().invalid(false);
const type = Joi.string().valid(...Object.values(NotificationType));
const userId = Joi.string().uuid();
const limit = Joi.number().min(1).max(100).default(20);
const skip = Joi.number().min(1).max(100).default(0);

export const createNotificationSchema = Joi.object({
  description: description.required(),
  type: type.required(),
  userId: userId.required(),
});

export const notificationId = Joi.object({
  id: Joi.string().uuid().required(),
});

export const getNotificationFilters = Joi.object({
  userId,
  isRead,
  type,
  $limit: limit,
  $skip: skip,
});

export const updateNotificationSchema = Joi.object({
  isRead: isRead.required(),
});
