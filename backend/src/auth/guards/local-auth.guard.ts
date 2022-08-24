import { Injectable } from "@nestjs/common";
import {AuthGuard} from '@nestjs/passport'

// The default name for the implemented Passport local strategy is 'local'. 
// So AuthGuard already knows that the Passport Local strategy is used here
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') { }