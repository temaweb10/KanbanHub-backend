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
