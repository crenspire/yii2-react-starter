<?php

return [
    'adminEmail' => env('ADMIN_EMAIL', 'admin@example.com'),
    'senderEmail' => env('SENDER_EMAIL', 'noreply@example.com'),
    'senderName' => env('SENDER_NAME', 'Yii2 Starter'),

    // Password reset links expire after this many seconds
    'passwordResetTokenExpire' => 3600,
    // Minimum seconds between two password reset emails for the same address
    'passwordResetThrottle' => 60,

    // Failed login attempts allowed per email + IP within the lockout window
    'loginMaxAttempts' => 5,
    'loginLockoutDuration' => 900,

    // "Remember me" cookie lifetime in seconds
    'rememberMeDuration' => 3600 * 24 * 30,
];
