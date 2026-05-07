import { BadRequestException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

export type NotificationPayloads = {
  [NotificationType.FRIEND_REQUEST]: { from: string };
  [NotificationType.FRIEND_ACCEPTED]: { from: string };
  [NotificationType.EVENT_INVITE]: { from: string; event: string };
  [NotificationType.EVENT_REMINDER]: { event: string; time: string };
  [NotificationType.EVENT_UPDATE]: { event: string };
  [NotificationType.COMMENT]: { from: string; post: string };
  [NotificationType.LIKE]: { from: string; post: string };
  [NotificationType.SYSTEM]: { text?: string };
  [NotificationType.FOLLOW]: { follower: string };
  [NotificationType.MENTION]: { from: string; context: string };
  [NotificationType.BADGE_EARNED]: { badge: string };
  [NotificationType.POST_PUBLISHED]: { post: string };
};

export type NotificationPayload<T extends NotificationType> = NotificationPayloads[T];

type Template<T extends NotificationType> = {
  title: string;
  message: (data: NotificationPayload<T>) => string;
  validate: (data: unknown) => data is NotificationPayload<T>;
};

type NotificationTemplates = {
  [T in NotificationType]: Template<T>;
};

function isObject(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
}

function hasString(data: Record<string, unknown>, key: string): boolean {
  return typeof data[key] === 'string' && data[key].trim().length > 0;
}

export const NotificationTemplates: NotificationTemplates = {
  [NotificationType.FRIEND_REQUEST]: {
    title: 'Запрос в друзья',
    message: (data) => `${data.from} хочет добавить вас в друзья`,
    validate: (data): data is NotificationPayload<'FRIEND_REQUEST'> =>
      isObject(data) && hasString(data, 'from'),
  },

  [NotificationType.FRIEND_ACCEPTED]: {
    title: 'Заявка принята',
    message: (data) => `${data.from} принял(а) вашу заявку`,
    validate: (data): data is NotificationPayload<'FRIEND_ACCEPTED'> =>
      isObject(data) && hasString(data, 'from'),
  },

  [NotificationType.EVENT_INVITE]: {
    title: 'Приглашение',
    message: (data) => `${data.from} пригласил вас на "${data.event}"`,
    validate: (data): data is NotificationPayload<'EVENT_INVITE'> =>
      isObject(data) && hasString(data, 'from') && hasString(data, 'event'),
  },

  [NotificationType.EVENT_REMINDER]: {
    title: 'Напоминание',
    message: (data) => `Событие "${data.event}" скоро (${data.time})`,
    validate: (data): data is NotificationPayload<'EVENT_REMINDER'> =>
      isObject(data) && hasString(data, 'event') && hasString(data, 'time'),
  },

  [NotificationType.EVENT_UPDATE]: {
    title: 'Обновление события',
    message: (data) => `Событие "${data.event}" обновлено`,
    validate: (data): data is NotificationPayload<'EVENT_UPDATE'> =>
      isObject(data) && hasString(data, 'event'),
  },

  [NotificationType.COMMENT]: {
    title: 'Комментарий',
    message: (data) => `${data.from} прокомментировал "${data.post}"`,
    validate: (data): data is NotificationPayload<'COMMENT'> =>
      isObject(data) && hasString(data, 'from') && hasString(data, 'post'),
  },

  [NotificationType.LIKE]: {
    title: 'Лайк',
    message: (data) => `${data.from} лайкнул "${data.post}"`,
    validate: (data): data is NotificationPayload<'LIKE'> =>
      isObject(data) && hasString(data, 'from') && hasString(data, 'post'),
  },

  [NotificationType.SYSTEM]: {
    title: 'Система',
    message: (data) => data.text || 'Новое уведомление',
    validate: (data): data is NotificationPayload<'SYSTEM'> =>
      data === undefined ||
      (isObject(data) && (data.text === undefined || hasString(data, 'text'))),
  },

  [NotificationType.FOLLOW]: {
    title: 'Подписка',
    message: (data) => `${data.follower} подписался на вас`,
    validate: (data): data is NotificationPayload<'FOLLOW'> =>
      isObject(data) && hasString(data, 'follower'),
  },

  [NotificationType.MENTION]: {
    title: 'Упоминание',
    message: (data) => `${data.from} упомянул вас: "${data.context}"`,
    validate: (data): data is NotificationPayload<'MENTION'> =>
      isObject(data) && hasString(data, 'from') && hasString(data, 'context'),
  },

  [NotificationType.BADGE_EARNED]: {
    title: 'Бейдж',
    message: (data) => `Вы получили "${data.badge}"`,
    validate: (data): data is NotificationPayload<'BADGE_EARNED'> =>
      isObject(data) && hasString(data, 'badge'),
  },

  [NotificationType.POST_PUBLISHED]: {
    title: 'Пост',
    message: (data) => `Пост "${data.post}" опубликован`,
    validate: (data): data is NotificationPayload<'POST_PUBLISHED'> =>
      isObject(data) && hasString(data, 'post'),
  },
};

export function buildNotificationContent<T extends NotificationType>(
  type: T,
  data: unknown,
): { title: string; message: string; data: NotificationPayload<T> } {
  const template = NotificationTemplates[type];

  if (!template.validate(data)) {
    throw new BadRequestException(`Invalid payload for notification type ${type}`);
  }

  return {
    title: template.title,
    message: template.message(data),
    data,
  };
}
