import validator from 'validator';


export class Validator {

    static isValidUUID(str: string) {
        return validator.isUUID(str); // Returns true if the string is a valid UUID
    }

}