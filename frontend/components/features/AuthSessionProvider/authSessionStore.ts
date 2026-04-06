"use client";

export async function notifyAuthSessionError(errorResponse: unknown) {
  await authSessionErrorHandler?.(errorResponse);
}

let authSessionErrorHandler: typeof notifyAuthSessionError | null = null;

export const registerAuthSessionErrorHandler = (
  handler: NonNullable<typeof authSessionErrorHandler>,
) => {
  authSessionErrorHandler = handler;
};

export const unregisterAuthSessionErrorHandler = () => {
  authSessionErrorHandler = null;
};
