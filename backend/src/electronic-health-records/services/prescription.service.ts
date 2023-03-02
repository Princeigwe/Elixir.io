import { Injectable, NotFoundException, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription, PrescriptionDocument } from '../schemas/prescription.schema';
import { MedicalRecordService } from './medical-record.service';
import { User } from '../../users/users.schema';
import { RouteOfAdministration } from '../../enums/route.of.administration.enum';
import { DoctorService } from '../../profiles/services/doctor.service';
import * as AesEncryption from 'aes-encryption'
import {UserCategory} from '../../enums/user.category.enum'
import { Role } from 'src/enums/role.enum';

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
        @Inject( forwardRef( () => MedicalRecordService ) )private medicalRecordService: MedicalRecordService,
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
        const prescriptions = await this.prescriptionModel.find().exec()
        if(!prescriptions.length) { throw new NotFoundException("Prescriptions not found.") }
        const decryptedPrescriptions = prescriptions.map(prescription => {

            const decryptedPatientDemographics = {
                firstName: aes.decrypt(prescription.patient_demographics.firstName),
                lastName:  aes.decrypt(prescription.patient_demographics.lastName),
                email:     aes.decrypt(prescription.patient_demographics.email),
                age:       prescription.patient_demographics.age,
                address:   aes.decrypt(prescription.patient_demographics.address),
                telephone: aes.decrypt(prescription.patient_demographics.telephone)
            }

            const decryptedPrescriber = {
                doctor_firstName:  aes.decrypt(prescription.prescriber['doctor_firstName']),
                doctor_lastName:   aes.decrypt(prescription.prescriber['doctor_lastName']),
                doctor_department: aes.decrypt(prescription.prescriber['doctor_department']),
                doctor_email:      aes.decrypt(prescription.prescriber['doctor_email']),
                doctor_telephone:  aes.decrypt(prescription.prescriber['doctor_telephone']),
            }

            const decryptedMedications = prescription.medications.map( (medication) => {
                return {
                    name                  : aes.decrypt(medication.name),
                    dosage                : aes.decrypt(medication.dosage),
                    duration              : aes.decrypt(medication.duration),
                    frequency             : aes.decrypt(medication.frequency),
                    routeOfAdministration : aes.decrypt(medication.routeOfAdministration)
                }
            } )

            const decryptedInstructions = aes.decrypt(prescription.instructions)

            return {
                _id                 : prescription._id.toString(),
                medicalRecord       : prescription.medicalRecord['_id'],
                patient_demographics: decryptedPatientDemographics,
                prescriber          : decryptedPrescriber,
                medications         : decryptedMedications,
                instructions        : decryptedInstructions,
                createdAt           : prescription['createdAt'],
                __v                 : prescription.__v
            }
        })

        return decryptedPrescriptions
    }

    /**
     * 
     * @param prescription_id : the id the of the prescription created
     * @param user : the logged in user
     * @returns prescription
     * 
     * this method checks if the user is a patient; then checks if the patient owns the prescription If true, the prescription is decrypted and returned, else it throws an Http Exception,
     * if the user happens to be an administrative user, the prescription is fetched and decrypted for the admin.
     * if the user is not an admin, it checks if they have read access to the medical record of the prescription...
     * if true, the prescription is decrypted and returned
     */
    async getPrescriptionByID(prescription_id: string, user: User) {

        const prescription = await this.prescriptionModel.findById(prescription_id).exec()
        if(!prescription) {
            throw new HttpException("Prescription not Found", HttpStatus.NOT_FOUND)
        }

        // decrypting the encrypted data
        prescription.patient_demographics.firstName = aes.decrypt(prescription.patient_demographics.firstName)
        prescription.patient_demographics.lastName  = aes.decrypt(prescription.patient_demographics.lastName),
        prescription.patient_demographics.email     = aes.decrypt(prescription.patient_demographics.email),
        prescription.patient_demographics.address   = aes.decrypt(prescription.patient_demographics.address),
        prescription.patient_demographics.telephone = aes.decrypt(prescription.patient_demographics.telephone)

        prescription.prescriber['doctor_firstName']  = aes.decrypt(prescription.prescriber['doctor_firstName'])
        prescription.prescriber['doctor_lastName']   = aes.decrypt(prescription.prescriber['doctor_lastName'])
        prescription.prescriber['doctor_department'] = aes.decrypt(prescription.prescriber['doctor_department'])
        prescription.prescriber['doctor_email']      = aes.decrypt(prescription.prescriber['doctor_email'])
        prescription.prescriber['doctor_telephone']  = aes.decrypt(prescription.prescriber['doctor_telephone'])

        prescription.medications = prescription.medications.map(medication => {
            
            return {
                name                 : aes.decrypt(medication.name),
                dosage               : aes.decrypt(medication.dosage),
                routeOfAdministration: aes.decrypt(medication.routeOfAdministration),
                frequency            : aes.decrypt(medication.frequency),
                duration             : aes.decrypt(medication.duration)
            }

        });

        prescription.instructions = aes.decrypt(prescription.instructions)
        const medicalRecord = await this. medicalRecordService.getMedicalRecordByID(prescription.medicalRecord.toString())

        if(user.role == Role.Admin || medicalRecord.recipients.includes( aes.encrypt(user.email) ) || prescription.patient_demographics.email == user.email) {
            return prescription
        }
        else {
            throw new HttpException('Forbidden action, as you are not authorized to access resource', HttpStatus.FORBIDDEN)
        }

    }


    async getPrescriptionsOfLoggedInPatient(user: User) {
        const prescriptions = await this.prescriptionModel.find({'patient_demographics.email': aes.encrypt(user.email)}).exec()
        if(!prescriptions.length) { throw new NotFoundException("Prescriptions not found.") }

        const decryptedPrescriptions = prescriptions.map(prescription => {

            const decryptedPatientDemographics = {
                firstName   : aes.decrypt(prescription.patient_demographics.firstName),
                lastName    : aes.decrypt(prescription.patient_demographics.lastName),
                email       : aes.decrypt(prescription.patient_demographics.email),
                age         : prescription.patient_demographics.age,
                address     : aes.decrypt(prescription.patient_demographics.address),
                telephone   : aes.decrypt(prescription.patient_demographics.telephone)
            }

            const decryptedPrescriber = {
                doctor_firstName : aes.decrypt(prescription.prescriber['doctor_firstName']),
                doctor_lastName  : aes.decrypt(prescription.prescriber['doctor_lastName']),
                doctor_department: aes.decrypt(prescription.prescriber['doctor_department']),
                doctor_email     : aes.decrypt(prescription.prescriber['doctor_email']),
                doctor_telephone : aes.decrypt(prescription.prescriber['doctor_telephone']),
            }

            const decryptedMedications = prescription.medications.map( (medication) => {
                return {
                    name                  : aes.decrypt(medication.name),
                    dosage                : aes.decrypt(medication.dosage),
                    duration              : aes.decrypt(medication.duration),
                    frequency             : aes.decrypt(medication.frequency),
                    routeOfAdministration : aes.decrypt(medication.routeOfAdministration)
                }
            } )

            const decryptedInstructions = aes.decrypt(prescription.instructions)

            return {
                _id                 : prescription._id.toString(),
                medicalRecord       : prescription.medicalRecord['_id'],
                patient_demographics: decryptedPatientDemographics,
                prescriber          : decryptedPrescriber,
                medications         : decryptedMedications,
                instructions        : decryptedInstructions,
                createdAt           : prescription['createdAt'],
                __v                 : prescription.__v,
            }
        })

        return decryptedPrescriptions
    }


    /* with this method, the administrative user and the medical provider 
    of whom the patient gives read access to is able to fetch prescriptions tied to the record 
    */
    async filterPrescriptionsTiedToMedicalRecord(medical_record_id: string, user:User) {
        const prescriptions = await this.prescriptionModel.find({'medicalRecord': medical_record_id}).exec()
        const medicalRecord = await this. medicalRecordService.getMedicalRecordByID(medical_record_id)

        if(!prescriptions.length) { throw new NotFoundException("Prescriptions not found.") }

        const decryptedPrescriptions = prescriptions.map(prescription => {

            const decryptedPatientDemographics = {
                firstName   : aes.decrypt(prescription.patient_demographics.firstName),
                lastName    : aes.decrypt(prescription.patient_demographics.lastName),
                email       : aes.decrypt(prescription.patient_demographics.email),
                age         : prescription.patient_demographics.age,
                address     : aes.decrypt(prescription.patient_demographics.address),
                telephone   : aes.decrypt(prescription.patient_demographics.telephone)
            }

            const decryptedPrescriber = {
                doctor_firstName : aes.decrypt(prescription.prescriber['doctor_firstName']),
                doctor_lastName  : aes.decrypt(prescription.prescriber['doctor_lastName']),
                doctor_department: aes.decrypt(prescription.prescriber['doctor_department']),
                doctor_email     : aes.decrypt(prescription.prescriber['doctor_email']),
                doctor_telephone : aes.decrypt(prescription.prescriber['doctor_telephone']),
            }

            const decryptedMedications = prescription.medications.map( (medication) => {
                return {
                    name                  : aes.decrypt(medication.name),
                    dosage                : aes.decrypt(medication.dosage),
                    duration              : aes.decrypt(medication.duration),
                    frequency             : aes.decrypt(medication.frequency),
                    routeOfAdministration : aes.decrypt(medication.routeOfAdministration)
                }
            } )

            const decryptedInstructions = aes.decrypt(prescription.instructions)

            return {
                _id                 : prescription._id.toString(),
                medicalRecord       : prescription.medicalRecord['_id'],
                patient_demographics: decryptedPatientDemographics,
                prescriber          : decryptedPrescriber,
                medications         : decryptedMedications,
                instructions        : decryptedInstructions,
                createdAt           : prescription['createdAt'],
                __v                 : prescription.__v,
            }
        })

        if( user.role == Role.Admin || medicalRecord.recipients.includes(aes.encrypt(user.email)) == true){
            return decryptedPrescriptions
        }
        else {
            throw new HttpException("Unauthorized access to prescriptions. If you are a medical provider, request read access to medical record", HttpStatus.FORBIDDEN)
        }

    }


    // * this method will be used in the medical record service when deleting a medical record
    async getPrescriptionsTiedToMedicalRecord(medical_record_id: string) {
        const prescriptions = await this.prescriptionModel.find({'medicalRecord': medical_record_id}).exec()
        return prescriptions
    }

    // * this method will be used in the medical record service when deleting medical records
    async getAllPrescriptions() {
        const prescriptions = await this.prescriptionModel.find().exec()
        return prescriptions
    }


    //** this action will only be performed by an administrative user */
    async deletePrescriptions() {
        await this.prescriptionModel.deleteMany()
        throw new HttpException( "Prescriptions Deleted", HttpStatus.NO_CONTENT)
    }


    //** this action will only be performed by an administrative user */
    async deletePrescription(prescription_id: string) {
        await this.prescriptionModel.deleteOne({'__id': prescription_id})
        throw new HttpException( "Prescription Deleted", HttpStatus.NO_CONTENT)
    }

}
