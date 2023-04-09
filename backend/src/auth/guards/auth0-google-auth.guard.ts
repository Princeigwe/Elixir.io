import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class Auth0GoogleAuthGuard extends AuthGuard('auth0-google') {}