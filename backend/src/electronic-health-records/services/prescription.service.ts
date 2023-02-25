import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription, PrescriptionDocument } from '../schemas/prescription.schema';
import { MedicalRecordService } from './medical-record.service';
import { User } from '../../users/users.schema';
import { RouteOfAdministration } from '../../enums/route.of.administration.enum';
import { DoctorService } from '../../profiles/services/doctor.service';
import * as AesEncryption from 'aes-encryption'

const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY)

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
    /**
     * The function takes in a medical record id, a user, an array of medications, and a string of
     * instructions. It then creates a prescription and adds it to the medical record
     * @param {string} record_id - the id of the medical record that the prescription is being added to
     * @param {User} user - User - this is the user object that is passed in from the controller.
     * @param {medication[]} medications - medication[]
     * @param {string} instructions - string
     * @returns The prescription is being returned.
     */
    async addPrescriptionToMedicalRecord(record_id: string, user: User, medications: medication[], instructions: string) {
        const medicalRecord = await this.medicalRecordService.readActionOfMedicalRecordByMedicalProvider(record_id, user)
        const medicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

        const prescription = await this.prescriptionModel.create({
            medicalRecord: medicalRecord._id,
            patient_demographics: {
                firstName: aes.encrypt(medicalRecord.patient_demographics.firstName),
                lastName:  aes.encrypt(medicalRecord.patient_demographics.lastName),
                email:     aes.encrypt(medicalRecord.patient_demographics.email),
                age:       medicalRecord.patient_demographics.age,
                address:   aes.encrypt(medicalRecord.patient_demographics.address),
                telephone: aes.encrypt(medicalRecord.patient_demographics.telephone),
            }, 
            prescriber: {
                doctor_firstName:  aes.encrypt(medicalProvider.firstName),
                doctor_lastName:   aes.encrypt(medicalProvider.lastName),
                doctor_department: aes.encrypt(medicalProvider.department),
                doctor_email:      aes.encrypt(medicalProvider.email),
                doctor_telephone:  aes.encrypt(medicalProvider.telephone),
            },
            instructions: aes.encrypt(instructions)
        })

        medications.forEach( (medication) => { 

            medication.dosage                = aes.encrypt(medication.dosage)
            medication.duration              = aes.encrypt(medication.duration)
            medication.frequency             = aes.encrypt(medication.frequency)
            medication.name                  = aes.encrypt(medication.name)
            medication.routeOfAdministration = aes.encrypt(medication.routeOfAdministration)

            prescription.medications.push(medication) 
        } )
        return prescription.save()
    }

    // * this action will be performed by an administrator to read all medical prescriptions
    async getPrescriptions() {

    }
}
