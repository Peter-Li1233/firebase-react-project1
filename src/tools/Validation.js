import validator from 'validator';

export function ValidateData(data, rules) {
    let errors = {};

    Object.keys(data).forEach(field => {
        if (rules.hasOwnProperty(field)) {
            let fielderrors = [];
            let val = data[field];

            if (rules[field].required && validator.isEmpty(val)) {
                fielderrors.push("Value required");
            }

            if(!validator.isEmpty(val)) {
                if (rules[field].alpha && !validator.isAlpha(val)) {
                    fielderrors.push("Enter only letters");
                }

                if(rules[field].email && !validator.isEmail(val)) {
                    fielderrors.push("Enter a valid email address");
                }

                if(rules[field].equals && !validator.equals(val, data[rules[field].equals])) {
                    fielderrors.push("Values don't match");
                }
            }

            if (fielderrors.length > 0) {
                errors[field] = fielderrors
            }            
        }
    })

    return errors;
}