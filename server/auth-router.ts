import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { supabase } from "./db";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { isSuperAdmin } from "./middleware";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authRouter = router({
  // Login tradicional con username/password
  login: publicProcedure
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Buscar usuario por username
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', input.username)
        .single();

      if (error || !profile) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuario o contraseña incorrectos',
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(input.password, profile.password_hash);
      
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuario o contraseña incorrectos',
        });
      }

      // Crear token JWT
      const token = jwt.sign(
        {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          storeId: profile.storeId,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Establecer cookie de sesión
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      return {
        success: true,
        token,
        user: {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          storeId: profile.storeId,
        },
      };
    }),

  // Obtener usuario actual
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user || null;
  }),

  // Logout
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  // Cambiar contraseña (usuario actual)
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(4),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No autenticado',
        });
      }

      // Obtener usuario actual
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ctx.user.id)
        .single();

      if (error || !profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuario no encontrado',
        });
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(input.currentPassword, profile.passwordHash);
      
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Contraseña actual incorrecta',
        });
      }

      // Hashear nueva contraseña
      const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

      // Actualizar contraseña
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ passwordHash: newPasswordHash })
        .eq('id', ctx.user.id);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar contraseña',
        });
      }

      return { success: true };
    }),
});

export const usersRouter = router({
  // Listar todos los usuarios (solo superadmin)
  list: protectedProcedure.query(async ({ ctx }) => {
    isSuperAdmin(ctx);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, name, email, role, store_id, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }),

  // Crear usuario (solo superadmin)
  create: protectedProcedure
    .input(z.object({
      username: z.string().min(3),
      password: z.string().min(4),
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(['superadmin', 'admin', 'store_user']),
      storeId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      isSuperAdmin(ctx);

      // Verificar que el username no exista
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', input.username)
        .single();

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'El nombre de usuario ya existe',
        });
      }

      // Hashear contraseña
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Crear usuario
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          username: input.username,
          passwordHash: passwordHash,
          name: input.name,
          email: input.email,
          role: input.role,
          storeId: input.storeId,
        })
        .select('id, username, name, email, role, store_id, created_at')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Actualizar usuario (solo superadmin)
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      username: z.string().min(3).optional(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      role: z.enum(['superadmin', 'admin', 'store_user']).optional(),
      storeId: z.string().uuid().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      isSuperAdmin(ctx);

      const { id, ...updates } = input;

      // Si se está actualizando el username, verificar que no exista
      if (updates.username) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', updates.username)
          .neq('id', id)
          .single();

        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'El nombre de usuario ya existe',
          });
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select('id, username, name, email, role, store_id, created_at')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Cambiar contraseña de cualquier usuario (solo superadmin)
  changePassword: protectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      newPassword: z.string().min(4),
    }))
    .mutation(async ({ ctx, input }) => {
      isSuperAdmin(ctx);

      // Hashear nueva contraseña
      const passwordHash = await bcrypt.hash(input.newPassword, 10);

      // Actualizar contraseña
      const { error } = await supabase
        .from('profiles')
        .update({ passwordHash: passwordHash })
        .eq('id', input.userId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar contraseña',
        });
      }

      return { success: true };
    }),

  // Eliminar usuario (solo superadmin)
  delete: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      isSuperAdmin(ctx);

      // No permitir eliminar el usuario admin por defecto
      if (input.id === 'admin-superuser') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No se puede eliminar el usuario administrador por defecto',
        });
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { success: true };
    }),
});
