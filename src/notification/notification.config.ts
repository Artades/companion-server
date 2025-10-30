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

type NotificationTemplate<T extends NotificationType> = {
  title: string;
  message: (payload: NotificationPayloads[T]) => string;
};

export const NotificationTemplates: {
  [K in NotificationType]: NotificationTemplate<K>;
} = {
  [NotificationType.FRIEND_REQUEST]: {
    title: 'Запрос в друзья',
    message: ({ from }) => `${from} хочет добавить вас в друзья.`,
  },
  [NotificationType.FRIEND_ACCEPTED]: {
    title: 'Заявка принята',
    message: ({ from }) => `${from} принял(а) вашу заявку в друзья.`,
  },
  [NotificationType.EVENT_INVITE]: {
    title: 'Приглашение на событие',
    message: ({ from, event }) => `${from} пригласил(а) вас на событие "${event}".`,
  },
  [NotificationType.EVENT_REMINDER]: {
    title: 'Напоминание о событии',
    message: ({ event, time }) => `Скоро начнётся событие "${event}" (${time}).`,
  },
  [NotificationType.EVENT_UPDATE]: {
    title: 'Изменение события',
    message: ({ event }) => `Событие "${event}" было обновлено.`,
  },
  [NotificationType.COMMENT]: {
    title: 'Новый комментарий',
    message: ({ from, post }) => `${from} оставил(а) комментарий к "${post}".`,
  },
  [NotificationType.LIKE]: {
    title: 'Новый лайк',
    message: ({ from, post }) => `${from} понравилась ваша запись "${post}".`,
  },
  [NotificationType.SYSTEM]: {
    title: 'Системное уведомление',
    message: ({ text }) => text || 'У вас новое уведомление.',
  },
  FOLLOW: {
    title: '',
    message: ({ follower }) => `${follower} подписался на вас`,
  },
  MENTION: {
    title: 'Вас упомянули',
    message: ({ from, context }) => `${from} упомянул(а) вас: "${context}"`,
  },
  BADGE_EARNED: {
    title: 'Награда получена',
    message: ({ badge }) => `Вы получили новый бейдж: "${badge}"`,
  },
  POST_PUBLISHED: {
    title: 'Пост опубликован',
    message: ({ post }) => `Ваш пост "${post}" опубликован.`,
  },
};
