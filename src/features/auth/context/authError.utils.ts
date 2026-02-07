/**
 * Maps a Supabase / auth-related error to a user-friendly German message.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const e = error as {code: string; message: string};
    switch (e.code) {
      case 'invalid_credentials':
      case 'auth/invalid-credentials':
        return 'E-Mail oder Passwort ist falsch.';
      case 'user_not_found':
        return 'Kein Benutzer mit dieser E-Mail-Adresse gefunden.';
      case 'email_exists':
      case 'auth/email-already-in-use':
        return 'Diese E-Mail-Adresse wird bereits verwendet.';
      case 'weak_password':
      case 'auth/weak-password':
        return 'Das Passwort ist zu schwach.';
      case 'invalid_email':
      case 'auth/invalid-email':
        return 'Ungültige E-Mail-Adresse.';
      case 'too_many_requests':
      case 'auth/too-many-requests':
        return 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
      default:
        return `Authentifizierungsfehler: ${e.message}`;
    }
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as {message: string}).message;
  }
  return 'Ein unbekannter Fehler ist aufgetreten.';
};
