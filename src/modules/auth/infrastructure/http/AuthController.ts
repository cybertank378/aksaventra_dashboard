import { type NextRequest, NextResponse } from "next/server";
import { AuthServices } from "@/modules/auth/application/services/AuthServices";
import { getCurrentAuth } from "@/modules/auth/infrastructure/decorator/getCurrentAuth";
import { AuthValidator } from "@/modules/auth/infrastructure/validators/auth.validator";

export class AuthController {
  private readonly authServices: AuthServices;

  constructor(authServices?: AuthServices) {
    this.authServices = authServices ?? new AuthServices();
  }

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

      response.cookies.set("auth_token", data.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
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
      const token = req.cookies.get("auth_token")?.value || req.cookies.get("session_token")?.value;

      if (token) {
        await this.authServices.logout(token);
      }

      const response = NextResponse.json(
        { success: true, message: "Logged out successfully" },
        { status: 200 },
      );

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
}
