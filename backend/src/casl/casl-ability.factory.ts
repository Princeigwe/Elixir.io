import {Injectable} from '@nestjs/common'
import {User} from '../users/users.schema'
import {Model} from 'mongoose'
import {Doctor, DoctorDocument} from '../profiles/schemas/doctor.schema'
import { InferSubjects, PureAbility, AbilityBuilder, AbilityClass, ExtractSubjectType} from '@casl/ability'
import {Action} from '../enums/action.enum'
import { InjectModel } from '@nestjs/mongoose'



@Injectable()
export class CaslAbilityFactory {
    constructor(
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>
    ) {}

    createForUser(user: User) {
        const {can, build} = new AbilityBuilder(
            PureAbility as AbilityClass< PureAbility<[Action, InferSubjects<typeof this.doctorModel> | 'all']> >
        )

        if(user.role == "Admin"){
            can(Action.Manage, 'all')
        }

        can(Action.Update, this.doctorModel)

        return build({
            detectSubjectType: (item) => item.constructor as ExtractSubjectType<InferSubjects<typeof this.doctorModel> | 'all'>
        })
    }
}
