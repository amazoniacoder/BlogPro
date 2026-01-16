// client/src/utils/toast-translations.ts
export const toastTranslations: Record<string, string> = {
  // Authentication messages
  "Login successful!": "Вход выполнен успешно!",
  "Please verify the captcha": "Пожалуйста, подтвердите капчу",
  "Registration successful! Please check your email.": "Регистрация успешна! Проверьте вашу электронную почту.",
  "Passwords do not match": "Пароли не совпадают",
  "Password reset instructions sent to your email": "Инструкции по сбросу пароля отправлены на вашу почту",
  "Password must be at least 8 characters long": "Пароль должен содержать не менее 8 символов",
  "Password reset successfully! You can now login with your new password.": "Пароль успешно сброшен! Теперь вы можете войти с новым паролем.",

  // User management
  "Failed to load user": "Не удалось загрузить пользователя",
  "User created successfully": "Пользователь успешно создан",
  "User updated successfully": "Пользователь успешно обновлен",
  "User deleted successfully": "Пользователь успешно удален",
  "Failed to delete user": "Не удалось удалить пользователя",

  // Profile
  "Account scheduled for deletion. You will be logged out.": "Аккаунт запланирован к удалению. Вы будете разлогинены.",

  // Media upload
  "File uploaded successfully": "Файл успешно загружен",
  "Failed to upload file": "Не удалось загрузить файл",

  // Generic messages
  "Success": "Успешно",
  "Error": "Ошибка",
  "Failed to save": "Не удалось сохранить",
  "Saved successfully": "Успешно сохранено",
  "Failed to load": "Не удалось загрузить",
  "Loaded successfully": "Успешно загружено",
  "Failed to delete": "Не удалось удалить",
  "Deleted successfully": "Успешно удалено",
  "Failed to update": "Не удалось обновить",
  "Updated successfully": "Успешно обновлено",
  "Failed to create": "Не удалось создать",
  "Created successfully": "Успешно создано"
};

export const translateToastMessage = (message: string): string => {
  return toastTranslations[message] || message;
};
