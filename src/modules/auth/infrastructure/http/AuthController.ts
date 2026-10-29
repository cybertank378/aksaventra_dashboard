import { type NextRequest, NextResponse } from "next/server";
import type { AuthServices } from "@/modules/auth/application/services/AuthServices";
import { getCurrentAuth } from "@/modules/auth/infrastructure/decorator/getCurrentAuth";
import { AuthValidator } from "@/modules/auth/infrastructure/validators/auth.validator";
import { AUTH_COOKIE } from "@/modules/auth/shared/constants/authCookie";

export class AuthController {
  constructor(private readonly authServices: AuthServices) {}

  public async login(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const validation = AuthValidator.validateLogin(body);

      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, message: "Validation error", errors: validation.errors },
          { status: 400 },
        );
      }

      const ipAddress = req.headers.get("x-forwarded-for") || undefined;
      const userAgent = req.headers.get("user-agent") || undefined;

      const result = await this.authServices.login({
        email: body.email,
        password: body.password,
        ipAddress,
        userAgent,
      });

      if (!result.isSuccess) {
        return NextResponse.json({ success: false, message: result.getError() }, { status: 401 });
      }

      const data = result.getValue();
      const response = NextResponse.json({ success: true, data }, { status: 200 });

      const isProduction = process.env.NODE_ENV === "production";

      // Set standard cookies for Proxy and Web Dashboard
      response.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, data.tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: data.tokens.expiresIn,
      });

      if (data.tokens.refreshToken) {
        response.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, data.tokens.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });
      }

      // Backward compatibility cookie
      response.cookies.set("auth_token", data.tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: data.tokens.expiresIn,
      });

      return response;
    } catch (error) {
      console.error("[AuthController.login]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async register(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const validation = AuthValidator.validateRegister(body);

      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, message: "Validation error", errors: validation.errors },
          { status: 400 },
        );
      }

      const result = await this.authServices.register({
        email: body.email,
        password: body.password,
        name: body.name,
      });

      if (!result.isSuccess) {
        return NextResponse.json({ success: false, message: result.getError() }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: result.getValue() }, { status: 201 });
    } catch (error) {
      console.error("[AuthController.register]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async logout(req: NextRequest): Promise<NextResponse> {
    try {
      const token =
        req.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value ||
        req.cookies.get("auth_token")?.value ||
        req.cookies.get("session_token")?.value;

      if (token) {
        await this.authServices.logout({ token });
      }

      const response = NextResponse.json(
        { success: true, message: "Logged out successfully" },
        { status: 200 },
      );

      response.cookies.delete(AUTH_COOKIE.ACCESS_TOKEN);
      response.cookies.delete(AUTH_COOKIE.REFRESH_TOKEN);
      response.cookies.delete("auth_token");
      response.cookies.delete("session_token");

      return response;
    } catch (error) {
      console.error("[AuthController.logout]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async me(req: NextRequest): Promise<NextResponse> {
    const auth = await getCurrentAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: auth }, { status: 200 });
  }

  public async validateAccessToken(req: NextRequest): Promise<NextResponse> {
    try {
      const authHeader = req.headers.get("authorization");
      let token: string | undefined;

      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      } else {
        token =
          req.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value ||
          req.cookies.get("auth_token")?.value ||
          req.cookies.get("session_token")?.value;
      }

      if (!token) {
        return NextResponse.json(
          { success: false, message: "Authentication token missing" },
          { status: 401 },
        );
      }

      const result = await this.authServices.validateAccessToken({ token });
      if (!result.isSuccess) {
        return NextResponse.json({ success: false, message: result.getError() }, { status: 401 });
      }

      return NextResponse.json({ success: true, data: result.getValue() }, { status: 200 });
    } catch (error) {
      console.error("[AuthController.validateAccessToken]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async refreshToken(req: NextRequest): Promise<NextResponse> {
    try {
      let refreshToken: string | undefined;

      try {
        const body = await req.json();
        refreshToken = body.refreshToken;
      } catch {
        // Body might be empty, try cookies
      }

      if (!refreshToken) {
        refreshToken = req.cookies.get(AUTH_COOKIE.REFRESH_TOKEN)?.value;
      }

      if (!refreshToken) {
        return NextResponse.json(
          { success: false, message: "Refresh token is required" },
          { status: 400 },
        );
      }

      const result = await this.authServices.refreshToken({ refreshToken });
      if (!result.isSuccess) {
        return NextResponse.json({ success: false, message: result.getError() }, { status: 401 });
      }

      const data = result.getValue();
      const response = NextResponse.json({ success: true, data }, { status: 200 });

      const isProduction = process.env.NODE_ENV === "production";
      response.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, data.tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: data.tokens.expiresIn,
      });

      if (data.tokens.refreshToken) {
        response.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, data.tokens.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
      }

      return response;
    } catch (error) {
      console.error("[AuthController.refreshToken]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async forgotPassword(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const validation = AuthValidator.validateForgotPassword(body);

      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, message: "Validation error", errors: validation.errors },
          { status: 400 },
        );
      }

      const result = await this.authServices.forgotPassword({ email: body.email });
      if (!result.isSuccess) {
        return NextResponse.json({ success: false, message: result.getError() }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: result.getValue() }, { status: 200 });
    } catch (error) {
      console.error("[AuthController.forgotPassword]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async resetPassword(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const validation = AuthValidator.validateResetPassword(body);

      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, message: "Validation error", errors: validation.errors },
          { status: 400 },
        );
      }

      const result = await this.authServices.resetPassword({
        token: body.token,
        newPassword: body.newPassword,
      });

      if (!result.isSuccess) {
        return NextResponse.json({ success: false, message: result.getError() }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: result.getValue() }, { status: 200 });
    } catch (error) {
      console.error("[AuthController.resetPassword]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async changePassword(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      if (!auth) {
        return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
      }

      const body = await req.json();
      const validation = AuthValidator.validateChangePassword({
        ...body,
        userId: auth.userId,
      });

      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, message: "Validation error", errors: validation.errors },
          { status: 400 },
        );
      }

      const result = await this.authServices.changePassword({
        userId: auth.userId,
        oldPassword: body.oldPassword,
        newPassword: body.newPassword,
      });

      if (!result.isSuccess) {
        return NextResponse.json({ success: false, message: result.getError() }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: result.getValue() }, { status: 200 });
    } catch (error) {
      console.error("[AuthController.changePassword]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async logoutAll(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      if (auth) {
        await this.authServices.logoutAll({ userId: auth.userId });
      }

      const response = NextResponse.json(
        { success: true, message: "Logged out from all devices successfully" },
        { status: 200 },
      );

      response.cookies.delete(AUTH_COOKIE.ACCESS_TOKEN);
      response.cookies.delete(AUTH_COOKIE.REFRESH_TOKEN);
      response.cookies.delete("auth_token");
      response.cookies.delete("session_token");

      return response;
    } catch (error) {
      console.error("[AuthController.logoutAll]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async verifyEmail(req: NextRequest): Promise<NextResponse> {
    try {
      let token: string | undefined;

      try {
        const body = await req.json();
        token = body.token;
      } catch {
        token = req.nextUrl.searchParams.get("token") || undefined;
      }

      if (!token) {
        return NextResponse.json(
          { success: false, message: "Verification token is required" },
          { status: 400 },
        );
      }

      const result = await this.authServices.verifyEmail({ token });
      if (!result.isSuccess) {
        return NextResponse.json({ success: false, message: result.getError() }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: result.getValue() }, { status: 200 });
    } catch (error) {
      console.error("[AuthController.verifyEmail]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async sendVerification(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      let userId = auth?.userId;

      if (!userId) {
        try {
          const body = await req.json();
          userId = body.userId;
        } catch {
          // body may be empty
        }
      }

      if (!userId) {
        return NextResponse.json(
          { success: false, message: "User ID is required" },
          { status: 400 },
        );
      }

      const result = await this.authServices.sendVerification({ userId });
      if (!result.isSuccess) {
        return NextResponse.json({ success: false, message: result.getError() }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: result.getValue() }, { status: 200 });
    } catch (error) {
      console.error("[AuthController.sendVerification]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }

  public async getTelemetry(_req: NextRequest): Promise<NextResponse> {
    try {
      const result = await this.authServices.getPortalTelemetry();
      if (!result.isSuccess) {
        return NextResponse.json({ success: false, message: result.getError() }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: result.getValue() }, { status: 200 });
    } catch (error) {
      console.error("[AuthController.getTelemetry]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
  }
}
