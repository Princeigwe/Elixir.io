import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription, PrescriptionDocument } from '../schemas/prescription.schema';
import { MedicalRecordService } from './medical-record.service';
import { User } from '../../users/users.schema';
import { RouteOfAdministration } from '../../enums/route.of.administration.enum';
import { DoctorService } from '../../profiles/services/doctor.service';


type medication = {
    name: string,
    dosage: string,
    routeOfAdministration: RouteOfAdministration,
    frequency: string,
    duration: string,
}


@Injectable()
export class PrescriptionService {

    constructor(
        @InjectModel(Prescription.name) private prescriptionModel: Model<PrescriptionDocument>,
        private medicalRecordService: MedicalRecordService,
        private doctorService: DoctorService,
    ) {}

    /* this allows medical providers create prescriptions to medical records they have access to.
        The user parameter here refers to that of the medical provider
    */
    async addPrescriptionToMedicalRecord(record_id: string, user: User, medications: medication[], instructions: string) {
        const medicalRecord = await this.medicalRecordService.readActionOfMedicalRecordByMedicalProvider(record_id, user)
        const medicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

        const prescription = await this.prescriptionModel.create({
            medicalRecord: medicalRecord._id,
            patient_demographics: {
                firstName: medicalRecord.patient_demographics.firstName,
                lastName:  medicalRecord.patient_demographics.lastName,
                email:     medicalRecord.patient_demographics.email,
                age:       medicalRecord.patient_demographics.age,
                address:   medicalRecord.patient_demographics.address,
                telephone: medicalRecord.patient_demographics.telephone,
            }, 
            prescriber: {
                doctor_firstName:  medicalProvider.firstName,
                doctor_lastName:   medicalProvider.lastName,
                doctor_department: medicalProvider.department,
                doctor_email:      medicalProvider.email,
                doctor_telephone:  medicalProvider.telephone,
            },
            instructions: instructions
        })

        medications.forEach( (medication) => { prescription.medications.push(medication) } )
        return prescription.save()
    }
}
