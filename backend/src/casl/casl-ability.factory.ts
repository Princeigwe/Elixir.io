import {Injectable} from '@nestjs/common'
import {User} from '../users/users.schema'
import {Doctor} from '../profiles/schemas/doctor.schema'
import {Patient} from '../profiles/schemas/patient.schema'
import { MedicalRecord } from '../electronic-health-records/schemas/medical.record.schema'
import { InferSubjects, Ability, AbilityBuilder, AbilityClass, ExtractSubjectType} from '@casl/ability'
import {Action} from '../enums/action.enum'



@Injectable()
export class CaslAbilityFactory {

    createForUser(user: User) {
        const {can, build} = new AbilityBuilder(
            Ability as AbilityClass< Ability<[Action, InferSubjects<typeof Doctor | typeof Patient | typeof User | typeof MedicalRecord> | 'all']> >

        )

        if(user.role == "Admin"){
            can(Action.Manage, 'all')
        }

        // ** using the Doctor model here doesn't work, so 'all' is used to find any subject with an email attribute to be compared to user.email **
        can(Action.Update, 'all', {email: user.email})


        return build({
            detectSubjectType: (item) => item.constructor as ExtractSubjectType<InferSubjects<typeof Doctor | typeof Patient | typeof User | typeof MedicalRecord> | 'all'>
        })
    }
}
