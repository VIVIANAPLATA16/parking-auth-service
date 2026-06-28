import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import prisma from '../services/prisma.service';
import { signAccessToken, verifyAccessToken } from '../services/jwt.service';

const ok = (body: object, status = 200): APIGatewayProxyResultV2 => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const err = (message: string, status: number): APIGatewayProxyResultV2 => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ error: message }),
});

export const register = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) return err('Email y contraseña son requeridos', 400);
    if (password.length < 6) return err('La contraseña debe tener al menos 6 caracteres', 400);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return err('El email ya está registrado', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });

    return ok({ message: 'Usuario registrado exitosamente', user }, 201);
  } catch {
    return err('Error interno del servidor', 500);
  }
};

export const login = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) return err('Email y contraseña son requeridos', 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return err('Credenciales inválidas', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return err('Credenciales inválidas', 401);

    const payload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return ok({ accessToken, refreshToken });
  } catch {
    return err('Error interno del servidor', 500);
  }
};

export const refresh = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { refreshToken } = JSON.parse(event.body || '{}');

    if (!refreshToken) return err('Refresh token requerido', 400);

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return err('Refresh token inválido o expirado', 401);
    }

    const accessToken = signAccessToken({
      userId: stored.user.id,
      email: stored.user.email,
    });

    return ok({ accessToken });
  } catch {
    return err('Error interno del servidor', 500);
  }
};

export const logout = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { refreshToken } = JSON.parse(event.body || '{}');

    if (!refreshToken) return err('Refresh token requerido', 400);

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored) return err('Token no encontrado', 404);

    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revoked: true },
    });

    return ok({ message: 'Sesión cerrada exitosamente' });
  } catch {
    return err('Error interno del servidor', 500);
  }
};

export const me = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return err('Token no proporcionado', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, createdAt: true, updatedAt: true },
    });

    if (!user) return err('Usuario no encontrado', 401);

    return ok({ user });
  } catch {
    return err('Token inválido o expirado', 401);
  }
};
