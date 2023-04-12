import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class Auth0AuthGuard extends AuthGuard('auth0') {}