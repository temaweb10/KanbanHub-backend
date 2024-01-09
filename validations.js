import { body } from "express-validator";

export const loginValidation = [
  body("email", "Неверный форма почты").isEmail(),
  body("password", "Пароль минимум 5 символов").isLength({ min: 5 }),
];

export const registerValidation = [
  body("email", "Неверный форма почты").isEmail(),
  body("password", "Пароль минимум 5 символов").isLength({ min: 5 }),
  body("fullName", "Укажите имя").isLength({ min: 3 }),
  body("avatarUrl", "Неверная ссылка на изображение").optional().isURL(),
];
export const projectValidation = [
  body(
    "nameProject",
    "Название проекта должно иметь максимум 40 символов , и минумум 3 "
  ).isLength({ max: 40, min: 3 }),
  body("code", "Укажите код проекта максимум 10 символов").isLength({
    max: 10,
  }),
];
export const kanbanCardCreateValidation = [
  body(
    "nameProject",
    "Название проекта должно иметь максимум 40 символов , и минумум 3 "
  ).isLength({ max: 40, min: 3 }),
  body("code", "Укажите код проекта максимум 10 символов").isLength({
    max: 10,
  }),
];
